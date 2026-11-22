/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getCurrentUserSession } from '@/lib/auth/session';
import { isAdmin, isTPI } from '@/lib/auth/rbac';
import type { AuditLog } from '@/types/rebo';

export interface AuditLogFilterParams {
  search?: string;
  action?: string;
  role?: string;
  limit?: number;
  offset?: number;
}

export interface AuditLogResult {
  success: boolean;
  logs: AuditLog[];
  totalCount: number;
  actionStats: Record<string, number>;
  roleStats: Record<string, number>;
  isFallbackData?: boolean;
  error?: string;
}

/**
 * Data log audit contoh/demonstrasi jika tabel audit_log di Supabase masih kosong.
 */
const DEMO_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'audit-demo-1',
    action: 'APPROVE',
    user_id: 'user_tpi_demo',
    user_name: 'Verifikator TPI (BPS Sulut/Sitaro)',
    role: 'tpi',
    created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 menit lalu
    old_state: {
      status_kelengkapan: 1,
      catatan_koordinator: null,
      nilai_verifikasi: 0
    },
    new_state: {
      status_kelengkapan: 2,
      catatan_koordinator:
        'Dokumen bukti Surat Keputusan Tim Kerja ZI dan Notula Rapat lengkap serta memenuhi kriteria evaluasi nasional.',
      nilai_verifikasi: 1.0,
      verified_by: 'Verifikator TPI'
    },
    pertanyaan_info: {
      id_pertanyaan: '1',
      kode_indikator: 'IND-1.1.1',
      uraian_singkat: 'SK Pembentukan Tim Kerja Pembangunan ZI',
      pilar_nama: 'Pilar 1: Manajemen Perubahan'
    }
  },
  {
    id: 'audit-demo-2',
    action: 'REVISE',
    user_id: 'user_koord_demo',
    user_name: 'Koordinator Pilar 2',
    role: 'koordinator',
    created_at: new Date(Date.now() - 1000 * 60 * 95).toISOString(), // 1.5 jam lalu
    old_state: {
      status_kelengkapan: 1,
      catatan_koordinator: null,
      nilai_verifikasi: 0
    },
    new_state: {
      status_kelengkapan: 3,
      catatan_koordinator:
        'Mohon lampirkan juga lembar pengesahan SOP dan foto dokumentasi sosialisasi SOP terbaru, bukan hanya draft dokumen.',
      nilai_verifikasi: 0,
      verified_by: 'Koordinator Tata Laksana'
    },
    pertanyaan_info: {
      id_pertanyaan: '8',
      kode_indikator: 'IND-2.1.2',
      uraian_singkat: 'Penerapan Standar Operasional Prosedur (SOP)',
      pilar_nama: 'Pilar 2: Tata Laksana'
    }
  },
  {
    id: 'audit-demo-3',
    action: 'SUBMIT_EVIDENCE',
    user_id: 'user_op_demo',
    user_name: 'Operator Tim Manajemen Perubahan',
    role: 'operator',
    created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3 jam lalu
    old_state: {
      status_kelengkapan: 0,
      nilai_mandiri: 0
    },
    new_state: {
      status_kelengkapan: 1,
      nilai_mandiri: 1.0,
      catatan_operator:
        'Telah diunggah dokumen Rencana Kerja Pembangunan ZI tahun berjalan beserta link GDrive terstruktur.',
      dokumen_count: 3
    },
    pertanyaan_info: {
      id_pertanyaan: '3',
      kode_indikator: 'IND-1.2.1',
      uraian_singkat: 'Dokumen Rencana Pembangunan Zona Integritas',
      pilar_nama: 'Pilar 1: Manajemen Perubahan'
    }
  },
  {
    id: 'audit-demo-4',
    action: 'GENERATE_GDRIVE_LINKS',
    user_id: 'user_admin_demo',
    user_name: 'Administrator IT BPS Sitaro',
    role: 'admin',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 jam lalu
    old_state: null,
    new_state: {
      action: 'Batch Generate Link Folder Google Drive',
      total_mapped: 56,
      root_folder:
        'https://drive.google.com/drive/folders/REBO_2026_BPS_SITARO',
      periode: 'Evaluasi PMPRB 2026'
    },
    pertanyaan_info: {
      uraian_singkat: 'Otomatisasi Struktur Folder Google Drive Berjenjang',
      pilar_nama: 'Semua Pilar (1 s.d. 6)'
    }
  },
  {
    id: 'audit-demo-5',
    action: 'APPROVE',
    user_id: 'user_tpi_demo',
    user_name: 'Auditor TPI BPS Sitaro',
    role: 'tpi',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 hari lalu
    old_state: {
      status_kelengkapan: 1,
      nilai_verifikasi: 0
    },
    new_state: {
      status_kelengkapan: 2,
      catatan_koordinator:
        'Laporan Kinerja Instansi Pemerintah (LKjIP) dan Perjanjian Kinerja Berjenjang telah valid.',
      nilai_verifikasi: 1.0,
      verified_by: 'Auditor TPI'
    },
    pertanyaan_info: {
      id_pertanyaan: '22',
      kode_indikator: 'IND-4.2.1',
      uraian_singkat: 'Laporan Akuntabilitas Kinerja (LAKIP/LKjIP)',
      pilar_nama: 'Pilar 4: Penguatan Akuntabilitas'
    }
  }
];

/**
 * Server action untuk mengambil log jejak aktivitas (Audit Trail) sistem:
 * - Terproteksi hanya untuk Super Admin dan Tim Penilai Internal (TPI)
 * - Mengambil data real dari tabel `audit_log`
 * - Memperkaya info dengan data pertanyaan / pilar terkait jika ada
 * - Menyediakan filter pencarian nama user, aksi, dan peran pengguna
 */
export async function getAuditLogsAction(
  params?: AuditLogFilterParams
): Promise<AuditLogResult> {
  try {
    const session = await getCurrentUserSession();
    if (!session.userId) {
      return {
        success: false,
        logs: [],
        totalCount: 0,
        actionStats: {},
        roleStats: {},
        error:
          'Sesi berakhir atau pengguna belum login. Silakan masuk terlebih dahulu.'
      };
    }

    // Pastikan hak akses hanya untuk Admin atau TPI
    const isAuthorized = isAdmin(session.role) || isTPI(session.role);
    if (!isAuthorized) {
      return {
        success: false,
        logs: [],
        totalCount: 0,
        actionStats: {},
        roleStats: {},
        error:
          'Akses ditolak: Halaman Audit Trail hanya dapat diakses oleh Super Admin dan Tim Penilai Internal (TPI).'
      };
    }

    const supabase = await createClient();

    let query = supabase
      .from('audit_log')
      .select(
        '*, pertanyaan_periode (id, id_pertanyaan, pertanyaan (id_pertanyaan, deskripsi_pertanyaan, subpilar (id_subpilar, id_pilar, pilar (nama_pilar))))'
      )
      .order('created_at', { ascending: false });

    if (params?.action && params.action !== 'ALL') {
      query = query.eq('action', params.action);
    }

    if (params?.role && params.role !== 'ALL') {
      query = query.eq('role', params.role);
    }

    const limit = params?.limit || 100;
    query = query.limit(limit);

    const { data: dbLogs, error: dbError } = await query;

    if (dbError) {
      console.warn(
        '[AUDIT-ACTIONS] Notice querying audit_log:',
        dbError.message
      );
    }

    let logs: AuditLog[] = [];
    let isFallback = false;

    if (dbLogs && dbLogs.length > 0) {
      logs = dbLogs.map((row: any) => {
        let pInfo: any = null;
        if (row.pertanyaan_periode?.pertanyaan) {
          const q = row.pertanyaan_periode.pertanyaan;
          const sub = q.subpilar;
          const pil = sub?.pilar;
          pInfo = {
            id_pertanyaan: q.id_pertanyaan,
            kode_indikator: `IND-${sub?.id_pilar ?? '1'}.${sub?.id_subpilar ?? '1'}.${q.id_pertanyaan}`,
            uraian_singkat:
              q.uraian_singkat ||
              q.deskripsi_pertanyaan ||
              `Indikator ${q.id_pertanyaan}`,
            pilar_nama: pil?.nama_pilar
              ? `Pilar ${sub?.id_pilar}: ${pil.nama_pilar}`
              : undefined
          };
        }

        return {
          id: row.id,
          id_pertanyaan_periode: row.id_pertanyaan_periode,
          action: row.action,
          old_state: row.old_state,
          new_state: row.new_state,
          user_id: row.user_id,
          user_name: row.user_name || 'Pengguna REBO',
          role: row.role || 'operator',
          created_at: row.created_at,
          pertanyaan_info: pInfo
        };
      });
    } else {
      // Jika tabel audit_log masih kosong di remote, gunakan demo audit logs
      logs = [...DEMO_AUDIT_LOGS];
      isFallback = true;
    }

    // Filter search jika ada di sisi server
    if (params?.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      logs = logs.filter((log) => {
        const uName = (log.user_name || '').toLowerCase();
        const action = (log.action || '').toLowerCase();
        const role = (log.role || '').toLowerCase();
        const indName = (
          log.pertanyaan_info?.uraian_singkat || ''
        ).toLowerCase();
        const indKode = (
          log.pertanyaan_info?.kode_indikator || ''
        ).toLowerCase();
        const note = JSON.stringify(log.new_state || {}).toLowerCase();
        return (
          uName.includes(q) ||
          action.includes(q) ||
          role.includes(q) ||
          indName.includes(q) ||
          indKode.includes(q) ||
          note.includes(q)
        );
      });
    }

    // Hitung statistik aksi & peran
    const actionStats: Record<string, number> = {};
    const roleStats: Record<string, number> = {};

    logs.forEach((log) => {
      const act = log.action || 'LAINNYA';
      actionStats[act] = (actionStats[act] || 0) + 1;

      const r = log.role || 'operator';
      roleStats[r] = (roleStats[r] || 0) + 1;
    });

    return {
      success: true,
      logs,
      totalCount: logs.length,
      actionStats,
      roleStats,
      isFallbackData: isFallback
    };
  } catch (error: any) {
    console.error('[AUDIT-ACTIONS] getAuditLogsAction error:', error);
    return {
      success: false,
      logs: [],
      totalCount: 0,
      actionStats: {},
      roleStats: {},
      error: error?.message || 'Terjadi kesalahan saat memuat data audit log.'
    };
  }
}
