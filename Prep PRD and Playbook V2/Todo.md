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
- [x] Grafik Radar / Spider Web Capaian 6 Pilar (Visualisasi Eksekutif Monitoring)
- [x] Batch Upload & Drag-and-Drop Bukti Dukung dengan Auto-Tagging Kategori Dokumen
- [x] Sticky Summary & Auto-Save Draft Indikator pada Form LKE (Penyimpanan lokal otomatis & Bilah Ringkasan Melayang)
- [x] Export LKE Terformat Resmi (Excel Resmi Standar PermenPAN-RB & Cetak PDF Ringkasan Eksekutif BPS Sitaro)

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
- [x] **Batch Upload & Drag-and-Drop Bukti Dukung:**
  - [x] Pengunggahan multi-berkas sekaligus dengan progress bar status upload dan auto-tagging kategori dokumen (Undangan, Notula, Daftar Hadir, Laporan, Dokumentasi Foto).
- [x] **Sticky Summary & Auto-Save Indikator:**
  - [x] Header ringkasan skor dan progres yang tetap terlihat saat pengguna menggulir (scroll) halaman form yang panjang.
  - [x] Penyimpanan draf otomatis (auto-save draft) agar isian catatan atau link tidak hilang saat koneksi internet terputus.

### 3. Visualisasi Eksekutif & Simulasi Predikat WBK/WBBM (Monitoring)
- [x] **Grafik Radar / Spider Web Capaian 6 Pilar:**
  - [x] Tambahkan visualisasi grafik radar pada dashboard Overview & Monitoring untuk membandingkan capaian nilai riil vs target bobot maksimal di 6 pilar.
- [x] **Simulasi & Gap Analysis Predikat WBK/WBBM:**
  - [x] Panel kalkulator predikat WBK: menghitung proyeksi total nilai dan menampilkan indikator-indikator prioritas berbobot tinggi yang belum optimal.
  - [x] Notifikasi status kelayakan: Memberikan sinyal apakah satker sudah memenuhi syarat minimal WBK (Nilai total $\ge 75.00$ dan tidak ada pilar di bawah batas ambang).
- [x] **Export LKE Terformat Resmi (Excel & PDF Eksekutif):**
  - [x] Ekspor template lembar kerja evaluasi lengkap sesuai standar format PermenPAN-RB / BPS RI dengan header resmi, kop surat, dan tandatangan digital pimpinan.

### 4. Optimalisasi Kanban Board & Kolaborasi Tim
- [x] **Filter Cepat "Tugas Saya" (My Tasks):**
  - [x] Tombol filter 1-klik di papan Kanban untuk memfilter kartu revisi yang khusus ditugaskan kepada pegawai yang sedang login.
- [x] **Thread Diskusi Singkat pada Kartu Revisi:**
  - [x] Kolom chat/komentar internal antara Verifikator dan Operator di dalam kartu Kanban untuk mengklarifikasi poin perbaikan sebelum berkas diunggah ulang.
- [x] **Visual SLA / Countdown Timer Batas Perbaikan:**
  - [x] Badge penanda batas waktu tindak lanjut (misal: *"Sisa 3 hari"* berwarna kuning, *"Mendekati Batas"* oranye, *"Terlewat"* merah).

### 5. Pengelolaan Arsip Digital & Knowledge Base
- [x] **Instant Search & Multi-Tag Filtering Arsip:**
  - [x] Pencarian cepat real-time berdasarkan judul dokumen, kategori arsip (SK, SOP, Laporan, Paparan, Inovasi), dan tahun periode.
- [x] **Download All Bundle (Export Arsip Tahunan ZIP):**
  - [x] Fitur unduh seluruh berkas arsip resmi dalam satu arsip ZIP terkompresi untuk kemudahan penyerahan ke Tim Penilai Internal (TPI) Pusat.

### 6. Keamanan, Audit Log & Antarmuka Responsif
- [x] **Audit Trail Filter & Export CSV:**
  - [x] Fitur filter log aktivitas berdasarkan rentang tanggal, nama pengguna, jenis aktivitas (Upload, Verifikasi, Pengiriman WA), dan ekspor laporan riwayat ke CSV/Excel.
  - [x] Pencatatan IP address dan perangkat akses untuk kepatuhan tata kelola keamanan informasi (ISO 27001).
- [x] **Penyempurnaan Mode Gelap & Tampilan Mobile Tablet:**
  - [x] Penyesuaian kontras warna dan kenyamanan membaca teks panjang pada Dark Mode.
  - [x] Optimalisasi layout tabel dan kartu saat dibuka dari smartphone petugas di lapangan.

### 7. Showcase Inovasi Pelayanan & Bukti Dampak Nyata (Game Changer TPN)
- [x] **Modul Showcase Inovasi Pelayanan Publik & Reform:**
  - [x] Halaman khusus dokumentasi inovasi unggulan BPS Kabupaten Kepulauan Sitaro (misal: inovasi PST, layanan data statistik daerah, dsb.).
  - [x] Analisis dampak sebelum vs sesudah (*Before vs After Impact Assessment*), grafik utilisasi pengguna layanan, dan testimoni pengguna.
  - [x] Ekspor infografis / one-pager profil inovasi untuk paparan di hadapan Tim Penilai Nasional (TPN KemenPAN-RB).
- [x] **Integrasi Indeks Kepuasan Masyarakat (IKM) & Survei Persepsi Anti Korupsi (IPAK):**
  - [x] Input data dan visualisasi tren berkala hasil survei pelayanan publik (Pilar 6) dan persepsi integritas (Pilar 5).
  - [x] Perhitungan otomatis skor ketercapaian target minimal IKM/IPAK untuk pemenuhan syarat mutlak WBK/WBBM.
- [x] **Matriks Mitigasi Risiko & SPIP (Pilar 5 Pengawasan):**
  - [x] Tabel interaktif pemetaan titik rawan gratifikasi/fraud dan rencana aksi pengendalian intern.

### 8. Peningkatan Menu Informasi RB, Regulasi & Panduan Pegawai
- [x] **Timeline & Roadmap Interaktif Tahapan ZI BPS Sitaro:**
  - [x] Visual progress bar tahapan evaluasi tahunan: Pencanangan ➔ Pengisian LKE Mandiri ➔ Penilaian Internal (TPI) ➔ Desk Evaluation TPN ➔ Verifikasi Lapangan.
- [x] **Kamus & Glosarium Digital Reformasi Birokrasi:**
  - [x] Glosarium istilah penting ZI/RB (PMPRB, LKE, Komponen Pengungkit, Komponen Hasil, WBK, WBBM, TPI BPS RI, TPN KemenPAN-RB) untuk mempermudah pegawai baru.
- [x] **Pusat Template & Format Baku Bukti Dukung (Standard Template Hub):**
  - [x] Unduhan langsung template standar BPS Sitaro (Format Surat Undangan, Format Notula Rapat resmi, Daftar Hadir Standar, Laporan Monev, dan Format Dokumentasi Kegiatan).

### 9. Otomasi Google Drive Generator & Cloud Storage
- [x] **Integrasi Penuh Google Drive API (1-Click Folder Structure Generation):**
  - [x] Sambungkan service account Google Workspace BPS Sitaro agar menu Generator GDrive dapat membuat folder bertingkat (Area ➔ Pilar ➔ Indikator) langsung di Google Drive secara riil.
  - [x] Otomasi penyetelan hak akses: Memastikan folder dan file otomatis berstatus *"Anyone with link can view"* agar tautan tidak ditolak penilai pusat.
- [x] **Drive Storage & Health Monitor:**
  - [x] Pengecekan kuota Google Drive instansi dan validasi berkala jika ada tautan Google Drive yang terhapus atau dipindahkan (*broken links detector*).

### 10. Manajemen Siklus Tahunan & Fleksibilitas Master Data LKE
- [x] **Wizard Setup Periode Baru (1-Click Period Setup / Clone):**
  - [x] Fitur duplikasi seluruh indikator dan struktur LKE dari tahun sebelumnya ke tahun baru dengan 1 klik, sehingga admin tidak perlu input manual dari awal.
  - [x] Pengaturan jadwal cutoff dan auto-lock periode (kunci otomatis edit saat masa penilaian mandiri telah berakhir).
- [x] **Editor Bobot & Rumus Dinamis:**
  - [x] Fleksibilitas penyesuaian bobot pilar/indikator jika KemenPAN-RB atau BPS RI memperbarui peraturan/juknis LKE PMPRB terbaru.

### 11. Asisten AI & Quality Control Penilaian Mandiri (Smart LKE Assistant)
- [x] **AI Completeness & Consistency Checker:**
  - [x] Analisis teks otomatis menggunakan LLM/AI untuk memeriksa apakah deskripsi penjelasan bukti dukung yang diinput operator sudah benar-benar menjawab esensi pertanyaan LKE sebelum diajukan ke Verifikator.
  - [x] Peringatan dini jika narasi terlalu singkat, tidak relevan, atau tidak menyebutkan nomor surat/dokumen yang dilampirkan.
- [ ] **AI Metadata Extractor Dokumen Bukti:**
  - [ ] Ekstraksi otomatis nomor surat, tanggal kegiatan, dan penandatangan dari berkas PDF/foto bukti dukung.
  - [ ] Validasi otomatis untuk memastikan tanggal berkas berada dalam rentang tahun periode evaluasi yang aktif (mencegah salah unggah dokumen kadaluarsa).
- [ ] **Smart Suggestion Bukti Dukung Serupa:**
  - [ ] Rekomendasi otomatis contoh dokumen bukti dukung berkualitas tinggi dari indikator serupa di tahun-tahun sebelumnya yang telah terbukti disetujui tanpa revisi oleh TPI.

### 12. Kolaborasi Tim, Jadwal Aksi & Notulen Digital (Collaboration Hub)
- [ ] **Kalender Jadwal Aksi & Rencana Kerja Tim ZI/RB:**
  - [ ] Kalender interaktif terpadu untuk memantau jadwal rapat koordinasi pilar, jadwal sosialisasi internal, dan batas waktu pengumpulan bukti.
  - [ ] Integrasi pengingat otomatis ke WhatsApp peserta rapat H-1 sebelum agenda dimulai.
- [ ] **Notulen Rapat Digital & Auto-Task Assignment:**
  - [ ] Formulir pencatatan notulen rapat berkala tim ZI/RB di dalam aplikasi.
  - [ ] Pembuatan butir kesepakatan rapat yang otomatis berubah menjadi tugas tindak lanjut di papan Kanban dan mengirim rincian tugas ke nomor WA pegawai yang ditugaskan.
- [ ] **Broadcast Pengumuman Internal Satu-Arah:**
  - [ ] Fitur kirim pengumuman penting / arahan pimpinan BPS Sitaro secara serentak ke seluruh koordinator pilar via WhatsApp bot dan banner dinamis pada Beranda REBO.

### 13. Manajemen Pelayanan Publik, Suara Konsumen & Pengaduan (Voice of Customer)
- [ ] **Generator QR Code Meja Layanan PST (Pelayanan Statistik Terpadu):**
  - [ ] Pembuat QR Code siap cetak (desain resmi BPS) untuk diletakkan di ruang resepsionis/PST agar tamu/responden dapat langsung memindai dan mengisi survei kepuasan lewat ponsel.
- [ ] **Kanal Pengaduan & Whistleblowing System (WBS) Internal:**
  - [ ] Formulir pengaduan masyarakat / pegawai yang aman, terenkripsi, dan dapat diisi secara anonim untuk mendukung pemenuhan bukti dukung Pilar 5 (Penguatan Pengawasan).
  - [ ] Notifikasi langsung ke Tim Kepatuhan Internal saat ada laporan pengaduan masuk.
- [ ] **Analisis Sentimen & Word Cloud Kepuasan Konsumen:**
  - [ ] Visualisasi analisis kata kunci (*word cloud*) dan sentimen positif/negatif dari kritik dan saran pengunjung PST untuk bahan evaluasi berkala pimpinan.

### 14. PWA Lanjutan, Offline-First & Kecepatan Unggah Berkas
- [ ] **Penyimpanan Draf Offline (IndexedDB / Local-First):**
  - [ ] Operator tetap dapat mengetik narasi jawaban LKE dan mengisi tautan saat koneksi internet kepulauan sedang bermasalah atau mati listrik; data tersimpan otomatis di browser lokal dan tersinkron ke cloud begitu online.
- [ ] **Image & File Compressor Otomatis Sebelum Upload:**
  - [ ] Kompresi berkas gambar/foto dokumentasi dan dokumen pindaian di sisi peramban (client-side) sebelum diunggah ke Google Drive guna menghemat kuota penyimpanan dan mempercepat proses upload.
- [ ] **PWA Quick Action Shortcuts:**
  - [ ] Tombol pintas saat ikon aplikasi REBO ditekan lama di layar beranda ponsel: *"Upload Bukti Cepat"*, *"Cek Status Indikator Saya"*, dan *"Buka Kanban"*.

### 15. Gamifikasi, Motivasi & Papan Apresiasi Tim Kerja (Recognition Hub)
- [ ] **Leaderboard Progresivitas & Kepatuhan 6 Pilar:**
  - [ ] Papan peringkat sehat antar-pilar yang menampilkan pilar tercepat dalam menyelesaikan verifikasi berkas 100% dan pilar dengan tingkat revisi terendah.
- [ ] **Lencana Penghargaan Digital (Achievement Badges):**
  - [ ] Pemberian badge apresiasi otomatis di profil tim kerja (contoh: *"Pilar Terdisiplin"*, *"Zero Revision Champion"*, *"Dokumen Terlengkap"*).
  - [ ] Notifikasi apresiasi dari Kepala BPS Sitaro ke grup tim kerja atas pencapaian milestone penting.

### 16. Replikasi Antar-Satker & Ketahanan Cadangan Data (Multi-Tenant & Disaster Recovery)
- [ ] **Kesiapan Multi-Satker (Replikasi BPS Kabupaten/Kota Lain):**
  - [ ] Struktur konfigurasi profil instansi modular sehingga sistem REBO dapat direplikasi dan digunakan oleh BPS Kabupaten/Kota lain di Sulawesi Utara maupun nasional dengan mudah.
- [ ] **Automated Cloud Backup & Disaster Recovery:**
  - [ ] Penjadwalan cadangan otomatis (*automated snapshot backup*) basis data Supabase berkala ke Google Cloud Storage / Amazon S3.
  - [ ] Tombol 1-klik untuk validasi integritas data cadangan dan pemulihan darurat (*disaster recovery verification*).

### 17. Manajemen Integritas Pegawai & Kepatuhan LHKPN/LHKASN (Pilar 5 & 3)
- [ ] **Pelacak Kepatuhan e-LHKPN & e-LHKASN (100% Compliance Tracker):**
  - [ ] Dashboard pemantauan status penyampaian bukti tanda terima pelaporan harta kekayaan seluruh pejabat dan ASN BPS Sitaro sebelum batas akhir 31 Maret.
  - [ ] Pengingat otomatis via WhatsApp (H-30, H-14, H-7) kepada pegawai yang belum mengunggah bukti lapor LHKPN/LHKASN.
- [ ] **Matriks Kepatuhan Disiplin & Kode Etik ASN:**
  - [ ] Perekaman bukti dukung nihil penjatuhan hukuman disiplin tingkat sedang/berat (syarat mutlak kelolosan predikat WBK).
- [ ] **Unit Pengendalian Gratifikasi (UPG) & Rekonsiliasi KPK:**
  - [ ] Formulir online pelaporan penolakan / penerimaan gratifikasi pegawai yang terhubung langsung dengan alur verifikasi Tim Kepatuhan Internal BPS Sitaro.

### 18. Aksesibilitas, Disabilitas & Ramah Difabel pada PST (Pilar 6 Pelayanan Publik)
- [ ] **Katalog Fasilitas Ramah Kelompok Rentan & Difabel:**
  - [ ] Dokumentasi sarana-prasarana inklusif ruang Pelayanan Statistik Terpadu (PST): jalur pemandu (*guiding block*), kursi roda, ruang laktasi, toilet difabel, formulir huruf braille, dan alat bantu dengar.
- [ ] **Widget Aksesibilitas Web (Text-to-Speech & Font Resizer):**
  - [ ] Integrasi alat bantu aksesibilitas pada formulir survei publik dan portal REBO untuk pengunjung disabilitas sesuai standar WCAG 2.1.
- [ ] **Katalog Standar Pelayanan & Maklumat Pelayanan Digital:**
  - [ ] Tampilan interaktif Standar Pelayanan (SP) untuk seluruh produk data statistik BPS, alur kompensasi keterlambatan layanan, dan Maklumat Pelayanan BPS Sitaro.

### 19. Executive Command Center & Generator Slide Paparan TPN (Pimpinan)
- [ ] **Executive Command Center (Mode Layar TV / Big Screen Display):**
  - [ ] Tampilan dasbor visual layar penuh (*kiosk mode*) untuk monitor TV lobi kantor / ruang kerja Kepala BPS yang memutar rotasi realtime: progres 6 pilar, skor IKM/IPAK, hitung mundur batas waktu, dan capaian inovasi.
- [ ] **One-Click Presentation Deck Generator (Ekspor Slide PPTX):**
  - [ ] Pembuatan berkas presentasi PowerPoint (.pptx) paparan ZI BPS Sitaro secara otomatis dari data dan grafik riil sistem REBO untuk dipaparkan di hadapan Tim Penilai Nasional (TPN).
- [ ] **Analisis Tren Kinerja Antar-Tahun (Multi-Year Trend Analysis):**
  - [ ] Grafik komparasi perkembangan skor LKE antar-periode (2024, 2025, 2026) untuk membuktikan adanya perbaikan berkelanjutan (*continuous improvement*).

### 20. Keamanan Lanjutan, Watermarking & Perlindungan Privasi (Data Shield)
- [ ] **Watermarking Otomatis Berkas Bukti Dukung:**
  - [ ] Penambahan watermark otomatis (*"HANYA UNTUK PENILAIAN ZI BPS SITARO - TAHUN [YYYY]"*) pada pratinjau dokumen PDF untuk mencegah kebocoran atau penyalahgunaan berkas kedinasan.
- [ ] **Session Auto-Timeout & Suspicious Login Alert:**
  - [ ] Penguncian sesi otomatis setelah inaktivitas 30 menit saat diakses dari komputer bersama (*shared PC kantor*), serta notifikasi peringatan jika ada login dari perangkat asing.
- [ ] **Enkripsi File Sensitif (Doc Shield):**
  - [ ] Enkripsi berkas dokumen pemeriksaan internal dan laporan keuangan sebelum disimpan ke cloud storage.

### 21. Manajemen Anggaran & Rencana Aksi ZI (Resource & Efficiency Tracking)
- [ ] **Pelacak Anggaran & Realisasi Kegiatan ZI/RB:**
  - [ ] Monitoring penyerapan anggaran pendukung reformasi birokrasi (sosialisasi internal, survei kepuasan, pengadaan sarana PST, pakaian tim kerja).
- [ ] **Indikator Efisiensi & Dampak Paperless (Paperless Metric):**
  - [ ] Metrik penghitungan estimasi penghematan lembar kertas dan biaya cetak (*paperless cost savings*) berkat digitalisasi penuh dokumen bukti dukung pada aplikasi REBO V2.





