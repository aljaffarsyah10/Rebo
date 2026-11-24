'use client';

import React, { useState, useEffect, useTransition } from 'react';
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  FileText,
  CheckCircle2,
  AlertTriangle,
  Target,
  RefreshCw,
  ExternalLink,
  Kanban,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Award,
  FileSpreadsheet
} from 'lucide-react';
import { getMonitoringDashboardData } from '@/actions/monitoring-actions';
import SimulasiWBKCard from '@/components/rebo/simulasi-wbk-card';
import { calculateWBKSimulation } from '@/lib/simulation/wbk-gap-analysis';
import type { MonitoringDashboardData, PeriodeEvaluasi } from '@/types/rebo';
import { toast } from 'sonner';

interface MonitoringDashboardClientProps {
  initialData: MonitoringDashboardData;
  initialPeriodes: PeriodeEvaluasi[];
}

export default function MonitoringDashboardClient({
  initialData,
  initialPeriodes
}: MonitoringDashboardClientProps) {
  const [data, setData] = useState<MonitoringDashboardData>(initialData);
  const [periodes] = useState<PeriodeEvaluasi[]>(initialPeriodes);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>(
    initialData.periode?.id || ''
  );
  const [expandedPilars, setExpandedPilars] = useState<Record<string, boolean>>(
    {}
  );
  const [isPending, startTransition] = useTransition();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const toggleExpand = (pilarId: string) => {
    setExpandedPilars((prev) => ({
      ...prev,
      [pilarId]: !prev[pilarId]
    }));
  };

  const handleRefresh = (targetPeriodeId?: string) => {
    startTransition(async () => {
      const pid = targetPeriodeId || selectedPeriodeId;
      const res = await getMonitoringDashboardData(pid);
      if (res.success && res.data) {
        setData(res.data);
        if (targetPeriodeId) setSelectedPeriodeId(targetPeriodeId);
        toast.success('Data dashboard monitoring berhasil diperbarui!');
      } else {
        toast.error(res.error || 'Gagal memuat ulang data monitoring.');
      }
    });
  };

  const { kpi, pilars, barChartData, statusDistribution, periode, simulation } =
    data;

  const resolvedSimulation =
    simulation || calculateWBKSimulation(pilars, kpi.totalSkorPilarHasil);

  return (
    <div className='container mx-auto max-w-7xl space-y-8 p-6'>
      {/* 1. Header / Hero Section */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-indigo-50/80 to-purple-50/60 p-6 sm:p-8 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-700/80'>
        <div className='absolute inset-0 bg-gradient-to-br from-blue-100/30 via-indigo-100/20 to-purple-100/10 dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-700/30' />

        <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='border-blue-300/60 bg-blue-100/60 text-blue-800 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300'
              >
                <TrendingUp className='mr-1.5 h-3.5 w-3.5' />
                Real-Time LKE Monitoring
              </Badge>
              {periode && (
                <Badge
                  variant='secondary'
                  className='bg-white/80 text-slate-800 shadow-xs dark:bg-slate-800 dark:text-slate-200'
                >
                  {periode.nama_periode} ({periode.tahun})
                </Badge>
              )}
            </div>
            <h1 className='bg-gradient-to-r from-slate-900 via-blue-700 to-indigo-700 bg-clip-text text-3xl font-black text-transparent sm:text-4xl dark:from-slate-100 dark:via-blue-400 dark:to-indigo-300'>
              Dashboard Monitoring Capaian RB
            </h1>
            <p className='text-sm text-slate-700 sm:text-base dark:text-slate-300'>
              Pemantauan real-time kelengkapan dokumen bukti dukung,
              perbandingan skor mandiri vs verifikasi, dan status tindak lanjut
              evaluasi PMPRB BPS Sitaro.
            </p>
          </div>

          {/* Action Toolbar */}
          <div className='flex flex-wrap items-center gap-2.5'>
            {periodes.length > 1 && (
              <select
                value={selectedPeriodeId}
                onChange={(e) => handleRefresh(e.target.value)}
                disabled={isPending}
                className='h-9 rounded-lg border border-slate-300 bg-white/90 px-3 text-xs font-semibold text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200'
              >
                {periodes.map((p) => (
                  <option key={p.id} value={p.id}>
                    Tahun {p.tahun} {p.is_active ? '(Aktif)' : ''}
                  </option>
                ))}
              </select>
            )}

            <Button
              variant='outline'
              size='sm'
              onClick={() => handleRefresh()}
              disabled={isPending}
              className='h-9 border-slate-300 bg-white/80 shadow-xs hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800'
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
              Perbarui Data
            </Button>

            <Link href='/rebo/kanban'>
              <Button
                variant='default'
                size='sm'
                className='h-9 bg-rose-600 text-white shadow-xs hover:bg-rose-700'
              >
                <Kanban className='mr-1.5 h-3.5 w-3.5' />
                Kanban Revisi ({kpi.totalRevisi})
              </Button>
            </Link>

            <a
              href={`/api/export/lke${selectedPeriodeId ? `?periodeId=${selectedPeriodeId}` : ''}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button
                variant='outline'
                size='sm'
                className='h-9 border-emerald-300 bg-emerald-50/90 text-emerald-800 shadow-xs hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200 dark:hover:bg-emerald-900/80'
              >
                <FileSpreadsheet className='mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                📊 Unduh Kertas Kerja LKE (Excel)
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Top KPI Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
        {/* KPI 1: Total Indikator */}
        <Card className='border-slate-200/70 shadow-xs dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold text-slate-500 uppercase dark:text-slate-400'>
              Total Indikator
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400'>
              <FileText className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-black text-slate-900 dark:text-slate-100'>
              {kpi.totalPertanyaan}
            </div>
            <p className='mt-1 text-xs text-slate-600 dark:text-slate-400'>
              Pilar 1 s.d. 6 (Pemenuhan & Reform)
            </p>
          </CardContent>
        </Card>

        {/* KPI 2: Indikator Selesai (Disetujui) */}
        <Card className='border-emerald-200/70 bg-emerald-50/20 shadow-xs dark:border-emerald-900/50 dark:bg-emerald-950/10'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold text-emerald-700 uppercase dark:text-emerald-400'>
              Disetujui (Selesai)
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400'>
              <CheckCircle2 className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-black text-emerald-800 dark:text-emerald-300'>
                {kpi.totalSelesai}
              </span>
              <span className='text-xs font-semibold text-emerald-600 dark:text-emerald-400'>
                ({kpi.persentaseKelengkapan}%)
              </span>
            </div>
            <p className='mt-1 text-xs text-emerald-700/80 dark:text-emerald-400/80'>
              {kpi.totalSelesai} dari {kpi.totalPertanyaan} indikator selesai
            </p>
          </CardContent>
        </Card>

        {/* KPI 3: Butuh Tindak Lanjut / Revisi */}
        <Card className='border-rose-200/70 bg-rose-50/20 shadow-xs dark:border-rose-900/50 dark:bg-rose-950/10'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold text-rose-700 uppercase dark:text-rose-400'>
              Perlu Revisi
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-900/50 dark:text-rose-400'>
              <AlertTriangle className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-black text-rose-800 dark:text-rose-300'>
                {kpi.totalRevisi}
              </span>
              {kpi.totalRevisi > 0 && (
                <Link
                  href='/rebo/kanban'
                  className='text-xs font-semibold text-rose-600 underline hover:text-rose-700 dark:text-rose-400'
                >
                  Tindak lanjuti →
                </Link>
              )}
            </div>
            <p className='mt-1 text-xs text-rose-700/80 dark:text-rose-400/80'>
              {kpi.totalMenungguReview} menunggu review verifikator
            </p>
          </CardContent>
        </Card>

        {/* KPI 4: Kelengkapan Dokumen */}
        <Card className='border-slate-200/70 shadow-xs dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold text-slate-500 uppercase dark:text-slate-400'>
              Progress Kelengkapan
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400'>
              <Target className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-black text-indigo-700 dark:text-indigo-300'>
              {kpi.persentaseKelengkapan}%
            </div>
            <div className='mt-2'>
              <Progress
                value={kpi.persentaseKelengkapan}
                className='h-2 bg-slate-100 dark:bg-slate-800'
              />
            </div>
          </CardContent>
        </Card>

        {/* KPI 5: Komparasi Skor & Aspek Hasil */}
        <Card className='border-slate-200/70 shadow-xs dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold text-slate-500 uppercase dark:text-slate-400'>
              Skor Verifikasi LKE
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400'>
              <Award className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-1'>
              <span className='text-2xl font-black text-amber-700 dark:text-amber-300'>
                {kpi.totalNilaiVerifikasi.toFixed(2)}
              </span>
              <span className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
                / {kpi.totalNilaiMaksimal.toFixed(2)}
              </span>
            </div>
            <p className='mt-1 text-xs text-slate-600 dark:text-slate-400'>
              Mandiri: {kpi.totalNilaiMandiri.toFixed(2)} | Hasil:{' '}
              {kpi.totalSkorPilarHasil.toFixed(2)}/40
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 2.5 Simulasi Predikat WBK/WBBM & Gap Analysis Card */}
      {resolvedSimulation && (
        <SimulasiWBKCard simulation={resolvedSimulation} />
      )}

      {/* 3. Visualizations Section (Recharts Bar Chart & Donut Chart) */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Bar Chart: Komparasi per Pilar (2 Kolom) */}
        <Card className='border-slate-200/70 shadow-xs lg:col-span-2 dark:border-slate-800'>
          <CardHeader>
            <div className='flex flex-wrap items-center justify-between gap-2'>
              <div>
                <CardTitle className='text-lg font-bold text-slate-800 dark:text-slate-100'>
                  Komparasi Capaian per Pilar LKE
                </CardTitle>
                <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
                  Perbandingan Skor Usulan Mandiri, Skor Verifikasi
                  Koordinator/TPI, dan Skor Maksimal
                </CardDescription>
              </div>
              <div className='flex items-center gap-3 text-xs'>
                <span className='inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300'>
                  <span className='h-3 w-3 rounded-xs bg-blue-500' /> Mandiri
                </span>
                <span className='inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300'>
                  <span className='h-3 w-3 rounded-xs bg-emerald-500' />{' '}
                  Verifikasi
                </span>
                <span className='inline-flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300'>
                  <span className='h-3 w-3 rounded-xs bg-slate-300 dark:bg-slate-700' />{' '}
                  Maksimal
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className='h-[360px] w-full'>
              {isMounted ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <BarChart
                    data={barChartData}
                    margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    barCategoryGap='20%'
                  >
                    <CartesianGrid
                      strokeDasharray='3 3'
                      vertical={false}
                      stroke='#e2e8f0'
                      className='dark:stroke-slate-800'
                    />
                    <XAxis
                      dataKey='name'
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: '#64748b' }}
                      axisLine={{ stroke: '#cbd5e1' }}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.1)',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px'
                      }}
                      formatter={(value: any, name: string) => {
                        if (name === 'skorMandiri')
                          return [Number(value).toFixed(2), 'Skor Mandiri'];
                        if (name === 'skorVerifikasi')
                          return [Number(value).toFixed(2), 'Skor Verifikasi'];
                        if (name === 'skorMaksimal')
                          return [Number(value).toFixed(2), 'Skor Maksimal'];
                        return [value, name];
                      }}
                      labelFormatter={(label) => {
                        const item = barChartData.find((b) => b.name === label);
                        return `${label}: ${item?.fullName || ''}`;
                      }}
                    />
                    <Bar
                      dataKey='skorMandiri'
                      name='Skor Mandiri'
                      fill='#3b82f6'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='skorVerifikasi'
                      name='Skor Verifikasi'
                      fill='#10b981'
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey='skorMaksimal'
                      name='Skor Maksimal'
                      fill='#94a3b8'
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-full w-full items-center justify-center text-xs text-slate-400'>
                  Memuat grafik capaian...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Donut Chart: Distribusi Status (1 Kolom) */}
        <Card className='border-slate-200/70 shadow-xs dark:border-slate-800'>
          <CardHeader>
            <CardTitle className='text-lg font-bold text-slate-800 dark:text-slate-100'>
              Status Kelengkapan
            </CardTitle>
            <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
              Distribusi indikator berdasarkan tahap penyelesaian
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-col items-center justify-center space-y-4'>
            <div className='relative h-[220px] w-full'>
              {isMounted ? (
                <ResponsiveContainer width='100%' height='100%'>
                  <PieChart>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        fontSize: '12px'
                      }}
                      formatter={(val: any, name: string) => [
                        `${val} Indikator (${kpi.totalPertanyaan > 0 ? Math.round((Number(val) / kpi.totalPertanyaan) * 100) : 0}%)`,
                        name
                      ]}
                    />
                    <Pie
                      data={statusDistribution}
                      dataKey='value'
                      nameKey='name'
                      cx='50%'
                      cy='50%'
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                    >
                      {statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className='flex h-full w-full items-center justify-center text-xs text-slate-400'>
                  Memuat grafik distribusi...
                </div>
              )}

              {/* Center Stat */}
              <div className='pointer-events-none absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-2xl font-black text-slate-800 dark:text-slate-100'>
                  {kpi.persentaseKelengkapan}%
                </span>
                <span className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Selesai
                </span>
              </div>
            </div>

            {/* Status Legend Breakdown */}
            <div className='grid w-full grid-cols-2 gap-2 text-xs'>
              {statusDistribution.map((item) => (
                <div
                  key={item.name}
                  className='flex items-center justify-between rounded-lg border border-slate-200/60 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/50'
                >
                  <div className='flex items-center gap-2 truncate'>
                    <span
                      className='h-2.5 w-2.5 shrink-0 rounded-full'
                      style={{ backgroundColor: item.color }}
                    />
                    <span className='truncate text-slate-600 dark:text-slate-400'>
                      {item.name}
                    </span>
                  </div>
                  <span className='font-bold text-slate-900 dark:text-slate-100'>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Detailed Breakdown Table (Pilars & Subpilars) */}
      <Card className='border-slate-200/70 shadow-xs dark:border-slate-800'>
        <CardHeader>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='text-lg font-bold text-slate-800 dark:text-slate-100'>
                Tabel Rincian Capaian per Pilar & Subpilar
              </CardTitle>
              <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
                Klik ikon panah pada nama pilar untuk melihat rincian capaian
                setiap subpilar
              </CardDescription>
            </div>
            <div className='text-xs text-slate-500 dark:text-slate-400'>
              Total {pilars.length} Pilar Kerja
            </div>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-b border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 uppercase dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400'>
                <tr>
                  <th className='py-3.5 pr-2 pl-4'>Pilar / Subpilar</th>
                  <th className='px-3 py-3.5 text-center'>Area</th>
                  <th className='px-3 py-3.5 text-center'>Total</th>
                  <th className='px-3 py-3.5 text-center'>
                    Status Kelengkapan
                  </th>
                  <th className='px-3 py-3.5 text-center'>Progress</th>
                  <th className='px-3 py-3.5 text-right'>Skor Mandiri</th>
                  <th className='px-3 py-3.5 text-right'>Skor Verifikasi</th>
                  <th className='px-3 py-3.5 text-right'>Skor Maks</th>
                  <th className='py-3.5 pr-4 pl-3 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100 dark:divide-slate-800/60'>
                {pilars.map((pilar) => {
                  const isExpanded = !!expandedPilars[pilar.id_pilar];
                  return (
                    <React.Fragment key={pilar.id_pilar}>
                      {/* Pilar Row */}
                      <tr className='bg-white transition-colors hover:bg-slate-50/80 dark:bg-slate-950 dark:hover:bg-slate-900/60'>
                        <td className='py-3.5 pr-2 pl-4'>
                          <button
                            type='button'
                            onClick={() => toggleExpand(pilar.id_pilar)}
                            className='group flex items-center gap-2 text-left font-bold text-slate-800 hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400'
                          >
                            <span className='flex h-5 w-5 items-center justify-center rounded-sm bg-slate-100 text-slate-600 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300'>
                              {isExpanded ? (
                                <ChevronDown className='h-3.5 w-3.5' />
                              ) : (
                                <ChevronRight className='h-3.5 w-3.5' />
                              )}
                            </span>
                            <div>
                              <span>
                                {pilar.kode_pilar}: {pilar.nama_pilar}
                              </span>
                              <span className='block text-[11px] font-normal text-slate-500'>
                                {pilar.subpilars.length} Subpilar
                              </span>
                            </div>
                          </button>
                        </td>
                        <td className='px-3 py-3.5 text-center'>
                          <Badge
                            variant='outline'
                            className='text-[10px] font-medium'
                          >
                            {pilar.area}
                          </Badge>
                        </td>
                        <td className='px-3 py-3.5 text-center font-semibold text-slate-700 dark:text-slate-300'>
                          {pilar.totalPertanyaan}
                        </td>
                        <td className='px-3 py-3.5 text-center'>
                          <div className='flex items-center justify-center gap-1.5 text-xs font-semibold'>
                            <span
                              className='rounded-md bg-slate-100 px-1.5 py-0.5 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              title='Belum Diisi'
                            >
                              {pilar.belumDiisi}
                            </span>
                            <span
                              className='rounded-md bg-amber-100 px-1.5 py-0.5 text-amber-700 dark:bg-amber-950 dark:text-amber-400'
                              title='Menunggu Review'
                            >
                              {pilar.menungguReview}
                            </span>
                            <span
                              className='rounded-md bg-emerald-100 px-1.5 py-0.5 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                              title='Disetujui'
                            >
                              {pilar.disetujui}
                            </span>
                            <span
                              className='rounded-md bg-rose-100 px-1.5 py-0.5 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                              title='Perlu Revisi'
                            >
                              {pilar.perluRevisi}
                            </span>
                          </div>
                        </td>
                        <td className='px-3 py-3.5 text-center'>
                          <div className='flex items-center justify-center gap-2'>
                            <div className='h-2 w-16 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700'>
                              <div
                                className='h-full rounded-full bg-emerald-500'
                                style={{ width: `${pilar.persentaseSelesai}%` }}
                              />
                            </div>
                            <span className='w-8 text-right text-xs font-bold text-slate-700 dark:text-slate-300'>
                              {pilar.persentaseSelesai}%
                            </span>
                          </div>
                        </td>
                        <td className='px-3 py-3.5 text-right font-medium text-blue-600 dark:text-blue-400'>
                          {pilar.nilaiMandiri.toFixed(2)}
                        </td>
                        <td className='px-3 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400'>
                          {pilar.nilaiVerifikasi.toFixed(2)}
                        </td>
                        <td className='px-3 py-3.5 text-right text-xs text-slate-500 dark:text-slate-400'>
                          {pilar.nilaiMaksimal.toFixed(2)}
                        </td>
                        <td className='py-3.5 pr-4 pl-3 text-center'>
                          <Link href={`/rebo/formRB/${pilar.id_pilar}`}>
                            <Button
                              variant='outline'
                              size='sm'
                              className='h-7 gap-1 px-2.5 text-xs text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/50'
                            >
                              <span>Buka Form</span>
                              <ExternalLink className='h-3 w-3' />
                            </Button>
                          </Link>
                        </td>
                      </tr>

                      {/* Subpilar Breakdown Rows (Accordion) */}
                      {isExpanded &&
                        pilar.subpilars.map((sub, sIdx) => (
                          <tr
                            key={sub.id_subpilar}
                            className='border-t border-slate-100 bg-slate-50/50 text-xs dark:border-slate-800/40 dark:bg-slate-900/40'
                          >
                            <td className='py-2.5 pr-2 pl-10'>
                              <div className='flex items-center gap-1.5'>
                                <span className='text-slate-400'>↳</span>
                                <span className='font-medium text-slate-700 dark:text-slate-300'>
                                  Subpilar {sIdx + 1}: {sub.nama_subpilar}
                                </span>
                              </div>
                            </td>
                            <td className='px-3 py-2.5 text-center text-slate-400'>
                              -
                            </td>
                            <td className='px-3 py-2.5 text-center font-medium text-slate-600 dark:text-slate-400'>
                              {sub.totalPertanyaan}
                            </td>
                            <td className='px-3 py-2.5 text-center'>
                              <span className='text-[11px] text-slate-500'>
                                {sub.disetujui} disetujui
                                {sub.perluRevisi > 0 && (
                                  <span className='ml-1 font-semibold text-rose-600'>
                                    ({sub.perluRevisi} revisi)
                                  </span>
                                )}
                              </span>
                            </td>
                            <td className='px-3 py-2.5 text-center'>
                              <span className='font-semibold text-slate-700 dark:text-slate-300'>
                                {sub.persentaseSelesai}%
                              </span>
                            </td>
                            <td className='px-3 py-2.5 text-right text-slate-600 dark:text-slate-400'>
                              {sub.nilaiMandiri.toFixed(2)}
                            </td>
                            <td className='px-3 py-2.5 text-right font-semibold text-emerald-600 dark:text-emerald-400'>
                              {sub.nilaiVerifikasi.toFixed(2)}
                            </td>
                            <td className='px-3 py-2.5 text-right text-slate-400'>
                              {sub.nilaiMaksimal.toFixed(2)}
                            </td>
                            <td className='py-2.5 pr-4 pl-3 text-center'>
                              <span className='text-[10px] text-slate-400'>
                                Sub-komponen
                              </span>
                            </td>
                          </tr>
                        ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
