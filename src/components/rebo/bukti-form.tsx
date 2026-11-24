'use client';

import React, { useState, useEffect, useTransition } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Send,
  Lock,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ShieldCheck,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { submitBuktiAction, deleteDokumenBukti } from '@/actions/bukti-actions';
import { checkBatchGDriveHealthAction } from '@/actions/gdrive-actions';
import {
  GDriveHealthBadge,
  GDriveHealthButton
} from '@/components/rebo/gdrive-health-badge';
import type { GDriveHealthCheckResult } from '@/lib/gdrive/health-checker';
import type { Pertanyaan, BuktiDukung, DokumenBukti } from '@/types/rebo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TIPE_DOKUMEN_OPTIONS = [
  'Surat Keputusan (SK)',
  'Notula Rapat',
  'Daftar Hadir',
  'Undangan',
  'Laporan Pelaksanaan',
  'SOP / Pedoman',
  'Dokumentasi / Foto',
  'Tangkapan Layar Sistem',
  'Lainnya'
];

type Props = {
  pertanyaan: Pertanyaan;
  bukti?: BuktiDukung | null;
  buktiDukungMap?: Record<string, BuktiDukung>;
  setBuktiDukungMap?: React.Dispatch<
    React.SetStateAction<Record<string, BuktiDukung>>
  >;
  canEdit?: boolean;
  canVerify?: boolean;
  activePeriodeId?: string;
  targetPilarId?: string;
  onUpsertSuccess?: (idPertanyaan: string, freshData: any) => void;
  onUpsert?: (payload: Partial<any>, form?: HTMLFormElement) => Promise<any>;
};

export default function BuktiForm({
  pertanyaan,
  bukti,
  buktiDukungMap,
  setBuktiDukungMap,
  canEdit = true,
  activePeriodeId,
  targetPilarId,
  onUpsertSuccess,
  onUpsert
}: Props) {
  const currentBukti =
    bukti || (buktiDukungMap ? buktiDukungMap[pertanyaan.id_pertanyaan] : null);

  // 1. Local state for form fields
  const [selectedKategori, setSelectedKategori] = useState<string>(
    currentBukti?.id_kategori ? String(currentBukti.id_kategori) : ''
  );
  const [catatanOperator, setCatatanOperator] = useState<string>(
    currentBukti?.catatan_operator ?? currentBukti?.catatan_user ?? ''
  );

  // 2. Documents state
  const [dokumenList, setDokumenList] = useState<
    Array<{
      id?: string;
      nama_dokumen: string;
      file_url: string;
      tipe_dokumen?: string | null;
      uploaded_by?: string;
      uploaded_at?: string;
    }>
  >([]);

  // 3. Inline new document input state
  const [newDocNama, setNewDocNama] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocTipe, setNewDocTipe] = useState('Notula Rapat');
  const [showAddForm, setShowAddForm] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [submittingType, setSubmittingType] = useState<
    'draft' | 'review' | null
  >(null);

  // Health check state for Google Drive links (Pre-Audit Guard)
  const [healthResults, setHealthResults] = useState<
    Record<string, GDriveHealthCheckResult>
  >({});
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  // Detect indicator-level Google Drive folder URL
  const indicatorFolderUrl =
    currentBukti?.gdrive_folder_url ||
    (currentBukti?.link_bukti &&
    (currentBukti.link_bukti.includes('/drive/folders') ||
      currentBukti.link_bukti.includes('drive.google.com/drive/folders'))
      ? currentBukti.link_bukti
      : null);

  const handleHealthResult = (url: string, result: GDriveHealthCheckResult) => {
    setHealthResults((prev) => ({
      ...prev,
      [url]: result
    }));
  };

  const handleCheckAllDocuments = async () => {
    const allUrls: string[] = [];
    if (indicatorFolderUrl) allUrls.push(indicatorFolderUrl);
    dokumenList.forEach((d) => {
      if (d.file_url) allUrls.push(d.file_url);
    });

    if (allUrls.length === 0) {
      toast.info('Tidak ada tautan Google Drive untuk diperiksa.');
      return;
    }

    setIsCheckingAll(true);
    const toastId = toast.loading(
      `Memeriksa izin akses ${allUrls.length} tautan Google Drive...`
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
            `Pemeriksaan selesai: ${restrictedCount} tautan berstatus TERKUNCI (Restricted). Harap ubah setelan izin ke publik!`,
            { id: toastId, duration: 6000 }
          );
        } else {
          toast.success(
            `Semua ${allUrls.length} tautan Google Drive memiliki akses terbuka (Anyone with link)!`,
            { id: toastId }
          );
        }
      } else {
        toast.error(res.error || 'Gagal memeriksa izin tautan.', {
          id: toastId
        });
      }
    } catch (err: any) {
      toast.error(
        err?.message || 'Terjadi kesalahan sistem saat pemeriksaan.',
        { id: toastId }
      );
    } finally {
      setIsCheckingAll(false);
    }
  };

  // Synchronize initial data from props
  useEffect(() => {
    if (currentBukti) {
      if (currentBukti.id_kategori != null) {
        setSelectedKategori(String(currentBukti.id_kategori));
      }
      if (
        currentBukti.catatan_operator != null ||
        currentBukti.catatan_user != null
      ) {
        setCatatanOperator(
          currentBukti.catatan_operator ?? currentBukti.catatan_user ?? ''
        );
      }

      // Populate dokumen list
      if (currentBukti.dokumen_bukti && currentBukti.dokumen_bukti.length > 0) {
        setDokumenList(
          currentBukti.dokumen_bukti.map((d: DokumenBukti) => ({
            id: d.id,
            nama_dokumen: d.nama_dokumen,
            file_url: d.file_url,
            tipe_dokumen: d.tipe_dokumen,
            uploaded_by: d.uploaded_by,
            uploaded_at: d.uploaded_at
          }))
        );
      } else if (
        currentBukti.link_bukti &&
        !currentBukti.link_bukti.includes('/drive/folders')
      ) {
        // Fallback: create 1 legacy entry if link_bukti is a file
        setDokumenList([
          {
            id: `legacy-${currentBukti.id_bukti || pertanyaan.id_pertanyaan}`,
            nama_dokumen: 'Berkas Bukti Dukung',
            file_url: currentBukti.link_bukti,
            tipe_dokumen: 'Dokumen',
            uploaded_by: 'Operator'
          }
        ]);
      }
    }
  }, [currentBukti, pertanyaan.id_pertanyaan]);

  // Derived realtime score
  const selectedKategoriObj = pertanyaan.kategoriPenilaian?.find(
    (k: any) => String(k.id_kategori) === selectedKategori
  );
  const currentNilaiMandiri =
    selectedKategoriObj?.nilai ??
    currentBukti?.nilai_mandiri ??
    currentBukti?.nilai_akhir ??
    0;

  // Add document to temporary list
  function handleAddDocument(e: React.FormEvent) {
    e.preventDefault();
    if (!newDocNama.trim()) {
      toast.error('Masukkan nama berkas dokumen.');
      return;
    }
    if (!newDocUrl.trim()) {
      toast.error('Masukkan URL berkas Google Drive.');
      return;
    }

    try {
      // Basic URL verification
      const parsed = new URL(newDocUrl.trim());
      if (!parsed.protocol.startsWith('http')) {
        toast.error('URL berkas harus diawali dengan http:// atau https://');
        return;
      }
    } catch {
      toast.error('URL berkas Google Drive tidak valid.');
      return;
    }

    const newDoc = {
      id: `temp-${Date.now()}`,
      nama_dokumen: newDocNama.trim(),
      file_url: newDocUrl.trim(),
      tipe_dokumen: newDocTipe,
      uploaded_by: 'Operator (Belum Disimpan)',
      uploaded_at: new Date().toISOString()
    };

    setDokumenList((prev) => [...prev, newDoc]);
    setNewDocNama('');
    setNewDocUrl('');
    setShowAddForm(false);
    toast.success(`Berkas "${newDoc.nama_dokumen}" ditambahkan ke draf.`);
  }

  // Remove document
  async function handleRemoveDocument(index: number) {
    const doc = dokumenList[index];
    if (!doc) return;

    // If it's a real persisted database document, call delete server action
    if (
      doc.id &&
      !doc.id.startsWith('temp-') &&
      !doc.id.startsWith('legacy-')
    ) {
      const confirmDelete = window.confirm(
        `Apakah Anda yakin ingin menghapus berkas "${doc.nama_dokumen}" secara permanen?`
      );
      if (!confirmDelete) return;

      const deleteRes = await deleteDokumenBukti(doc.id);
      if (deleteRes.success) {
        toast.success(deleteRes.message || 'Berkas berhasil dihapus.');
      } else {
        toast.error(deleteRes.error || 'Gagal menghapus berkas.');
        return;
      }
    }

    setDokumenList((prev) => prev.filter((_, idx) => idx !== index));
  }

  // Handle Save (Draft or Submit for Review)
  async function handleSave(submitForReview: boolean) {
    if (!canEdit) {
      toast.error('Anda tidak memiliki wewenang untuk mengubah data ini.');
      return;
    }

    if (submitForReview) {
      if (
        (pertanyaan.kategoriPenilaian?.length || 0) > 0 &&
        !selectedKategori
      ) {
        toast.error(
          'Pilih opsi penilaian mandiri terlebih dahulu sebelum mengajukan verifikasi.'
        );
        return;
      }
      if (dokumenList.length === 0) {
        toast.error(
          'Tambahkan minimal 1 berkas bukti dukung sebelum mengajukan verifikasi.'
        );
        return;
      }

      // Pre-Audit Guard: Peringatan jika terdeteksi tautan berstatus RESTRICTED
      const restrictedDoc = dokumenList.find(
        (d) => healthResults[d.file_url]?.status === 'RESTRICTED'
      );
      if (restrictedDoc) {
        const proceed = window.confirm(
          `Peringatan Pre-Audit Guard: Berkas "${restrictedDoc.nama_dokumen}" terdeteksi berstatus Izin Terkunci (Restricted).\n\nVerifikator atau Penilai tidak dapat membaca berkas ini jika izin belum diubah menjadi "Siapa saja yang memiliki link".\n\nTetap lanjutkan pengajuan verifikasi?`
        );
        if (!proceed) return;
      }
    }

    setSubmittingType(submitForReview ? 'review' : 'draft');

    startTransition(async () => {
      try {
        const payload = {
          id_pertanyaan: pertanyaan.id_pertanyaan,
          id_periode: activePeriodeId,
          id_kategori: selectedKategori || null,
          catatan_operator: catatanOperator.trim() || null,
          dokumen_list: dokumenList.map((d) => ({
            id:
              d.id && !d.id.startsWith('temp-') && !d.id.startsWith('legacy-')
                ? d.id
                : undefined,
            nama_dokumen: d.nama_dokumen,
            file_url: d.file_url,
            tipe_dokumen: d.tipe_dokumen || null
          })),
          submit_for_review: submitForReview
        };

        const res = await submitBuktiAction(payload);

        if (res.success) {
          toast.success(res.message || 'Data berhasil disimpan.');

          // Update parent state if setBuktiDukungMap is present
          if (setBuktiDukungMap) {
            setBuktiDukungMap((prev) => {
              const prevItem = prev[pertanyaan.id_pertanyaan] || {};
              const updatedItem: BuktiDukung = {
                ...prevItem,
                id_pertanyaan: pertanyaan.id_pertanyaan,
                id_kategori: selectedKategori || null,
                nilai_mandiri: currentNilaiMandiri,
                nilai_akhir: currentNilaiMandiri,
                catatan_operator: catatanOperator.trim() || null,
                catatan_user: catatanOperator.trim() || null,
                status_kelengkapan:
                  res.newStatus ??
                  (submitForReview ? 1 : (prevItem.status_kelengkapan ?? 0)),
                status: submitForReview
                  ? 'Menunggu Review'
                  : (prevItem.status ?? 'Belum Diisi'),
                nama_status: submitForReview
                  ? 'Menunggu Review'
                  : (prevItem.nama_status ?? 'Belum Diisi'),
                dokumen_bukti:
                  res.data?.dokumen_bukti ?? (dokumenList as DokumenBukti[])
              };
              return {
                ...prev,
                [pertanyaan.id_pertanyaan]: updatedItem
              };
            });
          }

          if (onUpsertSuccess && res.data) {
            onUpsertSuccess(pertanyaan.id_pertanyaan, res.data);
          }

          // Legacy callback support
          if (onUpsert) {
            onUpsert({
              id_pertanyaan: pertanyaan.id_pertanyaan,
              id_kategori: selectedKategori,
              nilai_akhir: currentNilaiMandiri,
              catatan_user: catatanOperator
            });
          }
        } else {
          toast.error(res.error || 'Gagal menyimpan bukti dukung.');
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.error('Error in handleSave:', err);
        toast.error('Terjadi kesalahan saat memproses penyimpanan.');
      } finally {
        setSubmittingType(null);
      }
    });
  }

  return (
    <div
      id={`bukti-form-${pertanyaan.id_pertanyaan}`}
      className='mt-4 scroll-mt-20 space-y-6'
    >
      {/* RBAC Read-Only Banner */}
      {!canEdit && (
        <div className='flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200'>
          <Lock className='h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400' />
          <div>
            <span className='font-semibold'>Mode Baca Saja (Read-Only): </span>
            Anda tidak memiliki wewenang untuk mengisi/mengubah bukti pada Pilar{' '}
            {targetPilarId || 'ini'}. Formulir ini hanya dapat diedit oleh
            Operator Pilar yang ditugaskan atau Super Admin.
          </div>
        </div>
      )}

      {/* SECTION: DIREKTORI GDRIVE INDIKATOR & PRE-AUDIT HEALTH CHECK */}
      {indicatorFolderUrl && (
        <div className='rounded-xl border border-blue-200 bg-gradient-to-r from-blue-50/70 via-white to-indigo-50/50 p-4 shadow-xs dark:border-blue-900/60 dark:from-blue-950/20 dark:via-gray-900 dark:to-indigo-950/20'>
          <div className='flex flex-col justify-between gap-3 sm:flex-row sm:items-center'>
            <div className='flex items-start gap-3'>
              <div className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300'>
                <FolderOpen className='h-5 w-5' />
              </div>
              <div>
                <div className='flex flex-wrap items-center gap-2'>
                  <span className='text-xs font-bold tracking-wider text-blue-900 uppercase dark:text-blue-200'>
                    Direktori Folder Google Drive Indikator
                  </span>
                  {healthResults[indicatorFolderUrl] && (
                    <GDriveHealthBadge
                      status={healthResults[indicatorFolderUrl].status}
                      message={healthResults[indicatorFolderUrl].message}
                      statusCode={healthResults[indicatorFolderUrl].statusCode}
                      compact={true}
                    />
                  )}
                </div>
                <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>
                  Folder resmi untuk menyimpan bukti dukung indikator ini.
                  Pastikan izin akses disetel ke publik.
                </p>
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
              <GDriveHealthButton
                url={indicatorFolderUrl}
                label='Periksa Izin Akses'
                currentResult={healthResults[indicatorFolderUrl]}
                onResult={(res) => handleHealthResult(indicatorFolderUrl, res)}
                showBadge={false}
              />
              <a
                href={indicatorFolderUrl}
                target='_blank'
                rel='noopener noreferrer'
                className='inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200'
              >
                <ExternalLink className='h-3.5 w-3.5' />
                <span>Buka Folder</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* 1. SECTION: PENILAIAN MANDIRI (SELF-ASSESSMENT) */}
      {pertanyaan.kategoriPenilaian &&
        pertanyaan.kategoriPenilaian.length > 0 && (
          <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800/80'>
            <div className='mb-3 flex items-center justify-between'>
              <label className='flex items-center gap-2 text-sm font-bold text-gray-900 dark:text-gray-100'>
                <CheckCircle2 className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                <span>Penilaian Mandiri (Self-Assessment)</span>
              </label>
              <div className='flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'>
                <span>Skor Mandiri:</span>
                <span className='font-bold'>
                  {currentNilaiMandiri.toFixed(2)}
                </span>
              </div>
            </div>

            <p className='mb-3 text-xs text-gray-500 dark:text-gray-400'>
              Pilih kategori penilaian yang paling mencerminkan kondisi
              pemenuhan bukti dukung di unit kerja:
            </p>

            <div className='space-y-2'>
              {pertanyaan.kategoriPenilaian.map(
                (kategori: any, idx: number) => {
                  const isSelected =
                    String(kategori.id_kategori) === selectedKategori;
                  const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D...

                  return (
                    <div
                      key={kategori.id_kategori}
                      onClick={() => {
                        if (canEdit && !isPending) {
                          setSelectedKategori(String(kategori.id_kategori));
                        }
                      }}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-all ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/80 shadow-xs dark:border-blue-500 dark:bg-blue-900/30'
                          : 'border-gray-200 bg-gray-50/50 hover:bg-gray-100/70 dark:border-gray-700 dark:bg-gray-800/40 dark:hover:bg-gray-700/50'
                      } ${!canEdit ? 'cursor-not-allowed opacity-80' : ''}`}
                    >
                      <input
                        type='radio'
                        id={`kategori-${pertanyaan.id_pertanyaan}-${kategori.id_kategori}`}
                        name={`kategori-radio-${pertanyaan.id_pertanyaan}`}
                        value={String(kategori.id_kategori)}
                        checked={isSelected}
                        disabled={!canEdit || isPending}
                        onChange={() =>
                          setSelectedKategori(String(kategori.id_kategori))
                        }
                        className='mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center justify-between gap-2'>
                          <span className='text-sm font-semibold text-gray-800 dark:text-gray-200'>
                            Opsi {optionLetter}
                          </span>
                          <span className='rounded bg-gray-200/80 px-2 py-0.5 text-xs font-bold text-gray-700 dark:bg-gray-700 dark:text-gray-300'>
                            Nilai:{' '}
                            {typeof kategori.nilai === 'number'
                              ? kategori.nilai.toFixed(2)
                              : '-'}
                          </span>
                        </div>
                        <p className='mt-0.5 text-xs text-gray-600 dark:text-gray-400'>
                          {kategori.uraian_kategori}
                        </p>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        )}

      {/* 2. SECTION: DOKUMEN BUKTI DUKUNG (MULTI-EVIDENCE) */}
      <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800/80'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-2'>
          <div className='flex items-center gap-2'>
            <Paperclip className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
            <h4 className='text-sm font-bold text-gray-900 dark:text-gray-100'>
              Berkas Bukti Dukung (Multi-Evidence)
            </h4>
            <Badge variant='secondary' className='text-xs'>
              {dokumenList.length} Berkas
            </Badge>
          </div>

          <div className='flex items-center gap-2'>
            {dokumenList.length > 0 && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={handleCheckAllDocuments}
                disabled={isCheckingAll}
                className='h-8 border-blue-200 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950/40'
                title='Uji izin akses seluruh link bukti dukung'
              >
                {isCheckingAll ? (
                  <>
                    <Loader2 className='mr-1.5 h-3.5 w-3.5 animate-spin' />
                    <span>Memeriksa Izin...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className='mr-1.5 h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                    <span>Periksa Semua Izin Akses</span>
                  </>
                )}
              </Button>
            )}

            {canEdit && !showAddForm && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => setShowAddForm(true)}
                disabled={isPending}
                className='h-8 text-xs font-semibold'
              >
                <Plus className='mr-1.5 h-3.5 w-3.5' />
                Tambah Berkas
              </Button>
            )}
          </div>
        </div>

        <p className='mb-3 text-xs text-gray-500 dark:text-gray-400'>
          Daftar tautan spesifik file Google Drive yang menjadi bukti dukung
          pemenuhan indikator ini (misal: Notula Rapat, Daftar Hadir, SK Tim
          Kerja):
        </p>

        {/* Existing / Uploaded Documents List */}
        {dokumenList.length === 0 && !showAddForm ? (
          <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/30'>
            <FileText className='mx-auto h-8 w-8 text-gray-400 dark:text-gray-500' />
            <p className='mt-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
              Belum ada berkas bukti dukung yang ditambahkan.
            </p>
            {canEdit && (
              <Button
                type='button'
                size='sm'
                variant='outline'
                onClick={() => setShowAddForm(true)}
                className='mt-3 text-xs'
              >
                <Plus className='mr-1 h-3.5 w-3.5' />
                Tambah Berkas Sekarang
              </Button>
            )}
          </div>
        ) : (
          <div className='space-y-2.5'>
            {dokumenList.map((doc, idx) => (
              <div
                key={doc.id || `doc-${idx}`}
                className='flex flex-col justify-between gap-3 rounded-lg border border-gray-200 bg-gray-50/70 p-3 text-sm transition-all sm:flex-row sm:items-center dark:border-gray-700 dark:bg-gray-800/50'
              >
                <div className='flex min-w-0 flex-1 items-start gap-3'>
                  <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'>
                    <FileText className='h-4 w-4' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <span className='truncate font-semibold text-gray-800 dark:text-gray-200'>
                        {doc.nama_dokumen}
                      </span>
                      {doc.tipe_dokumen && (
                        <span className='text-2xs rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'>
                          {doc.tipe_dokumen}
                        </span>
                      )}
                      {doc.id?.startsWith('temp-') && (
                        <span className='py-0.2 text-2xs rounded bg-amber-100 px-1.5 text-amber-800 dark:bg-amber-950 dark:text-amber-300'>
                          Belum Disimpan
                        </span>
                      )}
                    </div>
                    <div className='mt-1 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400'>
                      <a
                        href={doc.file_url}
                        target='_blank'
                        rel='noopener noreferrer'
                        className='inline-flex max-w-xs items-center gap-1 truncate text-blue-600 hover:underline dark:text-blue-400'
                      >
                        <span className='truncate'>{doc.file_url}</span>
                        <ExternalLink className='h-3 w-3 shrink-0' />
                      </a>
                    </div>

                    {/* Pre-Audit Health Check Button & Status */}
                    <div className='mt-2 flex flex-wrap items-center gap-2'>
                      <GDriveHealthButton
                        url={doc.file_url}
                        label='Periksa Izin Akses'
                        size='xs'
                        currentResult={healthResults[doc.file_url]}
                        onResult={(res) =>
                          handleHealthResult(doc.file_url, res)
                        }
                        compactBadge={true}
                      />
                    </div>

                    {healthResults[doc.file_url]?.status === 'RESTRICTED' && (
                      <div className='text-2xs mt-2 flex items-center gap-1.5 rounded border border-rose-200 bg-rose-50 px-2.5 py-1 font-medium text-rose-800 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300'>
                        <AlertCircle className='h-3.5 w-3.5 shrink-0 text-rose-600' />
                        <span>
                          Izin Terkunci (Restricted): Harap ubah setelan akses
                          berkas di Google Drive menjadi &quot;Siapa saja yang
                          memiliki link&quot;.
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className='flex shrink-0 items-center gap-2 self-end sm:self-center'>
                  <a
                    href={doc.file_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                  >
                    <ExternalLink className='h-3.5 w-3.5' />
                    <span>Buka File</span>
                  </a>

                  {canEdit && (
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => handleRemoveDocument(idx)}
                      disabled={isPending}
                      className='h-8 w-8 text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40'
                      title='Hapus Berkas'
                    >
                      <Trash2 className='h-4 w-4' />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline Add Document Form */}
        {showAddForm && canEdit && (
          <form
            onSubmit={handleAddDocument}
            className='mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20'
          >
            <h5 className='mb-3 text-xs font-bold tracking-wider text-blue-900 uppercase dark:text-blue-200'>
              Tambah Dokumen Bukti Baru
            </h5>

            <div className='mb-3 grid grid-cols-1 gap-3 md:grid-cols-2'>
              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Nama Dokumen / Berkas <span className='text-rose-500'>*</span>
                </label>
                <input
                  type='text'
                  value={newDocNama}
                  onChange={(e) => setNewDocNama(e.target.value)}
                  placeholder='Contoh: Notula Rapat Pembentukan Tim, SK Tim Kerja, dll.'
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
                  required
                />
              </div>

              <div>
                <label className='mb-1 block text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  Tipe Dokumen
                </label>
                <select
                  value={newDocTipe}
                  onChange={(e) => setNewDocTipe(e.target.value)}
                  className='w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
                >
                  {TIPE_DOKUMEN_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className='mb-3'>
              <div className='mb-1 flex items-center justify-between'>
                <label className='block text-xs font-semibold text-gray-700 dark:text-gray-300'>
                  URL Google Drive Berkas{' '}
                  <span className='text-rose-500'>*</span>
                </label>
                {newDocUrl.trim() && (
                  <GDriveHealthButton
                    url={newDocUrl.trim()}
                    label='Uji Izin Akses'
                    size='xs'
                    currentResult={healthResults[newDocUrl.trim()]}
                    onResult={(res) =>
                      handleHealthResult(newDocUrl.trim(), res)
                    }
                    compactBadge={true}
                  />
                )}
              </div>
              <input
                type='url'
                value={newDocUrl}
                onChange={(e) => setNewDocUrl(e.target.value)}
                placeholder='https://drive.google.com/file/d/...'
                className='w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-blue-500 focus:outline-none dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100'
                required
              />
              <p className='text-2xs mt-1 text-gray-500 dark:text-gray-400'>
                💡 Pastikan berkas Google Drive disetel ke izin lihat:
                &quot;Siapa saja yang memiliki link&quot; atau dibagikan ke
                domain @bps.go.id.
              </p>
            </div>

            <div className='flex items-center justify-end gap-2'>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setShowAddForm(false)}
                className='h-8 text-xs'
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                className='h-8 bg-blue-600 text-xs font-semibold text-white hover:bg-blue-700'
              >
                <Plus className='mr-1 h-3.5 w-3.5' />
                Masukkan ke Daftar
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* 3. SECTION: CATATAN OPERATOR */}
      <div className='rounded-xl border border-gray-200 bg-white p-5 shadow-xs dark:border-gray-700 dark:bg-gray-800/80'>
        <label
          htmlFor={`catatan-op-${pertanyaan.id_pertanyaan}`}
          className='mb-1.5 block text-sm font-bold text-gray-900 dark:text-gray-100'
        >
          Catatan Penjelasan Bukti (Operator Tim Kerja)
        </label>
        <p className='mb-2 text-xs text-gray-500 dark:text-gray-400'>
          Uraikan ringkasan tindak lanjut pemenuhan, poin penting dokumen bukti,
          atau catatan khusus untuk dievaluasi oleh Koordinator/TPI:
        </p>
        <textarea
          id={`catatan-op-${pertanyaan.id_pertanyaan}`}
          rows={3}
          value={catatanOperator}
          onChange={(e) => setCatatanOperator(e.target.value)}
          disabled={!canEdit || isPending}
          placeholder='Tambahkan catatan penjelasan bukti dukung di sini...'
          className='w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none disabled:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:disabled:bg-gray-800'
        />
      </div>

      {/* 4. SECTION: CATATAN KOORDINATOR (PROTECTED READ-ONLY FOR OPERATOR) */}
      {(currentBukti?.catatan_koordinator ||
        currentBukti?.status_kelengkapan === 3) && (
        <div className='rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900/60 dark:bg-rose-950/20'>
          <div className='mb-1.5 flex items-center gap-2'>
            <AlertTriangle className='h-4 w-4 text-rose-600 dark:text-rose-400' />
            <h5 className='text-xs font-bold tracking-wider text-rose-900 uppercase dark:text-rose-300'>
              Catatan / Rekomendasi Koordinator & TPI
            </h5>
            <span className='text-2xs ml-auto inline-flex items-center gap-1 rounded bg-rose-100 px-2 py-0.5 font-semibold text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'>
              <Lock className='h-3 w-3' />
              Read-Only
            </span>
          </div>
          <p className='text-xs leading-relaxed font-medium whitespace-pre-wrap text-rose-800 dark:text-rose-200'>
            {currentBukti?.catatan_koordinator ||
              'Terdapat permintaan revisi pada bukti dukung ini. Silakan periksa kelengkapan dokumen.'}
          </p>
        </div>
      )}

      {/* 5. ACTION BUTTONS */}
      {canEdit && (
        <div className='flex flex-wrap items-center justify-end gap-3 pt-2'>
          <Button
            type='button'
            variant='outline'
            disabled={isPending}
            onClick={() => handleSave(false)}
            className='h-10 border-gray-300 px-5 text-xs font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800'
          >
            <Save className='mr-1.5 h-4 w-4' />
            {isPending && submittingType === 'draft'
              ? 'Menyimpan...'
              : 'Simpan Draf'}
          </Button>

          <Button
            type='button'
            disabled={isPending}
            onClick={() => handleSave(true)}
            className='h-10 bg-gradient-to-r from-blue-600 to-indigo-600 px-6 text-xs font-semibold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700'
          >
            <Send className='mr-1.5 h-4 w-4' />
            {isPending && submittingType === 'review'
              ? 'Mengajukan...'
              : 'Kirim & Ajukan Verifikasi'}
          </Button>
        </div>
      )}
    </div>
  );
}
