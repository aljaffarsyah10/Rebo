# 🤖 REBO V2 — WhatsApp Gateway Microservice

Microservice WhatsApp Gateway open-source mandiri untuk aplikasi **REBO V2 (Reformasi Birokrasi BPS Kabupaten Kepulauan Sitaro)**. Layanan ini memungkinkan pengiriman notifikasi otomatis saat verifikasi (*approve/reject*) atau pengajuan berkas bukti dukung secara **100% GRATIS** tanpa biaya langganan WhatsApp Business API resmi.

---

## 📋 Apa yang Perlu Dipersiapkan?

Sebelum menjalankan gateway ini, siapkan hal-hal berikut:

1. **1 Nomor WhatsApp Aktif:**
   - Bisa menggunakan kartu perdana baru, nomor kantor khusus, atau nomor operasional tim kerja.
   - Disarankan **bukan** nomor pribadi pimpinan untuk menjaga profesionalitas.
2. **Ponsel dengan Aplikasi WhatsApp:**
   - Digunakan untuk memindai (*scan*) QR Code satu kali saat inisialisasi koneksi awal (fitur *Perangkat Tertaut / Linked Devices*).
3. **Node.js (v18, v20, atau v22):**
   - Sudah terpasang di komputer/server tempat gateway ini akan dijalankan.

---

## 🚀 Cara Menjalankan di Komputer Lokal / Server Kantor

### Langkah 1: Masuk ke folder service
Buka terminal dan navigasikan ke direktori gateway:
```bash
cd services/wa-gateway
```

### Langkah 2: Pasang dependensi
```bash
npm install
```

### Langkah 3: Jalankan service
```bash
npm start
```

### Langkah 4: Scan QR Code
1. Pada terminal, akan muncul tampilan **QR Code**.
2. Buka aplikasi WhatsApp di ponsel pengirim.
3. Buka menu **Pengaturan** (iOS) atau **Titik Tiga di pojok kanan atas** (Android) -> pilih **Perangkat Tertaut (Linked Devices)**.
4. Klik **Tautkan Perangkat** dan arahkan kamera ke QR Code di terminal.
5. Setelah berhasil, terminal akan menampilkan:
   ```text
   ✅ WHATSAPP BERHASIL TERHUBUNG & SIAP MENGIRIM PESAN!
   ```
6. Sesi login akan disimpan secara lokal di folder `auth_info/`. Anda **tidak perlu** scan QR code lagi setiap kali me-restart service.

---

## ⚙️ Menghubungkan ke Aplikasi REBO V2

Di file root [.env.local](../../.env.local) pada proyek Next.js REBO, tambahkan variabel berikut:

```env
# URL WhatsApp Gateway
WA_GATEWAY_URL="http://localhost:8000/send-message"

# Nomor WhatsApp penerima default (Operator / Koordinator / Grup)
WA_DEFAULT_RECEIVER="08123456789"
```

*Setiap kali koordinator menyetujui atau menolak (meminta revisi) indikator di Form LKE atau Kanban, sistem REBO otomatis memanggil endpoint ini di latar belakang.*

---

## 🧪 Menguji Pengiriman Pesan (Testing)

### Opsi A: Menggunakan Skrip Uji Bawaan REBO
Dari direktori utama proyek REBO, jalankan:
```bash
node scripts/test_wa_gateway.js 08123456789
```
*(Ganti `08123456789` dengan nomor WhatsApp tujuan Anda)*.

### Opsi B: Menggunakan cURL
```bash
curl -X POST http://localhost:8000/send-message \
  -H "Content-Type: application/json" \
  -d '{"phone": "08123456789", "message": "Halo! Ini adalah uji coba notifikasi REBO V2."}'
```

### Opsi C: Cek Status Koneksi di Browser
Buka di browser:
[http://localhost:8000](http://localhost:8000)
Akan muncul respons JSON status koneksi WhatsApp Anda.

---

## ☁️ Panduan Deploy Online Gratis (Tanpa Server Lokal)

Jika Anda ingin gateway ini aktif online 24 jam tanpa harus menyalakan komputer kantor:

1. **Deploy ke Render.com (Free Web Service):**
   - Buat akun gratis di [Render.com](https://render.com).
   - Buat **New Web Service**, pilih repository GitHub REBO.
   - Set **Root Directory:** `services/wa-gateway`.
   - Set **Build Command:** `npm install`.
   - Set **Start Command:** `npm start`.
   - Buka menu *Logs* di dashboard Render saat pertama kali jalan untuk melihat QR Code dan lakukan scan.
   - Dapatkan URL publik (contoh: `https://rebo-wa-gateway.onrender.com/send-message`).
   - Masukkan URL tersebut ke variabel `WA_GATEWAY_URL` di Vercel/Environment produksi.

2. **Deploy ke VPS / Server Lokal BPS:**
   - Anda juga dapat menjalankannya di server kantor menggunakan `pm2`:
     ```bash
     npm install -g pm2
     pm2 start index.js --name "wa-gateway"
     pm2 save
     pm2 startup
     ```

---

## 🛡️ Kebijakan & Keamanan
- Folder `auth_info/` berisi token enkripsi sesi WhatsApp Anda dan sudah di-ignore oleh `.gitignore` sehingga tidak akan pernah terunggah ke repository publik/GitHub.
- Notifikasi yang dikirimkan hanya berupa pemberitahuan transaksional resmi (status LKE, catatan revisi, dan usulan baru) sehingga aman dan tidak terindikasi sebagai spam.
