/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { getActivePeriode, getAllPeriode } from '@/lib/api/rebo';
import { calculateWBKSimulation } from '@/lib/simulation/wbk-gap-analysis';
import { getSurveiSummaryAction } from '@/actions/survei-actions';
import { getCachedOrFetch, CACHE_KEYS } from '@/lib/redis/cache';
import type {
  MonitoringDashboardData,
  MonitoringKPIData,
  PilarProgressItem,
  SubpilarProgressItem,
  PilarBarChartItem,
  StatusDistributionItem,
  StatusKelengkapan,
  PeriodeEvaluasi
} from '@/types/rebo';

/**
 * Server action untuk mengambil seluruh data agregasi Monitoring LKE Real-Time:
 * - Join berjenjang pilar -> subpilar -> pertanyaan -> kategoriPenilaian
 * - Join pertanyaan_periode (V2) dengan fallback buktiDukung (V1)
 * - Agregasi KPI (Total Pertanyaan, Disetujui, Perlu Revisi, %, Komparasi Skor Mandiri vs Verifikasi vs Maks)
 * - Dataset Recharts Bar Chart komparasi pilar & Donut Chart distribusi status kelengkapan
 * - Detail capaian per pilar & subpilar
 */
export async function getMonitoringDashboardData(periodeId?: string): Promise<{
  success: boolean;
  data: MonitoringDashboardData;
  periodes: PeriodeEvaluasi[];
  error?: string;
}> {
  const cacheKey = periodeId
    ? `${CACHE_KEYS.MONITORING_GLOBAL}:${periodeId}`
    : CACHE_KEYS.MONITORING_GLOBAL;

  try {
    return await getCachedOrFetch(cacheKey, 300, async () => {
      const supabase = await createClient();

      // 1. Dapatkan daftar seluruh periode & periode target
      const allPeriodes = await getAllPeriode();
      let currentPeriode: PeriodeEvaluasi | null = null;

      if (periodeId) {
        currentPeriode = allPeriodes.find((p) => p.id === periodeId) || null;
      }

      if (!currentPeriode) {
        currentPeriode = allPeriodes.find((p) => p.is_active) ||
          (await getActivePeriode()) || {
            id: 'default-periode-2026',
            tahun: 2026,
            nama_periode: 'Evaluasi PMPRB 2026',
            is_active: true,
            is_locked: false
          };
      }

      // 2. Fetch seluruh data independen secara paralel (Pilar, PP, Legacy, PilarHasil, Survei)
      const [pilarsRes, ppRes, legacyRes, pilarHasilRes, surveiRes] =
        await Promise.all([
          supabase
            .from('pilar')
            .select(
              `id_pilar,
         nama_pilar,
         id_area,
         area (id_area, nama_area),
         subpilar (
           id_subpilar,
           nama_subpilar,
           id_pilar,
           pertanyaan (
             id_pertanyaan,
             deskripsi_pertanyaan,
             uraian_buktidukung,
             kategoriPenilaian (id_kategori, uraian_kategori, nilai)
           )
         )`
            )
            .order('id_pilar', { ascending: true }),
          supabase
            .from('pertanyaan_periode')
            .select('*, dokumen_bukti (*)')
            .eq('id_periode', currentPeriode.id),
          supabase.from('buktiDukung').select('*'),
          Promise.resolve(
            supabase.from('pilarHasil').select('skor_pilarHasil')
          ).catch(() => ({ data: null })),
          getSurveiSummaryAction().catch(() => ({
            success: false,
            data: undefined
          }))
        ]);

      const { data: pilarsData, error: pilarsError } = pilarsRes;
      if (pilarsError) {
        console.error(
          '[MONITORING-ACTIONS] Error fetching pilars:',
          pilarsError
        );
        throw new Error(`Gagal memuat data pilar: ${pilarsError.message}`);
      }

      const ppMap = new Map<string, any>();
      (ppRes.data || []).forEach((row) => {
        ppMap.set(String(row.id_pertanyaan), row);
      });

      const legacyMap = new Map<string, any>();
      (legacyRes.data || []).forEach((row) => {
        legacyMap.set(String(row.id_pertanyaan), row);
      });

      let totalSkorPilarHasil = 0;
      const pilarHasilRows = pilarHasilRes?.data;
      if (pilarHasilRows && pilarHasilRows.length > 0) {
        totalSkorPilarHasil = pilarHasilRows.reduce(
          (sum: number, r: any) => sum + (Number(r.skor_pilarHasil) || 0),
          0
        );
      }

      // 6. Lakukan iterasi kalkulasi berjenjang
      let globalTotalPertanyaan = 0;
      let globalTotalBelumDiisi = 0;
      let globalTotalMenungguReview = 0;
      let globalTotalSelesai = 0;
      let globalTotalRevisi = 0;
      let globalNilaiMandiri = 0;
      let globalNilaiVerifikasi = 0;
      let globalNilaiMaksimal = 0;

      const pilarProgressList: PilarProgressItem[] = [];
      const allQuestionItems: any[] = [];

      (pilarsData || []).forEach((pilar: any) => {
        const pilarIdStr = String(pilar.id_pilar);
        const pilarNama = pilar.nama_pilar || `Pilar ${pilarIdStr}`;
        const kodePilar = pilar.kode_pilar || `Pilar ${pilarIdStr}`;
        const areaObj = pilar.area || {};
        const areaName =
          areaObj.nama_area ||
          (pilar.id_area === 2 ? 'Area Reform' : 'Area Pemenuhan');

        let pilarTotalPertanyaan = 0;
        let pilarBelumDiisi = 0;
        let pilarMenungguReview = 0;
        let pilarDisetujui = 0;
        let pilarPerluRevisi = 0;
        let pilarNilaiMandiri = 0;
        let pilarNilaiVerifikasi = 0;
        let pilarNilaiMaksimal = 0;

        const subpilarProgressList: SubpilarProgressItem[] = [];

        const subpilars = pilar.subpilar || [];
        // Urutkan subpilar berdasarkan id_subpilar
        subpilars.sort((a: any, b: any) =>
          String(a.id_subpilar).localeCompare(
            String(b.id_subpilar),
            undefined,
            {
              numeric: true
            }
          )
        );

        subpilars.forEach((sub: any) => {
          const subIdStr = String(sub.id_subpilar);
          const subNama = sub.nama_subpilar || `Subpilar ${subIdStr}`;

          let subTotalPertanyaan = 0;
          let subBelumDiisi = 0;
          let subMenungguReview = 0;
          let subDisetujui = 0;
          let subPerluRevisi = 0;
          let subNilaiMandiri = 0;
          let subNilaiVerifikasi = 0;
          let subNilaiMaksimal = 0;

          const questions = sub.pertanyaan || [];
          questions.forEach((q: any) => {
            const qIdStr = String(q.id_pertanyaan);
            subTotalPertanyaan += 1;

            // Hitung nilai maksimal dari pilihan kategori penilaian
            const kategoriList = q.kategoriPenilaian || [];
            let maxNilai = 0;
            if (kategoriList.length > 0) {
              maxNilai = Math.max(
                ...kategoriList.map((k: any) => Number(k.nilai) || 0)
              );
            }
            subNilaiMaksimal += maxNilai;

            // Ambil status & nilai dari pertanyaan_periode (V2) atau fallback buktiDukung (V1)
            const pp = ppMap.get(qIdStr);
            const legacy = legacyMap.get(qIdStr);

            let status: StatusKelengkapan = 0;
            let mandiriVal = 0;
            let verifVal = 0;

            if (pp) {
              const rawStatus = Number(pp.status_kelengkapan);
              status = (
                [0, 1, 2, 3].includes(rawStatus) ? rawStatus : 0
              ) as StatusKelengkapan;
              mandiriVal = Number(pp.nilai_mandiri) || 0;
              verifVal = Number(pp.nilai_verifikasi) || 0;
            } else if (legacy) {
              const rawLegacyStatus = Number(legacy.status_kelengkapan);
              status = (
                [0, 1, 2, 3].includes(rawLegacyStatus) ? rawLegacyStatus : 0
              ) as StatusKelengkapan;
              mandiriVal = Number(legacy.nilai_mandiri) || 0;
              verifVal =
                Number(legacy.nilai_verifikasi) ||
                Number(legacy.nilai_akhir) ||
                0;
            }

            if (status === 0) subBelumDiisi += 1;
            else if (status === 1) subMenungguReview += 1;
            else if (status === 2) subDisetujui += 1;
            else if (status === 3) subPerluRevisi += 1;

            subNilaiMandiri += mandiriVal;
            subNilaiVerifikasi += verifVal;

            allQuestionItems.push({
              id_pertanyaan: qIdStr,
              id_pilar: pilarIdStr,
              kode_pilar: kodePilar,
              nama_pilar: pilarNama,
              id_subpilar: subIdStr,
              nama_subpilar: subNama,
              deskripsi_pertanyaan:
                q.deskripsi_pertanyaan ||
                q.uraian_pertanyaan ||
                q.uraian_buktidukung ||
                'Indikator LKE',
              status_kelengkapan: status,
              nilai_mandiri: mandiriVal,
              nilai_verifikasi: verifVal,
              nilai_maks: maxNilai
            });
          });

          const subPersenSelesai =
            subTotalPertanyaan > 0
              ? Math.round((subDisetujui / subTotalPertanyaan) * 100)
              : 0;

          subpilarProgressList.push({
            id_subpilar: subIdStr,
            nama_subpilar: subNama,
            totalPertanyaan: subTotalPertanyaan,
            belumDiisi: subBelumDiisi,
            menungguReview: subMenungguReview,
            disetujui: subDisetujui,
            perluRevisi: subPerluRevisi,
            persentaseSelesai: subPersenSelesai,
            nilaiMandiri: Number(subNilaiMandiri.toFixed(2)),
            nilaiVerifikasi: Number(subNilaiVerifikasi.toFixed(2)),
            nilaiMaksimal: Number(subNilaiMaksimal.toFixed(2))
          });

          // Akumulasi ke pilar
          pilarTotalPertanyaan += subTotalPertanyaan;
          pilarBelumDiisi += subBelumDiisi;
          pilarMenungguReview += subMenungguReview;
          pilarDisetujui += subDisetujui;
          pilarPerluRevisi += subPerluRevisi;
          pilarNilaiMandiri += subNilaiMandiri;
          pilarNilaiVerifikasi += subNilaiVerifikasi;
          pilarNilaiMaksimal += subNilaiMaksimal;
        });

        const pilarPersenSelesai =
          pilarTotalPertanyaan > 0
            ? Math.round((pilarDisetujui / pilarTotalPertanyaan) * 100)
            : 0;

        pilarProgressList.push({
          id_pilar: pilarIdStr,
          nama_pilar: pilarNama,
          kode_pilar: kodePilar,
          area: areaName,
          totalPertanyaan: pilarTotalPertanyaan,
          belumDiisi: pilarBelumDiisi,
          menungguReview: pilarMenungguReview,
          disetujui: pilarDisetujui,
          perluRevisi: pilarPerluRevisi,
          persentaseSelesai: pilarPersenSelesai,
          nilaiMandiri: Number(pilarNilaiMandiri.toFixed(2)),
          nilaiVerifikasi: Number(pilarNilaiVerifikasi.toFixed(2)),
          nilaiMaksimal: Number(pilarNilaiMaksimal.toFixed(2)),
          subpilars: subpilarProgressList
        });

        // Akumulasi ke KPI global
        globalTotalPertanyaan += pilarTotalPertanyaan;
        globalTotalBelumDiisi += pilarBelumDiisi;
        globalTotalMenungguReview += pilarMenungguReview;
        globalTotalSelesai += pilarDisetujui;
        globalTotalRevisi += pilarPerluRevisi;
        globalNilaiMandiri += pilarNilaiMandiri;
        globalNilaiVerifikasi += pilarNilaiVerifikasi;
        globalNilaiMaksimal += pilarNilaiMaksimal;
      });

      // 7. Hitung KPI Cards
      const persentaseKelengkapan =
        globalTotalPertanyaan > 0
          ? Math.round((globalTotalSelesai / globalTotalPertanyaan) * 100)
          : 0;

      const persentaseSkorMandiri =
        globalNilaiMaksimal > 0
          ? Math.round((globalNilaiMandiri / globalNilaiMaksimal) * 100)
          : 0;

      const persentaseSkorVerifikasi =
        globalNilaiMaksimal > 0
          ? Math.round((globalNilaiVerifikasi / globalNilaiMaksimal) * 100)
          : 0;

      const kpi: MonitoringKPIData = {
        totalPertanyaan: globalTotalPertanyaan,
        totalSelesai: globalTotalSelesai,
        totalRevisi: globalTotalRevisi,
        totalMenungguReview: globalTotalMenungguReview,
        totalBelumDiisi: globalTotalBelumDiisi,
        persentaseKelengkapan,
        totalNilaiMandiri: Number(globalNilaiMandiri.toFixed(2)),
        totalNilaiVerifikasi: Number(globalNilaiVerifikasi.toFixed(2)),
        totalNilaiMaksimal: Number(globalNilaiMaksimal.toFixed(2)),
        persentaseSkorMandiri,
        persentaseSkorVerifikasi,
        totalSkorPilarHasil: Number(totalSkorPilarHasil.toFixed(2))
      };

      // 8. Susun data Recharts Bar Chart (Komparasi per Pilar)
      const barChartData: PilarBarChartItem[] = pilarProgressList.map((p) => ({
        name: p.kode_pilar,
        fullName: p.nama_pilar,
        pilarId: p.id_pilar,
        skorMandiri: p.nilaiMandiri,
        skorVerifikasi: p.nilaiVerifikasi,
        skorMaksimal: p.nilaiMaksimal,
        persentaseSelesai: p.persentaseSelesai
      }));

      // 9. Susun data Recharts Donut/Pie Chart (Distribusi Status Kelengkapan)
      const statusDistribution: StatusDistributionItem[] = [
        {
          name: 'Belum Diisi',
          value: globalTotalBelumDiisi,
          color: '#94a3b8', // Slate-400
          code: 0
        },
        {
          name: 'Menunggu Review',
          value: globalTotalMenungguReview,
          color: '#f59e0b', // Amber-500
          code: 1
        },
        {
          name: 'Disetujui',
          value: globalTotalSelesai,
          color: '#10b981', // Emerald-500
          code: 2
        },
        {
          name: 'Perlu Revisi',
          value: globalTotalRevisi,
          color: '#f43f5e', // Rose-500
          code: 3
        }
      ];

      // 10. Hitung simulasi capaian predikat WBK/WBBM & Quick-Wins
      const simulation = calculateWBKSimulation(
        allQuestionItems,
        totalSkorPilarHasil
      );

      return {
        success: true,
        periodes: allPeriodes,
        data: {
          periode: currentPeriode,
          kpi,
          pilars: pilarProgressList,
          statusDistribution,
          barChartData,
          simulation,
          surveiSummary: surveiRes.data
        }
      };
    });
  } catch (error: any) {
    console.error(
      '[MONITORING-ACTIONS] getMonitoringDashboardData error:',
      error
    );
    return {
      success: false,
      error:
        error?.message || 'Terjadi kesalahan saat memuat dashboard monitoring.',
      periodes: [],
      data: {
        periode: null,
        kpi: {
          totalPertanyaan: 0,
          totalSelesai: 0,
          totalRevisi: 0,
          totalMenungguReview: 0,
          totalBelumDiisi: 0,
          persentaseKelengkapan: 0,
          totalNilaiMandiri: 0,
          totalNilaiVerifikasi: 0,
          totalNilaiMaksimal: 0,
          persentaseSkorMandiri: 0,
          persentaseSkorVerifikasi: 0,
          totalSkorPilarHasil: 0
        },
        pilars: [],
        statusDistribution: [],
        barChartData: [],
        simulation: calculateWBKSimulation([], 0)
      }
    };
  }
}
