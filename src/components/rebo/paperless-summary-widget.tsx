import React from 'react';
import Link from 'next/link';
import {
  Leaf,
  Trees,
  Banknote,
  FileText,
  Droplets,
  ArrowRight,
  ShieldCheck,
  Ship
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getPaperlessImpactAction } from '@/actions/paperless-actions';

export async function PaperlessSummaryWidget() {
  const result = await getPaperlessImpactAction();
  const stats = result.data;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatNumber = (val: number) => {
    return new Intl.NumberFormat('id-ID').format(val);
  };

  return (
    <Card className='relative overflow-hidden border-emerald-300/80 bg-gradient-to-r from-emerald-50/70 via-teal-50/40 to-green-50/50 shadow-xs dark:border-emerald-700/60 dark:from-emerald-950/30 dark:via-slate-900/80 dark:to-slate-900/80'>
      {/* Emerald accent bar */}
      <div className='absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500' />

      <CardContent className='space-y-4 p-4 sm:p-5'>
        {/* Header Widget */}
        <div className='flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between'>
          <div className='space-y-1'>
            <div className='flex flex-wrap items-center gap-2'>
              <Badge className='border-emerald-300 bg-emerald-600 text-[10px] font-bold text-white shadow-2xs'>
                <Leaf className='mr-1 h-3 w-3' />
                Green Governance &amp; Eco-Efficiency
              </Badge>
              <span className='text-xs text-slate-500 dark:text-slate-400'>
                Reformasi Tata Kelola Hijau • Pilar 2 &amp; Pilar 4
              </span>
            </div>
            <h3 className='flex items-center gap-2 text-base font-bold text-slate-900 dark:text-slate-100'>
              <span>Efisiensi Paperless &amp; Dampak Lingkungan REBO V2</span>
              <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' />
            </h3>
          </div>

          <Link href='/rebo/paperless'>
            <Button
              size='sm'
              className='h-8 shrink-0 gap-1.5 bg-emerald-600 text-xs font-semibold text-white shadow-2xs hover:bg-emerald-700'
            >
              <ShieldCheck className='h-3.5 w-3.5' />
              <span>Lihat Laporan &amp; Sertifikat</span>
              <ArrowRight className='h-3 w-3' />
            </Button>
          </Link>
        </div>

        {/* 4 Mini Cards Metrik */}
        <div className='grid grid-cols-2 gap-2.5 sm:grid-cols-4'>
          <div className='rounded-xl border border-emerald-200/60 bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
            <div className='flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400'>
              <FileText className='h-3.5 w-3.5' />
              <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Kertas Dihemat
              </span>
            </div>
            <p className='mt-1 text-base font-bold text-slate-900 dark:text-slate-100'>
              {formatNumber(stats.estimasi_lembar_dihemat)}{' '}
              <span className='text-xs font-medium text-slate-500'>Lembar</span>
            </p>
            <p className='text-[10px] font-medium text-emerald-700 dark:text-emerald-400'>
              ~{stats.estimasi_rim_kertas} Rim Kertas HVS
            </p>
          </div>

          <div className='rounded-xl border border-blue-200/60 bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
            <div className='flex items-center space-x-1.5 text-blue-600 dark:text-blue-400'>
              <Banknote className='h-3.5 w-3.5' />
              <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Anggaran Dihemat
              </span>
            </div>
            <p className='mt-1 text-base font-bold text-slate-900 dark:text-slate-100'>
              {formatRupiah(stats.total_biaya_dihemat_rp)}
            </p>
            <p className='flex items-center gap-1 text-[10px] font-medium text-blue-700 dark:text-blue-400'>
              <Ship className='h-3 w-3' />
              <span>Bebas Biaya Kapal Cepat</span>
            </p>
          </div>

          <div className='rounded-xl border border-teal-200/60 bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
            <div className='flex items-center space-x-1.5 text-teal-600 dark:text-teal-400'>
              <Trees className='h-3.5 w-3.5' />
              <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Pohon Tropis
              </span>
            </div>
            <p className='mt-1 text-base font-bold text-slate-900 dark:text-slate-100'>
              {stats.pohon_diselamatkan}{' '}
              <span className='text-xs font-medium text-slate-500'>Pohon</span>
            </p>
            <p className='text-[10px] font-medium text-teal-700 dark:text-teal-400'>
              Cegah Deforestasi Pulp
            </p>
          </div>

          <div className='rounded-xl border border-cyan-200/60 bg-white/80 p-3 shadow-2xs dark:border-slate-800 dark:bg-slate-900/70'>
            <div className='flex items-center space-x-1.5 text-cyan-600 dark:text-cyan-400'>
              <Droplets className='h-3.5 w-3.5' />
              <span className='text-[10px] font-semibold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Reduksi Karbon
              </span>
            </div>
            <p className='mt-1 text-base font-bold text-slate-900 dark:text-slate-100'>
              {stats.emisi_co2_kg}{' '}
              <span className='text-xs font-medium text-slate-500'>
                kg CO2e
              </span>
            </p>
            <p className='text-[10px] font-medium text-cyan-700 dark:text-cyan-400'>
              &amp; {formatNumber(stats.air_bersih_liter)} L Air Bersih
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
