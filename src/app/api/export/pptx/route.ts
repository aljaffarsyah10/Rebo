import { NextRequest, NextResponse } from 'next/server';
import {
  generatePptxDeck,
  DEFAULT_PRESENTATION_DATA,
  PresentationDeckData
} from '@/lib/presentation/pptx-generator';
import { getActiveSatkerConfigAction } from '@/actions/satker-actions';
import { getSurveiSummaryAction } from '@/actions/survei-actions';
import { getMonitoringDashboardData } from '@/actions/monitoring-actions';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tahunParam = searchParams.get('tahun');
    const tahun = tahunParam ? parseInt(tahunParam, 10) : 2026;

    // Ambil konfigurasi Satker aktif & data riil jika tersedia
    let activeSatker = DEFAULT_PRESENTATION_DATA.satkerName;
    let satkerShort = DEFAULT_PRESENTATION_DATA.satkerShort;
    let satkerKode = DEFAULT_PRESENTATION_DATA.satkerKode;
    let namaKepala = DEFAULT_PRESENTATION_DATA.namaKepala;
    let nipKepala = DEFAULT_PRESENTATION_DATA.nipKepala;
    let namaKetuaZi = DEFAULT_PRESENTATION_DATA.namaKetuaZi;
    let ikmScore = DEFAULT_PRESENTATION_DATA.ikmScore;
    let ipakScore = DEFAULT_PRESENTATION_DATA.ipakScore;
    let totalLkeScore = DEFAULT_PRESENTATION_DATA.totalLkeScore;

    try {
      const [satkerRes, surveiRes, monitoringRes] = await Promise.allSettled([
        getActiveSatkerConfigAction(),
        getSurveiSummaryAction(),
        getMonitoringDashboardData()
      ]);

      if (
        satkerRes.status === 'fulfilled' &&
        satkerRes.value?.success &&
        satkerRes.value?.data
      ) {
        const satker = satkerRes.value.data;
        activeSatker = satker.nama_satker || activeSatker;
        satkerShort = satker.singkatan_satker || satkerShort;
        satkerKode = satker.kode_satker || satkerKode;
        namaKepala = satker.nama_kepala || namaKepala;
        nipKepala = satker.nip_kepala || nipKepala;
        namaKetuaZi = satker.nama_ketua_zi || namaKetuaZi;
      }

      if (
        surveiRes.status === 'fulfilled' &&
        surveiRes.value?.success &&
        surveiRes.value?.data
      ) {
        const survei = surveiRes.value.data;
        if (survei.surveiTerbaru?.nilai_ikm > 0)
          ikmScore = survei.surveiTerbaru.nilai_ikm;
        if (survei.surveiTerbaru?.nilai_ipak > 0)
          ipakScore = survei.surveiTerbaru.nilai_ipak;
      }

      if (
        monitoringRes.status === 'fulfilled' &&
        monitoringRes.value?.success &&
        monitoringRes.value?.data?.kpi
      ) {
        const kpi = monitoringRes.value.data.kpi;
        if (kpi.totalNilaiVerifikasi > 0) {
          totalLkeScore = Number(kpi.totalNilaiVerifikasi.toFixed(2));
        } else if (kpi.totalNilaiMandiri > 0) {
          totalLkeScore = Number(kpi.totalNilaiMandiri.toFixed(2));
        }
      }
    } catch {
      // Fallback ke DEFAULT_PRESENTATION_DATA jika query database offline/gagal
    }

    // Bangun payload presentasi deck
    const deckData: PresentationDeckData = {
      ...DEFAULT_PRESENTATION_DATA,
      satkerName: activeSatker,
      satkerShort,
      satkerKode,
      tahun,
      namaKepala,
      nipKepala,
      namaKetuaZi,
      ikmScore,
      ipakScore,
      totalLkeScore,
      slides: DEFAULT_PRESENTATION_DATA.slides.map((s) => {
        // Update data spesifik satker pada slide
        if (s.id === 1) {
          return {
            ...s,
            subtitle: `Menuju Predikat Wilayah Bebas dari Korupsi (WBK) ${satkerShort}`
          };
        }
        if (s.id === 10) {
          return {
            ...s,
            stats: [
              {
                label: 'Indeks Kepuasan Masyarakat',
                value: `${ikmScore.toFixed(2)} / 4.00`,
                sublabel: 'Kategori: SANGAT BAIK (A)',
                color: '059669'
              },
              {
                label: 'Indeks Persepsi Anti Korupsi',
                value: `${ipakScore.toFixed(2)} / 4.00`,
                sublabel: 'Kategori: SANGAT BERSIH (A+)',
                color: '003366'
              },
              {
                label: 'Total Nilai Evaluasi LKE',
                value: `${totalLkeScore.toFixed(2)}`,
                sublabel: 'Layak Diusulkan Predikat WBK',
                color: 'D97706'
              }
            ]
          };
        }
        return s;
      })
    };

    const buffer = await generatePptxDeck(deckData);
    const filename = `PAPARAN_ZI_WBK_BPS_SITARO_${tahun}.pptx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate'
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        error:
          error?.message ||
          'Terjadi kesalahan internal saat membuat berkas presentasi PPTX.'
      },
      { status: 500 }
    );
  }
}
