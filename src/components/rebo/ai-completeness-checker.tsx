'use client';

import React, { useState, useTransition } from 'react';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  FileText,
  Calendar,
  Layers,
  Wand2,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  checkLKECatatanCompletenessAction,
  generateSuggestedNarrationAction
} from '@/actions/ai-actions';
import type {
  LKEAnalysisResult,
  LKEAnalysisRequest
} from '@/lib/ai/lke-checker';

interface AICompletenessCheckerProps {
  pertanyaan: {
    id_pertanyaan: string;
    uraian_pertanyaan: string;
    deskripsi_pertanyaan?: string | null;
    uraian_singkat?: string | null;
  };
  catatan: string;
  dokumenList?: Array<{
    nama_dokumen: string;
    tipe_dokumen?: string | null;
    file_url?: string;
  }>;
  onApplyNarration?: (suggestedText: string) => void;
  disabled?: boolean;
}

export function AICompletenessChecker({
  pertanyaan,
  catatan,
  dokumenList = [],
  onApplyNarration,
  disabled = false
}: AICompletenessCheckerProps) {
  const [isPending, startTransition] = useTransition();
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<LKEAnalysisResult | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const wordCount = catatan.trim()
    ? catatan.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const handleCheck = () => {
    if (!catatan.trim()) {
      toast.warning(
        'Tuliskan catatan terlebih dahulu untuk dianalisis oleh AI.'
      );
      return;
    }

    startTransition(async () => {
      const payload: LKEAnalysisRequest = {
        pertanyaan,
        catatan,
        dokumenList
      };

      const res = await checkLKECatatanCompletenessAction(payload);
      if (res.success && res.data) {
        setResult(res.data);
        setIsOpen(true);
        if (res.data.predicate === 'Sangat Siap') {
          toast.success('Narasi Sangat Siap! Memenuhi kriteria verifikasi.');
        } else if (res.data.predicate === 'Cukup') {
          toast.info('Narasi Cukup Baik. Perhatikan rekomendasi minor AI.');
        } else {
          toast.warning(`Predikat: ${res.data.predicate}. Periksa catatan AI.`);
        }
      } else {
        toast.error(res.error || 'Gagal menganalisis catatan.');
      }
    });
  };

  const handleGenerateSuggestion = async () => {
    setIsGenerating(true);
    try {
      const payload: LKEAnalysisRequest = {
        pertanyaan,
        catatan,
        dokumenList
      };
      const res = await generateSuggestedNarrationAction(payload);
      if (res.success && res.suggestion) {
        if (onApplyNarration) {
          onApplyNarration(res.suggestion);
          toast.success('Template narasi berhasil diterapkan ke form!');
        } else {
          await navigator.clipboard.writeText(res.suggestion);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
          toast.success('Draf narasi disalin ke clipboard.');
        }
      } else {
        toast.error(res.error || 'Gagal menghasilkan draf narasi.');
      }
    } catch {
      toast.error('Terjadi kesalahan jaringan.');
    } finally {
      setIsGenerating(false);
    }
  };

  const getPredicateBadgeColor = (predicate: string) => {
    switch (predicate) {
      case 'Sangat Siap':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
      case 'Cukup':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
      case 'Perlu Dilengkapi':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 dark:text-emerald-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 45) return 'text-amber-600 dark:text-amber-400';
    return 'text-rose-600 dark:text-rose-400';
  };

  const getProgressBarColor = (score: number) => {
    if (score >= 85) return 'bg-emerald-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 45) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className='mt-2.5 space-y-3'>
      {/* ACTION BAR: BUTTONS & COUNTER */}
      <div className='flex flex-wrap items-center justify-between gap-2 pt-1'>
        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={handleCheck}
            disabled={disabled || isPending || !catatan.trim()}
            className='h-8 gap-1.5 border-violet-200 bg-violet-50/70 text-xs font-semibold text-violet-700 hover:bg-violet-100 hover:text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-300 dark:hover:bg-violet-900/50'
          >
            {isPending ? (
              <>
                <Loader2 className='h-3.5 w-3.5 animate-spin' />
                <span>Menganalisis...</span>
              </>
            ) : (
              <>
                <Sparkles className='h-3.5 w-3.5 text-violet-600 dark:text-violet-400' />
                <span>Cek Kualitas Narasi AI</span>
              </>
            )}
          </Button>

          <Button
            type='button'
            variant='ghost'
            size='sm'
            onClick={handleGenerateSuggestion}
            disabled={disabled || isGenerating}
            className='h-8 gap-1.5 text-xs text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
            title='Bantu buatkan kerangka kalimat penjelasan standar'
          >
            {isGenerating ? (
              <Loader2 className='h-3.5 w-3.5 animate-spin' />
            ) : copied ? (
              <Check className='h-3.5 w-3.5 text-emerald-600' />
            ) : (
              <Wand2 className='h-3.5 w-3.5 text-indigo-500' />
            )}
            <span>Bantu Susun Narasi</span>
          </Button>
        </div>

        {/* Word count badge */}
        <div className='text-2xs flex items-center gap-2 text-gray-500 dark:text-gray-400'>
          <span>
            {wordCount} kata ({catatan.length} karakter)
          </span>
          {wordCount > 0 && wordCount < 30 && (
            <span className='inline-flex items-center gap-1 text-amber-600 dark:text-amber-400'>
              <AlertTriangle className='h-3 w-3' />
              Disarankan min. 30 kata
            </span>
          )}
        </div>
      </div>

      {/* ANALYSIS RESULT PANEL */}
      {result && (
        <div className='overflow-hidden rounded-xl border border-violet-200/80 bg-linear-to-b from-violet-50/50 to-white shadow-xs dark:border-violet-900/50 dark:from-violet-950/20 dark:to-gray-900'>
          {/* Header Bar */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className='flex cursor-pointer items-center justify-between border-b border-violet-100 bg-violet-50/40 px-4 py-3 select-none hover:bg-violet-50/70 dark:border-violet-900/40 dark:bg-violet-950/30 dark:hover:bg-violet-950/50'
          >
            <div className='flex items-center gap-2.5'>
              <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs dark:bg-violet-500'>
                <Sparkles className='h-3.5 w-3.5' />
              </div>
              <div>
                <div className='flex items-center gap-2'>
                  <h4 className='text-xs font-bold text-gray-900 dark:text-gray-100'>
                    Hasil Analisis AI LKE
                  </h4>
                  <Badge
                    variant='outline'
                    className={`text-2xs px-2 py-0.5 font-bold ${getPredicateBadgeColor(
                      result.predicate
                    )}`}
                  >
                    {result.predicate}
                  </Badge>
                </div>
                <p className='text-2xs text-gray-500 dark:text-gray-400'>
                  {result.summary}
                </p>
              </div>
            </div>

            <div className='flex items-center gap-3'>
              <div className='text-right'>
                <span className='text-2xs block text-gray-500 dark:text-gray-400'>
                  Skor Kualitas
                </span>
                <span
                  className={`text-base leading-none font-extrabold ${getScoreColor(
                    result.score
                  )}`}
                >
                  {result.score}
                  <span className='text-xs font-normal text-gray-400'>
                    /100
                  </span>
                </span>
              </div>
              {isOpen ? (
                <ChevronUp className='h-4 w-4 text-gray-400' />
              ) : (
                <ChevronDown className='h-4 w-4 text-gray-400' />
              )}
            </div>
          </div>

          {/* Collapsible Content */}
          {isOpen && (
            <div className='space-y-4 p-4 text-xs'>
              {/* Progress Bar */}
              <div className='space-y-1.5'>
                <div className='text-2xs flex justify-between text-gray-500 dark:text-gray-400'>
                  <span>Tingkat Kesiapan Verifikasi</span>
                  <span>{result.score}%</span>
                </div>
                <div className='h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700'>
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(
                      result.score
                    )}`}
                    style={{ width: `${result.score}%` }}
                  />
                </div>
              </div>

              {/* 4 Pilar Narrative Structure Checklist */}
              <div className='rounded-lg border border-gray-100 bg-white p-3 dark:border-gray-800 dark:bg-gray-800/60'>
                <span className='text-2xs mb-2 block font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400'>
                  Struktur Narasi Audit (4 Pilar Penilaian)
                </span>
                <div className='grid grid-cols-2 gap-2 sm:grid-cols-4'>
                  {/* What */}
                  <div
                    className={`flex items-center gap-1.5 rounded-md p-1.5 ${
                      result.structure.hasWhat
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400'
                    }`}
                  >
                    {result.structure.hasWhat ? (
                      <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-600' />
                    ) : (
                      <AlertCircle className='h-3.5 w-3.5 shrink-0 text-gray-400' />
                    )}
                    <span className='text-2xs font-semibold'>
                      What (Kegiatan)
                    </span>
                  </div>

                  {/* Why */}
                  <div
                    className={`flex items-center gap-1.5 rounded-md p-1.5 ${
                      result.structure.hasWhy
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400'
                    }`}
                  >
                    {result.structure.hasWhy ? (
                      <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-600' />
                    ) : (
                      <AlertCircle className='h-3.5 w-3.5 shrink-0 text-gray-400' />
                    )}
                    <span className='text-2xs font-semibold'>
                      Why (Tujuan/Dasar)
                    </span>
                  </div>

                  {/* How */}
                  <div
                    className={`flex items-center gap-1.5 rounded-md p-1.5 ${
                      result.structure.hasHow
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400'
                    }`}
                  >
                    {result.structure.hasHow ? (
                      <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-600' />
                    ) : (
                      <AlertCircle className='h-3.5 w-3.5 shrink-0 text-gray-400' />
                    )}
                    <span className='text-2xs font-semibold'>
                      How (Mekanisme)
                    </span>
                  </div>

                  {/* Bukti Reference */}
                  <div
                    className={`flex items-center gap-1.5 rounded-md p-1.5 ${
                      result.structure.hasEvidenceReference
                        ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-gray-50 text-gray-500 dark:bg-gray-900/50 dark:text-gray-400'
                    }`}
                  >
                    {result.structure.hasEvidenceReference ? (
                      <CheckCircle2 className='h-3.5 w-3.5 shrink-0 text-emerald-600' />
                    ) : (
                      <AlertCircle className='h-3.5 w-3.5 shrink-0 text-gray-400' />
                    )}
                    <span className='text-2xs font-semibold'>
                      Bukti (Rujukan)
                    </span>
                  </div>
                </div>
              </div>

              {/* Detected Entities Tags */}
              {result.entities.length > 0 && (
                <div>
                  <span className='text-2xs mb-1.5 block font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400'>
                    Entitas Resmi Terdeteksi ({result.entities.length})
                  </span>
                  <div className='flex flex-wrap gap-1.5'>
                    {result.entities.map((entity, idx) => (
                      <span
                        key={idx}
                        className='text-2xs inline-flex items-center gap-1 rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 font-medium text-violet-800 dark:border-violet-800 dark:bg-violet-950/50 dark:text-violet-300'
                      >
                        {entity.type === 'sk' && (
                          <FileCheck2 className='h-3 w-3 text-violet-600' />
                        )}
                        {entity.type === 'nomor_surat' && (
                          <FileText className='h-3 w-3 text-blue-600' />
                        )}
                        {entity.type === 'tanggal' && (
                          <Calendar className='h-3 w-3 text-amber-600' />
                        )}
                        {entity.type === 'sop' && (
                          <Layers className='h-3 w-3 text-emerald-600' />
                        )}
                        {entity.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Temuan & Peringatan Dini */}
              {result.findings.length > 0 && (
                <div className='space-y-1.5'>
                  <span className='text-2xs block font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400'>
                    Temuan & Peringatan Dini
                  </span>
                  {result.findings.map((f, idx) => (
                    <div
                      key={idx}
                      className={`flex items-start gap-2 rounded-lg p-2.5 text-xs ${
                        f.type === 'error'
                          ? 'border border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300'
                          : f.type === 'warning'
                            ? 'border border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'
                            : f.type === 'success'
                              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                              : 'border border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-300'
                      }`}
                    >
                      {f.type === 'error' && (
                        <AlertTriangle className='mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-600' />
                      )}
                      {f.type === 'warning' && (
                        <AlertTriangle className='mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600' />
                      )}
                      {f.type === 'success' && (
                        <CheckCircle2 className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600' />
                      )}
                      {f.type === 'info' && (
                        <Info className='mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-600' />
                      )}
                      <div>
                        <strong className='font-semibold'>{f.title}: </strong>
                        <span className='leading-relaxed'>{f.message}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Rekomendasi Perbaikan Instan */}
              {result.recommendations.length > 0 && (
                <div className='rounded-lg border border-violet-100 bg-violet-50/50 p-3 dark:border-violet-900/40 dark:bg-violet-950/20'>
                  <div className='mb-2 flex items-center gap-1.5'>
                    <Sparkles className='h-3.5 w-3.5 text-violet-600 dark:text-violet-400' />
                    <span className='text-2xs font-bold tracking-wider text-violet-900 uppercase dark:text-violet-300'>
                      Rekomendasi Perbaikan Instan
                    </span>
                  </div>
                  <ul className='text-2xs list-inside list-disc space-y-1 leading-relaxed text-violet-950 dark:text-violet-200'>
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Footer Timestamp */}
              <div className='text-2xs flex items-center justify-between pt-1 text-gray-400'>
                <span>
                  Dianalisis pada{' '}
                  {new Date(result.timestamp).toLocaleTimeString('id-ID', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </span>
                <Button
                  type='button'
                  variant='ghost'
                  size='sm'
                  onClick={handleCheck}
                  disabled={isPending}
                  className='text-2xs h-6 text-violet-600 hover:text-violet-800 dark:text-violet-400'
                >
                  Uji Ulang
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
