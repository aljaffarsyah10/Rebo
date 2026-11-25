'use server';

import {
  analyzeLKECatatan,
  buildLLMPrompt,
  type LKEAnalysisRequest,
  type LKEAnalysisResult
} from '@/lib/ai/lke-checker';

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
