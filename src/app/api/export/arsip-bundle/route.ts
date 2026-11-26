import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import JSZip from 'jszip';
import { getArsipList } from '@/actions/arsip-actions';
import type { ArsipDokumen, KategoriArsip } from '@/types/rebo';
import { KATEGORI_ARSIP_MAP } from '@/types/rebo';

export const dynamic = 'force-dynamic';

const SUBFOLDER_MAP: Record<KategoriArsip, string> = {
  SK_TIM: '01_SK_TIM_KERJA',
  RENCANA_AKSI: '02_RENCANA_AKSI',
  SOP_INOVASI: '03_SOP_PELAYANAN_INOVASI',
  LKE_RESMI: '04_LKE_LAPORAN_RESMI',
  PEDOMAN: '05_PEDOMAN_REGULASI',
  SOP_PELAYANAN: '03_SOP_PELAYANAN',
  LAPORAN_NOTULA: '04_LAPORAN_NOTULA',
  PAPARAN: '06_PAPARAN_BAHAN_TAYANG',
  INOVASI_DOKUMENTASI: '07_INOVASI_DOKUMENTASI'
};

function sanitizeFilename(name: string): string {
  return name
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 80);
}

function escapeCsvField(val: any): string {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (
    s.includes(',') ||
    s.includes('\n') ||
    s.includes('\r') ||
    s.includes('"')
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(request: NextRequest) {
  try {
    // 1. Clerk Authentication Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error:
            'Akses Ditolak: Anda harus login untuk mengunduh bundle arsip digital.'
        },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const tahunParam = searchParams.get('tahun') || 'ALL';
    const filterTahun =
      tahunParam !== 'ALL' && !isNaN(Number(tahunParam))
        ? Number(tahunParam)
        : undefined;

    // 3. Ambil data arsip resmi
    const res = await getArsipList({ tahun: filterTahun });
    if (!res.success || !res.data) {
      return NextResponse.json(
        { error: res.error || 'Gagal mengambil data arsip digital.' },
        { status: 500 }
      );
    }

    const items: ArsipDokumen[] = res.data;
    const tahunLabel = filterTahun ? String(filterTahun) : 'SEMUA_TAHUN';

    // 4. Inisialisasi JSZip
    const zip = new JSZip();

    // 4a. Buat File DAFTAR_ARSIP_ZI_[TAHUN].csv (dengan UTF-8 BOM untuk kompatibilitas Excel)
    const csvHeader = [
      'No',
      'Kategori',
      'Tahun',
      'Nomor Dokumen / SK',
      'Judul Dokumen',
      'Pengunggah',
      'Tanggal Dibuat',
      'Tautan File Google Drive',
      'Keterangan'
    ].join(',');

    const csvRows = items.map((doc, idx) => {
      const kategoriLabel =
        KATEGORI_ARSIP_MAP[doc.kategori]?.label || doc.kategori;
      return [
        idx + 1,
        escapeCsvField(kategoriLabel),
        doc.tahun,
        escapeCsvField(doc.nomor_surat || '-'),
        escapeCsvField(doc.judul_dokumen),
        escapeCsvField(doc.uploaded_by),
        escapeCsvField(
          doc.created_at
            ? new Date(doc.created_at).toISOString().split('T')[0]
            : '-'
        ),
        escapeCsvField(doc.file_url),
        escapeCsvField(doc.keterangan || '-')
      ].join(',');
    });

    const csvContent = '\uFEFF' + [csvHeader, ...csvRows].join('\r\n');
    zip.file(`DAFTAR_ARSIP_ZI_${tahunLabel}.csv`, csvContent);

    // 4b. Buat File MANIFEST.json (Metadata terstruktur untuk sistem evaluasi)
    const manifestData = {
      satuan_kerja:
        'Badan Pusat Statistik Kabupaten Kepulauan Siau Tagulandang Biaro',
      kode_satker: '7108',
      zona_integritas: 'Menuju Wilayah Bebas dari Korupsi (WBK) / WBBM',
      tahun_evaluasi: filterTahun || 'SEMUA',
      tanggal_ekspor: new Date().toISOString(),
      total_dokumen: items.length,
      dokumen: items.map((doc, idx) => ({
        index: idx + 1,
        id: doc.id,
        kategori_kode: doc.kategori,
        kategori_nama: KATEGORI_ARSIP_MAP[doc.kategori]?.label || doc.kategori,
        tahun: doc.tahun,
        nomor_surat: doc.nomor_surat || null,
        judul_dokumen: doc.judul_dokumen,
        file_url: doc.file_url,
        keterangan: doc.keterangan || null,
        uploaded_by: doc.uploaded_by,
        created_at: doc.created_at || null
      }))
    };
    zip.file('MANIFEST.json', JSON.stringify(manifestData, null, 2));

    // 4c. Buat File PANDUAN_AKSES_ARSIP.txt (Petunjuk resmi bagi TPI / KemenPAN-RB)
    const panduanContent = `================================================================================
PANDUAN AKSES BUNDLE ARSIP DIGITAL RESMI ZONA INTEGRITAS (ZI)
BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO (7108)
================================================================================

Yth. Tim Penilai Internal (TPI) BPS RI / Tim Penilai Nasional (TPN) KemenPAN-RB,

Paket bundle arsip digital ini mengompilasi seluruh dokumen resmi pendukung
pembangunan Zona Integritas BPS Kabupaten Kepulauan Siau Tagulandang Biaro
untuk periode: ${filterTahun ? `Tahun ${filterTahun}` : 'Semua Periode Evaluasi'}.

STRUKTUR DIREKTORI BUNDLE:
├── DAFTAR_ARSIP_ZI_${tahunLabel}.csv -> Rekapitulasi tabuler metadata seluruh berkas
├── MANIFEST.json                   -> Metadata terstruktur format JSON
├── PANDUAN_AKSES_ARSIP.txt         -> Dokumen panduan akses berkas ini
├── 01_SK_TIM_KERJA/                -> SK Kepala BPS Sitaro (Tim ZI & Agen Perubahan)
├── 02_RENCANA_AKSI/                -> Road Map & Rencana Kerja Zona Integritas
├── 03_SOP_INOVASI/                 -> SOP Pelayanan Statistik Terpadu & Inovasi
├── 04_LKE_RESMI/                   -> Lembar Kerja & Lembar Hasil Evaluasi (LHE/LKE)
└── 05_PEDOMAN_REGULASI/            -> PermenPAN-RB, Juknis BPS RI & Pedoman PMPRB

PETUNJUK MEMBUKA BERKAS SHORTCUT (.url):
1. Setiap dokumen resmi di dalam subfolder disediakan dalam format shortcut internet (.url).
2. Pada sistem operasi Windows:
   - Cukup klik ganda (double-click) pada file shortcut (.url) terkait.
   - Sistem operasi akan membuka peramban web (Google Chrome / Microsoft Edge)
     dan mengarahkan langsung ke dokumen berkas di Google Drive BPS Sitaro.
3. Pada sistem operasi macOS / Linux:
   - Buka file .url menggunakan text editor untuk melihat tautan langsung,
     atau gunakan daftar URL yang tercantum pada file DAFTAR_ARSIP_ZI_${tahunLabel}.csv.
4. Seluruh tautan dokumen Google Drive telah dikonfigurasi dengan izin akses
   "Anyone with the link can view", sehingga Tim Penilai dapat langsung memeriksa
   dokumen tanpa perlu meminta izin akses (request permission).

KONTAK TIM PEMBANGUNAN ZONA INTEGRITAS BPS KAB. KEPULAUAN SIAU TAGULANDANG BIARO:
- Satuan Kerja : BPS Kabupaten Kepulauan Siau Tagulandang Biaro (Kode Satker: 7108)
- Alamat       : Jl. Lokongbanua, Ondong, Siau Barat, Kab. Kepl. Siau Tagulandang Biaro, Sulawesi Utara 95861
- Email Resmi  : bps7108@bps.go.id
- Website      : https://sitarokab.bps.go.id
================================================================================
Tanggal Ekspor: ${new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
Jumlah Berkas : ${items.length} dokumen arsip resmi terverifikasi.
================================================================================
`;
    zip.file('PANDUAN_AKSES_ARSIP.txt', panduanContent);

    // 4d. Buat File Shortcut Internet (.url) di dalam masing-masing subfolder kategori
    items.forEach((doc, idx) => {
      const folderName = SUBFOLDER_MAP[doc.kategori] || '06_LAINNYA';
      const cleanTitle = sanitizeFilename(doc.judul_dokumen);
      const filename = `[${String(idx + 1).padStart(2, '0')}] ${cleanTitle}.url`;

      // Format resmi Windows Internet Shortcut (.url)
      const urlShortcutContent = `[InternetShortcut]\r\nURL=${doc.file_url}\r\nIconIndex=0\r\n`;

      zip.file(`${folderName}/${filename}`, urlShortcutContent);
    });

    // 5. Generate ZIP binary buffer
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    });

    const exportFileName = `ARSIP_RESMI_ZI_BPS_SITARO_${tahunLabel}.zip`;

    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${exportFileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error(
      '[API-EXPORT-ARSIP-BUNDLE] Error creating ZIP archive:',
      error
    );
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Terjadi kesalahan internal saat membuat bundle arsip ZIP.'
      },
      { status: 500 }
    );
  }
}
