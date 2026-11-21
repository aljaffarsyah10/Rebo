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
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import SkorBox from '@/components/rebo/skorBox';
import BuktiForm from '@/components/rebo/bukti-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  STATUS_KELENGKAPAN_MAP,
  type Pertanyaan,
  type BuktiDukung,
  type StatusKelengkapan
} from '@/types/rebo';
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

  // GDrive folder URL detection
  const gdriveFolderUrl =
    currentBukti?.gdrive_folder_url ||
    (currentBukti?.link_bukti &&
    (currentBukti.link_bukti.includes('/drive/folders') ||
      currentBukti.link_bukti.includes('drive.google.com/drive/folders'))
      ? currentBukti.link_bukti
      : null);

  // Compute maximum score
  const nilaiMaks = pertanyaan.kategoriPenilaian?.length
    ? Math.max(...pertanyaan.kategoriPenilaian.map((k: any) => k.nilai || 0))
    : undefined;

  const currentScore =
    currentBukti?.nilai_mandiri ?? currentBukti?.nilai_akhir ?? null;

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

  return (
    <div className='relative rounded-2xl border border-gray-200 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-md dark:border-gray-700/80 dark:bg-gray-900'>
      {/* 1. HEADER INDIKATOR */}
      <div className='mb-4 flex flex-col justify-between gap-4 md:flex-row md:items-start'>
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
            </div>

            <h3 className='text-base leading-relaxed font-semibold text-gray-900 dark:text-gray-100'>
              {pertanyaan.pertanyaan ||
                pertanyaan.uraian_pertanyaan ||
                pertanyaan.uraian_singkat}
            </h3>
          </div>
        </div>

        {/* Skor Box Nilai Mandiri */}
        <div className='shrink-0 self-start'>
          <SkorBox
            nilaiAkhir={currentScore}
            nilaiMaks={nilaiMaks}
            className='relative static top-auto right-auto'
          />
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
      <div className='dark:via-gray-850 mb-5 rounded-xl border border-gray-200 bg-gradient-to-r from-blue-50/40 via-white to-indigo-50/40 p-4 dark:border-gray-800 dark:from-gray-800/60 dark:to-gray-800/40'>
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

          <div className='flex shrink-0 items-center gap-2 self-start sm:self-center'>
            {gdriveFolderUrl ? (
              <>
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

      {/* 3. MULTI-EVIDENCE & SELF-ASSESSMENT FORM */}
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
    </div>
  );
}
