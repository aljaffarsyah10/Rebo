/* eslint-disable no-console */
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

async function run() {
  const connectionString = getConnectionString();
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('Menghubungkan ke PostgreSQL Supabase...');
    await client.connect();
    console.log('Koneksi berhasil.');

    const migrationPath = path.join(
      __dirname,
      '..',
      'supabase',
      'migrations',
      '20261124000001_user_profile_preferences.sql'
    );
    const sql = fs.readFileSync(migrationPath, 'utf8');

    console.log(
      'Menjalankan migrasi 20261124000001_user_profile_preferences.sql...'
    );
    await client.query(sql);
    console.log('Migrasi berhasil dijalankan!');

    // Verifikasi kolom
    const res = await client.query(`
      SELECT table_name, column_name, data_type 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name IN ('users', 'dokumen_bukti', 'pertanyaan_periode') 
        AND column_name IN (
          'pilar_tugas', 'notif_wa_approval', 'notif_wa_revision', 'notif_wa_deadline',
          'submitted_by_user_id', 'submitted_by_name', 'submitted_by_phone'
        )
      ORDER BY table_name, column_name;
    `);
    console.log('Kolom baru yang terverifikasi:');
    console.table(res.rows);
  } catch (err) {
    console.error('Error menjalankan migrasi:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
