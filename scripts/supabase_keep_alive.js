/**
 * Standalone Supabase Keep-Alive Ping Script
 *
 * Mengirim query ringan ke database Supabase agar project tidak dinonaktifkan /
 * dipause secara otomatis oleh Supabase Free Tier (yang mempause setelah 7 hari inaktivitas).
 *
 * Cara Penggunaan:
 *   node scripts/supabase_keep_alive.js
 *
 * Dapat dijadwalkan via:
 * - Windows Task Scheduler
 * - Crontab Linux / macOS (`0 2 *\/3 * * /usr/bin/node /path/to/scripts/supabase_keep_alive.js`)
 * - CI / CD pipeline
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables from .env.local if present
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed
          .slice(eqIdx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[CRON Keep-Alive] [ERROR] Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

async function runKeepAlive() {
  const now = new Date();
  console.log(`=======================================================`);
  console.log(
    `[CRON Keep-Alive] Starting Supabase Ping at ${now.toISOString()}`
  );
  console.log(`[CRON Keep-Alive] Target: ${supabaseUrl}`);
  console.log(`=======================================================`);

  const startTime = Date.now();

  try {
    const { data, error, count } = await supabase
      .from('area')
      .select('id_area, nama_area', { count: 'exact' })
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error(`[CRON Keep-Alive] [FAILED] Query error: ${error.message}`);
      console.error(`[CRON Keep-Alive] Latency: ${latencyMs}ms`);
      process.exit(1);
    }

    console.log(`[CRON Keep-Alive] [SUCCESS] Ping to Supabase was successful!`);
    console.log(`[CRON Keep-Alive] Latency: ${latencyMs}ms`);
    console.log(
      `[CRON Keep-Alive] Table sample query: 'area' (found ${count ?? data?.length ?? 0} total records)`
    );
    if (data && data.length > 0) {
      console.log(
        `[CRON Keep-Alive] Sample data: ID=${data[0].id_area}, Area="${data[0].nama_area}"`
      );
    }
    console.log(
      `[CRON Keep-Alive] Database activity confirmed. Supabase pause timer reset.`
    );
    console.log(`=======================================================`);
    process.exit(0);
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    console.error(
      `[CRON Keep-Alive] [EXCEPTION] Connection failed:`,
      err.message || err
    );
    console.error(`[CRON Keep-Alive] Latency: ${latencyMs}ms`);
    process.exit(1);
  }
}

runKeepAlive();
