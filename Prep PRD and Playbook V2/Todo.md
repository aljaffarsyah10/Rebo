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
- [x] **AI Metadata Extractor Dokumen Bukti:**
  - [x] Ekstraksi otomatis nomor surat, tanggal kegiatan, dan penandatangan dari berkas PDF/foto bukti dukung.
  - [x] Validasi otomatis untuk memastikan tanggal berkas berada dalam rentang tahun periode evaluasi yang aktif (mencegah salah unggah dokumen kadaluarsa).
- [x] **Smart Suggestion Bukti Dukung Serupa:**
  - [x] Rekomendasi otomatis contoh dokumen bukti dukung berkualitas tinggi dari indikator serupa di tahun-tahun sebelumnya yang telah terbukti disetujui tanpa revisi oleh TPI.

### 12. Kolaborasi Tim, Jadwal Aksi & Notulen Digital (Collaboration Hub)
- [x] **Kalender Jadwal Aksi & Rencana Kerja Tim ZI/RB:**
  - [x] Kalender interaktif terpadu untuk memantau jadwal rapat koordinasi pilar, jadwal sosialisasi internal, dan batas waktu pengumpulan bukti.
  - [x] Integrasi pengingat otomatis ke WhatsApp peserta rapat H-1 sebelum agenda dimulai (termasuk 1-klik Instant WA Dispatcher).
- [x] **Notulen Rapat Digital & Auto-Task Assignment:**
  - [x] Formulir pencatatan notulen rapat berkala tim ZI/RB di dalam aplikasi.
  - [x] Pembuatan butir kesepakatan rapat yang otomatis berubah menjadi tugas tindak lanjut di papan Kanban dan mengirim rincian tugas ke nomor WA pegawai yang ditugaskan.
- [x] **Broadcast Pengumuman Internal Satu-Arah:**
  - [x] Fitur kirim pengumuman penting / arahan pimpinan BPS Sitaro secara serentak ke seluruh koordinator pilar via WhatsApp bot dan banner dinamis pada Beranda REBO.

### 13. Manajemen Pelayanan Publik, Suara Konsumen & Pengaduan (Voice of Customer)
- [x] **Generator QR Code Meja Layanan PST (Pelayanan Statistik Terpadu):**
  - [x] Pembuat QR Code siap cetak (desain resmi BPS) untuk diletakkan di ruang resepsionis/PST agar tamu/responden dapat langsung memindai dan mengisi survei kepuasan lewat ponsel.
- [x] **Kanal Pengaduan & Whistleblowing System (WBS) Internal:**
  - [x] Formulir pengaduan masyarakat / pegawai yang aman, terenkripsi, dan dapat diisi secara anonim untuk mendukung pemenuhan bukti dukung Pilar 5 (Penguatan Pengawasan).
  - [x] Notifikasi langsung ke Tim Kepatuhan Internal saat ada laporan pengaduan masuk.
- [x] **Analisis Sentimen & Word Cloud Kepuasan Konsumen:**
  - [x] Visualisasi analisis kata kunci (*word cloud*) dan sentimen positif/negatif dari kritik dan saran pengunjung PST untuk bahan evaluasi berkala pimpinan.

### 14. PWA Lanjutan, Offline-First & Kecepatan Unggah Berkas
- [x] **Penyimpanan Draf Offline (IndexedDB / Local-First):**
  - [x] Operator tetap dapat mengetik narasi jawaban LKE dan mengisi tautan saat koneksi internet kepulauan sedang bermasalah atau mati listrik; data tersimpan otomatis di browser lokal dan tersinkron ke cloud begitu online.
- [x] **Image & File Compressor Otomatis Sebelum Upload:**
  - [x] Kompresi berkas gambar/foto dokumentasi dan dokumen pindaian di sisi peramban (client-side) sebelum diunggah ke Google Drive guna menghemat kuota penyimpanan dan mempercepat proses upload.
- [x] **PWA Quick Action Shortcuts:**
  - [x] Tombol pintas saat ikon aplikasi REBO ditekan lama di layar beranda ponsel: *"Upload Bukti Cepat"*, *"Cek Status Indikator Saya"*, dan *"Buka Kanban"*.

### 15. Gamifikasi, Motivasi & Papan Apresiasi Tim Kerja (Recognition Hub)
- [x] **Leaderboard Progresivitas & Kepatuhan 6 Pilar:**
  - [x] Papan peringkat sehat antar-pilar yang menampilkan pilar tercepat dalam menyelesaikan verifikasi berkas 100% dan pilar dengan tingkat revisi terendah.
- [x] **Lencana Penghargaan Digital (Achievement Badges):**
  - [x] Pemberian badge apresiasi otomatis di profil tim kerja (contoh: *"Pilar Terdisiplin"*, *"Zero Revision Champion"*, *"Dokumen Terlengkap"*).
  - [x] Notifikasi apresiasi dari Kepala BPS Sitaro ke grup tim kerja atas pencapaian milestone penting.

### 16. Replikasi Antar-Satker & Ketahanan Cadangan Data (Multi-Tenant & Disaster Recovery)
- [x] **Kesiapan Multi-Satker (Replikasi BPS Kabupaten/Kota Lain):**
  - [x] Struktur konfigurasi profil instansi modular sehingga sistem REBO dapat direplikasi dan digunakan oleh BPS Kabupaten/Kota lain di Sulawesi Utara maupun nasional dengan mudah.
- [x] **Automated Cloud Backup & Disaster Recovery:**
  - [x] Penjadwalan cadangan otomatis (*automated snapshot backup*) basis data Supabase berkala ke Google Cloud Storage / Amazon S3.
  - [x] Tombol 1-klik untuk validasi integritas data cadangan dan pemulihan darurat (*disaster recovery verification*).

### 17. Manajemen Integritas Pegawai & Kepatuhan LHKPN/LHKASN (Pilar 5 & 3)
- [x] **Pelacak Kepatuhan e-LHKPN & e-LHKASN (100% Compliance Tracker):**
  - [x] Dashboard pemantauan status penyampaian bukti tanda terima pelaporan harta kekayaan seluruh pejabat dan ASN BPS Sitaro sebelum batas akhir 31 Maret.
  - [x] Pengingat otomatis via WhatsApp (H-30, H-14, H-7) kepada pegawai yang belum mengunggah bukti lapor LHKPN/LHKASN.
- [x] **Matriks Kepatuhan Disiplin & Kode Etik ASN:**
  - [x] Perekaman bukti dukung nihil penjatuhan hukuman disiplin tingkat sedang/berat (syarat mutlak kelolosan predikat WBK).
- [x] **Unit Pengendalian Gratifikasi (UPG) & Rekonsiliasi KPK:**
  - [x] Formulir online pelaporan penolakan / penerimaan gratifikasi pegawai yang terhubung langsung dengan alur verifikasi Tim Kepatuhan Internal BPS Sitaro.

### 18. Aksesibilitas, Disabilitas & Ramah Difabel pada PST (Pilar 6 Pelayanan Publik)
- [x] **Katalog Fasilitas Ramah Kelompok Rentan & Difabel:**
  - [x] Dokumentasi sarana-prasarana inklusif ruang Pelayanan Statistik Terpadu (PST): jalur pemandu (*guiding block*), kursi roda, ruang laktasi, toilet difabel, formulir huruf braille, dan alat bantu dengar.
- [x] **Widget Aksesibilitas Web (Text-to-Speech & Font Resizer):**
  - [x] Integrasi alat bantu aksesibilitas pada formulir survei publik dan portal REBO untuk pengunjung disabilitas sesuai standar WCAG 2.1.
- [x] **Katalog Standar Pelayanan & Maklumat Pelayanan Digital:**
  - [x] Tampilan interaktif Standar Pelayanan (SP) untuk seluruh produk data statistik BPS, alur kompensasi keterlambatan layanan, dan Maklumat Pelayanan BPS Sitaro.

### 19. Executive Command Center & Generator Slide Paparan TPN (Pimpinan)
- [x] **Executive Command Center (Mode Layar TV / Big Screen Display):**
  - [x] Tampilan dasbor visual layar penuh (*kiosk mode*) untuk monitor TV lobi kantor / ruang kerja Kepala BPS yang memutar rotasi realtime: progres 6 pilar, skor IKM/IPAK, hitung mundur batas waktu, dan capaian inovasi.
- [x] **One-Click Presentation Deck Generator (Ekspor Slide PPTX):**
  - [x] Pembuatan berkas presentasi PowerPoint (.pptx) paparan ZI BPS Sitaro secara otomatis dari data dan grafik riil sistem REBO untuk dipaparkan di hadapan Tim Penilai Nasional (TPN).
- [x] **Analisis Tren Kinerja Antar-Tahun (Multi-Year Trend Analysis):**
  - [x] Grafik komparasi perkembangan skor LKE antar-periode (2024, 2025, 2026) untuk membuktikan adanya perbaikan berkelanjutan (*continuous improvement*).

### 20. Keamanan Lanjutan, Watermarking & Perlindungan Privasi (Data Shield)
- [x] **Watermarking Otomatis Berkas Bukti Dukung:**
  - [x] Penambahan watermark otomatis (*"HANYA UNTUK PENILAIAN ZI BPS SITARO - TAHUN [YYYY] • RAHASIA KEDINASAN"*) pada pratinjau dokumen PDF untuk mencegah kebocoran atau penyalahgunaan berkas kedinasan.
- [x] **Session Auto-Timeout & Suspicious Login Alert:**
  - [x] Penguncian sesi otomatis setelah inaktivitas 30 menit saat diakses dari komputer bersama (*shared PC kantor*), serta notifikasi peringatan jika ada login dari perangkat asing.
- [x] **Enkripsi File Sensitif (Doc Shield):**
  - [x] Enkripsi berkas dokumen pemeriksaan internal dan laporan keuangan sebelum disimpan ke cloud storage.

### 21. Manajemen Anggaran & Rencana Aksi ZI (Resource & Efficiency Tracking)
- [x] **Pelacak Anggaran & Realisasi Kegiatan ZI/RB:**
  - [x] Monitoring penyerapan anggaran pendukung reformasi birokrasi (sosialisasi internal, survei kepuasan, pengadaan sarana PST, pakaian tim kerja).
- [x] **Indikator Efisiensi & Dampak Paperless (Paperless Metric):**
  - [x] Metrik penghitungan estimasi penghematan lembar kertas dan biaya cetak (*paperless cost savings*) berkat digitalisasi penuh dokumen bukti dukung pada aplikasi REBO V2.

---

## 🛠️ Prioritas Perbaikan Fitur & Menu Eksisting (Hardening Berdasarkan Hasil Testing)

*Catatan: Fokus pada pematangan, perbaikan bug/friction, ketahanan sistem (resilience), dan penyempurnaan fitur yang telah ada tanpa menambah menu baru.*

### 1. Perbaikan & Ketahanan Notifikasi WhatsApp (`/rebo/admin/kontak`)
- [x] **Penanganan Cold Start / Sleep Gateway Render:**
  - [x] Tambahkan indikator visual loading/spinner saat tombol "Uji Kirim WA" atau submit bukti diklik ketika gateway baru bangun dari sleep, agar pengguna tidak mengira tombol macet.
  - [x] Tingkatkan toleransi timeout dari 5 detik menjadi 8-10 detik untuk panggilan pertama setelah periode idle.
- [x] **Auto-Refresh Status Koneksi Gateway:**
  - [x] Implementasikan auto-polling (interval 30-45 detik) pada card status di `/rebo/admin/kontak` sehingga saat QR code baru dipindai di tab `/qr`, status di antarmuka admin langsung berubah hijau (🟢 Terhubung) secara otomatis tanpa perlu refresh manual.
- [x] **Sanitasi & Validasi Input Nomor WhatsApp:**
  - [x] Terapkan pembersihan otomatis karakter non-angka (spasi, tanda hubung `-`, tanda kurung `()`) dan normalisasi otomatis prefix `08...`, `+62...` menjadi format standar internasional `628...` sebelum data kontak disimpan ke Supabase.

### 2. Perbaikan Menu Formulir Bukti Dukung (Form RB & Input Bukti)
- [x] **Validasi Tautan Google Drive:**
  - [x] Tambahkan validasi regex URL saat operator menginput link bukti dukung (memastikan format diawali `https://drive.google.com/...` dan bukan link lokal/kosong).
  - [x] Peringatan dini jika link yang dimasukkan adalah link pencarian atau link folder padahal yang diminta berkas spesifik.
- [x] **Pencegahan Double-Submit & Feedback Simpan:**
  - [x] Disable tombol submit dan tampilkan status *"Menyimpan..."* secara instan saat operator mengunggah dokumen bukti dukung untuk mencegah duplikasi record akibat klik ganda.
  - [x] Pastikan modal input tertutup otomatis dan daftar bukti dukung langsung ter-refresh secara mulus tanpa kedip (*optimistic update*).
- [x] **Optimasi Rendering Daftar Indikator Panjang:**
  - [x] Optimasi komponen tabel indikator pada pilar dengan jumlah pertanyaan banyak (misal Pilar 3 & Pilar 5) agar scroll dan navigasi tetap lancar di laptop/perangkat berspesifikasi rendah.

### 3. Perbaikan Papan Kanban Tindak Lanjut (`/rebo/kanban`)
- [x] **Penanganan Catatan Revisi Berteks Panjang:**
  - [x] Batasi tinggi kartu tugas (clamping text maksimal 3-4 baris) dengan tombol *"Lihat Selengkapnya"* / modal detail agar kartu dengan catatan verifikator yang panjang tidak merusak proporsi tata letak kolom Kanban.
- [x] **Status Sinkronisasi Drag-and-Drop Real-Time:**
  - [x] Pastikan perpindahan kartu antar kolom (To Do ➔ In Progress ➔ Done) langsung memperbarui status di database dengan feedback toast ringkas dan mekanisme rollback jika terjadi gangguan koneksi.
- [x] **Penyempurnaan Empty State Kolom:**
  - [x] Berikan visualisasi dan teks placeholder yang ramah pada kolom yang kosong (contoh: *"Bagus! Tidak ada catatan revisi yang tertunda"* pada kolom To Do).

### 4. Perbaikan Menu Monitoring & Siklus Periode (`/rebo/monitoring` & `/rebo/admin/periode`)
- [x] **Penanganan Kasus Nilai Nol / Pembagian Nol (NaN Handling):**
  - [x] Pastikan rumus kalkulasi persentase pada komponen diagram dan tabel ringkasan aman dari pembagian nol (`0 / 0`) jika periode baru belum memiliki indikator, sehingga tidak memunculkan teks `NaN%` atau error komputasi.
- [x] **Format Hasil Ekspor Excel LKE:**
  - [x] Sertakan tahun periode evaluasi dan timestamp pada nama berkas hasil unduhan (contoh: `LKE_BPS_Sitaro_2026_Generated_YYYYMMDD.xlsx`).
  - [x] Rapikan lebar kolom, text-wrapping, dan pewarnaan header tabel hasil ekspor agar langsung siap cetak/presentasikan ke tim penilai tanpa perlu format ulang di Microsoft Excel.
- [x] **Konsistensi Sinkronisasi Periode Global:**
  - [x] Pastikan saat Admin mengubah status periode aktif di `/rebo/admin/periode`, seluruh halaman (Monitoring, Overview, Form RB, dan Kanban) langsung membaca periode tersebut tanpa memerlukan logout-login ulang.

### 5. Perbaikan Menu Informasi RB & Katalog Arsip (`/rebo/informasi` & `/rebo/arsip`)
- [x] **Penanganan Broken Link Berkas Arsip:**
  - [x] Jika suatu tautan file arsip Google Drive eksternal memerlukan izin akses (*Request Access*) atau terhapus, berikan badge penanda khusus *"Periksa Izin Akses"* agar admin dapat segera memperbaikinya.
- [x] **Responsivitas Filter Kategori Arsip:**
  - [x] Pastikan filter kategori (SK, SOP, Laporan, Paparan) berjalan secara instan di sisi klien (*client-side fast filter*) tanpa membuat browser me-reload halaman dari awal.

### 6. Perbaikan Autentikasi, Keamanan Sesi & Konsistensi UI
- [x] **Kelancaran Redirect Pasca Login (Clerk):**
  - [x] Pastikan alur setelah sign-in dari `/auth/sign-in` selalu mendarat langsung di `/rebo/overview` tanpa jeda layar kosong (*white flash*).
- [x] **Perlindungan Akses Menu Admin (RBAC View):**
  - [x] Sembunyikan navigasi menu administratif (Manajemen Pengguna, Manajemen Periode, Generator GDrive, Audit Log, Notifikasi WA) untuk akun dengan peran non-admin/tamu agar menu samping tetap ringkas dan tidak memicu akses tidak berizin.
- [x] **Penyelarasan Warna & Tipografi Mobile:**
  - [x] Terapkan palet warna lembut (*calm-soft neutral palette*) yang konsisten pada seluruh dialog konfirmasi dan modal formulir, serta sesuaikan padding kartu pada layar ponsel agar teks tidak terpotong di tepi layar.

### 7. Hasil Pengujian Nyata & Temuan Hardening (Live Testing Findings)
- [ ] **Sesi WhatsApp Baileys Persisten di Database (Supabase Session Store):**
  - [ ] *Temuan Pengujian:* Render free-tier memiliki sistem berkas sementara (*ephemeral*), sehingga saat instance restart atau cold start, kredensial lokal di folder `auth_info/` dapat terhapus dan mengembalikan status `connected: false`.
  - [ ] *Rencana Perbaikan:* Buat adaptor penyimpanan sesi Baileys langsung ke tabel Supabase (`public.wa_auth_session`), sehingga sekali QR code dipindai, status login WhatsApp akan **abadi dan tersimpan permanen di cloud**, tidak pernah hilang walau Render restart atau di-redeploy.
- [ ] **Toleransi Latensi Cold-Start Render (Uji Latensi 17.6 Detik):**
  - [ ] *Temuan Pengujian:* Pengujian *keep-alive* langsung mencatat latensi cold-start Render mencapai 17.590 ms (17,6 detik) saat pertama kali dibangunkan dari status *sleep*.
  - [ ] *Rencana Perbaikan:* Tingkatkan timeout fetch gateway pada server actions menjadi 25 detik, dan sediakan teks status progresif di antarmuka web (*"Menghubungkan ke WhatsApp Gateway... Harap tunggu sebentar"*).
- [ ] **Deklarasi Eksplisit Dynamic Rendering (`force-dynamic`):**
  - [ ] *Temuan Pengujian:* Build Next.js mencatat peringatan `Dynamic server usage: Route couldn't be rendered statically because it used cookies` pada halaman yang membaca sesi Clerk.
  - [ ] *Rencana Perbaikan:* Deklarasikan `export const dynamic = 'force-dynamic'` secara eksplisit pada rute yang menggunakan sesi Clerk untuk mencegah build fallback warnings.
- [ ] **Pembersihan ESLint Warnings & React Hook Dependencies:**
  - [ ] *Temuan Pengujian:* Terdeteksi beberapa warning variabel tidak terpakai dan missing dependency array di `GdriveGeneratorClient.tsx` (`loadStorageStats`) dan `KontakManagerClient.tsx` (`formattedWa`).
  - [ ] *Rencana Perbaikan:* Perbaiki dependency array pada `useEffect` dan bersihkan import/variabel yang tidak terpakai agar konsol peramban bersih tanpa noise.
- [ ] **Proteksi Horizontal Overflow pada Tabel Mobile:**
  - [ ] *Temuan Pengujian:* Tabel indikator pertanyaan dengan opsi skor di Form RB berisiko menyebabkan geser layar (*horizontal scroll shift*) pada smartphone layar kecil (< 375px).
  - [ ] *Rencana Perbaikan:* Pasang kelas `w-full max-w-full overflow-x-auto` dengan pembungkus card responsif agar hanya tabel yang bergulir dan layout navigasi tetap terkunci rapi.







