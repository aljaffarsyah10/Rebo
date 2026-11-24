'use client';

import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  Info,
  ShieldCheck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  evaluateQAChecklist,
  type QAChecklistEvaluation
} from '@/lib/qa/checklist';

interface QAChecklistCardProps {
  dokumenList: Array<{ nama_dokumen: string; tipe_dokumen?: string | null }>;
  evaluation?: QAChecklistEvaluation;
  compact?: boolean;
  className?: string;
  title?: string;
}

export function QAChecklistCard({
  dokumenList,
  evaluation,
  compact = false,
  className = '',
  title = 'Pre-Audit QA Checklist (5 Dokumen Kunci)'
}: QAChecklistCardProps) {
  const result = evaluation || evaluateQAChecklist(dokumenList);

  const getBadgeStyle = () => {
    if (result.isComplete) {
      return 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300';
    }
    if (result.fulfilledCount >= 3) {
      return 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/70 dark:text-amber-300';
    }
    return 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-950/70 dark:text-rose-300';
  };

  const getFriendlyMessage = () => {
    if (result.isComplete) {
      return 'Luar biasa! 5/5 dokumen standar terpenuhi. Bukti siap diajukan untuk verifikasi dan sinkronisasi pusat.';
    }
    if (result.fulfilledCount === 0) {
      return 'Belum ada dokumen standar terdeteksi. Disarankan melengkapi dokumen kunci di bawah ini.';
    }
    return `Kelengkapan ${result.fulfilledCount}/5 terpenuhi (${result.scorePercent}%). Belum terdeteksi: ${result.missingLabels.join(', ')}.`;
  };

  if (compact) {
    return (
      <div
        className={`rounded-lg border p-3 text-xs ${
          result.isComplete
            ? 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20'
            : 'border-amber-200 bg-amber-50/40 dark:border-amber-900/40 dark:bg-amber-950/20'
        } ${className}`}
      >
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-1.5'>
            <ClipboardCheck
              className={`h-4 w-4 shrink-0 ${
                result.isComplete
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            />
            <span className='font-bold text-gray-800 dark:text-gray-200'>
              {title}
            </span>
          </div>

          <Badge
            variant='outline'
            className={`text-2xs font-bold ${getBadgeStyle()}`}
          >
            {result.fulfilledCount}/{result.totalRequired} Lengkap (
            {result.scorePercent}%)
          </Badge>
        </div>

        <p className='text-2xs mt-1 text-gray-600 dark:text-gray-400'>
          {getFriendlyMessage()}
        </p>

        <div className='mt-2.5 flex flex-wrap gap-1.5'>
          {result.items.map((item) => (
            <span
              key={item.id}
              className={`text-2xs inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-medium ${
                item.isFulfilled
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                  : 'border-amber-200 bg-amber-50/80 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300'
              }`}
            >
              {item.isFulfilled ? (
                <CheckCircle2 className='h-3 w-3 shrink-0 text-emerald-600 dark:text-emerald-400' />
              ) : (
                <AlertTriangle className='h-3 w-3 shrink-0 text-amber-600 dark:text-amber-400' />
              )}
              <span className='max-w-[130px] truncate'>
                {item.label.split(' / ')[0]}
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl border p-4 transition-all ${
        result.isComplete
          ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/60 via-white to-emerald-50/30 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:via-gray-900 dark:to-emerald-950/20'
          : 'border-amber-200 bg-gradient-to-br from-amber-50/60 via-white to-amber-50/30 dark:border-amber-900/50 dark:from-amber-950/30 dark:via-gray-900 dark:to-amber-950/20'
      } ${className}`}
    >
      {/* Header Card */}
      <div className='flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3 dark:border-gray-800'>
        <div className='flex items-center gap-2'>
          <div
            className={`flex h-7 w-7 items-center justify-center rounded-lg shadow-xs ${
              result.isComplete
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-500 text-white'
            }`}
          >
            {result.isComplete ? (
              <ShieldCheck className='h-4 w-4' />
            ) : (
              <ClipboardCheck className='h-4 w-4' />
            )}
          </div>
          <div>
            <h5 className='text-xs font-bold text-gray-900 dark:text-gray-100'>
              {title}
            </h5>
            <p className='text-2xs text-gray-500 dark:text-gray-400'>
              Kriteria 5 berkas esensial penilaian reformasi birokrasi
            </p>
          </div>
        </div>

        <Badge
          variant='outline'
          className={`px-2.5 py-0.5 text-xs font-bold shadow-2xs ${getBadgeStyle()}`}
        >
          {result.fulfilledCount}/{result.totalRequired} Lengkap (
          {result.scorePercent}%)
        </Badge>
      </div>

      {/* Friendly Advice */}
      <div className='mt-2.5 flex items-start gap-2 rounded-lg bg-white/70 p-2.5 text-xs text-gray-700 shadow-2xs dark:bg-gray-800/60 dark:text-gray-300'>
        <Info className='mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500' />
        <p className='text-2xs leading-relaxed'>{getFriendlyMessage()}</p>
      </div>

      {/* Grid 5 Checklist Items */}
      <div className='mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3'>
        {result.items.map((item) => (
          <div
            key={item.id}
            className={`flex items-start gap-2.5 rounded-lg border p-2.5 text-xs transition-all ${
              item.isFulfilled
                ? 'border-emerald-200 bg-emerald-50/70 shadow-2xs dark:border-emerald-800/80 dark:bg-emerald-950/40'
                : 'border-amber-200 bg-amber-50/50 shadow-2xs dark:border-amber-900/60 dark:bg-amber-950/30'
            }`}
          >
            {item.isFulfilled ? (
              <CheckCircle2 className='mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
            ) : (
              <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400' />
            )}

            <div className='min-w-0 flex-1'>
              <div className='flex items-center justify-between gap-1'>
                <span
                  className={`font-semibold ${
                    item.isFulfilled
                      ? 'text-emerald-900 dark:text-emerald-200'
                      : 'text-amber-900 dark:text-amber-200'
                  }`}
                >
                  {item.label}
                </span>
              </div>

              {item.isFulfilled && item.matchedDocName ? (
                <p
                  className='text-2xs mt-0.5 truncate font-medium text-emerald-700 dark:text-emerald-300'
                  title={item.matchedDocName}
                >
                  ✓ Cocok: &ldquo;{item.matchedDocName}&rdquo;
                </p>
              ) : (
                <p className='text-2xs mt-0.5 text-amber-700 italic dark:text-amber-400'>
                  Belum terlampir
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
