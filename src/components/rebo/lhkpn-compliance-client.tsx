'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Printer,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
  Copy,
  Check,
  FileText,
  UserCheck,
  AlertTriangle,
  Building2,
  Calendar,
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';

import {
  LHKPNReport,
  LHKPNSummary,
  SubmitBuktiLaporInput,
  TipeLaporanHarta,
  StatusKepatuhanLHKPN,
  calculateLHKPNSummary
} from '@/lib/compliance/lhkpn-types';

import {
  getLHKPNComplianceListAction,
  submitBuktiLaporAction,
  verifyBuktiLaporAction,
  sendLHKPNWAReminderAction,
  broadcastLHKPNRemindersAction
} from '@/actions/lhkpn-actions';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface LHKPNComplianceClientProps {
  initialReports: LHKPNReport[];
  initialSummary: LHKPNSummary;
}

export default function LHKPNComplianceClient({
  initialReports,
  initialSummary
}: LHKPNComplianceClientProps) {
  const [reports, setReports] = useState<LHKPNReport[]>(initialReports);
  const [summary, setSummary] = useState<LHKPNSummary>(initialSummary);
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPending, startTransition] = useTransition();

  // State Dialogs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Selected Target for Action
  const [selectedReport, setSelectedReport] = useState<LHKPNReport | null>(
    null
  );
  const [verificationNotes, setVerificationNotes] = useState('');
  const [copiedReceiptId, setCopiedReceiptId] = useState<string | null>(null);

  // Upload Form State
  const [uploadForm, setUploadForm] = useState<SubmitBuktiLaporInput>({
    id: '',
    nama_pegawai: '',
    nip: '',
    tipe_laporan: 'LHKASN',
    tanggal_lapor: new Date().toISOString().split('T')[0],
    nomor_tanda_terima: '',
    bukti_tanda_terima_url: '',
    catatan_tambahan: ''
  });

  // Refresh data dari server
  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getLHKPNComplianceListAction(2026);
      if (res.success) {
        setReports(res.data);
        setSummary(res.summary);
        toast.success('Data kepatuhan LHKPN/LHKASN berhasil diperbarui.');
      } else {
        toast.error('Gagal memperbarui data.');
      }
    });
  };

  // 1. Kirim Pengingat WhatsApp Personal
  const handleSendPersonalReminder = (report: LHKPNReport) => {
    startTransition(async () => {
      toast.loading(
        `Mengirim pengingat WhatsApp ke ${report.nama_pegawai}...`,
        {
          id: `wa-${report.id}`
        }
      );

      const res = await sendLHKPNWAReminderAction(report.id);
      if (res.success) {
        toast.success(res.message, { id: `wa-${report.id}` });
        // Update local state
        setReports((prev) =>
          prev.map((r) =>
            r.id === report.id
              ? {
                  ...r,
                  reminder_count: (r.reminder_count || 0) + 1,
                  last_reminder_sent_at: new Date().toISOString()
                }
              : r
          )
        );
      } else {
        toast.error(res.error || 'Gagal mengirim pengingat WhatsApp', {
          id: `wa-${report.id}`
        });
        if (res.deepLink) {
          window.open(res.deepLink, '_blank');
        }
      }
    });
  };

  // 2. Broadcast Pengingat Serentak
  const handleBroadcastReminders = () => {
    startTransition(async () => {
      setIsBroadcastOpen(false);
      toast.loading('Menyiarkan pengingat WhatsApp ke semua pegawai...', {
        id: 'broadcast-wa'
      });

      const res = await broadcastLHKPNRemindersAction(2026);
      if (res.success) {
        toast.success(
          `Pengingat terkirim ke ${res.totalSent} pegawai (${res.totalTarget} target).`,
          { id: 'broadcast-wa' }
        );
        // Refresh local state
        const refRes = await getLHKPNComplianceListAction(2026);
        if (refRes.success) {
          setReports(refRes.data);
          setSummary(refRes.summary);
        }
      } else {
        toast.error(res.error || 'Gagal menyiarkan pengingat', {
          id: 'broadcast-wa'
        });
      }
    });
  };

  // 3. Verifikasi Bukti Lapor
  const handleVerifySubmit = (isApproved: boolean) => {
    if (!selectedReport) return;

    startTransition(async () => {
      const res = await verifyBuktiLaporAction(
        selectedReport.id,
        isApproved,
        verificationNotes
      );

      if (res.success && res.data) {
        toast.success(
          isApproved
            ? `Bukti pelaporan ${selectedReport.nama_pegawai} disetujui (100% Valid).`
            : `Bukti pelaporan ${selectedReport.nama_pegawai} ditolak & dikembalikan.`
        );

        const updatedList = reports.map((r) =>
          r.id === selectedReport.id ? res.data! : r
        );
        setReports(updatedList);
        setSummary(calculateLHKPNSummary(updatedList, 2026));
        setIsVerifyOpen(false);
        setSelectedReport(null);
        setVerificationNotes('');
      } else {
        toast.error(res.error || 'Gagal memproses verifikasi.');
      }
    });
  };

  // 4. Submit Bukti Tanda Terima Mandiri / Form
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadForm.nomor_tanda_terima) {
      toast.error('Nomor tanda terima elektronik wajib diisi.');
      return;
    }

    startTransition(async () => {
      const res = await submitBuktiLaporAction(uploadForm);
      if (res.success && res.data) {
        toast.success(
          `Bukti tanda terima ${res.data.nama_pegawai} berhasil disimpan. Status: PROSES VERIFIKASI.`
        );
        const updatedList = reports.map((r) =>
          r.id === res.data!.id ? res.data! : r
        );
        setReports(updatedList);
        setSummary(calculateLHKPNSummary(updatedList, 2026));
        setIsUploadOpen(false);
        setUploadForm({
          id: '',
          nama_pegawai: '',
          nip: '',
          tipe_laporan: 'LHKASN',
          tanggal_lapor: new Date().toISOString().split('T')[0],
          nomor_tanda_terima: '',
          bukti_tanda_terima_url: '',
          catatan_tambahan: ''
        });
      } else {
        toast.error(res.error || 'Gagal menyimpan bukti pelaporan.');
      }
    });
  };

  // Buka Dialog Upload untuk pegawai tertentu
  const openUploadFor = (report: LHKPNReport) => {
    setUploadForm({
      id: report.id,
      nama_pegawai: report.nama_pegawai,
      nip: report.nip,
      tipe_laporan: report.tipe_laporan,
      tanggal_lapor:
        report.tanggal_lapor || new Date().toISOString().split('T')[0],
      nomor_tanda_terima: report.nomor_tanda_terima || '',
      bukti_tanda_terima_url: report.bukti_tanda_terima_url || '',
      catatan_tambahan: report.catatan_verifikasi || ''
    });
    setIsUploadOpen(true);
  };

  // Buka Dialog Verifikasi untuk admin
  const openVerifyDialog = (report: LHKPNReport) => {
    setSelectedReport(report);
    setVerificationNotes(report.catatan_verifikasi || '');
    setIsVerifyOpen(true);
  };

  // Salin nomor tanda terima
  const copyReceiptNumber = (num?: string) => {
    if (!num) return;
    navigator.clipboard.writeText(num);
    setCopiedReceiptId(num);
    toast.success('Nomor tanda terima disalin ke papan klip.');
    setTimeout(() => setCopiedReceiptId(null), 2500);
  };

  // Filter daftar pegawai
  const filteredReports = reports.filter((report) => {
    // Filter Tab
    if (activeTab === 'LHKPN' && report.tipe_laporan !== 'LHKPN') return false;
    if (activeTab === 'LHKASN' && report.tipe_laporan !== 'LHKASN')
      return false;
    if (activeTab === 'SUDAH_LAPOR' && report.status !== 'SUDAH_LAPOR')
      return false;
    if (
      activeTab === 'PROSES_VERIFIKASI' &&
      report.status !== 'PROSES_VERIFIKASI'
    )
      return false;
    if (activeTab === 'BELUM_LAPOR' && report.status !== 'BELUM_LAPOR')
      return false;

    // Filter Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = report.nama_pegawai.toLowerCase().includes(q);
      const matchNip = report.nip.includes(q);
      const matchJabatan = report.jabatan.toLowerCase().includes(q);
      const matchReceipt =
        report.nomor_tanda_terima?.toLowerCase().includes(q) || false;
      return matchName || matchNip || matchJabatan || matchReceipt;
    }

    return true;
  });

  const pendingReports = reports.filter((r) => r.status !== 'SUDAH_LAPOR');

  return (
    <div className='w-full space-y-6 pb-12'>
      {/* 1. Header & Title Section */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div className='space-y-1.5'>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='outline'
              className='border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
            >
              <ShieldCheck className='mr-1 h-3.5 w-3.5' />
              Pilar 5: Pengawasan & Pilar 3: SDM
            </Badge>
            <Badge
              variant='outline'
              className='border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            >
              <Award className='mr-1 h-3.5 w-3.5' />
              Syarat Mutlak (Gatekeeper) WBK
            </Badge>
            <Badge
              variant='secondary'
              className='bg-muted text-muted-foreground'
            >
              Tahun Pelaporan 2026
            </Badge>
          </div>
          <h1 className='text-foreground text-2xl font-bold tracking-tight md:text-3xl'>
            Pelacak Kepatuhan e-LHKPN & e-LHKASN
          </h1>
          <p className='text-muted-foreground text-sm'>
            Pemantauan 100% kepatuhan penyampaian bukti tanda terima pelaporan
            harta kekayaan seluruh pejabat dan ASN BPS Kabupaten Kepulauan
            Sitaro sebelum batas akhir 31 Maret.
          </p>
        </div>

        {/* Action Buttons Top */}
        <div className='flex flex-wrap items-center gap-2.5'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isPending}
            className='h-9'
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
            />
            Segarkan
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsPrintModalOpen(true)}
            className='h-9'
          >
            <Printer className='mr-1.5 h-3.5 w-3.5 text-slate-600 dark:text-slate-300' />
            Cetak Berita Acara A4
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setUploadForm({
                id: '',
                nama_pegawai: '',
                nip: '',
                tipe_laporan: 'LHKASN',
                tanggal_lapor: new Date().toISOString().split('T')[0],
                nomor_tanda_terima: '',
                bukti_tanda_terima_url: '',
                catatan_tambahan: ''
              });
              setIsUploadOpen(true);
            }}
            className='h-9 border-blue-200 bg-blue-50/50 text-blue-700 hover:bg-blue-100/60 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-blue-300'
          >
            <Upload className='mr-1.5 h-3.5 w-3.5' />
            Unggah Bukti Lapor
          </Button>

          <Button
            size='sm'
            onClick={() => setIsBroadcastOpen(true)}
            disabled={isPending || pendingReports.length === 0}
            className='h-9 bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
          >
            <Send className='mr-1.5 h-3.5 w-3.5' />
            Kirim Pengingat Serentak ({pendingReports.length})
          </Button>
        </div>
      </div>

      {/* 2. Banner Syarat Mutlak WBK */}
      {summary.persentase_kepatuhan < 100 ? (
        <div className='relative overflow-hidden rounded-xl border border-amber-300 bg-amber-50/80 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 rounded-full bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300'>
              <AlertTriangle className='h-5 w-5' />
            </div>
            <div className='space-y-1 text-sm'>
              <h4 className='font-semibold text-amber-900 dark:text-amber-200'>
                Target Kepatuhan 100% KemenPAN-RB (Syarat Mutlak Evaluasi
                ZI-WBK)
              </h4>
              <p className='text-amber-800/90 dark:text-amber-300/90'>
                Kepatuhan penyampaian e-LHKPN & e-LHKASN merupakan indikator
                penggugur (<em>threshold gatekeeper</em>). Jika terdapat minimal
                1 (satu) pegawai yang belum lapor hingga{' '}
                <strong>31 Maret 2026</strong>, BPS Kabupaten Kepulauan Sitaro
                otomatis tidak dapat diusulkan mendapat predikat{' '}
                <strong>Wilayah Bebas dari Korupsi (WBK)</strong>.
              </p>
              <div className='pt-1 text-xs font-medium text-amber-700 dark:text-amber-400'>
                Saat ini: <strong>{summary.sudah_lapor}</strong> dari{' '}
                <strong>{summary.total_wajib_lapor}</strong> pegawai telah
                diverifikasi lapor ({summary.persentase_kepatuhan}%). Masih ada{' '}
                <strong>{summary.belum_lapor} pegawai belum lapor</strong> dan{' '}
                <strong>{summary.proses_verifikasi} dalam verifikasi</strong>.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative overflow-hidden rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30'>
          <div className='flex items-start gap-3'>
            <div className='mt-0.5 rounded-full bg-emerald-100 p-2 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-300'>
              <CheckCircle2 className='h-5 w-5' />
            </div>
            <div className='space-y-1 text-sm'>
              <h4 className='font-semibold text-emerald-900 dark:text-emerald-200'>
                Selamat! Kepatuhan 100% Sempurna Telah Tercapai
              </h4>
              <p className='text-emerald-800/90 dark:text-emerald-300/90'>
                Seluruh {summary.total_wajib_lapor} pegawai dan pejabat BPS
                Kabupaten Kepulauan Sitaro telah menyampaikan bukti tanda terima
                e-LHKPN & e-LHKASN tepat waktu. Dokumen siap dicetak untuk
                pemenuhan LKE ZI Pilar 5 Pengawasan & Pilar 3 Manajemen SDM.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. Kartu Metrik Kepatuhan */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Card 1: Total Kepatuhan */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-muted-foreground font-medium'>
                Tingkat Kepatuhan Satker
              </CardDescription>
              <Badge
                variant={
                  summary.persentase_kepatuhan === 100
                    ? 'default'
                    : summary.persentase_kepatuhan >= 80
                      ? 'secondary'
                      : 'destructive'
                }
                className={
                  summary.persentase_kepatuhan === 100
                    ? 'bg-emerald-600 text-white'
                    : ''
                }
              >
                {summary.persentase_kepatuhan === 100
                  ? 'Target Tercapai'
                  : 'Target: 100%'}
              </Badge>
            </div>
            <CardTitle className='text-3xl font-extrabold tracking-tight'>
              {summary.persentase_kepatuhan}%
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-2 pb-3'>
            <Progress
              value={summary.persentase_kepatuhan}
              className='bg-muted h-2.5'
            />
            <div className='text-muted-foreground flex items-center justify-between text-xs'>
              <span>
                <strong>{summary.sudah_lapor}</strong> dari{' '}
                <strong>{summary.total_wajib_lapor}</strong> Pegawai
              </span>
              <span>{summary.belum_lapor} Belum Lapor</span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Countdown 31 Maret */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-muted-foreground font-medium'>
                Batas Akhir Pelaporan
              </CardDescription>
              <div className='rounded-md bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400'>
                <Calendar className='h-4 w-4' />
              </div>
            </div>
            <CardTitle className='text-3xl font-extrabold tracking-tight text-blue-600 dark:text-blue-400'>
              {summary.days_until_deadline > 0
                ? `${summary.days_until_deadline} Hari`
                : 'Lewat Tempo'}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1 pb-3 text-xs'>
            <div className='text-foreground flex items-center gap-1.5 font-medium'>
              <Clock className='h-3.5 w-3.5 text-blue-500' />
              31 Maret 2026 (23:59 WITA)
            </div>
            <p>
              {summary.days_until_deadline <= 7
                ? '⚠️ Masa kritis H-7 pengingat intensif'
                : summary.days_until_deadline <= 14
                  ? 'Pengingat berkala H-14 aktif'
                  : 'Siklus pengingat aktif (H-30, H-14, H-7)'}
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Wajib LHKPN */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-muted-foreground font-medium'>
                e-LHKPN (Penyelenggara Negara)
              </CardDescription>
              <Badge
                variant='outline'
                className='border-indigo-500/30 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300'
              >
                KPK RI
              </Badge>
            </div>
            <CardTitle className='text-3xl font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400'>
              {summary.lhkpn_sudah} / {summary.total_lhkpn}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1 pb-3 text-xs'>
            <div className='flex items-center justify-between'>
              <span>Sudah: {summary.lhkpn_sudah}</span>
              <span>Verif: {summary.lhkpn_verifikasi}</span>
              <span className='font-semibold text-rose-600 dark:text-rose-400'>
                Belum: {summary.lhkpn_belum}
              </span>
            </div>
            <p className='text-muted-foreground truncate pt-0.5 text-[11px]'>
              Kepala BPS, Kasubbag, PPK, PPBJ, Bendahara
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Wajib LHKASN */}
        <Card className='border-border/60 shadow-sm'>
          <CardHeader className='pb-2'>
            <div className='flex items-center justify-between'>
              <CardDescription className='text-muted-foreground font-medium'>
                e-LHKASN (Aparatur Sipil Negara)
              </CardDescription>
              <Badge
                variant='outline'
                className='border-teal-500/30 bg-teal-500/10 text-teal-700 dark:text-teal-300'
              >
                MenPAN-RB
              </Badge>
            </div>
            <CardTitle className='text-3xl font-extrabold tracking-tight text-teal-600 dark:text-teal-400'>
              {summary.lhkasn_sudah} / {summary.total_lhkasn}
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1 pb-3 text-xs'>
            <div className='flex items-center justify-between'>
              <span>Sudah: {summary.lhkasn_sudah}</span>
              <span>Verif: {summary.lhkasn_verifikasi}</span>
              <span className='font-semibold text-rose-600 dark:text-rose-400'>
                Belum: {summary.lhkasn_belum}
              </span>
            </div>
            <p className='text-muted-foreground truncate pt-0.5 text-[11px]'>
              Statistisi, Pranata Komputer, Keuangan, Arsiparis
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Filter Tabs & Pencarian */}
      <div className='space-y-3'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full sm:w-auto'
          >
            <TabsList className='grid grid-cols-3 sm:flex sm:h-9'>
              <TabsTrigger value='all' className='text-xs'>
                Semua ({reports.length})
              </TabsTrigger>
              <TabsTrigger value='LHKPN' className='text-xs'>
                Wajib LHKPN ({summary.total_lhkpn})
              </TabsTrigger>
              <TabsTrigger value='LHKASN' className='text-xs'>
                Wajib LHKASN ({summary.total_lhkasn})
              </TabsTrigger>
              <TabsTrigger value='BELUM_LAPOR' className='text-xs'>
                Belum Lapor ({summary.belum_lapor})
              </TabsTrigger>
              <TabsTrigger value='PROSES_VERIFIKASI' className='text-xs'>
                Verifikasi ({summary.proses_verifikasi})
              </TabsTrigger>
              <TabsTrigger value='SUDAH_LAPOR' className='text-xs'>
                Sudah Lapor ({summary.sudah_lapor})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className='relative w-full sm:w-72'>
            <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              placeholder='Cari nama, NIP, jabatan...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='h-9 pl-9 text-xs'
            />
          </div>
        </div>
      </div>

      {/* 5. Tabel Pemantauan Pegawai */}
      <Card className='border-border/60 overflow-hidden shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-sm'>
            <thead className='bg-muted/40 text-muted-foreground border-b text-xs font-medium'>
              <tr>
                <th className='w-12 px-4 py-3 text-center'>No</th>
                <th className='px-4 py-3'>Pegawai / NIP</th>
                <th className='px-4 py-3'>Jabatan / Posisi</th>
                <th className='px-4 py-3 text-center'>Kategori</th>
                <th className='px-4 py-3 text-center'>Status Kepatuhan</th>
                <th className='px-4 py-3'>Tanda Terima Elektronik</th>
                <th className='px-4 py-3 text-center'>Pengingat WA</th>
                <th className='px-4 py-3 text-right'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-border/40 divide-y'>
              {filteredReports.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className='text-muted-foreground py-8 text-center text-sm'
                  >
                    Tidak ada pegawai yang sesuai dengan filter atau kata kunci
                    pencarian.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report, idx) => {
                  const isBelum = report.status === 'BELUM_LAPOR';
                  const isVerif = report.status === 'PROSES_VERIFIKASI';
                  const isSudah = report.status === 'SUDAH_LAPOR';

                  return (
                    <tr
                      key={report.id}
                      className='hover:bg-muted/30 transition-colors'
                    >
                      {/* No */}
                      <td className='text-muted-foreground px-4 py-3 text-center text-xs'>
                        {idx + 1}
                      </td>

                      {/* Pegawai / NIP */}
                      <td className='px-4 py-3'>
                        <div className='text-foreground font-semibold'>
                          {report.nama_pegawai}
                        </div>
                        <div className='text-muted-foreground flex items-center gap-1.5 font-mono text-xs'>
                          <span>NIP: {report.nip}</span>
                        </div>
                      </td>

                      {/* Jabatan */}
                      <td className='px-4 py-3'>
                        <div className='text-muted-foreground max-w-[200px] text-xs leading-relaxed'>
                          {report.jabatan}
                        </div>
                      </td>

                      {/* Kategori Laporan */}
                      <td className='px-4 py-3 text-center'>
                        <Badge
                          variant='outline'
                          className={
                            report.tipe_laporan === 'LHKPN'
                              ? 'border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300'
                              : 'border-teal-400 bg-teal-50 text-teal-700 dark:border-teal-900/60 dark:bg-teal-950/40 dark:text-teal-300'
                          }
                        >
                          {report.tipe_laporan === 'LHKPN'
                            ? 'e-LHKPN'
                            : 'e-LHKASN'}
                        </Badge>
                      </td>

                      {/* Status Kepatuhan */}
                      <td className='px-4 py-3 text-center'>
                        {isSudah && (
                          <Badge className='bg-emerald-600 text-white hover:bg-emerald-700'>
                            <CheckCircle2 className='mr-1 h-3 w-3' />
                            Sudah Lapor
                          </Badge>
                        )}
                        {isVerif && (
                          <Badge
                            variant='outline'
                            className='border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
                          >
                            <Clock className='mr-1 h-3 w-3 animate-spin' />
                            Verifikasi
                          </Badge>
                        )}
                        {isBelum && (
                          <Badge
                            variant='destructive'
                            className='bg-rose-600 text-white hover:bg-rose-700'
                          >
                            <AlertCircle className='mr-1 h-3 w-3' />
                            Belum Lapor
                          </Badge>
                        )}
                      </td>

                      {/* Tanda Terima */}
                      <td className='px-4 py-3'>
                        {report.nomor_tanda_terima ? (
                          <div className='space-y-1 text-xs'>
                            <div className='text-foreground flex items-center gap-1 font-mono font-medium'>
                              <span>{report.nomor_tanda_terima}</span>
                              <button
                                onClick={() =>
                                  copyReceiptNumber(report.nomor_tanda_terima)
                                }
                                title='Salin Nomor'
                                className='text-muted-foreground hover:text-foreground'
                              >
                                {copiedReceiptId ===
                                report.nomor_tanda_terima ? (
                                  <Check className='h-3 w-3 text-emerald-600' />
                                ) : (
                                  <Copy className='h-3 w-3' />
                                )}
                              </button>
                            </div>
                            <div className='text-muted-foreground flex items-center gap-2 text-[11px]'>
                              <span>Tgl: {report.tanggal_lapor || '-'}</span>
                              {report.bukti_tanda_terima_url && (
                                <a
                                  href={report.bukti_tanda_terima_url}
                                  target='_blank'
                                  rel='noopener noreferrer'
                                  className='inline-flex items-center text-blue-600 hover:underline dark:text-blue-400'
                                >
                                  <ExternalLink className='mr-0.5 h-3 w-3' />
                                  Berkas
                                </a>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className='text-muted-foreground text-xs italic'>
                            Belum ada tanda terima
                          </span>
                        )}
                      </td>

                      {/* Pengingat WA */}
                      <td className='px-4 py-3 text-center'>
                        <div className='inline-flex flex-col items-center justify-center'>
                          <Badge
                            variant='secondary'
                            className={`text-xs ${
                              report.reminder_count > 0
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            <MessageSquare className='mr-1 h-3 w-3' />
                            {report.reminder_count}x dikirim
                          </Badge>
                          {report.last_reminder_sent_at && (
                            <span className='text-muted-foreground pt-1 text-[10px]'>
                              {new Date(
                                report.last_reminder_sent_at
                              ).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short'
                              })}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Aksi */}
                      <td className='px-4 py-3 text-right'>
                        <div className='flex items-center justify-end gap-1.5'>
                          {/* Tombol Kirim WA */}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleSendPersonalReminder(report)}
                            disabled={isPending}
                            title={`Kirim pengingat WhatsApp ke ${report.nama_pegawai}`}
                            className='h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                          >
                            <Send className='h-4 w-4' />
                          </Button>

                          {/* Tombol Verifikasi (jika PROSES_VERIFIKASI) */}
                          {isVerif && (
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={() => openVerifyDialog(report)}
                              className='h-8 border-amber-300 bg-amber-50 text-xs text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-200'
                            >
                              <UserCheck className='mr-1 h-3.5 w-3.5' />
                              Verifikasi
                            </Button>
                          )}

                          {/* Tombol Unggah / Update Bukti */}
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => openUploadFor(report)}
                            title='Unggah Bukti Tanda Terima'
                            className='text-muted-foreground hover:text-foreground h-8 w-8 p-0'
                          >
                            <Upload className='h-4 w-4' />
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
      </Card>

      {/* 6. DIALOG: Unggah Bukti Tanda Terima */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <Upload className='h-5 w-5 text-blue-600' />
              Unggah Bukti Tanda Terima
            </DialogTitle>
            <DialogDescription>
              Submit nomor dan berkas tanda terima pelaporan harta kekayaan
              (e-LHKPN / e-LHKASN) untuk diverifikasi oleh Tim Kepatuhan BPS
              Sitaro.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleUploadSubmit} className='space-y-3.5 py-2'>
            {/* Pegawai */}
            <div className='space-y-1'>
              <Label className='text-xs'>Pegawai Wajib Lapor</Label>
              <select
                className='border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none'
                value={uploadForm.id}
                onChange={(e) => {
                  const rep = reports.find((r) => r.id === e.target.value);
                  if (rep) {
                    setUploadForm({
                      ...uploadForm,
                      id: rep.id,
                      nama_pegawai: rep.nama_pegawai,
                      nip: rep.nip,
                      tipe_laporan: rep.tipe_laporan,
                      nomor_tanda_terima: rep.nomor_tanda_terima || '',
                      bukti_tanda_terima_url: rep.bukti_tanda_terima_url || '',
                      catatan_tambahan: rep.catatan_verifikasi || ''
                    });
                  }
                }}
              >
                <option value=''>-- Pilih Pegawai --</option>
                {reports.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nama_pegawai} ({r.tipe_laporan} - {r.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Kategori Laporan */}
            <div className='space-y-1'>
              <Label className='text-xs'>Kategori Laporan</Label>
              <select
                className='border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-sm transition-colors focus-visible:ring-1 focus-visible:outline-none'
                value={uploadForm.tipe_laporan}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    tipe_laporan: e.target.value as TipeLaporanHarta
                  })
                }
              >
                <option value='LHKPN'>
                  e-LHKPN (KPK RI - Penyelenggara Negara)
                </option>
                <option value='LHKASN'>
                  e-LHKASN (KemenPAN-RB - Seluruh ASN)
                </option>
              </select>
            </div>

            {/* Tanggal Lapor */}
            <div className='space-y-1'>
              <Label className='text-xs'>Tanggal Penyampaian Laporan</Label>
              <Input
                type='date'
                value={uploadForm.tanggal_lapor}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    tanggal_lapor: e.target.value
                  })
                }
                className='h-9 text-sm'
                required
              />
            </div>

            {/* Nomor Tanda Terima */}
            <div className='space-y-1'>
              <Label className='text-xs'>
                Nomor Tanda Terima Elektronik Resmi *
              </Label>
              <Input
                placeholder='Contoh: KPK-LHKPN/2026/02/7108004 atau MENPAN-ASN/2026/02/7108012'
                value={uploadForm.nomor_tanda_terima}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    nomor_tanda_terima: e.target.value
                  })
                }
                className='h-9 font-mono text-sm'
                required
              />
            </div>

            {/* URL Bukti Berkas */}
            <div className='space-y-1'>
              <Label className='text-xs'>
                Tautan Berkas PDF / Google Drive Tanda Terima
              </Label>
              <Input
                placeholder='https://drive.google.com/file/d/...'
                value={uploadForm.bukti_tanda_terima_url}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    bukti_tanda_terima_url: e.target.value
                  })
                }
                className='h-9 text-sm'
              />
              <span className='text-muted-foreground text-[11px]'>
                Pastikan hak akses tautan dapat dibuka oleh verifikator satker.
              </span>
            </div>

            {/* Catatan */}
            <div className='space-y-1'>
              <Label className='text-xs'>Catatan Tambahan (Opsional)</Label>
              <Textarea
                placeholder='Keterangan tambahan terkait pelaporan...'
                value={uploadForm.catatan_tambahan}
                onChange={(e) =>
                  setUploadForm({
                    ...uploadForm,
                    catatan_tambahan: e.target.value
                  })
                }
                className='h-18 text-xs'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsUploadOpen(false)}
              >
                Batal
              </Button>
              <Button
                type='submit'
                disabled={isPending || !uploadForm.nomor_tanda_terima}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                Kirim Bukti Lapor
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. DIALOG: Verifikasi Bukti Lapor (Kasubbag / Admin) */}
      <Dialog open={isVerifyOpen} onOpenChange={setIsVerifyOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg'>
              <UserCheck className='h-5 w-5 text-amber-600' />
              Verifikasi Tanda Terima Pelaporan
            </DialogTitle>
            <DialogDescription>
              Tinjau keabsahan berkas dan nomor tanda terima pelaporan harta
              kekayaan pegawai sebelum disahkan 100%.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className='space-y-3 py-2 text-sm'>
              <div className='bg-muted/30 space-y-1.5 rounded-lg border p-3'>
                <div className='text-foreground font-semibold'>
                  {selectedReport.nama_pegawai}
                </div>
                <div className='text-muted-foreground text-xs'>
                  NIP: {selectedReport.nip} | {selectedReport.jabatan}
                </div>
                <div className='flex items-center gap-2 pt-1'>
                  <Badge variant='outline'>
                    {selectedReport.tipe_laporan === 'LHKPN'
                      ? 'e-LHKPN KPK'
                      : 'e-LHKASN MenPAN-RB'}
                  </Badge>
                  <span className='font-mono text-xs font-medium'>
                    No: {selectedReport.nomor_tanda_terima || '-'}
                  </span>
                </div>
                {selectedReport.bukti_tanda_terima_url && (
                  <div className='pt-1'>
                    <a
                      href={selectedReport.bukti_tanda_terima_url}
                      target='_blank'
                      rel='noopener noreferrer'
                      className='inline-flex items-center text-xs text-blue-600 hover:underline'
                    >
                      <ExternalLink className='mr-1 h-3 w-3' />
                      Buka Tautan Berkas Tanda Terima
                    </a>
                  </div>
                )}
              </div>

              <div className='space-y-1'>
                <Label className='text-xs'>Catatan Verifikasi</Label>
                <Textarea
                  placeholder='Catatan hasil verifikasi (contoh: Dokumen telah absah diverifikasi e-filing)...'
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className='h-20 text-xs'
                />
              </div>

              <DialogFooter className='gap-2 pt-2 sm:justify-between'>
                <Button
                  type='button'
                  variant='destructive'
                  disabled={isPending}
                  onClick={() => handleVerifySubmit(false)}
                >
                  Tolak & Minta Perbaikan
                </Button>
                <Button
                  type='button'
                  disabled={isPending}
                  onClick={() => handleVerifySubmit(true)}
                  className='bg-emerald-600 text-white hover:bg-emerald-700'
                >
                  <CheckCircle2 className='mr-1.5 h-4 w-4' />
                  Setujui & Verifikasi Absah
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* 8. DIALOG: Broadcast Konfirmasi Pengingat Serentak */}
      <Dialog open={isBroadcastOpen} onOpenChange={setIsBroadcastOpen}>
        <DialogContent className='sm:max-w-lg'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg text-emerald-700 dark:text-emerald-400'>
              <Send className='h-5 w-5' />
              Siarkan Pengingat WhatsApp Serentak
            </DialogTitle>
            <DialogDescription>
              Sistem akan mengirimkan pesan pengingat resmi berkop BPS Kabupaten
              Kepulauan Sitaro ke nomor WhatsApp masing-masing pegawai yang
              belum menyampaikan tanda terima.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-3 py-2 text-sm'>
            <div className='rounded-lg border border-amber-200 bg-amber-50/60 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-200'>
              <strong>Sasaran Pengingat:</strong> Sebanyak{' '}
              <strong>{pendingReports.length} pegawai</strong> teridentifikasi
              belum lapor / dalam proses verifikasi.
            </div>

            <div className='max-h-52 space-y-1 overflow-y-auto rounded-md border p-2'>
              {pendingReports.map((r, i) => (
                <div
                  key={r.id}
                  className='hover:bg-muted/50 flex items-center justify-between rounded px-1.5 py-1 text-xs'
                >
                  <div>
                    <span className='text-foreground font-medium'>
                      {i + 1}. {r.nama_pegawai}
                    </span>
                    <span className='text-muted-foreground ml-1.5'>
                      ({r.tipe_laporan})
                    </span>
                  </div>
                  <Badge variant='outline' className='text-[10px]'>
                    {r.no_whatsapp}
                  </Badge>
                </div>
              ))}
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsBroadcastOpen(false)}
              >
                Batal
              </Button>
              <Button
                type='button'
                disabled={isPending || pendingReports.length === 0}
                onClick={handleBroadcastReminders}
                className='bg-emerald-600 text-white hover:bg-emerald-700'
              >
                <Send className='mr-1.5 h-3.5 w-3.5' />
                Kirim Pengingat Sekarang ({pendingReports.length})
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* 9. DIALOG: Cetak Rekapitulasi Berita Acara A4 (LKE ZI Dokumen Resmi) */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <DialogTitle className='flex items-center gap-2 text-lg'>
                <Printer className='h-5 w-5 text-blue-600' />
                Berita Acara Rekapitulasi Kepatuhan Pelaporan Harta Kekayaan
              </DialogTitle>
              <Button
                size='sm'
                onClick={() => window.print()}
                className='bg-blue-600 text-white hover:bg-blue-700 print:hidden'
              >
                <Printer className='mr-1.5 h-4 w-4' />
                Cetak Dokumen A4
              </Button>
            </div>
            <DialogDescription className='print:hidden'>
              Format Berita Acara Resmi ber-kop BPS Kabupaten Kepulauan Sitaro
              sebagai bukti dukung LKE Zona Integritas Pilar 5 Pengawasan &amp;
              Pilar 3 Manajemen SDM.
            </DialogDescription>
          </DialogHeader>

          {/* Area Dokumen Resmi Berkop */}
          <div className='space-y-5 rounded-lg border bg-white p-6 text-sm text-slate-900 shadow-sm print:border-none print:p-0 print:shadow-none'>
            {/* Kop Surat Resmi */}
            <div className='space-y-0.5 border-b-2 border-slate-900 pb-3 text-center'>
              <h2 className='text-base font-bold tracking-wider text-slate-900 uppercase'>
                BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SITARO
              </h2>
              <h3 className='text-xs font-semibold tracking-wide text-slate-700 uppercase'>
                TIM PENGAWASAN &amp; KEPATUHAN INTERNAL PEMBANGUNAN ZONA
                INTEGRITAS (WBK/WBBM)
              </h3>
              <p className='text-[11px] text-slate-600'>
                Kompleks Perkantoran Pemkab Sitaro, Kel. Paseng, Kec. Siau
                Barat, Kab. Kepl. Siau Tagulandang Biaro 95861
              </p>
            </div>

            {/* Judul Dokumen */}
            <div className='space-y-1 pt-1 text-center'>
              <h4 className='text-sm font-bold tracking-wide uppercase underline decoration-slate-900'>
                BERITA ACARA REKAPITULASI PENYAMPAIAN e-LHKPN &amp; e-LHKASN
              </h4>
              <p className='text-xs text-slate-700'>
                Nomor: B-082/7108/KP.300/02/2026 | Periode Tahun Pelaporan: 2026
              </p>
            </div>

            {/* Pernyataan */}
            <p className='text-justify text-xs leading-relaxed text-slate-800'>
              Pada hari ini, tanggal{' '}
              <strong>
                {new Date().toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </strong>
              , Tim Pengawasan Internal dan Subbagian Umum Badan Pusat Statistik
              Kabupaten Kepulauan Siau Tagulandang Biaro (Sitaro) telah
              melakukan rekapitulasi dan verifikasi kepatuhan penyampaian bukti
              tanda terima Laporan Harta Kekayaan Penyelenggara Negara (e-LHKPN
              KPK) dan Laporan Harta Kekayaan Aparatur Sipil Negara (e-LHKASN
              KemenPAN-RB) dengan hasil rekapitulasi sebagai berikut:
            </p>

            {/* Ringkasan Angka */}
            <div className='grid grid-cols-4 gap-2 text-center text-xs'>
              <div className='rounded border bg-slate-50 p-2'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Total Wajib Lapor
                </div>
                <div className='text-lg font-bold text-slate-900'>
                  {summary.total_wajib_lapor} Orang
                </div>
              </div>
              <div className='rounded border bg-slate-50 p-2'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Sudah Terverifikasi
                </div>
                <div className='text-lg font-bold text-emerald-700'>
                  {summary.sudah_lapor} Orang
                </div>
              </div>
              <div className='rounded border bg-slate-50 p-2'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Proses Verifikasi
                </div>
                <div className='text-lg font-bold text-amber-700'>
                  {summary.proses_verifikasi} Orang
                </div>
              </div>
              <div className='rounded border bg-slate-50 p-2'>
                <div className='text-[10px] font-semibold text-slate-500 uppercase'>
                  Persentase Capaian
                </div>
                <div className='text-lg font-bold text-blue-700'>
                  {summary.persentase_kepatuhan}%
                </div>
              </div>
            </div>

            {/* Tabel Cetak Lengkap 18 Pegawai */}
            <div className='overflow-hidden rounded border'>
              <table className='w-full border-collapse text-left text-[10.5px]'>
                <thead className='border-b bg-slate-100 font-semibold text-slate-800'>
                  <tr>
                    <th className='w-8 border-r p-1.5 text-center'>No</th>
                    <th className='border-r p-1.5'>Nama Pegawai / NIP</th>
                    <th className='border-r p-1.5'>Jabatan</th>
                    <th className='w-16 border-r p-1.5 text-center'>Jenis</th>
                    <th className='border-r p-1.5'>No. Tanda Terima</th>
                    <th className='w-20 border-r p-1.5 text-center'>
                      Tgl Lapor
                    </th>
                    <th className='w-24 p-1.5 text-center'>Status</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-slate-200'>
                  {reports.map((r, i) => (
                    <tr key={r.id}>
                      <td className='border-r p-1.5 text-center text-slate-600'>
                        {i + 1}
                      </td>
                      <td className='border-r p-1.5'>
                        <div className='font-semibold text-slate-900'>
                          {r.nama_pegawai}
                        </div>
                        <div className='font-mono text-[9.5px] text-slate-600'>
                          {r.nip}
                        </div>
                      </td>
                      <td className='border-r p-1.5 leading-tight text-slate-700'>
                        {r.jabatan}
                      </td>
                      <td className='border-r p-1.5 text-center font-semibold text-slate-800'>
                        {r.tipe_laporan}
                      </td>
                      <td className='border-r p-1.5 font-mono text-[9.5px] text-slate-800'>
                        {r.nomor_tanda_terima || '-'}
                      </td>
                      <td className='border-r p-1.5 text-center text-slate-700'>
                        {r.tanggal_lapor || '-'}
                      </td>
                      <td className='p-1.5 text-center font-medium'>
                        {r.status === 'SUDAH_LAPOR' && (
                          <span className='font-semibold text-emerald-700'>
                            LENGKAP
                          </span>
                        )}
                        {r.status === 'PROSES_VERIFIKASI' && (
                          <span className='font-semibold text-amber-700'>
                            VERIFIKASI
                          </span>
                        )}
                        {r.status === 'BELUM_LAPOR' && (
                          <span className='font-semibold text-rose-700'>
                            BELUM
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Bagian Tanda Tangan */}
            <div className='grid grid-cols-2 pt-6 text-center text-xs text-slate-900'>
              <div className='space-y-16'>
                <p>
                  Mengetahui,
                  <br />
                  <strong>Kepala BPS Kabupaten Kepulauan Sitaro</strong>
                </p>
                <div>
                  <p className='font-bold underline'>
                    Inke Margareth Tambeo, SST., M.Ec.Dev.
                  </p>
                  <p className='text-slate-600'>NIP. 198403232007012003</p>
                </div>
              </div>

              <div className='space-y-16'>
                <p>
                  Ondong Siau,{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  <br />
                  <strong>Kepala Subbagian Umum &amp; Tim Kepatuhan</strong>
                </p>
                <div>
                  <p className='font-bold underline'>Franky Pontoh, S.Si</p>
                  <p className='text-slate-600'>NIP. 198103142006041002</p>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
