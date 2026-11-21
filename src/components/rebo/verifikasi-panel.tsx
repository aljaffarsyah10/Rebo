'use client';

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  UserCheck,
  Calendar,
  Sparkles,
  Save,
  Loader2,
  MessageSquare,
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  STATUS_KELENGKAPAN,
  STATUS_KELENGKAPAN_MAP,
  type Pertanyaan,
  type BuktiDukung,
  type StatusKelengkapan
} from '@/types/rebo';
import { submitVerifikasiAction } from '@/actions/verifikasi-actions';

interface VerifikasiPanelProps {
  pertanyaan: Pertanyaan;
  bukti?: BuktiDukung | null;
  canVerify?: boolean;
  activePeriodeId?: string;
  onVerifikasiSuccess?: (updatedData: Partial<BuktiDukung>) => void;
}

export default function VerifikasiPanel({
  pertanyaan,
  bukti,
  canVerify = false,
  activePeriodeId,
  onVerifikasiSuccess
}: VerifikasiPanelProps) {
  // Nilai mandiri dari penilaian operator
  const nilaiMandiri = Number(bukti?.nilai_mandiri ?? bukti?.nilai_akhir ?? 0);

  // Status kelengkapan saat ini
  const rawStatus = bukti?.status_kelengkapan;
  const currentStatus: StatusKelengkapan =
    rawStatus !== null &&
    rawStatus !== undefined &&
    Number(rawStatus) in STATUS_KELENGKAPAN_MAP
      ? (Number(rawStatus) as StatusKelengkapan)
      : 0;

  // Nilai verifikasi saat ini (default: nilai_verifikasi atau fallback ke nilai_mandiri jika status disetujui)
  const currentNilaiVerifikasi =
    bukti?.nilai_verifikasi !== null && bukti?.nilai_verifikasi !== undefined
      ? Number(bukti.nilai_verifikasi)
      : currentStatus === 2
        ? nilaiMandiri
        : 0;

  // State form verifikasi
  const [selectedStatus, setSelectedStatus] =
    useState<StatusKelengkapan>(currentStatus);
  const [nilaiVerifikasiInput, setNilaiVerifikasiInput] = useState<string>(
    currentNilaiVerifikasi > 0 ? String(currentNilaiVerifikasi) : ''
  );
  const [catatan, setCatatan] = useState<string>(
    bukti?.catatan_koordinator || ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Sinkronisasi state internal jika props bukti diperbarui dari luar
  useEffect(() => {
    setSelectedStatus(currentStatus);
    setNilaiVerifikasiInput(
      currentNilaiVerifikasi > 0 ? String(currentNilaiVerifikasi) : ''
    );
    setCatatan(bukti?.catatan_koordinator || '');
    setValidationError(null);
  }, [currentStatus, currentNilaiVerifikasi, bukti?.catatan_koordinator]);

  // Tombol aksi cepat: Samakan dengan skor mandiri
  const handleCopyMandiriScore = () => {
    setNilaiVerifikasiInput(String(nilaiMandiri));
    toast.info(
      `Nilai verifikasi disamakan dengan skor mandiri (${nilaiMandiri}).`
    );
  };

  // Handler pemilihan status cepat
  const handleSelectStatus = (status: StatusKelengkapan) => {
    setSelectedStatus(status);
    setValidationError(null);

    // Otomatisasi cerdas: jika memilih Disetujui dan nilai verifikasi masih kosong, isi dengan nilai mandiri
    if (status === STATUS_KELENGKAPAN.DISETUJUI && !nilaiVerifikasiInput) {
      setNilaiVerifikasiInput(String(nilaiMandiri));
    }
  };

  // Submit verifikasi
  const handleSaveVerifikasi = async () => {
    setValidationError(null);

    // Validasi Client-side Aturan Bisnis Kritis:
    // Jika status = 3 (Perlu Revisi), catatan koordinator WAJIB diisi minimal 5 karakter
    if (selectedStatus === STATUS_KELENGKAPAN.PERLU_REVISI) {
      if (!catatan || catatan.trim().length < 5) {
        const errorMsg =
          'Catatan revisi wajib diisi minimal 5 karakter untuk memberikan instruksi perbaikan kepada tim operator.';
        setValidationError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    const numericNilaiVerifikasi = Number(nilaiVerifikasiInput) || 0;
    if (numericNilaiVerifikasi < 0) {
      const errorMsg = 'Nilai verifikasi tidak boleh bernilai negatif.';
      setValidationError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Menyimpan hasil verifikasi...');

    try {
      const result = await submitVerifikasiAction({
        id_pertanyaan: pertanyaan.id_pertanyaan,
        id_periode: activePeriodeId,
        status_kelengkapan: selectedStatus,
        nilai_verifikasi: numericNilaiVerifikasi,
        catatan_koordinator: catatan
      });

      if (!result.success) {
        toast.error(result.error || 'Gagal menyimpan verifikasi.', {
          id: toastId
        });
        setIsSubmitting(false);
        return;
      }

      toast.success(result.message || 'Verifikasi berhasil disimpan!', {
        id: toastId
      });

      // Update parent state
      if (onVerifikasiSuccess) {
        onVerifikasiSuccess({
          status_kelengkapan: selectedStatus,
          nilai_verifikasi: numericNilaiVerifikasi,
          catatan_koordinator: catatan,
          verified_by: result.verifiedBy,
          verified_at: result.verifiedAt
        });
      }
    } catch (err: any) {
      toast.error(
        err?.message || 'Terjadi kesalahan sistem saat menyimpan verifikasi.',
        { id: toastId }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format tanggal & jam verifikasi
  const formatDateTime = (isoString?: string | null) => {
    if (!isoString) return null;
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const formattedVerifiedAt = formatDateTime(bukti?.verified_at);
  const statusInfo =
    STATUS_KELENGKAPAN_MAP[currentStatus] || STATUS_KELENGKAPAN_MAP[0];

  // ==============================================================================
  // 1. TAMPILAN READ-ONLY: UNTUK OPERATOR & PENGGUNA TANPA HAK VERIFIKASI
  // ==============================================================================
  if (!canVerify) {
    // Jika belum diverifikasi dan tidak ada catatan revisi
    const isReviewed = currentStatus === 2 || currentStatus === 3;

    return (
      <div className='mt-5 rounded-xl border border-gray-200 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-900/60'>
        <div className='flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-800'>
          <div className='flex items-center gap-2'>
            <ShieldCheck className='h-4 w-4 text-blue-600 dark:text-blue-400' />
            <span className='text-xs font-bold tracking-wide text-gray-800 uppercase dark:text-gray-200'>
              Status Evaluasi & Hasil Verifikasi
            </span>
          </div>

          <Badge
            variant='outline'
            className={`text-xs font-semibold ${statusInfo.badgeClass}`}
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Ringkasan Skor Verifikasi vs Usulan */}
        <div className='mt-3.5 grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-800/80'>
            <span className='text-2xs text-gray-500 uppercase dark:text-gray-400'>
              Nilai Mandiri (Usulan Tim)
            </span>
            <div className='mt-1 text-base font-bold text-gray-900 dark:text-gray-100'>
              {nilaiMandiri.toFixed(2)}
            </div>
          </div>

          <div className='rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-800/80'>
            <span className='text-2xs text-gray-500 uppercase dark:text-gray-400'>
              Nilai Verifikasi (Disetujui TPI/Koordinator)
            </span>
            <div className='mt-1 text-base font-bold text-emerald-600 dark:text-emerald-400'>
              {isReviewed
                ? Number(bukti?.nilai_verifikasi ?? 0).toFixed(2)
                : 'Menunggu Verifikasi'}
            </div>
          </div>
        </div>

        {/* Catatan Koordinator / Rekomendasi TPI */}
        {bukti?.catatan_koordinator ? (
          <div
            className={`mt-3.5 rounded-lg border p-3.5 text-xs leading-relaxed ${
              currentStatus === 3
                ? 'border-rose-200 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-200'
                : 'border-blue-100 bg-blue-50/60 text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200'
            }`}
          >
            <div className='mb-1 flex items-center gap-1.5 font-semibold'>
              <MessageSquare className='h-3.5 w-3.5 shrink-0' />
              <span>
                {currentStatus === 3
                  ? 'Catatan Perbaikan / Poin Revisi Koordinator:'
                  : 'Catatan & Rekomendasi Koordinator:'}
              </span>
            </div>
            <p className='pl-5 whitespace-pre-wrap'>
              {bukti.catatan_koordinator}
            </p>
          </div>
        ) : (
          <div className='mt-3 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
            <HelpCircle className='h-3.5 w-3.5' />
            <span>Belum ada catatan atau rekomendasi dari koordinator.</span>
          </div>
        )}

        {/* Metadata Verifikator */}
        {(bukti?.verified_by || formattedVerifiedAt) && (
          <div className='text-2xs mt-3 flex flex-wrap items-center gap-4 text-gray-500 dark:text-gray-400'>
            {bukti?.verified_by && (
              <div className='flex items-center gap-1'>
                <UserCheck className='h-3.5 w-3.5 text-blue-500' />
                <span>
                  Diverifikasi oleh:{' '}
                  <strong className='font-semibold text-gray-700 dark:text-gray-300'>
                    {bukti.verified_by}
                  </strong>
                </span>
              </div>
            )}
            {formattedVerifiedAt && (
              <div className='flex items-center gap-1'>
                <Calendar className='h-3.5 w-3.5 text-blue-500' />
                <span>Waktu verifikasi: {formattedVerifiedAt}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // ==============================================================================
  // 2. TAMPILAN INTERAKTIF: UNTUK VERIFIKATOR (KOORDINATOR PILAR / TPI / ADMIN)
  // ==============================================================================
  return (
    <div className='mt-6 rounded-2xl border-2 border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-5 shadow-sm dark:border-blue-900/60 dark:from-blue-950/20 dark:to-gray-900'>
      {/* Header Panel Verifikasi */}
      <div className='flex flex-col justify-between gap-2 border-b border-blue-100 pb-3 sm:flex-row sm:items-center dark:border-blue-900/40'>
        <div className='flex items-center gap-2'>
          <div className='flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white shadow-xs'>
            <ShieldCheck className='h-4 w-4' />
          </div>
          <div>
            <h4 className='text-sm font-bold text-gray-900 dark:text-gray-100'>
              Panel Evaluasi & Verifikasi Bukti
            </h4>
            <p className='text-2xs text-gray-500 dark:text-gray-400'>
              Tinjau dokumen bukti, tetapkan status persetujuan, dan berikan
              skor verifikasi.
            </p>
          </div>
        </div>

        {/* Metadata verifikasi terdahulu */}
        {formattedVerifiedAt && (
          <div className='text-2xs flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
            <Calendar className='h-3 w-3 text-blue-500' />
            <span>Terakhir diverifikasi: {formattedVerifiedAt}</span>
            {bukti?.verified_by && (
              <span className='font-medium text-gray-700 dark:text-gray-300'>
                ({bukti.verified_by})
              </span>
            )}
          </div>
        )}
      </div>

      <div className='mt-4 space-y-4'>
        {/* Tombol Status Cepat */}
        <div>
          <Label className='text-xs font-semibold text-gray-800 dark:text-gray-200'>
            Pilih Status Persetujuan:
          </Label>
          <div className='mt-2 grid grid-cols-1 gap-2.5 sm:grid-cols-3'>
            {/* Status 2: Disetujui */}
            <button
              type='button'
              onClick={() => handleSelectStatus(STATUS_KELENGKAPAN.DISETUJUI)}
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                selectedStatus === STATUS_KELENGKAPAN.DISETUJUI
                  ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm ring-2 ring-emerald-500/20 dark:bg-emerald-600'
                  : 'border-emerald-200 bg-emerald-50/60 text-emerald-800 hover:bg-emerald-100 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
              }`}
            >
              <CheckCircle2 className='h-4 w-4' />
              <span>Disetujui (Approved)</span>
            </button>

            {/* Status 3: Perlu Revisi */}
            <button
              type='button'
              onClick={() =>
                handleSelectStatus(STATUS_KELENGKAPAN.PERLU_REVISI)
              }
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                selectedStatus === STATUS_KELENGKAPAN.PERLU_REVISI
                  ? 'border-rose-500 bg-rose-500 text-white shadow-sm ring-2 ring-rose-500/20 dark:bg-rose-600'
                  : 'border-rose-200 bg-rose-50/60 text-rose-800 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300'
              }`}
            >
              <AlertTriangle className='h-4 w-4' />
              <span>Perlu Revisi (Rejected)</span>
            </button>

            {/* Status 1: Menunggu Review */}
            <button
              type='button'
              onClick={() =>
                handleSelectStatus(STATUS_KELENGKAPAN.MENUNGGU_REVIEW)
              }
              className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all ${
                selectedStatus === STATUS_KELENGKAPAN.MENUNGGU_REVIEW
                  ? 'border-amber-500 bg-amber-500 text-white shadow-sm ring-2 ring-amber-500/20 dark:bg-amber-600'
                  : 'border-amber-200 bg-amber-50/60 text-amber-800 hover:bg-amber-100 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-300'
              }`}
            >
              <Clock className='h-4 w-4' />
              <span>Menunggu Review</span>
            </button>
          </div>
        </div>

        {/* Input Skor Verifikasi & Opsi Cepat */}
        <div className='rounded-xl border border-gray-200 bg-white p-3.5 dark:border-gray-800 dark:bg-gray-800/80'>
          <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
            <div className='space-y-0.5'>
              <Label
                htmlFor={`nilai-verifikasi-${pertanyaan.id_pertanyaan}`}
                className='text-xs font-semibold text-gray-800 dark:text-gray-200'
              >
                Tetapkan Nilai Verifikasi:
              </Label>
              <p className='text-2xs text-gray-500 dark:text-gray-400'>
                Skor mandiri usulan tim kerja saat ini:{' '}
                <strong className='font-semibold text-blue-600 dark:text-blue-400'>
                  {nilaiMandiri.toFixed(2)}
                </strong>
              </p>
            </div>

            <div className='flex items-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={handleCopyMandiriScore}
                className='text-2xs h-8 text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40'
              >
                <Sparkles className='mr-1 h-3.5 w-3.5 text-blue-500' />
                Samakan dg Skor Mandiri
              </Button>

              <div className='w-28'>
                <Input
                  id={`nilai-verifikasi-${pertanyaan.id_pertanyaan}`}
                  type='number'
                  step='any'
                  min='0'
                  placeholder='0.00'
                  value={nilaiVerifikasiInput}
                  onChange={(e) => setNilaiVerifikasiInput(e.target.value)}
                  className='h-8 text-right font-mono text-xs font-bold'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Textarea Catatan Koordinator */}
        <div className='space-y-1.5'>
          <div className='flex items-center justify-between'>
            <Label
              htmlFor={`catatan-${pertanyaan.id_pertanyaan}`}
              className='text-xs font-semibold text-gray-800 dark:text-gray-200'
            >
              Catatan Koordinator / Rekomendasi TPI:
              {selectedStatus === STATUS_KELENGKAPAN.PERLU_REVISI && (
                <span className='ml-1 font-bold text-rose-500'>
                  * (Wajib Diisi)
                </span>
              )}
            </Label>
            {selectedStatus === STATUS_KELENGKAPAN.PERLU_REVISI && (
              <span className='text-3xs font-medium text-rose-600 dark:text-rose-400'>
                Min. 5 karakter instruksi perbaikan
              </span>
            )}
          </div>

          <Textarea
            id={`catatan-${pertanyaan.id_pertanyaan}`}
            rows={3}
            placeholder={
              selectedStatus === STATUS_KELENGKAPAN.PERLU_REVISI
                ? 'Jelaskan secara spesifik kekurangan bukti atau tindakan revisi yang harus dilengkapi oleh operator...'
                : 'Berikan apresiasi, catatan kualitas dokumen bukti, atau rekomendasi perbaikan untuk penilaian TPI...'
            }
            value={catatan}
            onChange={(e) => {
              setCatatan(e.target.value);
              if (validationError) setValidationError(null);
            }}
            className={`text-xs leading-relaxed ${
              selectedStatus === STATUS_KELENGKAPAN.PERLU_REVISI
                ? 'border-rose-300 focus-visible:ring-rose-500 dark:border-rose-800'
                : ''
            }`}
          />

          {/* Validation Error Message */}
          {validationError && (
            <div className='flex items-center gap-1.5 text-xs font-medium text-rose-600 dark:text-rose-400'>
              <AlertCircle className='h-3.5 w-3.5 shrink-0' />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Action Button: Simpan Verifikasi */}
        <div className='flex items-center justify-end gap-3 pt-2'>
          <Button
            type='button'
            onClick={handleSaveVerifikasi}
            disabled={isSubmitting}
            className={`h-9 px-5 text-xs font-bold text-white shadow-xs transition-colors ${
              selectedStatus === STATUS_KELENGKAPAN.DISETUJUI
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : selectedStatus === STATUS_KELENGKAPAN.PERLU_REVISI
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                <span>Menyimpan Verifikasi...</span>
              </>
            ) : (
              <>
                <Save className='mr-1.5 h-3.5 w-3.5' />
                <span>Simpan Verifikasi</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
