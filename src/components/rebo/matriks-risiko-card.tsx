'use client';

import React, { useState, useTransition, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Download,
  Edit3,
  Trash2,
  ExternalLink,
  Layers,
  Sparkles,
  Info,
  Building2,
  Users,
  FileText
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';
import type {
  MatriksRisikoItem,
  TingkatRisiko,
  StatusPengendalian
} from '@/types/rebo';
import {
  saveMatriksRisikoAction,
  deleteMatriksRisikoAction
} from '@/actions/spip-actions';

interface MatriksRisikoCardProps {
  initialData?: MatriksRisikoItem[];
}

const COMMON_PROSES_BISNIS = [
  'Pelayanan Statistik Terpadu (PST)',
  'Pengadaan Barang & Jasa (PBJ)',
  'Pembayaran Honor Mitra Statistik',
  'Pengelolaan BMN (Barang Milik Negara)',
  'Penetapan Angka Kredit & Sasaran Kinerja (SKP)',
  'Pengelolaan Anggaran DIPA & Perjalanan Dinas',
  'Pengelolaan Arsip & Kerahasiaan Data Responden'
];

export default function MatriksRisikoCard({
  initialData = []
}: MatriksRisikoCardProps) {
  const [items, setItems] = useState<MatriksRisikoItem[]>(initialData);
  const [searchQuery, setSearchQuery] = useState('');
  const [tingkatFilter, setTingkatFilter] = useState<string>('SEMUA');
  const [statusFilter, setStatusFilter] = useState<string>('SEMUA');
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MatriksRisikoItem | null>(
    null
  );

  // Form State
  const [formData, setFormData] = useState<Partial<MatriksRisikoItem>>({
    proses_bisnis: COMMON_PROSES_BISNIS[0],
    potensi_risiko: '',
    tingkat_risiko: 'SEDANG',
    dampak_risiko: '',
    rencana_pengendalian: '',
    pic_pengendali: '',
    status_pengendalian: 'TERKENDALI',
    bukti_dukung_url: '',
    kategori_fraud: 'Gratifikasi'
  });

  // Calculate Metrics
  const metrics = useMemo(() => {
    const total = items.length;
    const tinggi = items.filter((i) => i.tingkat_risiko === 'TINGGI').length;
    const sedang = items.filter((i) => i.tingkat_risiko === 'SEDANG').length;
    const rendah = items.filter((i) => i.tingkat_risiko === 'RENDAH').length;
    const terkendali = items.filter(
      (i) => i.status_pengendalian === 'TERKENDALI'
    ).length;
    const persenTerkendali =
      total > 0 ? Math.round((terkendali / total) * 100) : 100;

    return { total, tinggi, sedang, rendah, terkendali, persenTerkendali };
  }, [items]);

  // Filter Items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.proses_bisnis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.potensi_risiko.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.rencana_pengendalian
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        item.pic_pengendali.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.kategori_fraud &&
          item.kategori_fraud
            .toLowerCase()
            .includes(searchQuery.toLowerCase()));

      const matchTingkat =
        tingkatFilter === 'SEMUA' || item.tingkat_risiko === tingkatFilter;
      const matchStatus =
        statusFilter === 'SEMUA' || item.status_pengendalian === statusFilter;

      return matchSearch && matchTingkat && matchStatus;
    });
  }, [items, searchQuery, tingkatFilter, statusFilter]);

  // Open Add Dialog
  const handleOpenAdd = () => {
    setEditingItem(null);
    setFormData({
      proses_bisnis: COMMON_PROSES_BISNIS[0],
      potensi_risiko: '',
      tingkat_risiko: 'SEDANG',
      dampak_risiko: '',
      rencana_pengendalian: '',
      pic_pengendali: '',
      status_pengendalian: 'TERKENDALI',
      bukti_dukung_url: '',
      kategori_fraud: 'Gratifikasi'
    });
    setIsModalOpen(true);
  };

  // Open Edit Dialog
  const handleOpenEdit = (item: MatriksRisikoItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsModalOpen(true);
  };

  // Save / Submit
  const handleSave = () => {
    if (
      !formData.proses_bisnis ||
      !formData.potensi_risiko ||
      !formData.rencana_pengendalian
    ) {
      toast.error(
        'Proses bisnis, potensi risiko, dan rencana pengendalian wajib diisi!'
      );
      return;
    }

    startTransition(async () => {
      try {
        const payload: Partial<MatriksRisikoItem> = {
          ...formData,
          id: editingItem ? editingItem.id : undefined
        };

        const res = await saveMatriksRisikoAction(payload);
        if (res.success && res.data) {
          toast.success(
            editingItem
              ? 'Butir mitigasi risiko berhasil diperbarui.'
              : 'Butir mitigasi risiko baru berhasil ditambahkan.'
          );
          if (editingItem) {
            setItems((prev) =>
              prev.map((i) => (i.id === res.data!.id ? res.data! : i))
            );
          } else {
            setItems((prev) => [res.data!, ...prev]);
          }
          setIsModalOpen(false);
        } else {
          toast.error(res.error || 'Gagal menyimpan butir risiko.');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Terjadi kesalahan sistem.');
      }
    });
  };

  // Delete Item
  const handleDelete = (id: string, proses: string) => {
    if (!confirm(`Hapus butir mitigasi risiko untuk area "${proses}"?`)) {
      return;
    }

    startTransition(async () => {
      try {
        const res = await deleteMatriksRisikoAction(id);
        if (res.success) {
          toast.success('Butir mitigasi risiko berhasil dihapus.');
          setItems((prev) => prev.filter((i) => i.id !== id));
        } else {
          toast.error(res.error || 'Gagal menghapus butir risiko.');
        }
      } catch (err: any) {
        toast.error(err?.message || 'Terjadi kesalahan sistem.');
      }
    });
  };

  // Export to CSV
  const handleExportCSV = () => {
    try {
      const headers = [
        'No',
        'Proses Bisnis / Area',
        'Kategori Fraud',
        'Potensi Titik Rawan Risiko',
        'Tingkat Risiko',
        'Dampak Risiko',
        'Rencana Aksi Pengendalian Intern',
        'PIC Pengendali',
        'Status Pengendalian',
        'Tautan Bukti Dukung'
      ];

      const csvRows = filteredItems.map((item, idx) => [
        idx + 1,
        `"${(item.proses_bisnis || '').replace(/"/g, '""')}"`,
        `"${(item.kategori_fraud || '-').replace(/"/g, '""')}"`,
        `"${(item.potensi_risiko || '').replace(/"/g, '""')}"`,
        item.tingkat_risiko,
        `"${(item.dampak_risiko || '').replace(/"/g, '""')}"`,
        `"${(item.rencana_pengendalian || '').replace(/"/g, '""')}"`,
        `"${(item.pic_pengendali || '').replace(/"/g, '""')}"`,
        item.status_pengendalian,
        `"${(item.bukti_dukung_url || '-').replace(/"/g, '""')}"`
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
        `Matriks_Mitigasi_Risiko_SPIP_BPS_Sitaro_${nowStr}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Berhasil mengekspor ${filteredItems.length} butir matriks risiko ke format CSV!`
      );
    } catch (err: any) {
      toast.error('Gagal mengekspor matriks risiko ke CSV.');
    }
  };

  // Helper Badge Colors
  const getTingkatBadge = (tingkat: TingkatRisiko) => {
    switch (tingkat) {
      case 'TINGGI':
        return (
          <span className='inline-flex items-center gap-1 rounded-md border border-rose-300 bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'>
            <AlertTriangle className='h-3 w-3 text-rose-600' />
            TINGGI
          </span>
        );
      case 'SEDANG':
        return (
          <span className='inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'>
            <ShieldAlert className='h-3 w-3 text-amber-600' />
            SEDANG
          </span>
        );
      case 'RENDAH':
        return (
          <span className='inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'>
            <CheckCircle2 className='h-3 w-3 text-emerald-600' />
            RENDAH
          </span>
        );
    }
  };

  const getStatusBadge = (status: StatusPengendalian) => {
    switch (status) {
      case 'TERKENDALI':
        return (
          <span className='inline-flex items-center gap-1 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'>
            <CheckCircle2 className='h-3 w-3 text-emerald-600' />
            Terkendali
          </span>
        );
      case 'DALAM_PROSES':
        return (
          <span className='inline-flex items-center gap-1 rounded-full border border-blue-300 bg-blue-50 px-2.5 py-0.5 text-[11px] font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'>
            <Clock className='h-3 w-3 text-blue-600' />
            Dalam Proses
          </span>
        );
      case 'MONITORING_BERKALA':
        return (
          <span className='inline-flex items-center gap-1 rounded-full border border-purple-300 bg-purple-50 px-2.5 py-0.5 text-[11px] font-medium text-purple-700 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300'>
            <Layers className='h-3 w-3 text-purple-600' />
            Monitoring Berkala
          </span>
        );
    }
  };

  return (
    <div className='w-full space-y-6'>
      {/* ============================================================================== */}
      {/* 1. HEADER CARD WITH CONTROLS & EXPORT */}
      {/* ============================================================================== */}
      <div className='relative overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs md:p-8 dark:border-slate-800 dark:bg-slate-900/60'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between'>
          <div className='max-w-3xl space-y-2'>
            <div className='inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3.5 py-1 text-xs font-semibold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/50 dark:text-amber-300'>
              <ShieldAlert className='h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
              Pilar 5: Penguatan Pengawasan & Sistem Pengendalian Intern
              Pemerintah (SPIP)
            </div>

            <h2 className='text-2xl font-bold tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
              Matriks Mitigasi Risiko & Titik Rawan Gratifikasi / Fraud
            </h2>

            <p className='text-sm leading-relaxed text-slate-600 dark:text-slate-400'>
              Peta identifikasi kerawanan gratifikasi, pungli, dan benturan
              kepentingan pada seluruh proses bisnis strategis BPS Kabupaten
              Kepulauan Siau Tagulandang Biaro, dilengkapi rencana pengendalian
              intern dan penanggung jawab terukur.
            </p>
          </div>

          {/* Action Buttons */}
          <div className='flex flex-wrap items-center gap-2.5'>
            <Button
              variant='outline'
              onClick={handleExportCSV}
              className='gap-2 text-xs font-semibold'
            >
              <Download className='h-4 w-4 text-emerald-600' />
              Ekspor Matriks SPIP (.csv)
            </Button>

            <Button
              onClick={handleOpenAdd}
              className='gap-2 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700 dark:bg-blue-600'
            >
              <Plus className='h-4 w-4' />
              Tambah Titik Rawan
            </Button>
          </div>
        </div>

        {/* 5 KPI METRICS */}
        <div className='mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3 lg:grid-cols-5 dark:border-slate-800'>
          <div className='rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='text-xs font-medium text-slate-500 dark:text-slate-400'>
              Total Area Rawan
            </div>
            <div className='mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100'>
              {metrics.total}
            </div>
            <div className='text-[11px] text-slate-500'>
              Proses Bisnis Teridentifikasi
            </div>
          </div>

          <div className='rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5 dark:border-rose-950/60 dark:bg-rose-950/20'>
            <div className='text-xs font-semibold text-rose-700 dark:text-rose-400'>
              Risiko Tinggi
            </div>
            <div className='mt-1 text-2xl font-bold text-rose-700 dark:text-rose-300'>
              {metrics.tinggi}
            </div>
            <div className='text-[11px] text-rose-600/80 dark:text-rose-400/80'>
              Prioritas Pengawasan Ketat
            </div>
          </div>

          <div className='rounded-xl border border-amber-200/80 bg-amber-50/50 p-3.5 dark:border-amber-950/60 dark:bg-amber-950/20'>
            <div className='text-xs font-semibold text-amber-700 dark:text-amber-400'>
              Risiko Sedang
            </div>
            <div className='mt-1 text-2xl font-bold text-amber-700 dark:text-amber-300'>
              {metrics.sedang}
            </div>
            <div className='text-[11px] text-amber-600/80 dark:text-amber-400/80'>
              Pengendalian SOP & Kanal Daring
            </div>
          </div>

          <div className='rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 dark:border-emerald-950/60 dark:bg-emerald-950/20'>
            <div className='text-xs font-semibold text-emerald-700 dark:text-emerald-400'>
              Risiko Rendah
            </div>
            <div className='mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300'>
              {metrics.rendah}
            </div>
            <div className='text-[11px] text-emerald-600/80 dark:text-emerald-400/80'>
              Pemantauan Administratif
            </div>
          </div>

          <div className='rounded-xl border border-blue-200/80 bg-blue-50/50 p-3.5 dark:border-blue-950/60 dark:bg-blue-950/20'>
            <div className='text-xs font-semibold text-blue-700 dark:text-blue-400'>
              Tingkat Keterkendalian
            </div>
            <div className='mt-1 text-2xl font-bold text-blue-700 dark:text-blue-300'>
              {metrics.persenTerkendali}%
            </div>
            <div className='text-[11px] text-blue-600/80 dark:text-blue-400/80'>
              {metrics.terkendali} dari {metrics.total} Titik Terkendali
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. SEARCH & FILTER TOOLBAR */}
      {/* ============================================================================== */}
      <div className='flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs md:flex-row md:items-center md:justify-between dark:border-slate-800 dark:bg-slate-900/50'>
        {/* Search */}
        <div className='relative w-full md:w-80'>
          <Search className='absolute top-2.5 left-3 h-4 w-4 text-slate-400' />
          <Input
            placeholder='Cari proses bisnis, risiko, PIC...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className='pl-9 text-xs'
          />
        </div>

        {/* Filters */}
        <div className='flex flex-wrap items-center gap-2.5'>
          {/* Filter Tingkat Risiko */}
          <div className='flex items-center gap-1.5'>
            <span className='text-xs font-medium text-slate-500'>Tingkat:</span>
            <div className='inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800'>
              {['SEMUA', 'TINGGI', 'SEDANG', 'RENDAH'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setTingkatFilter(lvl)}
                  className={`rounded-md px-2.5 py-1 text-[11px] font-semibold transition ${
                    tingkatFilter === lvl
                      ? 'bg-white text-slate-900 shadow-2xs dark:bg-slate-900 dark:text-white'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Filter Status */}
          <div className='flex items-center gap-1.5'>
            <span className='text-xs font-medium text-slate-500'>Status:</span>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className='h-8 w-36 text-xs'>
                <SelectValue placeholder='Semua Status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='SEMUA'>Semua Status</SelectItem>
                <SelectItem value='TERKENDALI'>Terkendali</SelectItem>
                <SelectItem value='DALAM_PROSES'>Dalam Proses</SelectItem>
                <SelectItem value='MONITORING_BERKALA'>
                  Monitoring Berkala
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 3. TABLE MATRIKS RISIKO SPIP */}
      {/* ============================================================================== */}
      <div className='overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900/60'>
        <div className='overflow-x-auto'>
          <table className='w-full text-left text-xs'>
            <thead className='border-b border-slate-200/80 bg-slate-50/80 text-slate-600 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300'>
              <tr>
                <th className='w-12 px-3 py-3.5 text-center font-semibold'>
                  No
                </th>
                <th className='min-w-[200px] px-4 py-3.5 font-semibold'>
                  Proses Bisnis & Kategori
                </th>
                <th className='min-w-[260px] px-4 py-3.5 font-semibold'>
                  Potensi Titik Rawan Risiko
                </th>
                <th className='w-28 px-3 py-3.5 text-center font-semibold'>
                  Tingkat Risiko
                </th>
                <th className='min-w-[220px] px-4 py-3.5 font-semibold'>
                  Dampak Risiko
                </th>
                <th className='min-w-[280px] px-4 py-3.5 font-semibold'>
                  Rencana Aksi Pengendalian
                </th>
                <th className='min-w-[160px] px-4 py-3.5 font-semibold'>
                  PIC & Status
                </th>
                <th className='w-20 px-3 py-3.5 text-center font-semibold'>
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100 dark:divide-slate-800'>
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className='py-12 text-center text-slate-400'>
                    <ShieldAlert className='mx-auto mb-2 h-8 w-8 text-slate-300' />
                    Tidak ada butir matriks risiko yang sesuai dengan kriteria
                    pencarian.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item, index) => (
                  <tr
                    key={item.id}
                    className='transition hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                  >
                    {/* No */}
                    <td className='px-3 py-4 text-center font-medium text-slate-400'>
                      {index + 1}
                    </td>

                    {/* Proses Bisnis */}
                    <td className='px-4 py-4'>
                      <div className='font-semibold text-slate-900 dark:text-slate-100'>
                        {item.proses_bisnis}
                      </div>
                      <div className='mt-1 inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400'>
                        {item.kategori_fraud || 'Umum'}
                      </div>
                      {item.bukti_dukung_url && (
                        <div className='mt-1.5'>
                          <a
                            href={item.bukti_dukung_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 hover:underline dark:text-blue-400'
                          >
                            <ExternalLink className='h-3 w-3' />
                            <span>Tautan Bukti/SOP</span>
                          </a>
                        </div>
                      )}
                    </td>

                    {/* Potensi Titik Rawan */}
                    <td className='px-4 py-4 leading-relaxed text-slate-700 dark:text-slate-300'>
                      {item.potensi_risiko}
                    </td>

                    {/* Tingkat Risiko */}
                    <td className='px-3 py-4 text-center align-top'>
                      {getTingkatBadge(item.tingkat_risiko)}
                    </td>

                    {/* Dampak */}
                    <td className='px-4 py-4 text-[11px] leading-relaxed text-slate-600 dark:text-slate-400'>
                      {item.dampak_risiko}
                    </td>

                    {/* Rencana Pengendalian */}
                    <td className='px-4 py-4 leading-relaxed text-slate-700 dark:text-slate-300'>
                      <div className='flex items-start gap-1.5'>
                        <ShieldCheck className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600 dark:text-emerald-400' />
                        <span>{item.rencana_pengendalian}</span>
                      </div>
                    </td>

                    {/* PIC & Status */}
                    <td className='px-4 py-4'>
                      <div className='text-[11px] font-medium text-slate-900 dark:text-slate-100'>
                        {item.pic_pengendali}
                      </div>
                      <div className='mt-2'>
                        {getStatusBadge(item.status_pengendalian)}
                      </div>
                    </td>

                    {/* Aksi */}
                    <td className='px-3 py-4 text-center'>
                      <div className='flex items-center justify-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleOpenEdit(item)}
                          className='h-7 w-7 p-0 text-slate-500 hover:text-blue-600'
                          title='Ubah Butir'
                        >
                          <Edit3 className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() =>
                            handleDelete(item.id, item.proses_bisnis)
                          }
                          className='h-7 w-7 p-0 text-slate-500 hover:text-rose-600'
                          title='Hapus Butir'
                        >
                          <Trash2 className='h-3.5 w-3.5' />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 4. MODAL DIALOG: TAMBAH / UBAH BUTIR MITIGASI RISIKO */}
      {/* ============================================================================== */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='max-h-[90vh] max-w-2xl overflow-y-auto'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2 text-lg font-bold'>
              <ShieldAlert className='h-5 w-5 text-amber-600' />
              {editingItem
                ? 'Ubah Butir Mitigasi Risiko SPIP'
                : 'Tambah Butir Mitigasi Risiko SPIP Baru'}
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Identifikasi potensi titik rawan integritas, benturan kepentingan,
              atau fraud beserta aksi pengendalian intern terukur di BPS
              Kabupaten Kepulauan Sitaro.
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-2 text-xs'>
            {/* Proses Bisnis */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-slate-700 dark:text-slate-300'>
                Proses Bisnis / Area Pelaksanaan *
              </label>
              <Input
                placeholder='Contoh: Pelayanan Statistik Terpadu (PST)'
                value={formData.proses_bisnis || ''}
                onChange={(e) =>
                  setFormData({ ...formData, proses_bisnis: e.target.value })
                }
              />
              <div className='flex flex-wrap gap-1.5 pt-1'>
                <span className='text-[10px] text-slate-400'>
                  Pilihan Cepat:
                </span>
                {COMMON_PROSES_BISNIS.slice(0, 4).map((p) => (
                  <button
                    type='button'
                    key={p}
                    onClick={() =>
                      setFormData({ ...formData, proses_bisnis: p })
                    }
                    className='rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300'
                  >
                    {p.split(' ')[0]} {p.split(' ')[1]}
                  </button>
                ))}
              </div>
            </div>

            {/* Kategori Fraud & Tingkat Risiko */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-slate-700 dark:text-slate-300'>
                  Kategori Kerawanan
                </label>
                <Select
                  value={formData.kategori_fraud || 'Gratifikasi'}
                  onValueChange={(val: any) =>
                    setFormData({ ...formData, kategori_fraud: val })
                  }
                >
                  <SelectTrigger className='text-xs'>
                    <SelectValue placeholder='Pilih Kategori' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='Gratifikasi'>
                      Gratifikasi / Hadiah
                    </SelectItem>
                    <SelectItem value='Pungli'>
                      Pungutan Liar (Pungli)
                    </SelectItem>
                    <SelectItem value='Fraud Keuangan'>
                      Fraud Keuangan / Pengadaan
                    </SelectItem>
                    <SelectItem value='Penyalahgunaan Wewenang'>
                      Penyalahgunaan Wewenang / BMN
                    </SelectItem>
                    <SelectItem value='Kualitas Layanan'>
                      Kualitas Layanan Publik
                    </SelectItem>
                    <SelectItem value='Lainnya'>Lainnya</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-slate-700 dark:text-slate-300'>
                  Tingkat Risiko *
                </label>
                <Select
                  value={formData.tingkat_risiko || 'SEDANG'}
                  onValueChange={(val: TingkatRisiko) =>
                    setFormData({ ...formData, tingkat_risiko: val })
                  }
                >
                  <SelectTrigger className='text-xs'>
                    <SelectValue placeholder='Pilih Tingkat' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TINGGI'>TINGGI (Merah)</SelectItem>
                    <SelectItem value='SEDANG'>
                      SEDANG (Kuning/Amber)
                    </SelectItem>
                    <SelectItem value='RENDAH'>RENDAH (Hijau)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Potensi Titik Rawan */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-slate-700 dark:text-slate-300'>
                Potensi Titik Rawan Risiko / Fraud *
              </label>
              <Textarea
                placeholder='Uraikan celah atau skenario potensi penyimpangan...'
                rows={3}
                value={formData.potensi_risiko || ''}
                onChange={(e) =>
                  setFormData({ ...formData, potensi_risiko: e.target.value })
                }
                className='text-xs'
              />
            </div>

            {/* Dampak Risiko */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-slate-700 dark:text-slate-300'>
                Dampak Risiko terhadap Instansi / Layanan *
              </label>
              <Textarea
                placeholder='Contoh: Kerugian keuangan, penurunan skor IPAK, komplain publik...'
                rows={2}
                value={formData.dampak_risiko || ''}
                onChange={(e) =>
                  setFormData({ ...formData, dampak_risiko: e.target.value })
                }
                className='text-xs'
              />
            </div>

            {/* Rencana Pengendalian Intern */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-slate-700 dark:text-slate-300'>
                Rencana Aksi Pengendalian Intern (Mitigasi) *
              </label>
              <Textarea
                placeholder='Langkah konkret pencegahan: SOP, digitalisasi sistem, audit internal, pakta integritas...'
                rows={3}
                value={formData.rencana_pengendalian || ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    rencana_pengendalian: e.target.value
                  })
                }
                className='text-xs'
              />
            </div>

            {/* PIC & Status Pengendalian */}
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='font-semibold text-slate-700 dark:text-slate-300'>
                  PIC / Penanggung Jawab Pengendali *
                </label>
                <Input
                  placeholder='Contoh: PPK & Tim PBJ / Kasubbag Umum'
                  value={formData.pic_pengendali || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, pic_pengendali: e.target.value })
                  }
                />
              </div>

              <div className='space-y-1.5'>
                <label className='font-semibold text-slate-700 dark:text-slate-300'>
                  Status Pengendalian
                </label>
                <Select
                  value={formData.status_pengendalian || 'TERKENDALI'}
                  onValueChange={(val: StatusPengendalian) =>
                    setFormData({ ...formData, status_pengendalian: val })
                  }
                >
                  <SelectTrigger className='text-xs'>
                    <SelectValue placeholder='Pilih Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='TERKENDALI'>Terkendali</SelectItem>
                    <SelectItem value='DALAM_PROSES'>Dalam Proses</SelectItem>
                    <SelectItem value='MONITORING_BERKALA'>
                      Monitoring Berkala
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bukti Dukung URL */}
            <div className='space-y-1.5'>
              <label className='font-semibold text-slate-700 dark:text-slate-300'>
                Tautan Bukti Dukung / Regulasi / SOP (Opsional)
              </label>
              <Input
                placeholder='https://...'
                value={formData.bukti_dukung_url || ''}
                onChange={(e) =>
                  setFormData({ ...formData, bukti_dukung_url: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsModalOpen(false)}
              className='text-xs'
            >
              Batal
            </Button>
            <Button
              onClick={handleSave}
              disabled={isPending}
              className='bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
            >
              {isPending ? 'Menyimpan...' : 'Simpan Butir Mitigasi'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
