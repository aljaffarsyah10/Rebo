-- Migration: Add kontak_pilar table and users contact columns for REBO V2 WhatsApp Notifications
-- Date: 2026-11-23

-- 1. Tabel kontak_pilar
CREATE TABLE IF NOT EXISTS public.kontak_pilar (
    id SERIAL PRIMARY KEY,
    id_pilar INT, -- 1 s/d 6 untuk Pilar ZI/RB, NULL untuk Admin/Verifikator umum
    kategori VARCHAR(50) NOT NULL DEFAULT 'pilar', -- 'pilar', 'verifikator', 'admin', 'tpi'
    nama_pilar VARCHAR(255),
    nama_pic VARCHAR(255) NOT NULL,
    jabatan VARCHAR(255),
    no_wa VARCHAR(50) NOT NULL,
    email VARCHAR(255),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indeks pencarian cepat
CREATE INDEX IF NOT EXISTS idx_kontak_pilar_id_pilar ON public.kontak_pilar(id_pilar) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_kontak_pilar_kategori ON public.kontak_pilar(kategori) WHERE is_active = true;

-- Helper trigger update timestamp jika fungsi update_updated_at_column ada
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS set_kontak_pilar_updated_at ON public.kontak_pilar;
        CREATE TRIGGER set_kontak_pilar_updated_at
            BEFORE UPDATE ON public.kontak_pilar
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Row Level Security (RLS)
ALTER TABLE public.kontak_pilar ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'kontak_pilar' AND policyname = 'Allow public read access on kontak_pilar'
    ) THEN
        CREATE POLICY "Allow public read access on kontak_pilar"
            ON public.kontak_pilar
            FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'kontak_pilar' AND policyname = 'Allow authenticated all on kontak_pilar'
    ) THEN
        CREATE POLICY "Allow authenticated all on kontak_pilar"
            ON public.kontak_pilar
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;

-- 2. Tabel users (pendukung profil pengguna & sinkronisasi kontak Clerk)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Clerk User ID
    email TEXT,
    full_name TEXT,
    no_wa TEXT,
    telepon TEXT,
    role TEXT,
    assigned_pilar_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS) untuk public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Allow public read access on users'
    ) THEN
        CREATE POLICY "Allow public read access on users"
            ON public.users
            FOR SELECT
            USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'users' AND policyname = 'Allow authenticated all on users'
    ) THEN
        CREATE POLICY "Allow authenticated all on users"
            ON public.users
            FOR ALL
            USING (true)
            WITH CHECK (true);
    END IF;
END $$;
