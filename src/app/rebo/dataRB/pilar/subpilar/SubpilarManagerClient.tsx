'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  FolderTree,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ShieldAlert,
  ArrowRight,
  HelpCircle,
  Layers
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  createSubpilar,
  updateSubpilar,
  deleteSubpilar,
  type SubpilarInput
} from '@/actions/master-data-actions';

export interface SubpilarItem {
  id_subpilar: number;
  nama_subpilar: string;
  id_pilar: number;
  pilar?: {
    id_pilar: number;
    nama_pilar: string;
  } | null;
}

interface PilarOption {
  id_pilar: number;
  nama_pilar: string;
}

interface SubpilarManagerClientProps {
  initialSubpilars: SubpilarItem[];
  pilars: PilarOption[];
  isAdmin: boolean;
  initialFilterPilar?: string;
}

export default function SubpilarManagerClient({
  initialSubpilars,
  pilars,
  isAdmin,
  initialFilterPilar
}: SubpilarManagerClientProps) {
  const [subpilars, setSubpilars] = useState<SubpilarItem[]>(initialSubpilars);
  const [isPending, startTransition] = useTransition();

  // Search & Filter
  const [search, setSearch] = useState('');
  const [filterPilar, setFilterPilar] = useState<string>(
    initialFilterPilar || 'ALL'
  );
  const [page, setPage] = useState(1);
  const pageSize = 12;

  // Dialog State
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [activeItem, setActiveItem] = useState<SubpilarItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form State
  const [formIdSubpilar, setFormIdSubpilar] = useState<string>('');
  const [formNama, setFormNama] = useState('');
  const [formIdPilar, setFormIdPilar] = useState<string>(
    pilars[0] ? String(pilars[0].id_pilar) : '1'
  );

  // Filtered & Paginated Data
  const filtered = subpilars.filter((item) => {
    const matchSearch =
      item.nama_subpilar?.toLowerCase().includes(search.toLowerCase()) ||
      String(item.id_subpilar).includes(search);

    const matchPilar =
      filterPilar === 'ALL' || String(item.id_pilar) === filterPilar;

    return matchSearch && matchPilar;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreateModal = () => {
    setDialogMode('create');
    setActiveItem(null);
    const nextId =
      subpilars.length > 0
        ? Math.max(...subpilars.map((s) => Number(s.id_subpilar) || 0)) + 1
        : 1;
    setFormIdSubpilar(String(nextId));
    setFormNama('');
    setFormIdPilar(
      filterPilar !== 'ALL'
        ? filterPilar
        : pilars[0]
          ? String(pilars[0].id_pilar)
          : '1'
    );
    setDialogOpen(true);
  };

  const openEditModal = (item: SubpilarItem) => {
    setDialogMode('edit');
    setActiveItem(item);
    setFormIdSubpilar(String(item.id_subpilar));
    setFormNama(item.nama_subpilar);
    setFormIdPilar(String(item.id_pilar));
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNama = formNama.trim();
    if (!trimmedNama || trimmedNama.length < 3) {
      toast.error('Nama subpilar minimal 3 karakter.');
      return;
    }

    const payload: SubpilarInput = {
      nama_subpilar: trimmedNama,
      id_pilar: Number(formIdPilar)
    };

    startTransition(async () => {
      if (dialogMode === 'create') {
        const idNum = parseInt(formIdSubpilar, 10);
        if (isNaN(idNum) || idNum <= 0) {
          toast.error('ID Subpilar harus berupa angka positif.');
          return;
        }
        payload.id_subpilar = idNum;

        const res = await createSubpilar(payload);
        if (res.success && res.data) {
          toast.success(
            `Subpilar "${res.data.nama_subpilar}" berhasil ditambahkan!`
          );
          const matchedPilar = pilars.find(
            (p) => p.id_pilar === Number(formIdPilar)
          );
          const newItem: SubpilarItem = {
            id_subpilar: Number(res.data.id_subpilar),
            nama_subpilar: String(res.data.nama_subpilar),
            id_pilar: Number(res.data.id_pilar),
            pilar: matchedPilar
              ? {
                  id_pilar: matchedPilar.id_pilar,
                  nama_pilar: matchedPilar.nama_pilar
                }
              : null
          };
          setSubpilars((prev) => [...prev, newItem]);
          setDialogOpen(false);
        } else {
          toast.error(res.error || 'Gagal membuat subpilar.');
        }
      } else if (dialogMode === 'edit' && activeItem) {
        const res = await updateSubpilar(activeItem.id_subpilar, payload);
        if (res.success && res.data) {
          toast.success(
            `Subpilar "${res.data.nama_subpilar}" berhasil diperbarui!`
          );
          const matchedPilar = pilars.find(
            (p) => p.id_pilar === Number(formIdPilar)
          );
          const updatedItem: Partial<SubpilarItem> = {
            id_subpilar: Number(res.data.id_subpilar),
            nama_subpilar: String(res.data.nama_subpilar),
            id_pilar: Number(res.data.id_pilar),
            pilar: matchedPilar
              ? {
                  id_pilar: matchedPilar.id_pilar,
                  nama_pilar: matchedPilar.nama_pilar
                }
              : activeItem.pilar
          };
          setSubpilars((prev) =>
            prev.map((s) =>
              s.id_subpilar === activeItem.id_subpilar
                ? {
                    ...s,
                    ...updatedItem
                  }
                : s
            )
          );
          setDialogOpen(false);
        } else {
          toast.error(res.error || 'Gagal memperbarui subpilar.');
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    startTransition(async () => {
      const res = await deleteSubpilar(deleteTargetId);
      if (res.success) {
        toast.success('Subpilar berhasil dihapus.');
        setSubpilars((prev) =>
          prev.filter((s) => s.id_subpilar !== deleteTargetId)
        );
        setDeleteTargetId(null);
      } else {
        toast.error(res.error || 'Gagal menghapus subpilar.');
      }
    });
  };

  return (
    <PageContainer scrollable>
      <div className='space-y-6 pb-12'>
        {/* Header Section */}
        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
          <div>
            <div className='flex items-center gap-3'>
              <div className='rounded-lg bg-blue-100 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                <FolderTree className='h-6 w-6' />
              </div>
              <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
                Master Data: Subpilar LKE
              </h1>
            </div>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Pengelompokan indikator per sub-komponen penilaian reformasi
              birokrasi
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href='/rebo/dataRB/pilar'>
                <Layers className='mr-1.5 h-4 w-4' />
                Kembali ke Pilar
              </Link>
            </Button>

            <Button variant='outline' size='sm' asChild>
              <Link href='/rebo/dataRB/pilar/pertanyaan'>
                <HelpCircle className='mr-1.5 h-4 w-4' />
                Kelola Pertanyaan
              </Link>
            </Button>

            {isAdmin && (
              <Button
                size='sm'
                onClick={openCreateModal}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                <Plus className='mr-1.5 h-4 w-4' />
                Tambah Subpilar
              </Button>
            )}
          </div>
        </div>

        {/* Info Banner jika bukan Admin */}
        {!isAdmin && (
          <div className='flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'>
            <ShieldAlert className='h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
            <span>
              <strong>Mode Lihat (Read-Only):</strong> Akses mutasi penambahan,
              pengeditan, atau penghapusan master subpilar diproteksi wewenang
              Super Admin.
            </span>
          </div>
        )}

        {/* Toolbar Filter & Search */}
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <div className='relative w-full sm:w-72'>
            <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
            <Input
              type='text'
              placeholder='Cari subpilar...'
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className='pl-8'
            />
          </div>

          <div className='flex items-center gap-2'>
            <Filter className='text-muted-foreground h-4 w-4' />
            <Select
              value={filterPilar}
              onValueChange={(val) => {
                setFilterPilar(val);
                setPage(1);
              }}
            >
              <SelectTrigger className='w-[240px] text-xs'>
                <SelectValue placeholder='Filter berdasarkan Pilar...' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='ALL'>Semua Pilar (Semua Area)</SelectItem>
                {pilars.map((p) => (
                  <SelectItem key={p.id_pilar} value={String(p.id_pilar)}>
                    Pilar {p.id_pilar}: {p.nama_pilar}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Grid Card Subpilar */}
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {paginated.length === 0 ? (
            <div className='text-muted-foreground col-span-full rounded-lg border-2 border-dashed p-8 text-center text-xs'>
              Tidak ditemukan subpilar yang sesuai dengan pencarian atau filter.
            </div>
          ) : (
            paginated.map((item) => (
              <Card
                key={item.id_subpilar}
                className='flex flex-col justify-between border-gray-200 transition-all hover:border-blue-300 hover:shadow-xs dark:border-gray-800'
              >
                <CardHeader className='pb-3'>
                  <div className='flex items-start justify-between gap-2'>
                    <div className='flex items-center gap-2'>
                      <Badge variant='secondary' className='font-mono text-xs'>
                        ID: {item.id_subpilar}
                      </Badge>
                      <Badge
                        variant='outline'
                        className='border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      >
                        Pilar {item.id_pilar}
                      </Badge>
                    </div>
                  </div>

                  <CardTitle className='mt-2 text-base font-semibold text-gray-900 dark:text-gray-100'>
                    {item.nama_subpilar}
                  </CardTitle>

                  <p className='text-xs font-medium text-blue-600 dark:text-blue-400'>
                    {item.pilar?.nama_pilar || `Pilar ${item.id_pilar}`}
                  </p>
                </CardHeader>

                <div className='flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900/40'>
                  <Button
                    variant='ghost'
                    size='sm'
                    asChild
                    className='text-muted-foreground h-9 min-h-[36px] touch-manipulation text-xs hover:text-blue-600 sm:h-8 sm:min-h-[32px] dark:text-slate-300 dark:hover:text-blue-400'
                  >
                    <Link
                      href={`/rebo/dataRB/pilar/pertanyaan?subpilar=${item.id_subpilar}`}
                    >
                      Pertanyaan
                      <ArrowRight className='ml-1 h-3.5 w-3.5' />
                    </Link>
                  </Button>

                  {isAdmin && (
                    <div className='flex items-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => openEditModal(item)}
                        className='h-9 min-h-[36px] touch-manipulation px-2.5 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 sm:h-8 sm:min-h-[32px] dark:text-emerald-400 dark:hover:bg-emerald-950/40'
                      >
                        <Edit className='mr-1 h-3.5 w-3.5' />
                        Edit
                      </Button>
                      <Button
                        variant='ghost'
                        size='icon'
                        onClick={() => setDeleteTargetId(item.id_subpilar)}
                        className='h-9 min-h-[36px] w-9 min-w-[36px] touch-manipulation text-rose-500 hover:bg-rose-50 hover:text-rose-700 sm:h-8 sm:min-h-[32px] sm:w-8 sm:min-w-[32px] dark:text-rose-400 dark:hover:bg-rose-950/40'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className='text-muted-foreground flex items-center justify-between border-t pt-4 text-xs'>
            <div>
              Menampilkan {paginated.length} dari {filtered.length} subpilar
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

        {/* Dialog Form Tambah / Edit Subpilar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === 'create'
                    ? 'Tambah Subpilar Baru'
                    : 'Edit Subpilar'}
                </DialogTitle>
                <DialogDescription>
                  Lengkapi form berikut untuk mengelola sub-komponen penilaian.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='pilar'>Pilar Induk</Label>
                  <Select
                    value={formIdPilar}
                    onValueChange={(val) => setFormIdPilar(val)}
                  >
                    <SelectTrigger id='pilar'>
                      <SelectValue placeholder='Pilih pilar induk...' />
                    </SelectTrigger>
                    <SelectContent>
                      {pilars.map((p) => (
                        <SelectItem key={p.id_pilar} value={String(p.id_pilar)}>
                          Pilar {p.id_pilar}: {p.nama_pilar}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='grid grid-cols-4 gap-3'>
                  <div className='col-span-1 space-y-1.5'>
                    <Label htmlFor='idSubpilar'>ID</Label>
                    <Input
                      id='idSubpilar'
                      type='number'
                      min={1}
                      value={formIdSubpilar}
                      onChange={(e) => setFormIdSubpilar(e.target.value)}
                      disabled={dialogMode === 'edit'}
                      required
                    />
                  </div>
                  <div className='col-span-3 space-y-1.5'>
                    <Label htmlFor='namaSubpilar'>Nama Subpilar</Label>
                    <Input
                      id='namaSubpilar'
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      placeholder='misal: Tim Kerja'
                      required
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setDialogOpen(false)}
                  disabled={isPending}
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  disabled={isPending}
                  className='bg-blue-600 text-white hover:bg-blue-700'
                >
                  {isPending ? 'Menyimpan...' : 'Simpan Subpilar'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Alert Dialog Konfirmasi Hapus */}
        <AlertDialog
          open={deleteTargetId !== null}
          onOpenChange={(open) => !open && setDeleteTargetId(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className='text-rose-600'>
                Hapus Subpilar?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus subpilar master. Pastikan subpilar
                ini tidak lagi memiliki indikator pertanyaan di dalamnya. Jika
                masih terdapat pertanyaan, sistem akan menolak penghapusan untuk
                melindungi data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isPending}>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
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
