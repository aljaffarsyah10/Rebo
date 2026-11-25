'use client';

import React, { useState, useEffect, useTransition } from 'react';
import {
  FileText,
  Calendar,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Sparkles,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Loader2,
  Info,
  ShieldCheck,
  CornerDownRight
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  extractDocumentMetadata,
  type DocumentMetadataResult,
  type PeriodValidationResult
} from '@/lib/ai/metadata-extractor';
import { extractDocumentMetadataAction } from '@/actions/ai-actions';

interface AIMetadataBadgeProps {
  namaDokumen: string;
  fileUrl?: string | null;
  tipeDokumen?: string | null;
  activeYear?: number;
  onInsertNarration?: (citationText: string) => void;
  compact?: boolean;
}

export function AIMetadataBadge({
  namaDokumen,
  fileUrl,
  tipeDokumen,
  activeYear = 2026,
  onInsertNarration,
  compact = false
}: AIMetadataBadgeProps) {
  const [result, setResult] = useState<DocumentMetadataResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Instant heuristic extraction on mount or when document changes
  useEffect(() => {
    if (!namaDokumen) return;
    try {
      const extracted = extractDocumentMetadata({
        nama_dokumen: namaDokumen,
        file_url: fileUrl,
        tipe_dokumen: tipeDokumen,
        active_year: activeYear
      });
      setResult(extracted);
    } catch {
      // Fallback
    }
  }, [namaDokumen, fileUrl, tipeDokumen, activeYear]);

  // Deep AI extraction with Server Action (can leverage LLM if available)
  const handleDeepAIExtract = () => {
    startTransition(async () => {
      try {
        const res = await extractDocumentMetadataAction({
          nama_dokumen: namaDokumen,
          file_url: fileUrl,
          tipe_dokumen: tipeDokumen,
          active_year: activeYear
        });

        if (res.success && res.data) {
          setResult(res.data);
          toast.success('Metadata dokumen berhasil diekstrak dengan AI.');
        } else {
          toast.error(res.error || 'Gagal mengekstrak metadata dokumen.');
        }
      } catch {
        toast.error('Terjadi kesalahan jaringan.');
      }
    });
  };

  const handleCopyCitation = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!result) return;

    try {
      await navigator.clipboard.writeText(result.summary_citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (onInsertNarration) {
        onInsertNarration(result.summary_citation);
        toast.success('Kutipan naskah dinas disisipkan ke catatan narasi!');
      } else {
        toast.success('Kutipan naskah dinas disalin ke clipboard.');
      }
    } catch {
      toast.error('Gagal menyalin kutipan.');
    }
  };

  if (!result) return null;

  const { validation, nomor_surat, tanggal, penandatangan, jenis_dokumen } =
    result;

  // Visual styling for Period Validation Badge
  const getValidationStyle = (val: PeriodValidationResult) => {
    switch (val.status) {
      case 'SESUAI_PERIODE':
        return {
          container:
            'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
          badge:
            'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700',
          icon: (
            <CheckCircle2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
          )
        };
      case 'KADALUARSA':
        return {
          container:
            'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800',
          badge:
            'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700',
          icon: (
            <AlertTriangle className='h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
          )
        };
      case 'MASA_DEPAN':
        return {
          container:
            'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800',
          badge:
            'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700',
          icon: (
            <AlertCircle className='h-3.5 w-3.5 text-rose-600 dark:text-rose-400' />
          )
        };
      default:
        return {
          container:
            'bg-slate-50 text-slate-700 border-slate-300 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-700',
          badge:
            'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
          icon: (
            <Info className='h-3.5 w-3.5 text-slate-500 dark:text-slate-400' />
          )
        };
    }
  };

  const style = getValidationStyle(validation);

  return (
    <div className='w-full'>
      {/* Compact Quick Bar */}
      <div className='flex flex-wrap items-center gap-1.5 pt-1.5'>
        {/* Status Validasi Periode */}
        <span
          className={`text-2xs inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-semibold shadow-2xs ${style.badge}`}
          title={validation.message}
        >
          {style.icon}
          <span>{validation.label}</span>
        </span>

        {/* Nomor Surat Pill */}
        {nomor_surat ? (
          <span
            className='text-2xs inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/80 px-2 py-0.5 font-medium text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300'
            title={`Nomor Dokumen: ${nomor_surat}`}
          >
            <FileText className='h-3 w-3 shrink-0 text-indigo-600 dark:text-indigo-400' />
            <span className='max-w-[170px] truncate'>{nomor_surat}</span>
          </span>
        ) : null}

        {/* Tanggal Dokumen Pill */}
        {tanggal ? (
          <span
            className='text-2xs inline-flex items-center gap-1 rounded-md border border-blue-200 bg-blue-50/80 px-2 py-0.5 font-medium text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
            title={`Tanggal Dokumen: ${tanggal.formatted}`}
          >
            <Calendar className='h-3 w-3 shrink-0 text-blue-600 dark:text-blue-400' />
            <span>{tanggal.formatted}</span>
          </span>
        ) : null}

        {/* Penandatangan Pill */}
        {penandatangan ? (
          <span
            className='text-2xs inline-flex items-center gap-1 rounded-md border border-purple-200 bg-purple-50/80 px-2 py-0.5 font-medium text-purple-800 dark:border-purple-800 dark:bg-purple-950/50 dark:text-purple-300'
            title={`Penandatangan: ${penandatangan}`}
          >
            <UserCheck className='h-3 w-3 shrink-0 text-purple-600 dark:text-purple-400' />
            <span className='max-w-[140px] truncate'>{penandatangan}</span>
          </span>
        ) : null}

        {/* 1-Click Action: Salin ke Narasi */}
        <button
          type='button'
          onClick={handleCopyCitation}
          className='text-2xs inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 hover:text-emerald-800 active:scale-95 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 dark:hover:bg-emerald-900/60'
          title='Salin / Sisipkan referensi naskah dinas ini langsung ke catatan penjelasan'
        >
          {copied ? (
            <>
              <Check className='h-3 w-3 text-emerald-600' />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <CornerDownRight className='h-3 w-3 text-emerald-600' />
              <span>Salin ke Narasi</span>
            </>
          )}
        </button>

        {/* Expand / Details Toggle */}
        <button
          type='button'
          onClick={() => setIsOpen(!isOpen)}
          className='text-2xs inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-gray-500 hover:bg-gray-200/60 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
          title='Lihat rincian metadata AI'
        >
          <Sparkles className='h-3 w-3 text-amber-500' />
          <span>Metadata AI</span>
          {isOpen ? (
            <ChevronUp className='h-3 w-3' />
          ) : (
            <ChevronDown className='h-3 w-3' />
          )}
        </button>
      </div>

      {/* Expanded Detailed Metadata Card */}
      {isOpen && (
        <div className='dark:bg-gray-850 mt-2.5 rounded-lg border border-gray-200 bg-white p-3.5 shadow-xs dark:border-gray-700'>
          <div className='mb-2 flex items-center justify-between'>
            <div className='flex items-center gap-1.5'>
              <Sparkles className='h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400' />
              <span className='text-xs font-bold text-gray-800 dark:text-gray-100'>
                Hasil Ekstraksi Metadata & Verifikasi Periode Dokumen
              </span>
            </div>
            <div className='flex items-center gap-1.5'>
              <span className='text-2xs font-semibold text-gray-500'>
                Akurasi AI: {result.confidence_score}%
              </span>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                onClick={handleDeepAIExtract}
                disabled={isPending}
                className='text-2xs h-6 px-1.5 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
                title='Jalankan ulang ekstraksi mendalam'
              >
                {isPending ? (
                  <Loader2 className='h-3 w-3 animate-spin' />
                ) : (
                  'Segarkan AI'
                )}
              </Button>
            </div>
          </div>

          {/* Validation Alert Box if expired or anomaly */}
          {validation.isAnomaly && (
            <div
              className={`mb-3 flex items-start gap-2 rounded-md border p-2.5 text-xs ${style.container}`}
            >
              <div className='mt-0.5 shrink-0'>{style.icon}</div>
              <div>
                <span className='font-bold'>{validation.label}</span>
                <p className='mt-0.5 leading-snug'>{validation.message}</p>
              </div>
            </div>
          )}

          {/* Metadata Grid */}
          <div className='grid grid-cols-1 gap-2 text-xs sm:grid-cols-2'>
            <div className='rounded border border-gray-100 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-800/40'>
              <span className='text-2xs block font-medium text-gray-500 dark:text-gray-400'>
                Jenis Naskah Dinas:
              </span>
              <span className='font-semibold text-gray-800 dark:text-gray-200'>
                {jenis_dokumen}
              </span>
            </div>

            <div className='rounded border border-gray-100 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-800/40'>
              <span className='text-2xs block font-medium text-gray-500 dark:text-gray-400'>
                Nomor Surat / Naskah:
              </span>
              <span className='font-semibold text-indigo-700 dark:text-indigo-300'>
                {nomor_surat || (
                  <span className='font-normal text-gray-400 italic'>
                    Tidak terdeteksi pada nama file
                  </span>
                )}
              </span>
            </div>

            <div className='rounded border border-gray-100 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-800/40'>
              <span className='text-2xs block font-medium text-gray-500 dark:text-gray-400'>
                Tanggal Dokumen / Kegiatan:
              </span>
              <span className='font-semibold text-blue-700 dark:text-blue-300'>
                {tanggal?.formatted || (
                  <span className='font-normal text-gray-400 italic'>
                    Tidak terdeteksi pada nama file
                  </span>
                )}
              </span>
            </div>

            <div className='rounded border border-gray-100 bg-gray-50/70 p-2 dark:border-gray-800 dark:bg-gray-800/40'>
              <span className='text-2xs block font-medium text-gray-500 dark:text-gray-400'>
                Penandatangan / Pejabat:
              </span>
              <span className='font-semibold text-purple-700 dark:text-purple-300'>
                {penandatangan || (
                  <span className='font-normal text-gray-400 italic'>
                    Default: Kepala BPS Kab. Kepulauan Sitaro
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Citation Preview & Insert Button */}
          <div className='mt-3 rounded-md border border-indigo-100 bg-indigo-50/50 p-2.5 dark:border-indigo-900/50 dark:bg-indigo-950/20'>
            <div className='flex items-center justify-between gap-2'>
              <span className='text-2xs font-semibold text-indigo-900 dark:text-indigo-200'>
                Format Kutipan Resmi untuk Narasi LKE:
              </span>
              <Button
                type='button'
                size='sm'
                onClick={handleCopyCitation}
                className='text-2xs h-7 bg-emerald-600 px-2.5 font-semibold text-white shadow-2xs hover:bg-emerald-700'
              >
                {copied ? (
                  <>
                    <Check className='mr-1 h-3 w-3' />
                    <span>Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className='mr-1 h-3 w-3' />
                    <span>Salin / Sisipkan ke Narasi</span>
                  </>
                )}
              </Button>
            </div>
            <p className='mt-1 font-mono text-xs text-gray-800 select-all dark:text-gray-200'>
              {result.summary_citation}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
