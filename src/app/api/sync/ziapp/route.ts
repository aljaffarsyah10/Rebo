import { NextRequest, NextResponse } from 'next/server';
import {
  generateZIAPPSyncPayloadAction,
  getZIAPPSyncSummaryAction,
  markAsSyncedToZIAPPAction
} from '@/actions/ziapp-sync-actions';

export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Authorization, X-Requested-With, x-api-key',
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  Pragma: 'no-cache',
  Expires: '0'
};

/**
 * Pre-flight OPTIONS Handler untuk dukungan CORS Ekstensi Chrome / Script Helper
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: CORS_HEADERS
  });
}

/**
 * GET Handler: Mengambil payload JSON indikator dan berkas bukti siap sinkronisasi ke Web Pusat ZIAPP
 *
 * Query Parameters:
 * - `periodeId` (string, opsional): ID periode evaluasi spesifik.
 * - `status` (string, opsional):
 *     - 'ready' (default): Hanya indikator berstatus 'READY_FOR_ZIAPP'.
 *     - 'synced': Hanya indikator yang sudah berstatus 'SYNCED_TO_ZIAPP'.
 *     - 'all': Seluruh indikator yang siap kirim maupun telah tersinkron.
 * - `summary` (boolean, opsional): Jika 'true', mengembalikan ringkasan statistik KPI ZIAPP.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const periodeId = searchParams.get('periodeId') || undefined;
    const filterStatus = searchParams.get('status')?.toLowerCase() || 'ready';
    const isSummaryOnly = searchParams.get('summary') === 'true';

    // Jika parameter summary=true diminta
    if (isSummaryOnly) {
      const summaryResult = await getZIAPPSyncSummaryAction(periodeId);
      if (!summaryResult.success || !summaryResult.data) {
        return NextResponse.json(
          { error: summaryResult.error || 'Gagal memuat ringkasan ZIAPP.' },
          { status: 500, headers: CORS_HEADERS }
        );
      }
      return NextResponse.json(
        {
          success: true,
          data: summaryResult.data
        },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    // Ambil payload lengkap
    const payloadResult = await generateZIAPPSyncPayloadAction(periodeId);
    if (!payloadResult.success || !payloadResult.payload) {
      return NextResponse.json(
        {
          error:
            payloadResult.error ||
            'Gagal menghasilkan payload sinkronisasi ZIAPP.'
        },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    let items = payloadResult.payload.items;

    if (filterStatus === 'ready') {
      items = items.filter((item) => item.ziapp_status === 'READY_FOR_ZIAPP');
    } else if (filterStatus === 'synced') {
      items = items.filter((item) => item.ziapp_status === 'SYNCED_TO_ZIAPP');
    }

    const filteredPayload = {
      ...payloadResult.payload,
      metadata: {
        ...payloadResult.payload.metadata,
        filter: filterStatus,
        total_items: items.length
      },
      items
    };

    return NextResponse.json(
      {
        success: true,
        ...filteredPayload
      },
      {
        status: 200,
        headers: {
          ...CORS_HEADERS,
          'Content-Type': 'application/json; charset=utf-8'
        }
      }
    );
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[API-SYNC-ZIAPP] Unexpected error:', error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Terjadi kesalahan internal saat mengambil payload ZIAPP.'
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}

/**
 * POST Handler: Menerima konfirmasi dari ekstensi peramban atau script otomasi
 * saat sebuah indikator berhasil disubmit/diisikan ke Web Pusat ZIAPP
 *
 * Body JSON:
 * - `id_pertanyaan` (string | number, wajib)
 * - `id_periode` (string, opsional)
 * - `notes` (string, opsional)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const idPertanyaan = body.id_pertanyaan || body.idPertanyaan;

    if (!idPertanyaan) {
      return NextResponse.json(
        { error: 'Field "id_pertanyaan" wajib disertakan.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const result = await markAsSyncedToZIAPPAction(
      idPertanyaan,
      body.id_periode || body.idPeriode,
      body.notes || 'Disinkronkan via API Endpoint / REBO Sync Assistant'
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Gagal memperbarui status ZIAPP.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: result.message,
        data: result.data
      },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[API-SYNC-ZIAPP-POST] Unexpected error:', error);
    return NextResponse.json(
      {
        error:
          error?.message || 'Gagal memproses konfirmasi sinkronisasi ZIAPP.'
      },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
