'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  HelpCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  FolderTree,
  Sliders,
  Layers,
  Info
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import {
  createPertanyaan,
  updatePertanyaan,
  deletePertanyaan,
  createKategoriPenilaian,
  updateKategoriPenilaian,
  deleteKategoriPenilaian,
  type PertanyaanInput
} from '@/actions/master-data-actions';

interface KategoriItem {
  id_kategori: number;
  id_pertanyaan: number;
  kode_kategori?: string | null;
  uraian_kategori: string;
  nilai: number;
}

interface PertanyaanItem {
  id_pertanyaan: number;
  deskripsi_pertanyaan: string;
  uraian_buktidukung?: string | null;
  id_subpilar: number;
  subpilar?: {
    id_subpilar: number;
    nama_subpilar: string;
    id_pilar: number;
    pilar?: {
      id_pilar: number;
      nama_pilar: string;
    };
  };
  kategoriPenilaian?: KategoriItem[];
}

interface SubpilarOption {
  id_subpilar: number;
  nama_subpilar: string;
  id_pilar: number;
}

interface PilarOption {
  id_pilar: number;
  nama_pilar: string;
}

interface PertanyaanManagerClientProps {
  initialPertanyaans: PertanyaanItem[];
  subpilars: SubpilarOption[];
  pilars: PilarOption[];
  isAdmin: boolean;
  initialFilterSubpilar?: string;
}

export default function PertanyaanManagerClient({
  initialPertanyaans,
  subpilars,
  pilars,
  isAdmin,
  initialFilterSubpilar
}: PertanyaanManagerClientProps) {
  const [items, setItems] = useState<PertanyaanItem[]>(initialPertanyaans);
  const [isPending, startTransition] = useTransition();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterPilar, setFilterPilar] = useState<string>('ALL');
  const [filterSubpilar, setFilterSubpilar] = useState<string>(
    initialFilterSubpilar || 'ALL'
  );
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Dialog Pertanyaan States
  const [dialogPertanyaanOpen, setDialogPertanyaanOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [activePertanyaan, setActivePertanyaan] =
    useState<PertanyaanItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form Pertanyaan Fields
  const [formIdPertanyaan, setFormIdPertanyaan] = useState('');
  const [formDeskripsi, setFormDeskripsi] = useState('');
  const [formBuktiDukung, setFormBuktiDukung] = useState('');
  const [formSubpilar, setFormSubpilar] = useState<string>(
    subpilars[0] ? String(subpilars[0].id_subpilar) : '1'
  );

  // Dialog Kategori / Bobot Opsi States
  const [kategoriDialogOpen, setKategoriDialogOpen] = useState(false);
  const [kategoriTargetPertanyaan, setKategoriTargetPertanyaan] =
    useState<PertanyaanItem | null>(null);
  const [newKatKode, setNewKatKode] = useState('');
  const [newKatUraian, setNewKatUraian] = useState('');
  const [newKatNilai, setNewKatNilai] = useState('1.0');
  const [editingKatId, setEditingKatId] = useState<number | null>(null);

  // Subpilar options filtered by selected pilar
  const availableSubpilars =
    filterPilar === 'ALL'
      ? subpilars
      : subpilars.filter((s) => String(s.id_pilar) === filterPilar);

  // Filtered and Paginated
  const filtered = items.filter((item) => {
    const matchSearch =
      String(item.id_pertanyaan).includes(search) ||
      item.deskripsi_pertanyaan.toLowerCase().includes(search.toLowerCase()) ||
      (item.uraian_buktidukung &&
        item.uraian_buktidukung.toLowerCase().includes(search.toLowerCase()));

    const matchPilar =
      filterPilar === 'ALL' || String(item.subpilar?.id_pilar) === filterPilar;

    const matchSubpilar =
      filterSubpilar === 'ALL' || String(item.id_subpilar) === filterSubpilar;

    return matchSearch && matchPilar && matchSubpilar;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // ----------------------------------------------------------------------------
  // Pertanyaan CRUD Handlers
  // ----------------------------------------------------------------------------

  const openCreateModal = () => {
    setDialogMode('create');
    setActivePertanyaan(null);
    const nextId =
      items.length > 0
        ? Math.max(...items.map((q) => Number(q.id_pertanyaan) || 0)) + 1
        : 1;
    setFormIdPertanyaan(String(nextId));
    setFormDeskripsi('');
    setFormBuktiDukung('');
    setFormSubpilar(
      filterSubpilar !== 'ALL'
        ? filterSubpilar
        : subpilars[0]
          ? String(subpilars[0].id_subpilar)
          : '1'
    );
    setDialogPertanyaanOpen(true);
  };

  const openEditModal = (item: PertanyaanItem) => {
    setDialogMode('edit');
    setActivePertanyaan(item);
    setFormIdPertanyaan(String(item.id_pertanyaan));
    setFormDeskripsi(item.deskripsi_pertanyaan);
    setFormBuktiDukung(item.uraian_buktidukung || '');
    setFormSubpilar(String(item.id_subpilar));
    setDialogPertanyaanOpen(true);
  };

  const handlePertanyaanSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedDeskripsi = formDeskripsi.trim();
    if (!trimmedDeskripsi || trimmedDeskripsi.length < 5) {
      toast.error('Deskripsi pertanyaan minimal 5 karakter.');
      return;
    }

    startTransition(async () => {
      if (dialogMode === 'create') {
        const idNum = parseInt(formIdPertanyaan, 10);
        if (isNaN(idNum) || idNum <= 0) {
          toast.error('ID pertanyaan harus berupa angka positif.');
          return;
        }

        const payload: PertanyaanInput = {
          id_pertanyaan: idNum,
          deskripsi_pertanyaan: trimmedDeskripsi,
          uraian_buktidukung: formBuktiDukung.trim() || undefined,
          id_subpilar: Number(formSubpilar)
        };

        const res = await createPertanyaan(payload);
        if (res.success && res.data) {
          toast.success(
            `Pertanyaan #${res.data.id_pertanyaan} berhasil ditambahkan!`
          );
          const matchedSp = subpilars.find(
            (s) => s.id_subpilar === Number(formSubpilar)
          );
          const matchedP = matchedSp
            ? pilars.find((p) => p.id_pilar === matchedSp.id_pilar)
            : undefined;

          const newItem: PertanyaanItem = {
            id_pertanyaan: Number(res.data.id_pertanyaan),
            deskripsi_pertanyaan:
              res.data.deskripsi_pertanyaan || trimmedDeskripsi,
            uraian_buktidukung:
              res.data.uraian_buktidukung || formBuktiDukung.trim() || null,
            id_subpilar: Number(formSubpilar),
            subpilar: matchedSp
              ? {
                  id_subpilar: matchedSp.id_subpilar,
                  nama_subpilar: matchedSp.nama_subpilar,
                  id_pilar: matchedSp.id_pilar,
                  pilar: matchedP
                    ? {
                        id_pilar: matchedP.id_pilar,
                        nama_pilar: matchedP.nama_pilar
                      }
                    : undefined
                }
              : undefined,
            kategoriPenilaian: []
          };

          setItems((prev) => [newItem, ...prev]);
          setDialogPertanyaanOpen(false);
        } else {
          toast.error(res.error || 'Gagal membuat pertanyaan baru.');
        }
      } else if (dialogMode === 'edit' && activePertanyaan) {
        const payload = {
          deskripsi_pertanyaan: trimmedDeskripsi,
          uraian_buktidukung: formBuktiDukung.trim() || null,
          id_subpilar: Number(formSubpilar)
        };

        const res = await updatePertanyaan(
          activePertanyaan.id_pertanyaan,
          payload
        );
        if (res.success && res.data) {
          toast.success(
            `Pertanyaan #${activePertanyaan.id_pertanyaan} berhasil diperbarui!`
          );
          const matchedSp = subpilars.find(
            (s) => s.id_subpilar === Number(formSubpilar)
          );
          const matchedP = matchedSp
            ? pilars.find((p) => p.id_pilar === matchedSp.id_pilar)
            : undefined;

          setItems((prev) =>
            prev.map((item) =>
              item.id_pertanyaan === activePertanyaan.id_pertanyaan
                ? {
                    ...item,
                    deskripsi_pertanyaan:
                      res.data.deskripsi_pertanyaan || trimmedDeskripsi,
                    uraian_buktidukung:
                      res.data.uraian_buktidukung ||
                      formBuktiDukung.trim() ||
                      null,
                    id_subpilar: Number(formSubpilar),
                    subpilar: matchedSp
                      ? {
                          id_subpilar: matchedSp.id_subpilar,
                          nama_subpilar: matchedSp.nama_subpilar,
                          id_pilar: matchedSp.id_pilar,
                          pilar: matchedP
                            ? {
                                id_pilar: matchedP.id_pilar,
                                nama_pilar: matchedP.nama_pilar
                              }
                            : item.subpilar?.pilar
                        }
                      : item.subpilar
                  }
                : item
            )
          );
          setDialogPertanyaanOpen(false);
        } else {
          toast.error(res.error || 'Gagal memperbarui pertanyaan.');
        }
      }
    });
  };

  const handleDeletePertanyaan = () => {
    if (!deleteTargetId) return;
    startTransition(async () => {
      const res = await deletePertanyaan(deleteTargetId);
      if (res.success) {
        toast.success(`Pertanyaan #${deleteTargetId} berhasil dihapus.`);
        setItems((prev) =>
          prev.filter((q) => q.id_pertanyaan !== deleteTargetId)
        );
        setDeleteTargetId(null);
      } else {
        toast.error(res.error || 'Gagal menghapus pertanyaan.');
      }
    });
  };

  // ----------------------------------------------------------------------------
  // Kategori Penilaian / Bobot Opsi Handlers
  // ----------------------------------------------------------------------------

  const openKategoriModal = (item: PertanyaanItem) => {
    setKategoriTargetPertanyaan(item);
    setNewKatKode('');
    setNewKatUraian('');
    setNewKatNilai('1.0');
    setEditingKatId(null);
    setKategoriDialogOpen(true);
  };

  const handleAddOrUpdateKategori = (e: React.FormEvent) => {
    e.preventDefault();
    if (!kategoriTargetPertanyaan) return;

    const trimmedUraian = newKatUraian.trim();
    if (!trimmedUraian || trimmedUraian.length < 2) {
      toast.error('Uraian opsi jawaban minimal 2 karakter.');
      return;
    }
    const parsedNilai = parseFloat(newKatNilai);
    if (isNaN(parsedNilai) || parsedNilai < 0 || parsedNilai > 100) {
      toast.error('Nilai bobot harus antara 0 sampai 100.');
      return;
    }

    startTransition(async () => {
      if (editingKatId) {
        // Update kategori
        const res = await updateKategoriPenilaian(editingKatId, {
          uraian_kategori: trimmedUraian,
          nilai: parsedNilai,
          kode_kategori: newKatKode.trim() || null
        });

        if (res.success && res.data) {
          toast.success('Opsi jawaban berhasil diperbarui!');
          const updatedKats = (
            kategoriTargetPertanyaan.kategoriPenilaian || []
          ).map((k) =>
            k.id_kategori === editingKatId
              ? {
                  id_kategori: Number(res.data.id_kategori),
                  id_pertanyaan: Number(res.data.id_pertanyaan),
                  kode_kategori: res.data.kode_kategori || null,
                  uraian_kategori: res.data.uraian_kategori,
                  nilai: Number(res.data.nilai)
                }
              : k
          );
          updateTargetKategoriList(
            kategoriTargetPertanyaan.id_pertanyaan,
            updatedKats
          );
          setEditingKatId(null);
          setNewKatKode('');
          setNewKatUraian('');
          setNewKatNilai('1.0');
        } else {
          toast.error(res.error || 'Gagal memperbarui opsi jawaban.');
        }
      } else {
        // Create kategori
        const res = await createKategoriPenilaian({
          id_pertanyaan: kategoriTargetPertanyaan.id_pertanyaan,
          kode_kategori: newKatKode.trim() || null,
          uraian_kategori: trimmedUraian,
          nilai: parsedNilai
        });

        if (res.success && res.data) {
          toast.success('Opsi jawaban baru berhasil ditambahkan!');
          const newKatItem: KategoriItem = {
            id_kategori: Number(res.data.id_kategori),
            id_pertanyaan: Number(res.data.id_pertanyaan),
            kode_kategori: res.data.kode_kategori || null,
            uraian_kategori: res.data.uraian_kategori,
            nilai: Number(res.data.nilai)
          };
          const updatedKats = [
            ...(kategoriTargetPertanyaan.kategoriPenilaian || []),
            newKatItem
          ];
          updateTargetKategoriList(
            kategoriTargetPertanyaan.id_pertanyaan,
            updatedKats
          );
          setNewKatKode('');
          setNewKatUraian('');
          setNewKatNilai('1.0');
        } else {
          toast.error(res.error || 'Gagal menambahkan opsi jawaban.');
        }
      }
    });
  };

  const handleDeleteKategori = (idKategori: number) => {
    if (!kategoriTargetPertanyaan) return;
    startTransition(async () => {
      const res = await deleteKategoriPenilaian(idKategori);
      if (res.success) {
        toast.success('Opsi jawaban dihapus.');
        const updatedKats = (
          kategoriTargetPertanyaan.kategoriPenilaian || []
        ).filter((k) => k.id_kategori !== idKategori);
        updateTargetKategoriList(
          kategoriTargetPertanyaan.id_pertanyaan,
          updatedKats
        );
      } else {
        toast.error(res.error || 'Gagal menghapus opsi jawaban.');
      }
    });
  };

  const updateTargetKategoriList = (
    idPertanyaan: number,
    newKats: KategoriItem[]
  ) => {
    setKategoriTargetPertanyaan((prev) =>
      prev ? { ...prev, kategoriPenilaian: newKats } : null
    );
    setItems((prev) =>
      prev.map((item) =>
        item.id_pertanyaan === idPertanyaan
          ? { ...item, kategoriPenilaian: newKats }
          : item
      )
    );
  };

  return (
    <PageContainer scrollable>
      <div className='space-y-6 pb-12'>
        {/* Header Section */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                <HelpCircle className='h-6 w-6' />
              </div>
              <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
                Master Data: Pertanyaan &amp; Indikator LKE
              </h1>
            </div>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Instrumen pertanyaan evaluasi, bobot nilai, dan opsi pilihan
              jawaban PMPRB
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href='/rebo/dataRB/pilar'>
                <Layers className='mr-1.5 h-4 w-4' />
                Pilar
              </Link>
            </Button>

            <Button variant='outline' size='sm' asChild>
              <Link href='/rebo/dataRB/pilar/subpilar'>
                <FolderTree className='mr-1.5 h-4 w-4' />
                Subpilar
              </Link>
            </Button>

            {isAdmin && (
              <Button
                size='sm'
                onClick={openCreateModal}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                <Plus className='mr-1.5 h-4 w-4' />
                Tambah Pertanyaan
              </Button>
            )}
          </div>
        </div>

        {/* Info Banner jika bukan Admin */}
        {!isAdmin && (
          <div className='flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'>
            <ShieldAlert className='h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
            <span>
              <strong>Mode Lihat (Read-Only):</strong> Anda masuk sebagai
              peninjau/operator. Penambahan indikator, perubahan redaksi
              pertanyaan, dan konfigurasi bobot opsi jawaban dikunci khusus
              untuk Super Admin.
            </span>
          </div>
        )}

        {/* Toolbar Filter & Search */}
        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div className='relative w-full lg:w-80'>
            <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              type='text'
              placeholder='Cari nomor atau uraian pertanyaan...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className='pl-8'
            />
          </div>

          <div className='flex flex-wrap items-center gap-2'>
            <div className='flex items-center gap-1.5'>
              <Filter className='text-muted-foreground h-3.5 w-3.5' />
              <Select
                value={filterPilar}
                onValueChange={(val) => {
                  setFilterPilar(val);
                  setFilterSubpilar('ALL');
                  setPage(1);
                }}
              >
                <SelectTrigger className='h-9 w-[180px] text-xs'>
                  <SelectValue placeholder='Pilar...' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Pilar</SelectItem>
                  {pilars.map((p) => (
                    <SelectItem key={p.id_pilar} value={String(p.id_pilar)}>
                      Pilar {p.id_pilar}: {p.nama_pilar}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select
              value={filterSubpilar}
              onValueChange={(val) => {
                setFilterSubpilar(val);
                setPage(1);
              }}
            >
              <SelectTrigger className='h-9 w-[230px] text-xs'>
                <SelectValue placeholder='Subpilar...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Semua Subpilar</SelectItem>
                {availableSubpilars.map((s) => (
                  <SelectItem key={s.id_subpilar} value={String(s.id_subpilar)}>
                    SP {s.id_subpilar}: {s.nama_subpilar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* List Pertanyaan Items */}
        <div className='space-y-3'>
          {paginated.length === 0 ? (
            <div className='text-muted-foreground rounded-lg border-2 border-dashed p-10 text-center text-xs'>
              Tidak ditemukan pertanyaan evaluasi yang cocok dengan pencarian
              atau filter.
            </div>
          ) : (
            paginated.map((q) => {
              const kats = q.kategoriPenilaian || [];
              const maxScore =
                kats.length > 0
                  ? Math.max(...kats.map((k) => Number(k.nilai) || 0))
                  : 0;

              return (
                <Card
                  key={q.id_pertanyaan}
                  className='border-gray-200 transition-all hover:border-blue-300 dark:border-gray-800'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex flex-col gap-2 md:flex-row md:items-start md:justify-between'>
                      <div className='flex-1 space-y-1.5'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='border-blue-300 bg-blue-50 font-mono text-xs font-bold text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                          >
                            #{q.id_pertanyaan}
                          </Badge>
                          {q.subpilar?.pilar && (
                            <Badge variant='secondary' className='text-[10px]'>
                              {q.subpilar.pilar.nama_pilar}
                            </Badge>
                          )}
                          {q.subpilar && (
                            <Badge variant='outline' className='text-[10px]'>
                              Subpilar: {q.subpilar.nama_subpilar}
                            </Badge>
                          )}
                        </div>

                        <CardTitle className='text-base leading-snug font-semibold text-gray-900 dark:text-gray-100'>
                          {q.deskripsi_pertanyaan}
                        </CardTitle>

                        {q.uraian_buktidukung && (
                          <div className='mt-2.5 rounded-md border border-amber-200/70 bg-amber-50/60 p-2.5 text-xs text-amber-950 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'>
                            <span className='mb-1 block text-[11px] font-semibold text-amber-800 dark:text-amber-400'>
                              Panduan Bukti Dukung:
                            </span>
                            <p className='text-xs leading-relaxed whitespace-pre-line'>
                              {q.uraian_buktidukung}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Right Action buttons */}
                      <div className='flex shrink-0 items-center gap-1.5 self-end md:self-start'>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => openKategoriModal(q)}
                          className='h-8 gap-1 border-purple-200 bg-purple-50 text-xs text-purple-700 hover:bg-purple-100 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
                          title='Kelola bobot opsi jawaban'
                        >
                          <Sliders className='h-3.5 w-3.5' />
                          Opsi ({kats.length})
                        </Button>

                        {isAdmin && (
                          <>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => openEditModal(q)}
                              className='h-8 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                            >
                              <Edit className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              onClick={() => setDeleteTargetId(q.id_pertanyaan)}
                              className='h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>

                  {/* Opsi Jawaban Preview Chips */}
                  <CardContent className='pt-0 pb-3'>
                    <div className='flex flex-wrap items-center gap-1.5 border-t border-gray-100 pt-2 dark:border-gray-800'>
                      <span className='text-muted-foreground mr-1 text-[11px] font-medium'>
                        Pilihan Jawaban &amp; Bobot:
                      </span>
                      {kats.length === 0 ? (
                        <span className='text-[11px] text-amber-600 italic dark:text-amber-400'>
                          Belum ada opsi jawaban. Klik &quot;Opsi&quot; untuk
                          menambah.
                        </span>
                      ) : (
                        kats.map((kat) => (
                          <span
                            key={kat.id_kategori}
                            className='inline-flex items-center gap-1 rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                          >
                            {kat.kode_kategori && (
                              <span className='font-mono font-bold text-purple-700 dark:text-purple-300'>
                                [{kat.kode_kategori}]
                              </span>
                            )}
                            <span
                              className='max-w-[180px] truncate'
                              title={kat.uraian_kategori}
                            >
                              {kat.uraian_kategori}
                            </span>
                            <span className='py-0.2 rounded bg-blue-100 px-1 text-[10px] font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                              {kat.nilai}
                            </span>
                          </span>
                        ))
                      )}
                      {kats.length > 0 && (
                        <span className='ml-auto text-[11px] font-semibold text-emerald-600 dark:text-emerald-400'>
                          Skor Maks: {maxScore}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className='text-muted-foreground flex items-center justify-between border-t pt-4 text-xs'>
            <div>
              Menampilkan {paginated.length} dari {filtered.length} pertanyaan
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Sebelumnya
              </Button>
              <span>
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Berikutnya
              </Button>
            </div>
          </div>
        )}

        {/* Dialog Form Tambah / Edit Pertanyaan */}
        <Dialog
          open={dialogPertanyaanOpen}
          onOpenChange={setDialogPertanyaanOpen}
        >
          <DialogContent className='sm:max-w-lg'>
            <form onSubmit={handlePertanyaanSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === 'create'
                    ? 'Tambah Indikator Pertanyaan Baru'
                    : 'Edit Pertanyaan LKE'}
                </DialogTitle>
                <DialogDescription>
                  Masukkan rincian indikator evaluasi reformasi birokrasi.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='grid grid-cols-3 gap-3'>
                  <div className='space-y-1.5'>
                    <Label htmlFor='idPertanyaan'>ID Pertanyaan</Label>
                    <Input
                      id='idPertanyaan'
                      type='number'
                      min={1}
                      value={formIdPertanyaan}
                      onChange={(e) => setFormIdPertanyaan(e.target.value)}
                      disabled={dialogMode === 'edit'}
                      placeholder='misal: 1'
                      required
                    />
                  </div>

                  <div className='col-span-2 space-y-1.5'>
                    <Label htmlFor='subpilar'>Subpilar Induk</Label>
                    <Select
                      value={formSubpilar}
                      onValueChange={(val) => setFormSubpilar(val)}
                    >
                      <SelectTrigger id='subpilar'>
                        <SelectValue placeholder='Pilih subpilar...' />
                      </SelectTrigger>
                      <SelectContent>
                        {subpilars.map((s) => (
                          <SelectItem
                            key={s.id_subpilar}
                            value={String(s.id_subpilar)}
                          >
                            SP {s.id_subpilar}: {s.nama_subpilar}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='deskripsiPertanyaan'>
                    Deskripsi Pertanyaan / Indikator
                  </Label>
                  <Textarea
                    id='deskripsiPertanyaan'
                    value={formDeskripsi}
                    onChange={(e) => setFormDeskripsi(e.target.value)}
                    placeholder='Tuliskan rumusan lengkap pertanyaan evaluasi LKE...'
                    rows={4}
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='uraianBuktidukung'>
                    Panduan Kebutuhan Bukti Dukung (Opsional)
                  </Label>
                  <Textarea
                    id='uraianBuktidukung'
                    value={formBuktiDukung}
                    onChange={(e) => setFormBuktiDukung(e.target.value)}
                    placeholder='Contoh: (i) Undangan, notula rapat... (ii) Dokumen SK yang disahkan...'
                    rows={3}
                  />
                </div>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogPertanyaanOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  disabled={isPending}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Pertanyaan'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Dialog Kelola Opsi Jawaban & Bobot Nilai (Kategori Penilaian) */}
        <Dialog open={kategoriDialogOpen} onOpenChange={setKategoriDialogOpen}>
          <DialogContent className='sm:max-w-xl'>
            <DialogHeader>
              <div className='flex items-center justify-between pr-4'>
                <DialogTitle className='flex items-center gap-2 text-purple-700 dark:text-purple-300'>
                  <Sliders className='h-5 w-5' />
                  Editor Bobot Dinamis &amp; Opsi Jawaban LKE
                </DialogTitle>
                <Badge className='bg-emerald-600 text-xs font-semibold text-white hover:bg-emerald-600'>
                  Skor Maks:{' '}
                  {(kategoriTargetPertanyaan?.kategoriPenilaian || []).length >
                  0
                    ? Math.max(
                        ...(
                          kategoriTargetPertanyaan?.kategoriPenilaian || []
                        ).map((k) => Number(k.nilai) || 0)
                      )
                    : 0}{' '}
                  Poin
                </Badge>
              </div>
              <DialogDescription>
                Indikator #{kategoriTargetPertanyaan?.id_pertanyaan}:{' '}
                {kategoriTargetPertanyaan?.deskripsi_pertanyaan}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4 py-3'>
              {/* Info Juknis Banner */}
              <div className='flex items-start gap-2 rounded-lg border border-purple-200 bg-purple-50/70 p-2.5 text-xs text-purple-900 dark:border-purple-800 dark:bg-purple-950/30 dark:text-purple-200'>
                <Info className='mt-0.5 h-4 w-4 shrink-0 text-purple-600' />
                <p>
                  <strong>Editor Bobot Dinamis:</strong> Anda dapat menyesuaikan
                  bobot (skor poin) per opsi jawaban secara fleksibel sesuai
                  dengan perubahan Petunjuk Teknis (Juknis) LKE KemenPAN-RB /
                  BPS RI terbaru.
                </p>
              </div>
              {/* List Opsi Saat ini */}
              <div className='space-y-2'>
                <Label className='text-muted-foreground text-xs font-semibold uppercase'>
                  Daftar Opsi Jawaban Terdaftar:
                </Label>
                {!kategoriTargetPertanyaan?.kategoriPenilaian ||
                kategoriTargetPertanyaan.kategoriPenilaian.length === 0 ? (
                  <div className='text-muted-foreground rounded-lg border border-dashed p-4 text-center text-xs'>
                    Belum ada opsi jawaban untuk indikator ini. Tambahkan opsi
                    di bawah.
                  </div>
                ) : (
                  <div className='max-h-56 space-y-2 overflow-y-auto pr-1'>
                    {kategoriTargetPertanyaan.kategoriPenilaian.map((kat) => (
                      <div
                        key={kat.id_kategori}
                        className='flex items-center justify-between gap-3 rounded-lg border bg-gray-50/70 p-2.5 dark:bg-gray-800/40'
                      >
                        <div className='flex flex-1 items-center gap-2'>
                          <Badge className='bg-blue-600 px-2 text-xs font-bold hover:bg-blue-600'>
                            {kat.kode_kategori
                              ? `[${kat.kode_kategori}] ${kat.nilai} Poin`
                              : `${kat.nilai} Poin`}
                          </Badge>
                          <span className='text-xs font-medium text-gray-900 dark:text-gray-100'>
                            {kat.uraian_kategori}
                          </span>
                        </div>

                        {isAdmin && (
                          <div className='flex items-center gap-1'>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='text-muted-foreground h-7 w-7 hover:text-blue-600'
                              onClick={() => {
                                setEditingKatId(kat.id_kategori);
                                setNewKatKode(kat.kode_kategori || '');
                                setNewKatUraian(kat.uraian_kategori);
                                setNewKatNilai(String(kat.nilai));
                              }}
                            >
                              <Edit className='h-3.5 w-3.5' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='text-muted-foreground h-7 w-7 hover:text-rose-600'
                              onClick={() =>
                                handleDeleteKategori(kat.id_kategori)
                              }
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Form Tambah / Edit Opsi */}
              {isAdmin && (
                <form
                  onSubmit={handleAddOrUpdateKategori}
                  className='space-y-3 rounded-lg border border-purple-200 bg-purple-50/50 p-3.5 dark:border-purple-900 dark:bg-purple-950/20'
                >
                  <div className='flex items-center justify-between'>
                    <span className='text-xs font-semibold text-purple-800 dark:text-purple-300'>
                      {editingKatId
                        ? 'Edit Opsi Jawaban'
                        : '+ Tambah Opsi Jawaban Baru'}
                    </span>
                    {editingKatId && (
                      <button
                        type='button'
                        className='text-muted-foreground text-[10px] hover:underline'
                        onClick={() => {
                          setEditingKatId(null);
                          setNewKatKode('');
                          setNewKatUraian('');
                          setNewKatNilai('1.0');
                        }}
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>

                  <div className='grid grid-cols-4 gap-2'>
                    <div className='col-span-1 space-y-1'>
                      <Label htmlFor='katKode' className='text-[11px]'>
                        Kode (Opsional)
                      </Label>
                      <Input
                        id='katKode'
                        value={newKatKode}
                        onChange={(e) => setNewKatKode(e.target.value)}
                        placeholder='misal: A'
                        className='h-8 font-mono text-xs uppercase'
                        maxLength={10}
                      />
                    </div>
                    <div className='col-span-2 space-y-1'>
                      <Label htmlFor='katUraian' className='text-[11px]'>
                        Uraian Jawaban
                      </Label>
                      <Input
                        id='katUraian'
                        value={newKatUraian}
                        onChange={(e) => setNewKatUraian(e.target.value)}
                        placeholder='contoh: Dokumen telah disahkan'
                        className='h-8 text-xs'
                        required
                      />
                    </div>
                    <div className='col-span-1 space-y-1'>
                      <Label htmlFor='katNilai' className='text-[11px]'>
                        Bobot (Skor)
                      </Label>
                      <Input
                        id='katNilai'
                        type='number'
                        step='0.000001'
                        min={0}
                        max={100}
                        value={newKatNilai}
                        onChange={(e) => setNewKatNilai(e.target.value)}
                        className='h-8 text-xs'
                        required
                      />
                    </div>
                  </div>

                  {/* Preset Bobot Buttons */}
                  <div className='flex items-center gap-1.5 pt-0.5'>
                    <span className='text-muted-foreground text-[10px]'>
                      Preset Bobot:
                    </span>
                    {[0, 0.25, 0.5, 0.75, 1.0, 2.0, 5.0].map((preset) => (
                      <button
                        key={preset}
                        type='button'
                        onClick={() => setNewKatNilai(String(preset))}
                        className={`rounded border px-1.5 py-0.5 font-mono text-[10px] transition-colors ${
                          newKatNilai === String(preset)
                            ? 'border-purple-600 bg-purple-600 font-bold text-white'
                            : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>

                  <Button
                    type='submit'
                    disabled={isPending}
                    size='sm'
                    className='h-8 w-full bg-purple-600 text-xs text-white hover:bg-purple-700'
                  >
                    {isPending
                      ? 'Menyimpan...'
                      : editingKatId
                        ? 'Simpan Perubahan Opsi'
                        : 'Tambah Opsi Ini'}
                  </Button>
                </form>
              )}
            </div>

            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setKategoriDialogOpen(false)}
              >
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog Konfirmasi Hapus Pertanyaan */}
        <AlertDialog
          open={deleteTargetId !== null}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-rose-600'>
                Hapus Pertanyaan Evaluasi?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus pertanyaan master #{deleteTargetId}{' '}
                beserta seluruh relasi opsi penilaian dan pengisian bukti dukung
                terkait di setiap periode evaluasi.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeletePertanyaan}
                disabled={isPending}
                className='bg-rose-600 text-white hover:bg-rose-700'
              >
                {isPending ? 'Menghapus...' : 'Ya, Hapus'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageContainer>
  );
}
