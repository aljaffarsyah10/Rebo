'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  type AgendaAksiZI,
  type AgendaKategori,
  type AgendaStatus,
  AGENDA_KATEGORI_MAP,
  AGENDA_PILAR_OPTIONS,
  AGENDA_STATUS_MAP,
  formatAgendaWAReminder
} from '@/lib/agenda/agenda-types';
import {
  createOrUpdateAgendaAction,
  deleteAgendaAction,
  sendAgendaWAReminderAction
} from '@/actions/agenda-actions';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
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
import { toast } from 'sonner';
import {
  IconCalendar,
  IconCalendarEvent,
  IconClock,
  IconMapPin,
  IconUsers,
  IconPlus,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconBrandWhatsapp,
  IconExternalLink,
  IconEdit,
  IconTrash,
  IconInfoCircle,
  IconCheck,
  IconAlertTriangle,
  IconSparkles,
  IconLayoutGrid,
  IconList,
  IconFileDescription
} from '@tabler/icons-react';

interface AgendaCalendarClientProps {
  initialAgendaList: AgendaAksiZI[];
  initialStats?: {
    total: number;
    terjadwal: number;
    berlangsung: number;
    selesai: number;
    rapat: number;
    sosialisasi: number;
    deadline: number;
    monev: number;
    evaluasi: number;
  };
  isAdmin?: boolean;
}

export default function AgendaCalendarClient({
  initialAgendaList,
  initialStats
}: AgendaCalendarClientProps) {
  const [agendaList, setAgendaList] =
    React.useState<AgendaAksiZI[]>(initialAgendaList);
  const [stats, setStats] = React.useState(
    initialStats || {
      total: initialAgendaList.length,
      terjadwal: initialAgendaList.filter((a) => a.status === 'TERJADWAL')
        .length,
      berlangsung: initialAgendaList.filter((a) => a.status === 'BERLANGSUNG')
        .length,
      selesai: initialAgendaList.filter((a) => a.status === 'SELESAI').length,
      rapat: initialAgendaList.filter((a) => a.kategori === 'RAPAT_KOORDINASI')
        .length,
      sosialisasi: initialAgendaList.filter((a) => a.kategori === 'SOSIALISASI')
        .length,
      deadline: initialAgendaList.filter((a) => a.kategori === 'DEADLINE_BUKTI')
        .length,
      monev: initialAgendaList.filter((a) => a.kategori === 'MONEV_BERKALA')
        .length,
      evaluasi: initialAgendaList.filter((a) => a.kategori === 'EVALUASI_TPI')
        .length
    }
  );

  // View Mode: 'calendar' | 'list'
  const [viewMode, setViewMode] = React.useState<'calendar' | 'list'>(
    'calendar'
  );

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterPilar, setFilterPilar] = React.useState<string>('SEMUA');
  const [filterKategori, setFilterKategori] = React.useState<string>('ALL');
  const [filterStatus, setFilterStatus] = React.useState<string>('ALL');

  // Calendar State (Default to current date or year of data)
  const [currentDate, setCurrentDate] = React.useState<Date>(() => {
    // Jika ada agenda di tahun 2026, kita bisa mulai di bulan agenda terdekat atau bulan ini
    return new Date();
  });
  const [selectedDate, setSelectedDate] = React.useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });

  // Dialog States
  const [isFormDialogOpen, setIsFormDialogOpen] = React.useState(false);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = React.useState(false);
  const [selectedAgenda, setSelectedAgenda] =
    React.useState<AgendaAksiZI | null>(null);
  const [, setIsDeleting] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [sendingWaId, setSendingWaId] = React.useState<string | null>(null);

  // Form State
  const [formData, setFormData] = React.useState<Partial<AgendaAksiZI>>({
    judul: '',
    deskripsi: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    waktu: '09:00 - 11:30 WITA',
    lokasi: 'Aula Sasahara BPS Sitaro',
    kategori: 'RAPAT_KOORDINASI',
    pilar_id: 'SEMUA',
    peserta_target: 'Seluruh Tim Kerja RB & Koordinator Pilar',
    status: 'TERJADWAL',
    link_meeting_or_drive: ''
  });

  // Update stats saat agendaList berubah
  const refreshStats = (list: AgendaAksiZI[]) => {
    setStats({
      total: list.length,
      terjadwal: list.filter((a) => a.status === 'TERJADWAL').length,
      berlangsung: list.filter((a) => a.status === 'BERLANGSUNG').length,
      selesai: list.filter((a) => a.status === 'SELESAI').length,
      rapat: list.filter((a) => a.kategori === 'RAPAT_KOORDINASI').length,
      sosialisasi: list.filter((a) => a.kategori === 'SOSIALISASI').length,
      deadline: list.filter((a) => a.kategori === 'DEADLINE_BUKTI').length,
      monev: list.filter((a) => a.kategori === 'MONEV_BERKALA').length,
      evaluasi: list.filter((a) => a.kategori === 'EVALUASI_TPI').length
    });
  };

  // Filtered List
  const filteredAgendaList = React.useMemo(() => {
    return agendaList.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = item.judul.toLowerCase().includes(q);
        const matchDesc = item.deskripsi.toLowerCase().includes(q);
        const matchLokasi = item.lokasi.toLowerCase().includes(q);
        const matchPeserta = item.peserta_target.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchLokasi && !matchPeserta)
          return false;
      }

      // Pilar
      if (filterPilar !== 'SEMUA' && filterPilar !== 'ALL') {
        if (item.pilar_id !== filterPilar && item.pilar_id !== 'SEMUA')
          return false;
      }

      // Kategori
      if (filterKategori !== 'ALL') {
        if (item.kategori !== filterKategori) return false;
      }

      // Status
      if (filterStatus !== 'ALL') {
        if (item.status !== filterStatus) return false;
      }

      return true;
    });
  }, [agendaList, searchQuery, filterPilar, filterKategori, filterStatus]);

  // Calendar Helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0 - 11

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember'
  ];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  // Convert so Monday is 0: (day + 6) % 7
  const startDayOffset = (firstDayIndex + 6) % 7;

  const prevMonthDays = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today.toISOString().split('T')[0]);
  };

  // Agenda per tanggal untuk tampilan kalender bulan
  const getAgendasForDate = React.useCallback(
    (dateStr: string) => {
      return filteredAgendaList.filter((item) => {
        if (
          item.tanggal_selesai &&
          item.tanggal_selesai !== item.tanggal_mulai
        ) {
          return (
            dateStr >= item.tanggal_mulai && dateStr <= item.tanggal_selesai
          );
        }
        return item.tanggal_mulai === dateStr;
      });
    },
    [filteredAgendaList]
  );

  // Agenda pada tanggal yang sedang dipilih
  const agendasOnSelectedDate = React.useMemo(() => {
    if (!selectedDate) return [];
    return getAgendasForDate(selectedDate);
  }, [selectedDate, getAgendasForDate]);

  // Handlers
  const handleOpenAdd = (defaultDate?: string) => {
    setSelectedAgenda(null);
    setFormData({
      judul: '',
      deskripsi: '',
      tanggal_mulai:
        defaultDate || selectedDate || new Date().toISOString().split('T')[0],
      tanggal_selesai: '',
      waktu: '09:00 - 11:30 WITA',
      lokasi: 'Aula Sasahara BPS Sitaro',
      kategori: 'RAPAT_KOORDINASI',
      pilar_id: filterPilar !== 'ALL' ? filterPilar : 'SEMUA',
      peserta_target: 'Seluruh Tim Kerja RB & Koordinator Pilar',
      status: 'TERJADWAL',
      link_meeting_or_drive: ''
    });
    setIsFormDialogOpen(true);
  };

  const handleOpenEdit = (agenda: AgendaAksiZI) => {
    setSelectedAgenda(agenda);
    setFormData({ ...agenda });
    setIsFormDialogOpen(true);
  };

  const handleOpenDetail = (agenda: AgendaAksiZI) => {
    setSelectedAgenda(agenda);
    setIsDetailDialogOpen(true);
  };

  const handleSaveAgenda = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.judul?.trim()) {
      toast.error('Judul agenda wajib diisi.');
      return;
    }
    if (!formData.tanggal_mulai) {
      toast.error('Tanggal mulai agenda wajib diisi.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<AgendaAksiZI> = {
        ...formData,
        id: selectedAgenda?.id
      };

      const res = await createOrUpdateAgendaAction(payload);
      if (res.success && res.data) {
        toast.success(res.message || 'Agenda berhasil disimpan.');

        if (selectedAgenda) {
          // Edit
          const updated = agendaList.map((a) =>
            a.id === res.data!.id ? res.data! : a
          );
          setAgendaList(updated);
          refreshStats(updated);
        } else {
          // Add
          const updated = [res.data, ...agendaList];
          setAgendaList(updated);
          refreshStats(updated);
        }

        setIsFormDialogOpen(false);
      } else {
        toast.error(res.error || 'Gagal menyimpan agenda.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAgenda = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus agenda ini?')) return;

    setIsDeleting(true);
    try {
      const res = await deleteAgendaAction(id);
      if (res.success) {
        toast.success('Agenda berhasil dihapus.');
        const updated = agendaList.filter((a) => a.id !== id);
        setAgendaList(updated);
        refreshStats(updated);
        if (selectedAgenda?.id === id) {
          setIsDetailDialogOpen(false);
        }
      } else {
        toast.error(res.error || 'Gagal menghapus agenda.');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Gagal menghapus agenda.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSendWAReminder = async (agenda: AgendaAksiZI) => {
    setSendingWaId(agenda.id);
    const toastId = toast.loading(
      `Mengirim pengingat WhatsApp untuk "${agenda.judul}"...`
    );

    try {
      const res = await sendAgendaWAReminderAction(agenda.id);
      if (res.success) {
        toast.success(res.message, { id: toastId, duration: 5000 });

        // Update local state
        const updated = agendaList.map((a) => {
          if (a.id === agenda.id) {
            return {
              ...a,
              reminder_wa_sent: true,
              reminder_wa_sent_at:
                res.reminderSentAt || new Date().toISOString()
            };
          }
          return a;
        });
        setAgendaList(updated);

        if (selectedAgenda?.id === agenda.id) {
          setSelectedAgenda((prev) =>
            prev
              ? {
                  ...prev,
                  reminder_wa_sent: true,
                  reminder_wa_sent_at:
                    res.reminderSentAt || new Date().toISOString()
                }
              : null
          );
        }

        // Buka link wa.me jika ada dan user ingin langsung buka
        if (res.deepLink) {
          window.open(res.deepLink, '_blank');
        }
      } else {
        toast.error(res.message || 'Gagal mengirim pengingat WhatsApp.', {
          id: toastId
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan pengiriman WA.', {
        id: toastId
      });
    } finally {
      setSendingWaId(null);
    }
  };

  // Format Display Tanggal
  const formatTanggalRange = (start: string, end?: string) => {
    try {
      const dStart = new Date(start + 'T00:00:00');
      const startFormatted = dStart.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
      if (end && end !== start) {
        const dEnd = new Date(end + 'T00:00:00');
        const endFormatted = dEnd.toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        });
        return `${startFormatted} - ${endFormatted}`;
      }
      return startFormatted;
    } catch {
      return start;
    }
  };

  return (
    <div className='flex-1 space-y-6 p-4 pt-6 md:p-8'>
      {/* Header Halaman */}
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-center'>
        <div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className='bg-primary/10 text-primary border-primary/20 px-2.5 py-0.5 text-xs font-semibold'
            >
              <IconCalendar className='mr-1.5 h-3.5 w-3.5' /> Seksi 12 -
              Collaboration Hub
            </Badge>
            <Badge
              variant='outline'
              className='border-emerald-300 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400'
            >
              <IconBrandWhatsapp className='mr-1 h-3.5 w-3.5' /> Auto WA
              Reminders
            </Badge>
          </div>
          <h1 className='text-foreground mt-1 text-2xl font-extrabold tracking-tight md:text-3xl'>
            Kalender Jadwal Aksi & Rencana Kerja Tim ZI/RB
          </h1>
          <p className='text-muted-foreground mt-0.5 text-sm'>
            Jadwal terpadu rapat koordinasi 6 pilar, sosialisasi berkala, batas
            waktu pengumpulan berkas LKE, dan evaluasi TPI BPS Sitaro.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2.5'>
          <Link href='/rebo/notulen'>
            <Button
              variant='outline'
              className='border-cyan-200 bg-cyan-50/70 text-cyan-700 hover:bg-cyan-100 dark:border-cyan-800 dark:bg-cyan-950/50 dark:text-cyan-300'
            >
              <IconFileDescription className='mr-1.5 h-4 w-4' /> Catat Notulen
              Rapat
            </Button>
          </Link>
          <Button
            onClick={() => handleOpenAdd()}
            className='bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm'
          >
            <IconPlus className='mr-1.5 h-4 w-4' /> Tambah Agenda Baru
          </Button>
        </div>
      </div>

      {/* 4 Kartu Metrik Ringkas */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <Card className='border-l-4 border-l-blue-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Total Agenda ZI
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span>{stats.total}</span>
              <IconCalendarEvent className='h-5 w-5 text-blue-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            Tahun Berjalan 2026
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-sky-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Terjadwal & Berjalan
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span>{stats.terjadwal + stats.berlangsung}</span>
              <IconClock className='h-5 w-5 text-sky-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            {stats.terjadwal} terjadwal, {stats.berlangsung} aktif
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-rose-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Batas Waktu (Deadline)
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span className='text-rose-600 dark:text-rose-400'>
                {stats.deadline}
              </span>
              <IconAlertTriangle className='h-5 w-5 text-rose-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            Cutoff submit berkas LKE
          </CardContent>
        </Card>

        <Card className='border-l-4 border-l-purple-500 shadow-sm'>
          <CardHeader className='p-4 pb-2'>
            <CardDescription className='text-xs font-medium'>
              Evaluasi TPI & Monev
            </CardDescription>
            <CardTitle className='flex items-center justify-between text-2xl font-bold'>
              <span>{stats.monev + stats.evaluasi}</span>
              <IconSparkles className='h-5 w-5 text-purple-500 opacity-80' />
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground p-4 pt-0 text-xs'>
            {stats.monev} monev, {stats.evaluasi} TPI pusat
          </CardContent>
        </Card>
      </div>

      {/* Control Bar: View Switcher, Search, and Filters */}
      <Card className='border p-4 shadow-sm'>
        <div className='flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center'>
          {/* View Mode Switcher */}
          <div className='bg-muted flex w-fit items-center gap-1 rounded-lg p-1'>
            <Button
              size='sm'
              variant={viewMode === 'calendar' ? 'default' : 'ghost'}
              className='h-8 px-3 text-xs font-medium'
              onClick={() => setViewMode('calendar')}
            >
              <IconLayoutGrid className='mr-1.5 h-3.5 w-3.5' /> Kalender Bulan
            </Button>
            <Button
              size='sm'
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              className='h-8 px-3 text-xs font-medium'
              onClick={() => setViewMode('list')}
            >
              <IconList className='mr-1.5 h-3.5 w-3.5' /> Daftar Agenda (
              {filteredAgendaList.length})
            </Button>
          </div>

          {/* Filters */}
          <div className='flex flex-1 flex-wrap items-center gap-2.5 lg:justify-end'>
            {/* Search Input */}
            <div className='relative min-w-[200px] flex-1 md:flex-initial'>
              <IconSearch className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
              <Input
                placeholder='Cari agenda, lokasi, topik...'
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className='h-9 pl-8 text-xs'
              />
            </div>

            {/* Filter Pilar */}
            <Select value={filterPilar} onValueChange={setFilterPilar}>
              <SelectTrigger className='h-9 w-[170px] text-xs'>
                <SelectValue placeholder='Pilih Pilar' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='SEMUA'>Semua Pilar</SelectItem>
                <SelectItem value='1'>Pilar 1 - Manajemen Perubahan</SelectItem>
                <SelectItem value='2'>Pilar 2 - Tatalaksana</SelectItem>
                <SelectItem value='3'>Pilar 3 - Manajemen SDM</SelectItem>
                <SelectItem value='4'>Pilar 4 - Akuntabilitas</SelectItem>
                <SelectItem value='5'>Pilar 5 - Pengawasan</SelectItem>
                <SelectItem value='6'>Pilar 6 - Pelayanan Publik</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Kategori */}
            <Select value={filterKategori} onValueChange={setFilterKategori}>
              <SelectTrigger className='h-9 w-[160px] text-xs'>
                <SelectValue placeholder='Semua Kategori' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Semua Kategori</SelectItem>
                <SelectItem value='RAPAT_KOORDINASI'>
                  Rapat Koordinasi
                </SelectItem>
                <SelectItem value='SOSIALISASI'>
                  Sosialisasi Internal
                </SelectItem>
                <SelectItem value='DEADLINE_BUKTI'>
                  Batas Waktu Bukti
                </SelectItem>
                <SelectItem value='MONEV_BERKALA'>Monev Berkala ZI</SelectItem>
                <SelectItem value='EVALUASI_TPI'>Evaluasi TPI / TPN</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Status */}
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className='h-9 w-[140px] text-xs'>
                <SelectValue placeholder='Semua Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Semua Status</SelectItem>
                <SelectItem value='TERJADWAL'>Terjadwal</SelectItem>
                <SelectItem value='BERLANGSUNG'>Berlangsung</SelectItem>
                <SelectItem value='SELESAI'>Selesai</SelectItem>
                <SelectItem value='DITUNDA'>Ditunda</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Main Content Area: Tab / View Modes */}
      {viewMode === 'calendar' ? (
        /* CALENDAR MONTH GRID VIEW */
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
          {/* Kalender Grid (8 Kolom di Layar Besar) */}
          <Card className='border shadow-sm lg:col-span-8'>
            <CardHeader className='border-b p-4 pb-3 md:p-5'>
              <div className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <h2 className='text-lg font-bold tracking-tight md:text-xl'>
                    {monthNames[month]} {year}
                  </h2>
                  <Badge variant='secondary' className='text-xs'>
                    {getAgendasForDate(selectedDate).length} agenda hari ini
                  </Badge>
                </div>

                <div className='flex items-center gap-1.5'>
                  <Button
                    size='sm'
                    variant='outline'
                    className='h-8 px-2 text-xs'
                    onClick={goToToday}
                  >
                    Hari Ini
                  </Button>
                  <Button
                    size='icon'
                    variant='outline'
                    className='h-8 w-8'
                    onClick={prevMonth}
                    title='Bulan Sebelumnya'
                  >
                    <IconChevronLeft className='h-4 w-4' />
                  </Button>
                  <Button
                    size='icon'
                    variant='outline'
                    className='h-8 w-8'
                    onClick={nextMonth}
                    title='Bulan Berikutnya'
                  >
                    <IconChevronRight className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className='p-2 md:p-4'>
              {/* Header Nama Hari */}
              <div className='text-muted-foreground mb-2 grid grid-cols-7 text-center text-xs font-semibold'>
                <div className='py-1 text-slate-700 dark:text-slate-300'>
                  Sen
                </div>
                <div className='py-1 text-slate-700 dark:text-slate-300'>
                  Sel
                </div>
                <div className='py-1 text-slate-700 dark:text-slate-300'>
                  Rab
                </div>
                <div className='py-1 text-slate-700 dark:text-slate-300'>
                  Kam
                </div>
                <div className='py-1 text-slate-700 dark:text-slate-300'>
                  Jum
                </div>
                <div className='py-1 text-rose-500'>Sab</div>
                <div className='py-1 text-rose-600'>Min</div>
              </div>

              {/* Grid Sel Tanggal */}
              <div className='grid grid-cols-7 gap-1 md:gap-1.5'>
                {/* Hari dari bulan sebelumnya */}
                {Array.from({ length: startDayOffset }).map((_, i) => {
                  const dayNum = prevMonthDays - startDayOffset + i + 1;
                  return (
                    <div
                      key={`prev-${i}`}
                      className='border-border/40 bg-muted/20 text-muted-foreground min-h-[75px] rounded-lg border border-dashed p-1.5 text-xs opacity-40 md:min-h-[100px]'
                    >
                      <span>{dayNum}</span>
                    </div>
                  );
                })}

                {/* Hari dalam bulan aktif */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1;
                  const monthPad = String(month + 1).padStart(2, '0');
                  const dayPad = String(dayNum).padStart(2, '0');
                  const dateStr = `${year}-${monthPad}-${dayPad}`;

                  const isToday =
                    new Date().toISOString().split('T')[0] === dateStr;
                  const isSelected = selectedDate === dateStr;
                  const agendasForThisDay = getAgendasForDate(dateStr);

                  return (
                    <div
                      key={dateStr}
                      onClick={() => setSelectedDate(dateStr)}
                      className={`flex min-h-[75px] cursor-pointer flex-col justify-between rounded-lg border p-1.5 transition-all md:min-h-[105px] ${
                        isSelected
                          ? 'border-primary ring-primary/30 bg-primary/5 shadow-sm ring-2'
                          : isToday
                            ? 'border-sky-400 bg-sky-50/50 dark:bg-sky-950/20'
                            : 'border-border/60 hover:border-primary/50 hover:bg-muted/40'
                      }`}
                    >
                      <div className='mb-1 flex items-center justify-between'>
                        <span
                          className={`rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                            isToday
                              ? 'bg-sky-600 font-bold text-white'
                              : isSelected
                                ? 'bg-primary text-primary-foreground'
                                : 'text-foreground'
                          }`}
                        >
                          {dayNum}
                        </span>

                        {agendasForThisDay.length > 0 && (
                          <span className='text-muted-foreground text-[10px] font-medium md:hidden'>
                            {agendasForThisDay.length}
                          </span>
                        )}
                      </div>

                      {/* Event Chips pada tanggal */}
                      <div className='flex-1 space-y-1 overflow-hidden'>
                        {agendasForThisDay.slice(0, 2).map((agenda) => {
                          const katConfig =
                            AGENDA_KATEGORI_MAP[agenda.kategori];
                          return (
                            <div
                              key={agenda.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDetail(agenda);
                              }}
                              className={`truncate rounded border px-1.5 py-0.5 text-[10px] font-medium md:text-[11px] ${katConfig.badgeClass} flex items-center gap-1 transition-opacity hover:opacity-80`}
                              title={agenda.judul}
                            >
                              <span
                                className={`h-1.5 w-1.5 shrink-0 rounded-full ${katConfig.dotColor}`}
                              />
                              <span className='truncate'>{agenda.judul}</span>
                            </div>
                          );
                        })}

                        {agendasForThisDay.length > 2 && (
                          <div className='text-muted-foreground px-1 text-[10px] font-medium'>
                            +{agendasForThisDay.length - 2} agenda lagi
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Keterangan Kategori (Legend) */}
              <div className='text-muted-foreground mt-4 flex flex-wrap items-center gap-3 border-t pt-3 text-xs'>
                <span className='text-foreground text-xs font-semibold'>
                  Kategori:
                </span>
                {Object.values(AGENDA_KATEGORI_MAP).map((kat) => (
                  <div key={kat.key} className='flex items-center gap-1.5'>
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${kat.dotColor}`}
                    />
                    <span>{kat.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Panel Samping: Agenda Pada Tanggal Terpilih (4 Kolom) */}
          <div className='space-y-4 lg:col-span-4'>
            <Card className='border shadow-sm'>
              <CardHeader className='flex flex-row items-center justify-between border-b p-4 pb-3'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-base font-bold'>
                    <IconCalendarEvent className='text-primary h-4 w-4' />
                    Agenda{' '}
                    {selectedDate
                      ? formatTanggalRange(selectedDate)
                      : 'Hari Ini'}
                  </CardTitle>
                  <CardDescription className='text-xs'>
                    {agendasOnSelectedDate.length} kegiatan pada tanggal ini
                  </CardDescription>
                </div>
                <Button
                  size='sm'
                  variant='outline'
                  className='h-7 text-xs'
                  onClick={() => handleOpenAdd(selectedDate)}
                >
                  <IconPlus className='mr-1 h-3 w-3' /> Tambah
                </Button>
              </CardHeader>

              <CardContent className='max-h-[620px] space-y-3 overflow-y-auto p-3'>
                {agendasOnSelectedDate.length === 0 ? (
                  <div className='px-4 py-8 text-center'>
                    <IconCalendar className='text-muted-foreground/40 mx-auto mb-2 h-10 w-10' />
                    <p className='text-muted-foreground text-xs font-medium'>
                      Tidak ada agenda terjadwal pada tanggal ini.
                    </p>
                    <Button
                      size='sm'
                      variant='ghost'
                      className='text-primary mt-2 text-xs'
                      onClick={() => handleOpenAdd(selectedDate)}
                    >
                      <IconPlus className='mr-1 h-3.5 w-3.5' /> Jadwalkan agenda
                      baru
                    </Button>
                  </div>
                ) : (
                  agendasOnSelectedDate.map((agenda) => {
                    const katConfig = AGENDA_KATEGORI_MAP[agenda.kategori];
                    const statusInfo = AGENDA_STATUS_MAP[agenda.status];
                    return (
                      <Card
                        key={agenda.id}
                        className='border p-3.5 shadow-none transition-shadow hover:shadow-sm'
                      >
                        <div className='mb-2 flex items-start justify-between gap-2'>
                          <Badge
                            variant='outline'
                            className={`border text-[10px] font-semibold ${katConfig.badgeClass}`}
                          >
                            {katConfig.label}
                          </Badge>
                          <Badge
                            variant='outline'
                            className={`text-[10px] ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <h4
                          onClick={() => handleOpenDetail(agenda)}
                          className='text-foreground hover:text-primary line-clamp-2 cursor-pointer text-sm leading-snug font-bold transition-colors'
                        >
                          {agenda.judul}
                        </h4>

                        <div className='text-muted-foreground mt-2 space-y-1 text-xs'>
                          <div className='flex items-center gap-1.5'>
                            <IconClock className='text-muted-foreground/70 h-3.5 w-3.5 shrink-0' />
                            <span>{agenda.waktu}</span>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <IconMapPin className='text-muted-foreground/70 h-3.5 w-3.5 shrink-0' />
                            <span className='truncate'>{agenda.lokasi}</span>
                          </div>
                          <div className='flex items-center gap-1.5'>
                            <IconUsers className='text-muted-foreground/70 h-3.5 w-3.5 shrink-0' />
                            <span className='truncate'>
                              {agenda.peserta_target}
                            </span>
                          </div>
                        </div>

                        {agenda.reminder_wa_sent && (
                          <div className='mt-2.5 flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 p-1.5 text-[11px] font-medium text-emerald-600 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400'>
                            <IconCheck className='h-3.5 w-3.5 shrink-0' />
                            <span>Pengingat WhatsApp telah terkirim</span>
                          </div>
                        )}

                        <div className='mt-3 flex items-center justify-between gap-2 border-t pt-2.5'>
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-7 border-emerald-300 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                            disabled={sendingWaId === agenda.id}
                            onClick={() => handleSendWAReminder(agenda)}
                          >
                            <IconBrandWhatsapp className='mr-1 h-3.5 w-3.5' />
                            {agenda.reminder_wa_sent
                              ? 'Kirim Ulang WA'
                              : 'Kirim WA'}
                          </Button>

                          <div className='flex items-center gap-1'>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-7 w-7'
                              onClick={() => handleOpenDetail(agenda)}
                              title='Detail Lengkap'
                            >
                              <IconInfoCircle className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='h-7 w-7'
                              onClick={() => handleOpenEdit(agenda)}
                              title='Edit Agenda'
                            >
                              <IconEdit className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              size='icon'
                              variant='ghost'
                              className='text-destructive hover:bg-destructive/10 h-7 w-7'
                              onClick={() => handleDeleteAgenda(agenda.id)}
                              title='Hapus Agenda'
                            >
                              <IconTrash className='h-3.5 w-3.5' />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        /* LIST / TIMELINE VIEW */
        <div className='space-y-4'>
          {filteredAgendaList.length === 0 ? (
            <Card className='p-8 text-center shadow-sm'>
              <IconCalendar className='text-muted-foreground/30 mx-auto mb-3 h-12 w-12' />
              <h3 className='text-base font-semibold'>
                Tidak ada agenda ditemukan
              </h3>
              <p className='text-muted-foreground mt-1 text-xs'>
                Tidak ada agenda aksi yang sesuai dengan kriteria pencarian dan
                filter saat ini.
              </p>
              <Button
                size='sm'
                className='mt-4'
                onClick={() => {
                  setSearchQuery('');
                  setFilterPilar('SEMUA');
                  setFilterKategori('ALL');
                  setFilterStatus('ALL');
                }}
              >
                Reset Semua Filter
              </Button>
            </Card>
          ) : (
            <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
              {filteredAgendaList.map((agenda) => {
                const katConfig = AGENDA_KATEGORI_MAP[agenda.kategori];
                const statusInfo = AGENDA_STATUS_MAP[agenda.status];
                const pilarOption = AGENDA_PILAR_OPTIONS.find(
                  (p) => p.value === agenda.pilar_id
                );

                return (
                  <Card
                    key={agenda.id}
                    className='flex flex-col justify-between overflow-hidden border shadow-sm transition-shadow hover:shadow-md'
                  >
                    <div>
                      {/* Card Header Strip */}
                      <div className={`border-b p-3.5 ${katConfig.bgLight}`}>
                        <div className='mb-2 flex items-center justify-between gap-2'>
                          <Badge
                            variant='outline'
                            className={`border text-[10px] font-semibold ${katConfig.badgeClass}`}
                          >
                            {katConfig.label}
                          </Badge>
                          <Badge
                            variant='outline'
                            className={`text-[10px] ${statusInfo.badgeClass}`}
                          >
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <h3
                          onClick={() => handleOpenDetail(agenda)}
                          className='text-foreground hover:text-primary line-clamp-2 cursor-pointer text-base leading-snug font-bold transition-colors'
                        >
                          {agenda.judul}
                        </h3>
                      </div>

                      {/* Card Body */}
                      <div className='text-muted-foreground space-y-2.5 p-4 text-xs'>
                        <div className='text-foreground flex items-center gap-2 font-medium'>
                          <IconCalendar className='text-primary h-4 w-4 shrink-0' />
                          <span>
                            {formatTanggalRange(
                              agenda.tanggal_mulai,
                              agenda.tanggal_selesai
                            )}
                          </span>
                        </div>

                        <div className='flex items-center gap-2'>
                          <IconClock className='text-muted-foreground/80 h-4 w-4 shrink-0' />
                          <span>{agenda.waktu}</span>
                        </div>

                        <div className='flex items-center gap-2'>
                          <IconMapPin className='text-muted-foreground/80 h-4 w-4 shrink-0' />
                          <span className='truncate'>{agenda.lokasi}</span>
                        </div>

                        <div className='flex items-center gap-2'>
                          <IconUsers className='text-muted-foreground/80 h-4 w-4 shrink-0' />
                          <span className='truncate'>
                            {agenda.peserta_target}
                          </span>
                        </div>

                        <div className='pt-1'>
                          <span className='inline-block rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300'>
                            {pilarOption?.label || 'Seluruh Pilar ZI'}
                          </span>
                        </div>

                        <p className='text-muted-foreground line-clamp-2 border-t border-dashed pt-1 text-xs'>
                          {agenda.deskripsi}
                        </p>

                        {/* Status WA */}
                        {agenda.reminder_wa_sent ? (
                          <div className='flex items-center gap-1.5 rounded border border-emerald-200 bg-emerald-50 p-2 text-[11px] font-medium text-emerald-600 dark:border-emerald-800/40 dark:bg-emerald-950/30 dark:text-emerald-400'>
                            <IconCheck className='h-3.5 w-3.5 shrink-0' />
                            <span>Pengingat WhatsApp terkirim</span>
                          </div>
                        ) : (
                          <div className='text-muted-foreground bg-muted/40 border-border/40 flex items-center gap-1.5 rounded border p-2 text-[11px]'>
                            <IconInfoCircle className='h-3.5 w-3.5 shrink-0' />
                            <span>Pengingat WhatsApp belum dikirim</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className='bg-muted/10 flex items-center justify-between gap-2 border-t p-3.5 pt-2'>
                      <Button
                        size='sm'
                        variant='outline'
                        className='h-8 border-emerald-300 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                        disabled={sendingWaId === agenda.id}
                        onClick={() => handleSendWAReminder(agenda)}
                      >
                        <IconBrandWhatsapp className='mr-1 h-3.5 w-3.5' />
                        {agenda.reminder_wa_sent
                          ? 'Kirim Ulang WA'
                          : 'Kirim WA (1-Klik)'}
                      </Button>

                      <div className='flex items-center gap-1'>
                        {agenda.link_meeting_or_drive && (
                          <Button
                            size='icon'
                            variant='ghost'
                            className='text-primary h-8 w-8'
                            onClick={() =>
                              window.open(
                                agenda.link_meeting_or_drive,
                                '_blank'
                              )
                            }
                            title='Buka Tautan Rapat/Drive'
                          >
                            <IconExternalLink className='h-4 w-4' />
                          </Button>
                        )}
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-8 w-8'
                          onClick={() => handleOpenDetail(agenda)}
                          title='Detail Lengkap'
                        >
                          <IconInfoCircle className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='h-8 w-8'
                          onClick={() => handleOpenEdit(agenda)}
                          title='Edit Agenda'
                        >
                          <IconEdit className='h-4 w-4' />
                        </Button>
                        <Button
                          size='icon'
                          variant='ghost'
                          className='text-destructive hover:bg-destructive/10 h-8 w-8'
                          onClick={() => handleDeleteAgenda(agenda.id)}
                          title='Hapus Agenda'
                        >
                          <IconTrash className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* DIALOG FORM TAMBAH / EDIT AGENDA */}
      <Dialog open={isFormDialogOpen} onOpenChange={setIsFormDialogOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <form onSubmit={handleSaveAgenda}>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
                <IconCalendarEvent className='text-primary h-5 w-5' />
                {selectedAgenda
                  ? 'Edit Agenda ZI/RB'
                  : 'Tambah Agenda Aksi Baru'}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Isi rincian jadwal kegiatan, koordinasi pilar, batas waktu
                bukti, atau evaluasi internal.
              </DialogDescription>
            </DialogHeader>

            <div className='grid grid-cols-1 gap-4 py-4 md:grid-cols-2'>
              {/* Judul Agenda */}
              <div className='space-y-1.5 md:col-span-2'>
                <Label htmlFor='judul' className='text-xs font-semibold'>
                  Judul Agenda <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='judul'
                  placeholder='Contoh: Rapat Koordinasi Monev Triwulan I ZI/RB'
                  value={formData.judul || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, judul: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Kategori */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>
                  Kategori Agenda <span className='text-destructive'>*</span>
                </Label>
                <Select
                  value={formData.kategori || 'RAPAT_KOORDINASI'}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      kategori: val as AgendaKategori
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='RAPAT_KOORDINASI'>
                      Rapat Koordinasi
                    </SelectItem>
                    <SelectItem value='SOSIALISASI'>
                      Sosialisasi Internal
                    </SelectItem>
                    <SelectItem value='DEADLINE_BUKTI'>
                      Batas Waktu Bukti (Deadline)
                    </SelectItem>
                    <SelectItem value='MONEV_BERKALA'>
                      Monev Berkala ZI
                    </SelectItem>
                    <SelectItem value='EVALUASI_TPI'>
                      Evaluasi TPI / TPN
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Pilar Terkait */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Pilar Terkait</Label>
                <Select
                  value={formData.pilar_id || 'SEMUA'}
                  onValueChange={(val) =>
                    setFormData((prev) => ({ ...prev, pilar_id: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AGENDA_PILAR_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tanggal Mulai */}
              <div className='space-y-1.5'>
                <Label
                  htmlFor='tanggal_mulai'
                  className='text-xs font-semibold'
                >
                  Tanggal Mulai <span className='text-destructive'>*</span>
                </Label>
                <Input
                  id='tanggal_mulai'
                  type='date'
                  value={formData.tanggal_mulai || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tanggal_mulai: e.target.value
                    }))
                  }
                  required
                />
              </div>

              {/* Tanggal Selesai (Opsional) */}
              <div className='space-y-1.5'>
                <Label
                  htmlFor='tanggal_selesai'
                  className='text-xs font-semibold'
                >
                  Tanggal Selesai (Opsional)
                </Label>
                <Input
                  id='tanggal_selesai'
                  type='date'
                  value={formData.tanggal_selesai || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      tanggal_selesai: e.target.value
                    }))
                  }
                />
              </div>

              {/* Waktu */}
              <div className='space-y-1.5'>
                <Label htmlFor='waktu' className='text-xs font-semibold'>
                  Waktu / Pukul
                </Label>
                <Input
                  id='waktu'
                  placeholder='Contoh: 09:00 - 11:30 WITA'
                  value={formData.waktu || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, waktu: e.target.value }))
                  }
                />
              </div>

              {/* Lokasi */}
              <div className='space-y-1.5'>
                <Label htmlFor='lokasi' className='text-xs font-semibold'>
                  Lokasi / Ruang
                </Label>
                <Input
                  id='lokasi'
                  placeholder='Contoh: Aula Sasahara BPS Sitaro / Hybrid Zoom'
                  value={formData.lokasi || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, lokasi: e.target.value }))
                  }
                />
              </div>

              {/* Peserta Target */}
              <div className='space-y-1.5 md:col-span-2'>
                <Label
                  htmlFor='peserta_target'
                  className='text-xs font-semibold'
                >
                  Sasaran Peserta
                </Label>
                <Input
                  id='peserta_target'
                  placeholder='Contoh: Seluruh Tim Kerja RB & Koordinator Pilar 1-6'
                  value={formData.peserta_target || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      peserta_target: e.target.value
                    }))
                  }
                />
              </div>

              {/* Status */}
              <div className='space-y-1.5'>
                <Label className='text-xs font-semibold'>Status Agenda</Label>
                <Select
                  value={formData.status || 'TERJADWAL'}
                  onValueChange={(val) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: val as AgendaStatus
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TERJADWAL'>Terjadwal</SelectItem>
                    <SelectItem value='BERLANGSUNG'>
                      Sedang Berlangsung
                    </SelectItem>
                    <SelectItem value='SELESAI'>Selesai</SelectItem>
                    <SelectItem value='DITUNDA'>Ditunda</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Link Meeting / GDrive */}
              <div className='space-y-1.5'>
                <Label htmlFor='link_meeting' className='text-xs font-semibold'>
                  Tautan Rapat / Google Drive
                </Label>
                <Input
                  id='link_meeting'
                  placeholder='https://meet.google.com/... atau Drive'
                  value={formData.link_meeting_or_drive || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      link_meeting_or_drive: e.target.value
                    }))
                  }
                />
              </div>

              {/* Deskripsi */}
              <div className='space-y-1.5 md:col-span-2'>
                <Label htmlFor='deskripsi' className='text-xs font-semibold'>
                  Deskripsi & Instruksi Kerja
                </Label>
                <Textarea
                  id='deskripsi'
                  rows={3}
                  placeholder='Uraikan agenda kegiatan, hal yang perlu dipersiapkan oleh PIC pilar, atau berkas yang harus dibawa...'
                  value={formData.deskripsi || ''}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      deskripsi: e.target.value
                    }))
                  }
                />
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
              <Button type='submit' disabled={isSubmitting}>
                {isSubmitting ? 'Menyimpan...' : 'Simpan Agenda'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG DETAIL AGENDA & WA DISPATCHER */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        {selectedAgenda && (
          <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
            <DialogHeader>
              <div className='mb-1 flex items-center gap-2'>
                <Badge
                  variant='outline'
                  className={`text-xs ${
                    AGENDA_KATEGORI_MAP[selectedAgenda.kategori].badgeClass
                  }`}
                >
                  {AGENDA_KATEGORI_MAP[selectedAgenda.kategori].label}
                </Badge>
                <Badge
                  variant='outline'
                  className={`text-xs ${
                    AGENDA_STATUS_MAP[selectedAgenda.status].badgeClass
                  }`}
                >
                  {AGENDA_STATUS_MAP[selectedAgenda.status].label}
                </Badge>
              </div>
              <DialogTitle className='text-foreground text-xl font-bold'>
                {selectedAgenda.judul}
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Rincian jadwal pelaksanaan dan integrasi notifikasi WhatsApp
                REBO V2.
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-2 text-sm'>
              {/* Info Grid */}
              <div className='bg-muted/30 grid grid-cols-1 gap-3 rounded-lg border p-3.5 md:grid-cols-2'>
                <div>
                  <span className='text-muted-foreground block text-xs font-medium'>
                    Waktu & Tanggal:
                  </span>
                  <p className='mt-0.5 font-semibold'>
                    {formatTanggalRange(
                      selectedAgenda.tanggal_mulai,
                      selectedAgenda.tanggal_selesai
                    )}
                  </p>
                  <p className='text-muted-foreground text-xs'>
                    {selectedAgenda.waktu}
                  </p>
                </div>

                <div>
                  <span className='text-muted-foreground block text-xs font-medium'>
                    Lokasi / Media:
                  </span>
                  <p className='mt-0.5 font-semibold'>
                    {selectedAgenda.lokasi}
                  </p>
                </div>

                <div>
                  <span className='text-muted-foreground block text-xs font-medium'>
                    Pilar Penugasan:
                  </span>
                  <p className='mt-0.5 font-medium'>
                    {AGENDA_PILAR_OPTIONS.find(
                      (p) => p.value === selectedAgenda.pilar_id
                    )?.label || 'Seluruh Pilar ZI'}
                  </p>
                </div>

                <div>
                  <span className='text-muted-foreground block text-xs font-medium'>
                    Peserta Sasaran:
                  </span>
                  <p className='mt-0.5 font-medium'>
                    {selectedAgenda.peserta_target}
                  </p>
                </div>
              </div>

              {/* Deskripsi */}
              <div>
                <h4 className='text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase'>
                  Deskripsi & Instruksi
                </h4>
                <p className='text-foreground bg-muted/15 rounded-lg border p-3 whitespace-pre-line'>
                  {selectedAgenda.deskripsi || 'Tidak ada catatan tambahan.'}
                </p>
              </div>

              {/* Tautan */}
              {selectedAgenda.link_meeting_or_drive && (
                <div>
                  <h4 className='text-muted-foreground mb-1 text-xs font-semibold tracking-wider uppercase'>
                    Tautan Ruang Virtual / Berkas
                  </h4>
                  <a
                    href={selectedAgenda.link_meeting_or_drive}
                    target='_blank'
                    rel='noreferrer'
                    className='text-primary flex items-center gap-1.5 text-xs font-medium break-all hover:underline'
                  >
                    <IconExternalLink className='h-3.5 w-3.5 shrink-0' />
                    {selectedAgenda.link_meeting_or_drive}
                  </a>
                </div>
              )}

              {/* Status Pengingat WA & Preview Pesan */}
              <div className='rounded-lg border border-emerald-200 bg-emerald-50/50 p-3.5 dark:border-emerald-800/40 dark:bg-emerald-950/20'>
                <div className='mb-2 flex items-center justify-between gap-2'>
                  <div className='flex items-center gap-1.5'>
                    <IconBrandWhatsapp className='h-4 w-4 text-emerald-600' />
                    <span className='text-xs font-bold text-emerald-900 dark:text-emerald-200'>
                      Status Notifikasi WhatsApp Peserta
                    </span>
                  </div>
                  {selectedAgenda.reminder_wa_sent ? (
                    <Badge className='bg-emerald-600 text-[10px] text-white hover:bg-emerald-600'>
                      Terkirim
                    </Badge>
                  ) : (
                    <Badge
                      variant='outline'
                      className='text-muted-foreground text-[10px]'
                    >
                      Belum Terkirim
                    </Badge>
                  )}
                </div>

                <p className='text-muted-foreground mb-3 text-xs'>
                  {selectedAgenda.reminder_wa_sent &&
                  selectedAgenda.reminder_wa_sent_at
                    ? `Notifikasi pengingat H-1/instan telah dikirimkan pada: ${new Date(
                        selectedAgenda.reminder_wa_sent_at
                      ).toLocaleString('id-ID')}`
                    : 'Kirim notifikasi pengingat resmi ke nomor WhatsApp peserta rapat dan PIC pilar terkait.'}
                </p>

                {/* Pratinjau Teks Pesan WA */}
                <details className='bg-card rounded border p-2.5 text-xs'>
                  <summary className='text-muted-foreground hover:text-foreground cursor-pointer font-semibold'>
                    Lihat Format Teks Pesan WhatsApp
                  </summary>
                  <pre className='bg-muted/30 text-foreground mt-2 rounded border p-2.5 font-sans text-xs leading-relaxed whitespace-pre-wrap'>
                    {formatAgendaWAReminder(selectedAgenda)}
                  </pre>
                </details>
              </div>
            </div>

            <DialogFooter className='flex-wrap justify-between gap-2 sm:gap-0'>
              <div className='flex items-center gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setIsDetailDialogOpen(false);
                    handleOpenEdit(selectedAgenda);
                  }}
                >
                  <IconEdit className='mr-1 h-3.5 w-3.5' /> Edit
                </Button>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  className='text-destructive hover:bg-destructive/10'
                  onClick={() => handleDeleteAgenda(selectedAgenda.id)}
                >
                  <IconTrash className='mr-1 h-3.5 w-3.5' /> Hapus
                </Button>
              </div>

              <div className='flex items-center gap-2'>
                <Link
                  href={`/rebo/notulen?agendaId=${selectedAgenda.id}&title=${encodeURIComponent(selectedAgenda.judul)}`}
                >
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    className='border-cyan-300 text-cyan-700 hover:bg-cyan-50 dark:border-cyan-700 dark:text-cyan-300 dark:hover:bg-cyan-950/40'
                  >
                    <IconFileDescription className='mr-1 h-3.5 w-3.5' /> Catat
                    Notulen
                  </Button>
                </Link>
                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={() => setIsDetailDialogOpen(false)}
                >
                  Tutup
                </Button>
                <Button
                  type='button'
                  size='sm'
                  className='bg-emerald-600 text-white shadow-sm hover:bg-emerald-700'
                  disabled={sendingWaId === selectedAgenda.id}
                  onClick={() => handleSendWAReminder(selectedAgenda)}
                >
                  <IconBrandWhatsapp className='mr-1.5 h-4 w-4' />
                  {sendingWaId === selectedAgenda.id
                    ? 'Mengirim...'
                    : selectedAgenda.reminder_wa_sent
                      ? 'Kirim Ulang WA'
                      : 'Kirim Pengingat WA'}
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
