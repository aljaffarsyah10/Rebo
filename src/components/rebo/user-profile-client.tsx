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
  updateUserProfileAction,
  sendTestNotificationToSelfAction,
  type ProfileActionResult
} from '@/actions/profile-actions';
import type { UserProfileData } from '@/types/rebo';
import { formatPhoneNumber } from '@/lib/notifications/whatsapp';
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
  Info
} from 'lucide-react';

interface UserProfileClientProps {
  initialProfile: UserProfileData;
  clerkUserInfo?: {
    imageUrl?: string;
    username?: string;
  };
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
  clerkUserInfo
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

  // States feedback
  const [isPending, startTransition] = useTransition();
  const [isTestingWa, setIsTestingWa] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
    deepLink?: string;
  } | null>(null);

  // Format preview
  const formattedWaPreview = noWa ? formatPhoneNumber(noWa) : '';
  const isWaValid =
    formattedWaPreview.length >= 10 &&
    /^628[0-9]{7,13}$/.test(formattedWaPreview);

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

    if (noWa && !isWaValid) {
      setStatusMessage({
        type: 'error',
        text: 'Format nomor WhatsApp tidak valid. Gunakan format nomor Indonesia (contoh: 082190010001 atau 6282190010001).'
      });
      return;
    }

    startTransition(async () => {
      const res: ProfileActionResult<UserProfileData> =
        await updateUserProfileAction({
          full_name: fullName,
          no_wa: noWa,
          pilar_tugas: pilarTugas,
          notif_wa_approval: notifApproval,
          notif_wa_revision: notifRevision,
          notif_wa_deadline: notifDeadline
        });

      if (res.success && res.data) {
        setProfile(res.data);
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

  // Handler kirim tes WA
  const handleTestWa = async () => {
    if (!noWa || !isWaValid) {
      setStatusMessage({
        type: 'error',
        text: 'Masukkan nomor WhatsApp yang valid terlebih dahulu sebelum melakukan tes.'
      });
      return;
    }

    setIsTestingWa(true);
    setStatusMessage({
      type: 'info',
      text: 'Sedang mengirim pesan pengujian melalui WhatsApp Gateway...'
    });

    try {
      const res = await sendTestNotificationToSelfAction(noWa);
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text:
            res.message || 'Pesan tes berhasil dikirim ke nomor WhatsApp Anda!',
          deepLink: res.waDeepLink
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: res.error || 'Gagal mengirim pesan melalui Gateway.',
          deepLink: res.waDeepLink
        });
      }
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Terjadi kesalahan koneksi saat pengujian pesan.'
      });
    } finally {
      setIsTestingWa(false);
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
            <div className='flex items-center justify-between'>
              <span>
                Format nomor didukung:{' '}
                <strong className='text-foreground'>08xxx</strong> atau{' '}
                <strong className='text-foreground'>628xxx</strong>
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
              Pastikan bot WhatsApp Gateway aktif untuk menerima pesan uji coba
              otomatis.
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
              onValueChange={(val) => {
                setPilarTugas(val === 'all' ? null : parseInt(val, 10));
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

      {/* 4. Kartu Preferensi Notifikasi Personal (Worker-Tracking) */}
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
    </div>
  );
}
