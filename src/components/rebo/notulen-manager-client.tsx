'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  type NotulenRapat,
  type KesepakatanRapatItem,
  type StatusKesepakatan,
  NOTULEN_PILAR_OPTIONS,
  STATUS_KESEPAKATAN_CONFIG,
  DAFTAR_PEGAWAI_SITARO,
  generateNomorNotula
} from '@/lib/notulen/notulen-types';
import {
  saveNotulenAction,
  deleteNotulenAction,
  convertKesepakatanToKanbanAndNotifyAction
} from '@/actions/notulen-actions';
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
import { Textarea } from '@/components/ui/textarea';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { toast } from 'sonner';
import {
  IconFileDescription,
  IconPlus,
  IconSearch,
  IconCalendar,
  IconClock,
  IconMapPin,
  IconUser,
  IconUsers,
  IconBrandWhatsapp,
  IconLayoutKanban,
  IconPrinter,
  IconEdit,
  IconTrash,
  IconCheck,
  IconArrowRight,
  IconExternalLink,
  IconSparkles,
  IconLayoutGrid,
  IconList,
  IconCopy,
  IconAlertCircle,
  IconClipboardCheck,
  IconSend,
  IconLoader2,
  IconRefresh
} from '@tabler/icons-react';

interface NotulenManagerClientProps {
  initialNotulenList: NotulenRapat[];
  initialStats?: {
    totalNotulen: number;
    totalKesepakatan: number;
    kesepakatanSelesai: number;
    ditugaskanKanban: number;
    waTerkirim: number;
  };
}

export default function NotulenManagerClient({
  initialNotulenList,
  initialStats
}: NotulenManagerClientProps) {
  const searchParams = useSearchParams();
  const [notulenList, setNotulenList] =
    React.useState<NotulenRapat[]>(initialNotulenList);

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterPilar, setFilterPilar] = React.useState<string>('SEMUA');
  const [filterTahun, setFilterTahun] = React.useState<string>('2026');
  const [viewMode, setViewMode] = React.useState<'grid' | 'table'>('grid');

  // Dialog States
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = React.useState(false);
  const [selectedNotulen, setSelectedNotulen] =
    React.useState<NotulenRapat | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<Partial<NotulenRapat>>({
    judul_rapat: '',
    nomor_notula: '',
    tanggal: new Date().toISOString().split('T')[0],
    waktu_mulai: '09:00',
    waktu_selesai: '11:30',
    tempat: 'Aula Sasahara BPS Sitaro (Lt. 2)',
    pilar_id: 'SEMUA',
    pimpinan_rapat:
      'Ir. Stella Mandagi (Kepala BPS Kabupaten Kepulauan Sitaro)',
    notulis: 'Gloria Pangemanan, S.Tr.Stat.',
    peserta_hadir: [],
    ringkasan_pembahasan: '',
    kesepakatan_items: []
  });

  const [pesertaInputText, setPesertaInputText] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [convertingId, setConvertingId] = React.useState<string | null>(null);

  // Handle auto-open form if URL params exist (e.g. from Agenda Calendar)
  React.useEffect(() => {
    const agendaId = searchParams.get('agendaId');
    const title = searchParams.get('title');
    if (agendaId || title) {
      handleOpenCreateNew({
        agenda_id: agendaId || undefined,
        judul_rapat: title ? `Notula: ${title}` : undefined
      });
    }
  }, [searchParams]);

  // Compute live stats
  const stats = React.useMemo(() => {
    let totalKesepakatan = 0;
    let kesepakatanSelesai = 0;
    let ditugaskanKanban = 0;
    let waTerkirim = 0;

    notulenList.forEach((n) => {
      (n.kesepakatan_items || []).forEach((k) => {
        totalKesepakatan++;
        if (k.status === 'SELESAI') kesepakatanSelesai++;
        if (k.kanban_card_id) ditugaskanKanban++;
        if (k.wa_sent) waTerkirim++;
      });
    });

    return {
      totalNotulen: notulenList.length,
      totalKesepakatan,
      kesepakatanSelesai,
      ditugaskanKanban,
      waTerkirim
    };
  }, [notulenList]);

  // Filter list
  const filteredNotulen = React.useMemo(() => {
    return notulenList.filter((item) => {
      // Filter Pilar
      if (filterPilar !== 'SEMUA') {
        if (item.pilar_id !== filterPilar && item.pilar_id !== 'SEMUA') {
          return false;
        }
      }

      // Filter Tahun
      if (filterTahun !== 'ALL') {
        const itemYear = new Date(item.tanggal).getFullYear().toString();
        if (itemYear !== filterTahun) {
          return false;
        }
      }

      // Filter Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.judul_rapat.toLowerCase().includes(q);
        const matchNo = item.nomor_notula.toLowerCase().includes(q);
        const matchTempat = item.tempat.toLowerCase().includes(q);
        const matchPimpinan = item.pimpinan_rapat.toLowerCase().includes(q);
        const matchNotulis = item.notulis.toLowerCase().includes(q);
        const matchPeserta = item.peserta_hadir.some((p) =>
          p.toLowerCase().includes(q)
        );
        const matchPembahasan = item.ringkasan_pembahasan
          .toLowerCase()
          .includes(q);
        const matchKesepakatan = item.kesepakatan_items.some((k) =>
          k.poin_kesepakatan.toLowerCase().includes(q)
        );
        return (
          matchTitle ||
          matchNo ||
          matchTempat ||
          matchPimpinan ||
          matchNotulis ||
          matchPeserta ||
          matchPembahasan ||
          matchKesepakatan
        );
      }

      return true;
    });
  }, [notulenList, filterPilar, filterTahun, searchQuery]);

  // Form Handlers
  const handleOpenCreateNew = (defaults?: Partial<NotulenRapat>) => {
    const nextNomor = generateNomorNotula(
      notulenList.length + 1,
      new Date().toISOString()
    );
    setFormData({
      judul_rapat: defaults?.judul_rapat || '',
      nomor_notula: nextNomor,
      tanggal: new Date().toISOString().split('T')[0],
      waktu_mulai: '09:00',
      waktu_selesai: '11:30',
      tempat: 'Aula Sasahara BPS Sitaro (Lt. 2)',
      agenda_id: defaults?.agenda_id || undefined,
      pilar_id: defaults?.pilar_id || 'SEMUA',
      pimpinan_rapat:
        'Ir. Stella Mandagi (Kepala BPS Kabupaten Kepulauan Sitaro)',
      notulis: 'Gloria Pangemanan, S.Tr.Stat.',
      peserta_hadir: [
        'Ir. Stella Mandagi',
        'Marselus Tatengkeng, S.E.',
        'Steven Luntungan, S.Si.',
        'Novita Derek, S.E.',
        'Christian Makauntung, S.Tr.Stat.',
        'Feiby Salindeho, S.Stat.',
        'Anggreiny Kalalo, S.Si.',
        'Gloria Pangemanan, S.Tr.Stat.'
      ],
      ringkasan_pembahasan: '',
      kesepakatan_items: [
        {
          id: `item-${Date.now()}-1`,
          poin_kesepakatan: '',
          pilar_id: 'SEMUA',
          pic_name: 'Marselus Tatengkeng, S.E.',
          pic_phone: '082190010001',
          tenggat_waktu: new Date(Date.now() + 7 * 86400000)
            .toISOString()
            .split('T')[0],
          status: 'BELUM_DIKERJAKAN',
          wa_sent: false
        }
      ]
    });
    setPesertaInputText('');
    setIsFormDialogOpen(true);
  };

  const handleOpenEdit = (notulen: NotulenRapat) => {
    setFormData({ ...notulen });
    setPesertaInputText('');
    setIsFormDialogOpen(true);
  };

  const handleAddKesepakatanRow = () => {
    const defaultPegawai = DAFTAR_PEGAWAI_SITARO[1]; // default staff
    const newRow: KesepakatanRapatItem = {
      id: `item-${Date.now()}-${(formData.kesepakatan_items?.length || 0) + 1}`,
      poin_kesepakatan: '',
      pilar_id: formData.pilar_id || 'SEMUA',
      pic_name: defaultPegawai.nama,
      pic_phone: defaultPegawai.phone,
      tenggat_waktu: new Date(Date.now() + 7 * 86400000)
        .toISOString()
        .split('T')[0],
      status: 'BELUM_DIKERJAKAN',
      wa_sent: false
    };
    setFormData((prev) => ({
      ...prev,
      kesepakatan_items: [...(prev.kesepakatan_items || []), newRow]
    }));
  };

  const handleRemoveKesepakatanRow = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      kesepakatan_items: (prev.kesepakatan_items || []).filter(
        (_, i) => i !== index
      )
    }));
  };

  const handleUpdateKesepakatanItem = (
    index: number,
    field: keyof KesepakatanRapatItem,
    value: any
  ) => {
    setFormData((prev) => {
      const items = [...(prev.kesepakatan_items || [])];
      items[index] = {
        ...items[index],
        [field]: value
      };
      return { ...prev, kesepakatan_items: items };
    });
  };

  const handleSelectPicPegawai = (index: number, pegawaiName: string) => {
    const pegawai = DAFTAR_PEGAWAI_SITARO.find((p) => p.nama === pegawaiName);
    setFormData((prev) => {
      const items = [...(prev.kesepakatan_items || [])];
      items[index] = {
        ...items[index],
        pic_name: pegawaiName,
        pic_phone: pegawai?.phone || items[index].pic_phone,
        pilar_id:
          pegawai?.pilarDefault !== 'SEMUA'
            ? pegawai?.pilarDefault || items[index].pilar_id
            : items[index].pilar_id
      };
      return { ...prev, kesepakatan_items: items };
    });
  };

  const handleAddPesertaTag = () => {
    if (!pesertaInputText.trim()) return;
    const name = pesertaInputText.trim();
    if (!formData.peserta_hadir?.includes(name)) {
      setFormData((prev) => ({
        ...prev,
        peserta_hadir: [...(prev.peserta_hadir || []), name]
      }));
    }
    setPesertaInputText('');
  };

  const handleRemovePesertaTag = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      peserta_hadir: (prev.peserta_hadir || []).filter((p) => p !== name)
    }));
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul_rapat || !formData.judul_rapat.trim()) {
      toast.error('Judul rapat wajib diisi.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await saveNotulenAction(formData);
      if (res.success && res.data) {
        toast.success(res.message || 'Notulen berhasil disimpan.');
        // Update local list
        setNotulenList((prev) => {
          const idx = prev.findIndex((n) => n.id === res.data!.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = res.data!;
            return next;
          }
          return [res.data!, ...prev];
        });
        setIsFormDialogOpen(false);
      } else {
        toast.error(res.error || 'Gagal menyimpan notulen.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteNotulen = async (id: string) => {
    if (
      !confirm('Apakah Anda yakin ingin menghapus arsip notulen rapat ini?')
    ) {
      return;
    }

    try {
      const res = await deleteNotulenAction(id);
      if (res.success) {
        toast.success(res.message || 'Notulen berhasil dihapus.');
        setNotulenList((prev) => prev.filter((n) => n.id !== id));
        if (selectedNotulen?.id === id) {
          setIsDetailDialogOpen(false);
          setIsPrintDialogOpen(false);
        }
      } else {
        toast.error(res.error || 'Gagal menghapus notulen.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Terjadi kesalahan saat menghapus.');
    }
  };

  // Convert Kesepakatan to Kanban & Send WA
  const handleConvertToKanbanAndNotify = async (
    notulenId: string,
    kesepakatanId: string
  ) => {
    try {
      setConvertingId(kesepakatanId);
      const res = await convertKesepakatanToKanbanAndNotifyAction(
        notulenId,
        kesepakatanId
      );

      if (res.success && res.data) {
        toast.success(
          res.message || 'Tugas berhasil masuk Kanban dan WA terkirim!'
        );

        // Update in current notulenList and selectedNotulen
        setNotulenList((prev) =>
          prev.map((notulen) => {
            if (notulen.id !== notulenId) return notulen;
            return {
              ...notulen,
              kesepakatan_items: notulen.kesepakatan_items.map((k) =>
                k.id === kesepakatanId ? { ...k, ...res.data } : k
              )
            };
          })
        );

        if (selectedNotulen && selectedNotulen.id === notulenId) {
          setSelectedNotulen((prev) => {
            if (!prev) return null;
            return {
              ...prev,
              kesepakatan_items: prev.kesepakatan_items.map((k) =>
                k.id === kesepakatanId ? { ...k, ...res.data } : k
              )
            };
          });
        }

        // Tampilkan opsi buka WhatsApp Web jika deepLink tersedia
        if (res.waDeepLink) {
          toast(
            <div className='flex flex-col gap-1'>
              <span className='text-xs font-semibold'>
                📱 Tautan WhatsApp Siap
              </span>
              <span className='text-muted-foreground text-xs'>
                Klik tombol di bawah jika ingin mengirim via WhatsApp Web
                langsung:
              </span>
              <a
                href={res.waDeepLink}
                target='_blank'
                rel='noopener noreferrer'
                className='mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline'
              >
                <IconBrandWhatsapp className='h-3.5 w-3.5' /> Buka WhatsApp Web
              </a>
            </div>,
            { duration: 6000 }
          );
        }
      } else {
        toast.error(res.error || 'Gagal mengubah kesepakatan menjadi tugas.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Gagal memproses penugasan.');
    } finally {
      setConvertingId(null);
    }
  };

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  return (
    <div className='space-y-6'>
      {/* HEADER SECTION */}
      <div className='flex flex-col justify-between gap-4 border-b pb-5 md:flex-row md:items-center'>
        <div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className='border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
            >
              <IconFileDescription className='mr-1 h-3.5 w-3.5' /> Tata Naskah
              Dinas BPS
            </Badge>
            <Badge
              variant='secondary'
              className='border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
            >
              <IconBrandWhatsapp className='mr-1 h-3.5 w-3.5' /> Auto-Task & WA
              Dispatch
            </Badge>
          </div>
          <h1 className='mt-2 text-2xl font-bold tracking-tight md:text-3xl'>
            Notulen Rapat Digital & Penugasan Otomatis
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Pencatatan notula rapat tim ZI/RB BPS Kabupaten Kepulauan Sitaro,
            konversi butir kesepakatan menjadi kartu Kanban, dan pengiriman
            tugas ke WhatsApp PIC.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2.5'>
          <Link href='/rebo/kanban'>
            <Button
              variant='outline'
              className='border-amber-200 bg-amber-50/70 text-amber-700 hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
            >
              <IconLayoutKanban className='mr-1.5 h-4 w-4' /> Papan Kanban
            </Button>
          </Link>
          <Button
            onClick={() => handleOpenCreateNew()}
            className='bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
          >
            <IconPlus className='mr-1.5 h-4 w-4' /> Catat Notula Baru
          </Button>
        </div>
      </div>

      {/* 4 STATISTIK UTAMA */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <Card className='border-l-4 border-l-blue-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Total Notula Rapat
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span>{stats.totalNotulen}</span>
              <IconFileDescription className='h-5 w-5 text-blue-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            Arsip resmi BPS Sitaro 2026
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-cyan-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Butir Kesepakatan
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span>{stats.totalKesepakatan}</span>
              <IconClipboardCheck className='h-5 w-5 text-cyan-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            {stats.kesepakatanSelesai} selesai ditindaklanjuti
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-amber-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Ditugaskan ke Kanban
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span>{stats.ditugaskanKanban}</span>
              <IconLayoutKanban className='h-5 w-5 text-amber-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            Terhubung kartu tindak lanjut LKE
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-emerald-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Notifikasi WA Terkirim
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span>{stats.waTerkirim}</span>
              <IconBrandWhatsapp className='h-5 w-5 text-emerald-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            Kirim langsung ke ponsel PIC
          </CardContent>
        </Card>
      </div>

      {/* BAR PENCARIAN & FILTER */}
      <Card className='shadow-xs'>
        <CardContent className='p-4'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            {/* Input Search */}
            <div className='relative flex-1'>
              <IconSearch className='text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2' />
              <Input
                placeholder='Cari nomor notula, agenda, pimpinan, peserta, atau kesepakatan...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='pl-9'
              />
            </div>

            {/* Select Filter Pilar */}
            <div className='flex flex-wrap items-center gap-2'>
              <Select value={filterPilar} onValueChange={setFilterPilar}>
                <SelectTrigger className='w-[190px]'>
                  <SelectValue placeholder='Filter Pilar' />
                </SelectTrigger>
                <SelectContent>
                  {NOTULEN_PILAR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Select Filter Tahun */}
              <Select value={filterTahun} onValueChange={setFilterTahun}>
                <SelectTrigger className='w-[110px]'>
                  <SelectValue placeholder='Tahun' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua</SelectItem>
                  <SelectItem value='2026'>2026</SelectItem>
                  <SelectItem value='2025'>2025</SelectItem>
                </SelectContent>
              </Select>

              {/* View Mode Toggle */}
              <div className='bg-muted flex items-center rounded-lg p-0.5'>
                <Button
                  size='sm'
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  className='h-8 px-2.5'
                  onClick={() => setViewMode('grid')}
                  title='Tampilan Berkas Kartu'
                >
                  <IconLayoutGrid className='h-4 w-4' />
                </Button>
                <Button
                  size='sm'
                  variant={viewMode === 'table' ? 'secondary' : 'ghost'}
                  className='h-8 px-2.5'
                  onClick={() => setViewMode('table')}
                  title='Tampilan Tabel Rinci'
                >
                  <IconList className='h-4 w-4' />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CONTENT LISTING: GRID OR TABLE */}
      {filteredNotulen.length === 0 ? (
        <Card className='border-dashed py-12 text-center'>
          <CardContent className='flex flex-col items-center justify-center space-y-3'>
            <IconFileDescription className='text-muted-foreground h-12 w-12 stroke-1' />
            <h3 className='text-base font-semibold'>
              Tidak Ada Notulen Ditemukan
            </h3>
            <p className='text-muted-foreground max-w-sm text-sm'>
              Tidak ada arsip notula yang sesuai dengan kriteria filter atau
              pencarian Anda.
            </p>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                setSearchQuery('');
                setFilterPilar('SEMUA');
                setFilterTahun('2026');
              }}
            >
              Reset Filter
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === 'grid' ? (
        <div className='grid grid-cols-1 gap-5 md:grid-cols-2'>
          {filteredNotulen.map((notulen) => {
            const totalItems = notulen.kesepakatan_items?.length || 0;
            const completedItems =
              notulen.kesepakatan_items?.filter((k) => k.status === 'SELESAI')
                .length || 0;
            const kanbanCount =
              notulen.kesepakatan_items?.filter((k) => k.kanban_card_id)
                .length || 0;
            const pilarLabel =
              NOTULEN_PILAR_OPTIONS.find((p) => p.value === notulen.pilar_id)
                ?.label || `Pilar ${notulen.pilar_id}`;

            const formattedDate = new Date(notulen.tanggal).toLocaleDateString(
              'id-ID',
              {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              }
            );

            return (
              <Card
                key={notulen.id}
                className='flex flex-col justify-between transition-all hover:border-slate-400 hover:shadow-md'
              >
                <CardHeader className='p-5 pb-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <div className='flex flex-wrap items-center gap-2'>
                        <Badge
                          variant='outline'
                          className='font-mono text-xs font-semibold'
                        >
                          {notulen.nomor_notula}
                        </Badge>
                        <Badge
                          variant='secondary'
                          className='bg-blue-50 text-xs text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                        >
                          {pilarLabel}
                        </Badge>
                      </div>
                      <CardTitle className='mt-2.5 text-lg leading-snug font-bold'>
                        {notulen.judul_rapat}
                      </CardTitle>
                    </div>

                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground h-8 w-8 shrink-0'
                      title='Salin Nomor Notula'
                      onClick={() =>
                        handleCopyText(
                          notulen.nomor_notula,
                          'Nomor Notula Rapat'
                        )
                      }
                    >
                      <IconCopy className='h-4 w-4' />
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className='flex-1 space-y-3.5 p-5 pt-0 text-sm'>
                  {/* Metadata: Waktu & Tempat */}
                  <div className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-2'>
                    <div className='text-muted-foreground flex items-center gap-1.5'>
                      <IconCalendar className='h-4 w-4 shrink-0 text-blue-500' />
                      <span>{formattedDate}</span>
                    </div>
                    <div className='text-muted-foreground flex items-center gap-1.5'>
                      <IconClock className='h-4 w-4 shrink-0 text-cyan-500' />
                      <span>
                        {notulen.waktu_mulai} - {notulen.waktu_selesai} WITA
                      </span>
                    </div>
                    <div className='text-muted-foreground flex items-center gap-1.5 sm:col-span-2'>
                      <IconMapPin className='h-4 w-4 shrink-0 text-rose-500' />
                      <span className='line-clamp-1'>{notulen.tempat}</span>
                    </div>
                  </div>

                  {/* Pimpinan & Notulis */}
                  <div className='border-muted bg-muted/30 space-y-1.5 rounded-md border p-2.5 text-xs'>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-muted-foreground font-semibold'>
                        Pimpinan:
                      </span>
                      <span className='line-clamp-1 font-medium'>
                        {notulen.pimpinan_rapat}
                      </span>
                    </div>
                    <div className='flex items-center gap-1.5'>
                      <span className='text-muted-foreground font-semibold'>
                        Notulis:
                      </span>
                      <span className='line-clamp-1 font-medium'>
                        {notulen.notulis}
                      </span>
                    </div>
                  </div>

                  {/* Ringkasan Kesepakatan & Tugas */}
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-xs font-semibold'>
                      <span className='flex items-center gap-1'>
                        <IconClipboardCheck className='h-4 w-4 text-emerald-600' />
                        Kesepakatan Rapat ({completedItems}/{totalItems}{' '}
                        Selesai)
                      </span>
                      {kanbanCount > 0 && (
                        <span className='text-amber-600 dark:text-amber-400'>
                          {kanbanCount} di Kanban
                        </span>
                      )}
                    </div>

                    {/* Progress Bar mini */}
                    <div className='bg-muted h-1.5 w-full overflow-hidden rounded-full'>
                      <div
                        className='h-full bg-emerald-500 transition-all'
                        style={{
                          width: `${totalItems > 0 ? (completedItems / totalItems) * 100 : 0}%`
                        }}
                      />
                    </div>

                    {/* Preview 2 butir kesepakatan teratas */}
                    <div className='space-y-1.5 pt-1'>
                      {notulen.kesepakatan_items
                        ?.slice(0, 2)
                        .map((k, itemIdx) => {
                          const config = STATUS_KESEPAKATAN_CONFIG[k.status];
                          return (
                            <div
                              key={k.id || itemIdx}
                              className='flex items-start justify-between gap-2 rounded bg-slate-50 p-2 text-xs dark:bg-slate-900/60'
                            >
                              <div className='flex-1'>
                                <p className='line-clamp-1 font-medium'>
                                  {itemIdx + 1}. {k.poin_kesepakatan}
                                </p>
                                <span className='text-muted-foreground text-[11px]'>
                                  PIC: {k.pic_name} • Deadline:{' '}
                                  {k.tenggat_waktu}
                                </span>
                              </div>
                              <Badge
                                variant='outline'
                                className={`shrink-0 text-[10px] ${config.badgeColor}`}
                              >
                                {config.label}
                              </Badge>
                            </div>
                          );
                        })}
                      {totalItems > 2 && (
                        <p className='text-muted-foreground text-center text-[11px] italic'>
                          + {totalItems - 2} butir kesepakatan lainnya
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>

                {/* FOOTER ACTIONS */}
                <div className='flex flex-wrap items-center justify-between gap-2 border-t p-4 pt-3'>
                  <div className='flex items-center gap-1.5'>
                    <Button
                      variant='outline'
                      size='sm'
                      className='h-8 text-xs'
                      onClick={() => {
                        setSelectedNotulen(notulen);
                        setIsPrintDialogOpen(true);
                      }}
                      title='Cetak Naskah Dinas BPS'
                    >
                      <IconPrinter className='mr-1 h-3.5 w-3.5' /> Naskah Dinas
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-slate-600 hover:text-slate-900'
                      onClick={() => handleOpenEdit(notulen)}
                      title='Edit Notulen'
                    >
                      <IconEdit className='h-3.5 w-3.5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700'
                      onClick={() => handleDeleteNotulen(notulen.id)}
                      title='Hapus Notulen'
                    >
                      <IconTrash className='h-3.5 w-3.5' />
                    </Button>
                  </div>

                  <Button
                    size='sm'
                    className='h-8 bg-blue-600 text-xs text-white hover:bg-blue-700'
                    onClick={() => {
                      setSelectedNotulen(notulen);
                      setIsDetailDialogOpen(true);
                    }}
                  >
                    Kelola Tugas WA & Kanban
                    <IconArrowRight className='ml-1.5 h-3.5 w-3.5' />
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <Card className='shadow-xs'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className='w-[140px]'>Nomor Notula</TableHead>
                <TableHead>Judul Agenda Rapat</TableHead>
                <TableHead className='w-[140px]'>Tanggal & Jam</TableHead>
                <TableHead className='w-[160px]'>Pimpinan & Notulis</TableHead>
                <TableHead className='w-[120px]'>Pilar</TableHead>
                <TableHead className='w-[130px]'>Kesepakatan</TableHead>
                <TableHead className='w-[180px] text-right'>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotulen.map((notulen) => {
                const totalItems = notulen.kesepakatan_items?.length || 0;
                const completedItems =
                  notulen.kesepakatan_items?.filter(
                    (k) => k.status === 'SELESAI'
                  ).length || 0;

                return (
                  <TableRow key={notulen.id}>
                    <TableCell className='font-mono text-xs font-semibold'>
                      {notulen.nomor_notula}
                    </TableCell>
                    <TableCell>
                      <div className='font-semibold'>{notulen.judul_rapat}</div>
                      <div className='text-muted-foreground text-xs'>
                        {notulen.tempat}
                      </div>
                    </TableCell>
                    <TableCell className='text-xs'>
                      <div>{notulen.tanggal}</div>
                      <div className='text-muted-foreground'>
                        {notulen.waktu_mulai} - {notulen.waktu_selesai}
                      </div>
                    </TableCell>
                    <TableCell className='text-xs'>
                      <div className='line-clamp-1 font-medium'>
                        {notulen.pimpinan_rapat}
                      </div>
                      <div className='text-muted-foreground line-clamp-1'>
                        Notulis: {notulen.notulis}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant='outline' className='text-xs'>
                        {notulen.pilar_id === 'SEMUA'
                          ? 'Pleno ZI'
                          : `Pilar ${notulen.pilar_id}`}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-xs'>
                      <span className='font-semibold'>
                        {completedItems}/{totalItems}
                      </span>{' '}
                      Selesai
                    </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-1.5'>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-blue-600'
                          onClick={() => {
                            setSelectedNotulen(notulen);
                            setIsDetailDialogOpen(true);
                          }}
                          title='Detail & Tindak Lanjut'
                        >
                          <IconClipboardCheck className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-slate-600'
                          onClick={() => {
                            setSelectedNotulen(notulen);
                            setIsPrintDialogOpen(true);
                          }}
                          title='Cetak Naskah Dinas'
                        >
                          <IconPrinter className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-slate-600'
                          onClick={() => handleOpenEdit(notulen)}
                          title='Edit'
                        >
                          <IconEdit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          className='h-8 w-8 text-rose-500'
                          onClick={() => handleDeleteNotulen(notulen.id)}
                          title='Hapus'
                        >
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* DIALOG 1: FORM PENCATATAN / EDIT NOTULEN */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          <form onSubmit={handleSubmitForm}>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-xl'>
                <IconFileDescription className='h-5 w-5 text-blue-600' />
                {formData.id
                  ? 'Edit Notulen Rapat'
                  : 'Catat Notulen Rapat Baru'}
              </DialogTitle>
              <DialogDescription>
                Format naskah dinas resmi BPS Kabupaten Kepulauan Sitaro sesuai
                pedoman tata naskah dinas dan auto-task assignment.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-6 py-4'>
              {/* BAGIAN I: INFORMASI UMUM & NASKAH DINAS */}
              <div className='border-muted bg-muted/20 space-y-4 rounded-lg border p-4'>
                <h4 className='text-sm font-semibold tracking-tight text-blue-900 dark:text-blue-300'>
                  I. Informasi Naskah Dinas & Agenda Rapat
                </h4>

                <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
                  <div className='md:col-span-2'>
                    <Label htmlFor='judul_rapat'>Judul / Agenda Rapat *</Label>
                    <Input
                      id='judul_rapat'
                      placeholder='Contoh: Rapat Koordinasi Kick-Off Pembangunan ZI Menuju WBK 2026'
                      value={formData.judul_rapat || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          judul_rapat: e.target.value
                        }))
                      }
                      required
                      className='mt-1'
                    />
                  </div>

                  <div>
                    <Label htmlFor='nomor_notula'>
                      Nomor Notula (Standar ND BPS) *
                    </Label>
                    <div className='mt-1 flex gap-2'>
                      <Input
                        id='nomor_notula'
                        placeholder='ND-01/BPS/7108/01/2026'
                        value={formData.nomor_notula || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            nomor_notula: e.target.value
                          }))
                        }
                        className='font-mono'
                        required
                      />
                      <Button
                        type='button'
                        variant='outline'
                        size='sm'
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            nomor_notula: generateNomorNotula(
                              notulenList.length + 1,
                              prev.tanggal
                            )
                          }))
                        }
                        title='Auto generate nomor'
                      >
                        <IconRefresh className='h-4 w-4' />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='pilar_id'>Pilar / Fokus Area</Label>
                    <Select
                      value={formData.pilar_id || 'SEMUA'}
                      onValueChange={(val) =>
                        setFormData((prev) => ({ ...prev, pilar_id: val }))
                      }
                    >
                      <SelectTrigger id='pilar_id' className='mt-1'>
                        <SelectValue placeholder='Pilih Pilar' />
                      </SelectTrigger>
                      <SelectContent>
                        {NOTULEN_PILAR_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor='tanggal'>
                      Hari & Tanggal Pelaksanaan *
                    </Label>
                    <Input
                      id='tanggal'
                      type='date'
                      value={formData.tanggal || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tanggal: e.target.value
                        }))
                      }
                      className='mt-1'
                      required
                    />
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <Label htmlFor='waktu_mulai'>Mulai (WITA)</Label>
                      <Input
                        id='waktu_mulai'
                        type='text'
                        placeholder='09:00'
                        value={formData.waktu_mulai || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            waktu_mulai: e.target.value
                          }))
                        }
                        className='mt-1'
                      />
                    </div>
                    <div>
                      <Label htmlFor='waktu_selesai'>Selesai (WITA)</Label>
                      <Input
                        id='waktu_selesai'
                        type='text'
                        placeholder='12:00'
                        value={formData.waktu_selesai || ''}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            waktu_selesai: e.target.value
                          }))
                        }
                        className='mt-1'
                      />
                    </div>
                  </div>

                  <div className='md:col-span-2'>
                    <Label htmlFor='tempat'>Tempat Pelaksanaan Rapat *</Label>
                    <Input
                      id='tempat'
                      placeholder='Aula Sasahara BPS Sitaro (Lt. 2)'
                      value={formData.tempat || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tempat: e.target.value
                        }))
                      }
                      className='mt-1'
                      required
                    />
                    <div className='mt-1.5 flex flex-wrap gap-1.5'>
                      {[
                        'Aula Sasahara BPS Sitaro (Lt. 2)',
                        'Ruang Rapat Integritas',
                        'Studio Multimedia BPS Sitaro',
                        'Aula Sasahara & Hybrid Zoom'
                      ].map((chip) => (
                        <button
                          key={chip}
                          type='button'
                          onClick={() =>
                            setFormData((prev) => ({ ...prev, tempat: chip }))
                          }
                          className='bg-muted hover:bg-muted/80 rounded-md px-2 py-0.5 text-[11px] text-slate-700 dark:text-slate-300'
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor='pimpinan_rapat'>Pimpinan Rapat *</Label>
                    <Input
                      id='pimpinan_rapat'
                      value={formData.pimpinan_rapat || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          pimpinan_rapat: e.target.value
                        }))
                      }
                      className='mt-1'
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor='notulis'>Notulis / Pencatat *</Label>
                    <Input
                      id='notulis'
                      value={formData.notulis || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          notulis: e.target.value
                        }))
                      }
                      className='mt-1'
                      required
                    />
                  </div>

                  {/* Peserta Hadir (Tags) */}
                  <div className='md:col-span-2'>
                    <Label>Daftar Peserta Rapat Hadir</Label>
                    <div className='mt-1 flex gap-2'>
                      <Input
                        placeholder='Ketik nama peserta atau klik cepat saran di bawah...'
                        value={pesertaInputText}
                        onChange={(e) => setPesertaInputText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddPesertaTag();
                          }
                        }}
                      />
                      <Button
                        type='button'
                        variant='outline'
                        onClick={handleAddPesertaTag}
                      >
                        Tambah
                      </Button>
                    </div>

                    {/* Pegawai Chips Suggestions */}
                    <div className='mt-2 flex flex-wrap gap-1.5'>
                      {DAFTAR_PEGAWAI_SITARO.map((p) => {
                        const isAdded = formData.peserta_hadir?.includes(
                          p.nama
                        );
                        return (
                          <button
                            key={p.nama}
                            type='button'
                            disabled={isAdded}
                            onClick={() => {
                              if (!isAdded) {
                                setFormData((prev) => ({
                                  ...prev,
                                  peserta_hadir: [
                                    ...(prev.peserta_hadir || []),
                                    p.nama
                                  ]
                                }));
                              }
                            }}
                            className={`rounded-md px-2 py-0.5 text-[11px] transition-colors ${
                              isAdded
                                ? 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300'
                            }`}
                          >
                            {isAdded ? '✓ ' : '+ '}
                            {p.nama}
                          </button>
                        );
                      })}
                    </div>

                    {/* Active Peserta Tags */}
                    <div className='mt-2.5 flex flex-wrap gap-1.5'>
                      {(formData.peserta_hadir || []).map((peserta) => (
                        <Badge
                          key={peserta}
                          variant='secondary'
                          className='flex items-center gap-1 text-xs'
                        >
                          {peserta}
                          <button
                            type='button'
                            onClick={() => handleRemovePesertaTag(peserta)}
                            className='hover:text-destructive ml-1 text-slate-400'
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* BAGIAN II: RINGKASAN PEMBAHASAN */}
              <div className='border-muted bg-muted/20 space-y-3 rounded-lg border p-4'>
                <h4 className='text-sm font-semibold tracking-tight text-blue-900 dark:text-blue-300'>
                  II. Ringkasan Pembahasan & Dinamika Rapat
                </h4>
                <p className='text-muted-foreground text-xs'>
                  Catat jalannya diskusi rapat, pokok arahan pimpinan, tanggapan
                  koordinator pilar, serta kendala yang dievaluasi bersama.
                </p>
                <Textarea
                  rows={5}
                  placeholder='1. Pembukaan oleh Kepala BPS Sitaro...&#10;2. Pemaparan capaian LKE oleh koordinator...&#10;3. Tanggapan dan diskusi...'
                  value={formData.ringkasan_pembahasan || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      ringkasan_pembahasan: e.target.value
                    }))
                  }
                  required
                />
              </div>

              {/* BAGIAN III: BUTIR KESEPAKATAN & AUTO-TASK ASSIGNMENT */}
              <div className='border-muted bg-muted/20 space-y-4 rounded-lg border p-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h4 className='text-sm font-semibold tracking-tight text-blue-900 dark:text-blue-300'>
                      III. Butir Kesepakatan & Penugasan Tindak Lanjut
                    </h4>
                    <p className='text-muted-foreground text-xs'>
                      Setiap butir kesepakatan dapat dikonversi menjadi kartu
                      tugas di papan Kanban dan diteruskan ke WhatsApp PIC.
                    </p>
                  </div>
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={handleAddKesepakatanRow}
                    className='border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300'
                  >
                    <IconPlus className='mr-1 h-3.5 w-3.5' /> Tambah Butir
                  </Button>
                </div>

                <div className='space-y-3'>
                  {(formData.kesepakatan_items || []).length === 0 ? (
                    <div className='bg-background text-muted-foreground rounded-md border border-dashed p-4 text-center text-xs'>
                      Belum ada butir kesepakatan yang ditambahkan. Klik tombol{' '}
                      <b>+ Tambah Butir</b> di atas.
                    </div>
                  ) : (
                    formData.kesepakatan_items?.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className='bg-background space-y-3 rounded-lg border p-3.5 shadow-2xs'
                      >
                        <div className='flex items-start justify-between gap-2'>
                          <span className='rounded bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 dark:bg-blue-900 dark:text-blue-200'>
                            Butir #{idx + 1}
                          </span>
                          <Button
                            type='button'
                            variant='ghost'
                            size='sm'
                            className='text-destructive h-7 px-2 hover:bg-rose-50'
                            onClick={() => handleRemoveKesepakatanRow(idx)}
                          >
                            <IconTrash className='mr-1 h-3.5 w-3.5' /> Hapus
                          </Button>
                        </div>

                        <div>
                          <Label className='text-xs'>
                            Poin Kesepakatan / Tugas Tindak Lanjut *
                          </Label>
                          <Textarea
                            rows={2}
                            placeholder='Tuliskan rumusan tugas spesifik yang harus diselesaikan...'
                            value={item.poin_kesepakatan}
                            onChange={(e) =>
                              handleUpdateKesepakatanItem(
                                idx,
                                'poin_kesepakatan',
                                e.target.value
                              )
                            }
                            required
                            className='mt-1 text-xs'
                          />
                        </div>

                        <div className='grid grid-cols-1 gap-2.5 sm:grid-cols-4'>
                          {/* PIC Pegawai */}
                          <div>
                            <Label className='text-xs'>PIC Pegawai *</Label>
                            <Select
                              value={item.pic_name}
                              onValueChange={(val) =>
                                handleSelectPicPegawai(idx, val)
                              }
                            >
                              <SelectTrigger className='mt-1 h-8 text-xs'>
                                <SelectValue placeholder='Pilih PIC' />
                              </SelectTrigger>
                              <SelectContent>
                                {DAFTAR_PEGAWAI_SITARO.map((pegawai) => (
                                  <SelectItem
                                    key={pegawai.nama}
                                    value={pegawai.nama}
                                  >
                                    {pegawai.nama}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* No WA PIC */}
                          <div>
                            <Label className='text-xs'>
                              Nomor WhatsApp PIC *
                            </Label>
                            <Input
                              placeholder='0821...'
                              value={item.pic_phone}
                              onChange={(e) =>
                                handleUpdateKesepakatanItem(
                                  idx,
                                  'pic_phone',
                                  e.target.value
                                )
                              }
                              required
                              className='mt-1 h-8 font-mono text-xs'
                            />
                          </div>

                          {/* Tenggat Waktu */}
                          <div>
                            <Label className='text-xs'>Tenggat Waktu *</Label>
                            <Input
                              type='date'
                              value={item.tenggat_waktu}
                              onChange={(e) =>
                                handleUpdateKesepakatanItem(
                                  idx,
                                  'tenggat_waktu',
                                  e.target.value
                                )
                              }
                              required
                              className='mt-1 h-8 text-xs'
                            />
                          </div>

                          {/* Status */}
                          <div>
                            <Label className='text-xs'>Status Tugas</Label>
                            <Select
                              value={item.status}
                              onValueChange={(val) =>
                                handleUpdateKesepakatanItem(
                                  idx,
                                  'status',
                                  val as StatusKesepakatan
                                )
                              }
                            >
                              <SelectTrigger className='mt-1 h-8 text-xs'>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value='BELUM_DIKERJAKAN'>
                                  Belum Dikerjakan
                                </SelectItem>
                                <SelectItem value='SEDANG_PROSES'>
                                  Sedang Proses
                                </SelectItem>
                                <SelectItem value='SELESAI'>Selesai</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className='gap-2 sm:gap-0'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsFormDialogOpen(false)}
              >
                Batal
              </Button>
              <Button
                type='submit'
                disabled={isSubmitting}
                className='bg-blue-600 hover:bg-blue-700'
              >
                {isSubmitting ? (
                  <>
                    <IconLoader2 className='mr-1.5 h-4 w-4 animate-spin' />{' '}
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <IconCheck className='mr-1.5 h-4 w-4' /> Simpan Notulen
                    Resmi
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: KELOLA TUGAS KANBAN & WHATSAPP DISPATCH */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          {selectedNotulen && (
            <div className='space-y-6'>
              <DialogHeader>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge variant='outline' className='font-mono'>
                    {selectedNotulen.nomor_notula}
                  </Badge>
                  <Badge
                    variant='secondary'
                    className='bg-blue-50 text-blue-700'
                  >
                    {selectedNotulen.pilar_id === 'SEMUA'
                      ? 'Pleno ZI Sitaro'
                      : `Pilar ${selectedNotulen.pilar_id}`}
                  </Badge>
                </div>
                <DialogTitle className='mt-1 text-xl font-bold'>
                  {selectedNotulen.judul_rapat}
                </DialogTitle>
                <DialogDescription>
                  Kelola penugasan otomatis kesepakatan rapat ke papan Kanban
                  dan kirim notifikasi penugasan ke nomor WhatsApp PIC.
                </DialogDescription>
              </DialogHeader>

              {/* Rincian Singkat Rapat */}
              <div className='grid grid-cols-2 gap-3 rounded-lg border bg-slate-50 p-3 text-xs md:grid-cols-4 dark:bg-slate-900'>
                <div>
                  <span className='text-muted-foreground block'>
                    Hari / Tanggal
                  </span>
                  <span className='font-semibold'>
                    {selectedNotulen.tanggal}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground block'>Waktu</span>
                  <span className='font-semibold'>
                    {selectedNotulen.waktu_mulai} -{' '}
                    {selectedNotulen.waktu_selesai} WITA
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground block'>
                    Pimpinan Rapat
                  </span>
                  <span className='line-clamp-1 font-semibold'>
                    {selectedNotulen.pimpinan_rapat}
                  </span>
                </div>
                <div>
                  <span className='text-muted-foreground block'>Tempat</span>
                  <span className='line-clamp-1 font-semibold'>
                    {selectedNotulen.tempat}
                  </span>
                </div>
              </div>

              {/* DAFTAR BUTIR KESEPAKATAN DENGAN AKSI 1-KLIK */}
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h4 className='flex items-center gap-2 text-sm font-bold text-slate-800 dark:text-slate-200'>
                    <IconClipboardCheck className='h-4 w-4 text-emerald-600' />
                    Daftar Butir Kesepakatan & Aksi Auto-Task
                  </h4>
                  <span className='text-muted-foreground text-xs'>
                    {selectedNotulen.kesepakatan_items?.length || 0} butir
                    kesepakatan
                  </span>
                </div>

                <div className='space-y-3.5'>
                  {selectedNotulen.kesepakatan_items?.map((item, idx) => {
                    const statusConfig = STATUS_KESEPAKATAN_CONFIG[item.status];
                    const isConverting = convertingId === item.id;
                    const isAssigned = Boolean(item.kanban_card_id);

                    return (
                      <Card
                        key={item.id || idx}
                        className={`transition-colors ${
                          item.wa_sent
                            ? 'border-emerald-200 bg-emerald-50/20 dark:border-emerald-900 dark:bg-emerald-950/10'
                            : ''
                        }`}
                      >
                        <CardContent className='space-y-3 p-4'>
                          <div className='flex flex-wrap items-start justify-between gap-2'>
                            <div className='flex-1 space-y-1'>
                              <div className='flex flex-wrap items-center gap-2'>
                                <span className='rounded bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-800 dark:bg-slate-800 dark:text-slate-200'>
                                  Butir #{idx + 1}
                                </span>
                                <Badge
                                  variant='outline'
                                  className={statusConfig.badgeColor}
                                >
                                  {statusConfig.label}
                                </Badge>
                                {isAssigned && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-amber-100 font-mono text-[11px] text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                  >
                                    <IconLayoutKanban className='mr-1 h-3 w-3' />
                                    {item.kanban_card_id}
                                  </Badge>
                                )}
                                {item.wa_sent && (
                                  <Badge
                                    variant='secondary'
                                    className='bg-emerald-100 text-[11px] text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  >
                                    <IconCheck className='mr-1 h-3 w-3' /> WA
                                    Terkirim
                                  </Badge>
                                )}
                              </div>

                              <p className='mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100'>
                                {item.poin_kesepakatan}
                              </p>
                            </div>
                          </div>

                          {/* Metadata PIC & Tenggat */}
                          <div className='flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-400'>
                            <div className='flex items-center gap-1.5'>
                              <IconUser className='h-3.5 w-3.5 text-blue-500' />
                              <span>
                                <b>PIC:</b> {item.pic_name}
                              </span>
                            </div>
                            <div className='flex items-center gap-1.5 font-mono'>
                              <IconBrandWhatsapp className='h-3.5 w-3.5 text-emerald-500' />
                              <span>{item.pic_phone}</span>
                            </div>
                            <div className='flex items-center gap-1.5'>
                              <IconClock className='h-3.5 w-3.5 text-rose-500' />
                              <span>
                                <b>Deadline:</b> {item.tenggat_waktu}
                              </span>
                            </div>
                          </div>

                          {/* Action Button Bar */}
                          <div className='flex flex-wrap items-center justify-between gap-2 border-t pt-2.5'>
                            <div className='text-muted-foreground text-[11px]'>
                              {item.wa_sent_at
                                ? `Notifikasi dikirim: ${new Date(item.wa_sent_at).toLocaleString('id-ID')}`
                                : 'Belum disinkronkan ke Kanban/WA'}
                            </div>

                            <div className='flex items-center gap-2'>
                              {/* Tombol 1-Klik: Jadikan Tugas Kanban & Kirim WA */}
                              <Button
                                size='sm'
                                disabled={isConverting}
                                onClick={() =>
                                  handleConvertToKanbanAndNotify(
                                    selectedNotulen.id,
                                    item.id
                                  )
                                }
                                className={
                                  item.wa_sent
                                    ? 'bg-emerald-700 text-white hover:bg-emerald-800'
                                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                                }
                              >
                                {isConverting ? (
                                  <>
                                    <IconLoader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                                    Memproses...
                                  </>
                                ) : item.wa_sent ? (
                                  <>
                                    <IconSend className='mr-1.5 h-3.5 w-3.5' />
                                    Kirim Ulang WA & Update Kanban
                                  </>
                                ) : (
                                  <>
                                    <IconBrandWhatsapp className='mr-1.5 h-3.5 w-3.5' />
                                    Jadikan Tugas Kanban & Kirim WA
                                  </>
                                )}
                              </Button>

                              {/* Tautan Cepat ke Kanban */}
                              {isAssigned && (
                                <Link href='/rebo/kanban'>
                                  <Button
                                    variant='outline'
                                    size='sm'
                                    className='border-amber-300 text-amber-700 hover:bg-amber-50 dark:text-amber-300'
                                  >
                                    <IconExternalLink className='mr-1 h-3.5 w-3.5' />{' '}
                                    Buka di Kanban
                                  </Button>
                                </Link>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              <DialogFooter className='gap-2 sm:gap-0'>
                <Button
                  variant='outline'
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Tutup
                </Button>
                <Button
                  variant='secondary'
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    setIsPrintDialogOpen(true);
                  }}
                >
                  <IconPrinter className='mr-1.5 h-4 w-4' /> Cetak Naskah Dinas
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DIALOG 3: TAMPILAN CETAK NASKAH DINAS BPS SITARO */}
      <Dialog open={isPrintDialogOpen} onOpenChange={setIsPrintDialogOpen}>
        <DialogContent className='max-h-[92vh] max-w-4xl overflow-y-auto p-0'>
          {selectedNotulen && (
            <div>
              {/* Top Bar for Action (Hidden on Print) */}
              <div className='flex items-center justify-between border-b bg-slate-100 p-4 dark:bg-slate-900 print:hidden'>
                <div className='flex items-center gap-2'>
                  <Badge variant='outline' className='bg-white font-mono'>
                    Pratinjau Naskah Dinas
                  </Badge>
                  <span className='text-muted-foreground text-xs'>
                    Format standar Perka BPS tentang Tata Naskah Dinas
                  </span>
                </div>
                <div className='flex items-center gap-2'>
                  <Button
                    size='sm'
                    onClick={() => window.print()}
                    className='bg-blue-600 text-white hover:bg-blue-700'
                  >
                    <IconPrinter className='mr-1.5 h-4 w-4' /> Cetak / Unduh PDF
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => setIsPrintDialogOpen(false)}
                  >
                    Tutup
                  </Button>
                </div>
              </div>

              {/* DOKUMEN CETAK RESMI FORMAT NASKAH DINAS */}
              <div className='bg-white p-8 text-black print:p-0'>
                {/* KOP SURAT BPS SITARO */}
                <div className='border-b-2 border-black pb-3 text-center'>
                  <h3 className='text-sm font-bold tracking-wider'>
                    BADAN PUSAT STATISTIK
                  </h3>
                  <h2 className='text-base font-extrabold tracking-wider'>
                    KABUPATEN KEPULAUAN SITARO
                  </h2>
                  <p className='text-[11px] text-slate-700'>
                    Jalan Paseng, Ondong Siau Barat, Kab. Kepl. Siau Tagulandang
                    Biaro, Sulawesi Utara 95861
                  </p>
                  <p className='text-[10px] text-slate-600'>
                    Pos-el: bps7108@bps.go.id | Laman Resmi:
                    https://sitarokab.bps.go.id
                  </p>
                </div>

                {/* JUDUL NOTULA */}
                <div className='mt-5 text-center'>
                  <h1 className='text-base font-bold tracking-wide uppercase underline'>
                    NOTULA RAPAT
                  </h1>
                  <p className='text-xs font-medium'>
                    Nomor: {selectedNotulen.nomor_notula}
                  </p>
                </div>

                {/* TABEL INFORMASI RAPAT */}
                <div className='mt-5 text-xs'>
                  <table className='w-full border-collapse'>
                    <tbody>
                      <tr>
                        <td className='w-36 py-1 font-semibold'>
                          Hari / Tanggal
                        </td>
                        <td className='w-3 py-1'>:</td>
                        <td className='py-1'>
                          {new Date(selectedNotulen.tanggal).toLocaleDateString(
                            'id-ID',
                            {
                              weekday: 'long',
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric'
                            }
                          )}
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1 font-semibold'>Waktu</td>
                        <td className='py-1'>:</td>
                        <td className='py-1'>
                          {selectedNotulen.waktu_mulai} s.d.{' '}
                          {selectedNotulen.waktu_selesai} WITA
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1 font-semibold'>Tempat</td>
                        <td className='py-1'>:</td>
                        <td className='py-1'>{selectedNotulen.tempat}</td>
                      </tr>
                      <tr>
                        <td className='py-1 font-semibold'>Acara / Agenda</td>
                        <td className='py-1'>:</td>
                        <td className='py-1 font-medium'>
                          {selectedNotulen.judul_rapat}
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1 font-semibold'>Pimpinan Rapat</td>
                        <td className='py-1'>:</td>
                        <td className='py-1'>
                          {selectedNotulen.pimpinan_rapat}
                        </td>
                      </tr>
                      <tr>
                        <td className='py-1 font-semibold'>Notulis</td>
                        <td className='py-1'>:</td>
                        <td className='py-1'>{selectedNotulen.notulis}</td>
                      </tr>
                      <tr className='align-top'>
                        <td className='py-1 font-semibold'>Peserta Hadir</td>
                        <td className='py-1'>:</td>
                        <td className='py-1'>
                          <ol className='list-inside list-decimal space-y-0.5'>
                            {selectedNotulen.peserta_hadir.map((p, i) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ol>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* BAGIAN I: PEMBAHASAN */}
                <div className='mt-6 space-y-2 text-xs'>
                  <h3 className='font-bold tracking-wide uppercase'>
                    I. Pembahasan / Jalannya Rapat
                  </h3>
                  <div className='rounded border bg-slate-50/50 p-3 text-justify leading-relaxed whitespace-pre-wrap'>
                    {selectedNotulen.ringkasan_pembahasan}
                  </div>
                </div>

                {/* BAGIAN II: KESEPAKATAN DAN TINDAK LANJUT */}
                <div className='mt-6 space-y-2 text-xs'>
                  <h3 className='font-bold tracking-wide uppercase'>
                    II. Kesepakatan & Rencana Tindak Lanjut
                  </h3>
                  <table className='w-full border-collapse border border-black text-center text-xs'>
                    <thead>
                      <tr className='bg-slate-100 font-bold'>
                        <th className='w-10 border border-black p-1.5'>No</th>
                        <th className='border border-black p-1.5 text-left'>
                          Butir Kesepakatan / Tindak Lanjut
                        </th>
                        <th className='w-28 border border-black p-1.5'>
                          Penanggung Jawab (PIC)
                        </th>
                        <th className='w-24 border border-black p-1.5'>
                          Tenggat Waktu
                        </th>
                        <th className='w-24 border border-black p-1.5'>
                          Status / Kanban
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedNotulen.kesepakatan_items?.map((item, idx) => (
                        <tr key={item.id || idx}>
                          <td className='border border-black p-1.5 font-medium'>
                            {idx + 1}
                          </td>
                          <td className='border border-black p-1.5 text-left'>
                            {item.poin_kesepakatan}
                          </td>
                          <td className='border border-black p-1.5 text-left'>
                            <div className='font-medium'>{item.pic_name}</div>
                            <div className='text-[10px] text-slate-500'>
                              {item.pic_phone}
                            </div>
                          </td>
                          <td className='border border-black p-1.5'>
                            {item.tenggat_waktu}
                          </td>
                          <td className='border border-black p-1.5'>
                            <span className='font-semibold'>
                              {item.status.replace('_', ' ')}
                            </span>
                            {item.kanban_card_id && (
                              <div className='font-mono text-[10px] text-slate-600'>
                                {item.kanban_card_id}
                              </div>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* PENGESAHAN / TANDA TANGAN */}
                <div className='mt-10 text-xs'>
                  <div className='grid grid-cols-2 gap-8 text-center'>
                    <div>
                      <p className='font-medium'>Mengetahui,</p>
                      <p className='font-bold'>Pimpinan Rapat</p>
                      <div className='h-20' />
                      <p className='font-bold underline'>
                        {selectedNotulen.pimpinan_rapat.split('(')[0].trim()}
                      </p>
                      <p className='text-[11px] text-slate-600'>
                        Kepala BPS Kabupaten Kepulauan Sitaro
                      </p>
                    </div>

                    <div>
                      <p className='font-medium'>
                        Ondong Siau,{' '}
                        {new Date(selectedNotulen.tanggal).toLocaleDateString(
                          'id-ID',
                          {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          }
                        )}
                      </p>
                      <p className='font-bold'>Notulis,</p>
                      <div className='h-20' />
                      <p className='font-bold underline'>
                        {selectedNotulen.notulis}
                      </p>
                      <p className='text-[11px] text-slate-600'>
                        Pranata Komputer BPS Sitaro
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
