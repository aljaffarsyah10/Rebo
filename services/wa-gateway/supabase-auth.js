/* eslint-disable no-console */
/**
 * Supabase Persistent Auth State Adapter untuk @whiskeysockets/baileys
 *
 * Menyimpan kredensial (`creds`) dan signal keys (`keys`) WhatsApp Baileys
 * ke tabel `public.wa_auth_session` melalui Supabase PostgREST API
 * menggunakan native fetch (Node 18+) tanpa ketergantungan paket tambahan.
 */

const { initAuthCreds, BufferJSON, proto } = require('@whiskeysockets/baileys');

const TABLE_NAME = 'wa_auth_session';

// Mutex per-key di memori agar penulisan paralel ke key yang sama tetap berurutan
const keyLocks = new Map();

function withKeyLock(key, fn) {
  const previous = keyLocks.get(key) || Promise.resolve();
  const current = previous.catch(() => {}).then(() => fn());

  keyLocks.set(key, current);
  current.finally(() => {
    if (keyLocks.get(key) === current) {
      keyLocks.delete(key);
    }
  });

  return current;
}

function fixKeyName(key) {
  return String(key).replace(/\//g, '__').replace(/:/g, '-');
}

/**
 * Membuat Baileys Auth State berbasis Supabase (`public.wa_auth_session`).
 *
 * @param {object} options
 * @param {string} options.supabaseUrl
 * @param {string} options.supabaseServiceRoleKey
 */
async function useSupabaseAuthState({ supabaseUrl, supabaseServiceRoleKey }) {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      'SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY wajib diisi untuk useSupabaseAuthState.'
    );
  }

  const baseRestUrl = `${supabaseUrl.trim().replace(/\/+$/, '')}/rest/v1/${TABLE_NAME}`;
  const defaultHeaders = {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    'Content-Type': 'application/json'
  };

  async function writeData(data, rawKey) {
    const key = fixKeyName(rawKey);
    return withKeyLock(key, async () => {
      const serialized = JSON.parse(JSON.stringify(data, BufferJSON.replacer));
      const res = await fetch(`${baseRestUrl}?on_conflict=id`, {
        method: 'POST',
        headers: {
          ...defaultHeaders,
          Prefer: 'resolution=merge-duplicates,return=minimal'
        },
        body: JSON.stringify({
          id: key,
          data: serialized,
          updated_at: new Date().toISOString()
        })
      });

      if (!res.ok) {
        const errBody = await res.text().catch(() => res.statusText);
        throw new Error(
          `[SupabaseAuth] Gagal menyimpan key "${key}" (HTTP ${res.status}): ${errBody}`
        );
      }
    });
  }

  async function readData(rawKey) {
    const key = fixKeyName(rawKey);
    return withKeyLock(key, async () => {
      try {
        const res = await fetch(
          `${baseRestUrl}?id=eq.${encodeURIComponent(key)}&select=data&limit=1`,
          {
            method: 'GET',
            headers: defaultHeaders
          }
        );

        if (!res.ok) {
          const errBody = await res.text().catch(() => res.statusText);
          console.error(
            `[SupabaseAuth] Gagal membaca key "${key}" (HTTP ${res.status}): ${errBody}`
          );
          return null;
        }

        const rows = await res.json();
        if (
          !Array.isArray(rows) ||
          rows.length === 0 ||
          rows[0]?.data == null
        ) {
          return null;
        }

        return JSON.parse(JSON.stringify(rows[0].data), BufferJSON.reviver);
      } catch (err) {
        console.error(
          `[SupabaseAuth] Error membaca key "${key}":`,
          err.message
        );
        return null;
      }
    });
  }

  async function removeData(rawKey) {
    const key = fixKeyName(rawKey);
    return withKeyLock(key, async () => {
      try {
        const res = await fetch(
          `${baseRestUrl}?id=eq.${encodeURIComponent(key)}`,
          {
            method: 'DELETE',
            headers: defaultHeaders
          }
        );

        if (!res.ok) {
          const errBody = await res.text().catch(() => res.statusText);
          console.error(
            `[SupabaseAuth] Gagal menghapus key "${key}" (HTTP ${res.status}): ${errBody}`
          );
        }
      } catch (err) {
        console.error(
          `[SupabaseAuth] Error menghapus key "${key}":`,
          err.message
        );
      }
    });
  }

  const creds = (await readData('creds')) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              let value = await readData(`${type}-${id}`);
              if (type === 'app-state-sync-key' && value) {
                value = proto.Message.AppStateSyncKeyData.fromObject(value);
              }
              data[id] = value;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category in data) {
            for (const id in data[category]) {
              const value = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(value ? writeData(value, key) : removeData(key));
            }
          }
          await Promise.all(tasks);
        }
      }
    },
    saveCreds: async () => {
      return writeData(creds, 'creds');
    }
  };
}

module.exports = {
  useSupabaseAuthState
};
