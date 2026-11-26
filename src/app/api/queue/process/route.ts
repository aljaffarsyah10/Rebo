/* eslint-disable no-console */
/**
 * Fallback Serverless Queue Dispatcher Route Handler
 * Endpoint: /api/queue/process (GET & POST)
 *
 * Dirancang untuk dipicu oleh Vercel Cron, Supabase Webhook, atau permintaan terjadwal
 * guna menguras dan mendistribusikan antrean pesan WhatsApp (`wa_queue:pending` & `wa_queue:delayed`)
 * jika background worker standalone sedang idle atau tidak berjalan di lingkungan serverless.
 */

import { NextRequest, NextResponse } from 'next/server';
import { processQueueBatch } from '@/lib/redis/queue';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Validasi otorisasi via Bearer token CRON_SECRET atau query parameter ?secret=
 */
function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Jika CRON_SECRET belum diset di environment, izinkan request lokal
    return true;
  }

  // 1. Cek Header Authorization: Bearer <secret>
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }

  // 2. Cek Query Param ?secret=<secret>
  const url = new URL(request.url);
  const secretParam = url.searchParams.get('secret');
  if (secretParam && secretParam === cronSecret) {
    return true;
  }

  return false;
}

async function handleQueueProcessing(request: NextRequest) {
  const timestamp = new Date().toISOString();

  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          'Unauthorized: Missing or invalid Bearer token in Authorization header or secret param',
        timestamp
      },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);

    // Ambil parameter batchSize (default 5, maksimal 10 agar aman dari timeout serverless)
    let batchSize = 5;
    const queryBatchSize =
      url.searchParams.get('batchSize') || url.searchParams.get('batch');
    if (queryBatchSize) {
      batchSize = parseInt(queryBatchSize, 10);
    }

    // Ambil parameter pacingMs (jeda anti-spam antar pesan, default 1500ms)
    let pacingMs = 1500;
    const queryPacing =
      url.searchParams.get('pacingMs') || url.searchParams.get('pacing');
    if (queryPacing) {
      pacingMs = parseInt(queryPacing, 10);
    }

    // Jika request berupa POST dengan JSON body, baca overrides
    if (request.method === 'POST') {
      try {
        const body = await request.json().catch(() => null);
        if (body?.batchSize) batchSize = Number(body.batchSize);
        if (body?.pacingMs !== undefined) pacingMs = Number(body.pacingMs);
      } catch {
        // Abaikan parsing body jika tidak ada body JSON
      }
    }

    const batchResult = await processQueueBatch({ batchSize, pacingMs });

    return NextResponse.json(
      {
        status: 'success',
        timestamp,
        data: batchResult
      },
      { status: 200 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('[Queue Process Route] Error processing batch:', errorMsg);
    return NextResponse.json(
      {
        status: 'error',
        message: errorMsg,
        timestamp
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleQueueProcessing(request);
}

export async function POST(request: NextRequest) {
  return handleQueueProcessing(request);
}
