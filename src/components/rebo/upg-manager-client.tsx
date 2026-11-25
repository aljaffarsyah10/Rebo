'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Award,
  Calendar,
  Building2,
  Check,
  Gift,
  Banknote,
  Ticket,
  Car,
  Utensils,
  Scale,
  Eye,
  Filter,
  ArrowRight,
  Landmark,
  BadgeAlert
} from 'lucide-react';

import {
  LaporanGratifikasi,
  UPGSummary,
  JenisLaporanGratifikasi,
  BentukGratifikasi,
  StatusVerifikasiUPG,
  JENIS_LAPORAN_LABELS,
  BENTUK_GRATIFIKASI_LABELS,
  STATUS_VERIFIKASI_LABELS
} from '@/lib/compliance/upg-types';

import {
  getUPGReportListAction,
  submitLaporanGratifikasiAction,
  verifyLaporanGratifikasiAction,
  generateRekonsiliasiKPKAction
} from '@/actions/upg-actions';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface UPGManagerClientProps {
  initialReports: LaporanGratifikasi[];
  initialSummary: UPGSummary;
}

export default function UPGManagerClient({
  initialReports,
  initialSummary
}: UPGManagerClientProps) {
  const [reports, setReports] = useState<LaporanGratifikasi[]>(initialReports);
  const [summary, setSummary] = useState<UPGSummary>(initialSummary);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterJenis, setFilterJenis] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Dialogs
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Active Item for Detail / Verification
  const [activeReport, setActiveReport] = useState<LaporanGratifikasi | null>(
    null
  );

  // Print Data State
  const [printData, setPrintData] = useState<{
    nomorSurat: string;
    tanggalSurat: string;
    semester: number;
    tahun: number;
  }>({
    nomorSurat: 'B-185/71080/PW.120/06/2026',
    tanggalSurat: '2026-06-30',
    semester: 1,
    tahun: 2026
  });

  // Transitions
  const [isPending, startTransition] = useTransition();

  // Form State: Submit Pelaporan Mandiri
  const [formPelaporan, setFormPelaporan] = useState({
    nama_pelapor: 'Pegawai BPS Kabupaten Kepulauan Sitaro',
    nip_pelapor: '199001012015031002',
    jabatan_pelapor: 'Statistisi Ahli Pertama / Anggota Tim RB',
    jenis_laporan: 'PENOLAKAN_GRATIFIKASI' as JenisLaporanGratifikasi,
    bentuk_gratifikasi: 'BARANG_BINGKISAN' as BentukGratifikasi,
    estimasi_nilai_rp: 500000,
    pemberi_nama: '',
    pemberi_instansi_or_hubungan: '',
    peristiwa_kegiatan: '',
    tempat_waktu_kejadian: 'Kantor BPS Sitaro, ',
    kronologi_penolakan_atau_penerimaan: '',
    tanggal_pelaporan: new Date().toISOString().split('T')[0],
    lampiran_foto_or_surat_url: ''
  });

  // Form State: Verifikasi Tim UPG
  const [formVerifikasi, setFormVerifikasi] = useState({
    status: 'TERVERIFIKASI_UPG' as StatusVerifikasiUPG,
    catatan: '',
    noSuratKPK: '',
    tanggalRekonsiliasi: '2026-06-30'
  });

  // Refresh handler
  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getUPGReportListAction({
        jenis: filterJenis,
        status: filterStatus,
        search: searchQuery,
        tahun: summary.tahun
      });
      if (res.success) {
        setReports(res.data);
        setSummary(res.summary);
        toast.success('Data UPG BPS Sitaro berhasil disinkronkan');
      } else {
        toast.error(res.error || 'Gagal memuat data');
      }
    });
  };

  // Submit Handler
  const handleSubmitLaporan = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formPelaporan.pemberi_nama ||
      !formPelaporan.kronologi_penolakan_atau_penerimaan
    ) {
      toast.error('Harap lengkapi nama pemberi dan kronologi kejadian');
      return;
    }

    startTransition(async () => {
      const res = await submitLaporanGratifikasiAction({
        ...formPelaporan,
        estimasi_nilai_rp: Number(formPelaporan.estimasi_nilai_rp) || 0
      });

      if (res.success && res.data) {
        toast.success('Laporan Gratifikasi Berhasil Dikirim ke UPG!', {
          description: `Nomor Registrasi: ${res.data.nomor_registrasi}`
        });
        setIsSubmitOpen(false);
        // Reset and refresh
        handleRefresh();
      } else {
        toast.error(res.error || 'Gagal mengirimkan laporan');
      }
    });
  };

  // Open Verify Modal
  const openVerifyDialog = (report: LaporanGratifikasi) => {
    setActiveReport(report);
    setFormVerifikasi({
      status: report.status_verifikasi,
      catatan: report.catatan_tim_upg || '',
      noSuratKPK:
        report.nomor_surat_rekonsiliasi_kpk ||
        `KPK/UPG-REK/7108/I/2026-${String(reports.length + 1).padStart(3, '0')}`,
      tanggalRekonsiliasi: report.tanggal_rekonsiliasi || '2026-06-30'
    });
    setIsVerifyOpen(true);
  };

  // Handle Verify Submit
  const handleSaveVerifikasi = () => {
    if (!activeReport) return;

    startTransition(async () => {
      const res = await verifyLaporanGratifikasiAction(
        activeReport.id,
        formVerifikasi.status,
        formVerifikasi.catatan,
        formVerifikasi.noSuratKPK,
        formVerifikasi.tanggalRekonsiliasi
      );

      if (res.success && res.data) {
        toast.success('Status verifikasi UPG berhasil diperbarui!');
        setIsVerifyOpen(false);
        handleRefresh();
      } else {
        toast.error(res.error || 'Gagal memperbarui verifikasi');
      }
    });
  };

  // Open Print Modal
  const handleOpenPrint = () => {
    startTransition(async () => {
      const res = await generateRekonsiliasiKPKAction(1, 2026);
      if (res.success) {
        setPrintData({
          nomorSurat: res.nomor_surat,
          tanggalSurat: res.tanggal_surat,
          semester: res.semester,
          tahun: res.tahun
        });
        setIsPrintOpen(true);
      } else {
        toast.error('Gagal menyiapkan dokumen rekonsiliasi KPK');
      }
    });
  };

  // Format IDR helper
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Icon for form of gratification
  const getBentukIcon = (bentuk: BentukGratifikasi) => {
    switch (bentuk) {
      case 'UANG_TUNAI':
        return <Banknote className='h-4 w-4 text-emerald-600' />;
      case 'BARANG_BINGKISAN':
        return <Gift className='h-4 w-4 text-purple-600' />;
      case 'VOUCHER_BELANJA':
        return <Ticket className='h-4 w-4 text-amber-600' />;
      case 'FASILITAS_TRANSPORT':
        return <Car className='h-4 w-4 text-blue-600' />;
      case 'MAKANAN_KONSUMSI':
        return <Utensils className='h-4 w-4 text-orange-600' />;
      default:
        return <Award className='h-4 w-4 text-slate-600' />;
    }
  };

  // Filtered reports in client view
  const displayedReports = reports.filter((item) => {
    const matchJenis =
      filterJenis === 'ALL' || item.jenis_laporan === filterJenis;
    const matchStatus =
      filterStatus === 'ALL' || item.status_verifikasi === filterStatus;
    const matchSearch =
      !searchQuery ||
      item.nomor_registrasi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nama_pelapor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.pemberi_nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.peristiwa_kegiatan.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJenis && matchStatus && matchSearch;
  });

  return (
    <div className='space-y-6'>
      {/* Header & Action Bar */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'>
              <ShieldCheck className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                Unit Pengendalian Gratifikasi (UPG) & Rekonsiliasi KPK
              </h1>
              <p className='text-sm text-slate-500 dark:text-slate-400'>
                Badan Pusat Statistik Kabupaten Kepulauan Sitaro • Pilar 5
                Penguatan Pengawasan (Zona Integritas WBK)
              </p>
            </div>
          </div>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isPending}
            className='h-9'
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isPending ? 'animate-spin' : ''}`}
            />
            Sinkronisasi
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={handleOpenPrint}
            disabled={isPending}
            className='h-9 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200'
          >
            <Printer className='mr-2 h-4 w-4 text-emerald-600' />
            Rekonsiliasi KPK (A4)
          </Button>
          <Button
            size='sm'
            onClick={() => setIsSubmitOpen(true)}
            className='h-9 bg-emerald-600 text-white hover:bg-emerald-700'
          >
            <Plus className='mr-2 h-4 w-4' />
            Lapor Gratifikasi Pegawai
          </Button>
        </div>
      </div>

      {/* 4 Kartu Metrik Utama */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Metrik 1: Total Laporan Integritas */}
        <Card className='border-slate-200/80 shadow-sm transition-all hover:shadow dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Total Laporan Integritas
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400'>
              <FileText className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-white'>
              {summary.total_laporan} Laporan
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Tahun Anggaran {summary.tahun} (Sitaro Bebas Suap)
            </p>
          </CardContent>
        </Card>

        {/* Metrik 2: Laporan Penolakan Gratifikasi */}
        <Card className='border-slate-200/80 shadow-sm transition-all hover:shadow dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Budaya Penolakan Gratifikasi
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400'>
              <ShieldCheck className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                {summary.total_penolakan} Tindakan
              </span>
              <span className='text-xs font-medium text-slate-500'>
                (
                {summary.total_laporan > 0
                  ? Math.round(
                      (summary.total_penolakan / summary.total_laporan) * 100
                    )
                  : 0}
                %)
              </span>
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Inisiatif proaktif penolakan di tempat oleh pegawai
            </p>
          </CardContent>
        </Card>

        {/* Metrik 3: Total Nominal Dicegah */}
        <Card className='border-slate-200/80 shadow-sm transition-all hover:shadow dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Total Nilai Gratifikasi Dicegah
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400'>
              <Banknote className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold text-slate-900 dark:text-white'>
              {formatRupiah(summary.total_nilai_dicegah_rp)}
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Total potensi gratifikasi ditolak & diamankan
            </p>
          </CardContent>
        </Card>

        {/* Metrik 4: Status Rekonsiliasi KPK RI */}
        <Card className='border-slate-200/80 shadow-sm transition-all hover:shadow dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-xs font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              Rekonsiliasi KPK RI
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400'>
              <Scale className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400'>
              <CheckCircle2 className='h-4 w-4' />
              <span>TERKONSILIASI PENUH</span>
            </div>
            <p className='mt-1 text-xs text-slate-500 dark:text-slate-400'>
              Semester I & II 2026 • 100% Nihil Temuan KPK
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Banner Komitmen Integritas */}
      <Card className='border-emerald-200 bg-gradient-to-r from-emerald-50/80 via-teal-50/50 to-white dark:border-emerald-900/40 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900'>
        <CardContent className='flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-start gap-3.5'>
            <div className='mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm'>
              <Landmark className='h-5 w-5' />
            </div>
            <div>
              <h3 className='text-sm font-semibold text-emerald-950 dark:text-emerald-200'>
                SOP Pengendalian Gratifikasi & Maklumat Bebas Pungli BPS
                Kabupaten Kepulauan Sitaro
              </h3>
              <p className='mt-0.5 text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                Seluruh pelayanan statistik di Front Office PST maupun kemitraan
                pengadaan barang/jasa dilaksanakan secara profesional,
                transparan, dan berbiaya Rp 0,-. Setiap upaya pemberian uang,
                parsel, cinderamata, voucher, atau fasilitas wajib ditolak atau
                dilaporkan dalam waktu maksimal 30 hari kerja sesuai ketentuan
                KPK RI.
              </p>
            </div>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Badge
              variant='outline'
              className='border-emerald-300 bg-emerald-100/50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-200'
            >
              Pilar 5 Pengawasan
            </Badge>
            <Badge
              variant='outline'
              className='border-blue-300 bg-blue-100/50 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
            >
              GOL KPK Connected
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <Card className='border-slate-200/80 shadow-sm dark:border-slate-800'>
        <CardContent className='p-4'>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-12'>
            <div className='relative sm:col-span-5'>
              <Search className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400' />
              <Input
                placeholder='Cari nomor registrasi, pelapor, pemberi, atau kronologi...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9 text-sm'
              />
            </div>
            <div className='sm:col-span-3'>
              <Select value={filterJenis} onValueChange={setFilterJenis}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Semua Jenis Laporan' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Jenis Laporan</SelectItem>
                  <SelectItem value='PENOLAKAN_GRATIFIKASI'>
                    Penolakan Gratifikasi
                  </SelectItem>
                  <SelectItem value='PENERIMAAN_GRATIFIKASI'>
                    Penerimaan Gratifikasi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className='sm:col-span-4'>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className='text-sm'>
                  <SelectValue placeholder='Semua Status Verifikasi' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Status Verifikasi</SelectItem>
                  <SelectItem value='MENUNGGU_VERIFIKASI'>
                    Menunggu Verifikasi
                  </SelectItem>
                  <SelectItem value='TERVERIFIKASI_UPG'>
                    Terverifikasi UPG
                  </SelectItem>
                  <SelectItem value='DITERUSKAN_KE_KPK'>
                    Diteruskan ke KPK
                  </SelectItem>
                  <SelectItem value='DITETAPKAN_MILIK_NEGARA'>
                    Ditetapkan Milik Negara
                  </SelectItem>
                  <SelectItem value='DIKEMBALIKAN_KE_PEMBERI'>
                    Ditolak / Dikembalikan
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabel Laporan Pengendalian Gratifikasi */}
      <Card className='border-slate-200/80 shadow-sm dark:border-slate-800'>
        <CardHeader className='pb-3'>
          <div className='flex items-center justify-between'>
            <div>
              <CardTitle className='text-base font-semibold text-slate-900 dark:text-slate-100'>
                Daftar Registrasi Pelaporan Gratifikasi (UPG-7108)
              </CardTitle>
              <CardDescription className='text-xs'>
                Menampilkan {displayedReports.length} dari total{' '}
                {reports.length} rekaman penanganan gratifikasi tahun{' '}
                {summary.tahun}
              </CardDescription>
            </div>
            <Badge
              variant='outline'
              className='text-xs font-normal text-slate-600'
            >
              Satker BPS 7108 Kepulauan Sitaro
            </Badge>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='overflow-x-auto'>
            <table className='w-full text-left text-sm'>
              <thead className='border-t border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400'>
                <tr>
                  <th className='py-3 pr-3 pl-4'>No. Registrasi & Tanggal</th>
                  <th className='px-3 py-3'>Pegawai Pelapor</th>
                  <th className='px-3 py-3'>Jenis & Bentuk</th>
                  <th className='px-3 py-3'>Pihak Pemberi & Peristiwa</th>
                  <th className='px-3 py-3 text-right'>Estimasi Nilai</th>
                  <th className='px-3 py-3 text-center'>Status Verifikasi</th>
                  <th className='py-3 pr-4 pl-3 text-center'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-200 text-xs dark:divide-slate-800'>
                {displayedReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='py-8 text-center text-slate-500'>
                      Tidak ada laporan gratifikasi yang sesuai dengan filter
                      pencarian.
                    </td>
                  </tr>
                ) : (
                  displayedReports.map((report) => {
                    const jenisConfig =
                      JENIS_LAPORAN_LABELS[report.jenis_laporan];
                    const bentukConfig =
                      BENTUK_GRATIFIKASI_LABELS[report.bentuk_gratifikasi];
                    const statusConfig =
                      STATUS_VERIFIKASI_LABELS[report.status_verifikasi];

                    return (
                      <tr
                        key={report.id}
                        className='transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/40'
                      >
                        {/* No Registrasi & Tanggal */}
                        <td className='py-3.5 pr-3 pl-4'>
                          <div className='font-mono font-semibold text-slate-900 dark:text-slate-100'>
                            {report.nomor_registrasi}
                          </div>
                          <div className='mt-0.5 flex items-center gap-1 text-[11px] text-slate-500'>
                            <Calendar className='h-3 w-3' />
                            {report.tanggal_pelaporan}
                          </div>
                        </td>

                        {/* Pelapor */}
                        <td className='px-3 py-3.5'>
                          <div className='font-medium text-slate-900 dark:text-slate-100'>
                            {report.nama_pelapor}
                          </div>
                          <div className='text-[11px] text-slate-500'>
                            NIP. {report.nip_pelapor}
                          </div>
                          <div className='line-clamp-1 text-[10px] text-slate-400'>
                            {report.jabatan_pelapor}
                          </div>
                        </td>

                        {/* Jenis & Bentuk */}
                        <td className='px-3 py-3.5'>
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium ${jenisConfig.color}`}
                          >
                            {report.jenis_laporan ===
                            'PENOLAKAN_GRATIFIKASI' ? (
                              <ShieldCheck className='h-3 w-3' />
                            ) : (
                              <Award className='h-3 w-3' />
                            )}
                            {jenisConfig.label}
                          </span>
                          <div className='mt-1 flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300'>
                            {getBentukIcon(report.bentuk_gratifikasi)}
                            <span>
                              {bentukConfig?.label || report.bentuk_gratifikasi}
                            </span>
                          </div>
                        </td>

                        {/* Pihak Pemberi & Peristiwa */}
                        <td className='max-w-xs px-3 py-3.5'>
                          <div className='line-clamp-1 font-medium text-slate-900 dark:text-slate-100'>
                            {report.pemberi_nama}
                          </div>
                          <div className='line-clamp-1 text-[11px] text-slate-500'>
                            {report.pemberi_instansi_or_hubungan}
                          </div>
                          <div className='mt-0.5 line-clamp-1 text-[10px] text-slate-400 italic'>
                            {report.peristiwa_kegiatan}
                          </div>
                        </td>

                        {/* Estimasi Nilai */}
                        <td className='px-3 py-3.5 text-right font-semibold text-slate-900 dark:text-slate-100'>
                          {formatRupiah(report.estimasi_nilai_rp)}
                        </td>

                        {/* Status Verifikasi */}
                        <td className='px-3 py-3.5 text-center'>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${statusConfig.color}`}
                          >
                            {statusConfig.label}
                          </span>
                          {report.nomor_surat_rekonsiliasi_kpk && (
                            <div className='mt-1 font-mono text-[9px] text-purple-600 dark:text-purple-400'>
                              {report.nomor_surat_rekonsiliasi_kpk}
                            </div>
                          )}
                        </td>

                        {/* Aksi */}
                        <td className='py-3.5 pr-4 pl-3 text-center'>
                          <div className='flex items-center justify-center gap-1.5'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => {
                                setActiveReport(report);
                                setIsDetailOpen(true);
                              }}
                              className='h-7 w-7 p-0 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                              title='Lihat Detail Kronologi'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => openVerifyDialog(report)}
                              className='h-7 border-emerald-300 px-2 text-[11px] text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
                            >
                              Verifikasi UPG
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================================= */}
      {/* DIALOG 1: FORMULIR PELAPORAN GRATIFIKASI MANDIRI OLEH PEGAWAI            */}
      {/* ========================================================================= */}
      <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white'>
              <ShieldCheck className='h-5 w-5 text-emerald-600' />
              Formulir Online Pelaporan Gratifikasi Pegawai
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Unit Pengendalian Gratifikasi (UPG) BPS Kabupaten Kepulauan Sitaro
              • Sesuai Perka BPS No. 60/2016
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={handleSubmitLaporan}
            className='space-y-4 pt-2 text-sm'
          >
            {/* Pemilihan Jenis Laporan */}
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Jenis Pelaporan Gratifikasi *
              </Label>
              <div className='grid grid-cols-2 gap-3'>
                <div
                  onClick={() =>
                    setFormPelaporan({
                      ...formPelaporan,
                      jenis_laporan: 'PENOLAKAN_GRATIFIKASI'
                    })
                  }
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    formPelaporan.jenis_laporan === 'PENOLAKAN_GRATIFIKASI'
                      ? 'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className='flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
                    <ShieldCheck className='h-4 w-4' />
                    Penolakan Gratifikasi
                  </div>
                  <p className='mt-1 text-[11px] text-slate-500'>
                    Menolak pemberian uang, parsel, cinderamata, voucher saat
                    penawaran.
                  </p>
                </div>

                <div
                  onClick={() =>
                    setFormPelaporan({
                      ...formPelaporan,
                      jenis_laporan: 'PENERIMAAN_GRATIFIKASI'
                    })
                  }
                  className={`cursor-pointer rounded-lg border p-3 transition-all ${
                    formPelaporan.jenis_laporan === 'PENERIMAAN_GRATIFIKASI'
                      ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20 dark:bg-amber-950/40'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-800'
                  }`}
                >
                  <div className='flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400'>
                    <Award className='h-4 w-4' />
                    Penerimaan Gratifikasi
                  </div>
                  <p className='mt-1 text-[11px] text-slate-500'>
                    Menerima plakat/souvenir resmi kedinasan yang tidak dapat
                    ditolak saat acara.
                  </p>
                </div>
              </div>
            </div>

            {/* Identitas Pelapor */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              <div className='space-y-1 sm:col-span-1'>
                <Label className='text-xs font-semibold'>Nama Pelapor</Label>
                <Input
                  value={formPelaporan.nama_pelapor}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      nama_pelapor: e.target.value
                    })
                  }
                  className='h-8 text-xs'
                  required
                />
              </div>
              <div className='space-y-1 sm:col-span-1'>
                <Label className='text-xs font-semibold'>NIP Pelapor</Label>
                <Input
                  value={formPelaporan.nip_pelapor}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      nip_pelapor: e.target.value
                    })
                  }
                  className='h-8 font-mono text-xs'
                  required
                />
              </div>
              <div className='space-y-1 sm:col-span-1'>
                <Label className='text-xs font-semibold'>Jabatan</Label>
                <Input
                  value={formPelaporan.jabatan_pelapor}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      jabatan_pelapor: e.target.value
                    })
                  }
                  className='h-8 text-xs'
                  required
                />
              </div>
            </div>

            {/* Bentuk Gratifikasi & Estimasi Nilai */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Bentuk Gratifikasi *
                </Label>
                <Select
                  value={formPelaporan.bentuk_gratifikasi}
                  onValueChange={(val: BentukGratifikasi) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      bentuk_gratifikasi: val
                    })
                  }
                >
                  <SelectTrigger className='h-8 text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='UANG_TUNAI'>
                      Uang Tunai / Amplop / Transfer
                    </SelectItem>
                    <SelectItem value='BARANG_BINGKISAN'>
                      Barang / Parcel / Bingkisan
                    </SelectItem>
                    <SelectItem value='VOUCHER_BELANJA'>
                      Voucher Belanja / Diskon Khusus
                    </SelectItem>
                    <SelectItem value='FASILITAS_TRANSPORT'>
                      Fasilitas Transportasi / Akomodasi
                    </SelectItem>
                    <SelectItem value='MAKANAN_KONSUMSI'>
                      Makanan Kadaluarsa Singkat
                    </SelectItem>
                    <SelectItem value='LAINNYA'>
                      Lainnya / Plakat Cinderamata Dinas
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Estimasi Nilai Pasar (Rp) *
                </Label>
                <Input
                  type='number'
                  value={formPelaporan.estimasi_nilai_rp}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      estimasi_nilai_rp: Number(e.target.value)
                    })
                  }
                  className='h-8 text-xs'
                  min={0}
                  step={10000}
                  required
                />
              </div>
            </div>

            {/* Pihak Pemberi */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Nama Pihak Pemberi *
                </Label>
                <Input
                  placeholder='Contoh: Hendra Wijaya (Penyedia ATK)'
                  value={formPelaporan.pemberi_nama}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      pemberi_nama: e.target.value
                    })
                  }
                  className='h-8 text-xs'
                  required
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Instansi / Hubungan Kerja *
                </Label>
                <Input
                  placeholder='Contoh: CV Siau Mitra Mandiri (Rekanan Satker)'
                  value={formPelaporan.pemberi_instansi_or_hubungan}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      pemberi_instansi_or_hubungan: e.target.value
                    })
                  }
                  className='h-8 text-xs'
                  required
                />
              </div>
            </div>

            {/* Peristiwa & Tempat Waktu */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Peristiwa / Konteks Acara *
                </Label>
                <Input
                  placeholder='Contoh: Kunjungan Konsultasi Data di PST'
                  value={formPelaporan.peristiwa_kegiatan}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      peristiwa_kegiatan: e.target.value
                    })
                  }
                  className='h-8 text-xs'
                  required
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Tempat & Waktu Kejadian *
                </Label>
                <Input
                  placeholder='Contoh: Front Office PST BPS Sitaro, 14.00 WITA'
                  value={formPelaporan.tempat_waktu_kejadian}
                  onChange={(e) =>
                    setFormPelaporan({
                      ...formPelaporan,
                      tempat_waktu_kejadian: e.target.value
                    })
                  }
                  className='h-8 text-xs'
                  required
                />
              </div>
            </div>

            {/* Kronologi */}
            <div className='space-y-1'>
              <Label className='text-xs font-semibold'>
                Kronologi Penolakan / Penerimaan *
              </Label>
              <Textarea
                placeholder='Uraikan secara jelas bagaimana barang/uang ditawarkan, dasar penolakan santun, sosialisasi maklumat Rp 0,- atau alasan penerimaan cinderamata dinas...'
                value={formPelaporan.kronologi_penolakan_atau_penerimaan}
                onChange={(e) =>
                  setFormPelaporan({
                    ...formPelaporan,
                    kronologi_penolakan_atau_penerimaan: e.target.value
                  })
                }
                rows={3}
                className='text-xs'
                required
              />
            </div>

            {/* Lampiran */}
            <div className='space-y-1'>
              <Label className='text-xs font-semibold'>
                URL Bukti / Foto / Tanda Terima (Opsional)
              </Label>
              <Input
                placeholder='/docs/upg/bukti-penolakan-foto.pdf'
                value={formPelaporan.lampiran_foto_or_surat_url}
                onChange={(e) =>
                  setFormPelaporan({
                    ...formPelaporan,
                    lampiran_foto_or_surat_url: e.target.value
                  })
                }
                className='h-8 text-xs'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsSubmitOpen(false)}
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={isPending}
                className='bg-emerald-600 text-white hover:bg-emerald-700'
              >
                {isPending ? 'Menyimpan...' : 'Kirim Laporan ke UPG'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 2: DETAIL LAPORAN GRATIFIKASI                                     */}
      {/* ========================================================================= */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className='max-h-[85vh] max-w-xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white'>
              <FileText className='h-5 w-5 text-blue-600' />
              Rincian Laporan Gratifikasi Pegawai
            </DialogTitle>
            <DialogDescription className='font-mono text-xs text-slate-500'>
              {activeReport?.nomor_registrasi} • Tanggal{' '}
              {activeReport?.tanggal_pelaporan}
            </DialogDescription>
          </DialogHeader>

          {activeReport && (
            <div className='space-y-3.5 pt-1 text-xs'>
              {/* Jenis & Status */}
              <div className='flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-800 dark:bg-slate-900'>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase'>
                    Jenis Laporan
                  </span>
                  <div className='font-semibold text-slate-900 dark:text-slate-100'>
                    {JENIS_LAPORAN_LABELS[activeReport.jenis_laporan].label}
                  </div>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase'>
                    Bentuk & Estimasi
                  </span>
                  <div className='font-semibold text-emerald-600 dark:text-emerald-400'>
                    {
                      BENTUK_GRATIFIKASI_LABELS[activeReport.bentuk_gratifikasi]
                        ?.label
                    }{' '}
                    ({formatRupiah(activeReport.estimasi_nilai_rp)})
                  </div>
                </div>
                <div>
                  <span className='text-[10px] font-bold text-slate-400 uppercase'>
                    Status Verifikasi
                  </span>
                  <div>
                    <span
                      className={`inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_VERIFIKASI_LABELS[activeReport.status_verifikasi].color}`}
                    >
                      {
                        STATUS_VERIFIKASI_LABELS[activeReport.status_verifikasi]
                          .label
                      }
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Pelapor */}
              <div className='space-y-1.5 rounded-lg border border-slate-200 p-3 dark:border-slate-800'>
                <div className='flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100'>
                  <Building2 className='h-3.5 w-3.5 text-blue-600' />
                  Data Pegawai Pelapor
                </div>
                <div className='grid grid-cols-2 gap-2 text-slate-600 dark:text-slate-300'>
                  <div>
                    Nama:{' '}
                    <strong className='text-slate-900 dark:text-slate-100'>
                      {activeReport.nama_pelapor}
                    </strong>
                  </div>
                  <div>
                    NIP:{' '}
                    <span className='font-mono'>
                      {activeReport.nip_pelapor}
                    </span>
                  </div>
                  <div className='col-span-2'>
                    Jabatan: {activeReport.jabatan_pelapor}
                  </div>
                </div>
              </div>

              {/* Data Pemberi */}
              <div className='space-y-1.5 rounded-lg border border-slate-200 p-3 dark:border-slate-800'>
                <div className='flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100'>
                  <Landmark className='h-3.5 w-3.5 text-amber-600' />
                  Pihak Pemberi & Lokasi Kejadian
                </div>
                <div className='space-y-1 text-slate-600 dark:text-slate-300'>
                  <div>
                    Pemberi:{' '}
                    <strong className='text-slate-900 dark:text-slate-100'>
                      {activeReport.pemberi_nama}
                    </strong>{' '}
                    ({activeReport.pemberi_instansi_or_hubungan})
                  </div>
                  <div>Peristiwa: {activeReport.peristiwa_kegiatan}</div>
                  <div>
                    Tempat & Waktu: {activeReport.tempat_waktu_kejadian}
                  </div>
                </div>
              </div>

              {/* Kronologi */}
              <div className='space-y-1.5 rounded-lg border border-slate-200 p-3 dark:border-slate-800'>
                <div className='font-semibold text-slate-900 dark:text-slate-100'>
                  Kronologi Penolakan / Penerimaan
                </div>
                <p className='rounded border border-slate-100 bg-slate-50 p-2.5 leading-relaxed whitespace-pre-line text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300'>
                  {activeReport.kronologi_penolakan_atau_penerimaan}
                </p>
              </div>

              {/* Catatan Tim UPG */}
              <div className='space-y-1.5 rounded-lg border border-slate-200 p-3 dark:border-slate-800'>
                <div className='flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100'>
                  <ShieldCheck className='h-3.5 w-3.5 text-emerald-600' />
                  Telaah & Catatan Tim Kepatuhan Internal / UPG Sitaro
                </div>
                <p className='leading-relaxed text-slate-700 dark:text-slate-300'>
                  {activeReport.catatan_tim_upg || 'Belum ada catatan tim UPG.'}
                </p>
                {activeReport.nomor_surat_rekonsiliasi_kpk && (
                  <div className='mt-2 rounded border border-purple-200 bg-purple-50 p-2 text-[11px] text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300'>
                    Rekonsiliasi KPK RI:{' '}
                    <strong>{activeReport.nomor_surat_rekonsiliasi_kpk}</strong>{' '}
                    (Tanggal: {activeReport.tanggal_rekonsiliasi})
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className='pt-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsDetailOpen(false)}
            >
              Tutup
            </Button>
            {activeReport && (
              <Button
                size='sm'
                onClick={() => {
                  setIsDetailOpen(false);
                  openVerifyDialog(activeReport);
                }}
                className='bg-emerald-600 text-white hover:bg-emerald-700'
              >
                Verifikasi Tindak Lanjut
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 3: TINDAK LANJUT VERIFIKASI TIM UPG BPS SITARO                    */}
      {/* ========================================================================= */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent className='max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-white'>
              <ShieldCheck className='h-5 w-5 text-emerald-600' />
              Verifikasi & Disposisi Tim Kepatuhan Internal (UPG)
            </DialogTitle>
            <DialogDescription className='text-xs'>
              {activeReport?.nomor_registrasi} • Pelapor:{' '}
              {activeReport?.nama_pelapor}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3.5 pt-1 text-xs'>
            <div className='space-y-1'>
              <Label className='text-xs font-semibold'>
                Status Keputusan UPG *
              </Label>
              <Select
                value={formVerifikasi.status}
                onValueChange={(val: StatusVerifikasiUPG) =>
                  setFormVerifikasi({ ...formVerifikasi, status: val })
                }
              >
                <SelectTrigger className='h-8 text-xs'>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='MENUNGGU_VERIFIKASI'>
                    Menunggu Verifikasi
                  </SelectItem>
                  <SelectItem value='TERVERIFIKASI_UPG'>
                    Terverifikasi UPG Satker
                  </SelectItem>
                  <SelectItem value='DITERUSKAN_KE_KPK'>
                    Diteruskan ke KPK RI (GOL KPK)
                  </SelectItem>
                  <SelectItem value='DITETAPKAN_MILIK_NEGARA'>
                    Ditetapkan Milik Negara (Aset Satker)
                  </SelectItem>
                  <SelectItem value='DIKEMBALIKAN_KE_PEMBERI'>
                    Telah Ditolak / Dikembalikan ke Pemberi
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-1'>
              <Label className='text-xs font-semibold'>
                Catatan Hasil Telaah & Tindak Lanjut UPG *
              </Label>
              <Textarea
                placeholder='Masukkan pertimbangan hukum, kesesuaian SOP, dan tindak lanjut penerusan/pencatatan...'
                value={formVerifikasi.catatan}
                onChange={(e) =>
                  setFormVerifikasi({
                    ...formVerifikasi,
                    catatan: e.target.value
                  })
                }
                rows={3}
                className='text-xs'
                required
              />
            </div>

            <div className='grid grid-cols-2 gap-3'>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Nomor Rekonsiliasi KPK (Opsional)
                </Label>
                <Input
                  value={formVerifikasi.noSuratKPK}
                  onChange={(e) =>
                    setFormVerifikasi({
                      ...formVerifikasi,
                      noSuratKPK: e.target.value
                    })
                  }
                  className='h-8 font-mono text-xs'
                  placeholder='KPK/UPG-REK/7108/I/2026-...'
                />
              </div>
              <div className='space-y-1'>
                <Label className='text-xs font-semibold'>
                  Tanggal Rekonsiliasi
                </Label>
                <Input
                  type='date'
                  value={formVerifikasi.tanggalRekonsiliasi}
                  onChange={(e) =>
                    setFormVerifikasi({
                      ...formVerifikasi,
                      tanggalRekonsiliasi: e.target.value
                    })
                  }
                  className='h-8 text-xs'
                />
              </div>
            </div>
          </div>

          <DialogFooter className='pt-2'>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={() => setIsVerifyOpen(false)}
            >
              Batal
            </Button>
            <Button
              type='button'
              size='sm'
              disabled={isPending}
              onClick={handleSaveVerifikasi}
              className='bg-emerald-600 text-white hover:bg-emerald-700'
            >
              {isPending ? 'Menyimpan...' : 'Simpan Verifikasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DIALOG 4: CETAK LAPORAN REKAPITULASI RESMI UPG & REKONSILIASI KPK (A4)    */}
      {/* ========================================================================= */}
      <Dialog open={isPrintOpen} onOpenChange={setIsPrintOpen}>
        <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto print:border-none print:p-0 print:shadow-none'>
          <div className='flex items-center justify-between border-b pb-3 print:hidden'>
            <div>
              <DialogTitle className='text-base font-bold text-slate-900 dark:text-white'>
                Laporan Rekapitulasi Pengendalian Gratifikasi & Rekonsiliasi KPK
                RI
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Format Bukti Dukung Resmi Komponen Pengawasan (Pilar 5 ZI Menuju
                WBK/WBBM)
              </DialogDescription>
            </div>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-emerald-600 text-white hover:bg-emerald-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Format A4
            </Button>
          </div>

          {/* DOKUMEN CETAK A4 RESMI */}
          <div className='border bg-white p-6 font-serif text-[11px] leading-normal text-black shadow-sm print:border-none print:shadow-none'>
            {/* Kop Surat Resmi */}
            <div className='border-b-2 border-black pb-3 text-center'>
              <div className='text-xs font-bold tracking-wider uppercase'>
                BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SITARO
              </div>
              <div className='mt-0.5 text-base font-extrabold tracking-wide uppercase'>
                TIM KEPATUHAN INTERNAL & UNIT PENGENDALIAN GRATIFIKASI (UPG)
              </div>
              <div className='mt-1 font-sans text-[10px] text-slate-700 italic'>
                Kompleks Perkantoran Pemerintah Daerah Blok D, Ondong Siau, Kab.
                Kepulauan Siau Tagulandang Biaro (75861)
                <br />
                Pos-el: bps7108@bps.go.id • Laman: sitarokab.bps.go.id • Saluran
                Pengaduan / UPG: (0431) 880012
              </div>
            </div>

            {/* Judul Surat */}
            <div className='mt-4 text-center'>
              <div className='text-sm font-bold tracking-wide uppercase underline'>
                LAPORAN REKAPITULASI PENGENDALIAN GRATIFIKASI DAN REKONSILIASI
                KPK RI
              </div>
              <div className='mt-0.5 font-sans text-[10px] text-slate-800'>
                Nomor: {printData.nomorSurat}
              </div>
              <div className='font-sans text-[10px] text-slate-600'>
                Periode: Semester I & II Tahun Anggaran {printData.tahun}
              </div>
            </div>

            {/* Pernyataan Pengantar */}
            <div className='mt-4 space-y-2 text-justify font-sans text-[10.5px] leading-relaxed'>
              <p>
                Sesuai dengan ketentuan Undang-Undang Nomor 20 Tahun 2001 jo.
                Undang-Undang Nomor 31 Tahun 1999 tentang Tindak Pidana Korupsi,
                Peraturan Komisi Pemberantasan Korupsi (KPK) RI Nomor 2 Tahun
                2019 tentang Pelaporan Gratifikasi, dan Peraturan BPS Nomor 60
                Tahun 2016 tentang Pengendalian Gratifikasi di Lingkungan Badan
                Pusat Statistik, dengan ini Tim Kepatuhan Internal BPS Kabupaten
                Kepulauan Sitaro melaporkan rekapitulasi penanganan dan
                rekonsiliasi pengendalian gratifikasi sebagai berikut:
              </p>
            </div>

            {/* Tabel Rekapitulasi Metrik */}
            <div className='mt-3'>
              <div className='mb-1 font-sans text-[10.5px] font-bold'>
                I. Ringkasan Kepatuhan & Pencegahan Gratifikasi Satker
              </div>
              <table className='w-full border-collapse border border-black font-sans text-[10px]'>
                <thead className='bg-slate-100'>
                  <tr>
                    <th className='w-12 border border-black p-1.5 text-center'>
                      No
                    </th>
                    <th className='border border-black p-1.5 text-left'>
                      Indikator Kinerja Pengendalian Gratifikasi
                    </th>
                    <th className='w-36 border border-black p-1.5 text-center'>
                      Capaian Satker
                    </th>
                    <th className='w-48 border border-black p-1.5 text-center'>
                      Status Rekonsiliasi KPK RI
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className='border border-black p-1.5 text-center'>1</td>
                    <td className='border border-black p-1.5'>
                      Total Laporan Penanganan Gratifikasi Pegawai Masuk
                    </td>
                    <td className='border border-black p-1.5 text-center font-bold'>
                      {summary.total_laporan} Laporan
                    </td>
                    <td
                      className='border border-black p-1.5 text-center'
                      rowSpan={4}
                    >
                      <span className='font-bold text-emerald-800'>
                        TERKONSILIASI 100%
                      </span>
                      <br />
                      <span className='text-[9px] text-slate-600'>
                        Nihil Temuan Gratifikasi Ilegal
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-black p-1.5 text-center'>2</td>
                    <td className='border border-black p-1.5 font-medium'>
                      Jumlah Tindakan Penolakan Langsung oleh Pegawai (Budaya
                      Anti-Korupsi)
                    </td>
                    <td className='border border-black p-1.5 text-center font-bold text-emerald-700'>
                      {summary.total_penolakan} Tindakan
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-black p-1.5 text-center'>3</td>
                    <td className='border border-black p-1.5'>
                      Jumlah Penerimaan Cinderamata Kedinasan Resmi (Ditetapkan
                      Aset Negara)
                    </td>
                    <td className='border border-black p-1.5 text-center font-bold'>
                      {summary.total_penerimaan} Tindakan
                    </td>
                  </tr>
                  <tr>
                    <td className='border border-black p-1.5 text-center'>4</td>
                    <td className='border border-black p-1.5 font-medium'>
                      Total Nilai Finansial Gratifikasi yang Berhasil Dicegah /
                      Diamankan
                    </td>
                    <td className='border border-black p-1.5 text-center font-bold'>
                      {formatRupiah(summary.total_nilai_dicegah_rp)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Tabel Rincian Kasus */}
            <div className='mt-4'>
              <div className='mb-1 font-sans text-[10.5px] font-bold'>
                II. Buku Register Register Penanganan & Rekonsiliasi Gratifikasi
                Tahun {summary.tahun}
              </div>
              <table className='w-full border-collapse border border-black font-sans text-[9.5px]'>
                <thead className='bg-slate-100'>
                  <tr>
                    <th className='w-8 border border-black p-1 text-center'>
                      No
                    </th>
                    <th className='w-24 border border-black p-1 text-left'>
                      No. Registrasi
                    </th>
                    <th className='border border-black p-1 text-left'>
                      Nama & Jabatan Pelapor
                    </th>
                    <th className='border border-black p-1 text-left'>
                      Jenis & Bentuk
                    </th>
                    <th className='border border-black p-1 text-left'>
                      Pihak Pemberi & Peristiwa
                    </th>
                    <th className='w-20 border border-black p-1 text-right'>
                      Estimasi (Rp)
                    </th>
                    <th className='w-32 border border-black p-1 text-left'>
                      Status Disposisi UPG
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((item, idx) => (
                    <tr key={item.id}>
                      <td className='border border-black p-1 text-center'>
                        {idx + 1}
                      </td>
                      <td className='border border-black p-1 font-mono font-medium'>
                        {item.nomor_registrasi}
                      </td>
                      <td className='border border-black p-1'>
                        <strong>{item.nama_pelapor}</strong>
                        <div className='text-[8.5px] text-slate-600'>
                          {item.jabatan_pelapor}
                        </div>
                      </td>
                      <td className='border border-black p-1'>
                        <span className='font-medium'>
                          {item.jenis_laporan === 'PENOLAKAN_GRATIFIKASI'
                            ? 'Penolakan'
                            : 'Penerimaan'}
                        </span>
                        <div className='text-[8.5px] text-slate-600'>
                          {
                            BENTUK_GRATIFIKASI_LABELS[item.bentuk_gratifikasi]
                              ?.label
                          }
                        </div>
                      </td>
                      <td className='border border-black p-1'>
                        <strong>{item.pemberi_nama}</strong> (
                        {item.pemberi_instansi_or_hubungan})
                        <div className='text-[8.5px] text-slate-600 italic'>
                          {item.peristiwa_kegiatan}
                        </div>
                      </td>
                      <td className='border border-black p-1 text-right font-medium'>
                        {formatRupiah(item.estimasi_nilai_rp)}
                      </td>
                      <td className='border border-black p-1'>
                        <span className='font-medium'>
                          {
                            STATUS_VERIFIKASI_LABELS[item.status_verifikasi]
                              ?.label
                          }
                        </span>
                        {item.nomor_surat_rekonsiliasi_kpk && (
                          <div className='font-mono text-[8px] text-slate-500'>
                            {item.nomor_surat_rekonsiliasi_kpk}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kesimpulan & Pernyataan Integritas */}
            <div className='mt-4 space-y-1.5 text-justify font-sans text-[10px] leading-relaxed'>
              <p>
                <strong>Kesimpulan Evaluasi Integritas:</strong> Seluruh pegawai
                BPS Kabupaten Kepulauan Sitaro telah menerapkan budaya penolakan
                gratifikasi secara konsisten pada seluruh lini layanan dan
                pengadaan barang/jasa. Tidak ada laporan keterlambatan
                pelaporan, tidak ada penerimaan suap/gratifikasi ilegal yang
                disembunyikan, dan seluruh cinderamata kedinasan resmi telah
                tercatat secara akuntabel sebagai aset BMN satker.
              </p>
              <p>
                Laporan ini disusun dengan sebenar-benarnya sebagai pemenuhan
                lembar kerja evaluasi (LKE) Zona Integritas Pilar 5 Penguatan
                Pengawasan menuju Wilayah Bebas dari Korupsi (WBK).
              </p>
            </div>

            {/* Tanda Tangan Pejabat Satker */}
            <div className='mt-6 grid grid-cols-2 text-center font-sans text-[10.5px]'>
              <div>
                <div>Mengetahui,</div>
                <div className='font-bold'>
                  Ketua Tim Kepatuhan Internal / UPG
                </div>
                <div className='font-bold'>BPS Kabupaten Kepulauan Sitaro</div>
                <div className='mt-16 font-bold underline'>
                  Jendri Sasela, S.Si
                </div>
                <div className='text-[9.5px]'>NIP. 198904122012121002</div>
              </div>
              <div>
                <div>Ondong Siau, {printData.tanggalSurat}</div>
                <div className='font-bold'>Kepala Badan Pusat Statistik</div>
                <div className='font-bold'>Kabupaten Kepulauan Sitaro</div>
                <div className='mt-16 font-bold underline'>
                  Ir. Pimpinan BPS Sitaro, M.Si
                </div>
                <div className='text-[9.5px]'>NIP. 197501012000031001</div>
              </div>
            </div>
          </div>

          <DialogFooter className='pt-3 print:hidden'>
            <Button
              variant='outline'
              size='sm'
              onClick={() => setIsPrintOpen(false)}
            >
              Tutup
            </Button>
            <Button
              size='sm'
              onClick={() => window.print()}
              className='bg-emerald-600 text-white hover:bg-emerald-700'
            >
              <Printer className='mr-1.5 h-4 w-4' />
              Cetak Dokumen (A4)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
