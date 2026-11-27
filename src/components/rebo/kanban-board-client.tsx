'use client';

import React, { useState, useTransition, useMemo, useCallback } from 'react';
import Link from 'next/link';
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
import {
  AlertTriangle,
  Clock,
  CheckCircle2,
  Search,
  ExternalLink,
  RefreshCw,
  User,
  ArrowRight,
  Filter,
  Kanban as KanbanIcon,
  X,
  Layers,
  ArrowUpRight,
  Sparkles,
  UserCheck,
  MessageSquare,
  Send,
  GripVertical,
  Coffee,
  Pin,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  getKanbanBoardData,
  sendKlarifikasiAction,
  updateKanbanCardStatusAction
} from '@/actions/kanban-actions';
import { PILAR_LIST } from '@/lib/auth/rbac';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import type {
  KanbanBoardData,
  KanbanIndicatorCard,
  PeriodeEvaluasi,
  StatusKelengkapan,
  UserProfileData
} from '@/types/rebo';
import { toast } from 'sonner';

export interface RevisionSLAInfo {
  daysRemaining: number;
  hoursRemaining: number;
  status: 'safe' | 'warning' | 'danger';
  label: string;
  badgeClass: string;
  deadlineDate: Date;
  isOverdue: boolean;
}

/**
 * Utilitas perhitungan SLA batas waktu tindak lanjut perbaikan indikator:
 * Standar batas tindak lanjut revisi: 7 hari kalender sejak verified_at.
 * - Sisa waktu > 3 hari: Badge soft green / blue ("Sisa X Hari")
 * - Sisa waktu 1-3 hari: Badge soft amber ("Sisa X Hari - Segera Perbaiki")
 * - Sisa waktu <= 0 hari: Badge soft rose/red ("Melewati Batas SLA")
 */
export function calculateRevisionSLA(
  verifiedAt?: string | null
): RevisionSLAInfo {
  const parsedTime = verifiedAt ? new Date(verifiedAt).getTime() : NaN;
  const baseTime = Number.isFinite(parsedTime) ? parsedTime : Date.now();
  const deadlineTime = baseTime + 7 * 24 * 60 * 60 * 1000;
  const deadlineDate = new Date(deadlineTime);
  const now = Date.now();
  const diffMs = deadlineTime - now;

  const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffMs <= 0 || daysRemaining <= 0) {
    return {
      daysRemaining: 0,
      hoursRemaining: 0,
      status: 'danger',
      label: 'Melewati Batas SLA',
      badgeClass:
        'border-rose-300 bg-rose-100/90 text-rose-800 font-medium dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-200 animate-pulse',
      deadlineDate,
      isOverdue: true
    };
  }

  if (daysRemaining <= 3) {
    return {
      daysRemaining,
      hoursRemaining,
      status: 'warning',
      label: `Sisa ${daysRemaining} Hari - Segera Perbaiki`,
      badgeClass:
        'border-amber-200/80 bg-amber-50 text-amber-800 font-medium dark:border-amber-800/60 dark:bg-amber-950/50 dark:text-amber-300',
      deadlineDate,
      isOverdue: false
    };
  }

  return {
    daysRemaining,
    hoursRemaining,
    status: 'safe',
    label: `Sisa ${daysRemaining} Hari`,
    badgeClass:
      'border-emerald-200/80 bg-emerald-50 text-emerald-700 font-medium dark:border-emerald-800/60 dark:bg-emerald-950/50 dark:text-emerald-300',
    deadlineDate,
    isOverdue: false
  };
}

interface KanbanBoardClientProps {
  initialData: KanbanBoardData;
  initialPeriodes: PeriodeEvaluasi[];
  currentUserProfile?: UserProfileData | null;
  currentUserId?: string | null;
}

export default function KanbanBoardClient({
  initialData,
  initialPeriodes,
  currentUserProfile,
  currentUserId
}: KanbanBoardClientProps) {
  const [data, setData] = useState<KanbanBoardData>(initialData);
  const [periodes] = useState<PeriodeEvaluasi[]>(initialPeriodes);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>(
    initialData.periode?.id || ''
  );
  const [selectedPilar, setSelectedPilar] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isMyTasksOnly, setIsMyTasksOnly] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();

  // State untuk Dialog Catatan & Klarifikasi Cepat
  const [selectedCardForKlarifikasi, setSelectedCardForKlarifikasi] =
    useState<KanbanIndicatorCard | null>(null);
  const [pesanKlarifikasi, setPesanKlarifikasi] = useState<string>('');
  const [isSubmittingKlarifikasi, setIsSubmittingKlarifikasi] =
    useState<boolean>(false);

  // State untuk Real-Time Drag-and-Drop
  const [draggedCard, setDraggedCard] = useState<{
    card: KanbanIndicatorCard;
    sourceCol: 'perluRevisi' | 'menungguReview' | 'disetujui';
  } | null>(null);
  const [dragOverCol, setDragOverCol] = useState<
    'perluRevisi' | 'menungguReview' | 'disetujui' | null
  >(null);

  // State untuk Text Clamping Toggle ("Lihat Selengkapnya" / "Sembunyikan")
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>(
    {}
  );

  const toggleExpandNote = (key: string) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleDragStart = (
    e: React.DragEvent,
    card: KanbanIndicatorCard,
    sourceCol: 'perluRevisi' | 'menungguReview' | 'disetujui'
  ) => {
    setDraggedCard({ card, sourceCol });
    e.dataTransfer.setData('text/plain', card.id_pertanyaan);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
    setDragOverCol(null);
  };

  const handleDragOver = (
    e: React.DragEvent,
    targetCol: 'perluRevisi' | 'menungguReview' | 'disetujui'
  ) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== targetCol) {
      setDragOverCol(targetCol);
    }
  };

  const handleDragLeave = (
    e: React.DragEvent,
    targetCol: 'perluRevisi' | 'menungguReview' | 'disetujui'
  ) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      if (dragOverCol === targetCol) {
        setDragOverCol(null);
      }
    }
  };

  const handleDrop = async (
    targetCol: 'perluRevisi' | 'menungguReview' | 'disetujui'
  ) => {
    if (!draggedCard) return;
    const { card, sourceCol } = draggedCard;
    setDragOverCol(null);
    setDraggedCard(null);

    if (sourceCol === targetCol) return;

    const columnTitleMap: Record<
      'perluRevisi' | 'menungguReview' | 'disetujui',
      string
    > = {
      perluRevisi: 'Perlu Revisi (To Do)',
      menungguReview: 'Menunggu Review (In Progress)',
      disetujui: 'Disetujui (Done)'
    };

    const statusMap: Record<
      'perluRevisi' | 'menungguReview' | 'disetujui',
      StatusKelengkapan
    > = {
      perluRevisi: 3,
      menungguReview: 1,
      disetujui: 2
    };

    const newStatus = statusMap[targetCol];
    const previousData = data;

    // 1. Optimistic Local State Update
    const updatedCard: KanbanIndicatorCard = {
      ...card,
      status_kelengkapan: newStatus,
      ...(targetCol === 'disetujui'
        ? {
            verified_by:
              card.verified_by ||
              currentUserProfile?.full_name ||
              'Verifikator',
            verified_at: new Date().toISOString()
          }
        : {})
    };

    setData((prev) => {
      const updatedSourceCards = prev.cards[sourceCol].filter(
        (c) => c.id_pertanyaan !== card.id_pertanyaan
      );
      const updatedTargetCards = [updatedCard, ...prev.cards[targetCol]];

      return {
        ...prev,
        cards: {
          ...prev.cards,
          [sourceCol]: updatedSourceCards,
          [targetCol]: updatedTargetCards
        },
        counts: {
          ...prev.counts,
          [sourceCol]: updatedSourceCards.length,
          [targetCol]: updatedTargetCards.length
        }
      };
    });

    const targetTitle = columnTitleMap[targetCol];

    // 2. Server Action Call with Automatic Rollback
    try {
      const res = await updateKanbanCardStatusAction({
        idPertanyaan: card.id_pertanyaan,
        idPeriode: selectedPeriodeId,
        newStatus,
        previousStatus: card.status_kelengkapan
      });

      if (res.success) {
        toast.success(
          `Kartu ${card.kode_indikator} berhasil dipindahkan ke kolom ${targetTitle}.`
        );
      } else {
        // Rollback to previous state
        setData(previousData);
        toast.error(
          res.error ||
            'Gagal memperbarui status di server. Posisi kartu dikembalikan.'
        );
      }
    } catch (err: any) {
      // Rollback on network failure
      setData(previousData);
      toast.error(
        err?.message ||
          'Terjadi gangguan koneksi. Posisi kartu dikembalikan ke semula.'
      );
    }
  };

  // Penentuan pilar tugas dan user id aktif
  const userPilar =
    currentUserProfile?.pilar_tugas ??
    currentUserProfile?.assigned_pilar_id ??
    null;
  const activeUserId = currentUserId || currentUserProfile?.id || null;

  // Helper pemeriksa apakah kartu relevan dengan pengguna login
  const isMyTaskCard = useCallback(
    (card: KanbanIndicatorCard) => {
      const matchPilar =
        userPilar !== null &&
        userPilar !== undefined &&
        String(card.pilar_id) === String(userPilar);

      const matchSubmitted =
        Boolean(activeUserId) &&
        Boolean(card.submitted_by_user_id) &&
        card.submitted_by_user_id === activeUserId;

      return Boolean(matchPilar || matchSubmitted);
    },
    [userPilar, activeUserId]
  );

  // Hitung total kartu "Tugas Saya"
  const myTasksCount = useMemo(() => {
    const allCards = [
      ...data.cards.perluRevisi,
      ...data.cards.menungguReview,
      ...data.cards.disetujui
    ];
    return allCards.filter(isMyTaskCard).length;
  }, [data.cards, isMyTaskCard]);

  const handleFetch = (overridePilar?: string, overridePeriode?: string) => {
    startTransition(async () => {
      try {
        const pid = overridePeriode || selectedPeriodeId;
        const pil = overridePilar !== undefined ? overridePilar : selectedPilar;
        const res = await getKanbanBoardData({
          periodeId: pid,
          pilarId: pil,
          search: searchQuery
        });
        if (res.success && res.data) {
          setData(res.data);
          if (overridePeriode) setSelectedPeriodeId(overridePeriode);
          if (overridePilar !== undefined) setSelectedPilar(overridePilar);
          toast.success('Papan Kanban berhasil diperbarui!');
        } else {
          toast.error(res.error || 'Gagal memuat papan Kanban.');
        }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : 'Gagal memuat papan Kanban.';
        toast.error(message);
      }
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPilar('ALL');
    setIsMyTasksOnly(false);
    handleFetch('ALL');
  };

  const handleOpenKlarifikasi = (card: KanbanIndicatorCard) => {
    setSelectedCardForKlarifikasi(card);
    setPesanKlarifikasi('');
  };

  const handleSubmitKlarifikasi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCardForKlarifikasi) return;
    if (!pesanKlarifikasi.trim()) {
      toast.error('Pesan klarifikasi tidak boleh kosong.');
      return;
    }

    setIsSubmittingKlarifikasi(true);
    try {
      const res = await sendKlarifikasiAction({
        idPertanyaan: selectedCardForKlarifikasi.id_pertanyaan,
        idPeriode: selectedPeriodeId,
        pesanKlarifikasi: pesanKlarifikasi.trim()
      });

      if (res.success && res.updatedCatatan) {
        toast.success(res.message || 'Klarifikasi berhasil disimpan!');
        const updatedCatatan = res.updatedCatatan;
        setData((prev) => {
          const updateCards = (cards: KanbanIndicatorCard[]) =>
            cards.map((c) =>
              c.id_pertanyaan === selectedCardForKlarifikasi.id_pertanyaan
                ? { ...c, catatan_operator: updatedCatatan }
                : c
            );
          return {
            ...prev,
            cards: {
              perluRevisi: updateCards(prev.cards.perluRevisi),
              menungguReview: updateCards(prev.cards.menungguReview),
              disetujui: updateCards(prev.cards.disetujui)
            }
          };
        });

        setSelectedCardForKlarifikasi((prev) =>
          prev ? { ...prev, catatan_operator: updatedCatatan } : null
        );
        setPesanKlarifikasi('');
      } else {
        toast.error(res.error || 'Gagal mengirim klarifikasi.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmittingKlarifikasi(false);
    }
  };

  const filteredCards = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    const filterFn = (card: KanbanIndicatorCard) => {
      // 1. Filter Tugas Saya jika aktif
      if (isMyTasksOnly && !isMyTaskCard(card)) {
        return false;
      }

      // 2. Filter Pencarian Teks
      if (q) {
        const matchSearch =
          card.kode_indikator.toLowerCase().includes(q) ||
          card.uraian_singkat.toLowerCase().includes(q) ||
          card.uraian_pertanyaan.toLowerCase().includes(q) ||
          card.pilar_nama.toLowerCase().includes(q) ||
          card.subpilar_nama.toLowerCase().includes(q) ||
          (card.catatan_koordinator || '').toLowerCase().includes(q) ||
          (card.catatan_operator || '').toLowerCase().includes(q) ||
          (card.verified_by || '').toLowerCase().includes(q) ||
          (card.submitted_by_name || '').toLowerCase().includes(q);
        if (!matchSearch) return false;
      }

      return true;
    };

    return {
      perluRevisi: data.cards.perluRevisi.filter(filterFn),
      menungguReview: data.cards.menungguReview.filter(filterFn),
      disetujui: data.cards.disetujui.filter(filterFn)
    };
  }, [data.cards, searchQuery, isMyTasksOnly, isMyTaskCard]);

  const totalFilteredCount =
    filteredCards.perluRevisi.length +
    filteredCards.menungguReview.length +
    filteredCards.disetujui.length;

  const hasActiveFilters =
    searchQuery.trim() !== '' || selectedPilar !== 'ALL' || isMyTasksOnly;

  return (
    <div className='container mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8'>
      {/* 1. Header / Hero Section (Calm & Elegant Pastel Modern) */}
      <div className='relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50/90 via-white to-slate-50/70 p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-900 dark:to-slate-950'>
        <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-2.5'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='border-slate-300/70 bg-white/80 font-medium text-slate-700 shadow-2xs dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
              >
                <KanbanIcon className='mr-1.5 h-3.5 w-3.5 text-slate-500 dark:text-slate-400' />
                Action Center & Follow-Up
              </Badge>
              {data.periode && (
                <Badge
                  variant='secondary'
                  className='bg-slate-200/60 font-normal text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                >
                  {data.periode.nama_periode} ({data.periode.tahun})
                </Badge>
              )}
            </div>
            <h1 className='text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100'>
              Kanban Tindak Lanjut RB
            </h1>
            <p className='max-w-2xl text-xs text-slate-600 sm:text-sm dark:text-slate-400'>
              Papan kendali terstruktur untuk mempercepat tindak lanjut
              indikator yang memerlukan perbaikan, memantau berkas usulan
              review, serta melacak persetujuan bukti dukung LKE BPS Sitaro.
            </p>
          </div>

          {/* Quick Action Links */}
          <div className='flex flex-wrap items-center gap-2.5'>
            <Link href='/rebo/monitoring'>
              <Button
                variant='outline'
                size='sm'
                className='h-9 rounded-xl border-slate-200 bg-white/80 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
              >
                <span>Monitoring Progres</span>
                <ArrowUpRight className='ml-1.5 h-3.5 w-3.5 text-slate-400' />
              </Button>
            </Link>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleFetch()}
              disabled={isPending}
              className='h-9 rounded-xl border-slate-200 bg-white/80 text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 text-slate-500 dark:text-slate-400 ${
                  isPending ? 'animate-spin' : ''
                }`}
              />
              Perbarui Board
            </Button>
          </div>
        </div>
      </div>

      {/* 2. KPI Summary Strip (Clean & Balanced Pastel Cards) */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4'>
        {/* Total Active */}
        <div className='flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-3.5 shadow-2xs sm:p-4 dark:border-slate-800 dark:bg-slate-900/80'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'>
            <Layers className='h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='text-xs font-medium text-slate-500 dark:text-slate-400'>
              Total Terfilter
            </div>
            <div className='text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-slate-100'>
              {totalFilteredCount}
            </div>
          </div>
        </div>

        {/* Perlu Revisi */}
        <div className='flex items-center gap-3 rounded-2xl border border-rose-200/60 bg-rose-50/40 p-3.5 shadow-2xs sm:p-4 dark:border-rose-900/30 dark:bg-rose-950/20'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100/90 text-rose-600 dark:bg-rose-900/50 dark:text-rose-300'>
            <AlertTriangle className='h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='text-xs font-medium text-rose-800/80 dark:text-rose-300/80'>
              Perlu Revisi
            </div>
            <div className='text-lg font-bold tracking-tight text-rose-900 sm:text-xl dark:text-rose-200'>
              {filteredCards.perluRevisi.length}
            </div>
          </div>
        </div>

        {/* Menunggu Review */}
        <div className='flex items-center gap-3 rounded-2xl border border-amber-200/60 bg-amber-50/40 p-3.5 shadow-2xs sm:p-4 dark:border-amber-900/30 dark:bg-amber-950/20'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100/90 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'>
            <Clock className='h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='text-xs font-medium text-amber-800/80 dark:text-amber-300/80'>
              Menunggu Review
            </div>
            <div className='text-lg font-bold tracking-tight text-amber-900 sm:text-xl dark:text-amber-200'>
              {filteredCards.menungguReview.length}
            </div>
          </div>
        </div>

        {/* Disetujui */}
        <div className='flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/40 p-3.5 shadow-2xs sm:p-4 dark:border-emerald-900/30 dark:bg-emerald-950/20'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100/90 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'>
            <CheckCircle2 className='h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <div className='text-xs font-medium text-emerald-800/80 dark:text-emerald-300/80'>
              Disetujui
            </div>
            <div className='text-lg font-bold tracking-tight text-emerald-900 sm:text-xl dark:text-emerald-200'>
              {filteredCards.disetujui.length}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Filter & Search Bar */}
      <div className='flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs sm:p-4 md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900'>
        <div className='flex flex-1 flex-col gap-2.5 sm:flex-row sm:items-center'>
          {/* Search Input */}
          <div className='relative w-full sm:max-w-xs'>
            <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
            <Input
              type='text'
              placeholder='Cari kode, indikator, catatan...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-9 rounded-xl border-slate-200 pr-8 pl-9 text-xs sm:text-sm dark:border-slate-700'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* Filter Pilar */}
          <div className='flex items-center gap-1.5'>
            <Filter className='h-3.5 w-3.5 text-slate-400' />
            <select
              value={selectedPilar}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPilar(val);
                handleFetch(val);
              }}
              disabled={isPending}
              className='h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs outline-hidden transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              <option value='ALL'>Semua Pilar (Pilar 1 s.d. 6)</option>
              {PILAR_LIST.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.kode}: {p.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Cepat 1-Klik: Tugas Saya */}
          <Button
            type='button'
            variant={isMyTasksOnly ? 'default' : 'outline'}
            size='sm'
            onClick={() => setIsMyTasksOnly((prev) => !prev)}
            className={`h-9 rounded-xl text-xs font-medium transition-all ${
              isMyTasksOnly
                ? 'border-indigo-600 bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 dark:border-indigo-500 dark:bg-indigo-600 dark:text-white'
                : 'border-slate-200 bg-white text-slate-700 shadow-2xs hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
            title={
              userPilar
                ? `Filter kartu pilar ${userPilar} & berkas unggahan Anda`
                : 'Filter kartu yang diunggah oleh Anda'
            }
          >
            <UserCheck
              className={`mr-1.5 h-3.5 w-3.5 ${
                isMyTasksOnly
                  ? 'text-white'
                  : 'text-slate-500 dark:text-slate-400'
              }`}
            />
            <span>Tugas Saya</span>
            <span
              className={`py-0.2 ml-1.5 rounded-full px-1.5 text-[10px] font-semibold ${
                isMyTasksOnly
                  ? 'bg-white/25 text-white'
                  : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
              }`}
            >
              {myTasksCount}
            </span>
          </Button>

          {/* Filter Periode */}
          {periodes.length > 1 && (
            <select
              value={selectedPeriodeId}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPeriodeId(val);
                handleFetch(selectedPilar, val);
              }}
              disabled={isPending}
              className='h-9 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-2xs outline-hidden transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              {periodes.map((p) => (
                <option key={p.id} value={p.id}>
                  Tahun {p.tahun} {p.is_active ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          )}

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <Button
              variant='ghost'
              size='sm'
              onClick={handleResetFilters}
              className='h-9 rounded-xl text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
            >
              <X className='mr-1 h-3.5 w-3.5' />
              Reset Filter
            </Button>
          )}
        </div>

        {/* Counter Summary */}
        <div className='flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400'>
          <span>Menampilkan</span>
          <span className='font-semibold text-slate-800 dark:text-slate-200'>
            {totalFilteredCount}
          </span>
          <span>kartu indikator</span>
          {isMyTasksOnly && (
            <span className='rounded-md bg-indigo-50 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'>
              Filter Tugas Saya Aktif
            </span>
          )}
        </div>
      </div>

      {/* 4. Kanban Columns (3-Column Soft Pastel Layout with Real-Time Drag-and-Drop) */}
      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-3'>
        {/* ============================================================ */}
        {/* Kolom 1: PERLU REVISI (To Do) - Soft Rose/Coral Pastel        */}
        {/* ============================================================ */}
        <div
          onDragOver={(e) => handleDragOver(e, 'perluRevisi')}
          onDragLeave={(e) => handleDragLeave(e, 'perluRevisi')}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop('perluRevisi');
          }}
          className={`flex flex-col space-y-3.5 rounded-2xl p-2.5 transition-all duration-200 ${
            dragOverCol === 'perluRevisi'
              ? 'bg-rose-50/60 shadow-md ring-2 ring-rose-400 dark:bg-rose-950/40 dark:ring-rose-500'
              : 'bg-transparent'
          }`}
        >
          {/* Column Header */}
          <div className='flex items-center justify-between rounded-xl border border-rose-200/70 bg-rose-50/60 p-3 shadow-2xs dark:border-rose-900/40 dark:bg-rose-950/25'>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-rose-100/90 text-rose-600 shadow-2xs dark:bg-rose-900/50 dark:text-rose-300'>
                <AlertTriangle className='h-4 w-4' />
              </div>
              <div>
                <span className='text-sm font-semibold text-rose-900 dark:text-rose-200'>
                  Perlu Revisi
                </span>
                <span className='ml-1.5 text-[11px] font-normal text-rose-700/80 dark:text-rose-300/80'>
                  (To Do)
                </span>
              </div>
            </div>
            <Badge
              variant='outline'
              className='border-rose-200/80 bg-rose-100/80 px-2.5 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-800/60 dark:bg-rose-900/40 dark:text-rose-300'
            >
              {filteredCards.perluRevisi.length}
            </Badge>
          </div>

          {/* Drag Hover Target Indicator */}
          {dragOverCol === 'perluRevisi' &&
            draggedCard?.sourceCol !== 'perluRevisi' && (
              <div className='flex items-center justify-center rounded-xl border-2 border-dashed border-rose-300 bg-rose-100/60 py-3 text-xs font-medium text-rose-700 dark:border-rose-700 dark:bg-rose-900/40 dark:text-rose-200'>
                Lepaskan kartu untuk memindahkan ke Perlu Revisi
              </div>
            )}

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.perluRevisi.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200/80 bg-rose-50/25 p-8 text-center transition-all duration-200 hover:bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/15 dark:hover:bg-rose-950/25'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100/80 text-rose-600 shadow-2xs dark:bg-rose-900/40 dark:text-rose-300'>
                  <Sparkles className='h-6 w-6' />
                </div>
                <p className='mt-3 text-sm font-semibold text-rose-900 dark:text-rose-200'>
                  🎉 Hebat! Tidak ada catatan revisi yang tertunda.
                </p>
                <p className='mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                  Semua indikator pada filter ini dalam kondisi prima atau telah
                  siap diverifikasi.
                </p>
                {draggedCard && (
                  <div className='mt-4 flex items-center gap-1.5 rounded-lg border border-dashed border-rose-300 bg-rose-100/50 px-3 py-1.5 text-xs font-medium text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-300'>
                    <span>
                      Lepaskan kartu di sini untuk memindahkan ke Perlu Revisi
                    </span>
                  </div>
                )}
              </div>
            ) : (
              filteredCards.perluRevisi.map((card) => {
                const isCardDragged =
                  draggedCard?.card.id_pertanyaan === card.id_pertanyaan;
                const isDescExpanded = Boolean(
                  expandedNotes[`desc-${card.id_pertanyaan}`]
                );
                const isNoteExpanded = Boolean(
                  expandedNotes[`note-${card.id_pertanyaan}`]
                );

                return (
                  <Card
                    key={card.id_pertanyaan}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, 'perluRevisi')}
                    onDragEnd={handleDragEnd}
                    className={`group cursor-grab rounded-xl border border-rose-200/60 bg-white shadow-2xs transition-all duration-200 hover:border-rose-300 hover:shadow-xs active:cursor-grabbing dark:border-rose-900/30 dark:bg-slate-900/90 dark:hover:border-rose-800/50 ${
                      isCardDragged
                        ? 'scale-[0.98] opacity-40 shadow-md ring-2 ring-rose-400'
                        : ''
                    }`}
                  >
                    <CardHeader className='p-4 pb-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex flex-wrap items-center gap-1.5'>
                          <span
                            className='cursor-grab text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 active:cursor-grabbing dark:text-slate-500'
                            title='Tarik untuk memindahkan kolom'
                          >
                            <GripVertical className='h-3.5 w-3.5' />
                          </span>
                          <Badge
                            variant='outline'
                            className='border-rose-200/70 bg-rose-50/70 text-[11px] font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
                          >
                            {card.pilar_kode}
                          </Badge>
                          {/* Visual SLA / Countdown Timer Badge */}
                          {(() => {
                            const sla = calculateRevisionSLA(card.verified_at);
                            return (
                              <Badge
                                variant='outline'
                                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium shadow-2xs ${sla.badgeClass}`}
                                title={
                                  card.verified_at
                                    ? `Batas SLA (7 Hari): ${sla.deadlineDate.toLocaleString('id-ID')}`
                                    : 'Standar SLA 7 Hari Perbaikan'
                                }
                              >
                                <Clock className='h-3 w-3 shrink-0' />
                                <span>{sla.label}</span>
                              </Badge>
                            );
                          })()}
                        </div>
                        <span className='font-mono text-xs font-medium text-slate-500 dark:text-slate-400'>
                          {card.kode_indikator}
                        </span>
                      </div>
                      <CardTitle className='mt-1.5 text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100'>
                        {card.uraian_singkat}
                      </CardTitle>
                      <div>
                        <CardDescription
                          className={`text-xs text-slate-500 transition-all dark:text-slate-400 ${
                            isDescExpanded
                              ? 'whitespace-pre-line'
                              : 'line-clamp-3'
                          }`}
                        >
                          {card.uraian_pertanyaan}
                        </CardDescription>
                        {card.uraian_pertanyaan.length > 130 && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandNote(`desc-${card.id_pertanyaan}`);
                            }}
                            className='mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                          >
                            <span>
                              {isDescExpanded
                                ? 'Sembunyikan'
                                : 'Lihat Selengkapnya'}
                            </span>
                            {isDescExpanded ? (
                              <ChevronUp className='h-3 w-3' />
                            ) : (
                              <ChevronDown className='h-3 w-3' />
                            )}
                          </button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-3 p-4 pt-2'>
                      {/* Box Catatan Revisi Khusus (Clamped with Inline Toggle & Detail Modal) */}
                      {card.catatan_koordinator ? (
                        <div className='rounded-lg border border-rose-200/70 bg-rose-50/50 p-2.5 text-xs dark:border-rose-900/40 dark:bg-rose-950/25'>
                          <div className='flex items-center justify-between font-medium text-rose-800 dark:text-rose-300'>
                            <div className='flex items-center gap-1.5'>
                              <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-rose-500' />
                              <span>Poin Perbaikan Verifikator:</span>
                            </div>
                            <button
                              type='button'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenKlarifikasi(card);
                              }}
                              className='text-[10px] text-rose-700 hover:underline dark:text-rose-300'
                              title='Buka Detail & Riwayat Lengkap'
                            >
                              Modal Detail
                            </button>
                          </div>
                          <p
                            className={`mt-1 leading-relaxed text-rose-900/80 italic dark:text-rose-200/80 ${
                              isNoteExpanded
                                ? 'whitespace-pre-line'
                                : 'line-clamp-3'
                            }`}
                          >
                            &ldquo;{card.catatan_koordinator}&rdquo;
                          </p>
                          {card.catatan_koordinator.length > 110 && (
                            <div className='mt-1.5 flex items-center justify-between border-t border-rose-200/40 pt-1 dark:border-rose-900/30'>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandNote(
                                    `note-${card.id_pertanyaan}`
                                  );
                                }}
                                className='inline-flex items-center gap-0.5 text-[11px] font-medium text-rose-700 hover:text-rose-900 dark:text-rose-300 dark:hover:text-rose-100'
                              >
                                <span>
                                  {isNoteExpanded
                                    ? 'Sembunyikan'
                                    : 'Lihat Selengkapnya'}
                                </span>
                                {isNoteExpanded ? (
                                  <ChevronUp className='h-3 w-3' />
                                ) : (
                                  <ChevronDown className='h-3 w-3' />
                                )}
                              </button>
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenKlarifikasi(card);
                                }}
                                className='text-[10px] font-medium text-rose-700 hover:underline dark:text-rose-300'
                              >
                                Detail Dialog &rarr;
                              </button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className='rounded-lg bg-rose-50/40 p-2 text-xs text-rose-700/80 italic dark:bg-rose-950/20 dark:text-rose-400/80'>
                          Menunggu tindak lanjut perbaikan berkas bukti dukung.
                        </div>
                      )}

                      {/* Metadata & Verifier info */}
                      <div className='flex flex-wrap items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-slate-400'>
                        <span className='truncate'>
                          Subpilar: {card.subpilar_nama}
                        </span>
                        {card.verified_by && (
                          <span className='inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300'>
                            <User className='h-3 w-3' />
                            {card.verified_by}
                          </span>
                        )}
                      </div>

                      {/* Action Buttons: Catatan & Riwayat dan Tindak Lanjuti di Form Pilar */}
                      <div className='flex flex-col gap-1.5 pt-1'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => handleOpenKlarifikasi(card)}
                          className='h-8 w-full justify-between rounded-lg border-slate-200/90 bg-white text-xs font-medium text-slate-700 shadow-2xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800'
                        >
                          <span className='inline-flex items-center gap-1.5'>
                            <MessageSquare className='h-3.5 w-3.5 text-slate-500 dark:text-slate-400' />
                            <span>Catatan & Riwayat</span>
                          </span>
                          {card.catatan_operator ? (
                            <Badge
                              variant='secondary'
                              className='h-4 bg-slate-100 px-1.5 text-[9px] font-normal text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                            >
                              Ada Tanggapan
                            </Badge>
                          ) : (
                            <span className='text-[10px] text-slate-400'>
                              Buka Dialog &rarr;
                            </span>
                          )}
                        </Button>

                        <Link
                          href={`/rebo/formRB/${card.pilar_id}?indikator=${card.id_pertanyaan}#indikator-${card.id_pertanyaan}`}
                          className='block w-full'
                        >
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-8.5 w-full justify-between rounded-lg border-rose-200/80 bg-rose-50/60 text-xs font-medium text-rose-700 shadow-2xs transition-colors hover:border-rose-300 hover:bg-rose-100/80 hover:text-rose-800 dark:border-rose-800/50 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-900/50'
                          >
                            <span>Tindak Lanjuti di Form Pilar</span>
                            <ArrowRight className='h-3.5 w-3.5' />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* Kolom 2: MENUNGGU REVIEW (In Review) - Warm Soft Amber Pastel */}
        {/* ============================================================ */}
        <div
          onDragOver={(e) => handleDragOver(e, 'menungguReview')}
          onDragLeave={(e) => handleDragLeave(e, 'menungguReview')}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop('menungguReview');
          }}
          className={`flex flex-col space-y-3.5 rounded-2xl p-2.5 transition-all duration-200 ${
            dragOverCol === 'menungguReview'
              ? 'bg-amber-50/60 shadow-md ring-2 ring-amber-400 dark:bg-amber-950/40 dark:ring-amber-500'
              : 'bg-transparent'
          }`}
        >
          {/* Column Header */}
          <div className='flex items-center justify-between rounded-xl border border-amber-200/70 bg-amber-50/60 p-3 shadow-2xs dark:border-amber-900/40 dark:bg-amber-950/25'>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100/90 text-amber-700 shadow-2xs dark:bg-amber-900/50 dark:text-amber-300'>
                <Clock className='h-4 w-4' />
              </div>
              <div>
                <span className='text-sm font-semibold text-amber-900 dark:text-amber-200'>
                  Menunggu Review
                </span>
                <span className='ml-1.5 text-[11px] font-normal text-amber-700/80 dark:text-amber-300/80'>
                  (In Review)
                </span>
              </div>
            </div>
            <Badge
              variant='outline'
              className='border-amber-200/80 bg-amber-100/80 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-800/60 dark:bg-amber-900/40 dark:text-amber-300'
            >
              {filteredCards.menungguReview.length}
            </Badge>
          </div>

          {/* Drag Hover Target Indicator */}
          {dragOverCol === 'menungguReview' &&
            draggedCard?.sourceCol !== 'menungguReview' && (
              <div className='flex items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-amber-100/60 py-3 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200'>
                Lepaskan kartu untuk memindahkan ke Menunggu Review
              </div>
            )}

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.menungguReview.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200/80 bg-amber-50/25 p-8 text-center transition-all duration-200 hover:bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/15 dark:hover:bg-amber-950/25'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100/80 text-amber-700 shadow-2xs dark:bg-amber-900/40 dark:text-amber-300'>
                  <Coffee className='h-6 w-6' />
                </div>
                <p className='mt-3 text-sm font-semibold text-amber-900 dark:text-amber-200'>
                  ☕ Belum ada tindak lanjut yang sedang aktif dikerjakan.
                </p>
                <p className='mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                  Tarik kartu ke kolom ini saat Anda mulai mengerjakan perbaikan
                  atau mengajukan review berkas.
                </p>
                {draggedCard && (
                  <div className='mt-4 flex items-center gap-1.5 rounded-lg border border-dashed border-amber-300 bg-amber-100/50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300'>
                    <span>
                      Lepaskan kartu di sini untuk memindahkan ke In Progress
                    </span>
                  </div>
                )}
              </div>
            ) : (
              filteredCards.menungguReview.map((card) => {
                const isCardDragged =
                  draggedCard?.card.id_pertanyaan === card.id_pertanyaan;
                const isDescExpanded = Boolean(
                  expandedNotes[`desc-${card.id_pertanyaan}`]
                );
                const isOpExpanded = Boolean(
                  expandedNotes[`op-${card.id_pertanyaan}`]
                );

                return (
                  <Card
                    key={card.id_pertanyaan}
                    draggable
                    onDragStart={(e) =>
                      handleDragStart(e, card, 'menungguReview')
                    }
                    onDragEnd={handleDragEnd}
                    className={`group cursor-grab rounded-xl border border-amber-200/60 bg-white shadow-2xs transition-all duration-200 hover:border-amber-300 hover:shadow-xs active:cursor-grabbing dark:border-amber-900/30 dark:bg-slate-900/90 dark:hover:border-amber-800/50 ${
                      isCardDragged
                        ? 'scale-[0.98] opacity-40 shadow-md ring-2 ring-amber-400'
                        : ''
                    }`}
                  >
                    <CardHeader className='p-4 pb-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex items-center gap-1.5'>
                          <span
                            className='cursor-grab text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 active:cursor-grabbing dark:text-slate-500'
                            title='Tarik untuk memindahkan kolom'
                          >
                            <GripVertical className='h-3.5 w-3.5' />
                          </span>
                          <Badge
                            variant='outline'
                            className='border-amber-200/70 bg-amber-50/70 text-[11px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
                          >
                            {card.pilar_kode}
                          </Badge>
                        </div>
                        <span className='font-mono text-xs font-medium text-slate-500 dark:text-slate-400'>
                          {card.kode_indikator}
                        </span>
                      </div>
                      <CardTitle className='mt-1.5 text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100'>
                        {card.uraian_singkat}
                      </CardTitle>
                      <div>
                        <CardDescription
                          className={`text-xs text-slate-500 transition-all dark:text-slate-400 ${
                            isDescExpanded
                              ? 'whitespace-pre-line'
                              : 'line-clamp-3'
                          }`}
                        >
                          {card.uraian_pertanyaan}
                        </CardDescription>
                        {card.uraian_pertanyaan.length > 130 && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandNote(`desc-${card.id_pertanyaan}`);
                            }}
                            className='mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                          >
                            <span>
                              {isDescExpanded
                                ? 'Sembunyikan'
                                : 'Lihat Selengkapnya'}
                            </span>
                            {isDescExpanded ? (
                              <ChevronUp className='h-3 w-3' />
                            ) : (
                              <ChevronDown className='h-3 w-3' />
                            )}
                          </button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-3 p-4 pt-2'>
                      {/* Operator Note / Dokumen summary (Clamped with Inline Toggle) */}
                      <div className='rounded-lg border border-amber-200/70 bg-amber-50/50 p-2.5 text-xs dark:border-amber-900/40 dark:bg-amber-950/25'>
                        <div className='flex items-center justify-between font-medium text-amber-900 dark:text-amber-200'>
                          <span>
                            {card.total_dokumen} Dokumen Bukti Disematkan
                          </span>
                          <span>
                            Skor Usulan: {card.nilai_mandiri.toFixed(2)}
                          </span>
                        </div>
                        {card.catatan_operator && (
                          <div className='mt-1'>
                            <p
                              className={`leading-relaxed text-amber-950/80 italic dark:text-amber-200/80 ${
                                isOpExpanded
                                  ? 'whitespace-pre-line'
                                  : 'line-clamp-3'
                              }`}
                            >
                              &ldquo;{card.catatan_operator}&rdquo;
                            </p>
                            {card.catatan_operator.length > 110 && (
                              <button
                                type='button'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpandNote(`op-${card.id_pertanyaan}`);
                                }}
                                className='mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-amber-800 hover:text-amber-950 dark:text-amber-300 dark:hover:text-amber-100'
                              >
                                <span>
                                  {isOpExpanded
                                    ? 'Sembunyikan'
                                    : 'Lihat Selengkapnya'}
                                </span>
                                {isOpExpanded ? (
                                  <ChevronUp className='h-3 w-3' />
                                ) : (
                                  <ChevronDown className='h-3 w-3' />
                                )}
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Metadata Subpilar */}
                      <div className='flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                        <span className='truncate'>
                          Subpilar: {card.subpilar_nama}
                        </span>
                        {card.submitted_by_name && (
                          <span className='inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300'>
                            <User className='h-3 w-3' />
                            {card.submitted_by_name}
                          </span>
                        )}
                      </div>

                      {/* Action Link to Form Pilar (Warm Soft Amber Button) */}
                      <div className='pt-1'>
                        <Link
                          href={`/rebo/formRB/${card.pilar_id}?indikator=${card.id_pertanyaan}#indikator-${card.id_pertanyaan}`}
                          className='block w-full'
                        >
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-8.5 w-full justify-between rounded-lg border-amber-200/80 bg-amber-50/60 text-xs font-medium text-amber-800 shadow-2xs transition-colors hover:border-amber-300 hover:bg-amber-100/80 hover:text-amber-900 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-300 dark:hover:bg-amber-900/50'
                          >
                            <span>Review Bukti Dukung</span>
                            <ExternalLink className='h-3.5 w-3.5' />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* Kolom 3: DISETUJUI (Done) - Sage / Soft Emerald Pastel        */}
        {/* ============================================================ */}
        <div
          onDragOver={(e) => handleDragOver(e, 'disetujui')}
          onDragLeave={(e) => handleDragLeave(e, 'disetujui')}
          onDrop={(e) => {
            e.preventDefault();
            handleDrop('disetujui');
          }}
          className={`flex flex-col space-y-3.5 rounded-2xl p-2.5 transition-all duration-200 ${
            dragOverCol === 'disetujui'
              ? 'bg-emerald-50/60 shadow-md ring-2 ring-emerald-400 dark:bg-emerald-950/40 dark:ring-emerald-500'
              : 'bg-transparent'
          }`}
        >
          {/* Column Header */}
          <div className='flex items-center justify-between rounded-xl border border-emerald-200/70 bg-emerald-50/60 p-3 shadow-2xs dark:border-emerald-900/40 dark:bg-emerald-950/25'>
            <div className='flex items-center gap-2.5'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100/90 text-emerald-700 shadow-2xs dark:bg-emerald-900/50 dark:text-emerald-300'>
                <CheckCircle2 className='h-4 w-4' />
              </div>
              <div>
                <span className='text-sm font-semibold text-emerald-900 dark:text-emerald-200'>
                  Disetujui
                </span>
                <span className='ml-1.5 text-[11px] font-normal text-emerald-700/80 dark:text-emerald-300/80'>
                  (Done)
                </span>
              </div>
            </div>
            <Badge
              variant='outline'
              className='border-emerald-200/80 bg-emerald-100/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-800/60 dark:bg-emerald-900/40 dark:text-emerald-300'
            >
              {filteredCards.disetujui.length}
            </Badge>
          </div>

          {/* Drag Hover Target Indicator */}
          {dragOverCol === 'disetujui' &&
            draggedCard?.sourceCol !== 'disetujui' && (
              <div className='flex items-center justify-center rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-100/60 py-3 text-xs font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200'>
                Lepaskan kartu untuk memindahkan ke Disetujui
              </div>
            )}

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.disetujui.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200/80 bg-emerald-50/25 p-8 text-center transition-all duration-200 hover:bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/15 dark:hover:bg-emerald-950/25'>
                <div className='flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/80 text-emerald-700 shadow-2xs dark:bg-emerald-900/40 dark:text-emerald-300'>
                  <Pin className='h-6 w-6' />
                </div>
                <p className='mt-3 text-sm font-semibold text-emerald-900 dark:text-emerald-200'>
                  📌 Kartu yang selesai diperbaiki akan tercatat di sini.
                </p>
                <p className='mt-1.5 max-w-xs text-xs leading-relaxed text-slate-500 dark:text-slate-400'>
                  Tarik kartu ke kolom ini setelah dokumen bukti dukung berhasil
                  disetujui oleh verifikator.
                </p>
                {draggedCard && (
                  <div className='mt-4 flex items-center gap-1.5 rounded-lg border border-dashed border-emerald-300 bg-emerald-100/50 px-3 py-1.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'>
                    <span>
                      Lepaskan kartu di sini untuk memindahkan ke Disetujui
                    </span>
                  </div>
                )}
              </div>
            ) : (
              filteredCards.disetujui.map((card) => {
                const isCardDragged =
                  draggedCard?.card.id_pertanyaan === card.id_pertanyaan;
                const isDescExpanded = Boolean(
                  expandedNotes[`desc-${card.id_pertanyaan}`]
                );

                return (
                  <Card
                    key={card.id_pertanyaan}
                    draggable
                    onDragStart={(e) => handleDragStart(e, card, 'disetujui')}
                    onDragEnd={handleDragEnd}
                    className={`group cursor-grab rounded-xl border border-emerald-200/60 bg-white shadow-2xs transition-all duration-200 hover:border-emerald-300 hover:shadow-xs active:cursor-grabbing dark:border-emerald-900/30 dark:bg-slate-900/90 dark:hover:border-emerald-800/50 ${
                      isCardDragged
                        ? 'scale-[0.98] opacity-40 shadow-md ring-2 ring-emerald-400'
                        : ''
                    }`}
                  >
                    <CardHeader className='p-4 pb-2'>
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex items-center gap-1.5'>
                          <span
                            className='cursor-grab text-slate-400 opacity-60 transition-opacity group-hover:opacity-100 active:cursor-grabbing dark:text-slate-500'
                            title='Tarik untuk memindahkan kolom'
                          >
                            <GripVertical className='h-3.5 w-3.5' />
                          </span>
                          <Badge
                            variant='outline'
                            className='border-emerald-200/70 bg-emerald-50/70 text-[11px] font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                          >
                            {card.pilar_kode}
                          </Badge>
                        </div>
                        <span className='font-mono text-xs font-medium text-slate-500 dark:text-slate-400'>
                          {card.kode_indikator}
                        </span>
                      </div>
                      <CardTitle className='mt-1.5 text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100'>
                        {card.uraian_singkat}
                      </CardTitle>
                      <div>
                        <CardDescription
                          className={`text-xs text-slate-500 transition-all dark:text-slate-400 ${
                            isDescExpanded
                              ? 'whitespace-pre-line'
                              : 'line-clamp-3'
                          }`}
                        >
                          {card.uraian_pertanyaan}
                        </CardDescription>
                        {card.uraian_pertanyaan.length > 130 && (
                          <button
                            type='button'
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpandNote(`desc-${card.id_pertanyaan}`);
                            }}
                            className='mt-1 inline-flex items-center gap-0.5 text-[11px] font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                          >
                            <span>
                              {isDescExpanded
                                ? 'Sembunyikan'
                                : 'Lihat Selengkapnya'}
                            </span>
                            {isDescExpanded ? (
                              <ChevronUp className='h-3 w-3' />
                            ) : (
                              <ChevronDown className='h-3 w-3' />
                            )}
                          </button>
                        )}
                      </div>
                    </CardHeader>

                    <CardContent className='space-y-3 p-4 pt-2'>
                      {/* Nilai Verifikasi Box (Sage / Soft Emerald Pastel) */}
                      <div className='rounded-lg border border-emerald-200/70 bg-emerald-50/50 p-2.5 text-xs dark:border-emerald-900/40 dark:bg-emerald-950/25'>
                        <div className='flex items-center justify-between font-medium text-emerald-900 dark:text-emerald-200'>
                          <span>Skor Terverifikasi:</span>
                          <span>
                            {card.nilai_verifikasi.toFixed(2)} /{' '}
                            {card.nilai_maksimal.toFixed(2)}
                          </span>
                        </div>
                        {card.verified_by && (
                          <p className='mt-1 text-[11px] text-emerald-800/80 dark:text-emerald-300/80'>
                            Disetujui oleh:{' '}
                            <span className='font-medium text-emerald-900 dark:text-emerald-200'>
                              {card.verified_by}
                            </span>
                          </p>
                        )}
                      </div>

                      {/* Metadata Subpilar */}
                      <div className='flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                        <span className='truncate'>
                          Subpilar: {card.subpilar_nama}
                        </span>
                      </div>

                      {/* Action Link to Form Pilar (Sage / Soft Emerald Button) */}
                      <div className='pt-1'>
                        <Link
                          href={`/rebo/formRB/${card.pilar_id}?indikator=${card.id_pertanyaan}#indikator-${card.id_pertanyaan}`}
                          className='block w-full'
                        >
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-8.5 w-full justify-between rounded-lg border-emerald-200/80 bg-emerald-50/60 text-xs font-medium text-emerald-800 shadow-2xs transition-colors hover:border-emerald-300 hover:bg-emerald-100/80 hover:text-emerald-900 dark:border-emerald-800/50 dark:bg-emerald-950/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
                          >
                            <span>Lihat Form Pilar</span>
                            <ExternalLink className='h-3.5 w-3.5' />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* 5. Dialog Catatan & Klarifikasi Cepat */}
      <Dialog
        open={Boolean(selectedCardForKlarifikasi)}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedCardForKlarifikasi(null);
            setPesanKlarifikasi('');
          }
        }}
      >
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-xl'>
          {selectedCardForKlarifikasi &&
            (() => {
              const card = selectedCardForKlarifikasi;
              const sla = calculateRevisionSLA(card.verified_at);
              return (
                <div className='space-y-4'>
                  <DialogHeader className='space-y-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <Badge
                        variant='outline'
                        className='text-xs font-semibold'
                      >
                        {card.pilar_kode}
                      </Badge>
                      <Badge variant='secondary' className='font-mono text-xs'>
                        {card.kode_indikator}
                      </Badge>
                      <Badge
                        variant='outline'
                        className={`inline-flex items-center gap-1 text-[11px] ${sla.badgeClass}`}
                      >
                        <Clock className='h-3 w-3 shrink-0' />
                        <span>{sla.label}</span>
                      </Badge>
                    </div>
                    <DialogTitle className='text-base font-bold text-slate-900 sm:text-lg dark:text-slate-100'>
                      {card.uraian_singkat}
                    </DialogTitle>
                    <DialogDescription className='text-xs text-slate-500 dark:text-slate-400'>
                      Subpilar: {card.subpilar_nama} • {card.uraian_pertanyaan}
                    </DialogDescription>
                  </DialogHeader>

                  {/* 1. Box Poin Perbaikan dari Verifikator */}
                  <div className='rounded-xl border border-rose-200/80 bg-rose-50/60 p-3.5 text-xs dark:border-rose-900/40 dark:bg-rose-950/30'>
                    <div className='flex items-center justify-between font-semibold text-rose-900 dark:text-rose-200'>
                      <div className='flex items-center gap-1.5'>
                        <AlertTriangle className='h-4 w-4 shrink-0 text-rose-500' />
                        <span>Poin Perbaikan Verifikator</span>
                      </div>
                      {card.verified_by && (
                        <span className='inline-flex items-center gap-1 font-normal text-rose-800 dark:text-rose-300'>
                          <User className='h-3 w-3' />
                          {card.verified_by}
                        </span>
                      )}
                    </div>
                    {card.verified_at && (
                      <p className='mt-0.5 text-[10px] text-rose-700/80 dark:text-rose-300/80'>
                        Waktu Verifikasi:{' '}
                        {new Date(card.verified_at).toLocaleString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                    <div className='mt-2 rounded-lg bg-white/90 p-2.5 text-slate-800 italic shadow-2xs dark:bg-slate-900/90 dark:text-slate-200'>
                      {card.catatan_koordinator ? (
                        <span>&ldquo;{card.catatan_koordinator}&rdquo;</span>
                      ) : (
                        <span className='text-slate-400 dark:text-slate-500'>
                          Tidak ada rincian catatan revisi tertulis.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 2. Box Batas SLA & Deadline */}
                  <div className='rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60'>
                    <div className='flex items-center justify-between'>
                      <span className='font-medium text-slate-600 dark:text-slate-400'>
                        Batas Waktu SLA Tindak Lanjut:
                      </span>
                      <span className='font-semibold text-slate-800 dark:text-slate-200'>
                        {sla.deadlineDate.toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className='mt-1 text-[11px] text-slate-500 dark:text-slate-400'>
                      Standar SLA: Maksimal 7 hari kerja/kalender sejak catatan
                      reviu diterbitkan.
                    </div>
                  </div>

                  {/* 3. Box Riwayat Catatan & Klarifikasi Operator Sebelumnya */}
                  <div className='rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60'>
                    <div className='flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200'>
                      <MessageSquare className='h-4 w-4 text-slate-500 dark:text-slate-400' />
                      <span>Riwayat Catatan & Klarifikasi Operator</span>
                    </div>
                    <div className='mt-2 max-h-40 overflow-y-auto rounded-lg bg-white p-2.5 shadow-2xs dark:bg-slate-950'>
                      {card.catatan_operator ? (
                        <p className='text-xs leading-relaxed whitespace-pre-line text-slate-700 dark:text-slate-300'>
                          {card.catatan_operator}
                        </p>
                      ) : (
                        <p className='text-xs text-slate-400 italic dark:text-slate-500'>
                          Belum ada riwayat catatan atau tanggapan dari
                          operator.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 4. Form Kirim Balasan Klarifikasi Singkat */}
                  <form
                    onSubmit={handleSubmitKlarifikasi}
                    className='space-y-3 pt-1'
                  >
                    <div className='space-y-1.5'>
                      <label className='text-xs font-semibold text-slate-800 dark:text-slate-200'>
                        Kirim Tanggapan / Balasan Klarifikasi Cepat
                      </label>
                      <Textarea
                        rows={3}
                        placeholder='Tulis penjelasan kendala, perbaikan berkas yang telah dipersiapkan, atau konfirmasi klarifikasi singkat...'
                        value={pesanKlarifikasi}
                        onChange={(e) => setPesanKlarifikasi(e.target.value)}
                        disabled={isSubmittingKlarifikasi}
                        className='resize-none text-xs'
                      />
                    </div>

                    <div className='flex flex-wrap items-center justify-between gap-2 pt-1'>
                      <Link
                        href={`/rebo/formRB/${card.pilar_id}?indikator=${card.id_pertanyaan}#indikator-${card.id_pertanyaan}`}
                        className='inline-flex items-center gap-1 text-xs text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                      >
                        <span>Buka Form Pilar Lengkap</span>
                        <ArrowRight className='h-3 w-3' />
                      </Link>

                      <div className='flex items-center gap-2'>
                        <Button
                          type='button'
                          variant='outline'
                          size='sm'
                          onClick={() => setSelectedCardForKlarifikasi(null)}
                          disabled={isSubmittingKlarifikasi}
                          className='h-8 text-xs'
                        >
                          Tutup
                        </Button>
                        <Button
                          type='submit'
                          size='sm'
                          disabled={
                            isSubmittingKlarifikasi || !pesanKlarifikasi.trim()
                          }
                          className='h-8 bg-indigo-600 text-xs text-white hover:bg-indigo-700'
                        >
                          {isSubmittingKlarifikasi ? (
                            <>
                              <RefreshCw className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                              <span>Menyimpan...</span>
                            </>
                          ) : (
                            <>
                              <Send className='mr-1.5 h-3.5 w-3.5' />
                              <span>Kirim Klarifikasi</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              );
            })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
