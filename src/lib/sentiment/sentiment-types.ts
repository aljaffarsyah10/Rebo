/**
 * Tipe Data dan Engine Lexicon Analisis Sentimen Kepuasan Konsumen PST BPS Kabupaten Kepulauan Sitaro
 * Digunakan untuk pemenuhan bukti dukung Reformasi Birokrasi (RB) - Pilar 6 (Kualitas Pelayanan Publik)
 */

export type SentimentType = 'POSITIF' | 'NETRAL' | 'NEGATIF';
export type WordCategory =
  | 'Petugas'
  | 'Kecepatan'
  | 'Akurasi Data'
  | 'Inovasi Digital'
  | 'Fasilitas';
export type TindakLanjutStatus =
  | 'SELESAI'
  | 'DALAM_PROSES'
  | 'DITELAAH'
  | 'EVALUASI_BERKALA';

export interface FeedbackKonsumen {
  id: string;
  tanggal: string; // Format: YYYY-MM-DD
  nama_pengunjung: string;
  instansi_asal: string;
  layanan_diakses: string;
  skor_rating: number; // 1 s.d. 5
  teks_saran_masukan: string;
  sentimen: SentimentType;
  skor_sentimen: number; // rentang -1.0 s.d. 1.0
  kata_kunci_terdeteksi: string[];
  status_tindak_lanjut: TindakLanjutStatus;
  catatan_tindak_lanjut?: string;
}

export interface WordCloudItem {
  text: string;
  value: number; // bobot frekuensi kemunculan
  sentiment: 'positif' | 'netral' | 'negatif';
  category: WordCategory;
}

export interface SentimentSummaryData {
  total_responden: number;
  persentase_positif: number;
  persentase_netral: number;
  persentase_negatif: number;
  nps_score: number; // Net Promoter Score (-100 s.d. +100)
  nps_category:
    | 'World Class'
    | 'Excellent'
    | 'Great'
    | 'Good'
    | 'Needs Improvement';
  rata_rata_rating: number;
  promoter_count: number;
  passive_count: number;
  detractor_count: number;
  rating_distribution: {
    rating: number;
    count: number;
    percentage: number;
  }[];
  category_distribution: {
    category: WordCategory;
    count: number;
    persentase: number;
  }[];
  layanan_distribution: {
    layanan: string;
    total: number;
    skor_rata_rata: number;
    positif_pct: number;
  }[];
  word_cloud_list: WordCloudItem[];
  feedback_list: FeedbackKonsumen[];
  layanan_list: string[];
}

// ============================================================================
// LEXICON DICTIONARY BAHASA INDONESIA & TERMINOLOGI LAYANAN PST BPS SITARO
// ============================================================================

export const POSITIVE_LEXICON: Record<
  string,
  { weight: number; category: WordCategory }
> = {
  ramah: { weight: 0.85, category: 'Petugas' },
  cepat: { weight: 0.85, category: 'Kecepatan' },
  memuaskan: { weight: 0.9, category: 'Petugas' },
  transparan: { weight: 0.85, category: 'Petugas' },
  'si-datu': { weight: 0.8, category: 'Inovasi Digital' },
  sidatu: { weight: 0.8, category: 'Inovasi Digital' },
  tepat: { weight: 0.75, category: 'Akurasi Data' },
  'nol rupiah': { weight: 0.95, category: 'Petugas' },
  gratis: { weight: 0.9, category: 'Akurasi Data' },
  akurat: { weight: 0.9, category: 'Akurasi Data' },
  informatif: { weight: 0.8, category: 'Akurasi Data' },
  terbantu: { weight: 0.75, category: 'Petugas' },
  mudah: { weight: 0.75, category: 'Kecepatan' },
  responsif: { weight: 0.85, category: 'Petugas' },
  profesional: { weight: 0.85, category: 'Petugas' },
  santun: { weight: 0.8, category: 'Petugas' },
  nyaman: { weight: 0.75, category: 'Fasilitas' },
  bersih: { weight: 0.7, category: 'Fasilitas' },
  lengkap: { weight: 0.8, category: 'Akurasi Data' },
  sigap: { weight: 0.8, category: 'Petugas' },
  solutif: { weight: 0.85, category: 'Petugas' },
  efisien: { weight: 0.8, category: 'Kecepatan' },
  prima: { weight: 0.9, category: 'Petugas' },
  bagus: { weight: 0.7, category: 'Petugas' },
  terbaik: { weight: 0.9, category: 'Petugas' },
  mantap: { weight: 0.8, category: 'Petugas' },
  jelas: { weight: 0.75, category: 'Akurasi Data' },
  humanis: { weight: 0.8, category: 'Petugas' },
  sabar: { weight: 0.75, category: 'Petugas' },
  inovatif: { weight: 0.85, category: 'Inovasi Digital' },
  bermutu: { weight: 0.8, category: 'Akurasi Data' },
  terbuka: { weight: 0.75, category: 'Petugas' },
  presisi: { weight: 0.85, category: 'Akurasi Data' },
  'bebas pungli': { weight: 0.95, category: 'Petugas' },
  'tanpa biaya': { weight: 0.9, category: 'Petugas' },
  membantu: { weight: 0.75, category: 'Petugas' },
  representatif: { weight: 0.75, category: 'Fasilitas' }
};

export const NEGATIVE_LEXICON: Record<
  string,
  { weight: number; category: WordCategory }
> = {
  lambat: { weight: -0.85, category: 'Kecepatan' },
  antri: { weight: -0.6, category: 'Kecepatan' },
  antrean: { weight: -0.6, category: 'Kecepatan' },
  sinyal: { weight: -0.5, category: 'Inovasi Digital' },
  jaringan: { weight: -0.5, category: 'Inovasi Digital' },
  perbaiki: { weight: -0.4, category: 'Fasilitas' },
  sempit: { weight: -0.55, category: 'Fasilitas' },
  tunggu: { weight: -0.45, category: 'Kecepatan' },
  lama: { weight: -0.75, category: 'Kecepatan' },
  rumit: { weight: -0.7, category: 'Kecepatan' },
  susah: { weight: -0.7, category: 'Kecepatan' },
  kurang: { weight: -0.5, category: 'Fasilitas' },
  kendala: { weight: -0.6, category: 'Inovasi Digital' },
  gangguan: { weight: -0.65, category: 'Inovasi Digital' },
  lemot: { weight: -0.75, category: 'Inovasi Digital' },
  macet: { weight: -0.6, category: 'Kecepatan' },
  panas: { weight: -0.45, category: 'Fasilitas' },
  parkir: { weight: -0.4, category: 'Fasilitas' },
  terbatas: { weight: -0.4, category: 'Fasilitas' },
  keliru: { weight: -0.75, category: 'Akurasi Data' },
  bingung: { weight: -0.6, category: 'Kecepatan' },
  sulit: { weight: -0.65, category: 'Kecepatan' },
  pungli: { weight: -1.0, category: 'Petugas' },
  mahal: { weight: -0.8, category: 'Petugas' },
  rusak: { weight: -0.7, category: 'Fasilitas' },
  bising: { weight: -0.5, category: 'Fasilitas' }
};

export const NEUTRAL_CONTEXT_WORDS: Record<string, WordCategory> = {
  konsultasi: 'Petugas',
  rekomendasi: 'Akurasi Data',
  romantik: 'Akurasi Data',
  metadata: 'Akurasi Data',
  statistik: 'Akurasi Data',
  data: 'Akurasi Data',
  publikasi: 'Akurasi Data',
  portal: 'Inovasi Digital',
  website: 'Inovasi Digital',
  aplikasi: 'Inovasi Digital',
  pst: 'Fasilitas',
  ruangan: 'Fasilitas',
  pengunjung: 'Petugas',
  petugas: 'Petugas',
  wifi: 'Fasilitas',
  meja: 'Fasilitas'
};

export const DAFTAR_LAYANAN_PST = [
  'Semua Layanan PST',
  'Konsultasi Statistik Langsung',
  'Rekomendasi Kegiatan Statistik (ROMANTIK)',
  'Metadata Statistik Sektoral',
  'Permintaan Data Mikro & Publikasi',
  'Si-Datu Portal Digital',
  'Pojok Statistik & Edukasi Literasi'
] as const;

// ============================================================================
// ENGINE ANALISIS SENTIMEN & EKSTRAKSI KATA KUNCI
// ============================================================================

/**
 * Menghitung sentimen dari teks ulasan konsumen dan skor rating yang diberikan
 */
export function analyzeFeedbackSentiment(
  text: string,
  rating: number
): {
  sentimen: SentimentType;
  skor_sentimen: number;
  kata_kunci_terdeteksi: string[];
} {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s-]/g, ' ');
  const words = normalized.split(/\s+/).filter(Boolean);
  const detectedKeywords: string[] = [];

  let textScore = 0;
  let wordMatches = 0;

  // Cek frasa khusus 2 kata
  const phrases = [
    'nol rupiah',
    'bebas pungli',
    'tanpa biaya',
    'si-datu',
    'ruang tunggu',
    'waktu tunggu',
    'tidak ada pungli',
    'tidak dipungut biaya'
  ];

  for (const phrase of phrases) {
    if (normalized.includes(phrase)) {
      if (
        phrase === 'nol rupiah' ||
        phrase === 'bebas pungli' ||
        phrase === 'tanpa biaya' ||
        phrase === 'tidak ada pungli' ||
        phrase === 'tidak dipungut biaya'
      ) {
        textScore += 0.95;
        detectedKeywords.push(
          phrase
            .replace('tidak ada pungli', 'bebas pungli')
            .replace('tidak dipungut biaya', 'nol rupiah')
        );
        wordMatches++;
      } else if (phrase === 'si-datu') {
        textScore += 0.8;
        detectedKeywords.push('si-datu');
        wordMatches++;
      } else if (phrase === 'ruang tunggu') {
        detectedKeywords.push('ruang tunggu');
      } else if (phrase === 'waktu tunggu') {
        textScore -= 0.4;
        detectedKeywords.push('waktu tunggu');
        wordMatches++;
      }
    }
  }

  // Cek kata per kata
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = i > 0 ? words[i - 1] : '';
    const isNegated = ['tidak', 'bukan', 'tanpa', 'belum', 'kurang'].includes(
      prevWord
    );

    if (POSITIVE_LEXICON[word]) {
      const item = POSITIVE_LEXICON[word];
      if (isNegated) {
        // "tidak ramah", "kurang cepat" -> dibalik menjadi bernuansa masukan/negatif
        textScore -= item.weight * 0.8;
        detectedKeywords.push(`kurang ${word}`);
      } else {
        textScore += item.weight;
        if (!detectedKeywords.includes(word)) detectedKeywords.push(word);
      }
      wordMatches++;
    } else if (NEGATIVE_LEXICON[word]) {
      const item = NEGATIVE_LEXICON[word];
      if (isNegated) {
        // "tidak lambat", "tanpa kendala" -> positif
        textScore += Math.abs(item.weight) * 0.8;
        if (!detectedKeywords.includes(word))
          detectedKeywords.push(`bebas ${word}`);
      } else {
        textScore += item.weight;
        if (!detectedKeywords.includes(word)) detectedKeywords.push(word);
      }
      wordMatches++;
    } else if (NEUTRAL_CONTEXT_WORDS[word]) {
      if (!detectedKeywords.includes(word)) {
        detectedKeywords.push(word);
      }
    }
  }

  // Normalisasi skor teks (-1.0 s.d. 1.0)
  const normalizedTextScore =
    wordMatches > 0 ? textScore / Math.max(1, wordMatches) : 0;

  // Konversi skor rating (1-5) menjadi (-1.0 s.d. 1.0)
  // Rating 5 -> +1.0, 4 -> +0.5, 3 -> 0.0, 2 -> -0.5, 1 -> -1.0
  const normalizedRatingScore = (rating - 3) / 2;

  // Gabungkan dengan pembobotan: 60% teks, 40% rating
  let finalScore = normalizedTextScore * 0.6 + normalizedRatingScore * 0.4;
  finalScore = Math.max(-1.0, Math.min(1.0, Number(finalScore.toFixed(2))));

  // Klasifikasi Sentimen
  let sentimen: SentimentType = 'NETRAL';
  if (finalScore >= 0.2 || (rating >= 5 && finalScore >= 0.05)) {
    sentimen = 'POSITIF';
  } else if (finalScore <= -0.2 || rating <= 2) {
    sentimen = 'NEGATIF';
  } else {
    sentimen = 'NETRAL';
  }

  return {
    sentimen,
    skor_sentimen: finalScore,
    kata_kunci_terdeteksi: Array.from(new Set(detectedKeywords)).slice(0, 8)
  };
}

/**
 * Menghasilkan daftar Word Cloud Item dari daftar feedback konsumen
 */
export function extractWordCloud(
  feedbackList: FeedbackKonsumen[]
): WordCloudItem[] {
  const frequencyMap: Record<
    string,
    {
      count: number;
      positiveScore: number;
      negativeScore: number;
      category: WordCategory;
    }
  > = {};

  feedbackList.forEach((fb) => {
    fb.kata_kunci_terdeteksi.forEach((rawWord) => {
      const word = rawWord.toLowerCase().trim();
      if (!word) return;

      if (!frequencyMap[word]) {
        let cat: WordCategory = 'Petugas';
        if (POSITIVE_LEXICON[word]) cat = POSITIVE_LEXICON[word].category;
        else if (NEGATIVE_LEXICON[word]) cat = NEGATIVE_LEXICON[word].category;
        else if (NEUTRAL_CONTEXT_WORDS[word]) cat = NEUTRAL_CONTEXT_WORDS[word];
        else if (
          word.includes('sinyal') ||
          word.includes('jaringan') ||
          word.includes('si-datu') ||
          word.includes('aplikasi')
        )
          cat = 'Inovasi Digital';
        else if (
          word.includes('tunggu') ||
          word.includes('cepat') ||
          word.includes('lambat')
        )
          cat = 'Kecepatan';
        else if (
          word.includes('data') ||
          word.includes('akurat') ||
          word.includes('rekomendasi')
        )
          cat = 'Akurasi Data';
        else if (
          word.includes('ruang') ||
          word.includes('nyaman') ||
          word.includes('sempit') ||
          word.includes('wifi')
        )
          cat = 'Fasilitas';

        frequencyMap[word] = {
          count: 0,
          positiveScore: 0,
          negativeScore: 0,
          category: cat
        };
      }

      frequencyMap[word].count += 1;
      if (fb.sentimen === 'POSITIF') {
        frequencyMap[word].positiveScore += 1;
      } else if (fb.sentimen === 'NEGATIF') {
        frequencyMap[word].negativeScore += 1;
      }
    });
  });

  const list: WordCloudItem[] = Object.keys(frequencyMap).map((text) => {
    const item = frequencyMap[text];
    let sentiment: 'positif' | 'netral' | 'negatif' = 'netral';

    if (POSITIVE_LEXICON[text]) {
      sentiment = 'positif';
    } else if (NEGATIVE_LEXICON[text]) {
      sentiment = 'negatif';
    } else if (item.positiveScore > item.negativeScore) {
      sentiment = 'positif';
    } else if (item.negativeScore > item.positiveScore) {
      sentiment = 'negatif';
    }

    return {
      text,
      value: item.count,
      sentiment,
      category: item.category
    };
  });

  return list.sort((a, b) => b.value - a.value);
}

/**
 * Menghitung kalkulasi metrik ringkasan sentimen & NPS
 */
export function calculateSentimentSummary(
  feedbackList: FeedbackKonsumen[]
): SentimentSummaryData {
  const total = feedbackList.length;
  if (total === 0) {
    return {
      total_responden: 0,
      persentase_positif: 0,
      persentase_netral: 0,
      persentase_negatif: 0,
      nps_score: 0,
      nps_category: 'Good',
      rata_rata_rating: 0,
      promoter_count: 0,
      passive_count: 0,
      detractor_count: 0,
      rating_distribution: [],
      category_distribution: [],
      layanan_distribution: [],
      word_cloud_list: [],
      feedback_list: [],
      layanan_list: [...DAFTAR_LAYANAN_PST]
    };
  }

  let positifCount = 0;
  let netralCount = 0;
  let negatifCount = 0;
  let totalRating = 0;

  // NPS Klasifikasi:
  // Promoter: rating 5 (atau sentiment POSITIF dengan rating 4)
  // Passive: rating 4 dengan sentimen NETRAL
  // Detractor: rating 1-3
  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const layananMap: Record<
    string,
    { total: number; totalRating: number; positif: number }
  > = {};

  feedbackList.forEach((fb) => {
    totalRating += fb.skor_rating;
    ratingCounts[fb.skor_rating] = (ratingCounts[fb.skor_rating] || 0) + 1;

    if (fb.sentimen === 'POSITIF') positifCount++;
    else if (fb.sentimen === 'NEGATIF') negatifCount++;
    else netralCount++;

    // NPS Standard calculation
    if (fb.skor_rating === 5) {
      promoters++;
    } else if (fb.skor_rating === 4) {
      passives++;
    } else {
      detractors++;
    }

    // Layanan breakdown
    const lay = fb.layanan_diakses;
    if (!layananMap[lay]) {
      layananMap[lay] = { total: 0, totalRating: 0, positif: 0 };
    }
    layananMap[lay].total += 1;
    layananMap[lay].totalRating += fb.skor_rating;
    if (fb.sentimen === 'POSITIF') layananMap[lay].positif += 1;
  });

  const persentasePositif = Number(((positifCount / total) * 100).toFixed(1));
  const persentaseNetral = Number(((netralCount / total) * 100).toFixed(1));
  const persentaseNegatif = Number(((negatifCount / total) * 100).toFixed(1));

  const npsScore = Math.round(((promoters - detractors) / total) * 100);

  let npsCategory:
    | 'World Class'
    | 'Excellent'
    | 'Great'
    | 'Good'
    | 'Needs Improvement' = 'Good';
  if (npsScore >= 80) npsCategory = 'World Class';
  else if (npsScore >= 50) npsCategory = 'Excellent';
  else if (npsScore >= 30) npsCategory = 'Great';
  else if (npsScore >= 0) npsCategory = 'Good';
  else npsCategory = 'Needs Improvement';

  const avgRating = Number((totalRating / total).toFixed(2));

  const rating_distribution = [5, 4, 3, 2, 1].map((r) => ({
    rating: r,
    count: ratingCounts[r] || 0,
    percentage: Number((((ratingCounts[r] || 0) / total) * 100).toFixed(1))
  }));

  const wordCloud = extractWordCloud(feedbackList);

  // Kategori distribusi
  const catCounts: Record<WordCategory, number> = {
    Petugas: 0,
    Kecepatan: 0,
    'Akurasi Data': 0,
    'Inovasi Digital': 0,
    Fasilitas: 0
  };
  wordCloud.forEach((item) => {
    catCounts[item.category] = (catCounts[item.category] || 0) + item.value;
  });

  const totalCatWeight =
    Object.values(catCounts).reduce((a, b) => a + b, 0) || 1;
  const category_distribution = (Object.keys(catCounts) as WordCategory[]).map(
    (cat) => ({
      category: cat,
      count: catCounts[cat],
      persentase: Number(((catCounts[cat] / totalCatWeight) * 100).toFixed(1))
    })
  );

  const layanan_distribution = Object.keys(layananMap).map((lay) => ({
    layanan: lay,
    total: layananMap[lay].total,
    skor_rata_rata: Number(
      (layananMap[lay].totalRating / layananMap[lay].total).toFixed(2)
    ),
    positif_pct: Number(
      ((layananMap[lay].positif / layananMap[lay].total) * 100).toFixed(1)
    )
  }));

  return {
    total_responden: total,
    persentase_positif: persentasePositif,
    persentase_netral: persentaseNetral,
    persentase_negatif: persentaseNegatif,
    nps_score: npsScore,
    nps_category: npsCategory,
    rata_rata_rating: avgRating,
    promoter_count: promoters,
    passive_count: passives,
    detractor_count: detractors,
    rating_distribution,
    category_distribution,
    layanan_distribution,
    word_cloud_list: wordCloud,
    feedback_list: feedbackList,
    layanan_list: [...DAFTAR_LAYANAN_PST]
  };
}

// ============================================================================
// MOCK DATA REALISTIS 30 ULASAN PENGUNJUNG PST BPS SITARO TAHUN 2026
// ============================================================================

export const DEFAULT_MOCK_FEEDBACK: FeedbackKonsumen[] = [
  {
    id: 'FB-2026-001',
    tanggal: '2026-02-18',
    nama_pengunjung: 'Christian Janis, S.IP',
    instansi_asal: 'Bappelitbangda Kab. Kepl. Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Pelayanan konsultasi data PDRB dan inflasi daerah sangat memuaskan, petugas ramah, cepat tanggap dan data akurat untuk penyusunan RKPD 2026.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.92,
    kata_kunci_terdeteksi: ['memuaskan', 'ramah', 'cepat', 'akurat'],
    status_tindak_lanjut: 'SELESAI',
    catatan_tindak_lanjut: 'Apresiasi disampaikan kepada petugas loket PST.'
  },
  {
    id: 'FB-2026-002',
    tanggal: '2026-02-16',
    nama_pengunjung: 'Mario Salindeho, S.Kom',
    instansi_asal: 'Dinas Kominfo Kab. Kepl. Sitaro',
    layanan_diakses: 'Metadata Statistik Sektoral',
    skor_rating: 5,
    teks_saran_masukan:
      'Kolaborasi metadata statistik sektoral berjalan lancar. Inovasi Si-Datu sangat inovatif dan mempermudah diseminasi data, nol rupiah tanpa biaya apapun.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.95,
    kata_kunci_terdeteksi: ['metadata', 'si-datu', 'inovatif', 'nol rupiah'],
    status_tindak_lanjut: 'SELESAI',
    catatan_tindak_lanjut: 'Integrasi API data satu data terus ditingkatkan.'
  },
  {
    id: 'FB-2026-003',
    tanggal: '2026-02-14',
    nama_pengunjung: 'dr. Meyke Manoppo',
    instansi_asal: 'Dinas Kesehatan Kab. Kepl. Sitaro',
    layanan_diakses: 'Rekomendasi Kegiatan Statistik (ROMANTIK)',
    skor_rating: 5,
    teks_saran_masukan:
      'Konsultasi rekomendasi statistik sektoral (ROMANTIK) untuk data stunting dilayani dengan sigap dan profesional. Penjelasannya sangat jelas dan transparan.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.88,
    kata_kunci_terdeteksi: [
      'rekomendasi',
      'romantik',
      'sigap',
      'profesional',
      'jelas',
      'transparan'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-004',
    tanggal: '2026-02-12',
    nama_pengunjung: 'Griselda Takahindenang',
    instansi_asal: 'Mahasiswa Unsrat Manado (Asal Siau)',
    layanan_diakses: 'Permintaan Data Mikro & Publikasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Butuh data mikro ketenagakerjaan untuk skripsi, proses cepat dan gratis. Tempatnya nyaman dan bersih, petugas sangat bersahabat membimbing pencarian tabel.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.89,
    kata_kunci_terdeteksi: [
      'data',
      'cepat',
      'gratis',
      'nyaman',
      'bersih',
      'ramah'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-005',
    tanggal: '2026-02-11',
    nama_pengunjung: 'Recky Jacob, SE',
    instansi_asal: 'DPMPTSP Kab. Kepl. Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Pelayanan konsultasi izin usaha dan data statistik investasi daerah cepat dan transparan. Tidak ada pungli sama sekali. Mantap BPS Sitaro.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.94,
    kata_kunci_terdeteksi: [
      'konsultasi',
      'cepat',
      'transparan',
      'bebas pungli',
      'mantap'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-006',
    tanggal: '2026-02-09',
    nama_pengunjung: 'Stenly Kansil, SH',
    instansi_asal: 'Inspektorat Daerah Kab. Kepl. Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Kunjungan koordinasi bukti dukung evaluasi ZI dan penilaian mandiri, ruang PST sangat representatif dan bersih. Layanan prima.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.85,
    kata_kunci_terdeteksi: ['ruangan', 'representatif', 'bersih', 'prima'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-007',
    tanggal: '2026-02-06',
    nama_pengunjung: 'Johanis Tatengkeng, SP',
    instansi_asal: 'Dinas Pertanian Kab. Kepl. Sitaro',
    layanan_diakses: 'Permintaan Data Mikro & Publikasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Butuh publikasi komoditas pala dan cengkeh Sitaro 2025/2026, data lengkap dan penjelasan petugas sangat solutif.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.86,
    kata_kunci_terdeteksi: [
      'publikasi',
      'data',
      'lengkap',
      'petugas',
      'solutif'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-008',
    tanggal: '2026-02-04',
    nama_pengunjung: 'Ibu Marlina Bawotong',
    instansi_asal: 'Warga Kampung Buhias (Siau Timur)',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Pelayanan ramah sekali, pertama kali datang ke BPS langsung dibantu petugas meja resepsionis mencari data kependudukan kecamatan.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.87,
    kata_kunci_terdeteksi: ['ramah', 'petugas', 'meja', 'data'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-02-02',
    tanggal: '2026-02-02',
    nama_pengunjung: 'Ferry Tatambihe, M.Si',
    instansi_asal: 'Bapenda Kab. Kepl. Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Rekonsiliasi data potensi PBB-P2 dan PAD, petugas PST sigap memberikan data tabel yang dibutuhkan. Efisien dan akurat.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.9,
    kata_kunci_terdeteksi: ['petugas', 'sigap', 'data', 'efisien', 'akurat'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-010',
    tanggal: '2026-01-29',
    nama_pengunjung: 'Kevin Bawole',
    instansi_asal: 'Mahasiswa Polstat STIS Jakarta',
    layanan_diakses: 'Si-Datu Portal Digital',
    skor_rating: 5,
    teks_saran_masukan:
      'Permintaan dataset survei sosial ekonomi berjalan lancar melalui portal Si-Datu dan konsultasi tatap muka. Sangat terbantu.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.85,
    kata_kunci_terdeteksi: ['si-datu', 'portal', 'konsultasi', 'terbantu'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-011',
    tanggal: '2026-01-27',
    nama_pengunjung: 'Dra. Hetty Tamara',
    instansi_asal: 'Dinas Pendidikan Kab. Kepl. Sitaro',
    layanan_diakses: 'Permintaan Data Mikro & Publikasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Data IPM dan rata-rata lama sekolah sangat informatif dan tepat waktu untuk evaluasi kurikulum daerah.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.84,
    kata_kunci_terdeteksi: ['data', 'informatif', 'tepat'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-012',
    tanggal: '2026-01-24',
    nama_pengunjung: 'Bapak Jance Takalamingan',
    instansi_asal: 'Warga Kelurahan Ondong (Siau Barat)',
    layanan_diakses: 'Si-Datu Portal Digital',
    skor_rating: 4,
    teks_saran_masukan:
      'Pelayanan bagus dan sopan. Cuma saat hujan sinyal internet di ruang tunggu sempat kendala saat unduh publikasi PDF di Si-Datu. Mohon perbaiki wifi tamu.',
    sentimen: 'NETRAL',
    skor_sentimen: 0.05,
    kata_kunci_terdeteksi: [
      'bagus',
      'sinyal',
      'ruang tunggu',
      'kendala',
      'si-datu',
      'perbaiki',
      'wifi'
    ],
    status_tindak_lanjut: 'DALAM_PROSES',
    catatan_tindak_lanjut:
      'Penambahan repeater wifi ruang tunggu PST sedang diajukan ke tim IT.'
  },
  {
    id: 'FB-2026-013',
    tanggal: '2026-01-22',
    nama_pengunjung: 'Novita Medellu, S.AP',
    instansi_asal: 'Bappelitbangda Kab. Kepl. Sitaro',
    layanan_diakses: 'Rekomendasi Kegiatan Statistik (ROMANTIK)',
    skor_rating: 5,
    teks_saran_masukan:
      'Proses rekomendasi statistik sektoral sangat transparan dan bermutu tinggi. Terima kasih tim BPS Sitaro.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.88,
    kata_kunci_terdeteksi: [
      'rekomendasi',
      'statistik',
      'transparan',
      'bermutu'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-014',
    tanggal: '2026-01-20',
    nama_pengunjung: 'Bapak Korneles Dalope',
    instansi_asal: 'Pemerintah Desa Makalehi (Pulau Terluar)',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Petugas sangat humanis dan sabar menjelaskan data profil desa terluar. Sangat berterima kasih pelayanannya ramah.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.9,
    kata_kunci_terdeteksi: ['petugas', 'humanis', 'sabar', 'data', 'ramah'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-015',
    tanggal: '2026-01-18',
    nama_pengunjung: 'dr. Samuel Derek',
    instansi_asal: 'Dinas Sosial Kab. Kepl. Sitaro',
    layanan_diakses: 'Permintaan Data Mikro & Publikasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Permintaan data DTKS dan kemiskinan ekstrem dilayani dengan sangat cepat dan akurat. Nol rupiah tanpa dipungut biaya apapun.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.96,
    kata_kunci_terdeteksi: [
      'data',
      'cepat',
      'akurat',
      'nol rupiah',
      'bebas pungli'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-016',
    tanggal: '2026-01-15',
    nama_pengunjung: 'Ibu Yolanda Salindeho',
    instansi_asal: 'Warga Pulau Tagulandang',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 4,
    teks_saran_masukan:
      'Pelayanan petugas ramah dan cepat, tetapi ruang tunggu PST agak sempit jika ada rombongan dinas datang bersamaan.',
    sentimen: 'NETRAL',
    skor_sentimen: 0.12,
    kata_kunci_terdeteksi: [
      'petugas',
      'ramah',
      'cepat',
      'ruang tunggu',
      'sempit'
    ],
    status_tindak_lanjut: 'DITELAAH',
    catatan_tindak_lanjut:
      'Tata ulang layout kursi pengunjung meja PST untuk kapasitas optimal.'
  },
  {
    id: 'FB-2026-017',
    tanggal: '2026-01-13',
    nama_pengunjung: 'Ir. Ever Manoppo',
    instansi_asal: 'BKPSDM Kab. Kepl. Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Konsultasi integrasi data ASN dan indikator kinerja dilayani secara profesional dan tepat sasaran.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.86,
    kata_kunci_terdeteksi: ['konsultasi', 'data', 'profesional', 'tepat'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-018',
    tanggal: '2026-01-11',
    nama_pengunjung: 'Randi Makasenda',
    instansi_asal: 'Jurnalis Media Online Kepulauan',
    layanan_diakses: 'Permintaan Data Mikro & Publikasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Informasi angka inflasi dan pertumbuhan ekonomi sangat cepat rilisnya dan mudah dipahami pers. Petugas responsif via WhatsApp dan tatap muka.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.91,
    kata_kunci_terdeteksi: ['cepat', 'mudah', 'petugas', 'responsif'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-019',
    tanggal: '2026-01-09',
    nama_pengunjung: 'Maikel Lahinda, ST',
    instansi_asal: 'Dinas Perhubungan Kab. Kepl. Sitaro',
    layanan_diakses: 'Permintaan Data Mikro & Publikasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Data transportasi penyeberangan laut pulau Siau-Tagulandang lengkap dan akurat. Petugas sigap dan informatif.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.9,
    kata_kunci_terdeteksi: [
      'data',
      'lengkap',
      'akurat',
      'petugas',
      'sigap',
      'informatif'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-020',
    tanggal: '2026-01-08',
    nama_pengunjung: 'Hengky Takahindenang',
    instansi_asal: 'Dinas Perikanan Kab. Kepl. Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Data statistik produksi tangkapan nelayan per pulau sangat lengkap. Sangat memuaskan.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.89,
    kata_kunci_terdeteksi: ['data', 'statistik', 'lengkap', 'memuaskan'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-021',
    tanggal: '2026-01-07',
    nama_pengunjung: 'Grace Kalangit',
    instansi_asal: 'LSM Pemerhati Lingkungan Siau',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 3,
    teks_saran_masukan:
      'Pelayanan konsultasi data emisi dan kawasan hutan ramah, hanya saja waktu tunggu sempat agak lama karena antri petugas sedang koordinasi pimpinan.',
    sentimen: 'NETRAL',
    skor_sentimen: -0.05,
    kata_kunci_terdeteksi: [
      'konsultasi',
      'data',
      'ramah',
      'waktu tunggu',
      'lama',
      'antri',
      'petugas'
    ],
    status_tindak_lanjut: 'EVALUASI_BERKALA',
    catatan_tindak_lanjut:
      'Menetapkan jadwal piket petugas pengganti saat ada rapat koordinasi pimpinan.'
  },
  {
    id: 'FB-2026-022',
    tanggal: '2026-01-06',
    nama_pengunjung: 'Drs. Ronald Jacobus',
    instansi_asal: 'Disdukcapil Kab. Kepl. Sitaro',
    layanan_diakses: 'Metadata Statistik Sektoral',
    skor_rating: 5,
    teks_saran_masukan:
      'Sinkronisasi data proyeksi penduduk berjalan lancar, pelayanan sangat terbuka dan transparan.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.87,
    kata_kunci_terdeteksi: ['data', 'terbuka', 'transparan'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-023',
    tanggal: '2026-01-05',
    nama_pengunjung: 'Ibu Silvana Manalu',
    instansi_asal: 'Pelaku UMKM Olahan Pala Siau Barat Daya',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Butuh data sensus ekonomi untuk peluang usaha olahan pala, petugas mengarahkan dengan bahasa yang mudah dimengerti. Nol rupiah dan bebas pungli.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.94,
    kata_kunci_terdeteksi: [
      'data',
      'petugas',
      'mudah',
      'nol rupiah',
      'bebas pungli'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-024',
    tanggal: '2026-01-05',
    nama_pengunjung: 'Ibu Nontje Paparang, S.Pd',
    instansi_asal: 'Guru SMKN 1 Siau Timur',
    layanan_diakses: 'Pojok Statistik & Edukasi Literasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Mengajak siswa untuk belajar literasi statistik di pojok statistik, ruangannya nyaman, petugas ramah membimbing anak-anak dengan sabar.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.93,
    kata_kunci_terdeteksi: [
      'statistik',
      'ruangan',
      'nyaman',
      'petugas',
      'ramah',
      'sabar'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-025',
    tanggal: '2026-01-04',
    nama_pengunjung: 'Aldo Pontoh',
    instansi_asal: 'Mahasiswa Universitas De La Salle Manado',
    layanan_diakses: 'Si-Datu Portal Digital',
    skor_rating: 4,
    teks_saran_masukan:
      'Akses unduh data di website kadang agak lambat saat jaringan pulau tidak stabil, namun petugas PST sigap memberikan softcopy via flashdisk.',
    sentimen: 'NETRAL',
    skor_sentimen: 0.15,
    kata_kunci_terdeteksi: [
      'data',
      'website',
      'lambat',
      'jaringan',
      'petugas',
      'sigap'
    ],
    status_tindak_lanjut: 'DALAM_PROSES',
    catatan_tindak_lanjut:
      'Peningkatan kompresi berkas publikasi PDF di CDN website BPS Sitaro.'
  },
  {
    id: 'FB-2026-026',
    tanggal: '2026-01-04',
    nama_pengunjung: 'Bapak Fransiskus Bawole',
    instansi_asal: 'Warga Pulau Biaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Datang jauh dari pulau Biaro untuk data potensi kepulauan, sangat dihargai dan dilayani cepat tanpa harus antri lama. Terima kasih BPS Sitaro!',
    sentimen: 'POSITIF',
    skor_sentimen: 0.88,
    kata_kunci_terdeteksi: ['data', 'cepat', 'bebas antri', 'ramah'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-027',
    tanggal: '2026-01-03',
    nama_pengunjung: 'Meidy Sasela, S.Si',
    instansi_asal: 'Dinas Lingkungan Hidup Kab. Kepl. Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Pelayanan konsultasi IKLH sangat detail dan akurat. Petugas berpengetahuan luas dan sangat solutif.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.89,
    kata_kunci_terdeteksi: ['konsultasi', 'akurat', 'petugas', 'solutif'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-028',
    tanggal: '2026-01-03',
    nama_pengunjung: 'Bapak Alfrets Salindeho',
    instansi_asal: 'BPBD Kab. Kepl. Sitaro (Bencana Gunung Karangetang)',
    layanan_diakses: 'Permintaan Data Mikro & Publikasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Data kawasan rawan bencana Gunung Karangetang sangat akurat dan presisi untuk mitigasi bencana. Respon petugas cepat sekali.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.93,
    kata_kunci_terdeteksi: [
      'data',
      'akurat',
      'presisi',
      'petugas',
      'cepat',
      'responsif'
    ],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-029',
    tanggal: '2026-01-02',
    nama_pengunjung: 'Devi Kansil, SH',
    instansi_asal: 'Kantor Pertanahan (ATR/BPN) Sitaro',
    layanan_diakses: 'Konsultasi Statistik Langsung',
    skor_rating: 5,
    teks_saran_masukan:
      'Kolaborasi data spasial dan tutupan lahan, pelayanan transparan dan profesional.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.87,
    kata_kunci_terdeteksi: ['data', 'transparan', 'profesional'],
    status_tindak_lanjut: 'SELESAI'
  },
  {
    id: 'FB-2026-030',
    tanggal: '2026-01-02',
    nama_pengunjung: 'Rivaldo Takahindenang',
    instansi_asal: 'Pencari Kerja / Pelamar Mitra Statistik 2026',
    layanan_diakses: 'Pojok Statistik & Edukasi Literasi',
    skor_rating: 5,
    teks_saran_masukan:
      'Informasi lowongan mitra statistik dan data daerah sangat jelas dipajang di resepsionis. Petugas ramah dan santun.',
    sentimen: 'POSITIF',
    skor_sentimen: 0.89,
    kata_kunci_terdeteksi: ['data', 'jelas', 'petugas', 'ramah', 'santun'],
    status_tindak_lanjut: 'SELESAI'
  }
];
