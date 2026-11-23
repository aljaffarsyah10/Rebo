'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Building2,
  FolderTree,
  Compass,
  BookOpen,
  Milestone,
  FolderGit2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  Users,
  FileText,
  BarChart3,
  Award,
  FileSpreadsheet,
  Layers,
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import RBStructureGraph, {
  AreaItem,
  PilarHasilItem
} from '@/components/rebo/rb-structure-graph';

interface InformasiRBClientProps {
  areasData: AreaItem[];
  pilarHasilData: PilarHasilItem[];
  gdriveLink: string;
}

export default function InformasiRBClient({
  areasData,
  pilarHasilData,
  gdriveLink
}: InformasiRBClientProps) {
  const [activeMainTab, setActiveMainTab] = useState('struktur');

  // Compute metrics
  const totalSubpilar = areasData.reduce(
    (acc, a) =>
      acc +
      (a.pilar?.reduce((acc2, p) => acc2 + (p.subpilar?.length || 0), 0) || 0),
    0
  );
  const totalPertanyaan = areasData.reduce(
    (acc, a) =>
      acc +
      (a.pilar?.reduce(
        (acc2, p) =>
          acc2 +
          (p.subpilar?.reduce(
            (acc3, sp) => acc3 + (sp.pertanyaan?.length || 0),
            0
          ) || 0),
        0
      ) || 0),
    0
  );

  return (
    <div className='w-full space-y-8'>
      {/* ============================================================================== */}
      {/* 1. HERO / ABOUT CARD: PUSAT INFORMASI & PENJELASAN ZONA INTEGRITAS */}
      {/* ============================================================================== */}
      <div className='relative rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs md:p-8 dark:border-slate-800 dark:bg-slate-900/60'>
        <div className='flex flex-col gap-6 md:flex-row md:items-center md:justify-between'>
          <div className='max-w-3xl space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100/80 px-3.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'>
              <Building2 className='h-3.5 w-3.5 text-slate-500 dark:text-slate-400' />
              Pusat Informasi & Penjelasan Reformasi Birokrasi
            </div>

            <h1 className='text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
              Tentang & Panduan Zona Integritas (ZI)
            </h1>

            <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
              Halaman ini memuat penjelasan konseptual, landasan regulasi,
              struktur hierarki, dan instrumen penilaian Zona Integritas menuju
              predikat Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi
              Bersih dan Melayani (WBBM) di lingkungan BPS Kabupaten Kepulauan
              Siau Tagulandang Biaro.
            </p>

            {/* Quick Action Buttons */}
            <div className='flex flex-wrap items-center gap-2.5 pt-1'>
              <a
                href={gdriveLink}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-800 transition hover:bg-slate-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700'
              >
                <FolderGit2 className='h-3.5 w-3.5 text-slate-600 dark:text-slate-400' />
                <span>Folder GDrive Pedoman</span>
                <ExternalLink className='h-3 w-3 text-slate-400' />
              </a>

              <Link
                href='/rebo/arsip'
                className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800'
              >
                <FileSpreadsheet className='h-3.5 w-3.5 text-slate-500' />
                <span>Arsip Dokumen</span>
              </Link>

              <Link
                href='/rebo/formRB/area'
                className='inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50 dark:text-slate-300 dark:hover:bg-slate-800'
              >
                <FileCheck className='h-3.5 w-3.5 text-slate-500' />
                <span>Pengisian LKE</span>
              </Link>
            </div>
          </div>

          {/* Bobot Score Pill */}
          <div className='flex flex-col items-start gap-2 md:items-end'>
            <div className='rounded-xl border border-slate-200/90 bg-slate-50/80 p-4 text-left md:text-right dark:border-slate-800 dark:bg-slate-800/50'>
              <div className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Total Bobot Evaluasi ZI
              </div>
              <div className='mt-0.5 text-2xl font-bold text-slate-900 dark:text-slate-100'>
                100%
              </div>
              <div className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                Pengungkit{' '}
                <span className='font-semibold text-slate-700 dark:text-slate-300'>
                  60%
                </span>{' '}
                • Hasil{' '}
                <span className='font-semibold text-slate-700 dark:text-slate-300'>
                  40%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 6 High-Level System Metrics */}
        <div className='mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3 lg:grid-cols-6 dark:border-slate-800'>
          <div className='rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30'>
            <div className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
              Komponen Evaluasi
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              2
            </div>
            <div className='text-[10px] text-slate-500 dark:text-slate-400'>
              Pengungkit & Hasil
            </div>
          </div>

          <div className='rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30'>
            <div className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
              Area Pengungkit
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              2
            </div>
            <div className='text-[10px] text-slate-500 dark:text-slate-400'>
              Pemenuhan & Reform
            </div>
          </div>

          <div className='rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30'>
            <div className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
              Pilar Utama RB
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              6
            </div>
            <div className='text-[10px] text-slate-500 dark:text-slate-400'>
              Pilar 1 s/d Pilar 6
            </div>
          </div>

          <div className='rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30'>
            <div className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
              Sub-Pilar Kegiatan
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              {totalSubpilar || 42}
            </div>
            <div className='text-[10px] text-slate-500 dark:text-slate-400'>
              Kegiatan Pokok
            </div>
          </div>

          <div className='rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30'>
            <div className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
              Indikator LKE
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              {totalPertanyaan || 110}
            </div>
            <div className='text-[10px] text-slate-500 dark:text-slate-400'>
              Pertanyaan Evaluasi
            </div>
          </div>

          <div className='rounded-lg border border-slate-200/80 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-800/30'>
            <div className='text-[11px] font-medium text-slate-500 dark:text-slate-400'>
              Pilar Hasil
            </div>
            <div className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              {pilarHasilData.length || 2}
            </div>
            <div className='text-[10px] text-slate-500 dark:text-slate-400'>
              Survei & Dampak Kinerja
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. SISTEMATIS MASTER TABS */}
      {/* ============================================================================== */}
      <Tabs
        value={activeMainTab}
        onValueChange={setActiveMainTab}
        className='w-full'
      >
        {/* Navigation Bar */}
        <div className='sticky top-16 z-30 -mx-4 border-b border-slate-200/80 bg-white/80 px-4 py-2 backdrop-blur-md transition-all dark:border-slate-800 dark:bg-slate-900/80'>
          <TabsList className='grid h-12 w-full grid-cols-2 rounded-2xl bg-slate-100 p-1.5 md:grid-cols-5 dark:bg-slate-800/80'>
            <TabsTrigger
              value='struktur'
              className='flex items-center justify-center gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <FolderTree className='h-4 w-4' />
              <span>1. Struktur Hierarki RB</span>
            </TabsTrigger>

            <TabsTrigger
              value='pilar'
              className='flex items-center justify-center gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <Compass className='h-4 w-4' />
              <span>2. Enam (6) Pilar RB</span>
            </TabsTrigger>

            <TabsTrigger
              value='konsep'
              className='flex items-center justify-center gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <BookOpen className='h-4 w-4' />
              <span>3. Glosarium & Konsep ZI</span>
            </TabsTrigger>

            <TabsTrigger
              value='roadmap'
              className='flex items-center justify-center gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <Milestone className='h-4 w-4' />
              <span>4. Alur & Roadmap Evaluasi</span>
            </TabsTrigger>

            <TabsTrigger
              value='repositori'
              className='flex items-center justify-center gap-2 rounded-xl text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-900 dark:data-[state=active]:text-blue-400'
            >
              <FolderGit2 className='h-4 w-4' />
              <span>5. Pedoman & Repositori</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ============================================================================== */}
        {/* TAB 1: STRUKTUR & POHON HIERARKI RB */}
        {/* ============================================================================== */}
        <TabsContent value='struktur' className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            <div className='mb-6 flex flex-col gap-2 border-b pb-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800'>
              <div>
                <div className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                  <FolderTree className='h-3.5 w-3.5' /> Modul Visualisasi
                </div>
                <h2 className='mt-1 text-xl font-bold text-slate-900 dark:text-slate-100'>
                  Peta Arsitektur & Pohon Indikator Reformasi Birokrasi
                </h2>
                <p className='text-xs text-slate-500'>
                  Gunakan bagan interaktif di bawah ini untuk menelusuri dari
                  puncak ZI hingga ke tingkat sub-pilar, pertanyaan indikator,
                  dokumen bukti dukung, dan opsi pembobotan nilai.
                </p>
              </div>

              <div className='flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className='border-emerald-300 text-xs text-emerald-600'
                >
                  Live Database Connected
                </Badge>
              </div>
            </div>

            <RBStructureGraph
              areasData={areasData}
              pilarHasilData={pilarHasilData}
              showHero={false}
            />
          </div>
        </TabsContent>

        {/* ============================================================================== */}
        {/* TAB 2: ENAM (6) PILAR REFORMASI BIROKRASI */}
        {/* ============================================================================== */}
        <TabsContent value='pilar' className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            <div className='mb-6 border-b pb-4 dark:border-slate-800'>
              <div className='inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-bold text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'>
                <Compass className='h-3.5 w-3.5' /> Komponen Pengungkit (60%)
              </div>
              <h2 className='mt-1 text-xl font-bold text-slate-900 dark:text-slate-100'>
                Rincian 6 Pilar Utama Pembangunan Zona Integritas
              </h2>
              <p className='text-xs text-slate-500'>
                Setiap pilar dinilai pada dua aspek: Area Pemenuhan (kepatuhan
                regulasi dasar) dan Area Reform (kualitas implementasi & inovasi
                berkelanjutan).
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
              {/* Pilar 1: Manajemen Perubahan */}
              <div className='relative flex flex-col justify-between rounded-2xl border-2 border-purple-200 bg-gradient-to-b from-purple-50/50 via-white to-white p-5 shadow-xs transition hover:shadow-md dark:border-purple-900 dark:from-purple-950/20 dark:via-slate-900 dark:to-slate-900'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white shadow-xs'>
                      <Sparkles className='h-5 w-5' />
                    </span>
                    <Badge
                      variant='outline'
                      className='border-purple-300 text-xs font-bold text-purple-700 dark:text-purple-300'
                    >
                      Pilar 1
                    </Badge>
                  </div>

                  <div>
                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                      Manajemen Perubahan
                    </h3>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Mentransformasi sistem, mekanisme kerja, pola pikir
                      (mindset), dan budaya kerja individu ASN agar
                      berintegritas dan adaptif.
                    </p>
                  </div>

                  <div className='space-y-2 rounded-xl border border-purple-100 bg-purple-50/50 p-3 text-xs dark:border-purple-900/50 dark:bg-purple-950/30'>
                    <div>
                      <span className='font-bold text-purple-900 dark:text-purple-200'>
                        Fokus Pemenuhan:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        SK Tim Kerja, Rencana Pembangunan ZI, Monitoring
                        Evaluasi berkala, Role Model pimpinan.
                      </span>
                    </div>
                    <div>
                      <span className='font-bold text-purple-900 dark:text-purple-200'>
                        Fokus Reform:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Penerapan Core Values ASN BerAKHLAK dan resistensi
                        perubahan yang menurun nyata.
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800'>
                  <span className='text-[11px] text-slate-500'>
                    Sub-Pilar: 4 | Pertanyaan: 12
                  </span>
                  <Link
                    href='/rebo/formRB/1'
                    className='inline-flex items-center gap-1 text-xs font-bold text-purple-600 hover:text-purple-700 dark:text-purple-400'
                  >
                    Buka LKE <ChevronRight className='h-3.5 w-3.5' />
                  </Link>
                </div>
              </div>

              {/* Pilar 2: Penataan Tatalaksana */}
              <div className='relative flex flex-col justify-between rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/50 via-white to-white p-5 shadow-xs transition hover:shadow-md dark:border-blue-900 dark:from-blue-950/20 dark:via-slate-900 dark:to-slate-900'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs'>
                      <FileText className='h-5 w-5' />
                    </span>
                    <Badge
                      variant='outline'
                      className='border-blue-300 text-xs font-bold text-blue-700 dark:text-blue-300'
                    >
                      Pilar 2
                    </Badge>
                  </div>

                  <div>
                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                      Penataan Tatalaksana
                    </h3>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Meningkatkan efisiensi dan efektivitas sistem, proses
                      bisnis, dan prosedur kerja operasional berbasis digital
                      dan keterbukaan.
                    </p>
                  </div>

                  <div className='space-y-2 rounded-xl border border-blue-100 bg-blue-50/50 p-3 text-xs dark:border-blue-900/50 dark:bg-blue-950/30'>
                    <div>
                      <span className='font-bold text-blue-900 dark:text-blue-200'>
                        Fokus Pemenuhan:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Penyusunan SOP Kegiatan Utama, integrasi SPBE /
                        e-Office, dan keterbukaan portal PPID.
                      </span>
                    </div>
                    <div>
                      <span className='font-bold text-blue-900 dark:text-blue-200'>
                        Fokus Reform:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Digitalisasi layanan tanpa kertas, integrasi sistem, dan
                        efisiensi waktu layanan publik.
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800'>
                  <span className='text-[11px] text-slate-500'>
                    Sub-Pilar: 3 | Pertanyaan: 14
                  </span>
                  <Link
                    href='/rebo/formRB/2'
                    className='inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400'
                  >
                    Buka LKE <ChevronRight className='h-3.5 w-3.5' />
                  </Link>
                </div>
              </div>

              {/* Pilar 3: Penataan Sistem Manajemen SDM Aparatur */}
              <div className='relative flex flex-col justify-between rounded-2xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50/50 via-white to-white p-5 shadow-xs transition hover:shadow-md dark:border-emerald-900 dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs'>
                      <Users className='h-5 w-5' />
                    </span>
                    <Badge
                      variant='outline'
                      className='border-emerald-300 text-xs font-bold text-emerald-700 dark:text-emerald-300'
                    >
                      Pilar 3
                    </Badge>
                  </div>

                  <div>
                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                      Penataan Sistem Manajemen SDM
                    </h3>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Meningkatkan profesionalisme, kompetensi, disiplin,
                      akuntabilitas, dan transparansi pengelolaan aparatur sipil
                      negara.
                    </p>
                  </div>

                  <div className='space-y-2 rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 text-xs dark:border-emerald-900/50 dark:bg-emerald-950/30'>
                    <div>
                      <span className='font-bold text-emerald-900 dark:text-emerald-200'>
                        Fokus Pemenuhan:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Peta formasi pegawai, pola mutasi internal, penetapan
                        kinerja SKP, disiplin jam kerja.
                      </span>
                    </div>
                    <div>
                      <span className='font-bold text-emerald-900 dark:text-emerald-200'>
                        Fokus Reform:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Pengembangan kompetensi berbasis gap analysis, sistem
                        reward & punishment transparan.
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800'>
                  <span className='text-[11px] text-slate-500'>
                    Sub-Pilar: 6 | Pertanyaan: 28
                  </span>
                  <Link
                    href='/rebo/formRB/3'
                    className='inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                  >
                    Buka LKE <ChevronRight className='h-3.5 w-3.5' />
                  </Link>
                </div>
              </div>

              {/* Pilar 4: Penguatan Akuntabilitas */}
              <div className='relative flex flex-col justify-between rounded-2xl border-2 border-amber-200 bg-gradient-to-b from-amber-50/50 via-white to-white p-5 shadow-xs transition hover:shadow-md dark:border-amber-900 dark:from-amber-950/20 dark:via-slate-900 dark:to-slate-900'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-amber-600 text-white shadow-xs'>
                      <BarChart3 className='h-5 w-5' />
                    </span>
                    <Badge
                      variant='outline'
                      className='border-amber-300 text-xs font-bold text-amber-700 dark:text-amber-300'
                    >
                      Pilar 4
                    </Badge>
                  </div>

                  <div>
                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                      Penguatan Akuntabilitas Kinerja
                    </h3>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Meningkatkan kapasitas dan akuntabilitas kinerja instansi
                      pemerintah melalui komitmen pimpinan dan keterpaduan
                      pelaporan SAKIP.
                    </p>
                  </div>

                  <div className='space-y-2 rounded-xl border border-amber-100 bg-amber-50/50 p-3 text-xs dark:border-amber-900/50 dark:bg-amber-950/30'>
                    <div>
                      <span className='font-bold text-amber-900 dark:text-amber-200'>
                        Fokus Pemenuhan:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Keterlibatan pimpinan dalam penetapan Renstra & PK,
                        penyusunan LAKIP tepat waktu.
                      </span>
                    </div>
                    <div>
                      <span className='font-bold text-amber-900 dark:text-amber-200'>
                        Fokus Reform:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Pencapaian target Indikator Kinerja Utama (IKU) dan
                        tindak lanjut evaluasi akuntabilitas.
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800'>
                  <span className='text-[11px] text-slate-500'>
                    Sub-Pilar: 2 | Pertanyaan: 16
                  </span>
                  <Link
                    href='/rebo/formRB/4'
                    className='inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 dark:text-amber-400'
                  >
                    Buka LKE <ChevronRight className='h-3.5 w-3.5' />
                  </Link>
                </div>
              </div>

              {/* Pilar 5: Penguatan Pengawasan */}
              <div className='relative flex flex-col justify-between rounded-2xl border-2 border-rose-200 bg-gradient-to-b from-rose-50/50 via-white to-white p-5 shadow-xs transition hover:shadow-md dark:border-rose-900 dark:from-rose-950/20 dark:via-slate-900 dark:to-slate-900'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-rose-600 text-white shadow-xs'>
                      <ShieldCheck className='h-5 w-5' />
                    </span>
                    <Badge
                      variant='outline'
                      className='border-rose-300 text-xs font-bold text-rose-700 dark:text-rose-300'
                    >
                      Pilar 5
                    </Badge>
                  </div>

                  <div>
                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                      Penguatan Pengawasan
                    </h3>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Mewujudkan penyelenggaraan organisasi yang bersih, bebas
                      korupsi, kolusi, dan nepotisme melalui sistem pengawasan
                      internal yang tangguh.
                    </p>
                  </div>

                  <div className='space-y-2 rounded-xl border border-rose-100 bg-rose-50/50 p-3 text-xs dark:border-rose-900/50 dark:bg-rose-950/30'>
                    <div>
                      <span className='font-bold text-rose-900 dark:text-rose-200'>
                        Fokus Pemenuhan:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Unit Pengendalian Gratifikasi (UPG), penerapan SPIP,
                        saluran WBS, dan SP4N-LAPOR!.
                      </span>
                    </div>
                    <div>
                      <span className='font-bold text-rose-900 dark:text-rose-200'>
                        Fokus Reform:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Zero fraud/KKN, mitigasi benturan kepentingan, dan
                        penyelesaian 100% aduan masyarakat.
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800'>
                  <span className='text-[11px] text-slate-500'>
                    Sub-Pilar: 5 | Pertanyaan: 24
                  </span>
                  <Link
                    href='/rebo/formRB/5'
                    className='inline-flex items-center gap-1 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400'
                  >
                    Buka LKE <ChevronRight className='h-3.5 w-3.5' />
                  </Link>
                </div>
              </div>

              {/* Pilar 6: Peningkatan Kualitas Pelayanan Publik */}
              <div className='relative flex flex-col justify-between rounded-2xl border-2 border-indigo-200 bg-gradient-to-b from-indigo-50/50 via-white to-white p-5 shadow-xs transition hover:shadow-md dark:border-indigo-900 dark:from-indigo-950/20 dark:via-slate-900 dark:to-slate-900'>
                <div className='space-y-3'>
                  <div className='flex items-center justify-between'>
                    <span className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs'>
                      <Award className='h-5 w-5' />
                    </span>
                    <Badge
                      variant='outline'
                      className='border-indigo-300 text-xs font-bold text-indigo-700 dark:text-indigo-300'
                    >
                      Pilar 6
                    </Badge>
                  </div>

                  <div>
                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                      Kualitas Pelayanan Publik
                    </h3>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Meningkatkan kualitas dan inovasi pelayanan publik yang
                      cepat, mudah, terjangkau, aman, dan ramah kelompok rentan
                      / disabilitas.
                    </p>
                  </div>

                  <div className='space-y-2 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/30'>
                    <div>
                      <span className='font-bold text-indigo-900 dark:text-indigo-200'>
                        Fokus Pemenuhan:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Standar Pelayanan (SP), Maklumat Pelayanan, sarana
                        kelompok rentan, survei IKM.
                      </span>
                    </div>
                    <div>
                      <span className='font-bold text-indigo-900 dark:text-indigo-200'>
                        Fokus Reform:{' '}
                      </span>
                      <span className='text-slate-700 dark:text-slate-300'>
                        Inovasi PST (Pelayanan Statistik Terpadu) online, indeks
                        kepuasan sangat baik (A).
                      </span>
                    </div>
                  </div>
                </div>

                <div className='mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800'>
                  <span className='text-[11px] text-slate-500'>
                    Sub-Pilar: 5 | Pertanyaan: 16
                  </span>
                  <Link
                    href='/rebo/formRB/6'
                    className='inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400'
                  >
                    Buka LKE <ChevronRight className='h-3.5 w-3.5' />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================================== */}
        {/* TAB 3: GLOSARIUM & KONSEP ZONA INTEGRITAS */}
        {/* ============================================================================== */}
        <TabsContent value='konsep' className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            <div className='mb-6 border-b pb-4 dark:border-slate-800'>
              <div className='inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'>
                <BookOpen className='h-3.5 w-3.5' /> Istilah & Landasan Regulasi
              </div>
              <h2 className='mt-1 text-xl font-bold text-slate-900 dark:text-slate-100'>
                Glosarium Definisi & Konsep Pokok Pembangunan ZI
              </h2>
              <p className='text-xs text-slate-500'>
                Daftar istilah resmi dan tata kelola tim penilai sesuai
                Peraturan MenPAN-RB dan Buku Saku ZI BPS RI.
              </p>
            </div>

            <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
              {/* Grup 1: Predikat & Unit Kerja */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 border-b pb-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100'>
                  <Award className='h-4 w-4 text-emerald-600' />
                  <span>1. Predikat & Unit Kerja</span>
                </div>

                <div className='space-y-3'>
                  <div className='rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50'>
                    <div className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                      Zona Integritas (ZI)
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Sebutan bagi instansi pemerintah yang pimpinan dan
                      jajarannya berkomitmen mewujudkan WBK/WBBM melalui
                      pencegahan korupsi dan peningkatan pelayanan.
                    </p>
                  </div>

                  <div className='rounded-xl border border-emerald-200 bg-emerald-50/40 p-3.5 dark:border-emerald-900 dark:bg-emerald-950/20'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold text-emerald-900 dark:text-emerald-200'>
                        Wilayah Bebas dari Korupsi (WBK)
                      </span>
                      <Badge className='bg-emerald-600 text-[10px] text-white'>
                        Target Utama
                      </Badge>
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Predikat yang diberikan kepada unit kerja yang berhasil
                      melaksanakan reformasi birokrasi dengan baik, khususnya
                      dalam tata kelola bersih bebas KKN.
                    </p>
                  </div>

                  <div className='rounded-xl border border-purple-200 bg-purple-50/40 p-3.5 dark:border-purple-900 dark:bg-purple-950/20'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold text-purple-900 dark:text-purple-200'>
                        WBBM
                      </span>
                      <Badge className='bg-purple-600 text-[10px] text-white'>
                        Tingkat Lanjut
                      </Badge>
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      <strong>Wilayah Birokrasi Bersih dan Melayani</strong>:
                      predikat lanjutan untuk unit kerja yang telah WBK dan
                      konsisten meningkatkan kualitas pelayanan prima.
                    </p>
                  </div>

                  <div className='rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50'>
                    <div className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                      Satuan Kerja (Satker) & Unit Kerja
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Unit penyelenggara pelayanan; serendah-rendahnya unit
                      Eselon III untuk Satker dan Eselon II untuk Unit Kerja
                      mandiri.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grup 2: Tim Kerja & Tim Penilai */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 border-b pb-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100'>
                  <Users className='h-4 w-4 text-blue-600' />
                  <span>2. Tim Kerja & Penilai</span>
                </div>

                <div className='space-y-3'>
                  <div className='rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50'>
                    <div className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                      Tim Pembina & Tim PJK Evaluasi
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Biro Perencanaan BPS RI (Tim Pembinaan) dan Inspektorat
                      Wilayah III BPS (Tim Penanggung Jawab Kegiatan Evaluasi
                      ZI) yang memfasilitasi pendampingan satker.
                    </p>
                  </div>

                  <div className='rounded-xl border border-blue-200 bg-blue-50/40 p-3.5 dark:border-blue-900 dark:bg-blue-950/20'>
                    <div className='text-xs font-bold text-blue-900 dark:text-blue-200'>
                      Tim Penilai Internal (TPI)
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Tim internal Inspektorat Utama BPS yang bertugas melakukan
                      evaluasi faktual bukti dukung LKE dan merekomendasikan
                      satker layak usul WBK/WBBM.
                    </p>
                  </div>

                  <div className='rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5 dark:border-slate-800 dark:bg-slate-900/50'>
                    <div className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                      Tim Penilai Pendahuluan (TPP)
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Ditetapkan pada level BPS Provinsi untuk menyeleksi dan
                      menilai kesiapan awal BPS Kabupaten/Kota sebelum diajukan
                      ke TPI BPS RI.
                    </p>
                  </div>

                  <div className='rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5 dark:border-indigo-900 dark:bg-indigo-950/20'>
                    <div className='text-xs font-bold text-indigo-900 dark:text-indigo-200'>
                      Tim Penilai Nasional (TPN)
                    </div>
                    <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      Tim evaluasi nasional lintas kementerian yang dipimpin
                      KemenPAN-RB bersama KPK dan Ombudsman RI untuk menetapkan
                      predikat resmi.
                    </p>
                  </div>
                </div>
              </div>

              {/* Grup 3: Dua Komponen Evaluasi */}
              <div className='space-y-4'>
                <div className='flex items-center gap-2 border-b pb-2 text-sm font-bold text-slate-900 dark:border-slate-800 dark:text-slate-100'>
                  <Layers className='h-4 w-4 text-purple-600' />
                  <span>3. Dua Komponen Evaluasi</span>
                </div>

                <div className='space-y-3'>
                  <div className='rounded-xl border-2 border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/30'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold text-blue-900 dark:text-blue-200'>
                        Komponen Pengungkit
                      </span>
                      <Badge className='bg-blue-600 text-white'>
                        Bobot: 60%
                      </Badge>
                    </div>
                    <p className='mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300'>
                      Menilai proses tata kelola internal. Terdiri dari{' '}
                      <strong>Area Pemenuhan</strong> (kepatuhan administrasi,
                      regulasi & SOP dasar) dan <strong>Area Reform</strong>{' '}
                      (perubahan nyata, inovasi, dan efektivitas perbaikan
                      berkala).
                    </p>
                  </div>

                  <div className='rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30'>
                    <div className='flex items-center justify-between'>
                      <span className='text-xs font-bold text-emerald-900 dark:text-emerald-200'>
                        Komponen Hasil
                      </span>
                      <Badge className='bg-emerald-600 text-white'>
                        Bobot: 40%
                      </Badge>
                    </div>
                    <p className='mt-2 text-xs leading-relaxed text-slate-700 dark:text-slate-300'>
                      Menilai dampak nyata yang dirasakan pengguna layanan dan
                      masyarakat melalui survei eksternal persepsi anti korupsi
                      (SPK), survei kepuasan pelayanan publik (SPKP), dan
                      akuntabilitas kinerja.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================================== */}
        {/* TAB 4: ROADMAP & ALUR EVALUASI MENUJU WBK/WBBM */}
        {/* ============================================================================== */}
        <TabsContent value='roadmap' className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            <div className='mb-6 border-b pb-4 dark:border-slate-800'>
              <div className='inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'>
                <Milestone className='h-3.5 w-3.5' /> Siklus Berkelanjutan
              </div>
              <h2 className='mt-1 text-xl font-bold text-slate-900 dark:text-slate-100'>
                Roadmap 7 Tahapan Evaluasi Menuju Predikat WBK/WBBM
              </h2>
              <p className='text-xs text-slate-500'>
                Alur tahapan terencana mulai dari pencanangan komitmen bersama
                hingga desk evaluation nasional.
              </p>
            </div>

            <div className='relative space-y-8 pl-6 before:absolute before:top-2 before:bottom-2 before:left-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-600 before:via-purple-600 before:to-emerald-600'>
              {/* Step 1 */}
              <div className='relative flex items-start gap-4'>
                <span className='absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950'>
                  1
                </span>
                <div className='w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Pencanangan & Deklarasi Zona Integritas
                    </h4>
                    <Badge variant='outline' className='text-[10px]'>
                      Tahap Awal
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                    Penandatanganan Piagam Pencanangan Pembangunan ZI bersama
                    seluruh pegawai, disaksikan instansi vertikal
                    (KPK/Kejaksaan/Pemerintah Daerah) dan publikasi terbuka.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className='relative flex items-start gap-4'>
                <span className='absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950'>
                  2
                </span>
                <div className='w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Pembentukan Tim Kerja & Penetapan Role Model
                    </h4>
                    <Badge variant='outline' className='text-[10px]'>
                      Pengorganisasian
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                    Penerbitan Surat Keputusan (SK) Kepala BPS terkait susunan
                    Tim Pembangunan ZI (Koordinator & Operator 6 Pilar) serta
                    penetapan agen perubahan (Agent of Change).
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className='relative flex items-start gap-4'>
                <span className='absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950'>
                  3
                </span>
                <div className='w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Penyusunan Rencana Aksi & Target Capaian
                    </h4>
                    <Badge variant='outline' className='text-[10px]'>
                      Perencanaan
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                    Menyusun road map rencana aksi pembangunan ZI, kalender
                    kegiatan, matriks peran hasil, serta penetapan indikator
                    inovasi pelayanan statistik terpadu.
                  </p>
                </div>
              </div>

              {/* Step 4 */}
              <div className='relative flex items-start gap-4'>
                <span className='absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950'>
                  4
                </span>
                <div className='w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Implementasi & Pengumpulan Dokumen Eviden
                    </h4>
                    <Badge variant='outline' className='text-[10px]'>
                      Pelaksanaan
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                    Mengunggah seluruh dokumen bukti dukung fisik/digital
                    (notula rapat, SOP, dokumentasi foto/video, screenshot
                    sistem, laporan berkala) ke Google Drive & sistem REBO.
                  </p>
                </div>
              </div>

              {/* Step 5 */}
              <div className='relative flex items-start gap-4'>
                <span className='absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950'>
                  5
                </span>
                <div className='w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Penilaian Mandiri (ZIAPP / PMPRB) oleh Satker
                    </h4>
                    <Badge variant='outline' className='text-[10px]'>
                      Self-Assessment
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                    Operator dan koordinator pilar mengisi opsi skor LKE secara
                    objektif berdasarkan eviden nyata pada aplikasi REBO,
                    dilengkapi catatan tindak lanjut.
                  </p>
                </div>
              </div>

              {/* Step 6 */}
              <div className='relative flex items-start gap-4'>
                <span className='absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950'>
                  6
                </span>
                <div className='w-full rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-900/60'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Reviu & Evaluasi oleh TPI (Inspektorat Utama BPS)
                    </h4>
                    <Badge variant='outline' className='text-[10px]'>
                      Verifikasi Internal
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                    Tim Penilai Internal menguji kelayakan dokumen eviden,
                    melakukan wawancara/klarifikasi, memberikan rekomendasi
                    perbaikan, serta menentukan usulan satker WBK/WBBM ke level
                    nasional.
                  </p>
                </div>
              </div>

              {/* Step 7 */}
              <div className='relative flex items-start gap-4'>
                <span className='absolute -left-6 mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-950'>
                  7
                </span>
                <div className='w-full rounded-xl border-2 border-emerald-300 bg-emerald-50/50 p-4 dark:border-emerald-800 dark:bg-emerald-950/20'>
                  <div className='flex items-center justify-between'>
                    <h4 className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Desk Evaluation TPN & Penetapan Predikat WBK/WBBM
                    </h4>
                    <Badge className='bg-emerald-600 text-[10px] text-white'>
                      Hasil Akhir
                    </Badge>
                  </div>
                  <p className='mt-1 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                    Evaluasi lapangan & presentasi pimpinan satker di hadapan
                    Tim Penilai Nasional KemenPAN-RB, dilanjutkan pengumuman
                    resmi penganugerahan predikat nasional.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================================== */}
        {/* TAB 5: PEDOMAN & REPOSITORI DOKUMEN */}
        {/* ============================================================================== */}
        <TabsContent value='repositori' className='mt-6 space-y-6'>
          <div className='rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950'>
            <div className='mb-6 border-b pb-4 dark:border-slate-800'>
              <div className='inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                <FolderGit2 className='h-3.5 w-3.5' /> Pusat Unduhan & Regulasi
              </div>
              <h2 className='mt-1 text-xl font-bold text-slate-900 dark:text-slate-100'>
                Repositori Dokumen Acuan & Pedoman Teknis
              </h2>
              <p className='text-xs text-slate-500'>
                Akses dokumen regulasi MenPAN-RB, juknis BPS RI, dan folder
                penyimpanan cloud bukti dukung satker.
              </p>
            </div>

            {/* Google Drive Featured Card */}
            <div className='rounded-2xl border-2 border-blue-200 bg-gradient-to-r from-blue-50/80 via-white to-indigo-50/80 p-6 dark:border-blue-900 dark:from-blue-950/30 dark:via-slate-900 dark:to-slate-900'>
              <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                <div className='flex items-start gap-4'>
                  <span className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md'>
                    <FolderGit2 className='h-6 w-6' />
                  </span>
                  <div>
                    <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                      Google Drive Folder: Master Dokumen Pedoman ZI
                    </h3>
                    <p className='mt-1 max-w-xl text-xs text-slate-600 dark:text-slate-400'>
                      Folder penyimpanan cloud terpusat yang memuat seluruh buku
                      pedoman, lembar evaluasi, materi paparan, dan template
                      dokumen standar pembangunan Zona Integritas.
                    </p>
                  </div>
                </div>

                <a
                  href={gdriveLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-blue-700'
                >
                  <span>Buka Google Drive</span>
                  <ExternalLink className='h-3.5 w-3.5' />
                </a>
              </div>
            </div>

            {/* Quick Reference Regulatory Documents */}
            <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
              <div className='rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-blue-600' />
                  <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                    PermenPAN-RB No. 90/2021
                  </span>
                </div>
                <p className='mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                  Pedoman Pembangunan dan Evaluasi Zona Integritas Menuju
                  Wilayah Bebas dari Korupsi dan Wilayah Birokrasi Bersih dan
                  Melayani.
                </p>
              </div>

              <div className='rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50'>
                <div className='flex items-center gap-2'>
                  <FileText className='h-4 w-4 text-purple-600' />
                  <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                    Buku Saku PMPRB BPS RI
                  </span>
                </div>
                <p className='mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                  Panduan praktis dan petunjuk teknis pemenuhan eviden 6 pilar
                  pembangunan ZI di lingkungan Badan Pusat Statistik.
                </p>
              </div>

              <div className='rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-900/50'>
                <div className='flex items-center gap-2'>
                  <FileSpreadsheet className='h-4 w-4 text-emerald-600' />
                  <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                    Arsip Digital Internal
                  </span>
                </div>
                <p className='mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                  Koleksi SK Tim Kerja, Dokumen Rencana Aksi, SOP Inovasi, dan
                  Laporan Hasil Evaluasi (LHE) satker pada modul Arsip Digital.
                </p>
                <Link
                  href='/rebo/arsip'
                  className='mt-2 inline-flex items-center text-xs font-semibold text-emerald-600 hover:underline dark:text-emerald-400'
                >
                  Buka Modul Arsip →
                </Link>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
