'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Printer,
  ArrowLeft,
  CheckCircle2,
  FileSpreadsheet,
  ShieldCheck,
  Edit3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MonitoringDashboardData, PeriodeEvaluasi } from '@/types/rebo';
import { calculateWBKSimulation } from '@/lib/simulation/wbk-gap-analysis';

interface LkePdfExecutiveClientProps {
  data: MonitoringDashboardData;
  periodes: PeriodeEvaluasi[];
  selectedPeriodeId: string;
}

/**
 * Komponen Lambang BPS (Badan Pusat Statistik)
 */
function BpsLogo({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 100 100'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      {/* Bentuk Segitiga / Jajaran Genjang Khas BPS */}
      <polygon points='12,28 48,12 38,48 8,42' fill='#0266B3' />
      <polygon points='52,16 92,26 82,58 46,38' fill='#62A835' />
      <polygon points='26,58 76,46 88,86 42,76' fill='#EE7202' />
    </svg>
  );
}

/**
 * Komponen Lambang Garuda / Stempel Lembaga Pemerintah
 */
function OfficialEmblem({ className = 'h-16 w-16' }: { className?: string }) {
  return (
    <svg
      viewBox='0 0 100 100'
      className={className}
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <circle
        cx='50'
        cy='50'
        r='46'
        fill='#FFFDF5'
        stroke='#B8860B'
        strokeWidth='2'
      />
      <circle
        cx='50'
        cy='50'
        r='41'
        fill='none'
        stroke='#D4AF37'
        strokeWidth='1'
        strokeDasharray='3 2'
      />
      {/* Lambang Bintang Garuda */}
      <path
        d='M50 18 L55 33 L71 33 L58 43 L63 58 L50 49 L37 58 L42 43 L29 33 L45 33 Z'
        fill='#D4AF37'
        stroke='#996515'
        strokeWidth='1'
      />
      <circle
        cx='50'
        cy='66'
        r='9'
        fill='#B91C1C'
        stroke='#7F1D1D'
        strokeWidth='1'
      />
      <path d='M46 66 L50 62 L54 66 L50 70 Z' fill='#FEF08A' />
      <text
        x='50'
        y='84'
        textAnchor='middle'
        fontSize='6'
        fontWeight='bold'
        fill='#78350F'
        letterSpacing='0.5'
      >
        BPS SITARO
      </text>
    </svg>
  );
}

export default function LkePdfExecutiveClient({
  data,
  periodes,
  selectedPeriodeId
}: LkePdfExecutiveClientProps) {
  const router = useRouter();

  // Pejabat Pengesahan (dapat diedit inline jika dibutuhkan sebelum cetak)
  const [isEditingSignatures, setIsEditingSignatures] = useState(false);
  const [tempatTanggal, setTempatTanggal] = useState(() => {
    const today = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    return `Ondong, ${formatter.format(today)}`;
  });
  const [namaKetua, setNamaKetua] = useState('Ketua Tim Kerja Pembangunan ZI');
  const [nipKetua, setNipKetua] = useState('19880512 201012 1 002');
  const [namaKepala, setNamaKepala] = useState(
    'Kepala BPS Kab. Kepulauan Siau Tagulandang Biaro'
  );
  const [nipKepala, setNipKepala] = useState('19790315 200212 1 001');

  const { kpi, pilars, periode, simulation } = data;

  const resolvedSimulation =
    simulation || calculateWBKSimulation(pilars, kpi.totalSkorPilarHasil);

  // Komponen Pengungkit (60%)
  const bobotMaksPengungkit = kpi.totalNilaiMaksimal || 60;
  const skorMandiriPengungkit = kpi.totalNilaiMandiri || 0;
  const skorVerifikasiPengungkit = kpi.totalNilaiVerifikasi || 0;
  const persenCapaianPengungkit =
    bobotMaksPengungkit > 0
      ? Number(
          ((skorVerifikasiPengungkit / bobotMaksPengungkit) * 100).toFixed(2)
        )
      : 0;
  const gapPengungkit = Number(
    Math.max(0, bobotMaksPengungkit - skorVerifikasiPengungkit).toFixed(2)
  );

  // Komponen Hasil (40%)
  const bobotMaksHasil = 40.0;
  const skorMandiriHasil = kpi.totalSkorPilarHasil || 0;
  const skorVerifikasiHasil = kpi.totalSkorPilarHasil || 0;
  const persenCapaianHasil = Number(
    ((skorVerifikasiHasil / bobotMaksHasil) * 100).toFixed(2)
  );
  const gapHasil = Number(
    Math.max(0, bobotMaksHasil - skorVerifikasiHasil).toFixed(2)
  );

  // Total LKE (100%)
  const totalBobotMaks = bobotMaksPengungkit + bobotMaksHasil;
  const totalSkorMandiri = skorMandiriPengungkit + skorMandiriHasil;
  const totalSkorVerifikasi = skorVerifikasiPengungkit + skorVerifikasiHasil;
  const totalPersenCapaian =
    totalBobotMaks > 0
      ? Number(((totalSkorVerifikasi / totalBobotMaks) * 100).toFixed(2))
      : 0;
  const totalGap = Number(
    Math.max(0, totalBobotMaks - totalSkorVerifikasi).toFixed(2)
  );

  const handlePrint = () => {
    window.print();
  };

  const handlePeriodeChange = (newPid: string) => {
    router.push(`/rebo/monitoring/lke-pdf?periodeId=${newPid}`);
  };

  return (
    <div className='min-h-screen bg-slate-100 py-6 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:bg-white print:py-0 print:text-black dark:print:bg-white dark:print:text-black'>
      {/* Print CSS Injected Inline */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 10mm 12mm 12mm 12mm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background: #ffffff !important;
            color: #000000 !important;
          }
          header,
          footer,
          nav,
          aside,
          [data-sidebar],
          [data-sidebar-inset] > header,
          .no-print {
            display: none !important;
          }
          main,
          .sidebar-inset,
          [data-sidebar-inset] {
            margin: 0 !important;
            padding: 0 !important;
            border: none !important;
            background: #ffffff !important;
          }
          .print-sheet {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 auto !important;
            max-width: 100% !important;
            width: 100% !important;
          }
          .page-break-avoid {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        }
      `}</style>

      {/* Floating Action Bar (Hanya tampil di layar browser, tersembunyi saat dicetak) */}
      <div className='no-print container mx-auto mb-6 max-w-4xl px-4'>
        <div className='flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-md backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/95'>
          <div className='flex items-center gap-3'>
            <Link href='/rebo/monitoring'>
              <Button
                variant='outline'
                size='sm'
                className='h-9 gap-1.5 border-slate-300 shadow-xs dark:border-slate-700'
              >
                <ArrowLeft className='h-4 w-4' />
                Kembali ke Dashboard
              </Button>
            </Link>

            {periodes.length > 1 && (
              <div className='flex items-center gap-1.5'>
                <span className='text-xs font-semibold text-slate-500 dark:text-slate-400'>
                  Periode:
                </span>
                <select
                  value={selectedPeriodeId}
                  onChange={(e) => handlePeriodeChange(e.target.value)}
                  className='h-9 rounded-lg border border-slate-300 bg-white px-2.5 text-xs font-medium text-slate-800 shadow-xs outline-hidden focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
                >
                  {periodes.map((p) => (
                    <option key={p.id} value={p.id}>
                      Tahun {p.tahun} {p.is_active ? '(Aktif)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsEditingSignatures(!isEditingSignatures)}
              className='h-9 gap-1.5 border-slate-300 text-xs shadow-xs dark:border-slate-700'
            >
              <Edit3 className='h-3.5 w-3.5' />
              {isEditingSignatures ? 'Kunci Penandatangan' : 'Ubah Pejabat TTD'}
            </Button>

            <a
              href={`/api/export/lke${selectedPeriodeId ? `?periodeId=${selectedPeriodeId}` : ''}`}
              target='_blank'
              rel='noopener noreferrer'
            >
              <Button
                variant='outline'
                size='sm'
                className='h-9 gap-1.5 border-emerald-300 bg-emerald-50 text-xs font-medium text-emerald-800 shadow-xs hover:bg-emerald-100 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200'
              >
                <FileSpreadsheet className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                Export Excel (.xlsx)
              </Button>
            </a>

            <Button
              variant='default'
              size='sm'
              onClick={handlePrint}
              className='h-9 gap-1.5 bg-blue-700 text-xs font-semibold text-white shadow-md hover:bg-blue-800'
            >
              <Printer className='h-3.5 w-3.5' />
              Cetak / Simpan PDF
            </Button>
          </div>
        </div>

        {/* Petunjuk Pengguna Singkat */}
        <div className='mt-2 text-center text-xs text-slate-500 dark:text-slate-400'>
          💡 Tip Cetak: Pada dialog browser, gunakan orientasi{' '}
          <strong>Portrait</strong> dan pastikan opsi{' '}
          <strong>&quot;Background graphics&quot;</strong> dicentang untuk hasil
          warna &amp; kop surat terbaik.
        </div>
      </div>

      {/* Lembar Dokumen Resmi Kertas A4 (Print Sheet) */}
      <div className='print-sheet container mx-auto max-w-4xl rounded-2xl border border-slate-200/90 bg-white p-8 text-black shadow-xl sm:p-12 dark:border-slate-800 dark:bg-white dark:text-black print:max-w-full print:rounded-none print:border-none print:p-0 print:shadow-none'>
        {/* ============================================================ */}
        {/* 1. KOP SURAT RESMI BPS KABUPATEN KEPULAUAN SITARO           */}
        {/* ============================================================ */}
        <div className='flex items-center justify-between gap-4 pb-3'>
          {/* Logo BPS Kiri */}
          <div className='flex h-20 w-20 shrink-0 items-center justify-center'>
            <BpsLogo className='h-18 w-18' />
          </div>

          {/* Teks Identitas Lembaga */}
          <div className='flex-1 text-center'>
            <h3 className='text-xs font-bold tracking-wider text-slate-800 uppercase'>
              REPUBLIK INDONESIA
            </h3>
            <h1 className='text-xl font-black tracking-tight text-slate-900 uppercase sm:text-2xl'>
              BADAN PUSAT STATISTIK
            </h1>
            <h2 className='text-sm font-bold tracking-wide text-blue-900 uppercase sm:text-base'>
              KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO
            </h2>
            <p className='mt-0.5 text-[11px] leading-tight text-slate-600'>
              Jl. Lokongbanua, Kelurahan Ondong, Kec. Siau Barat, Kab. Kepulauan
              Siau Tagulandang Biaro, Sulut 95861
            </p>
            <p className='text-[10px] leading-tight text-slate-500'>
              Telepon: (0432) 2011000 | Pos-el: bps7108@bps.go.id | Laman Resmi:{' '}
              <span className='font-semibold text-blue-800'>
                sitarokab.bps.go.id
              </span>
            </p>
          </div>

          {/* Lambang ZI / Garuda Kanan */}
          <div className='flex h-20 w-20 shrink-0 items-center justify-center'>
            <OfficialEmblem className='h-18 w-18' />
          </div>
        </div>

        {/* Garis Pembatas Ganda Khas Surat Dinas */}
        <div className='mb-6 border-t-[3px] border-b-2 border-black pt-[2px]' />

        {/* ============================================================ */}
        {/* 2. JUDUL DOKUMEN & STANDAR PERMENPAN-RB                     */}
        {/* ============================================================ */}
        <div className='space-y-1 text-center'>
          <h2 className='text-base font-black tracking-wide text-slate-900 uppercase sm:text-lg'>
            LEMBAR KERJA EVALUASI (LKE) ZONA INTEGRITAS
          </h2>
          <h3 className='text-xs font-bold tracking-wider text-slate-800 uppercase sm:text-sm'>
            RINGKASAN EKSEKUTIF CAPAIAN KOMPONEN PENGUNGKIT &amp; HASIL
          </h3>
          <p className='text-xs font-semibold text-slate-700'>
            Menuju Wilayah Bebas dari Korupsi (WBK) / Wilayah Birokrasi Bersih
            dan Melayani (WBBM)
          </p>
          <div className='flex items-center justify-center gap-2 pt-1'>
            <span className='rounded-sm bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-900'>
              Standar PermenPAN-RB No. 90 Tahun 2021
            </span>
            <span className='rounded-sm bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-800'>
              Tahun Evaluasi: {periode?.tahun || '2026'}
            </span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 3. METADATA SATUAN KERJA                                    */}
        {/* ============================================================ */}
        <div className='mt-6 rounded-lg border border-slate-300 bg-slate-50/70 p-3.5 text-xs text-slate-800'>
          <div className='grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-4'>
            <div>
              <span className='block text-[10px] font-medium text-slate-500 uppercase'>
                Satuan Kerja
              </span>
              <span className='font-bold text-slate-900'>
                BPS Sitaro (7108)
              </span>
            </div>
            <div>
              <span className='block text-[10px] font-medium text-slate-500 uppercase'>
                Nama Periode
              </span>
              <span className='font-semibold text-slate-900'>
                {periode?.nama_periode || 'Evaluasi PMPRB 2026'}
              </span>
            </div>
            <div>
              <span className='block text-[10px] font-medium text-slate-500 uppercase'>
                Tanggal Dokumen
              </span>
              <span className='font-semibold text-slate-900'>
                {tempatTanggal}
              </span>
            </div>
            <div>
              <span className='block text-[10px] font-medium text-slate-500 uppercase'>
                Klasifikasi
              </span>
              <span className='inline-flex items-center font-bold text-emerald-800'>
                <ShieldCheck className='mr-1 h-3.5 w-3.5 text-emerald-700' />
                Dokumen Resmi LKE
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. STATUS KELAYAKAN PREDIKAT (SIMULASI WBK/WBBM)            */}
        {/* ============================================================ */}
        <div className='page-break-avoid mt-5 rounded-lg border-2 border-blue-900/40 bg-gradient-to-r from-blue-50/80 via-white to-blue-50/50 p-4'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <span className='text-[11px] font-bold text-slate-600 uppercase'>
                  Status Kelayakan Predikat ZI:
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 text-xs font-black tracking-wide uppercase ${
                    resolvedSimulation.status === 'MEMENUHI_WBBM'
                      ? 'border border-purple-300 bg-purple-100 text-purple-900'
                      : resolvedSimulation.status === 'MEMENUHI_WBK'
                        ? 'border border-emerald-300 bg-emerald-100 text-emerald-900'
                        : resolvedSimulation.status ===
                            'POTENSI_WBK_BUTUH_VERIFIKASI'
                          ? 'border border-blue-300 bg-blue-100 text-blue-900'
                          : 'border border-amber-300 bg-amber-100 text-amber-900'
                  }`}
                >
                  {resolvedSimulation.statusLabel}
                </span>
              </div>
              <p className='text-xs text-slate-700'>
                {resolvedSimulation.statusDescription}
              </p>
            </div>

            <div className='flex items-center gap-4 divide-x divide-slate-300 text-right sm:text-center'>
              <div className='px-2'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Skor Verifikasi
                </div>
                <div className='text-xl font-black text-blue-950'>
                  {totalSkorVerifikasi.toFixed(2)}
                  <span className='text-xs font-normal text-slate-600'>
                    / 100
                  </span>
                </div>
              </div>
              <div className='pl-3'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Ambang Minimal WBK
                </div>
                <div className='text-base font-bold text-slate-800'>
                  75.00{' '}
                  <span className='text-[11px] font-medium text-emerald-700'>
                    {totalSkorVerifikasi >= 75.0 ? '(Tercapai)' : '(Belum)'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. TABEL RINGKASAN NILAI LKE (6 PILAR + KOMPONEN HASIL)      */}
        {/* ============================================================ */}
        <div className='page-break-avoid mt-5 space-y-2'>
          <div className='flex items-center justify-between'>
            <h4 className='text-xs font-bold tracking-wide text-slate-900 uppercase'>
              A. Rekapitulasi Komponen Pengungkit (60%) &amp; Hasil (40%)
            </h4>
            <span className='text-[11px] text-slate-500'>
              Satuan Skor: Poin Absolut
            </span>
          </div>

          <div className='overflow-hidden rounded-md border border-slate-400'>
            <table className='w-full border-collapse text-left text-xs'>
              <thead>
                <tr className='border-b border-slate-400 bg-slate-800 text-[11px] font-bold text-white uppercase'>
                  <th className='w-8 px-2 py-2 text-center'>No</th>
                  <th className='px-3 py-2'>Komponen / Area Perubahan</th>
                  <th className='w-20 px-2 py-2 text-center'>Bobot Maks</th>
                  <th className='w-20 px-2 py-2 text-center'>Skor Mandiri</th>
                  <th className='w-22 px-2 py-2 text-center'>
                    Skor Verifikasi
                  </th>
                  <th className='w-20 px-2 py-2 text-center'>% Capaian</th>
                  <th className='w-18 px-2 py-2 text-center'>Gap Skor</th>
                  <th className='w-24 px-2 py-2 text-center'>Dokumen Bukti</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-300 text-slate-900'>
                {/* Header Komponen Pengungkit */}
                <tr className='bg-slate-200/90 font-bold text-slate-900'>
                  <td className='px-2 py-1.5 text-center'>I</td>
                  <td colSpan={7} className='px-3 py-1.5 uppercase'>
                    KOMPONEN PENGUNGKIT (BOBOT 60%)
                  </td>
                </tr>

                {/* 6 Pilar Pengungkit */}
                {pilars.map((pilar, idx) => {
                  const persen =
                    pilar.nilaiMaksimal > 0
                      ? Number(
                          (
                            (pilar.nilaiVerifikasi / pilar.nilaiMaksimal) *
                            100
                          ).toFixed(1)
                        )
                      : 0;
                  const gap = Number(
                    Math.max(
                      0,
                      pilar.nilaiMaksimal - pilar.nilaiVerifikasi
                    ).toFixed(2)
                  );

                  return (
                    <tr
                      key={pilar.id_pilar}
                      className={idx % 2 === 1 ? 'bg-slate-50' : 'bg-white'}
                    >
                      <td className='px-2 py-1.5 text-center font-medium text-slate-600'>
                        {idx + 1}
                      </td>
                      <td className='px-3 py-1.5'>
                        <div className='font-semibold text-slate-900'>
                          {pilar.nama_pilar}
                        </div>
                        <div className='text-[10px] text-slate-500'>
                          {pilar.area} ({pilar.totalPertanyaan} Indikator)
                        </div>
                      </td>
                      <td className='px-2 py-1.5 text-center font-medium'>
                        {pilar.nilaiMaksimal.toFixed(2)}
                      </td>
                      <td className='px-2 py-1.5 text-center font-medium text-slate-700'>
                        {pilar.nilaiMandiri.toFixed(2)}
                      </td>
                      <td className='px-2 py-1.5 text-center font-bold text-blue-900'>
                        {pilar.nilaiVerifikasi.toFixed(2)}
                      </td>
                      <td className='px-2 py-1.5 text-center font-semibold'>
                        <span
                          className={
                            persen >= 80
                              ? 'text-emerald-700'
                              : persen >= 60
                                ? 'text-amber-700'
                                : 'text-rose-700'
                          }
                        >
                          {persen}%
                        </span>
                      </td>
                      <td className='px-2 py-1.5 text-center font-medium text-slate-600'>
                        {gap > 0 ? gap.toFixed(2) : '-'}
                      </td>
                      <td className='px-2 py-1.5 text-center text-[10px] font-medium text-slate-700'>
                        {pilar.disetujui}/{pilar.totalPertanyaan} (
                        {pilar.persentaseSelesai}%)
                      </td>
                    </tr>
                  );
                })}

                {/* Subtotal Komponen Pengungkit */}
                <tr className='border-t-2 border-slate-400 bg-blue-50/70 font-bold text-slate-900'>
                  <td className='px-2 py-2 text-center'>-</td>
                  <td className='px-3 py-2'>Subtotal Komponen Pengungkit</td>
                  <td className='px-2 py-2 text-center'>
                    {bobotMaksPengungkit.toFixed(2)}
                  </td>
                  <td className='px-2 py-2 text-center'>
                    {skorMandiriPengungkit.toFixed(2)}
                  </td>
                  <td className='px-2 py-2 text-center text-blue-900'>
                    {skorVerifikasiPengungkit.toFixed(2)}
                  </td>
                  <td className='px-2 py-2 text-center text-blue-900'>
                    {persenCapaianPengungkit}%
                  </td>
                  <td className='px-2 py-2 text-center text-slate-700'>
                    {gapPengungkit.toFixed(2)}
                  </td>
                  <td className='px-2 py-2 text-center text-[10px]'>
                    {kpi.totalSelesai}/{kpi.totalPertanyaan} (
                    {kpi.persentaseKelengkapan}%)
                  </td>
                </tr>

                {/* Header Komponen Hasil */}
                <tr className='bg-slate-200/90 font-bold text-slate-900'>
                  <td className='px-2 py-1.5 text-center'>II</td>
                  <td colSpan={7} className='px-3 py-1.5 uppercase'>
                    KOMPONEN HASIL (BOBOT 40%)
                  </td>
                </tr>

                <tr className='bg-white'>
                  <td className='px-2 py-1.5 text-center font-medium text-slate-600'>
                    1
                  </td>
                  <td className='px-3 py-1.5'>
                    <div className='font-semibold text-slate-900'>
                      Aspek Hasil Pelayanan Publik &amp; Integritas Organisasi
                    </div>
                    <div className='text-[10px] text-slate-500'>
                      Hasil Survei Persepsi Korupsi (IPAK) &amp; Kepuasan
                      Masyarakat (IKM)
                    </div>
                  </td>
                  <td className='px-2 py-1.5 text-center font-medium'>
                    {bobotMaksHasil.toFixed(2)}
                  </td>
                  <td className='px-2 py-1.5 text-center font-medium text-slate-700'>
                    {skorMandiriHasil.toFixed(2)}
                  </td>
                  <td className='px-2 py-1.5 text-center font-bold text-blue-900'>
                    {skorVerifikasiHasil.toFixed(2)}
                  </td>
                  <td className='px-2 py-1.5 text-center font-semibold text-slate-800'>
                    {persenCapaianHasil}%
                  </td>
                  <td className='px-2 py-1.5 text-center font-medium text-slate-600'>
                    {gapHasil > 0 ? gapHasil.toFixed(2) : '-'}
                  </td>
                  <td className='px-2 py-1.5 text-center text-[10px] font-medium text-slate-700'>
                    Terintegrasi
                  </td>
                </tr>

                {/* TOTAL NILAI AKHIR LKE */}
                <tr className='border-t-2 border-slate-600 bg-slate-900 font-black text-white'>
                  <td className='px-2 py-2.5 text-center'>#</td>
                  <td className='px-3 py-2.5 tracking-wide uppercase'>
                    TOTAL NILAI AKHIR LKE ZONA INTEGRITAS
                  </td>
                  <td className='px-2 py-2.5 text-center'>
                    {totalBobotMaks.toFixed(2)}
                  </td>
                  <td className='px-2 py-2.5 text-center text-slate-200'>
                    {totalSkorMandiri.toFixed(2)}
                  </td>
                  <td className='px-2 py-2.5 text-center text-emerald-300'>
                    {totalSkorVerifikasi.toFixed(2)}
                  </td>
                  <td className='px-2 py-2.5 text-center text-emerald-300'>
                    {totalPersenCapaian}%
                  </td>
                  <td className='px-2 py-2.5 text-center text-slate-300'>
                    {totalGap.toFixed(2)}
                  </td>
                  <td className='px-2 py-2.5 text-center text-[10px] text-slate-200'>
                    {kpi.persentaseKelengkapan}% Lengkap
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 6. STATUS DISTRIBUSI KELENGKAPAN BUKTI DUKUNG                */}
        {/* ============================================================ */}
        <div className='page-break-avoid mt-5 space-y-1.5'>
          <h4 className='text-xs font-bold tracking-wide text-slate-900 uppercase'>
            B. Distribusi Status Dokumen Bukti Dukung (Total:{' '}
            {kpi.totalPertanyaan} Indikator)
          </h4>
          <div className='grid grid-cols-4 gap-2 text-center text-xs'>
            <div className='rounded-md border border-emerald-300 bg-emerald-50/70 p-2'>
              <div className='text-[10px] font-bold text-emerald-800 uppercase'>
                Disetujui (Selesai)
              </div>
              <div className='text-lg font-black text-emerald-900'>
                {kpi.totalSelesai}
              </div>
              <div className='text-[10px] font-semibold text-emerald-700'>
                {kpi.persentaseKelengkapan}% dari total
              </div>
            </div>

            <div className='rounded-md border border-amber-300 bg-amber-50/70 p-2'>
              <div className='text-[10px] font-bold text-amber-800 uppercase'>
                Menunggu Review
              </div>
              <div className='text-lg font-black text-amber-900'>
                {kpi.totalMenungguReview}
              </div>
              <div className='text-[10px] font-semibold text-amber-700'>
                {kpi.totalPertanyaan > 0
                  ? Math.round(
                      (kpi.totalMenungguReview / kpi.totalPertanyaan) * 100
                    )
                  : 0}
                % dari total
              </div>
            </div>

            <div className='rounded-md border border-rose-300 bg-rose-50/70 p-2'>
              <div className='text-[10px] font-bold text-rose-800 uppercase'>
                Perlu Revisi
              </div>
              <div className='text-lg font-black text-rose-900'>
                {kpi.totalRevisi}
              </div>
              <div className='text-[10px] font-semibold text-rose-700'>
                Tindak Lanjut Segera
              </div>
            </div>

            <div className='rounded-md border border-slate-300 bg-slate-100/70 p-2'>
              <div className='text-[10px] font-bold text-slate-700 uppercase'>
                Belum Diisi
              </div>
              <div className='text-lg font-black text-slate-800'>
                {kpi.totalBelumDiisi}
              </div>
              <div className='text-[10px] font-semibold text-slate-600'>
                Belum Terunggah
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 7. KOLOM PENGESAHAN FORMAL PEJABAT BPS SITARO                */}
        {/* ============================================================ */}
        <div className='page-break-avoid mt-8 pt-4'>
          <div className='mb-2 text-right text-xs font-semibold text-slate-800'>
            {isEditingSignatures ? (
              <div className='flex items-center justify-end gap-2'>
                <span className='text-[11px] text-slate-500'>
                  Tempat &amp; Tanggal:
                </span>
                <input
                  type='text'
                  value={tempatTanggal}
                  onChange={(e) => setTempatTanggal(e.target.value)}
                  className='h-7 rounded border border-slate-300 px-2 text-xs font-semibold'
                />
              </div>
            ) : (
              <span>Ditetapkan di: {tempatTanggal}</span>
            )}
          </div>

          <div className='grid grid-cols-2 gap-8 text-center text-xs'>
            {/* Kolom Kiri: Ketua Tim Kerja ZI */}
            <div className='flex flex-col justify-between rounded-lg border border-slate-200/80 bg-slate-50/40 p-4'>
              <div>
                <p className='text-[11px] font-medium text-slate-600'>
                  Diajukan Oleh,
                </p>
                <p className='font-bold text-slate-900'>
                  Ketua Tim Kerja Pembangunan ZI
                </p>
                <p className='text-[10px] text-slate-600'>
                  BPS Kab. Kepulauan Siau Tagulandang Biaro
                </p>
              </div>

              {/* Ruang Tanda Tangan / QR E-Sign */}
              <div className='my-6 flex flex-col items-center justify-center'>
                <div className='flex h-20 w-36 items-center justify-center rounded-md border border-dashed border-blue-300 bg-blue-50/50 p-2 text-center text-[10px] font-medium text-blue-800'>
                  <div>
                    <CheckCircle2 className='mx-auto mb-1 h-5 w-5 text-blue-600' />
                    <span>Tervalidasi Digital</span>
                    <span className='block text-[9px] text-slate-500'>
                      REBO V2 System
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {isEditingSignatures ? (
                  <div className='space-y-1'>
                    <input
                      type='text'
                      value={namaKetua}
                      onChange={(e) => setNamaKetua(e.target.value)}
                      placeholder='Nama Ketua Tim ZI'
                      className='w-full rounded border border-slate-300 px-2 py-1 text-center text-xs font-bold'
                    />
                    <input
                      type='text'
                      value={nipKetua}
                      onChange={(e) => setNipKetua(e.target.value)}
                      placeholder='NIP Ketua'
                      className='w-full rounded border border-slate-300 px-2 py-0.5 text-center text-[10px]'
                    />
                  </div>
                ) : (
                  <>
                    <p className='font-bold text-slate-900 underline decoration-slate-400 underline-offset-4'>
                      {namaKetua}
                    </p>
                    <p className='text-[11px] text-slate-600'>
                      NIP. {nipKetua}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Kolom Kanan: Kepala BPS Kab. Kepulauan Sitaro */}
            <div className='flex flex-col justify-between rounded-lg border border-slate-200/80 bg-slate-50/40 p-4'>
              <div>
                <p className='text-[11px] font-medium text-slate-600'>
                  Mengetahui / Mengesahkan,
                </p>
                <p className='font-bold text-slate-900'>
                  Kepala Badan Pusat Statistik
                </p>
                <p className='text-[10px] text-slate-600'>
                  Kabupaten Kepulauan Siau Tagulandang Biaro
                </p>
              </div>

              {/* Ruang Tanda Tangan / Stempel Resmi */}
              <div className='my-6 flex flex-col items-center justify-center'>
                <div className='flex h-20 w-36 items-center justify-center rounded-md border border-dashed border-emerald-300 bg-emerald-50/50 p-2 text-center text-[10px] font-medium text-emerald-800'>
                  <div>
                    <ShieldCheck className='mx-auto mb-1 h-5 w-5 text-emerald-600' />
                    <span>Disahkan Secara Resmi</span>
                    <span className='block text-[9px] text-slate-500'>
                      BPS Kab. Kepulauan Sitaro
                    </span>
                  </div>
                </div>
              </div>

              <div>
                {isEditingSignatures ? (
                  <div className='space-y-1'>
                    <input
                      type='text'
                      value={namaKepala}
                      onChange={(e) => setNamaKepala(e.target.value)}
                      placeholder='Nama Kepala BPS'
                      className='w-full rounded border border-slate-300 px-2 py-1 text-center text-xs font-bold'
                    />
                    <input
                      type='text'
                      value={nipKepala}
                      onChange={(e) => setNipKepala(e.target.value)}
                      placeholder='NIP Kepala'
                      className='w-full rounded border border-slate-300 px-2 py-0.5 text-center text-[10px]'
                    />
                  </div>
                ) : (
                  <>
                    <p className='font-bold text-slate-900 underline decoration-slate-400 underline-offset-4'>
                      {namaKepala}
                    </p>
                    <p className='text-[11px] text-slate-600'>
                      NIP. {nipKepala}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 8. CATATAN KAKI DOKUMEN RESMI                                */}
        {/* ============================================================ */}
        <div className='page-break-avoid mt-8 border-t border-slate-300 pt-3 text-[10px] text-slate-500'>
          <div className='flex flex-wrap items-center justify-between gap-2'>
            <span>
              Dokumen resmi dicetak secara otomatis dari Sistem Aplikasi REBO V2
              (BPS Kab. Kepulauan Siau Tagulandang Biaro).
            </span>
            <span className='font-mono'>
              Status Evaluasi: PMPRB-LKE-7108-{periode?.tahun || '2026'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
