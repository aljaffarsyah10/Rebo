'use client';

import React, { useState, useTransition, useMemo } from 'react';
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
  FileText,
  User,
  ArrowRight,
  Filter,
  Kanban as KanbanIcon,
  X,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { getKanbanBoardData } from '@/actions/kanban-actions';
import { PILAR_LIST } from '@/lib/auth/rbac';
import type {
  KanbanBoardData,
  KanbanIndicatorCard,
  PeriodeEvaluasi
} from '@/types/rebo';
import { toast } from 'sonner';

interface KanbanBoardClientProps {
  initialData: KanbanBoardData;
  initialPeriodes: PeriodeEvaluasi[];
}

export default function KanbanBoardClient({
  initialData,
  initialPeriodes
}: KanbanBoardClientProps) {
  const [data, setData] = useState<KanbanBoardData>(initialData);
  const [periodes] = useState<PeriodeEvaluasi[]>(initialPeriodes);
  const [selectedPeriodeId, setSelectedPeriodeId] = useState<string>(
    initialData.periode?.id || ''
  );
  const [selectedPilar, setSelectedPilar] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  const handleFetch = (overridePilar?: string, overridePeriode?: string) => {
    startTransition(async () => {
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
    });
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedPilar('ALL');
    handleFetch('ALL');
  };

  const filteredCards = useMemo(() => {
    if (!searchQuery.trim()) {
      return data.cards;
    }
    const q = searchQuery.toLowerCase().trim();
    const filterFn = (card: KanbanIndicatorCard) =>
      card.kode_indikator.toLowerCase().includes(q) ||
      card.uraian_singkat.toLowerCase().includes(q) ||
      card.uraian_pertanyaan.toLowerCase().includes(q) ||
      card.pilar_nama.toLowerCase().includes(q) ||
      card.subpilar_nama.toLowerCase().includes(q) ||
      (card.catatan_koordinator || '').toLowerCase().includes(q) ||
      (card.catatan_operator || '').toLowerCase().includes(q) ||
      (card.verified_by || '').toLowerCase().includes(q);

    return {
      perluRevisi: data.cards.perluRevisi.filter(filterFn),
      menungguReview: data.cards.menungguReview.filter(filterFn),
      disetujui: data.cards.disetujui.filter(filterFn)
    };
  }, [data.cards, searchQuery]);

  const totalFilteredCount =
    filteredCards.perluRevisi.length +
    filteredCards.menungguReview.length +
    filteredCards.disetujui.length;

  const hasActiveFilters = searchQuery.trim() !== '' || selectedPilar !== 'ALL';

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
        </div>
      </div>

      {/* 4. Kanban Columns (3-Column Soft Pastel Layout) */}
      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-3'>
        {/* ============================================================ */}
        {/* Kolom 1: PERLU REVISI (To Do) - Soft Rose/Coral Pastel        */}
        {/* ============================================================ */}
        <div className='flex flex-col space-y-3.5'>
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

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.perluRevisi.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200/60 bg-rose-50/20 p-8 text-center dark:border-rose-900/30 dark:bg-rose-950/10'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-rose-100/60 text-rose-500 dark:bg-rose-900/30 dark:text-rose-400'>
                  <CheckCircle2 className='h-5 w-5' />
                </div>
                <p className='mt-2.5 text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Tidak ada indikator yang perlu revisi
                </p>
                <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                  Semua indikator pada filter ini dalam kondisi siap atau telah
                  disetujui.
                </p>
              </div>
            ) : (
              filteredCards.perluRevisi.map((card) => (
                <Card
                  key={card.id_pertanyaan}
                  className='rounded-xl border border-rose-200/60 bg-white shadow-2xs transition-all duration-200 hover:border-rose-300 hover:shadow-xs dark:border-rose-900/30 dark:bg-slate-900/90 dark:hover:border-rose-800/50'
                >
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className='border-rose-200/70 bg-rose-50/70 text-[11px] font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300'
                      >
                        {card.pilar_kode}
                      </Badge>
                      <span className='font-mono text-xs font-medium text-slate-500 dark:text-slate-400'>
                        {card.kode_indikator}
                      </span>
                    </div>
                    <CardTitle className='mt-1.5 text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100'>
                      {card.uraian_singkat}
                    </CardTitle>
                    <CardDescription className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                      {card.uraian_pertanyaan}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='space-y-3 p-4 pt-2'>
                    {/* Box Catatan Revisi Khusus (Soft Rose Pastel) */}
                    {card.catatan_koordinator ? (
                      <div className='rounded-lg border border-rose-200/70 bg-rose-50/50 p-2.5 text-xs dark:border-rose-900/40 dark:bg-rose-950/25'>
                        <div className='flex items-center gap-1.5 font-medium text-rose-800 dark:text-rose-300'>
                          <AlertTriangle className='h-3.5 w-3.5 shrink-0 text-rose-500' />
                          <span>Poin Perbaikan dari Verifikator:</span>
                        </div>
                        <p className='mt-1 leading-relaxed text-rose-900/80 italic dark:text-rose-200/80'>
                          &ldquo;{card.catatan_koordinator}&rdquo;
                        </p>
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

                    {/* Action Link to Form Pilar (Soft Pastel Button) */}
                    <div className='pt-1'>
                      <Link
                        href={`/rebo/formRB/${card.pilar_id}`}
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
              ))
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* Kolom 2: MENUNGGU REVIEW (In Review) - Warm Soft Amber Pastel */}
        {/* ============================================================ */}
        <div className='flex flex-col space-y-3.5'>
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

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.menungguReview.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200/60 bg-amber-50/20 p-8 text-center dark:border-amber-900/30 dark:bg-amber-950/10'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-amber-100/60 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'>
                  <Clock className='h-5 w-5' />
                </div>
                <p className='mt-2.5 text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Tidak ada berkas menunggu review
                </p>
                <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                  Operator belum mengajukan berkas baru atau semua telah selesai
                  diverifikasi.
                </p>
              </div>
            ) : (
              filteredCards.menungguReview.map((card) => (
                <Card
                  key={card.id_pertanyaan}
                  className='rounded-xl border border-amber-200/60 bg-white shadow-2xs transition-all duration-200 hover:border-amber-300 hover:shadow-xs dark:border-amber-900/30 dark:bg-slate-900/90 dark:hover:border-amber-800/50'
                >
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className='border-amber-200/70 bg-amber-50/70 text-[11px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'
                      >
                        {card.pilar_kode}
                      </Badge>
                      <span className='font-mono text-xs font-medium text-slate-500 dark:text-slate-400'>
                        {card.kode_indikator}
                      </span>
                    </div>
                    <CardTitle className='mt-1.5 text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100'>
                      {card.uraian_singkat}
                    </CardTitle>
                    <CardDescription className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                      {card.uraian_pertanyaan}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='space-y-3 p-4 pt-2'>
                    {/* Operator Note / Dokumen summary (Warm Soft Amber Pastel) */}
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
                        <p className='mt-1 leading-relaxed text-amber-950/80 italic dark:text-amber-200/80'>
                          &ldquo;{card.catatan_operator}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Metadata Subpilar */}
                    <div className='flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400'>
                      <span className='truncate'>
                        Subpilar: {card.subpilar_nama}
                      </span>
                    </div>

                    {/* Action Link to Form Pilar (Warm Soft Amber Button) */}
                    <div className='pt-1'>
                      <Link
                        href={`/rebo/formRB/${card.pilar_id}`}
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
              ))
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* Kolom 3: DISETUJUI (Done) - Sage / Soft Emerald Pastel        */}
        {/* ============================================================ */}
        <div className='flex flex-col space-y-3.5'>
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

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.disetujui.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200/60 bg-emerald-50/20 p-8 text-center dark:border-emerald-900/30 dark:bg-emerald-950/10'>
                <div className='flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/60 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'>
                  <FileText className='h-5 w-5' />
                </div>
                <p className='mt-2.5 text-sm font-medium text-slate-700 dark:text-slate-200'>
                  Belum ada indikator yang disetujui
                </p>
                <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                  Indikator yang telah diverifikasi dan disetujui penuh akan
                  tampil di sini.
                </p>
              </div>
            ) : (
              filteredCards.disetujui.map((card) => (
                <Card
                  key={card.id_pertanyaan}
                  className='rounded-xl border border-emerald-200/60 bg-white shadow-2xs transition-all duration-200 hover:border-emerald-300 hover:shadow-xs dark:border-emerald-900/30 dark:bg-slate-900/90 dark:hover:border-emerald-800/50'
                >
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className='border-emerald-200/70 bg-emerald-50/70 text-[11px] font-medium text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300'
                      >
                        {card.pilar_kode}
                      </Badge>
                      <span className='font-mono text-xs font-medium text-slate-500 dark:text-slate-400'>
                        {card.kode_indikator}
                      </span>
                    </div>
                    <CardTitle className='mt-1.5 text-sm leading-snug font-semibold text-slate-900 dark:text-slate-100'>
                      {card.uraian_singkat}
                    </CardTitle>
                    <CardDescription className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                      {card.uraian_pertanyaan}
                    </CardDescription>
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
                        href={`/rebo/formRB/${card.pilar_id}`}
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
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
