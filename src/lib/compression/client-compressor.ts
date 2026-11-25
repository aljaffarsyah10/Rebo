/**
 * Client-Side Image & Document Scan Compression Library
 * REBO V2 - BPS Kabupaten Kepulauan Sitaro
 *
 * Dioptimalkan untuk kompresi foto kegiatan lapangan dan dokumen pindaian (scan)
 * di sisi browser tanpa dependensi eksternal berat sebelum diunggah ke Google Drive / cloud storage.
 * Berguna saat jaringan internet kepulauan lambat dan menghemat kuota Google Workspace instansi.
 */

export interface CompressionOptions {
  /**
   * Batas dimensi maksimum (lebar atau tinggi) dalam pixel. Default: 1920px.
   */
  maxWidthOrHeight?: number;

  /**
   * Kualitas kompresi awal (0.1 - 1.0). Default: 0.8 (keseimbangan optimal ketajaman & ukuran).
   */
  quality?: number;

  /**
   * Target batas ukuran file maksimum dalam Megabytes (MB). Default: 1.5 MB.
   */
  maxSizeMB?: number;

  /**
   * Format keluaran berkas gambar. Default: 'image/jpeg'.
   */
  outputFormat?: 'image/jpeg' | 'image/webp' | 'original';

  /**
   * Kualitas minimum saat iterasi reduksi ukuran agar teks dokumen tetap terbaca jelas. Default: 0.5.
   */
  minQuality?: number;
}

export interface CompressionResult {
  file: File;
  originalFile: File;
  originalSize: number; // Bytes
  compressedSize: number; // Bytes
  compressionRatio: number; // Rasio: compressedSize / originalSize
  savingsBytes: number; // originalSize - compressedSize
  savedPercent: number; // Persentase hemat (misal: 75.4)
  originalDimensions: { width: number; height: number };
  compressedDimensions: { width: number; height: number };
  format: string;
  previewUrl: string;
  originalPreviewUrl: string;
  durationMs: number;
  isCompressed: boolean; // True jika ukuran berhasil diperkecil
}

/**
 * Membersihkan nama file menjadi judul dokumen yang rapi dan mudah dibaca.
 */
export function cleanDocTitle(fileName: string): string {
  if (!fileName) return '';
  // Hapus ekstensi
  const withoutExt = fileName.replace(/\.[^/.]+$/, '');
  // Ganti underscore, dash, atau multiple spaces dengan 1 spasi
  const formatted = withoutExt
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return formatted || fileName;
}

/**
 * Format ukuran file dalam satuan yang mudah dibaca (B, KB, MB, GB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes) || bytes < 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const safeI = Math.min(i, sizes.length - 1);
  const formatted = parseFloat((bytes / Math.pow(k, safeI)).toFixed(1));

  return `${formatted} ${sizes[safeI]}`;
}

/**
 * Memeriksa apakah file adalah gambar yang dapat dikompresi oleh engine Canvas browser.
 */
export function isCompressibleImage(file: File): boolean {
  if (!file) return false;

  const validMimes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/bmp',
    'image/tiff'
  ];

  if (validMimes.includes(file.type.toLowerCase())) {
    return true;
  }

  // Fallback cek ekstensi file
  const extensionMatch = file.name.match(/\.([^.]+)$/);
  if (extensionMatch) {
    const ext = extensionMatch[1].toLowerCase();
    return ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff'].includes(ext);
  }

  return false;
}

/**
 * Memuat File gambar ke dalam elemen HTMLImageElement.
 */
function loadImageElement(file: File): Promise<{
  img: HTMLImageElement;
  objectUrl: string;
}> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      resolve({ img, objectUrl });
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Gagal memuat berkas gambar: ${file.name}`));
    };

    img.src = objectUrl;
  });
}

/**
 * Menghitung dimensi baru dengan mempertahankan rasio aspek asli.
 */
function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidthOrHeight: number
): { width: number; height: number } {
  if (srcWidth <= maxWidthOrHeight && srcHeight <= maxWidthOrHeight) {
    return { width: srcWidth, height: srcHeight };
  }

  const ratio = Math.min(
    maxWidthOrHeight / srcWidth,
    maxWidthOrHeight / srcHeight
  );

  return {
    width: Math.max(1, Math.round(srcWidth * ratio)),
    height: Math.max(1, Math.round(srcHeight * ratio))
  };
}

/**
 * Mengubah Canvas menjadi Blob dengan format dan kualitas tertentu.
 */
function canvasToBlob(
  canvas: HTMLCanvasElement,
  format: string,
  quality: number
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob);
      },
      format,
      quality
    );
  });
}

/**
 * Kompresi satu berkas gambar di sisi browser (Client-Side HTML5 Canvas & Blob API).
 *
 * Menjaga rasio aspek foto dokumentasi, orientasi, dan ketajaman teks/dokumen pindaian.
 */
export async function compressImageFile(
  file: File,
  options?: CompressionOptions
): Promise<CompressionResult> {
  const startTime =
    typeof performance !== 'undefined' ? performance.now() : Date.now();

  const originalSize = file.size;
  const originalPreviewUrl =
    typeof window !== 'undefined' ? URL.createObjectURL(file) : '';

  // Default Options
  const maxWidthOrHeight = options?.maxWidthOrHeight ?? 1920;
  let targetQuality = options?.quality ?? 0.8;
  const maxSizeMB = options?.maxSizeMB ?? 1.5;
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  const minQuality = options?.minQuality ?? 0.45;

  let chosenMime = 'image/jpeg';
  if (options?.outputFormat === 'image/webp') {
    chosenMime = 'image/webp';
  } else if (options?.outputFormat === 'original') {
    chosenMime = file.type || 'image/jpeg';
  }

  // Jika bukan gambar yang didukung atau berjalan di luar browser, kembalikan berkas asli
  if (typeof window === 'undefined' || !isCompressibleImage(file)) {
    return {
      file,
      originalFile: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      savingsBytes: 0,
      savedPercent: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 },
      format: file.type || 'application/octet-stream',
      previewUrl: originalPreviewUrl,
      originalPreviewUrl,
      durationMs: 0,
      isCompressed: false
    };
  }

  try {
    const { img, objectUrl } = await loadImageElement(file);
    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    // Hitung dimensi target
    const targetDim = calculateAspectRatioFit(
      origWidth,
      origHeight,
      maxWidthOrHeight
    );

    // Inisialisasi Canvas
    const canvas = document.createElement('canvas');
    canvas.width = targetDim.width;
    canvas.height = targetDim.height;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      throw new Error('Canvas 2D context tidak tersedia di browser.');
    }

    // Aktifkan anti-aliasing berkualitas tinggi untuk menjaga keterbacaan teks pindaian
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Beri latar belakang putih jika format JPG untuk menangani PNG transparan
    if (chosenMime === 'image/jpeg') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Konversi ke Blob awal
    let blob = await canvasToBlob(canvas, chosenMime, targetQuality);

    if (!blob) {
      throw new Error('Gagal mengekspor canvas ke blob.');
    }

    // Iterasi penurunan kualitas jika ukuran masih melebihi batas target maxSizeMB
    let currentQuality = targetQuality;
    let attempts = 0;
    while (
      blob &&
      blob.size > maxSizeBytes &&
      currentQuality > minQuality &&
      attempts < 4
    ) {
      attempts++;
      currentQuality = Math.max(minQuality, currentQuality - 0.12);
      const nextBlob = await canvasToBlob(canvas, chosenMime, currentQuality);
      if (nextBlob) {
        blob = nextBlob;
      }
    }

    // Pembersihan resource gambar asli
    URL.revokeObjectURL(objectUrl);

    // Jika hasil kompresi ternyata lebih besar dari file asli (misal file aslinya sudah sangat kecil),
    // gunakan file asli agar tidak terjadi bloat
    if (blob.size >= originalSize) {
      const durationMs = Math.round(
        (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
          startTime
      );
      return {
        file,
        originalFile: file,
        originalSize,
        compressedSize: originalSize,
        compressionRatio: 1,
        savingsBytes: 0,
        savedPercent: 0,
        originalDimensions: { width: origWidth, height: origHeight },
        compressedDimensions: { width: origWidth, height: origHeight },
        format: file.type || 'image/jpeg',
        previewUrl: originalPreviewUrl,
        originalPreviewUrl,
        durationMs,
        isCompressed: false
      };
    }

    // Buat nama file baru dengan ekstensi sesuai mime type
    let newFileName = file.name;
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (chosenMime === 'image/jpeg') {
      newFileName = `${baseName}.jpg`;
    } else if (chosenMime === 'image/webp') {
      newFileName = `${baseName}.webp`;
    }

    const compressedFile = new File([blob], newFileName, {
      type: chosenMime,
      lastModified: Date.now()
    });

    const compressedSize = compressedFile.size;
    const savingsBytes = originalSize - compressedSize;
    const savedPercent = parseFloat(
      ((savingsBytes / originalSize) * 100).toFixed(1)
    );
    const compressionRatio = parseFloat(
      (compressedSize / originalSize).toFixed(3)
    );

    const compressedPreviewUrl = URL.createObjectURL(compressedFile);
    const durationMs = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        startTime
    );

    return {
      file: compressedFile,
      originalFile: file,
      originalSize,
      compressedSize,
      compressionRatio,
      savingsBytes,
      savedPercent,
      originalDimensions: { width: origWidth, height: origHeight },
      compressedDimensions: targetDim,
      format: chosenMime,
      previewUrl: compressedPreviewUrl,
      originalPreviewUrl,
      durationMs,
      isCompressed: true
    };
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(
      'Gagal melakukan kompresi berkas gambar, menggunakan file asli:',
      error
    );
    const durationMs = Math.round(
      (typeof performance !== 'undefined' ? performance.now() : Date.now()) -
        startTime
    );

    return {
      file,
      originalFile: file,
      originalSize,
      compressedSize: originalSize,
      compressionRatio: 1,
      savingsBytes: 0,
      savedPercent: 0,
      originalDimensions: { width: 0, height: 0 },
      compressedDimensions: { width: 0, height: 0 },
      format: file.type || 'image/jpeg',
      previewUrl: originalPreviewUrl,
      originalPreviewUrl,
      durationMs,
      isCompressed: false
    };
  }
}

/**
 * Kompresi beberapa berkas gambar sekaligus secara paralel dengan batasan concurrency.
 */
export async function compressMultipleImageFiles(
  files: File[],
  options?: CompressionOptions,
  onProgress?: (
    completed: number,
    total: number,
    currentResult?: CompressionResult
  ) => void
): Promise<CompressionResult[]> {
  const results: CompressionResult[] = [];
  const total = files.length;
  let completed = 0;

  for (const file of files) {
    if (isCompressibleImage(file)) {
      const res = await compressImageFile(file, options);
      results.push(res);
      completed++;
      if (onProgress) onProgress(completed, total, res);
    } else {
      // Non-compressible file: wrap as unchanged result
      const originalPreviewUrl =
        typeof window !== 'undefined' ? URL.createObjectURL(file) : '';
      const dummyRes: CompressionResult = {
        file,
        originalFile: file,
        originalSize: file.size,
        compressedSize: file.size,
        compressionRatio: 1,
        savingsBytes: 0,
        savedPercent: 0,
        originalDimensions: { width: 0, height: 0 },
        compressedDimensions: { width: 0, height: 0 },
        format: file.type || 'application/octet-stream',
        previewUrl: originalPreviewUrl,
        originalPreviewUrl,
        durationMs: 0,
        isCompressed: false
      };
      results.push(dummyRes);
      completed++;
      if (onProgress) onProgress(completed, total, dummyRes);
    }
  }

  return results;
}
