# Panduan Ekstensi Chrome: REBO Sync Assistant
**Asisten Cerdas Sinkronisasi Bukti Dukung Zona Integritas ke Portal Pusat ZIAPP**  
*BPS Kabupaten Kepulauan Siau Tagulandang Biaro*

---

## 📌 Pengenalan

**REBO Sync Assistant** adalah ekstensi peramban (Google Chrome / Microsoft Edge / Brave) berbasis **Manifest V3** yang dirancang khusus untuk menjembatani sistem internal **REBO (Reformasi Birokrasi Online BPS Sitaro)** dengan **Portal Pusat ZIAPP (BPS RI / KemenPAN-RB)**.

Dengan ekstensi ini, operator satker tidak perlu lagi menyalin (*copy-paste*) tautan folder Google Drive, uraian bukti dukung, dan catatan penilaian satu per satu secara manual ke puluhan formulir indikator evaluasi ZIAPP. Cukup dengan **1-Klik**, seluruh indikator yang telah berstatus `READY_FOR_ZIAPP` (lolos verifikasi internal & QA checklist) akan otomatis terisi dan terpetakan ke kolom form web pusat.

---

## 🚀 Cara Pemasangan di Google Chrome / Microsoft Edge

Ekstensi ini menggunakan format standar Chromium Manifest V3 yang dapat langsung dimuat tanpa perlu mendaftar ke Chrome Web Store:

1. **Buka Halaman Ekstensi Peramban:**
   - Di Google Chrome: Buka URL `chrome://extensions` di bilah alamat peramban.
   - Di Microsoft Edge: Buka URL `edge://extensions`.
2. **Aktifkan Mode Pengembang (*Developer Mode*):**
   - Di pojok kanan atas halaman ekstensi, geser tombol sakelar **Mode Pengembang** (*Developer mode*) ke posisi **Aktif (ON)**.
3. **Muat Folder Ekstensi:**
   - Klik tombol **"Muat yang belum dibongkar"** (*Load unpacked*) di pojok kiri atas.
   - Pada jendela penjelajah berkas (*file picker*), arahkan dan pilih folder:
     ```
     D:\10Project\Rebo\extensions\rebo-sync-assistant
     ```
   - Klik **Select Folder** (Pilih Folder).
4. **Sematkan (*Pin*) Ekstensi:**
   - Klik ikon puzzle / ekstensi di bilah alat (*toolbar*) peramban Anda.
   - Cari **"REBO Sync Assistant - BPS Sitaro"** lalu klik ikon sematan (*pin*) agar ikon **[R]** selalu terlihat di pojok kanan atas peramban.

---

## 🛠️ Cara Penggunaan (1-Click Auto-Fill)

### Langkah 1: Pengaturan URL Server REBO
1. Klik ikon ekstensi **[R]** di pojok kanan atas browser untuk membuka popup.
2. Di bagian **Konfigurasi Server REBO**:
   - Jika menjalankan REBO di komputer lokal, klik tombol preset **`Local (3000)`** (`http://localhost:3000`).
   - Jika menggunakan versi cloud resmi, klik tombol preset **`Vercel (Prod)`** (`https://zirebo.vercel.app`).
3. Klik tombol **"Ping"** untuk memastikan koneksi aktif (Lampu indikator akan menyala hijau dan menampilkan status *Online*).

### Langkah 2: Ambil Data Siap Sinkron
1. Klik tombol utama **"1. Ambil Data dari REBO"**.
2. Ekstensi akan memanggil endpoint API `/api/sync/ziapp?status=ready`.
3. Kartu statistik akan menampilkan:
   - Jumlah indikator yang berstatus `READY_FOR_ZIAPP`.
   - Jumlah indikator yang telah disinkronkan sebelumnya (`SYNCED_TO_ZIAPP`).
4. Anda dapat mengklik **"Lihat Detail"** untuk meninjau pratinjau kode indikator, nilai, link Google Drive, dan ringkasan dokumen yang akan diisikan.

### Langkah 3: Eksekusi Auto-Fill ke Web ZIAPP
1. Buka tab web portal evaluasi ZIAPP (misal: halaman LKE Lembar Kerja Evaluasi ZIAPP BPS RI).
2. Pastikan Anda berada pada halaman form penilaian yang aktif.
3. Buka popup ekstensi kembali, lalu klik tombol **"2. Auto-Fill ke Halaman ZIAPP (1-Click)"**.
4. Ekstensi akan menginjeksi *content script* dan mendeteksi:
   - Baris indikator berdasarkan kode (`IND-1.1.1`, `1.1.1`, dsb).
   - Kolom isian link bukti dukung (Google Drive).
   - Kolom catatan / uraian bukti dukung.
   - Pilihan skor / radio button penilaian mandiri.
5. Pada halaman web ZIAPP akan muncul **Floating Notification Banner** di pojok kanan atas yang mengonfirmasi:  
   *`REBO Sync Assistant: X Indikator berhasil diisikan!`*
6. Seluruh kolom yang diisi akan disorot dengan warna hijau lembut dan men-dispatch event reaktif (`input`, `change`, `blur`) sehingga state form framework (React, Vue, Angular) mendeteksi isian secara sempurna.
7. Jika opsi *"Tandai otomatis status SYNCED_TO_ZIAPP"* dicentang, ekstensi akan langsung memperbarui status indikator di database REBO melalui API POST `/api/sync/ziapp`.

---

## 🔒 Keamanan & Izin Privasi (*Permissions*)

Ekstensi ini dibuat dengan prinsip *least privilege* dan transparansi penuh:
- `activeTab`: Hanya membaca dan mengisikan form pada tab aktif yang sedang dibuka oleh pengguna saat tombol diklik.
- `storage`: Menyimpan konfigurasi lokal (URL server pilihan Anda) di peramban tanpa mengirim data pribadi ke pihak luar.
- `scripting`: Mengizinkan injeksi fungsi auto-fill dan tampilan floating notification banner ke halaman target.

---

## 📞 Bantuan & Pemeliharaan
Jika menemukan form web pusat dengan struktur khusus yang belum terdeteksi otomatis, silakan hubungi:  
**Tim Teknologi Informasi BPS Kabupaten Kepulauan Siau Tagulandang Biaro**  
Email / Helpdesk REBO: `https://zirebo.vercel.app`
