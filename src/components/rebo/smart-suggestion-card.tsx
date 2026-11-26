'use client';

import React, { useState, useTransition } from 'react';
import {
  Lightbulb,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck,
  BookmarkCheck,
  FileText,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getSmartSuggestionAction } from '@/actions/ai-actions';
import type {
  SmartSuggestionItem,
  SmartSuggestionMatchResult
} from '@/lib/ai/smart-suggestions';

interface SmartSuggestionCardProps {
  pertanyaan: {
    id_pertanyaan: string;
    nomor_pertanyaan?: string;
    uraian_pertanyaan: string;
    deskripsi_pertanyaan?: string | null;
  };
  pilarId?: string;
  catatan?: string;
  onApplyNarration?: (narration: string) => void;
  disabled?: boolean;
}

export function SmartSuggestionCard({
  pertanyaan,
  pilarId,
  catatan = '',
  onApplyNarration,
  disabled = false
}: SmartSuggestionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [matchResult, setMatchResult] =
    useState<SmartSuggestionMatchResult | null>(null);
  const [selectedItem, setSelectedItem] = useState<SmartSuggestionItem | null>(
    null
  );
  const [hasCopied, setHasCopied] = useState(false);
  const [isApplied, setIsApplied] = useState(false);

  // Load smart suggestion on demand or when opened
  const loadSuggestion = () => {
    startTransition(async () => {
      const res = await getSmartSuggestionAction({
        id_pertanyaan: pertanyaan.id_pertanyaan,
        pilar_id: pilarId,
        judul_pertanyaan: pertanyaan.uraian_pertanyaan,
        penjelasan: catatan
      });

      if (res.success && res.data) {
        setMatchResult(res.data);
        setSelectedItem(res.data.suggestion);
      } else {
        toast.error('Gagal memuat rekomendasi bukti dukung.');
      }
    });
  };

  const toggleOpen = () => {
    if (!isOpen && !matchResult) {
      loadSuggestion();
    }
    setIsOpen((prev) => !prev);
  };

  const handleApplyNarration = (narrationText: string) => {
    if (onApplyNarration) {
      onApplyNarration(narrationText);
      setIsApplied(true);
      toast.success(
        'Contoh narasi standar TPI berhasil diterapkan ke formulir catatan operator!'
      );
      setTimeout(() => setIsApplied(false), 3000);
    }
  };

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setHasCopied(true);
      toast.success('Contoh narasi berhasil disalin ke papan klip.');
      setTimeout(() => setHasCopied(false), 2000);
    }
  };

  return (
    <div className='overflow-hidden rounded-xl border border-amber-200/90 bg-gradient-to-r from-amber-50/70 via-orange-50/30 to-amber-50/50 shadow-xs transition-all dark:border-amber-900/60 dark:from-amber-950/20 dark:via-gray-900 dark:to-orange-950/20'>
      {/* HEADER BAR */}
      <div className='flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center'>
        <div className='flex items-start gap-3'>
          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:bg-amber-400/10 dark:text-amber-400'>
            <Lightbulb className='h-5 w-5 animate-pulse text-amber-600 dark:text-amber-400' />
          </div>
          <div>
            <div className='flex flex-wrap items-center gap-2'>
              <h4 className='text-sm font-bold tracking-tight text-amber-950 dark:text-amber-100'>
                Smart Suggestion: Bukti Dukung Serupa Lolos TPI BPS RI
              </h4>
              <Badge
                variant='outline'
                className='text-2xs border-emerald-300 bg-emerald-50 px-2 py-0 font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
              >
                <BookmarkCheck className='mr-1 h-3 w-3' />
                Zero Revision Standard
              </Badge>
            </div>
            <p className='mt-0.5 text-xs text-amber-900/80 dark:text-amber-300/80'>
              Rekomendasi daftar berkas wajib, narasi terbukti disetujui, dan
              tips pencegahan catatan revisi penilai.
            </p>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            size='sm'
            onClick={toggleOpen}
            disabled={disabled || isPending}
            className='inline-flex items-center gap-1.5 rounded-lg border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-xs hover:bg-amber-100/70 hover:text-amber-950 dark:border-amber-700 dark:bg-gray-800 dark:text-amber-200 dark:hover:bg-gray-700'
          >
            {isPending ? (
              <>
                <Loader2 className='h-3.5 w-3.5 animate-spin text-amber-600' />
                <span>Mencocokkan Referensi...</span>
              </>
            ) : isOpen ? (
              <>
                <span>Tutup Rekomendasi</span>
                <ChevronUp className='h-3.5 w-3.5 text-amber-700 dark:text-amber-300' />
              </>
            ) : (
              <>
                <Sparkles className='h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
                <span>Lihat Rekomendasi Bukti Terbaik TPI</span>
                <ChevronDown className='h-3.5 w-3.5 text-amber-700 dark:text-amber-300' />
              </>
            )}
          </Button>
        </div>
      </div>

      {/* EXPANDABLE CONTENT BODY */}
      {isOpen && (
        <div className='border-t border-amber-200/80 bg-white/95 p-5 text-gray-800 dark:border-amber-900/50 dark:bg-gray-900/95 dark:text-gray-100'>
          {isPending && !selectedItem ? (
            <div className='flex flex-col items-center justify-center py-8 text-center'>
              <Loader2 className='h-8 w-8 animate-spin text-amber-500' />
              <p className='mt-2 text-xs font-medium text-gray-500 dark:text-gray-400'>
                Menganalisis indikator dan mencari praktik terbaik bukti
                dukung...
              </p>
            </div>
          ) : selectedItem ? (
            <div className='space-y-6'>
              {/* META BANNER */}
              <div className='flex flex-col justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50/60 p-3.5 sm:flex-row sm:items-center dark:border-amber-900/40 dark:bg-amber-950/20'>
                <div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='text-2xs rounded-md bg-amber-200/80 px-2 py-0.5 font-bold text-amber-900 uppercase dark:bg-amber-900/50 dark:text-amber-200'>
                      Pilar {selectedItem.pilarId}: {selectedItem.pilarName}
                    </span>
                    <span className='text-xs font-bold text-gray-900 dark:text-gray-100'>
                      {selectedItem.title}
                    </span>
                  </div>
                  <p className='mt-1 text-xs text-gray-600 dark:text-gray-400'>
                    {selectedItem.description}
                  </p>
                </div>

                <div className='flex flex-wrap items-center gap-1.5 self-start sm:self-center'>
                  <Badge
                    variant='secondary'
                    className='text-2xs bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  >
                    Status: {selectedItem.approvalStatus} (Tahun{' '}
                    {selectedItem.sampleYear})
                  </Badge>
                  {matchResult && matchResult.matchScore > 0 && (
                    <Badge
                      variant='outline'
                      className='text-2xs border-blue-200 bg-blue-50 font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
                    >
                      Kesesuaian: {matchResult.matchScore}%
                    </Badge>
                  )}
                </div>
              </div>

              {/* ALTERNATIVE SUGGESTIONS SELECTOR (IF MULTIPLE MATCHES IN PILAR) */}
              {matchResult && matchResult.allSuggestionsForPilar.length > 1 && (
                <div className='flex flex-wrap items-center gap-2 border-b border-gray-100 pb-3 text-xs dark:border-gray-800'>
                  <span className='font-semibold text-gray-500 dark:text-gray-400'>
                    Referensi Indikator Terkait di Pilar {selectedItem.pilarId}:
                  </span>
                  <div className='flex flex-wrap gap-1.5'>
                    {matchResult.allSuggestionsForPilar.map((subItem) => {
                      const isCurrent = subItem.id === selectedItem.id;
                      return (
                        <button
                          key={subItem.id}
                          type='button'
                          onClick={() => setSelectedItem(subItem)}
                          className={`text-2xs rounded-md px-2.5 py-1 font-semibold transition-all ${
                            isCurrent
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {subItem.category}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION A: DAFTAR DOKUMEN STANDAR YANG WAJIB ADA & DISUKAI TPI */}
              <div>
                <div className='mb-2.5 flex items-center gap-2'>
                  <FileCheck2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                  <h5 className='text-xs font-bold text-gray-900 uppercase dark:text-gray-100'>
                    1. Checklist Dokumen Bukti yang Wajib Dilampirkan (Disukai
                    TPI BPS RI)
                  </h5>
                </div>

                <div className='grid gap-2 sm:grid-cols-2'>
                  {selectedItem.recommendedDocuments.map((doc, idx) => (
                    <div
                      key={idx}
                      className={`flex flex-col justify-between rounded-lg border p-3 text-xs transition-all ${
                        doc.isMandatory
                          ? 'border-amber-200/90 bg-amber-50/40 dark:border-amber-900/50 dark:bg-amber-950/20'
                          : 'border-gray-200 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/40'
                      }`}
                    >
                      <div>
                        <div className='mb-1 flex items-start justify-between gap-2'>
                          <span className='font-semibold text-gray-900 dark:text-gray-100'>
                            {doc.name}
                          </span>
                          <span
                            className={`text-3xs shrink-0 rounded px-1.5 py-0.5 font-bold uppercase ${
                              doc.isMandatory
                                ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                                : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                            }`}
                          >
                            {doc.isMandatory ? 'Wajib Ada' : 'Dianjurkan'}
                          </span>
                        </div>
                        <p className='text-2xs text-gray-600 dark:text-gray-400'>
                          {doc.description}
                        </p>
                      </div>

                      <div className='text-3xs mt-2.5 flex items-center gap-1.5 border-t border-gray-100 pt-1.5 text-gray-500 dark:border-gray-800 dark:text-gray-400'>
                        <span className='font-medium'>Kategori Tipe:</span>
                        <span className='rounded bg-white px-1.5 py-0.5 font-semibold text-gray-700 shadow-2xs dark:bg-gray-700 dark:text-gray-200'>
                          {doc.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION B: CONTOH NARASI TERBUKTI LOLOS (STANDAR BPS SITARO) */}
              <div>
                <div className='mb-2 flex items-center justify-between'>
                  <div className='flex items-center gap-2'>
                    <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                    <h5 className='text-xs font-bold text-gray-900 uppercase dark:text-gray-100'>
                      2. Contoh Narasi Penjelasan Terbaik (Standar BPS Sitaro
                      Terbukti Lolos TPI)
                    </h5>
                  </div>

                  <div className='flex items-center gap-1.5'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      onClick={() => handleCopy(selectedItem.provenNarration)}
                      className='text-2xs h-7 px-2 text-gray-600 hover:text-gray-900 dark:text-gray-300'
                      title='Salin ke papan klip'
                    >
                      {hasCopied ? (
                        <>
                          <Check className='mr-1 h-3 w-3 text-emerald-600' />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className='mr-1 h-3 w-3' />
                          <span>Salin Teks</span>
                        </>
                      )}
                    </Button>

                    <Button
                      type='button'
                      size='sm'
                      onClick={() =>
                        handleApplyNarration(selectedItem.provenNarration)
                      }
                      disabled={disabled || !onApplyNarration}
                      className='text-2xs h-7 bg-blue-600 px-3 font-semibold text-white shadow-xs hover:bg-blue-700'
                    >
                      {isApplied ? (
                        <>
                          <Check className='mr-1 h-3 w-3' />
                          <span>Diterapkan!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className='mr-1 h-3 w-3' />
                          <span>Gunakan Contoh Narasi Ini</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                <div className='relative rounded-lg border border-blue-200/80 bg-blue-50/40 p-4 text-xs leading-relaxed text-blue-950 dark:border-blue-900/60 dark:bg-blue-950/20 dark:text-blue-100'>
                  <p className='font-mono italic select-all'>
                    &ldquo;{selectedItem.provenNarration}&rdquo;
                  </p>
                  <p className='text-3xs mt-2 text-blue-700/80 dark:text-blue-300/80'>
                    * Tip: Klik &ldquo;Gunakan Contoh Narasi Ini&rdquo; untuk
                    mengisi formulir penjelasan operator secara instan, lalu
                    sesuaikan nomor surat dan tanggal dengan dokumen riil Anda.
                  </p>
                </div>
              </div>

              {/* SECTION C: TIPS KELULUSAN EVALUASI TPI BPS RI */}
              <div>
                <div className='mb-2.5 flex items-center gap-2'>
                  <ShieldCheck className='h-4 w-4 text-rose-600 dark:text-rose-400' />
                  <h5 className='text-xs font-bold text-gray-900 uppercase dark:text-gray-100'>
                    3. Tips Kelulusan Evaluasi TPI BPS RI (Poin Kritis Pencegah
                    Revisi)
                  </h5>
                </div>

                <div className='space-y-2.5'>
                  {selectedItem.tpiTips.map((tip, idx) => (
                    <div
                      key={idx}
                      className='flex items-start gap-3 rounded-lg border border-rose-100 bg-rose-50/40 p-3 text-xs dark:border-rose-950/50 dark:bg-rose-950/20'
                    >
                      <AlertTriangle className='mt-0.5 h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400' />
                      <div className='space-y-1'>
                        <div className='font-bold text-rose-950 dark:text-rose-200'>
                          {tip.point}
                        </div>
                        <div className='text-2xs text-rose-900/80 dark:text-rose-300/80'>
                          <span className='font-semibold'>
                            Risiko Catatan:{' '}
                          </span>
                          {tip.risk}
                        </div>
                        <div className='text-2xs font-medium text-emerald-800 dark:text-emerald-300'>
                          <span className='font-semibold'>Solusi Lolos: </span>
                          {tip.solution}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SECTION D: FORMAT RESMI & CATATAN PENILAI */}
              {selectedItem.tpiApprovalNotes && (
                <div className='text-2xs flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-2.5 text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/20 dark:text-emerald-200'>
                  <BookmarkCheck className='h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
                  <div>
                    <span className='font-semibold'>
                      Catatan Evaluator TPI Terdahulu:{' '}
                    </span>
                    <span>{selectedItem.tpiApprovalNotes}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className='py-6 text-center text-xs text-gray-500'>
              Tidak ditemukan saran untuk indikator ini.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
