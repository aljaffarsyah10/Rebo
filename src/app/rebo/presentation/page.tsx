import React from 'react';
import type { Metadata } from 'next';
import { getActiveSatkerConfigAction } from '@/actions/satker-actions';
import { getSurveiSummaryAction } from '@/actions/survei-actions';
import { getMonitoringDashboardData } from '@/actions/monitoring-actions';
import {
  DEFAULT_PRESENTATION_DATA,
  PresentationDeckData
} from '@/lib/presentation/pptx-generator';
import PresentationDeckClient from '@/components/rebo/presentation-deck-client';

export const metadata: Metadata = {
  title: 'Generator Slide Paparan ZI (PPTX) | REBO V2',
  description:
    'Pembuatan berkas presentasi PowerPoint (.pptx) paparan Zona Integritas BPS Kabupaten Kepulauan Sitaro secara otomatis dari data riil sistem REBO untuk dipaparkan di hadapan Tim Penilai Nasional (TPN KemenPAN-RB / TPI BPS RI).'
};

export const dynamic = 'force-dynamic';

export default async function PresentationPage() {
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
    // Fallback otomatis
  }

  const initialDeckData: PresentationDeckData = {
    ...DEFAULT_PRESENTATION_DATA,
    satkerName: activeSatker,
    satkerShort,
    satkerKode,
    tahun: 2026,
    namaKepala,
    nipKepala,
    namaKetuaZi,
    ikmScore,
    ipakScore,
    totalLkeScore,
    slides: DEFAULT_PRESENTATION_DATA.slides.map((s) => {
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

  return <PresentationDeckClient initialData={initialDeckData} />;
}
