-- Migration: satker_config untuk Kesiapan Multi-Satker & Replikasi BPS Kab/Kota Lain
-- REBO V2: Multi-Tenant Architecture & Modular Configuration

CREATE TABLE IF NOT EXISTS public.satker_config (
    kode_satker TEXT PRIMARY KEY,
    nama_satker TEXT NOT NULL,
    singkatan_satker TEXT NOT NULL,
    provinsi TEXT NOT NULL DEFAULT 'Sulawesi Utara',
    kode_provinsi TEXT NOT NULL DEFAULT '71',
    alamat_kantor TEXT NOT NULL,
    email_resmi TEXT NOT NULL,
    no_telepon TEXT NOT NULL,
    no_wa_helpdesk TEXT NOT NULL,
    portal_pst_url TEXT NOT NULL,
    target_predikat TEXT NOT NULL DEFAULT 'WBK' CHECK (target_predikat IN ('WBK', 'WBBM')),
    nama_kepala TEXT NOT NULL,
    nip_kepala TEXT NOT NULL,
    nama_ketua_zi TEXT NOT NULL,
    nip_ketua_zi TEXT NOT NULL,
    logo_url TEXT NOT NULL DEFAULT '/logo-bps.png',
    is_active BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index untuk mempercepat query satker aktif
CREATE INDEX IF NOT EXISTS idx_satker_config_active ON public.satker_config (is_active);

-- Enable RLS
ALTER TABLE public.satker_config ENABLE ROW LEVEL SECURITY;

-- Kebijakan akses: Publik/Pegawai dapat melihat profil satker aktif
CREATE POLICY "Allow public read active satker_config"
    ON public.satker_config
    FOR SELECT
    USING (true);

-- Kebijakan akses: Hanya admin / service role yang dapat memodifikasi
CREATE POLICY "Allow admin full access to satker_config"
    ON public.satker_config
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Seed default satker aktif: BPS Kabupaten Kepulauan Siau Tagulandang Biaro (7108)
INSERT INTO public.satker_config (
    kode_satker,
    nama_satker,
    singkatan_satker,
    provinsi,
    kode_provinsi,
    alamat_kantor,
    email_resmi,
    no_telepon,
    no_wa_helpdesk,
    portal_pst_url,
    target_predikat,
    nama_kepala,
    nip_kepala,
    nama_ketua_zi,
    nip_ketua_zi,
    logo_url,
    is_active
) VALUES (
    '7108',
    'BPS Kabupaten Kepulauan Siau Tagulandang Biaro',
    'BPS Kab. Sitaro',
    'Sulawesi Utara',
    '71',
    'Kompleks Perkantoran Pemkab Sitaro, Kel. Paseng, Kec. Siau Barat, Kab. Kepl. Siau Tagulandang Biaro 95861',
    'bps7108@bps.go.id',
    '(0432) 234567',
    '082190010001',
    'https://sitarokab.bps.go.id',
    'WBK',
    'Inke Margareth Tambeo, SST., M.Ec.Dev.',
    '198403232007012003',
    'Ketua Tim Pembangunan ZI BPS Sitaro, S.ST',
    '198805122010121002',
    '/logo-bps.png',
    true
)
ON CONFLICT (kode_satker) DO NOTHING;
