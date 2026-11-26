'use client';

import React, { useState, useMemo, useTransition } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Smile,
  Meh,
  Frown,
  Star,
  Printer,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  QrCode,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
  RotateCcw,
  Tag,
  Building2,
  X,
  Award
} from 'lucide-react';
import { toast } from 'sonner';

import {
  type SentimentSummaryData,
  type TindakLanjutStatus,
  DAFTAR_LAYANAN_PST,
  analyzeFeedbackSentiment
} from '@/lib/sentiment/sentiment-types';
import {
  submitFeedbackKonsumenAction,
  updateTindakLanjutAction
} from '@/actions/sentiment-actions';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface SentimentWordCloudClientProps {
  initialData: SentimentSummaryData;
}

export default function SentimentWordCloudClient({
  initialData
}: SentimentWordCloudClientProps) {
  const [data, setData] = useState<SentimentSummaryData>(initialData);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [selectedLayanan, setSelectedLayanan] =
    useState<string>('Semua Layanan PST');
  const [selectedSentimentFilter, setSelectedSentimentFilter] =
    useState<string>('SEMUA');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog State Form Feedback Baru
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [newNama, setNewNama] = useState<string>('');
  const [newInstansi, setNewInstansi] = useState<string>('');
  const [newLayanan, setNewLayanan] = useState<string>(
    'Konsultasi Statistik Langsung'
  );
  const [newRating, setNewRating] = useState<number>(5);
  const [newSaran, setNewSaran] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // Realtime sentiment preview saat mengetik di form modal
  const liveAnalysis = useMemo(() => {
    if (!newSaran.trim()) return null;
    return analyzeFeedbackSentiment(newSaran, newRating);
  }, [newSaran, newRating]);

  // Filter kata kunci pada word cloud berdasar kategori yang dipilih
  const filteredWordCloud = useMemo(() => {
    let list = data.word_cloud_list;
    if (selectedCategory !== 'Semua') {
      list = list.filter((item) => item.category === selectedCategory);
    }
    return list;
  }, [data.word_cloud_list, selectedCategory]);

  // Max value untuk proporsi ukuran kata di word cloud
  const maxWordFrequency = useMemo(() => {
    if (data.word_cloud_list.length === 0) return 1;
    return Math.max(...data.word_cloud_list.map((w) => w.value));
  }, [data.word_cloud_list]);

  // Filter feedback list
  const filteredFeedbacks = useMemo(() => {
    return data.feedback_list.filter((fb) => {
      // Filter kata kunci aktif dari klik word cloud
      if (
        selectedWord &&
        !fb.kata_kunci_terdeteksi.some(
          (k) => k.toLowerCase() === selectedWord.toLowerCase()
        ) &&
        !fb.teks_saran_masukan
          .toLowerCase()
          .includes(selectedWord.toLowerCase())
      ) {
        return false;
      }

      // Filter layanan
      if (
        selectedLayanan !== 'Semua Layanan PST' &&
        fb.layanan_diakses !== selectedLayanan
      ) {
        return false;
      }

      // Filter sentimen
      if (
        selectedSentimentFilter !== 'SEMUA' &&
        fb.sentimen !== selectedSentimentFilter
      ) {
        return false;
      }

      // Filter text query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        const matchName = fb.nama_pengunjung.toLowerCase().includes(q);
        const matchInstansi = fb.instansi_asal.toLowerCase().includes(q);
        const matchText = fb.teks_saran_masukan.toLowerCase().includes(q);
        const matchKeywords = fb.kata_kunci_terdeteksi.some((k) =>
          k.toLowerCase().includes(q)
        );
        if (!matchName && !matchInstansi && !matchText && !matchKeywords) {
          return false;
        }
      }

      return true;
    });
  }, [
    data.feedback_list,
    selectedWord,
    selectedLayanan,
    selectedSentimentFilter,
    searchQuery
  ]);

  // Helper untuk menentukan ukuran font kata di word cloud
  const getWordCloudFontSize = (value: number) => {
    const ratio = value / (maxWordFrequency || 1);
    if (ratio >= 0.8)
      return 'text-2xl sm:text-3xl font-extrabold tracking-tight';
    if (ratio >= 0.6) return 'text-xl sm:text-2xl font-bold';
    if (ratio >= 0.4) return 'text-lg sm:text-xl font-semibold';
    if (ratio >= 0.25) return 'text-base sm:text-lg font-medium';
    return 'text-xs sm:text-sm font-normal';
  };

  // Helper warna badge sentimen
  const getWordCloudColor = (
    sentiment: 'positif' | 'netral' | 'negatif',
    isSelected: boolean
  ) => {
    if (isSelected) {
      return 'bg-blue-600 text-white border-blue-600 shadow-md ring-2 ring-blue-300 dark:ring-blue-700';
    }
    switch (sentiment) {
      case 'positif':
        return 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100 hover:border-emerald-400 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-700/60 dark:hover:bg-emerald-900/50';
      case 'netral':
        return 'bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100 hover:border-sky-400 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-700/60 dark:hover:bg-sky-900/50';
      case 'negatif':
        return 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100 hover:border-amber-400 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-700/60 dark:hover:bg-amber-900/50';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  // Submit Feedback Baru
  const handleAddNewFeedback = () => {
    if (!newSaran.trim()) {
      toast.error('Mohon isi saran / ulasan pengunjung');
      return;
    }

    startTransition(async () => {
      const res = await submitFeedbackKonsumenAction({
        nama_pengunjung: newNama,
        instansi_asal: newInstansi,
        layanan_diakses: newLayanan,
        skor_rating: newRating,
        teks_saran_masukan: newSaran
      });

      if (res.success && res.data) {
        toast.success(
          `Ulasan berhasil disimpan! Sentimen: ${res.data.sentimen} (Skor: ${res.data.skor_sentimen})`
        );
        // Refresh local state list
        const updatedList = [res.data, ...data.feedback_list];
        // Import kalkulasi manual lokal dari fungsi yang ada
        const { calculateSentimentSummary } = await import(
          '@/lib/sentiment/sentiment-types'
        );
        setData(calculateSentimentSummary(updatedList));

        // Reset form
        setNewNama('');
        setNewInstansi('');
        setNewSaran('');
        setNewRating(5);
        setIsDialogOpen(false);
      } else {
        toast.error(res.error || 'Gagal menyimpan ulasan');
      }
    });
  };

  // Update Status Tindak Lanjut
  const handleUpdateStatus = (
    id: string,
    currentStatus: TindakLanjutStatus
  ) => {
    const nextStatusMap: Record<TindakLanjutStatus, TindakLanjutStatus> = {
      DALAM_PROSES: 'SELESAI',
      DITELAAH: 'DALAM_PROSES',
      EVALUASI_BERKALA: 'DALAM_PROSES',
      SELESAI: 'EVALUASI_BERKALA'
    };
    const nextStatus = nextStatusMap[currentStatus];

    startTransition(async () => {
      const res = await updateTindakLanjutAction(id, nextStatus);
      if (res.success) {
        toast.success(`Status ulasan ${id} diubah ke ${nextStatus}`);
        const updatedList = data.feedback_list.map((item) =>
          item.id === id ? { ...item, status_tindak_lanjut: nextStatus } : item
        );
        setData((prev) => ({ ...prev, feedback_list: updatedList }));
      } else {
        toast.error('Gagal memperbarui status');
      }
    });
  };

  // Trigger Print Laporan
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='relative space-y-6 pb-16'>
      {/* =========================================================================
          1. HEADER BANNER EKSEKUTIF DENGAN BRANDING RESMI BPS SITARO
          ========================================================================= */}
      <div className='no-print relative overflow-hidden rounded-2xl border border-blue-900/20 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-xl dark:border-blue-800/40'>
        <div className='absolute -top-12 -right-12 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl' />
        <div className='absolute -bottom-10 -left-10 h-52 w-52 rounded-full bg-amber-500/10 blur-2xl' />

        <div className='relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className='border-amber-400/40 bg-amber-500/20 text-xs font-semibold text-amber-300'>
                <Sparkles className='mr-1.5 h-3.5 w-3.5 text-amber-300' />
                Reformasi Birokrasi - Pilar 6: Peningkatan Kualitas Pelayanan
                Publik
              </Badge>
              <Badge className='border-blue-300/30 bg-blue-500/20 text-xs font-medium text-blue-200'>
                <Building2 className='mr-1.5 h-3.5 w-3.5' />
                PST BPS Kabupaten Kepulauan Sitaro
              </Badge>
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-white sm:text-3xl'>
              Analisis Sentimen & Word Cloud Kepuasan Konsumen
            </h1>
            <p className='max-w-3xl text-sm leading-relaxed text-blue-100/90'>
              Visualisasi kata kunci (word cloud) dan pemetaan sentimen
              positif/netral/masukan pengunjung Pelayanan Statistik Terpadu
              (PST) berdasarkan ulasan riil tahun 2026. Bahan evaluasi berkala
              pimpinan dan bukti dukung Zona Integritas (WBK/WBBM).
            </p>
          </div>

          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size='sm'
              className='bg-emerald-600 text-xs font-semibold text-white shadow-md hover:bg-emerald-500'
            >
              <Plus className='mr-1.5 h-3.5 w-3.5' />
              Tambah Ulasan Konsumen
            </Button>
            <Button
              onClick={handlePrint}
              size='sm'
              variant='outline'
              className='border-blue-300/40 bg-white/10 text-xs font-medium text-white hover:bg-white/20'
            >
              <Printer className='mr-1.5 h-3.5 w-3.5 text-blue-200' />
              Cetak Laporan Eksekutif
            </Button>
            <Link href='/rebo/pst-qrcode'>
              <Button
                variant='outline'
                size='sm'
                className='border-blue-300/40 bg-white/10 text-xs font-medium text-white hover:bg-white/20'
              >
                <QrCode className='mr-1.5 h-3.5 w-3.5 text-amber-300' />
                QR Meja PST
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. KARTU METRIK EKSEKUTIF (KPI SENTIMEN & NPS)
          ========================================================================= */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Card 1: Kepuasan Positif */}
        <Card className='relative overflow-hidden border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 p-5 shadow-xs dark:border-emerald-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs font-semibold tracking-wider text-emerald-800 uppercase dark:text-emerald-300'>
                Sentimen Positif
              </p>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-black text-emerald-700 dark:text-emerald-400'>
                  {data.persentase_positif}%
                </span>
                <span className='text-xs font-medium text-slate-500'>
                  (
                  {
                    data.feedback_list.filter((f) => f.sentimen === 'POSITIF')
                      .length
                  }{' '}
                  ulasan)
                </span>
              </div>
            </div>
            <div className='rounded-xl bg-emerald-100 p-2.5 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'>
              <Smile className='h-6 w-6' />
            </div>
          </div>
          <div className='mt-3 space-y-1.5'>
            <Progress
              value={data.persentase_positif}
              className='h-2 bg-emerald-100 dark:bg-emerald-950 [&>div]:bg-emerald-500'
            />
            <div className='flex justify-between text-[11px] text-slate-500'>
              <span>Netral: {data.persentase_netral}%</span>
              <span>Masukan: {data.persentase_negatif}%</span>
            </div>
          </div>
        </Card>

        {/* Card 2: Net Promoter Score (NPS) */}
        <Card className='relative overflow-hidden border-blue-200/80 bg-gradient-to-br from-blue-50/60 via-white to-blue-50/30 p-5 shadow-xs dark:border-blue-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs font-semibold tracking-wider text-blue-800 uppercase dark:text-blue-300'>
                Net Promoter Score (NPS)
              </p>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-black text-blue-700 dark:text-blue-400'>
                  +{data.nps_score}
                </span>
                <Badge className='border-amber-400/50 bg-amber-100 text-[10px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'>
                  <Award className='mr-1 h-3 w-3 text-amber-600 dark:text-amber-400' />
                  {data.nps_category}
                </Badge>
              </div>
            </div>
            <div className='rounded-xl bg-blue-100 p-2.5 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
              <TrendingUp className='h-6 w-6' />
            </div>
          </div>
          <p className='mt-3 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400'>
            Formula: % Promoter (
            {((data.promoter_count / data.total_responden) * 100).toFixed(0)}%)
            - % Detractor (
            {((data.detractor_count / data.total_responden) * 100).toFixed(0)}
            %). Skor &gt; 70 tergolong World Class.
          </p>
        </Card>

        {/* Card 3: Rata-Rata Rating Bintang */}
        <Card className='relative overflow-hidden border-amber-200/80 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 p-5 shadow-xs dark:border-amber-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-amber-950/20'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs font-semibold tracking-wider text-amber-800 uppercase dark:text-amber-300'>
                Rata-rata Rating Bintang
              </p>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-black text-amber-600 dark:text-amber-400'>
                  {data.rata_rata_rating}
                </span>
                <div className='flex items-center text-amber-500'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3.5 w-3.5 ${
                        i < Math.round(data.rata_rata_rating)
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-slate-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className='rounded-xl bg-amber-100 p-2.5 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'>
              <Star className='h-6 w-6 fill-amber-500 text-amber-500' />
            </div>
          </div>
          <p className='mt-3 text-[11px] text-slate-600 dark:text-slate-400'>
            Dari total {data.total_responden} responden terverifikasi semester
            berjalan 2026.
          </p>
        </Card>

        {/* Card 4: Transparansi & Nol Rupiah */}
        <Card className='relative overflow-hidden border-indigo-200/80 bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/30 p-5 shadow-xs dark:border-indigo-900/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/20'>
          <div className='flex items-start justify-between'>
            <div className='space-y-1'>
              <p className='text-xs font-semibold tracking-wider text-indigo-800 uppercase dark:text-indigo-300'>
                Indeks Bebas Pungli & Biaya
              </p>
              <div className='flex items-baseline gap-2'>
                <span className='text-3xl font-black text-indigo-700 dark:text-indigo-400'>
                  100%
                </span>
                <Badge className='bg-indigo-100 text-[10px] font-bold text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300'>
                  Nol Rupiah (Gratis)
                </Badge>
              </div>
            </div>
            <div className='rounded-xl bg-indigo-100 p-2.5 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'>
              <ShieldCheck className='h-6 w-6' />
            </div>
          </div>
          <p className='mt-3 text-[11px] text-slate-600 dark:text-slate-400'>
            Seluruh layanan PST BPS Sitaro bebas biaya, transparan, dan tidak
            ada temuan gratifikasi.
          </p>
        </Card>
      </div>

      {/* =========================================================================
          3. VISUALISASI WORD CLOUD INTERAKTIF (TAG CLOUD KATA KUNCI)
          ========================================================================= */}
      <Card className='no-print overflow-hidden border-slate-200 shadow-sm dark:border-slate-800'>
        <CardHeader className='border-b border-slate-100 bg-slate-50/70 p-5 dark:border-slate-800 dark:bg-slate-900/50'>
          <div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-lg font-bold text-slate-900 dark:text-slate-100'>
                  Word Cloud Analisis Suara Konsumen
                </CardTitle>
                <Badge variant='outline' className='text-xs font-medium'>
                  {filteredWordCloud.length} Kata Kunci Terdeteksi
                </Badge>
              </div>
              <CardDescription className='text-xs'>
                Ukuran kata proporsional terhadap frekuensi kemunculan dalam
                ulasan. Klik salah satu kata untuk memfilter testimoni
                pengunjung terkait secara langsung.
              </CardDescription>
            </div>

            {/* Filter Kategori Kata */}
            <div className='flex flex-wrap items-center gap-1.5'>
              {[
                'Semua',
                'Petugas',
                'Kecepatan',
                'Akurasi Data',
                'Inovasi Digital',
                'Fasilitas'
              ].map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-7 px-2.5 text-xs font-medium ${
                    selectedCategory === cat
                      ? 'bg-blue-700 text-white hover:bg-blue-800'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>
          </div>

          {/* Indikator Filter Kata Kunci Aktif */}
          {selectedWord && (
            <div className='mt-3 flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50/80 px-3.5 py-2 text-xs font-medium text-blue-900 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200'>
              <div className='flex items-center gap-2'>
                <Tag className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                <span>
                  Memfilter testimoni dengan kata kunci:{' '}
                  <strong>&quot;{selectedWord}&quot;</strong> (
                  {filteredFeedbacks.length} ulasan ditemukan)
                </span>
              </div>
              <Button
                variant='ghost'
                size='sm'
                onClick={() => setSelectedWord(null)}
                className='h-6 px-2 text-xs text-blue-700 hover:bg-blue-100 dark:text-blue-300 dark:hover:bg-blue-900'
              >
                <X className='mr-1 h-3 w-3' />
                Hapus Filter Kata
              </Button>
            </div>
          )}
        </CardHeader>

        <CardContent className='p-6'>
          {/* Word Cloud Container */}
          <div className='flex min-h-[220px] flex-wrap items-center justify-center gap-2.5 rounded-xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50/50 via-white to-blue-50/30 p-6 text-center dark:border-slate-800 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950'>
            {filteredWordCloud.map((item) => {
              const isSelected =
                selectedWord?.toLowerCase() === item.text.toLowerCase();
              return (
                <button
                  key={item.text}
                  onClick={() => setSelectedWord(isSelected ? null : item.text)}
                  title={`Kata: ${item.text} | Kategori: ${item.category} | Frekuensi: ${item.value}x | Sentimen: ${item.sentiment}`}
                  className={`group relative inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 transition-all duration-200 hover:scale-105 active:scale-95 ${getWordCloudFontSize(
                    item.value
                  )} ${getWordCloudColor(item.sentiment, isSelected)}`}
                >
                  <span className='capitalize'>{item.text}</span>
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                      isSelected
                        ? 'bg-blue-800 text-white'
                        : item.sentiment === 'positif'
                          ? 'bg-emerald-200/70 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-200'
                          : item.sentiment === 'negatif'
                            ? 'bg-amber-200/70 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-sky-200/70 text-sky-900 dark:bg-sky-900 dark:text-sky-200'
                    }`}
                  >
                    {item.value}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Legenda Warna Sentimen */}
          <div className='mt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-600 dark:text-slate-400'>
            <div className='flex items-center gap-1.5'>
              <span className='h-3 w-3 rounded-full bg-emerald-500' />
              <span>Sentimen Positif (Pujian / Keunggulan)</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='h-3 w-3 rounded-full bg-sky-500' />
              <span>Sentimen Netral (Konteks Layanan)</span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='h-3 w-3 rounded-full bg-amber-500' />
              <span>Area Perbaikan / Saran Konstruktif</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* =========================================================================
          4. DISTRIBUSI RATING, SENTIMEN & KATEGORI
          ========================================================================= */}
      <div className='no-print grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Kolom 1: Distribusi Rating Bintang */}
        <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
          <CardHeader className='p-4 pb-2'>
            <CardTitle className='text-sm font-bold text-slate-800 dark:text-slate-200'>
              Distribusi Rating Konsumen
            </CardTitle>
            <CardDescription className='text-xs'>
              Komposisi penilaian skor 1 s.d. 5 bintang
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2.5 p-4 pt-1'>
            {data.rating_distribution.map((item) => (
              <div key={item.rating} className='space-y-1'>
                <div className='flex items-center justify-between text-xs font-medium'>
                  <div className='flex items-center gap-1 text-slate-700 dark:text-slate-300'>
                    <span>{item.rating}</span>
                    <Star className='h-3 w-3 fill-amber-400 text-amber-400' />
                  </div>
                  <span className='text-slate-500'>
                    {item.count} ulasan ({item.percentage}%)
                  </span>
                </div>
                <Progress
                  value={item.percentage}
                  className={`h-2 ${
                    item.rating === 5
                      ? '[&>div]:bg-emerald-500'
                      : item.rating === 4
                        ? '[&>div]:bg-blue-500'
                        : item.rating === 3
                          ? '[&>div]:bg-amber-500'
                          : '[&>div]:bg-rose-500'
                  }`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Kolom 2: Distribusi Kategori Suara Konsumen */}
        <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
          <CardHeader className='p-4 pb-2'>
            <CardTitle className='text-sm font-bold text-slate-800 dark:text-slate-200'>
              Aspek Layanan yang Paling Sering Diulas
            </CardTitle>
            <CardDescription className='text-xs'>
              Fokus perhatian masyarakat terhadap pilar PST
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2.5 p-4 pt-1'>
            {data.category_distribution.map((cat) => (
              <div key={cat.category} className='space-y-1'>
                <div className='flex items-center justify-between text-xs font-medium'>
                  <span className='text-slate-700 dark:text-slate-300'>
                    {cat.category}
                  </span>
                  <span className='text-slate-500'>
                    {cat.count} bobot ({cat.persentase}%)
                  </span>
                </div>
                <Progress
                  value={cat.persentase}
                  className='h-2 [&>div]:bg-indigo-600'
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Kolom 3: Matriks Evaluasi per Layanan PST */}
        <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
          <CardHeader className='p-4 pb-2'>
            <CardTitle className='text-sm font-bold text-slate-800 dark:text-slate-200'>
              Kepuasan per Layanan PST
            </CardTitle>
            <CardDescription className='text-xs'>
              Tingkat kepuasan tiap unit layanan statistik
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2.5 p-4 pt-1'>
            {data.layanan_distribution.map((lay) => (
              <div
                key={lay.layanan}
                className='flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/70 p-2 text-xs dark:border-slate-800 dark:bg-slate-900/50'
              >
                <div className='space-y-0.5 truncate pr-2'>
                  <p className='truncate font-semibold text-slate-800 dark:text-slate-200'>
                    {lay.layanan}
                  </p>
                  <p className='text-[11px] text-slate-500'>
                    {lay.total} ulasan • {lay.positif_pct}% Positif
                  </p>
                </div>
                <div className='flex items-center gap-1 font-bold text-amber-600 dark:text-amber-400'>
                  <span>{lay.skor_rata_rata}</span>
                  <Star className='h-3.5 w-3.5 fill-amber-400 text-amber-400' />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* =========================================================================
          5. DAFTAR TESTIMONI & ULASAN KONSUMEN TERFILTER
          ========================================================================= */}
      <Card className='no-print border-slate-200 shadow-sm dark:border-slate-800'>
        <CardHeader className='border-b border-slate-100 p-5 dark:border-slate-800'>
          <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                  Daftar Testimoni & Ulasan Pengunjung PST
                </CardTitle>
                <Badge variant='outline' className='text-xs'>
                  Menampilkan {filteredFeedbacks.length} dari{' '}
                  {data.total_responden} Ulasan
                </Badge>
              </div>
              <CardDescription className='text-xs'>
                Transparansi masukan dan kritik masyarakat untuk pemantauan
                tindak lanjut pimpinan
              </CardDescription>
            </div>

            {/* Filter & Search Bar */}
            <div className='flex flex-wrap items-center gap-2.5'>
              {/* Search Box */}
              <div className='relative w-full sm:w-56'>
                <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400' />
                <Input
                  type='text'
                  placeholder='Cari nama, instansi, ulasan...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='h-8 pl-8 text-xs'
                />
              </div>

              {/* Filter Sentimen */}
              <select
                value={selectedSentimentFilter}
                onChange={(e) => setSelectedSentimentFilter(e.target.value)}
                className='h-8 rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'
              >
                <option value='SEMUA'>Semua Sentimen</option>
                <option value='POSITIF'>Hanya Positif</option>
                <option value='NETRAL'>Hanya Netral / Masukan</option>
                <option value='NEGATIF'>Hanya Negatif / Kendala</option>
              </select>

              {/* Filter Layanan */}
              <select
                value={selectedLayanan}
                onChange={(e) => setSelectedLayanan(e.target.value)}
                className='h-8 max-w-[200px] truncate rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'
              >
                {DAFTAR_LAYANAN_PST.map((lay) => (
                  <option key={lay} value={lay}>
                    {lay}
                  </option>
                ))}
              </select>

              {(selectedWord ||
                selectedLayanan !== 'Semua Layanan PST' ||
                selectedSentimentFilter !== 'SEMUA' ||
                searchQuery) && (
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={() => {
                    setSelectedWord(null);
                    setSelectedLayanan('Semua Layanan PST');
                    setSelectedSentimentFilter('SEMUA');
                    setSearchQuery('');
                  }}
                  className='h-8 px-2 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                >
                  <RotateCcw className='mr-1 h-3 w-3' />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className='divide-y divide-slate-100 p-0 dark:divide-slate-800'>
          {filteredFeedbacks.length === 0 ? (
            <div className='p-12 text-center'>
              <MessageSquare className='mx-auto h-10 w-10 text-slate-300 dark:text-slate-600' />
              <p className='mt-2 text-sm font-semibold text-slate-700 dark:text-slate-300'>
                Tidak ditemukan ulasan yang cocok
              </p>
              <p className='text-xs text-slate-500'>
                Coba sesuaikan kata kunci pencarian atau ubah opsi filter
                sentimen.
              </p>
            </div>
          ) : (
            filteredFeedbacks.map((fb) => (
              <div
                key={fb.id}
                className='flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-slate-50/50 sm:flex-row sm:items-start dark:hover:bg-slate-900/30'
              >
                {/* Informasi Responden & Ulasan */}
                <div className='space-y-2'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <div className='flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'>
                      {fb.nama_pengunjung.slice(0, 1)}
                    </div>
                    <span className='font-bold text-slate-900 dark:text-slate-100'>
                      {fb.nama_pengunjung}
                    </span>
                    <span className='text-xs text-slate-500'>•</span>
                    <span className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                      {fb.instansi_asal}
                    </span>
                    <Badge
                      variant='outline'
                      className='text-[10px] text-slate-500'
                    >
                      {fb.layanan_diakses}
                    </Badge>
                  </div>

                  {/* Bintang & Tanggal */}
                  <div className='flex items-center gap-2 text-xs'>
                    <div className='flex items-center text-amber-500'>
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3.5 w-3.5 ${
                            i < fb.skor_rating
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className='font-semibold text-slate-700 dark:text-slate-300'>
                      {fb.skor_rating}.0
                    </span>
                    <span className='text-slate-400'>|</span>
                    <span className='text-slate-500'>{fb.tanggal}</span>
                  </div>

                  {/* Kutipan Ulasan */}
                  <p className='text-xs leading-relaxed text-slate-700 italic sm:text-sm dark:text-slate-300'>
                    &ldquo;{fb.teks_saran_masukan}&rdquo;
                  </p>

                  {/* Kata Kunci Terdeteksi */}
                  <div className='flex flex-wrap items-center gap-1 pt-1'>
                    <span className='text-[11px] font-medium text-slate-400'>
                      Kata Kunci Terdeteksi:
                    </span>
                    {fb.kata_kunci_terdeteksi.map((k) => (
                      <Badge
                        key={k}
                        variant='secondary'
                        onClick={() => setSelectedWord(k)}
                        className='cursor-pointer text-[10px] font-medium transition-colors hover:bg-blue-100 hover:text-blue-800'
                      >
                        #{k}
                      </Badge>
                    ))}
                  </div>

                  {/* Catatan Tindak Lanjut jika ada */}
                  {fb.catatan_tindak_lanjut && (
                    <div className='rounded-md border border-slate-100 bg-slate-50/80 p-2 text-[11px] text-slate-600 dark:border-slate-800/80 dark:bg-slate-900/60 dark:text-slate-400'>
                      <strong>Tindak Lanjut RB:</strong>{' '}
                      {fb.catatan_tindak_lanjut}
                    </div>
                  )}
                </div>

                {/* Badge Sentimen & Status Tindak Lanjut */}
                <div className='flex shrink-0 flex-row items-center gap-2 sm:flex-col sm:items-end'>
                  <Badge
                    className={`text-xs font-semibold ${
                      fb.sentimen === 'POSITIF'
                        ? 'border-emerald-300 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                        : fb.sentimen === 'NEGATIF'
                          ? 'border-rose-300 bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'border-sky-300 bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300'
                    }`}
                  >
                    {fb.sentimen === 'POSITIF' && (
                      <Smile className='mr-1 h-3.5 w-3.5 text-emerald-600' />
                    )}
                    {fb.sentimen === 'NETRAL' && (
                      <Meh className='mr-1 h-3.5 w-3.5 text-sky-600' />
                    )}
                    {fb.sentimen === 'NEGATIF' && (
                      <Frown className='mr-1 h-3.5 w-3.5 text-rose-600' />
                    )}
                    {fb.sentimen} (
                    {fb.skor_sentimen > 0
                      ? `+${fb.skor_sentimen}`
                      : fb.skor_sentimen}
                    )
                  </Badge>

                  {/* Tombol Status Tindak Lanjut */}
                  <Button
                    variant='outline'
                    size='sm'
                    disabled={isPending}
                    onClick={() =>
                      handleUpdateStatus(fb.id, fb.status_tindak_lanjut)
                    }
                    title='Klik untuk mengubah status tindak lanjut berkala RB'
                    className={`h-7 px-2 text-[10px] font-semibold ${
                      fb.status_tindak_lanjut === 'SELESAI'
                        ? 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                        : fb.status_tindak_lanjut === 'DALAM_PROSES'
                          ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                          : 'border-blue-200 text-blue-700 hover:bg-blue-50'
                    }`}
                  >
                    {fb.status_tindak_lanjut === 'SELESAI' && (
                      <CheckCircle2 className='mr-1 h-3 w-3 text-emerald-500' />
                    )}
                    {fb.status_tindak_lanjut === 'DALAM_PROSES' && (
                      <Clock className='mr-1 h-3 w-3 text-amber-500' />
                    )}
                    {fb.status_tindak_lanjut === 'DITELAAH' && (
                      <AlertTriangle className='mr-1 h-3 w-3 text-blue-500' />
                    )}
                    {fb.status_tindak_lanjut.replace('_', ' ')}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* =========================================================================
          6. MODAL FORM: TAMBAH ULASAN PENGUNJUNG PST
          ========================================================================= */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold text-slate-900 dark:text-slate-100'>
              Tambah Ulasan Pengunjung PST
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Ulasan akan dianalisis secara instan oleh Sentimen Engine BPS
              Sitaro untuk klasifikasi skor dan ekstraksi kata kunci.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2'>
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Nama Pengunjung</Label>
                <Input
                  placeholder='misal: Christian Janis'
                  value={newNama}
                  onChange={(e) => setNewNama(e.target.value)}
                  className='h-8 text-xs'
                />
              </div>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Instansi Asal</Label>
                <Input
                  placeholder='misal: Bappelitbangda Sitaro'
                  value={newInstansi}
                  onChange={(e) => setNewInstansi(e.target.value)}
                  className='h-8 text-xs'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Layanan Diakses</Label>
                <select
                  value={newLayanan}
                  onChange={(e) => setNewLayanan(e.target.value)}
                  className='h-8 w-full rounded-md border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-hidden dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'
                >
                  {DAFTAR_LAYANAN_PST.filter(
                    (l) => l !== 'Semua Layanan PST'
                  ).map((lay) => (
                    <option key={lay} value={lay}>
                      {lay}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>
                  Rating Bintang (1 - 5)
                </Label>
                <div className='flex items-center gap-1.5 pt-1'>
                  {[1, 2, 3, 4, 5].map((val) => (
                    <button
                      key={val}
                      type='button'
                      onClick={() => setNewRating(val)}
                      className='transition-transform hover:scale-110'
                    >
                      <Star
                        className={`h-5 w-5 ${
                          val <= newRating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300 dark:text-slate-700'
                        }`}
                      />
                    </button>
                  ))}
                  <span className='ml-2 text-xs font-bold text-amber-600'>
                    {newRating}.0
                  </span>
                </div>
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Saran, Kritik, atau Testimoni Pengunjung
              </Label>
              <Textarea
                placeholder='Tuliskan ulasan pengunjung... (contoh: Pelayanan ramah, cepat, konsultasi data mikro akurat dan nol rupiah)'
                rows={3}
                value={newSaran}
                onChange={(e) => setNewSaran(e.target.value)}
                className='text-xs'
              />
            </div>

            {/* Live Sentiment Analysis Preview */}
            {liveAnalysis && (
              <div className='rounded-lg border border-blue-200 bg-blue-50/70 p-3 dark:border-blue-800 dark:bg-blue-950/40'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-semibold text-blue-950 dark:text-blue-200'>
                    Prediksi Engine Sentimen:
                  </span>
                  <Badge
                    className={`text-[10px] font-bold ${
                      liveAnalysis.sentimen === 'POSITIF'
                        ? 'bg-emerald-600 text-white'
                        : liveAnalysis.sentimen === 'NEGATIF'
                          ? 'bg-rose-600 text-white'
                          : 'bg-sky-600 text-white'
                    }`}
                  >
                    {liveAnalysis.sentimen} (Skor: {liveAnalysis.skor_sentimen})
                  </Badge>
                </div>
                <div className='mt-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300'>
                  <span>Kata kunci terdeteksi:</span>
                  {liveAnalysis.kata_kunci_terdeteksi.length > 0 ? (
                    liveAnalysis.kata_kunci_terdeteksi.map((k) => (
                      <Badge
                        key={k}
                        variant='secondary'
                        className='bg-white text-[10px] dark:bg-slate-900'
                      >
                        #{k}
                      </Badge>
                    ))
                  ) : (
                    <span className='text-slate-400 italic'>
                      Belum ada kata kunci khusus
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsDialogOpen(false)}
              className='text-xs'
            >
              Batal
            </Button>
            <Button
              size='sm'
              disabled={isPending || !newSaran.trim()}
              onClick={handleAddNewFeedback}
              className='bg-blue-700 text-xs font-semibold text-white hover:bg-blue-800'
            >
              Simpan Ulasan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* =========================================================================
          7. TEMPLATE CETAK RESMI A4: LAPORAN EKSEKUTIF SUARA KONSUMEN PST
          (Hanya Tampil Saat Dicetak / window.print())
          ========================================================================= */}
      <div className='hidden print:block print:space-y-6 print:p-4 print:text-black'>
        {/* Kop Surat Resmi BPS Sitaro */}
        <div className='border-b-2 border-black pb-4 text-center'>
          <p className='text-sm font-bold tracking-wider uppercase'>
            BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SITARO
          </p>
          <h2 className='text-lg font-black tracking-tight uppercase'>
            LAPORAN EKSEKUTIF ANALISIS SENTIMEN & SUARA KONSUMEN PELAYANAN
            STATISTIK TERPADU
          </h2>
          <p className='text-xs text-gray-600'>
            Bukti Dukung Reformasi Birokrasi (Pilar 6 - Peningkatan Kualitas
            Pelayanan Publik) • Periode Tahun 2026
          </p>
        </div>

        {/* Ringkasan Metrik KPI Cetak */}
        <div className='grid grid-cols-4 gap-3 text-center'>
          <div className='rounded border border-gray-400 p-2'>
            <p className='text-[10px] font-bold text-gray-600 uppercase'>
              Total Responden
            </p>
            <p className='text-xl font-black'>{data.total_responden}</p>
          </div>
          <div className='rounded border border-gray-400 p-2'>
            <p className='text-[10px] font-bold text-gray-600 uppercase'>
              Kepuasan Positif
            </p>
            <p className='text-xl font-black text-emerald-700'>
              {data.persentase_positif}%
            </p>
          </div>
          <div className='rounded border border-gray-400 p-2'>
            <p className='text-[10px] font-bold text-gray-600 uppercase'>
              Net Promoter Score
            </p>
            <p className='text-xl font-black text-blue-800'>
              +{data.nps_score} ({data.nps_category})
            </p>
          </div>
          <div className='rounded border border-gray-400 p-2'>
            <p className='text-[10px] font-bold text-gray-600 uppercase'>
              Rata-rata Rating
            </p>
            <p className='text-xl font-black text-amber-600'>
              {data.rata_rata_rating} / 5.0
            </p>
          </div>
        </div>

        {/* Tabel Top 15 Kata Kunci Word Cloud */}
        <div>
          <h3 className='text-xs font-bold text-gray-800 uppercase'>
            A. Kata Kunci Utama Hasil Analisis Teks (Word Cloud Summary)
          </h3>
          <table className='mt-2 w-full border-collapse border border-gray-400 text-left text-xs'>
            <thead>
              <tr className='bg-gray-100 font-bold'>
                <th className='border border-gray-400 p-1.5 text-center'>No</th>
                <th className='border border-gray-400 p-1.5'>Kata Kunci</th>
                <th className='border border-gray-400 p-1.5'>Kategori</th>
                <th className='border border-gray-400 p-1.5 text-center'>
                  Frekuensi
                </th>
                <th className='border border-gray-400 p-1.5 text-center'>
                  Sentimen
                </th>
              </tr>
            </thead>
            <tbody>
              {data.word_cloud_list.slice(0, 15).map((item, idx) => (
                <tr key={item.text} className='border-b border-gray-300'>
                  <td className='border border-gray-400 p-1.5 text-center'>
                    {idx + 1}
                  </td>
                  <td className='border border-gray-400 p-1.5 font-semibold capitalize'>
                    {item.text}
                  </td>
                  <td className='border border-gray-400 p-1.5'>
                    {item.category}
                  </td>
                  <td className='border border-gray-400 p-1.5 text-center font-bold'>
                    {item.value}x
                  </td>
                  <td className='border border-gray-400 p-1.5 text-center font-semibold uppercase'>
                    {item.sentiment}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Ringkasan Eksekutif & Tindak Lanjut Pimpinan */}
        <div className='space-y-2 text-xs'>
          <h3 className='font-bold text-gray-800 uppercase'>
            B. Kesimpulan & Rekomendasi Pimpinan
          </h3>
          <ol className='list-decimal space-y-1 pl-4 leading-relaxed'>
            <li>
              Pelayanan Statistik Terpadu (PST) BPS Sitaro memperoleh sentimen
              kepuasan positif sebesar{' '}
              <strong>{data.persentase_positif}%</strong> dengan NPS{' '}
              <strong>+{data.nps_score} (Kategori World Class)</strong>,
              membuktikan kepuasan tinggi pemangku kepentingan daerah.
            </li>
            <li>
              Kata kunci positif yang paling dominan adalah <em>ramah</em>,{' '}
              <em>cepat</em>, <em>akurat</em>, <em>nol rupiah</em>, dan inovasi{' '}
              <em>si-datu</em>.
            </li>
            <li>
              Masukan konstruktif pengunjung berfokus pada kestabilan sinyal
              wifi ruang tunggu saat cuaca ekstrem pulau dan kenyamanan tata
              ruang tunggu saat kunjungan rombongan dinas.
            </li>
            <li>
              Seluruh tindak lanjut telah diagendakan dalam Rencana Aksi
              Reformasi Birokrasi BPS Sitaro 2026.
            </li>
          </ol>
        </div>

        {/* Tanda Tangan Pimpinan */}
        <div className='flex justify-between pt-6 text-xs'>
          <div className='space-y-12'>
            <p>Mengetahui,</p>
            <div>
              <p className='font-bold underline'>
                Ketua Tim Reformasi Birokrasi
              </p>
              <p>BPS Kabupaten Kepulauan Sitaro</p>
            </div>
          </div>
          <div className='space-y-12 text-right'>
            <p>
              Ondong Siau,{' '}
              {new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
            <div>
              <p className='font-bold underline'>
                Kepala BPS Kab. Kepl. Sitaro
              </p>
              <p>NIP. 19780512 200212 1 002</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
