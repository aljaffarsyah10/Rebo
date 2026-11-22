/* eslint-disable no-console */
/**
 * Migration & Seed Script: Setup kontak_pilar and users table
 * Untuk REBO V2 Notifikasi WhatsApp
 */

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

const SEED_KONTAK_PILAR = [
  {
    id_pilar: 1,
    kategori: 'pilar',
    nama_pilar: 'Pilar 1 - Manajemen Perubahan',
    nama_pic: 'PIC Pilar Manajemen Perubahan',
    jabatan: 'Koordinator Tim Kerja Manajemen Perubahan BPS Sitaro',
    no_wa: '082190010001',
    email: 'pilar1.sitaro@bps.go.id',
    is_active: true
  },
  {
    id_pilar: 2,
    kategori: 'pilar',
    nama_pilar: 'Pilar 2 - Penataan Tatalaksana',
    nama_pic: 'PIC Pilar Penataan Tatalaksana',
    jabatan: 'Koordinator Tim Kerja Tatalaksana BPS Sitaro',
    no_wa: '082190010002',
    email: 'pilar2.sitaro@bps.go.id',
    is_active: true
  },
  {
    id_pilar: 3,
    kategori: 'pilar',
    nama_pilar: 'Pilar 3 - Penataan Sistem Manajemen SDM',
    nama_pic: 'PIC Pilar Manajemen SDM',
    jabatan: 'Koordinator Tim Kerja SDM Aparatur BPS Sitaro',
    no_wa: '082190010003',
    email: 'pilar3.sitaro@bps.go.id',
    is_active: true
  },
  {
    id_pilar: 4,
    kategori: 'pilar',
    nama_pilar: 'Pilar 4 - Penguatan Akuntabilitas',
    nama_pic: 'PIC Pilar Penguatan Akuntabilitas',
    jabatan: 'Koordinator Tim Kerja Akuntabilitas BPS Sitaro',
    no_wa: '082190010004',
    email: 'pilar4.sitaro@bps.go.id',
    is_active: true
  },
  {
    id_pilar: 5,
    kategori: 'pilar',
    nama_pilar: 'Pilar 5 - Penguatan Pengawasan',
    nama_pic: 'PIC Pilar Penguatan Pengawasan',
    jabatan: 'Koordinator Tim Kerja Pengawasan BPS Sitaro',
    no_wa: '082190010005',
    email: 'pilar5.sitaro@bps.go.id',
    is_active: true
  },
  {
    id_pilar: 6,
    kategori: 'pilar',
    nama_pilar: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik',
    nama_pic: 'PIC Pilar Pelayanan Publik',
    jabatan: 'Koordinator Tim Kerja Pelayanan Publik BPS Sitaro',
    no_wa: '082190010006',
    email: 'pilar6.sitaro@bps.go.id',
    is_active: true
  },
  {
    id_pilar: null,
    kategori: 'verifikator',
    nama_pilar: 'Tim Verifikator Internal ZI/RB',
    nama_pic: 'Tim Verifikator Internal ZI/RB',
    jabatan: 'Koordinator Tim Penilai Internal & Verifikator BPS Sitaro',
    no_wa: '082190010000',
    email: 'verifikator.sitaro@bps.go.id',
    is_active: true
  },
  {
    id_pilar: null,
    kategori: 'admin',
    nama_pilar: 'Admin REBO BPS Sitaro',
    nama_pic: 'Admin REBO BPS Sitaro',
    jabatan: 'Administrator Sistem Informasi REBO V2',
    no_wa: '082190010008',
    email: 'bps7108@bps.go.id',
    is_active: true
  }
];

async function run() {
  const connectionString = getConnectionString();
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Menghubungkan ke PostgreSQL Supabase...');
    await client.connect();
    console.log('Koneksi berhasil terhubung.');

    // 1. Eksekusi file migrasi SQL
    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '20261123000000_kontak_pilar.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log('Menjalankan migrasi DDL: 20261123000000_kontak_pilar.sql ...');
    await client.query(sql);
    console.log('Tabel kontak_pilar dan users berhasil dibuat/diperbarui.');

    // 2. Cek dan isi data seed kontak
    console.log('Memeriksa data kontak_pilar yang ada...');
    const existing = await client.query(
      'SELECT COUNT(*) as count FROM public.kontak_pilar'
    );
    const count = parseInt(existing.rows[0].count, 10);
    console.log(`Jumlah kontak saat ini: ${count}`);

    if (count === 0) {
      console.log(
        'Mengisi data kontak default untuk 6 Pilar + Verifikator + Admin...'
      );
      for (const item of SEED_KONTAK_PILAR) {
        await client.query(
          `INSERT INTO public.kontak_pilar 
            (id_pilar, kategori, nama_pilar, nama_pic, jabatan, no_wa, email, is_active)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            item.id_pilar,
            item.kategori,
            item.nama_pilar,
            item.nama_pic,
            item.jabatan,
            item.no_wa,
            item.email,
            item.is_active
          ]
        );
      }
      console.log('Seed kontak berhasil disimpan.');
    } else {
      console.log(
        'Data kontak sudah ada, memastikan pilar 1-6 dan verifikator tersedia...'
      );
      for (const item of SEED_KONTAK_PILAR) {
        let checkQuery = '';
        let params = [];
        if (item.id_pilar !== null) {
          checkQuery =
            'SELECT id FROM public.kontak_pilar WHERE id_pilar = $1 LIMIT 1';
          params = [item.id_pilar];
        } else {
          checkQuery =
            'SELECT id FROM public.kontak_pilar WHERE kategori = $1 AND nama_pic = $2 LIMIT 1';
          params = [item.kategori, item.nama_pic];
        }

        const res = await client.query(checkQuery, params);
        if (res.rows.length === 0) {
          await client.query(
            `INSERT INTO public.kontak_pilar 
              (id_pilar, kategori, nama_pilar, nama_pic, jabatan, no_wa, email, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              item.id_pilar,
              item.kategori,
              item.nama_pilar,
              item.nama_pic,
              item.jabatan,
              item.no_wa,
              item.email,
              item.is_active
            ]
          );
          console.log(
            `+ Ditambahkan kontak: ${item.nama_pic} (${item.kategori})`
          );
        }
      }
    }

    // 3. Verifikasi hasil
    const result = await client.query(
      'SELECT id, id_pilar, kategori, nama_pilar, nama_pic, no_wa, is_active FROM public.kontak_pilar ORDER BY COALESCE(id_pilar, 99), id ASC'
    );
    console.log('\n=== DAFTAR KONTAK TERSIMPAN DI DATABASE ===');
    console.table(result.rows);
  } catch (err) {
    console.error('Error saat menjalankan migrasi/seed:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
