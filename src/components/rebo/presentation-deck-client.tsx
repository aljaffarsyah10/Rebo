'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  Presentation,
  Download,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  Tv,
  ArrowLeft,
  ExternalLink,
  Layers,
  MessageSquare,
  Award,
  ShieldCheck,
  Building2,
  RefreshCw,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  PresentationDeckData,
  SlideData,
  DEFAULT_PRESENTATION_DATA
} from '@/lib/presentation/pptx-generator';

interface PresentationDeckClientProps {
  initialData?: PresentationDeckData;
}

export default function PresentationDeckClient({
  initialData = DEFAULT_PRESENTATION_DATA
}: PresentationDeckClientProps) {
  const [deckData] = useState<PresentationDeckData>(initialData);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isAutoPlay, setIsAutoPlay] = useState<boolean>(false);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState<boolean>(true);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'inspector' | 'grid'>('inspector');
  const fullscreenContainerRef = useRef<HTMLDivElement>(null);

  const currentSlide: SlideData =
    deckData.slides[currentSlideIndex] || deckData.slides[0];

  // Navigasi Slide
  const goToNextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) =>
      prev < deckData.slides.length - 1 ? prev + 1 : 0
    );
  }, [deckData.slides.length]);

  const goToPrevSlide = useCallback(() => {
    setCurrentSlideIndex((prev) =>
      prev > 0 ? prev - 1 : deckData.slides.length - 1
    );
  }, [deckData.slides.length]);

  // Keyboard navigation untuk mode slide show & presentasi
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        (isFullscreen && e.key === ' ')
      ) {
        e.preventDefault();
        goToNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        goToPrevSlide();
      } else if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide, isFullscreen]);

  // Auto-play presentasi
  useEffect(() => {
    if (!isAutoPlay) return;
    const interval = setInterval(() => {
      goToNextSlide();
    }, 12000); // 12 detik per slide

    return () => clearInterval(interval);
  }, [isAutoPlay, goToNextSlide]);

  // Toggle Layar Penuh
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (fullscreenContainerRef.current?.requestFullscreen) {
        fullscreenContainerRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Unduh File PPTX
  const handleDownloadPptx = async () => {
    try {
      setIsDownloading(true);
      setDownloadProgress(25);

      const response = await fetch(`/api/export/pptx?tahun=${deckData.tahun}`);
      setDownloadProgress(65);

      if (!response.ok) {
        throw new Error('Gagal mengunduh berkas presentasi PPTX');
      }

      setDownloadProgress(85);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `PAPARAN_ZI_WBK_BPS_SITARO_${deckData.tahun}.pptx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setDownloadProgress(100);
      setTimeout(() => {
        setIsDownloading(false);
        setDownloadProgress(0);
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat mengunduh presentasi.');
      setIsDownloading(false);
      setDownloadProgress(0);
    }
  };

  return (
    <div className='flex-1 space-y-6 p-4 pt-6 md:p-8'>
      {/* Top Breadcrumb & Satker Badge */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='mb-1 flex items-center gap-2'>
            <Badge
              variant='outline'
              className='border-blue-600/30 bg-blue-50/50 font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-300'
            >
              <Building2 className='mr-1 h-3 w-3' />
              {deckData.satkerShort} ({deckData.satkerKode})
            </Badge>
            <Badge
              variant='outline'
              className='border-amber-500/30 bg-amber-50/50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300'
            >
              <Award className='mr-1 h-3 w-3' />
              Target WBK {deckData.tahun}
            </Badge>
          </div>
          <h1 className='flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
            <Presentation className='h-7 w-7 text-blue-800 dark:text-blue-400' />
            Paparan Presentasi ZI (One-Click PPTX)
          </h1>
          <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
            Generator slide resmi PowerPoint (.pptx) untuk pemaparan Zona
            Integritas BPS Kabupaten Kepulauan Sitaro di hadapan TPN KemenPAN-RB
            & TPI BPS RI.
          </p>
        </div>

        {/* Action Buttons */}
        <div className='flex flex-wrap items-center gap-2'>
          <Button
            onClick={toggleFullscreen}
            variant='outline'
            className='border-blue-700 text-blue-800 shadow-sm hover:bg-blue-50 dark:border-blue-500 dark:text-blue-300 dark:hover:bg-blue-950/50'
          >
            <Tv className='mr-2 h-4 w-4' />
            Mode Layar Penuh (Gladi Bersih)
          </Button>

          <Button
            onClick={handleDownloadPptx}
            disabled={isDownloading}
            className='bg-blue-900 font-medium text-white shadow-sm hover:bg-blue-800'
          >
            {isDownloading ? (
              <>
                <RefreshCw className='mr-2 h-4 w-4 animate-spin' />
                Mengunduh ({downloadProgress}%)...
              </>
            ) : (
              <>
                <Download className='mr-2 h-4 w-4' />
                Unduh Slide (.pptx)
              </>
            )}
          </Button>
        </div>
      </div>

      {/* KPI Highlights Bar */}
      <div className='grid grid-cols-2 gap-3 md:grid-cols-4'>
        <Card className='border-0 bg-gradient-to-br from-blue-900 to-blue-950 text-white shadow'>
          <CardContent className='p-4'>
            <p className='text-xs text-blue-200'>Total Slide Paparan</p>
            <p className='mt-1 text-2xl font-bold text-white'>
              {deckData.slides.length} Slide
            </p>
            <p className='mt-1 flex items-center gap-1 text-xs font-medium text-amber-300'>
              <CheckCircle2 className='h-3 w-3' /> Standar Resmi TPN 2026
            </p>
          </CardContent>
        </Card>

        <Card className='border bg-white shadow-sm dark:bg-slate-900'>
          <CardContent className='p-4'>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Kepala BPS Sitaro (Pemapar)
            </p>
            <p className='mt-1 truncate text-sm font-bold text-slate-800 dark:text-slate-100'>
              {deckData.namaKepala}
            </p>
            <p className='mt-1 truncate text-xs text-slate-500'>
              NIP. {deckData.nipKepala}
            </p>
          </CardContent>
        </Card>

        <Card className='border bg-white shadow-sm dark:bg-slate-900'>
          <CardContent className='p-4'>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Survei Pelayanan (IKM & IPAK)
            </p>
            <div className='mt-1 flex items-center gap-3'>
              <div>
                <span className='text-xs text-slate-400'>IKM: </span>
                <span className='text-sm font-bold text-emerald-600 dark:text-emerald-400'>
                  {deckData.ikmScore}
                </span>
              </div>
              <div>
                <span className='text-xs text-slate-400'>IPAK: </span>
                <span className='text-sm font-bold text-blue-700 dark:text-blue-400'>
                  {deckData.ipakScore}
                </span>
              </div>
            </div>
            <p className='mt-1 text-xs font-medium text-emerald-600 dark:text-emerald-400'>
              Kategori: Sangat Baik & Bebas Pungli
            </p>
          </CardContent>
        </Card>

        <Card className='border bg-white shadow-sm dark:bg-slate-900'>
          <CardContent className='p-4'>
            <p className='text-xs text-slate-500 dark:text-slate-400'>
              Skor Evaluasi LKE WBK
            </p>
            <p className='mt-1 text-2xl font-bold text-amber-600 dark:text-amber-400'>
              {deckData.totalLkeScore}
            </p>
            <p className='mt-1 text-xs text-slate-500'>
              Status: Memenuhi Syarat WBK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Slide Workspace */}
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as 'inspector' | 'grid')}
        className='w-full'
      >
        <div className='flex items-center justify-between border-b pb-2'>
          <TabsList className='bg-slate-100 dark:bg-slate-800'>
            <TabsTrigger
              value='inspector'
              className='flex items-center gap-1.5'
            >
              <Presentation className='h-3.5 w-3.5' />
              Pratinjau Interaktif (Slide {currentSlideIndex + 1}/
              {deckData.slides.length})
            </TabsTrigger>
            <TabsTrigger value='grid' className='flex items-center gap-1.5'>
              <Layers className='h-3.5 w-3.5' />
              Semua Slide ({deckData.slides.length})
            </TabsTrigger>
          </TabsList>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              className={
                isAutoPlay ? 'border-amber-300 bg-amber-50 text-amber-800' : ''
              }
            >
              {isAutoPlay ? (
                <Pause className='mr-1 h-3.5 w-3.5' />
              ) : (
                <Play className='mr-1 h-3.5 w-3.5' />
              )}
              {isAutoPlay ? 'Jeda Otomatis' : 'Putar Otomatis'}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
              className='text-xs text-slate-600'
            >
              <MessageSquare className='mr-1 h-3.5 w-3.5' />
              {showSpeakerNotes ? 'Sembunyikan Catatan' : 'Tampilkan Catatan'}
            </Button>
          </div>
        </div>

        {/* TAB 1: INSPECTOR & LIVE SLIDE CANVAS */}
        <TabsContent value='inspector' className='mt-4 space-y-4'>
          {/* Slide Navigation Thumbnails Row */}
          <div className='scrollbar-thin flex items-center gap-2 overflow-x-auto pb-2'>
            {deckData.slides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlideIndex(idx)}
                className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-left text-xs font-medium transition-all ${
                  currentSlideIndex === idx
                    ? 'border-blue-900 bg-blue-900 text-white shadow-sm ring-2 ring-blue-500/30'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <div className='flex items-center gap-1'>
                  <span className='opacity-75'>#{slide.slideNumber}</span>
                  <span className='max-w-[120px] truncate'>
                    {slide.category.replace('PENGUNGKIT - ', '')}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            {/* The 16:9 Slide Canvas Container */}
            <div className='flex flex-col items-center lg:col-span-8'>
              <div className='w-full rounded-xl border bg-slate-900/5 p-2 shadow-inner md:p-4 dark:bg-slate-900'>
                {/* 16:9 Canvas */}
                <div className='relative aspect-[16/9] w-full overflow-hidden rounded-lg shadow-2xl transition-all'>
                  <SlideCanvasView slide={currentSlide} deckData={deckData} />
                </div>
              </div>

              {/* Slide Controller Toolbar */}
              <div className='mt-3 flex w-full items-center justify-between px-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={goToPrevSlide}
                  disabled={currentSlideIndex === 0}
                >
                  <ChevronLeft className='mr-1 h-4 w-4' />
                  Sebelumnya
                </Button>

                <div className='flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400'>
                  <span>
                    Slide {currentSlideIndex + 1} dari {deckData.slides.length}
                  </span>
                  <span className='text-slate-300'>•</span>
                  <span className='text-blue-700 dark:text-blue-400'>
                    {currentSlide.category}
                  </span>
                </div>

                <Button
                  variant='outline'
                  size='sm'
                  onClick={goToNextSlide}
                  disabled={currentSlideIndex === deckData.slides.length - 1}
                >
                  Selanjutnya
                  <ChevronRight className='ml-1 h-4 w-4' />
                </Button>
              </div>
            </div>

            {/* Sidebar Inspector: Speaker Notes & Details */}
            <div className='space-y-4 lg:col-span-4'>
              {showSpeakerNotes && (
                <Card className='border-amber-200 bg-amber-50/40 shadow-sm dark:border-amber-900/50 dark:bg-amber-950/20'>
                  <CardHeader className='pb-2'>
                    <CardTitle className='flex items-center gap-1.5 text-sm font-bold text-amber-900 dark:text-amber-300'>
                      <MessageSquare className='h-4 w-4 text-amber-600' />
                      Talking Points Kepala BPS Sitaro
                    </CardTitle>
                  </CardHeader>
                  <CardContent className='space-y-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300'>
                    <div className='rounded border border-amber-200/60 bg-white p-2.5 dark:border-amber-800/40 dark:bg-slate-900'>
                      {currentSlide.talkingPoints}
                    </div>
                    <div className='text-[11px] text-amber-800 italic dark:text-amber-400'>
                      💡 Tip Gladi Bersih: Paparkan dengan intonasi mantap,
                      alokasi waktu ideal ~1 hingga 2 menit per slide untuk
                      durasi total paparan 15-20 menit di hadapan TPN.
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rincian Konten Slide */}
              <Card className='border shadow-sm'>
                <CardHeader className='pb-2'>
                  <CardTitle className='flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200'>
                    <FileText className='h-4 w-4 text-blue-700' />
                    Poin Utama Slide #{currentSlide.slideNumber}
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-xs'>
                  <p className='font-semibold text-slate-900 dark:text-slate-100'>
                    {currentSlide.title}
                  </p>
                  <p className='text-[11px] text-slate-500'>
                    {currentSlide.subtitle}
                  </p>

                  {currentSlide.items && (
                    <div className='mt-2 space-y-1.5 border-t pt-2'>
                      {currentSlide.items.map((item, idx) => (
                        <div
                          key={idx}
                          className='rounded border border-slate-100 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-800/60'
                        >
                          <span className='mb-0.5 block font-bold text-blue-900 dark:text-blue-300'>
                            {item.title}
                          </span>
                          <ul className='list-inside list-disc space-y-0.5 text-[11px] text-slate-600 dark:text-slate-400'>
                            {item.points.map((pt, pIdx) => (
                              <li key={pIdx} className='truncate'>
                                {pt}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: GRID THUMBNAILS ALL SLIDES */}
        <TabsContent value='grid' className='mt-4'>
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
            {deckData.slides.map((slide, idx) => (
              <div
                key={slide.id}
                onClick={() => {
                  setCurrentSlideIndex(idx);
                  setActiveTab('inspector');
                }}
                className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white transition-all hover:shadow-lg dark:bg-slate-900 ${
                  currentSlideIndex === idx
                    ? 'border-blue-600 ring-2 ring-blue-600'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className='relative aspect-[16/9] w-full overflow-hidden bg-slate-950'>
                  <SlideCanvasView
                    slide={slide}
                    deckData={deckData}
                    isThumbnail
                  />
                  <div className='absolute top-2 left-2 rounded bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm'>
                    #{slide.slideNumber}
                  </div>
                  <div className='absolute right-2 bottom-2 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100'>
                    Buka Pratinjau
                  </div>
                </div>
                <div className='p-3'>
                  <p className='truncate text-[10px] font-bold text-blue-700 dark:text-blue-400'>
                    {slide.category}
                  </p>
                  <p className='mt-0.5 truncate text-xs font-semibold text-slate-800 dark:text-slate-200'>
                    {slide.title}
                  </p>
                  <p className='mt-0.5 line-clamp-1 text-[11px] text-slate-500'>
                    {slide.subtitle}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* FULLSCREEN PRESENTATION MODE (WEB SLIDE SHOW / GLADI BERSIH) */}
      {isFullscreen && (
        <div
          ref={fullscreenContainerRef}
          className='fixed inset-0 z-50 flex flex-col justify-between bg-slate-950 p-4 select-none md:p-6'
        >
          {/* Header Controls (Hover / Floating) */}
          <div className='flex items-center justify-between border-b border-white/10 pb-2 text-white/80'>
            <div className='flex items-center gap-2'>
              <span className='text-sm font-bold text-amber-400'>
                BPS SITARO WBK 2026
              </span>
              <span className='text-white/40'>|</span>
              <span className='text-xs text-white/70'>
                {currentSlide.category}
              </span>
            </div>

            <div className='flex items-center gap-3'>
              <span className='text-xs text-white/60'>
                Slide {currentSlideIndex + 1} / {deckData.slides.length}
              </span>
              <button
                onClick={() => setIsAutoPlay(!isAutoPlay)}
                className='flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20'
              >
                {isAutoPlay ? (
                  <Pause className='h-3 w-3' />
                ) : (
                  <Play className='h-3 w-3' />
                )}
                {isAutoPlay ? 'Jeda' : 'Auto'}
              </button>
              <button
                onClick={() => setShowSpeakerNotes(!showSpeakerNotes)}
                className='flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-white hover:bg-white/20'
              >
                <MessageSquare className='h-3 w-3' /> Notes
              </button>
              <button
                onClick={toggleFullscreen}
                className='flex items-center gap-1 rounded bg-red-600/80 px-2 py-1 text-xs text-white hover:bg-red-600'
              >
                <Minimize2 className='h-3 w-3' /> Keluar
              </button>
            </div>
          </div>

          {/* Center 16:9 Canvas Stage */}
          <div className='flex flex-1 items-center justify-center overflow-hidden p-2 md:p-6'>
            <div className='relative aspect-[16/9] w-full max-w-6xl overflow-hidden rounded-xl border border-white/10 shadow-2xl'>
              <SlideCanvasView slide={currentSlide} deckData={deckData} />
            </div>
          </div>

          {/* Floating Speaker Notes Drawer in Fullscreen */}
          {showSpeakerNotes && (
            <div className='mx-auto mb-2 w-full max-w-4xl rounded-xl border border-amber-500/40 bg-slate-900/95 p-3 text-xs text-white shadow-2xl backdrop-blur-md'>
              <div className='mb-1 flex items-center justify-between border-b border-white/10 pb-1'>
                <span className='flex items-center gap-1 font-bold text-amber-400'>
                  <MessageSquare className='h-3 w-3' /> Poin Paparan Pimpinan
                  (Slide #{currentSlide.slideNumber})
                </span>
                <span className='text-[10px] text-white/50'>
                  Gunakan panah kiri/kanan pada keyboard untuk beralih
                </span>
              </div>
              <p className='leading-relaxed text-slate-200'>
                {currentSlide.talkingPoints}
              </p>
            </div>
          )}

          {/* Bottom Navigation Toolbar */}
          <div className='flex items-center justify-between border-t border-white/10 pt-2 text-white'>
            <button
              onClick={goToPrevSlide}
              disabled={currentSlideIndex === 0}
              className='flex items-center gap-1 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 disabled:opacity-30'
            >
              <ChevronLeft className='h-4 w-4' /> Sebelumnya
            </button>

            {/* Quick jump dots */}
            <div className='flex max-w-md items-center gap-1.5 overflow-x-auto px-2'>
              {deckData.slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`h-2 rounded-full transition-all ${
                    currentSlideIndex === idx
                      ? 'w-6 bg-amber-400'
                      : 'w-2 bg-white/30 hover:bg-white/60'
                  }`}
                  title={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={goToNextSlide}
              disabled={currentSlideIndex === deckData.slides.length - 1}
              className='flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-30'
            >
              Selanjutnya <ChevronRight className='h-4 w-4' />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Komponen Visualisasi Canvas Slide 16:9
 * Didesain presisi mencerminkan OpenXML PPTX layout (Navy #003366, Gold #FFBF00, Emerald #059669)
 */
function SlideCanvasView({
  slide,
  deckData,
  isThumbnail = false
}: {
  slide: SlideData;
  deckData: PresentationDeckData;
  isThumbnail?: boolean;
}) {
  if (slide.theme === 'dark') {
    // ----------------------------------------------------
    // COVER / SLIDE PENUTUP (Navy Dark Theme)
    // ----------------------------------------------------
    return (
      <div className='relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#003366] p-[4%] text-white select-none'>
        {/* Decorative Top Accent Stripe */}
        <div className='absolute top-0 right-0 left-0 h-[2%] bg-[#FFBF00]' />
        {/* Decorative Bottom Accent Stripe */}
        <div className='absolute right-0 bottom-0 left-0 h-[2%] bg-[#059669]' />

        {/* Top Category Badge */}
        <div>
          <span className='inline-block rounded border border-[#FFBF00] bg-[#0A4B82] px-3 py-1 text-[10px] font-bold tracking-wider text-[#FFBF00] md:text-xs'>
            {slide.category}
          </span>
          <h2 className='mt-2 text-base leading-tight font-extrabold tracking-tight text-white md:text-2xl lg:text-3xl'>
            {slide.title}
          </h2>
          <p className='mt-1 text-xs font-medium text-blue-200 md:text-sm'>
            {slide.subtitle}
          </p>
        </div>

        {/* Middle Body */}
        {slide.slideNumber === 1 ? (
          <div className='my-auto flex items-center gap-4 rounded-xl border border-[#1E4976] bg-[#072648] p-3 md:p-4'>
            <div className='flex h-12 w-12 flex-shrink-0 flex-col items-center justify-center rounded-lg border-2 border-[#FFBF00] bg-[#003366] text-xs leading-tight font-black text-[#FFBF00] md:h-16 md:w-16 md:text-sm'>
              <span>BPS</span>
              <span className='text-[9px] md:text-[10px]'>7108</span>
            </div>
            <div className='truncate'>
              <span className='block text-[10px] font-bold text-[#FFBF00]'>
                PEMAPAR UTAMA:
              </span>
              <span className='block truncate text-xs font-bold text-white md:text-base'>
                {deckData.namaKepala}
              </span>
              <span className='block truncate text-[10px] text-slate-300 md:text-xs'>
                Kepala BPS Kabupaten Kepulauan Sitaro (NIP. {deckData.nipKepala}
                )
              </span>
              <span className='mt-0.5 block truncate text-[9px] text-slate-400 md:text-[11px]'>
                Ketua ZI: {deckData.namaKetuaZi}
              </span>
            </div>
          </div>
        ) : (
          <div className='my-auto grid grid-cols-3 gap-2 md:gap-3'>
            {slide.items?.map((item, idx) => (
              <div
                key={idx}
                className='rounded-lg border border-[#1E4976] bg-[#072648] p-2 text-left md:p-3'
              >
                <span className='block text-[9px] font-bold text-[#FFBF00]'>
                  {item.badge || `POIN ${idx + 1}`}
                </span>
                <p className='mt-0.5 truncate text-xs font-bold text-white md:text-sm'>
                  {item.title}
                </p>
                <ul className='mt-1 list-inside list-disc space-y-0.5 text-[9px] text-slate-300 md:text-xs'>
                  {item.points.map((p, pIdx) => (
                    <li key={pIdx} className='truncate'>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className='border-t border-white/10 pt-1.5 text-center text-[9px] text-slate-400 md:text-xs'>
          {slide.footerNote ||
            'BPS Kabupaten Kepulauan Siau Tagulandang Biaro - BerAKHLAK Bangga Melayani Bangsa'}
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // SLIDE TEMA TERANG (Slide 2 - 10: 6 Pilar, Inovasi, Evaluasi)
  // ----------------------------------------------------
  return (
    <div className='relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#F8FAFC] text-slate-900 select-none'>
      {/* Top Header Ribbon */}
      <div className='flex items-center justify-between border-b-2 border-[#FFBF00] bg-[#003366] px-[4%] py-[2%] text-white'>
        <div className='truncate'>
          <span className='inline-block rounded bg-[#0A4B82] px-2 py-0.5 text-[8px] font-bold tracking-wider text-[#FFBF00] md:text-[10px]'>
            {slide.category}
          </span>
          <h2 className='mt-0.5 truncate text-xs leading-tight font-bold text-white md:text-base lg:text-lg'>
            {slide.title}
          </h2>
          <p className='truncate text-[9px] text-slate-300 md:text-xs'>
            {slide.subtitle}
          </p>
        </div>
        <div className='ml-2 hidden flex-shrink-0 text-right sm:block'>
          <span className='block text-[10px] font-bold text-[#FFBF00] md:text-xs'>
            {deckData.satkerShort}
          </span>
          <span className='text-[8px] text-slate-300 md:text-[10px]'>
            WBK {deckData.tahun}
          </span>
        </div>
      </div>

      {/* Main Slide Body */}
      <div className='flex flex-1 flex-col justify-between overflow-hidden p-[3%]'>
        {/* KPI Stats Bar (jika ada) */}
        {slide.stats && slide.stats.length > 0 && (
          <div className='mb-2 grid grid-cols-3 gap-2'>
            {slide.stats.map((st, idx) => (
              <div
                key={idx}
                className='flex items-center justify-between rounded-lg border border-slate-200 bg-white p-2 shadow-sm'
              >
                <div>
                  <span className='block truncate text-[9px] text-slate-500 md:text-[10px]'>
                    {st.label}
                  </span>
                  <span className='block text-xs font-black text-[#003366] md:text-base'>
                    {st.value}
                  </span>
                  <span className='block truncate text-[8px] font-semibold text-slate-600 md:text-[9px]'>
                    {st.sublabel}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3 Content Cards */}
        {slide.items && slide.items.length > 0 && (
          <div className='grid flex-1 grid-cols-3 items-stretch gap-2 md:gap-3'>
            {slide.items.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className='flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-2 text-left shadow-sm md:p-3'
              >
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='rounded bg-blue-50 px-1.5 py-0.5 text-[8px] font-bold text-blue-900 md:text-[9px]'>
                      {item.badge || `AREA ${idx + 1}`}
                    </span>
                  </div>
                  <h3 className='mt-1 line-clamp-1 text-[10px] font-bold text-slate-800 md:text-xs'>
                    {item.title}
                  </h3>
                  <ul className='mt-1.5 list-inside list-disc space-y-1 text-[8px] text-slate-600 md:text-[10px]'>
                    {item.points.map((pt, pIdx) => (
                      <li key={pIdx} className='line-clamp-2'>
                        {pt}
                      </li>
                    ))}
                  </ul>
                </div>

                {item.highlight && (
                  <div className='mt-1 truncate rounded border border-emerald-200 bg-emerald-50 p-1 text-center text-[8px] font-bold text-emerald-800'>
                    ★ {item.highlight}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Bar */}
      <div className='flex items-center justify-between border-t border-slate-200 bg-slate-100 px-[4%] py-[1.5%] text-[8px] text-slate-500 md:text-[10px]'>
        <span className='truncate'>
          {slide.footerNote ||
            `BPS Kabupaten Kepulauan Sitaro | Menuju Wilayah Bebas dari Korupsi (WBK) ${deckData.tahun}`}
        </span>
        <span className='ml-2 flex-shrink-0 font-bold text-[#003366]'>
          Slide {slide.slideNumber} / {deckData.slides.length}
        </span>
      </div>
    </div>
  );
}
