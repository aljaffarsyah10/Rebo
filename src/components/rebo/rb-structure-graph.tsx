'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Layers,
  Network,
  FolderTree,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  ShieldCheck,
  Users,
  Award,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  Maximize2,
  Minimize2,
  FileCheck,
  Building2,
  BarChart3,
  X,
  Compass
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';

// ==============================================================================
// Types for RB Structure
// ==============================================================================

export interface KategoriPenilaianItem {
  id_kategori: number | string;
  uraian_kategori: string;
  nilai: number | null;
}

export interface PertanyaanItem {
  id_pertanyaan: number | string;
  deskripsi_pertanyaan: string;
  uraian_buktidukung?: string | null;
  kategoriPenilaian?: KategoriPenilaianItem[];
}

export interface SubpilarItem {
  id_subpilar: number | string;
  nama_subpilar: string;
  pertanyaan?: PertanyaanItem[];
}

export interface PilarItem {
  id_pilar: number | string;
  nama_pilar: string;
  subpilar?: SubpilarItem[];
}

export interface AreaItem {
  id_area: number;
  nama_area: string;
  pilar?: PilarItem[];
}

export interface PilarHasilItem {
  id_pilarHasil: number;
  nama_pilarHasil: string;
  skor_pilarHasil: number;
  uraian_pilarHasil?: string | null;
}

interface RBStructureGraphProps {
  areasData?: AreaItem[];
  pilarHasilData?: PilarHasilItem[];
  showHero?: boolean;
}

// Icon helper per pilar
const getPilarIcon = (namaPilar: string) => {
  const lower = namaPilar.toLowerCase();
  if (lower.includes('perubahan')) return Sparkles;
  if (lower.includes('tatalaksana') || lower.includes('tata laksana'))
    return FileText;
  if (lower.includes('sdm') || lower.includes('aparatur')) return Users;
  if (lower.includes('akuntabilitas')) return BarChart3;
  if (lower.includes('pengawasan')) return ShieldCheck;
  if (lower.includes('pelayanan')) return Award;
  return Layers;
};

// Color badge helper per pilar
const getPilarColor = (index: number) => {
  const colors = [
    {
      bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800',
      dot: 'bg-purple-500',
      gradient: 'from-purple-500 to-indigo-600',
      border: 'border-purple-300 dark:border-purple-700'
    },
    {
      bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
      gradient: 'from-blue-500 to-cyan-600',
      border: 'border-blue-300 dark:border-blue-700'
    },
    {
      bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
      gradient: 'from-emerald-500 to-teal-600',
      border: 'border-emerald-300 dark:border-emerald-700'
    },
    {
      bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
      gradient: 'from-amber-500 to-orange-600',
      border: 'border-amber-300 dark:border-amber-700'
    },
    {
      bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500',
      gradient: 'from-rose-500 to-red-600',
      border: 'border-rose-300 dark:border-rose-700'
    },
    {
      bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800',
      dot: 'bg-indigo-500',
      gradient: 'from-indigo-500 to-blue-600',
      border: 'border-indigo-300 dark:border-indigo-700'
    }
  ];
  return colors[index % colors.length];
};

export default function RBStructureGraph({
  areasData = [],
  pilarHasilData = [],
  showHero = true
}: RBStructureGraphProps) {
  // Active Tab
  const [activeTab, setActiveTab] = useState<'diagram' | 'tree' | 'matriks'>(
    'diagram'
  );

  // Search & Filter state for Tree
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<
    'all' | '1' | '2' | 'hasil'
  >('all');

  // Expanded nodes in Tree
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    'komponen-pengungkit': true,
    'komponen-hasil': true,
    'area-1': true,
    'area-2': true,
    'pilar-1': true,
    'pilar-2': false
  });

  // Selected Pilar in Visual Diagram for Drill-Down
  const [selectedPilarId, setSelectedPilarId] = useState<
    number | string | null
  >(1);
  const [selectedAreaId, setSelectedAreaId] = useState<number>(1);

  // Modal Detail Pertanyaan
  const [selectedPertanyaanDetail, setSelectedPertanyaanDetail] = useState<{
    pertanyaan: PertanyaanItem;
    pilarNama: string;
    subpilarNama: string;
    areaNama: string;
  } | null>(null);

  // Compute Statistics
  const stats = useMemo(() => {
    let totalSubpilar = 0;
    let totalPertanyaan = 0;
    let pemenuhanQuestions = 0;
    let reformQuestions = 0;

    areasData.forEach((area) => {
      area.pilar?.forEach((p) => {
        totalSubpilar += p.subpilar?.length || 0;
        p.subpilar?.forEach((sp) => {
          const qCount = sp.pertanyaan?.length || 0;
          totalPertanyaan += qCount;
          if (area.id_area === 1) pemenuhanQuestions += qCount;
          if (area.id_area === 2) reformQuestions += qCount;
        });
      });
    });

    return {
      totalArea: areasData.length || 2,
      totalPilar: 6,
      totalPilarHasil: pilarHasilData.length || 2,
      totalSubpilar,
      totalPertanyaan,
      pemenuhanQuestions,
      reformQuestions
    };
  }, [areasData, pilarHasilData]);

  // Toggle node expansion in tree
  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Expand all nodes
  const expandAll = () => {
    const allExpanded: Record<string, boolean> = {
      'komponen-pengungkit': true,
      'komponen-hasil': true,
      'area-1': true,
      'area-2': true
    };
    areasData.forEach((area) => {
      area.pilar?.forEach((p) => {
        allExpanded[`pilar-${p.id_pilar}`] = true;
        p.subpilar?.forEach((sp) => {
          allExpanded[`subpilar-${sp.id_subpilar}`] = true;
        });
      });
    });
    setExpandedNodes(allExpanded);
  };

  // Collapse all nodes
  const collapseAll = () => {
    setExpandedNodes({});
  };

  // Selected Pilar object for visual drill-down
  const activePilarData = useMemo(() => {
    const area = areasData.find((a) => a.id_area === selectedAreaId);
    if (!area) return null;
    return (
      area.pilar?.find((p) => String(p.id_pilar) === String(selectedPilarId)) ||
      area.pilar?.[0] ||
      null
    );
  }, [areasData, selectedAreaId, selectedPilarId]);

  // Parse evidence lines into clean array
  const parseEvidenceLines = (text?: string | null) => {
    if (!text) return [];
    return text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
  };

  return (
    <div className='w-full space-y-6'>
      {/* ============================================================================== */}
      {/* 1. Header Banner & High-Level Metric Cards (Optional) */}
      {/* ============================================================================== */}
      {showHero && (
        <div className='relative overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl dark:border-slate-800'>
          {/* Glow decoration */}
          <div className='pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl' />
          <div className='pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl' />

          <div className='relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='space-y-1.5'>
              <div className='inline-flex items-center gap-2 rounded-full border border-blue-400/30 bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-300'>
                <Network className='h-3.5 w-3.5 text-blue-400' />
                Arsitektur & Pohon Indikator Reformasi Birokrasi (RB)
              </div>
              <h2 className='text-2xl font-bold tracking-tight text-white md:text-3xl'>
                Struktur Hierarki Penilaian Zona Integritas (ZI)
              </h2>
              <p className='max-w-2xl text-sm text-slate-300'>
                Peta komprehensif mulai dari tingkat Komponen Utama (Pengungkit
                & Hasil), Area (Pemenuhan & Reform), 6 Pilar RB, Sub-Pilar,
                hingga Indikator / Pertanyaan LKE dan Dokumen Bukti Dukung.
              </p>
            </div>

            <div className='flex flex-wrap items-center gap-2'>
              <Badge
                variant='outline'
                className='border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-300'
              >
                <CheckCircle2 className='mr-1.5 h-3.5 w-3.5' /> Total Bobot:
                100%
              </Badge>
              <Badge
                variant='outline'
                className='border-blue-400/40 bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-300'
              >
                <FileCheck className='mr-1.5 h-3.5 w-3.5' />{' '}
                {stats.totalPertanyaan} Indikator LKE
              </Badge>
            </div>
          </div>

          {/* 6 Quick Metric Badges in grid */}
          <div className='relative z-10 mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6'>
            <div className='rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10'>
              <div className='text-xs font-medium text-slate-400'>Komponen</div>
              <div className='mt-1 text-xl font-bold text-white'>2</div>
              <div className='text-[11px] text-blue-400'>
                Pengungkit & Hasil
              </div>
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10'>
              <div className='text-xs font-medium text-slate-400'>
                Area Pengungkit
              </div>
              <div className='mt-1 text-xl font-bold text-white'>
                {stats.totalArea}
              </div>
              <div className='text-[11px] text-indigo-400'>
                Pemenuhan & Reform
              </div>
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10'>
              <div className='text-xs font-medium text-slate-400'>Pilar RB</div>
              <div className='mt-1 text-xl font-bold text-white'>6</div>
              <div className='text-[11px] text-purple-400'>Pilar Utama</div>
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10'>
              <div className='text-xs font-medium text-slate-400'>
                Sub-Pilar
              </div>
              <div className='mt-1 text-xl font-bold text-white'>
                {stats.totalSubpilar}
              </div>
              <div className='text-[11px] text-emerald-400'>Kegiatan Pokok</div>
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10'>
              <div className='text-xs font-medium text-slate-400'>
                Pertanyaan LKE
              </div>
              <div className='mt-1 text-xl font-bold text-white'>
                {stats.totalPertanyaan}
              </div>
              <div className='text-[11px] text-amber-400'>
                Indikator Evaluasi
              </div>
            </div>

            <div className='rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm transition-all hover:bg-white/10'>
              <div className='text-xs font-medium text-slate-400'>
                Pilar Hasil
              </div>
              <div className='mt-1 text-xl font-bold text-white'>
                {stats.totalPilarHasil}
              </div>
              <div className='text-[11px] text-rose-400'>Dampak & Survei</div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================================== */}
      {/* 2. Navigation Tabs (Bagan Visual, Pohon Struktur, Matriks) */}
      {/* ============================================================================== */}
      <Tabs
        value={activeTab}
        onValueChange={(val) =>
          setActiveTab(val as 'diagram' | 'tree' | 'matriks')
        }
        className='w-full'
      >
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <TabsList className='grid h-11 w-full grid-cols-3 rounded-xl bg-slate-100 p-1 sm:w-auto dark:bg-slate-800'>
            <TabsTrigger
              value='diagram'
              className='flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <Network className='h-4 w-4' />
              <span>Bagan Visual Graph</span>
            </TabsTrigger>
            <TabsTrigger
              value='tree'
              className='flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <FolderTree className='h-4 w-4' />
              <span>Pohon Struktur Interaktif</span>
            </TabsTrigger>
            <TabsTrigger
              value='matriks'
              className='flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <Compass className='h-4 w-4' />
              <span>Panduan 6 Pilar</span>
            </TabsTrigger>
          </TabsList>

          <div className='text-muted-foreground text-xs'>
            {activeTab === 'diagram' &&
              'Klik pada kartu pilar untuk melihat rincian sub-pilar & indikator'}
            {activeTab === 'tree' &&
              'Buka branch atau gunakan pencarian untuk menemukan indikator'}
            {activeTab === 'matriks' &&
              'Ringkasan komparasi area Pemenuhan vs Reform'}
          </div>
        </div>

        {/* ============================================================================== */}
        {/* TAB 1: DIAGRAM BAGAN VISUAL GRAPH */}
        {/* ============================================================================== */}
        <TabsContent value='diagram' className='mt-6 space-y-8'>
          {/* Main Visual Hierarchy Card */}
          <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            <div className='mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100'>
                  Bagan Alur Penilaian Struktur RB
                </h3>
                <p className='text-xs text-slate-500 dark:text-slate-400'>
                  Pola distribusi dari puncak Zona Integritas ke komponen, area,
                  pilar, dan pertanyaan.
                </p>
              </div>
              <Badge variant='secondary' className='w-fit text-xs'>
                Interaktif: Klik Pilar untuk Eksplorasi
              </Badge>
            </div>

            {/* Visual Node Diagram (SVG & Styled Flex/Grid Nodes) */}
            <div className='relative flex flex-col items-center space-y-6 py-2'>
              {/* Level 1: Root Node */}
              <div className='relative z-10 w-full max-w-md rounded-2xl border-2 border-indigo-500/40 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 p-5 text-center text-white shadow-lg'>
                <div className='inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-sm'>
                  <Building2 className='h-3.5 w-3.5' /> LEVEL 1: PUNCAK EVALUASI
                </div>
                <h4 className='mt-2 text-xl font-extrabold tracking-wide'>
                  Pembangunan Zona Integritas (ZI) / RB
                </h4>
                <p className='mt-1 text-xs text-indigo-100'>
                  Menuju Wilayah Bebas dari Korupsi (WBK) & Wilayah Birokrasi
                  Bersih dan Melayani (WBBM)
                </p>
                <div className='mt-3 inline-block rounded-lg bg-black/20 px-4 py-1 text-xs font-medium'>
                  Bobot Penilaian:{' '}
                  <span className='font-bold text-emerald-300'>100%</span>
                </div>
              </div>

              {/* Connecting Vertical Line */}
              <div className='h-8 w-0.5 bg-gradient-to-b from-indigo-500 to-slate-300 dark:to-slate-700' />

              {/* Level 2: Dua Komponen Utama (Pengungkit 60% vs Hasil 40%) */}
              <div className='grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2'>
                {/* Komponen Pengungkit */}
                <div className='relative flex flex-col rounded-2xl border-2 border-blue-500/30 bg-gradient-to-b from-blue-50/70 via-white to-white p-5 shadow-sm dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900'>
                  <div className='flex items-center justify-between'>
                    <span className='rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-bold text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'>
                      LEVEL 2: KOMPONEN
                    </span>
                    <Badge className='bg-blue-600 text-white'>Bobot: 60%</Badge>
                  </div>
                  <h5 className='mt-2 text-lg font-bold text-slate-900 dark:text-slate-100'>
                    I. Komponen Pengungkit
                  </h5>
                  <p className='mt-1 text-xs text-slate-600 dark:text-slate-400'>
                    Fokus pada tata kelola internal, sistem kerja, disiplin
                    aparatur, transparansi, dan pencegahan KKN.
                  </p>

                  <div className='mt-4 flex flex-wrap gap-2 text-xs'>
                    <div className='flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-2.5 py-1 text-slate-700 dark:border-blue-800 dark:bg-slate-800 dark:text-slate-200'>
                      <CheckCircle2 className='h-3.5 w-3.5 text-blue-500' />
                      <span>
                        Area Pemenuhan ({stats.pemenuhanQuestions} Indikator)
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5 rounded-lg border border-purple-200 bg-white px-2.5 py-1 text-slate-700 dark:border-purple-800 dark:bg-slate-800 dark:text-slate-200'>
                      <Sparkles className='h-3.5 w-3.5 text-purple-500' />
                      <span>
                        Area Reform ({stats.reformQuestions} Indikator)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Komponen Hasil */}
                <div className='relative flex flex-col rounded-2xl border-2 border-emerald-500/30 bg-gradient-to-b from-emerald-50/70 via-white to-white p-5 shadow-sm dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900'>
                  <div className='flex items-center justify-between'>
                    <span className='rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'>
                      LEVEL 2: KOMPONEN
                    </span>
                    <Badge className='bg-emerald-600 text-white'>
                      Bobot: 40%
                    </Badge>
                  </div>
                  <h5 className='mt-2 text-lg font-bold text-slate-900 dark:text-slate-100'>
                    II. Komponen Hasil
                  </h5>
                  <p className='mt-1 text-xs text-slate-600 dark:text-slate-400'>
                    Dampak nyata yang dirasakan masyarakat dan stakeholder
                    eksternal melalui survei kepuasan & persepsi integritas.
                  </p>

                  <div className='mt-4 space-y-2'>
                    {pilarHasilData.map((ph, idx) => (
                      <div
                        key={ph.id_pilarHasil || idx}
                        className='flex items-center justify-between rounded-lg border border-emerald-200 bg-white px-3 py-1.5 text-xs text-slate-700 dark:border-emerald-800 dark:bg-slate-800 dark:text-slate-200'
                      >
                        <span className='font-medium'>
                          {ph.nama_pilarHasil}
                        </span>
                        <span className='font-bold text-emerald-600 dark:text-emerald-400'>
                          {ph.skor_pilarHasil} Poin
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Connecting Line to Area & Pillars */}
              <div className='h-8 w-0.5 bg-gradient-to-b from-slate-300 to-indigo-500 dark:from-slate-700 dark:to-indigo-500' />

              {/* Level 3: Area Switcher & 6 Pilar Cards */}
              <div className='w-full max-w-5xl rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-800 dark:bg-slate-900/50'>
                <div className='mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-full bg-indigo-100 px-2.5 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'>
                      LEVEL 3 & 4
                    </span>
                    <span className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                      Enam (6) Pilar Reformasi Birokrasi
                    </span>
                  </div>

                  {/* Area Switcher Buttons */}
                  <div className='flex items-center gap-1 rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-800'>
                    <Button
                      size='sm'
                      variant={selectedAreaId === 1 ? 'default' : 'ghost'}
                      onClick={() => {
                        setSelectedAreaId(1);
                        setSelectedPilarId(1);
                      }}
                      className='h-7 text-xs'
                    >
                      Area Pemenuhan ({stats.pemenuhanQuestions})
                    </Button>
                    <Button
                      size='sm'
                      variant={selectedAreaId === 2 ? 'default' : 'ghost'}
                      onClick={() => {
                        setSelectedAreaId(2);
                        setSelectedPilarId(7);
                      }}
                      className='h-7 text-xs'
                    >
                      Area Reform ({stats.reformQuestions})
                    </Button>
                  </div>
                </div>

                {/* 6 Pilar Interactive Cards Grid */}
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
                  {areasData
                    .find((a) => a.id_area === selectedAreaId)
                    ?.pilar?.map((pilar, idx) => {
                      const Icon = getPilarIcon(pilar.nama_pilar);
                      const color = getPilarColor(idx);
                      const isSelected =
                        String(pilar.id_pilar) === String(selectedPilarId);
                      const questionCount =
                        pilar.subpilar?.reduce(
                          (acc, sp) => acc + (sp.pertanyaan?.length || 0),
                          0
                        ) || 0;

                      return (
                        <button
                          key={pilar.id_pilar}
                          onClick={() => setSelectedPilarId(pilar.id_pilar)}
                          className={`group relative flex flex-col items-start rounded-xl border p-4 text-left transition-all duration-200 ${
                            isSelected
                              ? 'border-indigo-500 bg-white shadow-md ring-2 ring-indigo-500/20 dark:border-indigo-400 dark:bg-slate-800'
                              : 'dark:bg-slate-850 border-slate-200 bg-white/80 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:hover:border-slate-700'
                          }`}
                        >
                          <div className='flex w-full items-center justify-between'>
                            <span
                              className={`flex h-9 w-9 items-center justify-center rounded-lg ${color.bg}`}
                            >
                              <Icon className='h-5 w-5' />
                            </span>
                            <Badge variant='outline' className='text-[10px]'>
                              {pilar.subpilar?.length || 0} Sub-Pilar
                            </Badge>
                          </div>

                          <div className='mt-3'>
                            <div className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
                              Pilar {idx + 1}
                            </div>
                            <h6 className='font-bold text-slate-900 group-hover:text-indigo-600 dark:text-slate-100 dark:group-hover:text-indigo-400'>
                              {pilar.nama_pilar}
                            </h6>
                          </div>

                          <div className='mt-3 flex w-full items-center justify-between border-t border-slate-100 pt-2 text-[11px] text-slate-500 dark:border-slate-800'>
                            <span>{questionCount} Indikator LKE</span>
                            <span className='flex items-center font-medium text-indigo-600 dark:text-indigo-400'>
                              {isSelected ? 'Terpilih' : 'Pilih'}
                              <ChevronRight className='ml-0.5 h-3 w-3' />
                            </span>
                          </div>
                        </button>
                      );
                    })}
                </div>
              </div>

              {/* Level 5 & 6: Selected Pilar Drill-Down (Sub-pilar & Pertanyaan) */}
              {activePilarData && (
                <div className='w-full max-w-5xl rounded-2xl border-2 border-indigo-500/20 bg-white p-6 shadow-md dark:border-indigo-500/30 dark:bg-slate-900'>
                  <div className='mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <div className='inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'>
                        <Layers className='h-3 w-3' /> LEVEL 5 & 6: SUB-PILAR &
                        INDIKATOR EVALUASI
                      </div>
                      <h4 className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
                        {activePilarData.nama_pilar} (
                        {selectedAreaId === 1
                          ? 'Area Pemenuhan'
                          : 'Area Reform'}
                        )
                      </h4>
                      <p className='text-xs text-slate-500 dark:text-slate-400'>
                        Terdapat {activePilarData.subpilar?.length || 0}{' '}
                        Sub-Pilar dengan rincian pertanyaan indikator evaluasi
                        di bawah ini:
                      </p>
                    </div>

                    <Link
                      href={`/rebo/formRB/${activePilarData.id_pilar}`}
                      className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700'
                    >
                      Buka Form Pengisian Pilar
                      <ExternalLink className='h-3.5 w-3.5' />
                    </Link>
                  </div>

                  {/* List of Subpillars & Questions */}
                  <div className='mt-4 space-y-4'>
                    {activePilarData.subpilar?.map((sp, spIdx) => (
                      <div
                        key={sp.id_subpilar}
                        className='rounded-xl border border-slate-200/90 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40'
                      >
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center gap-2'>
                            <span className='flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300'>
                              {spIdx + 1}
                            </span>
                            <span className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                              Sub-Pilar: {sp.nama_subpilar}
                            </span>
                          </div>
                          <Badge variant='outline' className='text-[11px]'>
                            {sp.pertanyaan?.length || 0} Indikator
                          </Badge>
                        </div>

                        {/* Questions Cards in Subpillar */}
                        <div className='mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2'>
                          {sp.pertanyaan?.map((q) => (
                            <div
                              key={q.id_pertanyaan}
                              onClick={() =>
                                setSelectedPertanyaanDetail({
                                  pertanyaan: q,
                                  pilarNama: activePilarData.nama_pilar,
                                  subpilarNama: sp.nama_subpilar,
                                  areaNama:
                                    selectedAreaId === 1
                                      ? 'Pemenuhan'
                                      : 'Reform'
                                })
                              }
                              className='group cursor-pointer rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:hover:border-indigo-600'
                            >
                              <div className='flex items-center justify-between gap-2'>
                                <Badge
                                  variant='secondary'
                                  className='font-mono text-[10px] text-indigo-700 dark:text-indigo-300'
                                >
                                  ID #{q.id_pertanyaan}
                                </Badge>
                                {q.kategoriPenilaian &&
                                  q.kategoriPenilaian.length > 0 && (
                                    <span className='text-muted-foreground text-[10px]'>
                                      {q.kategoriPenilaian.length} Opsi Nilai
                                    </span>
                                  )}
                              </div>
                              <p className='mt-2 line-clamp-2 text-xs font-medium text-slate-800 group-hover:text-indigo-600 dark:text-slate-200 dark:group-hover:text-indigo-400'>
                                {q.deskripsi_pertanyaan}
                              </p>
                              <div className='mt-2 flex items-center justify-between text-[11px] text-slate-500'>
                                <span className='text-xs font-medium text-blue-600 group-hover:underline dark:text-blue-400'>
                                  Lihat Dokumen Bukti & Nilai →
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stepper Diagram Alur Penilaian RB */}
          <div className='rounded-2xl border border-slate-200 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 p-6 dark:border-slate-800 dark:bg-slate-900/60'>
            <div className='mb-4'>
              <h4 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                Alur Kerja Evaluasi: Dari Struktur ke Predikat WBK/WBBM
              </h4>
              <p className='text-xs text-slate-500'>
                Proses berkesinambungan pengumpulan data, bukti dukung,
                verifikasi mandiri hingga evaluasi nasional.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5'>
              <div className='relative rounded-xl border border-blue-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-800'>
                <div className='text-xs font-bold text-blue-600 dark:text-blue-400'>
                  Langkah 1
                </div>
                <div className='mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Pahami Struktur & Indikator
                </div>
                <p className='mt-1 text-[11px] text-slate-600 dark:text-slate-400'>
                  Tim kerja mempelajari 6 Pilar, sub-pilar, dan 110 indikator
                  pertanyaan pada area Pemenuhan & Reform.
                </p>
              </div>

              <div className='relative rounded-xl border border-blue-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-800'>
                <div className='text-xs font-bold text-indigo-600 dark:text-indigo-400'>
                  Langkah 2
                </div>
                <div className='mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Unggah Dokumen Bukti (Eviden)
                </div>
                <p className='mt-1 text-[11px] text-slate-600 dark:text-slate-400'>
                  Mengunggah SK, SOP, notula, foto kegiatan, dan laporan
                  realisasi ke Google Drive & sistem REBO.
                </p>
              </div>

              <div className='relative rounded-xl border border-blue-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-800'>
                <div className='text-xs font-bold text-purple-600 dark:text-purple-400'>
                  Langkah 3
                </div>
                <div className='mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Penilaian Mandiri (Satker)
                </div>
                <p className='mt-1 text-[11px] text-slate-600 dark:text-slate-400'>
                  Operator dan koordinator menentukan opsi kategori penilaian
                  sesuai capaian faktual bukti kerja.
                </p>
              </div>

              <div className='relative rounded-xl border border-blue-200 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-slate-800'>
                <div className='text-xs font-bold text-amber-600 dark:text-amber-400'>
                  Langkah 4
                </div>
                <div className='mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Review & Verifikasi (TPI/TPI BPS)
                </div>
                <p className='mt-1 text-[11px] text-slate-600 dark:text-slate-400'>
                  Tim Penilai Internal memeriksa validitas eviden, memberikan
                  catatan perbaikan, dan skor rekomendasi.
                </p>
              </div>

              <div className='relative rounded-xl border border-emerald-300 bg-emerald-50/50 p-3.5 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/20'>
                <div className='text-xs font-bold text-emerald-600 dark:text-emerald-400'>
                  Hasil Akhir
                </div>
                <div className='mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Predikat WBK / WBBM
                </div>
                <p className='mt-1 text-[11px] text-slate-600 dark:text-slate-400'>
                  Capaian predikat nasional atas birokrasi bersih, bebas KKN,
                  akuntabel, dan pelayanan prima.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================================== */}
        {/* TAB 2: POHON STRUKTUR HIERARKI INTERAKTIF (SEARCHABLE & FILTERABLE) */}
        {/* ============================================================================== */}
        <TabsContent value='tree' className='mt-6 space-y-6'>
          {/* Controls Bar: Search, Filters, Expand/Collapse */}
          <div className='flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-950'>
            {/* Search Input */}
            <div className='relative flex-1'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <Input
                type='text'
                placeholder='Cari indikator, sub-pilar, kata kunci (contoh: gratifikasi, SOP, SK, tim)...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pr-9 pl-9 text-xs'
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              )}
            </div>

            {/* Filter Area Buttons */}
            <div className='flex flex-wrap items-center gap-1.5'>
              <Button
                size='sm'
                variant={selectedAreaFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setSelectedAreaFilter('all')}
                className='h-8 text-xs'
              >
                Semua
              </Button>
              <Button
                size='sm'
                variant={selectedAreaFilter === '1' ? 'default' : 'outline'}
                onClick={() => setSelectedAreaFilter('1')}
                className='h-8 text-xs'
              >
                Pemenuhan ({stats.pemenuhanQuestions})
              </Button>
              <Button
                size='sm'
                variant={selectedAreaFilter === '2' ? 'default' : 'outline'}
                onClick={() => setSelectedAreaFilter('2')}
                className='h-8 text-xs'
              >
                Reform ({stats.reformQuestions})
              </Button>
              <Button
                size='sm'
                variant={selectedAreaFilter === 'hasil' ? 'default' : 'outline'}
                onClick={() => setSelectedAreaFilter('hasil')}
                className='h-8 text-xs'
              >
                Hasil ({pilarHasilData.length})
              </Button>
            </div>

            {/* Expand / Collapse All Controls */}
            <div className='flex items-center gap-1 border-t pt-2 md:border-t-0 md:pt-0'>
              <Button
                size='sm'
                variant='ghost'
                onClick={expandAll}
                className='h-8 text-xs text-slate-600 dark:text-slate-400'
              >
                <Maximize2 className='mr-1.5 h-3.5 w-3.5' />
                Buka Semua
              </Button>
              <Button
                size='sm'
                variant='ghost'
                onClick={collapseAll}
                className='h-8 text-xs text-slate-600 dark:text-slate-400'
              >
                <Minimize2 className='mr-1.5 h-3.5 w-3.5' />
                Tutup Semua
              </Button>
            </div>
          </div>

          {/* Collapsible Tree View Container */}
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            {/* ROOT NODE */}
            <div className='space-y-4'>
              <div className='flex items-center gap-3 rounded-xl bg-indigo-50/70 p-3 dark:bg-indigo-950/40'>
                <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white'>
                  <Building2 className='h-4 w-4' />
                </div>
                <div>
                  <div className='text-xs font-semibold text-indigo-700 dark:text-indigo-300'>
                    ROOT HIERARKI
                  </div>
                  <h4 className='font-bold text-slate-900 dark:text-slate-100'>
                    Pembangunan Zona Integritas (ZI) Menuju WBK/WBBM (100%)
                  </h4>
                </div>
              </div>

              {/* BRANCH: KOMPONEN PENGUNGKIT (60%) */}
              {(selectedAreaFilter === 'all' ||
                selectedAreaFilter === '1' ||
                selectedAreaFilter === '2') && (
                <div className='ml-4 space-y-4 border-l-2 border-indigo-200 pl-4 dark:border-indigo-900'>
                  {/* Komponen Header */}
                  <div
                    onClick={() => toggleNode('komponen-pengungkit')}
                    className='group flex cursor-pointer items-center justify-between rounded-xl border border-blue-200/80 bg-blue-50/40 p-3 hover:bg-blue-50 dark:border-blue-900/60 dark:bg-blue-950/20'
                  >
                    <div className='flex items-center gap-2.5'>
                      {expandedNodes['komponen-pengungkit'] ? (
                        <ChevronDown className='h-4 w-4 text-blue-600' />
                      ) : (
                        <ChevronRight className='h-4 w-4 text-blue-600' />
                      )}
                      <div>
                        <span className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                          I. Komponen Pengungkit (Bobot 60%)
                        </span>
                        <span className='ml-2 text-xs text-slate-500'>
                          ({stats.totalArea} Area, {stats.totalPilar} Pilar,{' '}
                          {stats.totalPertanyaan} Indikator)
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className='border-blue-300 text-xs text-blue-600'
                    >
                      Proses & Tata Kelola
                    </Badge>
                  </div>

                  {expandedNodes['komponen-pengungkit'] && (
                    <div className='space-y-4 pl-3'>
                      {/* Loop Areas */}
                      {areasData
                        .filter((area) => {
                          if (selectedAreaFilter === '1')
                            return area.id_area === 1;
                          if (selectedAreaFilter === '2')
                            return area.id_area === 2;
                          return true;
                        })
                        .map((area) => {
                          const areaKey = `area-${area.id_area}`;
                          const isAreaExpanded = expandedNodes[areaKey];
                          const questionCount =
                            area.id_area === 1
                              ? stats.pemenuhanQuestions
                              : stats.reformQuestions;

                          return (
                            <div
                              key={area.id_area}
                              className='space-y-3 border-l-2 border-blue-200 pl-4 dark:border-blue-900'
                            >
                              {/* Area Node Header */}
                              <div
                                onClick={() => toggleNode(areaKey)}
                                className='dark:hover:bg-slate-850 flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50 p-2.5 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900'
                              >
                                <div className='flex items-center gap-2'>
                                  {isAreaExpanded ? (
                                    <ChevronDown className='h-4 w-4 text-indigo-600' />
                                  ) : (
                                    <ChevronRight className='h-4 w-4 text-indigo-600' />
                                  )}
                                  <span className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                    Area: {area.nama_area}
                                  </span>
                                  <Badge
                                    variant='secondary'
                                    className='text-[10px]'
                                  >
                                    {questionCount} Pertanyaan
                                  </Badge>
                                </div>
                                <span className='text-muted-foreground text-xs'>
                                  {isAreaExpanded ? 'Tutup Area' : 'Buka Area'}
                                </span>
                              </div>

                              {/* Pilar Loop */}
                              {isAreaExpanded && (
                                <div className='space-y-3 pl-3'>
                                  {area.pilar?.map((pilar, pIdx) => {
                                    const pilarKey = `pilar-${pilar.id_pilar}`;
                                    const isPilarExpanded =
                                      expandedNodes[pilarKey];
                                    const Icon = getPilarIcon(pilar.nama_pilar);
                                    const color = getPilarColor(pIdx);

                                    // Filter subpilars by search
                                    const filteredSubpilars =
                                      pilar.subpilar?.filter((sp) => {
                                        if (!searchQuery) return true;
                                        const qLower =
                                          searchQuery.toLowerCase();
                                        const matchSubpilar = sp.nama_subpilar
                                          .toLowerCase()
                                          .includes(qLower);
                                        const matchPertanyaan =
                                          sp.pertanyaan?.some(
                                            (q) =>
                                              q.deskripsi_pertanyaan
                                                .toLowerCase()
                                                .includes(qLower) ||
                                              String(q.id_pertanyaan).includes(
                                                qLower
                                              )
                                          );
                                        return matchSubpilar || matchPertanyaan;
                                      });

                                    // If searching and no match, hide
                                    if (
                                      searchQuery &&
                                      (!filteredSubpilars ||
                                        filteredSubpilars.length === 0)
                                    ) {
                                      return null;
                                    }

                                    return (
                                      <div
                                        key={pilar.id_pilar}
                                        className='space-y-2 border-l-2 border-slate-200 pl-4 dark:border-slate-800'
                                      >
                                        {/* Pilar Node Header */}
                                        <div
                                          onClick={() => toggleNode(pilarKey)}
                                          className='dark:bg-slate-850 flex cursor-pointer items-center justify-between rounded-lg border border-slate-200/90 bg-white p-2.5 shadow-2xs hover:border-slate-300 dark:border-slate-800'
                                        >
                                          <div className='flex items-center gap-2'>
                                            {isPilarExpanded ? (
                                              <ChevronDown className='h-4 w-4 text-slate-500' />
                                            ) : (
                                              <ChevronRight className='h-4 w-4 text-slate-500' />
                                            )}
                                            <span
                                              className={`flex h-6 w-6 items-center justify-center rounded ${color.bg}`}
                                            >
                                              <Icon className='h-3.5 w-3.5' />
                                            </span>
                                            <span className='text-xs font-medium text-slate-900 sm:text-sm dark:text-slate-100'>
                                              Pilar {pIdx + 1}:{' '}
                                              {pilar.nama_pilar}
                                            </span>
                                          </div>
                                          <div className='flex items-center gap-2'>
                                            <Badge
                                              variant='outline'
                                              className='text-[10px]'
                                            >
                                              {pilar.subpilar?.length || 0}{' '}
                                              Sub-Pilar
                                            </Badge>
                                          </div>
                                        </div>

                                        {/* Subpillar & Questions List */}
                                        {isPilarExpanded && (
                                          <div className='space-y-2.5 pl-4'>
                                            {filteredSubpilars?.map(
                                              (subpilar, spIdx) => {
                                                const subpilarKey = `subpilar-${subpilar.id_subpilar}`;
                                                const isSpExpanded =
                                                  expandedNodes[subpilarKey] ||
                                                  Boolean(searchQuery);

                                                // Filter questions
                                                const filteredQuestions =
                                                  subpilar.pertanyaan?.filter(
                                                    (q) => {
                                                      if (!searchQuery)
                                                        return true;
                                                      const qLower =
                                                        searchQuery.toLowerCase();
                                                      return (
                                                        q.deskripsi_pertanyaan
                                                          .toLowerCase()
                                                          .includes(qLower) ||
                                                        String(
                                                          q.id_pertanyaan
                                                        ).includes(qLower)
                                                      );
                                                    }
                                                  );

                                                return (
                                                  <div
                                                    key={subpilar.id_subpilar}
                                                    className='rounded-lg border border-slate-200/70 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-900/40'
                                                  >
                                                    {/* Subpillar Header */}
                                                    <div
                                                      onClick={() =>
                                                        toggleNode(subpilarKey)
                                                      }
                                                      className='flex cursor-pointer items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200'
                                                    >
                                                      <div className='flex items-center gap-2'>
                                                        {isSpExpanded ? (
                                                          <ChevronDown className='h-3.5 w-3.5 text-slate-400' />
                                                        ) : (
                                                          <ChevronRight className='h-3.5 w-3.5 text-slate-400' />
                                                        )}
                                                        <span>
                                                          {spIdx + 1}.{' '}
                                                          {
                                                            subpilar.nama_subpilar
                                                          }
                                                        </span>
                                                      </div>
                                                      <Badge
                                                        variant='secondary'
                                                        className='text-[10px]'
                                                      >
                                                        {filteredQuestions?.length ||
                                                          0}{' '}
                                                        Indikator
                                                      </Badge>
                                                    </div>

                                                    {/* Question Leaves */}
                                                    {isSpExpanded && (
                                                      <div className='mt-2 space-y-1.5 pl-5'>
                                                        {filteredQuestions?.map(
                                                          (q) => (
                                                            <div
                                                              key={
                                                                q.id_pertanyaan
                                                              }
                                                              onClick={() =>
                                                                setSelectedPertanyaanDetail(
                                                                  {
                                                                    pertanyaan:
                                                                      q,
                                                                    pilarNama:
                                                                      pilar.nama_pilar,
                                                                    subpilarNama:
                                                                      subpilar.nama_subpilar,
                                                                    areaNama:
                                                                      area.nama_area
                                                                  }
                                                                )
                                                              }
                                                              className='flex cursor-pointer items-start justify-between gap-3 rounded-md border border-slate-200/80 bg-white p-2 text-xs shadow-2xs transition hover:border-indigo-400 hover:bg-indigo-50/20 dark:border-slate-800 dark:bg-slate-800/80 dark:hover:border-indigo-600'
                                                            >
                                                              <div className='flex items-start gap-2'>
                                                                <Badge
                                                                  variant='outline'
                                                                  className='mt-0.5 shrink-0 font-mono text-[9px] text-indigo-600 dark:text-indigo-400'
                                                                >
                                                                  #
                                                                  {
                                                                    q.id_pertanyaan
                                                                  }
                                                                </Badge>
                                                                <span className='font-normal text-slate-800 dark:text-slate-200'>
                                                                  {
                                                                    q.deskripsi_pertanyaan
                                                                  }
                                                                </span>
                                                              </div>
                                                              <span className='shrink-0 text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400'>
                                                                Detail →
                                                              </span>
                                                            </div>
                                                          )
                                                        )}
                                                      </div>
                                                    )}
                                                  </div>
                                                );
                                              }
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}

              {/* BRANCH: KOMPONEN HASIL (40%) */}
              {(selectedAreaFilter === 'all' ||
                selectedAreaFilter === 'hasil') && (
                <div className='ml-4 space-y-3 border-l-2 border-emerald-300 pl-4 dark:border-emerald-900'>
                  <div
                    onClick={() => toggleNode('komponen-hasil')}
                    className='group flex cursor-pointer items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 hover:bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20'
                  >
                    <div className='flex items-center gap-2.5'>
                      {expandedNodes['komponen-hasil'] ? (
                        <ChevronDown className='h-4 w-4 text-emerald-600' />
                      ) : (
                        <ChevronRight className='h-4 w-4 text-emerald-600' />
                      )}
                      <div>
                        <span className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                          II. Komponen Hasil (Bobot 40%)
                        </span>
                        <span className='ml-2 text-xs text-slate-500'>
                          ({pilarHasilData.length} Pilar Hasil)
                        </span>
                      </div>
                    </div>
                    <Badge
                      variant='outline'
                      className='border-emerald-300 text-xs text-emerald-600'
                    >
                      Dampak & Persepsi
                    </Badge>
                  </div>

                  {expandedNodes['komponen-hasil'] && (
                    <div className='space-y-2.5 pl-3'>
                      {pilarHasilData.map((ph, idx) => (
                        <div
                          key={ph.id_pilarHasil || idx}
                          className='rounded-xl border border-emerald-200/80 bg-white p-3.5 shadow-2xs dark:border-emerald-800 dark:bg-slate-900'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center gap-2'>
                              <span className='flex h-6 w-6 items-center justify-center rounded bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'>
                                {idx + 1}
                              </span>
                              <span className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                                {ph.nama_pilarHasil}
                              </span>
                            </div>
                            <Badge className='bg-emerald-600 text-xs text-white'>
                              Bobot: {ph.skor_pilarHasil} Poin
                            </Badge>
                          </div>
                          {ph.uraian_pilarHasil && (
                            <div className='mt-2.5 rounded-md bg-emerald-50/50 p-2 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                              <div className='mb-1 font-semibold text-emerald-800 dark:text-emerald-300'>
                                Indikator Penilaian Hasil:
                              </div>
                              <div className='whitespace-pre-line'>
                                {ph.uraian_pilarHasil}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* ============================================================================== */}
        {/* TAB 3: PANDUAN & MATRIKS 6 PILAR */}
        {/* ============================================================================== */}
        <TabsContent value='matriks' className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            <div className='mb-6'>
              <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100'>
                Matriks 6 Pilar Reformasi Birokrasi (Area Pemenuhan vs Area
                Reform)
              </h3>
              <p className='text-xs text-slate-500'>
                Perbandingan tujuan pokok dan fokus pemenuhan dokumen versus
                inovasi perbaikan berkelanjutan.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {/* Pilar 1 */}
              <div className='rounded-xl border border-purple-200 bg-purple-50/30 p-4 dark:border-purple-900 dark:bg-purple-950/20'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600 text-white'>
                    <Sparkles className='h-4 w-4' />
                  </span>
                  <div>
                    <span className='text-[10px] font-bold text-purple-600 uppercase dark:text-purple-400'>
                      Pilar 1
                    </span>
                    <h5 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Manajemen Perubahan
                    </h5>
                  </div>
                </div>
                <div className='mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400'>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Pemenuhan:{' '}
                    </span>
                    Pembentukan Tim Kerja ZI, Dokumen Rencana Kerja, Monev
                    berkala, dan Role Model pimpinan.
                  </div>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Reform:{' '}
                    </span>
                    Internalisasi Core Values ASN BerAKHLAK dan resistensi
                    perubahan yang menurun drastis.
                  </div>
                </div>
              </div>

              {/* Pilar 2 */}
              <div className='rounded-xl border border-blue-200 bg-blue-50/30 p-4 dark:border-blue-900 dark:bg-blue-950/20'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white'>
                    <FileText className='h-4 w-4' />
                  </span>
                  <div>
                    <span className='text-[10px] font-bold text-blue-600 uppercase dark:text-blue-400'>
                      Pilar 2
                    </span>
                    <h5 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Penataan Tatalaksana
                    </h5>
                  </div>
                </div>
                <div className='mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400'>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Pemenuhan:{' '}
                    </span>
                    Penyusunan & evaluasi SOP kegiatan utama, implementasi
                    e-Office, SPBE, dan portal PPID.
                  </div>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Reform:{' '}
                    </span>
                    Digitalisasi proses bisnis terintegrasi dan efisiensi waktu
                    penyelesaian tugas operasional.
                  </div>
                </div>
              </div>

              {/* Pilar 3 */}
              <div className='rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 dark:border-emerald-900 dark:bg-emerald-950/20'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white'>
                    <Users className='h-4 w-4' />
                  </span>
                  <div>
                    <span className='text-[10px] font-bold text-emerald-600 uppercase dark:text-emerald-400'>
                      Pilar 3
                    </span>
                    <h5 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Penataan Sistem Manajemen SDM
                    </h5>
                  </div>
                </div>
                <div className='mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400'>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Pemenuhan:{' '}
                    </span>
                    Peta jabatan, formasi ASN, analisis beban kerja (ABK), pola
                    mutasi, dan SKP pegawai.
                  </div>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Reform:{' '}
                    </span>
                    Pengembangan kompetensi berbasis gap analysis dan penegakan
                    reward & punishment.
                  </div>
                </div>
              </div>

              {/* Pilar 4 */}
              <div className='rounded-xl border border-amber-200 bg-amber-50/30 p-4 dark:border-amber-900 dark:bg-amber-950/20'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-600 text-white'>
                    <BarChart3 className='h-4 w-4' />
                  </span>
                  <div>
                    <span className='text-[10px] font-bold text-amber-600 uppercase dark:text-amber-400'>
                      Pilar 4
                    </span>
                    <h5 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Penguatan Akuntabilitas
                    </h5>
                  </div>
                </div>
                <div className='mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400'>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Pemenuhan:{' '}
                    </span>
                    Keterlibatan pimpinan dalam Perjanjian Kinerja (PK),
                    Renstra, dan pelaporan LAKIP/SAKIP.
                  </div>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Reform:{' '}
                    </span>
                    Peningkatan capaian indikator kinerja utama (IKU) dan
                    keterpaduan sistem informasi kinerja.
                  </div>
                </div>
              </div>

              {/* Pilar 5 */}
              <div className='rounded-xl border border-rose-200 bg-rose-50/30 p-4 dark:border-rose-900 dark:bg-rose-950/20'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-rose-600 text-white'>
                    <ShieldCheck className='h-4 w-4' />
                  </span>
                  <div>
                    <span className='text-[10px] font-bold text-rose-600 uppercase dark:text-rose-400'>
                      Pilar 5
                    </span>
                    <h5 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Penguatan Pengawasan
                    </h5>
                  </div>
                </div>
                <div className='mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400'>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Pemenuhan:{' '}
                    </span>
                    Unit Pengendalian Gratifikasi (UPG), SPIP, SP4N-LAPOR!,
                    Whistleblowing System (WBS).
                  </div>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Reform:{' '}
                    </span>
                    Nol toleransi korupsi, tindak lanjut 100% aduan masyarakat,
                    dan mitigasi risiko benturan kepentingan.
                  </div>
                </div>
              </div>

              {/* Pilar 6 */}
              <div className='rounded-xl border border-indigo-200 bg-indigo-50/30 p-4 dark:border-indigo-900 dark:bg-indigo-950/20'>
                <div className='flex items-center gap-2'>
                  <span className='flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white'>
                    <Award className='h-4 w-4' />
                  </span>
                  <div>
                    <span className='text-[10px] font-bold text-indigo-600 uppercase dark:text-indigo-400'>
                      Pilar 6
                    </span>
                    <h5 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Peningkatan Kualitas Pelayanan Publik
                    </h5>
                  </div>
                </div>
                <div className='mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-400'>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Pemenuhan:{' '}
                    </span>
                    Standar Pelayanan (SP), Maklumat Pelayanan, sarana prasarana
                    kelompok rentan/disabilitas.
                  </div>
                  <div>
                    <span className='font-semibold text-slate-800 dark:text-slate-200'>
                      Reform:{' '}
                    </span>
                    Inovasi pelayanan publik ramah digital dan survei indeks
                    kepuasan masyarakat (IKM) tinggi.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* ============================================================================== */}
      {/* 3. MODAL DETAIL PERTANYAAN / INDIKATOR */}
      {/* ============================================================================== */}
      <Dialog
        open={Boolean(selectedPertanyaanDetail)}
        onOpenChange={(open) => {
          if (!open) setSelectedPertanyaanDetail(null);
        }}
      >
        <DialogContent className='max-h-[85vh] max-w-2xl overflow-y-auto'>
          {selectedPertanyaanDetail && (
            <>
              <DialogHeader>
                <div className='mb-2 flex flex-wrap items-center gap-2'>
                  <Badge
                    variant='outline'
                    className='border-indigo-300 font-mono text-indigo-700 dark:text-indigo-300'
                  >
                    ID Indikator: #
                    {selectedPertanyaanDetail.pertanyaan.id_pertanyaan}
                  </Badge>
                  <Badge variant='secondary'>
                    Area {selectedPertanyaanDetail.areaNama}
                  </Badge>
                  <Badge variant='secondary'>
                    {selectedPertanyaanDetail.pilarNama}
                  </Badge>
                </div>
                <DialogTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                  {selectedPertanyaanDetail.subpilarNama}
                </DialogTitle>
                <DialogDescription className='text-xs text-slate-500'>
                  Rincian indikator pertanyaan evaluasi dan kriteria eviden
                  bukti dukung.
                </DialogDescription>
              </DialogHeader>

              {/* Deskripsi Pertanyaan */}
              <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900'>
                <div className='mb-1 text-xs font-semibold tracking-wider text-slate-500 uppercase'>
                  Pertanyaan / Indikator Evaluasi LKE:
                </div>
                <p className='text-sm leading-relaxed font-medium text-slate-900 dark:text-slate-100'>
                  {selectedPertanyaanDetail.pertanyaan.deskripsi_pertanyaan}
                </p>
              </div>

              {/* Bukti Dukung yang Dipersyaratkan */}
              <div className='space-y-2'>
                <div className='flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200'>
                  <FileText className='h-4 w-4 text-blue-600' />
                  Dokumen Bukti Dukung (Eviden) Wajib:
                </div>

                {selectedPertanyaanDetail.pertanyaan.uraian_buktidukung ? (
                  <div className='rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 dark:border-blue-900/50 dark:bg-blue-950/20'>
                    <ul className='space-y-1.5 text-xs text-slate-700 dark:text-slate-300'>
                      {parseEvidenceLines(
                        selectedPertanyaanDetail.pertanyaan.uraian_buktidukung
                      ).map((line, idx) => (
                        <li key={idx} className='flex items-start gap-2'>
                          <span className='mt-1 flex h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500' />
                          <span>{line}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className='text-xs text-slate-500 italic'>
                    Tidak ada keterangan khusus bukti dukung untuk pertanyaan
                    ini.
                  </p>
                )}
              </div>

              {/* Kategori Penilaian / Opsi Jawaban */}
              {selectedPertanyaanDetail.pertanyaan.kategoriPenilaian &&
                selectedPertanyaanDetail.pertanyaan.kategoriPenilaian.length >
                  0 && (
                  <div className='space-y-2'>
                    <div className='flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200'>
                      <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                      Kriteria & Bobot Penilaian Skor:
                    </div>

                    <div className='overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800'>
                      <table className='w-full text-left text-xs'>
                        <thead className='bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                          <tr>
                            <th className='px-3 py-2 font-semibold'>
                              Kriteria / Opsi Pilihan
                            </th>
                            <th className='w-24 px-3 py-2 text-right font-semibold'>
                              Nilai / Bobot
                            </th>
                          </tr>
                        </thead>
                        <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
                          {selectedPertanyaanDetail.pertanyaan.kategoriPenilaian.map(
                            (kat) => (
                              <tr
                                key={kat.id_kategori}
                                className='dark:hover:bg-slate-850 hover:bg-slate-50'
                              >
                                <td className='px-3 py-2 text-slate-800 dark:text-slate-200'>
                                  {kat.uraian_kategori}
                                </td>
                                <td className='px-3 py-2 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400'>
                                  {kat.nilai ?? 0}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
