/**
 * Offline Draft Store (IndexedDB with LocalStorage Fallback)
 * REBO V2 - BPS Kabupaten Kepulauan Sitaro
 *
 * Mengakomodasi operator LKE saat koneksi internet pulau Sitaro bermasalah / mati listrik.
 * Menyimpan draf penilaian mandiri, catatan penjelasan, dan daftar dokumen bukti secara lokal.
 * Mendukung auto-sync begitu koneksi online kembali atau dipicu manual.
 */

import {
  saveBuktiAction,
  type SubmitBuktiInput
} from '@/actions/bukti-actions';

export interface OfflineDraftDocItem {
  id?: string;
  nama_dokumen: string;
  file_url: string;
  tipe_dokumen?: string | null;
  uploaded_by?: string;
  uploaded_at?: string;
}

export interface OfflineDraftPayload {
  id_pertanyaan: string;
  id_periode?: string;
  id_kategori?: string | null;
  selectedKategori?: string;
  catatan_operator?: string | null;
  catatanOperator?: string;
  dokumen_list?: OfflineDraftDocItem[];
  dokumenList?: OfflineDraftDocItem[];
  submit_for_review?: boolean;
  savedAt?: string;
  timestamp?: string;
  syncStatus?: 'pending' | 'syncing' | 'synced' | 'failed';
  lastError?: string;
  [key: string]: any;
}

export interface OfflineDraftItem {
  key: string;
  payload: OfflineDraftPayload;
  updatedAt: number;
}

const DB_NAME = 'rebo_offline_db';
const DB_VERSION = 1;
const STORE_NAME = 'lke_drafts';
const FALLBACK_KEY_PREFIX = 'rebo_idb_fallback_lke_';

/** Deteksi apakah lingkungan browser mendukung IndexedDB */
function isIndexedDBSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'indexedDB' in window &&
    window.indexedDB !== null
  );
}

/** Membuka koneksi basis data IndexedDB */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBSupported()) {
      return reject(new Error('IndexedDB tidak didukung oleh browser'));
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error || new Error('Gagal membuka IndexedDB'));
  });
}

// ============================================================================
// Fallback LocalStorage Helpers
// ============================================================================

function saveToLocalStorage(key: string, item: OfflineDraftItem): void {
  try {
    localStorage.setItem(`${FALLBACK_KEY_PREFIX}${key}`, JSON.stringify(item));
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(
      '[OfflineStore] Gagal menyimpan ke localStorage fallback:',
      err
    );
  }
}

function getFromLocalStorage(key: string): OfflineDraftItem | null {
  try {
    const raw = localStorage.getItem(`${FALLBACK_KEY_PREFIX}${key}`);
    if (raw) return JSON.parse(raw);

    // Cek juga format legacy `rebo_draft_p${id}`
    const legacyKey = key.startsWith('rebo_draft_p')
      ? key
      : `rebo_draft_p${key}`;
    const legacyRaw = localStorage.getItem(legacyKey);
    if (legacyRaw) {
      const parsedLegacy = JSON.parse(legacyRaw);
      return {
        key,
        payload: parsedLegacy,
        updatedAt: Date.now()
      };
    }
    return null;
  } catch {
    return null;
  }
}

function getAllFromLocalStorage(): OfflineDraftItem[] {
  const items: OfflineDraftItem[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (storageKey && storageKey.startsWith(FALLBACK_KEY_PREFIX)) {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          items.push(JSON.parse(raw));
        }
      } else if (storageKey && storageKey.startsWith('rebo_draft_p')) {
        // Adaptasi draf legacy
        const raw = localStorage.getItem(storageKey);
        if (raw) {
          try {
            const parsed = JSON.parse(raw);
            const cleanKey = storageKey.replace('rebo_draft_p', '');
            // Hindari duplikasi jika versi fallback sudah ada
            if (
              !items.some((it) => it.key === cleanKey || it.key === storageKey)
            ) {
              items.push({
                key: cleanKey,
                payload: {
                  ...parsed,
                  id_pertanyaan: cleanKey
                },
                updatedAt: Date.now()
              });
            }
          } catch {}
        }
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('[OfflineStore] Gagal membaca seluruh localStorage:', err);
  }
  return items;
}

function deleteFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(`${FALLBACK_KEY_PREFIX}${key}`);
    localStorage.removeItem(`rebo_draft_p${key}`);
    if (key.startsWith('rebo_draft_p')) {
      localStorage.removeItem(key);
    }
  } catch {}
}

function clearAllFromLocalStorage(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const storageKey = localStorage.key(i);
      if (
        storageKey &&
        (storageKey.startsWith(FALLBACK_KEY_PREFIX) ||
          storageKey.startsWith('rebo_draft_p'))
      ) {
        keysToRemove.push(storageKey);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

// ============================================================================
// Core Offline Storage Methods
// ============================================================================

/**
 * Menyimpan draf LKE ke IndexedDB (dengan fallback otomatis ke localStorage).
 */
export async function saveOfflineDraft(
  key: string,
  payload: OfflineDraftPayload
): Promise<void> {
  const cleanId = String(payload.id_pertanyaan || key).replace(
    /^rebo_draft_p/,
    ''
  );
  const now = new Date();
  const timeStr = now.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  const normalizedPayload: OfflineDraftPayload = {
    ...payload,
    id_pertanyaan: cleanId,
    timestamp: payload.timestamp || now.toISOString(),
    savedAt: payload.savedAt || timeStr,
    syncStatus: payload.syncStatus || 'pending'
  };

  const item: OfflineDraftItem = {
    key: cleanId,
    payload: normalizedPayload,
    updatedAt: Date.now()
  };

  // Selalu cerminkan juga ke fallback localStorage agar 100% aman
  saveToLocalStorage(cleanId, item);

  if (isIndexedDBSupported()) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(item);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[OfflineStore] IndexedDB error, fallback used:', err);
    }
  }

  notifyDraftListeners();
}

/**
 * Mengambil satu draf spesifik berdasarkan key (ID Pertanyaan).
 */
export async function getOfflineDraft(
  key: string
): Promise<OfflineDraftPayload | null> {
  const cleanId = String(key).replace(/^rebo_draft_p/, '');

  if (isIndexedDBSupported()) {
    try {
      const db = await openDB();
      const item = await new Promise<OfflineDraftItem | null>(
        (resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.get(cleanId);

          req.onsuccess = () => resolve(req.result || null);
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => db.close();
        }
      );

      if (item && item.payload) {
        return item.payload;
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(
        '[OfflineStore] Gagal membaca IndexedDB, beralih ke fallback:',
        err
      );
    }
  }

  // Fallback to localStorage
  const fallback = getFromLocalStorage(cleanId);
  return fallback ? fallback.payload : null;
}

/**
 * Mengambil semua draf lokal yang tersimpan di browser.
 */
export async function getAllOfflineDrafts(): Promise<OfflineDraftItem[]> {
  const map = new Map<string, OfflineDraftItem>();

  // 1. Ambil dari localStorage terlebih dahulu
  const lsItems = getAllFromLocalStorage();
  lsItems.forEach((it) => map.set(it.key, it));

  // 2. Ambil dari IndexedDB (menimpa jika ada data IDB yang lebih baru)
  if (isIndexedDBSupported()) {
    try {
      const db = await openDB();
      const idbItems = await new Promise<OfflineDraftItem[]>(
        (resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const req = store.getAll();

          req.onsuccess = () => resolve(req.result || []);
          req.onerror = () => reject(req.error);
          tx.oncomplete = () => db.close();
        }
      );

      idbItems.forEach((it) => {
        const existing = map.get(it.key);
        if (
          !existing ||
          (it.updatedAt && it.updatedAt >= (existing.updatedAt || 0))
        ) {
          map.set(it.key, it);
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[OfflineStore] Gagal membaca seluruh data IndexedDB:', err);
    }
  }

  return Array.from(map.values()).sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Menghapus draf offline untuk pertanyaan tertentu (misal setelah berhasil tersinkron).
 */
export async function deleteOfflineDraft(key: string): Promise<void> {
  const cleanId = String(key).replace(/^rebo_draft_p/, '');
  deleteFromLocalStorage(cleanId);

  if (isIndexedDBSupported()) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(cleanId);

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[OfflineStore] Gagal menghapus draf di IndexedDB:', err);
    }
  }

  notifyDraftListeners();
}

/**
 * Mengosongkan seluruh draf offline di IndexedDB dan localStorage.
 */
export async function clearAllOfflineDrafts(): Promise<void> {
  clearAllFromLocalStorage();

  if (isIndexedDBSupported()) {
    try {
      const db = await openDB();
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.clear();

        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('[OfflineStore] Gagal mengosongkan IndexedDB:', err);
    }
  }

  notifyDraftListeners();
}

// ============================================================================
// Network Connectivity Detection & Listeners
// ============================================================================

/** Memeriksa apakah browser sedang online */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true;
  return navigator.onLine !== false;
}

const connectivityListeners = new Set<(online: boolean) => void>();
const draftChangeListeners = new Set<(items: OfflineDraftItem[]) => void>();

/** Mendaftarkan callback saat koneksi berubah online/offline */
export function addConnectivityListener(
  callback: (online: boolean) => void
): () => void {
  connectivityListeners.add(callback);
  return () => {
    connectivityListeners.delete(callback);
  };
}

/** Mendaftarkan callback saat daftar draf lokal bertambah/berkurang */
export function subscribeDraftChanges(
  callback: (items: OfflineDraftItem[]) => void
): () => void {
  draftChangeListeners.add(callback);
  // Trigger initial call
  getAllOfflineDrafts()
    .then((items) => callback(items))
    .catch(() => {});
  return () => {
    draftChangeListeners.delete(callback);
  };
}

function notifyDraftListeners(): void {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(new CustomEvent('rebo:offline-drafts-changed'));

  getAllOfflineDrafts()
    .then((items) => {
      draftChangeListeners.forEach((fn) => {
        try {
          fn(items);
        } catch {}
      });
    })
    .catch(() => {});
}

// ============================================================================
// Auto-Sync & Manual Sync Mechanism
// ============================================================================

let isSyncingProcess = false;

export interface SyncResult {
  total: number;
  synced: number;
  failed: number;
  errors: string[];
}

/**
 * Menyinkronkan seluruh draf offline ke server action `saveBuktiAction`.
 */
export async function syncAllOfflineDrafts(): Promise<SyncResult> {
  if (typeof window === 'undefined' || isSyncingProcess) {
    return { total: 0, synced: 0, failed: 0, errors: [] };
  }

  if (!isOnline()) {
    return {
      total: 0,
      synced: 0,
      failed: 0,
      errors: ['Tidak dapat menyinkronkan: Perangkat sedang offline.']
    };
  }

  isSyncingProcess = true;
  const items = await getAllOfflineDrafts();

  if (items.length === 0) {
    isSyncingProcess = false;
    return { total: 0, synced: 0, failed: 0, errors: [] };
  }

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  try {
    for (const item of items) {
      const p = item.payload;
      const cleanId = String(p.id_pertanyaan || item.key).replace(
        /^rebo_draft_p/,
        ''
      );

      const hasContent =
        Boolean(p.id_kategori || p.selectedKategori) ||
        Boolean(p.catatan_operator && p.catatan_operator.trim().length > 0) ||
        Boolean(p.catatanOperator && p.catatanOperator.trim().length > 0) ||
        (Array.isArray(p.dokumen_list) && p.dokumen_list.length > 0) ||
        (Array.isArray(p.dokumenList) && p.dokumenList.length > 0);

      // Jika draf kosong / tidak ada data esensial, bersihkan saja
      if (!hasContent) {
        await deleteOfflineDraft(item.key);
        continue;
      }

      const rawDocs = p.dokumen_list || p.dokumenList || [];
      const formattedDocs = rawDocs
        .filter((d) => Boolean(d.file_url && d.nama_dokumen))
        .map((d) => ({
          id:
            d.id && !d.id.startsWith('temp-') && !d.id.startsWith('legacy-')
              ? d.id
              : undefined,
          nama_dokumen: d.nama_dokumen,
          file_url: d.file_url,
          tipe_dokumen: d.tipe_dokumen || null
        }));

      const submitInput: SubmitBuktiInput = {
        id_pertanyaan: cleanId,
        id_periode: p.id_periode,
        id_kategori: p.id_kategori || p.selectedKategori || null,
        catatan_operator:
          (p.catatan_operator ?? p.catatanOperator ?? '').trim() || null,
        dokumen_list: formattedDocs,
        submit_for_review: Boolean(p.submit_for_review)
      };

      try {
        const res = await saveBuktiAction(submitInput);
        if (res.success) {
          synced++;
          await deleteOfflineDraft(item.key);
        } else {
          failed++;
          errors.push(
            `Indikator #${cleanId}: ${res.error || 'Server menolak data draf'}`
          );
        }
      } catch (err: any) {
        failed++;
        errors.push(
          `Indikator #${cleanId}: ${err?.message || 'Gagal koneksi server'}`
        );
      }
    }
  } finally {
    isSyncingProcess = false;
    notifyDraftListeners();

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('rebo:offline-sync-completed', {
          detail: { total: items.length, synced, failed, errors }
        })
      );
    }
  }

  return { total: items.length, synced, failed, errors };
}

// Inisialisasi event listener koneksi window saat pertama kali di load di browser
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    connectivityListeners.forEach((cb) => {
      try {
        cb(true);
      } catch {}
    });

    // Otomatis picu sinkronisasi draf pending saat perangkat kembali online
    syncAllOfflineDrafts().catch((err) => {
      // eslint-disable-next-line no-console
      console.warn('[OfflineStore] Auto-sync saat online gagal:', err);
    });
  });

  window.addEventListener('offline', () => {
    connectivityListeners.forEach((cb) => {
      try {
        cb(false);
      } catch {}
    });
  });
}
