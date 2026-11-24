import { NextRequest, NextResponse } from 'next/server';
import {
  MASTER_TEMPLATE_LIST,
  generateTemplateBlob,
  generateAllTemplatesZip
} from '@/lib/templates/template-generators';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id') || 'all';

    if (id === 'all' || id === 'bundle') {
      const zipBlob = await generateAllTemplatesZip();
      const buffer = Buffer.from(await zipBlob.arrayBuffer());
      return new NextResponse(buffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/zip',
          'Content-Disposition':
            'attachment; filename="Template_Baku_Bukti_Dukung_BPS_Sitaro.zip"'
        }
      });
    }

    const template = MASTER_TEMPLATE_LIST.find((t) => t.id === id);
    if (!template) {
      return NextResponse.json(
        { error: `Template '${id}' tidak ditemukan.` },
        { status: 404 }
      );
    }

    const { blob, filename } = await generateTemplateBlob(template.id);
    const buffer = Buffer.from(await blob.arrayBuffer());
    const mimeType = blob.type || 'application/octet-stream';

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': mimeType,
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Gagal menghasilkan template.' },
      { status: 500 }
    );
  }
}
