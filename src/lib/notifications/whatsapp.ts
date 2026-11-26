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
 * Format dan sanitasi nomor telepon ke standar internasional Indonesia (contoh: 08123... -> 628123...)
 * Menghapus seluruh karakter non-angka (spasi, tanda hubung -, tanda kurung (), titik, plus, dll)
 * Menangani nomor dengan awalan 0, +62, 62, 0062, atau 8, serta mengatasi input keliru seperti 6208...
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  // Bersihkan semua karakter selain angka
  let cleaned = phone.replace(/[^0-9]/g, '');

  if (!cleaned) return '';

  // Hilangkan prefix internasional 00 jika ada (misal 0062...)
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.slice(2);
  }

  // Jika berawalan 620... (misal pengguna mengetik +6208...), buang angka 0 setelah 62
  if (cleaned.startsWith('620')) {
    cleaned = '62' + cleaned.slice(3);
  } else if (cleaned.startsWith('0')) {
    // Awalan 08... -> 628...
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    // Awalan 8... -> 628...
    cleaned = '62' + cleaned;
  }
  // Jika sudah berawalan 628... tetap dipertahankan

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
 * Jika WA_GATEWAY_URL tidak dikonfigurasi di environment, fungsi ini akan me-log simulasi tanpa error
 */
export async function sendWhatsAppMessage(
  payload: WhatsAppNotificationPayload
): Promise<{
  success: boolean;
  error?: string;
  isSimulated?: boolean;
  messageId?: string;
  isDisconnected?: boolean;
  qrUrl?: string;
}> {
  try {
    let gatewayUrl =
      process.env.WHATSAPP_GATEWAY_URL || process.env.WA_GATEWAY_URL;
    const gatewayApiKey =
      process.env.WHATSAPP_API_KEY || process.env.WA_GATEWAY_API_KEY || '';

    if (!payload.phone) {
      return { success: false, error: 'Nomor WhatsApp tujuan tidak tersedia.' };
    }

    const formattedPhone = formatPhoneNumber(payload.phone);

    // Jika URL Gateway belum diset, log preview pesan dalam mode simulasi
    if (!gatewayUrl) {
      console.log(
        `[WA-NOTIFICATION] (Mode Simulasi) Pesan ke ${formattedPhone}:\n${payload.message}`
      );
      return {
        success: true,
        isSimulated: true
      };
    }

    // Pastikan endpoint mengarah ke /send-message jika hanya berupa base URL
    gatewayUrl = gatewayUrl.replace(/\/+$/, '');
    const baseUrl = gatewayUrl.replace(/\/send-message$/, '');
    const qrUrl = `${baseUrl}/qr`;
    if (!gatewayUrl.endsWith('/send-message')) {
      gatewayUrl += '/send-message';
    }

    const requestBody = JSON.stringify({
      target: formattedPhone,
      phone: formattedPhone,
      message: payload.message,
      text: payload.message
    });

    const requestHeaders = {
      'Content-Type': 'application/json',
      ...(gatewayApiKey ? { Authorization: `Bearer ${gatewayApiKey}` } : {})
    };

    // Kirim request ke WA Gateway dengan timeout 5000ms untuk respons cepat tanpa hang lama
    let response: Response;
    try {
      response = await fetch(gatewayUrl, {
        method: 'POST',
        headers: requestHeaders,
        body: requestBody,
        signal: AbortSignal.timeout(5000)
      });
    } catch (fetchErr: any) {
      // Jika terjadi timeout saat cold-start, coba 1x lagi dengan timeout 4000ms
      console.warn(
        `[WA-NOTIFICATION] Percobaan pertama gateway mengalami kendala (${fetchErr.message}). Mencoba ulang cepat...`
      );

      try {
        response = await fetch(gatewayUrl, {
          method: 'POST',
          headers: requestHeaders,
          body: requestBody,
          signal: AbortSignal.timeout(4000)
        });
      } catch (retryErr: any) {
        const isRetryTimeout =
          retryErr?.name === 'TimeoutError' ||
          retryErr?.name === 'AbortError' ||
          retryErr?.message?.toLowerCase().includes('aborted') ||
          retryErr?.message?.toLowerCase().includes('timeout');

        const userFriendlyMessage = isRetryTimeout
          ? 'Gateway WhatsApp sedang bangun dari mode sleep (Render cold start timeout). Pesan telah disimpan di antrean Redis dan akan dicoba ulang otomatis.'
          : `Gagal menghubungi WhatsApp Gateway: ${retryErr.message || 'Layanan sedang offline atau memulai ulang.'}`;

        console.warn(
          '[WA-NOTIFICATION] Percobaan ulang gateway gagal:',
          retryErr.message
        );
        return { success: false, error: userFriendlyMessage };
      }
    }

    if (!response.ok) {
      const errText = await response.text();
      console.warn('[WA-NOTIFICATION] Gateway response error:', errText);

      // Periksa apakah gateway mengembalikan status belum ditautkan (scan QR)
      const isQrNeeded =
        errText.toLowerCase().includes('belum terhubung') ||
        errText.toLowerCase().includes('scan qr') ||
        errText.toLowerCase().includes('disconnected') ||
        errText.toLowerCase().includes('logged out');

      if (isQrNeeded || response.status === 503) {
        // Parse pesan spesifik dari JSON jika ada
        let specificError =
          'Bot WhatsApp belum terhubung (belum scan QR). Silakan scan QR code di WhatsApp Gateway.';
        try {
          const parsed = JSON.parse(errText);
          if (parsed.error) specificError = parsed.error;
        } catch {}

        return {
          success: false,
          error: specificError,
          isDisconnected: true,
          qrUrl
        };
      }

      const isGatewayStarting = [502, 504].includes(response.status);
      const errorMessage = isGatewayStarting
        ? 'Layanan WhatsApp Gateway sedang dalam proses booting (Render 502/504). Mohon tunggu sebentar lalu coba lagi.'
        : `Gateway error: ${response.statusText} (${response.status})`;
      return { success: false, error: errorMessage };
    }

    let messageId: string | undefined;
    try {
      const responseJson = await response.json().catch(() => null);
      if (responseJson && (responseJson.messageId || responseJson.id)) {
        messageId = responseJson.messageId || responseJson.id;
      }
    } catch {
      // response might not be JSON or already consumed
    }

    return { success: true, messageId };
  } catch (err: any) {
    console.warn('[WA-NOTIFICATION] Gagal mengirim pesan:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Template Pesan Notifikasi Revisi LKE
 */
export interface BuktiRevisionNotificationParams {
  indikatorKode: string;
  namaIndikator: string;
  pilarNama: string;
  catatanKoordinator?: string | null;
  catatanRevisi?: string | null;
  catatanVerifikasi?: string | null;
  namaKoordinator?: string | null;
  namaVerifikator?: string | null;
  appUrl?: string;
}

export function formatBuktiRevisionNotification(
  params: BuktiRevisionNotificationParams
): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  const catatan =
    params.catatanKoordinator ||
    params.catatanRevisi ||
    params.catatanVerifikasi ||
    'Perlu perbaikan kelengkapan berkas bukti dukung.';
  const verifikator =
    params.namaKoordinator ||
    params.namaVerifikator ||
    'Koordinator Pilar / Verifikator';

  return `⚠️ *[REBO V2 - NOTIFIKASI REVISI LKE]*

Halo Rekan Tim Kerja RB,

Indikator penilaian LKE berikut memerlukan perbaikan berkas bukti dukung:

📋 *Indikator:* ${params.indikatorKode} - ${params.namaIndikator}
🏛️ *Pilar:* ${params.pilarNama}
👤 *Verifikator:* ${verifikator}

📝 *Catatan Perbaikan:*
"${catatan}"

Silakan lakukan perbaikan dan unggah dokumen revisi melalui tautan berikut:
🔗 ${baseAppUrl}/rebo/kanban

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}

export const formatRevisiMessage = formatBuktiRevisionNotification;

/**
 * Template Pesan Notifikasi Persetujuan (Approved) LKE
 */
export interface BuktiApprovedNotificationParams {
  indikatorKode: string;
  namaIndikator: string;
  pilarNama: string;
  skor: number;
  namaKoordinator?: string | null;
  namaVerifikator?: string | null;
  appUrl?: string;
}

export function formatBuktiApprovedNotification(
  params: BuktiApprovedNotificationParams
): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  const verifikator =
    params.namaKoordinator ||
    params.namaVerifikator ||
    'Koordinator Pilar / Verifikator';

  return `✅ *[REBO V2 - BUKTI DUKUNG DISETUJUI]*

Halo Rekan Tim Kerja RB,

Bukti dukung untuk indikator berikut telah diverifikasi dan disetujui:

📋 *Indikator:* ${params.indikatorKode} - ${params.namaIndikator}
🏛️ *Pilar:* ${params.pilarNama}
⭐ *Skor Verifikasi:* ${Number(params.skor).toFixed(2)}
👤 *Verifikator:* ${verifikator}

Terima kasih atas pemenuhan dokumen Zona Integritas BPS Sitaro.
🔗 ${baseAppUrl}/rebo/monitoring

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}

export const formatApprovalMessage = formatBuktiApprovedNotification;

/**
 * Template Pesan Pengajuan Review dari Operator ke Koordinator & Tim Verifikator
 */
export interface BuktiSubmittedNotificationParams {
  indikatorKode: string;
  namaIndikator: string;
  pilarNama: string;
  namaOperator?: string | null;
  totalDokumen: number;
  appUrl?: string;
}

export function formatBuktiSubmittedNotification(
  params: BuktiSubmittedNotificationParams
): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  return `📩 *[REBO V2 - USULAN BUKTI DUKUNG BARU]*

Yth. Tim Verifikator / Koordinator ${params.pilarNama},

Operator telah mengirimkan usulan bukti dukung untuk diverifikasi:

📋 *Indikator:* ${params.indikatorKode} - ${params.namaIndikator}
📁 *Jumlah Dokumen:* ${params.totalDokumen} berkas
👤 *Pengunggah:* ${params.namaOperator || 'Operator Tim Kerja'}

Mohon perkenan Bapak/Ibu untuk memeriksa dan memverifikasi kelengkapan dokumen pada tautan berikut:
🔗 ${baseAppUrl}/rebo/kanban

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}

export const formatSubmissionMessage = formatBuktiSubmittedNotification;

/**
 * Template Pesan Notifikasi Pengingat Deadline LKE untuk PIC Pilar
 */
export interface DeadlineReminderParams {
  namaPic: string;
  namaPilar: string;
  pilarId: number;
  tahun: number;
  tanggalSelesaiFormatted: string;
  sisaHari: number;
  belumDiisi: number;
  perluRevisi: number;
  menungguReview: number;
  disetujui: number;
  total: number;
  persenDisetujui: number;
  appUrl?: string;
}

export function formatDeadlineReminderMessage(
  params: DeadlineReminderParams
): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  const urgencyIcon =
    params.sisaHari <= 3 ? '🚨' : params.sisaHari <= 7 ? '⚠️' : '⏰';
  const sisaHariText =
    params.sisaHari <= 0
      ? '*BATAS WAKTU HARI INI / TELAH LEWAT*'
      : `*Sisa ${params.sisaHari} Hari lagi*`;

  return `${urgencyIcon} *[REBO V2 - PENGINGAT DEADLINE LKE ZI/RB]*

Halo Yth. *${params.namaPic}*,
Koordinator *${params.namaPilar}*

Mengingatkan kembali batas waktu pengumpulan dan pemenuhan dokumen Lembar Kerja Evaluasi (LKE) ZI/RB BPS Kabupaten Kepulauan Sitaro Tahun ${params.tahun}:

📅 *Tenggat Waktu:* ${params.tanggalSelesaiFormatted} (${sisaHariText})

📊 *Status Capaian ${params.namaPilar}:*
• ⚪ Belum Diisi: *${params.belumDiisi}* indikator
• 🔴 Perlu Revisi: *${params.perluRevisi}* indikator
• 🟡 Menunggu Review: *${params.menungguReview}* indikator
• 🟢 Telah Disetujui: *${params.disetujui}* dari *${params.total}* indikator (${params.persenDisetujui}%)

⚠️ Mohon perkenan Bapak/Ibu untuk segera mengunggah kelengkapan dokumen dan menyelesaikan revisi sebelum batas waktu berakhir.

🔗 Akses formulir & tindak lanjut:
${baseAppUrl}/rebo/kanban

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}

/**
 * Template Pesan Notifikasi Rekapitulasi Progres LKE untuk Admin & Pimpinan
 */
export interface WeeklyRecapParams {
  tahun: number;
  namaPeriode: string;
  tanggalSelesaiFormatted: string;
  sisaHari: number;
  globalStats: {
    total: number;
    disetujui: number;
    menungguReview: number;
    perluRevisi: number;
    belumDiisi: number;
    persenDisetujui: number;
  };
  pilarList: Array<{
    pilarId: number;
    namaPilar: string;
    persenDisetujui: number;
    belumDiisi: number;
    perluRevisi: number;
    disetujui: number;
    total: number;
  }>;
  appUrl?: string;
}

export function formatWeeklyRecapMessage(params: WeeklyRecapParams): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  const sisaHariText =
    params.sisaHari <= 0
      ? '*Batas Waktu Berakhir*'
      : `Sisa ${params.sisaHari} Hari`;

  const pilarLines = params.pilarList
    .map(
      (p, i) =>
        `${i + 1}. *${p.namaPilar}*: ${p.persenDisetujui}% (Disetujui: ${p.disetujui}/${p.total}, Belum: ${p.belumDiisi}, Revisi: ${p.perluRevisi})`
    )
    .join('\n');

  return `📊 *[REBO V2 - REKAPITULASI PROGRES LKE ZI/RB]*

Yth. Pimpinan & Tim Pengarah ZI/RB BPS Kabupaten Kepulauan Sitaro,

Berikut ringkasan progres pemenuhan Lembar Kerja Evaluasi (LKE) ZI/RB Periode *${params.namaPeriode}*:

📅 *Batas Waktu:* ${params.tanggalSelesaiFormatted} (${sisaHariText})
🎯 *Progress Keseluruhan:* *${params.globalStats.disetujui}/${params.globalStats.total}* Indikator Disetujui (*${params.globalStats.persenDisetujui}%*)

🏛️ *Rincian Capaian per Pilar:*
${pilarLines}

📌 *Status Akumulasi:*
• 🟢 Disetujui: *${params.globalStats.disetujui}* indikator
• 🟡 Menunggu Review: *${params.globalStats.menungguReview}* indikator
• 🔴 Perlu Revisi: *${params.globalStats.perluRevisi}* indikator
• ⚪ Belum Diisi: *${params.globalStats.belumDiisi}* indikator

🔗 Pantau dashboard pemantauan real-time:
${baseAppUrl}/rebo/monitoring

_Laporan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;
}
