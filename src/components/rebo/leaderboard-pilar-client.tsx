'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Medal,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Share2,
  Copy,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Crown,
  Phone,
  Flame,
  Check,
  ArrowUpRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  type LeaderboardSummary,
  generateWhatsAppLeaderboardMessage
} from '@/lib/gamification/leaderboard-types';
import { getLeaderboardPilarAction } from '@/actions/leaderboard-actions';

interface LeaderboardPilarClientProps {
  initialSummary: LeaderboardSummary;
}

export function LeaderboardPilarClient({
  initialSummary
}: LeaderboardPilarClientProps) {
  const [summary, setSummary] = useState<LeaderboardSummary>(initialSummary);
  const [activeFilter, setActiveFilter] = useState<
    'ALL' | 'PODIUM' | 'ZERO_REVISI' | 'NEEDS_BOOST'
  >('ALL');
  const [isPending, startTransition] = useTransition();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  // Trigger celebration animation
  const handleTriggerConfetti = () => {
    setShowConfetti(true);
    toast.success('🎉 Selamat atas capaian progresivitas Tim Kerja 6 Pilar!');
    setTimeout(() => {
      setShowConfetti(false);
    }, 4000);
  };

  // Refresh data dari server
  const handleRefreshData = () => {
    startTransition(async () => {
      try {
        const res = await getLeaderboardPilarAction(summary.periode_id);
        if (res.success && res.data) {
          setSummary(res.data);
          toast.success('Papan peringkat berhasil diperbarui!');
        } else {
          toast.error(res.error || 'Gagal memuat pembaruan data');
        }
      } catch {
        toast.error('Terjadi kendala jaringan saat memuat data');
      }
    });
  };

  // Copy WhatsApp message text
  const handleCopyMessage = async () => {
    try {
      const text = generateWhatsAppLeaderboardMessage(summary);
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Teks apresiasi berhasil disalin ke clipboard!');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error('Gagal menyalin teks ke clipboard');
    }
  };

  // Open direct WhatsApp
  const handleShareToWhatsApp = () => {
    const text = generateWhatsAppLeaderboardMessage(summary);
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  // Filter items
  const filteredItems = summary.items.filter((item) => {
    if (activeFilter === 'PODIUM') return item.rank <= 3;
    if (activeFilter === 'ZERO_REVISI') return item.indikator_revisi === 0;
    if (activeFilter === 'NEEDS_BOOST')
      return (
        item.status_predikat === 'PERLU_DORONGAN' ||
        item.persentase_selesai < 80
      );
    return true;
  });

  // Top 3 untuk podium (Rank 1, 2, 3)
  const rank1 = summary.items.find((it) => it.rank === 1) || summary.items[0];
  const rank2 = summary.items.find((it) => it.rank === 2) || summary.items[1];
  const rank3 = summary.items.find((it) => it.rank === 3) || summary.items[2];

  return (
    <div className='relative space-y-6 pb-12'>
      {/* Floating Confetti Particle Effect (Pure CSS/SVG) */}
      {showConfetti && (
        <div className='pointer-events-none fixed inset-0 z-50 overflow-hidden'>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='h-full w-full animate-pulse bg-gradient-to-t from-transparent via-amber-500/10 to-transparent' />
          </div>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className='absolute animate-bounce'
              style={{
                left: `${(i * 3.3) % 100}%`,
                top: `${(i * 7) % 70}%`,
                animationDuration: `${1 + (i % 3) * 0.5}s`,
                animationDelay: `${(i % 5) * 0.1}s`
              }}
            >
              <div
                className='h-3 w-3 rotate-45 rounded-xs'
                style={{
                  backgroundColor: [
                    '#F59E0B',
                    '#10B981',
                    '#3B82F6',
                    '#EC4899',
                    '#8B5CF6'
                  ][i % 5]
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Header Banner Utama */}
      <div className='relative overflow-hidden rounded-2xl border border-amber-200/70 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-blue-500/10 p-6 shadow-xs backdrop-blur-xs dark:border-amber-700/50 dark:from-amber-950/40 dark:via-orange-950/20 dark:to-slate-900/60'>
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className='border-amber-300 bg-amber-500/90 text-xs font-bold text-white shadow-2xs hover:bg-amber-600 dark:border-amber-600'>
                <Crown className='mr-1.5 h-3.5 w-3.5' />
                Recognition Hub &amp; Gamifikasi
              </Badge>
              <Badge
                variant='outline'
                className='border-blue-300 bg-white/70 text-xs text-blue-700 dark:border-blue-700 dark:bg-slate-800 dark:text-blue-300'
              >
                {summary.periode_nama} ({summary.tahun})
              </Badge>
              <span className='text-[11px] text-slate-500 dark:text-slate-400'>
                Rata-rata Satker:{' '}
                <strong className='text-slate-800 dark:text-slate-200'>
                  {summary.rata_rata_selesai}%
                </strong>
              </span>
            </div>

            <h1 className='text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
              Leaderboard Progresivitas &amp; Kepatuhan 6 Pilar
            </h1>
            <p className='max-w-3xl text-xs leading-relaxed text-slate-600 md:text-sm dark:text-slate-300'>
              Papan peringkat apresiasi dan kompetisi sehat antar-pilar BPS
              Kabupaten Kepulauan Sitaro. Mengapresiasi ketepatan waktu
              verifikasi berkas 100%, ketelitian dokumen (Zero Revision), dan
              perolehan skor LKE tertinggi menuju predikat WBK.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center gap-2'>
            <Button
              onClick={handleTriggerConfetti}
              variant='outline'
              size='sm'
              className='h-9 gap-1.5 border-amber-300 bg-white text-xs font-semibold text-amber-800 shadow-2xs hover:bg-amber-50 dark:border-amber-700 dark:bg-slate-800 dark:text-amber-300'
            >
              <Sparkles className='h-3.5 w-3.5 text-amber-500' />
              <span>Rayakan</span>
            </Button>

            <Button
              onClick={() => setIsShareModalOpen(true)}
              size='sm'
              className='h-9 gap-1.5 bg-emerald-600 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700'
            >
              <Share2 className='h-3.5 w-3.5' />
              <span>Bagikan ke WhatsApp Tim</span>
            </Button>

            <Button
              onClick={handleRefreshData}
              disabled={isPending}
              variant='outline'
              size='sm'
              className='h-9 border-slate-300 bg-white px-2.5 text-xs text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
              title='Perbarui Data'
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
            </Button>
          </div>
        </div>
      </div>

      {/* 3 Kartu Apresiasi Utama (Special Recognition Champions) */}
      <div className='grid gap-4 sm:grid-cols-3'>
        {/* Card 1: Speed Star (Pilar Tercepat) */}
        <Card className='group relative overflow-hidden border-amber-300 bg-gradient-to-br from-amber-50/80 via-white to-amber-50/30 p-4 shadow-xs transition-all hover:border-amber-400 hover:shadow-md dark:border-amber-700/70 dark:from-amber-950/30 dark:via-slate-900 dark:to-slate-900'>
          <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-amber-400 to-yellow-500' />
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-2xs dark:bg-amber-950/80 dark:text-amber-300'>
                <Zap className='h-5 w-5 fill-amber-500 text-amber-600' />
              </div>
              <Badge className='border-amber-300 bg-amber-500/15 text-[10px] font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
                SPEED STAR ⚡
              </Badge>
            </div>

            <div>
              <span className='text-[11px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-400'>
                Pilar Tercepat Selesai
              </span>
              <h3 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                {summary.tercepat_pilar.pilar_kode}:{' '}
                {summary.tercepat_pilar.pilar_nama}
              </h3>
              <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                Koordinator:{' '}
                <strong className='text-slate-700 dark:text-slate-300'>
                  {summary.tercepat_pilar.koordinator_name}
                </strong>
              </p>
            </div>

            <div className='space-y-1.5 rounded-lg border border-amber-200/60 bg-white/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50'>
              <div className='flex items-center justify-between font-semibold'>
                <span className='text-slate-600 dark:text-slate-400'>
                  Verifikasi Berkas
                </span>
                <span className='text-amber-600 dark:text-amber-400'>
                  {summary.tercepat_pilar.persentase_selesai}% Selesai
                </span>
              </div>
              <Progress
                value={summary.tercepat_pilar.persentase_selesai}
                className='h-2 bg-amber-100 dark:bg-slate-700'
              />
              <div className='flex justify-between text-[10px] text-slate-500'>
                <span>
                  {summary.tercepat_pilar.indikator_diverifikasi} dari{' '}
                  {summary.tercepat_pilar.total_indikator} Indikator
                </span>
                <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                  100% Tuntas
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 2: Zero Revision Leader (Paling Teliti) */}
        <Card className='group relative overflow-hidden border-emerald-300 bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/30 p-4 shadow-xs transition-all hover:border-emerald-400 hover:shadow-md dark:border-emerald-700/70 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900'>
          <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500' />
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 shadow-2xs dark:bg-emerald-950/80 dark:text-emerald-300'>
                <ShieldCheck className='h-5 w-5 text-emerald-600' />
              </div>
              <Badge className='border-emerald-300 bg-emerald-500/15 text-[10px] font-bold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                CLEAN SHEET 🛡️
              </Badge>
            </div>

            <div>
              <span className='text-[11px] font-semibold tracking-wider text-emerald-700 uppercase dark:text-emerald-400'>
                Zero Revision Leader
              </span>
              <h3 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                {summary.zero_revisi_pilar.pilar_kode}:{' '}
                {summary.zero_revisi_pilar.pilar_nama}
              </h3>
              <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                Koordinator:{' '}
                <strong className='text-slate-700 dark:text-slate-300'>
                  {summary.zero_revisi_pilar.koordinator_name}
                </strong>
              </p>
            </div>

            <div className='space-y-1.5 rounded-lg border border-emerald-200/60 bg-white/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50'>
              <div className='flex items-center justify-between font-semibold'>
                <span className='text-slate-600 dark:text-slate-400'>
                  Tingkat Revisi
                </span>
                <span className='text-emerald-600 dark:text-emerald-400'>
                  {summary.zero_revisi_pilar.tingkat_revisi_persen}% (Nihil)
                </span>
              </div>
              <Progress
                value={100 - summary.zero_revisi_pilar.tingkat_revisi_persen}
                className='h-2 bg-emerald-100 dark:bg-slate-700'
              />
              <div className='flex justify-between text-[10px] text-slate-500'>
                <span>
                  {summary.zero_revisi_pilar.indikator_revisi} Catatan Perbaikan
                </span>
                <span className='font-medium text-emerald-600 dark:text-emerald-400'>
                  Dokumen Akurat
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Card 3: Top Score Champion (Skor Capaian Tertinggi) */}
        <Card className='group relative overflow-hidden border-indigo-300 bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/30 p-4 shadow-xs transition-all hover:border-indigo-400 hover:shadow-md dark:border-indigo-700/70 dark:from-indigo-950/30 dark:via-slate-900 dark:to-slate-900'>
          <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-indigo-400 to-purple-500' />
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 shadow-2xs dark:bg-indigo-950/80 dark:text-indigo-300'>
                <Trophy className='h-5 w-5 text-indigo-600' />
              </div>
              <Badge className='border-indigo-300 bg-indigo-500/15 text-[10px] font-bold text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'>
                TOP SCORE 💎
              </Badge>
            </div>

            <div>
              <span className='text-[11px] font-semibold tracking-wider text-indigo-700 uppercase dark:text-indigo-400'>
                Skor Capaian Tertinggi
              </span>
              <h3 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                {summary.skor_tertinggi_pilar.pilar_kode}:{' '}
                {summary.skor_tertinggi_pilar.pilar_nama}
              </h3>
              <p className='mt-0.5 text-xs text-slate-500 dark:text-slate-400'>
                Koordinator:{' '}
                <strong className='text-slate-700 dark:text-slate-300'>
                  {summary.skor_tertinggi_pilar.koordinator_name}
                </strong>
              </p>
            </div>

            <div className='space-y-1.5 rounded-lg border border-indigo-200/60 bg-white/70 p-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50'>
              <div className='flex items-center justify-between font-semibold'>
                <span className='text-slate-600 dark:text-slate-400'>
                  Perolehan Nilai
                </span>
                <span className='text-indigo-600 dark:text-indigo-400'>
                  {summary.skor_tertinggi_pilar.persentase_skor}%
                </span>
              </div>
              <Progress
                value={summary.skor_tertinggi_pilar.persentase_skor}
                className='h-2 bg-indigo-100 dark:bg-slate-700'
              />
              <div className='flex justify-between text-[10px] text-slate-500'>
                <span>
                  Skor: {summary.skor_tertinggi_pilar.skor_riil.toFixed(2)} /{' '}
                  {summary.skor_tertinggi_pilar.skor_maksimal.toFixed(2)}
                </span>
                <span className='font-medium text-indigo-600 dark:text-indigo-400'>
                  Maksimal
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Visualisasi Podium Juara Top 3 (Gold, Silver, Bronze) */}
      <Card className='overflow-hidden border-slate-200/80 bg-gradient-to-b from-slate-50/70 via-white to-white p-5 shadow-xs dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-900'>
        <div className='mb-6 flex flex-col items-center justify-center text-center'>
          <div className='flex items-center gap-2'>
            <Flame className='h-4 w-4 text-amber-500' />
            <h2 className='text-lg font-bold text-slate-900 dark:text-slate-100'>
              Podium Kehormatan Top 3 Pilar
            </h2>
            <Flame className='h-4 w-4 text-amber-500' />
          </div>
          <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
            Apresiasi istimewa bagi pilar dengan konsistensi pengumpulan dan
            verifikasi tercepat tanpa catatan revisi.
          </p>
        </div>

        {/* Podium Structure: Rank 2 (Left), Rank 1 (Center Elevated), Rank 3 (Right) */}
        <div className='grid grid-cols-3 items-end gap-2 sm:gap-4 md:px-12'>
          {/* JUARA 2: PERAK (Silver) */}
          <div className='flex flex-col items-center'>
            <div className='mb-2 text-center'>
              <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-slate-300 bg-gradient-to-br from-slate-100 to-slate-300 text-slate-700 shadow-sm dark:border-slate-500 dark:from-slate-700 dark:to-slate-900 dark:text-slate-200'>
                <Medal className='h-5 w-5' />
              </div>
              <Badge className='mt-1.5 border-slate-300 bg-slate-200/80 text-[10px] font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200'>
                Peringkat 2
              </Badge>
              <h4 className='mt-1 line-clamp-1 text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-200'>
                {rank2.pilar_kode}
              </h4>
              <p className='line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400'>
                {rank2.koordinator_name}
              </p>
            </div>

            {/* Podium Step 2 */}
            <div className='dark:to-slate-750 flex w-full flex-col justify-between rounded-t-xl border-t border-r border-l border-slate-300 bg-gradient-to-t from-slate-200/90 to-slate-100/90 p-3 text-center shadow-xs sm:h-40 dark:border-slate-700 dark:from-slate-800'>
              <div className='space-y-1'>
                <div className='text-lg font-black text-slate-700 sm:text-2xl dark:text-slate-200'>
                  2
                </div>
                <div className='text-[11px] font-bold text-slate-800 dark:text-slate-200'>
                  {rank2.persentase_selesai}%
                </div>
                <div className='text-[9px] text-slate-500 dark:text-slate-400'>
                  Revisi: {rank2.tingkat_revisi_persen}%
                </div>
              </div>
              <Link href={rank2.tautan_form}>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-6 w-full text-[10px] text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                >
                  Buka LKE <ArrowUpRight className='ml-0.5 h-2.5 w-2.5' />
                </Button>
              </Link>
            </div>
          </div>

          {/* JUARA 1: EMAS (Gold - Elevated) */}
          <div className='flex flex-col items-center'>
            <div className='mb-2 text-center'>
              <div className='relative mx-auto flex h-13 w-13 items-center justify-center rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 text-amber-950 shadow-md ring-4 ring-amber-100 dark:ring-amber-950/60'>
                <Crown className='h-7 w-7' />
                <span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white'>
                  1
                </span>
              </div>
              <Badge className='mt-1.5 border-amber-400 bg-amber-500 text-[10px] font-extrabold text-white shadow-2xs'>
                🏆 JUARA 1 SATKER
              </Badge>
              <h4 className='mt-1 line-clamp-1 text-xs font-bold text-slate-900 sm:text-base dark:text-slate-100'>
                {rank1.pilar_kode}
              </h4>
              <p className='line-clamp-1 text-[10px] font-medium text-slate-600 dark:text-slate-400'>
                {rank1.koordinator_name}
              </p>
            </div>

            {/* Podium Step 1 */}
            <div className='flex w-full flex-col justify-between rounded-t-xl border-t-2 border-r-2 border-l-2 border-amber-400 bg-gradient-to-t from-amber-200/90 via-amber-100/90 to-amber-50/90 p-3 text-center shadow-md sm:h-52 dark:border-amber-600 dark:from-amber-950/60 dark:via-amber-900/40 dark:to-slate-800'>
              <div className='space-y-1'>
                <div className='text-2xl font-black text-amber-900 sm:text-4xl dark:text-amber-200'>
                  1
                </div>
                <div className='text-xs font-extrabold text-amber-900 sm:text-sm dark:text-amber-300'>
                  {rank1.persentase_selesai}% Selesai
                </div>
                <div className='text-[10px] font-semibold text-emerald-700 dark:text-emerald-400'>
                  Zero Revision • Skor {rank1.skor_riil.toFixed(2)}
                </div>
              </div>
              <Link href={rank1.tautan_form}>
                <Button
                  size='sm'
                  className='h-7 w-full bg-amber-500 text-[10px] font-bold text-white shadow-2xs hover:bg-amber-600'
                >
                  Buka LKE <ArrowUpRight className='ml-0.5 h-3 w-3' />
                </Button>
              </Link>
            </div>
          </div>

          {/* JUARA 3: PERUNGGU (Bronze) */}
          <div className='flex flex-col items-center'>
            <div className='mb-2 text-center'>
              <div className='mx-auto flex h-10 w-10 items-center justify-center rounded-full border-2 border-amber-600 bg-gradient-to-br from-amber-100 to-amber-200 text-amber-800 shadow-sm dark:border-amber-700 dark:from-amber-950 dark:to-slate-800 dark:text-amber-300'>
                <Award className='h-5 w-5' />
              </div>
              <Badge className='mt-1.5 border-amber-600/40 bg-amber-100/80 text-[10px] font-bold text-amber-900 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-300'>
                Peringkat 3
              </Badge>
              <h4 className='mt-1 line-clamp-1 text-xs font-bold text-slate-800 sm:text-sm dark:text-slate-200'>
                {rank3.pilar_kode}
              </h4>
              <p className='line-clamp-1 text-[10px] text-slate-500 dark:text-slate-400'>
                {rank3.koordinator_name}
              </p>
            </div>

            {/* Podium Step 3 */}
            <div className='dark:to-slate-750 flex w-full flex-col justify-between rounded-t-xl border-t border-r border-l border-amber-600/50 bg-gradient-to-t from-amber-100/80 to-amber-50/70 p-3 text-center shadow-xs sm:h-36 dark:border-amber-800 dark:from-slate-800'>
              <div className='space-y-1'>
                <div className='text-lg font-black text-amber-900 sm:text-2xl dark:text-amber-300'>
                  3
                </div>
                <div className='text-[11px] font-bold text-slate-800 dark:text-slate-200'>
                  {rank3.persentase_selesai}%
                </div>
                <div className='text-[9px] text-slate-500 dark:text-slate-400'>
                  Revisi: {rank3.tingkat_revisi_persen}%
                </div>
              </div>
              <Link href={rank3.tautan_form}>
                <Button
                  size='sm'
                  variant='ghost'
                  className='h-6 w-full text-[10px] text-slate-700 hover:bg-slate-200 dark:text-slate-300 dark:hover:bg-slate-700'
                >
                  Buka LKE <ArrowUpRight className='ml-0.5 h-2.5 w-2.5' />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabel Lengkap Peringkat 6 Pilar */}
      <Card className='border-slate-200/80 shadow-xs dark:border-slate-800'>
        <CardHeader className='border-b border-slate-100 pb-4 dark:border-slate-800'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div>
              <CardTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                Klasemen Lengkap Capaian 6 Pilar
              </CardTitle>
              <CardDescription className='text-xs'>
                Transparansi perolehan verifikasi bukti, tingkat revisi, dan
                skor riil.
              </CardDescription>
            </div>

            {/* Filter Buttons */}
            <div className='flex flex-wrap items-center gap-1.5'>
              <Button
                variant={activeFilter === 'ALL' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveFilter('ALL')}
                className='h-7.5 text-xs'
              >
                Semua Pilar ({summary.items.length})
              </Button>
              <Button
                variant={activeFilter === 'PODIUM' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveFilter('PODIUM')}
                className='h-7.5 text-xs'
              >
                Top 3 Podium
              </Button>
              <Button
                variant={activeFilter === 'ZERO_REVISI' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveFilter('ZERO_REVISI')}
                className='h-7.5 text-xs'
              >
                Zero Revision Leader
              </Button>
              <Button
                variant={activeFilter === 'NEEDS_BOOST' ? 'default' : 'outline'}
                size='sm'
                onClick={() => setActiveFilter('NEEDS_BOOST')}
                className='h-7.5 text-xs'
              >
                Perlu Akselerasi
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <Table>
              <TableHeader className='bg-slate-50/80 dark:bg-slate-900/60'>
                <TableRow>
                  <TableHead className='w-14 text-center'>Rank</TableHead>
                  <TableHead>Pilar &amp; Koordinator</TableHead>
                  <TableHead className='w-44'>Progres Verifikasi</TableHead>
                  <TableHead className='w-32 text-center'>
                    Tingkat Revisi
                  </TableHead>
                  <TableHead className='w-36 text-center'>Skor LKE</TableHead>
                  <TableHead>Predikat Apresiasi</TableHead>
                  <TableHead className='w-28 text-right'>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => {
                  const isTop1 = item.rank === 1;
                  const isTop2 = item.rank === 2;
                  const isTop3 = item.rank === 3;

                  return (
                    <TableRow
                      key={item.pilar_id}
                      className={
                        isTop1
                          ? 'bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/15 dark:hover:bg-amber-950/25'
                          : ''
                      }
                    >
                      {/* Rank Column */}
                      <TableCell className='text-center font-bold'>
                        {isTop1 ? (
                          <div className='mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 font-extrabold text-amber-950 shadow-2xs'>
                            🥇
                          </div>
                        ) : isTop2 ? (
                          <div className='mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-slate-300 font-bold text-slate-800 shadow-2xs dark:bg-slate-700 dark:text-slate-200'>
                            🥈
                          </div>
                        ) : isTop3 ? (
                          <div className='mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber-200 font-bold text-amber-900 shadow-2xs dark:bg-amber-900 dark:text-amber-200'>
                            🥉
                          </div>
                        ) : (
                          <span className='inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
                            {item.rank}
                          </span>
                        )}
                      </TableCell>

                      {/* Pilar & Koordinator Column */}
                      <TableCell>
                        <div className='space-y-0.5'>
                          <div className='flex items-center gap-2'>
                            <span className='font-bold text-slate-900 dark:text-slate-100'>
                              {item.pilar_kode}: {item.pilar_nama}
                            </span>
                          </div>
                          <div className='flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400'>
                            <span>Koordinator: {item.koordinator_name}</span>
                            <span>•</span>
                            <a
                              href={`https://wa.me/${item.koordinator_phone.replace(/\D/g, '')}`}
                              target='_blank'
                              rel='noopener noreferrer'
                              className='inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 hover:underline dark:text-emerald-400'
                            >
                              <Phone className='h-2.5 w-2.5' />
                              {item.koordinator_phone}
                            </a>
                          </div>
                          {item.catatan_apresiasi && (
                            <p className='text-[11px] text-slate-500 italic dark:text-slate-400'>
                              &ldquo;{item.catatan_apresiasi}&rdquo;
                            </p>
                          )}
                        </div>
                      </TableCell>

                      {/* Progres Verifikasi Column */}
                      <TableCell>
                        <div className='space-y-1.5'>
                          <div className='flex items-center justify-between text-xs font-semibold'>
                            <span className='text-slate-700 dark:text-slate-300'>
                              {item.persentase_selesai}%
                            </span>
                            <span className='text-[10px] text-slate-500'>
                              {item.indikator_diverifikasi}/
                              {item.total_indikator}
                            </span>
                          </div>
                          <Progress
                            value={item.persentase_selesai}
                            className={`h-2 ${
                              item.persentase_selesai >= 100
                                ? '[&>div]:bg-emerald-500'
                                : item.persentase_selesai >= 80
                                  ? '[&>div]:bg-blue-500'
                                  : '[&>div]:bg-amber-500'
                            }`}
                          />
                        </div>
                      </TableCell>

                      {/* Tingkat Revisi Column */}
                      <TableCell className='text-center'>
                        {item.indikator_revisi === 0 ? (
                          <Badge className='border-emerald-300 bg-emerald-500/15 text-[10px] font-semibold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'>
                            <CheckCircle2 className='mr-1 h-3 w-3' />
                            0% (Nihil)
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='border-amber-300 bg-amber-50 text-[10px] text-amber-800 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                          >
                            {item.tingkat_revisi_persen}% (
                            {item.indikator_revisi} revisi)
                          </Badge>
                        )}
                      </TableCell>

                      {/* Skor Column */}
                      <TableCell className='text-center'>
                        <div className='space-y-0.5'>
                          <div className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                            {item.skor_riil.toFixed(2)} /{' '}
                            {item.skor_maksimal.toFixed(2)}
                          </div>
                          <div className='text-[10px] font-medium text-indigo-600 dark:text-indigo-400'>
                            ({item.persentase_skor}%)
                          </div>
                        </div>
                      </TableCell>

                      {/* Predikat Apresiasi Column */}
                      <TableCell>
                        {item.status_predikat === 'TERCEPAT_SELESAI' ? (
                          <Badge className='border-amber-300 bg-amber-500 text-[10px] font-bold text-white shadow-2xs'>
                            ⚡ Speed Star (100%)
                          </Badge>
                        ) : item.status_predikat === 'ZERO_REVISI' ? (
                          <Badge className='border-emerald-300 bg-emerald-600 text-[10px] font-bold text-white shadow-2xs'>
                            🛡️ Zero Revision Leader
                          </Badge>
                        ) : item.status_predikat === 'SKOR_TERTINGGI' ? (
                          <Badge className='border-indigo-300 bg-indigo-600 text-[10px] font-bold text-white shadow-2xs'>
                            💎 Top Score Champion
                          </Badge>
                        ) : item.status_predikat === 'ON_TRACK' ? (
                          <Badge
                            variant='outline'
                            className='border-blue-300 bg-blue-50 text-[10px] font-medium text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                          >
                            🎯 On Track (&gt;75%)
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='border-rose-300 bg-rose-50 text-[10px] font-medium text-rose-700 dark:border-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          >
                            ⚠️ Perlu Dorongan
                          </Badge>
                        )}
                      </TableCell>

                      {/* Aksi Column */}
                      <TableCell className='text-right'>
                        <Link href={item.tautan_form}>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7.5 gap-1 text-[11px] font-semibold text-blue-700 hover:bg-blue-50 dark:text-blue-300'
                          >
                            <span>Buka LKE</span>
                            <ArrowUpRight className='h-3 w-3' />
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Dialog Bagikan ke WhatsApp Tim */}
      <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
        <DialogContent className='max-w-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
              <Share2 className='h-5 w-5 text-emerald-600' />
              <span>Bagikan Apresiasi Leaderboard ke WhatsApp Tim</span>
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Pesan apresiasi resmi Kepala BPS Sitaro yang siap diteruskan ke
              grup WhatsApp Tim Reformasi Birokrasi BPS Sitaro.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2'>
            <div className='relative max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs whitespace-pre-wrap text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'>
              {generateWhatsAppLeaderboardMessage(summary)}
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={handleCopyMessage}
              className='gap-1.5 text-xs'
            >
              {copied ? (
                <>
                  <Check className='h-3.5 w-3.5 text-emerald-600' />
                  <span>Tersalin!</span>
                </>
              ) : (
                <>
                  <Copy className='h-3.5 w-3.5' />
                  <span>Salin Pesan</span>
                </>
              )}
            </Button>
            <Button
              onClick={handleShareToWhatsApp}
              className='gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700'
            >
              <ExternalLink className='h-3.5 w-3.5' />
              <span>Buka WhatsApp Web / App</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
