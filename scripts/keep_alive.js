/**
 * Unified Keep-Alive Ping Script untuk REBO V2
 *
 * Menjaga 2 layanan penting tetap aktif:
 * 1. Supabase PostgreSQL: Mencegah auto-pause free-tier setelah 7 hari inaktivitas.
 * 2. Render WhatsApp Gateway: Mencegah auto-sleep free-tier setelah 15 menit inaktivitas,
 *    sehingga bot WhatsApp dapat menerima & mengirim pesan 24/7 tanpa latency cold start.
 *
 * Cara Penggunaan:
 *   node scripts/keep_alive.js
 *   node scripts/keep_alive.js --target=wa-gateway
 *   node scripts/keep_alive.js --target=supabase
 *   node scripts/keep_alive.js --target=all
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables dari .env.local jika ada
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
let waGatewayUrl =
  process.env.WHATSAPP_GATEWAY_URL || process.env.WA_GATEWAY_URL || '';
const waApiKey =
  process.env.WHATSAPP_API_KEY || process.env.WA_GATEWAY_API_KEY || '';
const appUrl = process.env.APP_URL || '';

// Parse CLI target
const targetArg = process.argv.find((arg) => arg.startsWith('--target='));
const target = targetArg ? targetArg.split('=')[1].toLowerCase() : 'all';

async function pingSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.warn(
      '[KEEP-ALIVE] [SUPABASE] Warning: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set.'
    );
    return { success: false, error: 'Missing Supabase env vars' };
  }

  const startTime = Date.now();
  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    const { data, error, count } = await supabase
      .from('area')
      .select('id_area, nama_area', { count: 'exact' })
      .limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      console.error(
        `[KEEP-ALIVE] [SUPABASE] [FAILED] Query error: ${error.message} (${latencyMs}ms)`
      );
      return { success: false, error: error.message, latencyMs };
    }

    console.log(
      `[KEEP-ALIVE] [SUPABASE] [SUCCESS] Latency: ${latencyMs}ms | Found ${count ?? data?.length ?? 0} area records.`
    );
    return { success: true, latencyMs, count: count ?? data?.length ?? 0 };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    console.error(
      `[KEEP-ALIVE] [SUPABASE] [EXCEPTION] Connection failed: ${err.message} (${latencyMs}ms)`
    );
    return { success: false, error: err.message, latencyMs };
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function pingWhatsAppGateway() {
  if (!waGatewayUrl) {
    console.log(
      '[KEEP-ALIVE] [WA-GATEWAY] [SKIPPED] WHATSAPP_GATEWAY_URL is not set. Gateway ping skipped.'
    );
    return { success: true, skipped: true };
  }

  // Normalisasi target URL ke /health
  let healthUrl = waGatewayUrl.replace(/\/+$/, '');
  if (!healthUrl.endsWith('/health')) {
    healthUrl += '/health';
  }

  const headers = {
    Accept: 'application/json'
  };
  if (waApiKey) {
    headers.Authorization = `Bearer ${waApiKey}`;
  }

  const maxAttempts = 2; // 1 initial attempt + 1 retry
  const retryDelayMs = 3000;
  const timeoutMs = 45000; // >= 35000ms untuk mengantisipasi cold start Render Free Tier
  const overallStart = Date.now();

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const attemptStart = Date.now();
    try {
      console.log(
        `[KEEP-ALIVE] [WA-GATEWAY] Pinging (attempt ${attempt}/${maxAttempts}): ${healthUrl} ...`
      );

      const response = await fetch(healthUrl, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(timeoutMs)
      });

      const latencyMs = Date.now() - attemptStart;
      const bodyText = await response.text();

      let parsedData = null;
      try {
        parsedData = JSON.parse(bodyText);
      } catch {
        parsedData = bodyText;
      }

      if (!response.ok) {
        const isTransientStatus =
          response.status === 502 || response.status === 503;
        if (isTransientStatus && attempt < maxAttempts) {
          console.warn(
            `[KEEP-ALIVE] [WA-GATEWAY] [RETRY] Status ${response.status} (${latencyMs}ms). Retrying in ${retryDelayMs / 1000}s...`
          );
          await sleep(retryDelayMs);
          continue;
        }

        console.warn(
          `[KEEP-ALIVE] [WA-GATEWAY] [WARNING] Status ${response.status} (${latencyMs}ms):`,
          parsedData
        );
        return {
          success: false,
          status: response.status,
          latencyMs: Date.now() - overallStart,
          data: parsedData
        };
      }

      console.log(
        `[KEEP-ALIVE] [WA-GATEWAY] [SUCCESS] Latency: ${latencyMs}ms | Response:`,
        JSON.stringify(parsedData)
      );
      return {
        success: true,
        status: response.status,
        latencyMs: Date.now() - overallStart,
        data: parsedData
      };
    } catch (err) {
      const latencyMs = Date.now() - attemptStart;
      if (attempt < maxAttempts) {
        console.warn(
          `[KEEP-ALIVE] [WA-GATEWAY] [RETRY] Ping error (${latencyMs}ms): ${err.message}. Retrying in ${retryDelayMs / 1000}s...`
        );
        await sleep(retryDelayMs);
        continue;
      }

      console.error(
        `[KEEP-ALIVE] [WA-GATEWAY] [FAILED] Ping error (${latencyMs}ms): ${err.message}`
      );
      return {
        success: false,
        error: err.message,
        latencyMs: Date.now() - overallStart
      };
    }
  }
}

async function pingAppEndpoint() {
  if (!appUrl) return null;

  const targetUrl = `${appUrl.replace(/\/+$/, '')}/api/cron/keep-alive`;
  const startTime = Date.now();
  try {
    const cronSecret = process.env.CRON_SECRET;
    const headers = { 'Content-Type': 'application/json' };
    if (cronSecret) {
      headers.Authorization = `Bearer ${cronSecret}`;
    }

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers,
      signal: AbortSignal.timeout(30000)
    });

    const latencyMs = Date.now() - startTime;
    const data = await response.json().catch(() => null);

    console.log(
      `[KEEP-ALIVE] [APP-ENDPOINT] [${response.ok ? 'SUCCESS' : 'WARNING'}] Status: ${response.status} (${latencyMs}ms)`
    );
    return { success: response.ok, status: response.status, latencyMs, data };
  } catch (err) {
    const latencyMs = Date.now() - startTime;
    console.warn(
      `[KEEP-ALIVE] [APP-ENDPOINT] [FAILED] Ping error (${latencyMs}ms): ${err.message}`
    );
    return { success: false, error: err.message, latencyMs };
  }
}

async function main() {
  const now = new Date();
  console.log(`=======================================================`);
  console.log(
    `[KEEP-ALIVE] Starting Health Keep-Alive at ${now.toISOString()}`
  );
  console.log(`[KEEP-ALIVE] Mode: ${target}`);
  console.log(`=======================================================`);

  const results = {};

  if (
    target === 'all' ||
    target === 'supabase' ||
    target === 'supabase-direct'
  ) {
    results.supabase = await pingSupabase();
  }

  if (
    target === 'all' ||
    target === 'wa' ||
    target === 'wa-gateway' ||
    target === 'render'
  ) {
    results.whatsappGateway = await pingWhatsAppGateway();
  }

  if (target === 'all' || target === 'app' || target === 'web-endpoint') {
    if (appUrl) {
      results.appEndpoint = await pingAppEndpoint();
    }
  }

  console.log(`=======================================================`);
  console.log(`[KEEP-ALIVE] Summary:`);
  if (results.supabase) {
    console.log(
      ` - Supabase: ${results.supabase.success ? 'ACTIVE' : 'FAILED'} (${results.supabase.latencyMs || 0}ms)`
    );
  }
  if (results.whatsappGateway) {
    console.log(
      ` - Render WA Gateway: ${
        results.whatsappGateway.skipped
          ? 'NOT CONFIGURED'
          : results.whatsappGateway.success
            ? 'ACTIVE'
            : 'FAILED'
      } (${results.whatsappGateway.latencyMs || 0}ms)`
    );
  }
  if (results.appEndpoint) {
    console.log(
      ` - Web App API: ${results.appEndpoint.success ? 'ACTIVE' : 'FAILED'} (${results.appEndpoint.latencyMs || 0}ms)`
    );
  }
  console.log(`=======================================================`);

  const hasCriticalFailure = results.supabase && !results.supabase.success;

  if (hasCriticalFailure) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  pingSupabase,
  pingWhatsAppGateway,
  pingAppEndpoint
};
