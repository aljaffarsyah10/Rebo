/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import { executeWaReminderEngine } from '@/lib/notifications/reminders';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // Jika CRON_SECRET belum diset di environment, izinkan request lokal/cron
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

export async function GET(request: NextRequest) {
  const timestamp = new Date().toISOString();

  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          'Unauthorized: Missing or invalid Bearer token / secret query param',
        timestamp
      },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const mode = (url.searchParams.get('mode') as any) || 'all';
    const force =
      url.searchParams.get('force') === 'true' ||
      url.searchParams.get('force') === '1';
    const dryRun =
      url.searchParams.get('dryRun') === 'true' ||
      url.searchParams.get('dryRun') === '1';
    const targetPilarId = url.searchParams.get('pilarId')
      ? Number(url.searchParams.get('pilarId'))
      : undefined;
    const customDeadline = url.searchParams.get('customDeadline') || undefined;

    const result = await executeWaReminderEngine({
      mode,
      force,
      dryRun,
      targetPilarId,
      customDeadline
    });

    return NextResponse.json(
      {
        status: 'success',
        data: result
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[CRON WA Reminders] Error:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Internal server error executing reminders',
        timestamp
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();

  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        status: 'error',
        message:
          'Unauthorized: Missing or invalid Bearer token in Authorization header',
        timestamp
      },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const mode = body.mode || 'all';
    const force = Boolean(body.force);
    const dryRun = Boolean(body.dryRun);
    const targetPilarId = body.pilarId ? Number(body.pilarId) : undefined;
    const customDeadline = body.customDeadline || undefined;

    const result = await executeWaReminderEngine({
      mode,
      force,
      dryRun,
      targetPilarId,
      customDeadline
    });

    return NextResponse.json(
      {
        status: 'success',
        data: result
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[CRON WA Reminders] Error:', err);
    return NextResponse.json(
      {
        status: 'error',
        message: err?.message || 'Internal server error executing reminders',
        timestamp
      },
      { status: 500 }
    );
  }
}
