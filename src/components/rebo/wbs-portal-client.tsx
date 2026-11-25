'use client';

import React, { useState, useTransition } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  EyeOff,
  UserCheck,
  Search,
  Send,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle,
  FileText,
  Clock,
  Sparkles,
  ChevronRight,
  Info,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  LaporanPengaduanWBS,
  CreateWBSInput,
  KategoriWBS,
  KATEGORI_WBS_METADATA,
  STATUS_WBS_METADATA
} from '@/lib/wbs/wbs-types';
import {
  submitLaporanWBSAction,
  trackLaporanWBSAction
} from '@/actions/wbs-actions';

interface WBSPortalClientProps {
  initialTicket?: string;
}

export default function WBSPortalClient({
  initialTicket
}: WBSPortalClientProps) {
  const [activeTab, setActiveTab] = useState<string>(
    initialTicket ? 'lacak' : 'lapor'
  );
  const [isPending, startTransition] = useTransition();

  // Form State
  const [formData, setFormData] = useState<CreateWBSInput>({
    kategori: 'GRATIFIKASI_PUNGLI',
    subjek: '',
    rincian_kejadian: '',
    lokasi_kejadian: '',
    perkiraan_tanggal_kejadian: '',
    terlapor_nama_or_unit: '',
    is_anonim: true,
    pelapor_nama: '',
    pelapor_kontak: '',
    lampiran_bukti_url: ''
  });

  // Success Modal State
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdTicketInfo, setCreatedTicketInfo] = useState<{
    ticket_code: string;
    tanggal_lapor: string;
    wa_sent: boolean;
  } | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  // Tracking State
  const [trackingInput, setTrackingInput] = useState<string>(
    initialTicket || ''
  );
  const [trackedReport, setTrackedReport] =
    useState<LaporanPengaduanWBS | null>(null);
  const [isTrackingPending, startTrackingTransition] = useTransition();

  // Handle Form Input Change
  const handleChange = (
    field: keyof CreateWBSInput,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subjek.trim()) {
      toast.error('Subjek pengaduan wajib diisi.');
      return;
    }
    if (!formData.rincian_kejadian.trim()) {
      toast.error('Rincian kronologi kejadian wajib diuraikan.');
      return;
    }
    if (!formData.lokasi_kejadian.trim()) {
      toast.error('Lokasi kejadian wajib diisi.');
      return;
    }
    if (!formData.perkiraan_tanggal_kejadian) {
      toast.error('Perkiraan tanggal kejadian wajib diisi.');
      return;
    }
    if (!formData.terlapor_nama_or_unit.trim()) {
      toast.error('Pihak/Unit terlapor wajib diisi.');
      return;
    }

    startTransition(async () => {
      const res = await submitLaporanWBSAction(formData);
      if (res.success && res.data) {
        setCreatedTicketInfo({
          ticket_code: res.data.ticket_code,
          tanggal_lapor: res.data.tanggal_lapor,
          wa_sent: res.data.wa_sent
        });
        setSuccessModalOpen(true);
        // Reset form
        setFormData({
          kategori: 'GRATIFIKASI_PUNGLI',
          subjek: '',
          rincian_kejadian: '',
          lokasi_kejadian: '',
          perkiraan_tanggal_kejadian: '',
          terlapor_nama_or_unit: '',
          is_anonim: true,
          pelapor_nama: '',
          pelapor_kontak: '',
          lampiran_bukti_url: ''
        });
      } else {
        toast.error(res.error || 'Gagal mengirimkan laporan pengaduan.');
      }
    });
  };

  // Tracking Handler
  const handleTrack = (ticketToQuery?: string) => {
    const code = ticketToQuery || trackingInput;
    if (!code.trim()) {
      toast.error('Silakan masukkan nomor tiket pengaduan.');
      return;
    }

    startTrackingTransition(async () => {
      const res = await trackLaporanWBSAction(code);
      if (res.success && res.data) {
        setTrackedReport(res.data);
        toast.success(`Tiket ${res.data.ticket_code} berhasil ditemukan!`);
      } else {
        setTrackedReport(null);
        toast.error(res.error || 'Tiket pengaduan tidak ditemukan.');
      }
    });
  };

  // Copy Ticket Code
  const handleCopyTicket = (code: string) => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    toast.success('Nomor tiket berhasil disalin ke clipboard.');
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Stepper helper
  const getStepStatus = (
    stepIdx: number,
    currentStatus: LaporanPengaduanWBS['status']
  ) => {
    if (currentStatus === 'DITOLAK') {
      return 'rejected';
    }
    const currentStepIdx = STATUS_WBS_METADATA[currentStatus]?.stepIndex || 1;
    if (stepIdx < currentStepIdx) return 'completed';
    if (stepIdx === currentStepIdx) return 'active';
    return 'pending';
  };

  return (
    <div className='mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 lg:px-8'>
      {/* ============================================================================== */}
      {/* 1. HERO BANNER & JAMINAN KERAHASIAAN */}
      {/* ============================================================================== */}
      <div className='relative overflow-hidden rounded-3xl border border-indigo-100 bg-linear-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl sm:p-10 dark:border-indigo-950'>
        <div className='absolute -top-16 -right-16 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl' />
        <div className='absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl' />

        <div className='relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-3xl space-y-3'>
            <div className='inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/20 px-3.5 py-1 text-xs font-semibold text-indigo-300'>
              <ShieldAlert className='h-3.5 w-3.5 text-indigo-400' />
              Pilar 5: Penguatan Pengawasan • Bukti Dukung Zona Integritas (ZI)
            </div>

            <h1 className='text-3xl font-extrabold tracking-tight text-white sm:text-4xl'>
              Kanal Pengaduan & Whistleblowing System (WBS)
            </h1>

            <p className='text-sm leading-relaxed text-indigo-200/90 sm:text-base'>
              Layanan pelaporan pelanggaran kode etik, gratifikasi, pungli,
              benturan kepentingan, dan maladministrasi di lingkungan{' '}
              <strong className='text-white'>
                BPS Kabupaten Kepulauan Sitaro
              </strong>
              . Dilindungi enkripsi sistem dan jaminan 100% anonimitas sesuai UU
              Perlindungan Saksi & Korban serta kode etik BPS RI.
            </p>

            <div className='flex flex-wrap items-center gap-3 pt-2 text-xs text-indigo-300'>
              <span className='inline-flex items-center gap-1.5 rounded-md border border-indigo-800/60 bg-indigo-900/50 px-2.5 py-1'>
                <Lock className='h-3.5 w-3.5 text-emerald-400' />
                Enkripsi TLS & Anonim 100%
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-md border border-indigo-800/60 bg-indigo-900/50 px-2.5 py-1'>
                <ShieldCheck className='h-3.5 w-3.5 text-emerald-400' />
                Terhubung Langsung ke Tim Kepatuhan
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-md border border-indigo-800/60 bg-indigo-900/50 px-2.5 py-1'>
                <Clock className='h-3.5 w-3.5 text-emerald-400' />
                Respon Cepat 2x24 Jam Kerja
              </span>
            </div>
          </div>

          <div className='flex flex-col gap-2 rounded-2xl border border-indigo-500/20 bg-indigo-950/60 p-5 backdrop-blur-xs lg:w-72'>
            <div className='text-xs font-semibold tracking-wider text-indigo-300 uppercase'>
              Hotline Tim Kepatuhan
            </div>
            <div className='text-lg font-bold text-white'>
              BPS Sitaro Pengawasan
            </div>
            <p className='text-xs leading-normal text-indigo-300/80'>
              Laporan yang masuk otomatis diteruskan melalui WhatsApp Gateway ke
              Ketua Tim Penguatan Pengawasan (Pilar 5).
            </p>
            <div className='mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400'>
              <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-400' />
              Sistem Aktif & Terpantau 24/7
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. TABS NAVIGASI: BUAT LAPORAN BARU vs LACAK TIKET */}
      {/* ============================================================================== */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className='w-full space-y-6'
      >
        <div className='flex justify-center'>
          <TabsList className='grid h-12 w-full max-w-md grid-cols-2 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80'>
            <TabsTrigger
              value='lapor'
              className='gap-2 rounded-lg text-xs font-semibold sm:text-sm'
            >
              <Send className='h-4 w-4 text-indigo-600' />
              Buat Pengaduan Baru
            </TabsTrigger>
            <TabsTrigger
              value='lacak'
              className='gap-2 rounded-lg text-xs font-semibold sm:text-sm'
            >
              <Search className='h-4 w-4 text-blue-600' />
              Lacak Tiket Aduan
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ============================================================================ */}
        {/* TAB 1: FORMULIR BUAT PENGADUAN BARU */}
        {/* ============================================================================ */}
        <TabsContent value='lapor' className='space-y-6'>
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-6 border-b border-slate-100 pb-5 dark:border-slate-800'>
              <h2 className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                Formulir Pelaporan Whistleblowing (WBS)
              </h2>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                Berikan informasi yang akurat dan beritikad baik. Bukti
                permulaan seperti dokumen, foto, atau tautan akan mempercepat
                proses penelaahan Tim Kepatuhan Internal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className='space-y-6'>
              {/* TOGGLE MODE ANONIMITAS */}
              <div className='rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-4.5 transition-all dark:border-indigo-900/60 dark:bg-indigo-950/20'>
                <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      {formData.is_anonim ? (
                        <EyeOff className='h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400' />
                      ) : (
                        <UserCheck className='h-4.5 w-4.5 text-blue-600 dark:text-blue-400' />
                      )}
                      <span className='font-bold text-slate-900 dark:text-slate-100'>
                        {formData.is_anonim
                          ? 'Mode Pengaduan Anonim (Aktif)'
                          : 'Mode Pengaduan dengan Identitas'}
                      </span>
                      <Badge
                        variant='outline'
                        className={
                          formData.is_anonim
                            ? 'border-indigo-300 bg-indigo-100/80 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
                            : 'border-slate-300 bg-slate-100 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                        }
                      >
                        {formData.is_anonim ? '100% Rahasia' : 'Terbuka'}
                      </Badge>
                    </div>
                    <p className='max-w-xl text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                      {formData.is_anonim
                        ? 'Nama dan nomor kontak Anda TIDAK AKAN DISIMPAN di sistem atau diteruskan ke siapa pun. Hanya rincian laporan yang masuk ke verifikasi.'
                        : 'Nama dan kontak Anda dicatat untuk mempermudah Tim Kepatuhan menghubungi Anda jika membutuhkan konfirmasi bukti tambahan.'}
                    </p>
                  </div>

                  <div className='flex items-center gap-2.5 self-start sm:self-center'>
                    <Label
                      htmlFor='toggle-anonim'
                      className='cursor-pointer text-xs font-semibold'
                    >
                      Kirim Anonim
                    </Label>
                    <Switch
                      id='toggle-anonim'
                      checked={formData.is_anonim}
                      onCheckedChange={(checked) =>
                        handleChange('is_anonim', checked)
                      }
                    />
                  </div>
                </div>

                {/* Optional Pelapor Form if Not Anonim */}
                {!formData.is_anonim && (
                  <div className='mt-4 grid grid-cols-1 gap-4 border-t border-indigo-100 pt-4 sm:grid-cols-2 dark:border-indigo-900/40'>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>
                        Nama Lengkap Pelapor
                      </Label>
                      <Input
                        placeholder='Nama Anda atau inisial'
                        value={formData.pelapor_nama || ''}
                        onChange={(e) =>
                          handleChange('pelapor_nama', e.target.value)
                        }
                        className='bg-white dark:bg-slate-900'
                      />
                    </div>
                    <div className='space-y-1.5'>
                      <Label className='text-xs font-semibold'>
                        Nomor WhatsApp / Email Kontak
                      </Label>
                      <Input
                        placeholder='Contoh: 0821xxxxxxxx atau nama@email.com'
                        value={formData.pelapor_kontak || ''}
                        onChange={(e) =>
                          handleChange('pelapor_kontak', e.target.value)
                        }
                        className='bg-white dark:bg-slate-900'
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* KATEGORI PENGADUAN */}
              <div className='space-y-2'>
                <Label className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Kategori Pengaduan <span className='text-rose-500'>*</span>
                </Label>
                <Select
                  value={formData.kategori}
                  onValueChange={(val) =>
                    handleChange('kategori', val as KategoriWBS)
                  }
                >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder='Pilih Kategori Pelanggaran' />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(KATEGORI_WBS_METADATA) as KategoriWBS[]).map(
                      (kat) => {
                        const meta = KATEGORI_WBS_METADATA[kat];
                        return (
                          <SelectItem key={kat} value={kat}>
                            <div className='flex flex-col py-0.5 text-left'>
                              <span className='font-semibold text-slate-900 dark:text-slate-100'>
                                {meta.label}
                              </span>
                              <span className='line-clamp-1 text-[11px] text-slate-500'>
                                {meta.deskripsi}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      }
                    )}
                  </SelectContent>
                </Select>
                {formData.kategori && (
                  <p className='text-xs text-slate-500 italic dark:text-slate-400'>
                    ℹ️ {KATEGORI_WBS_METADATA[formData.kategori]?.deskripsi}
                  </p>
                )}
              </div>

              {/* SUBJEK PENGADUAN */}
              <div className='space-y-2'>
                <Label className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Subjek / Pokok Permasalahan Aduan{' '}
                  <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  placeholder='Contoh: Dugaan Permintaan Tip Informal saat Pelayanan Konsultasi PST'
                  value={formData.subjek}
                  onChange={(e) => handleChange('subjek', e.target.value)}
                  required
                />
              </div>

              {/* TERLAPOR & LOKASI & TANGGAL */}
              <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                    Pihak / Unit Terlapor{' '}
                    <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    placeholder='Nama oknum atau unit kerja (misal: PST / Bagian Umum)'
                    value={formData.terlapor_nama_or_unit}
                    onChange={(e) =>
                      handleChange('terlapor_nama_or_unit', e.target.value)
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                    Lokasi Tempat Kejadian{' '}
                    <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    placeholder='Contoh: Ruang PST Kantor BPS Sitaro / Wilayah Siau Timur'
                    value={formData.lokasi_kejadian}
                    onChange={(e) =>
                      handleChange('lokasi_kejadian', e.target.value)
                    }
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                    Perkiraan Waktu / Tanggal Kejadian{' '}
                    <span className='text-rose-500'>*</span>
                  </Label>
                  <Input
                    type='date'
                    value={formData.perkiraan_tanggal_kejadian}
                    onChange={(e) =>
                      handleChange('perkiraan_tanggal_kejadian', e.target.value)
                    }
                    required
                  />
                </div>
              </div>

              {/* RINCIAN KRONOLOGI KEJADIAN */}
              <div className='space-y-2'>
                <Label className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Rincian Kronologi Kejadian Faktual{' '}
                  <span className='text-rose-500'>*</span>
                </Label>
                <Textarea
                  placeholder='Uraikan peristiwa dengan kaidah 4W+1H (Apa yang terjadi, Siapa saja yang terlibat, Kapan waktu spesifiknya, Di mana lokasinya, dan Bagaimana modusnya)...'
                  rows={5}
                  value={formData.rincian_kejadian}
                  onChange={(e) =>
                    handleChange('rincian_kejadian', e.target.value)
                  }
                  required
                />
                <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                  Minimal 15 karakter. Informasi yang mendalam memudahkan Tim
                  Kepatuhan memverifikasi tanpa mengorbankan kerahasiaan Anda.
                </p>
              </div>

              {/* TAUTAN BUKTI DUKUNG */}
              <div className='space-y-2'>
                <Label className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                  Tautan Bukti Dukung (Opsional, Sangat Disarankan)
                </Label>
                <Input
                  type='url'
                  placeholder='https://drive.google.com/... atau tautan penyimpanan cloud dokumen pendukung'
                  value={formData.lampiran_bukti_url || ''}
                  onChange={(e) =>
                    handleChange('lampiran_bukti_url', e.target.value)
                  }
                />
                <p className='text-[11px] text-slate-500 dark:text-slate-400'>
                  Unggah foto, dokumen rekam jejak, atau rekaman ke Google Drive
                  lalu cantumkan tautannya dengan akses "Siapa saja dengan
                  tautan dapat melihat".
                </p>
              </div>

              {/* DISCLAIMER & SUBMIT BUTTON */}
              <div className='rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'>
                <p className='font-semibold text-slate-700 dark:text-slate-300'>
                  Pernyataan Integritas Pelapor:
                </p>
                <p className='mt-1'>
                  Dengan menekan tombol kirim di bawah ini, Anda menyatakan
                  bahwa laporan ini dibuat atas dasar itikad baik untuk
                  perbaikan tata kelola BPS Sitaro dan bukan merupakan fitnah
                  atau pencemaran nama baik tanpa dasar.
                </p>
              </div>

              <div className='flex justify-end pt-2'>
                <Button
                  type='submit'
                  disabled={isPending}
                  size='lg'
                  className='gap-2 bg-indigo-600 px-8 font-semibold text-white shadow-md hover:bg-indigo-700'
                >
                  {isPending ? (
                    <>
                      <span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                      Mengirim Laporan Terenkripsi...
                    </>
                  ) : (
                    <>
                      <Send className='h-4 w-4' />
                      Kirim Laporan Pengaduan WBS
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </TabsContent>

        {/* ============================================================================ */}
        {/* TAB 2: LACAK TIKET PENGADUAN */}
        {/* ============================================================================ */}
        <TabsContent value='lacak' className='space-y-6'>
          <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-xs sm:p-8 dark:border-slate-800 dark:bg-slate-900'>
            <div className='mb-6 border-b border-slate-100 pb-5 dark:border-slate-800'>
              <h2 className='text-xl font-bold text-slate-900 dark:text-slate-100'>
                Lacak Status Penanganan Tiket Pengaduan
              </h2>
              <p className='mt-1 text-sm text-slate-500 dark:text-slate-400'>
                Masukkan nomor tiket yang Anda peroleh saat membuat pengaduan
                (contoh: <code className='text-indigo-600'>WBS-2026-7841</code>)
                untuk memantau progres tindak lanjut oleh Tim Kepatuhan
                Internal.
              </p>
            </div>

            {/* Input Tracking Box */}
            <div className='flex max-w-2xl flex-col gap-3 sm:flex-row'>
              <div className='relative flex-1'>
                <Search className='absolute top-3.5 left-3.5 h-4 w-4 text-slate-400' />
                <Input
                  placeholder='Masukkan nomor tiket (contoh: WBS-2026-7841)'
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTrack();
                    }
                  }}
                  className='pl-10 font-mono text-base tracking-wider uppercase'
                />
              </div>
              <Button
                type='button'
                onClick={() => handleTrack()}
                disabled={isTrackingPending}
                className='gap-2 bg-blue-600 font-semibold text-white hover:bg-blue-700'
              >
                {isTrackingPending ? (
                  <>
                    <span className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
                    Melacak...
                  </>
                ) : (
                  <>
                    <Search className='h-4 w-4' />
                    Cek Status
                  </>
                )}
              </Button>
            </div>

            {/* TRACKED REPORT RESULT */}
            {trackedReport && (
              <div className='mt-8 space-y-6 rounded-2xl border border-slate-200/90 bg-slate-50/50 p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-800/40'>
                {/* Header Result */}
                <div className='flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-700'>
                  <div>
                    <div className='flex items-center gap-2'>
                      <span className='font-mono text-xl font-extrabold text-indigo-700 dark:text-indigo-400'>
                        {trackedReport.ticket_code}
                      </span>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          handleCopyTicket(trackedReport.ticket_code)
                        }
                        className='h-7 w-7 p-0 text-slate-500 hover:text-slate-700'
                        title='Salin nomor tiket'
                      >
                        <Copy className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                    <div className='mt-1 text-xs text-slate-500'>
                      Tanggal Masuk: {trackedReport.tanggal_lapor}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-bold ${
                        STATUS_WBS_METADATA[trackedReport.status]?.badgeClass
                      }`}
                    >
                      {trackedReport.status === 'SELESAI' ? (
                        <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600' />
                      ) : trackedReport.status === 'DITOLAK' ? (
                        <XCircle className='h-3.5 w-3.5 text-rose-600' />
                      ) : (
                        <Clock className='h-3.5 w-3.5 text-blue-600' />
                      )}
                      {STATUS_WBS_METADATA[trackedReport.status]?.label ||
                        trackedReport.status}
                    </span>
                  </div>
                </div>

                {/* PROGRESS STEPPER (Hanya tampil jika tidak ditolak) */}
                {trackedReport.status !== 'DITOLAK' ? (
                  <div className='py-4'>
                    <div className='mb-4 text-xs font-semibold tracking-wider text-slate-500 uppercase'>
                      Tahapan Penanganan Tim Kepatuhan
                    </div>

                    <div className='grid grid-cols-1 gap-4 sm:grid-cols-4'>
                      {[
                        {
                          step: 1,
                          title: 'Diterima',
                          desc: 'Tiket diterbitkan'
                        },
                        {
                          step: 2,
                          title: 'Verifikasi Awal',
                          desc: 'Telaah dokumen & bukti'
                        },
                        {
                          step: 3,
                          title: 'Investigasi',
                          desc: 'Konfirmasi faktual saksi'
                        },
                        {
                          step: 4,
                          title: 'Selesai',
                          desc: 'Tindak lanjut tuntas'
                        }
                      ].map((item) => {
                        const state = getStepStatus(
                          item.step,
                          trackedReport.status
                        );
                        return (
                          <div
                            key={item.step}
                            className={`relative rounded-xl border p-4 transition-all ${
                              state === 'completed'
                                ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
                                : state === 'active'
                                  ? 'border-indigo-400 bg-indigo-50/90 text-indigo-900 shadow-xs dark:border-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-200'
                                  : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500'
                            }`}
                          >
                            <div className='flex items-center gap-2'>
                              <div
                                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                  state === 'completed'
                                    ? 'bg-emerald-600 text-white'
                                    : state === 'active'
                                      ? 'animate-pulse bg-indigo-600 text-white'
                                      : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                }`}
                              >
                                {state === 'completed' ? '✓' : item.step}
                              </div>
                              <span className='text-xs font-bold sm:text-sm'>
                                {item.title}
                              </span>
                            </div>
                            <div className='mt-2 text-[11px] leading-tight opacity-80'>
                              {item.desc}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className='rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-200'>
                    <div className='flex items-center gap-2 font-bold'>
                      <XCircle className='h-4 w-4 text-rose-600' />
                      Pengaduan Telah Ditolak / Tidak Memenuhi Syarat
                    </div>
                    <p className='mt-1 leading-relaxed'>
                      Berdasarkan verifikasi Tim Kepatuhan Internal, laporan ini
                      tidak memiliki bukti permulaan yang cukup atau bukan
                      kewenangan ranah pengawasan BPS Sitaro.
                    </p>
                  </div>
                )}

                {/* DETAILS METADATA */}
                <div className='grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-4 text-xs sm:grid-cols-2 dark:border-slate-700 dark:bg-slate-900'>
                  <div>
                    <span className='font-semibold text-slate-500'>
                      Kategori Pelanggaran:
                    </span>
                    <div className='mt-1 font-bold text-slate-800 dark:text-slate-200'>
                      {KATEGORI_WBS_METADATA[trackedReport.kategori]?.label ||
                        trackedReport.kategori}
                    </div>
                  </div>

                  <div>
                    <span className='font-semibold text-slate-500'>
                      Pihak / Unit Terlapor:
                    </span>
                    <div className='mt-1 font-bold text-slate-800 dark:text-slate-200'>
                      {trackedReport.terlapor_nama_or_unit}
                    </div>
                  </div>

                  <div>
                    <span className='font-semibold text-slate-500'>
                      Lokasi Kejadian:
                    </span>
                    <div className='mt-1 font-medium text-slate-700 dark:text-slate-300'>
                      {trackedReport.lokasi_kejadian}
                    </div>
                  </div>

                  <div>
                    <span className='font-semibold text-slate-500'>
                      Perkiraan Tanggal:
                    </span>
                    <div className='mt-1 font-medium text-slate-700 dark:text-slate-300'>
                      {trackedReport.perkiraan_tanggal_kejadian}
                    </div>
                  </div>

                  <div className='sm:col-span-2'>
                    <span className='font-semibold text-slate-500'>
                      Subjek Aduan:
                    </span>
                    <div className='mt-1 font-medium text-slate-900 dark:text-slate-100'>
                      {trackedReport.subjek}
                    </div>
                  </div>

                  {trackedReport.lampiran_bukti_url && (
                    <div className='sm:col-span-2'>
                      <span className='font-semibold text-slate-500'>
                        Bukti Dukung Terlampir:
                      </span>
                      <div className='mt-1'>
                        <a
                          href={trackedReport.lampiran_bukti_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='inline-flex items-center gap-1.5 font-medium text-blue-600 hover:underline dark:text-blue-400'
                        >
                          <ExternalLink className='h-3.5 w-3.5' />
                          Buka Tautan Lampiran Bukti
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {/* TIM KEPATUHAN OFFICIAL NOTES */}
                <div className='space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30'>
                  <div className='flex items-center gap-2 text-sm font-bold text-indigo-900 dark:text-indigo-300'>
                    <ShieldCheck className='h-4.5 w-4.5 text-indigo-600 dark:text-indigo-400' />
                    Catatan Resmi Tim Kepatuhan Internal BPS Sitaro
                  </div>
                  <p className='text-xs leading-relaxed text-indigo-950 dark:text-indigo-200'>
                    {trackedReport.catatan_tim_kepatuhan ||
                      'Laporan dalam proses penelaahan oleh tim kepatuhan internal.'}
                  </p>

                  {trackedReport.tindak_lanjut && (
                    <div className='mt-3 border-t border-indigo-200/80 pt-3 dark:border-indigo-900/50'>
                      <div className='text-xs font-semibold text-indigo-900 dark:text-indigo-300'>
                        Tindak Lanjut & Rekomendasi Pengawasan:
                      </div>
                      <p className='mt-1 text-xs leading-relaxed text-indigo-950 dark:text-indigo-200'>
                        {trackedReport.tindak_lanjut}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* ============================================================================== */}
      {/* 3. DIALOG SUKSES DENGAN KODE TIKET BESAR */}
      {/* ============================================================================== */}
      <Dialog open={successModalOpen} onOpenChange={setSuccessModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'>
              <Check className='h-8 w-8' />
            </div>
            <DialogTitle className='text-center text-xl font-extrabold text-slate-900 dark:text-slate-100'>
              Laporan Pengaduan Berhasil Terkirim!
            </DialogTitle>
            <DialogDescription className='text-center text-xs text-slate-500 dark:text-slate-400'>
              Laporan Anda telah tersimpan secara terenkripsi dan diteruskan ke
              Tim Kepatuhan Internal BPS Sitaro.
            </DialogDescription>
          </DialogHeader>

          {createdTicketInfo && (
            <div className='space-y-4 py-2'>
              <div className='rounded-2xl border-2 border-dashed border-indigo-300 bg-indigo-50/70 p-5 text-center dark:border-indigo-800 dark:bg-indigo-950/40'>
                <div className='text-xs font-semibold tracking-wider text-indigo-600 uppercase dark:text-indigo-400'>
                  Nomor Tiket Aduan Anda
                </div>
                <div className='mt-2 font-mono text-3xl font-black tracking-widest text-indigo-950 dark:text-indigo-100'>
                  {createdTicketInfo.ticket_code}
                </div>
                <div className='mt-3 flex justify-center'>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      handleCopyTicket(createdTicketInfo.ticket_code)
                    }
                    className='gap-1.5 text-xs font-semibold'
                  >
                    {isCopied ? (
                      <>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className='h-3.5 w-3.5' />
                        Salin Nomor Tiket
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className='space-y-1.5 rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400'>
                <div className='flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200'>
                  <Info className='h-4 w-4 text-blue-600' />
                  Penting: Simpan Nomor Tiket Ini!
                </div>
                <p>
                  Gunakan nomor tiket ini sewaktu-waktu pada tab{' '}
                  <strong>"Lacak Tiket Aduan"</strong> untuk melihat tindak
                  lanjut resmi dari Inspektorat / Tim Kepatuhan BPS Sitaro tanpa
                  perlu mempublikasikan identitas Anda.
                </p>
                {createdTicketInfo.wa_sent && (
                  <p className='font-medium text-emerald-700 dark:text-emerald-400'>
                    ✓ Notifikasi WhatsApp otomatis telah dikirim ke nomor PIC
                    Tim Kepatuhan.
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className='gap-2 sm:justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setSuccessModalOpen(false)}
              className='text-xs'
            >
              Tutup
            </Button>
            <Button
              type='button'
              onClick={() => {
                setSuccessModalOpen(false);
                if (createdTicketInfo) {
                  setTrackingInput(createdTicketInfo.ticket_code);
                  setActiveTab('lacak');
                  handleTrack(createdTicketInfo.ticket_code);
                }
              }}
              className='gap-2 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700'
            >
              Lacak Pengaduan Sekarang
              <ArrowRight className='h-3.5 w-3.5' />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
