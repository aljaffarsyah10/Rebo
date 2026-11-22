const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

function getConnectionString() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  const envLocalPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    const match = content.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
    if (match) return match[1];
  }
  throw new Error('DATABASE_URL not found');
}

async function seedData() {
  const connectionString = getConnectionString();
  console.log('Connecting to PostgreSQL Supabase database...');
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });
  await client.connect();

  console.log('1. Checking active periods...');
  const periodRes = await client.query(
    'SELECT id, tahun, is_active FROM public.periode_evaluasi ORDER BY tahun;'
  );
  console.log('Existing periods:', periodRes.rows);

  let p2026Id = periodRes.rows.find((p) => p.tahun === 2026)?.id;
  let p2025Id = periodRes.rows.find((p) => p.tahun === 2025)?.id;

  if (!p2026Id) {
    const r = await client.query(`
      INSERT INTO public.periode_evaluasi (tahun, nama_periode, is_active, is_locked)
      VALUES (2026, 'Evaluasi PMPRB 2026', true, false)
      RETURNING id;
    `);
    p2026Id = r.rows[0].id;
  }
  if (!p2025Id) {
    const r = await client.query(`
      INSERT INTO public.periode_evaluasi (tahun, nama_periode, is_active, is_locked)
      VALUES (2025, 'Evaluasi PMPRB 2025', false, true)
      RETURNING id;
    `);
    p2025Id = r.rows[0].id;
  }

  // Ensure all questions exist in pertanyaan_periode for both periods
  console.log('2. Syncing pertanyaan_periode for 2025 and 2026...');
  await client.query(
    `
    INSERT INTO public.pertanyaan_periode (id_periode, id_pertanyaan, status_kelengkapan, nilai_mandiri, nilai_verifikasi)
    SELECT $1, p.id_pertanyaan, 0, 0, 0
    FROM public.pertanyaan p
    ON CONFLICT (id_periode, id_pertanyaan) DO NOTHING;
  `,
    [p2026Id]
  );

  await client.query(
    `
    INSERT INTO public.pertanyaan_periode (id_periode, id_pertanyaan, status_kelengkapan, nilai_mandiri, nilai_verifikasi)
    SELECT $1, p.id_pertanyaan, 0, 0, 0
    FROM public.pertanyaan p
    ON CONFLICT (id_periode, id_pertanyaan) DO NOTHING;
  `,
    [p2025Id]
  );

  // Copy legacy data from buktiDukung to 2026 as well
  console.log(
    '3. Preserving and mapping legacy buktiDukung into 2026 & 2025...'
  );
  for (const pId of [p2026Id, p2025Id]) {
    await client.query(
      `
      UPDATE public.pertanyaan_periode pp
      SET
        id_kategori = bd.id_kategori,
        status_kelengkapan = COALESCE(bd.status_kelengkapan, 0),
        nilai_mandiri = COALESCE(bd.nilai_akhir, 0),
        nilai_verifikasi = CASE WHEN bd.status_kelengkapan = 2 THEN COALESCE(bd.nilai_akhir, 0) ELSE 0 END,
        catatan_operator = COALESCE(bd.catatan_user, 'Bukti dukung telah dilampirkan via tautan.'),
        catatan_koordinator = bd.catatan_koordinator,
        gdrive_folder_url = bd.link_bukti
      FROM public."buktiDukung" bd
      WHERE pp.id_pertanyaan = bd.id_pertanyaan
        AND pp.id_periode = $1;
    `,
      [pId]
    );
  }

  // 4. Enrich a realistic distribution of indicators for 2026 so monitoring, kanban, and LKE looks lively
  console.log(
    '4. Enriching active 2026 period with realistic progress status and scores...'
  );
  // Let's get list of questions and their top scoring categories
  const qListRes = await client.query(`
    SELECT p.id_pertanyaan, p.id_subpilar, sp.id_pilar,
      (SELECT id_kategori FROM public."kategoriPenilaian" kp WHERE kp.id_pertanyaan = p.id_pertanyaan ORDER BY kp.nilai DESC LIMIT 1) as best_kat_id,
      (SELECT nilai FROM public."kategoriPenilaian" kp WHERE kp.id_pertanyaan = p.id_pertanyaan ORDER BY kp.nilai DESC LIMIT 1) as best_nilai
    FROM public.pertanyaan p
    JOIN public.subpilar sp ON sp.id_subpilar = p.id_subpilar
    ORDER BY p.id_pertanyaan;
  `);

  const questions = qListRes.rows;
  console.log(`Total questions to process: ${questions.length}`);

  // Create an engaging and realistic status distribution:
  // ~35% Disetujui (status: 2), ~25% Menunggu Review (status: 1), ~10% Perlu Revisi (status: 3), ~30% Belum Diisi (status: 0)
  for (let i = 0; i < questions.length; i++) {
    const q = questions[i];
    const bestNilai = Number(q.best_nilai) || 0.25;
    const bestKat = q.best_kat_id || null;

    let targetStatus = 0;
    let mandiri = 0;
    let verif = 0;
    let catOp = null;
    let catKoord = null;
    let verifiedBy = null;
    let verifiedAt = null;

    if (i % 3 === 0) {
      // Disetujui (Done)
      targetStatus = 2;
      mandiri = bestNilai;
      verif = bestNilai;
      catOp =
        'Dokumen pendukung dan notula rapat koordinasi telah diunggah lengkap sesuai indikator.';
      catKoord =
        'Terverifikasi lengkap dan memenuhi standar reformasi birokrasi.';
      verifiedBy = 'Koordinator RB Sitaro';
      verifiedAt = new Date().toISOString();
    } else if (i % 3 === 1) {
      // Menunggu Review (In Review)
      targetStatus = 1;
      mandiri = bestNilai;
      verif = 0;
      catOp =
        'Telah diisi oleh tim kerja, menunggu verifikasi koordinator bidang.';
      catKoord = 'Sedang dalam proses telaah dan validasi dokumen.';
    } else if (i % 7 === 0) {
      // Perlu Revisi (Need Revision)
      targetStatus = 3;
      mandiri = bestNilai;
      verif = 0;
      catOp = 'Dokumen lama tahun 2024 terlampir, mohon arahan revisi.';
      catKoord =
        'Mohon unggah dokumen dan daftar hadir rapat pembaruan tahun 2026.';
    } else {
      // Belum Diisi
      targetStatus = 0;
      mandiri = 0;
      verif = 0;
    }

    await client.query(
      `
      UPDATE public.pertanyaan_periode
      SET
        id_kategori = $1,
        status_kelengkapan = $2,
        nilai_mandiri = $3,
        nilai_verifikasi = $4,
        catatan_operator = $5,
        catatan_koordinator = $6,
        verified_by = $7,
        verified_at = $8
      WHERE id_periode = $9 AND id_pertanyaan = $10;
    `,
      [
        bestKat,
        targetStatus,
        mandiri,
        verif,
        catOp,
        catKoord,
        verifiedBy,
        verifiedAt,
        p2026Id,
        q.id_pertanyaan
      ]
    );
  }

  // 5. Seed diverse documents into dokumen_bukti
  console.log('5. Seeding multi-evidence documents into dokumen_bukti...');
  const submittedPP = await client.query(
    `
    SELECT id, id_pertanyaan
    FROM public.pertanyaan_periode
    WHERE id_periode = $1 AND status_kelengkapan IN (1, 2, 3)
    LIMIT 40;
  `,
    [p2026Id]
  );

  const docTemplates = [
    {
      nama: 'SK Tim Kerja Pembangunan ZI',
      tipe: 'SK',
      url: 'https://drive.google.com/file/d/1sk_tim_zi_bps_sitaro_2026/view'
    },
    {
      nama: 'Notula Rapat Pembentukan & Pemilihan Agen Perubahan',
      tipe: 'Notula',
      url: 'https://drive.google.com/file/d/1notula_rapat_pembentukan_2026/view'
    },
    {
      nama: 'Daftar Hadir & Dokumentasi Rapat Kerja',
      tipe: 'Daftar Hadir',
      url: 'https://drive.google.com/file/d/1daftar_hadir_foto_rapat_2026/view'
    },
    {
      nama: 'Dokumen Perjanjian Kinerja (PK) BPS Sitaro 2026',
      tipe: 'Laporan',
      url: 'https://drive.google.com/file/d/1pk_bps_sitaro_2026/view'
    },
    {
      nama: 'Matriks Peran Hasil (MPH) Aplikasi KIPAPP',
      tipe: 'Laporan',
      url: 'https://drive.google.com/file/d/1matriks_peran_hasil_2026/view'
    },
    {
      nama: 'SOP Pelayanan Statistik Terpadu (PST) Sitaro',
      tipe: 'SOP',
      url: 'https://drive.google.com/file/d/1sop_layanan_pst_2026/view'
    },
    {
      nama: 'Laporan Monitoring Capaian Kinerja Triwulan (FRA)',
      tipe: 'Laporan',
      url: 'https://drive.google.com/file/d/1laporan_fra_triwulanan_2026/view'
    },
    {
      nama: 'Laporan Hasil Survei Kepuasan Masyarakat (SKM)',
      tipe: 'Laporan',
      url: 'https://drive.google.com/file/d/1laporan_skm_pst_2026/view'
    }
  ];

  for (let i = 0; i < submittedPP.rows.length; i++) {
    const pp = submittedPP.rows[i];
    const tmpl1 = docTemplates[i % docTemplates.length];
    const tmpl2 = docTemplates[(i + 3) % docTemplates.length];

    await client.query(
      `
      INSERT INTO public.dokumen_bukti (id_pertanyaan_periode, nama_dokumen, file_url, tipe_dokumen, uploaded_by, uploaded_at)
      VALUES ($1, $2, $3, $4, 'Operator RB BPS', NOW())
      ON CONFLICT DO NOTHING;
    `,
      [pp.id, tmpl1.nama, tmpl1.url, tmpl1.tipe]
    );

    if (i % 2 === 0) {
      await client.query(
        `
        INSERT INTO public.dokumen_bukti (id_pertanyaan_periode, nama_dokumen, file_url, tipe_dokumen, uploaded_by, uploaded_at)
        VALUES ($1, $2, $3, $4, 'Sekretaris Tim RB', NOW())
        ON CONFLICT DO NOTHING;
      `,
        [pp.id, tmpl2.nama, tmpl2.url, tmpl2.tipe]
      );
    }
  }

  // 6. Seed official archive documents into arsip_dokumen
  console.log('6. Seeding official archive documents into arsip_dokumen...');
  const archiveItems = [
    {
      judul:
        'SK Tim Kerja Pembangunan Zona Integritas BPS Kabupaten Kepulauan Siau Tagulandang Biaro Tahun 2026',
      kategori: 'SK_TIM',
      tahun: 2026,
      file_url: 'https://drive.google.com/file/d/1sk_tim_zi_sitaro_2026/view',
      nomor_surat: 'B-014/7108/KP.300/01/2026',
      keterangan:
        'Surat Keputusan Kepala BPS Kabupaten Kepulauan Sitaro tentang Pembentukan Tim Kerja Pembangunan ZI WBK/WBBM 2026',
      uploaded_by: 'Super Admin'
    },
    {
      judul:
        'Rencana Aksi Pembangunan Zona Integritas BPS Kabupaten Kepulauan Sitaro Tahun 2026',
      kategori: 'RENCANA_AKSI',
      tahun: 2026,
      file_url: 'https://drive.google.com/file/d/1rencana_aksi_zi_2026/view',
      nomor_surat: 'RA-01/7108/02/2026',
      keterangan:
        'Matriks rencana aksi pemenuhan dan reformasi 6 pilar pembangunan zona integritas 2026',
      uploaded_by: 'Koordinator RB'
    },
    {
      judul:
        'SOP Inovasi Layanan Konsultasi Statistik Virtual (KOLIBRI) Sitaro',
      kategori: 'SOP_INOVASI',
      tahun: 2026,
      file_url:
        'https://drive.google.com/file/d/1sop_inovasi_kolibri_2026/view',
      nomor_surat: 'SOP/7108/IPDS/002/2026',
      keterangan:
        'Standar Operasional Prosedur Inovasi Layanan Publik Statistik berbasis daring di Kepulauan Sitaro',
      uploaded_by: 'Super Admin'
    },
    {
      judul:
        'Laporan Kinerja Instansi Pemerintah (LKjIP) BPS Kabupaten Kepulauan Sitaro Tahun 2025',
      kategori: 'LKE_RESMI',
      tahun: 2025,
      file_url: 'https://drive.google.com/file/d/1lkjip_sitaro_2025/view',
      nomor_surat: 'LKjIP-2025/7108/01/2026',
      keterangan:
        'Laporan resmi akuntabilitas kinerja instansi pemerintah periode tahun anggaran 2025',
      uploaded_by: 'Super Admin'
    },
    {
      judul:
        'Pedoman Pembangunan dan Evaluasi Zona Integritas Menuju WBK/WBBM (Permenpan RB No. 90 Tahun 2021)',
      kategori: 'PEDOMAN',
      tahun: 2025,
      file_url:
        'https://jdih.menpan.go.id/dokumen/permenpan-rb-no-90-tahun-2021.pdf',
      nomor_surat: 'Permenpan RB No. 90/2021',
      keterangan:
        'Regulasi dan instrumen resmi Lembar Kerja Evaluasi PMPRB Kementerian PANRB',
      uploaded_by: 'Super Admin'
    }
  ];

  for (const item of archiveItems) {
    await client.query(
      `
      INSERT INTO public.arsip_dokumen (judul_dokumen, kategori, tahun, file_url, nomor_surat, keterangan, uploaded_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT DO NOTHING;
    `,
      [
        item.judul,
        item.kategori,
        item.tahun,
        item.file_url,
        item.nomor_surat,
        item.keterangan,
        item.uploaded_by
      ]
    );
  }

  // 7. Seed audit log
  console.log('7. Seeding audit_log entries...');
  await client.query(`
    INSERT INTO public.audit_log (action, new_state, user_id, user_name, role)
    VALUES
      ('SEED_DATA_INITIALIZED', '{"message": "Inisialisasi data indikator LKE periode 2026 selesai"}'::jsonb, 'SYSTEM', 'Sistem REBO', 'SUPER_ADMIN'),
      ('VERIFY_BATCH_APPROVED', '{"pilar": "Pilar 1 - Manajemen Perubahan", "count": 8, "status": "APPROVED"}'::jsonb, 'user_koord_01', 'Koordinator RB Sitaro', 'KOORDINATOR'),
      ('SUBMIT_EVIDENCE_BATCH', '{"pilar": "Pilar 2 - Penataan Tatalaksana", "count": 6, "status": "IN_REVIEW"}'::jsonb, 'user_op_01', 'Operator RB', 'OPERATOR');
  `);

  // 8. Verification summary
  console.log('=== SEEDING SUMMARY ===');
  const countStats = await client.query(
    `
    SELECT
      (SELECT count(*) FROM public.periode_evaluasi) as total_periode,
      (SELECT count(*) FROM public.pertanyaan_periode WHERE id_periode = $1 AND status_kelengkapan = 2) as disetujui_2026,
      (SELECT count(*) FROM public.pertanyaan_periode WHERE id_periode = $1 AND status_kelengkapan = 1) as review_2026,
      (SELECT count(*) FROM public.pertanyaan_periode WHERE id_periode = $1 AND status_kelengkapan = 3) as revisi_2026,
      (SELECT count(*) FROM public.pertanyaan_periode WHERE id_periode = $1 AND status_kelengkapan = 0) as belum_2026,
      (SELECT round(sum(nilai_mandiri)::numeric, 2) FROM public.pertanyaan_periode WHERE id_periode = $1) as nilai_mandiri_2026,
      (SELECT round(sum(nilai_verifikasi)::numeric, 2) FROM public.pertanyaan_periode WHERE id_periode = $1) as nilai_verif_2026,
      (SELECT count(*) FROM public.dokumen_bukti) as total_dokumen_bukti,
      (SELECT count(*) FROM public.arsip_dokumen) as total_arsip,
      (SELECT count(*) FROM public.audit_log) as total_audit_log;
  `,
    [p2026Id]
  );

  console.log(countStats.rows[0]);
  await client.end();
  console.log('Seeding completed successfully!');
}

seedData().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
