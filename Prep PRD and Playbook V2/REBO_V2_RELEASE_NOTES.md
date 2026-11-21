# REBO V2 — OFFICIAL RELEASE NOTES
**Platform Evaluasi PMPRB & Zona Integritas BPS Kabupaten Kepulauan Siau Tagulandang Biaro**  
**Versi:** 2.0.0 (Production Ready)  
**Tanggal Rilis:** 21 November 2026  
**Instansi:** Badan Pusat Statistik (BPS) Kabupaten Kepulauan Sitaro, Sulawesi Utara  

---

## 1. Ringkasan Eksekutif (Executive Summary)

**REBO (Reformasi Birokrasi) Versi 2.0.0** merupakan transformasi arsitektural menyeluruh dari sistem penataan bukti dukung warisan (V1) menjadi platform *enterprise-grade* modern yang dirancang khusus untuk memfasilitasi penilaian mandiri, verifikasi, monitoring real-time, dan pelaporan Lembar Kerja Evaluasi (LKE) Zona Integritas (ZI) menuju predikat **Wilayah Bebas dari Korupsi (WBK)** dan **Wilayah Birokrasi Bersih dan Melayani (WBBM)** di lingkungan BPS Kabupaten Kepulauan Sitaro.

REBO V2 dibangun di atas fondasi teknologi mutakhir: **Next.js 15 (App Router, Turbopack)**, **React 19**, **Tailwind CSS v4**, **Clerk Authentication dengan granular RBAC metadata**, **Supabase PostgreSQL** dengan isolasi multi-periode, **ExcelJS** untuk ekspor kertas kerja standar KemenPAN-RB, **Sentry v9** untuk pemantauan stabilitas sistem, dan dukungan **Progressive Web App (PWA)** untuk aksesibilitas smartphone pimpinan dan tim kerja lapangan.

---

## 2. Sorotan Fitur Utama Versi 2.0 (Key Highlights)

### 2.1 Multi-Periode Lifecycle Management
- **Isolasi Data Antar Tahun**: Mendukung evaluasi multi-tahun (2025, 2026, dan tahun mendatang) tanpa risiko tercampur atau tertimpa.
- **Penguncian Periode (Freeze/Lock)**: Admin dapat mengunci periode evaluasi lampau menjadi mode *read-only* demi menjaga integritas data riwayat.
- **Duplikasi Struktur Indikator Lintas Tahun**: Fasilitas instan bagi Admin untuk mengkloning seluruh hierarki pertanyaan ke tahun anggaran baru dengan satu klik.
- **Global Periode Switcher**: Dropdown pemilih periode aktif di header navigasi yang langsung menyinkronkan data di seluruh halaman aplikasi.

### 2.2 Granular Role-Based Access Control (RBAC)
- **4 Tingkatan Peran Terstruktur**:
  1. **Super Admin**: Akses penuh manajemen pengguna, manajemen periode, audit log, master data, dan generator Google Drive.
  2. **Koordinator Pilar**: Memvalidasi bukti dukung, memberikan catatan revisi, menetapkan status verifikasi, dan menilai skor indikator pilar yang ditugaskan.
  3. **Operator (Tim Kerja)**: Mengisi instrumen LKE, mengunggah multi-dokumen bukti dukung, memilih opsi penilaian mandiri, dan menindaklanjuti revisi.
  4. **TPI / Observer (Verifikator Eksternal/Inspektorat)**: Akses audit dan reviu lintas pilar secara transparan.
- **Multi-Layer Security**: Proteksi ganda pada level `middleware.ts`, Server Actions (`requireRole`, `canEditBukti`, `canVerifyBukti`), dan Client UI rendering.

### 2.3 Standarisasi Hierarki Folder Google Drive per Indikator
- **Generator Struktur Otomatis**: Menghasilkan struktur folder penyimpanan terstandar dengan nomenklatur:
  `BPS-7108/RB/{Tahun}/{Area}/{Kode_Pilar}_{Nama_Pilar}/{Kode_Indikator}`
- **One-Click Folder Open**: Tombol akses cepat yang langsung membuka direktori folder Google Drive per pertanyaan LKE.
- **Panduan Hak Akses Domain**: Peringatan terintegrasi untuk memastikan tautan dapat diakses oleh akun resmi `@bps.go.id`.

### 2.4 Formulir LKE Dinamis & Multi-Dokumen Bukti
- **Dukungan Multi-Dokumen**: Setiap pertanyaan indikator dapat memuat berkas tak terbatas (SK, Notula, Daftar Hadir, Undangan, Laporan, dsb.) dengan metadata nama dan tipe dokumen.
- **Perhitungan Skor Mandiri Real-Time**: Skor otomatis terkalkulasi secara proporsional sesuai opsi kategori penilaian yang dipilih.
- **Alur Kerja Draft & Review**: Operator dapat menyimpan progres sementara sebagai draft atau mengirimkannya secara resmi ke tahap review.

### 2.5 Verifikasi & Feedback Loop Koordinator yang Ketat
- **Proteksi Catatan Koordinator**: Kolom catatan koordinator dan tombol persetujuan status terkunci rapat dari manipulasi Operator biasa.
- **Mandatory Revision Reason**: Validasi wajib minimal 5 karakter instruksi perbaikan apabila Koordinator menetapkan status **Perlu Revisi (Ditolak)**.
- **Quick Action Matching**: Kemudahan menyamakan nilai verifikasi dengan skor mandiri dalam satu klik saat bukti dinyatakan valid.

### 2.6 Kanban Board Tindak Lanjut Otomatis
- **Sinkronisasi Status Real-Time**: Indikator yang berstatus 'Perlu Revisi' secara otomatis masuk ke kolom **To Do** pada Kanban Board (`/rebo/kanban`).
- **Filter Berdasarkan Pilar**: Memudahkan tim kerja fokus pada area tugas masing-masing.
- **Tracking Penyelesaian**: Memantau pergerakan indikator dari *Perlu Revisi* -> *Menunggu Review* -> *Disetujui (Done)*.

### 2.7 Dashboard Monitoring & Visualisasi Recharts
- **KPI Komparasi Real-Time**: Menampilkan ringkasan total pertanyaan, jumlah disetujui, jumlah perlu revisi, persentase kelengkapan, dan perbandingan akumulasi skor Mandiri vs Verifikasi vs Nilai Maksimal.
- **Bar Chart & Donut Chart**: Visualisasi interaktif capaian skor antar pilar dan proporsi status kelengkapan dokumen.
- **Rincian Capaian Subpilar**: Tabel hierarkis status pemenuhan hingga level butir indikator.

### 2.8 Ekspor Kertas Kerja LKE Resmi Standar KemenPAN-RB
- **Format Excel (.xlsx) Resmi**: Template workbook Excel berestetika tinggi sesuai standar BPS RI dan KemenPAN-RB dengan warna korporat *Navy Blue* (`#003366`), auto-fit column, cell border, wrapping text, dan data terarsir rapi.
- **Multi-Sheet Reporting**:
  - *Sheet 1: Kertas Kerja LKE ZI* (daftar lengkap indikator, kategori penilaian, link bukti, skor mandiri vs verifikasi, selisih, dan riwayat verifikator).
  - *Sheet 2: Rekapitulasi & Komparasi Pilar* (rekap nilai per pilar dan persentase capaian).
- **Arsip Dinamis**: Kemampuan download arsip historis dan kertas kerja per periode evaluasi.

### 2.9 Master Data CRUD & Arsitektur Database Bersih
- **Kelola Hierarki Instrumen**: Admin dapat menambah, mengedit, atau menghapus data Area, Pilar, Subpilar, Pertanyaan, dan Kategori Penilaian secara langsung.
- **Audit Logging Komprehensif**: Seluruh mutasi kritis (penyimpanan bukti, approval, revisi, perubahan periode, update master data) terekam ke tabel `audit_log` beserta IP address dan user agent.
- **Pembersihan Kode Warisan (Legacy Cleanup)**: Seluruh file, dependensi, dan rute e-commerce bawaan template lama telah dihapus 100%.

### 2.10 PWA & Aksesibilitas Mobile Modern
- **Web App Manifest Terverifikasi**: Dukungan instalasi instan pada ponsel Android dan iOS (`standalone mode`).
- **Theme Color & Splash Icons**: Konfigurasi adaptive viewport, maskable icons (192px & 512px), dan Apple startup splash screens.
- **Offline Reliability**: Didukung Service Worker Workbox via `next-pwa`.

---

## 3. Matriks Pengujian & Verifikasi (Test Scenarios TC-01 s/d TC-07)

Seluruh skenario pengujian utama pada dokumen PRD telah divalidasi dan dinyatakan **LULUS (PASSED)**:

| ID Tes | Skenario Pengujian | Target Uji & Implementasi | Status |
|:---:|:---|:---|:---:|
| **TC-01** | Akses Route Admin Tanpa Hak Akses | - `src/middleware.ts` memeriksa token & `metadata.role === 'admin'`.<br>- Server Component `src/app/rebo/admin/page.tsx` & `/periode/page.tsx` memanggil `checkRole('admin')`.<br>- Operator dialihkan otomatis ke `/rebo/overview`. | **PASSED** |
| **TC-02** | Pengisian Multi-Bukti Dukung | - `src/components/rebo/bukti-form.tsx` mengizinkan input berkas berulang.<br>- `src/actions/bukti-actions.ts` menyimpan batch array dokumen ke tabel `dokumen_bukti`. | **PASSED** |
| **TC-03** | Pembatasan Catatan Koordinator | - `src/components/rebo/verifikasi-panel.tsx` merender tampilan read-only jika `!canVerify`.<br>- Server Action memblokir perubahan field verifikasi jika pengguna tidak memiliki wewenang. | **PASSED** |
| **TC-04** | Validasi Penolakan Bukti | - Validasi ganda (Zod di `verifikasi-actions.ts` dan client validation di `verifikasi-panel.tsx`).<br>- Menolak status 'Perlu Revisi' jika catatan koordinator kosong / < 5 karakter. | **PASSED** |
| **TC-05** | Integrasi Otomatis ke Kanban | - `src/actions/kanban-actions.ts` memfilter indikator dengan `status_kelengkapan === 3` ke kolom *To Do*.<br>- Indikator langsung tampil di `/rebo/kanban` saat status diubah menjadi Perlu Revisi. | **PASSED** |
| **TC-06** | Konsistensi Skor Monitoring | - Perubahan skor di `submitBuktiAction` dan `submitVerifikasiAction` merevalidasi cache `/rebo/monitoring`.<br>- `getMonitoringDashboardData` mengkalkulasi ulang progress pilar dan grafik total secara dinamis. | **PASSED** |
| **TC-07** | Ekspor Kertas Kerja Excel | - Route handler `src/app/api/export/lke/route.ts` menghasilkan buffer ExcelJS.<br>- Tombol unduh tersedia di `/rebo/overview` dan `/rebo/monitoring`, menghasilkan file `.xlsx` resmi yang valid. | **PASSED** |

---

## 4. Arsitektur Teknis & Tech Stack

```plaintext
┌────────────────────────────────────────────────────────────────────────┐
│                        KLIEN (Browser / PWA)                           │
│  - Next.js 15 App Router (RSC + Client Components)                     │
│  - Tailwind CSS v4 + Radix UI (shadcn/ui)                              │
│  - Recharts Data Visualization                                         │
│  - PWA Service Worker (Workbox / Cache First)                          │
└────────────────────────────────────┬───────────────────────────────────┘
                                     │ HTTPS
┌────────────────────────────────────▼───────────────────────────────────┐
│                    NEXT.JS APPLICATION SERVER                          │
│  - Clerk Middleware (Session & Role Enforcement)                       │
│  - Next.js Server Actions (Type-safe Zod Validation)                   │
│  - API Route Handlers (Excel Generator, Webhooks)                      │
│  - Sentry Error Monitoring & Tracing                                   │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │ REST / SQL                     │ REST v3
┌───────────────────▼──────────────────┐   ┌─────────▼───────────────────┐
│     SUPABASE POSTGRESQL DATABASE     │   │     GOOGLE DRIVE API        │
│  - periode_evaluasi (Multi-Tahun)    │   │  - Nomenklatur Hierarki     │
│  - pertanyaan_periode (Skor & Status)│   │  - Link Bukti Dokumen       │
│  - dokumen_bukti (Multi-Berkas)      │   └─────────────────────────────┘
│  - audit_log (Log Aktivitas)         │
│  - master data (pilar, subpilar, q)  │
└──────────────────────────────────────┘
```

---

## 5. Panduan Instalasi & Deployment

### 5.1 Kebutuhan Sistem
- **Node.js**: v20.x atau v22.x LTS
- **Package Manager**: `pnpm` v9.x atau npm v10.x
- **Akun Layanan**:
  - Clerk Dashboard (Autentikasi & User Roles)
  - Supabase Project (PostgreSQL Database)
  - Vercel Account (Hosting & CI/CD)
  - Sentry Account (Error Monitoring)

### 5.2 Langkah Instalasi Lokal
1. **Clone Repositori**:
   ```bash
   git clone https://github.com/aljaffarsyah10/rebo.git
   cd rebo
   ```
2. **Install Dependensi**:
   ```bash
   pnpm install
   ```
3. **Konfigurasi Environment Variables**:
   Salin berkas konfigurasi contoh:
   ```bash
   cp env.example.txt .env.local
   ```
   Lengkapi nilai variabel di `.env.local` (lihat panduan Section 6).
4. **Jalankan Verifikasi Build**:
   ```bash
   npx tsc --noEmit
   pnpm lint
   pnpm build
   ```
5. **Jalankan Development Server**:
   ```bash
   pnpm dev
   ```
   Buka peramban di `http://localhost:3000`.

### 5.3 Langkah Deployment ke Vercel Production
1. Hubungkan repositori GitHub ke proyek Vercel.
2. Daftarkan seluruh Environment Variables produksi pada menu *Settings -> Environment Variables*.
3. Atur build command: `pnpm build` dan output directory: `.next`.
4. Lakukan deployment. Hubungkan domain resmi instansi (misal: `rebo.bps7108.web.id` atau domain Vercel).

---

## 6. Spesifikasi Environment Variables

| Variabel | Keterangan | Wajib |
|:---|:---|:---:|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Public key autentikasi Clerk | Ya |
| `CLERK_SECRET_KEY` | Private secret key autentikasi Clerk | Ya |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Rute halaman sign-in (`/auth/sign-in`) | Ya |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Rute halaman sign-up (`/auth/sign-up`) | Ya |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Rute redirect setelah login (`/rebo/overview`) | Ya |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Rute redirect setelah registrasi (`/rebo/overview`) | Ya |
| `NEXT_PUBLIC_SUPABASE_URL` | URL endpoint REST API Supabase | Ya |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key Supabase | Ya |
| `SUPABASE_SERVICE_ROLE_KEY` | Secret service role key Supabase untuk Server Actions aman | Ya |
| `NEXT_PUBLIC_SENTRY_DSN` | DSN endpoint Sentry untuk observabilitas klien | Opsional |
| `SENTRY_AUTH_TOKEN` | Auth token Sentry untuk source map upload saat build | Opsional |
| `NEXT_PUBLIC_SENTRY_ORG` | Nama organisasi Sentry | Opsional |
| `NEXT_PUBLIC_SENTRY_PROJECT` | Nama proyek Sentry | Opsional |

---

## 7. Status Checklist Rilis (Definition of Done)

- [x] Seluruh celah keamanan pada `middleware.ts` dan API routes telah tertutup dan teruji.
- [x] Seluruh halaman dan aset sisa template e-commerce telah dihapus bersih dari repositori.
- [x] Fitur multi-periode tahun berjalan dengan lancar (data 2025 dan 2026 terisolasi rapi).
- [x] Generator link folder Google Drive per indikator berfungsi 100% dengan penamaan hierarkis terstandar.
- [x] Formulir LKE mendukung input multi-dokumen bukti per pertanyaan.
- [x] Hak akses RBAC terpisah sempurna antara Operator, Koordinator Pilar, Admin, dan TPI.
- [x] Perhitungan progress kelengkapan dan skor nilai mandiri vs verifikasi akurat dan konsisten.
- [x] Fitur ekspor Excel (.xlsx) menghasilkan laporan resmi yang dapat dibaca dengan baik.
- [x] Kanban Board terintegrasi otomatis dengan indikator yang memerlukan revisi dokumen.
- [x] PWA dapat diinstal di smartphone pimpinan dan tim kerja dengan logo resmi BPS Sitaro.
- [x] Sentry error tracking aktif untuk memonitor stabilitas sistem di tahap implementasi.
- [x] Type check (`tsc --noEmit`), linter (`pnpm lint`), dan production build (`pnpm build`) sukses 100%.

---
*Diterbitkan oleh Tim Pengembang REBO V2 — BPS Kabupaten Kepulauan Sitaro, November 2026.*
