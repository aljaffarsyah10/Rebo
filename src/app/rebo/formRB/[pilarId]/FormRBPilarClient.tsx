'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  Layers,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Equal,
  Sparkles,
  ArrowUp,
  Cloud
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import PertanyaanItem from '@/components/rebo/pertanyaan-item';
import { OfflineSyncIndicator } from '@/components/rebo/offline-sync-indicator';
import {
  ROLE_LABELS,
  type PilarDefinition,
  type UserSession
} from '@/lib/auth/rbac';
import type { Subpilar, BuktiDukung, PeriodeEvaluasi } from '@/types/rebo';

interface Props {
  pilarId: string;
  pilarInfo?: PilarDefinition;
  session: UserSession;
  canEdit: boolean;
  canVerify: boolean;
  activePeriode: PeriodeEvaluasi | null;
  initialSubpilar: Subpilar[];
  initialBuktiMap: Record<string, BuktiDukung>;
}

export default function FormRBPilarClient({
  pilarId,
  pilarInfo,
  session,
  canEdit,
  canVerify,
  activePeriode,
  initialSubpilar,
  initialBuktiMap
}: Props) {
  const [subpilarList] = useState<Subpilar[]>(initialSubpilar || []);
  const [buktiDukungMap, setBuktiDukungMap] = useState<
    Record<string, BuktiDukung>
  >(initialBuktiMap || {});

  // Set first subpilar as initial active tab
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialSubpilar && initialSubpilar.length > 0) {
      return String(initialSubpilar[0].id_subpilar);
    }
    return '1';
  });

  // Auto-switch subpilar tab & auto-scroll if `indikator` query param or hash exists
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    let targetIndikator = params.get('indikator');
    if (!targetIndikator && window.location.hash.startsWith('#indikator-')) {
      targetIndikator = window.location.hash.replace('#indikator-', '');
    }

    if (targetIndikator && subpilarList.length > 0) {
      // Find which subpilar contains this indicator
      const parentSubpilar = subpilarList.find((sub) =>
        (sub.pertanyaan || []).some(
          (q: any) => String(q.id_pertanyaan) === String(targetIndikator)
        )
      );

      if (parentSubpilar) {
        setActiveTab(String(parentSubpilar.id_subpilar));
      }

      const timeoutId = setTimeout(() => {
        const el = document.getElementById(`indikator-${targetIndikator}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          el.classList.add(
            'ring-2',
            'ring-rose-500',
            'ring-offset-2',
            'transition-all'
          );
          setTimeout(() => {
            el.classList.remove('ring-2', 'ring-rose-500', 'ring-offset-2');
          }, 3500);
        }
      }, 350);

      return () => clearTimeout(timeoutId);
    }
  }, [subpilarList]);

  // Sticky Floating Summary Bar state & scroll listener
  const [isStickyVisible, setIsStickyVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 280) {
        setIsStickyVisible(true);
      } else {
        setIsStickyVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Calculate Pilar Statistics & Dual-Scoring Metrics
  const stats = useMemo(() => {
    let totalQuestions = 0;
    let belumDiisi = 0;
    let menungguReview = 0;
    let disetujui = 0;
    let perluRevisi = 0;
    let totalSkorMandiri = 0;
    let totalSkorVerifikasi = 0;
    let totalSkorMaks = 0;

    subpilarList.forEach((sub) => {
      (sub.pertanyaan || []).forEach((q: any) => {
        totalQuestions++;
        const bukti = buktiDukungMap[q.id_pertanyaan];
        const status = Number(bukti?.status_kelengkapan ?? 0);

        if (status === 2) disetujui++;
        else if (status === 1) menungguReview++;
        else if (status === 3) perluRevisi++;
        else belumDiisi++;

        const mandiri = Number(bukti?.nilai_mandiri ?? bukti?.nilai_akhir ?? 0);
        totalSkorMandiri += mandiri;

        // Nilai verifikasi dihitung jika berstatus disetujui (2) atau memiliki nilai_verifikasi
        const verifikasi =
          status === 2
            ? Number(
                bukti?.nilai_verifikasi !== null &&
                  bukti?.nilai_verifikasi !== undefined
                  ? bukti.nilai_verifikasi
                  : mandiri
              )
            : Number(bukti?.nilai_verifikasi ?? 0);

        totalSkorVerifikasi += verifikasi;

        const maxScore = q.kategoriPenilaian?.length
          ? Math.max(...q.kategoriPenilaian.map((k: any) => k.nilai || 0))
          : 0;
        totalSkorMaks += maxScore;
      });
    });

    const completionPercent =
      totalQuestions > 0
        ? Math.round(((disetujui + menungguReview) / totalQuestions) * 100)
        : 0;

    const deviasiSkor = Number(
      (totalSkorVerifikasi - totalSkorMandiri).toFixed(2)
    );

    return {
      totalQuestions,
      belumDiisi,
      menungguReview,
      disetujui,
      perluRevisi,
      totalSkorMandiri,
      totalSkorVerifikasi,
      totalSkorMaks,
      completionPercent,
      deviasiSkor
    };
  }, [subpilarList, buktiDukungMap]);

  const pilarName =
    pilarInfo?.nama ||
    (subpilarList[0]?.pilar as any)?.nama_pilar ||
    `Pilar ${pilarId}`;

  const roleLabel = session.role
    ? ROLE_LABELS[session.role] || session.role
    : 'Tamu / Tanpa Peran';

  return (
    <div className='container mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8'>
      {/* 1. BREADCRUMBS & TOP NAV */}
      <div className='flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400'>
        <div className='flex items-center gap-1.5'>
          <Link
            href='/rebo/overview'
            className='hover:text-blue-600 dark:hover:text-blue-400'
          >
            Overview
          </Link>
          <ChevronRight className='h-3.5 w-3.5' />
          <Link
            href='/rebo/formRB/area'
            className='hover:text-blue-600 dark:hover:text-blue-400'
          >
            Form LKE
          </Link>
          <ChevronRight className='h-3.5 w-3.5' />
          <span className='font-semibold text-gray-800 dark:text-gray-200'>
            Pilar {pilarId}
          </span>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <OfflineSyncIndicator className='hidden md:flex' />
          <Link href='/rebo/formRB/area'>
            <Button variant='outline' size='sm' className='h-8 text-xs'>
              <ArrowLeft className='mr-1.5 h-3.5 w-3.5' />
              Pilih Area Lain
            </Button>
          </Link>
          <Link href='/rebo/monitoring'>
            <Button
              variant='ghost'
              size='sm'
              className='h-8 text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400'
            >
              <Layers className='mr-1.5 h-3.5 w-3.5' />
              Monitoring
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. HEADER PILAR BANNER WITH DUAL-SCORING COMPARISON */}
      <div className='relative overflow-hidden rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white shadow-md dark:border-gray-800'>
        <div className='relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center'>
          <div className='max-w-2xl space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center rounded-md border border-blue-400/30 bg-blue-500/20 px-2.5 py-1 text-xs font-bold text-blue-200 backdrop-blur-xs'>
                PILAR {pilarId}
              </span>
              <span className='inline-flex items-center rounded-md bg-white/10 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-xs'>
                Periode Evaluasi: {activePeriode?.tahun || 2026}
              </span>
              <span className='inline-flex items-center gap-1 rounded-md border border-emerald-400/30 bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-200'>
                <ShieldCheck className='h-3.5 w-3.5' />
                {roleLabel}
              </span>
              {canVerify && (
                <span className='inline-flex items-center gap-1 rounded-md border border-amber-400/30 bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-200'>
                  <Sparkles className='h-3.5 w-3.5' />
                  Akses Verifikator Aktif
                </span>
              )}
            </div>

            <h1 className='text-2xl font-extrabold tracking-tight sm:text-3xl'>
              {pilarName}
            </h1>

            <p className='text-sm leading-relaxed text-blue-100/80'>
              {pilarInfo?.deskripsi ||
                'Pengisian instrumen Lembar Kerja Evaluasi (LKE) Zona Integritas & Reformasi Birokrasi BPS Sitaro.'}
            </p>
          </div>

          {/* Quick Dual-Score Card */}
          <div className='flex shrink-0 flex-col gap-3 rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur-xs sm:flex-row lg:flex-col'>
            <div className='grid grid-cols-2 gap-4 border-b border-white/10 pb-3 sm:border-r sm:border-b-0 sm:pr-4 sm:pb-0 lg:border-r-0 lg:border-b lg:pr-0 lg:pb-3'>
              {/* Skor Mandiri */}
              <div>
                <div className='text-2xs font-medium text-blue-200 uppercase'>
                  Skor Mandiri (Usulan)
                </div>
                <div className='text-xl font-black text-white'>
                  {stats.totalSkorMandiri.toFixed(2)}
                  <span className='text-xs font-normal text-blue-200'>
                    {' '}
                    / {stats.totalSkorMaks.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Skor Verifikasi */}
              <div>
                <div className='text-2xs font-medium text-emerald-300 uppercase'>
                  Skor Verifikasi (Final)
                </div>
                <div className='text-xl font-black text-emerald-300'>
                  {stats.totalSkorVerifikasi.toFixed(2)}
                  <span className='text-xs font-normal text-emerald-200/70'>
                    {' '}
                    / {stats.totalSkorMaks.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Deviasi & Progress Bar */}
            <div className='space-y-2 pt-1'>
              <div className='text-2xs flex items-center justify-between'>
                <span className='text-blue-200'>Selisih (Deviasi):</span>
                <span
                  className={`inline-flex items-center gap-1 font-mono font-bold ${
                    stats.deviasiSkor > 0
                      ? 'text-emerald-300'
                      : stats.deviasiSkor < 0
                        ? 'text-rose-300'
                        : 'text-blue-200'
                  }`}
                >
                  {stats.deviasiSkor > 0 ? (
                    <>
                      <TrendingUp className='h-3 w-3' />+
                      {stats.deviasiSkor.toFixed(2)}
                    </>
                  ) : stats.deviasiSkor < 0 ? (
                    <>
                      <TrendingDown className='h-3 w-3' />
                      {stats.deviasiSkor.toFixed(2)}
                    </>
                  ) : (
                    <>
                      <Equal className='h-3 w-3' />
                      0.00 (Selaras)
                    </>
                  )}
                </span>
              </div>

              <div>
                <div className='text-3xs mb-1 flex items-center justify-between text-blue-200'>
                  <span>Penyelesaian Bukti:</span>
                  <span className='font-bold'>{stats.completionPercent}%</span>
                </div>
                <Progress
                  value={stats.completionPercent}
                  className='h-2 bg-white/20'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className='pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl'></div>
      </div>

      {/* 3. RBAC NOTICE BANNER */}
      {!canEdit ? (
        <div className='flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-xs dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
          <Lock className='mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400' />
          <div className='flex-1'>
            <div className='font-bold text-amber-950 dark:text-amber-100'>
              Mode Pratinjau Bukti (Read-Only)
            </div>
            <p className='mt-0.5 text-xs leading-relaxed'>
              Anda membuka formulir ini sebagai{' '}
              <span className='font-semibold'>{roleLabel}</span>.
              {canVerify ? (
                <span>
                  {' '}
                  Anda memiliki wewenang verifikasi untuk memeriksa dan memberi
                  skor pada panel verifikasi di setiap indikator.
                </span>
              ) : (
                <span>
                  {' '}
                  Anda tidak memiliki wewenang untuk mengubah bukti dukung pada
                  Pilar {pilarId}. Hak edit bukti dimiliki oleh Operator Tim
                  Pilar {pilarId} atau Super Admin.
                </span>
              )}
            </p>
          </div>
        </div>
      ) : (
        <div className='flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3.5 text-xs text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'>
          <div className='flex items-center gap-2'>
            <CheckCircle2 className='h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
            <span>
              <strong className='font-semibold'>Mode Pengisian Aktif:</strong>{' '}
              Anda memiliki hak akses penuh untuk mengunggah berkas bukti dan
              mengisi penilaian mandiri pada Pilar ini.
            </span>
          </div>
          <span className='text-2xs hidden rounded bg-emerald-100 px-2 py-0.5 font-mono text-emerald-800 sm:inline-block dark:bg-emerald-900/60 dark:text-emerald-300'>
            RBAC: OPERATOR_AUTHORIZED
          </span>
        </div>
      )}

      {/* 4. STATS SUMMARY BADGES */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'>
            <AlertCircle className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs text-gray-500 dark:text-gray-400'>
              Belum Diisi
            </div>
            <div className='text-lg font-bold text-gray-900 dark:text-gray-100'>
              {stats.belumDiisi}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400'>
            <Clock className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs font-medium text-amber-700 dark:text-amber-400'>
              Menunggu Review
            </div>
            <div className='text-lg font-bold text-amber-900 dark:text-amber-200'>
              {stats.menungguReview}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400'>
            <CheckCircle2 className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs font-medium text-emerald-700 dark:text-emerald-400'>
              Disetujui
            </div>
            <div className='text-lg font-bold text-emerald-900 dark:text-emerald-200'>
              {stats.disetujui}
            </div>
          </div>
        </div>

        <div className='flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-800 dark:bg-gray-900'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400'>
            <XCircle className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs font-medium text-rose-700 dark:text-rose-400'>
              Perlu Revisi
            </div>
            <div className='text-lg font-bold text-rose-900 dark:text-rose-200'>
              {stats.perluRevisi}
            </div>
          </div>
        </div>
      </div>

      {/* 5. SUBPILAR TABS & PERTANYAAN ITEMS */}
      {subpilarList.length > 0 ? (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className='w-full space-y-6'
        >
          {/* Tabs Navigation */}
          <TabsList className='grid h-auto w-full grid-cols-1 gap-1.5 rounded-xl border border-gray-200 bg-gray-100/70 p-1.5 sm:grid-cols-2 lg:grid-cols-4 dark:border-gray-800 dark:bg-gray-900/60'>
            {subpilarList.map((subpilar: any) => {
              const qCount = subpilar.pertanyaan?.length || 0;
              return (
                <TabsTrigger
                  key={subpilar.id_subpilar}
                  value={String(subpilar.id_subpilar)}
                  className='flex flex-col items-start justify-start rounded-lg p-3 text-left whitespace-normal transition-all data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow-xs dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-blue-200'
                >
                  <div className='mb-1 flex w-full items-center justify-between'>
                    <span className='text-2xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400'>
                      Subpilar {subpilar.id_subpilar}
                    </span>
                    <Badge variant='outline' className='text-3xs px-1.5 py-0'>
                      {qCount} Indikator
                    </Badge>
                  </div>
                  <span className='line-clamp-2 text-xs leading-tight font-semibold text-gray-800 dark:text-gray-200'>
                    {subpilar.nama_subpilar}
                  </span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* Tabs Contents */}
          {subpilarList.map((subpilar: any) => (
            <TabsContent
              key={subpilar.id_subpilar}
              value={String(subpilar.id_subpilar)}
              className='mt-4 space-y-6 focus-visible:outline-none'
            >
              {/* Subpilar Header Information */}
              <div className='rounded-2xl border border-gray-200 bg-white p-6 shadow-xs dark:border-gray-800 dark:bg-gray-900'>
                <div className='flex items-start gap-4'>
                  <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-lg font-extrabold text-blue-700 shadow-xs dark:bg-blue-950 dark:text-blue-300'>
                    {subpilar.id_subpilar}
                  </div>
                  <div>
                    <h2 className='text-xl font-bold text-gray-900 dark:text-gray-100'>
                      {subpilar.nama_subpilar}
                    </h2>
                    {subpilar.deskripsi_subpilar && (
                      <p className='mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300'>
                        {subpilar.deskripsi_subpilar}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Questions List */}
              {subpilar.pertanyaan && subpilar.pertanyaan.length > 0 ? (
                <div className='space-y-6'>
                  {subpilar.pertanyaan.map((pertanyaan: any, index: number) => (
                    <PertanyaanItem
                      key={pertanyaan.id_pertanyaan}
                      pertanyaan={pertanyaan}
                      index={index}
                      bukti={buktiDukungMap[pertanyaan.id_pertanyaan]}
                      buktiDukungMap={buktiDukungMap}
                      setBuktiDukungMap={setBuktiDukungMap}
                      canEdit={canEdit}
                      canVerify={canVerify}
                      activePeriodeId={activePeriode?.id}
                      activePeriodeYear={activePeriode?.tahun}
                      targetPilarId={pilarId}
                    />
                  ))}
                </div>
              ) : (
                <div className='rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900'>
                  <p className='text-sm text-gray-500 dark:text-gray-400'>
                    Belum ada indikator pertanyaan yang terdaftar pada subpilar
                    ini.
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className='rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-700 dark:bg-gray-900'>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            Data subpilar untuk Pilar {pilarId} belum tersedia.
          </p>
        </div>
      )}
      {/* 6. STICKY SUMMARY FLOATING BAR */}
      {isStickyVisible && (
        <aside
          aria-label='Bilah Ringkasan Form Melayang'
          className='animate-in fade-in slide-in-from-bottom-4 fixed inset-x-0 bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] z-40 mx-auto max-w-5xl px-3 transition-all duration-300 sm:px-4'
        >
          <div className='flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-slate-200/90 bg-white/95 p-3 shadow-xl backdrop-blur-md sm:gap-3 sm:p-3.5 dark:border-slate-700/80 dark:bg-slate-900/95'>
            {/* Left: Pilar & Score Information */}
            <div className='flex min-w-0 items-center gap-2.5 sm:gap-3'>
              <div className='hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white shadow-xs sm:flex'>
                P{pilarId}
              </div>
              <div className='min-w-0'>
                <div className='flex items-center gap-2'>
                  <span className='truncate text-xs font-bold text-slate-800 dark:text-slate-100'>
                    {pilarName}
                  </span>
                  <Badge
                    variant='outline'
                    className='text-3xs bg-blue-50/70 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                  >
                    {stats.completionPercent}% Selesai
                  </Badge>
                </div>
                <div className='text-3xs mt-0.5 flex flex-wrap items-center gap-1.5 text-slate-500 dark:text-slate-300'>
                  <span>
                    {stats.disetujui + stats.menungguReview} dari{' '}
                    {stats.totalQuestions} indikator terisi
                  </span>
                  <span>•</span>
                  <span>
                    Skor Usulan:{' '}
                    <strong className='font-mono text-slate-700 dark:text-slate-200'>
                      {stats.totalSkorMandiri.toFixed(2)}
                    </strong>{' '}
                    / {stats.totalSkorMaks.toFixed(2)}
                  </span>
                  {stats.totalSkorVerifikasi > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        Verifikasi:{' '}
                        <strong className='font-mono text-emerald-600 dark:text-emerald-400'>
                          {stats.totalSkorVerifikasi.toFixed(2)}
                        </strong>
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Offline Sync Indicator & Scroll To Top */}
            <div className='flex shrink-0 items-center gap-2'>
              <OfflineSyncIndicator compact />

              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={scrollToTop}
                className='h-9 min-h-[36px] touch-manipulation rounded-xl border-slate-300 bg-white/90 px-3 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-100 sm:h-8 sm:min-h-[32px] dark:border-slate-700 dark:bg-slate-800/90 dark:text-slate-200 dark:hover:bg-slate-700'
                title='Kembali ke bagian atas'
              >
                <ArrowUp className='mr-1.5 h-3.5 w-3.5' />
                <span>Scroll ke Atas</span>
              </Button>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
