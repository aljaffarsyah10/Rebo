import { createClient } from '@/lib/supabase/client';
import type {
  AuditLog,
  BuktiDukung,
  DokumenBukti,
  PeriodeEvaluasi,
  PertanyaanPeriode,
  Subpilar
} from '@/types/rebo';

// ==============================================================================
// Periode Evaluasi Helpers
// ==============================================================================

/**
 * Mendapatkan periode evaluasi aktif saat ini.
 * Jika tabel belum ada atau kosong, mengembalikan fallback periode default 2025.
 */
export async function getActivePeriode(): Promise<PeriodeEvaluasi | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .eq('is_active', true)
      .order('tahun', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.warn('[REBO API] getActivePeriode query notice:', error.message);
      return {
        id: 'default-periode-2025',
        tahun: 2025,
        nama_periode: 'Evaluasi PMPRB 2025/2026',
        is_active: true,
        is_locked: false
      };
    }

    if (!data) {
      return {
        id: 'default-periode-2025',
        tahun: 2025,
        nama_periode: 'Evaluasi PMPRB 2025/2026',
        is_active: true,
        is_locked: false
      };
    }

    return data as PeriodeEvaluasi;
  } catch (err: any) {
    console.warn('[REBO API] getActivePeriode exception:', err?.message);
    return {
      id: 'default-periode-2025',
      tahun: 2025,
      nama_periode: 'Evaluasi PMPRB 2025/2026',
      is_active: true,
      is_locked: false
    };
  }
}

/**
 * Mendapatkan daftar seluruh periode evaluasi yang terdaftar di database.
 */
export async function getAllPeriode(): Promise<PeriodeEvaluasi[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('periode_evaluasi')
      .select('*')
      .order('tahun', { ascending: false });

    if (error) {
      console.warn('[REBO API] getAllPeriode query notice:', error.message);
      return [];
    }

    return (data as PeriodeEvaluasi[]) || [];
  } catch (err: any) {
    console.warn('[REBO API] getAllPeriode exception:', err?.message);
    return [];
  }
}

// ==============================================================================
// Subpilar, Pertanyaan & Adaptif Evidence Fetching
// ==============================================================================

/**
 * Fetch subpilar beserta pertanyaan dan kategori penilaian.
 */
export async function fetchSubpilarWithPertanyaan(pilarId: string) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('subpilar')
    .select(
      `*, pilar (id_pilar, nama_pilar), pertanyaan (*, kategoriPenilaian (*))`
    )
    .eq('id_pilar', pilarId)
    .order('id_subpilar', { ascending: true });

  if (error) throw error;
  return (data as Subpilar[]) || [];
}

/**
 * Fetch data pertanyaan_periode untuk periode tertentu.
 */
export async function fetchPertanyaanPeriode(
  periodeId: string,
  pertanyaanIds?: string[]
): Promise<PertanyaanPeriode[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('pertanyaan_periode')
      .select(
        `*,
         pertanyaan (*, kategoriPenilaian (*)),
         dokumen_bukti (*)`
      )
      .eq('id_periode', periodeId);

    if (pertanyaanIds && pertanyaanIds.length > 0) {
      query = query.in('id_pertanyaan', pertanyaanIds);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('[REBO API] fetchPertanyaanPeriode notice:', error.message);
      return [];
    }
    return (data as PertanyaanPeriode[]) || [];
  } catch (err: any) {
    console.warn('[REBO API] fetchPertanyaanPeriode exception:', err?.message);
    return [];
  }
}

/**
 * Fetch multi-dokumen bukti berdasarkan id_pertanyaan_periode.
 */
export async function fetchDokumenBuktiByPertanyaanPeriode(
  idPertanyaanPeriode: string
): Promise<DokumenBukti[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('dokumen_bukti')
      .select('*')
      .eq('id_pertanyaan_periode', idPertanyaanPeriode)
      .order('uploaded_at', { ascending: true });

    if (error) {
      console.warn(
        '[REBO API] fetchDokumenBuktiByPertanyaanPeriode notice:',
        error.message
      );
      return [];
    }
    return (data as DokumenBukti[]) || [];
  } catch (err: any) {
    console.warn(
      '[REBO API] fetchDokumenBuktiByPertanyaanPeriode exception:',
      err?.message
    );
    return [];
  }
}

/**
 * Fetch riwayat aktivitas (audit log) untuk indikator tertentu.
 */
export async function fetchAuditLogByPertanyaanPeriode(
  idPertanyaanPeriode: string
): Promise<AuditLog[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('audit_log')
      .select('*')
      .eq('id_pertanyaan_periode', idPertanyaanPeriode)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn(
        '[REBO API] fetchAuditLogByPertanyaanPeriode notice:',
        error.message
      );
      return [];
    }
    return (data as AuditLog[]) || [];
  } catch (err: any) {
    console.warn(
      '[REBO API] fetchAuditLogByPertanyaanPeriode exception:',
      err?.message
    );
    return [];
  }
}

/**
 * Fetch bukti dukung berdasarkan kumpulan id_pertanyaan.
 * Mendukung skema V2 (pertanyaan_periode + dokumen_bukti) secara otomatis,
 * dengan fallback mulus ke skema V1 (buktiDukung) jika tabel V2 belum dimigrasi.
 */
export async function fetchBuktiByPertanyaanIds(
  ids: string[],
  periodeId?: string
): Promise<BuktiDukung[]> {
  if (!ids || ids.length === 0) return [];
  const supabase = createClient();

  // Coba ambil dari skema V2 terlebih dahulu jika periode diketahui atau ada periode aktif
  try {
    let targetPeriodeId = periodeId;
    if (!targetPeriodeId) {
      const active = await getActivePeriode();
      targetPeriodeId = active?.id;
    }

    if (targetPeriodeId && targetPeriodeId !== 'default-periode-2025') {
      const { data: v2Data, error: v2Error } = await supabase
        .from('pertanyaan_periode')
        .select('*, dokumen_bukti (*)')
        .eq('id_periode', targetPeriodeId)
        .in('id_pertanyaan', ids);

      if (!v2Error && v2Data && v2Data.length > 0) {
        // Konversikan data V2 ke model BuktiDukung agar antarmuka kompatibel sepenuhnya
        const mappedV2: BuktiDukung[] = v2Data.map((row: any) => {
          const firstDoc = row.dokumen_bukti?.[0];
          return {
            id_bukti: row.id,
            id_pertanyaan: row.id_pertanyaan,
            id_pertanyaan_periode: row.id,
            link_bukti: firstDoc?.file_url ?? row.gdrive_folder_url ?? null,
            gdrive_folder_url: row.gdrive_folder_url ?? null,
            gdrive_folder_id: row.gdrive_folder_id ?? null,
            dokumen_bukti: row.dokumen_bukti ?? [],
            id_kategori: row.id_kategori ?? null,
            nilai_akhir: row.nilai_mandiri ?? 0,
            nilai_mandiri: row.nilai_mandiri ?? 0,
            nilai_verifikasi: row.nilai_verifikasi ?? 0,
            status: String(row.status_kelengkapan ?? 0),
            status_kelengkapan: row.status_kelengkapan ?? 0,
            nama_status:
              row.status_kelengkapan === 2
                ? 'Disetujui'
                : row.status_kelengkapan === 1
                  ? 'Menunggu Review'
                  : row.status_kelengkapan === 3
                    ? 'Perlu Revisi'
                    : 'Belum Diisi',
            catatan_user: row.catatan_operator ?? null,
            catatan_operator: row.catatan_operator ?? null,
            catatan_koordinator: row.catatan_koordinator ?? null,
            created_at: row.created_at ?? null,
            updated_at: row.updated_at ?? null
          };
        });
        return mappedV2;
      }
    }
  } catch (err) {
    console.warn('[REBO API] Fallback to legacy buktiDukung fetch:', err);
  }

  // Fallback V1: select related statusBukti.nama_status via relationship `statusBukti`
  const { data, error } = await supabase
    .from('buktiDukung')
    .select('*, statusBukti (id_status, nama_status)')
    .in('id_pertanyaan', ids);

  if (error) throw error;

  const mapped = (data || []).map((row: any) => {
    const isFolder =
      row.link_bukti &&
      (row.link_bukti.includes('drive.google.com/drive/folders') ||
        row.link_bukti.includes('/folders/'));
    const initialDocs = row.link_bukti
      ? [
          {
            id: `legacy-${row.id_bukti || row.id_pertanyaan}`,
            id_pertanyaan_periode: row.id_bukti,
            nama_dokumen: 'Berkas Bukti Dukung',
            file_url: row.link_bukti,
            tipe_dokumen: 'Dokumen',
            uploaded_by: 'Operator'
          }
        ]
      : [];

    return {
      ...row,
      id_pertanyaan_periode: row.id_bukti,
      gdrive_folder_url: isFolder ? row.link_bukti : null,
      dokumen_bukti: initialDocs,
      nilai_mandiri: row.nilai_akhir ?? 0,
      catatan_operator: row.catatan_user ?? null,
      status_kelengkapan:
        row.status_kelengkapan !== null && row.status_kelengkapan !== undefined
          ? Number(row.status_kelengkapan)
          : row.status === 'Disetujui' ||
              row.statusBukti?.nama_status === 'Disetujui'
            ? 2
            : row.status === 'Menunggu Review' ||
                row.statusBukti?.nama_status === 'Dikirim'
              ? 1
              : row.status === 'Perlu Revisi' ||
                  row.statusBukti?.nama_status === 'Ditolak'
                ? 3
                : 0,
      nama_status: row.statusBukti?.nama_status ?? row.status ?? 'Belum Diisi'
    };
  });

  return (mapped as BuktiDukung[]) || [];
}

// ==============================================================================
// Legacy Mutation APIs (Kept for compatibility with existing components)
// ==============================================================================

export async function upsertBukti(
  payload: Partial<BuktiDukung>,
  method?: 'POST' | 'PUT'
) {
  const httpMethod = method ?? (payload.id_bukti ? 'PUT' : 'POST');
  const res = await fetch('/api', {
    method: httpMethod,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return res.json();
}

export async function sendStatus(id_pertanyaan: string, status: string) {
  const res = await fetch('/api/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_pertanyaan, status })
  });
  return res.json();
}

export async function approveReject(id_pertanyaan: string, status: string) {
  const res = await fetch('/api/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_pertanyaan, status })
  });
  return res.json();
}
