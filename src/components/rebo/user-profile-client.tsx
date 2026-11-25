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
  Smartphone
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

  // States modal dialog hasil uji coba WhatsApp
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [testResult, setTestResult] = useState<{
    phone: string;
    deepLink: string;
    messageText: string;
    timestamp: string;
    gatewaySuccess: boolean;
    feedbackText: string;
  } | null>(null);
  const [copiedMessage, setCopiedMessage] = useState(false);

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

  // Handler kirim tes WA (dapat dijalankan langsung bahkan sebelum profil disimpan)
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
      text: `Menyiapkan pengujian pesan ke nomor ${targetPhone}...`
    });

    try {
      const res = await sendTestNotificationToSelfAction(targetPhone);

      if (res.success && res.waDeepLink) {
        const feedback =
          res.message ||
          'Pesan uji coba WhatsApp resmi siap dikirim! Klik tombol di bawah atau periksa tab WhatsApp yang terbuka.';

        const resultData = {
          phone: targetPhone,
          deepLink: res.waDeepLink,
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
          gatewaySuccess: Boolean(res.data?.gatewaySuccess),
          feedbackText: feedback
        };

        setTestResult(resultData);
        setIsTestDialogOpen(true);

        // Otomatis buka WhatsApp di tab baru
        try {
          if (typeof window !== 'undefined') {
            window.open(res.waDeepLink, '_blank', 'noopener,noreferrer');
          }
        } catch (popupErr) {
          console.warn(
            '[WA-TEST] Auto popup window.open dibatasi browser:',
            popupErr
          );
        }

        setStatusMessage({
          type: 'success',
          text: feedback,
          deepLink: res.waDeepLink
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Gagal memproses pesan uji coba WhatsApp.'
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

          {/* Alert Card Interaktif Hasil Pengujian WhatsApp */}
          {testResult && (
            <div className='mt-4 rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/40'>
              <div className='space-y-3'>
                <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
                  <div className='flex items-center gap-2'>
                    <span className='flex h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500' />
                    <span className='text-sm font-bold text-emerald-950 dark:text-emerald-100'>
                      Pesan Uji Coba WhatsApp Siap Digunakan
                    </span>
                  </div>
                  <Badge
                    variant='outline'
                    className='border-emerald-400 bg-emerald-100/70 text-[11px] font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300'
                  >
                    {testResult.gatewaySuccess
                      ? 'Gateway Terkirim Otomatis'
                      : 'Kirim Mandiri (wa.me)'}
                  </Badge>
                </div>

                <p className='text-xs text-emerald-900/90 dark:text-emerald-200'>
                  {testResult.feedbackText}
                </p>

                {/* Detail Nomor & Timestamp */}
                <div className='flex flex-wrap items-center gap-x-5 gap-y-1.5 rounded-lg border border-emerald-200/80 bg-white/70 px-3 py-2 text-xs text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-200'>
                  <div className='flex items-center gap-1.5 font-mono font-bold'>
                    <Smartphone className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    <span>Nomor Tujuan: {testResult.phone}</span>
                  </div>
                  <div className='text-muted-foreground flex items-center gap-1.5 dark:text-emerald-300/80'>
                    <Clock className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
                    <span>{testResult.timestamp}</span>
                  </div>
                </div>

                {/* Tombol Interaktif Utama */}
                <div className='flex flex-col items-stretch gap-2 pt-1 sm:flex-row sm:items-center'>
                  <Button
                    asChild
                    size='default'
                    className='flex-1 gap-2 bg-[#25D366] font-bold text-white shadow-xs transition-all hover:bg-[#1EBE5D] hover:shadow-md'
                  >
                    <a
                      href={testResult.deepLink}
                      target='_blank'
                      rel='noopener noreferrer'
                    >
                      <MessageSquare className='h-4 w-4 fill-white' />
                      Buka WhatsApp Sekarang (Kirim Pesan)
                      <ExternalLink className='h-3.5 w-3.5 opacity-90' />
                    </a>
                  </Button>

                  <Button
                    type='button'
                    variant='outline'
                    size='default'
                    onClick={handleCopyMessage}
                    className='gap-1.5 border-emerald-300 bg-white font-medium text-emerald-900 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-900 dark:text-emerald-100 dark:hover:bg-slate-800'
                  >
                    {copiedMessage ? (
                      <>
                        <Check className='h-4 w-4 text-emerald-600' />
                        Tersalin!
                      </>
                    ) : (
                      <>
                        <Copy className='h-4 w-4' />
                        Salin Pesan
                      </>
                    )}
                  </Button>

                  <Button
                    type='button'
                    variant='ghost'
                    size='default'
                    onClick={() => setIsTestDialogOpen(true)}
                    className='px-3 text-xs text-emerald-900 hover:bg-emerald-100/60 hover:text-emerald-950 dark:text-emerald-200 dark:hover:bg-emerald-900/40'
                  >
                    Lihat Isi Pesan
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

      {/* 6. Dialog Interaktif Uji Coba WhatsApp Personal */}
      <Dialog open={isTestDialogOpen} onOpenChange={setIsTestDialogOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 sm:mx-0 dark:bg-emerald-950/80 dark:text-emerald-400'>
              <MessageSquare className='h-6 w-6' />
            </div>
            <DialogTitle className='text-lg font-bold text-slate-900 dark:text-slate-100'>
              Uji Coba Notifikasi WhatsApp Personal
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500 dark:text-slate-400'>
              Pesan pengujian telah disiapkan untuk memastikan nomor WhatsApp
              Anda menerima notifikasi otomatis persetujuan, revisi, dan
              deadline LKE.
            </DialogDescription>
          </DialogHeader>

          {testResult && (
            <div className='space-y-4 py-1'>
              {/* Box Ringkasan Penerima & Waktu */}
              <div className='space-y-2 rounded-lg border bg-slate-50/90 p-3 text-xs dark:border-slate-800 dark:bg-slate-900/60'>
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
                    Waktu Pengujian:
                  </span>
                  <span className='font-medium text-slate-700 dark:text-slate-300'>
                    {testResult.timestamp}
                  </span>
                </div>
                <div className='flex items-center justify-between border-t border-slate-200/60 pt-1 dark:border-slate-800'>
                  <span className='text-muted-foreground flex items-center gap-1.5'>
                    <CheckCircle2 className='h-3.5 w-3.5 text-emerald-500' />
                    Status Saluran:
                  </span>
                  <Badge
                    variant='outline'
                    className='border-emerald-300 bg-emerald-50 text-[10px] font-semibold text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                  >
                    {testResult.gatewaySuccess
                      ? 'Gateway Aktif Terkirim'
                      : 'Kirim Mandiri WhatsApp Web (wa.me)'}
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

                <div className='relative max-h-44 overflow-y-auto rounded-lg border border-emerald-200/80 bg-emerald-50/50 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-slate-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200'>
                  {testResult.messageText}
                </div>
              </div>

              {/* Tombol Aksi Utama */}
              <div className='space-y-2 pt-1'>
                <Button
                  asChild
                  size='lg'
                  className='w-full gap-2 bg-[#25D366] py-6 text-sm font-bold text-white shadow-md transition-all hover:bg-[#1EBE5D] hover:shadow-lg'
                >
                  <a
                    href={testResult.deepLink}
                    target='_blank'
                    rel='noopener noreferrer'
                    onClick={() => setIsTestDialogOpen(false)}
                  >
                    <MessageSquare className='h-5 w-5 fill-white' />
                    Buka WhatsApp Sekarang (Kirim Pesan)
                    <ExternalLink className='ml-1 h-4 w-4 opacity-90' />
                  </a>
                </Button>

                <Button
                  type='button'
                  variant='outline'
                  onClick={handleCopyMessage}
                  className='w-full gap-2 text-xs'
                >
                  {copiedMessage ? (
                    <>
                      <Check className='h-4 w-4 text-emerald-600' />
                      Teks Pesan Berhasil Disalin ke Clipboard!
                    </>
                  ) : (
                    <>
                      <Copy className='h-4 w-4' />
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
