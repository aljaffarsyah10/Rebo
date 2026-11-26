-- Migration: Tabel wa_auth_session untuk penyimpanan sesi Baileys WhatsApp Gateway secara persisten di Supabase
-- Mencegah keharusan scan QR ulang saat container Render melakukan restart / spin-down

CREATE TABLE IF NOT EXISTS public.wa_auth_session (
    id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk monitoring atau pembersihan sesi berdasarkan waktu pembaruan
CREATE INDEX IF NOT EXISTS idx_wa_auth_session_updated_at
    ON public.wa_auth_session (updated_at);

-- Enable Row Level Security (hanya service_role yang boleh mengakses kredensial sesi WhatsApp)
ALTER TABLE public.wa_auth_session ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename = 'wa_auth_session'
          AND policyname = 'Allow service_role full access to wa_auth_session'
    ) THEN
        CREATE POLICY "Allow service_role full access to wa_auth_session"
            ON public.wa_auth_session
            FOR ALL
            TO service_role
            USING (true)
            WITH CHECK (true);
    END IF;
END
$$;
