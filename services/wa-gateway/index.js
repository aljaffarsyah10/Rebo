/* eslint-disable no-console */
/**
 * REBO V2 — Open Source WhatsApp Gateway Service
 * Menggunakan @whiskeysockets/baileys (Multi-Device Protocol)
 *
 * Lisensi: Bebas / Gratis Tanpa Biaya API Meta
 * Pengembang: Tim ZI & Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro
 */

const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion
} = require('@whiskeysockets/baileys');
const express = require('express');
const cors = require('cors');
const qrcode = require('qrcode-terminal');
const pino = require('pino');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;
const API_KEY = process.env.API_KEY || ''; // Optional API Key security
const AUTH_DIR = path.join(__dirname, 'auth_info');

app.use(cors());
app.use(express.json());

let sock = null;
let isConnected = false;
let qrCodeString = null;

// Format nomor telepon menjadi format JID WhatsApp (e.g. 081234 -> 6281234@s.whatsapp.net)
function formatToJid(phone) {
  let cleaned = String(phone).replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.slice(1);
  }
  return `${cleaned}@s.whatsapp.net`;
}

// Inisialisasi koneksi WhatsApp Baileys
async function connectToWhatsApp() {
  const { state, saveCreds } = await useMultiFileAuthState(AUTH_DIR);
  const { version } = await fetchLatestBaileysVersion();

  console.log(
    `[WA-GATEWAY] Memulai WhatsApp Web Socket (Baileys v${version.join('.')})...`
  );

  sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // Kita cetak manual via qrcode-terminal agar rapi
    logger: pino({ level: 'silent' }), // Heningkan log verbose
    browser: ['REBO BPS Sitaro Bot', 'Chrome', '1.0.0']
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrCodeString = qr;
      console.log('\n======================================================');
      console.log('📱 SCAN QR CODE BERIKUT MENGGUNAKAN WHATSAPP:');
      console.log(
        '   (WhatsApp > Pengaturan / Titik Tiga > Perangkat Tertaut)'
      );
      console.log('======================================================\n');
      qrcode.generate(qr, { small: true });
      console.log('\n======================================================\n');
    }

    if (connection === 'close') {
      isConnected = false;
      qrCodeString = null;
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;

      console.log(
        `[WA-GATEWAY] Koneksi terputus (Status: ${statusCode}). Mencoba rekoneksi: ${shouldReconnect}...`
      );

      if (shouldReconnect) {
        setTimeout(connectToWhatsApp, 3000);
      } else {
        console.log(
          '[WA-GATEWAY] Perangkat keluar (Logged out). Silakan restart service untuk scan ulang.'
        );
      }
    } else if (connection === 'open') {
      isConnected = true;
      qrCodeString = null;
      console.log('======================================================');
      console.log('✅ WHATSAPP BERHASIL TERHUBUNG & SIAP MENGIRIM PESAN!');
      console.log(`   User ID : ${sock.user?.id?.split(':')[0] || 'Unknown'}`);
      console.log(`   Nama    : ${sock.user?.name || 'Bot REBO BPS Sitaro'}`);
      console.log(`   API URL : http://localhost:${PORT}/send-message`);
      console.log('======================================================\n');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

// ==============================================================================
// REST API ENDPOINTS
// ==============================================================================

// Middleware keamanan opsional dengan API Key
app.use((req, res, next) => {
  if (API_KEY) {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.replace('Bearer ', '');
    if (token !== API_KEY) {
      return res
        .status(401)
        .json({ success: false, error: 'Unauthorized: Invalid API Key' });
    }
  }
  next();
});

// Status Gateway
app.get('/', (req, res) => {
  res.json({
    service: 'REBO V2 WhatsApp Gateway',
    version: '1.0.0',
    status: isConnected ? 'CONNECTED' : 'DISCONNECTED',
    phone: sock?.user?.id ? sock.user.id.split(':')[0] : null,
    hasActiveQr: Boolean(qrCodeString),
    message: isConnected
      ? 'WhatsApp aktif dan siap menerima permintaan pesan.'
      : 'WhatsApp belum terhubung. Periksa terminal untuk scan QR Code.'
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', connected: isConnected });
});

// Mengirim pesan teks WhatsApp
app.post('/send-message', async (req, res) => {
  try {
    const phone = req.body.phone || req.body.target;
    const message = req.body.message || req.body.text;

    if (!phone) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Nomor WhatsApp tujuan (phone/target) wajib diisi.'
        });
    }
    if (!message) {
      return res
        .status(400)
        .json({
          success: false,
          error: 'Isi pesan teks (message/text) wajib diisi.'
        });
    }

    if (!isConnected || !sock) {
      return res.status(503).json({
        success: false,
        error:
          'WhatsApp Gateway belum terhubung. Silakan scan QR code terlebih dahulu di terminal gateway.'
      });
    }

    const jid = formatToJid(phone);
    console.log(`[WA-GATEWAY] Mengirim pesan ke: ${jid}...`);

    const result = await sock.sendMessage(jid, { text: message });

    console.log(`[WA-GATEWAY] Pesan berhasil terkirim! ID: ${result?.key?.id}`);
    return res.json({
      success: true,
      messageId: result?.key?.id,
      target: jid,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('[WA-GATEWAY] Gagal mengirim pesan:', err);
    return res
      .status(500)
      .json({ success: false, error: err.message || 'Gagal mengirim pesan.' });
  }
});

// Jalankan Server
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 REBO WhatsApp Gateway berjalan di http://localhost:${PORT}`);
  console.log(`======================================================\n`);
  connectToWhatsApp();
});
