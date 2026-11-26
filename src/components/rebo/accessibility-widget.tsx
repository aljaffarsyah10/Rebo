'use client';

/**
 * Floating Accessibility Widget (WCAG 2.1 AA Compliant)
 * REBO V2 - BPS Kabupaten Kepulauan Sitaro
 *
 * Menyediakan alat bantu aksesibilitas:
 * 1. Font Resizer (Normal 100%, Besar 115%, Ekstra Besar 130%)
 * 2. Text-to-Speech (TTS) berbasis Web Speech API (Bacakan Halaman, Bacakan Seleksi, Pengatur Kecepatan)
 * 3. Mode Kontras Tinggi (High Contrast Mode)
 * 4. Garis Pemandu Baca (Reading Guide / Ruler)
 * 5. Teks Ramah Disleksia & Spasi Huruf Longgar (Readable Font)
 * 6. Shortcut Keyboard: Alt + A (Toggle Panel) & Escape (Tutup Panel)
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Accessibility,
  X,
  Volume2,
  Type,
  Sun,
  BookOpen,
  MousePointer,
  RotateCcw,
  MoveHorizontal,
  Play,
  Square,
  Eye
} from 'lucide-react';
import { useAccessibilityStore } from '@/lib/accessibility/accessibility-store';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

export function AccessibilityWidget() {
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [guideY, setGuideY] = useState<number>(300);
  const panelRef = useRef<HTMLDivElement>(null);

  const {
    fontSize,
    highContrast,
    readableFont,
    readingGuide,
    screenReaderSpeed,
    isSpeaking,
    currentSpokenText,
    isWidgetOpen,
    setFontSize,
    toggleHighContrast,
    toggleReadableFont,
    toggleReadingGuide,
    setScreenReaderSpeed,
    resetAccessibility,
    setWidgetOpen,
    toggleWidget,
    speakSelectedText,
    speakActivePage,
    applyDomEffects
  } = useAccessibilityStore();

  // 1. Hydration & Initial DOM Effect Application
  useEffect(() => {
    setIsMounted(true);
    applyDomEffects();
  }, [applyDomEffects]);

  // 2. Global Keyboard Shortcut: Alt + A (Toggle) & Escape (Close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt + A (atau Option + A pada macOS)
      if (e.altKey && (e.key === 'a' || e.key === 'A')) {
        e.preventDefault();
        toggleWidget();
      }

      // Escape untuk menutup panel saat terbuka
      if (e.key === 'Escape' && isWidgetOpen) {
        setWidgetOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isWidgetOpen, setWidgetOpen, toggleWidget]);

  // 3. Mouse Movement Listener for Reading Guide
  useEffect(() => {
    if (!readingGuide) return;

    const handlePointerMove = (e: MouseEvent) => {
      setGuideY(e.clientY);
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('mousemove', handlePointerMove);
  }, [readingGuide]);

  // 4. Close Panel when clicking outside
  useEffect(() => {
    if (!isWidgetOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target as Node) &&
        !(e.target as HTMLElement).closest('#a11y-fab-trigger')
      ) {
        setWidgetOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isWidgetOpen, setWidgetOpen]);

  if (!isMounted) return null;

  // Cek apakah ada fitur aksesibilitas yang sedang aktif
  const hasActiveCustomization =
    fontSize !== 'normal' || highContrast || readableFont || readingGuide;

  return (
    <>
      {/* =====================================================================
          1. GARIS PEMANDU BACA (READING GUIDE RULER)
          ===================================================================== */}
      {readingGuide && (
        <div
          role='presentation'
          aria-hidden='true'
          className='pointer-events-none fixed right-0 left-0 z-[99999] h-10 -translate-y-1/2 border-y-2 border-amber-500 bg-amber-400/15 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-[top] duration-75 ease-out'
          style={{ top: `${guideY}px` }}
        >
          <div className='absolute top-1/2 left-3 -translate-y-1/2 rounded bg-amber-500 px-2 py-0.5 text-[9px] font-bold text-slate-950 shadow-xs'>
            Garis Pemandu Baca
          </div>
        </div>
      )}

      {/* =====================================================================
          2. FLOATING ACTION BUTTON (FAB) - POJOK KIRI BAWAH
          ===================================================================== */}
      <div
        id='a11y-widget-container'
        data-a11y-ignore='true'
        className='bottom-safe-offset fixed left-4 z-50 flex flex-col items-start md:left-6'
      >
        <button
          id='a11y-fab-trigger'
          type='button'
          onClick={toggleWidget}
          aria-expanded={isWidgetOpen}
          aria-controls='a11y-accessibility-dialog'
          aria-label='Pusat Aksesibilitas Web & Text-to-Speech (Tekan Alt + A)'
          title='Pusat Aksesibilitas Web WCAG 2.1 AA (Alt + A)'
          className={`group relative flex h-13 w-13 items-center justify-center rounded-full shadow-xl transition-all duration-300 active:scale-95 ${
            isWidgetOpen
              ? 'bg-slate-900 text-white shadow-slate-900/40 dark:bg-sky-500 dark:text-slate-950'
              : 'bg-gradient-to-tr from-sky-600 via-blue-600 to-indigo-600 text-white shadow-blue-600/40 hover:scale-105 hover:shadow-2xl hover:shadow-blue-600/50'
          }`}
        >
          {/* Subtle Glow Ring */}
          {!isWidgetOpen && (
            <span className='absolute -inset-1 animate-pulse rounded-full bg-sky-400/25 blur-xs' />
          )}

          {/* Icon with smooth rotation */}
          <div
            className={`transition-transform duration-300 ease-out ${
              isWidgetOpen ? 'rotate-90' : 'rotate-0'
            }`}
          >
            {isWidgetOpen ? (
              <X className='h-6 w-6 stroke-[2.5]' />
            ) : (
              <Accessibility className='h-6 w-6 stroke-[2]' />
            )}
          </div>

          {/* Indicator Dot if any feature is active */}
          {hasActiveCustomization && !isWidgetOpen && (
            <span
              className='absolute top-0 right-0 flex h-3.5 w-3.5'
              title='Fitur Aksesibilitas Aktif'
            >
              <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75' />
              <span className='relative inline-flex h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900' />
            </span>
          )}

          {/* TTS Animated Sound Waves when Speaking */}
          {isSpeaking && (
            <span
              className='absolute -top-1 -left-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[8px] text-white'
              title='Sedang Membacakan Teks'
            >
              <span className='h-2 w-2 animate-ping rounded-full bg-rose-400' />
            </span>
          )}
        </button>

        {/* =====================================================================
            3. PANEL DIALOG AKSESIBILITAS WCAG 2.1 AA
            ===================================================================== */}
        {isWidgetOpen && (
          <div
            id='a11y-accessibility-dialog'
            ref={panelRef}
            role='dialog'
            aria-modal='true'
            aria-label='Pusat Aksesibilitas Web REBO V2'
            className='animate-in fade-in-0 slide-in-from-bottom-4 fixed bottom-20 left-4 z-50 flex max-h-[85vh] w-[355px] flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white/95 p-0 text-slate-800 shadow-2xl backdrop-blur-md duration-200 sm:w-[410px] md:left-6 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100'
          >
            {/* --- Header Dialog --- */}
            <div className='dark:from-slate-850 flex items-center justify-between border-b border-slate-200/80 bg-gradient-to-r from-sky-50 to-blue-50/60 px-4 py-3 dark:border-slate-800 dark:to-slate-900'>
              <div className='flex items-center gap-2.5'>
                <div className='flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 text-white shadow-xs'>
                  <Accessibility className='h-5 w-5' />
                </div>
                <div>
                  <div className='flex items-center gap-1.5'>
                    <h2 className='text-sm font-bold text-slate-900 dark:text-white'>
                      Aksesibilitas Web
                    </h2>
                    <span className='py-0.2 rounded bg-sky-100 px-1.5 text-[10px] font-semibold text-sky-800 dark:bg-sky-950 dark:text-sky-300'>
                      WCAG 2.1 AA
                    </span>
                  </div>
                  <p className='text-2xs text-slate-500 dark:text-slate-400'>
                    BPS Kabupaten Kepulauan Sitaro
                  </p>
                </div>
              </div>

              <div className='flex items-center gap-1.5'>
                <span
                  className='hidden rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[10px] text-slate-500 sm:inline-block dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                  title='Shortcut Keyboard'
                >
                  Alt+A
                </span>
                <button
                  type='button'
                  onClick={() => setWidgetOpen(false)}
                  aria-label='Tutup panel aksesibilitas'
                  className='rounded-lg p-1.5 text-slate-400 hover:bg-slate-200/60 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            </div>

            {/* --- Isi Konten Scrollable --- */}
            <div className='flex-1 space-y-4 overflow-y-auto p-4 text-xs'>
              {/* SECTION A: PENGATUR UKURAN FONT */}
              <div className='dark:bg-slate-850/60 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-slate-800'>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white'>
                    <Type className='h-4 w-4 text-sky-600 dark:text-sky-400' />
                    <span>Ukuran Teks & Font</span>
                  </div>
                  <span className='text-2xs font-medium text-slate-500 dark:text-slate-400'>
                    {fontSize === 'normal'
                      ? 'Normal (100%)'
                      : fontSize === 'large'
                        ? 'Besar (115%)'
                        : 'Sangat Besar (130%)'}
                  </span>
                </div>

                <div className='grid grid-cols-3 gap-1.5'>
                  <button
                    type='button'
                    onClick={() => {
                      setFontSize('normal');
                      toast.success('Ukuran font diatur ke Normal (100%)');
                    }}
                    className={`flex flex-col items-center justify-center rounded-lg border py-2 transition-all ${
                      fontSize === 'normal'
                        ? 'border-sky-500 bg-sky-50 font-bold text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'dark:hover:bg-slate-750 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span className='text-xs'>A</span>
                    <span className='text-[10px] text-slate-500 dark:text-slate-400'>
                      Normal
                    </span>
                  </button>

                  <button
                    type='button'
                    onClick={() => {
                      setFontSize('large');
                      toast.success('Ukuran font diatur ke Besar (115%)');
                    }}
                    className={`flex flex-col items-center justify-center rounded-lg border py-2 transition-all ${
                      fontSize === 'large'
                        ? 'border-sky-500 bg-sky-50 font-bold text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'dark:hover:bg-slate-750 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span className='text-sm font-semibold'>A+</span>
                    <span className='text-[10px] text-slate-500 dark:text-slate-400'>
                      115%
                    </span>
                  </button>

                  <button
                    type='button'
                    onClick={() => {
                      setFontSize('x-large');
                      toast.success(
                        'Ukuran font diatur ke Ekstra Besar (130%)'
                      );
                    }}
                    className={`flex flex-col items-center justify-center rounded-lg border py-2 transition-all ${
                      fontSize === 'x-large'
                        ? 'border-sky-500 bg-sky-50 font-bold text-sky-700 dark:border-sky-400 dark:bg-sky-950/60 dark:text-sky-300'
                        : 'dark:hover:bg-slate-750 border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span className='text-base font-bold'>A++</span>
                    <span className='text-[10px] text-slate-500 dark:text-slate-400'>
                      130%
                    </span>
                  </button>
                </div>
              </div>

              {/* SECTION B: TEXT-TO-SPEECH (TTS) ENGINE */}
              <div className='dark:bg-slate-850/60 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-slate-800'>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white'>
                    <Volume2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    <span>Pembaca Suara (TTS)</span>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isSpeaking
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/70 dark:text-rose-300'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300'
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isSpeaking
                          ? 'animate-pulse bg-rose-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                    {isSpeaking ? 'Sedang Membaca' : 'Siap'}
                  </span>
                </div>

                {/* Tombol Aksi Utama TTS */}
                <div className='grid grid-cols-2 gap-2'>
                  <button
                    type='button'
                    onClick={speakActivePage}
                    className={`flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isSpeaking
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <Square className='h-3.5 w-3.5 fill-current' />
                        Hentikan Suara
                      </>
                    ) : (
                      <>
                        <Play className='h-3.5 w-3.5 fill-current' />
                        Bacakan Halaman Ini
                      </>
                    )}
                  </button>

                  <button
                    type='button'
                    onClick={speakSelectedText}
                    className='dark:hover:bg-slate-750 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                  >
                    <MousePointer className='h-3.5 w-3.5 text-blue-500' />
                    Bacakan Teks Terpilih
                  </button>
                </div>

                {/* Pengatur Kecepatan Bicara */}
                <div className='dark:border-slate-750 mt-2.5 flex items-center justify-between border-t border-slate-200/60 pt-2'>
                  <span className='text-[11px] text-slate-600 dark:text-slate-400'>
                    Kecepatan Bicara:
                  </span>
                  <div className='flex gap-1'>
                    {[0.75, 1.0, 1.25, 1.5].map((speed) => (
                      <button
                        key={speed}
                        type='button'
                        onClick={() => setScreenReaderSpeed(speed)}
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                          screenReaderSpeed === speed
                            ? 'bg-blue-600 text-white dark:bg-blue-500'
                            : 'bg-slate-200/70 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {speed}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Caption/Transcript Bar saat berbicara */}
                {isSpeaking && currentSpokenText && (
                  <div className='mt-2 rounded-lg border border-rose-200 bg-rose-50/80 p-2 text-[11px] text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200'>
                    <div className='flex items-center gap-1 text-[10px] font-bold tracking-wider text-rose-600 uppercase dark:text-rose-400'>
                      <Volume2 className='h-3 w-3 animate-pulse' />
                      Transkrip Audio:
                    </div>
                    <p className='mt-0.5 line-clamp-2 italic'>
                      &ldquo;{currentSpokenText}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION C: ALAT BANTU VISUAL & MEMBACA */}
              <div className='dark:bg-slate-850/60 space-y-2 rounded-xl border border-slate-200/70 bg-slate-50/60 p-3 dark:border-slate-800'>
                <div className='mb-1 flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white'>
                  <Eye className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                  <span>Alat Bantu Visual & Disleksia</span>
                </div>

                {/* 1. Toggle Mode Kontras Tinggi */}
                <div className='flex items-center justify-between rounded-lg bg-white p-2.5 dark:bg-slate-800'>
                  <div className='pr-2'>
                    <div className='flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200'>
                      <Sun className='h-3.5 w-3.5 text-amber-500' />
                      <span>Mode Kontras Tinggi</span>
                    </div>
                    <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                      Tingkatkan kontras rasio &ge; 7:1 sesuai WCAG AAA
                    </p>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={toggleHighContrast}
                    aria-label='Toggle Mode Kontras Tinggi'
                  />
                </div>

                {/* 2. Toggle Garis Pemandu Baca */}
                <div className='flex items-center justify-between rounded-lg bg-white p-2.5 dark:bg-slate-800'>
                  <div className='pr-2'>
                    <div className='flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200'>
                      <MoveHorizontal className='h-3.5 w-3.5 text-amber-500' />
                      <span>Garis Pemandu Baca</span>
                    </div>
                    <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                      Garis horizontal fokus mengikuti posisi kursor
                    </p>
                  </div>
                  <Switch
                    checked={readingGuide}
                    onCheckedChange={toggleReadingGuide}
                    aria-label='Toggle Garis Pemandu Baca'
                  />
                </div>

                {/* 3. Toggle Teks Ramah Disleksia */}
                <div className='flex items-center justify-between rounded-lg bg-white p-2.5 dark:bg-slate-800'>
                  <div className='pr-2'>
                    <div className='flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200'>
                      <BookOpen className='h-3.5 w-3.5 text-indigo-500' />
                      <span>Teks Ramah Disleksia</span>
                    </div>
                    <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                      Font sans-serif lapang & spasi ekstra terbaca
                    </p>
                  </div>
                  <Switch
                    checked={readableFont}
                    onCheckedChange={toggleReadableFont}
                    aria-label='Toggle Teks Ramah Disleksia'
                  />
                </div>
              </div>
            </div>

            {/* --- Footer Dialog --- */}
            <div className='dark:bg-slate-850/80 border-t border-slate-200/80 bg-slate-50/80 p-3 dark:border-slate-800'>
              <div className='flex items-center justify-between'>
                <button
                  type='button'
                  onClick={() => {
                    resetAccessibility();
                    toast.info(
                      'Pengaturan aksesibilitas telah direset ke default.'
                    );
                  }}
                  className='text-2xs dark:hover:bg-slate-750 flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 font-medium text-slate-700 hover:bg-slate-100 active:scale-98 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                >
                  <RotateCcw className='h-3 w-3 text-slate-400' />
                  Reset Pengaturan
                </button>

                <div className='text-right'>
                  <span className='block text-[10px] font-semibold text-slate-600 dark:text-slate-300'>
                    Inklusivitas PST
                  </span>
                  <span className='block text-[9px] text-slate-400'>
                    UU No. 8/2016 Disabilitas
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default AccessibilityWidget;
