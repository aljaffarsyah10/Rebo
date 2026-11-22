# 🗄️ DOKUMENTASI BACKUP DATABASE & PANDUAN ROLLBACK REBO

Dokumen ini memuat informasi arsip snapshot database live Supabase serta prosedur eksekusi migrasi V2 dan rollback ke V1.

---

## 1. Informasi Snapshot Backup Hari Ini

- **Tanggal Backup**: 22 November 2026
- **Sumber Database**: `https://tvsieplcwiyrsnnmsrde.supabase.co`
- **Direktori Berkas**: `supabase/backups/backup_20261122_supabase/`
  1. **`backup_data.json`**: Dump terstruktur dalam format JSON berisi metadata dan seluruh baris data.
  2. **`backup_v1_restore.sql`**: Dump SQL `INSERT INTO ...` untuk pemulihan instan ke PostgreSQL/Supabase.

### 📊 Rincian Baris Data yang Berhasil Dibackup:

| Nama Tabel | Jumlah Baris | Keterangan Data |
|---|---|---|
| `public.area` | **2 baris** | Area Pemenuhan & Area Reform |
| `public.pilar` | **12 baris** | Pilar 1 s.d. 6 untuk masing-masing area |
| `public.subpilar` | **42 baris** | Seluruh subpilar pemenuhan & reformasi birokrasi |
| `public.pertanyaan` | **110 baris** | Seluruh instrumen indikator pertanyaan LKE |
| `public.kategoriPenilaian` | **378 baris** | Opsi jawaban penilaian mandiri & skor bobot indikator |
| `public.statusBukti` | **4 baris** | Master status kelengkapan bukti (0 s.d. 3) |
| `public.buktiDukung` | **110 baris** | Data isian link bukti, nilai akhir, & status saat ini |
| `public.pilarHasil` | **2 baris** | Skor capaian Aspek Hasil (Survei Persepsi Korupsi & Pelayanan) |

---

## 2. Cara Menjalankan Backup Ulang Sewaktu-waktu

Aplikasi telah dilengkapi dengan script mandiri:
```powershell
node scripts/backup_supabase.js
```
Script akan otomatis membaca kredensial dari `.env.local` dan memperbarui berkas JSON serta SQL restore.

---

## 3. Cara Menerapkan Migrasi V2 di Supabase

Jika Anda ingin mengaktifkan fitur V2 (Multi-periode, Multi-dokumen bukti, Audit log, dan Arsip digital):
1. Buka [dashboard.supabase.com](https://supabase.com/dashboard) -> Masuk ke project Anda.
2. Buka menu **SQL Editor**.
3. Buka file [20261121000000_rebo_v2_schema.sql](../migrations/20261121000000_rebo_v2_schema.sql), salin seluruh isinya, lalu klik **Run**.
4. Buka file [20261121000001_arsip_dokumen.sql](../migrations/20261121000001_arsip_dokumen.sql), salin seluruh isinya, lalu klik **Run**.

---

## 4. Cara Melakukan Rollback ke V1 (Jika Dibutuhkan)

Jika setelah migrasi V2 Anda ingin membatalkan dan mengembalikan skema database ke kondisi V1 murni:
1. Buka **SQL Editor** di Supabase Dashboard.
2. Buka file [20261122000000_rollback_v2_to_v1.sql](../migrations/20261122000000_rollback_v2_to_v1.sql).
3. Salin seluruh kodenya, lalu klik **Run**.
   - Perintah ini akan menghapus tabel `pertanyaan_periode`, `dokumen_bukti`, `audit_log`, `periode_evaluasi`, dan `arsip_dokumen`.
   - **Tabel asli V1 (`area`, `pilar`, `subpilar`, `pertanyaan`, `kategoriPenilaian`, `buktiDukung`, `pilarHasil`) tetap aman dan tidak terhapus.**

---

## 5. Cara Memulihkan Data Asli dari File Backup SQL

Jika sewaktu-waktu terjadi kesalahan data dan Anda ingin mengembalikan isi data ke kondisi hari ini:
1. Buka **SQL Editor** di Supabase.
2. Buka file `supabase/backups/backup_20261122_supabase/backup_v1_restore.sql`.
3. Jalankan script tersebut. Perintah menggunakan `ON CONFLICT DO NOTHING;` sehingga aman dari duplikasi.
