'use server';

import {
  analyzeLKECatatan,
  buildLLMPrompt,
  type LKEAnalysisRequest,
  type LKEAnalysisResult
} from '@/lib/ai/lke-checker';
import {
  extractDocumentMetadata,
  type DocumentMetadataInput,
  type DocumentMetadataResult
} from '@/lib/ai/metadata-extractor';
import {
  getSmartSuggestion,
  type SmartSuggestionParams,
  type SmartSuggestionMatchResult
} from '@/lib/ai/smart-suggestions';

/**
 * Server Action: Cek kelengkapan & konsistensi narasi bukti dukung LKE
 * Digunakan oleh operator sebelum mengajukan bukti dukung ke Verifikator/TPI
 */
export async function checkLKECatatanCompletenessAction(
  request: LKEAnalysisRequest
): Promise<{ success: boolean; data?: LKEAnalysisResult; error?: string }> {
  try {
    if (!request || !request.pertanyaan) {
      return {
        success: false,
        error: 'Data pertanyaan LKE tidak valid.'
      };
    }

    // 1. Analisis Heuristik (Rule-based) sebagai engine dasar yang cepat & deterministik
    const result = analyzeLKECatatan(request);

    // 2. Jika konfigurasi LLM (GEMINI_API_KEY) tersedia di environment, panggil LLM untuk rekomendasi tambahan
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && request.catatan && request.catatan.trim().length > 15) {
      try {
        const prompt = buildLLMPrompt(request);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // Max 4 detik agar UI tetap responsif

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 300, temperature: 0.2 }
            }),
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const aiText = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiText && typeof aiText === 'string') {
            result.findings.push({
              type: 'info',
              title: 'Rekomendasi Cerdas Gemini AI',
              message: aiText.substring(0, 300)
            });
          }
        }
      } catch {
        // Fallback anggun (silent fail) ke rule-based engine jika API LLM tidak dapat dihubungi
      }
    }

    return {
      success: true,
      data: result
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Terjadi kesalahan saat memeriksa kualitas narasi.'
    };
  }
}

/**
 * Server Action: Buat template draf narasi terstruktur otomatis (What, Why, How, Bukti)
 * Membantu operator menyusun kalimat penjelasan standar RB/ZI
 */
export async function generateSuggestedNarrationAction(
  request: LKEAnalysisRequest
): Promise<{ success: boolean; suggestion?: string; error?: string }> {
  try {
    const { pertanyaan, dokumenList = [] } = request;
    const currentYear = new Date().getFullYear();

    const docNames =
      dokumenList.length > 0
        ? dokumenList.map((d) => d.nama_dokumen).join(', ')
        : 'SK Tim Kerja / Notula Rapat / SOP terkait';

    const template = `Telah dilaksanakan kegiatan pemenuhan indikator "${pertanyaan.uraian_pertanyaan}" oleh tim kerja BPS Kabupaten Kepulauan Sitaro pada Tahun ${currentYear}. Kegiatan ini dilaksanakan secara terencana dan berkesinambungan sesuai dengan prosedur kerja yang berlaku untuk memastikan kepatuhan standar Zona Integritas. Bukti dukung telah didokumentasikan dan dilampirkan secara lengkap dalam berkas: ${docNames}.`;

    return {
      success: true,
      suggestion: template
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Gagal menghasilkan saran narasi.'
    };
  }
}

/**
 * Server Action: Ekstraksi otomatis metadata dokumen bukti dukung & validasi periode evaluasi
 * Mengekstrak nomor naskah dinas, tanggal dokumen, penandatangan, dan memvalidasi tahun terhadap periode aktif
 */
export async function extractDocumentMetadataAction(
  params: DocumentMetadataInput
): Promise<{
  success: boolean;
  data?: DocumentMetadataResult;
  error?: string;
}> {
  try {
    if (
      !params ||
      (!params.nama_dokumen && !params.file_url && !params.teks_konten)
    ) {
      return {
        success: false,
        error: 'Data dokumen tidak valid untuk ekstraksi metadata.'
      };
    }

    // 1. Ekstraksi Pola Cerdas (Heuristic Engine) - Instan, deterministik, dan andal
    const result = extractDocumentMetadata(params);

    // 2. Jika konfigurasi LLM (GEMINI_API_KEY) tersedia dan nomor surat belum terdeteksi sempurna namun ada teks, coba perkaya
    const geminiKey = process.env.GEMINI_API_KEY;
    if (
      geminiKey &&
      (!result.nomor_surat || !result.penandatangan) &&
      (params.teks_konten ||
        (params.nama_dokumen && params.nama_dokumen.length > 25))
    ) {
      try {
        const textSample =
          `${params.nama_dokumen} ${params.teks_konten || ''}`.substring(
            0,
            500
          );
        const prompt = `Kamu adalah sistem ekstraksi naskah dinas resmi BPS (Badan Pusat Statistik). Dari teks berikut, ekstrak dalam format JSON valid: {"nomor_surat": string | null, "tanggal": string | null, "penandatangan": string | null}. Teks: "${textSample}". Berikan HANYA JSON.`;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { maxOutputTokens: 200, temperature: 0.1 }
            }),
            signal: controller.signal
          }
        );
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = await res.json();
          const rawAi = json?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawAi) {
            const cleanJson = rawAi
              .replace(/```json/gi, '')
              .replace(/```/g, '')
              .trim();
            const parsed = JSON.parse(cleanJson);
            if (!result.nomor_surat && parsed.nomor_surat) {
              result.nomor_surat = parsed.nomor_surat;
            }
            if (!result.penandatangan && parsed.penandatangan) {
              result.penandatangan = parsed.penandatangan;
            }
          }
        }
      } catch {
        // Fallback anggun ke heuristic result
      }
    }

    return {
      success: true,
      data: result
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Gagal mengekstrak metadata dokumen.'
    };
  }
}

/**
 * Server Action: Dapatkan rekomendasi cerdas bukti dukung serupa (Zero Revision TPI BPS RI)
 * Mencocokkan indikator LKE dengan bank referensi praktik terbaik 6 Pilar ZI
 */
export async function getSmartSuggestionAction(params: {
  id_pertanyaan: string;
  pilar_id?: string;
  judul_pertanyaan: string;
  penjelasan?: string;
}): Promise<{
  success: boolean;
  data?: SmartSuggestionMatchResult;
  error?: string;
}> {
  try {
    if (!params || !params.judul_pertanyaan) {
      return {
        success: false,
        error:
          'Judul pertanyaan wajib disertakan untuk pencocokan bukti dukung.'
      };
    }

    const matchResult = getSmartSuggestion({
      id_pertanyaan: params.id_pertanyaan,
      pilar_id: params.pilar_id,
      judul_pertanyaan: params.judul_pertanyaan,
      penjelasan: params.penjelasan
    });

    return {
      success: true,
      data: matchResult
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'Gagal mengambil rekomendasi bukti dukung serupa.'
    };
  }
}
