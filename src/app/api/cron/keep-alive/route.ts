/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function handleKeepAlive(request: NextRequest) {
  const timestamp = new Date().toISOString();
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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          'Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY)',
        timestamp
      },
      { status: 500 }
    );
  }

  const startTime = performance.now();

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });

    // Execute lightweight query to keep Supabase database active
    const { data, error, count } = await supabase
      .from('area')
      .select('id_area', { count: 'exact' })
      .limit(1);

    const latencyMs = Math.round(performance.now() - startTime);

    if (error) {
      console.error('[CRON Keep-Alive] Supabase query failed:', error.message);
      return NextResponse.json(
        {
          status: 'error',
          message: `Supabase query error: ${error.message}`,
          latencyMs,
          timestamp,
          database: {
            connected: false,
            error: error.message
          }
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: 'success',
        message:
          'Supabase keep-alive ping successful. Database activity recorded.',
        latencyMs,
        timestamp,
        database: {
          connected: true,
          table: 'area',
          rowCount: count ?? (data ? data.length : 0)
        },
        security: cronSecret ? 'protected' : 'open (CRON_SECRET not set)'
      },
      { status: 200 }
    );
  } catch (err: any) {
    const latencyMs = Math.round(performance.now() - startTime);
    console.error('[CRON Keep-Alive] Unexpected error:', err);
    return NextResponse.json(
      {
        status: 'error',
        message:
          err?.message ||
          'Unexpected server error occurred during keep-alive ping',
        latencyMs,
        timestamp,
        database: {
          connected: false
        }
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleKeepAlive(request);
}

export async function POST(request: NextRequest) {
  return handleKeepAlive(request);
}
