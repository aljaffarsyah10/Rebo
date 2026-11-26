'use client';

import React, { useState, useEffect } from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Compass, AlertCircle, Sparkles } from 'lucide-react';

export interface RadarPilarInput {
  name?: string;
  kode_pilar?: string;
  fullName?: string;
  nama_pilar?: string;
  pilarId?: string;
  id_pilar?: string;
  skorMandiri?: number;
  nilaiMandiri?: number;
  skorVerifikasi?: number;
  nilaiVerifikasi?: number;
  skorMaksimal?: number;
  nilaiMaksimal?: number;
  persentaseSelesai?: number;
}

export interface RadarCapaianPilarProps {
  data: RadarPilarInput[];
  title?: string;
  description?: string;
  showCardWrapper?: boolean;
  className?: string;
}

interface RadarDataPoint {
  pilarKey: string;
  pilarName: string;
  fullName: string;
  mandiriScore: number;
  verifikasiScore: number;
  maxScore: number;
  persenMandiri: number;
  persenVerifikasi: number;
  gapSkor: number;
  gapPersen: number;
}

import { safeDivide, safePercentage, safeNumberFormat } from '@/lib/utils';
function CustomRadarTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const item: RadarDataPoint = payload[0].payload;
    if (!item) return null;

    return (
      <div className='z-50 max-w-[320px] min-w-[240px] rounded-xl border border-slate-200/90 bg-white/95 p-3.5 shadow-xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95'>
        {/* Header */}
        <div className='mb-2.5 border-b border-slate-100 pb-2 dark:border-slate-800'>
          <div className='flex items-center justify-between gap-2'>
            <span className='font-bold text-slate-900 dark:text-slate-100'>
              {item.pilarName}
            </span>
            <Badge
              variant='outline'
              className='border-slate-300 text-[10px] font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-400'
            >
              Maks: {item.maxScore.toFixed(2)} Poin
            </Badge>
          </div>
          <p className='mt-0.5 line-clamp-1 text-xs text-slate-500 dark:text-slate-400'>
            {item.fullName}
          </p>
        </div>

        {/* Skor & Capaian Breakdown */}
        <div className='space-y-2 text-xs'>
          {/* Layer 2: Verifikasi Riil */}
          <div className='flex items-center justify-between rounded-lg bg-emerald-50/70 p-2 dark:bg-emerald-950/30'>
            <div className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900' />
              <span className='font-medium text-emerald-900 dark:text-emerald-200'>
                Verifikasi Riil:
              </span>
            </div>
            <div className='text-right'>
              <span className='font-black text-emerald-700 dark:text-emerald-300'>
                {safeNumberFormat(item.persenVerifikasi, 1, '0.0')}%
              </span>
              <span className='ml-1 text-[11px] text-slate-500 dark:text-slate-400'>
                ({safeNumberFormat(item.verifikasiScore)} pts)
              </span>
            </div>
          </div>

          {/* Layer 1: Mandiri */}
          <div className='flex items-center justify-between rounded-lg bg-indigo-50/70 p-2 dark:bg-indigo-950/30'>
            <div className='flex items-center gap-1.5'>
              <span className='h-2.5 w-2.5 shrink-0 rounded-full bg-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900' />
              <span className='font-medium text-indigo-900 dark:text-indigo-200'>
                Proyeksi Mandiri:
              </span>
            </div>
            <div className='text-right'>
              <span className='font-black text-indigo-700 dark:text-indigo-300'>
                {safeNumberFormat(item.persenMandiri, 1, '0.0')}%
              </span>
              <span className='ml-1 text-[11px] text-slate-500 dark:text-slate-400'>
                ({safeNumberFormat(item.mandiriScore)} pts)
              </span>
            </div>
          </div>

          {/* Gap Indicator jika ada selisih */}
          {item.gapPersen > 0.05 && (
            <div className='flex items-center justify-between border-t border-slate-100 pt-1 text-[11px] text-amber-700 dark:border-slate-800 dark:text-amber-400'>
              <span className='flex items-center gap-1'>
                <AlertCircle className='h-3 w-3 shrink-0' />
                Gap Belum Verifikasi:
              </span>
              <span className='font-semibold'>
                +{safeNumberFormat(item.gapPersen, 1, '0.0')}% (
                {safeNumberFormat(item.gapSkor)} pts)
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
}

export default function RadarCapaianPilar({
  data = [],
  title = 'Spider Web Capaian 6 Pilar',
  description = 'Visualisasi radar persentase capaian per pilar terhadap target skor maksimal (0 - 100%)',
  showCardWrapper = true,
  className = ''
}: RadarCapaianPilarProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format data for Radar Chart
  const radarData: RadarDataPoint[] = data.map((item, index) => {
    const rawName = item.name || item.kode_pilar || `Pilar ${index + 1}`;
    const pilarKey = rawName.replace(/^Pilar\s*/i, 'P');
    const fullName = item.fullName || item.nama_pilar || rawName;
    const mandiri = Number(item.skorMandiri ?? item.nilaiMandiri ?? 0);
    const verifikasi = Number(item.skorVerifikasi ?? item.nilaiVerifikasi ?? 0);
    const maksimal = Number(item.skorMaksimal ?? item.nilaiMaksimal ?? 0);

    const persenMandiri =
      maksimal > 0
        ? Math.min(100, Math.max(0, safePercentage(mandiri, maksimal, 1)))
        : 0;
    const persenVerifikasi =
      maksimal > 0
        ? Math.min(100, Math.max(0, safePercentage(verifikasi, maksimal, 1)))
        : 0;

    const gapSkor = Math.max(0, mandiri - verifikasi);
    const gapPersen = Math.max(0, persenMandiri - persenVerifikasi);

    return {
      pilarKey,
      pilarName: rawName,
      fullName,
      mandiriScore: Number.isFinite(mandiri) ? mandiri : 0,
      verifikasiScore: Number.isFinite(verifikasi) ? verifikasi : 0,
      maxScore: Number.isFinite(maksimal) ? maksimal : 0,
      persenMandiri,
      persenVerifikasi,
      gapSkor,
      gapPersen
    };
  });

  // Calculate executive summary stats
  const totalPilar = radarData.length;
  const avgVerifikasi =
    totalPilar > 0
      ? Math.round(
          safeDivide(
            radarData.reduce(
              (acc, curr) =>
                acc +
                (Number.isFinite(curr.persenVerifikasi)
                  ? curr.persenVerifikasi
                  : 0),
              0
            ),
            totalPilar,
            0
          ) * 10
        ) / 10
      : 0;
  const avgMandiri =
    totalPilar > 0
      ? Math.round(
          safeDivide(
            radarData.reduce(
              (acc, curr) =>
                acc +
                (Number.isFinite(curr.persenMandiri) ? curr.persenMandiri : 0),
              0
            ),
            totalPilar,
            0
          ) * 10
        ) / 10
      : 0;

  // Best & lowest performing pilar
  const sortedByVerifikasi = [...radarData].sort(
    (a, b) => b.persenVerifikasi - a.persenVerifikasi
  );
  const bestPilar = sortedByVerifikasi[0];
  const lowestPilar = sortedByVerifikasi[sortedByVerifikasi.length - 1];

  const chartContent = (
    <div className='flex flex-col space-y-4'>
      {/* Header Info & Legends */}
      <div className='flex flex-wrap items-center justify-between gap-3 text-xs'>
        <div className='flex flex-wrap items-center gap-3'>
          <span className='inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300'>
            <span className='h-3 w-3 rounded-full bg-indigo-500 shadow-xs' />
            Proyeksi Mandiri (%)
          </span>
          <span className='inline-flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300'>
            <span className='h-3 w-3 rounded-full bg-emerald-500 shadow-xs' />
            Capaian Verifikasi Riil (%)
          </span>
        </div>

        <div className='flex items-center gap-2 text-[11px] font-medium text-slate-500 dark:text-slate-400'>
          <Compass className='h-3.5 w-3.5 text-indigo-500' />
          <span>Skala: 0% - 100% Bobot Maks</span>
        </div>
      </div>

      {/* Radar Chart Container */}
      <div className='relative h-[340px] w-full'>
        {isMounted ? (
          <ResponsiveContainer width='100%' height='100%'>
            <RadarChart
              cx='50%'
              cy='50%'
              outerRadius='78%'
              data={radarData}
              margin={{ top: 10, right: 25, bottom: 10, left: 25 }}
            >
              {/* Radar Polar Grid */}
              <PolarGrid
                stroke='#cbd5e1'
                strokeDasharray='3 3'
                className='dark:stroke-slate-800'
              />

              {/* Angles / Pilar Labels */}
              <PolarAngleAxis
                dataKey='pilarName'
                tick={{
                  fontSize: 11,
                  fill: '#64748b',
                  fontWeight: 600
                }}
              />

              {/* Radius Axis (Percentages 0 - 100%) */}
              <PolarRadiusAxis
                angle={30}
                domain={[0, 100]}
                tickCount={6}
                tick={{ fontSize: 9, fill: '#94a3b8' }}
                tickFormatter={(v) => `${v}%`}
                axisLine={false}
              />

              {/* Custom Tooltip */}
              <Tooltip content={<CustomRadarTooltip />} />

              {/* Layer 1: Proyeksi Nilai Mandiri (%) */}
              <Radar
                name='Proyeksi Nilai Mandiri (%)'
                dataKey='persenMandiri'
                stroke='#6366f1'
                strokeWidth={2}
                fill='#818cf8'
                fillOpacity={0.25}
                dot={{
                  r: 3.5,
                  fill: '#6366f1',
                  strokeWidth: 1,
                  stroke: '#ffffff'
                }}
                activeDot={{ r: 5, fill: '#4f46e5' }}
              />

              {/* Layer 2: Capaian Verifikasi Riil (%) */}
              <Radar
                name='Capaian Verifikasi Riil (%)'
                dataKey='persenVerifikasi'
                stroke='#10b981'
                strokeWidth={2.5}
                fill='#34d399'
                fillOpacity={0.4}
                dot={{
                  r: 4,
                  fill: '#10b981',
                  strokeWidth: 1.5,
                  stroke: '#ffffff'
                }}
                activeDot={{ r: 6, fill: '#059669' }}
              />
            </RadarChart>
          </ResponsiveContainer>
        ) : (
          <div className='flex h-full w-full items-center justify-center text-xs text-slate-400'>
            Memuat Spider Web Capaian 6 Pilar...
          </div>
        )}
      </div>

      {/* Executive Quick Stats Footer */}
      <div className='grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 text-xs sm:grid-cols-4 dark:border-slate-800'>
        <div className='rounded-lg bg-slate-50/70 p-2 text-center dark:bg-slate-900/60'>
          <span className='block text-[10px] font-medium text-slate-500 uppercase dark:text-slate-400'>
            Rata-rata Verifikasi
          </span>
          <span className='mt-0.5 block text-sm font-black text-emerald-600 dark:text-emerald-400'>
            {avgVerifikasi}%
          </span>
        </div>

        <div className='rounded-lg bg-slate-50/70 p-2 text-center dark:bg-slate-900/60'>
          <span className='block text-[10px] font-medium text-slate-500 uppercase dark:text-slate-400'>
            Rata-rata Mandiri
          </span>
          <span className='mt-0.5 block text-sm font-black text-indigo-600 dark:text-indigo-400'>
            {avgMandiri}%
          </span>
        </div>

        <div className='rounded-lg bg-slate-50/70 p-2 text-center dark:bg-slate-900/60'>
          <span className='block text-[10px] font-medium text-slate-500 uppercase dark:text-slate-400'>
            Pilar Tertinggi
          </span>
          <span className='mt-0.5 block truncate text-xs font-bold text-slate-800 dark:text-slate-200'>
            {bestPilar
              ? `${bestPilar.pilarKey} (${bestPilar.persenVerifikasi}%)`
              : '-'}
          </span>
        </div>

        <div className='rounded-lg bg-slate-50/70 p-2 text-center dark:bg-slate-900/60'>
          <span className='block text-[10px] font-medium text-slate-500 uppercase dark:text-slate-400'>
            Perlu Akselerasi
          </span>
          <span className='mt-0.5 block truncate text-xs font-bold text-rose-600 dark:text-rose-400'>
            {lowestPilar
              ? `${lowestPilar.pilarKey} (${lowestPilar.persenVerifikasi}%)`
              : '-'}
          </span>
        </div>
      </div>
    </div>
  );

  if (!showCardWrapper) {
    return <div className={className}>{chartContent}</div>;
  }

  return (
    <Card
      className={`border-slate-200/70 shadow-xs dark:border-slate-800 ${className}`}
    >
      <CardHeader>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <div className='flex items-center gap-2'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'>
                <Compass className='h-4 w-4' />
              </div>
              <CardTitle className='text-lg font-bold text-slate-800 dark:text-slate-100'>
                {title}
              </CardTitle>
            </div>
            <CardDescription className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              {description}
            </CardDescription>
          </div>
          <Badge
            variant='outline'
            className='border-indigo-300 bg-indigo-50/60 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
          >
            <Sparkles className='mr-1 h-3 w-3' />
            Eksekutif Monitoring
          </Badge>
        </div>
      </CardHeader>
      <CardContent>{chartContent}</CardContent>
    </Card>
  );
}
