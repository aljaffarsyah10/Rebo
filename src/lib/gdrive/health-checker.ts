/**
 * ==============================================================================
 * REBO V2: Google Drive Link & Permission Health Checker (Pre-Audit Guard)
 * Module: src/lib/gdrive/health-checker.ts
 *
 * Utilitas untuk memvalidasi sintaks URL Google Drive/Docs dan memeriksa izin
 * akses (Health Check) tanpa kredensial (Anonymous Evaluation) untuk memastikan
 * bukti dukung berstatus "Anyone with the link" sebelum diajukan/disetujui.
 * ==============================================================================
 */

export type GDriveHealthStatus = 'PUBLIC' | 'RESTRICTED' | 'INVALID' | 'ERROR';

export type GDriveResourceType =
  | 'folder'
  | 'file'
  | 'document'
  | 'spreadsheet'
  | 'presentation'
  | 'form'
  | 'drive'
  | 'unknown';

export interface ParsedGDriveUrl {
  isValid: boolean;
  rawUrl: string;
  cleanUrl: string;
  id: string | null;
  resourceType: GDriveResourceType;
  hostname: string;
  error?: string;
}

export interface GDriveHealthCheckResult {
  status: GDriveHealthStatus;
  message: string;
  statusCode?: number;
  url: string;
  resourceType?: GDriveResourceType;
  id?: string | null;
  checkedAt: string;
}

/**
 * Pola regex deteksi URL Google Drive dan Google Docs
 */
const GDRIVE_HOSTNAMES = [
  'drive.google.com',
  'docs.google.com',
  'drive.google.co.id',
  'docs.google.co.id'
];

/**
 * Memvalidasi apakah URL merupakan tautan Google Drive / Google Docs yang valid,
 * serta mengekstrak resource ID dan tipe sumber daya (folder, file, doc, spreadsheet, dll).
 */
export function parseGDriveUrl(rawInput: string): ParsedGDriveUrl {
  if (!rawInput || typeof rawInput !== 'string') {
    return {
      isValid: false,
      rawUrl: rawInput || '',
      cleanUrl: '',
      id: null,
      resourceType: 'unknown',
      hostname: '',
      error: 'URL tidak boleh kosong.'
    };
  }

  let cleanInput = rawInput.trim();

  // Tambahkan protokol jika pemakai hanya menyalin "drive.google.com/..."
  if (!/^https?:\/\//i.test(cleanInput)) {
    cleanInput = `https://${cleanInput}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(cleanInput);
  } catch {
    return {
      isValid: false,
      rawUrl: rawInput,
      cleanUrl: cleanInput,
      id: null,
      resourceType: 'unknown',
      hostname: '',
      error: 'Format URL tidak valid.'
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const isGoogleDomain = GDRIVE_HOSTNAMES.some(
    (h) => hostname === h || hostname.endsWith(`.${h}`)
  );

  if (!isGoogleDomain) {
    return {
      isValid: false,
      rawUrl: rawInput,
      cleanUrl: parsed.toString(),
      id: null,
      resourceType: 'unknown',
      hostname,
      error:
        'Domain bukan Google Drive atau Google Docs (drive.google.com / docs.google.com).'
    };
  }

  const pathname = parsed.pathname;
  let id: string | null = null;
  let resourceType: GDriveResourceType = 'unknown';

  // 1. Google Drive Folder (/drive/folders/ID atau /drive/u/0/folders/ID)
  const folderMatch = pathname.match(
    /(?:\/u\/\d+)?\/folders\/([a-zA-Z0-9_-]{15,})/
  );
  if (folderMatch && folderMatch[1]) {
    id = folderMatch[1];
    resourceType = 'folder';
  }

  // 2. Google Drive File (/file/d/ID atau /drive/u/0/file/d/ID)
  if (!id) {
    const fileMatch = pathname.match(
      /(?:\/u\/\d+)?\/file\/d\/([a-zA-Z0-9_-]{15,})/
    );
    if (fileMatch && fileMatch[1]) {
      id = fileMatch[1];
      resourceType = 'file';
    }
  }

  // 3. Google Docs (/document/d/ID)
  if (!id && pathname.includes('/document/d/')) {
    const docMatch = pathname.match(/\/document\/d\/([a-zA-Z0-9_-]{15,})/);
    if (docMatch && docMatch[1]) {
      id = docMatch[1];
      resourceType = 'document';
    }
  }

  // 4. Google Sheets (/spreadsheets/d/ID)
  if (!id && pathname.includes('/spreadsheets/d/')) {
    const sheetMatch = pathname.match(
      /\/spreadsheets\/d\/([a-zA-Z0-9_-]{15,})/
    );
    if (sheetMatch && sheetMatch[1]) {
      id = sheetMatch[1];
      resourceType = 'spreadsheet';
    }
  }

  // 5. Google Slides (/presentation/d/ID)
  if (!id && pathname.includes('/presentation/d/')) {
    const slideMatch = pathname.match(
      /\/presentation\/d\/([a-zA-Z0-9_-]{15,})/
    );
    if (slideMatch && slideMatch[1]) {
      id = slideMatch[1];
      resourceType = 'presentation';
    }
  }

  // 6. Google Forms (/forms/d/ID)
  if (!id && pathname.includes('/forms/d/')) {
    const formMatch = pathname.match(/\/forms\/d\/([a-zA-Z0-9_-]{15,})/);
    if (formMatch && formMatch[1]) {
      id = formMatch[1];
      resourceType = 'form';
    }
  }

  // 7. Legacy open?id=ID
  if (!id && parsed.searchParams.has('id')) {
    const paramId = parsed.searchParams.get('id');
    if (paramId && /^[a-zA-Z0-9_-]{15,}$/.test(paramId)) {
      id = paramId;
      resourceType = 'file';
    }
  }

  // 8. Root drive or unrecognized path on drive.google.com
  if (!id && hostname.includes('drive.google.com')) {
    resourceType = 'drive';
  }

  const isValid = Boolean(id || resourceType !== 'unknown');

  return {
    isValid,
    rawUrl: rawInput,
    cleanUrl: parsed.toString(),
    id,
    resourceType,
    hostname,
    error: isValid
      ? undefined
      : 'Tautan Google Drive tidak memiliki ID berkas/folder yang dapat diidentifikasi.'
  };
}

/**
 * Melakukan pemeriksaan izin akses tautan Google Drive / Google Docs secara anonim.
 *
 * Logika evaluasi respons:
 * - Jika diarahkan ke `accounts.google.com/ServiceLogin` atau `accounts.google.com/v3/signin`, atau HTML meminta login: status = 'RESTRICTED'
 * - Jika respons HTTP 200 dan tidak dialihkan ke login: status = 'PUBLIC'
 * - Jika status HTTP 404 atau domain bukan Google Drive: status = 'INVALID'
 * - Jika fetch timeout / network error: status = 'ERROR'
 */
export async function checkGDrivePermission(
  url: string,
  timeoutMs: number = 8000
): Promise<GDriveHealthCheckResult> {
  const checkedAt = new Date().toISOString();

  // 1. Parsing & Validasi format URL Google Drive
  const parsed = parseGDriveUrl(url);
  if (!parsed.isValid) {
    return {
      status: 'INVALID',
      message:
        parsed.error ||
        'URL bukan merupakan tautan Google Drive atau Google Docs yang valid.',
      statusCode: 400,
      url: parsed.cleanUrl || url,
      resourceType: parsed.resourceType,
      id: parsed.id,
      checkedAt
    };
  }

  // 2. Lakukan Anonymous Fetch (tanpa cookie/session auth)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(parsed.cleanUrl, {
      method: 'GET',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache, no-store'
      }
    });

    clearTimeout(timer);

    const finalUrl = response.url || '';
    const statusCode = response.status;

    // A. Analisis apakah dialihkan ke halaman login akun Google
    const isRedirectedToLogin =
      finalUrl.includes('accounts.google.com/ServiceLogin') ||
      finalUrl.includes('accounts.google.com/v3/signin') ||
      finalUrl.includes('accounts.google.com/signin') ||
      finalUrl.includes('accounts.google.com/InteractiveLogin');

    if (isRedirectedToLogin) {
      return {
        status: 'RESTRICTED',
        message:
          'Izin Terkunci (Restricted) - Berkas atau folder memerlukan login Google. Harap ubah setelan akses menjadi "Siapa saja yang memiliki link" (Anyone with link).',
        statusCode,
        url: parsed.cleanUrl,
        resourceType: parsed.resourceType,
        id: parsed.id,
        checkedAt
      };
    }

    // B. Analisis Status 404 (File/Folder Not Found atau Dihapus)
    if (statusCode === 404) {
      return {
        status: 'INVALID',
        message:
          'Tautan tidak ditemukan (404 Not Found). File/folder mungkin telah dihapus atau tautan tidak valid.',
        statusCode,
        url: parsed.cleanUrl,
        resourceType: parsed.resourceType,
        id: parsed.id,
        checkedAt
      };
    }

    // C. Analisis Status 401 / 403 (Akses Ditolak/Unauthorized)
    if (statusCode === 401 || statusCode === 403) {
      return {
        status: 'RESTRICTED',
        message:
          'Izin Terkunci (403 Forbidden). Akses ditolak oleh Google Drive. Harap ubah setelan akses menjadi publik.',
        statusCode,
        url: parsed.cleanUrl,
        resourceType: parsed.resourceType,
        id: parsed.id,
        checkedAt
      };
    }

    // D. Analisis Status 200 OK
    if (statusCode >= 200 && statusCode < 300) {
      // Baca sebagian isi HTML awal untuk mendeteksi halaman form login tersembunyi
      let isHtmlLogin = false;
      try {
        const textSample = await response.text();
        const snippet = textSample.slice(0, 15000);
        isHtmlLogin =
          snippet.includes('<title>Sign in - Google Accounts</title>') ||
          snippet.includes('<title>Google Drive - Masuk</title>') ||
          snippet.includes('<title>Masuk - Akun Google</title>') ||
          snippet.includes(
            'action="https://accounts.google.com/ServiceLogin'
          ) ||
          snippet.includes('action="https://accounts.google.com/v3/signin');
      } catch {
        // Abaikan error pembacaan teks jika stream ditutup lebih awal
      }

      if (isHtmlLogin) {
        return {
          status: 'RESTRICTED',
          message:
            'Izin Terkunci (Restricted) - Tautan mengarahkan ke formulir masuk Google. Harap ubah ke "Siapa saja yang memiliki link".',
          statusCode,
          url: parsed.cleanUrl,
          resourceType: parsed.resourceType,
          id: parsed.id,
          checkedAt
        };
      }

      // Lolos uji: status 200 dan tidak meminta login
      return {
        status: 'PUBLIC',
        message:
          'Akses Terbuka (Anyone with link). Tautan dapat diakses oleh publik/verifikator tanpa kendala izin.',
        statusCode,
        url: parsed.cleanUrl,
        resourceType: parsed.resourceType,
        id: parsed.id,
        checkedAt
      };
    }

    // E. Status HTTP lainnya (500, 502, 503, dll)
    return {
      status: 'ERROR',
      message: `Google Drive merespons dengan kode status HTTP ${statusCode}.`,
      statusCode,
      url: parsed.cleanUrl,
      resourceType: parsed.resourceType,
      id: parsed.id,
      checkedAt
    };
  } catch (error: any) {
    clearTimeout(timer);

    if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
      return {
        status: 'ERROR',
        message: `Pemeriksaan izin tautan Google Drive waktu habis (Timeout ${Math.round(timeoutMs / 1000)}s).`,
        url: parsed.cleanUrl || url,
        resourceType: parsed.resourceType,
        id: parsed.id,
        checkedAt
      };
    }

    return {
      status: 'ERROR',
      message: `Gagal menghubungi Google Drive: ${error?.message || 'Network error'}`,
      url: parsed.cleanUrl || url,
      resourceType: parsed.resourceType,
      id: parsed.id,
      checkedAt
    };
  }
}

/**
 * Melakukan pemeriksaan izin beberapa URL Google Drive sekaligus secara paralel.
 */
export async function checkBatchGDrivePermission(
  urls: string[]
): Promise<Record<string, GDriveHealthCheckResult>> {
  const uniqueUrls = Array.from(
    new Set(urls.filter((u) => Boolean(u?.trim())))
  );
  const results: Record<string, GDriveHealthCheckResult> = {};

  const settled = await Promise.allSettled(
    uniqueUrls.map(async (u) => {
      const res = await checkGDrivePermission(u);
      return { originalUrl: u, res };
    })
  );

  for (const item of settled) {
    if (item.status === 'fulfilled') {
      results[item.value.originalUrl] = item.value.res;
    }
  }

  return results;
}
