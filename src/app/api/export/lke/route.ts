import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getLkeExportData } from '@/actions/export-actions';
import { generateLkeExcelWorkbook } from '@/lib/export/lke-excel';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // 1. Clerk Authentication Check
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        {
          error:
            'Akses Ditolak: Anda harus login untuk mengunduh Kertas Kerja LKE.'
        },
        { status: 401 }
      );
    }

    // 2. Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const periodeId = searchParams.get('periodeId') || undefined;

    // 3. Ambil data instrumen evaluasi terintegrasi
    const result = await getLkeExportData(periodeId);
    if (!result.success || !result.data) {
      return NextResponse.json(
        {
          error:
            result.error || 'Gagal mengumpulkan data instrumen evaluasi LKE.'
        },
        { status: 500 }
      );
    }

    const { data } = result;

    // 4. Generate Workbook ExcelJS
    const workbook = await generateLkeExcelWorkbook(data);

    // 5. Write to buffer
    const buffer = await workbook.xlsx.writeBuffer();

    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const yyyymmdd = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
    const hhmm = `${pad(now.getHours())}${pad(now.getMinutes())}`;
    const timestampStr = `${yyyymmdd}_${hhmm}`;
    const fileName = `LKE_BPS_Sitaro_${data.periode.tahun}_Generated_${timestampStr}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0'
      }
    });
  } catch (error: any) {
    // eslint-disable-next-line no-console
    console.error('[API-EXPORT-LKE] Error generating Excel export:', error);
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Terjadi kesalahan internal saat membuat file Excel Kertas Kerja LKE.'
      },
      { status: 500 }
    );
  }
}
