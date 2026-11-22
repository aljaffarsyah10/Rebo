'use client';

import React, { useState, useTransition } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  ShieldAlert,
  ArrowRight,
  FolderTree
} from 'lucide-react';
import PageContainer from '@/components/layout/page-container';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  createPilar,
  updatePilar,
  deletePilar,
  type PilarInput
} from '@/actions/master-data-actions';

export interface PilarItem {
  id_pilar: number;
  nama_pilar: string;
  id_area: number;
  area?: {
    id_area: number;
    nama_area: string;
  } | null;
}

interface PilarManagerClientProps {
  initialPilars: PilarItem[];
  isAdmin: boolean;
}

export default function PilarManagerClient({
  initialPilars,
  isAdmin
}: PilarManagerClientProps) {
  const [pilars, setPilars] = useState<PilarItem[]>(initialPilars);
  const [isPending, startTransition] = useTransition();

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [activeItem, setActiveItem] = useState<PilarItem | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  // Form state
  const [formIdPilar, setFormIdPilar] = useState<string>('');
  const [formNama, setFormNama] = useState('');
  const [formArea, setFormArea] = useState<number>(1);

  const pilarsArea1 = pilars.filter((p) => Number(p.id_area) === 1);
  const pilarsArea2 = pilars.filter((p) => Number(p.id_area) === 2);

  const openCreateModal = () => {
    setDialogMode('create');
    setActiveItem(null);
    const nextId =
      pilars.length > 0
        ? Math.max(...pilars.map((p) => Number(p.id_pilar) || 0)) + 1
        : 1;
    setFormIdPilar(String(nextId));
    setFormNama('');
    setFormArea(1);
    setDialogOpen(true);
  };

  const openEditModal = (p: PilarItem) => {
    setDialogMode('edit');
    setActiveItem(p);
    setFormIdPilar(String(p.id_pilar));
    setFormNama(p.nama_pilar);
    setFormArea(Number(p.id_area) || 1);
    setDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedNama = formNama.trim();
    if (!trimmedNama || trimmedNama.length < 3) {
      toast.error('Nama pilar minimal 3 karakter.');
      return;
    }

    const payload: PilarInput = {
      nama_pilar: trimmedNama,
      id_area: formArea
    };

    startTransition(async () => {
      if (dialogMode === 'create') {
        const idNum = parseInt(formIdPilar, 10);
        if (isNaN(idNum) || idNum <= 0) {
          toast.error('ID Pilar harus berupa angka positif.');
          return;
        }
        payload.id_pilar = idNum;

        const res = await createPilar(payload);
        if (res.success && res.data) {
          toast.success(`Pilar "${res.data.nama_pilar}" berhasil ditambahkan!`);
          const newItem: PilarItem = {
            id_pilar: Number(res.data.id_pilar),
            nama_pilar: String(res.data.nama_pilar),
            id_area: Number(res.data.id_area),
            area: (res.data as any).area
              ? Array.isArray((res.data as any).area)
                ? (res.data as any).area[0]
                : (res.data as any).area
              : null
          };
          setPilars((prev) => [...prev, newItem]);
          setDialogOpen(false);
        } else {
          toast.error(res.error || 'Gagal menambahkan pilar.');
        }
      } else if (dialogMode === 'edit' && activeItem) {
        const res = await updatePilar(activeItem.id_pilar, payload);
        if (res.success && res.data) {
          toast.success(`Pilar "${res.data.nama_pilar}" berhasil diperbarui!`);
          const updatedItem: Partial<PilarItem> = {
            id_pilar: Number(res.data.id_pilar),
            nama_pilar: String(res.data.nama_pilar),
            id_area: Number(res.data.id_area),
            area: (res.data as any).area
              ? Array.isArray((res.data as any).area)
                ? (res.data as any).area[0]
                : (res.data as any).area
              : null
          };
          setPilars((prev) =>
            prev.map((item) =>
              item.id_pilar === activeItem.id_pilar
                ? { ...item, ...updatedItem }
                : item
            )
          );
          setDialogOpen(false);
        } else {
          toast.error(res.error || 'Gagal memperbarui pilar.');
        }
      }
    });
  };

  const handleDelete = () => {
    if (!deleteTargetId) return;
    startTransition(async () => {
      const res = await deletePilar(deleteTargetId);
      if (res.success) {
        toast.success('Pilar berhasil dihapus.');
        setPilars((prev) => prev.filter((p) => p.id_pilar !== deleteTargetId));
        setDeleteTargetId(null);
      } else {
        toast.error(res.error || 'Gagal menghapus pilar.');
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
                <Layers className='h-6 w-6' />
              </div>
              <h1 className='text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100'>
                Master Data: Pilar Reformasi Birokrasi
              </h1>
            </div>
            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
              Pengelolaan 6 pilar pengungkit Zona Integritas (Area Pemenuhan
              &amp; Area Reform)
            </p>
          </div>

          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' asChild>
              <Link href='/rebo/dataRB/pilar/subpilar'>
                <FolderTree className='mr-1.5 h-4 w-4' />
                Kelola Subpilar
              </Link>
            </Button>

            {isAdmin && (
              <Button
                size='sm'
                onClick={openCreateModal}
                className='bg-blue-600 text-white hover:bg-blue-700'
              >
                <Plus className='mr-1.5 h-4 w-4' />
                Tambah Pilar
              </Button>
            )}
          </div>
        </div>

        {/* Info Banner jika bukan Admin */}
        {!isAdmin && (
          <div className='flex items-center gap-2.5 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-300'>
            <ShieldAlert className='h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
            <span>
              <strong>Mode Lihat (Read-Only):</strong> Anda masuk bukan sebagai
              Super Admin. Penambahan, pengeditan, atau penghapusan master data
              pilar hanya dapat dilakukan oleh Super Admin.
            </span>
          </div>
        )}

        {/* Section Area 1 */}
        <div className='space-y-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white'>
              1
            </div>
            <h2 className='text-lg font-bold text-gray-800 dark:text-gray-200'>
              Area 1 — Pemenuhan (Komponen Pengungkit Dasar)
            </h2>
            <div className='h-px flex-1 bg-gradient-to-r from-blue-300 to-transparent dark:from-blue-700' />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {pilarsArea1.length === 0 ? (
              <div className='text-muted-foreground col-span-full rounded-lg border-2 border-dashed p-6 text-center text-xs'>
                Belum ada data pilar untuk Area 1 (Pemenuhan).
              </div>
            ) : (
              pilarsArea1.map((p) => (
                <Card
                  key={p.id_pilar}
                  className='flex flex-col justify-between border-gray-200 transition-all hover:border-blue-300 hover:shadow-xs dark:border-gray-800 dark:hover:border-blue-800'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-2.5'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-950 dark:text-blue-300'>
                          {p.id_pilar}
                        </div>
                        <div>
                          <CardTitle className='text-base font-semibold text-gray-900 dark:text-gray-100'>
                            {p.nama_pilar}
                          </CardTitle>
                          <span className='font-mono text-xs font-medium text-blue-600 dark:text-blue-400'>
                            Pilar {p.id_pilar}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className='border-blue-200 bg-blue-50 text-[10px] text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
                      >
                        Pemenuhan
                      </Badge>
                    </div>
                  </CardHeader>

                  <div className='flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900/40'>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='text-muted-foreground h-8 text-xs hover:text-blue-600'
                    >
                      <Link
                        href={`/rebo/dataRB/pilar/subpilar?pilar=${p.id_pilar}`}
                      >
                        Lihat Subpilar
                        <ArrowRight className='ml-1 h-3.5 w-3.5' />
                      </Link>
                    </Button>

                    {isAdmin && (
                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openEditModal(p)}
                          className='h-8 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                        >
                          <Edit className='mr-1 h-3.5 w-3.5' />
                          Edit
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setDeleteTargetId(p.id_pilar)}
                          className='h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
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
        </div>

        {/* Section Area 2 */}
        <div className='space-y-4 pt-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-7 w-7 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white'>
              2
            </div>
            <h2 className='text-lg font-bold text-gray-800 dark:text-gray-200'>
              Area 2 — Reform (Komponen Hasil &amp; Dampak Pelayanan)
            </h2>
            <div className='h-px flex-1 bg-gradient-to-r from-purple-300 to-transparent dark:from-purple-700' />
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {pilarsArea2.length === 0 ? (
              <div className='text-muted-foreground col-span-full rounded-lg border-2 border-dashed p-6 text-center text-xs'>
                Belum ada data pilar untuk Area 2 (Reform).
              </div>
            ) : (
              pilarsArea2.map((p) => (
                <Card
                  key={p.id_pilar}
                  className='flex flex-col justify-between border-gray-200 transition-all hover:border-purple-300 hover:shadow-xs dark:border-gray-800 dark:hover:border-purple-800'
                >
                  <CardHeader className='pb-3'>
                    <div className='flex items-start justify-between gap-2'>
                      <div className='flex items-center gap-2.5'>
                        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-sm font-bold text-purple-700 dark:bg-purple-950 dark:text-purple-300'>
                          {p.id_pilar}
                        </div>
                        <div>
                          <CardTitle className='text-base font-semibold text-gray-900 dark:text-gray-100'>
                            {p.nama_pilar}
                          </CardTitle>
                          <span className='font-mono text-xs font-medium text-purple-600 dark:text-purple-400'>
                            Pilar {p.id_pilar}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant='outline'
                        className='border-purple-200 bg-purple-50 text-[10px] text-purple-700 dark:bg-purple-950/40 dark:text-purple-300'
                      >
                        Reform
                      </Badge>
                    </div>
                  </CardHeader>

                  <div className='flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-4 py-2.5 dark:border-gray-800 dark:bg-gray-900/40'>
                    <Button
                      variant='ghost'
                      size='sm'
                      asChild
                      className='text-muted-foreground h-8 text-xs hover:text-purple-600'
                    >
                      <Link
                        href={`/rebo/dataRB/pilar/subpilar?pilar=${p.id_pilar}`}
                      >
                        Lihat Subpilar
                        <ArrowRight className='ml-1 h-3.5 w-3.5' />
                      </Link>
                    </Button>

                    {isAdmin && (
                      <div className='flex items-center gap-1'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => openEditModal(p)}
                          className='h-8 text-xs text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:hover:bg-emerald-950/40'
                        >
                          <Edit className='mr-1 h-3.5 w-3.5' />
                          Edit
                        </Button>
                        <Button
                          variant='ghost'
                          size='icon'
                          onClick={() => setDeleteTargetId(p.id_pilar)}
                          className='h-8 w-8 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40'
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
        </div>

        {/* Dialog Form Tambah / Edit Pilar */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className='sm:max-w-md'>
            <form onSubmit={handleSubmit}>
              <DialogHeader>
                <DialogTitle>
                  {dialogMode === 'create'
                    ? 'Tambah Pilar Baru'
                    : 'Edit Data Pilar'}
                </DialogTitle>
                <DialogDescription>
                  Lengkapi informasi pilar evaluasi reformasi birokrasi.
                </DialogDescription>
              </DialogHeader>

              <div className='space-y-4 py-4'>
                <div className='space-y-1.5'>
                  <Label htmlFor='idPilar'>ID Pilar</Label>
                  <Input
                    id='idPilar'
                    type='number'
                    min={1}
                    value={formIdPilar}
                    onChange={(e) => setFormIdPilar(e.target.value)}
                    disabled={dialogMode === 'edit'}
                    placeholder='Contoh: 1'
                    required
                  />
                  <p className='text-muted-foreground text-[11px]'>
                    ID unik pilar dalam database.
                  </p>
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='namaPilar'>Nama Pilar</Label>
                  <Input
                    id='namaPilar'
                    value={formNama}
                    onChange={(e) => setFormNama(e.target.value)}
                    placeholder='misal: Manajemen Perubahan'
                    required
                  />
                </div>

                <div className='space-y-1.5'>
                  <Label htmlFor='area'>Area Evaluasi</Label>
                  <Select
                    value={String(formArea)}
                    onValueChange={(val) => setFormArea(Number(val))}
                  >
                    <SelectTrigger id='area'>
                      <SelectValue placeholder='Pilih area...' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value='1'>Area 1 — Pemenuhan</SelectItem>
                      <SelectItem value='2'>Area 2 — Reform</SelectItem>
                    </SelectContent>
                  </Select>
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
                  {isPending ? 'Menyimpan...' : 'Simpan Pilar'}
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
                Hapus Pilar Reformasi Birokrasi?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus pilar master. Pastikan pilar ini
                tidak lagi memiliki subpilar terkait. Jika masih terdapat
                subpilar, sistem akan menolak penghapusan demi menjaga
                integritas data.
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
