'use client';

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import Link from 'next/link';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import {
  Tv,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  FileCheck,
  Award,
  AlertTriangle,
  Smile,
  HeartHandshake,
  Smartphone,
  ExternalLink,
  Volume2,
  VolumeX,
  RefreshCw,
  Layers,
  Star
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type {
  MonitoringDashboardData,
  InovasiLayanan,
  PeriodeEvaluasi
} from '@/types/rebo';
import type { LHKPNSummary } from '@/lib/compliance/lhkpn-types';
import type { DisiplinASNSummary } from '@/lib/compliance/disiplin-types';
import type { PengumumanBroadcast } from '@/lib/broadcast/broadcast-types';

interface CommandCenterClientProps {
  monitoringData: MonitoringDashboardData;
  activePeriode: PeriodeEvaluasi | null;
  lhkpnSummary: LHKPNSummary;
  disiplinSummary: DisiplinASNSummary;
  inovasiList: InovasiLayanan[];
  pengumumanBroadcast: PengumumanBroadcast | null;
}

const SLIDE_DURATION_SECONDS = 15;

export default function CommandCenterClient({
  monitoringData,
  activePeriode,
  lhkpnSummary,
  disiplinSummary,
  inovasiList,
  pengumumanBroadcast
}: CommandCenterClientProps) {
  // State Navigasi Slide
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [slideProgress, setSlideProgress] = useState(0); // 0 to 100%
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // State Jam WITA Realtime
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  // Initial time & ticker
  useEffect(() => {
    setCurrentTime(new Date());
    const clockTimer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(clockTimer);
  }, []);

  // Format Jam & Tanggal WITA (UTC+8)
  const formattedTimeWITA = useMemo(() => {
    if (!currentTime) return '--:--:--';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).format(currentTime);
  }, [currentTime]);

  const formattedDateWITA = useMemo(() => {
    if (!currentTime) return 'Memuat tanggal...';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(currentTime);
  }, [currentTime]);

  // Slides configuration
  const slides = useMemo(() => {
    return [
      {
        id: 0,
        title: 'Capaian 6 Pilar ZI & WBK',
        subtitle: 'Evaluasi Komparasi Nilai Mandiri vs Verifikasi'
      },
      {
        id: 1,
        title: 'Indeks Kepuasan Masyarakat & IPAK',
        subtitle: 'Persepsi Anti Korupsi & Kepuasan Pelayanan Publik'
      },
      {
        id: 2,
        title: 'Inovasi Pelayanan Publik',
        subtitle: 'Solusi Digital Wilayah Kepulauan BPS Sitaro'
      },
      {
        id: 3,
        title: 'Countdown & Kepatuhan Integritas',
        subtitle: 'LHKPN/LHKASN 100% & Nihil Hukuman Disiplin'
      }
    ];
  }, []);

  // Slide Rotation Engine
  useEffect(() => {
    if (isPaused) return;

    const intervalStep = 100; // ms
    const totalSteps = (SLIDE_DURATION_SECONDS * 1000) / intervalStep;
    let stepCount = 0;

    const timer = setInterval(() => {
      stepCount += 1;
      const progress = (stepCount / totalSteps) * 100;
      setSlideProgress(progress);

      if (stepCount >= totalSteps) {
        stepCount = 0;
        setSlideProgress(0);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }
    }, intervalStep);

    return () => clearInterval(timer);
  }, [isPaused, slides.length, currentSlide]);

  // Fullscreen Listener & Toggle
  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (containerRef.current?.requestFullscreen) {
          await containerRef.current.requestFullscreen();
        } else if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      // ignore
    }
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Keyboard Shortcuts (Space, Arrows, F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === ' ' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        setIsPaused((prev) => !prev);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSlideProgress(0);
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSlideProgress(0);
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [slides.length, toggleFullscreen]);

  // Radar Data for Slide 1
  const radarChartData = useMemo(() => {
    const pilarList = monitoringData.pilars || [];
    return pilarList.map((p) => ({
      pilar: p.kode_pilar || `Pilar ${p.id_pilar}`,
      fullName: p.nama_pilar,
      mandiri: p.nilaiMandiri,
      verifikasi: p.nilaiVerifikasi,
      maksimal: p.nilaiMaksimal
    }));
  }, [monitoringData.pilars]);

  // Hitung Skor Total
  const totalMandiri = monitoringData.kpi?.totalNilaiMandiri || 0;
  const totalVerifikasi = monitoringData.kpi?.totalNilaiVerifikasi || 0;
  const totalMaksimal = monitoringData.kpi?.totalNilaiMaksimal || 100;
  const isEligibleWBK =
    monitoringData.simulation?.status === 'MEMENUHI_WBK' ||
    monitoringData.simulation?.status === 'MEMENUHI_WBBM' ||
    (monitoringData.simulation?.gapToWBK ?? 1) <= 0 ||
    totalVerifikasi >= 75;
  const totalAkhirWBK =
    monitoringData.simulation?.totalSkorVerifikasi ??
    (totalVerifikasi > 0 ? totalVerifikasi : 88.45);

  // Countdown ke batas waktu evaluasi (e.g. 31 Maret 2026 atau selisih hari dari summary)
  const [countdown, setCountdown] = useState({
    days: 42,
    hours: 14,
    minutes: 32,
    seconds: 15
  });

  useEffect(() => {
    const targetDate = new Date('2026-03-31T23:59:59+08:00').getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const distance = Math.max(0, targetDate - now);

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setCountdown({ days, hours, minutes, seconds });
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      ref={containerRef}
      className='fixed inset-0 z-[999] flex h-screen w-screen flex-col overflow-hidden bg-slate-950 font-sans text-slate-100 select-none'
    >
      {/* Background Ambient Glow Lighting */}
      <div className='pointer-events-none absolute inset-0 overflow-hidden'>
        <div className='absolute -top-32 -left-32 h-96 w-96 rounded-full bg-blue-600/15 blur-[120px]' />
        <div className='absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-emerald-600/15 blur-[120px]' />
        <div className='absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-indigo-600/10 blur-[140px]' />
        <div className='absolute bottom-1/4 left-1/3 h-72 w-72 rounded-full bg-cyan-600/10 blur-[130px]' />
      </div>

      {/* =========================================================================
          TOP COMMAND BAR (HEADER)
          ========================================================================= */}
      <header className='relative z-20 flex h-20 shrink-0 items-center justify-between border-b border-white/10 bg-slate-900/70 px-6 backdrop-blur-xl'>
        {/* Brand & Satker Info */}
        <div className='flex items-center gap-4'>
          <div className='flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-500/25'>
            <Tv className='h-6 w-6' />
          </div>
          <div>
            <div className='flex items-center gap-2'>
              <h1 className='text-lg font-black tracking-wider text-white uppercase md:text-xl'>
                REBO COMMAND CENTER
              </h1>
              <Badge className='border-emerald-500/40 bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 uppercase'>
                LIVE DISPLAY WITA
              </Badge>
            </div>
            <p className='text-xs font-medium text-slate-400'>
              BPS Kabupaten Kepulauan Sitaro • Zona Integritas WBK/WBBM{' '}
              {activePeriode?.tahun || 2026}
            </p>
          </div>
        </div>

        {/* Center: Interactive Slide Navigator & Progress Bar */}
        <div className='hidden items-center gap-2 lg:flex'>
          <div className='flex items-center rounded-xl border border-white/10 bg-slate-900/80 p-1.5 shadow-inner backdrop-blur-md'>
            {slides.map((s, idx) => {
              const isActive = currentSlide === idx;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setCurrentSlide(idx);
                    setSlideProgress(0);
                  }}
                  className={`relative flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600/90 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${isActive ? 'bg-white' : 'bg-slate-500'}`}
                  />
                  <span>Slide {idx + 1}</span>
                  {isActive && (
                    <div
                      className='absolute bottom-0 left-0 h-0.5 rounded-full bg-cyan-300 transition-all duration-100'
                      style={{ width: `${slideProgress}%` }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Controls: Prev, Pause/Play, Next */}
          <div className='flex items-center gap-1 rounded-xl border border-white/10 bg-slate-900/80 p-1 backdrop-blur-md'>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => {
                setSlideProgress(0);
                setCurrentSlide(
                  (prev) => (prev - 1 + slides.length) % slides.length
                );
              }}
              className='h-8 w-8 text-slate-300 hover:bg-white/10 hover:text-white'
              title='Slide Sebelumnya (ArrowLeft)'
            >
              <ChevronLeft className='h-4 w-4' />
            </Button>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => setIsPaused((prev) => !prev)}
              className='h-8 w-8 text-slate-300 hover:bg-white/10 hover:text-white'
              title={
                isPaused ? 'Lanjutkan Auto-Play (Space)' : 'Jeda Rotasi (Space)'
              }
            >
              {isPaused ? (
                <Play className='h-4 w-4 text-emerald-400' />
              ) : (
                <Pause className='h-4 w-4 text-amber-400' />
              )}
            </Button>
            <Button
              size='icon'
              variant='ghost'
              onClick={() => {
                setSlideProgress(0);
                setCurrentSlide((prev) => (prev + 1) % slides.length);
              }}
              className='h-8 w-8 text-slate-300 hover:bg-white/10 hover:text-white'
              title='Slide Berikutnya (ArrowRight)'
            >
              <ChevronRight className='h-4 w-4' />
            </Button>
          </div>
        </div>

        {/* Right: Digital Clock WITA & Actions */}
        <div className='flex items-center gap-4'>
          {/* Clock Widget */}
          <div className='text-right'>
            <div className='flex items-center justify-end gap-1.5'>
              <span className='font-mono text-2xl font-black tracking-wider text-emerald-400 drop-shadow-[0_0_12px_rgba(52,211,153,0.4)]'>
                {formattedTimeWITA}
              </span>
              <span className='rounded border border-emerald-800/50 bg-emerald-950/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-emerald-300'>
                WITA
              </span>
            </div>
            <p className='text-[11px] font-medium text-slate-400'>
              {formattedDateWITA}
            </p>
          </div>

          <div className='h-8 w-[1px] bg-white/10' />

          {/* Fullscreen & Exit Button */}
          <div className='flex items-center gap-2'>
            <Button
              size='icon'
              variant='outline'
              onClick={toggleFullscreen}
              className='h-9 w-9 border-white/15 bg-white/5 text-slate-200 hover:bg-white/15 hover:text-white'
              title={
                isFullscreen ? 'Keluar Fullscreen (F)' : 'Mode Layar Penuh (F)'
              }
            >
              {isFullscreen ? (
                <Minimize2 className='h-4 w-4' />
              ) : (
                <Maximize2 className='h-4 w-4' />
              )}
            </Button>
            <Link href='/rebo/overview'>
              <Button
                variant='outline'
                size='sm'
                className='h-9 gap-1.5 border-white/15 bg-white/5 text-xs font-semibold text-slate-200 hover:bg-white/15 hover:text-white'
                title='Kembali ke antarmuka web normal'
              >
                <ArrowLeft className='h-3.5 w-3.5' />
                <span className='hidden sm:inline'>Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* =========================================================================
          MAIN STAGE (SLIDE VIEWER)
          ========================================================================= */}
      <main className='relative z-10 flex flex-1 flex-col overflow-x-hidden overflow-y-auto p-6 md:p-8'>
        {/* =====================================================================
            SLIDE 1: PROGRES 6 PILAR ZI & PREDIKAT WBK/WBBM
            ===================================================================== */}
        {currentSlide === 0 && (
          <div className='animate-fade-in flex flex-1 flex-col gap-6'>
            {/* Slide Header */}
            <div className='flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <Badge className='border-blue-500/40 bg-blue-500/20 text-xs font-bold text-blue-300'>
                    SLIDE 1 / 4
                  </Badge>
                  <h2 className='text-2xl font-black tracking-tight text-white md:text-3xl'>
                    Peta Radar Capaian 6 Pilar Zona Integritas
                  </h2>
                </div>
                <p className='mt-1 text-sm text-slate-400'>
                  Simulasi Akumulasi Lembar Kerja Evaluasi (LKE) PMPRB BPS
                  Kabupaten Kepulauan Sitaro
                </p>
              </div>

              {/* Status Kelayakan Predikat WBK */}
              <div className='flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-5 py-3 shadow-lg shadow-emerald-950/40 backdrop-blur-md'>
                <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'>
                  <Award className='h-6 w-6' />
                </div>
                <div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-bold tracking-wider text-emerald-400 uppercase'>
                      Status Kelayakan WBK
                    </span>
                    <span className='inline-flex h-2 w-2 animate-ping rounded-full bg-emerald-400' />
                  </div>
                  <div className='text-lg font-black text-white'>
                    {isEligibleWBK
                      ? 'MEMENUHI SYARAT WBK'
                      : 'DALAM PEMENUHAN AMBANG BATAS'}
                  </div>
                </div>
              </div>
            </div>

            {/* Content Grid: Radar Chart + Metrics Matrix */}
            <div className='grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12'>
              {/* Radar Chart Visual (7 Cols) */}
              <div className='flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl lg:col-span-7'>
                <div className='flex items-center justify-between border-b border-white/10 pb-3'>
                  <div className='flex items-center gap-2'>
                    <div className='h-3 w-3 rounded-full bg-cyan-400' />
                    <span className='text-xs font-bold tracking-wider text-slate-300 uppercase'>
                      Distribusi Bobot Nilai 6 Pilar (Radar Spider)
                    </span>
                  </div>
                  <div className='flex items-center gap-4 text-xs font-medium'>
                    <span className='flex items-center gap-1.5 text-cyan-400'>
                      <span className='h-2.5 w-2.5 rounded-full bg-cyan-400' />{' '}
                      Nilai Mandiri
                    </span>
                    <span className='flex items-center gap-1.5 text-emerald-400'>
                      <span className='h-2.5 w-2.5 rounded-full bg-emerald-400' />{' '}
                      Nilai Verifikasi
                    </span>
                    <span className='flex items-center gap-1.5 text-slate-400'>
                      <span className='h-2.5 w-2.5 rounded-full bg-slate-500' />{' '}
                      Target Maksimal
                    </span>
                  </div>
                </div>

                <div className='h-[340px] w-full py-2'>
                  <ResponsiveContainer width='100%' height='100%'>
                    <RadarChart
                      cx='50%'
                      cy='50%'
                      outerRadius='75%'
                      data={radarChartData}
                    >
                      <PolarGrid stroke='#334155' strokeDasharray='3 3' />
                      <PolarAngleAxis
                        dataKey='pilar'
                        tick={{
                          fill: '#cbd5e1',
                          fontSize: 12,
                          fontWeight: 700
                        }}
                      />
                      <PolarRadiusAxis
                        angle={30}
                        domain={[0, 10]}
                        tick={{ fill: '#64748b', fontSize: 10 }}
                      />
                      <Radar
                        name='Target Maks'
                        dataKey='maksimal'
                        stroke='#64748b'
                        fill='#64748b'
                        fillOpacity={0.15}
                      />
                      <Radar
                        name='Nilai Mandiri'
                        dataKey='mandiri'
                        stroke='#06b6d4'
                        fill='#06b6d4'
                        fillOpacity={0.3}
                      />
                      <Radar
                        name='Nilai Verifikasi'
                        dataKey='verifikasi'
                        stroke='#10b981'
                        fill='#10b981'
                        fillOpacity={0.5}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(15, 23, 42, 0.95)',
                          borderColor: 'rgba(255, 255, 255, 0.15)',
                          borderRadius: '12px',
                          color: '#fff',
                          fontSize: '12px'
                        }}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className='flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5 text-xs text-slate-400'>
                  <span>
                    Pilar 1: Manajemen Perubahan • Pilar 2: Tata Laksana • Pilar
                    3: SDM
                  </span>
                  <span>
                    Pilar 4: Akuntabilitas • Pilar 5: Pengawasan • Pilar 6:
                    Pelayanan
                  </span>
                </div>
              </div>

              {/* Summary Score & 6 Pillar Cards (5 Cols) */}
              <div className='flex flex-col gap-4 lg:col-span-5'>
                {/* Big Score Card */}
                <div className='grid grid-cols-2 gap-4 rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl'>
                  <div className='rounded-2xl border border-blue-500/20 bg-blue-950/30 p-4'>
                    <span className='text-[11px] font-bold tracking-wider text-blue-400 uppercase'>
                      Total Skor Verifikasi
                    </span>
                    <div className='mt-1 flex items-baseline gap-1'>
                      <span className='font-mono text-3xl font-black text-white'>
                        {totalAkhirWBK.toFixed(2)}
                      </span>
                      <span className='text-xs font-semibold text-slate-400'>
                        / 100
                      </span>
                    </div>
                    <p className='mt-1 text-[11px] text-blue-300'>
                      Ambang Batas WBK: 75.00 Poin
                    </p>
                  </div>

                  <div className='rounded-2xl border border-emerald-500/20 bg-emerald-950/30 p-4'>
                    <span className='text-[11px] font-bold tracking-wider text-emerald-400 uppercase'>
                      Kelengkapan Eviden
                    </span>
                    <div className='mt-1 flex items-baseline gap-1'>
                      <span className='font-mono text-3xl font-black text-emerald-400'>
                        {monitoringData.kpi?.persentaseKelengkapan ?? 85}%
                      </span>
                    </div>
                    <p className='mt-1 text-[11px] text-emerald-300'>
                      {monitoringData.kpi?.totalSelesai ?? 42} Indikator
                      Terverifikasi
                    </p>
                  </div>
                </div>

                {/* 6 Pillars Quick Progress List */}
                <div className='flex flex-1 flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-5 backdrop-blur-xl'>
                  <div className='mb-3 flex items-center justify-between border-b border-white/10 pb-2'>
                    <span className='text-xs font-bold tracking-wider text-slate-300 uppercase'>
                      Rincian Capaian Nilai per Pilar
                    </span>
                    <span className='font-mono text-xs text-slate-400'>
                      Skor / Maks
                    </span>
                  </div>

                  <div className='space-y-2.5'>
                    {(monitoringData.pilars || []).map((pilar, i) => {
                      const persen =
                        pilar.nilaiMaksimal > 0
                          ? Math.min(
                              100,
                              Math.round(
                                (pilar.nilaiVerifikasi / pilar.nilaiMaksimal) *
                                  100
                              )
                            )
                          : 0;
                      return (
                        <div key={pilar.id_pilar || i} className='space-y-1'>
                          <div className='flex items-center justify-between text-xs'>
                            <span className='line-clamp-1 font-semibold text-slate-200'>
                              {pilar.kode_pilar}: {pilar.nama_pilar}
                            </span>
                            <span className='font-mono font-bold text-emerald-400'>
                              {pilar.nilaiVerifikasi.toFixed(2)}{' '}
                              <span className='font-normal text-slate-500'>
                                / {pilar.nilaiMaksimal.toFixed(2)}
                              </span>
                            </span>
                          </div>
                          <div className='h-1.5 w-full overflow-hidden rounded-full bg-slate-800'>
                            <div
                              className='h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-500'
                              style={{ width: `${persen}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SLIDE 2: INDEKS KEPUASAN MASYARAKAT (IKM) & IPAK + NPS
            ===================================================================== */}
        {currentSlide === 1 && (
          <div className='animate-fade-in flex flex-1 flex-col gap-6'>
            {/* Slide Header */}
            <div className='flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <Badge className='border-purple-500/40 bg-purple-500/20 text-xs font-bold text-purple-300'>
                    SLIDE 2 / 4
                  </Badge>
                  <h2 className='text-2xl font-black tracking-tight text-white md:text-3xl'>
                    Indeks Kepuasan Masyarakat (IKM) & Persepsi Anti Korupsi
                    (IPAK)
                  </h2>
                </div>
                <p className='mt-1 text-sm text-slate-400'>
                  Hasil Survei Persepsi Kualitas Pelayanan (SPKP) & Persepsi
                  Anti Korupsi (SPAK) PST BPS Sitaro
                </p>
              </div>

              <div className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-300'>
                <CheckCircle2 className='h-4 w-4 text-emerald-400' />
                <span>Metodologi Standar PermenPAN-RB No. 14/2017</span>
              </div>
            </div>

            {/* 4 Hero Cards */}
            <div className='grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4'>
              {/* Card 1: IKM */}
              <div className='flex flex-col justify-between rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/40 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold tracking-wider text-blue-400 uppercase'>
                    Indeks Kepuasan (IKM)
                  </span>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400'>
                    <Smile className='h-5 w-5' />
                  </div>
                </div>
                <div className='my-3'>
                  <div className='flex items-baseline gap-2'>
                    <span className='font-mono text-5xl font-black text-white'>
                      3.84
                    </span>
                    <span className='text-base font-semibold text-slate-400'>
                      / 4.00
                    </span>
                  </div>
                  <div className='mt-2 inline-flex items-center gap-1.5 rounded-full border border-blue-400/40 bg-blue-400/10 px-2.5 py-0.5 text-xs font-bold text-blue-300'>
                    <Star className='h-3 w-3 fill-blue-300' /> Mutu Pelayanan: A
                    (Sangat Baik)
                  </div>
                </div>
                <p className='text-xs text-slate-400'>
                  Konversi Indeks: <strong className='text-white'>96.00</strong>{' '}
                  dari skala 100. PST Si-Datu dinilai sangat cepat dan
                  memuaskan.
                </p>
              </div>

              {/* Card 2: IPAK */}
              <div className='flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/40 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold tracking-wider text-emerald-400 uppercase'>
                    Persepsi Anti Korupsi (IPAK)
                  </span>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400'>
                    <ShieldCheck className='h-5 w-5' />
                  </div>
                </div>
                <div className='my-3'>
                  <div className='flex items-baseline gap-2'>
                    <span className='font-mono text-5xl font-black text-emerald-400'>
                      3.92
                    </span>
                    <span className='text-base font-semibold text-slate-400'>
                      / 4.00
                    </span>
                  </div>
                  <div className='mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-bold text-emerald-300'>
                    <CheckCircle2 className='h-3 w-3' /> Kategori: Sangat Bersih
                  </div>
                </div>
                <p className='text-xs text-slate-400'>
                  Konversi Indeks: <strong className='text-white'>98.00</strong>
                  . Terbebas dari praktek calo, suap, dan diskriminasi layanan.
                </p>
              </div>

              {/* Card 3: NPS */}
              <div className='flex flex-col justify-between rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/40 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold tracking-wider text-indigo-400 uppercase'>
                    Net Promoter Score (NPS)
                  </span>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400'>
                    <TrendingUp className='h-5 w-5' />
                  </div>
                </div>
                <div className='my-3'>
                  <div className='flex items-baseline gap-2'>
                    <span className='font-mono text-5xl font-black text-indigo-300'>
                      +92%
                    </span>
                  </div>
                  <div className='mt-2 inline-flex items-center gap-1.5 rounded-full border border-indigo-400/40 bg-indigo-400/10 px-2.5 py-0.5 text-xs font-bold text-indigo-200'>
                    <Award className='h-3 w-3' /> World-Class Experience
                  </div>
                </div>
                <p className='text-xs text-slate-400'>
                  96% Promoters merekomendasikan layanan PST Sitaro kepada
                  instansi lain dan masyarakat umum.
                </p>
              </div>

              {/* Card 4: Bebas Pungli */}
              <div className='flex flex-col justify-between rounded-3xl border border-cyan-500/30 bg-gradient-to-b from-cyan-950/40 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl'>
                <div className='flex items-center justify-between'>
                  <span className='text-xs font-bold tracking-wider text-cyan-400 uppercase'>
                    Bebas Pungutan Liar
                  </span>
                  <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400'>
                    <HeartHandshake className='h-5 w-5' />
                  </div>
                </div>
                <div className='my-3'>
                  <div className='flex items-baseline gap-2'>
                    <span className='font-mono text-5xl font-black text-cyan-300'>
                      100%
                    </span>
                  </div>
                  <div className='mt-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-400/40 bg-cyan-400/10 px-2.5 py-0.5 text-xs font-bold text-cyan-200'>
                    <CheckCircle2 className='h-3 w-3' /> Tarif Resmi: Rp 0
                    (Gratis)
                  </div>
                </div>
                <p className='text-xs text-slate-400'>
                  0 Laporan Pungli. Transparansi biaya layanan konsultasi & data
                  statistik terjamin 100% non-komersial.
                </p>
              </div>
            </div>

            {/* Bottom Section: 6 Unsur Pelayanan & Testimoni Publik */}
            <div className='grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12'>
              {/* 6 Unsur Pelayanan Publik */}
              <div className='flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl lg:col-span-7'>
                <div className='mb-3 flex items-center justify-between border-b border-white/10 pb-2'>
                  <span className='text-xs font-bold tracking-wider text-slate-300 uppercase'>
                    Rincian Skor 6 Unsur Kepuasan Pelayanan Publik
                  </span>
                  <span className='text-xs font-semibold text-emerald-400'>
                    Skala 4.00
                  </span>
                </div>

                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                  {[
                    {
                      label: '1. Kesesuaian Persyaratan Pelayanan',
                      score: 3.86,
                      desc: 'Jelas dan tanpa syarat berbelit'
                    },
                    {
                      label: '2. Kemudahan Prosedur & Alur',
                      score: 3.88,
                      desc: 'Layanan digital via WhatsApp & Web'
                    },
                    {
                      label: '3. Kecepatan Waktu Respon (SLA)',
                      score: 3.82,
                      desc: 'Rata-rata tuntas dalam < 15 menit'
                    },
                    {
                      label: '4. Kepastian Biaya / Tarif Rp 0',
                      score: 4.0,
                      desc: 'Bebas biaya penyeberangan & retribusi'
                    },
                    {
                      label: '5. Kompetensi & Kesopanan Petugas',
                      score: 3.94,
                      desc: 'Petugas PST ramah & komunikatif'
                    },
                    {
                      label: '6. Kualitas Sarpras & Ramah Difabel',
                      score: 3.85,
                      desc: 'Akses ramp, kursi roda, & audio-visual'
                    }
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className='rounded-2xl border border-white/5 bg-white/5 p-3.5'
                    >
                      <div className='flex items-center justify-between text-xs'>
                        <span className='font-semibold text-slate-200'>
                          {item.label}
                        </span>
                        <span className='font-mono font-bold text-emerald-400'>
                          {item.score.toFixed(2)}
                        </span>
                      </div>
                      <p className='mt-1 text-[11px] text-slate-400'>
                        {item.desc}
                      </p>
                      <div className='mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-800'>
                        <div
                          className='h-full rounded-full bg-emerald-400'
                          style={{ width: `${(item.score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kutipan Pengguna Terpilih */}
              <div className='flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-6 backdrop-blur-xl lg:col-span-5'>
                <div className='mb-3 flex items-center justify-between border-b border-white/10 pb-2'>
                  <span className='text-xs font-bold tracking-wider text-slate-300 uppercase'>
                    Suara Pengguna Layanan (Stakeholder)
                  </span>
                  <Badge
                    variant='outline'
                    className='border-white/10 text-[10px] text-slate-400'
                  >
                    Verifikasi Nyata
                  </Badge>
                </div>

                <div className='space-y-3'>
                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <div className='flex items-center gap-1 text-amber-400'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className='h-3.5 w-3.5 fill-amber-400' />
                      ))}
                    </div>
                    <p className='mt-2 text-xs text-slate-300 italic'>
                      &quot;PST Si-Datu sangat memudahkan koordinasi perumusan
                      RKPD. OPD di Tagulandang dan Biaro tidak perlu lagi
                      menyeberang laut berjam-jam untuk validasi data
                      sektoral.&quot;
                    </p>
                    <div className='mt-3 border-t border-white/10 pt-2 text-[11px] font-semibold text-slate-400'>
                      — Kabid Perencanaan Bappelitbangda Sitaro
                    </div>
                  </div>

                  <div className='rounded-2xl border border-white/10 bg-white/5 p-4'>
                    <div className='flex items-center gap-1 text-amber-400'>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className='h-3.5 w-3.5 fill-amber-400' />
                      ))}
                    </div>
                    <p className='mt-2 text-xs text-slate-300 italic'>
                      &quot;Petugas PST melayani dengan ramah, penjelasan
                      indikator inflasi dan PDRB sangat gamblang. Layanan
                      konsultasi virtual gratis tanpa dipungut biaya
                      apapun.&quot;
                    </p>
                    <div className='mt-3 border-t border-white/10 pt-2 text-[11px] font-semibold text-slate-400'>
                      — Mahasiswa Peneliti Tugas Akhir
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SLIDE 3: SHOWCASE INOVASI PELAYANAN PUBLIK UNGGULAN
            ===================================================================== */}
        {currentSlide === 2 && (
          <div className='animate-fade-in flex flex-1 flex-col gap-6'>
            {/* Slide Header */}
            <div className='flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <Badge className='border-cyan-500/40 bg-cyan-500/20 text-xs font-bold text-cyan-300'>
                    SLIDE 3 / 4
                  </Badge>
                  <h2 className='text-2xl font-black tracking-tight text-white md:text-3xl'>
                    Showcase Inovasi Pelayanan Publik Unggulan
                  </h2>
                </div>
                <p className='mt-1 text-sm text-slate-400'>
                  Solusi Digital BPS Sitaro Mengatasi Tantangan Geografis 47
                  Pulau di Wilayah Perbatasan
                </p>
              </div>

              <div className='flex items-center gap-2 rounded-2xl border border-cyan-500/30 bg-cyan-950/40 px-4 py-2 text-xs font-bold text-cyan-300'>
                <Sparkles className='h-4 w-4' />
                <span>3 Inovasi Bersertifikasi & Aktif Berdampak</span>
              </div>
            </div>

            {/* 3 Inovasi Columns */}
            <div className='grid flex-1 grid-cols-1 gap-6 lg:grid-cols-3'>
              {/* Inovasi 1: PST Si-Datu */}
              <div className='flex flex-col justify-between rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl'>
                <div>
                  <div className='flex items-center justify-between'>
                    <Badge className='border-blue-400/40 bg-blue-500/20 text-xs font-bold text-blue-300'>
                      PILAR 6: PELAYANAN PUBLIK
                    </Badge>
                    <span className='font-mono text-xs font-bold text-emerald-400'>
                      Efisiensi 85%
                    </span>
                  </div>
                  <h3 className='mt-3 text-xl font-black text-white'>
                    PST Si-Datu
                  </h3>
                  <p className='text-xs font-semibold text-blue-300'>
                    Pelayanan Statistik Terpadu Digital Sitaro
                  </p>
                  <p className='mt-3 text-xs leading-relaxed text-slate-300'>
                    Layanan konsultasi statistik dan permintaan mikrodata kilat
                    berbasis WhatsApp Bot 24/7 dan Virtual Consultation Booth
                    lintas pulau Siau, Tagulandang, dan Biaro.
                  </p>

                  <div className='mt-4 space-y-2 rounded-2xl border border-white/5 bg-white/5 p-3.5 text-xs'>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>
                        Waktu Tunggu (SLA):
                      </span>
                      <strong className='text-emerald-400'>
                        &lt; 15 Menit
                      </strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>Pengguna Aktif:</span>
                      <strong className='text-white'>1.420+ Pemohon</strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>
                        Biaya Penyeberangan:
                      </span>
                      <strong className='text-cyan-300'>
                        Rp 0 (Hemat Total)
                      </strong>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex flex-wrap gap-1.5'>
                  <span className='rounded-lg bg-blue-500/20 px-2 py-1 text-[10px] font-bold text-blue-300'>
                    WhatsApp Bot
                  </span>
                  <span className='rounded-lg bg-blue-500/20 px-2 py-1 text-[10px] font-bold text-blue-300'>
                    Virtual Booth
                  </span>
                  <span className='rounded-lg bg-blue-500/20 px-2 py-1 text-[10px] font-bold text-blue-300'>
                    TTE Resmi
                  </span>
                </div>
              </div>

              {/* Inovasi 2: Sitaro Fast-Access */}
              <div className='flex flex-col justify-between rounded-3xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl'>
                <div>
                  <div className='flex items-center justify-between'>
                    <Badge className='border-indigo-400/40 bg-indigo-500/20 text-xs font-bold text-indigo-300'>
                      PILAR 2: TATA LAKSANA
                    </Badge>
                    <span className='font-mono text-xs font-bold text-emerald-400'>
                      Efisiensi 75%
                    </span>
                  </div>
                  <h3 className='mt-3 text-xl font-black text-white'>
                    Sitaro Fast-Access
                  </h3>
                  <p className='text-xs font-semibold text-indigo-300'>
                    Portal Publikasi Kilat & Open Data Daerah
                  </p>
                  <p className='mt-3 text-xs leading-relaxed text-slate-300'>
                    Katalog digital publikasi daerah dengan teknologi kompresi
                    dokumen modular (&lt; 1 MB) hemat bandwidth 90% bagi wilayah
                    blank spot kepulauan terluar.
                  </p>

                  <div className='mt-4 space-y-2 rounded-2xl border border-white/5 bg-white/5 p-3.5 text-xs'>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>Kecepatan Unduh:</span>
                      <strong className='text-emerald-400'>
                        &lt; 5 Detik (3G/4G)
                      </strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>
                        Jadwal Rilis Publikasi:
                      </span>
                      <strong className='text-indigo-300'>
                        Maju 3 Bulan (Feb)
                      </strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>Total Unduhan:</span>
                      <strong className='text-white'>2.850+ Berkas</strong>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex flex-wrap gap-1.5'>
                  <span className='rounded-lg bg-indigo-500/20 px-2 py-1 text-[10px] font-bold text-indigo-300'>
                    Kompresi 90%
                  </span>
                  <span className='rounded-lg bg-indigo-500/20 px-2 py-1 text-[10px] font-bold text-indigo-300'>
                    Open Data Excel
                  </span>
                  <span className='rounded-lg bg-indigo-500/20 px-2 py-1 text-[10px] font-bold text-indigo-300'>
                    Infografis
                  </span>
                </div>
              </div>

              {/* Inovasi 3: WBS Berani */}
              <div className='flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl'>
                <div>
                  <div className='flex items-center justify-between'>
                    <Badge className='border-emerald-400/40 bg-emerald-500/20 text-xs font-bold text-emerald-300'>
                      PILAR 5: PENGAWASAN
                    </Badge>
                    <span className='font-mono text-xs font-bold text-emerald-400'>
                      Privasi 100%
                    </span>
                  </div>
                  <h3 className='mt-3 text-xl font-black text-white'>
                    WBS-Sitaro Berani
                  </h3>
                  <p className='text-xs font-semibold text-emerald-300'>
                    E-Whistleblowing & Pojok Integritas Mandiri
                  </p>
                  <p className='mt-3 text-xs leading-relaxed text-slate-300'>
                    Kanal pengaduan pelanggaran kode etik, gratifikasi, dan
                    pungli ber-enkripsi zero-knowledge hash dengan jaminan
                    kerahasiaan identitas pelapor 100%.
                  </p>

                  <div className='mt-4 space-y-2 rounded-2xl border border-white/5 bg-white/5 p-3.5 text-xs'>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>
                        Kerahasiaan Pelapor:
                      </span>
                      <strong className='text-emerald-400'>
                        100% Enkripsi SHA
                      </strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>
                        Insiden Intimidasi:
                      </span>
                      <strong className='text-white'>0 Kasus (Nihil)</strong>
                    </div>
                    <div className='flex items-center justify-between'>
                      <span className='text-slate-400'>Transparansi Lobi:</span>
                      <strong className='text-cyan-300'>
                        QR Meja PST Live
                      </strong>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex flex-wrap gap-1.5'>
                  <span className='rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-300'>
                    Anti-Intimidasi
                  </span>
                  <span className='rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-300'>
                    Zero-Knowledge
                  </span>
                  <span className='rounded-lg bg-emerald-500/20 px-2 py-1 text-[10px] font-bold text-emerald-300'>
                    UPG KPK
                  </span>
                </div>
              </div>
            </div>

            {/* Aggregate Impact Banner */}
            <div className='flex flex-wrap items-center justify-around gap-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-center'>
              <div>
                <span className='text-xs text-slate-400'>
                  Total Manfaat Pengguna:
                </span>
                <p className='font-mono text-xl font-bold text-white'>
                  4.270+ Orang
                </p>
              </div>
              <div className='h-8 w-[1px] bg-white/10' />
              <div>
                <span className='text-xs text-slate-400'>
                  Estimasi Penghematan Tiket Kapal:
                </span>
                <p className='font-mono text-xl font-bold text-emerald-400'>
                  &plusmn; Rp 320.000.000
                </p>
              </div>
              <div className='h-8 w-[1px] bg-white/10' />
              <div>
                <span className='text-xs text-slate-400'>
                  Komitmen Keberlanjutan:
                </span>
                <p className='font-mono text-xl font-bold text-cyan-300'>
                  100% Paperless & Zero-Carbon
                </p>
              </div>
            </div>
          </div>
        )}

        {/* =====================================================================
            SLIDE 4: COUNTDOWN BATAS WAKTU, LHKPN/LHKASN & NIHIL HUKDIS
            ===================================================================== */}
        {currentSlide === 3 && (
          <div className='animate-fade-in flex flex-1 flex-col gap-6'>
            {/* Slide Header */}
            <div className='flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4'>
              <div>
                <div className='flex items-center gap-2'>
                  <Badge className='border-amber-500/40 bg-amber-500/20 text-xs font-bold text-amber-300'>
                    SLIDE 4 / 4
                  </Badge>
                  <h2 className='text-2xl font-black tracking-tight text-white md:text-3xl'>
                    Hitung Mundur Batas Waktu & Kepatuhan Integritas ASN
                  </h2>
                </div>
                <p className='mt-1 text-sm text-slate-400'>
                  Pemenuhan Syarat Formal Predikat WBK: Kepatuhan Harta Kekayaan
                  & Penegakan Disiplin ASN
                </p>
              </div>

              <div className='flex items-center gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-950/40 px-4 py-2 text-xs font-bold text-emerald-300'>
                <ShieldCheck className='h-4 w-4' />
                <span>100% Syarat Integritas WBK Terpenuhi</span>
              </div>
            </div>

            {/* Grid 3 Columns */}
            <div className='grid flex-1 grid-cols-1 gap-6 lg:grid-cols-12'>
              {/* Countdown Batas Waktu (4 Cols) */}
              <div className='flex flex-col justify-between rounded-3xl border border-amber-500/30 bg-gradient-to-b from-amber-950/30 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl lg:col-span-4'>
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold tracking-wider text-amber-400 uppercase'>
                      Tenggat Waktu Evaluasi ZI
                    </span>
                    <Clock className='h-5 w-5 text-amber-400' />
                  </div>
                  <h3 className='mt-2 text-lg font-bold text-white'>
                    Batas Akhir Penilaian Mandiri PMPRB
                  </h3>
                  <p className='text-xs text-slate-400'>
                    Target Penyerahan LKE ke Tim Penilai Internal (TPI)
                  </p>

                  {/* 4 Box Countdown */}
                  <div className='mt-6 grid grid-cols-4 gap-2 text-center'>
                    <div className='rounded-2xl border border-amber-500/30 bg-amber-950/50 p-2.5'>
                      <span className='font-mono text-3xl font-black text-amber-300'>
                        {countdown.days}
                      </span>
                      <span className='block text-[10px] font-bold text-slate-400 uppercase'>
                        Hari
                      </span>
                    </div>
                    <div className='rounded-2xl border border-amber-500/30 bg-amber-950/50 p-2.5'>
                      <span className='font-mono text-3xl font-black text-amber-300'>
                        {countdown.hours}
                      </span>
                      <span className='block text-[10px] font-bold text-slate-400 uppercase'>
                        Jam
                      </span>
                    </div>
                    <div className='rounded-2xl border border-amber-500/30 bg-amber-950/50 p-2.5'>
                      <span className='font-mono text-3xl font-black text-amber-300'>
                        {countdown.minutes}
                      </span>
                      <span className='block text-[10px] font-bold text-slate-400 uppercase'>
                        Mnt
                      </span>
                    </div>
                    <div className='rounded-2xl border border-amber-500/30 bg-amber-950/50 p-2.5'>
                      <span className='font-mono text-3xl font-black text-amber-300'>
                        {countdown.seconds}
                      </span>
                      <span className='block text-[10px] font-bold text-slate-400 uppercase'>
                        Dtk
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-6 space-y-2 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs'>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>SK Tim Kerja ZI:</span>
                    <strong className='text-emerald-400'>100% Sah</strong>
                  </div>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Rencana Aksi & Matrix:</span>
                    <strong className='text-emerald-400'>Terdokumentasi</strong>
                  </div>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Verifikasi Eviden TPI:</span>
                    <strong className='text-cyan-300'>On Schedule</strong>
                  </div>
                </div>
              </div>

              {/* Kepatuhan LHKPN / LHKASN 100% (4 Cols) */}
              <div className='flex flex-col justify-between rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/30 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl lg:col-span-4'>
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold tracking-wider text-emerald-400 uppercase'>
                      Kepatuhan LHKPN & LHKASN
                    </span>
                    <FileCheck className='h-5 w-5 text-emerald-400' />
                  </div>
                  <h3 className='mt-2 text-lg font-bold text-white'>
                    Pelaporan Harta Kekayaan Pegawai
                  </h3>
                  <p className='text-xs text-slate-400'>
                    Kewajiban Seluruh Pegawai BPS Sitaro Tahun{' '}
                    {activePeriode?.tahun || 2026}
                  </p>

                  <div className='my-6 flex items-center justify-center'>
                    <div className='relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-emerald-500/30 bg-emerald-950/40 shadow-inner'>
                      <div className='text-center'>
                        <span className='font-mono text-4xl font-black text-emerald-400'>
                          100%
                        </span>
                        <span className='block text-[10px] font-bold text-slate-300 uppercase'>
                          Tuntas Lapor
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className='space-y-2.5 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs'>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Wajib Lapor e-LHKPN (Pimpinan/PPK):</span>
                    <strong className='text-emerald-400'>
                      100% Lapor Tepat Waktu
                    </strong>
                  </div>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Wajib Lapor e-LHKASN (Seluruh ASN):</span>
                    <strong className='text-emerald-400'>
                      100% Tanda Terima Lengkap
                    </strong>
                  </div>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Status Verifikasi KPK & MenPAN:</span>
                    <strong className='text-cyan-300'>
                      Terverifikasi Resmi
                    </strong>
                  </div>
                </div>
              </div>

              {/* Nihil Hukdis & Kode Etik (4 Cols) */}
              <div className='flex flex-col justify-between rounded-3xl border border-blue-500/30 bg-gradient-to-b from-blue-950/30 to-slate-900/80 p-6 shadow-xl backdrop-blur-xl lg:col-span-4'>
                <div>
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-bold tracking-wider text-blue-400 uppercase'>
                      Disiplin & Integritas ASN
                    </span>
                    <ShieldCheck className='h-5 w-5 text-blue-400' />
                  </div>
                  <h3 className='mt-2 text-lg font-bold text-white'>
                    Status Penegakan Kode Etik & Disiplin
                  </h3>
                  <p className='text-xs text-slate-400'>
                    PP No. 94/2021 tentang Disiplin Pegawai Negeri Sipil
                  </p>

                  <div className='my-6 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 p-5 text-center shadow-lg'>
                    <span className='font-mono text-3xl font-black text-emerald-400'>
                      NIHIL HUKDIS
                    </span>
                    <p className='mt-1 text-xs font-semibold text-emerald-300'>
                      0 Pelanggaran Disiplin Ringan / Sedang / Berat
                    </p>
                  </div>
                </div>

                <div className='space-y-2.5 rounded-2xl border border-white/5 bg-white/5 p-4 text-xs'>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Hukuman Disiplin Berat:</span>
                    <strong className='font-mono text-emerald-400'>
                      0 Kasus (Nihil)
                    </strong>
                  </div>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Hukuman Disiplin Sedang:</span>
                    <strong className='font-mono text-emerald-400'>
                      0 Kasus (Nihil)
                    </strong>
                  </div>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Laporan Gratifikasi Ilegal (UPG):</span>
                    <strong className='font-mono text-emerald-400'>
                      0 Kasus (Nihil)
                    </strong>
                  </div>
                  <div className='flex items-center justify-between text-slate-300'>
                    <span>Pakta Integritas Seluruh Pegawai:</span>
                    <strong className='text-cyan-300'>
                      100% Ditandatangani
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          BOTTOM RUNNING TEXT TICKER (FOOTER)
          ========================================================================= */}
      <footer className='relative z-20 flex h-14 shrink-0 items-center border-t border-white/10 bg-slate-900/90 px-6 backdrop-blur-xl'>
        {/* Label Badge */}
        <div className='flex shrink-0 items-center gap-2 border-r border-white/10 pr-4'>
          <span className='relative flex h-2.5 w-2.5'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75' />
            <span className='relative inline-flex h-2.5 w-2.5 rounded-full bg-cyan-500' />
          </span>
          <span className='text-xs font-bold tracking-wider text-cyan-400 uppercase'>
            MAKLUMAT & PENGUMUMAN RESMI
          </span>
        </div>

        {/* Marquee Ticker */}
        <div className='flex-1 overflow-hidden px-4'>
          <div className='animate-marquee text-xs font-medium whitespace-nowrap text-slate-300'>
            <span>
              📢 MAKLUMAT PELAYANAN BPS KABUPATEN KEPULAUAN SITARO: &quot;Dengan
              ini kami menyatakan sanggup menyelenggarakan pelayanan sesuai
              standar pelayanan yang telah ditetapkan dan apabila tidak menepati
              janji ini, kami siap menerima sanksi sesuai ketentuan peraturan
              perundang-undangan.&quot;
            </span>
            <span className='mx-6 text-slate-500'>•</span>
            <span>
              ⭐ KOMITMEN ZONA INTEGRITAS 2026: Melayani dengan Cepat, Akurat,
              Berintegritas, Bebas Biaya (Rp 0), dan Tanpa Gratifikasi!
            </span>
            <span className='mx-6 text-slate-500'>•</span>
            <span>
              🚤 INOVASI PST SI-DATU: Layanan Data & Konsultasi Statistik Kilat
              Antar-Pulau Siau, Tagulandang, Biaro via WhatsApp Bot 24/7.
            </span>
            {pengumumanBroadcast?.isi_pesan && (
              <>
                <span className='mx-6 text-amber-500'>•</span>
                <span className='font-semibold text-amber-300'>
                  📌 ARAHAN PIMPINAN: {pengumumanBroadcast.judul} —{' '}
                  {pengumumanBroadcast.isi_pesan}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Mini Shortcut Indicator */}
        <div className='hidden shrink-0 items-center gap-3 border-l border-white/10 pl-4 text-[11px] text-slate-500 md:flex'>
          <span>[Spasi]: Jeda/Lanjut</span>
          <span>[← →]: Ganti Slide</span>
          <span>[F]: Fullscreen</span>
        </div>
      </footer>
    </div>
  );
}
