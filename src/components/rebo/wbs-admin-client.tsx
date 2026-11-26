'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Printer,
  ExternalLink,
  Edit,
  Clock,
  CheckCircle2,
  XCircle,
  Lock,
  UserCheck,
  RefreshCw,
  Building,
  MapPin,
  FileSpreadsheet,
  FileCheck2
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  LaporanPengaduanWBS,
  WBSStats,
  StatusWBS,
  KategoriWBS,
  KATEGORI_WBS_METADATA,
  STATUS_WBS_METADATA
} from '@/lib/wbs/wbs-types';
import {
  updateStatusLaporanWBSAction,
  getLaporanWBSListAction
} from '@/actions/wbs-actions';

interface WBSAdminClientProps {
  initialData: LaporanPengaduanWBS[];
  initialStats?: WBSStats;
  isAdmin?: boolean;
}

export default function WBSAdminClient({
  initialData,
  initialStats
}: WBSAdminClientProps) {
  const [items, setItems] = useState<LaporanPengaduanWBS[]>(initialData);
  const [stats, setStats] = useState<WBSStats>(
    initialStats || {
      total: initialData.length,
      diterima: initialData.filter((i) => i.status === 'DITERIMA').length,
      verifikasiAwal: initialData.filter((i) => i.status === 'VERIFIKASI_AWAL')
        .length,
      investigasi: initialData.filter((i) => i.status === 'INVESTIGASI').length,
      selesai: initialData.filter((i) => i.status === 'SELESAI').length,
      ditolak: initialData.filter((i) => i.status === 'DITOLAK').length,
      anonimCount: initialData.filter((i) => i.is_anonim).length,
      nonAnonimCount: initialData.filter((i) => !i.is_anonim).length
    }
  );

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState<string>('SEMUA');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');

  // Modal Detail / Edit State
  const [selectedReport, setSelectedReport] =
    useState<LaporanPengaduanWBS | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editStatus, setEditStatus] = useState<StatusWBS>('DITERIMA');
  const [editCatatan, setEditCatatan] = useState('');
  const [editTindakLanjut, setEditTindakLanjut] = useState('');
  const [isUpdating, startUpdateTransition] = useTransition();

  // Modal Print Rekap Pilar 5 State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Refresh data transition
  const [isRefreshing, startRefreshTransition] = useTransition();

  // Filtered List
  const filteredList = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.ticket_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subjek.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.terlapor_nama_or_unit
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.lokasi_kejadian
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.pelapor_nama &&
          item.pelapor_nama.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchKategori =
        kategoriFilter === 'SEMUA' || item.kategori === kategoriFilter;

      const matchStatus =
        statusFilter === 'SEMUA' || item.status === statusFilter;

      return matchSearch && matchKategori && matchStatus;
    });
  }, [items, searchQuery, kategoriFilter, statusFilter]);

  // Handle Refresh
  const handleRefresh = () => {
    startRefreshTransition(async () => {
      const res = await getLaporanWBSListAction();
      if (res.success && res.data) {
        setItems(res.data);
        if (res.stats) setStats(res.stats);
        toast.success('Daftar pengaduan WBS berhasil dimutakhirkan.');
      } else {
        toast.error('Gagal memuat pembaruan data.');
      }
    });
  };

  // Open Edit Dialog
  const handleOpenEdit = (report: LaporanPengaduanWBS) => {
    setSelectedReport(report);
    setEditStatus(report.status);
    setEditCatatan(report.catatan_tim_kepatuhan || '');
    setEditTindakLanjut(report.tindak_lanjut || '');
    setIsDetailOpen(true);
  };

  // Submit Update Status
  const handleSaveUpdate = () => {
    if (!selectedReport) return;

    startUpdateTransition(async () => {
      const res = await updateStatusLaporanWBSAction(
        selectedReport.id,
        editStatus,
        editCatatan,
        editTindakLanjut
      );

      if (res.success && res.data) {
        const updated = res.data;
        setItems((prev) =>
          prev.map((i) => (i.id === updated.id ? updated : i))
        );
        setSelectedReport(updated);
        setIsDetailOpen(false);
        toast.success(
          `Status tiket ${updated.ticket_code} berhasil diperbarui menjadi "${STATUS_WBS_METADATA[updated.status]?.label}".`
        );
      } else {
        toast.error(res.error || 'Gagal memperbarui status pengaduan.');
      }
    });
  };

  // Export CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'No',
        'Nomor Tiket',
        'Tanggal Lapor',
        'Kategori',
        'Subjek Pengaduan',
        'Pihak Terlapor',
        'Lokasi Kejadian',
        'Perkiraan Tanggal',
        'Status Anonim',
        'Nama Pelapor',
        'Kontak Pelapor',
        'Status Investigasi',
        'Catatan Tim Kepatuhan',
        'Tindak Lanjut',
        'Lampiran Bukti'
      ];

      const csvRows = filteredList.map((item, idx) => [
        idx + 1,
        `"${item.ticket_code}"`,
        `"${item.tanggal_lapor}"`,
        `"${KATEGORI_WBS_METADATA[item.kategori]?.label || item.kategori}"`,
        `"${(item.subjek || '').replace(/"/g, '""')}"`,
        `"${(item.terlapor_nama_or_unit || '').replace(/"/g, '""')}"`,
        `"${(item.lokasi_kejadian || '').replace(/"/g, '""')}"`,
        `"${item.perkiraan_tanggal_kejadian}"`,
        item.is_anonim ? 'ANONIM' : 'TERBUKA',
        item.is_anonim
          ? 'ANONIM'
          : `"${(item.pelapor_nama || '-').replace(/"/g, '""')}"`,
        item.is_anonim
          ? '-'
          : `"${(item.pelapor_kontak || '-').replace(/"/g, '""')}"`,
        `"${STATUS_WBS_METADATA[item.status]?.label || item.status}"`,
        `"${(item.catatan_tim_kepatuhan || '-').replace(/"/g, '""')}"`,
        `"${(item.tindak_lanjut || '-').replace(/"/g, '""')}"`,
        `"${item.lampiran_bukti_url || '-'}"`
      ]);

      const csvContent =
        '\uFEFF' +
        [headers.join(','), ...csvRows.map((r) => r.join(','))].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const nowStr = new Date().toISOString().slice(0, 10);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `Rekap_WBS_Pengawasan_Pilar5_BPS_Sitaro_${nowStr}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Berhasil mengekspor ${filteredList.length} laporan pengaduan WBS ke format CSV!`
      );
    } catch (err) {
      toast.error('Gagal mengekspor laporan WBS.');
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* ============================================================================== */}
      {/* 1. HEADER DASBOR ADMIN PENGAWASAN */}
      {/* ============================================================================== */}
      <div className='relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs md:p-8 dark:border-slate-800 dark:bg-slate-900/60'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-3xl space-y-2'>
            <div className='inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3.5 py-1 text-xs font-semibold text-indigo-800 dark:border-indigo-900/60 dark:bg-indigo-950/50 dark:text-indigo-300'>
              <ShieldAlert className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400' />
              Pilar 5: Penguatan Pengawasan • Tim Kepatuhan Internal BPS Sitaro
            </div>

            <h2 className='text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
              Manajemen Investigasi & Whistleblowing System (WBS)
            </h2>

            <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
              Dasbor monitoring penanganan pengaduan masyarakat & pegawai secara
              tertutup, pelacakan kronologi investigasi, dan dokumentasi bukti
              pemenuhan kepatuhan Pilar 5 PMPRB BPS Kabupaten Kepulauan Sitaro.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              variant='outline'
              onClick={handleRefresh}
              disabled={isRefreshing}
              size='sm'
              className='gap-1.5 text-xs font-semibold'
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Segarkan
            </Button>

            <Button
              variant='outline'
              onClick={handleExportCSV}
              size='sm'
              className='gap-1.5 text-xs font-semibold'
            >
              <FileSpreadsheet className='h-3.5 w-3.5 text-emerald-600' />
              Ekspor CSV
            </Button>

            <Button
              onClick={() => setIsPrintModalOpen(true)}
              size='sm'
              className='gap-1.5 bg-slate-900 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200'
            >
              <FileCheck2 className='h-3.5 w-3.5' />
              Cetak Bukti Pilar 5
            </Button>

            <Link href='/rebo/wbs' target='_blank'>
              <Button
                variant='outline'
                size='sm'
                className='gap-1.5 border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:border-indigo-900 dark:text-indigo-300'
              >
                <ExternalLink className='h-3.5 w-3.5' />
                Buka Portal Publik WBS
              </Button>
            </Link>
          </div>
        </div>

        {/* 4 STATS CARDS */}
        <div className='mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-4 dark:border-slate-800'>
          <div className='rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='text-xs font-medium text-slate-500 dark:text-slate-400'>
              Total Laporan Masuk
            </div>
            <div className='mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {stats.total}
            </div>
            <div className='text-[11px] text-slate-500'>
              Tercatat dalam Sistem
            </div>
          </div>

          <div className='rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-950/60 dark:bg-amber-950/20'>
            <div className='text-xs font-semibold text-amber-800 dark:text-amber-400'>
              Dalam Investigasi / Verifikasi
            </div>
            <div className='mt-1 text-2xl font-bold text-amber-800 dark:text-amber-300'>
              {stats.verifikasiAwal + stats.investigasi}
            </div>
            <div className='text-[11px] text-amber-700/80 dark:text-amber-400/80'>
              {stats.verifikasiAwal} telaah, {stats.investigasi} investigasi
            </div>
          </div>

          <div className='rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-950/60 dark:bg-emerald-950/20'>
            <div className='text-xs font-semibold text-emerald-800 dark:text-emerald-400'>
              Selesai Ditindaklanjuti
            </div>
            <div className='mt-1 text-2xl font-bold text-emerald-800 dark:text-emerald-300'>
              {stats.selesai}
            </div>
            <div className='text-[11px] text-emerald-700/80 dark:text-emerald-400/80'>
              Rekomendasi Tuntas
            </div>
          </div>

          <div className='rounded-xl border border-indigo-200/80 bg-indigo-50/50 p-3.5 dark:border-indigo-950/60 dark:bg-indigo-950/20'>
            <div className='text-xs font-semibold text-indigo-800 dark:text-indigo-400'>
              Aduan Anonim
            </div>
            <div className='mt-1 text-2xl font-bold text-indigo-900 dark:text-indigo-300'>
              {stats.anonimCount}{' '}
              <span className='text-xs font-normal text-indigo-700'>
                (
                {stats.total > 0
                  ? Math.round((stats.anonimCount / stats.total) * 100)
                  : 0}
                %)
              </span>
            </div>
            <div className='text-[11px] text-indigo-700/80 dark:text-indigo-400/80'>
              Privasi Pelapor 100% Terlindungi
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. FILTER & SEARCH CONTROLS */}
      {/* ============================================================================== */}
      <div className='rounded-xl border border-slate-200 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900'>
        <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
          {/* Search Box */}
          <div className='relative flex-1'>
            <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
            <Input
              placeholder='Cari nomor tiket, subjek, pihak terlapor, atau lokasi...'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='pl-9 text-xs sm:text-sm'
            />
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            {/* Filter Kategori */}
            <Select value={kategoriFilter} onValueChange={setKategoriFilter}>
              <SelectTrigger className='w-[190px] text-xs'>
                <SelectValue placeholder='Semua Kategori' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='SEMUA'>Semua Kategori</SelectItem>
                {(Object.keys(KATEGORI_WBS_METADATA) as KategoriWBS[]).map(
                  (k) => (
                    <SelectItem key={k} value={k} className='text-xs'>
                      {KATEGORI_WBS_METADATA[k]?.label}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>

            {/* Filter Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='w-[170px] text-xs'>
                <SelectValue placeholder='Semua Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='SEMUA'>Semua Status</SelectItem>
                {(Object.keys(STATUS_WBS_METADATA) as StatusWBS[]).map((s) => (
                  <SelectItem key={s} value={s} className='text-xs'>
                    {STATUS_WBS_METADATA[s]?.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(searchQuery ||
              kategoriFilter !== 'SEMUA' ||
              statusFilter !== 'SEMUA') && (
              <Button
                variant='ghost'
                size='sm'
                onClick={() => {
                  setSearchQuery('');
                  setKategoriFilter('SEMUA');
                  setStatusFilter('SEMUA');
                }}
                className='text-xs text-rose-600 hover:text-rose-700'
              >
                Reset Filter
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 3. TABEL INVESTIGASI PENGADUAN */}
      {/* ============================================================================== */}
      <div className='overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs'>
            <thead className='border-b border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'>
              <tr>
                <th className='px-4 py-3.5 font-semibold'>
                  No. Tiket & Tanggal
                </th>
                <th className='px-4 py-3.5 font-semibold'>Kategori</th>
                <th className='px-4 py-3.5 font-semibold'>Subjek & Terlapor</th>
                <th className='px-4 py-3.5 font-semibold'>Pelapor</th>
                <th className='px-4 py-3.5 font-semibold'>
                  Status Investigasi
                </th>
                <th className='px-4 py-3.5 font-semibold'>Notif WA Tim</th>
                <th className='px-4 py-3.5 text-right font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className='py-12 text-center text-slate-500 dark:text-slate-400'
                  >
                    <ShieldCheck className='mx-auto mb-2 h-8 w-8 text-slate-300 dark:text-slate-600' />
                    Tidak ada laporan pengaduan yang sesuai dengan kriteria
                    filter.
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr
                    key={item.id}
                    className='transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  >
                    {/* Tiket & Tanggal */}
                    <td className='px-4 py-3.5 whitespace-nowrap'>
                      <div className='font-mono font-bold text-indigo-600 dark:text-indigo-400'>
                        {item.ticket_code}
                      </div>
                      <div className='text-[11px] text-slate-500'>
                        {item.tanggal_lapor}
                      </div>
                    </td>

                    {/* Kategori */}
                    <td className='px-4 py-3.5'>
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${
                          KATEGORI_WBS_METADATA[item.kategori]?.badgeClass
                        }`}
                      >
                        {KATEGORI_WBS_METADATA[item.kategori]?.label ||
                          item.kategori}
                      </span>
                    </td>

                    {/* Subjek & Terlapor */}
                    <td className='max-w-xs px-4 py-3.5'>
                      <div className='line-clamp-1 font-semibold text-slate-900 dark:text-slate-100'>
                        {item.subjek}
                      </div>
                      <div className='mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500'>
                        <Building className='h-3 w-3 shrink-0' />
                        <span className='line-clamp-1'>
                          Terlapor: {item.terlapor_nama_or_unit}
                        </span>
                      </div>
                      <div className='mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400'>
                        <MapPin className='h-3 w-3 shrink-0' />
                        <span className='line-clamp-1'>
                          {item.lokasi_kejadian}
                        </span>
                      </div>
                    </td>

                    {/* Pelapor */}
                    <td className='px-4 py-3.5 whitespace-nowrap'>
                      {item.is_anonim ? (
                        <span className='inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300'>
                          <Lock className='h-3 w-3' />
                          Anonim 100%
                        </span>
                      ) : (
                        <div className='text-[11px]'>
                          <div className='flex items-center gap-1 font-semibold text-slate-800 dark:text-slate-200'>
                            <UserCheck className='h-3 w-3 text-blue-600' />
                            {item.pelapor_nama || 'Pegawai/Masyarakat'}
                          </div>
                          {item.pelapor_kontak && (
                            <div className='text-slate-500'>
                              {item.pelapor_kontak}
                            </div>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className='px-4 py-3.5 whitespace-nowrap'>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                          STATUS_WBS_METADATA[item.status]?.badgeClass
                        }`}
                      >
                        {item.status === 'SELESAI' ? (
                          <CheckCircle2 className='h-3 w-3 text-emerald-600' />
                        ) : item.status === 'DITOLAK' ? (
                          <XCircle className='h-3 w-3 text-rose-600' />
                        ) : (
                          <Clock className='h-3 w-3 text-blue-600' />
                        )}
                        {STATUS_WBS_METADATA[item.status]?.label || item.status}
                      </span>
                    </td>

                    {/* Notif WA */}
                    <td className='px-4 py-3.5 whitespace-nowrap'>
                      {item.notifikasi_tim_sent ? (
                        <span className='inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                          <CheckCircle2 className='h-3 w-3' />
                          Terkirim
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1 text-[11px] text-slate-400'>
                          -
                        </span>
                      )}
                    </td>

                    {/* Aksi */}
                    <td className='px-4 py-3.5 text-right whitespace-nowrap'>
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => handleOpenEdit(item)}
                        className='h-7 gap-1 text-xs font-semibold hover:bg-indigo-50 hover:text-indigo-700 dark:hover:bg-indigo-950'
                      >
                        <Edit className='h-3 w-3' />
                        Investigasi
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 4. MODAL DIALOG DETAIL INVESTIGASI & UPDATE STATUS */}
      {/* ============================================================================== */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-2xl'>
          <DialogHeader>
            <div className='flex items-center gap-2'>
              <ShieldAlert className='h-5 w-5 text-indigo-600' />
              <DialogTitle className='text-lg font-bold'>
                Investigasi Laporan Tiket {selectedReport?.ticket_code}
              </DialogTitle>
            </div>
            <DialogDescription className='text-xs text-slate-500'>
              Lakukan penelaahan bukti permulaan, pencatatan hasil verifikasi,
              dan pemutakhiran status penanganan pengawasan internal BPS Sitaro.
            </DialogDescription>
          </DialogHeader>

          {selectedReport && (
            <div className='space-y-4 py-2 text-xs'>
              {/* Box Rincian Kejadian */}
              <div className='space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/40'>
                <div className='grid grid-cols-2 gap-3'>
                  <div>
                    <span className='font-semibold text-slate-500'>
                      Kategori Pelanggaran:
                    </span>
                    <div className='mt-0.5 font-bold text-slate-800 dark:text-slate-200'>
                      {KATEGORI_WBS_METADATA[selectedReport.kategori]?.label}
                    </div>
                  </div>

                  <div>
                    <span className='font-semibold text-slate-500'>
                      Waktu Lapor:
                    </span>
                    <div className='mt-0.5 font-medium text-slate-700 dark:text-slate-300'>
                      {selectedReport.tanggal_lapor}
                    </div>
                  </div>

                  <div>
                    <span className='font-semibold text-slate-500'>
                      Pihak Terlapor:
                    </span>
                    <div className='mt-0.5 font-bold text-slate-800 dark:text-slate-200'>
                      {selectedReport.terlapor_nama_or_unit}
                    </div>
                  </div>

                  <div>
                    <span className='font-semibold text-slate-500'>
                      Lokasi & Tanggal Kejadian:
                    </span>
                    <div className='mt-0.5 font-medium text-slate-700 dark:text-slate-300'>
                      {selectedReport.lokasi_kejadian} (
                      {selectedReport.perkiraan_tanggal_kejadian})
                    </div>
                  </div>
                </div>

                <div className='border-t border-slate-200 pt-2 dark:border-slate-700'>
                  <span className='font-semibold text-slate-500'>
                    Subjek Aduan:
                  </span>
                  <div className='mt-0.5 font-bold text-slate-900 dark:text-slate-100'>
                    {selectedReport.subjek}
                  </div>
                </div>

                <div className='border-t border-slate-200 pt-2 dark:border-slate-700'>
                  <span className='font-semibold text-slate-500'>
                    Rincian Kronologi Faktual:
                  </span>
                  <p className='mt-1 rounded-lg border border-slate-200/80 bg-white p-2.5 leading-relaxed whitespace-pre-wrap text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'>
                    {selectedReport.rincian_kejadian}
                  </p>
                </div>

                {selectedReport.lampiran_bukti_url && (
                  <div className='border-t border-slate-200 pt-2 dark:border-slate-700'>
                    <span className='font-semibold text-slate-500'>
                      Tautan Bukti Dukung:
                    </span>
                    <div className='mt-1'>
                      <a
                        href={selectedReport.lampiran_bukti_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:underline'
                      >
                        <ExternalLink className='h-3.5 w-3.5' />
                        {selectedReport.lampiran_bukti_url}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Form Update Status */}
              <div className='space-y-3 pt-2'>
                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>
                    Perbarui Status Investigasi Pengawasan
                  </Label>
                  <Select
                    value={editStatus}
                    onValueChange={(val) => setEditStatus(val as StatusWBS)}
                  >
                    <SelectTrigger className='text-xs'>
                      <SelectValue placeholder='Pilih Status' />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(STATUS_WBS_METADATA) as StatusWBS[]).map(
                        (s) => (
                          <SelectItem key={s} value={s} className='text-xs'>
                            {STATUS_WBS_METADATA[s]?.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>
                    Catatan Resmi Tim Kepatuhan Internal
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder='Tuliskan hasil penelaahan bukti, konfirmasi saksi/terlapor, atau dasar hukum tindak lanjut...'
                    value={editCatatan}
                    onChange={(e) => setEditCatatan(e.target.value)}
                    className='text-xs'
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label className='text-xs font-semibold'>
                    Tindak Lanjut & Rekomendasi Pengawasan (Pilar 5)
                  </Label>
                  <Textarea
                    rows={3}
                    placeholder='Contoh: Pemasangan banner penegasan tarif Rp 0, teguran lisan/tertulis, penarikan BMN, atau penerbitan SOP baru...'
                    value={editTindakLanjut}
                    onChange={(e) => setEditTindakLanjut(e.target.value)}
                    className='text-xs'
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className='gap-2 sm:justify-between'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsDetailOpen(false)}
              className='text-xs'
            >
              Batal
            </Button>
            <Button
              type='button'
              onClick={handleSaveUpdate}
              disabled={isUpdating}
              className='gap-1.5 bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700'
            >
              {isUpdating ? (
                <>
                  <span className='h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent' />
                  Menyimpan...
                </>
              ) : (
                <>
                  <ShieldCheck className='h-3.5 w-3.5' />
                  Simpan Pembaruan Investigasi
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============================================================================== */}
      {/* 5. MODAL PRINT PREVIEW REKAP BUKTI DUKUNG PILAR 5 */}
      {/* ============================================================================== */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className='max-h-[92vh] overflow-y-auto sm:max-w-4xl'>
          <DialogHeader className='print:hidden'>
            <DialogTitle className='flex items-center gap-2 text-base font-bold'>
              <FileCheck2 className='h-5 w-5 text-indigo-600' />
              Format Cetak Resmi: Bukti Dukung Penguatan Pengawasan (Pilar 5)
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Dokumen rekapitulasi penanganan pengaduan masyarakat & ASN melalui
              WBS BPS Kabupaten Kepulauan Sitaro untuk penilaian TPI/TPN.
            </DialogDescription>
          </DialogHeader>

          {/* PRINTABLE SHEET */}
          <div className='rounded-xl border border-slate-300 bg-white p-6 text-slate-900 shadow-sm sm:p-8 dark:bg-white dark:text-slate-900'>
            {/* Kop Resmi BPS */}
            <div className='border-b-2 border-slate-900 pb-4 text-center'>
              <div className='text-xs font-bold tracking-widest text-slate-700 uppercase'>
                BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO
              </div>
              <h3 className='mt-1 text-base font-black tracking-wide text-slate-900 uppercase'>
                LAPORAN REKAPITULASI WHISTLEBLOWING SYSTEM (WBS) & PENGADUAN
                MASYARAKAT
              </h3>
              <div className='mt-0.5 text-[11px] text-slate-600'>
                Bukti Pemenuhan Lembar Kerja Evaluasi (LKE) ZI Pilar 5:
                Penguatan Pengawasan • Periode Penilaian Tahun 2026
              </div>
            </div>

            {/* Ringkasan Eksekutif */}
            <div className='mt-5 grid grid-cols-4 gap-2 text-center text-xs'>
              <div className='rounded-lg border border-slate-300 bg-slate-50 p-2.5'>
                <div className='text-[10px] font-semibold text-slate-600'>
                  TOTAL PENGADUAN
                </div>
                <div className='text-lg font-bold text-slate-900'>
                  {stats.total}
                </div>
              </div>
              <div className='rounded-lg border border-slate-300 bg-slate-50 p-2.5'>
                <div className='text-[10px] font-semibold text-slate-600'>
                  DALAM PROSES
                </div>
                <div className='text-lg font-bold text-slate-900'>
                  {stats.verifikasiAwal + stats.investigasi}
                </div>
              </div>
              <div className='rounded-lg border border-slate-300 bg-slate-50 p-2.5'>
                <div className='text-[10px] font-semibold text-slate-600'>
                  SELESAI DITINDAKLANJUTI
                </div>
                <div className='text-lg font-bold text-emerald-700'>
                  {stats.selesai}
                </div>
              </div>
              <div className='rounded-lg border border-slate-300 bg-slate-50 p-2.5'>
                <div className='text-[10px] font-semibold text-slate-600'>
                  PENGADUAN ANONIM
                </div>
                <div className='text-lg font-bold text-indigo-700'>
                  {stats.anonimCount}
                </div>
              </div>
            </div>

            {/* Tabel Cetak */}
            <div className='mt-5 overflow-x-auto'>
              <table className='w-full border-collapse border border-slate-400 text-[10px]'>
                <thead className='bg-slate-100 text-slate-900'>
                  <tr>
                    <th className='border border-slate-400 px-2 py-1.5 text-center'>
                      No
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5'>
                      Nomor Tiket
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5'>
                      Tanggal
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5'>
                      Kategori Pelanggaran
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5'>
                      Subjek & Terlapor
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5'>
                      Pelapor
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5 text-center'>
                      Status
                    </th>
                    <th className='border border-slate-400 px-2 py-1.5'>
                      Rekomendasi Tindak Lanjut
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={item.id}>
                      <td className='border border-slate-400 px-2 py-1 text-center font-bold'>
                        {idx + 1}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 font-mono font-bold whitespace-nowrap'>
                        {item.ticket_code}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 whitespace-nowrap'>
                        {item.tanggal_lapor}
                      </td>
                      <td className='border border-slate-400 px-2 py-1'>
                        {KATEGORI_WBS_METADATA[item.kategori]?.label ||
                          item.kategori}
                      </td>
                      <td className='border border-slate-400 px-2 py-1'>
                        <strong>{item.subjek}</strong>
                        <div className='text-slate-600'>
                          Terlapor: {item.terlapor_nama_or_unit}
                        </div>
                      </td>
                      <td className='border border-slate-400 px-2 py-1 whitespace-nowrap'>
                        {item.is_anonim
                          ? 'ANONIM'
                          : item.pelapor_nama || 'Pegawai'}
                      </td>
                      <td className='border border-slate-400 px-2 py-1 text-center font-bold whitespace-nowrap'>
                        {STATUS_WBS_METADATA[item.status]?.label || item.status}
                      </td>
                      <td className='border border-slate-400 px-2 py-1'>
                        {item.tindak_lanjut ||
                          item.catatan_tim_kepatuhan ||
                          '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Kolom Tanda Tangan */}
            <div className='mt-8 grid grid-cols-2 text-center text-xs'>
              <div>
                <p>Mengetahui,</p>
                <p className='mt-0.5 font-bold'>
                  Kepala BPS Kabupaten Kepulauan Sitaro
                </p>
                <div className='h-16' />
                <p className='font-bold underline'>Pembina Utama Muda</p>
                <p className='text-[10px] text-slate-600'>NIP. 197xxxxxxx</p>
              </div>

              <div>
                <p>
                  Ondong Siau,{' '}
                  {new Date().toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className='mt-0.5 font-bold'>
                  Ketua Tim Penguatan Pengawasan (Pilar 5)
                </p>
                <div className='h-16' />
                <p className='font-bold underline'>
                  Tim Kepatuhan Internal BPS Sitaro
                </p>
                <p className='text-[10px] text-slate-600'>
                  Koordinator Pilar 5 ZI/RB
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className='gap-2 sm:justify-between print:hidden'>
            <Button
              type='button'
              variant='outline'
              onClick={() => setIsPrintModalOpen(false)}
              className='text-xs'
            >
              Tutup
            </Button>
            <Button
              type='button'
              onClick={() => window.print()}
              className='gap-1.5 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
            >
              <Printer className='h-3.5 w-3.5' />
              Cetak Dokumen (Print / PDF)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
