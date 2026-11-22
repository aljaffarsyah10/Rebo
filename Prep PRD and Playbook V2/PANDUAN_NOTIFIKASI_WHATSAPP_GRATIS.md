# 📱 Panduan Integrasi Notifikasi WhatsApp Gratis — REBO V2

Dokumen ini menjelaskan strategi dan cara mengintegrasikan notifikasi WhatsApp otomatis ke pengguna (Operator / Koordinator Pilar) saat terjadi aksi pengajuan (*submit*), persetujuan (*approval*), maupun penolakan (*reject / revisi*) **tanpa biaya langganan API berbayar**.

---

## 📌 Ringkasan Pilihan Solusi

| Metode | Biaya | Kebutuhan Server | Cara Kerja | Tingkat Kestabilan |
|---|---|---|---|---|
| **1. WhatsApp Direct Link (`wa.me`)** | **Gratis (Rp 0)** | Tidak butuh server | Membuka WhatsApp Web / Aplikasi dengan pesan terformat otomatis sekali klik | **Sangat Tinggi (100%)** — Resmi & aman |
| **2. Self-Hosted Open-Source Gateway (Baileys / WPPConnect)** | **Gratis (Rp 0)** | 1 instance Node.js (Render / Railway / Server Lokal BPS) | Bot WA mandiri via scan QR code, menembak pesan otomatis di background | **Tinggi** (perlu scan QR ulang jika session terputus) |
| **3. Alternatif Resmi: Telegram Bot API** | **Gratis (Rp 0)** | Tidak butuh server bot | Menggunakan bot token resmi Telegram ke chat pribadi atau grup tim kerja | **Sangat Tinggi (100%)** — Resmi & zero maintenance |

---

## 🚀 Solusi 1: WhatsApp Direct Link (wa.me) — *Siap Pakai & 0 Setup*

Metode ini **sudah langsung aktif di kode REBO V2** melalui helper [src/lib/notifications/whatsapp.ts](file:///d:/10Project/Rebo/src/lib/notifications/whatsapp.ts).

### Keunggulan:
- **Rp 0 selamanya**, tanpa server perantara, tanpa langganan API.
- **Tidak ada risiko nomor diblokir** WhatsApp karena dikirim dari akun pengguna sendiri.
- Teks pesan, judul pilar, nama indikator, catatan revisi, dan tautan halaman otomatis tersusun rapi.

### Cara Penggunaan di Antarmuka:
Saat Koordinator menyelesaikan verifikasi:
```typescript
// Hasil verifikasi dari Server Action mengembalikan waDeepLink otomatis:
if (result.waDeepLink) {
  // Pengguna dapat langsung menekan tombol "Kirim via WhatsApp":
  window.open(result.waDeepLink, '_blank');
}
```

---

## 🤖 Solusi 2: Self-Hosted Open-Source WA Gateway (Otomatis di Background)

Jika Anda ingin notifikasi terkirim **secara otomatis di latar belakang** tanpa harus mengklik WhatsApp Web, Anda dapat menjalankan *mini-service* WhatsApp Gateway open-source mandiri menggunakan library **Baileys** (library yang sama yang digunakan mayoritas penyedia WA Gateway lokal).

### Arsitektur:
```
[ REBO Next.js App ] 
        │
        ▼ (HTTP POST JSON)
[ Mini WA Gateway Service (Node.js + Baileys) ] 
        │
        ▼ (WhatsApp Web Multi-Device Protocol)
[ WhatsApp Server ] ──> [ Smartphone Operator/Koordinator ]
```

### Langkah Pemasangan Mini Gateway Gratis (5 Menit):

1. **Buat folder terpisah di komputer atau VPS gratis (Render / Railway / Server Kantor):**
   ```bash
   mkdir wa-gateway
   cd wa-gateway
   npm init -y
   npm install @whiskeysockets/baileys express qrcode-terminal
   ```

2. **Buat file `index.js` sederhana:**
   ```javascript
   const { default: makeWASocket, useMultiFileAuthState } = require('@whiskeysockets/baileys');
   const express = require('express');
   const qrcode = require('qrcode-terminal');

   const app = express();
   app.use(express.json());

   let sock;
   async function startWA() {
     const { state, saveCreds } = await useMultiFileAuthState('auth_info');
     sock = makeWASocket({ auth: state });

     sock.ev.on('connection.update', (update) => {
       const { connection, qr } = update;
       if (qr) qrcode.generate(qr, { small: true });
       if (connection === 'open') console.log('✅ WA Gateway Terhubung!');
       if (connection === 'close') startWA();
     });
     sock.ev.on('creds.update', saveCreds);
   }
   startWA();

   // Endpoint API yang ditembak oleh REBO
   app.post('/send-message', async (req, res) => {
     try {
       const { phone, message } = req.body;
       const jid = `${phone}@s.whatsapp.net`;
       await sock.sendMessage(jid, { text: message });
       res.json({ success: true });
     } catch (err) {
       res.status(500).json({ error: err.message });
     }
   });

   app.listen(8000, () => console.log('WA Gateway aktif di port 8000'));
   ```

3. **Jalankan:**
   ```bash
   node index.js
   ```
   Scan QR Code yang muncul di terminal menggunakan nomor WhatsApp khusus tim kerja/bot kantor.

4. **Hubungkan ke REBO di `.env.local`:**
   ```env
   WA_GATEWAY_URL="http://localhost:8000/send-message"
   WA_DEFAULT_RECEIVER="628123456789"
   ```
   Seketika setiap kali ada verifikasi atau revisi, sistem REBO akan mengirimkan notifikasi WA otomatis di latar belakang!

---

## 💬 Format Pesan Otomatis yang Dihasilkan REBO

### 1. Format Notifikasi Revisi (Perlu Perbaikan):
```text
⚠️ *[REBO V2 - NOTIFIKASI REVISI LKE]*

Halo Rekan Tim Kerja RB,

Indikator penilaian LKE berikut memerlukan perbaikan berkas bukti dukung:

📋 *Indikator:* 14 - Keterbukaan Informasi Publik
🏛️ *Pilar:* Penataan Tatalaksana
👤 *Verifikator:* Koordinator Pilar 2

📝 *Catatan Perbaikan:*
"Mohon lampirkan Surat Keputusan (SK) Pejabat Pengelola Informasi dan Dokumentasi (PPID) versi tahun 2026."

Silakan lakukan perbaikan dan unggah dokumen revisi melalui tautan berikut:
🔗 https://rebo.sitarokab.bps.go.id/rebo/kanban

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_
```

### 2. Format Notifikasi Persetujuan (Approved):
```text
✅ *[REBO V2 - BUKTI DUKUNG DISETUJUI]*

Halo Rekan Tim Kerja RB,

Bukti dukung untuk indikator berikut telah diverifikasi dan disetujui:

📋 *Indikator:* 2 - Prosedur Operasional Tetap (SOP) Kegiatan Utama
🏛️ *Pilar:* Penataan Tatalaksana
⭐ *Skor Verifikasi:* 0.50
👤 *Verifikator:* Koordinator Pilar 2

Terima kasih atas pemenuhan dokumen Zona Integritas BPS Sitaro.
🔗 https://rebo.sitarokab.bps.go.id/rebo/monitoring

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_
```

---

## 🔒 Tips Keamanan & Anti-Banned Nomor WhatsApp

1. **Gunakan Nomor Khusus Bot (Bukan Nomor Pribadi Pimpinan):**
   Sediakan satu nomor operasional kantor atau kartu perdana khusus untuk sistem notifikasi.
2. **Kirim Hanya Notifikasi Transaksional (Bukan Broadcast Masal):**
   Karena notifikasi hanya dikirim saat ada peristiwa riil (submit / reject indikator), frekuensinya wajar dan tidak terindikasi sebagai spam oleh Meta.
3. **Pemberian Jeda (*Rate-Limiting*):**
   Helper [src/lib/notifications/whatsapp.ts](file:///d:/10Project/Rebo/src/lib/notifications/whatsapp.ts) sudah dilengkapi timeout 5 detik sehingga tidak memblokir respon antarmuka pengguna.
