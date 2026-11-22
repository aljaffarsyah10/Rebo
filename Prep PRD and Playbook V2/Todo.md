# Todo & Goals Pengembangan REBO V2

## Tasks Selesai (Completed Tasks)
- [x] perbaiki agar menu kanban tindak lanjut berada dibawah pada sidebar karena yg utama adalah inputannya
- [x] perbaiki ui dan warna dari halaman kanban agar lebih soft dan tidak terlalu mencolok tapi tetap dapat dibedakan
- [x] bisakah dibuat seperti cronjob ataupun sejenisnya, yg akan memberi request ke web rebo atau db nya, soalnya di supabase jika tidak digunakan beberapa waktu nanti akan dinonaktifkan
- [x] Implementasi WhatsApp Gateway Microservice (Baileys Multi-Device) & Deployment ke Render.com
- [x] Rute Web `/qr` beresolusi tinggi dengan auto-refresh untuk kemudahan scan WhatsApp via smartphone

---

## Roadmap & Todo Integrasi Notifikasi WhatsApp (REBO WA Gateway)

### 1. Konfigurasi Lingkungan & Konektivitas
- [x] **Setup WhatsApp Gateway Service:** Engine Baileys + Express REST API di `services/wa-gateway`.
- [x] **Pemasangan QR Scanner Web UI:** Endpoint `/qr` untuk kemudahan pairing akun WhatsApp bot.
- [ ] **Konfigurasi Environment Variables:**
  - Tambahkan `WHATSAPP_GATEWAY_URL` di `.env.local` lokal dan Vercel Environment Variables (`https://<nama-service>.onrender.com`).
  - Tambahkan `WHATSAPP_API_KEY` (opsional jika mengaktifkan proteksi API key).
- [ ] **Keep-Alive Worker untuk Render Free Tier:**
  - Pasang ping otomatis via Cron-job.org atau Vercel Cron ke endpoint `https://<nama-service>.onrender.com/health` tiap 10-14 menit agar instance gateway tidak tertidur (*sleep*).

### 2. Pengelolaan Data Nomor HP & Profil Pengguna
- [x] **Kolom Nomor Telepon & Schema Tabel Kontak:**
  - Tambahkan tabel `public.kontak_pilar` dan field `telepon` / `no_wa` pada tabel `public.users` Supabase.
  - Sediakan helper resolver phone mapping di `src/lib/notifications/contacts.ts`.
- [x] **Mapping Nomor PIC per Pilar / Unit Kerja:**
  - Konfigurasi nomor kontak default untuk tiap pilar (Pilar 1 s.d. Pilar 6) dan nomor hotline Tim Verifikator internal BPS Sitaro.

### 3. Otomasi Pengiriman Pesan (Triggers & Templates)
- [x] **Notifikasi Submit Bukti Dukung (PIC ➔ Verifikator):**
  - Kirim pesan ke Verifikator saat PIC mengunggah / mengajukan bukti dukung baru.
  - *Isi Template:* Nama Pilar, Nomor Indikator, Judul Bukti Dukung, Tautan Form Verifikasi.
- [x] **Notifikasi Approval / Disetujui (Verifikator ➔ PIC):**
  - Kirim konfirmasi ke PIC saat bukti dukung disetujui (Status `DONE` / `VERIFIED`).
  - *Isi Template:* Pemberitahuan lolos verifikasi internal & ucapan apresiasi.
- [x] **Notifikasi Penolakan / Perlu Revisi (Verifikator ➔ PIC):**
  - Kirim notifikasi prioritas tinggi ke PIC saat bukti ditolak dengan status `REVISION_REQUIRED`.
  - *Isi Template:* Rincian catatan revisi verifikator + tenggat waktu perbaikan + link langsung ke indikator terkait.
- [ ] **Notifikasi Pengingat Deadline & Rekapitulasi Berkala:**
  - Pengingat otomatis H-30, H-14, H-7 menjelang batas waktu evaluasi jika masih ada indikator berstatus `Belum Diisi` atau `Perlu Revisi`.
  - Rekap mingguan progres pilar ke Admin / Pimpinan BPS Sitaro.

### 4. Pengujian & Observabilitas
- [ ] **Uji Coba Pengiriman Pesan Nyata (End-to-End):**
  - Jalankan script uji `node scripts/test_wa_gateway.js <nomor_tujuan>` untuk memverifikasi bot dapat mengirimkan template notifikasi ke nomor pengguna.
- [x] **Audit Log & Fallback Notifikasi:**
  - Rekam riwayat status pengiriman pesan (Berhasil / Gagal) ke tabel `audit_log` di Supabase.
  - Sediakan fallback graceful (jika gateway offline, aksi web tetap sukses dan tidak membekukan user interface).

---

## Goals & Roadmap Fitur Diferensiasi & Jembatan ke Web RB Pusat

### 1. Jembatan Sinkronisasi & Auto-Submit ke Web RB Pusat
- [ ] **Riset & Pemetaan Struktur Form Web RB Pusat:** Analisis field input, alur login, struktur indikator, dan format data yang dibutuhkan pada web RB pusat.
- [ ] **Pengembangan Fitur Auto-Fill / Auto-Submit:**
  - [ ] **Opsi Utama (Ekstensi Chrome / Script Helper):** Buat ekstensi peramban ringan "REBO Sync Assistant" yang membaca data link REBO dan mengisikan form Web RB Pusat dengan 1 klik.
  - [ ] **Opsi Alternatif (Headless Bot / RPA Service):** Skrip otomasi Puppeteer/Playwright untuk submit batch data terverifikasi jika tidak terhalang CAPTCHA/SSO.
- [ ] **Status & Log Pengiriman ke Pusat:**
  - [ ] Tambahkan status badge pada tiap indikator: `Draft` ➔ `Verified Internal` ➔ `Siap Kirim` ➔ `Tersinkron ke Pusat`.
  - [ ] Catat log pengiriman (waktu submit, PIC pengirim, tautan yang dikirimkan).

### 2. Fitur Unggulan Pra-Pengumpulan (Pre-Audit & Quality Assurance)
- [ ] **Google Drive Link & Permission Health Checker:**
  - [ ] Validasi otomatis apakah link GDrive aktif dan memiliki status izin akses publik/dapat dibaca oleh penilai (*Anyone with link can view*), bukan terkunci (*Restricted*).
- [ ] **Checklist Dokumen Wajib per Indikator (QA Checklist):**
  - [ ] Buat daftar periksa dokumen minimal (Undangan, Daftar Hadir, Notula, Laporan, Dokumentasi) sebelum indikator diizinkan berstatus siap kirim ke pusat.
- [ ] **Simulasi Nilai & Gap Analysis (Predikat WBK/WBBM):**
  - [ ] Hitung estimasi skor akhir berdasarkan bukti yang sudah valid serta tandai indikator berbobot tinggi yang belum optimal.

### 3. Otomasi Pengingat & Tindak Lanjut
- [ ] **Early Warning Deadline System:**
  - [ ] Notifikasi pengingat otomatis (jadwal H-30, H-14, H-7 jelang batas pengumpulan pusat) untuk PIC pilar yang indikatornya belum lengkap.
- [ ] **Auto-Card Kanban dari Catatan Revisi:**
  - [ ] Setiap catatan penolakan/revisi dari verifikator internal otomatis terbuat sebagai kartu tugas di Kanban Board tindak lanjut.

