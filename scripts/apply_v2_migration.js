const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
  }
  throw new Error('DATABASE_URL not found in environment or .env.local');
}

async function runMigration() {
  const connectionString = getConnectionString();

  console.log('Connecting to PostgreSQL database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected successfully!');

  const migrationSql = `
    -- Enable extensions
    CREATE EXTENSION IF NOT EXISTS "pgcrypto";

    -- Helper Function: update_updated_at_column
    CREATE OR REPLACE FUNCTION update_updated_at_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    -- 1. Table: periode_evaluasi
    CREATE TABLE IF NOT EXISTS public.periode_evaluasi (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tahun INTEGER NOT NULL UNIQUE,
        nama_periode TEXT NOT NULL,
        is_active BOOLEAN NOT NULL DEFAULT false,
        is_locked BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    DROP TRIGGER IF EXISTS trg_periode_evaluasi_updated_at ON public.periode_evaluasi;
    CREATE TRIGGER trg_periode_evaluasi_updated_at
        BEFORE UPDATE ON public.periode_evaluasi
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    -- 2. Table: pertanyaan_periode
    CREATE TABLE IF NOT EXISTS public.pertanyaan_periode (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_periode UUID NOT NULL REFERENCES public.periode_evaluasi(id) ON DELETE CASCADE,
        id_pertanyaan BIGINT NOT NULL REFERENCES public.pertanyaan(id_pertanyaan) ON DELETE RESTRICT,
        id_kategori BIGINT,
        gdrive_folder_id TEXT,
        gdrive_folder_url TEXT,
        status_kelengkapan INTEGER NOT NULL DEFAULT 0,
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

    DROP TRIGGER IF EXISTS trg_pertanyaan_periode_updated_at ON public.pertanyaan_periode;
    CREATE TRIGGER trg_pertanyaan_periode_updated_at
        BEFORE UPDATE ON public.pertanyaan_periode
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();

    CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_id_periode ON public.pertanyaan_periode(id_periode);
    CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_id_pertanyaan ON public.pertanyaan_periode(id_pertanyaan);
    CREATE INDEX IF NOT EXISTS idx_pertanyaan_periode_status ON public.pertanyaan_periode(status_kelengkapan);

    -- 3. Table: dokumen_bukti
    CREATE TABLE IF NOT EXISTS public.dokumen_bukti (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_pertanyaan_periode UUID NOT NULL REFERENCES public.pertanyaan_periode(id) ON DELETE CASCADE,
        nama_dokumen TEXT NOT NULL,
        file_url TEXT NOT NULL,
        tipe_dokumen TEXT,
        uploaded_by TEXT NOT NULL,
        uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_dokumen_bukti_pertanyaan_periode ON public.dokumen_bukti(id_pertanyaan_periode);

    -- 4. Table: audit_log
    CREATE TABLE IF NOT EXISTS public.audit_log (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        id_pertanyaan_periode UUID REFERENCES public.pertanyaan_periode(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        old_state JSONB,
        new_state JSONB,
        user_id TEXT NOT NULL,
        user_name TEXT,
        role TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_audit_log_pertanyaan_periode ON public.audit_log(id_pertanyaan_periode);
    CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON public.audit_log(user_id);

    -- 5. Table: arsip_dokumen
    CREATE TABLE IF NOT EXISTS public.arsip_dokumen (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        judul_dokumen TEXT NOT NULL,
        kategori TEXT NOT NULL,
        tahun INTEGER NOT NULL,
        file_url TEXT NOT NULL,
        nomor_surat TEXT,
        keterangan TEXT,
        uploaded_by TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_tahun ON public.arsip_dokumen(tahun DESC);
    CREATE INDEX IF NOT EXISTS idx_arsip_dokumen_kategori ON public.arsip_dokumen(kategori);

    -- Row Level Security (RLS) & Policies
    ALTER TABLE public.periode_evaluasi ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.pertanyaan_periode ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.dokumen_bukti ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.arsip_dokumen ENABLE ROW LEVEL SECURITY;

    -- Policies: Allow read & write for public/anon/authenticated
    DO $$
    DECLARE
        tbl text;
    BEGIN
        FOR tbl IN SELECT unnest(ARRAY['periode_evaluasi', 'pertanyaan_periode', 'dokumen_bukti', 'audit_log', 'arsip_dokumen']) LOOP
            EXECUTE format('DROP POLICY IF EXISTS "allow_all_on_%s" ON public.%I', tbl, tbl);
            EXECUTE format('CREATE POLICY "allow_all_on_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', tbl, tbl);
        END LOOP;
    END $$;

    -- Seed Initial Periods: 2025 and 2026
    INSERT INTO public.periode_evaluasi (tahun, nama_periode, is_active, is_locked)
    VALUES (2025, 'Evaluasi PMPRB 2025', false, true)
    ON CONFLICT (tahun) DO NOTHING;

    INSERT INTO public.periode_evaluasi (tahun, nama_periode, is_active, is_locked)
    VALUES (2026, 'Evaluasi PMPRB 2026', true, false)
    ON CONFLICT (tahun) DO UPDATE SET is_active = true;

    -- Seed pertanyaan_periode for active period (2026) and 2025
    DO $$
    DECLARE
        v_p2026 UUID;
        v_p2025 UUID;
    BEGIN
        SELECT id INTO v_p2026 FROM public.periode_evaluasi WHERE tahun = 2026 LIMIT 1;
        SELECT id INTO v_p2025 FROM public.periode_evaluasi WHERE tahun = 2025 LIMIT 1;

        -- Populate 2026
        INSERT INTO public.pertanyaan_periode (id_periode, id_pertanyaan, status_kelengkapan, nilai_mandiri, nilai_verifikasi)
        SELECT v_p2026, p.id_pertanyaan, 0, 0, 0
        FROM public.pertanyaan p
        ON CONFLICT (id_periode, id_pertanyaan) DO NOTHING;

        -- Populate 2025
        INSERT INTO public.pertanyaan_periode (id_periode, id_pertanyaan, status_kelengkapan, nilai_mandiri, nilai_verifikasi)
        SELECT v_p2025, p.id_pertanyaan, 0, 0, 0
        FROM public.pertanyaan p
        ON CONFLICT (id_periode, id_pertanyaan) DO NOTHING;

        -- Migrate legacy buktiDukung to 2025
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'buktiDukung') THEN
            UPDATE public.pertanyaan_periode pp
            SET
                id_kategori = bd.id_kategori,
                status_kelengkapan = COALESCE(bd.status_kelengkapan, 0),
                nilai_mandiri = COALESCE(bd.nilai_akhir, 0),
                catatan_operator = bd.catatan_user,
                catatan_koordinator = bd.catatan_koordinator
            FROM public."buktiDukung" bd
            WHERE pp.id_pertanyaan = bd.id_pertanyaan
              AND pp.id_periode = v_p2025;

            -- Migrate links to dokumen_bukti
            INSERT INTO public.dokumen_bukti (id_pertanyaan_periode, nama_dokumen, file_url, tipe_dokumen, uploaded_by, uploaded_at)
            SELECT
                pp.id,
                'Bukti Dukung Utama',
                bd.link_bukti,
                'Tautan Dokumen',
                'Migrasi V1',
                COALESCE(bd.created_at, NOW())
            FROM public."buktiDukung" bd
            JOIN public.pertanyaan_periode pp ON pp.id_pertanyaan = bd.id_pertanyaan AND pp.id_periode = v_p2025
            WHERE bd.link_bukti IS NOT NULL AND TRIM(bd.link_bukti) <> '';
        END IF;

        -- Log migration in audit_log
        INSERT INTO public.audit_log (action, new_state, user_id, user_name, role)
        VALUES ('MIGRATION_V2_APPLIED', jsonb_build_object('status', 'SUCCESS', 'timestamp', NOW()), 'SYSTEM', 'Antigravity Migrator', 'SUPER_ADMIN');
    END $$;
  `;

  console.log('Executing V2 migration SQL...');
  await client.query(migrationSql);
  console.log('Migration executed successfully!');

  // Verify created tables
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name;
  `);
  console.log('Updated public tables in Supabase:');
  console.log(res.rows.map((r) => '  - ' + r.table_name).join('\n'));

  // Verify periode_evaluasi rows
  const periods = await client.query(
    'SELECT id, tahun, nama_periode, is_active, is_locked FROM public.periode_evaluasi ORDER BY tahun;'
  );
  console.log('Seed Periode Evaluasi:', periods.rows);

  // Verify pertanyaan_periode count
  const ppCount = await client.query(
    'SELECT count(*) FROM public.pertanyaan_periode;'
  );
  console.log('Total pertanyaan_periode count:', ppCount.rows[0].count);

  await client.end();
  console.log('Connection closed.');
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
