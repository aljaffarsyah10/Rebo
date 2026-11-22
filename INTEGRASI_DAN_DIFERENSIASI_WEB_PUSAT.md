# Sinergi, Diferensiasi & Jembatan Integrasi: REBO vs Web RB Pusat

Dokumen ini menjelaskan posisi strategis **REBO V2**, perbandingan nilai tambah (*value proposition*), serta rencana arsitektur **Jembatan Sinkronisasi & Auto-Submit** ke Portal/Web RB Pusat (PMPRB Nasional/Kementerian).

---

## 1. Latar Belakang & Posisi Strategis

Dalam evaluasi Reformasi Birokrasi (RB) dan Zona Integritas (ZI), instansi pusat umumnya telah menyediakan portal pengumpulan dokumen evaluasi (misal: Portal PMPRB). Namun, portal pusat tersebut dirancang sebagai **gerbang pelaporan akhir (*reporting end-point*)**, bukan **ruang kerja operasional harian (*daily workspace/staging area*)** di level satuan kerja (satker).

### Paradigma Hubungan REBO dan Web RB Pusat:
```
[ Tim Kerja / PIC Satker ]
         │
         ▼ (Pengerjaan harian, cicil bukti, checklist QA)
┌────────────────────────────────────────────────────────┐
│             REBO V2 (Internal Workspace)               │
│  - Penataan Folder Google Drive Baku                   │
│  - Health Check Izin Akses (Anyone with link)          │
│  - Pre-Audit & QA Dokumen Wajib                        │
│  - Review Berjenjang: Operator ➔ Koordinator ➔ TPI     │
│  - Tindak Lanjut via Kanban Task Management            │
└────────────────────────────────────────────────────────┘
         │
         ▼ (Auto-Submit / Sync Assistant / Ekspor Presisi)
┌────────────────────────────────────────────────────────┐
│             Web RB Pusat (Portal Resmi)                │
│  - Penerimaan Hasil Penilaian Mandiri Final            │
│  - Evaluasi & Reviu oleh Asesor Nasional / TPN         │
└────────────────────────────────────────────────────────┘
```

---

## 2. Matriks Komparasi: Web RB Pusat vs REBO V2

| Fitur / Kapabilitas | Web RB Pusat | REBO V2 (Satker BPS Sitaro) |
| :--- | :---: | :---: |
| **Fungsi Utama** | Pengumpulan laporan & penilaian akhir | *Staging area*, kolaborasi tim, dan penyiapan bukti |
| **Siklus Penggunaan** | Musiman (hanya saat jadwal evaluasi dibuka) | Sepanjang tahun (*continuous improvement*) |
| **Otomasi Google Drive** | ❌ Input manual (rentan salah link/folder privat) | ✅ *Auto-generate* struktur folder baku per indikator |
| **Pengecekan Izin Link** | ❌ Tidak ada (sering ditolak karena link terkunci) | ✅ *Health check* deteksi otomatis link privat/publik |
| **Pre-Submission QA** | ❌ Tidak ada validasi isi berkas | ✅ Checklist kelengkapan berkas wajib per indikator |
| **Alur Reviu Berjenjang** | ❌ Langsung submit ke instansi pusat | ✅ Operator ➔ Koordinator Pilar ➔ TPI / Ketua ZI |
| **Pelacakan Tindak Lanjut** | ❌ Manual di luar sistem (notula rapat/chat) | ✅ Terintegrasi langsung dengan Kanban Board |
| **Peringatan Batas Waktu** | ❌ Terbatas pada pengumuman umum | ✅ *Early Warning System* notifikasi ke PIC pilar |

---

## 3. Fitur Unggulan REBO yang Tidak Dimiliki Web Pusat

### A. Pre-Submission Quality Assurance (QA Checklist)
Banyak satker gagal meraih nilai maksimal karena link yang dikirimkan ke pusat ternyata belum memuat dokumen inti yang disyaratkan. REBO menyediakan daftar ceklist dokumen minimal per indikator:
- *SK Tim / SK Penunjukan*
- *Undangan Rapat*
- *Daftar Hadir Resmi*
- *Notula / Risalah Rapat*
- *Laporan / Bukti Pelaksanaan*
- *Dokumentasi / Foto Kegiatan*

> Status indikator **tidak dapat diubah menjadi "Siap Kirim"** sebelum seluruh dokumen wajib dicentang dan diverifikasi oleh koordinator pilar.

### B. Google Drive Link & Permission Guard (Health Checker)
Masalah paling sering terjadi saat penilaian oleh asesor pusat adalah: **Link Google Drive tidak dapat dibuka (Access Denied / Butuh Izin Akses)** atau **Folder Kosong**.
- Fitur ini secara otomatis menguji URL Google Drive yang disimpan.
- Memverifikasi apakah permission sudah disetel ke *"Anyone with the link can view"*.
- Memberikan peringatan dini (*warning badge*) jika link berstatus *Restricted* atau *Broken Link (404)* sebelum disubmit ke pusat.

### C. Alur Verifikasi Internal Berjenjang
Sebelum link bukti dukung diteruskan ke portal pusat, REBO menerapkan alur *quality control* internal:
1. **Operator Pilar:** Mengunggah dokumen dan mengisi klaim nilai mandiri.
2. **Koordinator Pilar:** Memeriksa kesesuaian dokumen dengan LKE.
3. **Tim Penilai Internal (TPI) / Ketua ZI:** Memberikan persetujuan akhir kelayakan bukti dukung (*Quality Assurance Passed*).

---

## 4. Arsitektur Jembatan & Auto-Submit ke Web RB Pusat

Untuk mengeliminasi pekerjaan repetitif *copy-paste* puluhan indikator dan tautan Google Drive dari REBO ke Web RB Pusat, disediakan 3 opsi arsitektur:

### Opsi 1: Ekstensi Peramban "REBO Sync Assistant" (Metode Utama — Direkomendasikan)
- **Konsep:** Ekstensi Chrome / Edge berbasis Manifest V3 yang dipasang di peramban operator/PIC.
- **Mekanisme Kerja:**
  1. Operator membuka halaman pengisian LKE di Web RB Pusat.
  2. Ekstensi mendeteksi kode pilar dan indikator yang sedang aktif di halaman tersebut.
  3. Operator menekan tombol *"Sync from REBO"*.
  4. Ekstensi mengambil link Google Drive dan skor terverifikasi dari REBO via secure API token.
  5. Form pada Web RB Pusat terisi secara otomatis (*auto-fill*).
  6. Operator meninjau isian, lalu menekan tombol simpan resmi pada Web RB Pusat (*Human-in-the-Loop*).
- **Keunggulan:**
  - 100% aman dari hambatan CAPTCHA, Cloudflare, atau Single Sign-On (SSO) kementerian.
  - Tidak membebani server dengan *headless bot*.
  - Menghindari risiko salah submit karena operator tetap melakukan verifikasi visual.

### Opsi 2: Skrip Otomasi RPA / Headless Browser (Background Worker)
- **Konsep:** Layanan backend otomatis menggunakan Puppeteer atau Playwright.
- **Mekanisme Kerja:**
  - Operator memicu perintah *"Kirim ke Web Pusat"*.
  - Worker menjalankan *headless browser*, melakukan login dengan kredensial akun satker yang diizinkan, menavigasi form LKE, dan mengisikan seluruh data dalam mode batch.
- **Catatan:** Cocok jika Web RB Pusat tidak menerapkan CAPTCHA dinamis atau two-factor authentication (2FA).

### Opsi 3: One-Click Standard Formatter (Batch Export)
- **Konsep:** Generator berkas impor terstruktur (Excel/CSV/JSON) yang format kolomnya 100% sesuai dengan modul impor Web RB Pusat (jika portal pusat menyediakan fitur bulk upload).

---

## 5. Pelacakan Status Pengiriman (Submission Lifecycle)

Tiap indikator di REBO memiliki penanda status alur kerja yang jelas:

```
[ 🟡 Draft Internal ]
         │
         ▼
[ 🔵 Verified Internal ] (Disetujui Koordinator Pilar)
         │
         ▼
[ 🟣 Siap Kirim ke Pusat ] (Lolos QA Checklist & Izin GDrive Valid)
         │
         ▼
[ 🟢 Tersinkron ke Web Pusat ] (Tercatat timestamp, PIC pengirim, dan versi link)
```

Sistem juga menyimpan **Submission Audit Log** yang mencatat bukti riwayat pengiriman, sehingga jika terjadi perbedaan versi antara data satker dan web pusat, satker memiliki bukti log yang valid.
