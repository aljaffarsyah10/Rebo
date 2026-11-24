#!/usr/bin/env node

/**
 * REBO RPA ZIAPP Auto-Submit Script (Headless / Semi-Automated CLI Runner)
 * BPS Kabupaten Kepulauan Siau Tagulandang Biaro
 *
 * Penggunaan:
 *   node scripts/rpa_ziapp_sync.js [options]
 *
 * Opsi:
 *   --server=<url>         URL Server REBO (Default: http://localhost:3000)
 *   --target=<url>         URL Web Portal ZIAPP (Default: https://ziapp.bps.go.id)
 *   --username=<user>      Username akun ZIAPP / SSO BPS
 *   --password=<pass>      Password akun ZIAPP / SSO BPS
 *   --headless=<bool>      Jalankan headless tanpa GUI (Default: false agar operator dapat memantau)
 *   --auto-confirm=<bool>  Tandai otomatis status SYNCED_TO_ZIAPP di server REBO (Default: true)
 *   --dry-run              Hanya lakukan pengujian tanpa menyimpan permanen di server target
 *   --mock-form            Jalankan pengujian ke file form simulasi lokal
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

// ==============================================================================
// 1. Argument Parser & Environment Resolver
// ==============================================================================

const args = process.argv.slice(2);
function getArg(name, defaultValue = '') {
  const prefix = `--${name}=`;
  const found = args.find((a) => a.startsWith(prefix));
  if (found) return found.slice(prefix.length).trim();
  if (args.includes(`--${name}`)) return 'true';
  return defaultValue;
}

const CONFIG = {
  serverUrl: getArg(
    'server',
    process.env.REBO_SERVER_URL || 'http://localhost:3000'
  ).replace(/\/+$/, ''),
  targetUrl: getArg(
    'target',
    process.env.ZIAPP_PORTAL_URL || 'https://ziapp.bps.go.id'
  ),
  username: getArg('username', process.env.ZIAPP_USERNAME || ''),
  password: getArg('password', process.env.ZIAPP_PASSWORD || ''),
  headless: getArg('headless', 'false') === 'true',
  autoConfirm: getArg('auto-confirm', 'true') !== 'false',
  dryRun: args.includes('--dry-run'),
  mockForm: args.includes('--mock-form'),
  chromePath: getArg('chrome-path', '')
};

// ==============================================================================
// 2. Resolve Puppeteer / Puppeteer-Core & Chrome Executable
// ==============================================================================

function resolvePuppeteer() {
  try {
    return { pkg: require('puppeteer'), isCore: false };
  } catch (e) {
    try {
      return { pkg: require('puppeteer-core'), isCore: true };
    } catch (e2) {
      console.error('❌ Modul puppeteer atau puppeteer-core tidak ditemukan!');
      console.error('Silakan jalankan: pnpm add -D puppeteer-core');
      process.exit(1);
    }
  }
}

function resolveChromePath() {
  if (CONFIG.chromePath && fs.existsSync(CONFIG.chromePath)) {
    return CONFIG.chromePath;
  }

  const winCandidates = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    path.join(
      process.env.LOCALAPPDATA || '',
      'Google\\Chrome\\Application\\chrome.exe'
    ),
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
  ];

  for (const p of winCandidates) {
    if (p && fs.existsSync(p)) {
      return p;
    }
  }

  return null;
}

// ==============================================================================
// 3. Fetch Sync Data from REBO
// ==============================================================================

async function fetchReadyItemsFromREBO(serverUrl) {
  const fetchUrl = `${serverUrl}/api/sync/ziapp?status=ready`;
  console.log(`\n📡 Mengambil data indikator siap kirim dari REBO:`);
  console.log(`   URL: ${fetchUrl}`);

  try {
    const res = await fetch(fetchUrl, {
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.items || [];
  } catch (err) {
    console.warn(`⚠️ Gagal mengambil data via fetch API (${err.message}).`);
    return [];
  }
}

// ==============================================================================
// 4. Update Status ke REBO (POST /api/sync/ziapp)
// ==============================================================================

async function markIndicatorAsSynced(serverUrl, idPertanyaan, notes) {
  try {
    const res = await fetch(`${serverUrl}/api/sync/ziapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id_pertanyaan: idPertanyaan,
        notes:
          notes ||
          `Disinkronkan otomatis via RPA CLI pada ${new Date().toISOString()}`
      })
    });
    return res.ok;
  } catch (err) {
    console.error(
      `Gagal mengupdate status pertanyaan ${idPertanyaan}:`,
      err.message
    );
    return false;
  }
}

// ==============================================================================
// 5. Main Execution Flow
// ==============================================================================

async function main() {
  console.log('='.repeat(70));
  console.log(
    '🤖 REBO RPA Sync Runner - Pengisian Batch Otomatis ke Portal ZIAPP'
  );
  console.log('   BPS Kabupaten Kepulauan Siau Tagulandang Biaro');
  console.log('='.repeat(70));
  console.log(`- Server REBO     : ${CONFIG.serverUrl}`);
  console.log(`- Target Portal   : ${CONFIG.targetUrl}`);
  console.log(
    `- Mode Headless   : ${CONFIG.headless ? 'YA' : 'TIDAK (Window Aktif)'}`
  );
  console.log(`- Auto Confirm    : ${CONFIG.autoConfirm ? 'YA' : 'TIDAK'}`);
  console.log(`- Dry-Run         : ${CONFIG.dryRun ? 'YA' : 'TIDAK'}`);

  // 1. Ambil data dari REBO API
  let items = await fetchReadyItemsFromREBO(CONFIG.serverUrl);

  // Jika server lokal belum running atau tidak ada data ready, buat data simulasi jika mode mock
  if (items.length === 0) {
    console.log('\nℹ️ Tidak ada indikator dengan status READY_FOR_ZIAPP.');
    if (CONFIG.mockForm || CONFIG.dryRun) {
      console.log(
        '⚠️ Menggunakan data simulasi indikator untuk pengujian dry-run...'
      );
      items = [
        {
          id_pertanyaan: '101',
          kode_indikator: 'IND-1.1.1',
          pilar_kode: 'Pilar 1',
          uraian_pertanyaan: 'Penerapan Manajemen Perubahan dan Tim Kerja ZI',
          nilai_mandiri: 1.0,
          nilai_verifikasi: 1.0,
          catatan_koordinator:
            'Bukti dukung SK Tim Kerja ZI 2026 telah lengkap dan terverifikasi.',
          gdrive_folder_url:
            'https://drive.google.com/drive/folders/1BpsSitaroManajemenPerubahan2026'
        },
        {
          id_pertanyaan: '102',
          kode_indikator: 'IND-1.1.2',
          pilar_kode: 'Pilar 1',
          uraian_pertanyaan: 'Rencana Pembangunan Zona Integritas',
          nilai_mandiri: 1.0,
          nilai_verifikasi: 1.0,
          catatan_koordinator:
            'Dokumen Rencana Kerja dan Matriks Aksi telah disetujui Kepala BPS.',
          gdrive_folder_url:
            'https://drive.google.com/drive/folders/1BpsSitaroRencanaKerja2026'
        }
      ];
    } else {
      console.log(
        '✅ Selesai: Tidak ada antrean indikator yang perlu disinkronkan.'
      );
      return;
    }
  }

  console.log(`\n📋 Ditemukan ${items.length} indikator yang akan diproses:`);
  items.forEach((item, idx) => {
    console.log(
      `   ${idx + 1}. [${item.kode_indikator || item.id_pertanyaan}] ${item.uraian_pertanyaan ? item.uraian_pertanyaan.slice(0, 50) : ''}...`
    );
  });

  // 2. Inisialisasi Puppeteer Browser
  const { pkg: puppeteer, isCore } = resolvePuppeteer();
  const launchOptions = {
    headless: CONFIG.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process',
      '--window-size=1440,900'
    ],
    defaultViewport: { width: 1440, height: 900 }
  };

  if (isCore) {
    const chromePath = resolveChromePath();
    if (!chromePath) {
      console.error(
        '❌ Tidak dapat menemukan executable Google Chrome atau Microsoft Edge pada sistem ini.'
      );
      console.error(
        'Silakan gunakan opsi: --chrome-path="C:\\path\\to\\chrome.exe"'
      );
      process.exit(1);
    }
    launchOptions.executablePath = chromePath;
    console.log(`\n🌐 Menjalankan Browser: ${chromePath}`);
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  try {
    // 3. Navigasi ke Halaman Target ZIAPP atau Halaman Mock Form
    console.log(
      `\n🚀 Mengarahkan peramban ke halaman target: ${CONFIG.targetUrl}...`
    );

    if (CONFIG.mockForm) {
      // Buat form HTML simulasi di halaman browser
      await page.setContent(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Simulasi Portal ZIAPP - Lembar Kerja Evaluasi</title>
          <style>
            body { font-family: sans-serif; padding: 24px; background: #f1f5f9; }
            .card { background: white; padding: 20px; border-radius: 8px; margin-bottom: 16px; border: 1px solid #cbd5e1; }
            h2 { color: #0284c7; }
            .form-row { margin-bottom: 12px; }
            label { display: block; font-weight: bold; margin-bottom: 4px; font-size: 13px; }
            input[type="text"], input[type="url"], textarea { width: 100%; padding: 8px; border: 1px solid #94a3b8; border-radius: 4px; box-sizing: border-box; }
            button { background: #0284c7; color: white; border: none; padding: 10px 16px; border-radius: 6px; cursor: pointer; }
          </style>
        </head>
        <body>
          <h1>Portal Evaluasi ZIAPP (Mock Form LKE)</h1>
          <p>Halaman pengujian otomasi REBO RPA Assistant.</p>

          <div class="card" id="row-IND-1.1.1">
            <h2>Indikator 1.1.1 - Manajemen Perubahan</h2>
            <div class="form-row">
              <label>Tautan Dokumen Bukti Dukung (Google Drive):</label>
              <input type="url" name="link_bukti_101" id="link_bukti_101" placeholder="Masukkan URL Google Drive">
            </div>
            <div class="form-row">
              <label>Catatan / Uraian Bukti:</label>
              <textarea name="catatan_101" id="catatan_101" rows="3" placeholder="Masukkan uraian bukti dukung"></textarea>
            </div>
          </div>

          <div class="card" id="row-IND-1.1.2">
            <h2>Indikator 1.1.2 - Rencana Kerja ZI</h2>
            <div class="form-row">
              <label>Tautan Dokumen Bukti Dukung (Google Drive):</label>
              <input type="url" name="link_bukti_102" id="link_bukti_102" placeholder="Masukkan URL Google Drive">
            </div>
            <div class="form-row">
              <label>Catatan / Uraian Bukti:</label>
              <textarea name="catatan_102" id="catatan_102" rows="3" placeholder="Masukkan uraian bukti dukung"></textarea>
            </div>
          </div>

          <button type="button" id="btn-submit">Simpan Penilaian ZIAPP</button>
        </body>
        </html>
      `);
    } else {
      await page
        .goto(CONFIG.targetUrl, {
          waitUntil: 'networkidle2',
          timeout: 45000
        })
        .catch((e) => {
          console.warn(`Catatan navigasi: ${e.message}`);
        });
    }

    // 4. Handle Login Jika Kredensial Diberikan
    if (CONFIG.username && CONFIG.password && !CONFIG.mockForm) {
      console.log('🔑 Mengisikan kredensial login akun ZIAPP...');
      const userInput = await page.$(
        'input[name*="user" i], input[id*="user" i], input[type="email"]'
      );
      const passInput = await page.$(
        'input[name*="pass" i], input[id*="pass" i], input[type="password"]'
      );

      if (userInput && passInput) {
        await userInput.type(CONFIG.username);
        await passInput.type(CONFIG.password);
        const submitBtn = await page.$(
          'button[type="submit"], input[type="submit"]'
        );
        if (submitBtn) {
          await Promise.all([
            page.waitForNavigation({ timeout: 15000 }).catch(() => {}),
            submitBtn.click()
          ]);
          console.log('✅ Berhasil mengirimkan formulir login.');
        }
      }
    }

    // 5. Injeksi & Auto-Fill Nilai
    console.log('\n⚡ Menjalankan mesin auto-fill pada dokumen halaman...');
    const result = await page.evaluate((syncItems) => {
      let filledCount = 0;
      const filledDetails = [];

      function triggerChange(el) {
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        el.dispatchEvent(new Event('blur', { bubbles: true }));
      }

      function setVal(el, val) {
        if (!el) return;
        el.focus();
        const desc = Object.getOwnPropertyDescriptor(
          Object.getPrototypeOf(el),
          'value'
        );
        if (desc && desc.set) {
          desc.set.call(el, val);
        } else {
          el.value = val;
        }
        triggerChange(el);
      }

      syncItems.forEach((item) => {
        const kode = item.kode_indikator || '';
        const numMatch = kode.match(/(\d+\.\d+(\.\d+)?)/);
        const numeric = numMatch ? numMatch[1] : '';
        const driveUrl =
          item.gdrive_folder_url ||
          (item.public_drive_links && item.public_drive_links[0]) ||
          '';
        const notes = item.catatan_koordinator || item.uraian_buktidukung || '';

        // Cari row atau kontainer
        const safeId = kode.replace(/"/g, '');
        const selectorCandidates = [
          `[id="row-${safeId}"]`,
          `[id*="${safeId}"]`,
          `[data-kode*="${numeric}"]`,
          `[id*="${item.id_pertanyaan}"]`,
          `[name*="${item.id_pertanyaan}"]`
        ];

        let container = null;
        for (const sel of selectorCandidates) {
          try {
            const el = document.querySelector(sel);
            if (el) {
              container = el.closest('tr, .card, .form-group') || el;
              break;
            }
          } catch (e) {
            // ignore selector error
          }
        }

        // Fallback global jika tidak ketemu spesifik container
        const linkInput = container
          ? container.querySelector(
              'input[type="url"], input[name*="link" i], input[name*="bukti" i]'
            )
          : document.querySelector(
              `input[name*="${item.id_pertanyaan}"][name*="link" i], input[id*="${numeric}"][id*="link" i]`
            );

        const notesInput = container
          ? container.querySelector(
              'textarea, input[name*="catatan" i], input[name*="uraian" i]'
            )
          : document.querySelector(
              `textarea[name*="${item.id_pertanyaan}" i], textarea[id*="${numeric}" i]`
            );

        let touched = false;
        if (linkInput && driveUrl) {
          setVal(linkInput, driveUrl);
          touched = true;
        }

        if (notesInput && notes) {
          setVal(notesInput, notes);
          touched = true;
        }

        if (touched) {
          filledCount++;
          filledDetails.push({
            id_pertanyaan: item.id_pertanyaan,
            kode_indikator: item.kode_indikator
          });
        }
      });

      return { filledCount, filledDetails };
    }, items);

    console.log(
      `\n✨ Hasil Auto-Fill RPA: ${result.filledCount} dari ${items.length} indikator berhasil diisi.`
    );

    // 6. Ambil Screenshot Bukti
    const docsDir = path.join(__dirname, '..', 'public', 'docs');
    if (!fs.existsSync(docsDir)) {
      fs.mkdirSync(docsDir, { recursive: true });
    }
    const screenshotPath = path.join(docsDir, 'rpa_sync_latest.png');
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Screenshot audit tersimpan di: ${screenshotPath}`);

    // 7. Auto Confirm ke REBO Server
    if (
      CONFIG.autoConfirm &&
      !CONFIG.dryRun &&
      result.filledDetails.length > 0
    ) {
      console.log(
        `\n🔄 Memperbarui status ${result.filledDetails.length} indikator ke server REBO...`
      );
      let confirmedCount = 0;
      for (const det of result.filledDetails) {
        const ok = await markIndicatorAsSynced(
          CONFIG.serverUrl,
          det.id_pertanyaan,
          `Disinkronkan otomatis oleh REBO RPA CLI pada ${new Date().toLocaleString('id-ID')}`
        );
        if (ok) confirmedCount++;
      }
      console.log(
        `✅ Berhasil memperbarui status ${confirmedCount} indikator menjadi SYNCED_TO_ZIAPP di database REBO.`
      );
    }

    // Tunggu sejenak jika tidak headless agar user dapat menginspeksi
    if (!CONFIG.headless) {
      console.log(
        '\n⏳ Browser tetap terbuka selama 8 detik untuk inspeksi visual...'
      );
      await new Promise((r) => setTimeout(r, 8000));
    }
  } catch (error) {
    console.error('\n❌ Terjadi kesalahan selama eksekusi RPA:', error);
  } finally {
    await browser.close();
    console.log('\n🏁 Sesi RPA ZIAPP selesai.');
  }
}

main().catch((err) => {
  console.error('Fatal RPA error:', err);
  process.exit(1);
});
