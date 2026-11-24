-- ==============================================================================
-- REBO V2: Add tanggal_cutoff to periode_evaluasi (Cutoff Date & Auto-Lock)
-- ==============================================================================

ALTER TABLE public.periode_evaluasi
ADD COLUMN IF NOT EXISTS tanggal_cutoff DATE;

-- Comment for documentation
COMMENT ON COLUMN public.periode_evaluasi.tanggal_cutoff IS 'Batas akhir pengisian penilaian mandiri LKE; setelah tanggal ini periode otomatis terkunci (read-only)';
