/**
 * AI Metadata Extractor Dokumen Bukti & Validator Periode Evaluasi
 * REBO V2 - BPS Kabupaten Kepulauan Sitaro
 *
 * Mengidentifikasi secara otomatis:
 * 1. Nomor Naskah Dinas BPS / Instansi Pemerintah (Surat, SK, SOP, ST, ND, BA, Undangan)
 * 2. Tanggal Dokumen & Kegiatan (Format Standar Indonesia & Numeric)
 * 3. Pejabat / Jabatan Penandatangan (Kepala BPS, Koordinator Tim, PPK, Kasubbag, dll.)
 * 4. Validasi Kesesuaian Tahun terhadap Periode Evaluasi Aktif (Peringatan Dini Dokumen Kadaluarsa / Anomali Masa Depan)
 */

export type DocumentTypeClass =
  | 'Surat Dinas'
  | 'Keputusan (SK)'
  | 'Standar Operasional Prosedur (SOP)'
  | 'Nota Dinas'
  | 'Surat Tugas'
  | 'Berita Acara'
  | 'Surat Undangan'
  | 'Daftar Hadir'
  | 'Notula Rapat'
  | 'Laporan Kegiatan / Output'
  | 'Dokumen Pendukung';

export type PeriodValidationStatus =
  | 'SESUAI_PERIODE'
  | 'KADALUARSA'
  | 'MASA_DEPAN'
  | 'TIDAK_TERDETEKSI';

export interface ExtractedDateInfo {
  raw: string;
  iso: string | null; // YYYY-MM-DD
  year: number | null;
  month: number | null; // 1 - 12
  day: number | null;
  formatted: string;
}

export interface PeriodValidationResult {
  status: PeriodValidationStatus;
  activeYear: number;
  detectedYear: number | null;
  label: string;
  badgeVariant: 'success' | 'warning' | 'destructive' | 'neutral';
  message: string;
  isAnomaly: boolean;
}

export interface DocumentMetadataInput {
  nama_dokumen: string;
  file_url?: string | null;
  teks_konten?: string | null;
  tipe_dokumen?: string | null;
  active_year?: number;
}

export interface DocumentMetadataResult {
  nomor_surat: string | null;
  jenis_dokumen: DocumentTypeClass;
  tanggal: ExtractedDateInfo | null;
  penandatangan: string | null;
  validation: PeriodValidationResult;
  confidence_score: number; // 0 - 100
  summary_citation: string;
  detected_entities: Array<{
    type: 'nomor_surat' | 'tanggal' | 'penandatangan' | 'jenis';
    value: string;
  }>;
}

// Indonesian month mapping
const MONTH_NAMES_ID: Record<string, number> = {
  januari: 1,
  jan: 1,
  februari: 2,
  pebruari: 2,
  feb: 2,
  peb: 2,
  maret: 3,
  mar: 3,
  april: 4,
  apr: 4,
  mei: 5,
  juni: 6,
  jun: 6,
  juli: 7,
  jul: 7,
  agustus: 8,
  agu: 8,
  agt: 8,
  september: 9,
  sep: 9,
  oktober: 10,
  okt: 10,
  november: 11,
  nopember: 11,
  nov: 11,
  nop: 11,
  desember: 12,
  des: 12
};

const MONTH_NAMES_INDONESIA = [
  '',
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

/**
 * Ekstraksi Nomor Naskah Dinas dari Teks
 * Mengenali pola naskah dinas resmi BPS (Perka BPS) dan persuratan dinas RI
 */
export function extractNomorSurat(text: string): string | null {
  if (!text || text.trim().length < 3) return null;

  // 1. Pola Surat Dinas BPS spesifik (B-xxx/7108/..., B-xxx/71080/..., B-xxx/BPS/...)
  const bpsDinasPattern =
    /\b(B-\d+[\/\w\.-]*(?:7108|71080|BPS|VS|KP|PR|TU|PL|KA|IPDS|SOS|DIST|PROD)[\/\w\.-]*\/20\d{2})\b/i;
  const matchBps = text.match(bpsDinasPattern);
  if (matchBps) return matchBps[1].trim();

  // 2. Pola SK (Surat Keputusan) BPS / Pemda / Satker
  const skPattern =
    /\b((?:SK|KEP)[\.\s\/-]?\d+[\/\w\.-]*(?:BPS|7108|HK)[\/\w\.-]*\/20\d{2})\b/i;
  const matchSK = text.match(skPattern);
  if (matchSK) return matchSK[1].trim();

  // 3. Pola SOP resmi (SOP-xx/BPS/..., SOP/7108/...)
  const sopPattern =
    /\b(SOP[-\/\s]?\d+[\/\w\.-]*(?:BPS|7108)[\/\w\.-]*(?:\/20\d{2})?)\b/i;
  const matchSop = text.match(sopPattern);
  if (matchSop) return matchSop[1].trim();

  // 4. Pola Surat Tugas (ST-xx/..., 045/ST/7108/2026)
  const stPattern =
    /\b((?:ST|SPT)[-\/\s\.]?\d+[\/\w\.-]*(?:7108|BPS)[\/\w\.-]*\/20\d{2})\b/i;
  const matchST = text.match(stPattern);
  if (matchST) return matchST[1].trim();

  // 5. Pola Nota Dinas (ND-xx/7108/2026, ND/xx/...)
  const ndPattern =
    /\b(ND[-\/\s\.]?\d+[\/\w\.-]*(?:7108|BPS)[\/\w\.-]*\/20\d{2})\b/i;
  const matchND = text.match(ndPattern);
  if (matchND) return matchND[1].trim();

  // 6. Pola Berita Acara (BA-xx/7108/..., xx/BA/BPS/...)
  const baPattern =
    /\b(BA[-\/\s\.]?\d+[\/\w\.-]*(?:7108|BPS)[\/\w\.-]*\/20\d{2})\b/i;
  const matchBA = text.match(baPattern);
  if (matchBA) return matchBA[1].trim();

  // 7. Pola Format Surat Undangan (Und-xx/..., B-xx/..., 0xx/UND/...)
  const undPattern =
    /\b(UND[-\/\s\.]?\d+[\/\w\.-]*(?:7108|BPS)[\/\w\.-]*\/20\d{2})\b/i;
  const matchUnd = text.match(undPattern);
  if (matchUnd) return matchUnd[1].trim();

  // 8. Pola eksplisit dengan kata "Nomor:" atau "No."
  const explicitNomorPattern =
    /(?:Nomor|No\.?|Nomor Surat)\s*[:：]?\s*([A-Za-z0-9\/\.\-_]{4,50}\/20\d{2})/i;
  const matchExplicit = text.match(explicitNomorPattern);
  if (matchExplicit) return matchExplicit[1].trim();

  // 9. Pola nomor dinas generik Indonesia: 123/BPS-SITARO/III/2026 atau 045/7108/2026
  const genericGovPattern =
    /\b(\d+[\/\w\.-]+(?:\/|-)(?:7108|BPS|SITARO|SET|TU|VS)[\/\w\.-]+\/20\d{2})\b/i;
  const matchGeneric = text.match(genericGovPattern);
  if (matchGeneric) return matchGeneric[1].trim();

  // 10. Pola fallback SK Nomor x Tahun 2026
  const skTahunPattern =
    /(?:SK|Keputusan|Surat Keputusan)\s+(?:Kepala\s+[A-Za-z\s]+)?(?:Nomor|No\.?)\s*([0-9\.\/-]+)\s+Tahun\s+(20\d{2})/i;
  const matchSKTahun = text.match(skTahunPattern);
  if (matchSKTahun) {
    return `Nomor ${matchSKTahun[1]} Tahun ${matchSKTahun[2]}`;
  }

  return null;
}

/**
 * Ekstraksi Tanggal Dokumen / Kegiatan dari Teks
 * Mengenali tanggal tekstual Indonesia ("14 Maret 2026") dan numeric ("2026-03-14", "14/03/2026")
 */
export function extractTanggalDokumen(text: string): ExtractedDateInfo | null {
  if (!text) return null;

  // 1. Pola Teks Bahasa Indonesia Lengkap: "14 Maret 2026", "05 Februari 2025"
  const indonesianDateRegex =
    /\b(\d{1,2})\s+(Januari|Februari|Pebruari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Nopember|Desember)\s+(20\d{2})\b/i;
  const matchIndo = text.match(indonesianDateRegex);
  if (matchIndo) {
    const day = parseInt(matchIndo[1], 10);
    const monthName = matchIndo[2].toLowerCase();
    const month = MONTH_NAMES_ID[monthName] || 1;
    const year = parseInt(matchIndo[3], 10);
    const dayStr = day.toString().padStart(2, '0');
    const monthStr = month.toString().padStart(2, '0');

    return {
      raw: matchIndo[0],
      iso: `${year}-${monthStr}-${dayStr}`,
      year,
      month,
      day,
      formatted: `${day} ${MONTH_NAMES_INDONESIA[month]} ${year}`
    };
  }

  // 2. Pola Bulan dan Tahun: "Maret 2026", "Januari 2025"
  const monthYearRegex =
    /\b(Januari|Februari|Pebruari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Nopember|Desember)\s+(20\d{2})\b/i;
  const matchMonthYear = text.match(monthYearRegex);
  if (matchMonthYear) {
    const monthName = matchMonthYear[1].toLowerCase();
    const month = MONTH_NAMES_ID[monthName] || 1;
    const year = parseInt(matchMonthYear[2], 10);
    const monthStr = month.toString().padStart(2, '0');

    return {
      raw: matchMonthYear[0],
      iso: `${year}-${monthStr}-01`,
      year,
      month,
      day: null,
      formatted: `${MONTH_NAMES_INDONESIA[month]} ${year}`
    };
  }

  // 3. Pola ISO: "2026-03-14" atau "2026_03_14"
  const isoRegex =
    /\b(20\d{2})[-_.](0[1-9]|1[0-2])[-_.](0[1-9]|[12]\d|3[01])\b/;
  const matchIso = text.match(isoRegex);
  if (matchIso) {
    const year = parseInt(matchIso[1], 10);
    const month = parseInt(matchIso[2], 10);
    const day = parseInt(matchIso[3], 10);
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    return {
      raw: matchIso[0],
      iso: `${year}-${monthStr}-${dayStr}`,
      year,
      month,
      day,
      formatted: `${day} ${MONTH_NAMES_INDONESIA[month]} ${year}`
    };
  }

  // 4. Pola Numeric Indo: "14/03/2026" atau "14-03-2026" atau "14.03.2026"
  const numericRegex =
    /\b(0[1-9]|[12]\d|3[01])[\/\.-](0[1-9]|1[0-2])[\/\.-](20\d{2})\b/;
  const matchNumeric = text.match(numericRegex);
  if (matchNumeric) {
    const day = parseInt(matchNumeric[1], 10);
    const month = parseInt(matchNumeric[2], 10);
    const year = parseInt(matchNumeric[3], 10);
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    return {
      raw: matchNumeric[0],
      iso: `${year}-${monthStr}-${dayStr}`,
      year,
      month,
      day,
      formatted: `${day} ${MONTH_NAMES_INDONESIA[month]} ${year}`
    };
  }

  // 5. Pola Numeric Padat: "20260314" (umum di nama file scan kamera atau scanner)
  const compactRegex = /\b(20\d{2})(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\b/;
  const matchCompact = text.match(compactRegex);
  if (matchCompact) {
    const year = parseInt(matchCompact[1], 10);
    const month = parseInt(matchCompact[2], 10);
    const day = parseInt(matchCompact[3], 10);
    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    return {
      raw: matchCompact[0],
      iso: `${year}-${monthStr}-${dayStr}`,
      year,
      month,
      day,
      formatted: `${day} ${MONTH_NAMES_INDONESIA[month]} ${year}`
    };
  }

  // 6. Pola Tahun Saja: "Tahun 2026", "T.A. 2026", "2026"
  const yearOnlyRegex = /\b(?:Tahun|T\.A\.|TA)?\s*(20[12]\d)\b/i;
  const matchYear = text.match(yearOnlyRegex);
  if (matchYear) {
    const year = parseInt(matchYear[1], 10);
    return {
      raw: matchYear[0],
      iso: `${year}-01-01`,
      year,
      month: null,
      day: null,
      formatted: `Tahun ${year}`
    };
  }

  return null;
}

/**
 * Ekstraksi Jabatan / Nama Penandatangan
 */
export function extractPenandatangan(text: string): string | null {
  if (!text) return null;

  const roles = [
    {
      regex: /Kepala\s+BPS\s+Kabupaten\s+Kepulauan\s+Sitaro/i,
      label: 'Kepala BPS Kabupaten Kepulauan Sitaro'
    },
    {
      regex: /Kepala\s+BPS\s+(?:Kab\.?\s*)?(?:Kep\.\s*)?Sitaro/i,
      label: 'Kepala BPS Kabupaten Kepulauan Sitaro'
    },
    {
      regex:
        /Kepala\s+Badan\s+Pusat\s+Statistik\s+Kabupaten\s+Kepulauan\s+Sitaro/i,
      label: 'Kepala BPS Kabupaten Kepulauan Sitaro'
    },
    {
      regex: /Kepala\s+BPS\s+Provinsi\s+Sulawesi\s+Utara/i,
      label: 'Kepala BPS Provinsi Sulawesi Utara'
    },
    {
      regex:
        /Koordinator\s+Tim\s+(?:Kerja\s+)?(?:RB|Reformasi\s+Birokrasi|ZI|Zona\s+Integritas)/i,
      label: 'Koordinator Tim Reformasi Birokrasi'
    },
    {
      regex:
        /Koordinator\s+Tim\s+(?:Kerja\s+)?(?:IPDS|Integrasi\s+Pengolahan\s+dan\s+Diseminasi\s+Statistik)/i,
      label: 'Koordinator Tim IPDS'
    },
    {
      regex:
        /Koordinator\s+Tim\s+(?:Kerja\s+)?(?:Nerwilis|Neraca\s+Wilayah\s+dan\s+Analisis\s+Statistik)/i,
      label: 'Koordinator Tim Nerwilis'
    },
    {
      regex: /Koordinator\s+Tim\s+(?:Kerja\s+)?(?:Sosial|Statistik\s+Sosial)/i,
      label: 'Koordinator Tim Statistik Sosial'
    },
    {
      regex:
        /Koordinator\s+Tim\s+(?:Kerja\s+)?(?:Distribusi|Statistik\s+Distribusi)/i,
      label: 'Koordinator Tim Statistik Distribusi'
    },
    {
      regex:
        /Koordinator\s+Tim\s+(?:Kerja\s+)?(?:Produksi|Statistik\s+Produksi)/i,
      label: 'Koordinator Tim Statistik Produksi'
    },
    {
      regex: /Pejabat\s+Pembuat\s+Komitmen|(?:\bPPK\b)/i,
      label: 'Pejabat Pembuat Komitmen (PPK)'
    },
    {
      regex: /Kuasa\s+Pengguna\s+Anggaran|(?:\bKPA\b)/i,
      label: 'Kuasa Pengguna Anggaran (KPA)'
    },
    {
      regex: /Pejabat\s+Pengadaan/i,
      label: 'Pejabat Pengadaan'
    },
    {
      regex: /Kepala\s+Subbagian\s+Umum|(?:\bKasubbag\s+Umum\b)/i,
      label: 'Kepala Subbagian Umum BPS Sitaro'
    },
    {
      regex: /Ketua\s+Tim\s+(?:Penilai\s+Internal|TPI)/i,
      label: 'Ketua Tim Penilai Internal (TPI)'
    },
    {
      regex: /Sekretaris\s+Tim\s+ZI/i,
      label: 'Sekretaris Tim ZI'
    },
    {
      regex: /Notulis\s+Rapat/i,
      label: 'Notulis Rapat'
    }
  ];

  for (const role of roles) {
    if (role.regex.test(text)) {
      return role.label;
    }
  }

  // Cek pola tanda tangan a.n. (atas nama)
  const anPattern = /a\.n\.?\s+([A-Za-z\s\.,]{5,40})/i;
  const matchAn = text.match(anPattern);
  if (matchAn) {
    return `a.n. ${matchAn[1].trim()}`;
  }

  return null;
}

/**
 * Klasifikasi Jenis Naskah Dinas dari Teks / Nama Berkas
 */
export function classifyDocumentType(
  text: string,
  tipeHint?: string | null
): DocumentTypeClass {
  const combined = `${tipeHint || ''} ${text}`.toLowerCase();

  if (combined.includes('sk') || combined.includes('keputusan')) {
    return 'Keputusan (SK)';
  }
  if (combined.includes('sop') || combined.includes('prosedur')) {
    return 'Standar Operasional Prosedur (SOP)';
  }
  if (
    combined.includes('tugas') ||
    combined.includes('spt') ||
    combined.includes('st-')
  ) {
    return 'Surat Tugas';
  }
  if (combined.includes('undangan') || combined.includes('und-')) {
    return 'Surat Undangan';
  }
  if (
    combined.includes('daftar hadir') ||
    combined.includes('presensi') ||
    combined.includes('absensi')
  ) {
    return 'Daftar Hadir';
  }
  if (
    combined.includes('notula') ||
    combined.includes('notulen') ||
    combined.includes('risalah')
  ) {
    return 'Notula Rapat';
  }
  if (
    combined.includes('berita acara') ||
    combined.includes('ba-') ||
    combined.includes('/ba/')
  ) {
    return 'Berita Acara';
  }
  if (combined.includes('nota dinas') || combined.includes('nd-')) {
    return 'Nota Dinas';
  }
  if (
    combined.includes('laporan') ||
    combined.includes('monev') ||
    combined.includes('evaluasi')
  ) {
    return 'Laporan Kegiatan / Output';
  }
  if (combined.includes('surat') || combined.includes('b-')) {
    return 'Surat Dinas';
  }

  return 'Dokumen Pendukung';
}

/**
 * Validasi Kesesuaian Tahun Dokumen terhadap Periode Evaluasi Aktif
 * Mendeteksi:
 * 1. Sesuai Periode: Dokumen terbit di tahun periode yang sama (contoh 2026)
 * 2. Kadaluarsa: Dokumen terbit di tahun-tahun sebelumnya (contoh 2024 atau 2025)
 * 3. Masa Depan / Anomali: Dokumen terbit di tahun setelah periode evaluasi (contoh 2027+)
 * 4. Tidak Terdeteksi: Tahun dokumen tidak dapat diekstrak dari nama/teks
 */
export function validateDocumentPeriod(
  detectedYear: number | null,
  activeYear: number = 2026
): PeriodValidationResult {
  if (detectedYear === null || isNaN(detectedYear)) {
    return {
      status: 'TIDAK_TERDETEKSI',
      activeYear,
      detectedYear: null,
      label: 'Tahun Dokumen Belum Terdeteksi',
      badgeVariant: 'neutral',
      message:
        'Tahun dokumen tidak ditemukan pada nama berkas atau deskripsi. Pastikan nama berkas mencantumkan tahun/tanggal kegiatan.',
      isAnomaly: false
    };
  }

  if (detectedYear === activeYear) {
    return {
      status: 'SESUAI_PERIODE',
      activeYear,
      detectedYear,
      label: `Sesuai Periode ${activeYear}`,
      badgeVariant: 'success',
      message: `Tahun dokumen (${detectedYear}) valid dan sesuai dengan periode evaluasi aktif (${activeYear}).`,
      isAnomaly: false
    };
  }

  if (detectedYear < activeYear) {
    const diff = activeYear - detectedYear;
    return {
      status: 'KADALUARSA',
      activeYear,
      detectedYear,
      label: `Peringatan: Dokumen Kadaluarsa (${detectedYear})`,
      badgeVariant: 'warning',
      message: `Dokumen bertanggal tahun ${detectedYear} (${diff} tahun sebelum periode evaluasi aktif ${activeYear}). Pastikan ini bukan dokumen lama yang salah diunggah!`,
      isAnomaly: true
    };
  }

  // detectedYear > activeYear
  return {
    status: 'MASA_DEPAN',
    activeYear,
    detectedYear,
    label: `Anomali: Tanggal di Masa Depan (${detectedYear})`,
    badgeVariant: 'destructive',
    message: `Tahun dokumen (${detectedYear}) melampaui tahun periode evaluasi aktif (${activeYear}). Mohon verifikasi kembali penomoran atau tanggal berkas.`,
    isAnomaly: true
  };
}

/**
 * Engine Utama Ekstraksi Metadata Dokumen Bukti Dukung
 */
export function extractDocumentMetadata(
  input: DocumentMetadataInput
): DocumentMetadataResult {
  const activeYear = input.active_year || 2026;

  // Bersihkan teks dan satukan nama berkas, URL (jika ada nama file di URL), dan teks konten
  const namaDokumen = (input.nama_dokumen || '').trim();
  const fileUrl = (input.file_url || '').trim();
  const teksKonten = (input.teks_konten || '').trim();

  // Ekstrak nama file dari URL jika nama file asli ada di URL
  let urlFileName = '';
  try {
    if (fileUrl) {
      const parsed = new URL(fileUrl);
      const pathname = decodeURIComponent(parsed.pathname);
      const segments = pathname.split('/').filter(Boolean);
      urlFileName = segments[segments.length - 1] || '';
    }
  } catch {}

  const fullText = [namaDokumen, urlFileName, teksKonten]
    .filter(Boolean)
    .join(' ');

  // 1. Ekstraksi Nomor Naskah Dinas
  const nomorSurat = extractNomorSurat(fullText);

  // 2. Ekstraksi Tanggal Dokumen
  const tanggal = extractTanggalDokumen(fullText);

  // 3. Ekstraksi Penandatangan
  const penandatangan = extractPenandatangan(fullText);

  // 4. Klasifikasi Jenis Dokumen
  const jenisDokumen = classifyDocumentType(fullText, input.tipe_dokumen);

  // 5. Validasi Periode
  // Jika tahun di tanggal ditemukan, pakai tanggal.year; jika tidak coba cari tahun di nomor surat
  let yearToValidate: number | null = tanggal?.year ?? null;
  if (!yearToValidate && nomorSurat) {
    const yearMatch = nomorSurat.match(/\b(20\d{2})\b/);
    if (yearMatch) {
      yearToValidate = parseInt(yearMatch[1], 10);
    }
  }

  const validation = validateDocumentPeriod(yearToValidate, activeYear);

  // 6. Hitung Confidence Score (0 - 100)
  let score = 20; // Dasar ada dokumen
  if (nomorSurat) score += 35;
  if (tanggal?.day && tanggal?.month) score += 30;
  else if (tanggal?.year) score += 15;
  if (penandatangan) score += 15;

  // 7. Bentuk Kutipan Resmi Standar (Summary Citation) untuk 1-Klik Salin ke Catatan Narasi
  const defaultSigner =
    penandatangan || 'Kepala BPS Kabupaten Kepulauan Sitaro';
  let citation = '';

  if (nomorSurat && tanggal) {
    citation = `[Sesuai ${jenisDokumen} No. ${nomorSurat} tanggal ${tanggal.formatted} a.n. ${defaultSigner}]`;
  } else if (nomorSurat) {
    citation = `[Sesuai ${jenisDokumen} No. ${nomorSurat} a.n. ${defaultSigner}]`;
  } else if (tanggal) {
    citation = `[Sesuai ${jenisDokumen} per ${tanggal.formatted} a.n. ${defaultSigner}]`;
  } else {
    citation = `[Sesuai ${jenisDokumen} "${namaDokumen}" yang telah diverifikasi oleh Tim Kerja BPS Sitaro]`;
  }

  // 8. Kumpulkan Detected Entities
  const entities: DocumentMetadataResult['detected_entities'] = [];
  entities.push({ type: 'jenis', value: jenisDokumen });
  if (nomorSurat) entities.push({ type: 'nomor_surat', value: nomorSurat });
  if (tanggal) entities.push({ type: 'tanggal', value: tanggal.formatted });
  if (penandatangan)
    entities.push({ type: 'penandatangan', value: penandatangan });

  return {
    nomor_surat: nomorSurat,
    jenis_dokumen: jenisDokumen,
    tanggal,
    penandatangan,
    validation,
    confidence_score: Math.min(100, score),
    summary_citation: citation,
    detected_entities: entities
  };
}
