/**
 * Utility QA Checklist Dokumen Wajib per Indikator (Pre-Audit QA Guard)
 *
 * Mendeteksi kelengkapan 5 dokumen standar wajib:
 * 1. Undangan / Nota Dinas
 * 2. Daftar Hadir / Presensi
 * 3. Notula / Risalah Rapat
 * 4. Laporan Kegiatan / Output / SOP / SK
 * 5. Dokumentasi Foto / Tangkapan Layar
 */

export const STANDAR_DOKUMEN_WAJIB = [
  {
    id: 'undangan',
    label: 'Surat Undangan / Nota Dinas',
    keywords: ['undangan', 'nota dinas', 'surat tugas', 'nd']
  },
  {
    id: 'daftar_hadir',
    label: 'Daftar Hadir / Presensi',
    keywords: ['daftar hadir', 'presensi', 'kehadiran', 'absensi']
  },
  {
    id: 'notula',
    label: 'Notula / Risalah Rapat',
    keywords: ['notula', 'notulen', 'risalah', 'catatan rapat', 'resume']
  },
  {
    id: 'laporan',
    label: 'Laporan Kegiatan / Output / SOP / SK',
    keywords: ['laporan', 'sk', 'sop', 'laptap', 'output', 'kebijakan']
  },
  {
    id: 'dokumentasi',
    label: 'Dokumentasi Foto / Tangkapan Layar',
    keywords: ['foto', 'dokumentasi', 'screenshot', 'banner', 'publikasi']
  }
] as const;

export type StandarDokumenId = (typeof STANDAR_DOKUMEN_WAJIB)[number]['id'];

export interface QAChecklistItem {
  id: string;
  label: string;
  isFulfilled: boolean;
  matchedDocName?: string;
  matchedDocType?: string;
}

export interface QAChecklistEvaluation {
  items: QAChecklistItem[];
  totalRequired: number;
  fulfilledCount: number;
  scorePercent: number;
  isComplete: boolean;
  missingLabels: string[];
}

/**
 * Mengevaluasi daftar dokumen bukti terhadap 5 standar dokumen wajib.
 *
 * @param dokumenList Daftar dokumen bukti dengan nama dan tipe
 * @returns Hasil evaluasi checklist QA
 */
export function evaluateQAChecklist(
  dokumenList: Array<{ nama_dokumen: string; tipe_dokumen?: string | null }>
): QAChecklistEvaluation {
  const items: QAChecklistItem[] = STANDAR_DOKUMEN_WAJIB.map((std) => {
    // Cari dokumen yang cocok dengan keywords
    const matchedDoc = dokumenList.find((doc) => {
      const nama = (doc.nama_dokumen || '').toLowerCase();
      const tipe = (doc.tipe_dokumen || '').toLowerCase();
      const combined = `${nama} ${tipe}`;

      return std.keywords.some((kw) => {
        const lowerKw = kw.toLowerCase();
        // Untuk kata kunci pendek seperti 'nd' dan 'sk', gunakan regex word boundary
        if (lowerKw === 'nd' || lowerKw === 'sk') {
          const regex = new RegExp(
            `(^|[^a-zA-Z0-9])${lowerKw}([^a-zA-Z0-9]|$)`,
            'i'
          );
          return regex.test(combined);
        }
        return combined.includes(lowerKw);
      });
    });

    return {
      id: std.id,
      label: std.label,
      isFulfilled: Boolean(matchedDoc),
      matchedDocName: matchedDoc ? matchedDoc.nama_dokumen : undefined,
      matchedDocType: matchedDoc?.tipe_dokumen || undefined
    };
  });

  const totalRequired = STANDAR_DOKUMEN_WAJIB.length;
  const fulfilledCount = items.filter((item) => item.isFulfilled).length;
  const scorePercent = Math.round((fulfilledCount / totalRequired) * 100);
  const isComplete = fulfilledCount === totalRequired;
  const missingLabels = items
    .filter((item) => !item.isFulfilled)
    .map((item) => item.label);

  return {
    items,
    totalRequired,
    fulfilledCount,
    scorePercent,
    isComplete,
    missingLabels
  };
}
