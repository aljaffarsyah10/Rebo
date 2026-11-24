/**
 * ==============================================================================
 * REBO V2: Google Drive Folder Generator & Automation Engine
 * Module: src/lib/gdrive/generator.ts
 *
 * Mengelola standarisasi sanitasi nama direktori, pembuatan struktur path berjenjang,
 * ekstraksi/generasi tautan Google Drive, dan penyusunan skrip Google Apps Script (GAS).
 *
 * Standar Hierarki:
 * REBO_[TAHUN] > [AREA: Pemenuhan / Reform] > [PILAR: 1 s.d. 6] > [SUBPILAR] > [IND_KODE - NAMA_INDIKATOR]
 * ==============================================================================
 */

// ==============================================================================
// 1. Types & Interfaces
// ==============================================================================

export interface IndicatorFolderStructure {
  id_pertanyaan: string;
  id_pertanyaan_periode?: string;
  kode_indikator: string;
  nama_indikator: string;
  subpilar: string;
  pilar: string;
  area: string;
  path: string;
  target_folder_name: string;
  generated_url: string;
  existing_url?: string | null;
  status?: 'mapped' | 'unmapped' | 'custom';
}

export interface GeneratePathParams {
  tahun: number | string;
  area: number | string;
  pilar: number | string;
  subpilar: string;
  kodeIndikator: string;
  namaIndikator: string;
}

export interface GeneratedIndicatorPath {
  fullPath: string;
  rootFolderName: string;
  areaFolder: string;
  pilarFolder: string;
  subpilarFolder: string;
  indicatorFolder: string;
}

export interface GasScriptItem {
  id_pertanyaan: string;
  kode_indikator: string;
  nama_indikator: string;
  area: string;
  pilar: string;
  subpilar: string;
  target_folder_name: string;
  path: string;
}

export interface GasScriptOptions {
  tahun: number;
  namaPeriode?: string;
  rootFolderId?: string;
  rootFolderUrl?: string;
  items: GasScriptItem[];
}

// ==============================================================================
// 2. Sanitasi & Penamaan Folder
// ==============================================================================

/**
 * Karakter ilegal dalam penamaan folder sistem berkas & Google Drive:
 * \ / : * ? " < > | serta karakter kontrol ASCII (0-31 dan 127).
 */
const ILLEGAL_CHARS_REGEX = /[/\\:*?"<>|\x00-\x1F\x7F]/g;

/**
 * Membersihkan nama string agar aman dan rapi sebagai nama folder.
 * Menghilangkan karakter ilegal, menormalkan spasi, dan memotong panjang jika melebihi batas.
 */
export function sanitizeFolderName(
  name: string,
  maxLength: number = 60
): string {
  if (!name || typeof name !== 'string') return 'Folder';

  // Hapus karakter ilegal dan ganti pemisah dengan spasi atau underscore
  let cleaned = name
    .replace(ILLEGAL_CHARS_REGEX, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // Hapus titik atau spasi di akhir yang dilarang di Windows/Drive
  cleaned = cleaned.replace(/[. ]+$/, '');

  if (!cleaned) return 'Folder';

  // Potong sesuai batas panjang maksimal tanpa merusak kata
  if (cleaned.length > maxLength) {
    const truncated = cleaned.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    if (lastSpace > maxLength * 0.6) {
      cleaned = truncated.slice(0, lastSpace).trim();
    } else {
      cleaned = truncated.trim();
    }
  }

  return cleaned;
}

/**
 * Konversi angka ke Angka Romawi (1 s.d. 10).
 */
export function toRomanNumeral(num: number): string {
  const romans: Record<number, string> = {
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'VII',
    8: 'VIII',
    9: 'IX',
    10: 'X'
  };
  return romans[num] || String(num);
}

/**
 * Standarisasi nama folder Area:
 * 1 / Pemenuhan -> 01_AREA_PEMENUHAN
 * 2 / Reform -> 02_AREA_REFORM
 */
export function standardizeAreaFolderName(area: string | number): string {
  const str = String(area).trim().toLowerCase();
  if (str === '1' || str.includes('pemenuhan')) {
    return '01_AREA_PEMENUHAN';
  }
  if (str === '2' || str.includes('reform')) {
    return '02_AREA_REFORM';
  }
  // Fallback
  return `AREA_${sanitizeFolderName(str).toUpperCase()}`;
}

/**
 * Standarisasi nama folder Pilar:
 * Pilar 1 s.d. 6 dengan penamaan resmi sesuai PRD REBO V2.
 */
export const STANDARD_PILAR_NAMES: Record<string, string> = {
  '1': 'PILAR_I_MANAJEMEN_PERUBAHAN',
  '2': 'PILAR_II_PENATAAN_TATALAKSANA',
  '3': 'PILAR_III_PENATAAN_SISTEM_MANAJEMEN_SDM',
  '4': 'PILAR_IV_PENGUATAN_AKUNTABILITAS',
  '5': 'PILAR_V_PENGUATAN_PENGAWASAN',
  '6': 'PILAR_VI_PENINGKATAN_KUALITAS_PELAYANAN_PUBLIK'
};

export function standardizePilarFolderName(
  pilarId: string | number,
  pilarName?: string
): string {
  const idStr = String(pilarId).trim();
  if (STANDARD_PILAR_NAMES[idStr]) {
    return STANDARD_PILAR_NAMES[idStr];
  }

  // Jika nama pilar disediakan
  const cleanName = sanitizeFolderName(pilarName || `Pilar ${pilarId}`, 40)
    .toUpperCase()
    .replace(/\s+/g, '_');

  const num = parseInt(idStr, 10);
  const roman = !isNaN(num) ? toRomanNumeral(num) : idStr.toUpperCase();

  return `PILAR_${roman}_${cleanName}`;
}

/**
 * Standarisasi nama folder Subpilar:
 * Format: SUBPILAR_[HURUF/KODE]_[NAMA]
 */
export function standardizeSubpilarFolderName(
  subpilarName: string,
  subpilarId?: string | number,
  index?: number
): string {
  const cleaned = sanitizeFolderName(subpilarName, 45)
    .toUpperCase()
    .replace(/\s+/g, '_');

  // Jika sudah memiliki awalan SUBPILAR, kembalikan format bersih
  if (cleaned.startsWith('SUBPILAR')) {
    return cleaned;
  }

  let prefix = '';
  if (typeof index === 'number' && index >= 0 && index < 26) {
    prefix = String.fromCharCode(65 + index); // A, B, C, ...
  } else if (subpilarId) {
    prefix = String(subpilarId).toUpperCase();
  }

  return prefix ? `SUBPILAR_${prefix}_${cleaned}` : `SUBPILAR_${cleaned}`;
}

/**
 * Standarisasi nama folder Indikator:
 * Format: IND_[KODE] - [NAMA_INDIKATOR_RINGKAS]
 * Contoh: IND_01 - Pembentukan Tim Kerja
 */
export function standardizeIndicatorFolderName(
  kode: string,
  nama: string
): string {
  const cleanKode = sanitizeFolderName(kode, 10).replace(/\s+/g, '_');
  const cleanNama = sanitizeFolderName(nama, 50);

  // Normalisasi prefix kode (misal jika kode sudah berawalan IND_)
  const kodeFormatted = cleanKode.toUpperCase().startsWith('IND_')
    ? cleanKode.toUpperCase()
    : `IND_${cleanKode.padStart(2, '0')}`;

  return `${kodeFormatted} - ${cleanNama}`;
}

// ==============================================================================
// 3. Generator Path Direktori Berjenjang
// ==============================================================================

/**
 * Menghasilkan susunan path berjenjang lengkap untuk indikator pertanyaan.
 */
export function generateIndicatorPath(
  params: GeneratePathParams
): GeneratedIndicatorPath {
  const rootFolderName = `REBO_${params.tahun}`;
  const areaFolder = standardizeAreaFolderName(params.area);
  const pilarFolder = standardizePilarFolderName(params.pilar);
  const subpilarFolder = standardizeSubpilarFolderName(params.subpilar);
  const indicatorFolder = standardizeIndicatorFolderName(
    params.kodeIndikator,
    params.namaIndikator
  );

  const fullPath = `${rootFolderName}/${areaFolder}/${pilarFolder}/${subpilarFolder}/${indicatorFolder}`;

  return {
    fullPath,
    rootFolderName,
    areaFolder,
    pilarFolder,
    subpilarFolder,
    indicatorFolder
  };
}

// ==============================================================================
// 4. Utilitas Ekstraksi & Generator URL Google Drive
// ==============================================================================

/**
 * Mengekstrak Google Drive Folder ID dari berbagai format URL atau ID mentah.
 * Contoh yang didukung:
 * - https://drive.google.com/drive/folders/1A2B3C4D5E...
 * - https://drive.google.com/drive/u/0/folders/1A2B3C4D5E...
 * - https://drive.google.com/open?id=1A2B3C4D5E...
 * - 1A2B3C4D5E... (ID mentah alphanumeric)
 */
export function extractGoogleDriveFolderId(input: string): string | null {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();

  // Pola 1: /folders/ID
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]{15,})/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // Pola 2: id=ID
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // Pola 3: Raw ID string (tanpa slash, panjang minimal 15 karakter)
  if (/^[a-zA-Z0-9_-]{15,64}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Memvalidasi apakah sebuah string adalah URL Google Drive yang valid.
 */
export function isValidGoogleDriveUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname === 'drive.google.com' ||
      parsed.hostname.endsWith('.drive.google.com')
    );
  } catch {
    return false;
  }
}

/**
 * Menghasilkan URL Google Drive untuk folder tertentu.
 * Jika folderId langsung diketahui, menghasilkan link folder langsung.
 * Jika hanya root folder yang diketahui, menghasilkan link pencarian terarah di dalam folder induk.
 */
export function generateFolderUrl(
  rootFolderInput: string,
  options?: {
    directFolderId?: string | null;
    targetFolderName?: string;
  }
): string {
  // Jika direct folder ID sudah ada, gunakan URL direct
  if (options?.directFolderId) {
    return `https://drive.google.com/drive/folders/${options.directFolderId}`;
  }

  const rootId = extractGoogleDriveFolderId(rootFolderInput);
  if (!rootId) {
    // Jika format input tidak dapat diekstrak tapi merupakan URL yang diawali http, kembalikan apa adanya
    if (rootFolderInput.startsWith('http')) {
      return rootFolderInput;
    }
    return `https://drive.google.com/drive/my-drive`;
  }

  // Jika nama target folder diberikan, buat tautan pencarian direktori Google Drive yang terarah
  if (options?.targetFolderName) {
    const query = encodeURIComponent(
      `'${rootId}' in parents and name contains '${options.targetFolderName}'`
    );
    return `https://drive.google.com/drive/search?q=${query}`;
  }

  return `https://drive.google.com/drive/folders/${rootId}`;
}

// ==============================================================================
// 5. Generator Skrip Google Apps Script (GAS)
// ==============================================================================

/**
 * Menghasilkan kode Google Apps Script (GAS) sekali jalan yang dapat dieksekusi
 * oleh administrator di script.google.com atau Google Sheets untuk secara instan:
 * 1. Membuat seluruh pohon folder fisik REBO V2 di Google Drive instansi.
 * 2. Mencegah duplikasi folder (idempotent caching).
 * 3. Menghasilkan Google Sheet pemetaan folder yang memuat Folder ID dan Link URL unik tiap indikator.
 * 4. Menampilkan log ringkasan yang siap disalin kembali ke REBO V2.
 */
export function createReboFoldersScript(options: GasScriptOptions): string {
  const rootId = options.rootFolderId
    ? options.rootFolderId
    : options.rootFolderUrl
      ? extractGoogleDriveFolderId(options.rootFolderUrl) || ''
      : '';

  const jsonItems = JSON.stringify(options.items, null, 2);
  const tahun = options.tahun;
  const namaPeriode = options.namaPeriode || `Evaluasi PMPRB ${tahun}`;

  return `/**
 * =========================================================================
 * REBO V2: SKRIP OTOMATISASI GENERATOR FOLDER GOOGLE DRIVE PER INDIKATOR
 * =========================================================================
 * Periode Evaluasi : ${tahun} (${namaPeriode})
 * Dibuat secara otomatis oleh : REBO V2 Engine
 * Tanggal Dibuat   : ${new Date().toISOString()}
 * Jumlah Indikator : ${options.items.length}
 *
 * FITUR UTAMA & AUTO-PROVISIONING:
 * - Otomasi Hak Akses : Menyetel 'DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW'
 *   pada semua folder agar dokumen bukti dapat langsung dibaca oleh Tim Asesor/Penilai Pusat.
 * - Idempotent Creation: Mencegah duplikasi folder jika skrip dijalankan ulang.
 *
 * CARA MENGGUNAKAN SKRIP INI:
 * -------------------------------------------------------------------------
 * 1. Buka browser dan kunjungi: https://script.google.com
 *    (Pastikan Anda login dengan akun Google instansi / akun admin Drive).
 * 2. Klik "New Project" / "Proyek Baru".
 * 3. Hapus semua teks yang ada di editor 'Code.gs', lalu tempelkan (PASTE)
 *    seluruh isi skrip ini.
 * 4. Beri nama proyek, misal: "REBO_${tahun}_Folder_Generator".
 * 5. Periksa variabel ROOT_FOLDER_ID di bawah (sudah terisi otomatis jika
 *    Anda memasukkannya di aplikasi REBO).
 * 6. Pada dropdown fungsi di toolbar atas, pilih: "mainCreateReboFolders"
 * 7. Klik tombol "Run" / "Jalankan" (ikon segitiga).
 * 8. Berikan izin otorisasi Google Drive ("Review Permissions" -> Lanjutkan).
 * 9. Tunggu hingga proses selesai. Skrip akan membuat:
 *    - Seluruh pohon folder fisik berjenjang di Google Drive.
 *    - Spreadsheet baru bernama "REBO_FOLDER_MAPPING_${tahun}" yang berisi
 *      daftar ID dan URL lengkap setiap folder per indikator.
 * 10. Di tab Execution Log, JSON hasil pemetaan juga dicetak.
 * =========================================================================
 */

// Konfigurasi Utama
var CONFIG = {
  TAHUN: ${tahun},
  NAMA_PERIODE: ${JSON.stringify(namaPeriode)},
  // ID Folder Google Drive Induk (dikosongkan jika ingin dibuat di Root My Drive)
  ROOT_FOLDER_ID: ${JSON.stringify(rootId)},
  // Nama folder induk tahunan yang akan dibuat jika ROOT_FOLDER_ID kosong
  ROOT_FOLDER_NAME: "REBO_${tahun}"
};

// Data Indikator yang akan dibuat foldernya
var INDICATOR_DATA = ${jsonItems};

/**
 * Fungsi Utama: Membuat seluruh struktur folder REBO V2
 */
function mainCreateReboFolders() {
  Logger.log("=== MEMULAI GENERASI FOLDER REBO V2 TAHUN " + CONFIG.TAHUN + " ===");
  Logger.log("Total Indikator yang akan diproses: " + INDICATOR_DATA.length);

  // 1. Dapatkan atau buat Folder Induk Root
  var rootFolder;
  if (CONFIG.ROOT_FOLDER_ID && CONFIG.ROOT_FOLDER_ID.trim() !== "") {
    try {
      rootFolder = DriveApp.getFolderById(CONFIG.ROOT_FOLDER_ID.trim());
      Logger.log("Folder Induk ditemukan: " + rootFolder.getName() + " (ID: " + rootFolder.getId() + ")");
    } catch (err) {
      Logger.log("PERINGATAN: ROOT_FOLDER_ID tidak valid. Membuat folder baru di My Drive.");
      rootFolder = getOrCreateSubFolder(DriveApp.getRootFolder(), CONFIG.ROOT_FOLDER_NAME);
    }
  } else {
    rootFolder = getOrCreateSubFolder(DriveApp.getRootFolder(), CONFIG.ROOT_FOLDER_NAME);
  }

  // Auto-Provisioning: Setel hak akses root folder ke Anyone with link can view
  try {
    rootFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (rootPermErr) {
    Logger.log("Info perizinan root folder: " + rootPermErr.message);
  }

  Logger.log("Root Folder URL: " + rootFolder.getUrl());

  // Memory cache untuk menghindari panggilan Drive API yang berulang
  var folderCache = {};
  folderCache["root"] = rootFolder;

  var results = [];
  var successCount = 0;
  var errorCount = 0;

  for (var i = 0; i < INDICATOR_DATA.length; i++) {
    var item = INDICATOR_DATA[i];
    try {
      // 2. Folder Area (Level 1)
      var areaKey = "area_" + item.area;
      if (!folderCache[areaKey]) {
        folderCache[areaKey] = getOrCreateSubFolder(rootFolder, item.area);
      }
      var areaFolder = folderCache[areaKey];

      // 3. Folder Pilar (Level 2)
      var pilarKey = areaKey + "_pilar_" + item.pilar;
      if (!folderCache[pilarKey]) {
        folderCache[pilarKey] = getOrCreateSubFolder(areaFolder, item.pilar);
      }
      var pilarFolder = folderCache[pilarKey];

      // 4. Folder Subpilar (Level 3)
      var subpilarKey = pilarKey + "_sub_" + item.subpilar;
      if (!folderCache[subpilarKey]) {
        folderCache[subpilarKey] = getOrCreateSubFolder(pilarFolder, item.subpilar);
      }
      var subpilarFolder = folderCache[subpilarKey];

      // 5. Folder Indikator (Level 4 - Target Utama)
      var indicatorFolder = getOrCreateSubFolder(subpilarFolder, item.target_folder_name);

      var folderId = indicatorFolder.getId();
      var folderUrl = indicatorFolder.getUrl();

      results.push({
        id_pertanyaan: item.id_pertanyaan,
        kode_indikator: item.kode_indikator,
        nama_indikator: item.nama_indikator,
        pilar: item.pilar,
        subpilar: item.subpilar,
        target_folder_name: item.target_folder_name,
        path: item.path,
        folder_id: folderId,
        folder_url: folderUrl,
        status: "SUCCESS"
      });

      successCount++;
      if ((i + 1) % 10 === 0 || i === INDICATOR_DATA.length - 1) {
        Logger.log("Progres: " + (i + 1) + "/" + INDICATOR_DATA.length + " folder selesai diproses.");
      }
    } catch (e) {
      errorCount++;
      Logger.log("Gagal membuat folder untuk: " + item.target_folder_name + ". Error: " + e.message);
      results.push({
        id_pertanyaan: item.id_pertanyaan,
        kode_indikator: item.kode_indikator,
        nama_indikator: item.nama_indikator,
        pilar: item.pilar,
        subpilar: item.subpilar,
        target_folder_name: item.target_folder_name,
        path: item.path,
        folder_id: "",
        folder_url: "",
        status: "ERROR: " + e.message
      });
    }
  }

  // 6. Buat Google Sheet Pemetaan Hasil
  try {
    var sheetUrl = exportResultsToSheet(results, CONFIG.TAHUN);
    Logger.log("=== SUKSES BESAR ===");
    Logger.log("Folder Sukses: " + successCount + " | Error: " + errorCount);
    Logger.log("Spreadsheet Pemetaan Tersedia di: " + sheetUrl);
  } catch (sheetErr) {
    Logger.log("Pemberitahuan: Pembuatan Spreadsheet dilewati: " + sheetErr.message);
  }

  Logger.log("=== JSON HASIL PEMETAAN UNTUK REBO V2 ===");
  Logger.log(JSON.stringify(results));
}

/**
 * Helper: Mencari folder anak yang sudah ada atau membuatnya jika belum ada.
 * Sekaligus menyetel hak akses ANYONE_WITH_LINK, VIEW (Auto-Provisioning).
 */
function getOrCreateSubFolder(parentFolder, subFolderName) {
  var folders = parentFolder.getFoldersByName(subFolderName);
  var targetFolder;
  if (folders.hasNext()) {
    targetFolder = folders.next();
  } else {
    targetFolder = parentFolder.createFolder(subFolderName);
  }

  // Auto-set hak akses: Siapa saja yang memiliki link dapat melihat
  try {
    targetFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (err) {
    // Shared drive instansi mungkin mengelola hak akses di tingkat induk
  }

  return targetFolder;
}

/**
 * Helper: Menyimpan hasil pembuatan folder ke Google Spreadsheet untuk arsip.
 */
function exportResultsToSheet(results, tahun) {
  var sheetName = "REBO_FOLDER_MAPPING_" + tahun;
  var ss = SpreadsheetApp.create(sheetName);
  var sheet = ss.getActiveSheet();

  // Header
  var headers = [
    "ID Pertanyaan",
    "Kode Indikator",
    "Nama Indikator",
    "Pilar",
    "Subpilar",
    "Nama Folder",
    "Path Lengkap",
    "Folder ID",
    "Folder URL",
    "Status"
  ];
  sheet.appendRow(headers);

  // Style Header
  var headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground("#1E40AF");
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");

  // Data baris
  var rows = [];
  for (var i = 0; i < results.length; i++) {
    var r = results[i];
    rows.push([
      r.id_pertanyaan,
      r.kode_indikator,
      r.nama_indikator,
      r.pilar,
      r.subpilar,
      r.target_folder_name,
      r.path,
      r.folder_id,
      r.folder_url,
      r.status
    ]);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
  }

  sheet.autoResizeColumns(1, headers.length);
  return ss.getUrl();
}
`;
}
