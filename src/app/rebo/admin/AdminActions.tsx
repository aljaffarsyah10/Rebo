'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { updateUserRoleAndPilar, removeRole } from './_actions';
import {
  PILAR_LIST,
  ROLE_LABELS,
  ROLE_BADGE_CLASSES,
  type UserRole
} from '@/lib/auth/rbac';
import {
  ShieldAlert,
  UserCog,
  Loader2,
  Trash2,
  CheckCircle2,
  Layers
} from 'lucide-react';

interface AdminActionsProps {
  userId: string;
  userName?: string;
  userEmail?: string;
  currentRole?: string | null;
  currentPilarId?: string | null;
}

export default function AdminActions({
  userId,
  userName = 'Pengguna',
  userEmail,
  currentRole = null,
  currentPilarId = null
}: AdminActionsProps) {
  const [open, setOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>(
    currentRole || 'none'
  );
  const [selectedPilar, setSelectedPilar] = useState<string>(
    currentPilarId || 'none'
  );
  const [isLoading, setIsLoading] = useState(false);

  const needsPilar =
    selectedRole === 'koordinator' || selectedRole === 'operator';

  async function handleSave() {
    setIsLoading(true);
    try {
      const targetRole =
        selectedRole === 'none' ? null : (selectedRole as UserRole);
      const targetPilar =
        needsPilar && selectedPilar !== 'none' ? selectedPilar : null;

      const res = await updateUserRoleAndPilar({
        id: userId,
        role: targetRole,
        assigned_pilar_id: targetPilar
      });

      if (res.ok) {
        toast.success(res.message);
        setOpen(false);
        // Refresh page or trigger client update
        window.location.reload();
      } else {
        toast.error(res.message || 'Gagal memperbarui peran');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRemoveRole() {
    if (!confirm(`Yakin ingin mencopot hak akses role untuk ${userName}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('id', userId);
      const res = await removeRole(formData);

      if (res.ok) {
        toast.success(res.message);
        setSelectedRole('none');
        setSelectedPilar('none');
        setOpen(false);
        window.location.reload();
      } else {
        toast.error(res.message || 'Gagal menghapus peran');
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size='sm'
          variant='outline'
          className='flex items-center gap-1.5 text-xs font-medium hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400'
        >
          <UserCog className='h-3.5 w-3.5' />
          <span>Atur Akses</span>
        </Button>
      </DialogTrigger>

      <DialogContent className='sm:max-w-[480px]'>
        <DialogHeader>
          <div className='flex items-center gap-2'>
            <div className='flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400'>
              <UserCog className='h-5 w-5' />
            </div>
            <div>
              <DialogTitle className='text-base font-semibold'>
                Kelola Role & Penugasan Pengguna
              </DialogTitle>
              <DialogDescription className='text-xs'>
                Tetapkan peran dan hak akses pilar Zona Integritas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* User preview header */}
        <div className='rounded-lg border border-slate-100 bg-slate-50/80 p-3 text-sm dark:border-slate-800 dark:bg-slate-900/60'>
          <div className='font-medium text-slate-900 dark:text-slate-100'>
            {userName}
          </div>
          {userEmail && (
            <div className='text-muted-foreground text-xs'>{userEmail}</div>
          )}
          <div className='mt-2 flex items-center gap-2 text-xs'>
            <span className='text-muted-foreground'>Role Aktif:</span>
            {currentRole ? (
              <Badge
                className={`text-[11px] ${
                  ROLE_BADGE_CLASSES[currentRole as UserRole] || ''
                }`}
              >
                {ROLE_LABELS[currentRole as UserRole] || currentRole}
              </Badge>
            ) : (
              <span className='text-slate-500 italic'>Belum Ditetapkan</span>
            )}
            {currentPilarId && (
              <Badge variant='outline' className='text-[11px]'>
                Pilar {currentPilarId}
              </Badge>
            )}
          </div>
        </div>

        <div className='grid gap-4 py-2'>
          {/* Dropdown 1: Role Selection */}
          <div className='space-y-1.5'>
            <Label htmlFor='role-select' className='text-xs font-semibold'>
              Pilih Role Pengguna
            </Label>
            <Select
              value={selectedRole}
              onValueChange={(val) => {
                setSelectedRole(val);
                if (val !== 'koordinator' && val !== 'operator') {
                  setSelectedPilar('none');
                }
              }}
            >
              <SelectTrigger id='role-select' className='w-full text-xs'>
                <SelectValue placeholder='Pilih Role' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='none' className='text-xs'>
                  <span className='text-muted-foreground italic'>
                    — Tanpa Role (Pengguna Biasa) —
                  </span>
                </SelectItem>
                <SelectItem value='admin' className='text-xs'>
                  <div className='flex items-center gap-2'>
                    <ShieldAlert className='h-3.5 w-3.5 text-purple-600' />
                    <span>Super Admin (Sekretariat ZI / Akses Penuh)</span>
                  </div>
                </SelectItem>
                <SelectItem value='koordinator' className='text-xs'>
                  <div className='flex items-center gap-2'>
                    <CheckCircle2 className='h-3.5 w-3.5 text-blue-600' />
                    <span>Koordinator Pilar (Review, Catatan & Approval)</span>
                  </div>
                </SelectItem>
                <SelectItem value='operator' className='text-xs'>
                  <div className='flex items-center gap-2'>
                    <Layers className='h-3.5 w-3.5 text-emerald-600' />
                    <span>Operator Tim (Upload Bukti & Nilai Mandiri)</span>
                  </div>
                </SelectItem>
                <SelectItem value='tpi' className='text-xs'>
                  <div className='flex items-center gap-2'>
                    <ShieldAlert className='h-3.5 w-3.5 text-amber-600' />
                    <span>Tim Penilai Internal (Auditor / TPI)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dropdown 2: Penugasan Pilar (Hanya jika Koordinator / Operator) */}
          {needsPilar && (
            <div className='animate-in fade-in-50 space-y-1.5 duration-200'>
              <Label htmlFor='pilar-select' className='text-xs font-semibold'>
                Penugasan Pilar (Wajib untuk Koordinator & Operator)
              </Label>
              <Select value={selectedPilar} onValueChange={setSelectedPilar}>
                <SelectTrigger id='pilar-select' className='w-full text-xs'>
                  <SelectValue placeholder='Pilih Pilar Penugasan' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='none' className='text-xs'>
                    <span className='text-muted-foreground italic'>
                      — Belum Ditugaskan ke Pilar —
                    </span>
                  </SelectItem>
                  {PILAR_LIST.map((p) => (
                    <SelectItem key={p.id} value={p.id} className='text-xs'>
                      <span className='font-medium'>{p.kode}:</span> {p.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className='text-muted-foreground text-[11px]'>
                Pengguna hanya dapat mengelola indikator pada pilar yang
                ditugaskan.
              </p>
            </div>
          )}

          {/* Info banner for Admin / TPI */}
          {selectedRole === 'admin' && (
            <div className='rounded-md border border-purple-200 bg-purple-50 p-2.5 text-xs text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/40 dark:text-purple-300'>
              <span className='font-semibold'>Hak Akses Super Admin:</span>{' '}
              Dapat mengelola master data, user, periode evaluasi, dan seluruh
              pilar bukti dukung.
            </div>
          )}

          {selectedRole === 'tpi' && (
            <div className='rounded-md border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300'>
              <span className='font-semibold'>Hak Akses TPI:</span> Penilai
              independen dapat memeriksa dokumen dan mengisi nilai verifikasi
              pada seluruh pilar.
            </div>
          )}
        </div>

        <DialogFooter className='flex flex-row items-center justify-between gap-2 sm:justify-between'>
          {currentRole ? (
            <Button
              type='button'
              size='sm'
              variant='ghost'
              onClick={handleRemoveRole}
              disabled={isLoading}
              className='text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50'
            >
              <Trash2 className='mr-1.5 h-3.5 w-3.5' />
              Copot Role
            </Button>
          ) : (
            <div />
          )}

          <div className='flex items-center gap-2'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={() => setOpen(false)}
              disabled={isLoading}
              className='text-xs'
            >
              Batal
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleSave}
              disabled={isLoading}
              className='text-xs font-semibold'
            >
              {isLoading && (
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
              )}
              Simpan Perubahan
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
