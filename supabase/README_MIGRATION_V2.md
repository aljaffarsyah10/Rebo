# Panduan Migrasi Database REBO V2 (PostgreSQL / Supabase)

Dokumen ini menjelaskan rancangan, struktur tabel baru, langkah eksekusi, serta verifikasi migrasi database REBO dari arsitektur V1 ke **REBO V2**.

---

## 1. Ikhtisar Perubahan Skema (V1 ke V2)

Pada arsitektur V1, pengisian bukti dukung dan penilaian terikat langsung pada tabel master pertanyaan secara statis (1 pertanyaan = 1 record `buktiDukung` dengan 1 kolom `link_bukti`). Hal ini menyebabkan data tahun-tahun sebelumnya tertimpa ketika evaluasi baru dimulai dan membatasi staf hanya bisa melampirkan 1 tautan file.

Pada **REBO V2**, skema dirombak menjadi:
1. **`periode_evaluasi`**: Mendukung multi-tahun evaluasi PMPRB (misal: 2024, 2025, 2026) dengan status aktif (`is_active`) dan penguncian evaluasi (`is_locked`).
2. **`pertanyaan_periode`**: Menjadi tabel operasional utama per periode tahun evaluasi. Menghubungkan master pertanyaan dengan periode aktif, menyimpan ID dan URL folder Google Drive khusus indikator, status kelengkapan (0, 1, 2, 3), nilai mandiri & verifikasi, serta catatan operator dan koordinator.
3. **`dokumen_bukti`**: Mendukung pelampiran **multi-dokumen file** (misal: Undangan, Notula, Daftar Hadir, Laporan, SK) per indikator pada periode bersangkutan.
4. **`audit_log`**: Mencatat riwayat setiap perubahan status pengisian, persetujuan, revisi, dan pembaruan skor untuk akuntabilitas.
5. **RLS (Row Level Security)**: Mengamankan akses baca (read) dan tulis (write) berdasarkan autentikasi dan peran pengguna.

---

## 2. Lokasi File Migrasi

File migrasi SQL lengkap terletak di:
```text
supabase/migrations/20261121000000_rebo_v2_schema.sql
```

---

## 3. Cara Menjalankan Migrasi

### Metode A: Melalui Supabase Web Dashboard (Direkomendasikan)
1. Buka dashboard proyek Supabase Anda: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Pilih proyek REBO.
3. Buka menu **SQL Editor** pada sidebar kiri.
4. Klik **New Query**.
5. Salin seluruh isi dari file `supabase/migrations/20261121000000_rebo_v2_schema.sql`.
6. Tempelkan ke SQL Editor dan klik tombol **Run** (atau tekan `Ctrl+Enter`).
7. Periksa panel hasil di bawah; pastikan muncul pesan sukses dan `NOTICE` migrasi data lama.

### Metode B: Melalui Supabase CLI
Jika Anda mengelola proyek menggunakan Supabase CLI:
```bash
# Pastikan sudah login dan link ke proyek Supabase
supabase link --project-ref <PROJECT_ID>

# Jalankan migrasi
supabase db push
```

---

## 4. Rincian Tabel Baru & Kamus Data

### 4.1 Tabel `periode_evaluasi`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `UUID` (PK) | Default `gen_random_uuid()` |
| `tahun` | `INTEGER` | Unik (misal: 2025, 2026) |
| `nama_periode` | `TEXT` | Nama deskriptif periode, e.g. `Evaluasi PMPRB 2025/2026` |
| `is_active` | `BOOLEAN` | Menandai periode evaluasi yang sedang berjalan |
| `is_locked` | `BOOLEAN` | Jika `true`, periode terkunci untuk pengeditan |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | Timestamp pembuatan dan modifikasi |

### 4.2 Tabel `pertanyaan_periode`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `UUID` (PK) | Default `gen_random_uuid()` |
| `id_periode` | `UUID` (FK) | Relasi ke `periode_evaluasi(id)` ON DELETE CASCADE |
| `id_pertanyaan` | `TEXT` (FK) | Relasi ke `pertanyaan(id_pertanyaan)` ON DELETE RESTRICT |
| `id_kategori` | `TEXT` | Opsi penilaian terpilih |
| `gdrive_folder_id` | `TEXT` | ID folder Google Drive indikator |
| `gdrive_folder_url` | `TEXT` | URL folder Google Drive indikator |
| `status_kelengkapan` | `INTEGER` | 0=Belum Diisi, 1=Menunggu Review, 2=Disetujui, 3=Perlu Revisi |
| `nilai_mandiri` | `NUMERIC` | Skor penilaian mandiri operator |
| `nilai_verifikasi` | `NUMERIC` | Skor hasil verifikasi koordinator/TPI |
| `catatan_operator` | `TEXT` | Catatan/keterangan dari tim pilar |
| `catatan_koordinator` | `TEXT` | Catatan feedback/evaluasi verifikator |
| `verified_by` | `TEXT` | User verifikator |
| `verified_at` | `TIMESTAMPTZ` | Waktu verifikasi |
| `created_at` / `updated_at` | `TIMESTAMPTZ` | Timestamp audit |

### 4.3 Tabel `dokumen_bukti`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `UUID` (PK) | Default `gen_random_uuid()` |
| `id_pertanyaan_periode` | `UUID` (FK) | Relasi ke `pertanyaan_periode(id)` ON DELETE CASCADE |
| `nama_dokumen` | `TEXT` | Contoh: "Undangan Rapat", "Notula", "Daftar Hadir" |
| `file_url` | `TEXT` | Tautan spesifik file Google Drive |
| `tipe_dokumen` | `TEXT` | Kategori berkas |
| `uploaded_by` | `TEXT` | User/nama pengunggah |
| `uploaded_at` | `TIMESTAMPTZ` | Waktu unggah |

### 4.4 Tabel `audit_log`
| Kolom | Tipe Data | Keterangan |
|---|---|---|
| `id` | `UUID` (PK) | Default `gen_random_uuid()` |
| `id_pertanyaan_periode` | `UUID` (FK) | Relasi ke pertanyaan periode terkait |
| `action` | `TEXT` | Aksi (SUBMIT_EVIDENCE, APPROVE, REVISE, dsb) |
| `old_state` | `JSONB` | Snapshot nilai sebelum diubah |
| `new_state` | `JSONB` | Snapshot nilai sesudah diubah |
| `user_id` | `TEXT` | ID pengguna pembuat aksi |
| `user_name` | `TEXT` | Nama pengguna pembuat aksi |
| `role` | `TEXT` | Peran pengguna (admin, koordinator, operator, tpi) |
| `created_at` | `TIMESTAMPTZ` | Waktu aksi |

---

## 5. Query Verifikasi Pasca Migrasi

Jalankan query verifikasi berikut di Supabase SQL Editor untuk memastikan migrasi berhasil dan data terisi dengan benar:

```sql
-- 1. Cek tabel periode evaluasi
SELECT * FROM public.periode_evaluasi;

-- 2. Cek total indikator pertanyaan yang terinisialisasi pada periode 2025
SELECT
    pe.tahun,
    pe.nama_periode,
    COUNT(pp.id) AS total_pertanyaan,
    COUNT(CASE WHEN pp.status_kelengkapan > 0 THEN 1 END) AS sudah_diisi,
    COUNT(CASE WHEN pp.status_kelengkapan = 2 THEN 1 END) AS disetujui
FROM public.periode_evaluasi pe
LEFT JOIN public.pertanyaan_periode pp ON pp.id_periode = pe.id
GROUP BY pe.tahun, pe.nama_periode;

-- 3. Cek sampel dokumen bukti yang termigrasi dari V1
SELECT
    pp.id_pertanyaan,
    db.nama_dokumen,
    db.file_url,
    db.uploaded_by,
    db.uploaded_at
FROM public.dokumen_bukti db
JOIN public.pertanyaan_periode pp ON pp.id = db.id_pertanyaan_periode
LIMIT 10;

-- 4. Cek audit log awal
SELECT * FROM public.audit_log ORDER BY created_at DESC LIMIT 5;
```

---

## 6. Penanganan Backward Compatibility
- Aplikasi REBO V2 di `src/lib/api/rebo.ts` telah dilengkapi mekanisme **fallback adaptif**: jika tabel V2 belum dibuat atau belum terisi di lingkungan database tertentu, fungsi API secara otomatis membaca data dari tabel `buktiDukung` lama.
- Selama masa transisi, data di tabel `buktiDukung` lama tetap utuh dan tidak dihapus (*zero data loss*).
