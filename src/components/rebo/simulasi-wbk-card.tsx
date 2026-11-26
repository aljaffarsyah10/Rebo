'useclient';

import React from 'react';
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
  Award,
  Target,
  Sparkles,
  TrendingUp,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  AlertCircle,
  HelpCircle,
  ChevronRight
} from 'lucide-react';
import type { WBKSimulationResult, QuickWinIndicator } from '@/types/rebo';
import { TARGET_WBK, TARGET_WBBM } from '@/lib/simulation/wbk-gap-analysis';
import { safePercentage, safeNumberFormat } from '@/lib/utils';

interface SimulasiWBKCardProps {
  simulation: WBKSimulationResult;
  className?: string;
}

export default function SimulasiWBKCard({
  simulation,
  className = ''
}: SimulasiWBKCardProps) {
  const {
    totalSkorMandiri,
    totalSkorVerifikasi,
    totalNilaiMaks,
    gapToWBK,
    gapToWBBM,
    gapMandiriToWBK,
    status,
    statusLabel,
    statusDescription,
    quickWins
  } = simulation;

  // Persentase progres ke target WBK (75) dan WBBM (85)
  const persenKeWBK = Math.min(
    100,
    Math.max(0, safePercentage(totalSkorVerifikasi, TARGET_WBK))
  );
  const persenKeWBBM = Math.min(
    100,
    Math.max(0, safePercentage(totalSkorVerifikasi, TARGET_WBBM))
  );

  const persenMandiriKeWBK = Math.min(
    100,
    Math.max(0, safePercentage(totalSkorMandiri, TARGET_WBK))
  );

  // Ambil top 5 indikator quick-wins
  const top5QuickWins = (quickWins || []).slice(0, 5);

  // Badge konfigurasi berdasarkan status predikat
  const getStatusBadge = () => {
    switch (status) {
      case 'MEMENUHI_WBBM':
        return (
          <Badge className='border-emerald-500/40 bg-emerald-500 text-white shadow-xs hover:bg-emerald-600 dark:bg-emerald-600'>
            <Sparkles className='mr-1.5 h-3.5 w-3.5 animate-pulse text-amber-200' />
            {statusLabel}
          </Badge>
        );
      case 'MEMENUHI_WBK':
        return (
          <Badge className='border-blue-500/40 bg-blue-600 text-white shadow-xs hover:bg-blue-700 dark:bg-blue-600'>
            <Award className='mr-1.5 h-3.5 w-3.5 text-blue-200' />
            {statusLabel}
          </Badge>
        );
      case 'POTENSI_WBK_BUTUH_VERIFIKASI':
        return (
          <Badge className='border-amber-400/50 bg-amber-500 text-slate-900 shadow-xs hover:bg-amber-600 dark:bg-amber-600 dark:text-white'>
            <Clock className='mr-1.5 h-3.5 w-3.5 text-slate-900 dark:text-white' />
            {statusLabel}
          </Badge>
        );
      case 'BELUM_MEMENUHI_WBK':
      default:
        return (
          <Badge className='border-rose-300 bg-rose-100 text-rose-800 shadow-xs dark:border-rose-800 dark:bg-rose-950/80 dark:text-rose-300'>
            <Target className='mr-1.5 h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
            {statusLabel}
          </Badge>
        );
    }
  };

  const getStatusAlertStyle = () => {
    switch (status) {
      case 'MEMENUHI_WBBM':
        return 'border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300';
      case 'MEMENUHI_WBK':
        return 'border-blue-200 bg-blue-50/70 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300';
      case 'POTENSI_WBK_BUTUH_VERIFIKASI':
        return 'border-amber-200 bg-amber-50/70 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300';
      case 'BELUM_MEMENUHI_WBK':
      default:
        return 'border-slate-200 bg-slate-50/80 text-slate-800 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-300';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'MEMENUHI_WBBM':
        return (
          <Sparkles className='h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
        );
      case 'MEMENUHI_WBK':
        return (
          <Award className='h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400' />
        );
      case 'POTENSI_WBK_BUTUH_VERIFIKASI':
        return (
          <Clock className='h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400' />
        );
      case 'BELUM_MEMENUHI_WBK':
      default:
        return (
          <AlertCircle className='h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400' />
        );
    }
  };

  return (
    <Card
      className={`relative overflow-hidden border-slate-200/80 shadow-md dark:border-slate-800 dark:bg-slate-950/90 ${className}`}
    >
      {/* Decorative top gradient accent */}
      <div className='absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600' />

      <CardHeader className='pt-6 pb-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-1.5'>
            <div className='flex items-center gap-2'>
              <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xs'>
                <Award className='h-4 w-4' />
              </div>
              <CardTitle className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                Simulasi Nilai & Gap Analysis Predikat WBK/WBBM
              </CardTitle>
            </div>
            <CardDescription className='text-xs text-slate-600 dark:text-slate-400'>
              Proyeksi kelayakan predikat Zona Integritas berdasarkan
              PermenPAN-RB No. 90/2021 dan rekomendasi akselerasi perolehan
              nilai pengungkit.
            </CardDescription>
          </div>

          <div className='flex items-center gap-2'>{getStatusBadge()}</div>
        </div>

        {/* Status narrative callout */}
        <div
          className={`mt-3 flex items-start gap-3 rounded-xl border p-3.5 text-xs font-medium ${getStatusAlertStyle()}`}
        >
          {getStatusIcon()}
          <div className='space-y-0.5 leading-relaxed'>
            <span className='font-bold'>{statusLabel}: </span>
            <span>{statusDescription}</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className='space-y-6 pt-2'>
        {/* 1. Dual Progress Trackers: WBK & WBBM */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Tracker 1: Target WBK (75.00) */}
          <div className='relative overflow-hidden rounded-2xl border border-blue-200/70 bg-gradient-to-br from-blue-50/50 via-white to-blue-50/20 p-4.5 dark:border-blue-900/50 dark:from-blue-950/20 dark:via-slate-900 dark:to-blue-950/10'>
            <div className='flex items-center justify-between pb-2'>
              <div className='flex items-center gap-2'>
                <span className='flex h-6 w-6 items-center justify-center rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'>
                  <Target className='h-3.5 w-3.5' />
                </span>
                <span className='text-sm font-bold text-slate-800 dark:text-slate-200'>
                  Target Predikat WBK
                </span>
              </div>
              <Badge
                variant='outline'
                className='border-blue-300 bg-blue-100/60 text-xs font-bold text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
              >
                Ambang Batas: {safeNumberFormat(TARGET_WBK)}
              </Badge>
            </div>

            <div className='mt-2 flex items-baseline justify-between'>
              <div>
                <span className='text-2xl font-black text-slate-900 dark:text-slate-100'>
                  {safeNumberFormat(totalSkorVerifikasi)}
                </span>
                <span className='ml-1 text-xs text-slate-500 dark:text-slate-400'>
                  / {safeNumberFormat(TARGET_WBK)} skor riil
                </span>
              </div>
              <span className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                {persenKeWBK}%
              </span>
            </div>

            <div className='mt-2'>
              <Progress
                value={persenKeWBK}
                className='h-2.5 bg-blue-100 dark:bg-blue-950'
              />
            </div>

            <div className='mt-2.5 flex items-center justify-between text-xs'>
              {gapToWBK > 0 ? (
                <span className='font-semibold text-rose-600 dark:text-rose-400'>
                  Sisa gap: -{safeNumberFormat(gapToWBK)} poin menuju WBK
                </span>
              ) : (
                <span className='flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400'>
                  <CheckCircle2 className='h-3.5 w-3.5' />
                  Target WBK Terpenuhi (+
                  {safeNumberFormat(
                    Math.max(0, totalSkorVerifikasi - TARGET_WBK)
                  )}{' '}
                  surplus)
                </span>
              )}
              <span className='text-[11px] text-slate-500'>
                Mandiri: {safeNumberFormat(totalSkorMandiri)}
              </span>
            </div>
          </div>

          {/* Tracker 2: Target WBBM (85.00) */}
          <div className='relative overflow-hidden rounded-2xl border border-purple-200/70 bg-gradient-to-br from-purple-50/50 via-white to-purple-50/20 p-4.5 dark:border-purple-900/50 dark:from-purple-950/20 dark:via-slate-900 dark:to-purple-950/10'>
            <div className='flex items-center justify-between pb-2'>
              <div className='flex items-center gap-2'>
                <span className='flex h-6 w-6 items-center justify-center rounded-md bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300'>
                  <Sparkles className='h-3.5 w-3.5' />
                </span>
                <span className='text-sm font-bold text-slate-800 dark:text-slate-200'>
                  Target Predikat WBBM
                </span>
              </div>
              <Badge
                variant='outline'
                className='border-purple-300 bg-purple-100/60 text-xs font-bold text-purple-800 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300'
              >
                Ambang Batas: {safeNumberFormat(TARGET_WBBM)}
              </Badge>
            </div>

            <div className='mt-2 flex items-baseline justify-between'>
              <div>
                <span className='text-2xl font-black text-slate-900 dark:text-slate-100'>
                  {safeNumberFormat(totalSkorVerifikasi)}
                </span>
                <span className='ml-1 text-xs text-slate-500 dark:text-slate-400'>
                  / {safeNumberFormat(TARGET_WBBM)} skor riil
                </span>
              </div>
              <span className='text-xs font-bold text-purple-600 dark:text-purple-400'>
                {persenKeWBBM}%
              </span>
            </div>

            <div className='mt-2'>
              <Progress
                value={persenKeWBBM}
                className='h-2.5 bg-purple-100 dark:bg-purple-950'
              />
            </div>

            <div className='mt-2.5 flex items-center justify-between text-xs'>
              {gapToWBBM > 0 ? (
                <span className='font-semibold text-rose-600 dark:text-rose-400'>
                  Sisa gap: -{safeNumberFormat(gapToWBBM)} poin menuju WBBM
                </span>
              ) : (
                <span className='flex items-center gap-1 font-bold text-emerald-600 dark:text-emerald-400'>
                  <CheckCircle2 className='h-3.5 w-3.5' />
                  Target WBBM Terpenuhi (+
                  {safeNumberFormat(
                    Math.max(0, totalSkorVerifikasi - TARGET_WBBM)
                  )}{' '}
                  surplus)
                </span>
              )}
              <span className='text-[11px] text-slate-500'>
                Mandiri: {safeNumberFormat(totalSkorMandiri)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Executive Stat Summary Grid */}
        <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
          {/* Skor Verifikasi Saat Ini */}
          <div className='rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40'>
            <div className='text-[11px] font-semibold text-slate-500 uppercase'>
              Skor Verifikasi
            </div>
            <div className='mt-1 flex items-baseline gap-1'>
              <span className='text-xl font-black text-emerald-700 dark:text-emerald-400'>
                {safeNumberFormat(totalSkorVerifikasi)}
              </span>
              <span className='text-[10px] text-slate-400'>
                / {safeNumberFormat(totalNilaiMaks)}
              </span>
            </div>
            <p className='mt-0.5 text-[10px] text-slate-500'>
              Skor resmi tersertifikasi
            </p>
          </div>

          {/* Proyeksi Usulan Mandiri */}
          <div className='rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40'>
            <div className='text-[11px] font-semibold text-slate-500 uppercase'>
              Proyeksi Mandiri
            </div>
            <div className='mt-1 flex items-baseline gap-1'>
              <span className='text-xl font-black text-blue-700 dark:text-blue-400'>
                {safeNumberFormat(totalSkorMandiri)}
              </span>
              <span className='text-[10px] text-slate-400'>
                / {safeNumberFormat(totalNilaiMaks)}
              </span>
            </div>
            <p className='mt-0.5 text-[10px] text-slate-500'>
              Jika semua usulan disetujui
            </p>
          </div>

          {/* Gap ke Ambang WBK */}
          <div className='rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40'>
            <div className='text-[11px] font-semibold text-slate-500 uppercase'>
              Gap ke WBK (75.00)
            </div>
            <div className='mt-1 text-xl font-black'>
              {gapToWBK > 0 ? (
                <span className='text-rose-600 dark:text-rose-400'>
                  -{safeNumberFormat(gapToWBK)}
                </span>
              ) : (
                <span className='text-emerald-600 dark:text-emerald-400'>
                  Lolos ✓
                </span>
              )}
            </div>
            <p className='mt-0.5 text-[10px] text-slate-500'>
              {gapToWBK > 0
                ? 'Poin yang harus dikejar'
                : 'Ambang minimal tercapai'}
            </p>
          </div>

          {/* Gap ke Ambang WBBM */}
          <div className='rounded-xl border border-slate-200/70 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-900/40'>
            <div className='text-[11px] font-semibold text-slate-500 uppercase'>
              Gap ke WBBM (85.00)
            </div>
            <div className='mt-1 text-xl font-black'>
              {gapToWBBM > 0 ? (
                <span className='text-rose-600 dark:text-rose-400'>
                  -{safeNumberFormat(gapToWBBM)}
                </span>
              ) : (
                <span className='text-emerald-600 dark:text-emerald-400'>
                  Lolos ✓
                </span>
              )}
            </div>
            <p className='mt-0.5 text-[10px] text-slate-500'>
              {gapToWBBM > 0
                ? 'Poin menuju predikat prima'
                : 'Ambang prima tercapai'}
            </p>
          </div>
        </div>

        {/* 3. Rekomendasi 5 Indikator Prioritas Tertinggi (Quick-Wins) */}
        <div className='space-y-3'>
          <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-md bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400'>
                <Flame className='h-3.5 w-3.5' />
              </div>
              <h3 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                5 Indikator Prioritas Tertinggi (Quick-Wins)
              </h3>
            </div>
            <span className='text-[11px] text-slate-500 dark:text-slate-400'>
              Fokus pemenuhan indikator bernilai bobot terbesar untuk lonjakan
              skor verifikasi
            </span>
          </div>

          {top5QuickWins.length === 0 ? (
            <div className='flex items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-300 bg-emerald-50/40 py-6 text-center text-xs text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300'>
              <CheckCircle2 className='h-4 w-4' />
              <span>
                Luar biasa! Seluruh indikator bernilai maksimal telah disetujui
                (100% verifikasi).
              </span>
            </div>
          ) : (
            <div className='divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-xs dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900/50'>
              {top5QuickWins.map((item, index) => {
                const statusBadgeStyle =
                  item.status_kelengkapan === 0
                    ? 'border-slate-300 bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    : item.status_kelengkapan === 1
                      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      : item.status_kelengkapan === 3
                        ? 'border-rose-300 bg-rose-50 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                        : 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';

                return (
                  <div
                    key={item.id_pertanyaan || index}
                    className='group flex flex-col gap-3 p-3.5 transition-colors hover:bg-slate-50/80 sm:flex-row sm:items-center sm:justify-between dark:hover:bg-slate-800/50'
                  >
                    {/* Rank & Indicator Details */}
                    <div className='flex items-start gap-3'>
                      <span className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-black text-slate-700 group-hover:bg-blue-100 group-hover:text-blue-700 dark:bg-slate-800 dark:text-slate-300'>
                        #{index + 1}
                      </span>
                      <div className='space-y-1'>
                        <div className='flex flex-wrap items-center gap-1.5'>
                          <Badge
                            variant='outline'
                            className='text-[10px] font-semibold'
                          >
                            {item.kode_pilar}
                          </Badge>
                          {item.nama_subpilar && (
                            <span className='text-[11px] text-slate-500 dark:text-slate-400'>
                              • {item.nama_subpilar}
                            </span>
                          )}
                          <Badge
                            variant='outline'
                            className={`text-[10px] ${statusBadgeStyle}`}
                          >
                            {item.status_label}
                          </Badge>
                        </div>
                        <p className='line-clamp-2 text-xs font-medium text-slate-800 dark:text-slate-200'>
                          {item.deskripsi_pertanyaan}
                        </p>
                      </div>
                    </div>

                    {/* Scores & Quick Link Button */}
                    <div className='flex shrink-0 items-center justify-between gap-3 border-t border-slate-100 pt-2 sm:border-t-0 sm:pt-0'>
                      <div className='text-right'>
                        <div className='flex items-center justify-end gap-1'>
                          <Badge className='border-emerald-300 bg-emerald-100 text-[11px] font-black text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300'>
                            +{safeNumberFormat(item.potensi_tambahan_skor)} Poin
                          </Badge>
                        </div>
                        <div className='mt-0.5 text-[10px] text-slate-500'>
                          Verif: {safeNumberFormat(item.nilai_verifikasi)} /
                          Maks: {safeNumberFormat(item.nilai_maks)}
                        </div>
                      </div>

                      <Link href={item.link_form}>
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 gap-1.5 px-3 text-xs font-semibold text-blue-600 shadow-2xs hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/60'
                        >
                          <span>Buka Form</span>
                          <ExternalLink className='h-3 w-3' />
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
