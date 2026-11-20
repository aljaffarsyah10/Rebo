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

