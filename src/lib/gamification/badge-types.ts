/**
 * Lencana Penghargaan Digital (Achievement Badges) REBO V2
 * BPS Kabupaten Kepulauan Sitaro
 *
 * Definisi tipe data, 8 Lencana Kehormatan Baku ZI, konfigurasi tier gradasi visual,
 * engine evaluasi otomatis capaian pilar, dan template notifikasi WhatsApp resmi Kepala BPS Sitaro.
 */

import {
  type PilarLeaderboardItem,
  MOCK_PILAR_LEADERBOARD_RAW,
  calculateLeaderboardRanks
} from './leaderboard-types';

export type BadgeCategory =
  | 'INTEGRITAS'
  | 'KEPATUHAN'
  | 'KECEPATAN'
  | 'KUALITAS_DOKUMEN'
  | 'INOVASI';

export type BadgeTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  icon_name: string;
  tier: BadgeTier;
  criteria_summary: string;
  unlocked: boolean;
  unlocked_at?: string;
  pilar_id?: string;
  pilar_nama?: string;
  pilar_kode?: string;
  recipient_name?: string;
  recipient_phone?: string;
  progress_percent?: number;
  milestone_description?: string;
}

export interface BadgeTierConfig {
  name: BadgeTier;
  label: string;
  tierIcon: string;
  badgeBg: string;
  textColor: string;
  borderColor: string;
  gradientBg: string;
  glowClass: string;
  accentHex: string;
  ribbonGradient: string;
}

/**
 * Konfigurasi Visual Tier 3D & Efek Glow
 */
export const BADGE_TIER_CONFIGS: Record<BadgeTier, BadgeTierConfig> = {
  BRONZE: {
    name: 'BRONZE',
    label: 'Perunggu (Bronze)',
    tierIcon: '🥉',
    badgeBg: 'bg-amber-900/15',
    textColor: 'text-amber-800 dark:text-amber-300',
    borderColor: 'border-amber-700/50 dark:border-amber-700/60',
    gradientBg:
      'from-amber-700/20 via-amber-800/10 to-amber-950/20 dark:from-amber-950/40 dark:via-amber-900/20 dark:to-slate-900',
    glowClass:
      'shadow-amber-900/20 hover:shadow-amber-800/40 hover:border-amber-600',
    accentHex: '#B45309',
    ribbonGradient: 'bg-gradient-to-r from-amber-700 via-amber-800 to-amber-900'
  },
  SILVER: {
    name: 'SILVER',
    label: 'Perak (Silver)',
    tierIcon: '🥈',
    badgeBg: 'bg-slate-400/15',
    textColor: 'text-slate-700 dark:text-slate-300',
    borderColor: 'border-slate-300 dark:border-slate-600',
    gradientBg:
      'from-slate-200/50 via-slate-100/30 to-slate-300/40 dark:from-slate-800/60 dark:via-slate-900 dark:to-slate-800/40',
    glowClass:
      'shadow-slate-400/20 hover:shadow-slate-300/50 hover:border-slate-400',
    accentHex: '#64748B',
    ribbonGradient: 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-600'
  },
  GOLD: {
    name: 'GOLD',
    label: 'Emas (Gold)',
    tierIcon: '🥇',
    badgeBg: 'bg-amber-500/15',
    textColor: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-amber-400/70 dark:border-amber-500/60',
    gradientBg:
      'from-amber-400/25 via-yellow-300/20 to-amber-500/20 dark:from-amber-900/40 dark:via-yellow-950/30 dark:to-amber-900/20',
    glowClass:
      'shadow-amber-500/25 hover:shadow-amber-400/50 hover:border-amber-400',
    accentHex: '#F59E0B',
    ribbonGradient:
      'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500'
  },
  PLATINUM: {
    name: 'PLATINUM',
    label: 'Platinum (Elite)',
    tierIcon: '💎',
    badgeBg: 'bg-cyan-500/15',
    textColor: 'text-cyan-600 dark:text-cyan-400',
    borderColor: 'border-cyan-400/80 dark:border-cyan-500/70',
    gradientBg:
      'from-cyan-400/25 via-indigo-400/20 to-purple-500/25 dark:from-cyan-950/50 dark:via-indigo-950/40 dark:to-purple-950/40',
    glowClass:
      'shadow-cyan-400/30 hover:shadow-cyan-300/60 hover:border-cyan-400',
    accentHex: '#06B6D4',
    ribbonGradient:
      'bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500'
  }
};

/**
 * 8 Baku Lencana Kehormatan ZI BPS Sitaro (Master Blueprint)
 */
export const MASTER_ACHIEVEMENT_BADGES: Omit<
  AchievementBadge,
  | 'unlocked'
  | 'unlocked_at'
  | 'pilar_id'
  | 'pilar_nama'
  | 'pilar_kode'
  | 'recipient_name'
  | 'recipient_phone'
  | 'progress_percent'
>[] = [
  {
    id: 'speed-star',
    title: 'Speed Star',
    description:
      'Lencana kehormatan pilar tercepat yang sukses menyelesaikan verifikasi seluruh berkas bukti dukung 100% tuntas sebelum batas evaluasi berakhir.',
    category: 'KECEPATAN',
    icon_name: 'Zap',
    tier: 'GOLD',
    criteria_summary: 'Verifikasi berkas 100% disetujui TPI tanpa tunggakan.'
  },
  {
    id: 'zero-revision-champion',
    title: 'Zero Revision Champion',
    description:
      'Pilar teladan dengan standar akurasi prima: berkas bukti dukung lolos verifikasi tanpa catatan pengembalian atau revisi (Clean Sheet).',
    category: 'KUALITAS_DOKUMEN',
    icon_name: 'ShieldCheck',
    tier: 'PLATINUM',
    criteria_summary:
      'Tingkat revisi berkas 0.0% dengan minimal 10 indikator terisi dan disetujui.'
  },
  {
    id: 'pilar-terdisiplin',
    title: 'Pilar Terdisiplin',
    description:
      'Ketepatan waktu dan kedisiplinan tingkat tinggi dalam pemenuhan berkas LKE secara menyeluruh sebelum batas waktu (deadline) evaluasi.',
    category: 'KEPATUHAN',
    icon_name: 'CheckCircle2',
    tier: 'GOLD',
    criteria_summary:
      '100% indikator terunggah lengkap sebelum jadwal evaluasi berkala.'
  },
  {
    id: 'dokumen-terlengkap',
    title: 'Dokumen Terlengkap',
    description:
      'Koleksi dokumen bukti dukung paling lengkap, terstruktur rapi, dan sesuai dengan seluruh standar penamaan baku bukti Zona Integritas.',
    category: 'KUALITAS_DOKUMEN',
    icon_name: 'FileCheck',
    tier: 'SILVER',
    criteria_summary:
      'Memiliki minimal 12 indikator terisi lengkap dengan berkas terverifikasi.'
  },
  {
    id: 'benteng-integritas',
    title: 'Benteng Integritas',
    description:
      'Dedikasi kokoh dalam penegakan kepatuhan internal, sosialisasi anti gratifikasi (UPG), pengawasan WBS, dan penegakan budaya kerja bersih.',
    category: 'INTEGRITAS',
    icon_name: 'Award',
    tier: 'PLATINUM',
    criteria_summary:
      'Kepatuhan pengawasan 100% tanpa catatan pelanggaran kode etik.'
  },
  {
    id: 'inovasi-hero',
    title: 'Inovasi Hero',
    description:
      'Pelopor transformasi digital dan inovasi tata kelola yang memberikan kemudahan nyata bagi efisiensi kerja tim maupun kepuasan publik.',
    category: 'INOVASI',
    icon_name: 'Sparkles',
    tier: 'GOLD',
    criteria_summary:
      'Implementasi inovasi SPBE / layanan publik dengan dampak terukur.'
  },
  {
    id: 'akuntabilitas-prima',
    title: 'Akuntabilitas Prima',
    description:
      'Pilar dengan capaian kinerja SAKIP, cascading indikator, dan ketercapaian target rencana aksi tertinggi mendekati skor sempurna.',
    category: 'KEPATUHAN',
    icon_name: 'Crown',
    tier: 'GOLD',
    criteria_summary:
      'Perolehan persentase skor LKE mencapai minimal 95% dari skor pagu.'
  },
  {
    id: 'pelayanan-bintang-lima',
    title: 'Pelayanan Bintang Lima',
    description:
      'Standar keunggulan pelayanan publik prima dengan respon konsultasi cepat dan kepuasan pengguna layanan statistik (PST) berpredikat A.',
    category: 'INOVASI',
    icon_name: 'Flame',
    tier: 'PLATINUM',
    criteria_summary:
      'Indeks kepuasan konsumen Sangat Baik (A) dan layanan konsultasi responsif.'
  }
];

/**
 * Engine evaluasi otomatis capaian lencana untuk satu pilar kerja.
 * Menganalisis metrik real atau mock untuk menentukan status pembukaan (unlock) lencana.
 */
export function evaluatePilarBadges(
  pilar: PilarLeaderboardItem
): AchievementBadge[] {
  const pilarIdNum = Number(pilar.pilar_id) || 1;
  const pilarKode = pilar.pilar_kode || `Pilar ${pilarIdNum}`;
  const pilarNama = pilar.pilar_nama;
  const recipientName = pilar.koordinator_name;
  const recipientPhone = pilar.koordinator_phone;

  return MASTER_ACHIEVEMENT_BADGES.map((master) => {
    let unlocked = false;
    let progress_percent = 0;
    let unlocked_at: string | undefined = undefined;
    let milestone_description: string | undefined = undefined;

    switch (master.id) {
      case 'speed-star': {
        progress_percent = Math.min(100, Math.round(pilar.persentase_selesai));
        unlocked = pilar.persentase_selesai >= 100;
        if (unlocked) {
          unlocked_at = '24 Nov 2026';
          milestone_description = `Menyelesaikan 100% verifikasi berkas (${pilar.indikator_diverifikasi}/${pilar.total_indikator} indikator).`;
        }
        break;
      }

      case 'zero-revision-champion': {
        if (pilar.indikator_terisi > 0) {
          const revPercent = pilar.tingkat_revisi_persen;
          progress_percent =
            revPercent === 0
              ? 100
              : Math.max(0, Math.round(100 - revPercent * 5));
        }
        unlocked =
          pilar.tingkat_revisi_persen === 0 &&
          pilar.indikator_diverifikasi >= 8;
        if (unlocked) {
          unlocked_at = '22 Nov 2026';
          milestone_description = `Clean sheet! 0 dokumen ditolak dari ${pilar.indikator_diverifikasi} berkas disetujui.`;
        }
        break;
      }

      case 'pilar-terdisiplin': {
        progress_percent =
          pilar.total_indikator > 0
            ? Math.min(
                100,
                Math.round(
                  (pilar.indikator_terisi / pilar.total_indikator) * 100
                )
              )
            : 0;
        unlocked =
          pilar.indikator_terisi >= pilar.total_indikator &&
          pilar.total_indikator > 0;
        if (unlocked) {
          unlocked_at = '20 Nov 2026';
          milestone_description = `Seluruh ${pilar.total_indikator} indikator diunggah tepat waktu sebelum batas akhir.`;
        }
        break;
      }

      case 'dokumen-terlengkap': {
        progress_percent = Math.min(
          100,
          Math.round((pilar.indikator_terisi / 12) * 100)
        );
        unlocked = pilar.indikator_terisi >= 12;
        if (unlocked) {
          unlocked_at = '19 Nov 2026';
          milestone_description = `Mengumpulkan ${pilar.indikator_terisi} dokumen bukti dukung terstruktur rapi.`;
        }
        break;
      }

      case 'benteng-integritas': {
        // Pilar 5 (Pengawasan) atau pilar dengan zero revisi dan kepatuhan tinggi
        progress_percent = Math.min(100, Math.round(pilar.persentase_selesai));
        unlocked =
          pilarIdNum === 5 ||
          (pilar.tingkat_revisi_persen <= 5 && pilar.persentase_selesai >= 85);
        if (unlocked) {
          unlocked_at = '23 Nov 2026';
          milestone_description =
            pilarIdNum === 5
              ? 'Penegakan SPIP, WBS, dan kepatuhan kode etik berjalan 100% aktif.'
              : 'Penerapan prinsip integritas tinggi dalam kelayakan berkas.';
        }
        break;
      }

      case 'inovasi-hero': {
        // Pilar 2 (Tatalaksana/SPBE) dan Pilar 6 (Pelayanan Publik)
        progress_percent = Math.min(100, Math.round(pilar.persentase_selesai));
        unlocked =
          pilarIdNum === 2 ||
          pilarIdNum === 6 ||
          pilar.indikator_diverifikasi >= 10;
        if (unlocked) {
          unlocked_at = '21 Nov 2026';
          milestone_description =
            pilarIdNum === 2
              ? 'Digitalisasi SOP Makro dan integrasi SPBE BPS Sitaro berhasil diterapkan.'
              : pilarIdNum === 6
                ? 'Layanan PST Digital & Generator QR Code Kepuasan Konsumen aktif melayani.'
                : 'Implementasi terobosan digitalisasi bukti dukung REBO V2.';
        }
        break;
      }

      case 'akuntabilitas-prima': {
        progress_percent = Math.min(100, Math.round(pilar.persentase_skor));
        unlocked = pilar.persentase_skor >= 95;
        if (unlocked) {
          unlocked_at = '25 Nov 2026';
          milestone_description = `Capaian skor ${pilar.persentase_skor}% (${pilar.skor_riil} dari pagu ${pilar.skor_maksimal}).`;
        }
        break;
      }

      case 'pelayanan-bintang-lima': {
        // Pilar 6 atau pilar dengan performa prima di atas 75%
        progress_percent = Math.min(100, Math.round(pilar.persentase_selesai));
        unlocked = pilarIdNum === 6 || pilar.persentase_selesai >= 90;
        if (unlocked) {
          unlocked_at = '18 Nov 2026';
          milestone_description =
            pilarIdNum === 6
              ? 'Indeks Kepuasan Konsumen PST BPS Sitaro mencapai 98.4 (Sangat Baik).'
              : 'Komitmen pelayanan prima terhadap pemenuhan standar ZI.';
        }
        break;
      }

      default:
        break;
    }

    return {
      ...master,
      unlocked,
      unlocked_at,
      pilar_id: String(pilar.pilar_id),
      pilar_nama: pilarNama,
      pilar_kode: pilarKode,
      recipient_name: recipientName,
      recipient_phone: recipientPhone,
      progress_percent,
      milestone_description
    };
  });
}

/**
 * Engine evaluasi seluruh lencana untuk seluruh 6 Pilar.
 */
export function evaluateAllPilarsBadges(
  pilars: PilarLeaderboardItem[]
): AchievementBadge[] {
  const allBadges: AchievementBadge[] = [];

  for (const pilar of pilars) {
    const pilarBadges = evaluatePilarBadges(pilar);
    allBadges.push(...pilarBadges);
  }

  return allBadges;
}

/**
 * Template Pesan WhatsApp Resmi Apresiasi Kepala BPS Kabupaten Kepulauan Sitaro
 * Dikirimkan ke grup WA tim kerja / koordinator pilar atas pencapaian milestone lencana penting.
 */
export function formatBadgeMilestoneWAMessage(params: {
  badge: AchievementBadge;
  pilarNama: string;
  koordinatorName: string;
  tahun?: number;
}): string {
  const tahun = params.tahun || new Date().getFullYear();
  const tierIcon =
    params.badge.tier === 'PLATINUM'
      ? '💎'
      : params.badge.tier === 'GOLD'
        ? '🥇'
        : params.badge.tier === 'SILVER'
          ? '🥈'
          : '🥉';

  return `*APRESIASI RESMI KEPALA BPS KABUPATEN KEPULAUAN SITARO*
Pemberian Lencana Kehormatan ZI/RB REBO V2

Yth. *${params.koordinatorName}*
dan Seluruh Anggota Tim Kerja *${params.pilarNama}*
BPS Kabupaten Kepulauan Sitaro

Dengan rasa bangga dan apresiasi yang setinggi-tingginya, atas nama Pimpinan BPS Kabupaten Kepulauan Sitaro, kami menyampaikan ucapan *SELAMAT & APRESIASI LUAR BIASA* atas keberhasilan meraih Lencana Kehormatan Digital:

${tierIcon} *Lencana:* *${params.badge.title}*
🏆 *Tingkat (Tier):* ${params.badge.tier}
📂 *Kategori:* ${params.badge.category}
🎯 *Kriteria Capaian:* ${params.badge.criteria_summary}
📅 *Tanggal Pembukaan:* ${params.badge.unlocked_at || 'Terbaru (2026)'}
${params.badge.milestone_description ? `✨ *Catatan Milestone:* ${params.badge.milestone_description}\n` : ''}
_\"${params.badge.description}\"_

Pencapaian ini mencerminkan komitmen kokoh, integritas tinggi, dan dedikasi rekan-rekan dalam mengawal Pembangunan Zona Integritas menuju Wilayah Bebas dari Korupsi (WBK) di BPS Kabupaten Kepulauan Sitaro Tahun ${tahun}.

Pertahankan integritas, jaga kekompakan tim, dan teruslah berinovasi untuk pelayanan statistik yang semakin terpercaya!

*Salam Hormat & Bangga,*
*Kepala BPS Kabupaten Kepulauan Sitaro*
_BPS Sitaro Hebat, Melayani Sepenuh Hati_
🔗 Akses Galeri Lencana: https://rebo.bps-sitaro.id/rebo/leaderboard`;
}
