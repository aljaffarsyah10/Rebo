'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import {
  updateUserProfileAction,
  sendTestNotificationToSelfAction,
  checkNotificationJobStatusAction,
  type ProfileActionResult
} from '@/actions/profile-actions';
import type { UserProfileData } from '@/types/rebo';
import { formatPhoneNumber } from '@/lib/notifications/whatsapp';
import {
  type AchievementBadge,
  BADGE_TIER_CONFIGS
} from '@/lib/gamification/badge-types';
import { getUserPilarBadgesAction } from '@/actions/badge-actions';
import {
  CheckCircle2,
  AlertCircle,
  Phone,
  Send,
  Bell,
  Shield,
  Layers,
  User,
  ExternalLink,
  Loader2,
  Sparkles,
  Info,
  Trophy,
  Award,
  Medal,
  Zap,
  ShieldCheck,
  Crown,
  Flame,
  FileCheck,
  Lock,
  ArrowUpRight,
  MessageSquare,
  Copy,
  Check,
  Clock,
  Smartphone,
  RefreshCw,
  Bot
} from 'lucide-react';

interface UserProfileClientProps {
  initialProfile: UserProfileData;
  clerkUserInfo?: {
    imageUrl?: string;
    username?: string;
  };
  initialBadges?: AchievementBadge[];
  initialPilarNama?: string;
}

const PILAR_OPTIONS = [
  { id: 1, label: 'Pilar 1 - Manajemen Perubahan' },
  { id: 2, label: 'Pilar 2 - Penataan Tatalaksana' },
  { id: 3, label: 'Pilar 3 - Penataan Sistem Manajemen SDM' },
  { id: 4, label: 'Pilar 4 - Penguatan Akuntabilitas' },
  { id: 5, label: 'Pilar 5 - Penguatan Pengawasan' },
  { id: 6, label: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik' }
];

export default function UserProfileClient({
  initialProfile,
  clerkUserInfo,
  initialBadges = [],
  initialPilarNama = ''
}: UserProfileClientProps) {
  const [profile, setProfile] = useState<UserProfileData>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile.full_name || '');
  const [noWa, setNoWa] = useState(
    initialProfile.no_wa || initialProfile.telepon || ''
  );
  const [pilarTugas, setPilarTugas] = useState<number | null>(
    initialProfile.pilar_tugas ?? initialProfile.assigned_pilar_id ?? null
  );
  const [notifApproval, setNotifApproval] = useState(
    initialProfile.notif_wa_approval ?? true
  );
  const [notifRevision, setNotifRevision] = useState(
    initialProfile.notif_wa_revision ?? true
  );
  const [notifDeadline, setNotifDeadline] = useState(
    initialProfile.notif_wa_deadline ?? true
  );

  // States lencana tim kerja
  const [badges, setBadges] = useState<AchievementBadge[]>(initialBadges);
  const [pilarNama, setPilarNama] = useState<string>(initialPilarNama);

  // States feedback & loading
  const [isPending, startTransition] = useTransition();
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    deepLink?: string;
  } | null>(null);

  // States modal dialog hasil uji coba WhatsApp & Stepper Cerdas
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<{
    jobId: string;
    phone: string;
    messageText: string;
    timestamp: string;
    status: 'pending' | 'processing' | 'delivered' | 'failed';
    attempts: number;
    feedbackText: string;
    error?: string;
  } | null>(null);
  const [isPollingStatus, setIsPollingStatus] = useState(false);
  const [copiedMessage, setCopiedMessage] = useState(false);
  const pollTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    return () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, []);

  // Phone Sanitization & Validation:
  // Bersihkan karakter non-digit kecuali '+' agar mendukung format 0821-9001-0001, +62 821 9001 0001, dll.
  const cleanPhone = (noWa || '').replace(/[^\d+]/g, '');
  const formattedWaPreview = cleanPhone ? formatPhoneNumber(cleanPhone) : '';
  const isWaValid = Boolean(
    formattedWaPreview &&
      formattedWaPreview.length >= 10 &&
      formattedWaPreview.length <= 16 &&
      /^628[0-9]{7,13}$/.test(formattedWaPreview)
  );

  const getRoleBadgeVariant = (role?: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'destructive';
      case 'tpi':
        return 'default';
      case 'koordinator':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role?: string | null) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Super Admin REBO';
      case 'tpi':
        return 'Tim Penilai Internal (TPI)';
      case 'koordinator':
        return 'Koordinator Pilar';
      default:
        return 'Operator Pilar';
    }
  };

  // Handler simpan profil
  const handleSaveProfile = () => {
    setStatusMessage(null);

    if (!fullName.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Nama lengkap tidak boleh kosong.'
      });
      return;
    }

    const sanitizedPhone = cleanPhone ? formatPhoneNumber(cleanPhone) : '';
    if (noWa && !isWaValid) {
      setStatusMessage({
        type: 'error',
        text: 'Format nomor WhatsApp tidak valid. Gunakan format nomor Indonesia (contoh: 082190010001, 0821-9001-0001, atau +62 821 9001 0001).'
      });
      return;
    }

    startTransition(async () => {
      const res: ProfileActionResult<UserProfileData> =
        await updateUserProfileAction({
          full_name: fullName,
          no_wa: sanitizedPhone || noWa,
          pilar_tugas: pilarTugas,
          notif_wa_approval: notifApproval,
          notif_wa_revision: notifRevision,
          notif_wa_deadline: notifDeadline
        });

      if (res.success && res.data) {
        setProfile(res.data);
        if (res.data.no_wa) {
          setNoWa(res.data.no_wa);
        }
        setStatusMessage({
          type: 'success',
          text:
            res.message ||
            'Profil dan preferensi notifikasi berhasil diperbarui.'
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Gagal menyimpan profil.'
        });
      }
    });
  };

  // Memeriksa status terkini pekerjaan pengiriman WhatsApp dari Redis Queue
  const checkJobStatusNow = async (jobId: string) => {
    try {
      const res = await checkNotificationJobStatusAction(jobId);
      if (res.success && res.data) {
        const job = res.data;
        setTestResult((prev) =>
          prev
            ? {
                ...prev,
                status: job.status,
                attempts: job.attempts,
                error: job.error || undefined
              }
            : null
        );
        return job.status;
      }
    } catch (err) {
      console.warn('[WA-TEST] Manual check job status error:', err);
    }
    return null;
  };

  // Mekanisme auto-polling ringan (interval 2 detik, maks 16 detik)
  const startJobPolling = (jobId: string) => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
    }
    setIsPollingStatus(true);
    let count = 0;
    const maxPolls = 8; // Polling 8 kali x 2 detik = 16 detik

    pollTimerRef.current = setInterval(async () => {
      count++;
      const currentStatus = await checkJobStatusNow(jobId);

      if (currentStatus === 'delivered') {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setIsPollingStatus(false);
        setStatusMessage({
          type: 'success',
          text: 'Pesan pengujian WhatsApp telah berhasil terkirim ke ponsel Anda via Worker!'
        });
        return;
      }

      if (currentStatus === 'failed') {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setIsPollingStatus(false);
        setStatusMessage({
          type: 'error',
          text: 'Pesan pengujian gagal dikirimkan ke WhatsApp.'
        });
        return;
      }

      if (count >= maxPolls) {
        if (pollTimerRef.current) clearInterval(pollTimerRef.current);
        setIsPollingStatus(false);
      }
    }, 2000);
  };

  // Handler kirim tes WA ke antrean Redis Queue (Eliminasi Manual wa.me)
  const handleTestWa = async () => {
    if (!noWa || !isWaValid) {
      setStatusMessage({
        type: 'error',
        text: 'Masukkan nomor WhatsApp yang valid terlebih dahulu (contoh: 082190010001, 0821-9001-0001, atau +62 821 9001 0001).'
      });
      return;
    }

    const targetPhone = formattedWaPreview || formatPhoneNumber(cleanPhone);
    setIsTestingWa(true);
    setStatusMessage({
      type: 'info',
      text: `Mendaftarkan pengujian pesan ke antrean Redis untuk nomor ${targetPhone}...`
    });

    try {
      const res = await sendTestNotificationToSelfAction(targetPhone);

      if (res.success && res.data?.jobId) {
        const feedback =
          res.message ||
          'Pesan pengujian WhatsApp berhasil didaftarkan ke antrean sistem (Redis Queue) dan sedang diproses otomatis oleh Worker.';

        const resultData = {
          jobId: res.data.jobId,
          phone: targetPhone,
          messageText:
            res.data?.testMessage ||
            `🔔 *[UJI COBA NOTIFIKASI PERSONAL REBO V2]*\n\nHalo *${fullName || 'Rekan Pegawai BPS Sitaro'}*,\n\nIni adalah pesan pengujian koneksi notifikasi WhatsApp personal dari Sistem REBO BPS Sitaro ke nomor ${targetPhone}.`,
          timestamp:
            res.data?.timestamp ||
            `${new Date().toLocaleString('id-ID', {
              timeZone: 'Asia/Makassar',
              dateStyle: 'full',
              timeStyle: 'medium'
            })} WITA`,
          status: 'pending' as const,
          attempts: 0,
          feedbackText: feedback
        };

        setTestResult(resultData);
        setIsTestDialogOpen(true);

        setStatusMessage({
          type: 'success',
          text: feedback
        });

        // Jalankan auto polling status real-time
        startJobPolling(res.data.jobId);
      } else {
        setStatusMessage({
          type: 'error',
          text:
            res.error ||
            'Gagal mendaftarkan pesan uji coba WhatsApp ke antrean.'
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text:
          err?.message || 'Terjadi kesalahan jaringan saat pengujian WhatsApp.'
      });
    } finally {
      setIsTestingWa(false);
    }
  };

  const handleCopyMessage = async () => {
    if (!testResult?.messageText) return;
    try {
      await navigator.clipboard.writeText(testResult.messageText);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  // Visual Stepper Cerdas Status Antrean WhatsApp
  const renderStatusStepper = (
    status: 'pending' | 'processing' | 'delivered' | 'failed'
  ) => {
    const isStep1Done = status === 'processing' || status === 'delivered';
    const isStep2Active = status === 'processing';
    const isStep2Done = status === 'delivered';
    const isStep3Done = status === 'delivered';
    const isStep3Failed = status === 'failed';

    return (
      <div className='grid grid-cols-3 gap-2 py-2'>
        {/* Step 1: 🟡 Antrean Terdaftar di Redis */}
        <div
          className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center text-xs transition-all ${
            isStep1Done
              ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
              : 'border-amber-400 bg-amber-50/80 text-amber-950 ring-1 ring-amber-300 dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-700'
          }`}
        >
          <div
            className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              isStep1Done
                ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                : 'animate-pulse bg-amber-200 text-amber-900 dark:bg-amber-900 dark:text-amber-200'
            }`}
          >
            {isStep1Done ? <Check className='h-4 w-4' /> : '1'}
          </div>
          <span className='text-[11px] leading-tight font-bold'>
            🟡 Antrean Redis
          </span>
          <span className='text-muted-foreground mt-0.5 text-[10px]'>
            {isStep1Done ? 'Telah diambil worker' : 'Terdaftar di antrean'}
          </span>
        </div>

        {/* Step 2: 🔵 Sedang Diproses Worker */}
        <div
          className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center text-xs transition-all ${
            isStep2Done
              ? 'border-emerald-300 bg-emerald-50/70 text-emerald-950 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
              : isStep2Active
                ? 'border-blue-400 bg-blue-50/80 text-blue-950 ring-1 ring-blue-300 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-200 dark:ring-blue-700'
                : 'border-slate-200 bg-slate-50/60 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40'
          }`}
        >
          <div
            className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              isStep2Done
                ? 'bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                : isStep2Active
                  ? 'animate-pulse bg-blue-200 text-blue-900 dark:bg-blue-900 dark:text-blue-200'
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isStep2Done ? (
              <Check className='h-4 w-4' />
            ) : isStep2Active ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              '2'
            )}
          </div>
          <span className='text-[11px] leading-tight font-bold'>
            🔵 Diproses Worker
          </span>
          <span className='text-muted-foreground mt-0.5 text-[10px]'>
            {isStep2Done
              ? 'Pengiriman selesai'
              : isStep2Active
                ? 'Mengirim via Baileys...'
                : 'Menunggu giliran'}
          </span>
        </div>

        {/* Step 3: 🟢 Berhasil Masuk ke WhatsApp (atau 🔴 Gagal / Dalam Antrean Ulang) */}
        <div
          className={`flex flex-col items-center justify-between rounded-lg border p-2.5 text-center text-xs transition-all ${
            isStep3Done
              ? 'border-emerald-400 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-300 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-200 dark:ring-emerald-700'
              : isStep3Failed
                ? 'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-300 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-200 dark:ring-rose-700'
                : 'border-slate-200 bg-slate-50/60 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40'
          }`}
        >
          <div
            className={`mb-1.5 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
              isStep3Done
                ? 'bg-emerald-200 text-emerald-900 dark:bg-emerald-800 dark:text-emerald-100'
                : isStep3Failed
                  ? 'bg-rose-200 text-rose-900 dark:bg-rose-800 dark:text-rose-100'
                  : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {isStep3Done ? (
              <CheckCircle2 className='h-4 w-4 text-emerald-700 dark:text-emerald-300' />
            ) : isStep3Failed ? (
              <AlertCircle className='h-4 w-4 text-rose-700 dark:text-rose-300' />
            ) : (
              '3'
            )}
          </div>
          <span className='text-[11px] leading-tight font-bold'>
            {isStep3Done
              ? '🟢 Berhasil Masuk WA'
              : isStep3Failed
                ? '🔴 Gagal / Retry'
                : '⚪ Masuk WhatsApp'}
          </span>
          <span className='text-muted-foreground mt-0.5 text-[10px]'>
            {isStep3Done
              ? 'Tiba di WhatsApp HP'
              : isStep3Failed
                ? 'Batas retry tercapai'
                : 'Menunggu pengiriman'}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className='mx-auto max-w-4xl space-y-6 pb-12'>
      {/* 1. Header Ringkasan Profil Pengguna */}
      <div className='from-card via-card to-primary/5 relative overflow-hidden rounded-xl border bg-gradient-to-r p-6 shadow-xs'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex items-center gap-4'>
            <div className='bg-primary/10 text-primary ring-primary/20 relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full ring-2'>
              {clerkUserInfo?.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={clerkUserInfo.imageUrl}
                  alt={fullName}
                  className='h-16 w-16 rounded-full object-cover'
                />
              ) : (
                <User className='h-8 w-8' />
              )}
            </div>
            <div className='space-y-1'>
              <div className='flex flex-wrap items-center gap-2'>
                <h1 className='text-foreground text-xl font-bold tracking-tight sm:text-2xl'>
                  {fullName || 'Pengguna REBO'}
                </h1>
                <Badge variant={getRoleBadgeVariant(profile.role)}>
                  <Shield className='mr-1 h-3 w-3' />
                  {getRoleLabel(profile.role)}
                </Badge>
              </div>
              <p className='text-muted-foreground text-sm'>
                {profile.email ||
                  clerkUserInfo?.username ||
                  'Akun BPS Sitaro Terdaftar'}
              </p>
            </div>
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='outline'
              className='bg-background/80 px-3 py-1 text-xs font-normal'
            >
              <Sparkles className='mr-1.5 h-3.5 w-3.5 text-amber-500' />
              Worker-Tracking Aktif
            </Badge>
          </div>
        </div>
      </div>

      {/* Pesan Status / Feedback */}
      {statusMessage && (
        <div
          className={`flex items-start justify-between rounded-lg border p-4 text-sm ${
            statusMessage.type === 'success'
              ? 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200'
              : statusMessage.type === 'error'
                ? 'border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-200'
                : 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-200'
          }`}
        >
          <div className='flex items-start gap-3'>
            {statusMessage.type === 'success' && (
              <CheckCircle2 className='mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400' />
            )}
            {statusMessage.type === 'error' && (
              <AlertCircle className='mt-0.5 h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400' />
            )}
            {statusMessage.type === 'info' && (
              <Loader2 className='mt-0.5 h-5 w-5 shrink-0 animate-spin text-blue-600 dark:text-blue-400' />
            )}
            <div className='space-y-1'>
              <p className='font-medium'>{statusMessage.text}</p>
              {statusMessage.deepLink && (
                <div className='pt-1'>
                  <a
                    href={statusMessage.deepLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1 text-xs font-semibold underline hover:opacity-80'
                  >
                    Buka pesan langsung via WhatsApp Web
                    <ExternalLink className='h-3 w-3' />
                  </a>
                </div>
              )}
            </div>
          </div>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => setStatusMessage(null)}
            className='h-auto p-1 text-xs hover:bg-transparent'
          >
            ✕
          </Button>
        </div>
      )}

      {/* 2. Kartu Informasi Kontak & WhatsApp */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Phone className='text-primary h-5 w-5' />
            <CardTitle className='text-lg'>
              Kontak & Integrasi WhatsApp
            </CardTitle>
          </div>
          <CardDescription>
            Nomor WhatsApp Anda digunakan untuk pengiriman notifikasi instan
            hasil verifikasi bukti dukung yang Anda unggah, catatan perbaikan,
            serta pengingat tenggat waktu evaluasi.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid gap-4 sm:grid-cols-2'>
            <div className='space-y-2'>
              <Label htmlFor='fullName'>Nama Lengkap</Label>
              <Input
                id='fullName'
                placeholder='Contoh: Jane Doe, S.Tr.Stat.'
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noWa'>Nomor WhatsApp</Label>
              <Input
                id='noWa'
                type='tel'
                placeholder='Contoh: 082190010001'
                value={noWa}
                onChange={(e) => setNoWa(e.target.value)}
              />
            </div>
          </div>

          {/* Helper Format WhatsApp */}
          <div className='bg-muted/60 text-muted-foreground rounded-lg p-3 text-xs'>
            <div className='flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between'>
              <span>
                Format nomor didukung:{' '}
                <strong className='text-foreground'>08xxx</strong>,{' '}
                <strong className='text-foreground'>628xxx</strong>, atau{' '}
                <strong className='text-foreground'>+62 8xxx</strong> (spasi &
                tanda minus otomatis dibersihkan)
              </span>
              {formattedWaPreview && (
                <span className='font-mono'>
                  Standar gateway:{' '}
                  <strong className='text-primary'>{formattedWaPreview}</strong>{' '}
                  {isWaValid ? '✅' : '⚠️'}
                </span>
              )}
            </div>
          </div>

          {/* Tombol Uji Notifikasi WhatsApp ke Nomor Sendiri */}
          <div className='flex flex-wrap items-center justify-between gap-3 pt-2'>
            <div className='text-muted-foreground text-xs'>
              Uji coba dapat dijalankan langsung untuk memeriksa penerimaan
              notifikasi di perangkat Anda.
            </div>
            <Button
              type='button'
              variant='outline'
              size='sm'
              onClick={handleTestWa}
              disabled={isTestingWa || !noWa || !isWaValid}
              className='gap-1.5'
            >
              {isTestingWa ? (
                <>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  Mengirim Uji Coba...
                </>
              ) : (
                <>
                  <Send className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                  Tes Kirim WA ke Nomor Saya
                </>
              )}
            </Button>
          </div>

          {/* Alert Card Interaktif Hasil Pengujian WhatsApp Otomatis (Redis Queue & Stepper) */}
          {testResult && (
            <div className='mt-4 rounded-xl border border-slate-200 bg-slate-50/90 p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900/60'>
              <div className='space-y-3'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`flex h-2.5 w-2.5 rounded-full ${
                        testResult.status === 'delivered'
                          ? 'bg-emerald-500'
                          : testResult.status === 'failed'
                            ? 'bg-rose-500'
                            : 'animate-pulse bg-amber-500'
                      }`}
                    />
                    <span className='text-sm font-bold text-slate-900 dark:text-slate-100'>
                      Status Antrean Notifikasi WhatsApp
                    </span>
                  </div>
                  <div className='flex items-center gap-2'>
                    {isPollingStatus && (
                      <Badge
                        variant='outline'
                        className='gap-1 border-blue-300 bg-blue-50 text-[10px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                      >
                        <Loader2 className='h-3 w-3 animate-spin' />
                        Polling Live
                      </Badge>
                    )}
                    <Badge
                      variant='outline'
                      className={`text-[11px] font-semibold ${
                        testResult.status === 'delivered'
                          ? 'border-emerald-400 bg-emerald-100/70 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : testResult.status === 'failed'
                            ? 'border-rose-400 bg-rose-100/70 text-rose-800 dark:border-rose-700 dark:bg-rose-900/50 dark:text-rose-300'
                            : testResult.status === 'processing'
                              ? 'border-blue-400 bg-blue-100/70 text-blue-800 dark:border-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : 'border-amber-400 bg-amber-100/70 text-amber-800 dark:border-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                      }`}
                    >
                      {testResult.status === 'delivered'
                        ? '🟢 Berhasil Masuk WA'
                        : testResult.status === 'failed'
                          ? '🔴 Gagal Terkirim'
                          : testResult.status === 'processing'
                            ? '🔵 Sedang Diproses Worker'
                            : '🟡 Mengantre di Redis'}
                    </Badge>
                  </div>
                </div>

                {/* Visual Status Stepper Cerdas */}
                {renderStatusStepper(testResult.status)}

                <p className='text-xs text-slate-600 dark:text-slate-300'>
                  {testResult.feedbackText}
                </p>

                {/* Detail Nomor, Job ID, Timestamp */}
                <div className='flex flex-wrap items-center gap-x-4 gap-y-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300'>
                  <div className='flex items-center gap-1.5 font-mono'>
                    <Smartphone className='h-3.5 w-3.5 text-slate-500' />
                    <span>
                      Tujuan:{' '}
                      <strong className='text-slate-900 dark:text-slate-100'>
                        {testResult.phone}
                      </strong>
                    </span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-1.5 font-mono'>
                    <Layers className='h-3.5 w-3.5 text-slate-500' />
                    <span>
                      Job ID:{' '}
                      <strong className='text-foreground'>
                        {testResult.jobId.slice(0, 8)}...
                      </strong>
                    </span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-1.5'>
                    <Clock className='h-3.5 w-3.5 text-slate-500' />
                    <span>{testResult.timestamp}</span>
                  </div>
                  {testResult.attempts > 0 && (
                    <div className='text-muted-foreground flex items-center gap-1'>
                      <span>
                        Percobaan: <strong>{testResult.attempts}x</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Tombol Aksi */}
                <div className='flex flex-wrap items-center gap-2 pt-1'>
                  <Button
                    type='button'
                    variant='default'
                    size='sm'
                    onClick={() => setIsTestDialogOpen(true)}
                    className='gap-1.5 text-xs font-semibold'
                  >
                    <MessageSquare className='h-3.5 w-3.5' />
                    Lihat Isi Pesan & Detail Job
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() => checkJobStatusNow(testResult.jobId)}
                    disabled={isPollingStatus}
                    className='gap-1.5 text-xs'
                  >
                    <RefreshCw
                      className={`h-3.5 w-3.5 ${isPollingStatus ? 'animate-spin' : ''}`}
                    />
                    Perbarui Status
                  </Button>

                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={handleCopyMessage}
                    className='gap-1.5 text-xs'
                  >
                    {copiedMessage ? (
                      <>
                        <Check className='h-3.5 w-3.5 text-emerald-600' />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className='h-3.5 w-3.5' />
                        Salin Teks Pesan
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Kartu Pilar Penugasan Utama */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Layers className='text-primary h-5 w-5' />
            <CardTitle className='text-lg'>Pilar Penugasan Utama</CardTitle>
          </div>
          <CardDescription>
            Pilih pilar kerja ZI/RB yang menjadi tanggung jawab utama Anda di
            BPS Sitaro.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='pilarTugas'>Pilar Tugas</Label>
            <Select
              value={
                pilarTugas !== null && pilarTugas !== undefined
                  ? String(pilarTugas)
                  : 'all'
              }
              onValueChange={async (val) => {
                const nextPilar = val === 'all' ? null : parseInt(val, 10);
                setPilarTugas(nextPilar);
                if (nextPilar) {
                  const res = await getUserPilarBadgesAction(nextPilar);
                  if (res.success && res.badges) {
                    setBadges(res.badges);
                    setPilarNama(res.pilarNama);
                  }
                }
              }}
            >
              <SelectTrigger id='pilarTugas' className='w-full'>
                <SelectValue placeholder='Pilih Pilar Tugas Anda' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='all'>
                  Seluruh Pilar (Lintas Pilar / Verifikator / Admin)
                </SelectItem>
                {PILAR_OPTIONS.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className='text-muted-foreground text-xs'>
              Penugasan pilar membantu sistem mengarahkan notifikasi pengingat
              pengisian bukti dan dashboard evaluasi yang relevan untuk unit
              kerja Anda.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 4. Kartu Lencana Kehormatan Tim Kerja (Digital Recognition Badges) */}
      <Card className='border-amber-200/80 bg-gradient-to-br from-amber-50/20 via-white to-amber-50/10 dark:border-amber-900/40 dark:from-slate-900 dark:to-slate-900'>
        <CardHeader className='pb-3'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex items-center gap-2'>
              <Award className='h-5 w-5 text-amber-500' />
              <div>
                <CardTitle className='text-lg'>
                  Lencana Penghargaan Tim Kerja
                </CardTitle>
                <CardDescription className='text-xs'>
                  Koleksi lencana kehormatan digital atas pencapaian milestone
                  Zona Integritas tim Anda.
                </CardDescription>
              </div>
            </div>
            <div className='flex items-center gap-2'>
              <Badge className='border-amber-300 bg-amber-500/15 text-xs font-bold text-amber-800 dark:border-amber-700 dark:text-amber-300'>
                {badges.filter((b) => b.unlocked).length} dari{' '}
                {badges.length || 8} Terbuka
              </Badge>
              <Link
                href='/rebo/leaderboard'
                className='inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400'
              >
                <span>Galeri Lengkap</span>
                <ArrowUpRight className='h-3 w-3' />
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className='space-y-4'>
          {pilarNama && (
            <div className='text-xs font-medium text-slate-600 dark:text-slate-400'>
              Menampilkan lencana untuk:{' '}
              <strong className='text-slate-900 dark:text-slate-100'>
                {pilarNama}
              </strong>
            </div>
          )}

          <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-4'>
            {badges.map((badge) => {
              const tierConf = BADGE_TIER_CONFIGS[badge.tier];
              const isUnlocked = badge.unlocked;

              return (
                <div
                  key={badge.id}
                  className={`relative flex flex-col justify-between rounded-xl border p-3 text-xs transition-all ${
                    isUnlocked
                      ? `${tierConf.badgeBg} ${tierConf.borderColor} shadow-2xs`
                      : 'border-dashed border-slate-200 bg-slate-50/50 opacity-60 dark:border-slate-800 dark:bg-slate-900/30'
                  }`}
                >
                  <div className='space-y-1.5'>
                    <div className='flex items-center justify-between'>
                      <Badge
                        className={`text-[8px] font-black tracking-wider uppercase ${
                          isUnlocked
                            ? `${tierConf.badgeBg} ${tierConf.textColor} border ${tierConf.borderColor}`
                            : 'bg-slate-200 text-slate-500 dark:bg-slate-800'
                        }`}
                      >
                        {badge.tier}
                      </Badge>
                      {isUnlocked ? (
                        <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600' />
                      ) : (
                        <Lock className='h-3 w-3 text-slate-400' />
                      )}
                    </div>

                    <div className='line-clamp-1 font-bold text-slate-900 dark:text-slate-100'>
                      {badge.title}
                    </div>

                    <p className='line-clamp-2 text-[10px] leading-tight text-slate-500 dark:text-slate-400'>
                      {badge.criteria_summary}
                    </p>
                  </div>

                  <div className='mt-2 border-t border-slate-200/50 pt-1.5 text-[9px] dark:border-slate-800/60'>
                    {isUnlocked ? (
                      <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                        ✓ {badge.unlocked_at || 'Terbuka'}
                      </span>
                    ) : (
                      <span className='text-slate-400'>
                        {badge.progress_percent || 0}% tercapai
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 5. Kartu Preferensi Notifikasi Personal (Worker-Tracking) */}
      <Card>
        <CardHeader>
          <div className='flex items-center gap-2'>
            <Bell className='text-primary h-5 w-5' />
            <CardTitle className='text-lg'>
              Preferensi Notifikasi WhatsApp
            </CardTitle>
          </div>
          <CardDescription>
            Atur jenis pemberitahuan otomatis yang ingin Anda terima langsung di
            nomor WhatsApp pribadi Anda.
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-6'>
          {/* Toggle 1: Disetujui */}
          <div className='flex items-center justify-between space-x-4'>
            <div className='space-y-0.5'>
              <Label className='text-base font-medium' htmlFor='notifApproval'>
                Bukti Dukung Disetujui (Approved)
              </Label>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                Terima pesan konfirmasi saat berkas bukti dukung yang Anda
                unggah lolos verifikasi internal oleh Koordinator/TPI.
              </p>
            </div>
            <Switch
              id='notifApproval'
              checked={notifApproval}
              onCheckedChange={setNotifApproval}
            />
          </div>
          <Separator />

          {/* Toggle 2: Perlu Revisi */}
          <div className='flex items-center justify-between space-x-4'>
            <div className='space-y-0.5'>
              <div className='flex items-center gap-1.5'>
                <Label
                  className='text-base font-medium'
                  htmlFor='notifRevision'
                >
                  Perlu Perbaikan / Revisi (Revision Required)
                </Label>
                <Badge variant='destructive' className='h-4 px-1 text-[10px]'>
                  Prioritas
                </Badge>
              </div>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                Terima notifikasi prioritas tinggi bila bukti dukung
                dikembalikan dengan catatan perbaikan lengkap dan tautan
                langsung ke indikator terkait.
              </p>
            </div>
            <Switch
              id='notifRevision'
              checked={notifRevision}
              onCheckedChange={setNotifRevision}
            />
          </div>
          <Separator />

          {/* Toggle 3: Pengingat Deadline */}
          <div className='flex items-center justify-between space-x-4'>
            <div className='space-y-0.5'>
              <Label className='text-base font-medium' htmlFor='notifDeadline'>
                Pengingat Batas Waktu & Deadline (Early Warning)
              </Label>
              <p className='text-muted-foreground text-xs sm:text-sm'>
                Terima pengingat otomatis menjelang batas akhir evaluasi (jadwal
                H-30, H-14, H-7, H-3, H-1) untuk indikator yang belum lengkap
                pada pilar penugasan Anda.
              </p>
            </div>
            <Switch
              id='notifDeadline'
              checked={notifDeadline}
              onCheckedChange={setNotifDeadline}
            />
          </div>
        </CardContent>

        <CardFooter className='bg-muted/20 flex flex-col gap-4 border-t px-6 py-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='text-muted-foreground flex items-center gap-2 text-xs'>
            <Info className='text-primary h-4 w-4 shrink-0' />
            <span>
              Perubahan preferensi ini langsung berlaku untuk semua aksi
              pengunggahan berikutnya.
            </span>
          </div>
          <Button
            type='button'
            onClick={handleSaveProfile}
            disabled={isPending}
            className='w-full sm:w-auto'
          >
            {isPending ? (
              <>
                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                Menyimpan...
              </>
            ) : (
              'Simpan Perubahan'
            )}
          </Button>
        </CardFooter>
      </Card>

      {/* 5. Edukasi Worker-Tracking Box */}
      <div className='border-primary/20 bg-primary/5 text-muted-foreground rounded-xl border p-4 text-xs'>
        <div className='flex items-start gap-3'>
          <div className='bg-primary/10 text-primary rounded-full p-2'>
            <Shield className='h-4 w-4' />
          </div>
          <div className='space-y-1'>
            <h4 className='text-foreground font-semibold'>
              Transparansi & Perekaman Worker-Tracking REBO V2
            </h4>
            <p className='leading-relaxed'>
              Setiap kali Anda mengajukan bukti dukung baru di form RB, sistem
              akan merekam identitas akun dan nomor WhatsApp Anda secara aman.
              Apabila verifikator memberikan catatan reviu, pemberitahuan akan
              diprioritaskan dikirim langsung kepada Anda sebagai pemilik berkas
              untuk mempercepat siklus tindak lanjut Zona Integritas BPS
              Kabupaten Kepulauan Sitaro.
            </p>
            <div className='pt-1'>
              <Link
                href='/rebo/kanban'
                className='text-primary inline-flex items-center font-medium hover:underline'
              >
                Lihat papan tugas tindak lanjut Kanban &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Dialog Interaktif Uji Coba WhatsApp Personal (Redis Queue & Status Stepper) */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 sm:mx-0 dark:bg-blue-950/80 dark:text-blue-400'>
              <Bot className='h-6 w-6' />
            </div>
            <DialogTitle className='text-lg font-bold text-slate-900 dark:text-slate-100'>
              Pemantauan Pengiriman Pesan WhatsApp
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500 dark:text-slate-400'>
              Pesan uji coba didaftarkan ke antrean sistem (Redis Queue) dan
              dikirimkan secara otomatis oleh Background Worker ke ponsel Anda.
            </DialogDescription>
          </DialogHeader>

          {testResult && (
            <div className='space-y-4 py-1'>
              {/* Stepper Status Antrean */}
              <div className='rounded-lg border border-slate-200 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/40'>
                <div className='flex items-center justify-between px-1 pb-1'>
                  <span className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                    Perjalanan Pengiriman Pesan:
                  </span>
                  {isPollingStatus && (
                    <span className='inline-flex items-center gap-1 text-[10px] text-blue-600 dark:text-blue-400'>
                      <Loader2 className='h-3 w-3 animate-spin' />
                      Live Polling
                    </span>
                  )}
                </div>
                {renderStatusStepper(testResult.status)}
              </div>

              {/* Box Ringkasan Penerima & Job ID */}
              <div className='space-y-2 rounded-lg border bg-slate-50/90 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60'>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <Layers className='h-3.5 w-3.5 text-slate-500' />
                    Job ID Antrean:
                  </span>
                  <span className='font-mono font-semibold text-slate-900 dark:text-slate-100'>
                    {testResult.jobId}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <Smartphone className='h-3.5 w-3.5 text-slate-500' />
                    Nomor Tujuan:
                  </span>
                  <span className='text-foreground font-mono font-bold'>
                    {testResult.phone}
                  </span>
                </div>
                <div className='flex items-center justify-between'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <Clock className='h-3.5 w-3.5 text-slate-500' />
                    Waktu Pendaftaran:
                  </span>
                  <span className='font-medium text-slate-700 dark:text-slate-300'>
                    {testResult.timestamp}
                  </span>
                </div>
                <div className='flex items-center justify-between border-t border-slate-200/60 pt-1 dark:border-slate-800'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <ShieldCheck className='h-3.5 w-3.5 text-emerald-500' />
                    Status Eksekusi:
                  </span>
                  <Badge
                    variant='outline'
                    className={`text-[10px] font-semibold ${
                      testResult.status === 'delivered'
                        ? 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                        : testResult.status === 'failed'
                          ? 'border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                          : 'border-blue-400 bg-blue-50 text-blue-800 dark:border-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                    }`}
                  >
                    {testResult.status === 'delivered'
                      ? '🟢 Terkirim ke WhatsApp'
                      : testResult.status === 'failed'
                        ? '🔴 Gagal Dikirim'
                        : testResult.status === 'processing'
                          ? '🔵 Sedang Diproses Worker'
                          : '🟡 Mengantre di Redis'}
                  </Badge>
                </div>
              </div>

              {/* Preview Chat Bubble Monospace */}
              <div className='space-y-1.5'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='font-semibold text-slate-700 dark:text-slate-300'>
                    Preview Pesan WhatsApp:
                  </span>
                  <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={handleCopyMessage}
                    className='text-primary hover:bg-primary/10 h-6 gap-1 px-2 text-[11px]'
                  >
                    {copiedMessage ? (
                      <>
                        <Check className='h-3 w-3 text-emerald-600' />
                        Tersalin
                      </>
                    ) : (
                      <>
                        <Copy className='h-3 w-3' />
                        Salin Teks
                      </>
                    )}
                  </Button>
                </div>

                <div className='relative max-h-44 overflow-y-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200'>
                  {testResult.messageText}
                </div>
              </div>

              {/* Tombol Aksi */}
              <div className='flex items-center gap-2 pt-1'>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => checkJobStatusNow(testResult.jobId)}
                  disabled={isPollingStatus}
                  className='flex-1 gap-1.5 text-xs'
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isPollingStatus ? 'animate-spin' : ''}`}
                  />
                  Cek Ulang Status Job
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCopyMessage}
                  className='gap-1.5 text-xs'
                >
                  {copiedMessage ? (
                    <>
                      <Check className='h-3.5 w-3.5 text-emerald-600' />
                      Tersalin
                    </>
                  ) : (
                    <>
                      <Copy className='h-3.5 w-3.5' />
                      Salin Pesan
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          <DialogFooter className='border-t pt-3 sm:justify-end'>
            <Button
              type='button'
              variant='ghost'
              size='sm'
              onClick={() => setIsTestDialogOpen(false)}
              className='text-xs'
            >
              Tutup Dialog
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
