/* eslint-disable no-console */
/**
 * WhatsApp Notification Service untuk REBO V2
 *
 * Mendukung 2 metode gratis:
 * 1. Direct Webhook / Self-Hosted Gateway (Node.js Baileys / WPPConnect / Fonnte / WhatsApp-HTTP-API)
 * 2. Instant Deep Link wa.me (Zero setup, 100% gratis tanpa server bot)
 */

export interface WhatsAppNotificationPayload {
  phone?: string | null;
  message: string;
}

/**
 * Format nomor telepon Indonesia ke standar internasional (contoh: 08123... -> 628123...)
 */
export function formatPhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

/**
 * Buat tautan wa.me untuk pengiriman instan dari browser tanpa perlu server/API bot pihak ketiga
 */
export function createWhatsAppDeepLink(phone: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phone);
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Kirim notifikasi WhatsApp otomatis melalui Self-Hosted WA Gateway / Free Webhook
 * Jika WA_GATEWAY_URL tidak dikonfigurasi di environment, fungsi ini akan me-log tanpa menimbulkan error
 */
export async function sendWhatsAppMessage(
  payload: WhatsAppNotificationPayload
): Promise<{ success: boolean; error?: string }> {
  try {
    const gatewayUrl = process.env.WA_GATEWAY_URL;
    const gatewayApiKey = process.env.WA_GATEWAY_API_KEY || '';

    if (!payload.phone) {
      return { success: false, error: 'Nomor WhatsApp tujuan tidak tersedia.' };
    }

    const formattedPhone = formatPhoneNumber(payload.phone);

    // Jika URL Gateway belum diset, log preview pesan
    if (!gatewayUrl) {
      console.log(
        `[WA-NOTIFICATION] (Mode Simulasi) Pesan ke ${formattedPhone}:\n${payload.message}`
      );
      return {
        success: true
      };
    }

    // Kirim request ke WA Gateway (kompatibel dengan format umum Baileys/WPPConnect/Fonnte)
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(gatewayApiKey ? { Authorization: `Bearer ${gatewayApiKey}` } : {})
      },
      body: JSON.stringify({
        target: formattedPhone,
        phone: formattedPhone,
        message: payload.message,
        text: payload.message
      }),
      // Set timeout 5 detik agar tidak membebani server action
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[WA-NOTIFICATION] Gateway response error:', errText);
      return { success: false, error: `Gateway error: ${response.statusText}` };
    }

    return { success: true };
  } catch (err: any) {
    console.warn('[WA-NOTIFICATION] Gagal mengirim pesan:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Template Pesan Notifikasi Revisi LKE
 */
export function formatRevisiMessage(params: {
  indikatorKode: string;
  namaIndikator: string;
  pilarNama: string;
  catatanKoordinator: string;
  namaKoordinator?: string;
  appUrl?: string;
}): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  return `⚠️ *[REBO V2 - NOTIFIKASI REVISI LKE]*

Halo Rekan Tim Kerja RB,

Indikator penilaian LKE berikut memerlukan perbaikan berkas bukti dukung:

📋 *Indikator:* ${params.indikatorKode} - ${params.namaIndikator}
🏛️ *Pilar:* ${params.pilarNama}
👤 *Verifikator:* ${params.namaKoordinator || 'Koordinator Pilar'}

📝 *Catatan Perbaikan:*
"${params.catatanKoordinator}"

Silakan lakukan perbaikan dan unggah dokumen revisi melalui tautan berikut:
🔗 ${baseAppUrl}/rebo/kanban

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}

/**
 * Template Pesan Notifikasi Persetujuan (Approved) LKE
 */
export function formatApprovalMessage(params: {
  indikatorKode: string;
  namaIndikator: string;
  pilarNama: string;
  skor: number;
  namaKoordinator?: string;
  appUrl?: string;
}): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  return `✅ *[REBO V2 - BUKTI DUKUNG DISETUJUI]*

Halo Rekan Tim Kerja RB,

Bukti dukung untuk indikator berikut telah diverifikasi dan disetujui:

📋 *Indikator:* ${params.indikatorKode} - ${params.namaIndikator}
🏛️ *Pilar:* ${params.pilarNama}
⭐ *Skor Verifikasi:* ${params.skor.toFixed(2)}
👤 *Verifikator:* ${params.namaKoordinator || 'Koordinator Pilar'}

Terima kasih atas pemenuhan dokumen Zona Integritas BPS Sitaro.
🔗 ${baseAppUrl}/rebo/monitoring

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}

/**
 * Template Pesan Pengajuan Review dari Operator ke Koordinator
 */
export function formatSubmissionMessage(params: {
  indikatorKode: string;
  namaIndikator: string;
  pilarNama: string;
  namaOperator?: string;
  totalDokumen: number;
  appUrl?: string;
}): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  return `📩 *[REBO V2 - USULAN BUKTI DUKUNG BARU]*

Yth. Koordinator ${params.pilarNama},

Operator telah mengirimkan usulan bukti dukung untuk diverifikasi:

📋 *Indikator:* ${params.indikatorKode} - ${params.namaIndikator}
📁 *Jumlah Dokumen:* ${params.totalDokumen} berkas
👤 *Pengunggah:* ${params.namaOperator || 'Operator Tim Kerja'}

Mohon perkenan Bapak/Ibu untuk memeriksa dan memverifikasi kelengkapan dokumen pada tautan berikut:
🔗 ${baseAppUrl}/rebo/kanban

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}
