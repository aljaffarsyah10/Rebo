-- Migration: Add ZIAPP Sync Status and Tracking Columns to pertanyaan_periode
-- Date: 2026-11-24

ALTER TABLE IF EXISTS public.pertanyaan_periode
  ADD COLUMN IF NOT EXISTS ziapp_status TEXT DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS ziapp_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ziapp_synced_by TEXT;

-- Create index for faster querying of ZIAPP status
CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_ziapp_status ON public.pertanyaan_periode(ziapp_status);

-- Optional: Add column to legacy buktiDukung for fallback compatibility
ALTER TABLE IF EXISTS public."buktiDukung"
  ADD COLUMN IF NOT EXISTS ziapp_status TEXT DEFAULT 'DRAFT',
  ADD COLUMN IF NOT EXISTS ziapp_synced_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS ziapp_synced_by TEXT;
