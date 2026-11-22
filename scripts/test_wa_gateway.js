/* eslint-disable no-console */
/**
 * Skrip Pengujian Notifikasi WhatsApp REBO V2
 * Cara Penggunaan:
 *   node scripts/test_wa_gateway.js [nomor_tujuan] [pesan_opsional]
 * Contoh:
 *   node scripts/test_wa_gateway.js 08123456789
 */

const fs = require('fs');
const path = require('path');

function getEnvConfig() {
  const envPath = path.join(__dirname, '..', '.env.local');
  let gatewayUrl =
    process.env.WHATSAPP_GATEWAY_URL ||
    process.env.WA_GATEWAY_URL ||
    'http://localhost:8000';
  let defaultReceiver = process.env.WA_DEFAULT_RECEIVER || '';
  let apiKey =
    process.env.WHATSAPP_API_KEY || process.env.WA_GATEWAY_API_KEY || '';

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const urlMatch = content.match(
      /(?:WHATSAPP_GATEWAY_URL|WA_GATEWAY_URL)=["']?([^"'\r\n]+)["']?/
    );
    const receiverMatch = content.match(
      /(?:WHATSAPP_DEFAULT_RECEIVER|WA_DEFAULT_RECEIVER)=["']?([^"'\r\n]+)["']?/
    );
    const keyMatch = content.match(
      /(?:WHATSAPP_API_KEY|WA_GATEWAY_API_KEY)=["']?([^"'\r\n]+)["']?/
    );
    if (urlMatch) gatewayUrl = urlMatch[1];
    if (receiverMatch) defaultReceiver = receiverMatch[1];
    if (keyMatch) apiKey = keyMatch[1];
  }

  // Normalisasi URL: tambahkan /send-message jika belum ada
  gatewayUrl = gatewayUrl.replace(/\/+$/, '');
  if (!gatewayUrl.endsWith('/send-message')) {
    gatewayUrl += '/send-message';
  }

  return { gatewayUrl, defaultReceiver, apiKey };
}

async function main() {
  const { gatewayUrl, defaultReceiver, apiKey } = getEnvConfig();
  const targetPhone = process.argv[2] || defaultReceiver;
  const customMessage = process.argv[3];

  if (!targetPhone) {
    console.error('❌ Error: Masukkan nomor tujuan!');
    console.log(
      'Penggunaan: node scripts/test_wa_gateway.js <nomor_tujuan> [pesan]'
    );
    console.log('Contoh   : node scripts/test_wa_gateway.js 08123456789\n');
    process.exit(1);
  }

  const defaultMessage = `🔔 *[UJI COBA NOTIFIKASI REBO V2]*

Halo Tim Kerja Reformasi Birokrasi BPS Sitaro,

Ini adalah pesan pengujian koneksi WhatsApp Gateway otomatis dari sistem REBO V2.

✅ Layanan Gateway: Terhubung
🕒 Waktu Pengujian: ${new Date().toLocaleString('id-ID')}

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;

  const messageToSend = customMessage || defaultMessage;

  console.log('======================================================');
  console.log('📱 Mengirim Pesan Uji Coba WhatsApp...');
  console.log(`   Gateway URL : ${gatewayUrl}`);
  console.log(`   Nomor Tujuan: ${targetPhone}`);
  console.log('======================================================\n');

  try {
    const response = await fetch(gatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        phone: targetPhone,
        message: messageToSend
      })
    });

    const data = await response.json();
    if (response.ok && data.success) {
      console.log('✅ SUKSES: Pesan WhatsApp berhasil dikirim!');
      console.log('   Message ID:', data.messageId);
      console.log('   Target JID:', data.target);
    } else {
      console.error('❌ GAGAL:', data.error || response.statusText);
      console.log('\n💡 Tips: Pastikan service gateway sudah berjalan dengan:');
      console.log('   cd services/wa-gateway && npm start');
      console.log('   dan QR Code sudah dipindai via WhatsApp.');
    }
  } catch (err) {
    console.error('❌ Terjadi kesalahan jaringan:', err.message);
    console.log(
      '\n💡 Tips: Service WA Gateway belum aktif di URL:',
      gatewayUrl
    );
    console.log(
      '   Jalankan: cd services/wa-gateway && npm install && npm start'
    );
  }
}

main();
