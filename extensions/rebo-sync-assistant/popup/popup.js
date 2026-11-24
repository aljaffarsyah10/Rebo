/**
 * REBO Sync Assistant - Popup Logic
 * BPS Kabupaten Kepulauan Siau Tagulandang Biaro
 */

const DEFAULT_SERVER_URL = 'http://localhost:3000';

// State aplikasi
const state = {
  serverUrl: DEFAULT_SERVER_URL,
  items: [],
  summary: null,
  isFetching: false,
  isAutoFilling: false,
  lastSyncResult: null
};

// DOM Elements
const elements = {
  serverUrlInput: document.getElementById('server-url'),
  btnPing: document.getElementById('btn-ping'),
  pingStatus: document.getElementById('ping-status'),
  connectionPulse: document.getElementById('connection-pulse'),
  kpiReady: document.getElementById('kpi-ready'),
  kpiSynced: document.getElementById('kpi-synced'),
  kpiTotal: document.getElementById('kpi-total'),
  btnFetch: document.getElementById('btn-fetch'),
  btnAutofill: document.getElementById('btn-autofill'),
  chkAutoConfirm: document.getElementById('chk-auto-confirm'),
  btnTogglePreview: document.getElementById('btn-toggle-preview'),
  itemsContainer: document.getElementById('items-container'),
  itemsCount: document.getElementById('items-count'),
  activityLog: document.getElementById('activity-log'),
  btnClearLog: document.getElementById('btn-clear-log'),
  presetButtons: document.querySelectorAll('.btn-preset')
};

// ==============================================================================
// 1. Logger Utility
// ==============================================================================

function log(message, type = 'info') {
  if (!elements.activityLog) return;
  const now = new Date();
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  const line = document.createElement('div');
  line.className = `log-line ${type}`;

  const timeSpan = document.createElement('span');
  timeSpan.className = 'log-time';
  timeSpan.textContent = `[${timeStr}]`;

  const msgSpan = document.createElement('span');
  msgSpan.textContent = ` ${message}`;

  line.appendChild(timeSpan);
  line.appendChild(msgSpan);

  elements.activityLog.appendChild(line);
  elements.activityLog.scrollTop = elements.activityLog.scrollHeight;
}

// ==============================================================================
// 2. Storage Helpers
// ==============================================================================

async function loadSettings() {
  return new Promise((resolve) => {
    if (
      typeof chrome !== 'undefined' &&
      chrome.storage &&
      chrome.storage.local
    ) {
      chrome.storage.local.get(['serverUrl', 'autoConfirm'], (res) => {
        state.serverUrl = res.serverUrl || DEFAULT_SERVER_URL;
        elements.serverUrlInput.value = state.serverUrl;
        if (typeof res.autoConfirm === 'boolean') {
          elements.chkAutoConfirm.checked = res.autoConfirm;
        }
        resolve();
      });
    } else {
      state.serverUrl =
        localStorage.getItem('rebo_server_url') || DEFAULT_SERVER_URL;
      elements.serverUrlInput.value = state.serverUrl;
      resolve();
    }
  });
}

async function saveSettings() {
  const url = elements.serverUrlInput.value.trim().replace(/\/+$/, '');
  const autoConfirm = elements.chkAutoConfirm.checked;
  state.serverUrl = url;

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    await chrome.storage.local.set({ serverUrl: url, autoConfirm });
  } else {
    localStorage.setItem('rebo_server_url', url);
  }
}

// ==============================================================================
// 3. Server Connectivity & KPI Fetching
// ==============================================================================

async function pingServer(showNotice = true) {
  await saveSettings();
  const url = `${state.serverUrl}/api/sync/ziapp?summary=true`;

  if (showNotice) {
    elements.pingStatus.className = 'status-message show';
    elements.pingStatus.textContent = 'Menghubungkan ke server REBO...';
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' }
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      elements.connectionPulse.className = 'status-pulse connected';
      elements.connectionPulse.title = 'Terhubung ke Server REBO';

      if (showNotice) {
        elements.pingStatus.className = 'status-message show success';
        elements.pingStatus.textContent = `Online! Terhubung ke REBO (${res.status} OK)`;
      }

      if (data && data.data) {
        updateKPICards(data.data);
      }
      log(`Koneksi berhasil ke ${state.serverUrl}`, 'success');
      return true;
    } else {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
  } catch (err) {
    elements.connectionPulse.className = 'status-pulse error';
    elements.connectionPulse.title = 'Gagal terhubung ke Server REBO';

    if (showNotice) {
      elements.pingStatus.className = 'status-message show error';
      elements.pingStatus.textContent = `Offline: ${err.message || 'Tidak dapat dihubungi'}`;
    }
    log(`Gagal koneksi ke ${state.serverUrl}: ${err.message}`, 'error');
    return false;
  }
}

function updateKPICards(summary) {
  state.summary = summary;
  elements.kpiReady.textContent = summary.total_ready_for_ziapp ?? 0;
  elements.kpiSynced.textContent = summary.total_synced_to_ziapp ?? 0;
  elements.kpiTotal.textContent = summary.total_indikator ?? 0;
}

// ==============================================================================
// 4. Fetch Sync Data from REBO
// ==============================================================================

async function fetchSyncData() {
  if (state.isFetching) return;
  state.isFetching = true;
  await saveSettings();

  elements.btnFetch.disabled = true;
  elements.btnFetch.innerHTML =
    '<span class="btn-icon">⏳</span><span>Memuat Data...</span>';
  log(`Mengambil daftar bukti siap kirim dari ${state.serverUrl}...`, 'info');

  try {
    const endpoint = `${state.serverUrl}/api/sync/ziapp?status=ready`;
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' }
    });

    if (!res.ok) {
      throw new Error(`Server merespons ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    const items = json.items || [];
    state.items = items;

    elements.itemsCount.textContent = items.length;
    renderPreviewItems(items);

    if (items.length > 0) {
      elements.btnAutofill.disabled = false;
      log(
        `Berhasil memuat ${items.length} indikator siap disinkronkan ke ZIAPP!`,
        'success'
      );
    } else {
      elements.btnAutofill.disabled = true;
      log(
        'Tidak ada indikator dengan status READY_FOR_ZIAPP yang ditemukan.',
        'warn'
      );
    }

    // Refresh KPI juga
    pingServer(false);
  } catch (err) {
    log(`Gagal memuat data: ${err.message}`, 'error');
    alert(
      `Gagal mengambil data dari REBO: ${err.message}\nPastikan URL server benar dan server berjalan.`
    );
  } finally {
    state.isFetching = false;
    elements.btnFetch.disabled = false;
    elements.btnFetch.innerHTML =
      '<span class="btn-icon">📥</span><span>1. Ambil Data dari REBO</span>';
  }
}

function renderPreviewItems(items) {
  elements.itemsContainer.innerHTML = '';

  if (!items || items.length === 0) {
    elements.itemsContainer.innerHTML = `
      <div class="empty-state">
        Semua indikator sudah tersinkron atau belum ada yang disetujui (READY_FOR_ZIAPP).
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'item-card';

    const driveUrl =
      item.gdrive_folder_url ||
      (item.public_drive_links && item.public_drive_links[0]) ||
      '';
    const linkBadge = driveUrl
      ? `<a href="${driveUrl}" target="_blank" class="item-badge-link" title="Buka Google Drive">📁 Link Drive</a>`
      : '<span style="color:#ef4444">⚠️ Belum ada link</span>';

    card.innerHTML = `
      <div class="item-card-header">
        <span class="item-code">${item.kode_indikator || `IND-${item.id_pertanyaan}`}</span>
        <span class="item-pilar">${item.pilar_kode || `Pilar ${item.pilar_id}`}</span>
      </div>
      <div class="item-desc">${escapeHtml(item.uraian_singkat || item.uraian_pertanyaan || '')}</div>
      <div class="item-meta">
        <span>Nilai: <strong>${item.nilai_verifikasi || item.nilai_mandiri || 0}</strong></span>
        <span>•</span>
        ${linkBadge}
        <span>•</span>
        <span>${item.dokumen_files ? item.dokumen_files.length : 0} Dokumen</span>
      </div>
    `;

    elements.itemsContainer.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ==============================================================================
// 5. 1-Click Auto-Fill ke Tab Browser Aktif (Content Script)
// ==============================================================================

async function triggerAutoFill() {
  if (state.isAutoFilling || state.items.length === 0) return;
  state.isAutoFilling = true;
  elements.btnAutofill.disabled = true;
  elements.btnAutofill.innerHTML =
    '<span class="btn-icon">⏳</span><span>Mengisikan Form...</span>';

  log('Mempersiapkan injeksi auto-fill ke tab aktif...', 'info');

  try {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      throw new Error(
        'Fitur ini hanya dapat dijalankan di Google Chrome / Chromium.'
      );
    }

    const [activeTab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });
    if (!activeTab || !activeTab.id) {
      throw new Error('Tidak ada tab aktif yang ditemukan.');
    }

    log(
      `Target tab: ${activeTab.title || 'Tab Aktif'} (${activeTab.url || ''})`,
      'info'
    );

    // Coba kirim pesan ke content script
    let response;
    try {
      response = await sendMessageToTab(activeTab.id, {
        action: 'AUTOFILL_ZIAPP',
        items: state.items,
        serverUrl: state.serverUrl,
        autoConfirm: elements.chkAutoConfirm.checked
      });
    } catch (msgErr) {
      log(
        'Content script belum termuat di tab ini. Melakukan injeksi script dinamis...',
        'warn'
      );
      // Inject content script secara dinamis via scripting API
      await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        files: ['scripts/content.js']
      });

      // Tunggu sejenak agar script siap
      await new Promise((r) => setTimeout(r, 400));

      response = await sendMessageToTab(activeTab.id, {
        action: 'AUTOFILL_ZIAPP',
        items: state.items,
        serverUrl: state.serverUrl,
        autoConfirm: elements.chkAutoConfirm.checked
      });
    }

    if (!response || !response.success) {
      throw new Error(
        response?.error || 'Gagal menerima konfirmasi dari halaman target.'
      );
    }

    const filledCount = response.count || 0;
    const matchedList = response.matched || [];

    log(
      `Sukses! Sebanyak ${filledCount} field indikator berhasil diisikan ke form web pusat.`,
      'success'
    );

    // Jika opsi auto-confirm aktif, kirim status ke backend REBO
    if (elements.chkAutoConfirm.checked && matchedList.length > 0) {
      log(
        `Mengirim konfirmasi sinkronisasi untuk ${matchedList.length} indikator ke server REBO...`,
        'info'
      );
      await confirmSyncedToREBO(matchedList);
    }

    // Refresh data
    await fetchSyncData();
  } catch (err) {
    log(`Auto-fill error: ${err.message}`, 'error');
    alert(`Terjadi kesalahan saat auto-fill: ${err.message}`);
  } finally {
    state.isAutoFilling = false;
    elements.btnAutofill.disabled = state.items.length === 0;
    elements.btnAutofill.innerHTML =
      '<span class="btn-icon">⚡</span><span>2. Auto-Fill ke Halaman ZIAPP (1-Click)</span>';
  }
}

function sendMessageToTab(tabId, message) {
  return new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(tabId, message, (res) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(res);
      }
    });
  });
}

// Konfirmasi update status ke REBO API
async function confirmSyncedToREBO(matchedItems) {
  let successCount = 0;
  for (const item of matchedItems) {
    try {
      const qId = item.id_pertanyaan || item.idPertanyaan;
      if (!qId) continue;

      const res = await fetch(`${state.serverUrl}/api/sync/ziapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id_pertanyaan: qId,
          notes: `Diisikan otomatis oleh REBO Sync Assistant pada ${new Date().toLocaleString('id-ID')}`
        })
      });

      if (res.ok) {
        successCount++;
      }
    } catch (e) {
      console.warn('Gagal confirm ke REBO:', e);
    }
  }

  log(
    `Tercatat ${successCount} indikator berhasil diubah statusnya menjadi SYNCED_TO_ZIAPP di REBO.`,
    'success'
  );
}

// ==============================================================================
// 6. Event Listeners & Inisialisasi
// ==============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  await loadSettings();

  // Tombol Ping
  elements.btnPing.addEventListener('click', () => pingServer(true));

  // Tombol Fetch
  elements.btnFetch.addEventListener('click', fetchSyncData);

  // Tombol Auto-Fill
  elements.btnAutofill.addEventListener('click', triggerAutoFill);

  // Preset buttons
  elements.presetButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      if (url) {
        elements.serverUrlInput.value = url;
        saveSettings();
        pingServer(true);
      }
    });
  });

  // Toggle detail preview
  elements.btnTogglePreview.addEventListener('click', () => {
    const isCollapsed = elements.itemsContainer.classList.contains('collapsed');
    if (isCollapsed) {
      elements.itemsContainer.classList.remove('collapsed');
      elements.btnTogglePreview.textContent = 'Sembunyikan';
    } else {
      elements.itemsContainer.classList.add('collapsed');
      elements.btnTogglePreview.textContent = 'Lihat Detail';
    }
  });

  // Clear log
  elements.btnClearLog.addEventListener('click', () => {
    elements.activityLog.innerHTML = '';
    log('Log aktivitas dibersihkan.', 'info');
  });

  // Auto-save setting saat input berubah
  elements.serverUrlInput.addEventListener('change', saveSettings);
  elements.chkAutoConfirm.addEventListener('change', saveSettings);

  // Inisialisasi awal: ping server pelan-pelan
  pingServer(false);
});
