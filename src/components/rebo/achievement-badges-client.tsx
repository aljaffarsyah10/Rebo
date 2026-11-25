'use client';

import React, { useState, useTransition, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Medal,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Flame,
  Sparkles,
  Crown,
  FileCheck,
  Lock,
  Share2,
  Copy,
  ExternalLink,
  Send,
  Check,
  Filter,
  Search,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldAlert,
  Calendar,
  User,
  Layers,
  ArrowRight
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
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  type AchievementBadge,
  type BadgeCategory,
  type BadgeTier,
  BADGE_TIER_CONFIGS,
  formatBadgeMilestoneWAMessage
} from '@/lib/gamification/badge-types';
import {
  getAchievementBadgesAction,
  sendBadgeMilestoneWAAction
} from '@/actions/badge-actions';

interface AchievementBadgesClientProps {
  initialBadges: AchievementBadge[];
  initialSummary?: {
    totalBadges: number;
    totalUnlocked: number;
    totalLocked: number;
    platinumUnlocked: number;
    goldUnlocked: number;
    silverUnlocked: number;
    bronzeUnlocked: number;
    pilars: {
      pilar_id: string;
      pilar_nama: string;
      pilar_kode: string;
      koordinator_name: string;
      unlocked_count: number;
      total_count: number;
    }[];
  };
  defaultPilarFilter?: string;
  compactView?: boolean;
}

export function AchievementBadgesClient({
  initialBadges,
  initialSummary,
  defaultPilarFilter = 'ALL',
  compactView = false
}: AchievementBadgesClientProps) {
  const [badges, setBadges] = useState<AchievementBadge[]>(initialBadges);
  const [summary, setSummary] = useState(initialSummary);
  const [selectedPilar, setSelectedPilar] =
    useState<string>(defaultPilarFilter);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<
    'ALL' | 'UNLOCKED' | 'LOCKED'
  >('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(
    null
  );

  const [isPending, startTransition] = useTransition();
  const [isSendingWA, setIsSendingWA] = useState(false);
  const [copied, setCopied] = useState(false);

  // Render icon dinamis sesuai icon_name
  const renderBadgeIcon = (
    iconName: string,
    tier: BadgeTier,
    isUnlocked: boolean,
    size = 'md'
  ) => {
    const sizeClasses =
      size === 'lg'
        ? 'h-8 w-8'
        : size === 'xl'
          ? 'h-12 w-12'
          : size === 'sm'
            ? 'h-4 w-4'
            : 'h-6 w-6';

    if (!isUnlocked) {
      return (
        <Lock className={`${sizeClasses} text-slate-400 dark:text-slate-500`} />
      );
    }

    const tierColor =
      tier === 'PLATINUM'
        ? 'text-cyan-500 fill-cyan-500/20'
        : tier === 'GOLD'
          ? 'text-amber-500 fill-amber-500/20'
          : tier === 'SILVER'
            ? 'text-slate-500 fill-slate-400/20'
            : 'text-amber-800 fill-amber-800/20';

    switch (iconName) {
      case 'Zap':
        return <Zap className={`${sizeClasses} ${tierColor}`} />;
      case 'ShieldCheck':
        return <ShieldCheck className={`${sizeClasses} ${tierColor}`} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={`${sizeClasses} ${tierColor}`} />;
      case 'FileCheck':
        return <FileCheck className={`${sizeClasses} ${tierColor}`} />;
      case 'Award':
        return <Award className={`${sizeClasses} ${tierColor}`} />;
      case 'Sparkles':
        return <Sparkles className={`${sizeClasses} ${tierColor}`} />;
      case 'Crown':
        return <Crown className={`${sizeClasses} ${tierColor}`} />;
      case 'Flame':
        return <Flame className={`${sizeClasses} ${tierColor}`} />;
      default:
        return <Medal className={`${sizeClasses} ${tierColor}`} />;
    }
  };

  // Reload data
  const handleRefresh = () => {
    startTransition(async () => {
      try {
        const res = await getAchievementBadgesAction(selectedPilar);
        if (res.success && res.data) {
          setBadges(res.data.badges);
          setSummary(res.data.summary);
          toast.success('Koleksi lencana penghargaan berhasil diperbarui!');
        } else {
          toast.error(res.error || 'Gagal memuat pembaruan lencana');
        }
      } catch {
        toast.error('Terjadi kesalahan jaringan saat memperbarui data');
      }
    });
  };

  // Switch filter pilar dengan server re-fetch jika perlu
  const handlePilarChange = (val: string) => {
    setSelectedPilar(val);
    startTransition(async () => {
      const res = await getAchievementBadgesAction(val);
      if (res.success && res.data) {
        setBadges(res.data.badges);
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    });
  };

  // Filtered badges di client
  const filteredBadges = useMemo(() => {
    return badges.filter((b) => {
      // Category filter
      if (selectedCategory !== 'ALL' && b.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'UNLOCKED' && !b.unlocked) return false;
      if (selectedStatus === 'LOCKED' && b.unlocked) return false;
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = b.title.toLowerCase().includes(q);
        const matchDesc = b.description.toLowerCase().includes(q);
        const matchPilar = (b.pilar_nama || '').toLowerCase().includes(q);
        const matchCriteria = b.criteria_summary.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchPilar && !matchCriteria) {
          return false;
        }
      }
      return true;
    });
  }, [badges, selectedCategory, selectedStatus, searchQuery]);

  // Handler kirim WhatsApp resmi Kepala BPS
  const handleSendWA = async () => {
    if (!selectedBadge || !selectedBadge.pilar_id) return;

    setIsSendingWA(true);
    try {
      const res = await sendBadgeMilestoneWAAction(
        selectedBadge.id,
        selectedBadge.pilar_id
      );

      if (res.success) {
        toast.success(
          `Apresiasi lencana "${selectedBadge.title}" berhasil dikirimkan ke Koordinator ${selectedBadge.pilar_nama || ''}!`
        );
        if (res.deepLink) {
          window.open(res.deepLink, '_blank');
        }
      } else {
        toast.error(
          res.error || 'Gagal mengirim notifikasi apresiasi WhatsApp'
        );
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan saat mengirim pesan WhatsApp');
    } finally {
      setIsSendingWA(false);
    }
  };

  const handleCopyMessage = () => {
    if (!selectedBadge) return;
    const msg = formatBadgeMilestoneWAMessage({
      badge: selectedBadge,
      pilarNama: selectedBadge.pilar_nama || 'Tim Kerja ZI Sitaro',
      koordinatorName: selectedBadge.recipient_name || 'Koordinator Pilar',
      tahun: 2026
    });

    navigator.clipboard.writeText(msg);
    setCopied(true);
    toast.success('Teks apresiasi resmi Kepala BPS berhasil disalin!');
    setTimeout(() => setCopied(false), 3000);
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const totalCount = badges.length;

  return (
    <div className='space-y-6'>
      {/* Header Banner Galeri Lencana */}
      {!compactView && (
        <div className='relative overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-br from-amber-500/10 via-yellow-500/5 to-indigo-500/10 p-5 shadow-xs dark:border-amber-900/50 dark:from-amber-950/40 dark:via-slate-900 dark:to-indigo-950/30'>
          <div className='absolute -top-12 -right-12 h-44 w-44 rounded-full bg-amber-400/10 blur-3xl' />
          <div className='relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-2'>
                <Badge className='border-amber-400/50 bg-amber-500/20 text-xs font-bold text-amber-800 dark:border-amber-700 dark:text-amber-300'>
                  🏅 DIGITAL RECOGNITION HUB
                </Badge>
                <span className='text-xs text-slate-500 dark:text-slate-400'>
                  8 Lencana Kehormatan ZI BPS Sitaro
                </span>
              </div>
              <h2 className='text-2xl font-black tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
                Lencana Penghargaan Digital &amp; Apresiasi Tim
              </h2>
              <p className='max-w-2xl text-xs leading-relaxed text-slate-600 md:text-sm dark:text-slate-300'>
                Apresiasi visual otomatis atas pencapaian milestone reformasi
                birokrasi, ketelitian dokumen (Zero Revision), kecepatan
                verifikasi, dan penegakan benteng integritas 6 Pilar BPS
                Kabupaten Kepulauan Sitaro.
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                onClick={handleRefresh}
                disabled={isPending}
                variant='outline'
                size='sm'
                className='h-9 gap-1.5 border-amber-300/80 bg-white px-3 text-xs font-semibold text-slate-800 shadow-2xs hover:bg-amber-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${isPending ? 'animate-spin text-amber-600' : ''}`}
                />
                <span>Perbarui Data</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Ringkasan Statistik Lencana (Tier Counts) */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        {/* Platinum */}
        <Card className='border-cyan-200/80 bg-gradient-to-br from-cyan-50/80 to-white shadow-2xs dark:border-cyan-900/60 dark:from-cyan-950/30 dark:to-slate-900'>
          <CardContent className='flex items-center justify-between p-3.5'>
            <div>
              <div className='text-[10px] font-bold tracking-wider text-cyan-700 uppercase dark:text-cyan-400'>
                Tier Platinum
              </div>
              <div className='text-xl font-black text-slate-900 dark:text-slate-100'>
                {summary?.platinumUnlocked ?? 0}
              </div>
              <div className='text-[10px] text-slate-500 dark:text-slate-400'>
                Pencapaian Elite ZI
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600 shadow-2xs dark:bg-cyan-950/80 dark:text-cyan-300'>
              <Crown className='h-5 w-5' />
            </div>
          </CardContent>
        </Card>

        {/* Gold */}
        <Card className='border-amber-200/80 bg-gradient-to-br from-amber-50/80 to-white shadow-2xs dark:border-amber-900/60 dark:from-amber-950/30 dark:to-slate-900'>
          <CardContent className='flex items-center justify-between p-3.5'>
            <div>
              <div className='text-[10px] font-bold tracking-wider text-amber-700 uppercase dark:text-amber-400'>
                Tier Emas (Gold)
              </div>
              <div className='text-xl font-black text-slate-900 dark:text-slate-100'>
                {summary?.goldUnlocked ?? 0}
              </div>
              <div className='text-[10px] text-slate-500 dark:text-slate-400'>
                Capaian Utama Pilar
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-600 shadow-2xs dark:bg-amber-950/80 dark:text-amber-300'>
              <Award className='h-5 w-5' />
            </div>
          </CardContent>
        </Card>

        {/* Silver */}
        <Card className='border-slate-300/80 bg-gradient-to-br from-slate-100/80 to-white shadow-2xs dark:border-slate-700 dark:from-slate-800/40 dark:to-slate-900'>
          <CardContent className='flex items-center justify-between p-3.5'>
            <div>
              <div className='text-[10px] font-bold tracking-wider text-slate-700 uppercase dark:text-slate-300'>
                Tier Perak (Silver)
              </div>
              <div className='text-xl font-black text-slate-900 dark:text-slate-100'>
                {summary?.silverUnlocked ?? 0}
              </div>
              <div className='text-[10px] text-slate-500 dark:text-slate-400'>
                Kepatuhan Dokumen
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-slate-200 text-slate-700 shadow-2xs dark:bg-slate-800 dark:text-slate-300'>
              <Medal className='h-5 w-5' />
            </div>
          </CardContent>
        </Card>

        {/* Total Terbuka */}
        <Card className='border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 to-white shadow-2xs dark:border-emerald-900/60 dark:from-emerald-950/30 dark:to-slate-900'>
          <CardContent className='flex items-center justify-between p-3.5'>
            <div>
              <div className='text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-400'>
                Total Terbuka
              </div>
              <div className='text-xl font-black text-emerald-600 dark:text-emerald-400'>
                {unlockedCount} / {totalCount}
              </div>
              <div className='text-[10px] text-slate-500 dark:text-slate-400'>
                {Math.round((unlockedCount / (totalCount || 1)) * 100)}% Rasio
                Terpenuhi
              </div>
            </div>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 shadow-2xs dark:bg-emerald-950/80 dark:text-emerald-300'>
              <Sparkles className='h-5 w-5' />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Controls Bar */}
      <Card className='border-slate-200 bg-white/90 shadow-2xs backdrop-blur-xs dark:border-slate-800 dark:bg-slate-900/80'>
        <CardContent className='flex flex-col gap-3 p-3.5 md:flex-row md:items-center md:justify-between'>
          {/* Pilar Filter */}
          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300'>
              <Filter className='h-3.5 w-3.5 text-slate-500' />
              <span>Pilar:</span>
            </div>
            <Select value={selectedPilar} onValueChange={handlePilarChange}>
              <SelectTrigger className='h-8 w-48 text-xs font-medium'>
                <SelectValue placeholder='Pilih Pilar' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Semua 6 Pilar</SelectItem>
                <SelectItem value='1'>Pilar 1 - Perubahan</SelectItem>
                <SelectItem value='2'>Pilar 2 - Tatalaksana</SelectItem>
                <SelectItem value='3'>Pilar 3 - SDM</SelectItem>
                <SelectItem value='4'>Pilar 4 - Akuntabilitas</SelectItem>
                <SelectItem value='5'>Pilar 5 - Pengawasan</SelectItem>
                <SelectItem value='6'>Pilar 6 - Pelayanan Publik</SelectItem>
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className='h-8 w-44 text-xs font-medium'>
                <SelectValue placeholder='Kategori' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Semua Kategori</SelectItem>
                <SelectItem value='KECEPATAN'>Kecepatan</SelectItem>
                <SelectItem value='KUALITAS_DOKUMEN'>
                  Kualitas Dokumen
                </SelectItem>
                <SelectItem value='KEPATUHAN'>Kepatuhan</SelectItem>
                <SelectItem value='INTEGRITAS'>Integritas</SelectItem>
                <SelectItem value='INOVASI'>Inovasi</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <div className='flex items-center rounded-lg border border-slate-200 bg-slate-50 p-0.5 text-xs dark:border-slate-800 dark:bg-slate-800/50'>
              <button
                onClick={() => setSelectedStatus('ALL')}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                  selectedStatus === 'ALL'
                    ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-700 dark:text-slate-100'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Semua
              </button>
              <button
                onClick={() => setSelectedStatus('UNLOCKED')}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                  selectedStatus === 'UNLOCKED'
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Terbuka ({unlockedCount})
              </button>
              <button
                onClick={() => setSelectedStatus('LOCKED')}
                className={`rounded-md px-2 py-1 text-xs font-medium transition-all ${
                  selectedStatus === 'LOCKED'
                    ? 'bg-slate-700 text-white shadow-2xs dark:bg-slate-600'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400'
                }`}
              >
                Terkunci ({totalCount - unlockedCount})
              </button>
            </div>
          </div>

          {/* Search Box */}
          <div className='relative w-full md:w-64'>
            <Search className='absolute top-2.5 left-2.5 h-3.5 w-3.5 text-slate-400' />
            <Input
              type='text'
              placeholder='Cari nama lencana / kriteria...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-8 pl-8 text-xs'
            />
          </div>
        </CardContent>
      </Card>

      {/* Grid Galeri Lencana Visual 3D */}
      <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {filteredBadges.map((badge, idx) => {
          const tierConf = BADGE_TIER_CONFIGS[badge.tier];
          const isUnlocked = badge.unlocked;

          return (
            <div
              key={`${badge.id}-${badge.pilar_id || idx}`}
              className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border transition-all duration-300 ${
                isUnlocked
                  ? `border-slate-200/90 bg-gradient-to-b ${tierConf.gradientBg} shadow-sm hover:-translate-y-1 ${tierConf.glowClass} dark:border-slate-800`
                  : 'border-dashed border-slate-300/80 bg-slate-50/60 opacity-80 dark:border-slate-800 dark:bg-slate-900/40'
              }`}
            >
              {/* Ribbon Header Tier */}
              <div className='relative p-4 pb-2'>
                <div className='flex items-start justify-between gap-2'>
                  {/* Badge Icon 3D Container */}
                  <div
                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border transition-transform duration-300 group-hover:scale-105 ${
                      isUnlocked
                        ? `${tierConf.badgeBg} ${tierConf.borderColor} shadow-md`
                        : 'border-slate-300 bg-slate-200/70 dark:border-slate-700 dark:bg-slate-800/80'
                    }`}
                  >
                    {isUnlocked && (
                      <div className='absolute inset-0 rounded-2xl bg-white/20 opacity-0 blur-xs transition-opacity group-hover:opacity-100' />
                    )}
                    {renderBadgeIcon(
                      badge.icon_name,
                      badge.tier,
                      isUnlocked,
                      'lg'
                    )}
                  </div>

                  {/* Tier & Category Badges */}
                  <div className='flex flex-col items-end gap-1'>
                    <Badge
                      className={`text-[9px] font-black tracking-wider uppercase ${
                        isUnlocked
                          ? `${tierConf.badgeBg} ${tierConf.textColor} border ${tierConf.borderColor}`
                          : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {tierConf.tierIcon} {badge.tier}
                    </Badge>

                    <span className='rounded-sm bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                      {badge.category.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* Badge Title & Pilar */}
                <div className='mt-3 space-y-1'>
                  <div className='flex items-center gap-1.5'>
                    <h3 className='text-sm font-extrabold text-slate-900 group-hover:text-blue-600 dark:text-slate-100 dark:group-hover:text-blue-400'>
                      {badge.title}
                    </h3>
                  </div>

                  {badge.pilar_nama && (
                    <div className='flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300'>
                      <Layers className='h-3 w-3 text-slate-400' />
                      <span className='truncate'>
                        {badge.pilar_kode || badge.pilar_nama}
                      </span>
                    </div>
                  )}

                  <p className='line-clamp-2 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400'>
                    {badge.description}
                  </p>
                </div>
              </div>

              {/* Card Footer: Progress & Milestone */}
              <div className='mt-3 space-y-2.5 border-t border-slate-200/60 bg-white/60 p-3.5 backdrop-blur-xs dark:border-slate-800/80 dark:bg-slate-900/60'>
                {isUnlocked ? (
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                      <span className='flex items-center gap-1'>
                        <CheckCircle2 className='h-3 w-3' />
                        <span>Terbuka (Unlocked)</span>
                      </span>
                      <span className='text-[10px] text-slate-500 dark:text-slate-400'>
                        {badge.unlocked_at || 'Nov 2026'}
                      </span>
                    </div>

                    {badge.milestone_description && (
                      <p className='line-clamp-1 text-[10px] text-slate-600 italic dark:text-slate-400'>
                        &ldquo;{badge.milestone_description}&rdquo;
                      </p>
                    )}
                  </div>
                ) : (
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between text-[10px] text-slate-500'>
                      <span>Progres Kriteria</span>
                      <span className='font-semibold'>
                        {badge.progress_percent || 0}%
                      </span>
                    </div>
                    <Progress
                      value={badge.progress_percent || 0}
                      className='h-1.5 bg-slate-200 dark:bg-slate-700'
                    />
                    <p className='line-clamp-1 text-[10px] text-slate-500'>
                      Syarat: {badge.criteria_summary}
                    </p>
                  </div>
                )}

                {/* Detail & Action Button */}
                <Button
                  onClick={() => setSelectedBadge(badge)}
                  variant={isUnlocked ? 'default' : 'outline'}
                  size='sm'
                  className={`h-8 w-full text-[11px] font-semibold transition-all ${
                    isUnlocked
                      ? 'bg-slate-900 text-white shadow-2xs hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
                      : 'border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {isUnlocked ? (
                    <span className='flex items-center gap-1'>
                      <Share2 className='h-3 w-3' />
                      <span>Lihat &amp; Apresiasi WA</span>
                    </span>
                  ) : (
                    <span className='flex items-center gap-1'>
                      <Info className='h-3 w-3' />
                      <span>Pelajari Kriteria</span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredBadges.length === 0 && (
        <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800'>
          <ShieldAlert className='h-10 w-10 text-slate-400' />
          <h4 className='mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200'>
            Tidak ada lencana yang cocok dengan kriteria filter
          </h4>
          <p className='mt-1 text-xs text-slate-500'>
            Silakan reset filter pilar atau kategori lencana di atas.
          </p>
          <Button
            onClick={() => {
              setSelectedPilar('ALL');
              setSelectedCategory('ALL');
              setSelectedStatus('ALL');
              setSearchQuery('');
            }}
            variant='outline'
            size='sm'
            className='mt-3 text-xs'
          >
            Reset Seluruh Filter
          </Button>
        </div>
      )}

      {/* Modal Dialog Detail Lencana & WhatsApp Dispatcher */}
      <Dialog
        open={Boolean(selectedBadge)}
        onOpenChange={(open) => {
          if (!open) setSelectedBadge(null);
        }}
      >
        <DialogContent className='max-w-2xl'>
          {selectedBadge && (
            <>
              <DialogHeader>
                <div className='flex items-center gap-2'>
                  <Badge
                    className={`text-[10px] font-bold ${
                      BADGE_TIER_CONFIGS[selectedBadge.tier].badgeBg
                    } ${BADGE_TIER_CONFIGS[selectedBadge.tier].textColor}`}
                  >
                    {BADGE_TIER_CONFIGS[selectedBadge.tier].tierIcon} TIER{' '}
                    {selectedBadge.tier}
                  </Badge>
                  <Badge variant='outline' className='text-[10px]'>
                    {selectedBadge.category.replace('_', ' ')}
                  </Badge>
                  {selectedBadge.unlocked && (
                    <Badge className='bg-emerald-600 text-[10px] text-white'>
                      ✓ Terbuka ({selectedBadge.unlocked_at || 'Terbaru'})
                    </Badge>
                  )}
                </div>

                <DialogTitle className='mt-2 flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-slate-100'>
                  {renderBadgeIcon(
                    selectedBadge.icon_name,
                    selectedBadge.tier,
                    selectedBadge.unlocked,
                    'md'
                  )}
                  <span>{selectedBadge.title}</span>
                </DialogTitle>
                <DialogDescription className='text-xs'>
                  {selectedBadge.description}
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-2 text-xs'>
                {/* Pilar Penerima Info */}
                <div className='grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40'>
                  <div>
                    <span className='text-[10px] text-slate-500 dark:text-slate-400'>
                      Tim Kerja Penerima
                    </span>
                    <div className='font-bold text-slate-800 dark:text-slate-200'>
                      {selectedBadge.pilar_nama || 'Tim Kerja Zona Integritas'}
                    </div>
                  </div>
                  <div>
                    <span className='text-[10px] text-slate-500 dark:text-slate-400'>
                      Koordinator / PIC
                    </span>
                    <div className='font-bold text-slate-800 dark:text-slate-200'>
                      {selectedBadge.recipient_name || 'Franky Pontoh, S.Si'}
                    </div>
                  </div>
                </div>

                {/* Kriteria Resmi */}
                <div className='rounded-xl border border-amber-200/80 bg-amber-50/50 p-3 dark:border-amber-900/60 dark:bg-amber-950/20'>
                  <div className='flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300'>
                    <Info className='h-3.5 w-3.5' />
                    <span>Kriteria Kelayakan Lencana:</span>
                  </div>
                  <p className='mt-1 text-slate-700 dark:text-slate-300'>
                    {selectedBadge.criteria_summary}
                  </p>
                  {selectedBadge.milestone_description && (
                    <p className='mt-1 font-semibold text-emerald-700 dark:text-emerald-400'>
                      Capaian Riil: {selectedBadge.milestone_description}
                    </p>
                  )}
                </div>

                {/* Preview Pesan WhatsApp Resmi Kepala BPS */}
                <div className='space-y-1.5'>
                  <div className='flex items-center justify-between'>
                    <label className='font-semibold text-slate-800 dark:text-slate-200'>
                      Pratinjau Pesan Ucapan Selamat Kepala BPS Sitaro:
                    </label>
                    <span className='text-[10px] text-slate-500'>
                      Otomatis dipersonalisasi
                    </span>
                  </div>
                  <div className='relative max-h-56 overflow-y-auto rounded-xl border border-emerald-200 bg-emerald-50/30 p-3 font-mono text-[11px] whitespace-pre-wrap text-slate-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-slate-200'>
                    {formatBadgeMilestoneWAMessage({
                      badge: selectedBadge,
                      pilarNama:
                        selectedBadge.pilar_nama || 'Tim Kerja ZI Sitaro',
                      koordinatorName:
                        selectedBadge.recipient_name || 'Koordinator Pilar',
                      tahun: 2026
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className='flex-col gap-2 sm:flex-row sm:justify-between'>
                <Button
                  variant='outline'
                  size='sm'
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
                      <span>Salin Teks Apresiasi</span>
                    </>
                  )}
                </Button>

                <div className='flex items-center gap-2'>
                  <Button
                    onClick={handleSendWA}
                    disabled={isSendingWA}
                    size='sm'
                    className='gap-1.5 bg-emerald-600 text-xs text-white shadow-2xs hover:bg-emerald-700'
                  >
                    <Send
                      className={`h-3.5 w-3.5 ${isSendingWA ? 'animate-pulse' : ''}`}
                    />
                    <span>
                      {isSendingWA
                        ? 'Mengirim Notifikasi...'
                        : 'Kirim Apresiasi WhatsApp Resmi'}
                    </span>
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
