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

async function main() {
  const connectionString = getConnectionString();
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL Supabase');

    await client.query(`
      ALTER TABLE public.periode_evaluasi
      ADD COLUMN IF NOT EXISTS tanggal_mulai DATE,
      ADD COLUMN IF NOT EXISTS tanggal_selesai DATE;
    `);
    console.log('Columns tanggal_mulai & tanggal_selesai ensured.');

    await client.query(`
      UPDATE public.periode_evaluasi
      SET tanggal_mulai = (tahun || '-01-01')::date,
          tanggal_selesai = (tahun || '-12-31')::date
      WHERE tanggal_selesai IS NULL;
    `);
    console.log('Default dates set for rows where tanggal_selesai was NULL.');

    const res = await client.query(`
      SELECT id, tahun, nama_periode, tanggal_mulai, tanggal_selesai, is_active
      FROM public.periode_evaluasi
      ORDER BY tahun;
    `);
    console.log('Current periode_evaluasi rows:');
    console.table(res.rows);

    await client.end();
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

main();
