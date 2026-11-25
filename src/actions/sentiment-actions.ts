/* eslint-disable no-console */
'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import {
  type FeedbackKonsumen,
  type SentimentSummaryData,
  type TindakLanjutStatus,
  DEFAULT_MOCK_FEEDBACK,
  analyzeFeedbackSentiment,
  calculateSentimentSummary
} from '@/lib/sentiment/sentiment-types';

// In-memory cache fallback saat tabel remote belum dimigrasikan
let inMemoryFeedbackList: FeedbackKonsumen[] = [...DEFAULT_MOCK_FEEDBACK];

/**
 * Server Action: Mengambil data analitik sentimen kepuasan konsumen,
 * kalkulasi metrik distribusi, Net Promoter Score (NPS), word cloud kata kunci,
 * dan daftar ulasan terfilter.
 */
export async function getSentimentAnalyticsAction(filter?: {
  tahun?: number;
  layanan?: string;
  sentimen?: string;
  search?: string;
}): Promise<{
  success: boolean;
  data: SentimentSummaryData;
  error?: string;
}> {
  try {
    let currentList: FeedbackKonsumen[] = [];

    // Coba ambil dari Supabase jika ada tabel 'feedback_konsumen'
    try {
      const supabase = await createClient();
      let query = supabase
        .from('feedback_konsumen')
        .select('*')
        .order('tanggal', { ascending: false });

      if (filter?.layanan && filter.layanan !== 'Semua Layanan PST') {
        query = query.eq('layanan_diakses', filter.layanan);
      }
      if (filter?.sentimen && filter.sentimen !== 'SEMUA') {
        query = query.eq('sentimen', filter.sentimen);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        currentList = data.map((item: any) => ({
          id: item.id,
          tanggal: item.tanggal,
          nama_pengunjung: item.nama_pengunjung,
          instansi_asal: item.instansi_asal,
          layanan_diakses: item.layanan_diakses,
          skor_rating: Number(item.skor_rating),
          teks_saran_masukan: item.teks_saran_masukan,
          sentimen: item.sentimen,
          skor_sentimen: Number(item.skor_sentimen),
          kata_kunci_terdeteksi: Array.isArray(item.kata_kunci_terdeteksi)
            ? item.kata_kunci_terdeteksi
            : typeof item.kata_kunci_terdeteksi === 'string'
              ? JSON.parse(item.kata_kunci_terdeteksi)
              : [],
          status_tindak_lanjut: item.status_tindak_lanjut || 'SELESAI',
          catatan_tindak_lanjut: item.catatan_tindak_lanjut
        }));
      }
    } catch (dbErr) {
      // Fallback ke in-memory jika tabel remote belum aktif
    }

    // Jika Supabase kosong/belum ada tabel, pakai in-memory list
    if (currentList.length === 0) {
      currentList = [...inMemoryFeedbackList];
    }

    // Terapkan filter di memori
    let filtered = [...currentList];

    if (filter?.layanan && filter.layanan !== 'Semua Layanan PST') {
      filtered = filtered.filter((f) => f.layanan_diakses === filter.layanan);
    }
    if (filter?.sentimen && filter.sentimen !== 'SEMUA') {
      filtered = filtered.filter((f) => f.sentimen === filter.sentimen);
    }
    if (filter?.search && filter.search.trim() !== '') {
      const q = filter.search.toLowerCase().trim();
      filtered = filtered.filter(
        (f) =>
          f.nama_pengunjung.toLowerCase().includes(q) ||
          f.instansi_asal.toLowerCase().includes(q) ||
          f.teks_saran_masukan.toLowerCase().includes(q) ||
          f.kata_kunci_terdeteksi.some((k) => k.toLowerCase().includes(q))
      );
    }

    const summary = calculateSentimentSummary(filtered);

    return {
      success: true,
      data: summary
    };
  } catch (err: any) {
    console.error('Error getSentimentAnalyticsAction:', err);
    return {
      success: true,
      data: calculateSentimentSummary(inMemoryFeedbackList),
      error: err?.message || 'Gagal memuat analitik sentimen'
    };
  }
}

/**
 * Server Action: Menyimpan feedback baru dari pengunjung PST,
 * menghitung skor sentimen dan kata kunci secara otomatis menggunakan engine sentimen.
 */
export async function submitFeedbackKonsumenAction(input: {
  nama_pengunjung: string;
  instansi_asal: string;
  layanan_diakses: string;
  skor_rating: number;
  teks_saran_masukan: string;
  status_tindak_lanjut?: TindakLanjutStatus;
}): Promise<{
  success: boolean;
  data?: FeedbackKonsumen;
  error?: string;
}> {
  try {
    const analysis = analyzeFeedbackSentiment(
      input.teks_saran_masukan,
      input.skor_rating
    );

    const today = new Date().toISOString().split('T')[0];
    const newFeedback: FeedbackKonsumen = {
      id: `FB-${Date.now().toString().slice(-6)}`,
      tanggal: today,
      nama_pengunjung: input.nama_pengunjung.trim() || 'Pengunjung PST BPS',
      instansi_asal: input.instansi_asal.trim() || 'Masyarakat Umum',
      layanan_diakses: input.layanan_diakses || 'Konsultasi Statistik Langsung',
      skor_rating: Number(input.skor_rating) || 5,
      teks_saran_masukan: input.teks_saran_masukan.trim(),
      sentimen: analysis.sentimen,
      skor_sentimen: analysis.skor_sentimen,
      kata_kunci_terdeteksi: analysis.kata_kunci_terdeteksi,
      status_tindak_lanjut:
        input.status_tindak_lanjut ||
        (analysis.sentimen === 'NEGATIF' || analysis.sentimen === 'NETRAL'
          ? 'DALAM_PROSES'
          : 'SELESAI'),
      catatan_tindak_lanjut:
        analysis.sentimen === 'NEGATIF' || analysis.sentimen === 'NETRAL'
          ? 'Perlu telaah perbaikan fasilitas/layanan oleh penanggung jawab PST.'
          : 'Ulasan sangat memuaskan, bukti pemenuhan Reformasi Birokrasi.'
    };

    // Coba simpan ke Supabase
    try {
      const supabase = await createClient();
      await supabase.from('feedback_konsumen').insert([
        {
          id: newFeedback.id,
          tanggal: newFeedback.tanggal,
          nama_pengunjung: newFeedback.nama_pengunjung,
          instansi_asal: newFeedback.instansi_asal,
          layanan_diakses: newFeedback.layanan_diakses,
          skor_rating: newFeedback.skor_rating,
          teks_saran_masukan: newFeedback.teks_saran_masukan,
          sentimen: newFeedback.sentimen,
          skor_sentimen: newFeedback.skor_sentimen,
          kata_kunci_terdeteksi: newFeedback.kata_kunci_terdeteksi,
          status_tindak_lanjut: newFeedback.status_tindak_lanjut,
          catatan_tindak_lanjut: newFeedback.catatan_tindak_lanjut
        }
      ]);
    } catch (dbErr) {
      // Abaikan jika Supabase belum siap
    }

    // Simpan ke in-memory list paling depan
    inMemoryFeedbackList.unshift(newFeedback);

    revalidatePath('/rebo/sentiment');
    revalidatePath('/rebo/monitoring');

    return {
      success: true,
      data: newFeedback
    };
  } catch (err: any) {
    console.error('Error submitFeedbackKonsumenAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan feedback pengunjung'
    };
  }
}

/**
 * Server Action: Memperbarui status tindak lanjut evaluasi ulasan pengunjung (bukti RB)
 */
export async function updateTindakLanjutAction(
  id: string,
  status: TindakLanjutStatus,
  catatan?: string
): Promise<{
  success: boolean;
  data?: FeedbackKonsumen;
  error?: string;
}> {
  try {
    const item = inMemoryFeedbackList.find((f) => f.id === id);
    if (item) {
      item.status_tindak_lanjut = status;
      if (catatan) item.catatan_tindak_lanjut = catatan;
    }

    try {
      const supabase = await createClient();
      await supabase
        .from('feedback_konsumen')
        .update({
          status_tindak_lanjut: status,
          catatan_tindak_lanjut: catatan
        })
        .eq('id', id);
    } catch (dbErr) {
      // Abaikan jika Supabase offline
    }

    revalidatePath('/rebo/sentiment');
    return { success: true, data: item };
  } catch (err: any) {
    console.error('Error updateTindakLanjutAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal memperbarui status tindak lanjut'
    };
  }
}
