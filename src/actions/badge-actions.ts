/* eslint-disable no-console */
'use server';

import { getLeaderboardPilarAction } from '@/actions/leaderboard-actions';
import { getCachedOrFetch, CACHE_KEYS } from '@/lib/redis/cache';
import {
  getPilarContact,
  DEFAULT_PILAR_CONTACTS
} from '@/lib/notifications/contacts';
import {
  sendWhatsAppMessage,
  createWhatsAppDeepLink
} from '@/lib/notifications/whatsapp';
import {
  type AchievementBadge,
  evaluatePilarBadges,
  evaluateAllPilarsBadges,
  formatBadgeMilestoneWAMessage
} from '@/lib/gamification/badge-types';
import {
  MOCK_PILAR_LEADERBOARD_RAW,
  calculateLeaderboardRanks,
  type PilarLeaderboardItem
} from '@/lib/gamification/leaderboard-types';

export interface BadgesActionResult {
  success: boolean;
  data?: {
    badges: AchievementBadge[];
    summary: {
      totalBadges: number;
      totalUnlocked: number;
      totalLocked: number;
      platinumUnlocked: number;
      goldUnlocked: number;
      silverUnlocked: number;
      bronzeUnlocked: number;
      pilars: {
        pilar_id: string;
        pilar_nama: string;
        pilar_kode: string;
        koordinator_name: string;
        unlocked_count: number;
        total_count: number;
      }[];
    };
  };
  error?: string;
}

export interface SendBadgeWAActionResult {
  success: boolean;
  deepLink?: string;
  recipientName?: string;
  recipientPhone?: string;
  messagePreview?: string;
  badgeTitle?: string;
  error?: string;
}

/**
 * Mengambil daftar seluruh lencana kehormatan digital beserta status unlock.
 * Dapat difilter per pilar tertentu atau menampilkan seluruh 6 pilar.
 */
export async function getAchievementBadgesAction(
  pilarId?: string
): Promise<BadgesActionResult> {
  const cacheKey =
    pilarId && pilarId !== 'ALL'
      ? `${CACHE_KEYS.BADGES}:${pilarId}`
      : CACHE_KEYS.BADGES;

  try {
    return await getCachedOrFetch(cacheKey, 300, async () => {
      // 1. Ambil data leaderboard 6 pilar terbaru
      const leaderboardRes = await getLeaderboardPilarAction();
      let pilars: PilarLeaderboardItem[] = [];

      if (leaderboardRes.success && leaderboardRes.data?.items?.length > 0) {
        pilars = leaderboardRes.data.items;
      } else {
        pilars = calculateLeaderboardRanks(MOCK_PILAR_LEADERBOARD_RAW);
      }

      // 2. Evaluasi lencana
      let badges: AchievementBadge[] = [];

      if (pilarId && pilarId !== 'ALL') {
        const selectedPilar = pilars.find(
          (p) => String(p.pilar_id) === String(pilarId)
        );
        if (selectedPilar) {
          badges = evaluatePilarBadges(selectedPilar);
        } else {
          // Fallback pilar 1
          badges = evaluatePilarBadges(pilars[0]);
        }
      } else {
        badges = evaluateAllPilarsBadges(pilars);
      }

      // 3. Ringkasan statistik
      const allBadgesEvaluated = evaluateAllPilarsBadges(pilars);
      const unlockedBadges = allBadgesEvaluated.filter((b) => b.unlocked);

      const summary = {
        totalBadges: allBadgesEvaluated.length,
        totalUnlocked: unlockedBadges.length,
        totalLocked: allBadgesEvaluated.length - unlockedBadges.length,
        platinumUnlocked: unlockedBadges.filter((b) => b.tier === 'PLATINUM')
          .length,
        goldUnlocked: unlockedBadges.filter((b) => b.tier === 'GOLD').length,
        silverUnlocked: unlockedBadges.filter((b) => b.tier === 'SILVER')
          .length,
        bronzeUnlocked: unlockedBadges.filter((b) => b.tier === 'BRONZE')
          .length,
        pilars: pilars.map((p) => {
          const pBadges = evaluatePilarBadges(p);
          return {
            pilar_id: String(p.pilar_id),
            pilar_nama: p.pilar_nama,
            pilar_kode: p.pilar_kode,
            koordinator_name: p.koordinator_name,
            unlocked_count: pBadges.filter((b) => b.unlocked).length,
            total_count: pBadges.length
          };
        })
      };

      return {
        success: true,
        data: {
          badges,
          summary
        }
      };
    });
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Gagal memuat lencana penghargaan digital';
    console.error('[getAchievementBadgesAction] Error:', err);
    return {
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Mengirimkan pesan apresiasi resmi Kepala BPS Kabupaten Kepulauan Sitaro
 * ke nomor WhatsApp koordinator pilar atas pembukaan milestone lencana penting.
 */
export async function sendBadgeMilestoneWAAction(
  badgeId: string,
  pilarId: string
): Promise<SendBadgeWAActionResult> {
  try {
    // 1. Dapatkan data leaderboard terkini untuk resolve pilar
    const leaderboardRes = await getLeaderboardPilarAction();
    let pilars: PilarLeaderboardItem[] = [];

    if (leaderboardRes.success && leaderboardRes.data?.items?.length > 0) {
      pilars = leaderboardRes.data.items;
    } else {
      pilars = calculateLeaderboardRanks(MOCK_PILAR_LEADERBOARD_RAW);
    }

    const pilar =
      pilars.find((p) => String(p.pilar_id) === String(pilarId)) || pilars[0];
    const pilarIdNum = Number(pilar.pilar_id) || 1;

    // 2. Resolve kontak WhatsApp resmi pilar
    const contact = await getPilarContact(pilarIdNum);
    const targetPhone =
      contact?.noWa ||
      pilar.koordinator_phone ||
      DEFAULT_PILAR_CONTACTS[pilarIdNum]?.noWa ||
      '082190010001';
    const targetName =
      contact?.namaPic ||
      pilar.koordinator_name ||
      DEFAULT_PILAR_CONTACTS[pilarIdNum]?.namaPic ||
      `Koordinator ${pilar.pilar_kode}`;

    // 3. Evaluasi badge terkait
    const pilarBadges = evaluatePilarBadges(pilar);
    const badge = pilarBadges.find((b) => b.id === badgeId) || pilarBadges[0];

    // 4. Susun pesan apresiasi resmi
    const message = formatBadgeMilestoneWAMessage({
      badge,
      pilarNama: pilar.pilar_nama,
      koordinatorName: targetName,
      tahun: 2026
    });

    // 5. Generate deep link untuk pengiriman instan gratis via browser
    const deepLink = createWhatsAppDeepLink(targetPhone, message);

    // 6. Coba kirim via automated webhook / gateway jika dikonfigurasi
    const sendResult = await sendWhatsAppMessage({
      phone: targetPhone,
      message
    });

    return {
      success: true,
      deepLink,
      recipientName: targetName,
      recipientPhone: targetPhone,
      messagePreview: message,
      badgeTitle: badge.title,
      error: sendResult.success ? undefined : sendResult.error
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Gagal memproses pengiriman notifikasi apresiasi WhatsApp';
    console.error('[sendBadgeMilestoneWAAction] Error:', err);
    return {
      success: false,
      error: errorMsg
    };
  }
}

/**
 * Mengambil lencana khusus untuk pilar yang ditugaskan kepada pengguna saat ini.
 */
export async function getUserPilarBadgesAction(
  pilarId: number | string
): Promise<{
  success: boolean;
  badges: AchievementBadge[];
  unlockedCount: number;
  totalCount: number;
  pilarNama: string;
  error?: string;
}> {
  try {
    const result = await getAchievementBadgesAction(String(pilarId));
    if (!result.success || !result.data) {
      return {
        success: false,
        badges: [],
        unlockedCount: 0,
        totalCount: 0,
        pilarNama: `Pilar ${pilarId}`,
        error: result.error || 'Gagal memuat lencana pilar'
      };
    }

    const badges = result.data.badges;
    const unlockedCount = badges.filter((b) => b.unlocked).length;
    const pilarNama = badges[0]?.pilar_nama || `Pilar ${pilarId}`;

    return {
      success: true,
      badges,
      unlockedCount,
      totalCount: badges.length,
      pilarNama
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error
        ? err.message
        : 'Gagal memuat lencana profil pengguna';
    return {
      success: false,
      badges: [],
      unlockedCount: 0,
      totalCount: 0,
      pilarNama: `Pilar ${pilarId}`,
      error: errorMsg
    };
  }
}
