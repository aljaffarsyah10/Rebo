-- ==============================================================================
-- REBO V2: Database Schema & Data Migration Script
-- Version: 2.0.0
-- Migration Date: 2026-11-21
-- Description:
--   1. Creates `periode_evaluasi` for multi-year evaluation management.
--   2. Creates `pertanyaan_periode` linking master questions with specific periods,
--      holding GDrive folder URLs, completeness status, self & verification scores, and notes.
--   3. Creates `dokumen_bukti` supporting multiple evidence document files per indicator.
--   4. Creates `audit_log` tracking state transitions, reviews, and edits.
--   5. Sets up Row Level Security (RLS) policies and triggers.
--   6. Seeds active period (2025/2026) and migrates existing V1 data (`pertanyaan` & `buktiDukung`).
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. Helper Function: update_updated_at_column
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 2. Table: periode_evaluasi
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.periode_evaluasi (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tahun INTEGER NOT NULL UNIQUE,
    nama_periode TEXT NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_locked BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for periode_evaluasi updated_at
DROP TRIGGER IF EXISTS trg_periode_evaluasi_updated_at ON public.periode_evaluasi;
CREATE TRIGGER trg_periode_evaluasi_updated_at
    BEFORE UPDATE ON public.periode_evaluasi
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ------------------------------------------------------------------------------
-- 3. Table: pertanyaan_periode
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.pertanyaan_periode (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_periode UUID NOT NULL REFERENCES public.periode_evaluasi(id) ON DELETE CASCADE,
    id_pertanyaan TEXT NOT NULL REFERENCES public.pertanyaan(id_pertanyaan) ON DELETE RESTRICT,
    id_kategori TEXT,
    gdrive_folder_id TEXT,
    gdrive_folder_url TEXT,
    status_kelengkapan INTEGER NOT NULL DEFAULT 0, -- 0: Belum Diisi, 1: Menunggu Review, 2: Disetujui, 3: Perlu Revisi
    nilai_mandiri NUMERIC NOT NULL DEFAULT 0,
    nilai_verifikasi NUMERIC NOT NULL DEFAULT 0,
    catatan_operator TEXT,
    catatan_koordinator TEXT,
    verified_by TEXT,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_pertanyaan_periode UNIQUE (id_periode, id_pertanyaan),
    CONSTRAINT chk_status_kelengkapan CHECK (status_kelengkapan IN (0, 1, 2, 3))
);

-- Trigger for pertanyaan_periode updated_at
DROP TRIGGER IF EXISTS trg_pertanyaan_periode_updated_at ON public.pertanyaan_periode;
CREATE TRIGGER trg_pertanyaan_periode_updated_at
    BEFORE UPDATE ON public.pertanyaan_periode
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Indexes for pertanyaan_periode
CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_id_periode ON public.pertanyaan_periode(id_periode);
CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_id_pertanyaan ON public.pertanyaan_periode(id_pertanyaan);
CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_status ON public.pertanyaan_periode(status_kelengkapan);

-- ------------------------------------------------------------------------------
-- 4. Table: dokumen_bukti
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.dokumen_bukti (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pertanyaan_periode UUID NOT NULL REFERENCES public.pertanyaan_periode(id) ON DELETE CASCADE,
    nama_dokumen TEXT NOT NULL,
    file_url TEXT NOT NULL,
    tipe_dokumen TEXT, -- e.g., 'Undangan', 'Notula', 'Daftar Hadir', 'Laporan', 'SK', 'Lainnya'
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for dokumen_bukti
CREATE INDEX IF NOT EXISTS idx_dokumen_bukti_pertanyaan_periode ON public.dokumen_bukti(id_pertanyaan_periode);

-- ------------------------------------------------------------------------------
-- 5. Table: audit_log
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pertanyaan_periode UUID REFERENCES public.pertanyaan_periode(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'SUBMIT_EVIDENCE', 'APPROVE', 'REVISE', 'UPDATE_SCORE', 'DELETE_EVIDENCE'
    old_state JSONB,
    new_state JSONB,
    user_id TEXT NOT NULL,
    user_name TEXT,
    role TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for audit_log
CREATE INDEX IF NOT EXISTS idx_audit_log_pertanyaan_periode ON public.audit_log(id_pertanyaan_periode);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

-- ------------------------------------------------------------------------------
-- 6. Row Level Security (RLS) Setup
-- ------------------------------------------------------------------------------
ALTER TABLE public.periode_evaluasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pertanyaan_periode ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dokumen_bukti ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- 6.1 Policies for periode_evaluasi
DROP POLICY IF EXISTS "Public / authenticated read on periode_evaluasi" ON public.periode_evaluasi;
CREATE POLICY "Public / authenticated read on periode_evaluasi"
    ON public.periode_evaluasi
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated insert/update on periode_evaluasi" ON public.periode_evaluasi;
CREATE POLICY "Authenticated insert/update on periode_evaluasi"
    ON public.periode_evaluasi
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6.2 Policies for pertanyaan_periode
DROP POLICY IF EXISTS "Public / authenticated read on pertanyaan_periode" ON public.pertanyaan_periode;
CREATE POLICY "Public / authenticated read on pertanyaan_periode"
    ON public.pertanyaan_periode
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated write on pertanyaan_periode" ON public.pertanyaan_periode;
CREATE POLICY "Authenticated write on pertanyaan_periode"
    ON public.pertanyaan_periode
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6.3 Policies for dokumen_bukti
DROP POLICY IF EXISTS "Public / authenticated read on dokumen_bukti" ON public.dokumen_bukti;
CREATE POLICY "Public / authenticated read on dokumen_bukti"
    ON public.dokumen_bukti
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Authenticated write on dokumen_bukti" ON public.dokumen_bukti;
CREATE POLICY "Authenticated write on dokumen_bukti"
    ON public.dokumen_bukti
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 6.4 Policies for audit_log (Append & Read only)
DROP POLICY IF EXISTS "Authenticated read on audit_log" ON public.audit_log;
CREATE POLICY "Authenticated read on audit_log"
    ON public.audit_log
    FOR SELECT
    TO authenticated
    USING (true);

DROP POLICY IF EXISTS "Authenticated append on audit_log" ON public.audit_log;
CREATE POLICY "Authenticated append on audit_log"
    ON public.audit_log
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- 7. Seed Initial Data & Migrate Legacy V1 Data
-- ------------------------------------------------------------------------------
DO $$
DECLARE
    v_periode_id UUID;
    v_row_count INTEGER;
BEGIN
    -- 7.1 Seed default evaluation period (Tahun 2025 / Evaluasi 2025/2026)
    INSERT INTO public.periode_evaluasi (tahun, nama_periode, is_active, is_locked)
    VALUES (2025, 'Evaluasi PMPRB 2025/2026', true, false)
    ON CONFLICT (tahun) DO UPDATE
    SET nama_periode = EXCLUDED.nama_periode,
        is_active = true
    RETURNING id INTO v_periode_id;

    RAISE NOTICE 'Periode Evaluasi 2025/2026 ID: %', v_periode_id;

    -- 7.2 Inisialisasi pertanyaan_periode dari tabel master pertanyaan untuk periode 2025
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pertanyaan') THEN
        INSERT INTO public.pertanyaan_periode (
            id_periode,
            id_pertanyaan,
            status_kelengkapan,
            nilai_mandiri,
            nilai_verifikasi
        )
        SELECT
            v_periode_id,
            p.id_pertanyaan,
            0 AS status_kelengkapan,
            0 AS nilai_mandiri,
            0 AS nilai_verifikasi
        FROM public.pertanyaan p
        ON CONFLICT (id_periode, id_pertanyaan) DO NOTHING;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        RAISE NOTICE 'Inserted % pertanyaan records into pertanyaan_periode for active period.', v_row_count;
    END IF;

    -- 7.3 Migrasi data eksisting dari buktiDukung ke pertanyaan_periode & dokumen_bukti
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buktiDukung') THEN
        -- Update pertanyaan_periode dengan data yang sudah pernah diisi pada buktiDukung V1
        UPDATE public.pertanyaan_periode pp
        SET
            id_kategori = bd.id_kategori,
            status_kelengkapan = COALESCE(
                CASE
                    -- Jika status_kelengkapan bertipe integer/numeric
                    WHEN bd.status_kelengkapan::text IN ('0', '1', '2', '3') THEN bd.status_kelengkapan::text::integer
                    -- Jika status berbentuk teks pada field status / status_kelengkapan
                    WHEN LOWER(COALESCE(bd.status_kelengkapan::text, '')) LIKE '%disetujui%' OR LOWER(COALESCE(bd.status::text, '')) LIKE '%disetujui%' THEN 2
                    WHEN LOWER(COALESCE(bd.status_kelengkapan::text, '')) LIKE '%menunggu%' OR LOWER(COALESCE(bd.status_kelengkapan::text, '')) LIKE '%dikirim%' OR LOWER(COALESCE(bd.status::text, '')) LIKE '%dikirim%' THEN 1
                    WHEN LOWER(COALESCE(bd.status_kelengkapan::text, '')) LIKE '%revisi%' OR LOWER(COALESCE(bd.status_kelengkapan::text, '')) LIKE '%tolak%' OR LOWER(COALESCE(bd.status::text, '')) LIKE '%tolak%' THEN 3
                    ELSE 0
                END, 0),
            nilai_mandiri = COALESCE(bd.nilai_akhir, 0),
            catatan_operator = COALESCE(bd.catatan_user, NULL),
            catatan_koordinator = COALESCE(bd.catatan_koordinator, NULL),
            updated_at = COALESCE(bd.updated_at, NOW())
        FROM public.buktiDukung bd
        WHERE pp.id_pertanyaan = bd.id_pertanyaan
          AND pp.id_periode = v_periode_id;

        RAISE NOTICE 'Updated pertanyaan_periode records from legacy buktiDukung.';

        -- Migrasi file link_bukti lama ke tabel dokumen_bukti
        INSERT INTO public.dokumen_bukti (
            id_pertanyaan_periode,
            nama_dokumen,
            file_url,
            tipe_dokumen,
            uploaded_by,
            uploaded_at
        )
        SELECT
            pp.id AS id_pertanyaan_periode,
            'Bukti Dukung Utama' AS nama_dokumen,
            bd.link_bukti AS file_url,
            'Tautan Dokumen' AS tipe_dokumen,
            'Sistem Migrasi V1' AS uploaded_by,
            COALESCE(bd.created_at, NOW()) AS uploaded_at
        FROM public.buktiDukung bd
        JOIN public.pertanyaan_periode pp
          ON pp.id_pertanyaan = bd.id_pertanyaan
         AND pp.id_periode = v_periode_id
        WHERE bd.link_bukti IS NOT NULL
          AND TRIM(bd.link_bukti) <> ''
          AND NOT EXISTS (
              SELECT 1 FROM public.dokumen_bukti db
              WHERE db.id_pertanyaan_periode = pp.id
                AND db.file_url = bd.link_bukti
          );

        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        RAISE NOTICE 'Migrated % legacy buktiDukung links to dokumen_bukti.', v_row_count;
    END IF;

    -- Catat initial seed ke audit_log
    INSERT INTO public.audit_log (
        action,
        new_state,
        user_id,
        user_name,
        role
    )
    VALUES (
        'MIGRATION_V2_INITIALIZED',
        jsonb_build_object('periode_id', v_periode_id, 'tahun', 2025, 'status', 'SUCCESS'),
        'SYSTEM_MIGRATION',
        'Migration Script V2',
        'admin'
    );

END $$;
