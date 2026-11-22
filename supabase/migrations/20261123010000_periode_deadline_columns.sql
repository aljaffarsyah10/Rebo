-- ==============================================================================
-- REBO V2: Add tanggal_mulai & tanggal_selesai to periode_evaluasi
-- ==============================================================================

ALTER TABLE public.periode_evaluasi
ADD COLUMN IF NOT EXISTS tanggal_mulai DATE,
ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;

UPDATE public.periode_evaluasi
SET tanggal_mulai = (tahun || '-01-01')::date,
    tanggal_selesai = (tahun || '-12-31')::date
WHERE tanggal_selesai IS NULL;
