# Todo & Goals Pengembangan REBO V2

## Tasks Selesai (Completed Tasks)
- [x] perbaiki agar menu kanban tindak lanjut berada dibawah pada sidebar karena yg utama adalah inputannya
- [x] perbaiki ui dan warna dari halaman kanban agar lebih soft dan tidak terlalu mencolok tapi tetap dapat dibedakan
- [x] bisakah dibuat seperti cronjob ataupun sejenisnya, yg akan memberi request ke web rebo atau db nya, soalnya di supabase jika tidak digunakan beberapa waktu nanti akan dinonaktifkan
- [x] Implementasi WhatsApp Gateway Microservice (Baileys Multi-Device) & Deployment ke Render.com
- [x] Rute Web `/qr` beresolusi tinggi dengan auto-refresh untuk kemudahan scan WhatsApp via smartphone
- [x] UI Pengaturan Kontak WhatsApp, Manajemen PIC Pilar, dan Uji Notifikasi Interaktif (`/rebo/admin/kontak`)
- [x] Ekstensi Chrome 'REBO Sync Assistant' (Auto-Fill ZIAPP 1-Click) & Script RPA Auto-Submit (`extensions/rebo-sync-assistant`, `scripts/rpa_ziapp_sync.js`)
- [x] Profil Pengguna Mandiri, Preferensi Notifikasi WA & Worker-Tracking (`/rebo/profile`)

---

## Roadmap & Todo Integrasi Notifikasi WhatsApp (REBO WA Gateway)

### 1. Konfigurasi Lingkungan & Konektivitas
- [x] **Setup WhatsApp Gateway Service:** Engine Baileys + Express REST API di `services/wa-gateway`.
- [x] **Pemasangan QR Scanner Web UI:** Endpoint `/qr` untuk kemudahan pairing akun WhatsApp bot.
- [x] **Konfigurasi Environment Variables:**
  - Tambahkan `WHATSAPP_GATEWAY_URL` di `.env.local` lokal dan Vercel Environment Variables (`https://<nama-service>.onrender.com`).
  - Tambahkan `WHATSAPP_API_KEY` (opsional jika mengaktifkan proteksi API key).
- [x] **Keep-Alive Worker untuk Render Free Tier:**
  - Pasang ping otomatis via GitHub Actions (`.github/workflows/keep_alive.yml`), script `scripts/keep_alive.js`, dan route API `/api/cron/keep-alive` ke endpoint `https://<nama-service>.onrender.com/health` tiap 12 menit agar instance gateway tidak tertidur (*sleep*) 24/7 dan Supabase tetap aktif.

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
- [x] **Notifikasi Pengingat Deadline & Rekapitulasi Berkala:**
  - Pengingat otomatis H-30, H-14, H-7, H-3, H-1 menjelang batas waktu evaluasi jika masih ada indikator berstatus `Belum Diisi` atau `Perlu Revisi`.
  - Rekap mingguan progres pilar ke Admin / Pimpinan BPS Sitaro.
  - Implementasi engine: `src/lib/notifications/reminders.ts`, API endpoint `/api/cron/wa-reminders`, dan CLI runner `scripts/send_wa_reminders.js`.

### 4. Pengujian & Observabilitas
- [x] **UI Pengaturan Kontak WhatsApp, Manajemen PIC Pilar, & Uji Notifikasi Interaktif:**
  - Halaman `/rebo/admin/kontak` terintegrasi dengan Live Status Indicator WhatsApp Gateway, tombol tautkan perangkat `/qr`, panel aksi manual admin (Pengingat Deadline & Rekap Mingguan), serta tombol Uji Kirim WA interaktif pada tiap kontak PIC.
- [x] **Uji Coba Pengiriman Pesan Nyata (End-to-End):**
  - Jalankan script uji `node scripts/test_wa_gateway.js <nomor_tujuan>` atau gunakan tombol "Uji Kirim WA" pada antarmuka admin untuk memverifikasi bot dapat mengirimkan template notifikasi interaktif ke nomor pengguna.
- [x] **Audit Log & Fallback Notifikasi:**
  - Rekam riwayat status pengiriman pesan (Berhasil / Gagal) ke tabel `audit_log` di Supabase.
  - Sediakan fallback graceful (jika gateway offline, aksi web tetap sukses dan tidak membekukan user interface).

---

## Goals & Roadmap Fitur Diferensiasi & Jembatan ke Web Pusat (ZIAPP)

### 1. Jembatan Sinkronisasi & Auto-Submit ke Web Pusat (ZIAPP)
- [x] **Riset & Pemetaan Struktur Form Web Pusat (ZIAPP):** Analisis field input, alur login, struktur indikator, dan format data yang dibutuhkan pada portal evaluasi ZIAPP.
- [x] **Pengembangan Fitur Auto-Fill / Auto-Submit:**
  - [x] **Opsi Utama (Ekstensi Chrome / Script Helper):** Buat ekstensi peramban ringan "REBO Sync Assistant" yang membaca data link REBO dan mengisikan form Web Pusat ZIAPP dengan 1 klik.
  - [x] **Opsi Alternatif (Headless Bot / RPA Service):** Skrip otomasi Puppeteer/Playwright untuk submit batch data terverifikasi jika tidak terhalang CAPTCHA/SSO.
- [x] **Status & Log Pengiriman ke ZIAPP:**
  - [x] Tambahkan status badge pada tiap indikator: `Draft` ➔ `Verified Internal` ➔ `Siap Kirim ke ZIAPP` ➔ `Tersinkron ke ZIAPP`.
  - [x] Catat log pengiriman (waktu submit, PIC pengirim, tautan yang dikirimkan).

### 2. Fitur Unggulan Pra-Pengumpulan (Pre-Audit & Quality Assurance)
- [x] **Google Drive Link & Permission Health Checker:**
  - [x] Validasi otomatis apakah link GDrive aktif dan memiliki status izin akses publik/dapat dibaca oleh penilai (*Anyone with link can view*), bukan terkunci (*Restricted*).
- [x] **Checklist Dokumen Wajib per Indikator (QA Checklist):**
  - [x] Buat daftar periksa dokumen minimal (Undangan, Daftar Hadir, Notula, Laporan, Dokumentasi) sebelum indikator diizinkan berstatus siap kirim ke pusat.
- [x] **Simulasi Nilai & Gap Analysis (Predikat WBK/WBBM):**
  - [x] Hitung estimasi skor akhir berdasarkan bukti yang sudah valid serta tandai indikator berbobot tinggi yang belum optimal.

### 3. Otomasi Pengingat & Tindak Lanjut
- [x] **Early Warning Deadline System:**
  - [x] Notifikasi pengingat otomatis (jadwal H-30, H-14, H-7, H-3, H-1 jelang batas pengumpulan pusat) untuk PIC pilar yang indikatornya belum lengkap.
- [x] **Auto-Card Kanban dari Catatan Revisi:**
  - [x] Setiap catatan penolakan/revisi dari verifikator internal otomatis terbuat sebagai kartu tugas di Kanban Board tindak lanjut dengan sinkronisasi `revalidatePath('/rebo/kanban')`, deep-link navigasi langsung `/rebo/formRB/[pilarId]?indikator=[id]#indikator-[id]`, serta badge penanda "Auto-Generated dari Catatan Reviu" beserta timestamp.

---

## 🚀 Usulan Pembaruan, Perbaikan & Fitur Baru untuk REBO Lebih Baik

### 1. Profil Pengguna Mandiri & Notifikasi Personal (Self-Managed User Profile)
- [x] **Halaman / Modal Profil Pengguna (`/rebo/profile`):**
  - [x] Sediakan form bagi setiap pegawai untuk mengisi & memperbarui nomor WhatsApp pribadinya (validasi otomatis format `628xxx`).
  - [x] Pemilihan pilar penugasan utama (Pilar 1 s.d. Pilar 6) dan peran kerja (Operator Pilar, Koordinator, Verifikator, Pimpinan).
  - [x] Pengaturan preferensi notifikasi (toggle on/off notifikasi WA: saat bukti disetujui, saat perlu revisi, pengingat deadline).
- [x] **Worker-Tracking (Notifikasi Langsung ke Pengunggah Bukti):**
  - [x] Simpan `submitted_by_user_id`, `submitted_by_name`, dan `submitted_by_phone` pada tiap pengunggahan bukti dukung.
  - [x] Arahkan notifikasi hasil verifikasi (Disetujui / Perlu Revisi) **langsung ke nomor WhatsApp pegawai yang mengunggah berkas tersebut**, bukan hanya nomor umum koordinator pilar.

### 2. Peningkatan Pengalaman Pengguna Form Bukti Dukung (Form RB & Input)
- [x] **Inline Document Preview (Modal Pratinjau Terpadu):**
  - [x] Pratinjau langsung file PDF, gambar, dan dokumen Google Drive di dalam aplikasi REBO tanpa harus membuka tab baru browser.
- [ ] **Batch Upload & Drag-and-Drop Bukti Dukung:**
  - [ ] Pengunggahan multi-berkas sekaligus dengan progress bar status upload dan auto-tagging kategori dokumen (Undangan, Notula, Daftar Hadir, Laporan, Dokumentasi Foto).
- [ ] **Sticky Summary & Auto-Save Indikator:**
  - [ ] Header ringkasan skor dan progres yang tetap terlihat saat pengguna menggulir (scroll) halaman form yang panjang.
  - [ ] Penyimpanan draf otomatis (auto-save draft) agar isian catatan atau link tidak hilang saat koneksi internet terputus.

### 3. Visualisasi Eksekutif & Simulasi Predikat WBK/WBBM (Monitoring)
- [ ] **Grafik Radar / Spider Web Capaian 6 Pilar:**
  - [ ] Tambahkan visualisasi grafik radar pada dashboard Overview & Monitoring untuk membandingkan capaian nilai riil vs target bobot maksimal di 6 pilar.
- [x] **Simulasi & Gap Analysis Predikat WBK/WBBM:**
  - [x] Panel kalkulator predikat WBK: menghitung proyeksi total nilai dan menampilkan indikator-indikator prioritas berbobot tinggi yang belum optimal.
  - [x] Notifikasi status kelayakan: Memberikan sinyal apakah satker sudah memenuhi syarat minimal WBK (Nilai total $\ge 75.00$ dan tidak ada pilar di bawah batas ambang).
- [ ] **Export LKE Terformat Resmi (Excel & PDF Eksekutif):**
  - [ ] Ekspor template lembar kerja evaluasi lengkap sesuai standar format PermenPAN-RB / BPS RI dengan header resmi, kop surat, dan tandatangan digital pimpinan.

### 4. Optimalisasi Kanban Board & Kolaborasi Tim
- [ ] **Filter Cepat "Tugas Saya" (My Tasks):**
  - [ ] Tombol filter 1-klik di papan Kanban untuk memfilter kartu revisi yang khusus ditugaskan kepada pegawai yang sedang login.
- [ ] **Thread Diskusi Singkat pada Kartu Revisi:**
  - [ ] Kolom chat/komentar internal antara Verifikator dan Operator di dalam kartu Kanban untuk mengklarifikasi poin perbaikan sebelum berkas diunggah ulang.
- [ ] **Visual SLA / Countdown Timer Batas Perbaikan:**
  - [ ] Badge penanda batas waktu tindak lanjut (misal: *"Sisa 3 hari"* berwarna kuning, *"Mendekati Batas"* oranye, *"Terlewat"* merah).

### 5. Pengelolaan Arsip Digital & Knowledge Base
- [ ] **Instant Search & Multi-Tag Filtering Arsip:**
  - [ ] Pencarian cepat real-time berdasarkan judul dokumen, kategori arsip (SK, SOP, Laporan, Paparan, Inovasi), dan tahun periode.
- [ ] **Download All Bundle (Export Arsip Tahunan ZIP):**
  - [ ] Fitur unduh seluruh berkas arsip resmi dalam satu arsip ZIP terkompresi untuk kemudahan penyerahan ke Tim Penilai Internal (TPI) Pusat.

### 6. Keamanan, Audit Log & Antarmuka Responsif
- [ ] **Audit Trail Filter & Export CSV:**
  - [ ] Fitur filter log aktivitas berdasarkan rentang tanggal, nama pengguna, jenis aktivitas (Upload, Verifikasi, Pengiriman WA), dan ekspor laporan riwayat ke CSV/Excel.
  - [ ] Pencatatan IP address dan perangkat akses untuk kepatuhan tata kelola keamanan informasi (ISO 27001).
- [ ] **Penyempurnaan Mode Gelap & Tampilan Mobile Tablet:**
  - [ ] Penyesuaian kontras warna dan kenyamanan membaca teks panjang pada Dark Mode.
  - [ ] Optimalisasi layout tabel dan kartu saat dibuka dari smartphone petugas di lapangan.


