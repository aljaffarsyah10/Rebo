'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import {
  MessageSquare,
  Phone,
  Send,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Edit,
  User,
  ShieldCheck,
  Clock,
  BarChart3,
  QrCode,
  Search,
  Sparkles,
  Bot,
  Check,
  X,
  Radio,
  Share2,
  Server,
  Layers
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { type KontakPilarRecord } from '@/lib/notifications/contacts';
import {
  formatPhoneNumber,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';
import {
  updateKontakAction,
  sendTestNotificationAction,
  triggerManualReminderAction,
  getGatewayStatusAction,
  getKontakListAction,
  getRedisQueueAdminDataAction,
  retryDlqAction,
  clearDlqAction,
  type GatewayStatusResult,
  type RedisQueueAdminData
} from '@/actions/kontak-actions';

interface KontakManagerClientProps {
  initialContacts: KontakPilarRecord[];
  initialGatewayStatus: GatewayStatusResult;
  initialQueueData?: RedisQueueAdminData | null;
}

// Skema warna pilar lembut & modern
const PILAR_COLOR_MAP: Record<
  number,
  { bg: string; text: string; border: string; label: string }
> = {
  1: {
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    label: 'Pilar 1 - Manajemen Perubahan'
  },
  2: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    label: 'Pilar 2 - Penataan Tatalaksana'
  },
  3: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-800',
    label: 'Pilar 3 - Penataan Sistem Manajemen SDM'
  },
  4: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
    label: 'Pilar 4 - Penguatan Akuntabilitas'
  },
  5: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    label: 'Pilar 5 - Penguatan Pengawasan'
  },
  6: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-800',
    label: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik'
  }
};

export default function KontakManagerClient({
  initialContacts,
  initialGatewayStatus,
  initialQueueData
}: KontakManagerClientProps) {
  const [contacts, setContacts] =
    useState<KontakPilarRecord[]>(initialContacts);
  const [gatewayStatus, setGatewayStatus] =
    useState<GatewayStatusResult>(initialGatewayStatus);

  // Redis Queue & Worker States
  const [queueData, setQueueData] = useState<RedisQueueAdminData | null>(
    initialQueueData || null
  );
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [isRetryingDlq, setIsRetryingDlq] = useState(false);
  const [isClearingDlq, setIsClearingDlq] = useState(false);

  // Loading states
  const [isRefreshing, startRefreshTransition] = useTransition();
  const [isCheckingGateway, setIsCheckingGateway] = useState(false);
  const [sendingTestId, setSendingTestId] = useState<number | null>(null);
  const [isTriggeringReminder, setIsTriggeringReminder] = useState<
    'deadline' | 'recap' | null
  >(null);

  // Auto-polling states
  const [autoPolling, setAutoPolling] = useState(true);
  const [lastPolledAt, setLastPolledAt] = useState<Date>(new Date());

  const fetchQueueData = async (silent = false) => {
    if (!silent) setIsLoadingQueue(true);
    try {
      const res = await getRedisQueueAdminDataAction();
      if (res.success && res.data) {
        setQueueData(res.data);
      }
    } catch {
      // silent
    } finally {
      if (!silent) setIsLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (!initialQueueData) {
      fetchQueueData(true);
    }
  }, [initialQueueData]);

  // Auto-polling status gateway & Redis queue tiap 35 detik
  useEffect(() => {
    if (!autoPolling) return;

    const intervalId = setInterval(async () => {
      try {
        const [resGateway, resQueue] = await Promise.all([
          getGatewayStatusAction(),
          getRedisQueueAdminDataAction()
        ]);
        setGatewayStatus(resGateway);
        if (resQueue.success && resQueue.data) {
          setQueueData(resQueue.data);
        }
        setLastPolledAt(new Date());
      } catch (err: unknown) {
        // Silent failure pada background polling agar tidak memunculkan toast error berkala
      }
    }, 35000); // 35 detik

    return () => clearInterval(intervalId);
  }, [autoPolling]);

  const handleRetryDlq = async () => {
    setIsRetryingDlq(true);
    try {
      const res = await retryDlqAction();
      if (res.success) {
        toast.success(res.message);
        await fetchQueueData(true);
      } else {
        toast.error(res.error || 'Gagal memproses kirim ulang DLQ.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Gagal retry DLQ.');
    } finally {
      setIsRetryingDlq(false);
    }
  };

  const handleClearDlq = async () => {
    setIsClearingDlq(true);
    try {
      const res = await clearDlqAction();
      if (res.success) {
        toast.success(res.message);
        await fetchQueueData(true);
      } else {
        toast.error(res.error || 'Gagal membersihkan DLQ.');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Gagal membersihkan DLQ.');
    } finally {
      setIsClearingDlq(false);
    }
  };

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'pilar' | 'verifikator'>(
    'all'
  );

  // Edit Modal State
  const [editingContact, setEditingContact] =
    useState<KontakPilarRecord | null>(null);
  const [editFormData, setEditFormData] = useState({
    nama_pic: '',
    no_wa: '',
    jabatan: '',
    email: '',
    is_active: true
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Manual Trigger Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'deadline' | 'recap' | 'test';
    targetContact?: KontakPilarRecord;
    title: string;
    description: string;
  }>({
    open: false,
    type: 'deadline',
    title: '',
    description: ''
  });

  // 1. Handler Refresh Kontak & Gateway
  const handleRefreshAll = () => {
    startRefreshTransition(async () => {
      setIsCheckingGateway(true);
      try {
        const [contactRes, statusRes] = await Promise.all([
          getKontakListAction(),
          getGatewayStatusAction()
        ]);

        if (contactRes.success && contactRes.data) {
          setContacts(contactRes.data);
        }
        setGatewayStatus(statusRes);
        toast.success('Data kontak dan status gateway berhasil diperbarui.');
      } catch (err: unknown) {
        const error = err as Error;
        toast.error('Gagal memperbarui data: ' + error.message);
      } finally {
        setIsCheckingGateway(false);
      }
    });
  };

  // 2. Handler Cek Status Gateway Khusus
  const handleCheckGatewayOnly = async () => {
    setIsCheckingGateway(true);
    try {
      const res = await getGatewayStatusAction();
      setGatewayStatus(res);
      if (res.connected) {
        toast.success('WhatsApp Gateway aktif dan terhubung!', {
          description: `Nomor bot: ${res.phone || 'Aktif'}`
        });
      } else if (res.online) {
        toast.warning('Gateway aktif, namun WhatsApp belum tertaut.', {
          description: 'Silakan klik Tautkan Perangkat (Buka QR Code).'
        });
      } else {
        toast.error('Gateway belum dapat dijangkau.', {
          description: res.message
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Gagal memeriksa status gateway: ' + error.message);
    } finally {
      setIsCheckingGateway(false);
    }
  };

  // 3. Handler Buka Dialog Edit Kontak
  const handleOpenEdit = (contact: KontakPilarRecord) => {
    setEditingContact(contact);
    setEditFormData({
      nama_pic: contact.nama_pic || '',
      no_wa: contact.no_wa || '',
      jabatan: contact.jabatan || '',
      email: contact.email || '',
      is_active: contact.is_active ?? true
    });
  };

  // 4. Handler Simpan Perubahan Kontak
  const handleSaveContact = async () => {
    if (!editingContact) return;

    if (!editFormData.nama_pic.trim()) {
      toast.error('Nama PIC wajib diisi.');
      return;
    }
    if (!editFormData.no_wa.trim()) {
      toast.error('Nomor WhatsApp wajib diisi.');
      return;
    }

    const cleanNoWa = formatPhoneNumber(editFormData.no_wa.trim());
    if (!cleanNoWa || cleanNoWa.length < 9) {
      toast.error(
        'Format nomor WhatsApp tidak valid. Masukkan nomor HP Indonesia yang sah (minimal 9 digit).'
      );
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await updateKontakAction(editingContact.id, {
        ...editFormData,
        no_wa: cleanNoWa
      });
      if (res.success && res.data) {
        toast.success(res.message || 'Kontak berhasil diperbarui.');
        // Update local state
        setContacts((prev) =>
          prev.map((c) => (c.id === editingContact.id ? res.data! : c))
        );
        setEditingContact(null);
      } else {
        toast.error(res.error || 'Gagal menyimpan kontak.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Terjadi kesalahan: ' + error.message);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // 5. Handler Kirim Pesan Uji Coba WA ke Kontak Tertentu via Redis Queue
  const handleSendTestToContact = async (contact: KontakPilarRecord) => {
    setSendingTestId(contact.id);
    const toastId = toast.loading(
      `Mendaftarkan pesan uji coba untuk ${contact.nama_pic}...`,
      {
        description: `Target: ${contact.nama_pic} (${contact.no_wa}) ke antrean Redis Queue.`
      }
    );
    try {
      const res = await sendTestNotificationAction(
        contact.no_wa,
        contact.nama_pic
      );
      toast.dismiss(toastId);
      if (res.success) {
        toast.success('Pesan uji coba didaftarkan ke antrean Redis!', {
          description: `Pesan untuk ${contact.nama_pic} (${contact.no_wa}) sedang diproses oleh Worker${res.jobId ? ` (Job ID: ${res.jobId.slice(0, 8)}...)` : ''}.`,
          duration: 5000
        });
      } else {
        toast.error(res.error || 'Pengiriman pesan uji coba gagal.', {
          description:
            'Pastikan konfigurasi Redis dan antrean sistem berjalan normal.'
        });
      }
    } catch (err: unknown) {
      toast.dismiss(toastId);
      const error = err as Error;
      toast.error('Gagal mengirim pesan uji coba: ' + error.message);
    } finally {
      setSendingTestId(null);
    }
  };

  // 6. Handler Trigger Manual Reminder (Deadline / Recap)
  const handleExecuteManualReminder = async (mode: 'deadline' | 'recap') => {
    setIsTriggeringReminder(mode);
    setConfirmDialog((prev) => ({ ...prev, open: false }));

    try {
      const res = await triggerManualReminderAction(mode);
      if (res.success) {
        toast.success(
          mode === 'deadline'
            ? 'Pengingat Deadline Berhasil Terkirim!'
            : 'Rekapitulasi Mingguan Berhasil Terkirim!',
          {
            description: res.message
          }
        );
      } else {
        toast.error('Gagal mengirim pengingat: ' + (res.error || res.message));
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error('Terjadi kesalahan eksekusi: ' + error.message);
    } finally {
      setIsTriggeringReminder(null);
    }
  };

  // Filter kontak berdasarkan tab dan pencarian
  const filteredContacts = contacts.filter((contact) => {
    // Filter tab
    if (activeTab === 'pilar') {
      if (contact.id_pilar === null || contact.kategori !== 'pilar') {
        return false;
      }
    } else if (activeTab === 'verifikator') {
      if (contact.kategori === 'pilar' && contact.id_pilar !== null) {
        return false;
      }
    }

    // Filter query pencarian
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchName = contact.nama_pic?.toLowerCase().includes(q);
    const matchPilar = contact.nama_pilar?.toLowerCase().includes(q);
    const matchPhone = contact.no_wa?.toLowerCase().includes(q);
    const matchJabatan = contact.jabatan?.toLowerCase().includes(q);
    return matchName || matchPilar || matchPhone || matchJabatan;
  });

  const pilarContactsCount = contacts.filter(
    (c) => c.kategori === 'pilar' && c.id_pilar !== null
  ).length;
  const verifikatorContactsCount = contacts.length - pilarContactsCount;

  const isConnected = gatewayStatus.online && gatewayStatus.connected;
  const qrUrl = gatewayStatus.gatewayUrl
    ? `${gatewayStatus.gatewayUrl}/qr`
    : '#';

  return (
    <PageContainer scrollable>
      <div className='w-full space-y-6 pb-12'>
        {/* ========================================================================= */}
        {/* 1. HEADER SECTION */}
        {/* ========================================================================= */}
        <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
          <div>
            <div className='flex items-center gap-2'>
              <div className='flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400'>
                <MessageSquare className='size-5' />
              </div>
              <h1 className='text-foreground text-2xl font-bold tracking-tight'>
                Notifikasi & Kontak WhatsApp
              </h1>
            </div>
            <p className='text-muted-foreground mt-1 text-sm'>
              Manajemen PIC 6 Pilar ZI & Tim Verifikator, pemantauan live status
              WhatsApp Gateway, dan uji coba pengiriman notifikasi interaktif.
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={handleRefreshAll}
              disabled={isRefreshing || isCheckingGateway}
              className='gap-2 shadow-sm'
            >
              <RefreshCw
                className={`size-4 ${
                  isRefreshing || isCheckingGateway ? 'animate-spin' : ''
                }`}
              />
              <span>Segarkan Data</span>
            </Button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. CARD LIVE STATUS WHATSAPP GATEWAY */}
        {/* ========================================================================= */}
        <Card
          className={`border transition-all duration-300 ${
            isConnected
              ? 'dark:to-card border-emerald-200/80 bg-gradient-to-br from-emerald-50/50 to-white shadow-sm dark:border-emerald-900/60 dark:from-emerald-950/20'
              : gatewayStatus.online
                ? 'dark:to-card border-amber-200/80 bg-gradient-to-br from-amber-50/50 to-white shadow-sm dark:border-amber-900/60 dark:from-amber-950/20'
                : 'dark:to-card border-slate-200/80 bg-gradient-to-br from-slate-50/50 to-white shadow-sm dark:border-slate-800 dark:from-slate-900/20'
          }`}
        >
          <CardHeader className='pb-3'>
            <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
              <div className='flex items-center gap-2.5'>
                <div
                  className={`flex size-8 items-center justify-center rounded-lg ${
                    isConnected
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                      : gatewayStatus.online
                        ? 'bg-amber-500 text-white shadow-sm shadow-amber-500/30'
                        : 'bg-slate-400 text-white'
                  }`}
                >
                  <Bot className='size-4' />
                </div>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    Status WhatsApp Gateway Service
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Engine Baileys Multi-Device & REST API Microservice REBO V2
                  </CardDescription>
                </div>
              </div>

              {/* Status Indicator Badge */}
              <div className='flex items-center gap-2'>
                {isConnected ? (
                  <Badge
                    variant='outline'
                    className='gap-1.5 border-emerald-300 bg-emerald-100/80 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  >
                    <span className='size-2 animate-pulse rounded-full bg-emerald-500' />
                    🟢 Terhubung & Siap Kirim
                  </Badge>
                ) : gatewayStatus.online ? (
                  <Badge
                    variant='outline'
                    className='gap-1.5 border-amber-300 bg-amber-100/80 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  >
                    <span className='size-2 animate-ping rounded-full bg-amber-500' />
                    🟡 Gateway Aktif, Belum Tertaut
                  </Badge>
                ) : (
                  <Badge
                    variant='outline'
                    className='gap-1.5 border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  >
                    <span className='size-2 rounded-full bg-slate-400' />⚪
                    Tidak Terjangkau / Sleep
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-4 pt-1'>
            <div className='bg-card/60 grid grid-cols-1 gap-3 rounded-xl border p-3.5 backdrop-blur-sm sm:grid-cols-3'>
              {/* Kolom 1: Nomor Bot */}
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs font-medium'>
                  Nomor Bot WhatsApp
                </p>
                <div className='flex items-center gap-1.5'>
                  <Phone className='size-3.5 text-emerald-600' />
                  <span className='text-foreground font-mono text-sm font-semibold'>
                    {gatewayStatus.phone
                      ? `+${gatewayStatus.phone}`
                      : isConnected
                        ? 'Terautentikasi'
                        : 'Belum Terdaftar'}
                  </span>
                </div>
              </div>

              {/* Kolom 2: Endpoint Gateway URL */}
              <div className='space-y-1'>
                <p className='text-muted-foreground text-xs font-medium'>
                  Endpoint Gateway Aktif
                </p>
                <div className='flex items-center gap-1.5 truncate'>
                  <Radio className='size-3.5 shrink-0 text-sky-500' />
                  <span className='text-foreground truncate font-mono text-xs'>
                    {gatewayStatus.gatewayUrl ||
                      'Belum dikonfigurasi (WHATSAPP_GATEWAY_URL)'}
                  </span>
                </div>
              </div>

              {/* Kolom 3: Pesan Status / Keterangan */}
              <div className='space-y-1 sm:col-span-1'>
                <p className='text-muted-foreground text-xs font-medium'>
                  Keterangan Status
                </p>
                <p className='text-muted-foreground truncate text-xs'>
                  {gatewayStatus.message ||
                    (isConnected
                      ? 'Siap memproses notifikasi indikator'
                      : 'Perlu scan QR code')}
                </p>
              </div>
            </div>

            {/* Aksi Tombol Tautkan QR & Cek Koneksi */}
            <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
              <div className='flex flex-wrap items-center gap-2'>
                {gatewayStatus.gatewayUrl && (
                  <Button
                    variant={isConnected ? 'outline' : 'default'}
                    size='sm'
                    onClick={() => window.open(qrUrl, '_blank')}
                    className={`gap-2 shadow-sm ${
                      !isConnected
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : ''
                    }`}
                  >
                    <QrCode className='size-4' />
                    <span>
                      {isConnected
                        ? 'Buka Web QR Code Gateway'
                        : 'Tautkan Perangkat (Buka QR Code)'}
                    </span>
                    <ExternalLink className='size-3.5 opacity-70' />
                  </Button>
                )}

                <Button
                  variant='outline'
                  size='sm'
                  onClick={handleCheckGatewayOnly}
                  disabled={isCheckingGateway}
                  className='gap-2 text-xs'
                >
                  <RefreshCw
                    className={`size-3.5 ${
                      isCheckingGateway ? 'animate-spin' : ''
                    }`}
                  />
                  <span>Cek Koneksi Ulang</span>
                </Button>

                {/* Toggle Auto-Polling Gateway Status (35 Detik) */}
                <div className='bg-background/60 flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs shadow-2xs backdrop-blur-xs'>
                  <Switch
                    id='auto-poll-gateway'
                    checked={autoPolling}
                    onCheckedChange={setAutoPolling}
                    className='scale-75 data-[state=checked]:bg-emerald-600'
                  />
                  <Label
                    htmlFor='auto-poll-gateway'
                    className='text-muted-foreground flex cursor-pointer items-center gap-1.5 text-xs font-medium select-none'
                  >
                    <span>Auto-Polling (35 dtk)</span>
                    {autoPolling ? (
                      <span
                        className='size-1.5 animate-pulse rounded-full bg-emerald-500'
                        title='Auto-polling aktif setiap 35 detik'
                      />
                    ) : (
                      <span className='text-muted-foreground text-[10px]'>
                        (Jeda)
                      </span>
                    )}
                  </Label>
                </div>
              </div>

              <div className='text-muted-foreground flex flex-wrap items-center gap-2 text-xs'>
                <span className='font-mono text-[11px] opacity-75'>
                  Terakhir dicek:{' '}
                  {lastPolledAt.toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
                <span>•</span>
                {isConnected ? (
                  <span className='flex items-center gap-1 text-emerald-600 dark:text-emerald-400'>
                    <CheckCircle2 className='size-3.5' /> Auto keep-alive aktif
                    tiap 12 menit
                  </span>
                ) : (
                  <span className='text-amber-600 dark:text-amber-400'>
                    Arahkan kamera smartphone ke halaman QR untuk pairing akun
                    bot.
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 2.5. PANEL PEMANTAUAN ANTREAN & WORKER REDIS */}
        {/* ========================================================================= */}
        <Card className='via-card to-card border-indigo-200/80 bg-gradient-to-br from-indigo-50/40 shadow-xs transition-shadow hover:shadow-sm dark:border-indigo-900/50 dark:from-indigo-950/20'>
          <CardHeader className='pb-3'>
            <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-2.5'>
                <div className='flex size-8 items-center justify-center rounded-lg border border-indigo-200 bg-indigo-100 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300'>
                  <Server className='size-4' />
                </div>
                <div>
                  <CardTitle className='text-base font-semibold'>
                    Pemantauan Antrean & Worker Redis
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    Observabilitas antrean pesan WhatsApp, Dead Letter Queue
                    (DLQ), dan status worker background
                  </CardDescription>
                </div>
              </div>

              <div className='flex items-center gap-2'>
                {queueData?.health.connected ? (
                  <Badge
                    variant='outline'
                    className='gap-1.5 border-emerald-300 bg-emerald-100/80 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  >
                    <span className='size-2 animate-pulse rounded-full bg-emerald-500' />
                    🟢 Terhubung ({queueData.health.provider.toUpperCase()} •{' '}
                    {queueData.health.latencyMs} ms)
                  </Badge>
                ) : (
                  <Badge
                    variant='outline'
                    className='gap-1.5 border-amber-300 bg-amber-100/80 px-2.5 py-1 text-xs font-medium text-amber-800 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  >
                    <span className='size-2 rounded-full bg-amber-500' />
                    🟡 Mode Fallback Memory (
                    {queueData?.health.provider || 'In-Memory'})
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className='space-y-4 pt-1'>
            {/* 3 Metrik Utama Antrean */}
            <div className='grid grid-cols-1 gap-3 sm:grid-cols-3'>
              {/* Metrik 1: Antrean Aktif (Pending) */}
              <div className='flex items-center justify-between rounded-xl border border-sky-200/80 bg-sky-50/50 p-3.5 backdrop-blur-xs dark:border-sky-900/40 dark:bg-sky-950/20'>
                <div className='space-y-1'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Antrean Aktif (Pending)
                  </p>
                  <p className='text-foreground font-mono text-2xl font-bold tracking-tight'>
                    {queueData?.metrics.pending ?? 0}
                  </p>
                  <p className='text-muted-foreground text-[11px]'>
                    Pesan siap dikirim worker
                  </p>
                </div>
                <div className='flex size-10 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300'>
                  <Layers className='size-5' />
                </div>
              </div>

              {/* Metrik 2: Terjadwal (Delayed) */}
              <div className='flex items-center justify-between rounded-xl border border-purple-200/80 bg-purple-50/50 p-3.5 backdrop-blur-xs dark:border-purple-900/40 dark:bg-purple-950/20'>
                <div className='space-y-1'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Terjadwal (Delayed)
                  </p>
                  <p className='text-foreground font-mono text-2xl font-bold tracking-tight'>
                    {queueData?.metrics.delayed ?? 0}
                  </p>
                  <p className='text-muted-foreground text-[11px]'>
                    Peringatan deadline terjadwal
                  </p>
                </div>
                <div className='flex size-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300'>
                  <Clock className='size-5' />
                </div>
              </div>

              {/* Metrik 3: Gagal (DLQ) */}
              <div className='flex items-center justify-between rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 backdrop-blur-xs dark:border-rose-900/40 dark:bg-rose-950/20'>
                <div className='space-y-1'>
                  <p className='text-muted-foreground text-xs font-medium'>
                    Gagal Total (DLQ)
                  </p>
                  <p className='font-mono text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400'>
                    {queueData?.metrics.dlq ?? 0}
                  </p>
                  <p className='text-muted-foreground text-[11px]'>
                    Gagal setelah 5x percobaan
                  </p>
                </div>
                <div className='flex size-10 items-center justify-center rounded-lg bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300'>
                  <AlertCircle className='size-5' />
                </div>
              </div>
            </div>

            {/* Tombol Aksi Retry DLQ & Refresh */}
            <div className='flex flex-wrap items-center justify-between gap-3 pt-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <Button
                  variant='default'
                  size='sm'
                  onClick={handleRetryDlq}
                  disabled={
                    isRetryingDlq || (queueData?.metrics.dlq ?? 0) === 0
                  }
                  className='gap-2 bg-indigo-600 text-xs text-white shadow-sm hover:bg-indigo-700'
                >
                  <RefreshCw
                    className={`size-3.5 ${isRetryingDlq ? 'animate-spin' : ''}`}
                  />
                  <span>Kirim Ulang Antrean Gagal (Retry DLQ)</span>
                </Button>

                {(queueData?.metrics.dlq ?? 0) > 0 && (
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={handleClearDlq}
                    disabled={isClearingDlq}
                    className='gap-1.5 border-rose-200 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:border-rose-900 dark:hover:bg-rose-950/40'
                  >
                    <span>Bersihkan DLQ</span>
                  </Button>
                )}

                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => fetchQueueData(false)}
                  disabled={isLoadingQueue}
                  className='gap-2 text-xs'
                >
                  <RefreshCw
                    className={`size-3.5 ${isLoadingQueue ? 'animate-spin' : ''}`}
                  />
                  <span>Segarkan Metrik</span>
                </Button>
              </div>

              <p className='text-muted-foreground font-mono text-[11px]'>
                Auto-retry exponential backoff: 5s ➔ 15s ➔ 30s
              </p>
            </div>

            {/* Tabel Ringkas 5-10 Riwayat Job Terakhir */}
            <div className='space-y-2 pt-2'>
              <div className='flex items-center justify-between'>
                <p className='text-foreground flex items-center gap-1.5 text-xs font-semibold'>
                  <BarChart3 className='size-3.5 text-indigo-600' />
                  Riwayat Pekerjaan Antrean Terbaru (5-10 Terakhir)
                </p>
                <span className='text-muted-foreground text-[11px]'>
                  Total tercatat: {queueData?.recentJobs.length || 0}
                </span>
              </div>

              <div className='bg-card/60 overflow-hidden rounded-lg border backdrop-blur-xs'>
                {queueData?.recentJobs && queueData.recentJobs.length > 0 ? (
                  <div className='divide-y text-xs'>
                    <div className='bg-muted/60 text-muted-foreground grid grid-cols-12 p-2.5 text-[11px] font-semibold'>
                      <div className='col-span-3'>Job ID</div>
                      <div className='col-span-3'>Jenis Pesan</div>
                      <div className='col-span-3'>Nomor Tujuan</div>
                      <div className='col-span-3 text-right'>Status</div>
                    </div>
                    {queueData.recentJobs.slice(0, 10).map((job) => {
                      const statusVariant =
                        job.status === 'delivered'
                          ? 'border-emerald-300 bg-emerald-100/70 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : job.status === 'processing'
                            ? 'border-sky-300 bg-sky-100/70 text-sky-800 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : job.status === 'failed'
                              ? 'border-rose-300 bg-rose-100/70 text-rose-800 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'border-amber-300 bg-amber-100/70 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300';

                      const statusLabel =
                        job.status === 'delivered'
                          ? '🟢 Terkirim'
                          : job.status === 'processing'
                            ? '🔵 Diproses'
                            : job.status === 'failed'
                              ? '🔴 Gagal'
                              : '🟡 Mengantre';

                      return (
                        <div
                          key={job.id}
                          className='hover:bg-muted/40 grid grid-cols-12 items-center p-2.5 transition-colors'
                        >
                          <div
                            className='text-muted-foreground col-span-3 truncate font-mono text-[11px]'
                            title={job.id}
                          >
                            #{job.id.slice(0, 8)}...
                          </div>
                          <div className='text-foreground col-span-3 truncate font-medium'>
                            <Badge
                              variant='outline'
                              className='px-1.5 py-0 text-[10px]'
                            >
                              {job.type}
                            </Badge>
                          </div>
                          <div className='text-muted-foreground col-span-3 truncate font-mono text-[11px]'>
                            {job.targetPhone || '-'}
                          </div>
                          <div className='col-span-3 text-right'>
                            <Badge
                              variant='outline'
                              className={`px-1.5 py-0.5 text-[10px] font-medium ${statusVariant}`}
                            >
                              {statusLabel}
                            </Badge>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className='text-muted-foreground p-6 text-center text-xs'>
                    Belum ada riwayat aktivitas pekerjaan di antrean Redis.
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ========================================================================= */}
        {/* 3. PANEL AKSI MANUAL ADMIN (REMINDERS & RECAP) */}
        {/* ========================================================================= */}
        <div className='space-y-2.5'>
          <div className='flex items-center gap-2'>
            <Clock className='text-primary size-4' />
            <h2 className='text-foreground text-sm font-semibold tracking-wide uppercase'>
              Panel Aksi Manual Otomasi WhatsApp
            </h2>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {/* Card 1: Kirim Pengingat Batas Waktu Manual */}
            <Card className='via-card to-card border border-blue-200/70 bg-gradient-to-br from-blue-50/40 shadow-xs transition-shadow hover:shadow-sm dark:border-blue-900/50'>
              <CardContent className='flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className='border-blue-300 bg-blue-100/70 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    >
                      Early Warning LKE
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      Target: PIC Pilar
                    </span>
                  </div>
                  <h3 className='text-foreground text-sm font-semibold'>
                    Kirim Pengingat Batas Waktu (H-14/H-7)
                  </h3>
                  <p className='text-muted-foreground text-xs leading-relaxed'>
                    Kirim pesan WhatsApp otomatis ke seluruh PIC Pilar yang
                    masih memiliki indikator berstatus <em>Belum Diisi</em> atau{' '}
                    <em>Perlu Revisi</em>.
                  </p>
                </div>

                <Button
                  size='sm'
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      type: 'deadline',
                      title: 'Kirim Pengingat Deadline Manual?',
                      description:
                        'Sistem akan memindai indikator aktif pada siklus evaluasi berjalan dan mengirimkan rincian tugas yang belum selesai langsung ke nomor WhatsApp PIC Pilar terkait.'
                    })
                  }
                  disabled={isTriggeringReminder !== null}
                  className='shrink-0 gap-2 bg-blue-600 text-white shadow-xs hover:bg-blue-700'
                >
                  {isTriggeringReminder === 'deadline' ? (
                    <RefreshCw className='size-4 animate-spin' />
                  ) : (
                    <Send className='size-4' />
                  )}
                  <span>Kirim Pengingat</span>
                </Button>
              </CardContent>
            </Card>

            {/* Card 2: Kirim Rekapitulasi Mingguan Manual */}
            <Card className='via-card to-card border border-indigo-200/70 bg-gradient-to-br from-indigo-50/40 shadow-xs transition-shadow hover:shadow-sm dark:border-indigo-900/50'>
              <CardContent className='flex flex-col justify-between gap-4 p-4 sm:flex-row sm:items-center'>
                <div className='space-y-1'>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant='outline'
                      className='border-indigo-300 bg-indigo-100/70 text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                    >
                      Executive Recap
                    </Badge>
                    <span className='text-muted-foreground text-xs'>
                      Target: Admin & Verifikator
                    </span>
                  </div>
                  <h3 className='text-foreground text-sm font-semibold'>
                    Kirim Rekapitulasi Progres Mingguan
                  </h3>
                  <p className='text-muted-foreground text-xs leading-relaxed'>
                    Kirim ringkasan capaian progres seluruh 6 Pilar ZI
                    (persentase disetujui, revisi, menunggu verifikasi) ke nomor
                    Admin & Tim Verifikator.
                  </p>
                </div>

                <Button
                  size='sm'
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      type: 'recap',
                      title: 'Kirim Rekapitulasi Mingguan?',
                      description:
                        'Sistem akan mengompilasi statistik seluruh pilar dan mengirimkan ringkasan eksekutif ke seluruh nomor Verifikator dan Admin terdaftar.'
                    })
                  }
                  disabled={isTriggeringReminder !== null}
                  className='shrink-0 gap-2 bg-indigo-600 text-white shadow-xs hover:bg-indigo-700'
                >
                  {isTriggeringReminder === 'recap' ? (
                    <RefreshCw className='size-4 animate-spin' />
                  ) : (
                    <BarChart3 className='size-4' />
                  )}
                  <span>Kirim Rekap</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. DAFTAR KONTAK 6 PILAR & TIM VERIFIKATOR */}
        {/* ========================================================================= */}
        <div className='space-y-4'>
          {/* Controls: Tabs & Search */}
          <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
            <div className='flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0'>
              <Button
                variant={activeTab === 'all' ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => setActiveTab('all')}
                className='text-xs font-medium'
              >
                Semua Kontak ({contacts.length})
              </Button>
              <Button
                variant={activeTab === 'pilar' ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => setActiveTab('pilar')}
                className='text-xs font-medium'
              >
                6 Pilar ZI ({pilarContactsCount})
              </Button>
              <Button
                variant={activeTab === 'verifikator' ? 'secondary' : 'ghost'}
                size='sm'
                onClick={() => setActiveTab('verifikator')}
                className='text-xs font-medium'
              >
                Verifikator & Admin ({verifikatorContactsCount})
              </Button>
            </div>

            {/* Search Input */}
            <div className='relative w-full sm:w-72'>
              <Search className='text-muted-foreground absolute top-1/2 left-2.5 size-4 -translate-y-1/2' />
              <Input
                placeholder='Cari PIC, pilar, nomor HP...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='h-8 pl-8 text-xs'
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {filteredContacts.map((contact) => {
              const isPilar =
                contact.id_pilar !== null && contact.id_pilar !== undefined;
              const pilarStyle = isPilar
                ? PILAR_COLOR_MAP[contact.id_pilar!] || {
                    bg: 'bg-slate-50 dark:bg-slate-900',
                    text: 'text-slate-700 dark:text-slate-300',
                    border: 'border-slate-200 dark:border-slate-800',
                    label: `Pilar ${contact.id_pilar}`
                  }
                : {
                    bg: 'bg-teal-50 dark:bg-teal-950/40',
                    text: 'text-teal-700 dark:text-teal-300',
                    border: 'border-teal-200 dark:border-teal-800',
                    label: 'Tim Verifikator Internal ZI'
                  };

              const formattedWa = formatPhoneNumber(contact.no_wa);
              const deepLinkUrl = createWhatsAppDeepLink(
                contact.no_wa,
                `Halo ${contact.nama_pic}, ini pesan komunikasi koordinasi terkait Zona Integritas REBO V2 BPS Sitaro.`
              );

              return (
                <Card
                  key={contact.id}
                  className={`flex flex-col justify-between border ${pilarStyle.border} shadow-2xs transition-all hover:shadow-xs`}
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <Badge
                        variant='outline'
                        className={`px-2 py-1 text-[11px] leading-none font-medium ${pilarStyle.bg} ${pilarStyle.text} ${pilarStyle.border}`}
                      >
                        {isPilar
                          ? `Pilar ${contact.id_pilar}`
                          : contact.kategori.toUpperCase()}
                      </Badge>

                      <Badge
                        variant={contact.is_active ? 'default' : 'secondary'}
                        className={`h-5 text-[10px] ${
                          contact.is_active
                            ? 'bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {contact.is_active ? 'Aktif' : 'Nonaktif'}
                      </Badge>
                    </div>

                    <div className='mt-2 space-y-0.5'>
                      <CardTitle className='text-foreground text-sm leading-tight font-semibold'>
                        {contact.nama_pic}
                      </CardTitle>
                      <CardDescription className='line-clamp-1 text-xs'>
                        {contact.nama_pilar || pilarStyle.label}
                      </CardDescription>
                    </div>
                  </CardHeader>

                  <CardContent className='space-y-3 pt-0 pb-3 text-xs'>
                    {/* Jabatan */}
                    {contact.jabatan && (
                      <div className='text-muted-foreground flex items-center gap-1.5'>
                        <User className='size-3.5 shrink-0 opacity-70' />
                        <span className='truncate'>{contact.jabatan}</span>
                      </div>
                    )}

                    {/* WhatsApp */}
                    <div className='bg-muted/40 flex items-center justify-between gap-2 rounded-lg border p-2'>
                      <div className='text-foreground flex items-center gap-1.5 font-mono text-xs'>
                        <Phone className='size-3.5 shrink-0 text-emerald-600' />
                        <span>{contact.no_wa}</span>
                      </div>

                      <a
                        href={deepLinkUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        title='Buka obrolan WhatsApp Web (wa.me)'
                        className='flex items-center gap-0.5 text-[11px] font-medium text-emerald-600 hover:underline'
                      >
                        <span>wa.me</span>
                        <ExternalLink className='size-3' />
                      </a>
                    </div>
                  </CardContent>

                  <div className='bg-muted/20 flex items-center justify-between gap-2 border-t px-4 py-2.5'>
                    {/* Tombol Edit */}
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => handleOpenEdit(contact)}
                      className='text-muted-foreground hover:text-foreground h-8 gap-1.5 text-xs'
                    >
                      <Edit className='size-3.5' />
                      <span>Edit Kontak</span>
                    </Button>

                    {/* Tombol Uji Kirim WA */}
                    <Button
                      variant='outline'
                      size='sm'
                      onClick={() => handleSendTestToContact(contact)}
                      disabled={sendingTestId === contact.id}
                      className='h-8 gap-1.5 border-emerald-300 text-xs text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                    >
                      {sendingTestId === contact.id ? (
                        <>
                          <RefreshCw className='size-3.5 animate-spin text-emerald-600 dark:text-emerald-400' />
                          <span className='animate-pulse font-medium'>
                            Menghubungi Gateway...
                          </span>
                        </>
                      ) : (
                        <>
                          <Send className='size-3.5' />
                          <span>Uji Kirim WA</span>
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>

          {filteredContacts.length === 0 && (
            <div className='rounded-xl border border-dashed p-8 text-center'>
              <AlertCircle className='text-muted-foreground mx-auto size-8' />
              <h3 className='text-foreground mt-2 text-sm font-medium'>
                Tidak ada kontak yang cocok
              </h3>
              <p className='text-muted-foreground mt-1 text-xs'>
                Silakan coba sesuaikan kata kunci pencarian atau tab filter.
              </p>
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 5. MODAL DIALOG EDIT KONTAK */}
        {/* ========================================================================= */}
        <Dialog
          open={editingContact !== null}
          onOpenChange={(open) => {
            if (!open) setEditingContact(null);
          }}
        >
          <DialogContent className='sm:max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-base font-semibold'>
                Edit Kontak PIC
              </DialogTitle>
              <DialogDescription className='text-xs'>
                {editingContact?.nama_pilar || 'Pilar ZI / Tim Verifikator'}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-2'>
              {/* Nama PIC */}
              <div className='space-y-1.5'>
                <Label htmlFor='nama_pic' className='text-xs'>
                  Nama PIC <span className='text-rose-500'>*</span>
                </Label>
                <Input
                  id='nama_pic'
                  value={editFormData.nama_pic}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      nama_pic: e.target.value
                    }))
                  }
                  placeholder='Contoh: Nama Pegawai / PIC Pilar'
                  className='text-xs'
                />
              </div>

              {/* Nomor WhatsApp */}
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between gap-2'>
                  <Label htmlFor='no_wa' className='text-xs'>
                    Nomor WhatsApp <span className='text-rose-500'>*</span>
                  </Label>
                  {editFormData.no_wa.trim() && (
                    <Badge
                      variant='outline'
                      className='gap-1 border-emerald-300 bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                    >
                      <CheckCircle2 className='size-3 text-emerald-600 dark:text-emerald-400' />
                      <span>
                        Standar: +{formatPhoneNumber(editFormData.no_wa) || '-'}
                      </span>
                    </Badge>
                  )}
                </div>
                <Input
                  id='no_wa'
                  value={editFormData.no_wa}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      no_wa: e.target.value
                    }))
                  }
                  placeholder='Contoh: 0821-9001-0001 atau +62 821...'
                  className='font-mono text-xs'
                />
                <div className='text-muted-foreground flex items-center justify-between text-[11px]'>
                  <span>
                    Spasi, tanda minus (-), kurung (), dan awalan 08 / +62
                    dibersihkan otomatis.
                  </span>
                </div>
              </div>

              {/* Jabatan */}
              <div className='space-y-1.5'>
                <Label htmlFor='jabatan' className='text-xs'>
                  Jabatan / Penugasan
                </Label>
                <Input
                  id='jabatan'
                  value={editFormData.jabatan}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      jabatan: e.target.value
                    }))
                  }
                  placeholder='Contoh: Koordinator Pilar 1 / Staf BPS Sitaro'
                  className='text-xs'
                />
              </div>

              {/* Email */}
              <div className='space-y-1.5'>
                <Label htmlFor='email' className='text-xs'>
                  Alamat Email (Opsional)
                </Label>
                <Input
                  id='email'
                  type='email'
                  value={editFormData.email}
                  onChange={(e) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      email: e.target.value
                    }))
                  }
                  placeholder='Contoh: pilar1.sitaro@bps.go.id'
                  className='text-xs'
                />
              </div>

              {/* Status Aktif Switch */}
              <div className='flex items-center justify-between rounded-lg border p-3'>
                <div className='space-y-0.5'>
                  <Label className='text-xs font-medium'>
                    Status Notifikasi Aktif
                  </Label>
                  <p className='text-muted-foreground text-[11px]'>
                    Jika dinonaktifkan, nomor ini tidak akan menerima pesan WA
                    otomatis.
                  </p>
                </div>
                <Switch
                  checked={editFormData.is_active}
                  onCheckedChange={(checked) =>
                    setEditFormData((prev) => ({
                      ...prev,
                      is_active: checked
                    }))
                  }
                />
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setEditingContact(null)}
                disabled={isSavingEdit}
                className='text-xs'
              >
                Batal
              </Button>
              <Button
                size='sm'
                onClick={handleSaveContact}
                disabled={isSavingEdit}
                className='gap-1.5 bg-emerald-600 text-xs text-white hover:bg-emerald-700'
              >
                {isSavingEdit ? (
                  <RefreshCw className='size-3.5 animate-spin' />
                ) : (
                  <Check className='size-3.5' />
                )}
                <span>Simpan Perubahan</span>
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ========================================================================= */}
        {/* 6. MODAL KONFIRMASI AKSI MANUAL (ALERT DIALOG) */}
        {/* ========================================================================= */}
        <AlertDialog
          open={confirmDialog.open}
          onOpenChange={(open) =>
            setConfirmDialog((prev) => ({ ...prev, open }))
          }
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='flex items-center gap-2 text-base font-semibold'>
                <Sparkles className='text-primary size-4' />
                <span>{confirmDialog.title}</span>
              </AlertDialogTitle>
              <AlertDialogDescription className='text-xs leading-relaxed'>
                {confirmDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className='text-xs'>Batal</AlertDialogCancel>
              <AlertDialogAction
                className='bg-primary text-primary-foreground hover:bg-primary/90 text-xs'
                onClick={() => {
                  if (
                    confirmDialog.type === 'deadline' ||
                    confirmDialog.type === 'recap'
                  ) {
                    handleExecuteManualReminder(confirmDialog.type);
                  }
                }}
              >
                Lanjutkan Kirim
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
