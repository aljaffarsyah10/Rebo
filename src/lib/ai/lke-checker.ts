/**
 * LKE Completeness & Consistency Checker Engine
 * REBO V2 - BPS Kabupaten Kepulauan Sitaro
 *
 * Menganalisis narasi/penjelasan bukti dukung LKE secara cerdas (heuristic & LLM-ready),
 * mendeteksi entitas dokumen dinas (SK, Surat, SOP, Notula, Daftar Hadir, Tanggal),
 * memvalidasi struktur narasi (What, Why, How, Bukti), serta memberikan skor dan rekomendasi perbaikan instan.
 */

export type CompletenessPredicate =
  | 'Sangat Siap'
  | 'Cukup'
  | 'Perlu Dilengkapi'
  | 'Tidak Memadai';

export interface DetectedEntity {
  type:
    | 'nomor_surat'
    | 'sk'
    | 'sop'
    | 'notula'
    | 'daftar_hadir'
    | 'tanggal'
    | 'laporan'
    | 'tautan';
  value: string;
  label: string;
}

export interface NarrativeStructureCheck {
  hasWhat: boolean;
  hasWhy: boolean;
  hasHow: boolean;
  hasEvidenceReference: boolean;
  wordCount: number;
  characterCount: number;
}

export interface CheckFinding {
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
}

export interface LKEAnalysisRequest {
  pertanyaan: {
    id_pertanyaan: string;
    uraian_pertanyaan: string;
    deskripsi_pertanyaan?: string | null;
    uraian_singkat?: string | null;
  };
  catatan: string;
  kategoriDipilih?: {
    id_kategori?: string | number;
    nama_kategori?: string;
    nilai?: number;
  } | null;
  dokumenList?: Array<{
    nama_dokumen: string;
    tipe_dokumen?: string | null;
    file_url?: string;
  }>;
}

export interface LKEAnalysisResult {
  score: number; // 0 - 100
  predicate: CompletenessPredicate;
  summary: string;
  structure: NarrativeStructureCheck;
  entities: DetectedEntity[];
  findings: CheckFinding[];
  recommendations: string[];
  relevanceScore: number; // 0 - 100
  timestamp: string;
}

// Indonesian Stopwords for relevance keyword overlap calculation
const INDONESIAN_STOPWORDS = new Set([
  'yang',
  'di',
  'dan',
  'dari',
  'ke',
  'ini',
  'itu',
  'untuk',
  'pada',
  'adalah',
  'sebagai',
  'dengan',
  'dalam',
  'oleh',
  'atas',
  'tentang',
  'terhadap',
  'akan',
  'telah',
  'atau',
  'agar',
  'bisa',
  'dapat',
  'harus',
  'kami',
  'kita',
  'saya',
  'mereka',
  'ia',
  'juga',
  'secara',
  'sudah',
  'antara',
  'namun',
  'serta',
  'bagi',
  'apakah',
  'bagaimana',
  'karena',
  'bila',
  'jika',
  'bukan',
  'hanya',
  'ada'
]);

function extractKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 3 && !INDONESIAN_STOPWORDS.has(word));
}

/**
 * Deteksi Entitas Dokumen Dinas Indonesia & BPS
 */
export function detectDocumentEntities(text: string): DetectedEntity[] {
  const entities: DetectedEntity[] = [];
  const seen = new Set<string>();

  const addEntity = (
    type: DetectedEntity['type'],
    value: string,
    label: string
  ) => {
    const cleanVal = value.trim();
    const key = `${type}:${cleanVal.toLowerCase()}`;
    if (!seen.has(key) && cleanVal.length > 2) {
      seen.add(key);
      entities.push({ type, value: cleanVal, label });
    }
  };

  // 1. Deteksi SK / Surat Keputusan (misal: "SK No. 12/BPS/2026", "Keputusan Kepala BPS No. 05 Tahun 2026")
  const skRegexes = [
    /(?:SK|Keputusan|Surat Keputusan)\s+(?:Kepala\s+BPS\s+)?(?:No|Nomor|Nomor:|No\.)?\s*([A-Za-z0-9\/\.\-_]+(?:\s+Tahun\s+\d{4})?)/gi,
    /(?:Kepka|Kepmen|Permenpan|Perka)\s+(?:No|Nomor|Nomor:|No\.)?\s*([A-Za-z0-9\/\.\-_]+)/gi
  ];
  for (const regex of skRegexes) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addEntity('sk', match[0], `Surat Keputusan: ${match[0]}`);
    }
  }

  // 2. Deteksi Nomor Surat Dinas / Nota Dinas / Undangan (B-XXX, ND-XXX, Und-XXX, BA-XXX, dll)
  const suratRegexes = [
    /\b(?:B|ND|Und|BA|SP|ST|KP|KU|HM|PR|OT)[-.\/][\w\d.\/-]+/gi,
    /\b(?:Nomor|No\.)\s*:\s*([A-Za-z0-9\/\.\-_]+)/gi,
    /\b\d{2,4}\/[A-Za-z0-9.\-_]+\/[A-Za-z0-9.\-_]+\/\d{4}\b/g
  ];
  for (const regex of suratRegexes) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      addEntity('nomor_surat', match[0], `Nomor Surat / Naskah: ${match[0]}`);
    }
  }

  // 3. Deteksi SOP (Standar Operasional Prosedur)
  const sopRegex =
    /\b(?:SOP|Standar\s+Operasional\s+Prosedur)(?:\s+[\w\d.\/-]+)?\b/gi;
  let sopMatch;
  while ((sopMatch = sopRegex.exec(text)) !== null) {
    addEntity('sop', sopMatch[0], `SOP: ${sopMatch[0]}`);
  }

  // 4. Deteksi Notula / Risalah Rapat
  const notulaRegex =
    /\b(?:Notula|Notulen|Risalah(?:\s+Rapat)?|Catatan\s+Rapat)\b/gi;
  let notulaMatch;
  while ((notulaMatch = notulaRegex.exec(text)) !== null) {
    addEntity('notula', notulaMatch[0], 'Notula Rapat');
  }

  // 5. Deteksi Daftar Hadir / Presensi
  const daftarHadirRegex =
    /\b(?:Daftar\s+Hadir|Presensi|Absensi|Tanda\s+Tangan\s+Peserta)\b/gi;
  let dhMatch;
  while ((dhMatch = daftarHadirRegex.exec(text)) !== null) {
    addEntity('daftar_hadir', dhMatch[0], 'Daftar Hadir / Presensi');
  }

  // 6. Deteksi Tanggal Pelaksanaan
  const tanggalRegex =
    /\b\d{1,2}\s+(?:Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)\s+\d{4}\b/gi;
  let tglMatch;
  while ((tglMatch = tanggalRegex.exec(text)) !== null) {
    addEntity('tanggal', tglMatch[0], `Tanggal: ${tglMatch[0]}`);
  }

  // 7. Deteksi Tautan Drive / Cloud Bukti
  const linkRegex =
    /(?:https?:\/\/)?(?:drive\.google\.com\/[^\s]+|s\.bps\.go\.id\/[^\s]+)/gi;
  let linkMatch;
  while ((linkMatch = linkRegex.exec(text)) !== null) {
    addEntity('tautan', linkMatch[0], 'Tautan Bukti Online');
  }

  return entities;
}

/**
 * Analisis Struktur Narasi: What, Why, How, Bukti Reference
 */
export function analyzeNarrativeStructure(
  text: string
): NarrativeStructureCheck {
  const words = text.trim() ? text.trim().split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;
  const characterCount = text.length;

  const lower = text.toLowerCase();

  // What (Kegiatan / Kebijakan yang dibuat atau dilaksanakan)
  const whatKeywords = [
    'telah',
    'dilaksanakan',
    'ditetapkan',
    'kegiatan',
    'pelaksanaan',
    'pembentukan',
    'sosialisasi',
    'penerapan',
    'tindak lanjut',
    'penyusunan',
    'pengesahan',
    'adanya',
    'pembaharuan',
    'rapat',
    'pelatihan',
    'bimbingan',
    'pengisian',
    'pemantauan',
    'evaluasi'
  ];
  const hasWhat = whatKeywords.some((kw) => lower.includes(kw));

  // Why (Alasan, Dasar hukum, Tujuan pemenuhan)
  const whyKeywords = [
    'dalam rangka',
    'bertujuan',
    'untuk',
    'sesuai',
    'berdasarkan',
    'mengacu',
    'menindaklanjuti',
    'sebagai pemenuhan',
    'dasar hukum',
    'landasan',
    'agar',
    'demi'
  ];
  const hasWhy = whyKeywords.some((kw) => lower.includes(kw));

  // How (Metode, Mekanisme, Frekuensi, Alur proses)
  const howKeywords = [
    'melalui',
    'dengan cara',
    'secara berkala',
    'menggunakan',
    'mekanisme',
    'alur',
    'tahapan',
    'koordinasi',
    'prosedur',
    'metode',
    'setiap bulan',
    'setiap triwulan',
    'secara rutin',
    'fasilitasi',
    'kolaborasi'
  ];
  const hasHow = howKeywords.some((kw) => lower.includes(kw));

  // Evidence Reference (Rujukan ke dokumen bukti pendukung)
  const evidenceKeywords = [
    'lampiran',
    'terlampir',
    'dokumen bukti',
    'tercantum',
    'sebagaimana tertuang',
    'folder',
    'drive',
    'berkas',
    'bukti dukung',
    'tautan',
    'link',
    'sk',
    'surat',
    'notula',
    'daftar hadir',
    'foto',
    'laporan',
    'notulen'
  ];
  const hasEvidenceReference = evidenceKeywords.some((kw) =>
    lower.includes(kw)
  );

  return {
    hasWhat,
    hasWhy,
    hasHow,
    hasEvidenceReference,
    wordCount,
    characterCount
  };
}

/**
 * Menghitung skor relevansi kata kunci antara narasi dan pertanyaan LKE
 */
function calculateRelevance(
  pertanyaanText: string,
  catatanText: string
): number {
  if (!catatanText.trim()) return 0;
  const pertKeywords = extractKeywords(pertanyaanText);
  if (pertKeywords.length === 0) return 70; // baseline if question is very short

  const catatanWords = new Set(extractKeywords(catatanText));
  let matched = 0;
  for (const kw of pertKeywords) {
    if (catatanWords.has(kw)) {
      matched++;
    }
  }

  const ratio = matched / Math.min(pertKeywords.length, 6);
  return Math.min(100, Math.round(ratio * 100));
}

/**
 * Heuristic LKE Checking Engine
 */
export function analyzeLKECatatan(
  request: LKEAnalysisRequest
): LKEAnalysisResult {
  const { pertanyaan, catatan = '', dokumenList = [] } = request;
  const cleanCatatan = catatan.trim();

  // 1. Ekstraksi entitas & struktur
  const entities = detectDocumentEntities(cleanCatatan);
  const structure = analyzeNarrativeStructure(cleanCatatan);

  // 2. Hitung Relevansi
  const fullPertanyaanText = `${pertanyaan.uraian_pertanyaan} ${pertanyaan.deskripsi_pertanyaan || ''} ${pertanyaan.uraian_singkat || ''}`;
  const relevanceScore = calculateRelevance(fullPertanyaanText, cleanCatatan);

  const findings: CheckFinding[] = [];
  const recommendations: string[] = [];

  // Edge Case: Narasi Kosong
  if (cleanCatatan.length === 0) {
    return {
      score: 0,
      predicate: 'Tidak Memadai',
      summary: 'Catatan penjelasan bukti dukung belum diisi oleh operator.',
      structure,
      entities,
      findings: [
        {
          type: 'error',
          title: 'Narasi Kosong',
          message:
            'Kolom catatan penjelasan bukti dukung masih kosong. Verifikator memerlukan penjelasan konteks sebelum meninjau dokumen.'
        }
      ],
      recommendations: [
        'Tuliskan ringkasan kegiatan atau kebijakan yang telah dilakukan untuk memenuhi indikator ini.',
        'Sebutkan nomor surat tugas/SK atau SOP yang menjadi payung hukum.',
        'Jelaskan dampak atau hasil konkret dari pelaksanaan kegiatan tersebut.'
      ],
      relevanceScore: 0,
      timestamp: new Date().toISOString()
    };
  }

  // 3. Evaluasi Panjang Narasi (Word Count & Depth)
  let lengthScore = 0;
  if (structure.wordCount < 10) {
    lengthScore = 5;
    findings.push({
      type: 'error',
      title: 'Narasi Terlalu Singkat (< 10 kata)',
      message: `Narasi saat ini hanya ${structure.wordCount} kata. Penjelasan yang sangat singkat rentan ditolak oleh Tim Penilai/Verifikator karena dianggap kurang representatif.`
    });
    recommendations.push(
      'Perpanjang penjelasan minimal 30–50 kata dengan menguraikan alur pelaksanaan dan hasil yang dicapai.'
    );
  } else if (structure.wordCount < 30) {
    lengthScore = 15;
    findings.push({
      type: 'warning',
      title: 'Peringatan Dini: Narasi Kurang Komprehensif (< 30 kata)',
      message: `Narasi terdiri dari ${structure.wordCount} kata. Disarankan minimal 30 kata agar memenuhi standar audit PMPRB/ZI KemenPAN-RB.`
    });
    recommendations.push(
      'Lengkapi narasi dengan menambahkan informasi: Siapa pelaksananya, Kapan waktu kegiatannya, dan Apa hasil/outputnya.'
    );
  } else if (structure.wordCount < 60) {
    lengthScore = 22;
  } else {
    lengthScore = 25; // Skor maksimal panjang narasi
  }

  // 4. Evaluasi Struktur 4 Pilar (What, Why, How, Bukti) - Bobot 35 pts
  let structureScore = 0;

  if (structure.hasWhat) {
    structureScore += 10;
  } else {
    findings.push({
      type: 'warning',
      title: 'Belum Menjelaskan Objek Kegiatan (What)',
      message:
        'Narasi belum memuat tindakan/kebijakan konkret yang telah diambil BPS Sitaro (misal: "telah dibentuk tim...", "telah dilaksanakan rapat...").'
    });
    recommendations.push(
      'Awali dengan pernyataan lugas mengenai apa kegiatan atau produk hukum yang telah diselesaikan.'
    );
  }

  if (structure.hasWhy) {
    structureScore += 8;
  } else {
    recommendations.push(
      'Sebutkan tujuan atau dasar pelaksanaan (misal: "dalam rangka pemenuhan reformasi birokrasi area pilar...").'
    );
  }

  if (structure.hasHow) {
    structureScore += 8;
  } else {
    recommendations.push(
      'Jelaskan mekanisme atau frekuensi pelaksanaannya (misal: "dilaksanakan secara berkala setiap bulan melalui rapat koordinasi...").'
    );
  }

  if (structure.hasEvidenceReference || entities.length > 0) {
    structureScore += 9;
  } else {
    findings.push({
      type: 'warning',
      title: 'Tidak Ada Rujukan Dokumen Bukti',
      message:
        'Narasi belum merujuk atau menyebutkan dokumen fisik/digital yang dilampirkan (misal: "sebagaimana tertuang dalam SK Kepala BPS...").'
    });
    recommendations.push(
      'Cantumkan kalimat pengait ke dokumen bukti, contoh: "Bukti pemenuhan terlampir pada dokumen SK No. ... dan Notula Rapat tanggal ..."'
    );
  }

  // 5. Evaluasi Entitas Dokumen Resmi (SK, Surat, SOP, Tanggal) - Bobot 20 pts
  let entityScore = 0;
  const hasFormalDoc = entities.some(
    (e) => e.type === 'sk' || e.type === 'nomor_surat' || e.type === 'sop'
  );
  const hasDate = entities.some((e) => e.type === 'tanggal');

  if (hasFormalDoc) {
    entityScore += 12;
  } else {
    findings.push({
      type: 'warning',
      title: 'Nomor Surat / SK Belum Disebutkan',
      message:
        'Narasi tidak mencantumkan nomor registrasi resmi dokumen (Nomor SK, Nomor Surat, atau Kode SOP).'
    });
    recommendations.push(
      'Tuliskan nomor naskah dinas resmi secara spesifik, contoh: "SK No. 12/BPS/7108/2026".'
    );
  }

  if (hasDate) {
    entityScore += 8;
  } else {
    recommendations.push(
      'Cantumkan tanggal atau bulan kegiatan berlangsung agar verifikator dapat memvalidasi relevansi tahun anggaran.'
    );
  }

  // 6. Evaluasi Dokumen Pendukung Terlampir
  if (
    dokumenList.length === 0 &&
    entities.filter((e) => e.type === 'tautan').length === 0
  ) {
    findings.push({
      type: 'warning',
      title: 'Tabel Dokumen Bukti Masih Kosong',
      message:
        'Belum ada file dokumen bukti atau tautan Google Drive yang diunggah pada daftar berkas.'
    });
    recommendations.push(
      'Unggah minimal satu berkas bukti dukung (PDF/Dokumentasi) atau tambahkan tautan folder Google Drive.'
    );
  } else {
    findings.push({
      type: 'success',
      title: 'Dokumen Bukti Terdeteksi',
      message: `Terdapat ${dokumenList.length} dokumen terlampir pada form bukti dukung.`
    });
  }

  // 7. Evaluasi Relevansi Kata Kunci (Bobot 20 pts)
  const relevancePoints = Math.round((relevanceScore / 100) * 20);

  // 8. Total Skor (0 - 100)
  let totalScore = Math.min(
    100,
    lengthScore + structureScore + entityScore + relevancePoints
  );

  // Penalti jika narasi sangat singkat meskipun banyak regex cocok secara kebetulan
  if (structure.wordCount < 15 && totalScore > 40) {
    totalScore = 40;
  }

  // 9. Penentuan Predikat
  let predicate: CompletenessPredicate = 'Tidak Memadai';
  if (totalScore >= 85) {
    predicate = 'Sangat Siap';
  } else if (totalScore >= 70) {
    predicate = 'Cukup';
  } else if (totalScore >= 45) {
    predicate = 'Perlu Dilengkapi';
  } else {
    predicate = 'Tidak Memadai';
  }

  // 10. Summary Text
  let summary = '';
  if (predicate === 'Sangat Siap') {
    summary =
      'Narasi penjelasan sangat komprehensif, memuat rujukan dokumen resmi, dan siap diajukan ke Verifikator.';
    findings.push({
      type: 'success',
      title: 'Kualitas Narasi Memuaskan',
      message:
        'Deskripsi telah memenuhi unsur What, Why, How serta mengaitkan dokumen bukti pendukung secara akurat.'
    });
  } else if (predicate === 'Cukup') {
    summary =
      'Narasi sudah cukup baik menjawab indikator LKE, namun masih dapat ditingkatkan dengan rincian teknis tambahan.';
  } else if (predicate === 'Perlu Dilengkapi') {
    summary =
      'Narasi masih perlu dilengkapi rincian nomor surat, tanggal, atau uraian kegiatan sebelum diserahkan ke Verifikator.';
  } else {
    summary =
      'Narasi belum memadai untuk meyakinkan Verifikator. Harap perbaiki dengan mengikuti saran perbaikan instan di bawah.';
  }

  // Hilangkan duplikasi pada rekomendasi
  const uniqueRecommendations = Array.from(new Set(recommendations)).slice(
    0,
    5
  );

  return {
    score: totalScore,
    predicate,
    summary,
    structure,
    entities,
    findings,
    recommendations: uniqueRecommendations,
    relevanceScore,
    timestamp: new Date().toISOString()
  };
}

/**
 * Prompt Template Generator for LLM-ready analysis
 */
export function buildLLMPrompt(request: LKEAnalysisRequest): string {
  return `Sebagai Asisten AI Quality Assurance RB/ZI BPS Kabupaten Kepulauan Sitaro, lakukan verifikasi narasi penjelasan bukti dukung LKE berikut:

Pertanyaan Indikator:
${request.pertanyaan.uraian_pertanyaan}
${request.pertanyaan.deskripsi_pertanyaan ? `Petunjuk KemenPAN-RB: ${request.pertanyaan.deskripsi_pertanyaan}` : ''}

Narasi Operator:
"${request.catatan}"

Dokumen Terlampir:
${request.dokumenList?.map((d, i) => `${i + 1}. ${d.nama_dokumen} (${d.tipe_dokumen || 'Umum'})`).join('\n') || 'Belum ada'}

Analisis apakah narasi telah memenuhi kaidah What, Why, How, menyebutkan nomor surat/SK/SOP, dan tanggal kegiatan yang valid. Berikan skor (0-100) dan rekomendasi perbaikan instan.`;
}
