/**
 * Utility Engine Watermark Keamanan Berkas Bukti Dukung REBO V2
 * Standar Kepatuhan: ISO 27001:2022 (A.8.11 Data Masking & Information Leakage Prevention)
 * Satker: Badan Pusat Statistik (BPS) Kabupaten Kepulauan Sitaro
 *
 * Fitur:
 * - Generator SVG Pattern Data-URL berkecepatan tinggi tanpa pemborosan memori.
 * - Pola diagonal 45 derajat berulang (repeating diagonal grid matrix).
 * - Identitas instansi resmi, tujuan evaluasi ZI, stempel waktu akses (timestamp WITA),
 *   dan stempel pengawasan TPI BPS RI / TPN KemenPAN-RB.
 */

import React from 'react';

export interface WatermarkOptions {
  /** Identitas Instansi (Default: "BPS KABUPATEN KEPULAUAN SITARO") */
  instansi?: string;
  /** Tahun Periode Evaluasi ZI (Default: tahun saat ini, e.g. 2026) */
  tahun?: string | number;
  /** Tingkat Klasifikasi Dokumen (Default: "RAHASIA KEDINASAN") */
  klasifikasi?: string;
  /** Pengawas Evaluasi (Default: "DIAWASI TPI BPS RI / TPN KEMENPAN-RB") */
  pengawas?: string;
  /** Kalimat Tujuan Dokumen */
  purpose?: string;
  /** Stempel Waktu Akses Dokumen */
  accessTimestamp?: string;
  /** Identitas Pengguna / Role (Opsional, e.g. "Operator ZI / Verifikator") */
  userIdentifier?: string;
  /** Opacity Watermark (0.05 - 0.5, default: 0.14) */
  opacity?: number;
  /** Sudut Kemiringan Derajat (Default: -45) */
  angle?: number;
  /** Ukuran Kotak Pola SVG (Default: lebar 480px, tinggi 340px) */
  patternWidth?: number;
  patternHeight?: number;
  /** Warna Dasar Teks Watermark (Default: #1e293b / slate-800) */
  color?: string;
}

/**
 * Memformat stempel waktu akses sesuai zona waktu WITA (BPS Kepulauan Sitaro, Sulut)
 */
export function formatAccessTimestamp(date: Date = new Date()): string {
  try {
    return (
      new Intl.DateTimeFormat('id-ID', {
        timeZone: 'Asia/Makassar', // WITA
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).format(date) + ' WITA'
    );
  } catch {
    return date.toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
  }
}

/**
 * Escape karakter berbahaya untuk format XML/SVG
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Menghasilkan opsi watermark default dengan fallback yang aman
 */
export function getDefaultWatermarkOptions(
  overrides?: Partial<WatermarkOptions>
): Required<WatermarkOptions> {
  const currentYear = new Date().getFullYear();
  const tahun = overrides?.tahun ?? currentYear;
  const instansi = overrides?.instansi ?? 'BPS KABUPATEN KEPULAUAN SITARO';
  const klasifikasi = overrides?.klasifikasi ?? 'RAHASIA KEDINASAN';
  const pengawas =
    overrides?.pengawas ?? 'DIAWASI TPI BPS RI / TPN KEMENPAN-RB';
  const defaultPurpose = `HANYA UNTUK PENILAIAN ZI BPS SITARO - TAHUN ${tahun} • ${klasifikasi}`;
  const purpose = overrides?.purpose ?? defaultPurpose;
  const accessTimestamp = overrides?.accessTimestamp ?? formatAccessTimestamp();

  return {
    instansi,
    tahun,
    klasifikasi,
    pengawas,
    purpose,
    accessTimestamp,
    userIdentifier: overrides?.userIdentifier ?? 'Verifikator ZI / TPI BPS RI',
    opacity: overrides?.opacity ?? 0.14,
    angle: overrides?.angle ?? -45,
    patternWidth: overrides?.patternWidth ?? 480,
    patternHeight: overrides?.patternHeight ?? 340,
    color: overrides?.color ?? '#1e293b'
  };
}

/**
 * Menghasilkan markup SVG Watermark berpola diagonal berulang
 */
export function generateWatermarkSvg(options?: WatermarkOptions): string {
  const opts = getDefaultWatermarkOptions(options);

  const instansi = escapeXml(opts.instansi);
  const purpose = escapeXml(opts.purpose);
  const pengawas = escapeXml(opts.pengawas);
  const timestamp = escapeXml(opts.accessTimestamp);
  const user = escapeXml(opts.userIdentifier);

  const w = opts.patternWidth;
  const h = opts.patternHeight;
  const cx = Math.round(w / 2);
  const cy = Math.round(h / 2);
  const angle = opts.angle;
  const opacity = Math.max(0.02, Math.min(0.8, opts.opacity));
  const color = opts.color;

  // Render teks diagonal di tengah (cx, cy) dan offset di sudut (0, 0) & (w, h)
  // untuk memastikan kisi-kisi berulang yang rapat dan anti-crop
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <style>
    .wm-line1 {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-weight: 800;
      font-size: 13.5px;
      letter-spacing: 2px;
      text-transform: uppercase;
      fill: ${color};
    }
    .wm-line2 {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-weight: 700;
      font-size: 10.5px;
      letter-spacing: 0.8px;
      text-transform: uppercase;
      fill: ${color};
    }
    .wm-line3 {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      font-weight: 600;
      font-size: 9px;
      letter-spacing: 0.5px;
      fill: ${color};
    }
    .wm-line4 {
      font-family: monospace, 'Courier New', Courier;
      font-weight: 500;
      font-size: 8px;
      letter-spacing: 0.3px;
      fill: ${color};
    }
    .wm-guide {
      stroke: ${color};
      stroke-width: 0.75;
      stroke-dasharray: 4 6;
      stroke-opacity: ${opacity * 0.4};
    }
  </style>

  <!-- Garis pandu diagonal samar -->
  <line x1="-50" y1="${h + 50}" x2="${w + 50}" y2="-50" class="wm-guide" />
  <line x1="-50" y1="${cy + 50}" x2="${w + 50}" y2="${-cy - 50}" class="wm-guide" />

  <!-- Grup Watermark Pusat -->
  <g transform="rotate(${angle} ${cx} ${cy})" opacity="${opacity}" text-anchor="middle">
    <text x="${cx}" y="${cy - 20}" class="wm-line1">${instansi}</text>
    <text x="${cx}" y="${cy - 4}" class="wm-line2">${purpose}</text>
    <text x="${cx}" y="${cy + 12}" class="wm-line3">DIAWASI TPI BPS RI / TPN KEMENPAN-RB</text>
    <text x="${cx}" y="${cy + 26}" class="wm-line4">DIAKSES: ${timestamp} • ${user} • ISO 27001 REBO DRM</text>
  </g>

  <!-- Grup Watermark Sekunder (Sudut Kiri Atas 0, 0) -->
  <g transform="rotate(${angle} 0 0)" opacity="${opacity * 0.85}" text-anchor="middle">
    <text x="0" y="-12" class="wm-line1">${instansi}</text>
    <text x="0" y="2" class="wm-line2">${purpose}</text>
    <text x="0" y="16" class="wm-line3">${pengawas}</text>
  </g>

  <!-- Grup Watermark Sekunder (Sudut Kanan Bawah w, h) -->
  <g transform="rotate(${angle} ${w} ${h})" opacity="${opacity * 0.85}" text-anchor="middle">
    <text x="${w}" y="${h - 12}" class="wm-line1">${instansi}</text>
    <text x="${w}" y="${h + 2}" class="wm-line2">${purpose}</text>
    <text x="${w}" y="${h + 16}" class="wm-line3">${pengawas}</text>
  </g>
</svg>
`.trim();
}

/**
 * Menghasilkan URL Data SVG yang dapat langsung dimasukkan ke CSS background-image
 */
export function generateWatermarkPatternUrl(
  options?: WatermarkOptions
): string {
  const svg = generateWatermarkSvg(options);
  // Gunakan encodeURIComponent untuk performa tinggi tanpa konversi base64 berlebih
  const encodedSvg = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/"/g, '%22');

  return `data:image/svg+xml;charset=utf-8,${encodedSvg}`;
}

/**
 * Menghasilkan objek React.CSSProperties untuk overlay watermark
 */
export function getWatermarkStyle(
  options?: WatermarkOptions
): React.CSSProperties {
  const patternUrl = generateWatermarkPatternUrl(options);

  return {
    backgroundImage: `url("${patternUrl}")`,
    backgroundRepeat: 'repeat',
    backgroundPosition: '0 0',
    pointerEvents: 'none',
    userSelect: 'none',
    WebkitUserSelect: 'none'
  };
}
