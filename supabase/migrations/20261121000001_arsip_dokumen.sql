-- ==============================================================================
-- REBO V2: Database Schema for Dynamic Digital Archive (Arsip Digital)
-- Version: 2.0.1
-- Migration Date: 2026-11-21
-- Description:
--   Creates table `arsip_dokumen` for managing official ZI documentation:
--   SK Tim Kerja, Rencana Aksi, SOP Inovasi Layanan, LKE/LHE Resmi, and Pedoman.
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.arsip_dokumen (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul_dokumen TEXT NOT NULL,
    kategori TEXT NOT NULL, -- 'SK_TIM', 'RENCANA_AKSI', 'SOP_INOVASI', 'LKE_RESMI', 'PEDOMAN'
    tahun INTEGER NOT NULL,
    file_url TEXT NOT NULL,
    nomor_surat TEXT,
    keterangan TEXT,
    uploaded_by TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for efficient filtering
CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_tahun ON public.arsip_dokumen(tahun DESC);
CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_kategori ON public.arsip_dokumen(kategori);
CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_created_at ON public.arsip_dokumen(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.arsip_dokumen ENABLE ROW LEVEL SECURITY;

-- 1. Everyone (public & authenticated) can view archive documents
DROP POLICY IF EXISTS "Public / authenticated read on arsip_dokumen" ON public.arsip_dokumen;
CREATE POLICY "Public / authenticated read on arsip_dokumen"
    ON public.arsip_dokumen
    FOR SELECT
    USING (true);

-- 2. Authenticated users can insert/update/delete (further restricted to admin at application layer)
DROP POLICY IF EXISTS "Authenticated write on arsip_dokumen" ON public.arsip_dokumen;
CREATE POLICY "Authenticated write on arsip_dokumen"
    ON public.arsip_dokumen
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
