/* eslint-disable no-console */
/**
 * CLI Runner: Automated WhatsApp Reminders & Progress Recap Engine
 * REBO V2 - BPS Kabupaten Kepulauan Sitaro
 *
 * Penggunaan:
 *   node scripts/send_wa_reminders.js [opsi]
 *
 * Opsi yang didukung:
 *   --dry-run             Preview statistik & isi pesan tanpa mengirim WA sungguhan
 *   --mode=all            Kirim pengingat deadline ke PIC & rekap mingguan ke Admin (default)
 *   --mode=deadline       Hanya kirim pengingat deadline ke PIC pilar yang masih ada tugas tertunda
 *   --mode=recap          Hanya kirim rekapitulasi progres eksekutif ke Admin & Pimpinan
 *   --force               Paksa kirim notifikasi meskipun hari ini bukan milestone H-30/14/7/3/1
 *   --pilar=<1-6>         Kirim pengingat khusus untuk pilar tertentu (misal: --pilar=1)
 *   --deadline=YYYY-MM-DD Override batas waktu evaluasi (misal: --deadline=2026-12-31)
 *   --help                Tampilkan bantuan cara penggunaan
 *
 * Contoh:
 *   node scripts/send_wa_reminders.js --dry-run
 *   node scripts/send_wa_reminders.js --mode=recap --force
 *   node scripts/send_wa_reminders.js --mode=deadline --pilar=2 --force
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables dari .env.local jika ada
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed
          .slice(eqIdx + 1)
          .trim()
          .replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let gatewayUrl =
  process.env.WHATSAPP_GATEWAY_URL || process.env.WA_GATEWAY_URL || '';
const apiKey =
  process.env.WHATSAPP_API_KEY || process.env.WA_GATEWAY_API_KEY || '';
const appUrl = process.env.APP_URL || 'https://rebo.sitarokab.bps.go.id';

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '❌ Error: NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_ANON_KEY/SERVICE_ROLE belum disetel di .env.local!'
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

// Format nomor telepon
function formatPhoneNumber(phone) {
  let cleaned = (phone || '').replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('+62')) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

// Kirim pesan WA
async function sendWhatsApp(phone, message) {
  if (!phone) return { success: false, error: 'Nomor telepon kosong' };
  const formatted = formatPhoneNumber(phone);

  if (!gatewayUrl) {
    return {
      success: true,
      simulated: true,
      note: 'Gateway URL tidak diset; pesan disimulasikan'
    };
  }

  let sendUrl = gatewayUrl.replace(/\/+$/, '');
  if (!sendUrl.endsWith('/send-message')) {
    sendUrl += '/send-message';
  }

  try {
    const res = await fetch(sendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {})
      },
      body: JSON.stringify({
        target: formatted,
        phone: formatted,
        message,
        text: message
      }),
      signal: AbortSignal.timeout(10000)
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err || res.statusText };
    }

    const data = await res.json().catch(() => ({}));
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Normalisasi id_pilar (1-12) ke functional pilar (1-6)
function normalizeFunctionalPilarId(idPilar) {
  const num = Number(idPilar);
  if (num <= 6) return num;
  return ((num - 1) % 6) + 1;
}

function formatDateIndo(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

const PILAR_NAMES = {
  1: 'Pilar 1 - Manajemen Perubahan',
  2: 'Pilar 2 - Penataan Tatalaksana',
  3: 'Pilar 3 - Penataan Sistem Manajemen SDM',
  4: 'Pilar 4 - Penguatan Akuntabilitas',
  5: 'Pilar 5 - Penguatan Pengawasan',
  6: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik'
};

const DEADLINE_MILESTONES = [30, 14, 7, 3, 1, 0];

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
REBO V2 - Automated WhatsApp Reminders & Recap Engine CLI
--------------------------------------------------------
Penggunaan:
  node scripts/send_wa_reminders.js [opsi]

Opsi:
  --dry-run             Mode simulasi, tidak mengirim pesan WA sungguhan
  --mode=<all|deadline|recap>  Jenis pengingat yang diproses (default: all)
  --force               Paksa pengiriman tanpa menunggu hari milestone H-30/14/7/3/1
  --pilar=<1-6>         Hanya proses pilar tertentu
  --deadline=YYYY-MM-DD Tentukan batas akhir evaluasi custom
`);
    process.exit(0);
  }

  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  let mode = 'all';
  const modeArg = args.find((a) => a.startsWith('--mode='));
  if (modeArg) mode = modeArg.split('=')[1].toLowerCase();

  let targetPilar = null;
  const pilarArg = args.find((a) => a.startsWith('--pilar='));
  if (pilarArg) targetPilar = Number(pilarArg.split('=')[1]);

  let customDeadline = null;
  const deadlineArg = args.find((a) => a.startsWith('--deadline='));
  if (deadlineArg) customDeadline = deadlineArg.split('=')[1];

  console.log(
    '==============================================================='
  );
  console.log('📢 REBO V2: Automated WhatsApp Reminders & Progress Recap');
  console.log(
    '==============================================================='
  );
  console.log(` Mode         : ${mode.toUpperCase()}`);
  console.log(
    ` Dry Run      : ${dryRun ? 'YA (Preview Only)' : 'TIDAK (Kirim Langsung)'}`
  );
  console.log(
    ` Force Send   : ${force ? 'YA' : 'TIDAK (Hanya pada milestone)'}`
  );
  if (targetPilar) console.log(` Target Pilar : Pilar ${targetPilar}`);
  console.log(
    '---------------------------------------------------------------\n'
  );

  // 1. Ambil Periode Aktif
  const { data: periodes, error: pError } = await supabase
    .from('periode_evaluasi')
    .select('*')
    .eq('is_active', true)
    .order('tahun', { ascending: false })
    .limit(1);

  if (pError || !periodes || periodes.length === 0) {
    console.error('❌ Gagal memuat periode evaluasi aktif:', pError?.message);
    process.exit(1);
  }

  const activePeriode = periodes[0];
  const tahunPeriode = activePeriode.tahun || 2026;
  const deadlineStr =
    customDeadline || activePeriode.tanggal_selesai || `${tahunPeriode}-12-31`;

  const now = new Date();
  const deadlineDate = new Date(`${deadlineStr}T23:59:59+08:00`);
  const diffDays = Math.ceil(
    (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isMilestone = DEADLINE_MILESTONES.includes(diffDays);
  let milestoneTag = `H-${diffDays}`;
  if (diffDays === 0) milestoneTag = 'HARI-H';
  if (diffDays < 0) milestoneTag = `TERLEWAT (${Math.abs(diffDays)} Hari)`;

  console.log(
    `🗓️  Periode Evaluasi : ${activePeriode.nama_periode} (${tahunPeriode})`
  );
  console.log(
    `📅 Batas Waktu      : ${formatDateIndo(deadlineStr)} (${milestoneTag}, Sisa ${diffDays} Hari)`
  );
  console.log(
    `🎯 Status Milestone : ${isMilestone ? '✅ Hari Milestone Deadline' : 'ℹ️  Bukan Hari Milestone Standar'}\n`
  );

  // 2. Ambil Master Subpilar & Pertanyaan
  const { data: subpilarData, error: spError } = await supabase
    .from('subpilar')
    .select('id_subpilar, id_pilar, pertanyaan (id_pertanyaan)');

  if (spError || !subpilarData) {
    console.error('❌ Gagal memuat struktur subpilar:', spError?.message);
    process.exit(1);
  }

  const questionToPilar = new Map();
  for (const sp of subpilarData) {
    const fId = normalizeFunctionalPilarId(sp.id_pilar);
    for (const q of sp.pertanyaan || []) {
      questionToPilar.set(String(q.id_pertanyaan), fId);
    }
  }

  // 3. Ambil Pertanyaan Periode
  const { data: ppData, error: ppError } = await supabase
    .from('pertanyaan_periode')
    .select('id_pertanyaan, status_kelengkapan')
    .eq('id_periode', activePeriode.id);

  if (ppError) {
    console.error('❌ Gagal memuat data pertanyaan_periode:', ppError.message);
    process.exit(1);
  }

  // 4. Hitung Statistik per Pilar
  const pilarStats = {};
  for (let i = 1; i <= 6; i++) {
    pilarStats[i] = {
      pilarId: i,
      namaPilar: PILAR_NAMES[i],
      total: 0,
      belumDiisi: 0,
      perluRevisi: 0,
      menungguReview: 0,
      disetujui: 0
    };
  }

  for (const pp of ppData || []) {
    const fId = questionToPilar.get(String(pp.id_pertanyaan));
    if (fId && pilarStats[fId]) {
      const st = pilarStats[fId];
      st.total += 1;
      const s = Number(pp.status_kelengkapan);
      if (s === 0) st.belumDiisi += 1;
      else if (s === 1) st.menungguReview += 1;
      else if (s === 2) st.disetujui += 1;
      else if (s === 3) st.perluRevisi += 1;
    }
  }

  // 5. Muat Kontak PIC Pilar & Kontak Admin dari kontak_pilar
  const { data: kontakRows } = await supabase
    .from('kontak_pilar')
    .select('*')
    .eq('is_active', true);

  const picMap = new Map();
  const adminRecipients = [];

  for (const k of kontakRows || []) {
    if (k.kategori === 'pilar' && k.id_pilar) {
      picMap.set(k.id_pilar, {
        nama: k.nama_pic,
        phone: k.no_wa
      });
    } else if (k.kategori === 'admin' || k.kategori === 'verifikator') {
      if (k.no_wa && !adminRecipients.includes(k.no_wa)) {
        adminRecipients.push(k.no_wa);
      }
    }
  }

  // Tampilkan Tabel Statistik
  console.log('📊 Ringkasan Capaian Indikator per Pilar:');
  console.log(
    '-----------------------------------------------------------------------------------------'
  );
  console.log(
    'Pilar                          | Total | Belum | Revisi | Review | Setuju | Capaian | Status'
  );
  console.log(
    '-----------------------------------------------------------------------------------------'
  );

  const globalStats = { total: 0, belum: 0, revisi: 0, review: 0, setuju: 0 };

  for (let i = 1; i <= 6; i++) {
    const st = pilarStats[i];
    const persen =
      st.total > 0 ? Math.round((st.disetujui / st.total) * 100) : 0;
    st.persen = persen;
    st.hasPending = st.belumDiisi + st.perluRevisi > 0;

    globalStats.total += st.total;
    globalStats.belum += st.belumDiisi;
    globalStats.revisi += st.perluRevisi;
    globalStats.review += st.menungguReview;
    globalStats.setuju += st.disetujui;

    const padName = (st.namaPilar || '').padEnd(30);
    const padTotal = String(st.total).padStart(5);
    const padBelum = String(st.belumDiisi).padStart(5);
    const padRevisi = String(st.perluRevisi).padStart(6);
    const padReview = String(st.menungguReview).padStart(6);
    const padSetuju = String(st.disetujui).padStart(6);
    const padPersen = `${persen}%`.padStart(7);
    const statusText = st.hasPending ? '⚠️  Tertunda' : '✅ Lengkap';

    console.log(
      `${padName} | ${padTotal} | ${padBelum} | ${padRevisi} | ${padReview} | ${padSetuju} | ${padPersen} | ${statusText}`
    );
  }
  console.log(
    '-----------------------------------------------------------------------------------------'
  );
  const globalPersen =
    globalStats.total > 0
      ? Math.round((globalStats.setuju / globalStats.total) * 100)
      : 0;
  console.log(
    `TOTAL KESELURUHAN              | ${String(globalStats.total).padStart(5)} | ${String(globalStats.belum).padStart(5)} | ${String(globalStats.revisi).padStart(6)} | ${String(globalStats.review).padStart(6)} | ${String(globalStats.setuju).padStart(6)} | ${`${globalPersen}%`.padStart(7)} |`
  );
  console.log(
    '-----------------------------------------------------------------------------------------\n'
  );

  const auditLogs = [];

  // ==============================================================================
  // A. PENGIRIMAN PENGINGAT DEADLINE KE PIC PILAR
  // ==============================================================================
  if (mode === 'all' || mode === 'deadline') {
    console.log(
      '==============================================================='
    );
    console.log('📤 Memproses Pengingat Deadline ke PIC Pilar...');
    console.log(
      '==============================================================='
    );

    for (let i = 1; i <= 6; i++) {
      if (targetPilar && targetPilar !== i) continue;

      const st = pilarStats[i];
      const pic = picMap.get(i) || {
        nama: `PIC Pilar ${i}`,
        phone: `08219001000${i}`
      };

      if (!st.hasPending) {
        console.log(
          `⏩ [Pilar ${i}] ${st.namaPilar}: DILEWATI (Semua indikator sudah selesai/disetujui).`
        );
        continue;
      }

      if (!isMilestone && !force) {
        console.log(
          `⏩ [Pilar ${i}] ${st.namaPilar}: DILEWATI (Bukan milestone pengingat. Gunakan --force untuk memicu).`
        );
        continue;
      }

      const urgencyIcon = diffDays <= 3 ? '🚨' : diffDays <= 7 ? '⚠️' : '⏰';
      const sisaHariText =
        diffDays <= 0
          ? '*BATAS WAKTU HARI INI / TELAH LEWAT*'
          : `*Sisa ${diffDays} Hari lagi*`;

      const msg = `${urgencyIcon} *[REBO V2 - PENGINGAT DEADLINE LKE ZI/RB]*

Halo Yth. *${pic.nama}*,
Koordinator *${st.namaPilar}*

Mengingatkan kembali batas waktu pengumpulan dan pemenuhan dokumen Lembar Kerja Evaluasi (LKE) ZI/RB BPS Kabupaten Kepulauan Sitaro Tahun ${tahunPeriode}:

📅 *Tenggat Waktu:* ${formatDateIndo(deadlineStr)} (${sisaHariText})

📊 *Status Capaian ${st.namaPilar}:*
• ⚪ Belum Diisi: *${st.belumDiisi}* indikator
• 🔴 Perlu Revisi: *${st.perluRevisi}* indikator
• 🟡 Menunggu Review: *${st.menungguReview}* indikator
• 🟢 Telah Disetujui: *${st.disetujui}* dari *${st.total}* indikator (${st.persen}%)

⚠️ Mohon perkenan Bapak/Ibu untuk segera mengunggah kelengkapan dokumen dan menyelesaikan revisi sebelum batas waktu berakhir.

🔗 Akses formulir & tindak lanjut:
${appUrl}/rebo/kanban

_Pesan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;

      console.log(
        `\n💬 [Pilar ${i}] Menyiapkan pesan untuk ${pic.nama} (${pic.phone}):`
      );
      console.log(
        '---------------------------------------------------------------'
      );
      console.log(msg);
      console.log(
        '---------------------------------------------------------------'
      );

      if (dryRun) {
        console.log(`🔍 [DRY-RUN] Pengiriman ke ${pic.phone} disimulasikan.`);
      } else {
        process.stdout.write(`📡 Mengirim WhatsApp ke ${pic.phone} ... `);
        const sendRes = await sendWhatsApp(pic.phone, msg);
        if (sendRes.success) {
          console.log('✅ BERHASIL');
        } else {
          console.log(`❌ GAGAL (${sendRes.error})`);
        }

        auditLogs.push({
          id_pertanyaan_periode: null,
          action: 'NOTIF_WA_DEADLINE_REMINDER',
          old_state: null,
          new_state: {
            pilarId: i,
            pilarNama: st.namaPilar,
            pic: pic.nama,
            phone: pic.phone,
            sisaHari: diffDays,
            milestone: milestoneTag,
            stats: st,
            status: sendRes.success ? 'SENT' : 'FAILED',
            error: sendRes.error || null
          },
          user_id: 'SYSTEM_CLI',
          user_name: 'CLI Reminder Runner',
          role: 'SYSTEM',
          created_at: new Date().toISOString()
        });
      }
    }
  }

  // ==============================================================================
  // B. PENGIRIMAN REKAPITULASI PROGRES KE ADMIN / PIMPINAN
  // ==============================================================================
  if (mode === 'all' || mode === 'recap') {
    console.log(
      '\n==============================================================='
    );
    console.log('📊 Memproses Rekapitulasi Progres ke Admin & Pimpinan...');
    console.log(
      '==============================================================='
    );

    const sisaHariText =
      diffDays <= 0 ? '*Batas Waktu Berakhir*' : `Sisa ${diffDays} Hari`;

    const pilarLines = [];
    for (let i = 1; i <= 6; i++) {
      const st = pilarStats[i];
      pilarLines.push(
        `${i}. *${st.namaPilar}*: ${st.persen}% (Disetujui: ${st.disetujui}/${st.total}, Belum: ${st.belumDiisi}, Revisi: ${st.perluRevisi})`
      );
    }

    const recapMsg = `📊 *[REBO V2 - REKAPITULASI PROGRES LKE ZI/RB]*

Yth. Pimpinan & Tim Pengarah ZI/RB BPS Kabupaten Kepulauan Sitaro,

Berikut ringkasan progres pemenuhan Lembar Kerja Evaluasi (LKE) ZI/RB Periode *${activePeriode.nama_periode}*:

📅 *Batas Waktu:* ${formatDateIndo(deadlineStr)} (${sisaHariText})
🎯 *Progress Keseluruhan:* *${globalStats.setuju}/${globalStats.total}* Indikator Disetujui (*${globalPersen}%*)

🏛️ *Rincian Capaian per Pilar:*
${pilarLines.join('\n')}

📌 *Status Akumulasi:*
• 🟢 Disetujui: *${globalStats.setuju}* indikator
• 🟡 Menunggu Review: *${globalStats.review}* indikator
• 🔴 Perlu Revisi: *${globalStats.revisi}* indikator
• ⚪ Belum Diisi: *${globalStats.belum}* indikator

🔗 Pantau dashboard pemantauan real-time:
${appUrl}/rebo/monitoring

_Laporan otomatis Sistem REBO BPS Kabupaten Kepulauan Sitaro_`;

    console.log('\n💬 Pesan Rekapitulasi Eksekutif:');
    console.log(
      '---------------------------------------------------------------'
    );
    console.log(recapMsg);
    console.log(
      '---------------------------------------------------------------'
    );

    if (adminRecipients.length === 0) {
      adminRecipients.push('082190010008'); // Nomor hotline Admin REBO default
    }

    if (dryRun) {
      console.log(
        `🔍 [DRY-RUN] Rekapitulasi ke ${adminRecipients.join(', ')} disimulasikan.`
      );
    } else {
      for (const admPhone of adminRecipients) {
        process.stdout.write(`📡 Mengirim WhatsApp Rekap ke ${admPhone} ... `);
        const sendRes = await sendWhatsApp(admPhone, recapMsg);
        if (sendRes.success) {
          console.log('✅ BERHASIL');
        } else {
          console.log(`❌ GAGAL (${sendRes.error})`);
        }
      }

      auditLogs.push({
        id_pertanyaan_periode: null,
        action: 'NOTIF_WA_WEEKLY_RECAP',
        old_state: null,
        new_state: {
          periodeId: activePeriode.id,
          tahun: tahunPeriode,
          sisaHari: diffDays,
          milestone: milestoneTag,
          globalStats,
          recipients: adminRecipients,
          status: 'SENT'
        },
        user_id: 'SYSTEM_CLI',
        user_name: 'CLI Recap Runner',
        role: 'SYSTEM',
        created_at: new Date().toISOString()
      });
    }
  }

  // 6. Simpan Audit Logs jika bukan dryRun
  if (!dryRun && auditLogs.length > 0) {
    const { error: logErr } = await supabase
      .from('audit_log')
      .insert(auditLogs);
    if (logErr) {
      console.warn('⚠️  Peringatan saat mencatat audit_log:', logErr.message);
    } else {
      console.log(
        `\n📝 ${auditLogs.length} entri audit_log berhasil disimpan ke database.`
      );
    }
  }

  console.log(
    '\n==============================================================='
  );
  console.log('✅ Eksekusi Engine Pengingat Selesai!');
  console.log(
    '===============================================================\n'
  );
}

main().catch((err) => {
  console.error('\n❌ Fatal Error:', err);
  process.exit(1);
});
