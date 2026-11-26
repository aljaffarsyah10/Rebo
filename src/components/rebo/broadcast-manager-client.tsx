'use client';

import React, { useState, useTransition } from 'react';
import {
  type PengumumanBroadcast,
  type BroadcastTipe,
  type BroadcastTargetAudiens,
  BROADCAST_TIPE_CONFIG,
  TARGET_AUDIENS_OPTIONS,
  PILAR_BROADCAST_OPTIONS,
  formatBroadcastWAMessage
} from '@/lib/broadcast/broadcast-types';
import {
  getBroadcastListAction,
  saveBroadcastAction,
  toggleBannerStatusAction,
  deleteBroadcastAction,
  dispatchWABroadcastAction
} from '@/actions/broadcast-actions';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
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
import {
  Megaphone,
  Send,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ExternalLink,
  Trash2,
  Edit,
  Eye,
  RefreshCw,
  Users,
  Smartphone,
  LayoutTemplate,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

interface BroadcastManagerClientProps {
  initialBroadcasts: PengumumanBroadcast[];
  initialStats?: {
    totalBroadcast: number;
    activeBannerCount: number;
    totalWaSent: number;
    totalTargetAudience: number;
  };
}

export function BroadcastManagerClient({
  initialBroadcasts
}: BroadcastManagerClientProps) {
  const [broadcasts, setBroadcasts] =
    useState<PengumumanBroadcast[]>(initialBroadcasts);
  const [isPending, startTransition] = useTransition();

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTipeFilter, setSelectedTipeFilter] = useState<string>('SEMUA');
  const [selectedTargetFilter, setSelectedTargetFilter] =
    useState<string>('SEMUA');

  // Form Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);
  const [formJudul, setFormJudul] = useState('');
  const [formTipe, setFormTipe] = useState<BroadcastTipe>('ARAHAN_PIMPINAN');
  const [formTargetAudiens, setFormTargetAudiens] =
    useState<BroadcastTargetAudiens>('SEMUA_TIM');
  const [formTargetPilarId, setFormTargetPilarId] = useState<string>('1');
  const [formPengirimNama, setFormPengirimNama] = useState(
    'Ir. Jacky S. Pangkerego, M.Si'
  );
  const [formPengirimJabatan, setFormPengirimJabatan] = useState(
    'Kepala BPS Kabupaten Kepulauan Sitaro'
  );
  const [formBerlakuSampai, setFormBerlakuSampai] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [formIsActiveBanner, setFormIsActiveBanner] = useState(true);
  const [formIsiPesan, setFormIsiPesan] = useState('');

  // Dispatch Dialog States
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [selectedBroadcastForDispatch, setSelectedBroadcastForDispatch] =
    useState<PengumumanBroadcast | null>(null);
  const [dispatchLoading, setDispatchLoading] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{
    sentCount: number;
    targetCount: number;
    waDeepLink?: string;
  } | null>(null);

  // Detail Dialog State
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] =
    useState<PengumumanBroadcast | null>(null);

  // Refresh data
  const refreshData = async () => {
    startTransition(async () => {
      const res = await getBroadcastListAction();
      if (res.success && res.data) {
        setBroadcasts(res.data);
      }
    });
  };

  // Open Create Form
  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormId(null);
    setFormJudul('');
    setFormTipe('ARAHAN_PIMPINAN');
    setFormTargetAudiens('SEMUA_TIM');
    setFormTargetPilarId('1');
    setFormPengirimNama('Ir. Jacky S. Pangkerego, M.Si');
    setFormPengirimJabatan('Kepala BPS Kabupaten Kepulauan Sitaro');
    setFormBerlakuSampai(
      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
    );
    setFormIsActiveBanner(true);
    setFormIsiPesan('');
    setIsFormOpen(true);
  };

  // Open Edit Form
  const handleOpenEdit = (item: PengumumanBroadcast) => {
    setIsEditing(true);
    setFormId(item.id);
    setFormJudul(item.judul);
    setFormTipe(item.tipe);
    setFormTargetAudiens(item.target_audiens);
    setFormTargetPilarId(item.target_pilar_id || '1');
    setFormPengirimNama(item.pengirim_nama);
    setFormPengirimJabatan(item.pengirim_jabatan);
    setFormBerlakuSampai(item.berlaku_sampai);
    setFormIsActiveBanner(item.is_active_banner);
    setFormIsiPesan(item.isi_pesan);
    setIsFormOpen(true);
  };

  // Save Form Handler
  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formJudul.trim() || !formIsiPesan.trim()) {
      toast.error('Judul dan isi pesan pengumuman wajib diisi.');
      return;
    }

    startTransition(async () => {
      const payload: Partial<PengumumanBroadcast> = {
        id: formId || undefined,
        judul: formJudul,
        tipe: formTipe,
        target_audiens: formTargetAudiens,
        target_pilar_id:
          formTargetAudiens === 'PILAR_TERTENTU' ? formTargetPilarId : null,
        pengirim_nama: formPengirimNama,
        pengirim_jabatan: formPengirimJabatan,
        berlaku_sampai: formBerlakuSampai,
        is_active_banner: formIsActiveBanner,
        isi_pesan: formIsiPesan
      };

      const res = await saveBroadcastAction(payload);
      if (res.success && res.data) {
        toast.success(res.message || 'Pengumuman berhasil disimpan.');
        setIsFormOpen(false);
        await refreshData();
      } else {
        toast.error(res.error || 'Gagal menyimpan pengumuman.');
      }
    });
  };

  // Toggle Banner Switch Handler
  const handleToggleBanner = async (id: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    // Optimistic UI update
    setBroadcasts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, is_active_banner: nextStatus };
        }
        return nextStatus ? { ...item, is_active_banner: false } : item;
      })
    );

    startTransition(async () => {
      const res = await toggleBannerStatusAction(id, nextStatus);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.error || 'Gagal mengubah status banner.');
        refreshData();
      }
    });
  };

  // Delete Handler
  const handleDelete = async (id: string, judul: string) => {
    if (
      !confirm(
        `Hapus pengumuman "${judul}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const res = await deleteBroadcastAction(id);
      if (res.success) {
        toast.success(res.message);
        setBroadcasts((prev) => prev.filter((item) => item.id !== id));
      } else {
        toast.error(res.error || 'Gagal menghapus pengumuman.');
      }
    });
  };

  // Open Dispatch Modal
  const handleOpenDispatch = (item: PengumumanBroadcast) => {
    setSelectedBroadcastForDispatch(item);
    setDispatchResult(null);
    setIsDispatchModalOpen(true);
  };

  // Execute WA Broadcast Dispatch
  const handleExecuteDispatch = async () => {
    if (!selectedBroadcastForDispatch) return;

    setDispatchLoading(true);
    setDispatchResult(null);

    try {
      const res = await dispatchWABroadcastAction(
        selectedBroadcastForDispatch.id
      );
      if (res.success && res.data) {
        setDispatchResult({
          sentCount: res.data.sentCount,
          targetCount: res.data.targetCount,
          waDeepLink: res.waDeepLink
        });
        toast.success(
          res.message || 'Siaran pesan WhatsApp berhasil dikirimkan!'
        );
        await refreshData();
      } else {
        toast.error(res.error || 'Gagal menyiarkan pesan WhatsApp.');
      }
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error.message || 'Terjadi kesalahan sistem.');
    } finally {
      setDispatchLoading(false);
    }
  };

  // Computed filtered list
  const filteredBroadcasts = broadcasts.filter((item) => {
    if (selectedTipeFilter !== 'SEMUA' && item.tipe !== selectedTipeFilter)
      return false;
    if (
      selectedTargetFilter !== 'SEMUA' &&
      item.target_audiens !== selectedTargetFilter
    )
      return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchJudul = item.judul.toLowerCase().includes(q);
      const matchPesan = item.isi_pesan.toLowerCase().includes(q);
      const matchPengirim = item.pengirim_nama.toLowerCase().includes(q);
      if (!matchJudul && !matchPesan && !matchPengirim) return false;
    }
    return true;
  });

  // Calculate live statistics
  const totalBroadcast = broadcasts.length;
  const activeBannerCount = broadcasts.filter((b) => b.is_active_banner).length;
  const totalWaSent = broadcasts.reduce(
    (acc, curr) => acc + (curr.wa_sent_count || 0),
    0
  );
  const totalTargetAudience = broadcasts.reduce(
    (acc, curr) => acc + (curr.total_target_count || 0),
    0
  );

  return (
    <div className='space-y-6'>
      {/* 4 Cards Metrik Ringkasan Siaran */}
      <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
        <Card className='border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Total Pengumuman
              </span>
              <Megaphone className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {totalBroadcast}
              </span>
              <span className='text-xs text-slate-500'>agenda</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Banner Beranda Aktif
              </span>
              <LayoutTemplate className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                {activeBannerCount}
              </span>
              <span className='text-xs text-slate-500'>tampil</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Pesan WA Terkirim
              </span>
              <Smartphone className='h-4 w-4 text-purple-600 dark:text-purple-400' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-purple-600 dark:text-purple-400'>
                {totalWaSent}
              </span>
              <span className='text-xs text-slate-500'>siaran</span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-slate-200/80 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80'>
          <CardContent className='p-4'>
            <div className='flex items-center justify-between'>
              <span className='text-xs font-medium text-slate-500 dark:text-slate-400'>
                Audiens Terjangkau
              </span>
              <Users className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
            </div>
            <div className='mt-2 flex items-baseline gap-2'>
              <span className='text-2xl font-bold text-slate-900 dark:text-slate-100'>
                {totalTargetAudience}
              </span>
              <span className='text-xs text-slate-500'>penerima</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: Pencarian, Filter & Tombol Buat */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex flex-1 flex-wrap items-center gap-2'>
          <div className='relative w-full sm:w-64'>
            <Search className='absolute top-2.5 left-2.5 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Cari judul / isi arahan...'
              className='pl-8 text-xs'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select
            value={selectedTipeFilter}
            onValueChange={setSelectedTipeFilter}
          >
            <SelectTrigger className='w-full text-xs sm:w-44'>
              <SelectValue placeholder='Semua Tipe' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='SEMUA'>Semua Tipe</SelectItem>
              <SelectItem value='PENTING_URGENT'>
                Penting &amp; Mendesak
              </SelectItem>
              <SelectItem value='ARAHAN_PIMPINAN'>Arahan Pimpinan</SelectItem>
              <SelectItem value='DEADLINE_CUTOFF'>
                Batas Waktu (Cut-off)
              </SelectItem>
              <SelectItem value='INFORMASI_UMUM'>Informasi Umum</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={selectedTargetFilter}
            onValueChange={setSelectedTargetFilter}
          >
            <SelectTrigger className='w-full text-xs sm:w-48'>
              <SelectValue placeholder='Semua Target' />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='SEMUA'>Semua Target Audiens</SelectItem>
              <SelectItem value='SEMUA_TIM'>Seluruh Pegawai</SelectItem>
              <SelectItem value='KOORDINATOR_PILAR'>
                Koordinator 6 Pilar
              </SelectItem>
              <SelectItem value='VERIFIKATOR'>Tim Verifikator</SelectItem>
              <SelectItem value='PILAR_TERTENTU'>Pilar Tertentu</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant='outline'
            size='sm'
            onClick={refreshData}
            disabled={isPending}
            className='h-9 text-xs'
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>

        <Button
          size='sm'
          onClick={handleOpenCreate}
          className='h-9 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
        >
          <Plus className='mr-1.5 h-4 w-4' />
          Buat Pengumuman Baru
        </Button>
      </div>

      {/* Daftar Pengumuman Broadcast */}
      <div className='space-y-3'>
        {filteredBroadcasts.length === 0 ? (
          <div className='flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/50 p-12 text-center dark:border-slate-800 dark:bg-slate-900/50'>
            <Megaphone className='h-10 w-10 text-slate-300 dark:text-slate-600' />
            <h3 className='mt-3 text-sm font-semibold text-slate-800 dark:text-slate-200'>
              Tidak ada pengumuman yang sesuai
            </h3>
            <p className='mt-1 text-xs text-slate-500'>
              Sesuaikan kata kunci pencarian atau buat pengumuman pimpinan yang
              baru.
            </p>
          </div>
        ) : (
          filteredBroadcasts.map((item) => {
            const tipeMeta =
              BROADCAST_TIPE_CONFIG[item.tipe] ||
              BROADCAST_TIPE_CONFIG.ARAHAN_PIMPINAN;

            const isExpired =
              item.berlaku_sampai &&
              item.berlaku_sampai < new Date().toISOString().split('T')[0];

            return (
              <Card
                key={item.id}
                className='overflow-hidden border-slate-200/80 bg-white/90 shadow-xs transition hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/90'
              >
                <div className='p-4 md:p-5'>
                  <div className='flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
                    {/* Header Pengumuman & Snippet */}
                    <div className='flex-1 space-y-2'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge
                          variant='outline'
                          className={`text-[11px] font-semibold tracking-wide uppercase ${tipeMeta.badgeClass}`}
                        >
                          {tipeMeta.label}
                        </Badge>

                        <Badge
                          variant='outline'
                          className='bg-slate-100 text-[11px] text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        >
                          Target:{' '}
                          {item.target_audiens === 'SEMUA_TIM'
                            ? 'Seluruh Pegawai'
                            : item.target_audiens === 'KOORDINATOR_PILAR'
                              ? 'Koordinator 6 Pilar'
                              : item.target_audiens === 'VERIFIKATOR'
                                ? 'Tim Verifikator'
                                : `Pilar ${item.target_pilar_id || '1'}`}
                        </Badge>

                        {isExpired && (
                          <Badge
                            variant='outline'
                            className='border-amber-300 bg-amber-50 text-[10px] text-amber-700 dark:border-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          >
                            Kadaluarsa
                          </Badge>
                        )}
                      </div>

                      <h3 className='text-base font-bold text-slate-900 dark:text-slate-100'>
                        {item.judul}
                      </h3>

                      <p className='line-clamp-2 text-xs leading-relaxed text-slate-600 dark:text-slate-300'>
                        {item.isi_pesan}
                      </p>

                      <div className='flex flex-wrap items-center gap-4 pt-1 text-xs text-slate-500 dark:text-slate-400'>
                        <span>
                          Pengirim:{' '}
                          <strong className='text-slate-700 dark:text-slate-200'>
                            {item.pengirim_nama}
                          </strong>{' '}
                          ({item.pengirim_jabatan})
                        </span>
                        <span>•</span>
                        <span>
                          Berlaku s.d.:{' '}
                          {new Date(item.berlaku_sampai).toLocaleDateString(
                            'id-ID',
                            { day: 'numeric', month: 'short', year: 'numeric' }
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Toggle Banner & Action Buttons */}
                    <div className='flex shrink-0 flex-col justify-between gap-3 pt-2 md:items-end md:pt-0'>
                      {/* Banner Switch Toggle */}
                      <div className='flex items-center gap-2.5 rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-800/60'>
                        <div className='flex flex-col text-left'>
                          <span className='text-[11px] font-semibold text-slate-700 dark:text-slate-200'>
                            Banner Beranda
                          </span>
                          <span className='text-[10px] text-slate-500'>
                            {item.is_active_banner
                              ? 'Aktif Tayang'
                              : 'Nonaktif'}
                          </span>
                        </div>
                        <Switch
                          checked={item.is_active_banner}
                          onCheckedChange={() =>
                            handleToggleBanner(item.id, item.is_active_banner)
                          }
                          disabled={isPending}
                        />
                      </div>

                      {/* WA Status Pill */}
                      <div className='flex items-center gap-1.5 text-xs'>
                        <span className='text-[11px] text-slate-500'>
                          Status WA:
                        </span>
                        {item.wa_broadcast_status === 'SUKSES_SEMUA' ? (
                          <Badge className='border-emerald-300 bg-emerald-100 text-[10px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'>
                            <CheckCircle2 className='mr-1 h-3 w-3' />
                            {item.wa_sent_count}/{item.total_target_count}{' '}
                            Terkirim
                          </Badge>
                        ) : item.wa_broadcast_status === 'SEBAGIAN_TERKIRIM' ? (
                          <Badge className='border-amber-300 bg-amber-100 text-[10px] text-amber-800 dark:bg-amber-950 dark:text-amber-300'>
                            <Clock className='mr-1 h-3 w-3' />
                            {item.wa_sent_count}/{item.total_target_count}{' '}
                            Sebagian
                          </Badge>
                        ) : (
                          <Badge className='border-slate-300 bg-slate-100 text-[10px] text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                            Belum Disiarkan
                          </Badge>
                        )}
                      </div>

                      {/* Button Controls */}
                      <div className='flex items-center gap-1.5'>
                        <Button
                          size='sm'
                          className='h-8 bg-emerald-600 px-2.5 text-xs font-medium text-white hover:bg-emerald-700'
                          onClick={() => handleOpenDispatch(item)}
                          title='Kirim Siaran WhatsApp'
                        >
                          <Send className='mr-1 h-3.5 w-3.5' />
                          Siarkan WA
                        </Button>

                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8 text-slate-600 hover:text-slate-900'
                          onClick={() => {
                            setSelectedDetail(item);
                            setIsDetailModalOpen(true);
                          }}
                          title='Lihat Detail'
                        >
                          <Eye className='h-3.5 w-3.5' />
                        </Button>

                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8 text-slate-600 hover:text-slate-900'
                          onClick={() => handleOpenEdit(item)}
                          title='Edit Pengumuman'
                        >
                          <Edit className='h-3.5 w-3.5' />
                        </Button>

                        <Button
                          size='icon'
                          variant='outline'
                          className='h-8 w-8 text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/50'
                          onClick={() => handleDelete(item.id, item.judul)}
                          title='Hapus Pengumuman'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal Dialog Form Tambah / Edit Pengumuman */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='text-lg font-bold'>
              {isEditing ? 'Edit Pengumuman Broadcast' : 'Buat Pengumuman Baru'}
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500'>
              Pengumuman akan disiarkan ke koordinator pilar/tim dan dapat
              ditayangkan pada banner Beranda REBO.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBroadcast} className='space-y-4 pt-2'>
            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Judul Pengumuman / Perihal
              </Label>
              <Input
                placeholder='Contoh: Arahan Pimpinan Menjelang Desk Evaluation TPI'
                value={formJudul}
                onChange={(e) => setFormJudul(e.target.value)}
                className='text-xs'
                required
              />
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Tipe Pengumuman</Label>
                <Select
                  value={formTipe}
                  onValueChange={(val) => setFormTipe(val as BroadcastTipe)}
                >
                  <SelectTrigger className='text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='ARAHAN_PIMPINAN'>
                      Arahan Pimpinan
                    </SelectItem>
                    <SelectItem value='PENTING_URGENT'>
                      Penting &amp; Mendesak
                    </SelectItem>
                    <SelectItem value='DEADLINE_CUTOFF'>
                      Batas Waktu (Cut-off)
                    </SelectItem>
                    <SelectItem value='INFORMASI_UMUM'>
                      Informasi Umum
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Target Audiens</Label>
                <Select
                  value={formTargetAudiens}
                  onValueChange={(val) =>
                    setFormTargetAudiens(val as BroadcastTargetAudiens)
                  }
                >
                  <SelectTrigger className='text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TARGET_AUDIENS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formTargetAudiens === 'PILAR_TERTENTU' && (
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>
                  Pilih Pilar Sasaran
                </Label>
                <Select
                  value={formTargetPilarId}
                  onValueChange={setFormTargetPilarId}
                >
                  <SelectTrigger className='text-xs'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PILAR_BROADCAST_OPTIONS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Nama Pengirim</Label>
                <Input
                  value={formPengirimNama}
                  onChange={(e) => setFormPengirimNama(e.target.value)}
                  className='text-xs'
                  required
                />
              </div>

              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>
                  Jabatan Pengirim
                </Label>
                <Input
                  value={formPengirimJabatan}
                  onChange={(e) => setFormPengirimJabatan(e.target.value)}
                  className='text-xs'
                  required
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>
                  Masa Berlaku Pengumuman
                </Label>
                <Input
                  type='date'
                  value={formBerlakuSampai}
                  onChange={(e) => setFormBerlakuSampai(e.target.value)}
                  className='text-xs'
                  required
                />
              </div>

              <div className='flex items-center justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-800'>
                <div className='space-y-0.5'>
                  <Label className='text-xs font-semibold'>
                    Tayangkan Banner di Beranda
                  </Label>
                  <p className='text-[10px] text-slate-500'>
                    Menampilkan alert banner di bagian teratas Beranda REBO.
                  </p>
                </div>
                <Switch
                  checked={formIsActiveBanner}
                  onCheckedChange={setFormIsActiveBanner}
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label className='text-xs font-semibold'>
                Isi Lengkap Pesan Arahan
              </Label>
              <Textarea
                rows={5}
                placeholder='Tuliskan poin-poin arahan pimpinan secara rinci...'
                value={formIsiPesan}
                onChange={(e) => setFormIsiPesan(e.target.value)}
                className='font-mono text-xs'
                required
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsFormOpen(false)}
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={isPending}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                {isPending ? (
                  <>
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan Pengumuman'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Kirim Siaran WhatsApp */}
      <Dialog open={isDispatchModalOpen} onOpenChange={setIsDispatchModalOpen}>
        <DialogContent className='max-w-xl rounded-2xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
              <Smartphone className='h-5 w-5 text-emerald-600' />
              Siarkan Notifikasi WhatsApp
            </DialogTitle>
            <DialogDescription className='text-xs text-slate-500'>
              Kirimkan pengumuman resmi berkop BPS Kabupaten Kepulauan Sitaro
              serentak ke nomor kontak target audiens.
            </DialogDescription>
          </DialogHeader>

          {selectedBroadcastForDispatch && (
            <div className='space-y-4 pt-2'>
              {/* Ringkasan Pengumuman */}
              <div className='rounded-xl border border-slate-200/80 bg-slate-50 p-3.5 text-xs dark:border-slate-800 dark:bg-slate-900/60'>
                <div className='font-semibold text-slate-900 dark:text-slate-100'>
                  {selectedBroadcastForDispatch.judul}
                </div>
                <div className='mt-1 text-slate-500'>
                  Target Audiens:{' '}
                  <strong>
                    {selectedBroadcastForDispatch.target_audiens === 'SEMUA_TIM'
                      ? 'Seluruh Pegawai & Tim Kerja (6 Pilar + Verifikator)'
                      : selectedBroadcastForDispatch.target_audiens ===
                          'KOORDINATOR_PILAR'
                        ? '6 PIC Koordinator Pilar'
                        : selectedBroadcastForDispatch.target_audiens ===
                            'VERIFIKATOR'
                          ? 'Tim Verifikator Internal'
                          : `Pilar ${selectedBroadcastForDispatch.target_pilar_id || '1'}`}
                  </strong>
                </div>
              </div>

              {/* Preview Template WhatsApp */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold text-slate-700 dark:text-slate-300'>
                  Pratinjau Format Pesan WhatsApp:
                </Label>
                <div className='max-h-48 overflow-y-auto rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200'>
                  {formatBroadcastWAMessage(
                    selectedBroadcastForDispatch,
                    'Nama Penerima'
                  )}
                </div>
              </div>

              {/* Hasil Pengiriman jika sudah selesai */}
              {dispatchResult && (
                <div className='space-y-2 rounded-xl border border-emerald-300 bg-emerald-50 p-3.5 dark:border-emerald-800 dark:bg-emerald-950/40'>
                  <div className='flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-200'>
                    <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                    Siaran Berhasil Diproses!
                  </div>
                  <p className='text-xs text-emerald-700 dark:text-emerald-300'>
                    Terkirim: <strong>{dispatchResult.sentCount}</strong> dari{' '}
                    <strong>{dispatchResult.targetCount}</strong> nomor sasaran.
                  </p>
                  {dispatchResult.waDeepLink && (
                    <div className='pt-1'>
                      <a
                        href={dispatchResult.waDeepLink}
                        target='_blank'
                        rel='noreferrer'
                        className='inline-flex items-center text-xs font-semibold text-emerald-700 underline hover:text-emerald-800 dark:text-emerald-300'
                      >
                        <ExternalLink className='mr-1 h-3.5 w-3.5' />
                        Uji Langsung Tautan Deep Link (WhatsApp Web)
                      </a>
                    </div>
                  )}
                </div>
              )}

              <DialogFooter className='pt-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setIsDispatchModalOpen(false)}
                  disabled={dispatchLoading}
                >
                  Tutup
                </Button>

                <Button
                  type='button'
                  size='sm'
                  onClick={handleExecuteDispatch}
                  disabled={dispatchLoading}
                  className='bg-emerald-600 font-semibold text-white hover:bg-emerald-700'
                >
                  {dispatchLoading ? (
                    <>
                      <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                      Menyiarkan Pesan...
                    </>
                  ) : (
                    <>
                      <Send className='mr-1.5 h-3.5 w-3.5' />
                      Kirim Siaran Sekarang
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal Dialog Baca Detail Pengumuman */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className='max-w-2xl rounded-2xl'>
          {selectedDetail && (
            <>
              <DialogHeader className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Badge
                    variant='outline'
                    className={`text-xs font-semibold tracking-wide uppercase ${
                      BROADCAST_TIPE_CONFIG[selectedDetail.tipe]?.badgeClass
                    }`}
                  >
                    {BROADCAST_TIPE_CONFIG[selectedDetail.tipe]?.label}
                  </Badge>
                  <span className='text-xs text-slate-500'>
                    Masa Berlaku s.d.: {selectedDetail.berlaku_sampai}
                  </span>
                </div>
                <DialogTitle className='text-lg font-bold text-slate-900 dark:text-slate-100'>
                  {selectedDetail.judul}
                </DialogTitle>
                <DialogDescription className='text-xs text-slate-500'>
                  Diterbitkan oleh {selectedDetail.pengirim_nama} (
                  {selectedDetail.pengirim_jabatan})
                </DialogDescription>
              </DialogHeader>

              <div className='max-h-[50vh] overflow-y-auto rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-xs leading-relaxed whitespace-pre-wrap text-slate-800 md:text-sm dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200'>
                {selectedDetail.isi_pesan}
              </div>

              <DialogFooter>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => setIsDetailModalOpen(false)}
                >
                  Tutup
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
