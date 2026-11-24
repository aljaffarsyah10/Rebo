-- Migration: Add User Profile Preferences and Worker-Tracking Columns
-- Date: 2026-11-24
-- Description:
--   1. Ensures public.users has columns for WhatsApp contact, assigned pilar_tugas, and notification toggles.
--   2. Adds worker-tracking columns to public.dokumen_bukti and public.pertanyaan_periode.

-- 1. Tabel users: Tambah kolom preferensi notifikasi dan pilar tugas
ALTER TABLE IF EXISTS public.users
    ADD COLUMN IF NOT EXISTS no_wa VARCHAR(50),
    ADD COLUMN IF NOT EXISTS pilar_tugas INT,
    ADD COLUMN IF NOT EXISTS notif_wa_approval BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS notif_wa_revision BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS notif_wa_deadline BOOLEAN NOT NULL DEFAULT true;

-- Index pencarian pengguna per pilar tugas
CREATE INDEX IF NOT EXISTS idx_users_pilar_tugas ON public.users(pilar_tugas);

-- 2. Tabel dokumen_bukti: Worker-tracking (perekam identitas & kontak pengunggah bukti dukung)
ALTER TABLE IF EXISTS public.dokumen_bukti
    ADD COLUMN IF NOT EXISTS submitted_by_user_id TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by_name TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_dokumen_bukti_submitted_by_user ON public.dokumen_bukti(submitted_by_user_id);

-- 3. Tabel pertanyaan_periode: Worker-tracking indikator aktif
ALTER TABLE IF EXISTS public.pertanyaan_periode
    ADD COLUMN IF NOT EXISTS submitted_by_user_id TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by_name TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_submitted_by_user ON public.pertanyaan_periode(submitted_by_user_id);

-- 4. Tabel legacy buktiDukung: Tambah kolom fallback kompatibilitas
ALTER TABLE IF EXISTS public."buktiDukung"
    ADD COLUMN IF NOT EXISTS submitted_by_user_id TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by_name TEXT,
    ADD COLUMN IF NOT EXISTS submitted_by_phone TEXT;
