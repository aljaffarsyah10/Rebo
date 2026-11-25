import QRCode from 'qrcode';

export type PSTTemplateType = 'tent_card_a5' | 'poster_a4' | 'sticker_mini';
export type PSTColorTheme = 'biru_bps' | 'emerald_integritas' | 'elegan_navy';
export type PSTPresetTarget = 'survei' | 'wbs' | 'sidatu' | 'custom';

export interface PSTQRConfig {
  id?: string;
  presetTarget: PSTPresetTarget;
  title: string;
  subtitle: string;
  targetUrl: string;
  templateType: PSTTemplateType;
  colorTheme: PSTColorTheme;
  slogan: string;
  kantorName: string;
  kantorSub: string;
  kontakWa: string;
  kontakEmail: string;
  kontakWeb: string;
  showBerakhlakLogo: boolean;
  showBpsLogo: boolean;
  showContactFooter: boolean;
  updatedAt?: string;
}

export interface PresetTargetInfo {
  id: PSTPresetTarget;
  label: string;
  title: string;
  subtitle: string;
  targetUrl: string;
  description: string;
  badge: string;
}

export const PRESET_TARGETS: Record<PSTPresetTarget, PresetTargetInfo> = {
  survei: {
    id: 'survei',
    label: 'Survei Kepuasan (IKM & IPAK)',
    title: 'Survei Kepuasan Masyarakat & Anti Korupsi',
    subtitle:
      'Pindai kode QR untuk memberikan penilaian kepuasan layanan dan persepsi integritas pelayanan BPS Sitaro',
    targetUrl: 'https://s.bps.go.id/survei-pst-sitaro',
    description:
      'Untuk tamu/pengunjung meja PST yang baru saja selesai menerima konsultasi atau data statistik.',
    badge: 'Survei Resmi PST'
  },
  wbs: {
    id: 'wbs',
    label: 'Pengaduan & Whistleblowing (WBS)',
    title: 'Kanal Pengaduan & Layanan WBS',
    subtitle:
      'Laporkan dugaan pelanggaran, gratifikasi, atau pungli secara rahasia dan aman langsung ke Tim Kepatuhan Internal',
    targetUrl: 'https://s.bps.go.id/wbs-bps-sitaro',
    description:
      'Mendukung pemenuhan pengawasan, anti-pungli, dan penguatan akuntabilitas BPS Sitaro.',
    badge: 'Kanal Integritas'
  },
  sidatu: {
    id: 'sidatu',
    label: 'Portal PST Si-Datu (Layanan Digital)',
    title: 'Portal Digital PST Si-Datu',
    subtitle:
      'Akses cepat katalog publikasi daerah, permohonan data mikro, dan konsultasi statistik via smartphone Anda',
    targetUrl: 'https://s.bps.go.id/sidatu-sitaro',
    description:
      'Mengarahkan tamu ke portal pelayanan online mandiri tanpa antre di meja fisik.',
    badge: 'Inovasi Digital'
  },
  custom: {
    id: 'custom',
    label: 'Tautan Kustom / Khusus',
    title: 'Pelayanan Statistik Terpadu (PST)',
    subtitle:
      'Silakan pindai kode QR berikut untuk mengakses tautan layanan resmi kami',
    targetUrl: 'https://sitarokab.bps.go.id',
    description:
      'Gunakan tautan Google Form, Bitly, atau sistem informasi eksternal lainnya.',
    badge: 'Kustom'
  }
};

export interface TemplateLayoutInfo {
  id: PSTTemplateType;
  name: string;
  badge: string;
  paperName: string;
  dimensionsMm: string;
  previewWidthPx: number;
  previewHeightPx: number;
  printCssPageSize: string;
  description: string;
  recommendation: string;
}

export const TEMPLATE_LAYOUTS: Record<PSTTemplateType, TemplateLayoutInfo> = {
  tent_card_a5: {
    id: 'tent_card_a5',
    name: 'Akrilik Meja / Tent Card (A5)',
    badge: 'Paling Populer',
    paperName: 'A5 Portrait',
    dimensionsMm: '148 x 210 mm',
    previewWidthPx: 380,
    previewHeightPx: 538,
    printCssPageSize: '148mm 210mm',
    description:
      'Format vertikal ideal untuk standee akrilik meja resepsionis PST dan meja front-office.',
    recommendation:
      'Cetak pada kertas Art Paper / Brief Card 260gsm lalu selipkan ke dudukan akrilik T-stand.'
  },
  poster_a4: {
    id: 'poster_a4',
    name: 'Poster Ruang Tunggu (A4)',
    badge: 'Format Dinding',
    paperName: 'A4 Portrait',
    dimensionsMm: '210 x 297 mm',
    previewWidthPx: 420,
    previewHeightPx: 594,
    printCssPageSize: '210mm 297mm',
    description:
      'Format poster dinding atau standing roll banner di area ruang tunggu tamu kantor BPS.',
    recommendation:
      'Cetak pada kertas foto glossy atau vinyl luster ukuran A4 berpigura kaca.'
  },
  sticker_mini: {
    id: 'sticker_mini',
    name: 'Stiker Meja Minimalis (Square 10x10 cm)',
    badge: 'Kompak & Hemat',
    paperName: 'Bujur Sangkar 10x10 cm',
    dimensionsMm: '100 x 100 mm',
    previewWidthPx: 380,
    previewHeightPx: 380,
    printCssPageSize: '100mm 100mm',
    description:
      'Format ringkas untuk stiker vinyl anti-air yang ditempel langsung pada sudut meja pelayanan.',
    recommendation:
      'Cetak di kertas stiker vinyl doff/glossy dengan laminasi dingin agar tahan goresan dan air.'
  }
};

export interface ColorThemeInfo {
  id: PSTColorTheme;
  name: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  darkColor: string;
  lightBg: string;
  bannerGradient: string;
  borderClass: string;
  badgeBg: string;
  textBadge: string;
}

export const COLOR_THEMES: Record<PSTColorTheme, ColorThemeInfo> = {
  biru_bps: {
    id: 'biru_bps',
    name: 'Biru Resmi BPS (Identitas Nasional)',
    primaryColor: '#02529c',
    secondaryColor: '#0284c7',
    accentColor: '#f59e0b',
    darkColor: '#082f49',
    lightBg: '#f0f9ff',
    bannerGradient: 'from-[#02529c] via-[#0369a1] to-[#0284c7]',
    borderClass: 'border-[#02529c]',
    badgeBg: 'bg-[#02529c]',
    textBadge: 'text-white'
  },
  emerald_integritas: {
    id: 'emerald_integritas',
    name: 'Emerald Integritas (WBK/WBBM)',
    primaryColor: '#047857',
    secondaryColor: '#10b981',
    accentColor: '#f59e0b',
    darkColor: '#064e3b',
    lightBg: '#ecfdf5',
    bannerGradient: 'from-[#064e3b] via-[#047857] to-[#059669]',
    borderClass: 'border-[#047857]',
    badgeBg: 'bg-[#047857]',
    textBadge: 'text-white'
  },
  elegan_navy: {
    id: 'elegan_navy',
    name: 'Elegan Midnight Navy (Modern Front-Office)',
    primaryColor: '#0f172a',
    secondaryColor: '#334155',
    accentColor: '#38bdf8',
    darkColor: '#020617',
    lightBg: '#f8fafc',
    bannerGradient: 'from-[#020617] via-[#0f172a] to-[#1e293b]',
    borderClass: 'border-[#0f172a]',
    badgeBg: 'bg-[#0f172a]',
    textBadge: 'text-white'
  }
};

export const DEFAULT_PST_QR_CONFIG: PSTQRConfig = {
  presetTarget: 'survei',
  title: 'Survei Kepuasan Masyarakat & Anti Korupsi',
  subtitle:
    'Bantu kami mewujudkan pelayanan yang prima & berintegritas dengan memindai kode QR melalui kamera ponsel Anda.',
  targetUrl: 'https://s.bps.go.id/survei-pst-sitaro',
  templateType: 'tent_card_a5',
  colorTheme: 'biru_bps',
  slogan: 'Layanan Cepat, Tepat, dan Bebas Pungli Rp 0',
  kantorName: 'BADAN PUSAT STATISTIK',
  kantorSub: 'KABUPATEN KEPULAUAN SITARO',
  kontakWa: '+62 821-9555-7170',
  kontakEmail: 'bps7109@bps.go.id',
  kontakWeb: 'sitarokab.bps.go.id',
  showBerakhlakLogo: true,
  showBpsLogo: true,
  showContactFooter: true
};

/**
 * Validasi keabsahan format URL tujuan
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'URL tidak boleh kosong' };
  }
  const trimmed = url.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, error: 'Protokol harus http:// atau https://' };
    }
    return { isValid: true };
  } catch {
    return {
      isValid: false,
      error: 'Format URL tidak valid (contoh: https://s.bps.go.id/...)'
    };
  }
}

/**
 * Menghasilkan Data URL PNG QR Code dengan error correction level H (High Quality - 30%)
 */
export async function generateQRCodeDataURL(
  text: string,
  options?: {
    colorDark?: string;
    colorLight?: string;
    width?: number;
    margin?: number;
  }
): Promise<string> {
  const safeText =
    text && text.trim() ? text.trim() : 'https://sitarokab.bps.go.id';
  try {
    return await QRCode.toDataURL(safeText, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      margin: options?.margin ?? 2,
      width: options?.width ?? 600,
      color: {
        dark: options?.colorDark ?? '#000000',
        light: options?.colorLight ?? '#ffffff'
      }
    });
  } catch (err) {
    // Fallback: standard error correction level M
    return await QRCode.toDataURL(safeText, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 400
    });
  }
}

/**
 * Menghasilkan SVG String murni QR Code untuk resolusi cetak vektor tanpa batas
 */
export async function generateQRCodeSVGString(
  text: string,
  options?: {
    colorDark?: string;
    colorLight?: string;
    margin?: number;
  }
): Promise<string> {
  const safeText =
    text && text.trim() ? text.trim() : 'https://sitarokab.bps.go.id';
  return await QRCode.toString(safeText, {
    errorCorrectionLevel: 'H',
    type: 'svg',
    margin: options?.margin ?? 2,
    color: {
      dark: options?.colorDark ?? '#000000',
      light: options?.colorLight ?? '#ffffff'
    }
  });
}
