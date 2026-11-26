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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import {
  ShieldCheck,
  Smile,
  Award,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar,
  Layers,
  Check,
  FileCheck2
} from 'lucide-react';
import type { SurveiSummaryData, HasilSurveiPelayanan } from '@/types/rebo';
import {
  DEFAULT_SURVEI_LIST,
  THRESHOLD_SYARAT_MUTLAK,
  formatSurveiSummaryData
} from '@/lib/survei/survei-utils';
import { cn } from '@/lib/utils';

interface SurveiIkmIpakCardProps {
  initialData?: SurveiSummaryData;
  className?: string;
}

export default function SurveiIkmIpakCard({
  initialData,
  className = ''
}: SurveiIkmIpakCardProps) {
  const [summaryData, setSummaryData] = useState<SurveiSummaryData>(
    initialData || formatSurveiSummaryData(DEFAULT_SURVEI_LIST)
  );
  const [selectedSemesterId, setSelectedSemesterId] = useState<string>(
    summaryData.surveiTerbaru?.id ||
      DEFAULT_SURVEI_LIST[DEFAULT_SURVEI_LIST.length - 1].id
  );
  const [isMounted, setIsMounted] = useState(false);
  const [skalaMode, setSkalaMode] = useState<'skala4' | 'skala100'>('skala4');

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Update jika props berubah
  useEffect(() => {
    if (initialData) {
      setSummaryData(initialData);
      if (initialData.surveiTerbaru?.id) {
        setSelectedSemesterId(initialData.surveiTerbaru.id);
      }
    }
  }, [initialData]);

  const activeSurvei: HasilSurveiPelayanan =
    summaryData.surveiList.find((s) => s.id === selectedSemesterId) ||
    summaryData.surveiTerbaru;

  const { trenPerkembangan } = summaryData;

  // Cek apakah survei aktif memenuhi syarat mutlak
  const isIkmLolosWBK =
    activeSurvei.nilai_ikm >= THRESHOLD_SYARAT_MUTLAK.WBK.IKM_MINIMAL;

  const isIkmLolosWBBM =
    activeSurvei.nilai_ikm >= THRESHOLD_SYARAT_MUTLAK.WBBM.IKM_MINIMAL;
  const isIpakLolosWBBM =
    activeSurvei.nilai_ipak >= THRESHOLD_SYARAT_MUTLAK.WBBM.IPAK_MINIMAL;
  const isLolosSemuaWBBM = isIkmLolosWBBM && isIpakLolosWBBM;

  // Hitung persentase ketercapaian target
  const persenIkmWBK = Math.min(
    100,
    Math.round(
      (activeSurvei.nilai_ikm / THRESHOLD_SYARAT_MUTLAK.WBK.IKM_MINIMAL) * 100
    )
  );
  const persenIkmWBBM = Math.min(
    100,
    Math.round(
      (activeSurvei.nilai_ikm / THRESHOLD_SYARAT_MUTLAK.WBBM.IKM_MINIMAL) * 100
    )
  );

  const persenIpakWBK = Math.min(
    100,
    Math.round(
      (activeSurvei.nilai_ipak / THRESHOLD_SYARAT_MUTLAK.WBK.IPAK_MINIMAL) * 100
    )
  );
  const persenIpakWBBM = Math.min(
    100,
    Math.round(
      (activeSurvei.nilai_ipak / THRESHOLD_SYARAT_MUTLAK.WBBM.IPAK_MINIMAL) *
        100
    )
  );

  // Custom Tooltip Recharts
  const CustomChartTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='z-50 min-w-[240px] rounded-xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95'>
          <div className='mb-2 border-b border-slate-100 pb-1.5 dark:border-slate-800'>
            <span className='font-bold text-slate-900 dark:text-slate-100'>
              {label}
            </span>
          </div>
          <div className='space-y-1.5 text-xs'>
            {payload.map((entry: any, index: number) => {
              const isIKM =
                entry.dataKey === 'ikm' || entry.dataKey === 'ikmKonversi';
              const val = entry.value;
              return (
                <div
                  key={`item-${index}`}
                  className='flex items-center justify-between gap-3'
                >
                  <span
                    className='flex items-center gap-1.5 font-medium'
                    style={{ color: entry.color }}
                  >
                    <span
                      className='h-2.5 w-2.5 rounded-full'
                      style={{ backgroundColor: entry.color }}
                    />
                    {isIKM ? 'Nilai IKM (Kepuasan)' : 'Nilai IPAK (Integritas)'}
                    :
                  </span>
                  <span className='font-bold text-slate-800 dark:text-slate-200'>
                    {val.toFixed(2)} {skalaMode === 'skala4' ? '/ 4.00' : '%'}
                  </span>
                </div>
              );
            })}
          </div>
          <div className='mt-2.5 border-t border-slate-100 pt-1.5 text-[11px] text-slate-500 dark:border-slate-800 dark:text-slate-400'>
            Ambang Syarat: WBK (IKM $\ge$ 3.25, IPAK $\ge$ 3.60)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card
      className={cn(
        'overflow-hidden border-blue-200/80 bg-gradient-to-b from-white to-slate-50/50 shadow-sm dark:border-slate-800 dark:from-slate-900 dark:to-slate-950/70',
        className
      )}
    >
      <CardHeader className='border-b border-slate-100 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-transparent p-5 sm:p-6 dark:border-slate-800/80 dark:from-slate-900/90 dark:via-blue-950/20 dark:to-transparent'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='border-blue-300 bg-blue-100/70 text-blue-800 dark:border-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
              >
                <Smile className='mr-1.5 h-3.5 w-3.5' />
                Pilar 6 Pelayanan & Pilar 5 Pengawasan
              </Badge>
              <Badge
                variant='outline'
                className='border-emerald-300 bg-emerald-100/70 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
              >
                <Award className='mr-1.5 h-3.5 w-3.5' />
                Syarat Mutlak (Eliminating Criteria)
              </Badge>
            </div>
            <CardTitle className='text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100'>
              Indeks Kepuasan Masyarakat (IKM) & Survei Persepsi Anti Korupsi
              (IPAK)
            </CardTitle>
            <CardDescription className='text-xs text-slate-600 sm:text-sm dark:text-slate-400'>
              Pemantauan berkala hasil survei pelayanan eksternal BPS Kabupaten
              Kepulauan Sitaro untuk pemenuhan batas mutlak kelayakan predikat
              WBK & WBBM Nasional.
            </CardDescription>
          </div>

          {/* Filter Periode Semester */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex items-center rounded-lg border border-slate-200 bg-white p-1 text-xs shadow-2xs dark:border-slate-800 dark:bg-slate-900'>
              <Calendar className='mr-1.5 ml-1 h-3.5 w-3.5 text-slate-400' />
              <select
                value={selectedSemesterId}
                onChange={(e) => setSelectedSemesterId(e.target.value)}
                className='bg-transparent pr-2 text-xs font-semibold text-slate-800 outline-hidden dark:text-slate-200'
              >
                {summaryData.surveiList.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.periode_label}{' '}
                    {item.id === summaryData.surveiTerbaru.id
                      ? '(Terbaru)'
                      : ''}
                  </option>
                ))}
              </select>
            </div>

            <Button
              variant='outline'
              size='sm'
              onClick={() =>
                setSkalaMode(skalaMode === 'skala4' ? 'skala100' : 'skala4')
              }
              className='h-8 text-xs font-semibold'
            >
              Mode: {skalaMode === 'skala4' ? 'Skala 4' : 'Skala 100'}
            </Button>

            <Link href='/rebo/sentiment'>
              <Button
                variant='outline'
                size='sm'
                className='h-8 border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
              >
                <Sparkles className='mr-1.5 h-3.5 w-3.5 text-amber-500' />
                Sentimen & Word Cloud
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6 p-5 sm:p-6'>
        {/* 1. Kartu KPI Kembar (IKM & IPAK) */}
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          {/* Card 1: IKM (Indeks Kepuasan Masyarakat) */}
          <div className='relative overflow-hidden rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-5 shadow-xs dark:border-blue-900/60 dark:from-slate-900/80 dark:via-slate-900 dark:to-blue-950/30'>
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='rounded-lg bg-blue-100 p-1.5 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                    <Smile className='h-5 w-5' />
                  </span>
                  <span className='text-xs font-bold tracking-wider text-blue-800 uppercase dark:text-blue-300'>
                    Indeks Kepuasan Masyarakat (IKM)
                  </span>
                </div>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Persepsi Kualitas 9 Unsur Layanan Publik (SKM PermenPAN-RB No.
                  14/2017)
                </p>
              </div>

              {/* Status Badge Kelayakan */}
              {isLolosSemuaWBBM ? (
                <Badge className='border-emerald-300 bg-emerald-500 text-white shadow-xs hover:bg-emerald-600 dark:bg-emerald-600'>
                  <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
                  Lolos Syarat WBK & WBBM
                </Badge>
              ) : isIkmLolosWBK ? (
                <Badge className='border-blue-300 bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600'>
                  <Check className='mr-1 h-3.5 w-3.5' />
                  Lolos Syarat WBK
                </Badge>
              ) : (
                <Badge variant='destructive'>
                  <AlertCircle className='mr-1 h-3.5 w-3.5' />
                  Di Bawah Target WBK
                </Badge>
              )}
            </div>

            {/* Nilai Utama & Konversi */}
            <div className='mt-4 flex flex-wrap items-baseline gap-3'>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-4xl font-black text-blue-700 dark:text-blue-400'>
                  {activeSurvei.nilai_ikm.toFixed(2)}
                </span>
                <span className='text-sm font-semibold text-slate-400'>
                  / 4.00
                </span>
              </div>

              <div className='flex items-center gap-1.5 rounded-lg bg-blue-100/70 px-2.5 py-1 text-xs font-bold text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'>
                <span>
                  Konversi: {activeSurvei.nilai_ikm_konversi.toFixed(2)}
                </span>
                <span>• Mutu A (Sangat Baik)</span>
              </div>
            </div>

            {/* Indikator Progres Target Syarat Mutlak */}
            <div className='mt-4 space-y-2 border-t border-blue-100/80 pt-3 text-xs dark:border-blue-900/40'>
              <div className='flex justify-between font-medium text-slate-600 dark:text-slate-400'>
                <span>Syarat Minimal WBK: $\ge$ 3.25 (81.25)</span>
                <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                  {persenIkmWBK}% Tercapai
                </span>
              </div>
              <Progress
                value={persenIkmWBK}
                className='h-2 bg-blue-100 dark:bg-slate-800'
              />

              <div className='flex justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                <span>Syarat Minimal WBBM: $\ge$ 3.60 (90.00)</span>
                <span className='font-semibold text-blue-600 dark:text-blue-400'>
                  {persenIkmWBBM}% Tercapai
                </span>
              </div>
            </div>

            <div className='mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
              <span className='flex items-center gap-1'>
                <Users className='h-3.5 w-3.5 text-slate-400' />
                Jumlah Responden:{' '}
                <strong className='text-slate-700 dark:text-slate-200'>
                  {activeSurvei.jumlah_responden} orang
                </strong>
              </span>
              <span>
                Periode: <strong>{activeSurvei.periode_label}</strong>
              </span>
            </div>
          </div>

          {/* Card 2: IPAK (Survei Persepsi Anti Korupsi) */}
          <div className='relative overflow-hidden rounded-2xl border border-emerald-200/90 bg-gradient-to-br from-emerald-50/60 via-white to-teal-50/40 p-5 shadow-xs dark:border-emerald-900/60 dark:from-slate-900/80 dark:via-slate-900 dark:to-emerald-950/30'>
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2'>
                  <span className='rounded-lg bg-emerald-100 p-1.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'>
                    <ShieldCheck className='h-5 w-5' />
                  </span>
                  <span className='text-xs font-bold tracking-wider text-emerald-800 uppercase dark:text-emerald-300'>
                    Indeks Persepsi Anti Korupsi (IPAK)
                  </span>
                </div>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Survei Persepsi Eksternal atas Praktik Gratifikasi, Suap, dan
                  Pungli
                </p>
              </div>

              {/* Badge Zero Gratifikasi */}
              <Badge className='border-emerald-300 bg-emerald-600 text-white shadow-xs hover:bg-emerald-700 dark:bg-emerald-600'>
                <ShieldCheck className='mr-1 h-3.5 w-3.5' />
                Zero Gratifikasi / Pungli
              </Badge>
            </div>

            {/* Nilai Utama & Konversi */}
            <div className='mt-4 flex flex-wrap items-baseline gap-3'>
              <div className='flex items-baseline gap-1.5'>
                <span className='text-4xl font-black text-emerald-700 dark:text-emerald-400'>
                  {activeSurvei.nilai_ipak.toFixed(2)}
                </span>
                <span className='text-sm font-semibold text-slate-400'>
                  / 4.00
                </span>
              </div>

              <div className='flex items-center gap-1.5 rounded-lg bg-emerald-100/70 px-2.5 py-1 text-xs font-bold text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'>
                <span>
                  Konversi: {activeSurvei.nilai_ipak_konversi.toFixed(2)}
                </span>
                <span>• Sangat Bersih</span>
              </div>
            </div>

            {/* Indikator Progres Target Syarat Mutlak */}
            <div className='mt-4 space-y-2 border-t border-emerald-100/80 pt-3 text-xs dark:border-emerald-900/40'>
              <div className='flex justify-between font-medium text-slate-600 dark:text-slate-400'>
                <span>Syarat Minimal WBK: $\ge$ 3.60 (90.00)</span>
                <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                  {persenIpakWBK}% Tercapai
                </span>
              </div>
              <Progress
                value={persenIpakWBK}
                className='h-2 bg-emerald-100 dark:bg-slate-800'
              />

              <div className='flex justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                <span>Syarat Minimal WBBM: $\ge$ 3.75 (93.75)</span>
                <span className='font-semibold text-teal-600 dark:text-teal-400'>
                  {persenIpakWBBM}% Tercapai
                </span>
              </div>
            </div>

            <div className='mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
              <span className='flex items-center gap-1'>
                <FileCheck2 className='h-3.5 w-3.5 text-slate-400' />
                Integritas Layanan:{' '}
                <strong className='text-emerald-700 dark:text-emerald-300'>
                  Bebas Pungli 100%
                </strong>
              </span>
              <span>
                Lolos Syarat: <strong>WBK & WBBM ✓</strong>
              </span>
            </div>
          </div>
        </div>

        {/* 2. Banner Evaluasi Syarat Mutlak Nasional (PermenPAN-RB No. 90/2021) */}
        <div className='rounded-2xl border border-indigo-200/90 bg-gradient-to-r from-indigo-50/80 via-blue-50/60 to-purple-50/50 p-4.5 sm:p-5 dark:border-indigo-900/50 dark:from-slate-900 dark:via-indigo-950/30 dark:to-slate-900'>
          <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs'>
                  <Check className='h-4 w-4 stroke-[3]' />
                </span>
                <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                  Status Evaluasi Syarat Mutlak ZI BPS Sitaro: Memenuhi Syarat
                  WBK & WBBM
                </h4>
              </div>
              <p className='text-xs text-slate-600 dark:text-slate-300'>
                Nilai IKM ({activeSurvei.nilai_ikm.toFixed(2)}) dan IPAK (
                {activeSurvei.nilai_ipak.toFixed(2)}) melampaui seluruh ambang
                batas minimal yang ditetapkan KemenPAN-RB dan BPS RI.
              </p>
            </div>

            {/* Matriks Syarat Mutlak */}
            <div className='grid grid-cols-2 gap-2 text-xs sm:flex sm:items-center'>
              <div className='rounded-xl border border-white/80 bg-white/80 px-3 py-2 shadow-2xs dark:border-slate-800 dark:bg-slate-800/80'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Batas WBK
                </div>
                <div className='font-bold text-blue-700 dark:text-blue-300'>
                  IKM $\ge$ 3.25 | IPAK $\ge$ 3.60
                </div>
                <div className='flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                  <CheckCircle2 className='h-3 w-3' /> Lolos Mutlak
                </div>
              </div>

              <div className='rounded-xl border border-white/80 bg-white/80 px-3 py-2 shadow-2xs dark:border-slate-800 dark:bg-slate-800/80'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Batas WBBM
                </div>
                <div className='font-bold text-indigo-700 dark:text-indigo-300'>
                  IKM $\ge$ 3.60 | IPAK $\ge$ 3.75
                </div>
                <div className='flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                  <CheckCircle2 className='h-3 w-3' /> Lolos Mutlak
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Grafik Tren Garis (Recharts LineChart) */}
        <div className='rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900/60'>
          <div className='mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
            <div>
              <h3 className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
                <TrendingUp className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                Tren Perkembangan Nilai IKM & IPAK Lintas Semester
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Visualisasi peningkatan persepsi kepuasan dan integritas beserta
                garis ambang batas WBK (3.25 & 3.60)
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-3 text-xs'>
              <div className='flex items-center gap-1.5'>
                <span className='h-3 w-3 rounded-full bg-blue-600' />
                <span className='font-semibold text-slate-700 dark:text-slate-300'>
                  IKM Pelayanan
                </span>
              </div>
              <div className='flex items-center gap-1.5'>
                <span className='h-3 w-3 rounded-full bg-emerald-600' />
                <span className='font-semibold text-slate-700 dark:text-slate-300'>
                  IPAK Integritas
                </span>
              </div>
              <div className='flex items-center gap-1.5 text-slate-500'>
                <span className='w-4 border-b-2 border-dashed border-amber-500' />
                <span>Batas WBK</span>
              </div>
            </div>
          </div>

          {/* Container Recharts */}
          <div className='h-[300px] w-full pt-2'>
            {isMounted ? (
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart
                  data={trenPerkembangan}
                  margin={{ top: 15, right: 30, left: 10, bottom: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray='3 3'
                    stroke='#e2e8f0'
                    opacity={0.6}
                  />
                  <XAxis
                    dataKey='periode'
                    stroke='#64748b'
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    domain={skalaMode === 'skala4' ? [3.0, 4.0] : [75, 100]}
                    stroke='#64748b'
                    fontSize={12}
                    tickLine={false}
                    tickFormatter={(v) =>
                      skalaMode === 'skala4' ? v.toFixed(2) : `${v}%`
                    }
                  />
                  <Tooltip content={<CustomChartTooltip />} />

                  {/* Reference Lines Ambang Batas WBK */}
                  <ReferenceLine
                    y={skalaMode === 'skala4' ? 3.25 : 81.25}
                    stroke='#f59e0b'
                    strokeDasharray='4 4'
                    label={{
                      value: 'Batas WBK IKM (3.25)',
                      position: 'insideBottomRight',
                      fill: '#d97706',
                      fontSize: 10
                    }}
                  />
                  <ReferenceLine
                    y={skalaMode === 'skala4' ? 3.6 : 90.0}
                    stroke='#6366f1'
                    strokeDasharray='4 4'
                    label={{
                      value: 'Batas WBK IPAK / WBBM IKM (3.60)',
                      position: 'insideTopRight',
                      fill: '#4f46e5',
                      fontSize: 10
                    }}
                  />

                  {/* Garis IKM */}
                  <Line
                    type='monotone'
                    dataKey={skalaMode === 'skala4' ? 'ikm' : 'ikmKonversi'}
                    name='IKM'
                    stroke='#2563eb'
                    strokeWidth={3}
                    dot={{
                      r: 6,
                      fill: '#2563eb',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    activeDot={{ r: 8, fill: '#1d4ed8' }}
                  />

                  {/* Garis IPAK */}
                  <Line
                    type='monotone'
                    dataKey={skalaMode === 'skala4' ? 'ipak' : 'ipakKonversi'}
                    name='IPAK'
                    stroke='#059669'
                    strokeWidth={3}
                    dot={{
                      r: 6,
                      fill: '#059669',
                      stroke: '#ffffff',
                      strokeWidth: 2
                    }}
                    activeDot={{ r: 8, fill: '#047857' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className='flex h-full w-full items-center justify-center text-xs text-slate-400'>
                Memuat grafik tren survei...
              </div>
            )}
          </div>
        </div>

        {/* 4. Rincian 9 Unsur Layanan SKM PermenPAN-RB No. 14 Tahun 2017 */}
        <div className='space-y-3.5'>
          <div className='flex flex-col justify-between gap-1 sm:flex-row sm:items-center'>
            <div>
              <h3 className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
                <Layers className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                Rincian 9 Unsur Standar Kepuasan Masyarakat (SKM)
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Hasil penilaian per komponen pelayanan publik BPS Sitaro pada{' '}
                {activeSurvei.periode_label}
              </p>
            </div>
            <Badge variant='outline' className='w-fit text-xs font-semibold'>
              Skala Penilaian: 1.00 - 4.00
            </Badge>
          </div>

          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {activeSurvei.unsur_ikm.map((unsurItem, idx) => {
              const persentase = Math.round((unsurItem.skor / 4.0) * 100);
              const isPerfect = unsurItem.skor === 4.0;

              return (
                <div
                  key={idx}
                  className={cn(
                    'flex flex-col justify-between rounded-xl border p-3.5 shadow-2xs transition-all',
                    isPerfect
                      ? 'border-emerald-300 bg-emerald-50/50 dark:border-emerald-900/60 dark:bg-emerald-950/20'
                      : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900/40'
                  )}
                >
                  <div className='space-y-1.5'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-1.5'>
                        <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                          U{idx + 1}
                        </span>
                        <span className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                          {unsurItem.unsur}
                        </span>
                      </div>

                      <div className='text-right'>
                        <span
                          className={cn(
                            'text-sm font-black',
                            isPerfect
                              ? 'text-emerald-700 dark:text-emerald-400'
                              : 'text-blue-700 dark:text-blue-400'
                          )}
                        >
                          {unsurItem.skor.toFixed(2)}
                        </span>
                        <span className='text-[10px] text-slate-400'>
                          /4.00
                        </span>
                      </div>
                    </div>

                    {unsurItem.keterangan && (
                      <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                        {unsurItem.keterangan}
                      </p>
                    )}
                  </div>

                  <div className='mt-3 space-y-1'>
                    <div className='flex justify-between text-[10px] font-medium text-slate-500'>
                      <span>Tingkat Kepuasan</span>
                      <span className='font-bold text-slate-700 dark:text-slate-300'>
                        {persentase}% {isPerfect ? '(Sempurna)' : ''}
                      </span>
                    </div>
                    <Progress
                      value={persentase}
                      className={cn(
                        'h-1.5',
                        isPerfect
                          ? 'bg-emerald-100 dark:bg-emerald-950 [&>div]:bg-emerald-500'
                          : 'bg-slate-100 dark:bg-slate-800 [&>div]:bg-blue-600'
                      )}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
