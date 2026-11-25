'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import {
  TrendingUp,
  Award,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Printer,
  Sparkles,
  ArrowUpRight,
  ChevronLeft,
  Lightbulb,
  FileText,
  BarChart3,
  Flame,
  Star,
  Layers,
  ArrowRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { MultiYearTrendResult } from '@/lib/trend/multi-year-types';

interface MultiYearTrendClientProps {
  initialData: MultiYearTrendResult;
}

export default function MultiYearTrendClient({
  initialData
}: MultiYearTrendClientProps) {
  const [data] = useState<MultiYearTrendResult>(initialData);
  const [activeTab, setActiveTab] = useState<'total' | 'pilars' | 'survei'>(
    'total'
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { trends, summary, pilarMatrix, chartData, pilarComparisonChart } =
    data;

  // Handler Salin Narasi ke Clipboard
  const handleCopyNarasi = async () => {
    try {
      await navigator.clipboard.writeText(summary.narasi_kesimpulan);
      toast.success('Pernyataan Continuous Improvement berhasil disalin!', {
        description:
          'Teks siap ditempel pada materi slide paparan TPN KemenPAN-RB.'
      });
    } catch {
      toast.error('Gagal menyalin teks ke papan klip.');
    }
  };

  // Handler Cetak Laporan
  const handlePrint = () => {
    window.print();
  };

  // Custom Tooltip Recharts untuk Skor Total
  const CustomTotalTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95'>
          <p className='text-xs font-bold text-slate-500 uppercase dark:text-slate-400'>
            Evaluasi PMPRB Tahun {label}
          </p>
          <div className='mt-2 space-y-1.5 text-xs'>
            {payload.map((entry: any, index: number) => (
              <div
                key={`item-${index}`}
                className='flex items-center justify-between gap-4'
              >
                <span
                  className='flex items-center gap-1.5 font-medium'
                  style={{ color: entry.color }}
                >
                  <span
                    className='h-2 w-2 rounded-full'
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className='font-bold text-slate-900 dark:text-slate-100'>
                  {Number(entry.value).toFixed(2)} Poin
                </span>
              </div>
            ))}
          </div>
          <div className='mt-2 border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400'>
            Ambang Batas: WBK (75.00) | WBBM (85.00)
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip Recharts untuk Komparasi Pilar
  const CustomPilarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const pilarInfo = pilarMatrix.find((p) => p.kode === label);
      return (
        <div className='rounded-xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95'>
          <p className='text-xs font-bold text-slate-900 dark:text-slate-100'>
            {label} - {pilarInfo?.nama}
          </p>
          <p className='text-[11px] text-slate-500 dark:text-slate-400'>
            Bobot Maksimal: {pilarInfo?.bobot_maksimal.toFixed(2)} Poin
          </p>
          <div className='mt-2 space-y-1 text-xs'>
            {payload.map((entry: any, index: number) => (
              <div
                key={`pilar-${index}`}
                className='flex items-center justify-between gap-4'
              >
                <span
                  className='flex items-center gap-1.5 font-medium'
                  style={{ color: entry.color }}
                >
                  <span
                    className='h-2 w-2 rounded-full'
                    style={{ backgroundColor: entry.color }}
                  />
                  {entry.name}:
                </span>
                <span className='font-bold text-slate-900 dark:text-slate-100'>
                  {Number(entry.value).toFixed(2)} Poin
                </span>
              </div>
            ))}
          </div>
          {pilarInfo && (
            <div className='mt-2 border-t border-slate-100 pt-1.5 text-[11px] font-semibold text-emerald-600 dark:border-slate-800 dark:text-emerald-400'>
              Pertumbuhan: +{pilarInfo.delta_total.toFixed(2)} Poin (+
              {pilarInfo.growth_percentage}%)
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className='container mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8'>
      {/* 1. Header Hero Section */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 p-6 text-white shadow-xl sm:p-8'>
        <div className='absolute -top-16 -right-16 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl' />
        <div className='absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl' />

        <div className='relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center'>
          <div className='max-w-3xl space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <Link
                href='/rebo/monitoring'
                className='inline-flex items-center text-xs font-semibold text-blue-200 transition-colors hover:text-white'
              >
                <ChevronLeft className='mr-1 h-3.5 w-3.5' />
                Kembali ke Dashboard Monitoring
              </Link>
              <span className='text-blue-300/40'>•</span>
              <Badge
                variant='outline'
                className='border-emerald-400/50 bg-emerald-500/20 text-emerald-200 backdrop-blur-sm'
              >
                <Sparkles className='mr-1.5 h-3.5 w-3.5 text-emerald-300' />
                Bukti Valid Continuous Improvement TPN
              </Badge>
              <Badge
                variant='secondary'
                className='bg-white/10 text-slate-200 backdrop-blur-sm'
              >
                Periode 2024 - 2026
              </Badge>
            </div>

            <h1 className='text-3xl font-black tracking-tight text-white sm:text-4xl'>
              Analisis Tren Kinerja Antar-Tahun
            </h1>
            <p className='text-sm leading-relaxed text-blue-100/90 sm:text-base'>
              Komparasi longitudinal capaian LKE Zona Integritas BPS Kabupaten
              Kepulauan Sitaro selama 3 tahun evaluasi berturut-turut untuk
              membuktikan perbaikan berkelanjutan (*continuous improvement*) di
              hadapan Tim Penilai Nasional (TPN KemenPAN-RB).
            </p>
          </div>

          {/* Action Toolbar */}
          <div className='flex flex-wrap items-center gap-3'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleCopyNarasi}
              className='h-10 border-blue-400/40 bg-white/10 text-white shadow-sm hover:bg-white/20'
            >
              <Copy className='mr-1.5 h-4 w-4' />
              Salin Naskah TPN
            </Button>

            <Dialog
              open={isPrintDialogOpen}
              onOpenChange={setIsPrintDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  size='sm'
                  className='h-10 bg-gradient-to-r from-emerald-500 to-teal-600 font-semibold text-white shadow-lg hover:from-emerald-600 hover:to-teal-700'
                >
                  <Printer className='mr-1.5 h-4 w-4' />
                  Cetak Laporan Resmi A4
                </Button>
              </DialogTrigger>
              <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle className='flex items-center gap-2 text-xl font-bold'>
                    <Printer className='h-5 w-5 text-emerald-600' />
                    Pratinjau Dokumen Resmi Evaluasi Antar-Tahun A4
                  </DialogTitle>
                  <DialogDescription>
                    Format resmi berkas pelaporan perbaikan berkelanjutan untuk
                    TPN KemenPAN-RB dan TPI BPS RI.
                  </DialogDescription>
                </DialogHeader>

                {/* Printable Document Container */}
                <div
                  id='printable-report'
                  className='space-y-6 rounded-xl border border-slate-200 bg-white p-8 text-slate-900 shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100'
                >
                  {/* Kop Surat Resmi BPS */}
                  <div className='border-b-2 border-slate-900 pb-4 text-center dark:border-slate-100'>
                    <h3 className='text-sm font-semibold tracking-wider text-slate-600 uppercase dark:text-slate-400'>
                      Badan Pusat Statistik
                    </h3>
                    <h2 className='text-xl font-black text-slate-900 uppercase dark:text-slate-100'>
                      Badan Pusat Statistik Kabupaten Kepulauan Sitaro
                    </h2>
                    <p className='text-xs text-slate-500 dark:text-slate-400'>
                      Jl. Lokongbanua, Kelurahan Ondong, Kec. Siau Barat, Kab.
                      Kepl. Siau Tagulandang Biaro - Sulawesi Utara
                    </p>
                    <div className='mt-2 inline-block rounded-full bg-slate-100 px-3 py-0.5 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                      DOKUMEN RESMI PEMBANGUNAN ZI MENUJU WBBM TAHUN 2026
                    </div>
                  </div>

                  {/* Judul Laporan */}
                  <div className='space-y-1 text-center'>
                    <h4 className='text-base font-extrabold tracking-wide text-slate-900 uppercase dark:text-slate-100'>
                      Laporan Tren Kinerja Multi-Tahun & Continuous Improvement
                    </h4>
                    <p className='text-xs text-slate-500'>
                      Rekam Jejak Evaluasi LKE Periode 2024, 2025, dan 2026
                    </p>
                  </div>

                  {/* Ringkasan Skor Tahunan */}
                  <div className='grid grid-cols-3 gap-3 text-center'>
                    {trends.map((t) => (
                      <div
                        key={t.tahun}
                        className='rounded-lg border border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/50'
                      >
                        <div className='text-xs font-semibold text-slate-500'>
                          Tahun {t.tahun}
                        </div>
                        <div className='text-xl font-black text-blue-700 dark:text-blue-400'>
                          {t.total_skor_verifikasi.toFixed(2)}
                        </div>
                        <div className='mt-1 line-clamp-1 text-[10px] text-slate-500'>
                          {t.predikat_status}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Matriks 6 Pilar */}
                  <div>
                    <h5 className='mb-2 text-xs font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300'>
                      Matriks Perkembangan 6 Pilar Pengungkit
                    </h5>
                    <div className='overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800'>
                      <table className='w-full text-left text-xs'>
                        <thead className='bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                          <tr>
                            <th className='p-2 font-semibold'>Area / Pilar</th>
                            <th className='p-2 text-right font-semibold'>
                              Bobot
                            </th>
                            <th className='p-2 text-right font-semibold'>
                              2024
                            </th>
                            <th className='p-2 text-right font-semibold'>
                              2025
                            </th>
                            <th className='p-2 text-right font-semibold'>
                              2026
                            </th>
                            <th className='p-2 text-right font-semibold'>
                              Pertumbuhan
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-200 dark:divide-slate-800'>
                          {pilarMatrix.map((p) => (
                            <tr key={p.kode}>
                              <td className='p-2 font-medium'>
                                {p.kode}: {p.nama}
                              </td>
                              <td className='p-2 text-right'>
                                {p.bobot_maksimal.toFixed(2)}
                              </td>
                              <td className='p-2 text-right'>
                                {p.skor_2024.toFixed(2)}
                              </td>
                              <td className='p-2 text-right'>
                                {p.skor_2025.toFixed(2)}
                              </td>
                              <td className='p-2 text-right font-bold text-blue-600 dark:text-blue-400'>
                                {p.skor_2026.toFixed(2)}
                              </td>
                              <td className='p-2 text-right font-bold text-emerald-600 dark:text-emerald-400'>
                                +{p.delta_total.toFixed(2)} (+
                                {p.growth_percentage}%)
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Narasi Ringkasan */}
                  <div className='rounded-lg border border-blue-200 bg-blue-50/70 p-4 text-xs leading-relaxed text-slate-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200'>
                    <div className='mb-1 font-bold text-blue-900 dark:text-blue-300'>
                      Pernyataan Continuous Improvement:
                    </div>
                    {summary.narasi_kesimpulan}
                  </div>

                  {/* Pengesahan */}
                  <div className='flex items-end justify-between pt-6 text-xs text-slate-600 dark:text-slate-400'>
                    <div>
                      <p>Divalidasi melalui Sistem REBO V2</p>
                      <p className='text-[10px] text-slate-400'>
                        Waktu Cetak:{' '}
                        {new Date().toLocaleDateString('id-ID', {
                          dateStyle: 'long'
                        })}
                      </p>
                    </div>
                    <div className='w-64 text-center'>
                      <p>
                        Ondong Siau,{' '}
                        {new Date().toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                      <p className='mt-1 font-semibold text-slate-900 dark:text-slate-100'>
                        Kepala BPS Kabupaten Kepulauan Sitaro
                      </p>
                      <div className='flex h-16 items-center justify-center text-[11px] text-slate-400 italic'>
                        (Tanda Tangan & Cap Kedinasan)
                      </div>
                      <p className='font-bold text-slate-900 underline dark:text-slate-100'>
                        BPS KABUPATEN KEPULAUAN SITARO
                      </p>
                      <p className='text-[10px] text-slate-500'>
                        NIP. Pembina Utama Muda
                      </p>
                    </div>
                  </div>
                </div>

                <div className='flex justify-end gap-2 pt-2'>
                  <Button
                    variant='outline'
                    onClick={() => setIsPrintDialogOpen(false)}
                  >
                    Tutup
                  </Button>
                  <Button
                    onClick={handlePrint}
                    className='bg-blue-600 text-white hover:bg-blue-700'
                  >
                    <Printer className='mr-1.5 h-4 w-4' />
                    Cetak / Simpan PDF
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* 2. Empat Kartu Metrik Perbaikan Berkelanjutan */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Metrik 1: Pertumbuhan Skor Total */}
        <Card className='border-blue-200/80 bg-gradient-to-br from-blue-50/70 via-white to-blue-50/30 shadow-xs dark:border-blue-900/60 dark:bg-slate-900/60'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400'>
              Pertumbuhan Skor LKE
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400'>
              <TrendingUp className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100'>
                +{summary.growth_total_skor.toFixed(2)}
              </span>
              <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                Poin (3 Thn)
              </span>
            </div>
            <div className='flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400'>
              <span>78.50 (2024)</span>
              <ArrowRight className='h-3 w-3 text-slate-400' />
              <span className='font-bold text-blue-600 dark:text-blue-400'>
                92.45 (2026)
              </span>
            </div>
            <div className='pt-1'>
              <Badge className='bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300'>
                Rata-rata: +{summary.average_annual_growth.toFixed(2)}{' '}
                poin/tahun
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metrik 2: Pilar Paling Melonjak (Pelayanan Publik & Tatalaksana) */}
        <Card className='border-amber-200/80 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 shadow-xs dark:border-amber-900/60 dark:bg-slate-900/60'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400'>
              Pilar Paling Melonjak
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'>
              <Flame className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-1.5'>
            <div>
              <div className='flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200'>
                <span>Pilar 6 (Pelayanan Publik)</span>
                <span className='text-emerald-600 dark:text-emerald-400'>
                  +{summary.most_improved_pilar.delta.toFixed(2)} (+
                  {summary.most_improved_pilar.persentase}%)
                </span>
              </div>
              <p className='text-[11px] text-slate-500'>
                8.40 (2024) → 11.50 (2026) dari bobot 12.00
              </p>
            </div>
            <div className='border-t border-slate-100 pt-1 dark:border-slate-800'>
              <div className='flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200'>
                <span>Pilar 2 (Tatalaksana)</span>
                <span className='text-emerald-600 dark:text-emerald-400'>
                  +{summary.second_improved_pilar.delta.toFixed(2)} (+
                  {summary.second_improved_pilar.persentase}%)
                </span>
              </div>
              <p className='text-[11px] text-slate-500'>
                7.10 (2024) → 9.60 (2026) dari bobot 10.00
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Metrik 3: Tren Kepuasan Konsumen IKM & IPAK */}
        <Card className='border-emerald-200/80 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 shadow-xs dark:border-emerald-900/60 dark:bg-slate-900/60'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400'>
              Kepuasan & Integritas
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'>
              <ShieldCheck className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-baseline justify-between'>
              <span className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
                Indeks Kepuasan (IKM):
              </span>
              <span className='text-sm font-black text-slate-900 dark:text-slate-100'>
                3.58 →{' '}
                <span className='text-emerald-600 dark:text-emerald-400'>
                  3.84
                </span>{' '}
                / 4.00
              </span>
            </div>
            <div className='flex items-baseline justify-between'>
              <span className='text-xs font-semibold text-slate-600 dark:text-slate-400'>
                Anti Korupsi (IPAK):
              </span>
              <span className='text-sm font-black text-slate-900 dark:text-slate-100'>
                3.65 →{' '}
                <span className='text-emerald-600 dark:text-emerald-400'>
                  3.92
                </span>{' '}
                / 4.00
              </span>
            </div>
            <div className='pt-1'>
              <Badge className='bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300'>
                NPS Publik: 78% → 92% (Tingkat Promosi Prima)
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Metrik 4: Kontinuitas Inovasi & Digitalisasi */}
        <Card className='border-purple-200/80 bg-gradient-to-br from-purple-50/70 via-white to-purple-50/30 shadow-xs dark:border-purple-900/60 dark:bg-slate-900/60'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-bold tracking-wider text-purple-700 uppercase dark:text-purple-400'>
              Inovasi & Digitalisasi
            </CardTitle>
            <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400'>
              <Lightbulb className='h-5 w-5' />
            </div>
          </CardHeader>
          <CardContent className='space-y-2'>
            <div className='flex items-baseline gap-2'>
              <span className='text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100'>
                12 Inovasi
              </span>
              <span className='text-xs font-semibold text-purple-600 dark:text-purple-400'>
                (+300% dari 2024)
              </span>
            </div>
            <p className='text-xs text-slate-600 dark:text-slate-400'>
              Termasuk REBO V2, Voice AI, Sentimen PST, dan Portal Data Spasial
              Sitaro.
            </p>
            <div className='pt-1'>
              <Badge className='bg-purple-100 text-purple-800 hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300'>
                3 Periode Evaluasi Terverifikasi
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Visualisasi Grafik Recharts (Interactive Tabs) */}
      <Card className='border-slate-200/80 shadow-xs dark:border-slate-800'>
        <CardHeader className='pb-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100'>
                <BarChart3 className='h-5 w-5 text-blue-600' />
                Visualisasi Grafik Perbandingan Kinerja LKE
              </CardTitle>
              <CardDescription>
                Pilih sudut pandang visualisasi untuk membedah perkembangan skor
                total, 6 pilar, atau indikator dampak.
              </CardDescription>
            </div>

            {/* Segmented Controls / View Mode */}
            <div className='inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800'>
              <button
                type='button'
                onClick={() => setActiveTab('total')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  activeTab === 'total'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Skor Total & Ambang Batas
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('pilars')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  activeTab === 'pilars'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Komparasi 6 Pilar
              </button>
              <button
                type='button'
                onClick={() => setActiveTab('survei')}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                  activeTab === 'survei'
                    ? 'bg-white text-blue-700 shadow-xs dark:bg-slate-900 dark:text-blue-300'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                )}
              >
                Survei & Inovasi
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='h-[380px] w-full pt-4'>
            {isMounted ? (
              <>
                {/* Tab 1: Line / Area Chart Skor Total dengan Ambang Batas WBK & WBBM */}
                {activeTab === 'total' && (
                  <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                      <defs>
                        <linearGradient
                          id='colorVerifikasi'
                          x1='0'
                          y1='0'
                          x2='0'
                          y2='1'
                        >
                          <stop
                            offset='5%'
                            stopColor='#2563eb'
                            stopOpacity={0.25}
                          />
                          <stop
                            offset='95%'
                            stopColor='#2563eb'
                            stopOpacity={0.0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='#94a3b8'
                        opacity={0.25}
                        vertical={false}
                      />
                      <XAxis
                        dataKey='tahun'
                        stroke='#64748b'
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[65, 100]}
                        stroke='#64748b'
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        unit=' Pt'
                      />
                      <Tooltip content={<CustomTotalTooltip />} />
                      <Legend
                        verticalAlign='top'
                        align='right'
                        wrapperStyle={{
                          paddingBottom: '12px',
                          fontSize: '12px'
                        }}
                      />
                      {/* Ambang Batas WBK (75.00) */}
                      <ReferenceLine
                        y={75}
                        stroke='#d97706'
                        strokeDasharray='4 4'
                        strokeWidth={2}
                        label={{
                          value: 'Ambang Batas WBK (75.00)',
                          fill: '#d97706',
                          fontSize: 11,
                          fontWeight: 700,
                          position: 'insideBottomRight'
                        }}
                      />
                      {/* Ambang Batas WBBM (85.00) */}
                      <ReferenceLine
                        y={85}
                        stroke='#059669'
                        strokeDasharray='4 4'
                        strokeWidth={2}
                        label={{
                          value: 'Ambang Batas WBBM (85.00)',
                          fill: '#059669',
                          fontSize: 11,
                          fontWeight: 700,
                          position: 'insideTopRight'
                        }}
                      />
                      {/* Area & Line Skor Verifikasi */}
                      <Area
                        type='monotone'
                        dataKey='skor_verifikasi'
                        name='Skor Verifikasi LKE (Resmi)'
                        stroke='#2563eb'
                        strokeWidth={3}
                        fillOpacity={1}
                        fill='url(#colorVerifikasi)'
                      />
                      {/* Line Skor Mandiri */}
                      <Line
                        type='monotone'
                        dataKey='skor_mandiri'
                        name='Penilaian Mandiri'
                        stroke='#8b5cf6'
                        strokeWidth={2}
                        strokeDasharray='5 5'
                        dot={{ r: 4, fill: '#8b5cf6' }}
                      />
                      {/* Line Skor TPI */}
                      <Line
                        type='monotone'
                        dataKey='skor_tpi'
                        name='Evaluasi TPI BPS RI'
                        stroke='#0284c7'
                        strokeWidth={2}
                        dot={{ r: 5, fill: '#0284c7' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}

                {/* Tab 2: Grouped Bar Chart Komparasi 6 Pilar Berdampingan per Tahun */}
                {activeTab === 'pilars' && (
                  <ResponsiveContainer width='100%' height='100%'>
                    <BarChart
                      data={pilarComparisonChart}
                      margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='#94a3b8'
                        opacity={0.25}
                        vertical={false}
                      />
                      <XAxis
                        dataKey='pilarKode'
                        stroke='#64748b'
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                      />
                      <YAxis
                        stroke='#64748b'
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={false}
                        unit=' Pt'
                      />
                      <Tooltip content={<CustomPilarTooltip />} />
                      <Legend
                        verticalAlign='top'
                        align='right'
                        wrapperStyle={{
                          paddingBottom: '12px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar
                        dataKey='skor2024'
                        name='Tahun 2024 (Baseline)'
                        fill='#94a3b8'
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey='skor2025'
                        name='Tahun 2025 (Penguatan)'
                        fill='#38bdf8'
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey='skor2026'
                        name='Tahun 2026 (Tahap Prima)'
                        fill='#2563eb'
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}

                {/* Tab 3: Tren Survei Kepuasan (IKM/IPAK) & Inovasi */}
                {activeTab === 'survei' && (
                  <ResponsiveContainer width='100%' height='100%'>
                    <ComposedChart
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid
                        strokeDasharray='3 3'
                        stroke='#94a3b8'
                        opacity={0.25}
                        vertical={false}
                      />
                      <XAxis
                        dataKey='tahun'
                        stroke='#64748b'
                        tick={{ fontSize: 12, fontWeight: 600 }}
                        tickLine={false}
                      />
                      <YAxis
                        yAxisId='skala'
                        domain={[3.2, 4.0]}
                        stroke='#059669'
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        unit=' /4.0'
                      />
                      <YAxis
                        yAxisId='inovasi'
                        orientation='right'
                        domain={[0, 15]}
                        stroke='#a855f7'
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        unit=' Inovasi'
                      />
                      <Tooltip />
                      <Legend
                        verticalAlign='top'
                        align='right'
                        wrapperStyle={{
                          paddingBottom: '12px',
                          fontSize: '12px'
                        }}
                      />
                      <Bar
                        yAxisId='inovasi'
                        dataKey='inovasi'
                        name='Jumlah Inovasi Pelayanan'
                        fill='#c084fc'
                        opacity={0.65}
                        radius={[6, 6, 0, 0]}
                        barSize={32}
                      />
                      <Line
                        yAxisId='skala'
                        type='monotone'
                        dataKey='ikm'
                        name='Indeks Kepuasan Masyarakat (IKM)'
                        stroke='#059669'
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#059669' }}
                      />
                      <Line
                        yAxisId='skala'
                        type='monotone'
                        dataKey='ipak'
                        name='Indeks Persepsi Anti Korupsi (IPAK)'
                        stroke='#2563eb'
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#2563eb' }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </>
            ) : (
              <div className='flex h-full items-center justify-center text-sm text-slate-400'>
                Memuat visualisasi grafik...
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 4. Tabel Matriks Komparatif 6 Pilar */}
      <Card className='border-slate-200/80 shadow-xs dark:border-slate-800'>
        <CardHeader>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100'>
                <Layers className='h-5 w-5 text-indigo-600' />
                Matriks Komparasi 6 Pilar Pengungkit ZI (2024 - 2026)
              </CardTitle>
              <CardDescription>
                Rincian perolehan poin verifikasi per pilar, deviasi kenaikan
                absolut, serta laju pertumbuhan relatif.
              </CardDescription>
            </div>
            <Badge
              variant='outline'
              className='border-indigo-300 bg-indigo-50 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
            >
              Semua 6 Pilar Positif (+Growth)
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className='overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800'>
            <table className='w-full text-left text-sm'>
              <thead className='bg-slate-50 text-xs tracking-wider text-slate-600 uppercase dark:bg-slate-900/60 dark:text-slate-400'>
                <tr>
                  <th className='p-3.5 font-bold'>Pilar / Area Perubahan</th>
                  <th className='p-3.5 text-right font-bold'>Bobot</th>
                  <th className='p-3.5 text-right font-bold'>Skor 2024</th>
                  <th className='p-3.5 text-right font-bold'>Skor 2025</th>
                  <th className='p-3.5 text-right font-bold text-blue-700 dark:text-blue-400'>
                    Skor 2026
                  </th>
                  <th className='p-3.5 text-right font-bold text-emerald-700 dark:text-emerald-400'>
                    Pertumbuhan
                  </th>
                  <th className='p-3.5 font-bold'>
                    Status Perbaikan Berkelanjutan
                  </th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/80'>
                {pilarMatrix.map((row) => {
                  const capaianPct = Math.round(
                    (row.skor_2026 / row.bobot_maksimal) * 100
                  );
                  return (
                    <tr
                      key={row.kode}
                      className='transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40'
                    >
                      <td className='p-3.5 font-medium'>
                        <div className='font-bold text-slate-900 dark:text-slate-100'>
                          {row.kode}
                        </div>
                        <div className='text-xs text-slate-500 dark:text-slate-400'>
                          {row.nama}
                        </div>
                      </td>
                      <td className='p-3.5 text-right font-semibold text-slate-600 dark:text-slate-400'>
                        {row.bobot_maksimal.toFixed(2)}
                      </td>
                      <td className='p-3.5 text-right text-slate-600 dark:text-slate-400'>
                        {row.skor_2024.toFixed(2)}
                      </td>
                      <td className='p-3.5 text-right text-slate-600 dark:text-slate-400'>
                        {row.skor_2025.toFixed(2)}
                      </td>
                      <td className='p-3.5 text-right font-bold text-blue-700 dark:text-blue-400'>
                        {row.skor_2026.toFixed(2)}
                        <span className='ml-1 text-[11px] text-slate-400'>
                          ({capaianPct}%)
                        </span>
                      </td>
                      <td className='p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400'>
                        <div className='flex items-center justify-end gap-1'>
                          <ArrowUpRight className='h-3.5 w-3.5' />
                          <span>+{row.delta_total.toFixed(2)}</span>
                        </div>
                        <span className='text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-400/80'>
                          (+{row.growth_percentage}%)
                        </span>
                      </td>
                      <td className='p-3.5'>
                        <Badge
                          variant='outline'
                          className={cn(
                            'text-xs font-semibold',
                            row.growth_percentage >= 30
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : row.growth_percentage >= 20
                                ? 'border-sky-300 bg-sky-50 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'border-blue-300 bg-blue-50 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          )}
                        >
                          {row.status_improvement}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 5. Box Narasi Eksekutif "Continuous Improvement Statement" untuk Paparan TPN */}
      <Card className='border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-blue-50/40 to-white shadow-md dark:border-indigo-900/60 dark:bg-slate-900/80'>
        <CardHeader>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <Badge className='bg-indigo-600 text-white hover:bg-indigo-700'>
                  Materi Paparan Resmi TPN
                </Badge>
                <span className='text-xs font-semibold text-indigo-700 dark:text-indigo-400'>
                  KemenPAN-RB Ready
                </span>
              </div>
              <CardTitle className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                Continuous Improvement Statement
              </CardTitle>
            </div>
            <Button
              variant='default'
              size='sm'
              onClick={handleCopyNarasi}
              className='bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
            >
              <Copy className='mr-1.5 h-3.5 w-3.5' />
              Salin Naskah Pernyataan
            </Button>
          </div>
          <CardDescription>
            Pernyataan naratif formal berlandaskan bukti empiris evaluasi PMPRB
            2024–2026 untuk dibawakan oleh Kepala BPS saat sesi
            wawancara/paparan TPN.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='rounded-2xl border border-indigo-200/70 bg-white/80 p-5 leading-relaxed text-slate-800 shadow-xs dark:border-indigo-950 dark:bg-slate-950/70 dark:text-slate-200'>
            <p className='text-justify text-sm leading-relaxed font-normal sm:text-base'>
              &quot;{summary.narasi_kesimpulan}&quot;
            </p>
          </div>

          {/* Key Highlights Sub-bullets */}
          <div className='mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-3'>
            <div className='flex items-start gap-2 rounded-xl border border-indigo-100 bg-white/60 p-3 dark:border-slate-800 dark:bg-slate-900/40'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600' />
              <div>
                <span className='font-bold text-slate-900 dark:text-slate-100'>
                  Bukti Dokumentasi Lengkap:
                </span>
                <p className='text-slate-500'>
                  Tersinkronisasi 100% pada sistem REBO V2 dan arsip digital
                  cloud.
                </p>
              </div>
            </div>
            <div className='flex items-start gap-2 rounded-xl border border-indigo-100 bg-white/60 p-3 dark:border-slate-800 dark:bg-slate-900/40'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600' />
              <div>
                <span className='font-bold text-slate-900 dark:text-slate-100'>
                  Dukungan Penuh Pimpinan:
                </span>
                <p className='text-slate-500'>
                  Keterlibatan langsung Kepala BPS dalam monev mingguan &
                  briefing ZI.
                </p>
              </div>
            </div>
            <div className='flex items-start gap-2 rounded-xl border border-indigo-100 bg-white/60 p-3 dark:border-slate-800 dark:bg-slate-900/40'>
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600' />
              <div>
                <span className='font-bold text-slate-900 dark:text-slate-100'>
                  Dampak Riil ke Stakeholder:
                </span>
                <p className='text-slate-500'>
                  Kepuasan publik PST melonjak signifikan dengan nihil keluhan
                  pungli.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
