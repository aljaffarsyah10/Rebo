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
  HelpCircle,
  ExternalLink,
  Eye,
  FolderOpen,
  FileText,
  Send
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
  ZIAPP_STATUS_MAP,
  getEffectiveZIAPPStatus,
  type Pertanyaan,
  type BuktiDukung,
  type StatusKelengkapan,
  type ZIAPPSyncStatus
} from '@/types/rebo';
import { submitVerifikasiAction } from '@/actions/verifikasi-actions';
import {
  markAsReadyForZIAPPAction,
  markAsSyncedToZIAPPAction
} from '@/actions/ziapp-sync-actions';
import { checkBatchGDriveHealthAction } from '@/actions/gdrive-actions';
import {
  GDriveHealthBadge,
  GDriveHealthButton
} from '@/components/rebo/gdrive-health-badge';
import type { GDriveHealthCheckResult } from '@/lib/gdrive/health-checker';
import { QAChecklistCard } from '@/components/rebo/qa-checklist-card';
import { evaluateQAChecklist } from '@/lib/qa/checklist';
import { DocumentPreviewModal } from '@/components/rebo/document-preview-modal';

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

  // State sinkronisasi ZIAPP
  const [ziappStatus, setZiappStatus] = useState<ZIAPPSyncStatus>(
    getEffectiveZIAPPStatus(currentStatus, bukti?.ziapp_status)
  );
  const [isMarkingZIAPP, setIsMarkingZIAPP] = useState(false);

  // Pre-Audit Guard: Health check status state
  const [healthResults, setHealthResults] = useState<
    Record<string, GDriveHealthCheckResult>
  >({});
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    type?: string;
  } | null>(null);

  // Dokumen bukti list & folder resolution
  const dokumenBuktiList: Array<{
    id?: string;
    nama_dokumen: string;
    file_url: string;
    tipe_dokumen?: string | null;
  }> =
    bukti?.dokumen_bukti && bukti.dokumen_bukti.length > 0
      ? bukti.dokumen_bukti
      : pertanyaan.dokumen_bukti && pertanyaan.dokumen_bukti.length > 0
        ? (pertanyaan.dokumen_bukti as any)
        : bukti?.link_bukti && !bukti.link_bukti.includes('/drive/folders')
          ? [
              {
                nama_dokumen: 'Berkas Bukti Dukung',
                file_url: bukti.link_bukti,
                tipe_dokumen: 'Dokumen'
              }
            ]
          : [];

  const indicatorFolderUrl =
    bukti?.gdrive_folder_url ||
    (bukti?.link_bukti &&
    (bukti.link_bukti.includes('/drive/folders') ||
      bukti.link_bukti.includes('drive.google.com/drive/folders'))
      ? bukti.link_bukti
      : null);

  const handleHealthResult = (url: string, result: GDriveHealthCheckResult) => {
    setHealthResults((prev) => ({
      ...prev,
      [url]: result
    }));
  };

  const handleCheckAllHealth = async () => {
    const allUrls: string[] = [];
    if (indicatorFolderUrl) allUrls.push(indicatorFolderUrl);
    dokumenBuktiList.forEach((d) => {
      if (d.file_url) allUrls.push(d.file_url);
    });

    if (allUrls.length === 0) {
      toast.info('Tidak ada tautan Google Drive untuk diperiksa.');
      return;
    }

    setIsCheckingHealth(true);
    const toastId = toast.loading(
      `Memeriksa izin akses ${allUrls.length} tautan bukti...`
    );

    try {
      const res = await checkBatchGDriveHealthAction(allUrls);
      if (res.success && res.results) {
        setHealthResults((prev) => ({
          ...prev,
          ...res.results
        }));

        const restrictedCount = Object.values(res.results).filter(
          (r) => r.status === 'RESTRICTED'
        ).length;

        if (restrictedCount > 0) {
          toast.warning(
            `Pemeriksaan selesai: ${restrictedCount} berkas/folder berstatus TERKUNCI (Restricted). Disarankan meminta revisi kepada operator!`,
            { id: toastId, duration: 6000 }
          );
        } else {
          toast.success(
            `Semua ${allUrls.length} tautan bukti memiliki izin akses terbuka (Anyone with link)!`,
            { id: toastId }
          );
        }
      } else {
        toast.error(res.error || 'Gagal memeriksa izin akses.', {
          id: toastId
        });
      }
    } catch (err: any) {
      toast.error(
        err?.message || 'Terjadi kesalahan sistem saat pemeriksaan.',
        { id: toastId }
      );
    } finally {
      setIsCheckingHealth(false);
    }
  };

  // Sinkronisasi state internal jika props bukti diperbarui dari luar
  useEffect(() => {
    setSelectedStatus(currentStatus);
    setNilaiVerifikasiInput(
      currentNilaiVerifikasi > 0 ? String(currentNilaiVerifikasi) : ''
    );
    setCatatan(bukti?.catatan_koordinator || '');
    setValidationError(null);
    setZiappStatus(getEffectiveZIAPPStatus(currentStatus, bukti?.ziapp_status));
  }, [
    currentStatus,
    currentNilaiVerifikasi,
    bukti?.catatan_koordinator,
    bukti?.ziapp_status
  ]);

  // Handler: Tandai Siap Kirim ke ZIAPP
  const handleMarkReadyForZIAPP = async () => {
    if (currentStatus !== STATUS_KELENGKAPAN.DISETUJUI) {
      toast.error(
        'Indikator harus berstatus Disetujui (Approved) sebelum dapat ditandai Siap Kirim ke ZIAPP.'
      );
      return;
    }

    setIsMarkingZIAPP(true);
    const toastId = toast.loading('Menandai indikator siap kirim ke ZIAPP...');
    try {
      const res = await markAsReadyForZIAPPAction(
        pertanyaan.id_pertanyaan,
        activePeriodeId
      );
      if (res.success) {
        toast.success(res.message || 'Indikator siap dikirim ke ZIAPP!', {
          id: toastId
        });
        setZiappStatus('READY_FOR_ZIAPP');
        if (onVerifikasiSuccess) {
          onVerifikasiSuccess({ ziapp_status: 'READY_FOR_ZIAPP' });
        }
      } else {
        toast.error(res.error || 'Gagal mengubah status ZIAPP.', {
          id: toastId
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.', { id: toastId });
    } finally {
      setIsMarkingZIAPP(false);
    }
  };

  // Handler: Tandai Tersinkron ke ZIAPP
  const handleMarkSyncedToZIAPP = async () => {
    setIsMarkingZIAPP(true);
    const toastId = toast.loading(
      'Menandai indikator telah tersinkron ke ZIAPP...'
    );
    try {
      const res = await markAsSyncedToZIAPPAction(
        pertanyaan.id_pertanyaan,
        activePeriodeId
      );
      if (res.success) {
        toast.success(res.message || 'Tersinkron ke Web Pusat ZIAPP!', {
          id: toastId
        });
        setZiappStatus('SYNCED_TO_ZIAPP');
        if (onVerifikasiSuccess) {
          onVerifikasiSuccess({ ziapp_status: 'SYNCED_TO_ZIAPP' });
        }
      } else {
        toast.error(res.error || 'Gagal memperbarui status ZIAPP.', {
          id: toastId
        });
      }
    } catch (err: any) {
      toast.error(err?.message || 'Terjadi kesalahan sistem.', { id: toastId });
    } finally {
      setIsMarkingZIAPP(false);
    }
  };

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

    // Pre-Audit Guard: Peringatan jika koordinator menyetujui dokumen yang belum memenuhi QA Checklist atau izin terkunci
    if (selectedStatus === STATUS_KELENGKAPAN.DISETUJUI) {
      const qaResult = evaluateQAChecklist(dokumenBuktiList);
      if (!qaResult.isComplete) {
        const confirmQA = window.confirm(
          `Peringatan QA Checklist: Dokumen standar belum lengkap (${qaResult.fulfilledCount}/${qaResult.totalRequired} terpenuhi).\n\nDokumen yang belum terdeteksi:\n- ${qaResult.missingLabels.join('\n- ')}\n\nDisarankan meminta operator melengkapi dokumen sebelum disetujui.\nApakah Anda yakin tetap ingin Menyetujui (Approve) indikator ini?`
        );
        if (!confirmQA) return;
      }

      const restrictedDocs = dokumenBuktiList.filter(
        (d) => healthResults[d.file_url]?.status === 'RESTRICTED'
      );
      if (restrictedDocs.length > 0) {
        const confirmApprove = window.confirm(
          `Peringatan Pre-Audit Guard: Terdeteksi ${restrictedDocs.length} berkas bukti dengan Izin Akses Terkunci (Restricted).\n\nPenilai eksternal (TPI/Pusat) tidak akan dapat membaca dokumen ini jika izin belum diubah menjadi publik.\nDisarankan untuk memilih "Perlu Revisi" agar operator membuka akses terlebih dahulu.\n\nApakah Anda yakin tetap ingin Menyetujui (Approve) indikator ini?`
        );
        if (!confirmApprove) return;
      }
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

          <div className='flex flex-wrap items-center gap-2'>
            <Badge
              variant='outline'
              className={`text-xs font-semibold ${statusInfo.badgeClass}`}
            >
              {statusInfo.label}
            </Badge>

            <Badge
              variant='outline'
              className={`text-xs font-semibold ${ZIAPP_STATUS_MAP[ziappStatus].badgeClass}`}
              title={`Status Sinkronisasi ZIAPP: ${ZIAPP_STATUS_MAP[ziappStatus].description}`}
            >
              <Send className='mr-1 h-3 w-3' />
              {ZIAPP_STATUS_MAP[ziappStatus].label}
            </Badge>
          </div>
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

        {/* Pre-Audit QA Checklist (Read-Only) */}
        {dokumenBuktiList.length > 0 && (
          <QAChecklistCard
            dokumenList={dokumenBuktiList}
            compact={true}
            className='mt-3.5'
          />
        )}

        {/* Pratinjau Dokumen Bukti & Izin Akses (Read-Only) */}
        {dokumenBuktiList.length > 0 && (
          <div className='mt-3.5 rounded-lg border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-800/80'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-2xs font-semibold text-gray-500 uppercase dark:text-gray-400'>
                Dokumen Bukti Terlampir ({dokumenBuktiList.length})
              </span>
              <Button
                type='button'
                size='sm'
                variant='ghost'
                onClick={handleCheckAllHealth}
                disabled={isCheckingHealth}
                className='text-3xs h-6 px-2 font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40'
              >
                {isCheckingHealth ? (
                  <>
                    <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                    <span>Memeriksa...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className='mr-1 h-3 w-3' />
                    <span>Periksa Izin Akses</span>
                  </>
                )}
              </Button>
            </div>
            <div className='space-y-1.5'>
              {dokumenBuktiList.map((doc, idx) => (
                <div
                  key={doc.id || `ro-doc-${idx}`}
                  className='flex items-center justify-between gap-2 rounded border border-gray-100 bg-gray-50/60 p-2 text-xs dark:border-gray-700/60 dark:bg-gray-900/40'
                >
                  <div className='flex min-w-0 items-center gap-2'>
                    <FileText className='h-3.5 w-3.5 shrink-0 text-indigo-500' />
                    <span className='truncate font-medium text-gray-800 dark:text-gray-200'>
                      {doc.nama_dokumen}
                    </span>
                    {healthResults[doc.file_url] && (
                      <GDriveHealthBadge
                        status={healthResults[doc.file_url].status}
                        message={healthResults[doc.file_url].message}
                        compact={true}
                      />
                    )}
                  </div>
                  <a
                    href={doc.file_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-3xs inline-flex shrink-0 items-center gap-1 text-blue-600 hover:underline'
                  >
                    <span>Buka</span>
                    <ExternalLink className='h-2.5 w-2.5' />
                  </a>
                </div>
              ))}
            </div>
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
        {/* Pre-Audit QA Checklist (5 Dokumen Kunci) */}
        <QAChecklistCard dokumenList={dokumenBuktiList} />

        {/* Pre-Audit Guard: Pratinjau Dokumen & Pemeriksaan Izin Akses */}
        <div className='rounded-xl border border-blue-200/80 bg-white p-4 shadow-2xs dark:border-blue-900/50 dark:bg-gray-800/80'>
          <div className='flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2.5 dark:border-gray-700/60'>
            <div className='flex items-center gap-2'>
              <ShieldCheck className='h-4 w-4 text-blue-600 dark:text-blue-400' />
              <span className='text-xs font-bold text-gray-800 dark:text-gray-200'>
                Kesiapan Dokumen Bukti & Izin Akses Google Drive
              </span>
              <Badge variant='secondary' className='text-3xs'>
                {dokumenBuktiList.length} Berkas
              </Badge>
            </div>

            {(dokumenBuktiList.length > 0 || indicatorFolderUrl) && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleCheckAllHealth}
                disabled={isCheckingHealth}
                className='text-2xs h-7 border-blue-200 font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40'
              >
                {isCheckingHealth ? (
                  <>
                    <Loader2 className='mr-1.5 h-3 w-3 animate-spin' />
                    <span>Memeriksa Akses...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className='mr-1.5 h-3 w-3 text-blue-600' />
                    <span>Uji Izin Semua Berkas</span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* List of Evidence Documents */}
          <div className='mt-3 space-y-2'>
            {indicatorFolderUrl && (
              <div className='flex flex-col justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/40 p-2.5 text-xs sm:flex-row sm:items-center dark:border-blue-900/30 dark:bg-blue-950/20'>
                <div className='flex min-w-0 items-center gap-2'>
                  <FolderOpen className='h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400' />
                  <div className='min-w-0'>
                    <div className='flex flex-wrap items-center gap-1.5'>
                      <span className='font-semibold text-gray-800 dark:text-gray-200'>
                        Folder Google Drive Indikator
                      </span>
                      {healthResults[indicatorFolderUrl] && (
                        <GDriveHealthBadge
                          status={healthResults[indicatorFolderUrl].status}
                          message={healthResults[indicatorFolderUrl].message}
                          statusCode={
                            healthResults[indicatorFolderUrl].statusCode
                          }
                          compact={true}
                        />
                      )}
                    </div>
                    <div className='text-3xs truncate text-gray-500 dark:text-gray-400'>
                      {indicatorFolderUrl}
                    </div>
                  </div>
                </div>

                <div className='flex shrink-0 items-center gap-2'>
                  <GDriveHealthButton
                    url={indicatorFolderUrl}
                    label='Cek Folder'
                    size='xs'
                    currentResult={healthResults[indicatorFolderUrl]}
                    onResult={(res) =>
                      handleHealthResult(indicatorFolderUrl, res)
                    }
                    showBadge={false}
                  />
                  <button
                    type='button'
                    onClick={() =>
                      setPreviewDoc({
                        url: indicatorFolderUrl,
                        title: `Folder Bukti Indikator: ${pertanyaan.nomor_pertanyaan || 'Direktori Google Drive'}`,
                        type: 'Folder Google Drive'
                      })
                    }
                    className='text-2xs inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50/70 px-2 py-1 font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
                    title='Pratinjau Isi Folder di Aplikasi'
                  >
                    <Eye className='h-3 w-3' />
                    <span>Pratinjau</span>
                  </button>
                  <a
                    href={indicatorFolderUrl}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-2xs inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                  >
                    <ExternalLink className='h-3 w-3' />
                    <span>Buka Folder</span>
                  </a>
                </div>
              </div>
            )}

            {dokumenBuktiList.length === 0 && !indicatorFolderUrl ? (
              <p className='text-2xs text-gray-500 italic dark:text-gray-400'>
                Belum ada berkas bukti dukung yang dilampirkan oleh operator
                untuk indikator ini.
              </p>
            ) : (
              dokumenBuktiList.map((doc, idx) => {
                const docHealth = healthResults[doc.file_url];
                return (
                  <div
                    key={doc.id || `v-doc-${idx}`}
                    className={`rounded-lg border p-2.5 text-xs transition-colors ${
                      docHealth?.status === 'RESTRICTED'
                        ? 'border-rose-200 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/30'
                        : docHealth?.status === 'PUBLIC'
                          ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                          : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-800/40'
                    }`}
                  >
                    <div className='flex flex-col justify-between gap-2 sm:flex-row sm:items-center'>
                      <div className='flex min-w-0 items-start gap-2.5'>
                        <FileText className='mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400' />
                        <div className='min-w-0'>
                          <div className='flex flex-wrap items-center gap-1.5'>
                            <span className='font-semibold text-gray-800 dark:text-gray-200'>
                              {doc.nama_dokumen}
                            </span>
                            {doc.tipe_dokumen && (
                              <span className='text-3xs py-0.2 rounded border border-indigo-200 bg-indigo-50 px-1.5 font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'>
                                {doc.tipe_dokumen}
                              </span>
                            )}
                          </div>
                          <a
                            href={doc.file_url}
                            target='_blank'
                            rel='noopener noreferrer'
                            className='text-3xs mt-0.5 inline-flex max-w-sm items-center gap-1 truncate text-blue-600 hover:underline dark:text-blue-400'
                          >
                            <span className='truncate'>{doc.file_url}</span>
                            <ExternalLink className='h-2.5 w-2.5 shrink-0' />
                          </a>
                        </div>
                      </div>

                      <div className='flex shrink-0 items-center gap-2 self-end sm:self-center'>
                        <GDriveHealthButton
                          url={doc.file_url}
                          label='Cek Izin'
                          size='xs'
                          currentResult={docHealth}
                          onResult={(res) =>
                            handleHealthResult(doc.file_url, res)
                          }
                          compactBadge={true}
                        />
                        <button
                          type='button'
                          onClick={() =>
                            setPreviewDoc({
                              url: doc.file_url,
                              title: doc.nama_dokumen,
                              type: doc.tipe_dokumen || undefined
                            })
                          }
                          className='text-2xs inline-flex items-center gap-1 rounded border border-indigo-200 bg-indigo-50/70 px-2 py-1 font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
                          title='Pratinjau Dokumen Terpadu'
                        >
                          <Eye className='h-3 w-3' />
                          <span>Pratinjau</span>
                        </button>
                        <a
                          href={doc.file_url}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-2xs inline-flex items-center gap-1 rounded border border-gray-300 bg-white px-2 py-1 font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'
                        >
                          <ExternalLink className='h-3 w-3' />
                          <span>Buka Berkas</span>
                        </a>
                      </div>
                    </div>

                    {/* Alert jika izin terkunci */}
                    {docHealth?.status === 'RESTRICTED' && (
                      <div className='text-2xs mt-2 flex items-center gap-1.5 rounded bg-rose-100/80 px-2 py-1 font-medium text-rose-900 dark:bg-rose-950/60 dark:text-rose-200'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0 text-rose-600 dark:text-rose-400' />
                        <span>
                          Perhatian: Dokumen ini memerlukan login Google (Izin
                          Terkunci). Minta operator untuk mengubah akses ke
                          publik sebelum menyetujui.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

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

        {/* Action Button: Simpan Verifikasi & Status ZIAPP */}
        <div className='flex flex-wrap items-center justify-between gap-3 border-t border-blue-100 pt-3 dark:border-blue-900/40'>
          {/* Tombol Aksi ZIAPP (Khusus Koordinator/Admin jika status Disetujui) */}
          <div className='flex flex-wrap items-center gap-2'>
            {currentStatus === STATUS_KELENGKAPAN.DISETUJUI ? (
              ziappStatus === 'READY_FOR_ZIAPP' ? (
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge
                    variant='outline'
                    className={`text-xs font-semibold ${ZIAPP_STATUS_MAP.READY_FOR_ZIAPP.badgeClass}`}
                  >
                    <Send className='mr-1 h-3 w-3' />
                    Siap Kirim ke ZIAPP
                  </Badge>
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={handleMarkSyncedToZIAPP}
                    disabled={isMarkingZIAPP}
                    className='h-8 border-emerald-300 bg-emerald-50 text-xs font-medium text-emerald-800 hover:bg-emerald-100 hover:text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                  >
                    {isMarkingZIAPP ? (
                      <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    ) : (
                      <CheckCircle2 className='mr-1.5 h-3.5 w-3.5 text-emerald-600' />
                    )}
                    Tandai Tersinkron ke ZIAPP
                  </Button>
                </div>
              ) : ziappStatus === 'SYNCED_TO_ZIAPP' ? (
                <Badge
                  variant='outline'
                  className={`text-xs font-semibold ${ZIAPP_STATUS_MAP.SYNCED_TO_ZIAPP.badgeClass}`}
                >
                  <CheckCircle2 className='mr-1 h-3 w-3 text-emerald-600' />
                  Tersinkron ke Web Pusat ZIAPP
                </Badge>
              ) : (
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={handleMarkReadyForZIAPP}
                  disabled={isMarkingZIAPP}
                  className='h-8 border-amber-300 bg-amber-50 text-xs font-medium text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                >
                  {isMarkingZIAPP ? (
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                  ) : (
                    <Send className='mr-1.5 h-3.5 w-3.5 text-amber-600' />
                  )}
                  Tandai Siap Kirim ke ZIAPP
                </Button>
              )
            ) : (
              <Badge
                variant='outline'
                className={`text-xs font-semibold ${ZIAPP_STATUS_MAP[ziappStatus].badgeClass}`}
              >
                <Send className='mr-1 h-3 w-3' />
                {ZIAPP_STATUS_MAP[ziappStatus].label}
              </Badge>
            )}
          </div>

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

      {/* Modal Pratinjau Dokumen Terpadu */}
      <DocumentPreviewModal
        isOpen={Boolean(previewDoc)}
        onClose={() => setPreviewDoc(null)}
        url={previewDoc?.url}
        title={previewDoc?.title}
        fileType={previewDoc?.type}
      />
    </div>
  );
}
