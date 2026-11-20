# Laporan Fase 0: Baseline Verification & Environment Readiness Check
**Proyek:** REBO V2 (BPS Kabupaten Kepulauan Siau Tagulandang Biaro)  
**Tanggal & Waktu:** 21 November 2026  
**Status:** SELESAI / SIAP UNTUK FASE 1  

---

## 1. Baseline Environment Verification

### 1.1 Git Status & Branch
- **Branch Aktif:** `main`
- **Status Repository:** Clean working tree (sebelum penambahan laporan ini)
- **Komit Terakhir:** Ahead of `origin/main` by 2 commits.

### 1.2 Dependensi & Toolchain
- **Package Manager:** `pnpm` (v10.14.0)
- **Framework:** Next.js 15.3.2 (React 19.0.0, TypeScript 5.7.2)
- **Instalasi:** `pnpm install` telah dijalankan dan 1134 paket berhasil terpasang di `node_modules`.

### 1.3 TypeScript Compilation (`npx tsc --noEmit`)
- **Status:** **PASS (0 Errors)**
- Tidak ada kendala kompilasi tipe pada basis kode saat ini.

### 1.4 ESLint Baseline (`pnpm lint`)
- **Status:** **PASS with Warnings (0 Pemblokir / Fatal Errors)**
- **Rincian Peringatan Utama:**
  1. *Console statements (`no-console`)*: Terdapat logging diagnostik di API routes (`src/app/api/*`) dan beberapa komponen UI (`monitoring`, `bukti-form`, `formRB`).
  2. *Unused variables (`@typescript-eslint/no-unused-vars`)*: Terdapat variabel yang tidak terpakai di komponen warisan template (`src/app/dashboard/product/page.tsx`, `src/features/products/components/product-form.tsx`, `src/features/profile/components/profile-create-form.tsx`) serta beberapa halaman form REBO.
  3. *Missing hook dependencies (`react-hooks/exhaustive-deps`)* di `src/components/kbar/index.tsx`.

---

## 2. Inventarisasi File Warisan Template (Legacy Cleanup List untuk Fase 1)

Berikut adalah daftar presisi seluruh artefak bawaan starter template yang tidak relevan dengan sistem Zona Integritas REBO dan direkomendasikan untuk dibersihkan/dihapus pada Fase 1:

### A. Rute Halaman Dashboard Warisan (`src/app/dashboard/`)
1. **`src/app/dashboard/product/`**
   - `src/app/dashboard/product/page.tsx`
   - `src/app/dashboard/product/[productId]/page.tsx`
2. **`src/app/dashboard/overview/`**
   - Seluruh parallel routes template sales:
     - `src/app/dashboard/overview/@sales/` (`page.tsx`, `loading.tsx`, `error.tsx`)
     - `src/app/dashboard/overview/@bar_stats/` (`page.tsx`, `loading.tsx`, `error.tsx`)
     - `src/app/dashboard/overview/@pie_stats/` (`page.tsx`, `loading.tsx`, `error.tsx`)
     - `src/app/dashboard/overview/@area_stats/` (`page.tsx`, `loading.tsx`, `error.tsx`)
     - `src/app/dashboard/overview/layout.tsx`
     - `src/app/dashboard/overview/error.tsx`
3. **`src/app/dashboard/kanban/`**
   - `src/app/dashboard/kanban/page.tsx`  
   *(Catatan: Setelah diverifikasi, rute `src/app/rebo/kanban` saat ini belum ada. Rute `kanban` ini murni bawaan template yang terhubung ke dummy in-memory store. Fitur Kanban Tindak Lanjut baru akan direkonstruksi pada Fase 7).*
4. **`src/app/dashboard/profile/` & Folder Induk `src/app/dashboard/`**
   - `src/app/dashboard/page.tsx` (hanya me-redirect ke `/dashboard/overview`)
   - `src/app/dashboard/layout.tsx` (duplikat dari `src/app/rebo/layout.tsx`)
   - `src/app/dashboard/profile/[[...profile]]/page.tsx` (dapat dimigrasikan ke rute resmi `/rebo/profile` jika menu akun pengguna tetap diperlukan).

### B. Komponen & Fitur Template (`src/features/`)
1. **`src/features/products/`** (Seluruh folder — e-commerce product CRUD):
   - `components/product-form.tsx`
   - `components/product-listing.tsx`
   - `components/product-view-page.tsx`
   - `components/product-tables/cell-action.tsx`
   - `components/product-tables/columns.tsx`
   - `components/product-tables/index.tsx`
   - `components/product-tables/options.tsx`
2. **`src/features/overview/`** (Seluruh folder — grafik penjualan template):
   - `components/recent-sales.tsx` & `recent-sales-skeleton.tsx`
   - `components/area-graph.tsx` & `area-graph-skeleton.tsx`
   - `components/bar-graph.tsx` & `bar-graph-skeleton.tsx`
   - `components/pie-graph.tsx` & `pie-graph-skeleton.tsx`
   - `components/overview.tsx`
3. **`src/features/kanban/`** (Jika tidak digunakan sebelum Fase 7):
   - `components/kanban-board.tsx`
   - `components/kanban-view-page.tsx`
4. **`src/features/profile/` (Unused dead code)**:
   - `components/profile-create-form.tsx` (form pendaftaran manual template yang tidak terpakai)
   - `utils/form-schema.ts` (skema form template)

### C. Mock Database & Dummy Data Constants (`src/constants/`)
1. **`src/constants/mock-api.ts`**
   - 100% fake in-memory database menggunakan Faker.js untuk data `Product` dan simulasi delay jaringan.
2. **`src/constants/data.ts`**
   - Tipe data `Product` (baris 3–12).
   - Dummy sales data `recentSalesData: SaleUser[]` dan interface `SaleUser` (baris 176–226).
   - Item navigasi `navItems` yang mengarah ke template: item `Todo` (`/dashboard/kanban`), item komentar `Product` dan `Dashboard`.

### D. File Konfigurasi & Git Hooks Usang
1. **`.husky/pre-push copy`** (file duplikat cadangan usang).
2. **`.husky/pre-push`** (file 0-byte kosong).
3. **`env.example.txt`** (masih menggunakan konfigurasi bawaan template, belum memuat variabel Clerk & Supabase yang lengkap).

---

## 3. Analisis Celah Keamanan (Security Vulnerability Audit)

Berdasarkan inspeksi langsung pada `src/middleware.ts` dan folder `src/app/api/*`, ditemukan 4 titik celah keamanan kritis yang harus diselesaikan pada Fase 1:

### 3.1 Celah Akses Admin pada `src/middleware.ts` (Broken Access Control)
- **Temuan:**
  ```typescript
  const isAdminRoute = createRouteMatcher(['/admin(.*)']);
  ```
  Di dalam aplikasi, rute dasbor admin yang sebenarnya digunakan berada di `/rebo/admin`.
- **Dampak Kritis:**
  Matcher `/admin(.*)` tidak mencocokkan `/rebo/admin`. Akibatnya, seluruh pengguna terautentikasi (pengguna biasa non-admin) dapat membuka dan berinteraksi dengan antarmuka admin di `/rebo/admin` tanpa pemeriksaan role `metadata.role === 'admin'`.
- **Rekomendasi:** Ubah matcher menjadi `/rebo/admin(.*)` dan pastikan pengalihan ke `/rebo/overview` jika bukan admin.

### 3.2 Celah Bypass Rute API pada `src/middleware.ts` (Unauthenticated API Exposure)
- **Temuan:**
  Middleware mendefinisikan matcher Next.js yang menangkap `'/(api|trpc)(.*)'`, namun di dalam *handler* `clerkMiddleware`:
  Hanya ada aturan pengamanan untuk `isAdminRoute` dan `isProtectedRoute` (`/rebo(.*)`).
  **TIDAK ADA** aturan penjaga (guard) untuk rute `/api(.*)`.
- **Dampak Kritis:**
  Semua permintaan HTTP ke API routes (`/api/status`, `/api/pilarHasil`, `/api/download`, `/api`) dibiarkan lolos tanpa pemeriksaan sesi Clerk.

### 3.3 Endpoint Mutasi & Ekspor Data Publik Tanpa Otorisasi
1. **`src/app/api/download/route.ts` (Unauthenticated Data Exfiltration / Info Leak):**
   - Mengambil seluruh data subpilar, pertanyaan, bukti dukung, link drive, catatan user, catatan koordinator, dan nilai akhir dari database Supabase dan mengekspornya dalam bentuk CSV.
   - **Celah:** Tidak ada pemeriksaan sesi (`auth()`) sama sekali. Siapapun dari internet tanpa login dapat mendownload seluruh kertas kerja dan bukti dukung instansi.
2. **`src/app/api/pilarHasil/route.ts` (Unauthenticated Arbitrary Score Mutation):**
   - Menerima HTTP `PUT` dengan payload `{ id_pilarHasil, skor_pilarHasil }` dan langsung melakukan update ke tabel database `pilarHasil`.
   - **Celah:** Tidak ada pengecekan autentikasi maupun otorisasi (role koordinator). Siapapun dapat memanipulasi skor pilar secara sepihak.
3. **`src/app/api/status/route.ts` (Unauthenticated Status Tampering):**
   - Menerima HTTP `POST` dengan `{ id_pertanyaan, status }` dan mengubah `status_kelengkapan` pada bukti dukung.
   - **Celah:** Tanpa autentikasi, status verifikasi bukti dapat diubah secara bebas oleh pihak luar.
4. **`src/app/api/route.ts` (Unauthenticated Evidence Injection & Tampering):**
   - Menyediakan handler `POST` dan `PUT` untuk melakukan `upsert` dan `update` data link bukti, nilai akhir, catatan user, dan catatan koordinator di tabel `buktiDukung`.
   - **Celah:** Tidak ada validasi sesi login atau identitas pengirim; siapa saja dapat menimpa data bukti dukung.

### 3.4 Konfigurasi Client Supabase Server (`src/lib/supabase/server.ts`)
- `createClient()` menggunakan `NEXT_PUBLIC_SUPABASE_ANON_KEY` bersama cookie browser. Karena sesi login utama dikelola oleh Clerk, panggilan API internal yang tidak memverifikasi token Clerk dapat mengeksekusi kueri ke Supabase dengan hak akses anonim (tergantung konfigurasi Row Level Security).

---

## 4. Rekomendasi Tindakan untuk Fase 1

1. **Hardening Middleware:**
   - Perbarui `isAdminRoute` menjadi `/rebo/admin(.*)`.
   - Tambahkan proteksi menyeluruh untuk `/api/(.*)` (hanya izinkan request berautentikasi atau webhook terverifikasi).
   - Pastikan fallback redirect mengarah secara tepat ke `/rebo/overview`.
2. **Refactoring API Routes ke Server Actions / Secured Handlers:**
   - Tambahkan verifikasi `const { userId, sessionClaims } = await auth()` pada setiap endpoint API.
   - Validasi peran (*role-based permission*): hanya koordinator/admin yang berhak mengubah status kelengkapan dan nilai akhir/skor pilar hasil.
3. **Eksekusi Pembersihan Legacy Template:**
   - Hapus `src/app/dashboard/product`, `src/app/dashboard/overview`, `src/features/products`, `src/features/overview`, dan `src/constants/mock-api.ts`.
   - Bersihkan navigasi di `src/constants/data.ts` dari entri `product`, `sales`, dan `todo/kanban` template.
4. **Pembersihan Lingkungan:**
   - Hapus `.husky/pre-push copy` dan file kosong `.husky/pre-push`.
   - Perbarui `env.example.txt` agar merefleksikan kebutuhan lingkungan REBO V2.

---
*Laporan ini disusun secara otomatis oleh Autonomous Subagent Fase 0 sebagai prasyarat eksekusi Fase 1 Playbook REBO V2.*
