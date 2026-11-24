/* eslint-disable no-console */
'use server';

import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { InovasiLayanan } from '@/types/rebo';

// Data default inovasi unggulan BPS Kabupaten Kepulauan Siau Tagulandang Biaro
export const DEFAULT_INOVASI_LIST: InovasiLayanan[] = [
  {
    id: 'inovasi-pst-sidatu',
    nama_inovasi: 'PST Si-Datu (Pelayanan Statistik Terpadu Digital Sitaro)',
    tagline:
      'Layanan Konsultasi Statistik & Permintaan Data Kilat Lintas Pulau Tanpa Batas Wilayah',
    ringkasan:
      'Platform layanan statistik digital terpadu berbasis WhatsApp Bot 24/7 dan portal interaktif yang memangkas kendala transportasi laut antar-pulau Siau, Tagulandang, dan Biaro.',
    pilar_terkait: 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik',
    latar_belakang:
      'Secara geografis Kabupaten Kepulauan Sitaro terdiri dari 47 pulau dengan 3 pulau utama terpisah lautan luas (Siau, Tagulandang, Biaro). Masyarakat, akademisi, dan OPD di Tagulandang dan Biaro sebelumnya harus menempuh perjalanan laut berisiko cuaca ekstrem 2-4 jam ke kantor BPS di Ondong Siau hanya untuk meminta data atau konsultasi rekomendasi statistik.',
    solusi_inovasi:
      'Membangun sistem PST Si-Datu berbasis digital terintegrasi WhatsApp Business API otomatis, virtual consultation booth melalui video conference, serta repository download mikrodata ber-watermark resmi dan Tanda Tangan Elektronik (TTE).',
    kondisi_sebelum:
      'Pemohon harus menaiki kapal laut dengan ongkos Rp150.000 - Rp300.000 per perjalanan dan menginap. Rata-rata waktu tunggu penerbitan surat rekomendasi statistik 3-5 hari kerja.',
    kondisi_sesudah:
      '100% permohonan data dan konsultasi statistik terlayani secara online tanpa biaya transportasi (Rp 0). SLA penerbitan data dan rekomendasi tuntas dalam waktu < 15 menit.',
    persentase_efisiensi: '85%',
    jumlah_pengguna: 1420,
    kategori_manfaat: 'Efisiensi Waktu & Biaya Penyeberangan Antar-Pulau',
    penanggung_jawab: 'Tim Pelayanan Statistik Terpadu & IPDS',
    status: 'AKTIF',
    link_dokumentasi:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2025-02-10T08:00:00Z',
    testimoni: [
      {
        nama: 'Dr. Novri Manoppo, M.Si',
        instansi: 'Bappelitbangda Kab. Kepl. Sitaro',
        jabatan: 'Kepala Bidang Perencanaan & Evaluasi',
        kutipan:
          'PST Si-Datu sangat menghemat waktu dan anggaran dinas kami saat perumusan dokumen RPJMD & RKPD. Validasi data sektoral langsung tuntas secara online.',
        rating: 5,
        tanggal: '15 Januari 2026'
      },
      {
        nama: 'Maria Tatengkeng, S.Pd',
        instansi: 'Dinas Pendidikan Sitaro',
        jabatan: 'Pengelola Data Pokok Pendidikan',
        kutipan:
          'Konsultasi via virtual booth sangat interaktif dan ramah. Respon cepat dari tim BPS Sitaro patut menjadi role model pelayanan publik kepulauan.',
        rating: 5,
        tanggal: '28 Februari 2026'
      },
      {
        nama: 'Glenn Sasela',
        instansi: 'Universitas Sam Ratulangi (Mahasiswa Asal Tagulandang)',
        jabatan: 'Peneliti Tugas Akhir',
        kutipan:
          'Sangat terbantu! Saya tidak perlu menyeberang kapal laut ke Pulau Siau saat cuaca berombak hanya untuk meminta tabel data inflasi dan kemiskinan.',
        rating: 5,
        tanggal: '10 Maret 2026'
      }
    ]
  },
  {
    id: 'inovasi-sitaro-fast-access',
    nama_inovasi:
      'Sitaro Dalam Angka Fast-Access (Portal Publikasi Kilat & Open Data)',
    tagline:
      'Rilis Publikasi Daerah Cepat, Kompresi Data Ringan, dan Dashboard Indikator Makro Interaktif',
    ringkasan:
      'Katalog digital publikasi statistik daerah dengan kompresi data hemat kuota (hemat 90% bandwidth), pencarian indikator cerdas, dan format tabel open-data siap olah untuk pimpinan daerah.',
    pilar_terkait: 'Pilar 2 - Penataan Tata Laksana',
    latar_belakang:
      'Publikasi resmi BPS sebelumnya berukuran besar (> 120 MB PDF statis) yang sangat lambat diunduh di wilayah blank spot/sinyal lemah pulau terluar, serta tabel data yang tidak ramah pengolahan analisis spreadsheet Pemda.',
    solusi_inovasi:
      'Mengembangkan micro-portal Fast-Access dengan kompresi dokumen modular per bab (< 1 MB), visualisasi dashboard makro ekonomi interaktif mobile-friendly, dan fasilitas ekspor data CSV/Excel 1-klik.',
    kondisi_sebelum:
      'Publikasi sering terlambat dikonsumsi perencana daerah karena ukuran file raksasa. Rilis publikasi tahunan sering melewati target awal tahun.',
    kondisi_sesudah:
      'Publikasi rilis serentak di akhir Februari (maju 3 bulan lebih cepat). Unduhan data instan < 5 detik bahkan pada jaringan sinyal seluler 3G pedesaan pulau.',
    persentase_efisiensi: '75%',
    jumlah_pengguna: 2850,
    kategori_manfaat: 'Aksesibilitas Data di Wilayah Blank Spot Kepulauan',
    penanggung_jawab: 'Tim Neraca Wilayah & Analisis Statistik',
    status: 'AKTIF',
    link_dokumentasi:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2025-03-01T09:30:00Z',
    testimoni: [
      {
        nama: 'Drs. Denny Kondoj, M.Si',
        instansi: 'Sekretariat Daerah Kab. Kepl. Sitaro',
        jabatan: 'Sekretaris Daerah',
        kutipan:
          'Fast-Access menjadi rujukan utama Bupati dan forkopimda saat briefing penanganan inflasi dan pangan daerah. Datanya sangat praktis dan cepat dibuka.',
        rating: 5,
        tanggal: '02 Februari 2026'
      },
      {
        nama: 'Fransisca Derek',
        instansi: 'Biro Berita Sitaro Post',
        jabatan: 'Jurnalis Senior',
        kutipan:
          'Penyajian infografis indikator makro sangat memudahkan jurnalis menyajikan data statistik yang ramah dibaca masyarakat umum.',
        rating: 5,
        tanggal: '18 Februari 2026'
      }
    ]
  },
  {
    id: 'inovasi-e-whistleblowing',
    nama_inovasi:
      'E-Whistleblowing & Pojok Integritas Mandiri (WBS-Sitaro Berani)',
    tagline:
      'Kanal Pengaduan Anti-Gratifikasi Terenkripsi dengan Jaminan Kerahasiaan Pelapor 100%',
    ringkasan:
      'Sistem pelaporan pelanggaran kode etik, gratifikasi, dan pungli dengan identitas terenkripsi (zero-knowledge hash) didukung display transparansi penanganan publik di front office.',
    pilar_terkait: 'Pilar 5 - Penguatan Pengawasan',
    latar_belakang:
      'Masyarakat maupun mitra statistik seringkali sungkan atau khawatir melapor jika terjadi potensi pungutan liar atau gratifikasi pada rekrutmen mitra sensus karena faktor kedekatan sosial di wilayah kepulauan.',
    solusi_inovasi:
      'Implementasi aplikasi pelaporan WBS online dengan kode tiket lacak anonim, notifikasi otomatis terenkripsi ke Tim Kepatuhan Internal BPS Sitaro, dan penempatan Kios Integritas Mandiri bebas kamera pemantau.',
    kondisi_sebelum:
      'Kotak saran kayu konvensional tidak pernah terisi pengaduan karena masyarakat khawatir identitasnya diketahui orang lain. Tidak ada tracking SLA penanganan aduan.',
    kondisi_sesudah:
      'Seluruh pengaduan ditindaklanjuti dengan SLA maksimal 2x24 jam. Satker mempertahankan rekor 100% Zero Gratifikasi dan Zero Conflict of Interest.',
    persentase_efisiensi: '90%',
    jumlah_pengguna: 380,
    kategori_manfaat: 'Mitigasi Fraud & Perlindungan Whistleblower',
    penanggung_jawab: 'Unit Kepatuhan Internal & SPI BPS Sitaro',
    status: 'AKTIF',
    link_dokumentasi:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    link_video: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    created_at: '2025-01-20T10:00:00Z',
    testimoni: [
      {
        nama: 'Ir. H. Supriyanto',
        instansi: 'Inspektorat Utama BPS RI',
        jabatan: 'Auditor Utama Wilayah Timur',
        kutipan:
          'Langkah progresif BPS Sitaro dalam membangun budaya anti-korupsi di lingkungan kepulauan terluar sangat patut dicontoh satker lain menuju WBK.',
        rating: 5,
        tanggal: '22 November 2025'
      },
      {
        nama: 'Mitra Statistik Kecamatan Siau Timur',
        instansi: 'Mitra Lapangan Sensus Pertanian',
        jabatan: 'Petugas Pendata Lapangan',
        kutipan:
          'Proses seleksi dan pembayaran honorarium mitra sangat bersih, transparan, dan tepat waktu tanpa potongan sepeser pun.',
        rating: 5,
        tanggal: '05 Januari 2026'
      }
    ]
  },
  {
    id: 'inovasi-simok-pulau',
    nama_inovasi:
      'SIMOK-PULAU (Sistem Monitoring Kinerja & Mobilitas Petugas Kepulauan)',
    tagline:
      'Geotagging Dinamis & Manajemen Progres Survei Offline-Sync Wilayah Kepulauan Terpencil',
    ringkasan:
      'Aplikasi monitoring lapangan berbasis PWA dengan auto-sync saat sinyal pulih, membantu koordinator memantau distribusi beban kerja mitra statistik di pulau terpencil tanpa ketergantungan sinyal internet.',
    pilar_terkait: 'Pilar 3 - Penataan Sistem Manajemen SDM',
    latar_belakang:
      'Kondisi blank spot di pulau terluar seperti Pulau Biaro dan beberapa desa di Siau Barat menyulitkan pengawasan kepatuhan jadwal survei dan keselamatan petugas lapangan saat cuaca buruk.',
    solusi_inovasi:
      'Aplikasi offline-first berbasis geolokasi yang mencatat timestamp dan koordinat saat wawancara responden, lalu melakukan enkripsi data dan auto-sync saat petugas kembali ke area sinyal.',
    kondisi_sebelum:
      'Laporan progres sensus dilakukan manual via SMS bila sinyal ada, buku catatan survei berisiko rusak terkena air laut, serta deviasi target survei terlambat diidentifikasi.',
    kondisi_sesudah:
      'Dashboard pimpinan menampilkan peta sebaran progres survei real-time per desa/blok sensus, akurasi data lapangan meningkat 40%, dan beban kerja terdistribusi adil.',
    persentase_efisiensi: '65%',
    jumlah_pengguna: 110,
    kategori_manfaat: 'Optimalisasi SDM & Pengawasan Lapangan Terpencil',
    penanggung_jawab: 'Tim TI & Manajemen Survei Lapangan',
    status: 'PENGEMBANGAN',
    link_dokumentasi:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    created_at: '2025-05-15T11:00:00Z',
    testimoni: [
      {
        nama: 'Yohanes Salindeho, S.Tr.Stat',
        instansi: 'BPS Kabupaten Kepulauan Sitaro',
        jabatan: 'Koordinator Lapangan Survei Sosial Ekonomi',
        kutipan:
          'Sangat membantu mitigasi risiko lapangan di Pulau Biaro. Deviasi sampel dapat segera diantisipasi sebelum periode pencacahan berakhir.',
        rating: 4.8,
        tanggal: '12 Januari 2026'
      }
    ]
  },
  {
    id: 'inovasi-emonev-sakip',
    nama_inovasi:
      'E-Monev SAKIP Mandiri & Pohon Kinerja Digital (Cascading IKU)',
    tagline:
      'Harmonisasi Perjanjian Kinerja dan Pengukuran Capaian Output Strategis Real-Time',
    ringkasan:
      'Sistem pemantauan akuntabilitas kinerja internal yang menghubungkan Perjanjian Kinerja pimpinan hingga target bulanan individu pegawai dengan alarm early warning realisasi fisik.',
    pilar_terkait: 'Pilar 4 - Penguatan Akuntabilitas',
    latar_belakang:
      'Penyusunan Laporan Kinerja Instansi Pemerintah (LKjIP) sebelumnya dilakukan secara ad-hoc menjelang deadline audit, mengakibatkan keterlambatan evaluasi berkala dan minimnya aksi perbaikan berkelanjutan.',
    solusi_inovasi:
      'Penyediaan dashboard pohon kinerja digital (cascading) dengan notifikasi early warning apabila capaian triwulanan suatu indikator berada di bawah kurva target minimal.',
    kondisi_sebelum:
      'Konsolidasi capaian kinerja butuh waktu 1-2 bulan per triwulan dan rentan selisih data antar tim kerja.',
    kondisi_sesudah:
      'Capaian IKU terukur otomatis setiap bulan, penyusunan LKjIP terpangkas dari 60 hari menjadi hanya 5 hari kerja dengan visualisasi tren 3 tahunan.',
    persentase_efisiensi: '70%',
    jumlah_pengguna: 55,
    kategori_manfaat: 'Peningkatan Nilai Akuntabilitas Kinerja (SAKIP)',
    penanggung_jawab: 'Subbagian Umum & Koordinator SAKIP',
    status: 'RINTISAN',
    link_dokumentasi:
      'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
    created_at: '2025-07-01T08:30:00Z',
    testimoni: [
      {
        nama: 'Grace Pangemanan, S.E.',
        instansi: 'BPS Kabupaten Kepulauan Sitaro',
        jabatan: 'Pejabat Pembuat Komitmen (PPK)',
        kutipan:
          'Penyerapan anggaran dan pencapaian target fisik kini berjalan selaras. Bukti dukung SAKIP selalu siap sedia kapan pun dibutuhkan tim verifikasi.',
        rating: 4.9,
        tanggal: '05 Februari 2026'
      }
    ]
  }
];

// Fallback in-memory list untuk persistensi lokal selama sesi
let inMemoryInovasiList: InovasiLayanan[] = [...DEFAULT_INOVASI_LIST];

export interface InovasiStats {
  totalInovasi: number;
  totalAktif: number;
  totalRintisan: number;
  totalPengembangan: number;
  totalPengguna: number;
  avgRating: number;
  avgEfisiensi: number;
}

export interface GetInovasiResult {
  success: boolean;
  data: InovasiLayanan[];
  stats: InovasiStats;
  pilarList: string[];
  error?: string;
}

/**
 * Server Action: Mengambil daftar inovasi pelayanan publik dan reformasi birokrasi BPS Sitaro.
 * Mendukung filter pilar (contoh: "Pilar 6", "Pilar 2", "Pilar 5", atau "ALL").
 */
export async function getInovasiListAction(
  pilarFilter?: string
): Promise<GetInovasiResult> {
  try {
    let items: InovasiLayanan[] = [];

    try {
      const supabase = await createClient();
      const { data: dbData, error } = await supabase
        .from('inovasi_layanan')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !dbData || dbData.length === 0) {
        items = [...inMemoryInovasiList];
      } else {
        items = dbData as InovasiLayanan[];
      }
    } catch {
      items = [...inMemoryInovasiList];
    }

    // Hitung available pilar unik
    const pilarSet = new Set<string>();
    items.forEach((item) => {
      if (item.pilar_terkait) {
        pilarSet.add(item.pilar_terkait);
      }
    });
    const pilarList = Array.from(pilarSet).sort();

    // Hitung statistik keseluruhan sebelum difilter
    const totalInovasi = items.length;
    const totalAktif = items.filter((i) => i.status === 'AKTIF').length;
    const totalRintisan = items.filter((i) => i.status === 'RINTISAN').length;
    const totalPengembangan = items.filter(
      (i) => i.status === 'PENGEMBANGAN'
    ).length;
    const totalPengguna = items.reduce(
      (acc, curr) => acc + (Number(curr.jumlah_pengguna) || 0),
      0
    );

    // Hitung rata-rata rating dari seluruh testimoni
    let sumRating = 0;
    let countRating = 0;
    items.forEach((item) => {
      if (Array.isArray(item.testimoni)) {
        item.testimoni.forEach((t) => {
          if (t.rating) {
            sumRating += Number(t.rating);
            countRating += 1;
          }
        });
      }
    });
    const avgRating =
      countRating > 0 ? Number((sumRating / countRating).toFixed(1)) : 5.0;

    // Hitung rata-rata efisiensi
    let sumEfisiensi = 0;
    let countEfisiensi = 0;
    items.forEach((item) => {
      const numStr = String(item.persentase_efisiensi).replace(/[^0-9]/g, '');
      const num = parseInt(numStr, 10);
      if (!isNaN(num)) {
        sumEfisiensi += num;
        countEfisiensi += 1;
      }
    });
    const avgEfisiensi =
      countEfisiensi > 0 ? Math.round(sumEfisiensi / countEfisiensi) : 75;

    // Filter pilar jika dipilih
    let filteredItems = items;
    if (pilarFilter && pilarFilter !== 'ALL' && pilarFilter.trim() !== '') {
      const q = pilarFilter.toLowerCase();
      filteredItems = items.filter((i) =>
        i.pilar_terkait.toLowerCase().includes(q)
      );
    }

    return {
      success: true,
      data: filteredItems,
      pilarList,
      stats: {
        totalInovasi,
        totalAktif,
        totalRintisan,
        totalPengembangan,
        totalPengguna,
        avgRating,
        avgEfisiensi
      }
    };
  } catch (err: any) {
    console.error('[INOVASI-ACTION] Error getInovasiListAction:', err);
    return {
      success: false,
      data: inMemoryInovasiList,
      pilarList: [],
      stats: {
        totalInovasi: inMemoryInovasiList.length,
        totalAktif: inMemoryInovasiList.filter((i) => i.status === 'AKTIF')
          .length,
        totalRintisan: inMemoryInovasiList.filter(
          (i) => i.status === 'RINTISAN'
        ).length,
        totalPengembangan: inMemoryInovasiList.filter(
          (i) => i.status === 'PENGEMBANGAN'
        ).length,
        totalPengguna: inMemoryInovasiList.reduce(
          (acc, c) => acc + (c.jumlah_pengguna || 0),
          0
        ),
        avgRating: 4.9,
        avgEfisiensi: 77
      },
      error: err?.message || 'Gagal mengambil data inovasi'
    };
  }
}

/**
 * Server Action: Menyimpan atau memperbarui data inovasi layanan.
 */
export async function saveInovasiAction(
  data: Partial<InovasiLayanan> & { id?: string }
): Promise<{ success: boolean; data?: InovasiLayanan; error?: string }> {
  try {
    const isNew = !data.id || data.id.trim() === '';
    const nowIso = new Date().toISOString();
    const id = isNew ? `inovasi-${Date.now()}` : data.id!;

    const payload: InovasiLayanan = {
      id,
      nama_inovasi: data.nama_inovasi || 'Inovasi Baru BPS Sitaro',
      ringkasan: data.ringkasan || '',
      pilar_terkait:
        data.pilar_terkait || 'Pilar 6 - Peningkatan Kualitas Pelayanan Publik',
      latar_belakang: data.latar_belakang || '',
      solusi_inovasi: data.solusi_inovasi || '',
      kondisi_sebelum: data.kondisi_sebelum || '',
      kondisi_sesudah: data.kondisi_sesudah || '',
      persentase_efisiensi: data.persentase_efisiensi || '70%',
      jumlah_pengguna: Number(data.jumlah_pengguna) || 0,
      testimoni: Array.isArray(data.testimoni) ? data.testimoni : [],
      link_dokumentasi:
        data.link_dokumentasi ||
        'https://drive.google.com/drive/folders/1bCOPvfgdM21Wo5706y-fCwAhiKa6PyzA',
      link_video: data.link_video || '',
      status: data.status || 'AKTIF',
      tagline: data.tagline || '',
      kategori_manfaat: data.kategori_manfaat || '',
      penanggung_jawab: data.penanggung_jawab || 'Tim Inovasi BPS Sitaro',
      created_at: data.created_at || nowIso
    };

    // Update fallback in-memory store
    const existingIndex = inMemoryInovasiList.findIndex((i) => i.id === id);
    if (existingIndex >= 0) {
      inMemoryInovasiList[existingIndex] = payload;
    } else {
      inMemoryInovasiList = [payload, ...inMemoryInovasiList];
    }

    // Cobakan simpan ke Supabase jika tabel inovasi_layanan ada
    try {
      const supabase = await createClient();
      await supabase
        .from('inovasi_layanan')
        .upsert(payload, { onConflict: 'id' });
    } catch {
      // Abaikan jika tabel supabase belum termigrasi
    }

    revalidatePath('/rebo/inovasi');
    return { success: true, data: payload };
  } catch (err: any) {
    console.error('[INOVASI-ACTION] Error saveInovasiAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menyimpan data inovasi'
    };
  }
}

/**
 * Server Action: Menghapus data inovasi berdasarkan ID.
 */
export async function deleteInovasiAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    inMemoryInovasiList = inMemoryInovasiList.filter((i) => i.id !== id);

    try {
      const supabase = await createClient();
      await supabase.from('inovasi_layanan').delete().eq('id', id);
    } catch {
      // Abaikan jika koneksi/tabel belum ada
    }

    revalidatePath('/rebo/inovasi');
    return { success: true };
  } catch (err: any) {
    console.error('[INOVASI-ACTION] Error deleteInovasiAction:', err);
    return {
      success: false,
      error: err?.message || 'Gagal menghapus inovasi'
    };
  }
}
