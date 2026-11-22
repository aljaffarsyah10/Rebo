-- ==============================================================================
-- ROLLBACK MIGRATION: REBO V2 -> REBO V1
-- File: supabase/migrations/20261122000000_rollback_v2_to_v1.sql
-- Purpose:
--   Membatalkan seluruh perubahan skema V2 dan mengembalikan struktur database
--   ke kondisi V1 murni tanpa menghapus data tabel eksisting (area, pilar,
--   subpilar, pertanyaan, kategoriPenilaian, buktiDukung, statusBukti, pilarHasil).
-- ==============================================================================

BEGIN;

-- 1. Hapus Tabel-Tabel Baru V2 (secara berurutan berdasarkan relasi FK)
DROP TABLE IF EXISTS public.audit_log CASCADE;
DROP TABLE IF EXISTS public.dokumen_bukti CASCADE;
DROP TABLE IF EXISTS public.pertanyaan_periode CASCADE;
DROP TABLE IF EXISTS public.periode_evaluasi CASCADE;
DROP TABLE IF EXISTS public.arsip_dokumen CASCADE;

-- 2. Hapus Trigger dan Fungsi Otomatis V2
DROP TRIGGER IF EXISTS tr_pertanyaan_periode_updated_at ON public.pertanyaan_periode;
DROP TRIGGER IF EXISTS tr_periode_evaluasi_updated_at ON public.periode_evaluasi;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

-- 3. Verifikasi Keutuhan Tabel V1 Asli
-- Tabel berikut tetap utuh 100% dan tidak dimodifikasi:
-- - public.area
-- - public.pilar
-- - public.subpilar
-- - public.pertanyaan
-- - public.kategoriPenilaian
-- - public.statusBukti
-- - public.buktiDukung
-- - public.pilarHasil

COMMIT;
