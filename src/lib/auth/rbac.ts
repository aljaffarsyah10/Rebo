import { auth, currentUser } from '@clerk/nextjs/server';
import type { UserRole } from '@/types/globals';

export type { UserRole };

// ==============================================================================
// REBO V2: Role Constants & Definitions
// ==============================================================================

export const USER_ROLES = {
  ADMIN: 'admin',
  KOORDINATOR: 'koordinator',
  OPERATOR: 'operator',
  TPI: 'tpi'
} as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Super Admin',
  koordinator: 'Koordinator Pilar',
  operator: 'Operator Tim',
  tpi: 'Tim Penilai Internal (TPI)'
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  admin:
    'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-300',
  koordinator:
    'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300',
  operator:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300',
  tpi: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300'
};

export interface PilarDefinition {
  id: string;
  kode: string;
  nama: string;
  deskripsi: string;
}

export const PILAR_LIST: readonly PilarDefinition[] = [
  {
    id: '1',
    kode: 'Pilar 1',
    nama: 'Manajemen Perubahan',
    deskripsi: 'Transformasi pola pikir dan budaya kerja instansi.'
  },
  {
    id: '2',
    kode: 'Pilar 2',
    nama: 'Tata Laksana',
    deskripsi: 'Penerapan SOP, e-Government, dan keterbukaan informasi.'
  },
  {
    id: '3',
    kode: 'Pilar 3',
    nama: 'Penataan Sistem Manajemen SDM',
    deskripsi: 'Pengembangan kompetensi, disiplin, dan kinerja aparatur.'
  },
  {
    id: '4',
    kode: 'Pilar 4',
    nama: 'Penguatan Akuntabilitas',
    deskripsi: 'Penyusunan target kinerja dan pelaporan SAKIP/LAKIP.'
  },
  {
    id: '5',
    kode: 'Pilar 5',
    nama: 'Penguatan Pengawasan',
    deskripsi: 'Pengendalian gratifikasi, SPIP, WBS, dan benturan kepentingan.'
  },
  {
    id: '6',
    kode: 'Pilar 6',
    nama: 'Peningkatan Kualitas Pelayanan Publik',
    deskripsi: 'Standar pelayanan, budaya pelayanan prima, dan survei kepuasan.'
  }
] as const;

export function getPilarInfo(
  pilarId?: string | number | null
): PilarDefinition | undefined {
  if (!pilarId) return undefined;
  return PILAR_LIST.find((p) => p.id === String(pilarId));
}

// ==============================================================================
// Server-side Session & Authentication Helper
// ==============================================================================

export interface UserSession {
  userId: string | null;
  role: UserRole | null;
  assignedPilarId: string | null;
  email: string | null;
  fullName: string | null;
}

/**
 * Mengambil sesi pengguna saat ini di server-side (Server Components & Server Actions).
 * Mengembalikan objek terstandar: { userId, role, assignedPilarId, email, fullName }.
 */
export async function getCurrentUserSession(): Promise<UserSession> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    return {
      userId: null,
      role: null,
      assignedPilarId: null,
      email: null,
      fullName: null
    };
  }

  // Coba ambil dari sessionClaims metadata terlebih dahulu
  const metadata = sessionClaims?.metadata as
    | { role?: UserRole; assigned_pilar_id?: string | null }
    | undefined;

  let role: UserRole | null = metadata?.role || null;
  let assignedPilarId: string | null = metadata?.assigned_pilar_id || null;
  let email: string | null = null;
  let fullName: string | null = null;

  try {
    const user = await currentUser();
    if (user) {
      if (!role && user.publicMetadata?.role) {
        role = user.publicMetadata.role as UserRole;
      }
      if (!assignedPilarId && user.publicMetadata?.assigned_pilar_id) {
        assignedPilarId = user.publicMetadata.assigned_pilar_id as string;
      }

      email =
        user.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
          ?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress ||
        null;

      fullName =
        [user.firstName, user.lastName].filter(Boolean).join(' ').trim() ||
        user.username ||
        null;
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      '[RBAC] getCurrentUserSession error fetching user profile:',
      error
    );
  }

  return {
    userId,
    role,
    assignedPilarId,
    email,
    fullName
  };
}

/**
 * Mengambil role pengguna aktif saat ini.
 */
export async function getCurrentUserRole(): Promise<UserRole | null> {
  const session = await getCurrentUserSession();
  return session.role;
}

// ==============================================================================
// RBAC Permission Check Functions
// ==============================================================================

/**
 * Memeriksa apakah role adalah Super Admin.
 */
export function isAdmin(role?: string | null): boolean {
  return role === USER_ROLES.ADMIN;
}

/**
 * Memeriksa apakah role adalah Koordinator Pilar (opsional untuk pilar tertentu).
 */
export function isKoordinator(
  role?: string | null,
  userPilarId?: string | null,
  targetPilarId?: string | null
): boolean {
  if (role !== USER_ROLES.KOORDINATOR) return false;
  if (!targetPilarId) return true;
  return String(userPilarId) === String(targetPilarId);
}

/**
 * Memeriksa apakah role adalah Operator Tim (opsional untuk pilar tertentu).
 */
export function isOperator(
  role?: string | null,
  userPilarId?: string | null,
  targetPilarId?: string | null
): boolean {
  if (role !== USER_ROLES.OPERATOR) return false;
  if (!targetPilarId) return true;
  return String(userPilarId) === String(targetPilarId);
}

/**
 * Memeriksa apakah role adalah Tim Penilai Internal (TPI).
 */
export function isTPI(role?: string | null): boolean {
  return role === USER_ROLES.TPI;
}

/**
 * Memeriksa apakah pengguna memiliki hak akses untuk mengubah / mengunggah bukti dukung
 * dan mengisi opsi jawaban penilaian mandiri.
 *
 * Aturan RBAC:
 * - Super Admin: Memiliki akses ke seluruh pilar.
 * - Operator pilar terkait: Memiliki akses edit ke pilar yang ditugaskan.
 * - Koordinator pilar terkait: Memiliki akses edit ke pilar yang ditugaskan.
 * - TPI & Pengguna tanpa peran: Tidak memiliki izin mengedit bukti/mandiri (read-only).
 */
export function canEditBukti(
  role?: string | null,
  userPilarId?: string | null,
  targetPilarId?: string | null
): boolean {
  if (isAdmin(role)) return true;

  if (role === USER_ROLES.OPERATOR || role === USER_ROLES.KOORDINATOR) {
    if (!targetPilarId) return true;
    return !!userPilarId && String(userPilarId) === String(targetPilarId);
  }

  return false;
}

/**
 * Memeriksa apakah pengguna memiliki hak akses untuk memverifikasi bukti dukung
 * (mengubah status persetujuan, mengisi catatan koordinator, dan memberi skor verifikasi).
 *
 * Aturan RBAC:
 * - Super Admin: Memiliki akses verifikasi ke seluruh pilar.
 * - TPI (Tim Penilai Internal): Memiliki akses verifikasi ke seluruh pilar.
 * - Koordinator pilar terkait: Memiliki akses verifikasi hanya pada pilar yang diampunya.
 * - Operator Tim: Tidak diizinkan melakukan verifikasi / mengubah status.
 */
export function canVerifyBukti(
  role?: string | null,
  userPilarId?: string | null,
  targetPilarId?: string | null
): boolean {
  if (isAdmin(role)) return true;
  if (isTPI(role)) return true;

  if (role === USER_ROLES.KOORDINATOR) {
    if (!targetPilarId) return true;
    return !!userPilarId && String(userPilarId) === String(targetPilarId);
  }

  return false;
}

/**
 * Memeriksa apakah pengguna memiliki hak untuk mengelola master data
 * (periode evaluasi, pilar, subpilar, pertanyaan, kategori bobot).
 *
 * Aturan RBAC:
 * - Hanya Super Admin yang berhak mengelola master data.
 */
export function canManageMasterData(role?: string | null): boolean {
  return isAdmin(role);
}
