/**
 * ==============================================================================
 * REBO V2 - BPS KABUPATEN KEPULAUAN SITARO (7108)
 * DOC SHIELD: Military-Grade Document Cryptography Module (AES-256-GCM & PBKDF2)
 * Standar Keamanan: ISO/IEC 27001:2022 Control A.8.24 (Use of Cryptography)
 * ==============================================================================
 *
 * Modul ini mengenkripsi berkas sensitif kedinasan (LHP, BPK, Inspektorat Utama,
 * DIPA, RKA-K/L, SPJ, LHKPN, dan Dokumen Rahasia) sebelum diunggah ke Google Drive
 * atau Supabase Storage.
 *
 * Spesifikasi Kriptografi:
 * 1. Cipher: AES-256-GCM (Authenticated Encryption with Associated Data).
 * 2. Key Derivation: PBKDF2 dengan 100.000 iterasi, SHA-256, dan 16-byte cryptographically secure random salt.
 * 3. IV: 12-byte random Nonce/IV per proses enkripsi (mencegah replay attacks).
 * 4. Hash Integritas: SHA-256 Checksum dari berkas asli sebelum dienkripsi.
 * 5. Format Kontainer: Berkas .enc ber-header identitas BPS Sitaro, metadata JSON & ciphertext.
 */

export type DocClassification =
  | 'LHP_BPK_ITJEN'
  | 'KEUANGAN_DIPA_SPJ'
  | 'KEPATUHAN_ETIKA'
  | 'RAHASIA_STRATEGIS'
  | 'UMUM';

export type SensitivityLevel =
  | 'SANGAT RAHASIA'
  | 'RAHASIA'
  | 'TERBATAS'
  | 'BIASA';

export interface DocShieldMetadata {
  magic: 'REBO_SHIELD_V1';
  app: 'REBO-V2';
  satker: string; // 'BPS Kabupaten Kepulauan Sitaro (7108)'
  standard: string; // 'ISO 27001 (A.8.24) / AES-256-GCM'
  fileName: string;
  fileType: string;
  originalSize: number;
  encryptedSize: number;
  sha256Original: string;
  saltHex: string;
  ivHex: string;
  iterations: number;
  cipher: 'AES-256-GCM';
  encryptedAt: string;
  category: string;
  sensitivityLevel: SensitivityLevel;
  uploaderName?: string;
  uploaderRole?: string;
}

export interface SensitiveDetectionResult {
  isSensitive: boolean;
  category: DocClassification;
  categoryLabel: string;
  sensitivityLevel: SensitivityLevel;
  matchedKeywords: string[];
  reason: string;
}

export interface EncryptedDocumentRecord {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  encryptedSize: number;
  category: string;
  sensitivityLevel: SensitivityLevel;
  sha256: string;
  iv: string;
  salt: string;
  encryptedAt: string;
  encryptedBy: string;
  storageLocation: 'Google Drive' | 'Supabase Storage' | 'Local Safe';
  verifiedStatus: 'VERIFIED' | 'TAMPER_DETECTED' | 'UNVERIFIED';
  downloadUrl?: string;
}

export interface DocShieldStats {
  totalProtectedDocs: number;
  totalProtectedBytes: number;
  cipherStatus: string;
  isoComplianceScore: number;
  zeroLeakageDays: number;
  categoriesBreakdown: {
    lhpBpkCount: number;
    keuanganCount: number;
    kepatuhanCount: number;
    rahasiaCount: number;
  };
  recentDocuments: EncryptedDocumentRecord[];
}

export const DEFAULT_SATKER_NAME = 'BPS Kabupaten Kepulauan Sitaro (7108)';
export const DEFAULT_CONTAINER_MAGIC = 'REBO_SHIELD_V1';
export const DEFAULT_PBKDF2_ITERATIONS = 100000;
export const DEFAULT_MASTER_PASSPHRASE =
  process.env.NEXT_PUBLIC_DOC_SHIELD_KEY ||
  'BPS-7108-SITARO-REBO-SHIELD-2026!*';

/**
 * Mendapatkan SubtleCrypto yang kompatibel baik di browser (window.crypto)
 * maupun server Node.js runtime.
 */
function getSubtleCrypto(): SubtleCrypto {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
    return globalThis.crypto.subtle;
  }
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    return window.crypto.subtle;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    if (nodeCrypto.webcrypto?.subtle) {
      return nodeCrypto.webcrypto.subtle;
    }
  } catch {
    // ignore
  }
  throw new Error(
    'Web Crypto API (SubtleCrypto) tidak didukung pada lingkungan ini.'
  );
}

/**
 * Menghasilkan bytes acak dengan CSPRNG
 */
function getRandomValues(array: Uint8Array): Uint8Array {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.getRandomValues) {
    return globalThis.crypto.getRandomValues(array);
  }
  if (typeof window !== 'undefined' && window.crypto?.getRandomValues) {
    return window.crypto.getRandomValues(array);
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    return nodeCrypto.randomFillSync(array);
  } catch {
    // ignore
  }
  throw new Error('CSPRNG getRandomValues tidak didukung.');
}

/**
 * Konversi Uint8Array ke string Hexadecimal
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Konversi string Hexadecimal ke Uint8Array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.replace(/[^0-9a-fA-F]/g, '');
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(cleanHex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Menghitung SHA-256 Checksum dari buffer data
 */
export async function computeSha256(
  data: ArrayBuffer | Uint8Array
): Promise<string> {
  const subtle = getSubtleCrypto();
  const buffer =
    data instanceof Uint8Array
      ? data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength)
      : data;
  const digestBuffer = await subtle.digest('SHA-256', buffer as ArrayBuffer);
  return bytesToHex(new Uint8Array(digestBuffer));
}

/**
 * Melakukan derivasi kunci AES-256-GCM menggunakan PBKDF2 (100.000 iterasi)
 */
export async function deriveAesGcmKey(
  passphrase: string,
  salt: Uint8Array,
  iterations = DEFAULT_PBKDF2_ITERATIONS
): Promise<CryptoKey> {
  const subtle = getSubtleCrypto();
  const enc = new TextEncoder();
  const keyMaterial = await subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey', 'deriveBits']
  );

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as BufferSource,
      iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Deteksi otomatis berkas sensitif kedinasan berdasarkan nama berkas atau MIME type
 */
export function detectSensitiveDocument(
  fileName: string,
  mimeType?: string
): SensitiveDetectionResult {
  const lowerName = fileName.toLowerCase();
  const matchedKeywords: string[] = [];

  // 1. Kategori Pemeriksaan Internal & Eksternal (LHP, BPK, Itjen)
  const lhpKeywords = [
    'lhp',
    'bpk',
    'inspektorat',
    'itjen',
    'pemeriksaan',
    'temuan',
    'rekomendasi',
    'audit',
    'tlhp',
    'wasrik'
  ];
  for (const kw of lhpKeywords) {
    if (lowerName.includes(kw)) matchedKeywords.push(kw);
  }
  if (matchedKeywords.length > 0) {
    return {
      isSensitive: true,
      category: 'LHP_BPK_ITJEN',
      categoryLabel: 'Pemeriksaan Internal & Pengawasan (LHP / BPK / Itjen)',
      sensitivityLevel: 'SANGAT RAHASIA',
      matchedKeywords,
      reason: `Terdeteksi dokumen hasil pemeriksaan pengawasan: "${matchedKeywords.join(', ')}"`
    };
  }

  // 2. Kategori Keuangan & Perbendaharaan (DIPA, RKA-K/L, SPJ)
  const keuanganKeywords = [
    'dipa',
    'rka',
    'rkakl',
    'pok',
    'spj',
    'kuitansi',
    'kwitansi',
    'sp2d',
    'spm',
    'spp',
    'pajak',
    'rekening',
    'kas',
    'belanja',
    'anggaran',
    'honor',
    'gaji',
    'tup',
    'gup'
  ];
  for (const kw of keuanganKeywords) {
    if (lowerName.includes(kw)) matchedKeywords.push(kw);
  }
  if (matchedKeywords.length > 0) {
    return {
      isSensitive: true,
      category: 'KEUANGAN_DIPA_SPJ',
      categoryLabel: 'Laporan Keuangan & Perbendaharaan (DIPA / RKA / SPJ)',
      sensitivityLevel: 'RAHASIA',
      matchedKeywords,
      reason: `Terdeteksi berkas pertanggungjawaban keuangan negara: "${matchedKeywords.join(', ')}"`
    };
  }

  // 3. Kategori Kepatuhan, Etika & SDM (LHKPN, UPG, Gratifikasi, Disiplin)
  const kepatuhanKeywords = [
    'lhkpn',
    'lhkasn',
    'upg',
    'gratifikasi',
    'disiplin',
    'hukdis',
    'sanksi',
    'etik',
    'kode etik',
    'pelanggaran',
    'investigasi',
    'wbs'
  ];
  for (const kw of kepatuhanKeywords) {
    if (lowerName.includes(kw)) matchedKeywords.push(kw);
  }
  if (matchedKeywords.length > 0) {
    return {
      isSensitive: true,
      category: 'KEPATUHAN_ETIKA',
      categoryLabel: 'Kepatuhan, Integritas & Etika (LHKPN / UPG / Disiplin)',
      sensitivityLevel: 'RAHASIA',
      matchedKeywords,
      reason: `Terdeteksi dokumen integritas ASN dan kepatuhan hukum: "${matchedKeywords.join(', ')}"`
    };
  }

  // 4. Kategori Dokumen Strategis / Rahasia Kedinasan
  const rahasiaKeywords = [
    'rahasia',
    'confidential',
    'internal',
    'privat',
    'sensitif',
    'spip',
    'matriks risiko',
    'evaluasi tpi',
    'tpn'
  ];
  for (const kw of rahasiaKeywords) {
    if (lowerName.includes(kw)) matchedKeywords.push(kw);
  }
  if (matchedKeywords.length > 0) {
    return {
      isSensitive: true,
      category: 'RAHASIA_STRATEGIS',
      categoryLabel: 'Data Strategis & Rahasia Kedinasan Satker',
      sensitivityLevel: 'SANGAT RAHASIA',
      matchedKeywords,
      reason: `Terdeteksi berkas strategis kedinasan berkategori rahasia: "${matchedKeywords.join(', ')}"`
    };
  }

  // Format umum / non-sensitif default
  return {
    isSensitive: false,
    category: 'UMUM',
    categoryLabel: 'Dokumen Standar / Umum',
    sensitivityLevel: 'BIASA',
    matchedKeywords: [],
    reason:
      'Tidak mengandung kata kunci sensitif tertentu, namun enkripsi tetap disarankan sesuai ISO 27001'
  };
}

/**
 * Enkripsi berkas dokumen menjadi Blob kontainer .enc berstandar AES-256-GCM
 */
export async function encryptDocumentBlob(
  file: File | Blob,
  passphrase?: string,
  customMeta?: Partial<DocShieldMetadata>
): Promise<{
  encryptedBlob: Blob;
  metadata: DocShieldMetadata;
  downloadFileName: string;
}> {
  const subtle = getSubtleCrypto();
  const actualPassphrase = passphrase?.trim() || DEFAULT_MASTER_PASSPHRASE;

  const fileName =
    customMeta?.fileName ||
    (file instanceof File ? file.name : 'dokumen_sensitif.pdf');
  const fileType =
    customMeta?.fileType || file.type || 'application/octet-stream';

  // Baca array buffer berkas asli
  const originalBuffer = await file.arrayBuffer();
  const originalBytes = new Uint8Array(originalBuffer);
  const originalSize = originalBytes.byteLength;

  // 1. Hitung SHA-256 berkas asli
  const sha256Original = await computeSha256(originalBytes);

  // 2. Buat Salt acak 16 byte & IV acak 12 byte
  const salt = getRandomValues(new Uint8Array(16));
  const iv = getRandomValues(new Uint8Array(12));

  // 3. Derivasi kunci AES-256-GCM melalui PBKDF2 (100.000 iterasi)
  const key = await deriveAesGcmKey(
    actualPassphrase,
    salt,
    DEFAULT_PBKDF2_ITERATIONS
  );

  // 4. Lakukan enkripsi AES-GCM
  const ciphertextBuffer = await subtle.encrypt(
    {
      name: 'AES-GCM',
      iv: iv as BufferSource
    },
    key,
    originalBytes
  );
  const ciphertextBytes = new Uint8Array(ciphertextBuffer);

  // 5. Susun Metadata Header
  const detection = detectSensitiveDocument(fileName, fileType);
  const metadata: DocShieldMetadata = {
    magic: DEFAULT_CONTAINER_MAGIC,
    app: 'REBO-V2',
    satker: customMeta?.satker || DEFAULT_SATKER_NAME,
    standard: 'ISO 27001 (A.8.24) / AES-256-GCM',
    fileName,
    fileType,
    originalSize,
    encryptedSize: ciphertextBytes.byteLength,
    sha256Original,
    saltHex: bytesToHex(salt),
    ivHex: bytesToHex(iv),
    iterations: DEFAULT_PBKDF2_ITERATIONS,
    cipher: 'AES-256-GCM',
    encryptedAt: new Date().toISOString(),
    category: customMeta?.category || detection.categoryLabel,
    sensitivityLevel:
      customMeta?.sensitivityLevel || detection.sensitivityLevel,
    uploaderName: customMeta?.uploaderName || 'Admin / Operator Satker',
    uploaderRole: customMeta?.uploaderRole || 'admin'
  };

  // 6. Susun Container Binary:
  // [14 bytes MAGIC ("REBO_SHIELD_V1")]
  // [4 bytes Uint32 Metadata JSON length (Big Endian)]
  // [N bytes JSON UTF-8 string]
  // [Ciphertext bytes (termasuk 16-byte auth tag GCM)]
  const magicBytes = new TextEncoder().encode(DEFAULT_CONTAINER_MAGIC);
  const metaBytes = new TextEncoder().encode(JSON.stringify(metadata));
  const metaLength = metaBytes.byteLength;

  const lengthBuffer = new ArrayBuffer(4);
  new DataView(lengthBuffer).setUint32(0, metaLength, false);
  const lengthBytes = new Uint8Array(lengthBuffer);

  const containerBlob = new Blob(
    [magicBytes, lengthBytes, metaBytes, ciphertextBytes],
    { type: 'application/octet-stream' }
  );

  const downloadFileName = `${fileName}.enc`;

  return {
    encryptedBlob: containerBlob,
    metadata,
    downloadFileName
  };
}

/**
 * Dekripsi berkas kontainer .enc menjadi berkas asli dan validasi integritas SHA-256
 */
export async function decryptDocumentBlob(
  encryptedData: ArrayBuffer | Blob | File,
  passphrase?: string
): Promise<{
  decryptedBlob: Blob;
  originalFileName: string;
  originalFileType: string;
  metadata: DocShieldMetadata;
  sha256Verified: boolean;
}> {
  const subtle = getSubtleCrypto();
  const actualPassphrase = passphrase?.trim() || DEFAULT_MASTER_PASSPHRASE;

  const buffer =
    encryptedData instanceof ArrayBuffer
      ? encryptedData
      : await encryptedData.arrayBuffer();

  const containerBytes = new Uint8Array(buffer);

  // 1. Validasi Magic Header (14 bytes)
  if (containerBytes.byteLength < 18) {
    throw new Error('Ukuran berkas terlalu kecil untuk kontainer Doc Shield.');
  }

  const magic = new TextDecoder().decode(containerBytes.slice(0, 14));
  if (magic !== DEFAULT_CONTAINER_MAGIC) {
    throw new Error(
      `Format kontainer tidak valid. Diharapkan "${DEFAULT_CONTAINER_MAGIC}", ditemukan "${magic.substring(0, 14)}".`
    );
  }

  // 2. Baca Panjang Metadata (4 bytes)
  const metaLength = new DataView(
    containerBytes.buffer,
    containerBytes.byteOffset + 14,
    4
  ).getUint32(0, false);

  if (containerBytes.byteLength < 18 + metaLength) {
    throw new Error('Struktur kontainer berkas terpotong atau rusak.');
  }

  // 3. Parse Metadata JSON
  const metaBytes = containerBytes.slice(18, 18 + metaLength);
  let metadata: DocShieldMetadata;
  try {
    metadata = JSON.parse(
      new TextDecoder().decode(metaBytes)
    ) as DocShieldMetadata;
  } catch {
    throw new Error('Gagal membaca header metadata JSON kontainer.');
  }

  // 4. Ekstrak Ciphertext
  const ciphertextBytes = containerBytes.slice(18 + metaLength);
  const salt = hexToBytes(metadata.saltHex);
  const iv = hexToBytes(metadata.ivHex);

  // 5. Derivasi Kunci AES-256-GCM
  const key = await deriveAesGcmKey(
    actualPassphrase,
    salt,
    metadata.iterations || DEFAULT_PBKDF2_ITERATIONS
  );

  // 6. Lakukan Dekripsi AES-GCM
  let decryptedBuffer: ArrayBuffer;
  try {
    decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource
      },
      key,
      ciphertextBytes
    );
  } catch {
    throw new Error(
      'Gagal mendekripsi berkas: Kata Sandi/Master Key salah atau berkas telah dimanipulasi (Autentikasi GCM gagal).'
    );
  }

  // 7. Validasi Integritas SHA-256 Checksum
  const computedSha256 = await computeSha256(decryptedBuffer);
  const sha256Verified =
    computedSha256.toLowerCase() === metadata.sha256Original.toLowerCase();

  if (!sha256Verified) {
    throw new Error(
      `Peringatan Integritas: Checksum SHA-256 berkas hasil dekripsi (${computedSha256.substring(0, 12)}...) tidak sesuai dengan header asli (${metadata.sha256Original.substring(0, 12)}...).`
    );
  }

  const decryptedBlob = new Blob([decryptedBuffer], {
    type: metadata.fileType || 'application/octet-stream'
  });

  return {
    decryptedBlob,
    originalFileName: metadata.fileName,
    originalFileType: metadata.fileType,
    metadata,
    sha256Verified
  };
}

/**
 * Membaca metadata kontainer .enc tanpa melakukan dekripsi ciphertext
 */
export async function parseDocShieldMetadata(
  encryptedData: ArrayBuffer | Blob | File
): Promise<DocShieldMetadata> {
  const buffer =
    encryptedData instanceof ArrayBuffer
      ? encryptedData
      : await encryptedData.arrayBuffer();

  const containerBytes = new Uint8Array(buffer);
  if (containerBytes.byteLength < 18) {
    throw new Error('Berkas tidak valid atau terlalu kecil.');
  }

  const magic = new TextDecoder().decode(containerBytes.slice(0, 14));
  if (magic !== DEFAULT_CONTAINER_MAGIC) {
    throw new Error('Bukan berkas kontainer Doc Shield valid.');
  }

  const metaLength = new DataView(
    containerBytes.buffer,
    containerBytes.byteOffset + 14,
    4
  ).getUint32(0, false);

  const metaBytes = containerBytes.slice(18, 18 + metaLength);
  return JSON.parse(new TextDecoder().decode(metaBytes)) as DocShieldMetadata;
}
