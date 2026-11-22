# Analisis Kebutuhan & Pengembangan REBO V2

Dokumen ini berisi daftar ringkas kebutuhan perbaikan (**Yang Perlu Diperbaiki/Wajib**) dan peluang fitur baru (**Yang Bisa Dikembangkan**) berdasarkan hasil audit codebase **REBO V1**.

---

## 1. Yang Perlu Diperbaiki & Dilengkapi (Prioritas Utama / Core Fixes)

### A. Keamanan & Hak Akses (Authentication & Authorization)
1. **Perbaikan Proteksi Route Admin:** Menyesuaikan matcher di `middleware.ts` dari `/admin(.*)` menjadi `/rebo/admin(.*)` dan menambahkan `await` pada pengecekan `checkRole('admin')`.
2. **Validasi Server-Side pada API Routes:** Menambahkan pengecekan autentikasi dan role pada endpoint `/api`, `/api/status`, `/api/pilarHasil`, dan `/api/download`.
3. **Pemisahan Hak Edit Form:** Membatasi agar `Catatan Koordinator` dan aksi `Approve/Reject` hanya dapat diubah oleh Koordinator/Verifikator/Admin (bukan oleh semua user di form yang sama).

### B. Perbaikan Logika Bisnis & Perhitungan LKE
1. **Konsistensi Perhitungan Progress:** Menyeragamkan rumus persentase kelengkapan antara komponen `ProgressPilar`, grafik monitoring, dan tabel monitoring (membedakan status *Belum Diisi*, *Dikirim/Menunggu Verifikasi*, *Disetujui*, dan *Ditolak/Revisi*).
2. **Validasi Skor & Bobot:** Memastikan perhitungan nilai maksimal dan nilai capaian pada tiap Subpilar, Pilar, Area (Pemenuhan & Reform), dan Aspek Hasil sesuai standar bobot LKE ZI Nasional.

### C. Penyelesaian Fitur yang Belum Berfungsi di V1
1. **CRUD Master Data RB (`/rebo/dataRB`):** Mengaktifkan tombol Tambah, Detail, Edit, dan Hapus pada halaman manajemen Pilar, Subpilar, Pertanyaan, dan Kategori Penilaian.
2. **Pembersihan Kode Template (Cleanup):** Menghapus halaman dan komponen bawaan template yang tidak relevan dengan REBO (seperti `/dashboard/product`, `recentSalesData`, `/notes`, dan mock API).
3. **Optimasi Query Database:** Menghilangkan *N+1 query* di halaman Pemenuhan & Reform dengan menggabungkan query relasi sekaligus.

---

## 2. Yang Bisa Dikembangkan di REBO V2 (Enhancement & Fitur Baru)

### A. Manajemen Periode / Multi-Tahun Evaluasi
1. **Filter & Siklus Tahun LKE (Multi-Year):** Mendukung pengisian dan penyimpanan bukti dukung per tahun/periode (misal: 2024, 2025, 2026) tanpa menimpa data tahun sebelumnya.
2. **Salin/Template Bukti Tahun Sebelumnya:** Fitur duplikasi struktur atau referensi bukti rutin dari tahun lalu untuk mempercepat pengisian.

### B. Sistem Role Spesifik Tim Zona Integritas (RBAC)
1. **Multi-Role sesuai Struktur Tim ZI:**
   - **Super Admin / Ketua ZI:** Akses penuh seluruh pilar, manajemen periode, dan manajemen user.
   - **Koordinator Pilar (Pilar 1 s.d. 6):** Mengelola dan memverifikasi subpilar/pertanyaan pada pilarnya masing-masing.
   - **Anggota Tim / Operator:** Mengunggah bukti dukung dan mengisi penilaian mandiri.
   - **Tim Penilai Internal (TPI) / Verifikator:** Memberikan reviu, catatan evaluasi, dan nilai verifikasi akhir.

### C. Manajemen Bukti Dukung yang Lebih Kaya & Terintegrasi
1. **Multi-Link / Multi-Dokumen per Pertanyaan:** Satu pertanyaan LKE dapat memiliki beberapa tautan bukti dukung spesifik (misal: *Undangan*, *Daftar Hadir*, *Notula*, *Laporan*, *Dokumentasi*) beserta labelnya.
2. **Standardisasi & Auto-Generate Link Google Drive per Indikator:**
   - Menyediakan fitur pembuatan/pemetaan tautan Google Drive otomatis untuk tiap indikator/pertanyaan LKE (1 indikator = 1 link folder khusus).
   - Penataan struktur folder Google Drive yang tersistematisasi dan terpusat dalam satu master folder per periode tahun evaluasi (misal: `REBO > [Tahun 2025 / 2026] > [Area] > [Pilar] > [Subpilar] > [Indikator]`).
   - Mencegah link bukti dukung tercecer atau tidak seragam, memastikan hak akses folder konsisten, serta mempermudah backup/arsip bukti dukung tahunan.
3. **Riwayat Revisi & Log Aktivitas (Audit Trail):** Mencatat siapa yang mengubah link bukti, kapan dikirim, dan riwayat komentar antara operator dan koordinator/verifikator.
4. **Arsip Dinamis:** Mengubah halaman `/rebo/arsip` yang semula *hardcoded* menjadi daftar dokumen SK, Pedoman, dan Folder Bukti yang dapat dikelola dari dashboard per tahun.

### D. Pelaporan, Ekspor, & Kolaborasi
1. **Ekspor LKE Format Excel (.xlsx) & Laporan PDF:** Menyempurnakan ekspor CSV menjadi format Excel terstruktur menyerupai kertas kerja LKE resmi dan ringkasan eksekutif PDF.
2. **Integrasi Kanban / Todo Khusus Tindak Lanjut RB:** Memanfaatkan modul Kanban yang sudah ada untuk melacak tugas pemenuhan bukti dukung yang belum lengkap atau yang berstatus *Ditolak/Revisi* beserta batas waktunya (*deadline*).
3. **Perbandingan Nilai Mandiri vs Nilai Verifikasi:** Menampilkan selisih antara skor klaim tim pilar dengan skor hasil reviu verifikator/TPI di dashboard monitoring.

---

## 3. Strategi Diferensiasi: Nilai Tambah REBO vs Web RB Pusat & Fitur Jembatan (Bridge)

### A. Posisi Strategis REBO terhadap Web RB Pusat
| Aspek | Web RB Pusat (PMPRB Nasional/Kementerian) | REBO V2 (Platform Satker Daerah) |
| :--- | :--- | :--- |
| **Fokus Utama** | Pelaporan akhir (*final submission*) & penilaian oleh Asesor Nasional/Pusat. | Manajemen proses harian (*internal staging area*), kolaborasi tim, dan penyiapan bukti. |
| **Sifat Penggunaan** | Periodik / musiman (aktif saat jendela penilaian dibuka). | Sepanjang tahun (*continuous improvement* & cicil bukti dukung). |
| **Alur Verifikasi** | Hanya menerima klaim nilai satker tanpa kontrol alur internal. | Alur reviu internal berjenjang: Operator Pilar ➡️ Koordinator Pilar ➡️ TPI/Ketua ZI. |
| **Manajemen Dokumen** | Hanya menyediakan kolom teks/paste link (rentan link mati/terkunci). | *Auto-generate* struktur folder GDrive baku, standarisasi penamaan, dan *health check* izin akses. |
| **Tindak Lanjut Evaluasi** | Catatan reviu sering kali terpisah di catatan manual/rapat. | Terintegrasi langsung dengan Kanban Board & penugasan berbatas waktu (*deadline*). |

---

### B. Fitur Unggulan yang Tidak Dimiliki Web RB Pusat (Nilai Tambah Nyata)
1. **Pre-Submission Quality Assurance (QA Checklist):**
   - Tiap indikator LKE memiliki daftar cek kelengkapan dokumen wajib (misal: *SK Tim*, *Undangan*, *Daftar Hadir*, *Notula Rapat*, *Laporan Akhir*, *Dokumentasi/Foto*).
   - Sistem melarang status "Disetujui Internal / Siap Kirim" jika syarat dokumen minimal belum terpenuhi, mencegah satker mengirim link folder kosong ke pusat.
2. **Google Drive Link & Permission Guard (Health Checker):**
   - Pengecekan otomatis status izin akses link Google Drive yang diinput.
   - Mendeteksi apakah link berstatus *"Restricted / Perlu Izin Akses"* atau *"Anyone with link can view"*. Hal ini menyelesaikan masalah klasik bukti dukung ditolak asesor pusat karena link tidak bisa dibuka.
   - Deteksi link mati (404/URL salah format) sebelum waktu submit ke pusat.
3. **Simulasi Skor & Analisis Gap (What-If Scoring):**
   - Menghitung simulasi perolehan nilai menuju target predikat WBK/WBBM (skor minimal 75 / 85).
   - Memberikan rekomendasi indikator mana yang berbobot besar namun nilainya masih rendah untuk diprioritaskan perbaikannya.
4. **Early Warning System & Reminder Notifikasi:**
   - Pengingat otomatis menjelang batas waktu penilaian pusat (*H-30, H-14, H-7, H-1*) melalui webhook notifikasi (WhatsApp/Email/Telegram/Notifikasi Sistem) kepada PIC pilar yang indikatornya belum lengkap.

---

### C. Fitur Jembatan & Auto-Submit ke Web RB Pusat
Agar operator tidak perlu bekerja dua kali (mengisi di REBO lalu *copy-paste* satu per satu ke Web RB Pusat), dikembangkan mekanisme sinkronisasi otomatis:

1. **Opsi 1: Ekstensi Browser Pembantu (REBO Chrome Extension / Sync Assistant) — *Paling Direkomendasikan***
   - Ekstensi browser ringan yang diinstal pada browser operator.
   - Cara kerja: Saat operator membuka halaman form LKE di Web RB Pusat, ekstensi akan mendeteksi indikator yang sedang dibuka, mengambil link GDrive dan skor yang sudah berstatus *"Verified"* di REBO, lalu melakukan pengisian form (*auto-fill*) secara otomatis dengan 1 klik tombol *"Sync from REBO"*.
   - **Kelebihan:** Aman dari hambatan CAPTCHA, aman dari pembatasan IP server, tidak terhalang SSO kementerian, dan operator tetap dapat meninjau (*human-in-the-loop*) sebelum menekan tombol submit resmi di web pusat.

2. **Opsi 2: Skrip Otomasi RPA / Headless Browser (Puppeteer/Playwright Background Worker)**
   - Modul otomatisasi berbasis bot/headless browser di server.
   - Skrip menerima kredensial akun Web RB Pusat dari operator, login otomatis, mencocokkan kode indikator, lalu mengunggah/menginputkan seluruh link GDrive hasil verifikasi secara serentak (*batch submit*).
   - Cocok jika Web RB Pusat memiliki antarmuka standar tanpa proteksi anti-bot/CAPTCHA dinamis.

3. **Opsi 3: One-Click Mapping & Batch Export/Import Engine**
   - Jika Web RB Pusat memiliki fitur impor (misal via Excel template resmi atau format JSON/CSV khusus), REBO menyediakan tombol ekspor dengan struktur kolom yang 100% presisi dan kompatibel tanpa perlu edit manual.

4. **Tracking Status Sinkronisasi ke Pusat:**
   - Indikator memiliki penanda status:
     - 🟡 `Draft Internal` (Sedang diisi operator pilar)
     - 🔵 `Verified Internal` (Sudah disetujui koordinator & TPI satker)
     - 🟣 `Siap Kirim ke Pusat` (Lolos QA Checklist & izin link GDrive valid)
     - 🟢 `Tersinkron ke Web Pusat` (Tercatat tanggal, jam, dan versi link yang dikirim)
   - Log riwayat pengiriman (*Submission Audit Log*) untuk bukti pertanggungjawaban jika terjadi selisih antara data satker dan data di web pusat.

