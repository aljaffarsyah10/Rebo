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
  Kanban as KanbanIcon
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

  return (
    <div className='container mx-auto max-w-7xl space-y-6 p-6'>
      {/* 1. Header / Hero Section */}
      <div className='relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-50 via-amber-50/70 to-blue-50/60 p-6 sm:p-8 dark:from-slate-900 dark:via-slate-800/90 dark:to-slate-700/80'>
        <div className='absolute inset-0 bg-gradient-to-br from-rose-100/20 via-amber-100/15 to-blue-100/10 dark:from-slate-900/50 dark:via-slate-800/40 dark:to-slate-700/30' />

        <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='border-rose-300/60 bg-rose-100/60 text-rose-800 dark:border-rose-700 dark:bg-rose-950 dark:text-rose-300'
              >
                <KanbanIcon className='mr-1.5 h-3.5 w-3.5' />
                Action Center & Follow-Up
              </Badge>
              {data.periode && (
                <Badge
                  variant='secondary'
                  className='bg-white/80 text-slate-800 shadow-xs dark:bg-slate-800 dark:text-slate-200'
                >
                  {data.periode.nama_periode} ({data.periode.tahun})
                </Badge>
              )}
            </div>
            <h1 className='bg-gradient-to-r from-slate-900 via-rose-700 to-amber-700 bg-clip-text text-3xl font-black text-transparent sm:text-4xl dark:from-slate-100 dark:via-rose-400 dark:to-amber-300'>
              Kanban Tindak Lanjut RB
            </h1>
            <p className='text-sm text-slate-700 sm:text-base dark:text-slate-300'>
              Papan kendali tangkas untuk menindaklanjuti indikator berstatus
              perlu revisi, memantau berkas dalam review, dan melacak
              persetujuan bukti dukung LKE BPS Sitaro.
            </p>
          </div>

          {/* Quick Action Links */}
          <div className='flex flex-wrap items-center gap-2.5'>
            <Link href='/rebo/monitoring'>
              <Button
                variant='outline'
                size='sm'
                className='h-9 border-slate-300 bg-white/80 shadow-xs hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800'
              >
                Lihat Monitoring Progres →
              </Button>
            </Link>
            <Button
              variant='outline'
              size='sm'
              onClick={() => handleFetch()}
              disabled={isPending}
              className='h-9 border-slate-300 bg-white/80 shadow-xs hover:bg-white dark:border-slate-700 dark:bg-slate-800/80 dark:hover:bg-slate-800'
            >
              <RefreshCw
                className={`mr-1.5 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
              />
              Perbarui Board
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Filter & Search Bar */}
      <div className='flex flex-col gap-3 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900'>
        <div className='flex flex-1 flex-col gap-3 sm:flex-row sm:items-center'>
          {/* Search Input */}
          <div className='relative w-full sm:max-w-xs'>
            <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
            <Input
              type='text'
              placeholder='Cari kode, judul, atau catatan...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 text-xs sm:text-sm'
            />
          </div>

          {/* Filter Pilar */}
          <div className='flex items-center gap-2'>
            <Filter className='h-4 w-4 text-slate-400' />
            <select
              value={selectedPilar}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedPilar(val);
                handleFetch(val);
              }}
              disabled={isPending}
              className='h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
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
              className='h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-medium text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            >
              {periodes.map((p) => (
                <option key={p.id} value={p.id}>
                  Tahun {p.tahun} {p.is_active ? '(Aktif)' : ''}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Counter Summary */}
        <div className='text-xs text-slate-500 dark:text-slate-400'>
          Menampilkan{' '}
          <span className='font-bold text-slate-800 dark:text-slate-100'>
            {totalFilteredCount}
          </span>{' '}
          kartu indikator aktif
        </div>
      </div>

      {/* 3. Kanban Columns (3-Column Layout) */}
      <div className='grid grid-cols-1 items-start gap-6 lg:grid-cols-3'>
        {/* ============================================================ */}
        {/* Kolom 1: PERLU REVISI (To Do) - Prioritas Utama              */}
        {/* ============================================================ */}
        <div className='flex flex-col space-y-4'>
          {/* Column Header */}
          <div className='flex items-center justify-between rounded-xl border border-rose-200/80 bg-rose-50/80 p-3.5 dark:border-rose-900/60 dark:bg-rose-950/30'>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-rose-500 text-white shadow-xs'>
                <AlertTriangle className='h-3.5 w-3.5' />
              </div>
              <span className='font-bold text-rose-900 dark:text-rose-200'>
                Perlu Revisi (To Do)
              </span>
            </div>
            <Badge
              variant='destructive'
              className='bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow-xs'
            >
              {filteredCards.perluRevisi.length}
            </Badge>
          </div>

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.perluRevisi.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-rose-200/80 bg-rose-50/30 p-8 text-center dark:border-rose-900/40 dark:bg-rose-950/10'>
                <CheckCircle2 className='h-8 w-8 text-emerald-500' />
                <p className='mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200'>
                  Tidak ada indikator yang perlu revisi!
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
                  className='border-rose-200/80 shadow-xs transition-shadow hover:shadow-md dark:border-rose-900/60 dark:bg-slate-900'
                >
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className='border-rose-300 bg-rose-50 text-[11px] font-semibold text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      >
                        {card.pilar_kode}
                      </Badge>
                      <span className='text-[11px] font-bold text-slate-500 dark:text-slate-400'>
                        {card.kode_indikator}
                      </span>
                    </div>
                    <CardTitle className='mt-1 text-sm font-bold text-slate-900 dark:text-slate-100'>
                      {card.uraian_singkat}
                    </CardTitle>
                    <CardDescription className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                      {card.uraian_pertanyaan}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='space-y-3 p-4 pt-2'>
                    {/* Box Catatan Revisi Khusus */}
                    {card.catatan_koordinator ? (
                      <div className='rounded-xl border border-rose-300/80 bg-rose-100/50 p-3 text-xs dark:border-rose-800/80 dark:bg-rose-950/40'>
                        <div className='flex items-center gap-1.5 font-bold text-rose-800 dark:text-rose-300'>
                          <AlertTriangle className='h-3.5 w-3.5 shrink-0' />
                          <span>Poin Perbaikan dari Verifikator:</span>
                        </div>
                        <p className='mt-1 text-rose-900/90 italic dark:text-rose-200/90'>
                          &ldquo;{card.catatan_koordinator}&rdquo;
                        </p>
                      </div>
                    ) : (
                      <div className='rounded-lg bg-rose-50 p-2 text-xs text-rose-600 italic dark:bg-rose-950/20 dark:text-rose-400'>
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

                    {/* Action Link to Form Pilar */}
                    <div className='pt-1'>
                      <Link
                        href={`/rebo/formRB/${card.pilar_id}`}
                        className='block w-full'
                      >
                        <Button
                          variant='default'
                          size='sm'
                          className='w-full justify-between bg-rose-600 text-xs font-semibold text-white shadow-xs hover:bg-rose-700'
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
        {/* Kolom 2: MENUNGGU REVIEW (In Review)                         */}
        {/* ============================================================ */}
        <div className='flex flex-col space-y-4'>
          {/* Column Header */}
          <div className='flex items-center justify-between rounded-xl border border-amber-200/80 bg-amber-50/80 p-3.5 dark:border-amber-900/60 dark:bg-amber-950/30'>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs'>
                <Clock className='h-3.5 w-3.5' />
              </div>
              <span className='font-bold text-amber-900 dark:text-amber-200'>
                Menunggu Review (In Review)
              </span>
            </div>
            <Badge
              variant='outline'
              className='border-amber-300 bg-amber-200/70 px-2.5 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-700 dark:bg-amber-900/60 dark:text-amber-200'
            >
              {filteredCards.menungguReview.length}
            </Badge>
          </div>

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.menungguReview.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200/80 bg-amber-50/30 p-8 text-center dark:border-amber-900/40 dark:bg-amber-950/10'>
                <Clock className='h-8 w-8 text-amber-400' />
                <p className='mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200'>
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
                  className='border-amber-200/70 shadow-xs transition-shadow hover:shadow-md dark:border-amber-900/50 dark:bg-slate-900'
                >
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className='border-amber-300 bg-amber-50 text-[11px] font-semibold text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      >
                        {card.pilar_kode}
                      </Badge>
                      <span className='text-[11px] font-bold text-slate-500 dark:text-slate-400'>
                        {card.kode_indikator}
                      </span>
                    </div>
                    <CardTitle className='mt-1 text-sm font-bold text-slate-900 dark:text-slate-100'>
                      {card.uraian_singkat}
                    </CardTitle>
                    <CardDescription className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                      {card.uraian_pertanyaan}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='space-y-3 p-4 pt-2'>
                    {/* Operator Note / Dokumen summary */}
                    <div className='rounded-lg bg-amber-50/60 p-2.5 text-xs dark:bg-amber-950/20'>
                      <div className='flex items-center justify-between font-semibold text-amber-800 dark:text-amber-300'>
                        <span>
                          {card.total_dokumen} Dokumen Bukti Disematkan
                        </span>
                        <span>
                          Skor Usulan: {card.nilai_mandiri.toFixed(2)}
                        </span>
                      </div>
                      {card.catatan_operator && (
                        <p className='mt-1 text-slate-600 italic dark:text-slate-300'>
                          &ldquo;{card.catatan_operator}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Action Link to Form Pilar */}
                    <div className='pt-1'>
                      <Link
                        href={`/rebo/formRB/${card.pilar_id}`}
                        className='block w-full'
                      >
                        <Button
                          variant='outline'
                          size='sm'
                          className='w-full justify-between border-amber-300 text-xs font-semibold text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-950/50'
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
        {/* Kolom 3: DISETUJUI (Done)                                    */}
        {/* ============================================================ */}
        <div className='flex flex-col space-y-4'>
          {/* Column Header */}
          <div className='flex items-center justify-between rounded-xl border border-emerald-200/80 bg-emerald-50/80 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30'>
            <div className='flex items-center gap-2'>
              <div className='flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs'>
                <CheckCircle2 className='h-3.5 w-3.5' />
              </div>
              <span className='font-bold text-emerald-900 dark:text-emerald-200'>
                Disetujui (Done)
              </span>
            </div>
            <Badge
              variant='outline'
              className='border-emerald-300 bg-emerald-200/70 px-2.5 py-0.5 text-xs font-bold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-200'
            >
              {filteredCards.disetujui.length}
            </Badge>
          </div>

          {/* Cards Container */}
          <div className='space-y-3'>
            {filteredCards.disetujui.length === 0 ? (
              <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-200/80 bg-emerald-50/30 p-8 text-center dark:border-emerald-900/40 dark:bg-emerald-950/10'>
                <FileText className='h-8 w-8 text-emerald-400' />
                <p className='mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200'>
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
                  className='border-emerald-200/70 shadow-xs transition-shadow hover:shadow-md dark:border-emerald-900/50 dark:bg-slate-900'
                >
                  <CardHeader className='p-4 pb-2'>
                    <div className='flex items-center justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className='border-emerald-300 bg-emerald-50 text-[11px] font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      >
                        {card.pilar_kode}
                      </Badge>
                      <span className='text-[11px] font-bold text-slate-500 dark:text-slate-400'>
                        {card.kode_indikator}
                      </span>
                    </div>
                    <CardTitle className='mt-1 text-sm font-bold text-slate-900 dark:text-slate-100'>
                      {card.uraian_singkat}
                    </CardTitle>
                    <CardDescription className='line-clamp-2 text-xs text-slate-500 dark:text-slate-400'>
                      {card.uraian_pertanyaan}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className='space-y-3 p-4 pt-2'>
                    <div className='rounded-lg bg-emerald-50/60 p-2.5 text-xs dark:bg-emerald-950/20'>
                      <div className='flex items-center justify-between font-bold text-emerald-800 dark:text-emerald-300'>
                        <span>Skor Terverifikasi:</span>
                        <span>
                          {card.nilai_verifikasi.toFixed(2)} /{' '}
                          {card.nilai_maksimal.toFixed(2)}
                        </span>
                      </div>
                      {card.verified_by && (
                        <p className='mt-1 text-[11px] text-slate-600 dark:text-slate-400'>
                          Disetujui oleh:{' '}
                          <span className='font-semibold'>
                            {card.verified_by}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Action Link to Form Pilar */}
                    <div className='pt-1'>
                      <Link
                        href={`/rebo/formRB/${card.pilar_id}`}
                        className='block w-full'
                      >
                        <Button
                          variant='ghost'
                          size='sm'
                          className='w-full justify-between text-xs text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
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
