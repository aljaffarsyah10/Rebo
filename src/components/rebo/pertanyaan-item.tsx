'use client';

import React, { useState } from 'react';
import {
  FolderOpen,
  Copy,
  Check,
  ExternalLink,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  TrendingDown,
  Equal,
  Send,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import BuktiForm from '@/components/rebo/bukti-form';
import VerifikasiPanel from '@/components/rebo/verifikasi-panel';
import { GDriveHealthButton } from '@/components/rebo/gdrive-health-badge';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  STATUS_KELENGKAPAN_MAP,
  ZIAPP_STATUS_MAP,
  getEffectiveZIAPPStatus,
  type Pertanyaan,
  type BuktiDukung,
  type StatusKelengkapan,
  type ZIAPPSyncStatus
} from '@/types/rebo';
import { markAsReadyForZIAPPAction } from '@/actions/ziapp-sync-actions';
import type { Dispatch, SetStateAction } from 'react';

type Props = {
  pertanyaan: Pertanyaan;
  index: number;
  bukti?: BuktiDukung | null;
  buktiDukungMap?: Record<string, BuktiDukung>;
  setBuktiDukungMap?: Dispatch<SetStateAction<Record<string, BuktiDukung>>>;
  canEdit?: boolean;
  canVerify?: boolean;
  activePeriodeId?: string;
  targetPilarId?: string;
  onUpsert?: (
    payload: Partial<BuktiDukung>,
    form?: HTMLFormElement
  ) => Promise<any>;
  onSendStatus?: (id_pertanyaan: string, status: string) => Promise<any>;
  onApproveReject?: (id_pertanyaan: string, status: string) => Promise<any>;
  setModalMsg?: (msg: string) => void;
  setModalOpen?: (v: boolean) => void;
};

export default function PertanyaanItem({
  pertanyaan,
  index,
  bukti,
  buktiDukungMap = {},
  setBuktiDukungMap,
  canEdit = true,
  canVerify = false,
  activePeriodeId,
  targetPilarId,
  onUpsert
}: Props) {
  const currentBukti =
    bukti || (buktiDukungMap ? buktiDukungMap[pertanyaan.id_pertanyaan] : null);

  const [copied, setCopied] = useState(false);
  const [isMarkingZIAPP, setIsMarkingZIAPP] = useState(false);

  // Status kelengkapan mapping
  const rawStatus = currentBukti?.status_kelengkapan;
  const statusCode: StatusKelengkapan =
    rawStatus !== null &&
    rawStatus !== undefined &&
    Number(rawStatus) in STATUS_KELENGKAPAN_MAP
      ? (Number(rawStatus) as StatusKelengkapan)
      : 0;

  const statusInfo =
    STATUS_KELENGKAPAN_MAP[statusCode] || STATUS_KELENGKAPAN_MAP[0];

  // Status sinkronisasi ZIAPP
  const effectiveZiappStatus = getEffectiveZIAPPStatus(
    statusCode,
    currentBukti?.ziapp_status
  );
  const ziappStatusInfo = ZIAPP_STATUS_MAP[effectiveZiappStatus];

  // GDrive folder URL detection
  const gdriveFolderUrl =
    currentBukti?.gdrive_folder_url ||
    (currentBukti?.link_bukti &&
    (currentBukti.link_bukti.includes('/drive/folders') ||
      currentBukti.link_bukti.includes('drive.google.com/drive/folders'))
      ? currentBukti.link_bukti
      : null);

  // Compute maximum score for this indicator
  const nilaiMaks = pertanyaan.kategoriPenilaian?.length
    ? Math.max(...pertanyaan.kategoriPenilaian.map((k: any) => k.nilai || 0))
    : undefined;

  // Dual-Scoring Metrics
  const rawMandiri =
    currentBukti?.nilai_mandiri !== null &&
    currentBukti?.nilai_mandiri !== undefined
      ? Number(currentBukti.nilai_mandiri)
      : currentBukti?.nilai_akhir !== null &&
          currentBukti?.nilai_akhir !== undefined
        ? Number(currentBukti.nilai_akhir)
        : null;

  const nilaiMandiri = rawMandiri !== null ? rawMandiri : null;

  const isVerified = statusCode === 2;
  const rawVerifikasi =
    currentBukti?.nilai_verifikasi !== null &&
    currentBukti?.nilai_verifikasi !== undefined
      ? Number(currentBukti.nilai_verifikasi)
      : isVerified && nilaiMandiri !== null
        ? nilaiMandiri
        : null;

  const nilaiVerifikasi = rawVerifikasi !== null ? rawVerifikasi : null;

  // Deviasi/Selisih antara Nilai Usulan Mandiri dan Nilai Verifikasi
  const deviasi =
    nilaiMandiri !== null && nilaiVerifikasi !== null
      ? Number((nilaiVerifikasi - nilaiMandiri).toFixed(2))
      : null;

  const copyToClipboard = async () => {
    if (!gdriveFolderUrl) return;
    try {
      await navigator.clipboard.writeText(gdriveFolderUrl);
      setCopied(true);
      toast.success(
        'Tautan folder Google Drive berhasil disalin ke clipboard!'
      );
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  };

  const getStatusIcon = (code: StatusKelengkapan) => {
    switch (code) {
      case 2:
        return <CheckCircle2 className='h-3.5 w-3.5' />;
      case 1:
        return <Clock className='h-3.5 w-3.5' />;
      case 3:
        return <XCircle className='h-3.5 w-3.5' />;
      default:
        return <AlertCircle className='h-3.5 w-3.5' />;
    }
  };

  const getZIAPPIcon = (code: ZIAPPSyncStatus) => {
    switch (code) {
      case 'SYNCED_TO_ZIAPP':
        return (
          <CheckCircle2 className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
        );
      case 'READY_FOR_ZIAPP':
        return <Send className='h-3 w-3 text-amber-600 dark:text-amber-400' />;
      case 'VERIFIED_INTERNAL':
        return (
          <FileCheck2 className='h-3 w-3 text-blue-600 dark:text-blue-400' />
        );
      default:
        return <Clock className='h-3 w-3 text-slate-500 dark:text-slate-400' />;
    }
  };

  // Handler callback saat verifikasi berhasil disimpan
  const handleVerifikasiSuccess = (updatedData: Partial<BuktiDukung>) => {
    if (setBuktiDukungMap) {
      setBuktiDukungMap((prev) => {
        const existing = prev[pertanyaan.id_pertanyaan] || {};
        return {
          ...prev,
          [pertanyaan.id_pertanyaan]: {
            ...existing,
            ...updatedData,
            id_pertanyaan: pertanyaan.id_pertanyaan
          }
        };
      });
    }
  };

  // Quick Action: Tandai Siap Kirim ke ZIAPP dari kartu indikator
  const handleQuickMarkReadyForZIAPP = async () => {
    if (statusCode !== 2) {
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
        handleVerifikasiSuccess({ ziapp_status: 'READY_FOR_ZIAPP' });
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

  return (
    <div
      id={`indikator-${pertanyaan.id_pertanyaan}`}
      className='relative scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-900'
    >
      {/* 1. HEADER INDIKATOR & DUAL-SCORING SUMMARY */}
      <div className='mb-4 flex flex-col justify-between gap-4 lg:flex-row lg:items-start'>
        <div className='flex flex-1 items-start gap-3'>
          <div className='flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white shadow-xs dark:bg-blue-600'>
            {index + 1}
          </div>
          <div className='flex-1'>
            <div className='mb-1.5 flex flex-wrap items-center gap-2'>
              <span className='text-xs font-bold tracking-wider text-blue-700 uppercase dark:text-blue-400'>
                Indikator {index + 1}
              </span>
              <span className='text-gray-300 dark:text-gray-600'>•</span>
              <span className='font-mono text-xs text-gray-500 dark:text-gray-400'>
                ID: {pertanyaan.id_pertanyaan}
              </span>

              {/* Status Kelengkapan Badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${statusInfo.badgeClass}`}
              >
                {getStatusIcon(statusCode)}
                <span>{statusInfo.label}</span>
              </span>

              {/* Status ZIAPP Badge */}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${ziappStatusInfo.badgeClass}`}
                title={`Status Sinkronisasi Web Pusat ZIAPP: ${ziappStatusInfo.description}`}
              >
                {getZIAPPIcon(effectiveZiappStatus)}
                <span>{ziappStatusInfo.label}</span>
              </span>

              {/* Quick Action Button: Tandai Siap Kirim ke ZIAPP jika status Disetujui */}
              {canVerify &&
                statusCode === 2 &&
                effectiveZiappStatus !== 'READY_FOR_ZIAPP' &&
                effectiveZiappStatus !== 'SYNCED_TO_ZIAPP' && (
                  <Button
                    type='button'
                    size='sm'
                    variant='outline'
                    onClick={handleQuickMarkReadyForZIAPP}
                    disabled={isMarkingZIAPP}
                    className='text-3xs h-6 border-amber-300 bg-amber-50 px-2 font-semibold text-amber-800 hover:bg-amber-100 hover:text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300'
                  >
                    {isMarkingZIAPP ? (
                      <Loader2 className='mr-1 h-3 w-3 animate-spin' />
                    ) : (
                      <Send className='mr-1 h-3 w-3 text-amber-600' />
                    )}
                    Tandai Siap ZIAPP
                  </Button>
                )}
            </div>

            <h3 className='text-base leading-relaxed font-semibold text-gray-900 dark:text-gray-100'>
              {pertanyaan.pertanyaan ||
                pertanyaan.uraian_pertanyaan ||
                pertanyaan.uraian_singkat}
            </h3>
          </div>
        </div>

        {/* DUAL-SCORING COMPARISON CARD */}
        <div className='shrink-0 rounded-xl border border-gray-200 bg-gray-50/90 p-3 shadow-2xs dark:border-gray-800 dark:bg-gray-800/80'>
          <div className='text-2xs flex items-center justify-between gap-3 font-semibold text-gray-500 uppercase dark:text-gray-400'>
            <span>Skor Indikator</span>
            {nilaiMaks !== undefined && <span>Maks: {nilaiMaks}</span>}
          </div>

          <div className='mt-1.5 flex items-center gap-2'>
            {/* Skor Mandiri (Usulan) */}
            <div className='flex flex-col items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-center dark:border-gray-700 dark:bg-gray-900'>
              <span className='text-3xs font-medium text-gray-500 dark:text-gray-400'>
                Mandiri (Usulan)
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  nilaiMandiri !== null
                    ? 'text-blue-700 dark:text-blue-400'
                    : 'text-gray-400'
                }`}
              >
                {nilaiMandiri !== null ? nilaiMandiri.toFixed(2) : '-'}
              </span>
            </div>

            {/* Separator / Arrow */}
            <span className='text-xs font-bold text-gray-400 dark:text-gray-600'>
              vs
            </span>

            {/* Skor Verifikasi (Final) */}
            <div className='flex flex-col items-center rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-center dark:border-gray-700 dark:bg-gray-900'>
              <span className='text-3xs font-medium text-gray-500 dark:text-gray-400'>
                Verifikasi (Final)
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  nilaiVerifikasi !== null
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {nilaiVerifikasi !== null
                  ? nilaiVerifikasi.toFixed(2)
                  : statusCode === 1
                    ? 'Review'
                    : '-'}
              </span>
            </div>
          </div>

          {/* Deviasi / Selisih Badge */}
          {deviasi !== null && (
            <div className='text-2xs mt-2 flex items-center justify-between border-t border-gray-200/80 pt-1.5 dark:border-gray-700'>
              <span className='text-gray-500 dark:text-gray-400'>Deviasi:</span>
              <span
                className={`inline-flex items-center gap-0.5 font-mono font-bold ${
                  deviasi > 0
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : deviasi < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-blue-600 dark:text-blue-400'
                }`}
              >
                {deviasi > 0 ? (
                  <>
                    <TrendingUp className='h-3 w-3' />+{deviasi.toFixed(2)}
                  </>
                ) : deviasi < 0 ? (
                  <>
                    <TrendingDown className='h-3 w-3' />
                    {deviasi.toFixed(2)}
                  </>
                ) : (
                  <>
                    <Equal className='h-3 w-3' />
                    0.00 (Selaras)
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Deskripsi Pertanyaan */}
      {pertanyaan.deskripsi_pertanyaan && (
        <div className='mb-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3.5 text-xs leading-relaxed text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200'>
          <div className='mb-1 flex items-center gap-1.5 font-semibold'>
            <HelpCircle className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
            <span>Penjelasan Indikator:</span>
          </div>
          <p className='pl-5 whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
            {pertanyaan.deskripsi_pertanyaan}
          </p>
        </div>
      )}

      {/* Uraian Bukti Dukung yang Diperlukan */}
      {pertanyaan.uraian_buktidukung && (
        <div className='mb-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3.5 text-xs leading-relaxed text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-200'>
          <div className='mb-1 flex items-center gap-1.5 font-semibold'>
            <FileCheck2 className='h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400' />
            <span>Standar Dokumen Bukti Dukung yang Diminta:</span>
          </div>
          <p className='pl-5 whitespace-pre-wrap text-gray-700 dark:text-gray-300'>
            {pertanyaan.uraian_buktidukung}
          </p>
        </div>
      )}

      {/* 2. SECTION: FOLDER GDRIVE INDIKATOR */}
      <div className='mb-5 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/40 p-4 dark:border-gray-800 dark:from-gray-800/60 dark:to-gray-800/40'>
        <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 shadow-xs dark:bg-blue-900/60 dark:text-blue-300'>
              <FolderOpen className='h-5 w-5' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <span className='text-xs font-bold tracking-wider text-gray-700 uppercase dark:text-gray-300'>
                  Direktori Google Drive Indikator
                </span>
                {gdriveFolderUrl && (
                  <Badge
                    variant='outline'
                    className='text-2xs border-emerald-200 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                  >
                    Tersedia
                  </Badge>
                )}
              </div>
              <p className='mt-0.5 text-xs text-gray-500 dark:text-gray-400'>
                {gdriveFolderUrl
                  ? 'Gunakan folder resmi ini untuk menyimpan dan menata seluruh berkas bukti dukung indikator ini.'
                  : 'Folder Google Drive belum diset oleh Admin. Silakan hubungi Admin atau Koordinator Pilar.'}
              </p>
            </div>
          </div>

          <div className='flex shrink-0 flex-wrap items-center gap-2 self-start sm:self-center'>
            {gdriveFolderUrl ? (
              <>
                <GDriveHealthButton
                  url={gdriveFolderUrl}
                  label='Periksa Izin Folder'
                  size='sm'
                  compactBadge={true}
                />

                <a
                  href={gdriveFolderUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700'
                >
                  <FolderOpen className='h-4 w-4' />
                  <span>Buka Folder Bukti GDrive</span>
                  <ExternalLink className='h-3 w-3 opacity-80' />
                </a>

                <Button
                  type='button'
                  variant='outline'
                  size='sm'
                  onClick={copyToClipboard}
                  className='h-9 px-3 text-xs'
                  title='Salin Link Folder Google Drive'
                >
                  {copied ? (
                    <Check className='h-3.5 w-3.5 text-emerald-600' />
                  ) : (
                    <Copy className='h-3.5 w-3.5' />
                  )}
                  <span className='ml-1.5'>
                    {copied ? 'Tersalin' : 'Salin Link'}
                  </span>
                </Button>
              </>
            ) : (
              <div className='flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300'>
                <AlertCircle className='h-3.5 w-3.5 text-amber-600 dark:text-amber-400' />
                <span>Folder belum diset</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. MULTI-EVIDENCE & SELF-ASSESSMENT FORM (OPERATOR FLOW) */}
      <BuktiForm
        pertanyaan={pertanyaan}
        bukti={currentBukti}
        buktiDukungMap={buktiDukungMap}
        setBuktiDukungMap={setBuktiDukungMap}
        canEdit={canEdit}
        canVerify={canVerify}
        activePeriodeId={activePeriodeId}
        targetPilarId={targetPilarId}
        onUpsert={onUpsert}
      />

      {/* 4. VERIFIKASI PANEL & CATATAN KOORDINATOR (DUAL-FLOW: READ-ONLY vs INTERAKTIF) */}
      <VerifikasiPanel
        pertanyaan={pertanyaan}
        bukti={currentBukti}
        canVerify={canVerify}
        activePeriodeId={activePeriodeId}
        onVerifikasiSuccess={handleVerifikasiSuccess}
      />
    </div>
  );
}
