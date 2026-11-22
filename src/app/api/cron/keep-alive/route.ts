/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PingResult {
  connected: boolean;
  latencyMs: number;
  error?: string;
  [key: string]: any;
}

async function handleKeepAlive(request: NextRequest) {
  const timestamp = new Date().toISOString();
  const overallStart = performance.now();
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  // Security check: if CRON_SECRET is set, ensure caller is authorized
  if (cronSecret) {
    const isAuthorized = authHeader === `Bearer ${cronSecret}`;
    if (!isAuthorized) {
      return NextResponse.json(
        {
          status: 'error',
          message:
            'Unauthorized: Invalid or missing Bearer token in Authorization header',
          timestamp
        },
        { status: 401 }
      );
    }
  }

  // 1. Supabase Ping
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  let supabaseResult: PingResult = {
    connected: false,
    latencyMs: 0
  };

  if (!supabaseUrl || !supabaseKey) {
    supabaseResult.error =
      'Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)';
  } else {
    const sbStart = performance.now();
    try {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });

      const { data, error, count } = await supabase
        .from('area')
        .select('id_area', { count: 'exact' })
        .limit(1);

      supabaseResult.latencyMs = Math.round(performance.now() - sbStart);

      if (error) {
        console.error(
          '[CRON Keep-Alive] Supabase query failed:',
          error.message
        );
        supabaseResult.error = error.message;
      } else {
        supabaseResult.connected = true;
        supabaseResult.table = 'area';
        supabaseResult.rowCount = count ?? (data ? data.length : 0);
      }
    } catch (err: any) {
      supabaseResult.latencyMs = Math.round(performance.now() - sbStart);
      supabaseResult.error = err?.message || 'Exception during Supabase query';
      console.error('[CRON Keep-Alive] Unexpected Supabase error:', err);
    }
  }

  // 2. Render WhatsApp Gateway Ping (Anti-Sleep Keep-Alive)
  let gatewayUrl =
    process.env.WHATSAPP_GATEWAY_URL || process.env.WA_GATEWAY_URL || '';
  const gatewayApiKey =
    process.env.WHATSAPP_API_KEY || process.env.WA_GATEWAY_API_KEY || '';

  let waResult: PingResult = {
    connected: false,
    latencyMs: 0,
    configured: Boolean(gatewayUrl)
  };

  if (gatewayUrl) {
    let healthUrl = gatewayUrl.replace(/\/+$/, '');
    if (!healthUrl.endsWith('/health')) {
      healthUrl += '/health';
    }

    const waStart = performance.now();
    try {
      const res = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          ...(gatewayApiKey ? { Authorization: `Bearer ${gatewayApiKey}` } : {})
        },
        // Timeout 15 detik untuk mengakomodasi waking-up Render container
        signal: AbortSignal.timeout(15000)
      });

      waResult.latencyMs = Math.round(performance.now() - waStart);
      waResult.statusCode = res.status;

      const body = await res.json().catch(() => null);
      if (res.ok) {
        waResult.connected = true;
        waResult.status = body?.status || 'ok';
        waResult.waConnected = body?.connected ?? false;
      } else {
        waResult.error = `HTTP ${res.status}: ${res.statusText}`;
      }
    } catch (err: any) {
      waResult.latencyMs = Math.round(performance.now() - waStart);
      waResult.error = err?.message || 'Failed to ping WhatsApp Gateway';
      console.warn(
        '[CRON Keep-Alive] WhatsApp gateway ping warning:',
        err.message
      );
    }
  }

  const totalLatencyMs = Math.round(performance.now() - overallStart);

  const isSupabaseOk = supabaseResult.connected;
  const isWaOk = !waResult.configured || waResult.connected;

  let overallStatus: 'success' | 'partial_success' | 'error' = 'success';
  if (!isSupabaseOk && !isWaOk) {
    overallStatus = 'error';
  } else if (!isSupabaseOk || !isWaOk) {
    overallStatus = 'partial_success';
  }

  const statusCode = overallStatus === 'error' ? 500 : 200;

  return NextResponse.json(
    {
      status: overallStatus,
      message:
        overallStatus === 'success'
          ? 'Semua layanan aktif dan keep-alive berhasil diperbarui.'
          : overallStatus === 'partial_success'
            ? 'Beberapa layanan memerlukan perhatian, namun keep-alive tetap diproses.'
            : 'Gagal melakukan keep-alive ping pada seluruh layanan.',
      totalLatencyMs,
      timestamp,
      services: {
        supabase: supabaseResult,
        whatsappGateway: waResult
      },
      security: cronSecret ? 'protected' : 'open (CRON_SECRET not set)'
    },
    { status: statusCode }
  );
}

export async function GET(request: NextRequest) {
  return handleKeepAlive(request);
}

export async function POST(request: NextRequest) {
  return handleKeepAlive(request);
}
