'use client';

import React, { useState, useEffect, useRef, useTransition } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Plus,
  Trash2,
  ExternalLink,
  Eye,
  Save,
  Send,
  Lock,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ShieldCheck,
  AlertCircle,
  Loader2,
  UploadCloud,
  Check,
  RotateCcw,
  Cloud,
  WifiOff,
  HardDrive,
  Sparkles
} from 'lucide-react';
import { submitBuktiAction, deleteDokumenBukti } from '@/actions/bukti-actions';
import {
  saveOfflineDraft,
  getOfflineDraft,
  deleteOfflineDraft,
  isOnline,
  type OfflineDraftPayload
} from '@/lib/offline/offline-draft-store';
import { checkBatchGDriveHealthAction } from '@/actions/gdrive-actions';
import {
  GDriveHealthBadge,
  GDriveHealthButton
} from '@/components/rebo/gdrive-health-badge';
import type { GDriveHealthCheckResult } from '@/lib/gdrive/health-checker';
import { QAChecklistCard } from '@/components/rebo/qa-checklist-card';
import { DocumentPreviewModal } from '@/components/rebo/document-preview-modal';
import { BatchUploadDropzone } from '@/components/rebo/batch-upload-dropzone';
import { AICompletenessChecker } from '@/components/rebo/ai-completeness-checker';
import { AIMetadataBadge } from '@/components/rebo/ai-metadata-badge';
import { SmartSuggestionCard } from '@/components/rebo/smart-suggestion-card';
import {
  compressImageFile,
  isCompressibleImage,
  formatFileSize,
  cleanDocTitle,
  type CompressionResult
} from '@/lib/compression/client-compressor';
import { FileCompressionBadge } from '@/components/rebo/file-compression-badge';
import type { Pertanyaan, BuktiDukung, DokumenBukti } from '@/types/rebo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const TIPE_DOKUMEN_OPTIONS = [
  'Undangan',
  'Daftar Hadir',
  'Notula',
  'Laporan / Output / SK / SOP',
  'Dokumentasi / Foto',
  'Dokumen Pendukung Lainnya'
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
  activePeriodeYear?: number;
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
  activePeriodeYear = 2026,
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
      compressionResult?: CompressionResult;
    }>
  >([]);

  // 3. Document input state & mode
  const [newDocNama, setNewDocNama] = useState('');
  const [newDocUrl, setNewDocUrl] = useState('');
  const [newDocTipe, setNewDocTipe] = useState('Undangan');
  const [addDocMode, setAddDocMode] = useState<'none' | 'single' | 'batch'>(
    'none'
  );
  const [singleDocCompression, setSingleDocCompression] =
    useState<CompressionResult | null>(null);
  const [isCompressingSingle, setIsCompressingSingle] = useState(false);

  const [isPending, startTransition] = useTransition();
  const [submittingType, setSubmittingType] = useState<
    'draft' | 'review' | null
  >(null);

  // Health check state for Google Drive links (Pre-Audit Guard)
  const [healthResults, setHealthResults] = useState<
    Record<string, GDriveHealthCheckResult>
  >({});
  const [isCheckingAll, setIsCheckingAll] = useState(false);

  // Auto-save draft states (IndexedDB / Local-First)
  const draftStorageKey = `rebo_draft_p${pertanyaan.id_pertanyaan}`;
  const [autoSaveStatus, setAutoSaveStatus] = useState<
    'idle' | 'saving' | 'saved'
  >('idle');
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(null);
  const [hasDraftNotice, setHasDraftNotice] = useState(false);
  const [savedDraftData, setSavedDraftData] =
    useState<OfflineDraftPayload | null>(null);

  const isMountedRef = useRef(false);
  const isRestoringRef = useRef(false);

  // Check and load draft on mount from IndexedDB (fallback localStorage)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    async function loadInitialDraft() {
      try {
        const draft = await getOfflineDraft(pertanyaan.id_pertanyaan);
        if (!isSubscribed || !draft) return;

        const serverKategori = currentBukti?.id_kategori
          ? String(currentBukti.id_kategori)
          : '';
        const serverCatatan = (
          currentBukti?.catatan_operator ??
          currentBukti?.catatan_user ??
          ''
        ).trim();

        const draftKategori = (
          draft.selectedKategori ||
          draft.id_kategori ||
          ''
        ).toString();
        const draftCatatan = (
          draft.catatanOperator ||
          draft.catatan_operator ||
          ''
        ).trim();

        const draftDocs = draft.dokumenList || draft.dokumen_list || [];

        // Check if local draft contains different unsubmitted data
        const isDifferent =
          (Boolean(draftKategori) && draftKategori !== serverKategori) ||
          (Boolean(draftCatatan) && draftCatatan !== serverCatatan) ||
          (Array.isArray(draftDocs) &&
            draftDocs.some((d: any) => d.id?.startsWith('temp-')));

        if (isDifferent) {
          setHasDraftNotice(true);
          setSavedDraftData(draft);
        } else if (draft.savedAt) {
          setLastSavedTime(draft.savedAt);
          setAutoSaveStatus('saved');
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gagal membaca draf lokal offline:', err);
      } finally {
        setTimeout(() => {
          if (isSubscribed) isMountedRef.current = true;
        }, 500);
      }
    }

    loadInitialDraft();

    return () => {
      isSubscribed = false;
    };
  }, [pertanyaan.id_pertanyaan, currentBukti]);

  // Debounced Auto-Save (800ms) ke IndexedDB / Local-First Store
  useEffect(() => {
    if (!isMountedRef.current || !canEdit || typeof window === 'undefined')
      return;
    if (isRestoringRef.current) {
      isRestoringRef.current = false;
      return;
    }

    // Only auto-save if user entered or changed something
    const hasContent =
      Boolean(selectedKategori) ||
      catatanOperator.trim().length > 0 ||
      dokumenList.some((d) => d.id?.startsWith('temp-'));

    if (!hasContent) return;

    setAutoSaveStatus('saving');

    const timer = setTimeout(async () => {
      try {
        const now = new Date();
        const timeStr = now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        });

        const formattedDocs = dokumenList.map((d) => ({
          id: d.id,
          nama_dokumen: d.nama_dokumen,
          file_url: d.file_url,
          tipe_dokumen: d.tipe_dokumen || null
        }));

        const dataToSave: OfflineDraftPayload = {
          id_pertanyaan: String(pertanyaan.id_pertanyaan),
          id_periode: activePeriodeId,
          id_kategori: selectedKategori || null,
          selectedKategori,
          catatan_operator: catatanOperator.trim() || null,
          catatanOperator,
          dokumen_list: formattedDocs,
          dokumenList,
          savedAt: timeStr,
          timestamp: now.toISOString(),
          syncStatus: 'pending'
        };

        await saveOfflineDraft(pertanyaan.id_pertanyaan, dataToSave);
        setLastSavedTime(timeStr);
        setAutoSaveStatus('saved');
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Gagal auto-save draf offline:', err);
        setAutoSaveStatus('idle');
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [
    selectedKategori,
    catatanOperator,
    dokumenList,
    canEdit,
    pertanyaan.id_pertanyaan,
    activePeriodeId
  ]);

  // Actions for restoring or clearing local draft
  const handleRestoreDraft = () => {
    if (!savedDraftData) return;
    isRestoringRef.current = true;

    const kategoriToRestore =
      savedDraftData.selectedKategori || savedDraftData.id_kategori;
    if (kategoriToRestore) {
      setSelectedKategori(String(kategoriToRestore));
    }

    const catatanToRestore =
      savedDraftData.catatanOperator ?? savedDraftData.catatan_operator;
    if (catatanToRestore !== undefined && catatanToRestore !== null) {
      setCatatanOperator(catatanToRestore);
    }

    const docsToRestore =
      savedDraftData.dokumenList || savedDraftData.dokumen_list;
    if (Array.isArray(docsToRestore) && docsToRestore.length > 0) {
      setDokumenList(docsToRestore);
    }

    if (savedDraftData.savedAt) {
      setLastSavedTime(savedDraftData.savedAt);
    }
    setAutoSaveStatus('saved');
    setHasDraftNotice(false);
    toast.success('Draf lokal berhasil dipulihkan dari IndexedDB.');
  };

  const handleDiscardDraft = async () => {
    try {
      await deleteOfflineDraft(pertanyaan.id_pertanyaan);
    } catch {}
    setHasDraftNotice(false);
    setSavedDraftData(null);
    setAutoSaveStatus('idle');
    setLastSavedTime(null);
    toast.info('Draf lokal berhasil dibersihkan.');
  };

  // Document preview modal state
  const [previewDoc, setPreviewDoc] = useState<{
    url: string;
    title: string;
    type?: string;
  } | null>(null);

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

  const handleInsertCitationToCatatan = (citation: string) => {
    setCatatanOperator((prev) => {
      const cleanPrev = (prev || '').trim();
      if (!cleanPrev) return citation;
      if (cleanPrev.includes(citation)) return cleanPrev;
      return `${cleanPrev}\n${citation}`;
    });
    toast.success(
      'Referensi naskah dinas berhasil disisipkan ke catatan penjelasan!'
    );
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

  // Add single document to temporary list
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
      uploaded_at: new Date().toISOString(),
      compressionResult: singleDocCompression || undefined
    };

    setDokumenList((prev) => [...prev, newDoc]);
    setNewDocNama('');
    setNewDocUrl('');
    setSingleDocCompression(null);
    setAddDocMode('none');
    toast.success(`Berkas "${newDoc.nama_dokumen}" ditambahkan ke draf.`);
  }

  // Add multiple documents from batch upload / drag-and-drop
  function handleBatchAddDocuments(
    newDocs: Array<{
      nama_dokumen: string;
      file_url: string;
      tipe_dokumen: string;
      compressionResult?: CompressionResult;
    }>
  ) {
    if (!newDocs || newDocs.length === 0) return;

    const formattedDocs = newDocs.map((doc, idx) => ({
      id: `temp-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
      nama_dokumen: doc.nama_dokumen,
      file_url: doc.file_url,
      tipe_dokumen: doc.tipe_dokumen,
      uploaded_by: 'Operator (Belum Disimpan)',
      uploaded_at: new Date().toISOString(),
      compressionResult: doc.compressionResult
    }));

    setDokumenList((prev) => [...prev, ...formattedDocs]);
    setAddDocMode('none');
    toast.success(
      `${newDocs.length} berkas berhasil ditambahkan ke draf bukti dukung.`
    );
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
      const offlinePayload: OfflineDraftPayload = {
        id_pertanyaan: String(pertanyaan.id_pertanyaan),
        id_periode: activePeriodeId,
        id_kategori: selectedKategori || null,
        selectedKategori,
        catatan_operator: catatanOperator.trim() || null,
        catatanOperator,
        dokumen_list: dokumenList.map((d) => ({
          id: d.id,
          nama_dokumen: d.nama_dokumen,
          file_url: d.file_url,
          tipe_dokumen: d.tipe_dokumen || null
        })),
        dokumenList,
        submit_for_review: submitForReview,
        syncStatus: 'pending'
      };

      // 1. Penanganan saat submit form ketika offline (Internet Sitaro terputus)
      if (!isOnline()) {
        try {
          await saveOfflineDraft(pertanyaan.id_pertanyaan, offlinePayload);
          setAutoSaveStatus('saved');
          setLastSavedTime(
            new Date().toLocaleTimeString('id-ID', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })
          );
        } catch {}

        toast.success(
          'Koneksi terputus. Isian Anda aman tersimpan di IndexedDB dan akan disinkronkan otomatis saat online.',
          { duration: 6000 }
        );

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
              status_kelengkapan: submitForReview
                ? 1
                : (prevItem.status_kelengkapan ?? 0),
              status: submitForReview
                ? 'Menunggu Review (Draf Lokal)'
                : (prevItem.status ?? 'Belum Diisi'),
              nama_status: submitForReview
                ? 'Menunggu Review (Draf Lokal)'
                : (prevItem.nama_status ?? 'Belum Diisi'),
              dokumen_bukti: dokumenList as DokumenBukti[]
            };
            return {
              ...prev,
              [pertanyaan.id_pertanyaan]: updatedItem
            };
          });
        }

        setSubmittingType(null);
        return;
      }

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
          // Hapus draf lokal otomatis ketika user berhasil simpan / ajukan bukti
          try {
            await deleteOfflineDraft(pertanyaan.id_pertanyaan);
          } catch {}
          setHasDraftNotice(false);
          setSavedDraftData(null);
          setAutoSaveStatus('idle');
          setLastSavedTime(null);

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

        const isNetworkIssue =
          !isOnline() ||
          err?.message?.includes('fetch') ||
          err?.message?.includes('network') ||
          err?.message?.includes('NetworkError') ||
          err?.message?.includes('Failed to fetch');

        if (isNetworkIssue) {
          try {
            await saveOfflineDraft(pertanyaan.id_pertanyaan, offlinePayload);
            setAutoSaveStatus('saved');
          } catch {}
          toast.success(
            'Koneksi terputus. Isian Anda aman tersimpan di IndexedDB dan akan disinkronkan otomatis saat online.',
            { duration: 6000 }
          );
        } else {
          toast.error('Terjadi kesalahan saat memproses penyimpanan.');
        }
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
      {/* 0. DRAFT RECOVERY NOTIFICATION BANNER */}
      {hasDraftNotice && (
        <div className='flex flex-col justify-between gap-3 rounded-xl border border-sky-200 bg-sky-50/90 p-3.5 text-xs text-sky-900 shadow-xs sm:flex-row sm:items-center dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-200'>
          <div className='flex items-center gap-2.5'>
            <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300'>
              <HardDrive className='h-4 w-4' />
            </div>
            <div>
              <div className='font-semibold text-sky-950 dark:text-sky-100'>
                Draf Lokal Ditemukan (IndexedDB)
              </div>
              <p className='text-2xs mt-0.5 text-sky-800/80 dark:text-sky-300/80'>
                {savedDraftData?.savedAt
                  ? `Draf lokal ditemukan dari tanggal/waktu ${savedDraftData.savedAt}. Klik untuk Pulihkan.`
                  : 'Terdapat perubahan isian lokal tersimpan di browser yang belum dikirim ke server. Klik untuk Pulihkan.'}
              </p>
            </div>
          </div>
          <div className='flex shrink-0 items-center gap-2 self-end sm:self-center'>
            <Button
              type='button'
              size='sm'
              variant='outline'
              onClick={handleDiscardDraft}
              className='text-2xs h-7 border-sky-300 px-2.5 text-sky-800 hover:bg-sky-100 dark:border-sky-800 dark:text-sky-300'
            >
              <Trash2 className='mr-1 h-3 w-3 text-rose-500' />
              Bersihkan Draf
            </Button>
            <Button
              type='button'
              size='sm'
              onClick={handleRestoreDraft}
              className='text-2xs h-7 bg-sky-600 px-3 font-semibold text-white shadow-xs hover:bg-sky-700'
            >
              <RotateCcw className='mr-1 h-3 w-3' />
              Pulihkan Draf
            </Button>
          </div>
        </div>
      )}

      {/* AUTO-SAVE STATUS HEADER BADGE */}
      {canEdit && (
        <div className='flex items-center justify-between border-b border-gray-100 pb-2 dark:border-gray-800'>
          <div className='text-2xs flex items-center gap-1.5 text-gray-500 dark:text-gray-400'>
            <HardDrive className='h-3.5 w-3.5 text-blue-500' />
            <span>Penyimpanan Draf Offline Aktif (IndexedDB)</span>
          </div>
          <div>
            {autoSaveStatus === 'saving' && (
              <span className='text-2xs inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 font-medium text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'>
                <Loader2 className='h-3 w-3 animate-spin text-amber-500' />
                <span>Menyimpan draf ke IndexedDB...</span>
              </span>
            )}
            {autoSaveStatus === 'saved' && lastSavedTime && (
              <span className='text-2xs inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'>
                <Check className='h-3 w-3 text-emerald-600 dark:text-emerald-400' />
                <span>Draf Tersimpan Lokal ({lastSavedTime})</span>
              </span>
            )}
          </div>
        </div>
      )}
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
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  setPreviewDoc({
                    url: indicatorFolderUrl,
                    title: `Folder Bukti Indikator: ${pertanyaan.nomor_pertanyaan || 'Direktori Google Drive'}`,
                    type: 'Folder Google Drive'
                  })
                }
                className='inline-flex items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50/60 px-3 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300'
                title='Pratinjau Isi Folder di Aplikasi'
              >
                <Eye className='h-3.5 w-3.5' />
                <span>Pratinjau</span>
              </Button>
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

      {/* SMART SUGGESTION BUKTI DUKUNG SERUPA (TPI BPS RI BEST PRACTICE) */}
      <SmartSuggestionCard
        pertanyaan={{
          id_pertanyaan: pertanyaan.id_pertanyaan,
          nomor_pertanyaan: pertanyaan.nomor_pertanyaan,
          uraian_pertanyaan: pertanyaan.uraian_pertanyaan,
          deskripsi_pertanyaan: pertanyaan.deskripsi_pertanyaan
        }}
        pilarId={
          targetPilarId ||
          (pertanyaan as any).pilar_id ||
          (pertanyaan as any).id_pilar
        }
        catatan={catatanOperator}
        onApplyNarration={(narration) => setCatatanOperator(narration)}
        disabled={!canEdit}
      />

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

            {canEdit && addDocMode === 'none' && (
              <div className='flex flex-wrap items-center gap-1.5'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => setAddDocMode('single')}
                  disabled={isPending}
                  className='h-8 text-xs font-semibold'
                >
                  <Plus className='mr-1.5 h-3.5 w-3.5' />
                  Tambah Dokumen Tunggal
                </Button>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => setAddDocMode('batch')}
                  disabled={isPending}
                  className='h-8 border-indigo-200 bg-indigo-50/70 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 dark:border-indigo-800 dark:bg-indigo-950/40 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
                  title='Unggah banyak berkas sekaligus via Drag & Drop atau tempel tautan'
                >
                  <UploadCloud className='mr-1.5 h-3.5 w-3.5' />
                  Unggah Massal / Drag-and-Drop
                </Button>
              </div>
            )}
          </div>
        </div>

        <p className='mb-3 text-xs text-gray-500 dark:text-gray-400'>
          Daftar tautan spesifik file Google Drive yang menjadi bukti dukung
          pemenuhan indikator ini (misal: Notula Rapat, Daftar Hadir, SK Tim
          Kerja):
        </p>

        {/* Pre-Audit QA Checklist (5 Dokumen Kunci) */}
        <div className='mb-4'>
          <QAChecklistCard dokumenList={dokumenList} />
        </div>

        {/* Existing / Uploaded Documents List */}
        {dokumenList.length === 0 && addDocMode === 'none' ? (
          <div className='rounded-lg border border-dashed border-gray-300 bg-gray-50/50 p-6 text-center dark:border-gray-700 dark:bg-gray-900/30'>
            <FileText className='mx-auto h-8 w-8 text-gray-400 dark:text-gray-500' />
            <p className='mt-2 text-xs font-medium text-gray-600 dark:text-gray-400'>
              Belum ada berkas bukti dukung yang ditambahkan.
            </p>
            {canEdit && (
              <div className='mt-3 flex flex-wrap items-center justify-center gap-2'>
                <Button
                  type='button'
                  size='sm'
                  variant='outline'
                  onClick={() => setAddDocMode('single')}
                  className='text-xs'
                >
                  <Plus className='mr-1 h-3.5 w-3.5' />
                  Tambah Dokumen Tunggal
                </Button>
                <Button
                  type='button'
                  size='sm'
                  onClick={() => setAddDocMode('batch')}
                  className='bg-indigo-600 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700'
                >
                  <UploadCloud className='mr-1 h-3.5 w-3.5' />
                  Unggah Massal / Drag-and-Drop
                </Button>
              </div>
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

                    {/* AI Metadata Extractor & Period Validation */}
                    <div className='mt-1.5'>
                      <AIMetadataBadge
                        namaDokumen={doc.nama_dokumen}
                        fileUrl={doc.file_url}
                        tipeDokumen={doc.tipe_dokumen}
                        activeYear={activePeriodeYear}
                        onInsertNarration={handleInsertCitationToCatatan}
                      />
                    </div>

                    {/* Badge Penghematan Kompresi Gambar Client-Side */}
                    {doc.compressionResult &&
                      doc.compressionResult.isCompressed && (
                        <div className='mt-2'>
                          <FileCompressionBadge
                            result={doc.compressionResult}
                            fileName={doc.nama_dokumen}
                          />
                        </div>
                      )}

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
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={() =>
                      setPreviewDoc({
                        url: doc.file_url,
                        title: doc.nama_dokumen,
                        type: doc.tipe_dokumen || undefined
                      })
                    }
                    className='inline-flex min-h-[36px] touch-manipulation items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 hover:text-indigo-800 sm:min-h-[30px] dark:border-indigo-800 dark:bg-indigo-950/50 dark:text-indigo-300 dark:hover:bg-indigo-900/60'
                    title='Pratinjau Dokumen Terpadu'
                  >
                    <Eye className='h-3.5 w-3.5' />
                    <span>Pratinjau</span>
                  </Button>

                  <a
                    href={doc.file_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='inline-flex min-h-[36px] touch-manipulation items-center gap-1.5 rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 sm:min-h-[30px] dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
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
                      className='h-9 min-h-[36px] w-9 min-w-[36px] touch-manipulation text-rose-600 hover:bg-rose-50 hover:text-rose-700 sm:h-8 sm:min-h-[32px] sm:w-8 sm:min-w-[32px] dark:text-rose-400 dark:hover:bg-rose-950/40'
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

        {/* Batch Upload & Drag-and-Drop Dropzone Component */}
        {addDocMode === 'batch' && canEdit && (
          <div className='mt-4'>
            <div className='mb-2 flex items-center justify-between'>
              <span className='text-xs font-bold text-indigo-900 dark:text-indigo-200'>
                Mode: Unggah Massal & Drag-and-Drop Bukti Dukung
              </span>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setAddDocMode('single')}
                className='text-2xs h-7 text-gray-600 hover:text-indigo-600 dark:text-gray-400 dark:hover:text-indigo-300'
              >
                Ganti ke Tambah Dokumen Tunggal
              </Button>
            </div>
            <BatchUploadDropzone
              onBatchAdd={handleBatchAddDocuments}
              onCancel={() => setAddDocMode('none')}
              defaultFolderUrl={indicatorFolderUrl}
            />
          </div>
        )}

        {/* Inline Add Document Form (Single) */}
        {addDocMode === 'single' && canEdit && (
          <form
            onSubmit={handleAddDocument}
            className='mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/20'
          >
            <div className='mb-3 flex items-center justify-between'>
              <h5 className='text-xs font-bold tracking-wider text-blue-900 uppercase dark:text-blue-200'>
                Tambah Dokumen Bukti Tunggal
              </h5>
              <Button
                type='button'
                variant='ghost'
                size='sm'
                onClick={() => setAddDocMode('batch')}
                className='text-2xs h-6 font-semibold text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
              >
                <UploadCloud className='mr-1 h-3 w-3' />
                Beralih ke Unggah Massal / Drag-and-Drop
              </Button>
            </div>

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

            {/* Opsi Unggah & Kompresi Otomatis Foto Dokumentasi / Dokumen Pindaian */}
            <div className='mb-3 rounded-lg border border-dashed border-blue-300 bg-white/90 p-3 shadow-2xs dark:border-blue-700 dark:bg-gray-800/80'>
              <div className='mb-1.5 flex items-center justify-between'>
                <label className='flex items-center gap-1.5 text-xs font-semibold text-blue-900 dark:text-blue-200'>
                  <Sparkles className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                  <span>
                    Unggah Foto Dokumentasi / Dokumen Scan (Kompresi Otomatis):
                  </span>
                </label>
                {isCompressingSingle && (
                  <span className='flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400'>
                    <Loader2 className='h-3 w-3 animate-spin' /> Mengompresi...
                  </span>
                )}
              </div>
              <input
                type='file'
                accept='image/jpeg,image/png,image/webp,image/jpg'
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (isCompressibleImage(file)) {
                    setIsCompressingSingle(true);
                    try {
                      const compRes = await compressImageFile(file);
                      setSingleDocCompression(compRes);
                      if (!newDocNama.trim()) {
                        setNewDocNama(cleanDocTitle(file.name));
                      }
                      if (newDocTipe === 'Undangan') {
                        setNewDocTipe('Dokumentasi / Foto');
                      }
                      if (!newDocUrl.trim()) {
                        const genUrl = indicatorFolderUrl
                          ? `${indicatorFolderUrl.replace(/\/$/, '')}#file=${encodeURIComponent(compRes.file.name)}`
                          : `https://drive.google.com/file/d/upload-${Date.now()}/view`;
                        setNewDocUrl(genUrl);
                      }
                      toast.success(
                        `Foto terkompresi: Hemat ${compRes.savedPercent}% (${formatFileSize(compRes.savingsBytes)} kuota dihemat)`
                      );
                    } catch {
                      toast.error('Gagal mengompresi gambar.');
                    } finally {
                      setIsCompressingSingle(false);
                    }
                  }
                }}
                className='w-full text-xs text-gray-600 file:mr-2.5 file:rounded-md file:border-0 file:bg-blue-100 file:px-2.5 file:py-1 file:text-xs file:font-semibold file:text-blue-700 hover:file:bg-blue-200 dark:text-gray-300 dark:file:bg-blue-950 dark:file:text-blue-300'
              />
              {singleDocCompression && singleDocCompression.isCompressed && (
                <div className='mt-2.5'>
                  <FileCompressionBadge result={singleDocCompression} />
                </div>
              )}
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
                onClick={() => {
                  setAddDocMode('none');
                  setSingleDocCompression(null);
                }}
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

        {/* AI Completeness & Consistency Checker */}
        <AICompletenessChecker
          pertanyaan={pertanyaan}
          catatan={catatanOperator}
          dokumenList={dokumenList}
          onApplyNarration={(text) => setCatatanOperator(text)}
          disabled={!canEdit || isPending}
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
