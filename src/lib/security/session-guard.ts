/**
 * Session Guard & Device Security Engine untuk REBO V2
 * Satker: Badan Pusat Statistik (BPS) Kabupaten Kepulauan Sitaro
 * Standar Keamanan: ISO 27001:2022 (A.9 Access Control, A.8.11 Session Management)
 *
 * Fitur:
 * 1. Pelacak inaktivitas multi-event (mousemove, mousedown, keydown, touchstart, scroll).
 * 2. Auto-timeout 30 menit (1800 detik) untuk Komputer Bersama (Shared PC kantor BPS Sitaro).
 * 3. Early warning modal dialog 120 detik sebelum sesi ditutup otomatis dengan opsi perpanjang sesi.
 * 4. Device Fingerprinting berbasis Browser, OS, Resolusi Layar, Timezone & Platform.
 * 5. Peringatan dini login perangkat asing / mencurigakan via notifikasi WhatsApp resmi.
 */

export interface DeviceInfo {
  fingerprint: string;
  browser: string;
  browserVersion?: string;
  os: string;
  platform: string;
  screenResolution: string;
  colorDepth?: number;
  timezone: string;
  language: string;
  userAgent: string;
  hardwareConcurrency?: number;
  deviceMemory?: number;
  ipAddress?: string;
}

export interface SessionGuardConfig {
  /** Batas waktu inaktivitas hingga sesi terkunci dalam detik (Default: 1800 = 30 menit) */
  idleTimeoutSeconds: number;
  /** Batas waktu peringatan dini sebelum terkunci dalam detik (Default: 120 = 2 menit) */
  warningSeconds: number;
  /** Interval polling pengecekan timer dalam milidetik (Default: 1000ms) */
  checkIntervalMs: number;
  /** Apakah mode Komputer Bersama (Shared PC) aktif secara bawaan (Default: true) */
  sharedPcDefault: boolean;
}

export interface SuspiciousLoginWAMessageParams {
  userName: string;
  userEmail?: string | null;
  userPhone?: string | null;
  userRole?: string | null;
  deviceInfo: DeviceInfo;
  loginTime?: Date | string;
  ipAddress?: string | null;
  appUrl?: string;
}

// ==============================================================================
// 1. Konstanta Waktu & Konfigurasi Default
// ==============================================================================

/** 30 menit (1800 detik) standar inaktivitas ISO 27001 untuk komputer bersama BPS */
export const DEFAULT_IDLE_TIMEOUT_SECONDS = 1800;

/** 2 menit (120 detik) hitung mundur peringatan sebelum penguncian */
export const DEFAULT_WARNING_SECONDS = 120;

export const SESSION_STORAGE_KEYS = {
  LAST_ACTIVITY: 'rebo_v2_last_activity',
  SESSION_LOCKED: 'rebo_v2_session_locked',
  KNOWN_DEVICES: 'rebo_v2_known_devices',
  SHARED_PC_MODE: 'rebo_v2_shared_pc_mode',
  VERIFIED_SESSION: 'rebo_v2_device_verified_in_session'
} as const;

export const ACTIVITY_EVENTS = [
  'mousemove',
  'mousedown',
  'keydown',
  'touchstart',
  'scroll',
  'wheel'
] as const;

// ==============================================================================
// 2. Format Waktu WITA (Sulawesi Utara / Sitaro)
// ==============================================================================

export function formatWitaDateTime(date: Date | string = new Date()): string {
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    return (
      new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(d) + ' WITA'
    );
  } catch {
    return new Date().toISOString();
  }
}

// ==============================================================================
// 3. Device Fingerprinting & User Agent Parser
// ==============================================================================

/**
 * Parsing informasi Browser dan Sistem Operasi dari User-Agent
 */
export function parseBrowserAndOS(userAgent: string): {
  browser: string;
  browserVersion?: string;
  os: string;
} {
  const ua = userAgent || '';
  let browser = 'Unknown Browser';
  let browserVersion: string | undefined;
  let os = 'Unknown OS';

  // Deteksi OS
  if (/windows phone/i.test(ua)) {
    os = 'Windows Phone';
  } else if (/win(dows )?nt 10\.0/i.test(ua)) {
    os = 'Windows 10/11';
  } else if (/win(dows )?nt 6\.3/i.test(ua)) {
    os = 'Windows 8.1';
  } else if (/win(dows )?nt 6\.1/i.test(ua)) {
    os = 'Windows 7';
  } else if (/win(dows )?nt/i.test(ua)) {
    os = 'Windows';
  } else if (/android/i.test(ua)) {
    os = 'Android';
  } else if (/ipad|iphone|ipod/i.test(ua)) {
    os = 'iOS';
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = 'macOS';
  } else if (/linux/i.test(ua)) {
    os = 'Linux';
  }

  // Deteksi Browser (urutan penting untuk menghindari match palsu)
  if (/edg\/([0-9.]+)/i.test(ua)) {
    browser = 'Microsoft Edge';
    browserVersion = RegExp.$1;
  } else if (/opr\/([0-9.]+)|opera/i.test(ua)) {
    browser = 'Opera';
    browserVersion = RegExp.$1;
  } else if (/chrome\/([0-9.]+)/i.test(ua)) {
    browser = 'Google Chrome';
    browserVersion = RegExp.$1;
  } else if (/firefox\/([0-9.]+)/i.test(ua)) {
    browser = 'Mozilla Firefox';
    browserVersion = RegExp.$1;
  } else if (/version\/([0-9.]+).*safari/i.test(ua)) {
    browser = 'Apple Safari';
    browserVersion = RegExp.$1;
  }

  return { browser, browserVersion, os };
}

/**
 * Hash deterministik 64-bit sederhana untuk pembuatan fingerprint unik
 */
function createDeterministicHash(str: string): string {
  let hash1 = 5381;
  let hash2 = 52711;

  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash1 = (hash1 * 33) ^ char;
    hash2 = (hash2 * 33) ^ char;
  }

  const hex1 = (hash1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (hash2 >>> 0).toString(16).padStart(8, '0');
  return `dev_${hex1}${hex2}`;
}

/**
 * Mengambil informasi lengkap perangkat klien saat ini (Client-side safe)
 */
export function generateDeviceFingerprint(): DeviceInfo {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return {
      fingerprint: 'server_env',
      browser: 'Server Environment',
      os: 'Server',
      platform: 'Node.js',
      screenResolution: '0x0',
      timezone: 'Asia/Makassar',
      language: 'id-ID',
      userAgent: 'Server-Side Runner'
    };
  }

  const ua = navigator.userAgent || '';
  const { browser, browserVersion, os } = parseBrowserAndOS(ua);
  const platform =
    (navigator as any).userAgentData?.platform ||
    navigator.platform ||
    'Unknown';
  const width = window.screen?.width || 0;
  const height = window.screen?.height || 0;
  const screenResolution = `${width}x${height}`;
  const colorDepth = window.screen?.colorDepth || 24;
  const language = navigator.language || 'id-ID';
  const timezone =
    Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Makassar';
  const hardwareConcurrency = navigator.hardwareConcurrency || 4;
  const deviceMemory = (navigator as any).deviceMemory || 8;

  // Gabungkan parameter kunci untuk menghasilkan sidik jari unik
  const seed = [
    browser,
    os,
    platform,
    screenResolution,
    colorDepth,
    language,
    timezone,
    hardwareConcurrency
  ].join('||');

  const fingerprint = createDeterministicHash(seed);

  return {
    fingerprint,
    browser,
    browserVersion,
    os,
    platform,
    screenResolution,
    colorDepth,
    timezone,
    language,
    userAgent: ua,
    hardwareConcurrency,
    deviceMemory
  };
}

// ==============================================================================
// 4. Pengelolaan Perangkat Dikenali (Known Devices Local Cache)
// ==============================================================================

export function getStoredKnownDevices(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEYS.KNOWN_DEVICES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function isDeviceKnown(
  fingerprint: string,
  knownList?: string[]
): boolean {
  if (!fingerprint) return false;
  const list = knownList || getStoredKnownDevices();
  return list.includes(fingerprint);
}

export function saveKnownDevice(fingerprint: string): void {
  if (typeof window === 'undefined' || !fingerprint) return;
  try {
    const current = getStoredKnownDevices();
    if (!current.includes(fingerprint)) {
      const updated = [fingerprint, ...current].slice(0, 20); // Simpan max 20 fingerprint
      localStorage.setItem(
        SESSION_STORAGE_KEYS.KNOWN_DEVICES,
        JSON.stringify(updated)
      );
    }
  } catch {
    // Abaikan jika quota localStorage penuh
  }
}

export function clearKnownDevices(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(SESSION_STORAGE_KEYS.KNOWN_DEVICES);
  } catch {
    // no-op
  }
}

// ==============================================================================
// 5. Mode Komputer Bersama (Shared PC Mode)
// ==============================================================================

export function isSharedPcMode(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const val = localStorage.getItem(SESSION_STORAGE_KEYS.SHARED_PC_MODE);
    // Bawaan aktif (true) demi keamanan ISO 27001 di kantor BPS Sitaro
    return val === null ? true : val === 'true';
  } catch {
    return true;
  }
}

export function setSharedPcMode(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      SESSION_STORAGE_KEYS.SHARED_PC_MODE,
      enabled ? 'true' : 'false'
    );
  } catch {
    // no-op
  }
}

// ==============================================================================
// 6. Inactivity Session Tracker & Event Listeners
// ==============================================================================

export function updateLastActivity(): number {
  const now = Date.now();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(SESSION_STORAGE_KEYS.LAST_ACTIVITY, String(now));
    } catch {
      // no-op
    }
  }
  return now;
}

export function getLastActivity(): number {
  if (typeof window === 'undefined') return Date.now();
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEYS.LAST_ACTIVITY);
    if (!raw) {
      const now = Date.now();
      localStorage.setItem(SESSION_STORAGE_KEYS.LAST_ACTIVITY, String(now));
      return now;
    }
    const parsed = parseInt(raw, 10);
    return isNaN(parsed) ? Date.now() : parsed;
  } catch {
    return Date.now();
  }
}

export function getRemainingSeconds(
  idleTimeoutSeconds: number = DEFAULT_IDLE_TIMEOUT_SECONDS
): number {
  const lastActive = getLastActivity();
  const elapsedMs = Date.now() - lastActive;
  const elapsedSeconds = Math.floor(elapsedMs / 1000);
  const remaining = idleTimeoutSeconds - elapsedSeconds;
  return Math.max(0, remaining);
}

export function isSessionLocked(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(SESSION_STORAGE_KEYS.SESSION_LOCKED) === 'true';
  } catch {
    return false;
  }
}

export function setSessionLocked(locked: boolean): void {
  if (typeof window === 'undefined') return;
  try {
    if (locked) {
      localStorage.setItem(SESSION_STORAGE_KEYS.SESSION_LOCKED, 'true');
    } else {
      localStorage.removeItem(SESSION_STORAGE_KEYS.SESSION_LOCKED);
    }
  } catch {
    // no-op
  }
}

/**
 * Mendaftarkan event listener inaktivitas pada browser dengan pembatasan frekuensi (throttling)
 * Mengembalikan fungsi cleanup untuk melepas listener saat unmount.
 */
export function setupInactivityListeners(
  onActivity: () => void,
  throttleMs: number = 1000
): () => void {
  if (typeof window === 'undefined') {
    return () => {};
  }

  let lastTriggered = 0;

  const handleActivity = () => {
    const now = Date.now();
    if (now - lastTriggered >= throttleMs) {
      lastTriggered = now;
      updateLastActivity();
      onActivity();
    }
  };

  ACTIVITY_EVENTS.forEach((evt) => {
    window.addEventListener(evt, handleActivity, { passive: true });
  });

  // Listener perubahan visibilitas tab (bila kembali ke tab REBO, perbarui)
  const handleVisibility = () => {
    if (document.visibilityState === 'visible') {
      handleActivity();
    }
  };
  document.addEventListener('visibilitychange', handleVisibility);

  // Return pembersih (cleanup)
  return () => {
    ACTIVITY_EVENTS.forEach((evt) => {
      window.removeEventListener(evt, handleActivity);
    });
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}

// ==============================================================================
// 7. Template Resmi Notifikasi WhatsApp Peringatan Login Asing
// ==============================================================================

/**
 * Format pesan peringatan login perangkat mencurigakan berkop BPS Kabupaten Kepulauan Sitaro
 * Standar: ISO 27001 Access Control & Suspicious Activity Alerts
 */
export function formatSuspiciousLoginWAMessage(
  params: SuspiciousLoginWAMessageParams
): string {
  const baseAppUrl =
    params.appUrl || process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';
  const waktuDeteksi = formatWitaDateTime(params.loginTime || new Date());
  const peran = params.userRole ? ` (${params.userRole.toUpperCase()})` : '';
  const lokasiJaringan = params.ipAddress || 'Jaringan BPS / Publik';

  return `🚨 *[PERINGATAN KEAMANAN - REBO V2 BPS SITARO]*
*Sistem Deteksi Akses Tidak Dikenal (ISO 27001)*

Yth. Bpk/Ibu *${params.userName}*${peran},

Sistem keamanan REBO V2 mendeteksi adanya aktivitas login ke akun Anda menggunakan *perangkat baru / asing* yang belum terdaftar pada profil Anda:

📱 *Detail Perangkat & Sesi:*
• Peramban: *${params.deviceInfo.browser}* (Versi: ${params.deviceInfo.browserVersion || 'Terbaru'})
• Sistem Operasi: *${params.deviceInfo.os}* (${params.deviceInfo.platform})
• Resolusi Layar: ${params.deviceInfo.screenResolution}
• Zona Waktu: ${params.deviceInfo.timezone}
• Jaringan / IP: ${lokasiJaringan}
• Waktu Login: *${waktuDeteksi}*

⚠️ *Tindakan Pengamanan (Jika ini BUKAN Anda):*
1. Segera ubah kata sandi akun Anda melalui menu profil REBO:
   🔗 ${baseAppUrl}/rebo/profile
2. Hubungi Administrator Satker BPS Sitaro atau Tim IT Penilaian ZI untuk melakukan pemutusan sesi paksa (Revoke Sessions).
3. Jangan bagikan tautan verifikasi atau kode autentikasi kepada siapapun.

_Jika login ini dilakukan oleh Anda, Anda dapat mengabaikan peringatan ini. Perangkat ini akan dicatat ke dalam daftar perangkat tepercaya Anda._

--------------------------------------------------
*Badan Pusat Statistik Kabupaten Kepulauan Sitaro*
_Kompleks Kantor Pemerintah Daerah Kabupaten Kepulauan Siau Tagulandang Biaro_`;
}
