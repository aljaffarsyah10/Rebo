'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  Trees,
  FileText,
  Banknote,
  Droplets,
  Leaf,
  Award,
  Printer,
  ShieldCheck,
  Ship,
  Info,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  TrendingDown,
  Building2,
  QrCode,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import {
  PaperlessImpactStats,
  calculatePaperlessImpact,
  PAPERLESS_CONSTANTS,
  DEFAULT_PILAR_DOCUMENTS_COUNT
} from '@/lib/paperless/paperless-types';

interface PaperlessImpactClientProps {
  initialStats: PaperlessImpactStats;
  initialSource?: 'database' | 'benchmark';
}

export function PaperlessImpactClient({
  initialStats,
  initialSource = 'benchmark'
}: PaperlessImpactClientProps) {
  const [stats, setStats] = useState<PaperlessImpactStats>(initialStats);
  const [isPending, startTransition] = useTransition();
  const [isSimulating, setIsSimulating] = useState(false);
  const [multiplier, setMultiplier] = useState(1);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [isCertDialogOpen, setIsCertDialogOpen] = useState(false);

  // Formatter currency Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  // Dataset Bar Chart Kontribusi Lembar per Pilar
  const barChartData = useMemo(() => {
    return Object.entries(stats.breakdown_per_pilar).map(([key, item]) => ({
      name: `Pilar ${item.pilar_id}`,
      fullName: item.pilar_nama,
      lembar: item.lembar,
      rim: item.rim,
      dokumen: item.dokumen,
      biaya: item.total_biaya_rp,
      pohon: item.pohon
    }));
  }, [stats]);

  // Dataset Pie/Donut Chart Komposisi Penghematan Anggaran
  const pieChartData = useMemo(() => {
    return [
      {
        name: 'Kertas Fisik',
        value: stats.biaya_kertas_dihemat_rp,
        color: '#10b981',
        desc: `${stats.estimasi_rim_kertas} Rim Kertas HVS 80gr`
      },
      {
        name: 'Tinta & Toner Cetak',
        value: stats.biaya_tinta_toner_rp,
        color: '#06b6d4',
        desc: `${formatNumber(stats.estimasi_lembar_dihemat)} Lembar Cetak`
      },
      {
        name: 'Logistik Kapal Cepat Antar-Pulau',
        value: stats.biaya_logistik_antar_pulau_rp,
        color: '#3b82f6',
        desc: 'Ekspedisi Siau - Tagulandang - Biaro'
      }
    ];
  }, [stats]);

  // Handler simulasi penyesuaian berkas
  const handleMultiplierChange = (newMultiplier: number) => {
    setMultiplier(newMultiplier);
    startTransition(() => {
      const customCounts: Record<number, number> = {};
      Object.keys(DEFAULT_PILAR_DOCUMENTS_COUNT).forEach((key) => {
        const pId = Number(key);
        customCounts[pId] = Math.round(
          DEFAULT_PILAR_DOCUMENTS_COUNT[pId].dokumen * newMultiplier
        );
      });
      const newStats = calculatePaperlessImpact(customCounts);
      setStats(newStats);
      setIsSimulating(newMultiplier !== 1);
    });
  };

  const handleReset = () => {
    setMultiplier(1);
    setIsSimulating(false);
    setStats(initialStats);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className='space-y-6 pb-12'>
      {/* Header Banner Green Governance */}
      <div className='relative overflow-hidden rounded-2xl border border-emerald-300/80 bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 p-6 text-white shadow-lg sm:p-8'>
        {/* Soft decorative background glows */}
        <div className='pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-teal-500/20 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-3xl space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className='border-emerald-400/50 bg-emerald-500/20 text-xs font-semibold text-emerald-300 backdrop-blur-md'>
                <Leaf className='mr-1.5 h-3.5 w-3.5 text-emerald-400' />
                Green Governance &amp; Eco-Efficiency
              </Badge>
              <Badge
                variant='outline'
                className='border-teal-400/40 bg-teal-500/10 text-[11px] font-medium text-teal-300'
              >
                Pilar 2 Tatalaksana (SPBE) &amp; Pilar 4 Akuntabilitas
              </Badge>
              {isSimulating && (
                <Badge className='animate-pulse border-amber-400/60 bg-amber-500/20 text-[11px] font-bold text-amber-300'>
                  Mode Simulasi ({multiplier}x)
                </Badge>
              )}
            </div>

            <h1 className='text-2xl font-black tracking-tight text-white sm:text-3xl md:text-4xl'>
              Indikator Efisiensi &amp; Dampak Paperless
            </h1>
            <p className='text-sm leading-relaxed text-slate-300 sm:text-base'>
              Kuantifikasi dampak lingkungan &amp; penghematan anggaran keuangan
              negara berkat transformasi digital penuh dokumen bukti dukung LKE
              ZI pada aplikasi <strong>REBO V2</strong> di wilayah kepulauan BPS
              Kabupaten Kepulauan Sitaro.
            </p>
          </div>

          <div className='flex shrink-0 flex-wrap items-center gap-2.5'>
            <Dialog open={isCertDialogOpen} onOpenChange={setIsCertDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant='outline'
                  className='border-emerald-400/60 bg-emerald-900/40 text-emerald-200 backdrop-blur-xs hover:bg-emerald-800/60 hover:text-white'
                >
                  <Award className='mr-2 h-4 w-4 text-emerald-300' />
                  Sertifikat Digital
                </Button>
              </DialogTrigger>
              <DialogContent className='max-w-2xl overflow-hidden border-emerald-400/60 bg-white p-0 dark:bg-slate-900'>
                {/* Modal Sertifikat Digital */}
                <div className='relative m-2 rounded-xl border-4 border-double border-emerald-300 bg-gradient-to-b from-emerald-50 via-white to-emerald-50/50 p-6 sm:p-8 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/30'>
                  {/* Watermark Logo */}
                  <div className='pointer-events-none absolute inset-0 flex items-center justify-center opacity-5'>
                    <Leaf className='h-80 w-80 text-emerald-700' />
                  </div>

                  <div className='relative z-10 space-y-3 text-center'>
                    <div className='mb-1 inline-flex items-center justify-center rounded-full bg-emerald-100 p-2 text-emerald-700 ring-4 ring-emerald-200/50 dark:bg-emerald-950 dark:text-emerald-300'>
                      <Award className='h-8 w-8' />
                    </div>

                    <div className='text-xs font-bold tracking-widest text-emerald-800 uppercase dark:text-emerald-300'>
                      BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SITARO
                    </div>

                    <h2 className='font-serif text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100'>
                      SERTIFIKAT CAPAIAN GREEN GOVERNANCE
                    </h2>
                    <p className='font-mono text-xs text-slate-500'>
                      Nomor: BPS-7108/GREEN-GOV/PMPRB-2026/001
                    </p>

                    <div className='my-4 space-y-2 border-t border-b border-emerald-200 py-3 text-xs text-slate-700 sm:text-sm dark:border-emerald-800/60 dark:text-slate-300'>
                      <p>
                        Diberikan sebagai pengakuan atas komitmen transformasi
                        tata kelola digital berkelanjutan, zero-waste
                        governance, dan efisiensi belanja publik melalui sistem:
                      </p>
                      <p className='text-base font-bold text-emerald-800 dark:text-emerald-300'>
                        REBO V2 (Reformasi Birokrasi Online V2)
                      </p>
                      <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                        Telah berhasil menghemat{' '}
                        <strong>
                          {formatNumber(stats.estimasi_lembar_dihemat)} lembar
                          kertas
                        </strong>{' '}
                        ({stats.estimasi_rim_kertas} rim), meniadakan emisi
                        karbon <strong>{stats.emisi_co2_kg} kg CO2e</strong>,
                        menyelamatkan{' '}
                        <strong>{stats.pohon_diselamatkan} pohon tropis</strong>
                        , serta menghemat anggaran publik sebesar{' '}
                        <strong>
                          {formatRupiah(stats.total_biaya_dihemat_rp)}
                        </strong>
                        .
                      </p>
                    </div>

                    <div className='flex items-center justify-between pt-4 text-left text-xs'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-1.5 font-semibold text-emerald-700 dark:text-emerald-400'>
                          <ShieldCheck className='h-4 w-4' />
                          <span>Verifikasi Kriptografis</span>
                        </div>
                        <p className='font-mono text-[10px] text-slate-400'>
                          SHA-256: a7f9c2d4e8b15093e81...
                        </p>
                        <p className='text-[10px] text-slate-500'>
                          Ondong Siau, 25 November 2026
                        </p>
                      </div>

                      <div className='space-y-1 text-right'>
                        <p className='text-[11px] font-medium text-slate-600 dark:text-slate-400'>
                          Kepala BPS Kab. Kepl. Sitaro
                        </p>
                        <div className='flex h-10 items-center justify-end pr-2'>
                          <Badge
                            variant='outline'
                            className='border-emerald-500 font-mono text-[9px] text-emerald-700'
                          >
                            ✓ SIGNED DIGITAL
                          </Badge>
                        </div>
                        <p className='text-xs font-bold text-slate-800 dark:text-slate-200'>
                          Pembina Tim ZI BPS Sitaro
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter className='flex justify-end gap-2 bg-slate-50 p-4 dark:bg-slate-950'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsCertDialogOpen(false)}
                  >
                    Tutup
                  </Button>
                  <Button
                    size='sm'
                    className='bg-emerald-600 text-white hover:bg-emerald-700'
                    onClick={() => window.print()}
                  >
                    <Printer className='mr-1.5 h-3.5 w-3.5' />
                    Cetak Sertifikat
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isPrintDialogOpen}
              onOpenChange={setIsPrintDialogOpen}
            >
              <DialogTrigger asChild>
                <Button className='bg-emerald-500 font-semibold text-slate-950 shadow-md hover:bg-emerald-400'>
                  <Printer className='mr-2 h-4 w-4' />
                  Cetak Laporan Resmi A4
                </Button>
              </DialogTrigger>
              <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto bg-white p-6 text-slate-900 sm:p-8'>
                <DialogHeader className='border-b pb-4 text-center sm:text-left'>
                  {/* Kop Surat Resmi */}
                  <div className='flex items-center gap-4 border-b-2 border-slate-900 pb-3'>
                    <div className='flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-slate-300 bg-slate-100 p-1 text-center text-xs font-bold text-blue-900'>
                      LOGO BPS
                    </div>
                    <div className='flex-1 text-center'>
                      <h3 className='text-sm font-bold tracking-wider uppercase sm:text-base'>
                        BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SITARO
                      </h3>
                      <p className='text-xs text-slate-600'>
                        Kompleks Perkantoran Pemerintah Daerah Sitaro, Ondong
                        Siau, Sulawesi Utara
                      </p>
                      <p className='font-mono text-[11px] text-slate-500'>
                        Laman: sitarokab.bps.go.id • Pos-el: bps7108@bps.go.id
                      </p>
                    </div>
                  </div>
                </DialogHeader>

                {/* Konten Laporan Resmi A4 */}
                <div className='space-y-4 py-4 text-xs leading-relaxed sm:text-sm'>
                  <div className='space-y-1 text-center'>
                    <h4 className='text-base font-bold uppercase underline'>
                      LAPORAN ESTIMASI EFISIENSI PAPERLESS &amp; GREEN
                      GOVERNANCE
                    </h4>
                    <p className='font-mono text-xs text-slate-600'>
                      Nomor: B-7108/02.04/RB.200/11/2026 • Lampiran Bukti Dukung
                      Pilar 2 &amp; Pilar 4
                    </p>
                  </div>

                  <p className='text-justify indent-6'>
                    Berdasarkan implementasi penuh digitalisasi tata kelola
                    Reformasi Birokrasi dan Pembangunan Zona Integritas (PMPRB)
                    melalui aplikasi <strong>REBO V2</strong>, seluruh bukti
                    dukung indikator 6 Pilar telah dialihkan sepenuhnya menjadi
                    dokumen digital tanpa memerlukan pencetakan fisik dan
                    pengiriman dokumen antar-pulau.
                  </p>

                  {/* Ringkasan Tabel Angka */}
                  <div className='overflow-hidden rounded-lg border border-slate-300'>
                    <table className='w-full text-left text-xs'>
                      <thead className='border-b border-slate-300 bg-slate-100 font-bold'>
                        <tr>
                          <th className='p-2'>Indikator Dampak</th>
                          <th className='p-2 text-right'>Nilai Capaian</th>
                          <th className='p-2'>Keterangan Standar Metrik</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-200'>
                        <tr>
                          <td className='p-2 font-medium'>
                            Total Dokumen Digital Terkelola
                          </td>
                          <td className='p-2 text-right font-bold'>
                            {formatNumber(stats.total_dokumen_digital)} Berkas
                          </td>
                          <td className='p-2 text-slate-600'>
                            Akumulasi 6 Pilar ZI BPS Sitaro
                          </td>
                        </tr>
                        <tr>
                          <td className='p-2 font-medium'>
                            Estimasi Lembar Kertas Dihemat
                          </td>
                          <td className='p-2 text-right font-bold text-emerald-700'>
                            {formatNumber(stats.estimasi_lembar_dihemat)} Lembar
                          </td>
                          <td className='p-2 text-slate-600'>
                            Rata-rata 18 lembar per berkas eviden
                          </td>
                        </tr>
                        <tr>
                          <td className='p-2 font-medium'>
                            Setara Kertas Fisik (Rim)
                          </td>
                          <td className='p-2 text-right font-bold'>
                            {stats.estimasi_rim_kertas} Rim
                          </td>
                          <td className='p-2 text-slate-600'>
                            1 Rim = 500 Lembar HVS 80gr
                          </td>
                        </tr>
                        <tr>
                          <td className='p-2 font-medium'>
                            Pohon Tropis Diselamatkan
                          </td>
                          <td className='p-2 text-right font-bold text-emerald-700'>
                            {stats.pohon_diselamatkan} Pohon
                          </td>
                          <td className='p-2 text-slate-600'>
                            Rasio 8.333 lembar per pohon dewasa
                          </td>
                        </tr>
                        <tr>
                          <td className='p-2 font-medium'>
                            Reduksi Emisi Karbon (CO2e)
                          </td>
                          <td className='p-2 text-right font-bold'>
                            {stats.emisi_co2_kg} kg CO2e
                          </td>
                          <td className='p-2 text-slate-600'>
                            2.5 kg CO2e per rim kertas
                          </td>
                        </tr>
                        <tr>
                          <td className='p-2 font-medium'>
                            Konservasi Air Bersih
                          </td>
                          <td className='p-2 text-right font-bold'>
                            {formatNumber(stats.air_bersih_liter)} Liter
                          </td>
                          <td className='p-2 text-slate-600'>
                            5.000 liter per rim proses pulp
                          </td>
                        </tr>
                        <tr className='bg-emerald-50 font-bold'>
                          <td className='p-2'>
                            Total Anggaran Keuangan Dihemat
                          </td>
                          <td className='p-2 text-right text-sm font-bold text-emerald-800'>
                            {formatRupiah(stats.total_biaya_dihemat_rp)}
                          </td>
                          <td className='p-2 text-emerald-800'>
                            Kertas (Rp{' '}
                            {formatNumber(stats.biaya_kertas_dihemat_rp)}) +
                            Tinta (Rp {formatNumber(stats.biaya_tinta_toner_rp)}
                            ) + Logistik Laut (Rp{' '}
                            {formatNumber(stats.biaya_logistik_antar_pulau_rp)})
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Rincian per Pilar */}
                  <h5 className='pt-2 text-xs font-bold uppercase'>
                    Rincian Penghematan per Pilar:
                  </h5>
                  <div className='overflow-hidden rounded-lg border border-slate-300'>
                    <table className='w-full text-left text-[11px]'>
                      <thead className='border-b border-slate-300 bg-slate-100 font-bold'>
                        <tr>
                          <th className='p-1.5'>Pilar</th>
                          <th className='p-1.5 text-center'>Berkas</th>
                          <th className='p-1.5 text-center'>Lembar</th>
                          <th className='p-1.5 text-right'>
                            Penghematan Biaya
                          </th>
                          <th className='p-1.5 text-right'>Dampak Hijau</th>
                        </tr>
                      </thead>
                      <tbody className='divide-y divide-slate-200'>
                        {Object.values(stats.breakdown_per_pilar).map(
                          (item) => (
                            <tr key={item.pilar_id}>
                              <td className='p-1.5 font-medium'>
                                {item.pilar_nama}
                              </td>
                              <td className='p-1.5 text-center'>
                                {formatNumber(item.dokumen)}
                              </td>
                              <td className='p-1.5 text-center'>
                                {formatNumber(item.lembar)}
                              </td>
                              <td className='p-1.5 text-right font-mono font-medium'>
                                {formatRupiah(item.total_biaya_rp)}
                              </td>
                              <td className='p-1.5 text-right text-emerald-700'>
                                {item.pohon} Pohon / {item.co2_kg} kg CO2
                              </td>
                            </tr>
                          )
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Keterangan Karakteristik Geografis */}
                  <p className='rounded border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-600 italic'>
                    * Catatan Khusus Wilayah Kepulauan Sitaro: Efisiensi
                    logistik dihitung berdasarkan penghapusan pengiriman berkas
                    fisik dokumen hardcopy menggunakan kapal cepat antarpulau
                    (Tagulandang - Siau - Biaro) senilai Rp 150.000,- per berkas
                    ekspedisi resmi.
                  </p>

                  {/* Tanda Tangan Pengesahan */}
                  <div className='grid grid-cols-2 pt-6 text-center text-xs'>
                    <div>
                      <p>Mengetahui,</p>
                      <p className='font-semibold'>
                        Pejabat Pembuat Komitmen (PPK)
                      </p>
                      <div className='flex h-14 items-center justify-center'>
                        <span className='text-[10px] text-slate-400'>
                          [ Tanda Tangan Digital ]
                        </span>
                      </div>
                      <p className='font-bold underline'>
                        TIM KEUANGAN &amp; AKUNTABILITAS
                      </p>
                      <p className='text-[10px] text-slate-500'>
                        NIP. 19850612 200801 1 002
                      </p>
                    </div>

                    <div>
                      <p>Ondong Siau, 25 November 2026</p>
                      <p className='font-semibold'>
                        Kepala BPS Kabupaten Kepulauan Sitaro
                      </p>
                      <div className='flex h-14 items-center justify-center'>
                        <span className='text-[10px] font-bold text-emerald-700'>
                          [ TERVERIFIKASI SISTEM REBO ]
                        </span>
                      </div>
                      <p className='font-bold underline'>
                        PEMBINA ZONA INTEGRITAS
                      </p>
                      <p className='text-[10px] text-slate-500'>
                        NIP. 19780415 200212 1 001
                      </p>
                    </div>
                  </div>
                </div>

                <DialogFooter className='flex items-center justify-between border-t pt-4 sm:justify-between'>
                  <span className='text-[11px] text-slate-500'>
                    Lampiran Sah Pemenuhan Standar Evaluasi PMPRB KemenPAN-RB
                  </span>
                  <div className='flex gap-2'>
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => setIsPrintDialogOpen(false)}
                    >
                      Batal
                    </Button>
                    <Button
                      size='sm'
                      className='bg-blue-600 text-white hover:bg-blue-700'
                      onClick={handlePrint}
                    >
                      <Printer className='mr-1.5 h-3.5 w-3.5' />
                      Cetak / Simpan PDF
                    </Button>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* 4 KARTU METRIK HIJAU UTAMA */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Card 1: Lembar Kertas Dihemat */}
        <Card className='relative overflow-hidden border-emerald-200/80 bg-gradient-to-br from-white via-emerald-50/30 to-teal-50/20 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-emerald-900/50 dark:from-slate-900 dark:via-emerald-950/20 dark:to-slate-900'>
          <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500' />
          <CardContent className='space-y-3 p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Kertas Dihemat
              </span>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'>
                <FileText className='h-5 w-5' />
              </div>
            </div>

            <div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-2xl font-black text-slate-900 dark:text-slate-100'>
                  {formatNumber(stats.estimasi_lembar_dihemat)}
                </h3>
                <span className='text-xs font-bold text-emerald-700 dark:text-emerald-400'>
                  Lembar
                </span>
              </div>
              <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                Setara dengan <strong>{stats.estimasi_rim_kertas} Rim</strong>{' '}
                Kertas HVS 80gr
              </p>
            </div>

            <div className='flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'>
              <CheckCircle2 className='h-3.5 w-3.5 shrink-0' />
              <span>
                Dari {formatNumber(stats.total_dokumen_digital)} Berkas Bukti
                Digital
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Anggaran Keuangan Dihemat */}
        <Card className='relative overflow-hidden border-blue-200/80 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-blue-900/50 dark:from-slate-900 dark:via-blue-950/20 dark:to-slate-900'>
          <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-500' />
          <CardContent className='space-y-3 p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Anggaran Dihemat
              </span>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'>
                <Banknote className='h-5 w-5' />
              </div>
            </div>

            <div>
              <div className='flex items-baseline gap-1'>
                <h3 className='text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100'>
                  {formatRupiah(stats.total_biaya_dihemat_rp)}
                </h3>
              </div>
              <p className='mt-1 truncate text-xs text-slate-500 dark:text-slate-400'>
                Biaya Kertas, Tinta &amp; Kapal Cepat
              </p>
            </div>

            <div className='flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-[11px] font-medium text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'>
              <Ship className='h-3.5 w-3.5 shrink-0' />
              <span>Bebas Biaya Logistik Lintas Pulau</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Pohon Diselamatkan */}
        <Card className='relative overflow-hidden border-teal-200/80 bg-gradient-to-br from-white via-teal-50/30 to-emerald-50/20 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-teal-900/50 dark:from-slate-900 dark:via-teal-950/20 dark:to-slate-900'>
          <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500' />
          <CardContent className='space-y-3 p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Pohon Diselamatkan
              </span>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 text-teal-700 dark:bg-teal-950/80 dark:text-teal-300'>
                <Trees className='h-5 w-5' />
              </div>
            </div>

            <div>
              <div className='flex items-baseline gap-2'>
                <h3 className='text-2xl font-black text-slate-900 dark:text-slate-100'>
                  {stats.pohon_diselamatkan}
                </h3>
                <span className='text-xs font-bold text-teal-700 dark:text-teal-400'>
                  Pohon Tropis
                </span>
              </div>
              <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                Pencegahan deforestasi bahan baku bubur kertas
              </p>
            </div>

            <div className='flex items-center gap-1.5 rounded-lg bg-teal-50 px-2.5 py-1.5 text-[11px] font-medium text-teal-800 dark:bg-teal-950/40 dark:text-teal-300'>
              <Leaf className='h-3.5 w-3.5 shrink-0' />
              <span>Standar 8.333 lembar per pohon</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Pengurangan Karbon & Air */}
        <Card className='relative overflow-hidden border-cyan-200/80 bg-gradient-to-br from-white via-cyan-50/30 to-sky-50/20 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-cyan-900/50 dark:from-slate-900 dark:via-cyan-950/20 dark:to-slate-900'>
          <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-sky-500' />
          <CardContent className='space-y-3 p-5'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Karbon &amp; Air Bersih
              </span>
              <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 text-cyan-700 dark:bg-cyan-950/80 dark:text-cyan-300'>
                <Droplets className='h-5 w-5' />
              </div>
            </div>

            <div>
              <div className='flex items-baseline gap-1'>
                <h3 className='text-xl font-black text-slate-900 sm:text-2xl dark:text-slate-100'>
                  {stats.emisi_co2_kg}{' '}
                  <span className='text-xs font-semibold text-cyan-700 dark:text-cyan-400'>
                    kg CO2e
                  </span>
                </h3>
              </div>
              <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
                &amp;{' '}
                <strong>{formatNumber(stats.air_bersih_liter)} Liter</strong>{' '}
                Air Bersih
              </p>
            </div>

            <div className='flex items-center gap-1.5 rounded-lg bg-cyan-50 px-2.5 py-1.5 text-[11px] font-medium text-cyan-800 dark:bg-cyan-950/40 dark:text-cyan-300'>
              <Sparkles className='h-3.5 w-3.5 shrink-0' />
              <span>Reduksi Jejak Ekologis Sitaro</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VISUALISASI RECHARTS */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
        {/* Chart 1: Bar Chart Kontribusi Lembar per Pilar (7 Cols) */}
        <Card className='border-slate-200/80 shadow-xs lg:col-span-7 dark:border-slate-800'>
          <CardHeader className='pb-2'>
            <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
              <div>
                <CardTitle className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
                  <Layers className='h-4.5 w-4.5 text-emerald-600 dark:text-emerald-400' />
                  <span>Kontribusi Penghematan Lembar per Pilar</span>
                </CardTitle>
                <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
                  Proporsi dokumen digital yang terverifikasi pada masing-masing
                  Pilar 1 s.d. 6
                </CardDescription>
              </div>
              <Badge
                variant='outline'
                className='w-fit border-emerald-300 bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300'
              >
                Rata-rata 18 Lembar/Berkas
              </Badge>
            </div>
          </CardHeader>
          <CardContent className='pt-4'>
            <div className='h-72 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={barChartData}
                  margin={{ top: 10, right: 10, left: -10, bottom: 20 }}
                >
                  <XAxis
                    dataKey='name'
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className='space-y-1.5 rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-lg dark:border-slate-800 dark:bg-slate-900'>
                            <p className='font-bold text-slate-900 dark:text-slate-100'>
                              {data.fullName}
                            </p>
                            <div className='space-y-1 text-slate-600 dark:text-slate-400'>
                              <div className='flex justify-between gap-4'>
                                <span>Dokumen Digital:</span>
                                <strong className='text-slate-900 dark:text-slate-200'>
                                  {formatNumber(data.dokumen)} berkas
                                </strong>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span>Lembar Dihemat:</span>
                                <strong className='text-emerald-600 dark:text-emerald-400'>
                                  {formatNumber(data.lembar)} lembar ({data.rim}{' '}
                                  rim)
                                </strong>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span>Pohon Diselamatkan:</span>
                                <strong className='text-teal-600 dark:text-teal-400'>
                                  {data.pohon} pohon
                                </strong>
                              </div>
                              <div className='flex justify-between gap-4'>
                                <span>Estimasi Biaya Dihemat:</span>
                                <strong className='text-blue-600 dark:text-blue-400'>
                                  {formatRupiah(data.biaya)}
                                </strong>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey='lembar' radius={[6, 6, 0, 0]}>
                    {barChartData.map((entry, index) => {
                      const colors = [
                        '#10b981', // emerald
                        '#059669', // dark emerald (pilar 2 tertinggi)
                        '#0d9488', // teal
                        '#0284c7', // sky
                        '#2563eb', // blue
                        '#4f46e5' // indigo
                      ];
                      return (
                        <Cell
                          key={`cell-${index}`}
                          fill={colors[index % colors.length]}
                        />
                      );
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className='grid grid-cols-3 gap-2 border-t border-slate-100 pt-2 text-center text-[10px] text-slate-600 sm:grid-cols-6 dark:border-slate-800 dark:text-slate-400'>
              {barChartData.map((p) => (
                <div
                  key={p.name}
                  className='rounded bg-slate-50 p-1.5 dark:bg-slate-800/40'
                >
                  <div className='font-bold text-slate-800 dark:text-slate-200'>
                    {p.name}
                  </div>
                  <div className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    {formatNumber(p.lembar)} lbr
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Chart 2: Donut Chart Komposisi Penghematan Anggaran (5 Cols) */}
        <Card className='flex flex-col justify-between border-slate-200/80 shadow-xs lg:col-span-5 dark:border-slate-800'>
          <CardHeader className='pb-2'>
            <CardTitle className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
              <Banknote className='h-4.5 w-4.5 text-blue-600 dark:text-blue-400' />
              <span>Komposisi Penghematan Anggaran</span>
            </CardTitle>
            <CardDescription className='text-xs text-slate-500 dark:text-slate-400'>
              Struktur komponen biaya yang berhasil dieliminasi di Sitaro
            </CardDescription>
          </CardHeader>
          <CardContent className='flex flex-1 flex-col justify-between space-y-4 pt-2'>
            <div className='h-52 w-full'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx='50%'
                    cy='50%'
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey='value'
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: any) => formatRupiah(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend List */}
            <div className='space-y-2 border-t border-slate-100 pt-1 text-xs dark:border-slate-800'>
              {pieChartData.map((item) => {
                const percent = (
                  (item.value / stats.total_biaya_dihemat_rp) *
                  100
                ).toFixed(1);
                return (
                  <div
                    key={item.name}
                    className='flex items-center justify-between'
                  >
                    <div className='flex items-center gap-2'>
                      <span
                        className='h-3 w-3 shrink-0 rounded-full'
                        style={{ backgroundColor: item.color }}
                      />
                      <div>
                        <span className='font-semibold text-slate-800 dark:text-slate-200'>
                          {item.name}
                        </span>
                        <p className='text-[10px] text-slate-500 dark:text-slate-400'>
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <span className='font-bold text-slate-900 dark:text-slate-100'>
                        {formatRupiah(item.value)}
                      </span>
                      <p className='text-[10px] font-semibold text-slate-500'>
                        {percent}%
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SIMULATOR & TRANSPARANSI METODOLOGI */}
      <Card className='border-slate-200/80 bg-slate-50/50 shadow-xs dark:border-slate-800 dark:bg-slate-900/40'>
        <CardContent className='space-y-4 p-5 sm:p-6'>
          <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <h3 className='flex items-center gap-2 text-sm font-bold text-slate-900 sm:text-base dark:text-slate-100'>
                <Info className='h-4.5 w-4.5 text-blue-600 dark:text-blue-400' />
                <span>Metodologi &amp; Rumus Baku Penghitungan Transparan</span>
              </h3>
              <p className='text-xs text-slate-500 dark:text-slate-400'>
                Mengacu pada standar Life Cycle Assessment (LCA) industri kertas
                dan indeks biaya kepulauan Sitaro.
              </p>
            </div>

            <div className='flex items-center gap-2'>
              {isSimulating && (
                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleReset}
                  className='h-8 border-amber-300 bg-amber-50 text-xs text-amber-800 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300'
                >
                  <RefreshCw className='mr-1.5 h-3 w-3' />
                  Reset ke Baseline
                </Button>
              )}
            </div>
          </div>

          <div className='grid grid-cols-2 gap-3 pt-1 sm:grid-cols-3 lg:grid-cols-6'>
            <div className='rounded-xl border border-white bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80'>
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
                1 Berkas Digital
              </span>
              <p className='mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200'>
                = 18 Lembar Fisik
              </p>
              <p className='mt-0.5 text-[10px] text-slate-400'>
                SK, Notula, Daftar Hadir, SPJ
              </p>
            </div>

            <div className='rounded-xl border border-white bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80'>
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
                Harga 1 Rim
              </span>
              <p className='mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200'>
                Rp 65.000,-
              </p>
              <p className='mt-0.5 text-[10px] text-slate-400'>
                HVS 80gr Standar Kepulauan
              </p>
            </div>

            <div className='rounded-xl border border-white bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80'>
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
                Tinta &amp; Toner
              </span>
              <p className='mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200'>
                Rp 300 / Lembar
              </p>
              <p className='mt-0.5 text-[10px] text-slate-400'>
                Penyusutan printer &amp; cartridge
              </p>
            </div>

            <div className='rounded-xl border border-white bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80'>
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
                Kapal Cepat
              </span>
              <p className='mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200'>
                Rp 150.000 / Paket
              </p>
              <p className='mt-0.5 text-[10px] text-slate-400'>
                Ekspedisi laut Siau-Tagulandang
              </p>
            </div>

            <div className='rounded-xl border border-white bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80'>
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
                1 Pohon Tropis
              </span>
              <p className='mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200'>
                = 8.333 Lembar
              </p>
              <p className='mt-0.5 text-[10px] text-slate-400'>
                Indeks pulp internasional
              </p>
            </div>

            <div className='rounded-xl border border-white bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/80'>
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase'>
                Emisi &amp; Air / Rim
              </span>
              <p className='mt-0.5 text-sm font-bold text-slate-800 dark:text-slate-200'>
                2.5 kg CO2e &amp; 5k L
              </p>
              <p className='mt-0.5 text-[10px] text-slate-400'>
                LCA Carbon Footprint Paper
              </p>
            </div>
          </div>

          {/* Quick Simulation Buttons */}
          <div className='flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3 dark:border-slate-800'>
            <div className='flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300'>
              <Sparkles className='h-4 w-4 text-emerald-500' />
              <span>Simulasi Proyeksi Berkas:</span>
            </div>
            <div className='flex flex-wrap items-center gap-1.5'>
              {[1, 1.25, 1.5, 2].map((m) => (
                <Button
                  key={m}
                  variant={multiplier === m ? 'default' : 'outline'}
                  size='sm'
                  onClick={() => handleMultiplierChange(m)}
                  className={`h-7 text-xs ${
                    multiplier === m
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {m === 1 ? '1x (Baseline)' : `${m}x Volume`}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
