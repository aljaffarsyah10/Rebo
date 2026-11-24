'use client';

import React, { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, ChevronDown, Lock, Settings } from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@clerk/nextjs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getAllPeriode } from '@/lib/api/rebo';
import { setActivePeriode } from '@/actions/periode-actions';
import type { PeriodeEvaluasi } from '@/types/rebo';

export default function PeriodeSwitcher() {
  const router = useRouter();
  const { user } = useUser();
  const role = (user?.publicMetadata?.role as string) || 'operator';
  const isAdmin = role === 'admin';

  const [periodes, setPeriodes] = useState<PeriodeEvaluasi[]>([]);
  const [activePeriode, setActivePeriodeState] =
    useState<PeriodeEvaluasi | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const fetchPeriods = async () => {
    try {
      const list = await getAllPeriode();
      setPeriodes(list);
      const active = list.find((p) => p.is_active) || list[0] || null;
      setActivePeriodeState(active);
    } catch (err) {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPeriods();
  }, []);

  const handleSelectPeriod = (p: PeriodeEvaluasi) => {
    if (p.is_active) return;

    if (isAdmin) {
      startTransition(async () => {
        const res = await setActivePeriode(p.id);
        if (res.success) {
          toast.success(
            `Berhasil beralih ke Periode Evaluasi Tahun ${p.tahun}!`
          );
          await fetchPeriods();
          router.refresh();
        } else {
          toast.error(res.error || 'Gagal mengubah periode aktif.');
        }
      });
    } else {
      // Pengguna non-admin
      toast.info(
        `Anda sedang melihat data Tahun ${p.tahun} (${p.is_locked ? 'Terkunci / Read-Only' : 'Terbuka'}).`
      );
    }
  };

  if (loading) {
    return (
      <div className='flex items-center gap-1.5 rounded-full border border-blue-200/60 bg-blue-50/50 px-2.5 py-1 text-xs text-blue-700 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-300'>
        <Calendar className='h-3.5 w-3.5 animate-pulse' />
        <span className='font-medium'>Periode...</span>
      </div>
    );
  }

  const currentYear = activePeriode?.tahun || 2025;
  const isLocked = activePeriode?.is_locked || false;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className='h-9 min-h-[36px] touch-manipulation gap-1.5 rounded-full border-blue-200 bg-white/80 px-3 text-xs font-semibold shadow-xs hover:border-blue-400 hover:bg-blue-50 sm:h-8 sm:min-h-[32px] sm:px-2.5 dark:border-blue-900/70 dark:bg-slate-900 dark:hover:bg-blue-950/40'
        >
          <Calendar className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
          <span className='text-gray-900 dark:text-gray-100'>
            Tahun {currentYear}
          </span>

          {isLocked ? (
            <Badge
              variant='outline'
              className='h-4 border-rose-300 bg-rose-50 px-1 text-[10px] font-normal text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300'
            >
              <Lock className='mr-0.5 h-2.5 w-2.5' />
              Locked
            </Badge>
          ) : (
            <Badge
              variant='outline'
              className='h-4 border-emerald-300 bg-emerald-50 px-1 text-[10px] font-normal text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
            >
              Aktif
            </Badge>
          )}

          <ChevronDown className='text-muted-foreground h-3 w-3 opacity-60' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align='end' className='w-64'>
        <DropdownMenuLabel className='text-muted-foreground flex items-center justify-between text-xs font-semibold'>
          <span>SIKLUS PERIODE EVALUASI</span>
          {isAdmin && (
            <span className='text-[10px] font-normal text-blue-600 dark:text-blue-400'>
              Admin Mode
            </span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {periodes.length === 0 ? (
            <div className='text-muted-foreground p-2 text-center text-xs'>
              Belum ada periode evaluasi terdaftar
            </div>
          ) : (
            periodes.map((p) => {
              const isActive = p.id === activePeriode?.id || p.is_active;
              return (
                <DropdownMenuItem
                  key={p.id}
                  onClick={() => handleSelectPeriod(p)}
                  className='flex cursor-pointer items-center justify-between py-2 text-xs'
                  disabled={isPending}
                >
                  <div className='flex items-center gap-2'>
                    <div
                      className={`h-2 w-2 rounded-full ${
                        isActive
                          ? 'bg-emerald-500'
                          : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                    <div>
                      <div className='flex items-center gap-1.5 font-semibold text-gray-900 dark:text-gray-100'>
                        Tahun {p.tahun}
                        {p.is_locked && (
                          <span title='Terkunci (Read-Only)'>
                            <Lock className='h-3 w-3 text-rose-500' />
                          </span>
                        )}
                      </div>
                      <div className='text-muted-foreground max-w-[150px] truncate text-[10px]'>
                        {p.nama_periode}
                      </div>
                    </div>
                  </div>

                  {isActive ? (
                    <Badge className='h-4 bg-emerald-600 px-1 text-[10px] text-white hover:bg-emerald-600'>
                      Aktif
                    </Badge>
                  ) : isAdmin ? (
                    <span className='text-[10px] text-blue-600 hover:underline'>
                      Aktifkan
                    </span>
                  ) : null}
                </DropdownMenuItem>
              );
            })
          )}
        </DropdownMenuGroup>

        {isAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild className='cursor-pointer text-xs'>
              <Link
                href='/rebo/admin/periode'
                className='flex items-center gap-2 font-medium text-blue-600 dark:text-blue-400'
              >
                <Settings className='h-3.5 w-3.5' />
                <span>Kelola Siklus Periode & Kloning</span>
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
