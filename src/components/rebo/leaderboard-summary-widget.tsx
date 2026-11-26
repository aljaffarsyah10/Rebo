import React from 'react';
import Link from 'next/link';
import { Trophy, Crown, Zap, ShieldCheck, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getLeaderboardPilarAction } from '@/actions/leaderboard-actions';

export async function LeaderboardSummaryWidget() {
  const result = await getLeaderboardPilarAction();
  const summary = result.data;
  const top3 = summary.items.slice(0, 3);
  const rank1 = top3[0];
  const rank2 = top3[1];
  const rank3 = top3[2];

  return (
    <Card className='relative overflow-hidden border-amber-300/80 bg-gradient-to-r from-amber-50/70 via-orange-50/40 to-yellow-50/50 shadow-xs dark:border-amber-700/60 dark:from-amber-950/30 dark:via-slate-900/80 dark:to-slate-900/80'>
      {/* Golden accent bar */}
      <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500' />

      <CardContent className='space-y-4 p-4 sm:p-5'>
        {/* Header Widget */}
        <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className='border-amber-300 bg-amber-500 text-[10px] font-bold text-white shadow-2xs'>
                <Crown className='mr-1 h-3 w-3' />
                Papan Apresiasi &amp; Klasemen 6 Pilar
              </Badge>
              <span className='text-xs text-slate-500 dark:text-slate-400'>
                {summary.periode_nama} • Rata-rata Satker:{' '}
                {summary.rata_rata_selesai}%
              </span>
            </div>
            <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
              Leaderboard Progresivitas &amp; Zero Revision
            </h3>
          </div>

          <Link href='/rebo/leaderboard'>
            <Button
              size='sm'
              className='h-8 shrink-0 gap-1.5 bg-amber-500 text-xs font-semibold text-white shadow-2xs hover:bg-amber-600'
            >
              <Trophy className='h-3.5 w-3.5' />
              <span>Lihat Leaderboard Lengkap</span>
              <ArrowRight className='h-3 w-3' />
            </Button>
          </Link>
        </div>

        {/* Podium Top 3 Mini Cards Grid */}
        <div className='grid gap-2.5 sm:grid-cols-3'>
          {/* Juara 1 */}
          {rank1 && (
            <div className='relative flex items-center justify-between rounded-xl border border-amber-300/80 bg-white/80 p-3 shadow-2xs dark:border-amber-700/70 dark:bg-slate-800/60'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 font-extrabold text-amber-900 shadow-2xs dark:bg-amber-950 dark:text-amber-200'>
                  🥇
                </div>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                      {rank1.pilar_kode}
                    </span>
                    <Badge className='border-amber-300 bg-amber-500/20 px-1 py-0 text-[9px] font-bold text-amber-800 dark:text-amber-300'>
                      Top 1
                    </Badge>
                  </div>
                  <div className='truncate text-[10px] text-slate-500 dark:text-slate-400'>
                    {rank1.koordinator_name}
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-xs font-black text-amber-700 dark:text-amber-400'>
                  {rank1.persentase_selesai}%
                </div>
                <div className='text-[9px] text-emerald-600 dark:text-emerald-400'>
                  Zero Revisi
                </div>
              </div>
            </div>
          )}

          {/* Juara 2 */}
          {rank2 && (
            <div className='relative flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-800/60'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-800 shadow-2xs dark:bg-slate-700 dark:text-slate-200'>
                  🥈
                </div>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                      {rank2.pilar_kode}
                    </span>
                    <Badge
                      variant='outline'
                      className='border-slate-300 px-1 py-0 text-[9px] text-slate-600 dark:text-slate-400'
                    >
                      Top 2
                    </Badge>
                  </div>
                  <div className='truncate text-[10px] text-slate-500 dark:text-slate-400'>
                    {rank2.koordinator_name}
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-xs font-black text-slate-700 dark:text-slate-300'>
                  {rank2.persentase_selesai}%
                </div>
                <div className='text-[9px] text-slate-500'>
                  Revisi: {rank2.tingkat_revisi_persen}%
                </div>
              </div>
            </div>
          )}

          {/* Juara 3 */}
          {rank3 && (
            <div className='relative flex items-center justify-between rounded-xl border border-amber-200/60 bg-white/80 p-3 shadow-2xs dark:border-amber-900/60 dark:bg-slate-800/60'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-100/60 font-bold text-amber-900 shadow-2xs dark:bg-amber-950 dark:text-amber-200'>
                  🥉
                </div>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                      {rank3.pilar_kode}
                    </span>
                    <Badge
                      variant='outline'
                      className='border-amber-300 px-1 py-0 text-[9px] text-amber-800 dark:text-amber-300'
                    >
                      Top 3
                    </Badge>
                  </div>
                  <div className='truncate text-[10px] text-slate-500 dark:text-slate-400'>
                    {rank3.koordinator_name}
                  </div>
                </div>
              </div>
              <div className='text-right'>
                <div className='text-xs font-black text-slate-700 dark:text-slate-300'>
                  {rank3.persentase_selesai}%
                </div>
                <div className='text-[9px] text-slate-500'>
                  Revisi: {rank3.tingkat_revisi_persen}%
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Special Recognition Quick Pills */}
        <div className='flex flex-wrap items-center justify-between gap-2 border-t border-amber-200/50 pt-3 text-xs dark:border-slate-800'>
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex items-center gap-1.5 rounded-full bg-amber-100/80 px-2.5 py-1 text-[11px] font-medium text-amber-900 dark:bg-amber-950/60 dark:text-amber-200'>
              <Zap className='h-3 w-3 text-amber-600 dark:text-amber-400' />
              <span>
                Speed Star: <strong>{summary.tercepat_pilar.pilar_kode}</strong>{' '}
                (100% Tuntas)
              </span>
            </div>
            <div className='flex items-center gap-1.5 rounded-full bg-emerald-100/80 px-2.5 py-1 text-[11px] font-medium text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'>
              <ShieldCheck className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
              <span>
                Zero Revision:{' '}
                <strong>{summary.zero_revisi_pilar.pilar_kode}</strong> (0%
                Revisi)
              </span>
            </div>
          </div>

          <Link
            href='/rebo/leaderboard'
            className='inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:underline dark:text-amber-300'
          >
            <span>Semua 6 Pilar &amp; Pesan Apresiasi WA</span>
            <ArrowRight className='h-3 w-3' />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
