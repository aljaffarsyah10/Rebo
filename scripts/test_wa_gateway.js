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
  let gatewayUrl = 'http://localhost:8000/send-message';
  let defaultReceiver = '';

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const urlMatch = content.match(/WA_GATEWAY_URL=["']?([^"'\r\n]+)["']?/);
    const receiverMatch = content.match(
      /WA_DEFAULT_RECEIVER=["']?([^"'\r\n]+)["']?/
    );
    if (urlMatch) gatewayUrl = urlMatch[1];
    if (receiverMatch) defaultReceiver = receiverMatch[1];
  }
  return { gatewayUrl, defaultReceiver };
}

async function main() {
  const { gatewayUrl, defaultReceiver } = getEnvConfig();
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
      headers: { 'Content-Type': 'application/json' },
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
