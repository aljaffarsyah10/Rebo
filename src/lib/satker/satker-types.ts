/**
 * Tipe Data dan Model Konfigurasi Satker Modular REBO V2
 * Multi-Tenant Architecture & Replikasi Lintas BPS Kabupaten/Kota (Sulut & Nasional)
 */

export type TargetPredikat = 'WBK' | 'WBBM';

export interface SatkerConfig {
  kode_satker: string;
  nama_satker: string;
  singkatan_satker: string;
  provinsi: string;
  kode_provinsi: string;
  alamat_kantor: string;
  email_resmi: string;
  no_telepon: string;
  no_wa_helpdesk: string;
  portal_pst_url: string;
  target_predikat: TargetPredikat;
  nama_kepala: string;
  nip_kepala: string;
  nama_ketua_zi: string;
  nip_ketua_zi: string;
  logo_url: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface SatkerConfigBundle {
  system: 'REBO V2';
  schema_version: '2.0';
  exported_at: string;
  exported_by?: string;
  active_satker: SatkerConfig;
  available_presets: SatkerConfig[];
}

/**
 * Default Satker Aktif: BPS Kabupaten Kepulauan Siau Tagulandang Biaro (Kode: 7108)
 */
export const DEFAULT_SATKER_CONFIG: SatkerConfig = {
  kode_satker: '7108',
  nama_satker: 'BPS Kabupaten Kepulauan Siau Tagulandang Biaro',
  singkatan_satker: 'BPS Kab. Sitaro',
  provinsi: 'Sulawesi Utara',
  kode_provinsi: '71',
  alamat_kantor:
    'Kompleks Perkantoran Pemkab Sitaro, Kel. Paseng, Kec. Siau Barat, Kab. Kepl. Siau Tagulandang Biaro 95861',
  email_resmi: 'bps7108@bps.go.id',
  no_telepon: '(0432) 234567',
  no_wa_helpdesk: '082190010001',
  portal_pst_url: 'https://sitarokab.bps.go.id',
  target_predikat: 'WBK',
  nama_kepala: 'Inke Margareth Tambeo, SST., M.Ec.Dev.',
  nip_kepala: '198403232007012003',
  nama_ketua_zi: 'Ketua Tim Pembangunan ZI BPS Sitaro, S.ST',
  nip_ketua_zi: '198805122010121002',
  logo_url: '/logo-bps.png',
  is_active: true,
  updated_at: '2026-11-25T00:00:00.000Z'
};

/**
 * Preset Lengkap Satker BPS se-Sulawesi Utara (15 Kab/Kota + BPS Provinsi)
 * ditambah Template Kustom Nasional untuk replikasi instance REBO di seluruh Indonesia.
 */
export const PRESET_SATKER_LIST: SatkerConfig[] = [
  DEFAULT_SATKER_CONFIG,
  {
    kode_satker: '7171',
    nama_satker: 'BPS Kota Manado',
    singkatan_satker: 'BPS Kota Manado',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor: 'Jl. Pemuda No. 1, Sario Kotabaru, Kota Manado 95113',
    email_resmi: 'bps7171@bps.go.id',
    no_telepon: '(0431) 852174',
    no_wa_helpdesk: '081244007171',
    portal_pst_url: 'https://manadokota.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kota Manado, S.Si, M.E',
    nip_kepala: '197302141996021001',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kota Manado',
    nip_ketua_zi: '198204152005021003',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7172',
    nama_satker: 'BPS Kota Bitung',
    singkatan_satker: 'BPS Kota Bitung',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor: 'Jl. Sam Ratulangi No. 12, Bitung Barat, Kota Bitung 95514',
    email_resmi: 'bps7172@bps.go.id',
    no_telepon: '(0438) 31456',
    no_wa_helpdesk: '081244007172',
    portal_pst_url: 'https://bitungkota.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kota Bitung, M.Si',
    nip_kepala: '197405201998031002',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kota Bitung',
    nip_ketua_zi: '198403122007011004',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7173',
    nama_satker: 'BPS Kota Tomohon',
    singkatan_satker: 'BPS Kota Tomohon',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor: 'Jl. Kolongan No. 8, Tomohon Tengah, Kota Tomohon 95442',
    email_resmi: 'bps7173@bps.go.id',
    no_telepon: '(0431) 351234',
    no_wa_helpdesk: '081244007173',
    portal_pst_url: 'https://tomohonkota.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kota Tomohon, S.E, M.Si',
    nip_kepala: '197508111999031002',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kota Tomohon',
    nip_ketua_zi: '198606212009121001',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7174',
    nama_satker: 'BPS Kota Kotamobagu',
    singkatan_satker: 'BPS Kota Kotamobagu',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Paloko Kinalang No. 45, Kotamobagu Barat, Kota Kotamobagu 95716',
    email_resmi: 'bps7174@bps.go.id',
    no_telepon: '(0434) 22345',
    no_wa_helpdesk: '081244007174',
    portal_pst_url: 'https://kotamobagukota.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kota Kotamobagu, M.Si',
    nip_kepala: '197603152000031003',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kota Kotamobagu',
    nip_ketua_zi: '198709142010121003',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7102',
    nama_satker: 'BPS Kabupaten Minahasa',
    singkatan_satker: 'BPS Kab. Minahasa',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor: 'Jl. Manguni No. 20, Sasaran, Tondano, Kab. Minahasa 95617',
    email_resmi: 'bps7102@bps.go.id',
    no_telepon: '(0431) 321567',
    no_wa_helpdesk: '081244007102',
    portal_pst_url: 'https://minahasakab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Minahasa, M.Si',
    nip_kepala: '197204101995031001',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Minahasa',
    nip_ketua_zi: '198305192006041002',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7106',
    nama_satker: 'BPS Kabupaten Minahasa Utara',
    singkatan_satker: 'BPS Kab. Minut',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. W.J. Walanda Maramis, Kompleks Pemkab Minut, Airmadidi 95371',
    email_resmi: 'bps7106@bps.go.id',
    no_telepon: '(0431) 892345',
    no_wa_helpdesk: '081244007106',
    portal_pst_url: 'https://minutkab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Minahasa Utara, S.Si',
    nip_kepala: '197401121997031002',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Minut',
    nip_ketua_zi: '198507222008011003',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7105',
    nama_satker: 'BPS Kabupaten Minahasa Selatan',
    singkatan_satker: 'BPS Kab. Minsel',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Trans Sulawesi, Amurang Barat, Kab. Minahasa Selatan 95954',
    email_resmi: 'bps7105@bps.go.id',
    no_telepon: '(0430) 21567',
    no_wa_helpdesk: '081244007105',
    portal_pst_url: 'https://minselkab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Minahasa Selatan, M.Si',
    nip_kepala: '197509141999031001',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Minsel',
    nip_ketua_zi: '198603182009121002',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7109',
    nama_satker: 'BPS Kabupaten Minahasa Tenggara',
    singkatan_satker: 'BPS Kab. Mitra',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Raya Ratahan-Belang, Ratahan, Kab. Minahasa Tenggara 95698',
    email_resmi: 'bps7109@bps.go.id',
    no_telepon: '(0431) 319876',
    no_wa_helpdesk: '081244007109',
    portal_pst_url: 'https://mitrakab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Minahasa Tenggara, M.Si',
    nip_kepala: '197607212001031002',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Mitra',
    nip_ketua_zi: '198708152010121004',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7101',
    nama_satker: 'BPS Kabupaten Bolaang Mongondow',
    singkatan_satker: 'BPS Kab. Bolmong',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Paloko Kinalang No. 10, Kotamobagu / Lolak, Kab. Bolaang Mongondow 95711',
    email_resmi: 'bps7101@bps.go.id',
    no_telepon: '(0434) 21123',
    no_wa_helpdesk: '081244007101',
    portal_pst_url: 'https://bolmongkab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Bolaang Mongondow, S.E, M.Si',
    nip_kepala: '197305151996031001',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Bolmong',
    nip_ketua_zi: '198402172007011003',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7110',
    nama_satker: 'BPS Kabupaten Bolaang Mongondow Timur',
    singkatan_satker: 'BPS Kab. Boltim',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Trans Sulawesi Tutuyan, Kab. Bolaang Mongondow Timur 95771',
    email_resmi: 'bps7110@bps.go.id',
    no_telepon: '(0434) 262345',
    no_wa_helpdesk: '081244007110',
    portal_pst_url: 'https://boltimkab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Bolaang Mongondow Timur, S.Si',
    nip_kepala: '197802112002031001',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Boltim',
    nip_ketua_zi: '198809122011011002',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7111',
    nama_satker: 'BPS Kabupaten Bolaang Mongondow Utara',
    singkatan_satker: 'BPS Kab. Bolmut',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Trans Sulawesi Boroko, Kab. Bolaang Mongondow Utara 95765',
    email_resmi: 'bps7111@bps.go.id',
    no_telepon: '(0434) 281234',
    no_wa_helpdesk: '081244007111',
    portal_pst_url: 'https://bolmutkab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Bolaang Mongondow Utara, M.Si',
    nip_kepala: '197706192001031003',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Bolmut',
    nip_ketua_zi: '198901152012021001',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7112',
    nama_satker: 'BPS Kabupaten Bolaang Mongondow Selatan',
    singkatan_satker: 'BPS Kab. Bolsel',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Trans Sulawesi Bolaang Uki, Kab. Bolaang Mongondow Selatan 95774',
    email_resmi: 'bps7112@bps.go.id',
    no_telepon: '(0434) 271234',
    no_wa_helpdesk: '081244007112',
    portal_pst_url: 'https://bolselkab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Bolaang Mongondow Selatan, S.ST',
    nip_kepala: '197903222003031002',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Bolsel',
    nip_ketua_zi: '199002142013011002',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7103',
    nama_satker: 'BPS Kabupaten Kepulauan Sangihe',
    singkatan_satker: 'BPS Kab. Kepl. Sangihe',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor: 'Jl. Baru No. 1, Tahuna, Kab. Kepulauan Sangihe 95811',
    email_resmi: 'bps7103@bps.go.id',
    no_telepon: '(0432) 21345',
    no_wa_helpdesk: '081244007103',
    portal_pst_url: 'https://sangihekab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Kepulauan Sangihe, M.Si',
    nip_kepala: '197408171998031001',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Kepl. Sangihe',
    nip_ketua_zi: '198504192008011002',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7104',
    nama_satker: 'BPS Kabupaten Kepulauan Talaud',
    singkatan_satker: 'BPS Kab. Kepl. Talaud',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor:
      'Jl. Kompleks Perkantoran Melonguane, Kab. Kepulauan Talaud 95885',
    email_resmi: 'bps7104@bps.go.id',
    no_telepon: '(0433) 21123',
    no_wa_helpdesk: '081244007104',
    portal_pst_url: 'https://talaudkab.bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Kepala BPS Kabupaten Kepulauan Talaud, S.Si',
    nip_kepala: '197609252000031001',
    nama_ketua_zi: 'Ketua Tim ZI BPS Kab. Kepl. Talaud',
    nip_ketua_zi: '198711122010121001',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '7100',
    nama_satker: 'BPS Provinsi Sulawesi Utara',
    singkatan_satker: 'BPS Prov. Sulut',
    provinsi: 'Sulawesi Utara',
    kode_provinsi: '71',
    alamat_kantor: 'Jl. 17 Agustus No. 43, Teling Atas, Kota Manado 95119',
    email_resmi: 'bps7100@bps.go.id',
    no_telepon: '(0431) 843187',
    no_wa_helpdesk: '081244007100',
    portal_pst_url: 'https://sulut.bps.go.id',
    target_predikat: 'WBBM',
    nama_kepala: 'Kepala BPS Provinsi Sulawesi Utara, M.Si',
    nip_kepala: '196805141992031002',
    nama_ketua_zi: 'Ketua Tim Kerja ZI BPS Provinsi Sulawesi Utara',
    nip_ketua_zi: '197904122002121001',
    logo_url: '/logo-bps.png',
    is_active: false
  },
  {
    kode_satker: '0000',
    nama_satker: 'BPS Kabupaten/Kota Percontohan Nasional',
    singkatan_satker: 'BPS Kab./Kota Kustom',
    provinsi: 'Provinsi Percontohan',
    kode_provinsi: '00',
    alamat_kantor:
      'Jl. Statistik Raya No. 1, Pusat Perkantoran Pemerintahan Daerah',
    email_resmi: 'bps0000@bps.go.id',
    no_telepon: '(021) 1234567',
    no_wa_helpdesk: '081234567890',
    portal_pst_url: 'https://bps.go.id',
    target_predikat: 'WBK',
    nama_kepala: 'Nama Kepala BPS, M.Si',
    nip_kepala: '198001012005011001',
    nama_ketua_zi: 'Nama Ketua Tim Pembangunan ZI, S.ST',
    nip_ketua_zi: '198801012010121001',
    logo_url: '/logo-bps.png',
    is_active: false
  }
];
