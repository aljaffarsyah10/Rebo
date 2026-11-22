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
const QRCode = require('qrcode');
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

// Middleware keamanan opsional dengan API Key (hanya untuk endpoint mutasi / pengiriman)
app.use((req, res, next) => {
  // Biarkan endpoint publik (status, health check, dan web QR code) dapat dibuka langsung
  if (req.path === '/qr' || req.path === '/' || req.path === '/health') {
    return next();
  }

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

// Halaman Web Khusus Scan QR Code (Mudah dipindai dari HP, anti-gagal, bebas distorsi font terminal)
app.get('/qr', async (req, res) => {
  if (isConnected) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>WhatsApp Terhubung - REBO Gateway</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f0fdf4;margin:0;padding:16px;">
          <div style="background:white;padding:36px;border-radius:24px;box-shadow:0 10px 25px rgba(22,163,74,0.12);text-align:center;max-width:400px;border:1px solid #bbf7d0;">
            <div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;color:#16a34a;display:inline-flex;align-items:center;justify-content:center;font-size:32px;margin-bottom:16px;">✓</div>
            <h2 style="color:#15803d;margin:0 0 8px 0;font-size:22px;">WhatsApp Terhubung!</h2>
            <p style="color:#4b5563;font-size:14px;line-height:1.5;margin:0 0 16px 0;">Bot WhatsApp REBO BPS Sitaro telah aktif dan siap mengirimkan notifikasi otomatis.</p>
            <div style="background:#f8fafc;padding:12px;border-radius:12px;font-family:monospace;font-size:13px;color:#334155;">
              Nomor Bot: ${sock?.user?.id ? sock.user.id.split(':')[0] : 'Aktif'}
            </div>
          </div>
        </body>
      </html>
    `);
  }

  if (!qrCodeString) {
    return res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Memuat QR Code...</title>
          <meta http-equiv="refresh" content="3">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f8fafc;margin:0;padding:16px;">
          <div style="background:white;padding:36px;border-radius:24px;box-shadow:0 8px 30px rgba(0,0,0,0.06);text-align:center;max-width:380px;border:1px solid #e2e8f0;">
            <h3 style="color:#0f172a;margin:0 0 8px 0;">Menghubungkan ke WhatsApp...</h3>
            <p style="color:#64748b;font-size:14px;margin:0;">Sedang menyiapkan QR Code baru. Halaman akan memuat ulang otomatis dalam 3 detik.</p>
          </div>
        </body>
      </html>
    `);
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(qrCodeString, {
      margin: 2,
      width: 320,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      }
    });

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Pindai QR Code WhatsApp - REBO</title>
          <meta http-equiv="refresh" content="25">
          <meta name="viewport" content="width=device-width, initial-scale=1">
        </head>
        <body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;background:#f8fafc;margin:0;padding:20px;">
          <div style="background:white;padding:32px;border-radius:24px;box-shadow:0 12px 35px rgba(0,0,0,0.08);text-align:center;max-width:380px;border:1px solid #e2e8f0;">
            <div style="display:inline-block;padding:8px 14px;background:#eff6ff;color:#1d4ed8;border-radius:999px;font-size:12px;font-weight:600;margin-bottom:12px;">
              REBO V2 • WhatsApp Gateway
            </div>
            <h2 style="color:#0f172a;margin:0 0 8px 0;font-size:20px;">Pindai QR Code WhatsApp</h2>
            <p style="color:#64748b;font-size:13px;line-height:1.5;margin:0 0 20px 0;">
              Buka WhatsApp di ponsel > <strong>Perangkat Tertaut (Linked Devices)</strong> > <strong>Tautkan Perangkat</strong>, lalu arahkan kamera ke kode di bawah ini:
            </p>
            
            <div style="background:#f1f5f9;padding:16px;border-radius:20px;display:inline-block;border:1px solid #cbd5e1;">
              <img src="${qrDataUrl}" alt="WhatsApp QR Code" style="width:260px;height:260px;display:block;border-radius:8px;" />
            </div>

            <p style="color:#94a3b8;font-size:11px;margin:18px 0 0 0;">
              QR Code berganti otomatis untuk keamanan.<br>Halaman ini me-refresh otomatis setiap 25 detik.
            </p>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send('Gagal membuat gambar QR: ' + err.message);
  }
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
      return res.status(400).json({
        success: false,
        error: 'Nomor WhatsApp tujuan (phone/target) wajib diisi.'
      });
    }
    if (!message) {
      return res.status(400).json({
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
