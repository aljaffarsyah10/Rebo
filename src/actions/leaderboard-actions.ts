/* eslint-disable no-console */
'use server';

import { getMonitoringDashboardData } from '@/actions/monitoring-actions';
import { getPilarContact } from '@/lib/notifications/contacts';
import {
  type LeaderboardSummary,
  type PilarLeaderboardItem,
  MOCK_PILAR_LEADERBOARD_RAW,
  calculateLeaderboardRanks,
  buildLeaderboardSummary,
  generateWhatsAppLeaderboardMessage
} from '@/lib/gamification/leaderboard-types';

/**
 * Server Action untuk mengambil papan peringkat (Leaderboard) 6 Pilar ZI/RB BPS Sitaro.
 * Mengintegrasikan data agregasi riil dari LKE Monitoring & Kontak Koordinator.
 * Jika data di database kosong atau belum terisi, otomatis fallback ke data mock realistis 2026.
 *
 * CATATAN PENTING: File ini memiliki direktif 'use server', hanya mengekspor fungsi async!
 */
export async function getLeaderboardPilarAction(periodeId?: string): Promise<{
  success: boolean;
  data: LeaderboardSummary;
  error?: string;
}> {
  try {
    // 1. Ambil agregasi data dari monitoring action
    const monitoringResult = await getMonitoringDashboardData(periodeId);

    if (
      !monitoringResult.success ||
      !monitoringResult.data ||
      !monitoringResult.data.pilars ||
      monitoringResult.data.pilars.length === 0
    ) {
      // Fallback ke mock data 2026
      const rankedItems = calculateLeaderboardRanks(MOCK_PILAR_LEADERBOARD_RAW);
      const summary = buildLeaderboardSummary(
        rankedItems,
        periodeId || 'default-periode-2026',
        'Evaluasi PMPRB 2026',
        2026
      );
      return {
        success: true,
        data: summary
      };
    }

    const { pilars } = monitoringResult.data;
    const currentPeriode = monitoringResult.periodes.find(
      (p) => p.id === periodeId
    ) ||
      monitoringResult.periodes.find((p) => p.is_active) || {
        id: periodeId || 'default-periode-2026',
        tahun: 2026,
        nama_periode: 'Evaluasi PMPRB 2026'
      };

    // Periksa apakah data di database memiliki indikator riil
    const hasAnyQuestions = pilars.some((p) => p.totalPertanyaan > 0);

    if (!hasAnyQuestions) {
      const rankedItems = calculateLeaderboardRanks(MOCK_PILAR_LEADERBOARD_RAW);
      const summary = buildLeaderboardSummary(
        rankedItems,
        currentPeriode.id,
        currentPeriode.nama_periode,
        currentPeriode.tahun || 2026
      );
      return {
        success: true,
        data: summary
      };
    }

    // 2. Fetch kontak masing-masing pilar secara paralel
    const rawItems: Omit<
      PilarLeaderboardItem,
      'rank' | 'status_predikat' | 'predikat_label' | 'persentase_skor'
    >[] = await Promise.all(
      pilars.map(async (pilar, idx) => {
        const pilarIdNum = Number(pilar.id_pilar) || idx + 1;
        const contact = await getPilarContact(pilarIdNum);

        const total_indikator = pilar.totalPertanyaan || 1;
        const indikator_terisi = Math.max(
          0,
          total_indikator - (pilar.belumDiisi || 0)
        );
        const indikator_diverifikasi = pilar.disetujui || 0;
        const indikator_revisi = pilar.perluRevisi || 0;

        const persentase_selesai =
          total_indikator > 0
            ? Math.round((indikator_diverifikasi / total_indikator) * 1000) / 10
            : 0;

        const tingkat_revisi_persen =
          indikator_terisi > 0
            ? Math.round((indikator_revisi / indikator_terisi) * 1000) / 10
            : 0;

        const fallbackItem =
          MOCK_PILAR_LEADERBOARD_RAW.find(
            (m) => Number(m.pilar_id) === pilarIdNum
          ) || MOCK_PILAR_LEADERBOARD_RAW[idx % 6];

        const koordinator_name =
          contact?.namaPic && !contact.namaPic.startsWith('PIC Pilar')
            ? contact.namaPic
            : fallbackItem.koordinator_name;

        const koordinator_phone =
          contact?.noWa || fallbackItem.koordinator_phone;

        const tautan_form =
          pilar.area && pilar.area.toLowerCase().includes('reform')
            ? '/rebo/formRB/reform'
            : pilarIdNum <= 3
              ? '/rebo/formRB/pemenuhan'
              : '/rebo/formRB/area';

        return {
          pilar_id: pilar.id_pilar || pilarIdNum,
          pilar_nama: pilar.nama_pilar || fallbackItem.pilar_nama,
          pilar_kode: pilar.kode_pilar || `Pilar ${pilarIdNum}`,
          koordinator_name,
          koordinator_phone,
          total_indikator,
          indikator_terisi,
          indikator_diverifikasi,
          indikator_revisi,
          persentase_selesai,
          tingkat_revisi_persen,
          skor_riil:
            pilar.nilaiVerifikasi > 0
              ? pilar.nilaiVerifikasi
              : pilar.nilaiMandiri > 0
                ? pilar.nilaiMandiri
                : fallbackItem.skor_riil,
          skor_maksimal:
            pilar.nilaiMaksimal > 0
              ? pilar.nilaiMaksimal
              : fallbackItem.skor_maksimal,
          catatan_apresiasi: fallbackItem.catatan_apresiasi,
          tautan_form
        };
      })
    );

    // 3. Hitung peringkat dan predikat sehat
    const rankedItems = calculateLeaderboardRanks(rawItems);
    const summary = buildLeaderboardSummary(
      rankedItems,
      currentPeriode.id,
      currentPeriode.nama_periode,
      currentPeriode.tahun || 2026
    );

    return {
      success: true,
      data: summary
    };
  } catch (error: any) {
    console.error(
      '[LEADERBOARD-ACTIONS] Gagal mengambil data leaderboard:',
      error
    );

    // Tetap kembalikan mock data dengan status success agar UI tidak blank
    const rankedItems = calculateLeaderboardRanks(MOCK_PILAR_LEADERBOARD_RAW);
    const summary = buildLeaderboardSummary(
      rankedItems,
      periodeId || 'default-periode-2026',
      'Evaluasi PMPRB 2026 (Mode Offline)',
      2026
    );

    return {
      success: true,
      data: summary,
      error: error?.message || 'Memuat data dengan mode offline'
    };
  }
}

/**
 * Server Action untuk menghasilkan teks WhatsApp apresiasi resmi Kepala BPS Sitaro.
 */
export async function getWhatsAppApresiasiMessageAction(
  periodeId?: string
): Promise<{
  success: boolean;
  message: string;
  error?: string;
}> {
  try {
    const res = await getLeaderboardPilarAction(periodeId);
    const message = generateWhatsAppLeaderboardMessage(res.data);
    return {
      success: true,
      message
    };
  } catch (error: any) {
    return {
      success: false,
      message: '',
      error: error?.message || 'Gagal menyusun pesan WhatsApp'
    };
  }
}
