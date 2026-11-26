'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Milestone,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
  Sparkles,
  Users,
  ExternalLink,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  Share2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export interface RoadmapDokumen {
  nama: string;
  deskripsi?: string;
  wajib: boolean;
  format?: string;
}

export interface RoadmapActionLink {
  label: string;
  href: string;
  icon?: string;
  variant?: 'default' | 'outline' | 'secondary';
  isExternal?: boolean;
  isTabSwitch?: boolean;
  tabKey?: string;
}

export interface RoadmapTahap {
  id: number;
  number: string;
  title: string;
  subtitle: string;
  period: string;
  startMonth: number; // 0 = Jan
  endMonth: number; // 1 = Feb, etc.
  quarter: string;
  badge: string;
  accentColor: string;
  bgLight: string;
  borderLight: string;
  textLight: string;
  overview: string;
  indikatorKunci: string[];
  dokumenUtama: RoadmapDokumen[];
  pic: {
    role: string;
    person: string;
    unit: string;
    kontak?: string;
  };
  tipsSukses: string[];
  actionLinks: RoadmapActionLink[];
}

export const TAHAPAN_ZI_DATA: RoadmapTahap[] = [
  {
    id: 1,
    number: 'Tahap 01',
    title: 'Pencanangan & Pembentukan Tim Kerja ZI',
    subtitle: 'Komitmen Bersama, SK Tim Kerja & Rencana Aksi Pembangunan ZI',
    period: 'Januari - Februari',
    startMonth: 0,
    endMonth: 1,
    quarter: 'Triwulan I',
    badge: 'Inisiasi & Komitmen',
    accentColor: 'from-blue-600 to-indigo-600',
    bgLight: 'bg-blue-50/70 dark:bg-blue-950/30',
    borderLight: 'border-blue-200 dark:border-blue-800/60',
    textLight: 'text-blue-700 dark:text-blue-300',
    overview:
      'Tahap awal meletakkan pondasi integritas institusi melalui penandatanganan pakta integritas bersama, deklarasi pencanangan ZI secara terbuka di hadapan pemangku kepentingan daerah, penerbitan SK Tim Kerja 6 Pilar secara selektif, dan perumusan rencana aksi kerja tahunan.',
    indikatorKunci: [
      'Pencanangan Pembangunan Zona Integritas bersama seluruh ASN & PPNPN BPS Sitaro',
      'Penandatanganan Pakta Integritas tahunan oleh seluruh pimpinan dan pegawai',
      'Penerbitan SK Kepala BPS tentang Tim Kerja Pembangunan ZI (Koordinator & Anggota 6 Pilar)',
      'Penetapan dan penandatanganan komitmen Agen Perubahan (Agent of Change)',
      'Penyusunan Rencana Aksi Kerja Pembangunan ZI dan kalender monev berkala',
      'Sosialisasi internal & eksternal Core Values ASN BerAKHLAK dan komitmen WBK/WBBM'
    ],
    dokumenUtama: [
      {
        nama: 'SK Tim Kerja Pembangunan ZI BPS Sitaro',
        deskripsi:
          'Surat Keputusan resmi penugasan pilar 1 s/d 6 beserta tupoksi kerja terperinci.',
        wajib: true,
        format: 'PDF / SK Resmi'
      },
      {
        nama: 'Pakta Integritas Seluruh Pegawai',
        deskripsi:
          'Dokumen komitmen integritas bertandatangan basah/elektronik seluruh ASN & PPNPN.',
        wajib: true,
        format: 'PDF Bundle'
      },
      {
        nama: 'Piagam Pencanangan Zona Integritas',
        deskripsi:
          'Piagam deklarasi terbuka yang disaksikan oleh Forkopimda / Instansi vertikal daerah.',
        wajib: true,
        format: 'PDF / Piagam'
      },
      {
        nama: 'Dokumen Rencana Aksi ZI & Matriks Target',
        deskripsi:
          'Matriks rencana program kerja 6 pilar dengan alokasi waktu dan target capaian nyata.',
        wajib: true,
        format: 'PDF / XLSX'
      },
      {
        nama: 'Laporan & Notula Sosialisasi / Rapat Kick-Off',
        deskripsi:
          'Daftar hadir, notula resmi, surat undangan, serta foto dokumentasi kick-off ZI.',
        wajib: true,
        format: 'Standard 5 Dokumen'
      },
      {
        nama: 'SK & Profil Rencana Aksi Agen Perubahan',
        deskripsi:
          'Penetapan role model ASN dan program inovasi perubahan perilaku yang diusung.',
        wajib: false,
        format: 'PDF / Paparan'
      }
    ],
    pic: {
      role: 'Penanggung Jawab Utama & Inisiasi',
      person: 'Kepala BPS Kab. Kepulauan Sitaro',
      unit: 'Koordinator Pilar 1 (Manajemen Perubahan) & Subbagian Umum',
      kontak: 'PIC Pilar 1 & Hotline ZI BPS Sitaro'
    },
    tipsSukses: [
      'Lakukan seleksi anggota tim kerja secara transparan dan berbasis kompetensi melalui asesmen internal agar tercipta rasa kepemilikan (ownership) bersama.',
      'Gunakan Format Baku Undangan, Daftar Hadir, dan Notula Resmi dari menu "Pusat Template" REBO agar lolos validasi QA 5 Dokumen sejak tahap awal.',
      'Publikasikan pencanangan ZI ke media sosial resmi BPS Sitaro dan pasang spanduk komitmen di lobi PST sebagai bukti sosialisasi publik yang kuat.'
    ],
    actionLinks: [
      {
        label: 'Pusat Template Baku',
        href: '#template',
        icon: 'FileDown',
        variant: 'default',
        isTabSwitch: true,
        tabKey: 'template'
      },
      {
        label: 'Struktur Organisasi 6 Pilar',
        href: '#pilar',
        icon: 'Compass',
        variant: 'outline',
        isTabSwitch: true,
        tabKey: 'pilar'
      },
      {
        label: 'Kelola Kontak PIC Tim Kerja',
        href: '/rebo/admin/kontak',
        icon: 'Users',
        variant: 'outline'
      }
    ]
  },
  {
    id: 2,
    number: 'Tahap 02',
    title: 'Pelaksanaan Rencana Aksi & Pengumpulan Eviden di REBO V2',
    subtitle:
      'Input Bukti Dukung, QA Check 5 Dokumen & GDrive Permission Guard',
    period: 'Maret - Mei',
    startMonth: 2,
    endMonth: 4,
    quarter: 'Triwulan I - II',
    badge: 'Implementasi & Pengumpulan',
    accentColor: 'from-emerald-600 to-teal-600',
    bgLight: 'bg-emerald-50/70 dark:bg-emerald-950/30',
    borderLight: 'border-emerald-200 dark:border-emerald-800/60',
    textLight: 'text-emerald-700 dark:text-emerald-300',
    overview:
      'Fase intensif pelaksanaan program kerja 6 pilar pembangunan ZI, perancangan inovasi layanan, standarisasi SOP, serta pengunggahan eviden digital ke sistem REBO V2 dengan pengecekan kelengkapan 5 dokumen wajib dan proteksi izin tautan Google Drive.',
    indikatorKunci: [
      'Pengunggahan berkas eviden 6 Pilar Pemenuhan dan Reform pada portal REBO V2',
      'Pemeriksaan kepatuhan standar 5 dokumen (Undangan, Daftar Hadir, Notula, Laporan, Foto Dokumentasi)',
      'Validasi otomatis izin akses Google Drive ("Anyone with link can view") via Health Guard',
      'Pelaksanaan rapat monev berkala bulanan dan bimbingan teknis internal',
      'Penyusunan dan reviu SOP seluruh proses bisnis statistik dan pelayanan publik',
      'Penerapan mitigasi risiko korupsi, pencegahan benturan kepentingan, dan kepatuhan LHKPN/LHKASN'
    ],
    dokumenUtama: [
      {
        nama: 'Eviden Pilar 1 (Manajemen Perubahan)',
        deskripsi:
          'Laporan monev rencana aksi, internalisasi core values BerAKHLAK, pemantauan budaya kerja.',
        wajib: true,
        format: 'PDF / Drive Folder'
      },
      {
        nama: 'Eviden Pilar 2 (Penataan Tata Laksana)',
        deskripsi:
          'Peta proses bisnis, SOP maklumat layanan, integrasi SPBE, pemanfaatan inovasi TI.',
        wajib: true,
        format: 'PDF / Drive Folder'
      },
      {
        nama: 'Eviden Pilar 3 (Penataan Sistem Manajemen SDM)',
        deskripsi:
          'Pola mutasi internal, pengembangan kompetensi pegawai, monev kinerja, reward & punishment.',
        wajib: true,
        format: 'PDF / Drive Folder'
      },
      {
        nama: 'Eviden Pilar 4 (Penguatan Akuntabilitas Kinerja)',
        deskripsi:
          'Dokumen Renstra, IKU, Perjanjian Kinerja (PK), LAKIP, serta bukti keterlibatan aktif pimpinan.',
        wajib: true,
        format: 'PDF / Drive Folder'
      },
      {
        nama: 'Eviden Pilar 5 (Penguatan Pengawasan)',
        deskripsi:
          'Matriks risiko SPIP, SK Tim UPG/WBS/Benturan Kepentingan, tindak lanjut pengaduan masyarakat.',
        wajib: true,
        format: 'PDF / Drive Folder'
      },
      {
        nama: 'Eviden Pilar 6 (Peningkatan Kualitas Pelayanan)',
        deskripsi:
          'Standar Pelayanan PST, maklumat pelayanan terpasang, sarpras ramah rentan dan disabilitas.',
        wajib: true,
        format: 'PDF / Drive Folder'
      }
    ],
    pic: {
      role: 'Penanggung Jawab Pelaksanaan & Input',
      person: 'Operator & Koordinator Pilar 1 s.d 6',
      unit: 'Seluruh Tim Kerja ZI BPS Sitaro & Tim Verifikator Internal',
      kontak: 'Seluruh Tim Kerja Pilar'
    },
    tipsSukses: [
      'Gunakan fitur Batch Upload & Drag-and-Drop pada form bukti dukung REBO V2 untuk mengunggah multi-berkas sekaligus auto-tagging kategori dokumen.',
      'Periksa badge Google Drive Health Guard pada setiap indikator untuk memastikan izin folder disetel "Publik - Siapa saja dengan link dapat melihat", bukan "Restricted".',
      'Hindari penumpukan upload eviden menjelang cutoff: targetkan minimal 75% indikator telah terisi lengkap pada akhir April.'
    ],
    actionLinks: [
      {
        label: 'Form Input Bukti Dukung LKE',
        href: '/rebo/formRB/area',
        icon: 'FileText',
        variant: 'default'
      },
      {
        label: 'Pantau Capaian di Monitoring',
        href: '/rebo/monitoring',
        icon: 'TrendingUp',
        variant: 'outline'
      },
      {
        label: 'Cek Matriks Risiko & SPIP',
        href: '#spip',
        icon: 'ShieldCheck',
        variant: 'outline',
        isTabSwitch: true,
        tabKey: 'spip'
      }
    ]
  },
  {
    id: 3,
    number: 'Tahap 03',
    title: 'Penilaian Mandiri & Verifikasi TPI BPS RI',
    subtitle: 'Reviu Berjenjang, Dual-Scoring & Rekomendasi Perbaikan Kanban',
    period: 'Juni - Juli',
    startMonth: 5,
    endMonth: 6,
    quarter: 'Triwulan II - III',
    badge: 'Penilaian Internal',
    accentColor: 'from-amber-600 to-orange-600',
    bgLight: 'bg-amber-50/70 dark:bg-amber-950/30',
    borderLight: 'border-amber-200 dark:border-amber-800/60',
    textLight: 'text-amber-700 dark:text-amber-300',
    overview:
      'Evaluasi mandiri terpadu oleh Tim ZI BPS Sitaro yang dilanjutkan audit mendalam oleh Tim Penilai Internal (TPI) Inspektorat Utama BPS RI melalui uji petik dokumen bukti dukung, wawancara klarifikasi, analisis deviasi nilai, dan penyelesaian catatan perbaikan pada Kanban Board.',
    indikatorKunci: [
      'Penetapan skor mandiri (Self-Assessment) Satker BPS Sitaro pada aplikasi LKE',
      'Dual-Scoring & Verifikasi Berjenjang antara Operator, Koordinator Pilar, dan Verifikator TPI',
      'Pengujian kelayakan bukti dukung dan identifikasi deviasi nilai (Gap Analysis predikat WBK)',
      'Penerbitan Rekomendasi Perbaikan Hasil Audit Internal TPI BPS RI',
      'Tindak lanjut perbaikan eviden menggunakan kartu terpadu Kanban Board REBO V2',
      'Penyusunan Berita Acara Hasil Evaluasi Internal TPI untuk pengusulan ke KemenPAN-RB'
    ],
    dokumenUtama: [
      {
        nama: 'Lembar Kerja Evaluasi (LKE) Final Penilaian Mandiri',
        deskripsi:
          'Rekapitulasi nilai pemenuhan dan reform bertandatangan resmi Kepala BPS Sitaro.',
        wajib: true,
        format: 'Excel Resmi / PDF'
      },
      {
        nama: 'Lembar Catatan & Rekomendasi TPI Inspektorat BPS RI',
        deskripsi:
          'Daftar catatan deviasi nilai dan arahan perbaikan eviden dari tim auditor internal.',
        wajib: true,
        format: 'PDF / Catatan Reviu'
      },
      {
        nama: 'Matriks Tindak Lanjut Rekomendasi TPI (Kanban Board)',
        deskripsi:
          'Dokumentasi perbaikan berkas sesuai catatan reviu verifikator dengan rekam jejak waktu.',
        wajib: true,
        format: 'Kartu Kanban / PDF'
      },
      {
        nama: 'Berita Acara Pleno Kelayakan Usulan WBK',
        deskripsi:
          'Dokumen penetapan BPS Sitaro memenuhi syarat minimal (≥75.00) dan masuk kuota usulan nasional.',
        wajib: true,
        format: 'PDF Berita Acara'
      }
    ],
    pic: {
      role: 'Penilai & Pengawas Internal',
      person:
        'Tim Penilai Internal (TPI) Inspektorat Utama BPS RI & Verifikator Satker',
      unit: 'Inspektorat Wilayah III BPS RI & Tim Penjamin Kualitas BPS Sitaro',
      kontak: 'Hotline Tim Verifikator Internal'
    },
    tipsSukses: [
      'Pantau visual countdown SLA tindak lanjut pada kartu Kanban REBO V2 agar seluruh catatan perbaikan dari verifikator TPI selesai sebelum masa audit berakhir.',
      'Bandingkan grafik Radar Capaian 6 Pilar di menu Monitoring untuk mendeteksi pilar mana yang nilainya belum mencapai batas ambang WBK (75.00).',
      'Pastikan setiap perbaikan berkas disertai argumen tertulis dan tautan dokumen yang langsung dapat diverifikasi verifikator tanpa hambatan hak akses.'
    ],
    actionLinks: [
      {
        label: 'Papan Kanban Tindak Lanjut',
        href: '/rebo/kanban',
        icon: 'Kanban',
        variant: 'default'
      },
      {
        label: 'Analisis Deviasi & Radar Capaian',
        href: '/rebo/monitoring',
        icon: 'BarChart3',
        variant: 'outline'
      },
      {
        label: 'Unduh Excel LKE Resmi PermenPAN',
        href: '/api/export/lke',
        icon: 'FileSpreadsheet',
        variant: 'outline',
        isExternal: true
      }
    ]
  },
  {
    id: 4,
    number: 'Tahap 04',
    title: 'Sinkronisasi ZIAPP & Desk Evaluation TPN KemenPAN-RB',
    subtitle: 'Auto-Fill ZIAPP, Showcase Inovasi PST & Survei IKM / IPAK',
    period: 'Agustus - September',
    startMonth: 7,
    endMonth: 8,
    quarter: 'Triwulan III',
    badge: 'Evaluasi Nasional',
    accentColor: 'from-indigo-600 to-purple-600',
    bgLight: 'bg-indigo-50/70 dark:bg-indigo-950/30',
    borderLight: 'border-indigo-200 dark:border-indigo-800/60',
    textLight: 'text-indigo-700 dark:text-indigo-300',
    overview:
      'Pengunggahan eviden hasil verifikasi TPI ke portal nasional KemenPAN-RB (ZIAPP), pemaparan materi presentasi oleh Kepala BPS Sitaro di hadapan Tim Penilai Nasional (TPN), pembuktian dampak nyata inovasi layanan statistik terpadu, dan pemenuhan skor persepsi antikorupsi serta kepuasan publik.',
    indikatorKunci: [
      'Sinkronisasi 100% link eviden terverifikasi ke portal evaluasi ZIAPP KemenPAN-RB',
      'Pemanfaatan ekstensi "REBO Sync Assistant" untuk auto-fill data tanpa eror ketik manual',
      'Pemaparan pembangunan ZI oleh Kepala BPS Sitaro di hadapan Tim Penilai Nasional KemenPAN-RB',
      'Showcase Inovasi Pelayanan Publik Unggulan (PST Ramah Kepulauan, Konsultasi Data Cepat)',
      'Pemenuhan nilai ambang batas Indeks Kepuasan Masyarakat (IKM ≥ 3.20) dan Indeks Persepsi Anti Korupsi (IPAK ≥ 17.50)',
      'Pemeriksaan kelayakan integritas dan rekam jejak satker oleh KPK & Ombudsman RI'
    ],
    dokumenUtama: [
      {
        nama: 'Bukti Submit & Rekap Akun ZIAPP KemenPAN-RB',
        deskripsi:
          'Log pengiriman link LKE dan tanda terima submisi evaluasi online nasional resmi.',
        wajib: true,
        format: 'Screenshot / PDF'
      },
      {
        nama: 'Slide Paparan Presentasi Pimpinan Satker (Deck TPN)',
        deskripsi:
          'Materi paparan komitmen pimpinan, progress 6 pilar, inovasi, dan dampak Sebelum vs Sesudah.',
        wajib: true,
        format: 'PPTX / PDF Paparan'
      },
      {
        nama: 'One-Pager & Video Profil Showcase Inovasi PST',
        deskripsi:
          'Dokumentasi visual inovasi layanan terpadu khas daerah kepulauan Sitaro berdurasi 3-5 menit.',
        wajib: true,
        format: 'Video / Infografis'
      },
      {
        nama: 'Laporan Hasil Survei Kepuasan (IKM) & Integritas (IPAK)',
        deskripsi:
          'Laporan analisis survei triwulanan dengan metodologi baku dan sampel responden representatif.',
        wajib: true,
        format: 'Laporan PDF Resmi'
      }
    ],
    pic: {
      role: 'Presenter & Tim Diplomasi Evaluasi',
      person: 'Kepala BPS Sitaro & Tim Inti Presentasi ZI',
      unit: 'BPS Kab. Kepulauan Sitaro & Tim Pendamping BPS Provinsi Sulut',
      kontak: 'Koordinator Layanan PST & Tim IT'
    },
    tipsSukses: [
      'Gunakan ekstensi peramban REBO Sync Assistant untuk mengisikan link drive ke form ZIAPP secara otomatis dalam hitungan detik.',
      'Fokuskan paparan TPN pada aspek "Before vs After" serta efisiensi anggaran dan waktu yang dirasakan langsung oleh masyarakat pengguna data di Kepulauan Sitaro.',
      'Pastikan responden survei IKM dan IPAK adalah pengguna layanan riil PTSP yang tidak memiliki hubungan keluarga atau benturan kepentingan dengan satker.'
    ],
    actionLinks: [
      {
        label: 'Showcase Inovasi Pelayanan',
        href: '/rebo/inovasi',
        icon: 'Sparkles',
        variant: 'default'
      },
      {
        label: 'Analisis Survei IKM & IPAK',
        href: '/rebo/ikm-ipak',
        icon: 'Award',
        variant: 'outline'
      },
      {
        label: 'Kamus & Glosarium Konsep ZI',
        href: '#konsep',
        icon: 'HelpCircle',
        variant: 'outline',
        isTabSwitch: true,
        tabKey: 'konsep'
      }
    ]
  },
  {
    id: 5,
    number: 'Tahap 05',
    title: 'Verifikasi Lapangan (Mystery Shopping) & Penetapan Predikat WBK',
    subtitle: 'Uji Petik Sarpras PST Sitaro & Pengumuman Resmi KemenPAN-RB',
    period: 'Oktober - November',
    startMonth: 9,
    endMonth: 10,
    quarter: 'Triwulan IV',
    badge: 'Verifikasi Lapangan & Penetapan',
    accentColor: 'from-violet-600 to-rose-600',
    bgLight: 'bg-violet-50/70 dark:bg-violet-950/30',
    borderLight: 'border-violet-200 dark:border-violet-800/60',
    textLight: 'text-violet-700 dark:text-violet-300',
    overview:
      'Puncak evaluasi pembangunan Zona Integritas: Tim Penilai Nasional KemenPAN-RB melakukan kunjungan lapangan secara mendadak (Mystery Shopping) untuk menguji kualitas pelayanan frontliner PST BPS Sitaro, kepatuhan maklumat pelayanan, fasilitas ramah rentan, hingga penetapan resmi predikat WBK.',
    indikatorKunci: [
      'Kesiapan sarana prasarana ruang Pelayanan Statistik Terpadu (PST) berstandar pelayanan prima',
      'Ketersediaan fasilitas inklusif: ram kursi roda, toilet disabilitas, ruang laktasi, dan alat bantu disabilitas',
      'Uji petik Mystery Shopping oleh asesor TPN tanpa pemberitahuan jadwal (incognito visit)',
      'Penerapan budaya 5S (Senyum, Sapa, Salam, Sopan, Santun) dan zero pungli / gratifikasi',
      'Klarifikasi laporan publik oleh Ombudsman RI dan Aparat Penegak Hukum',
      'Penerbitan Keputusan Menteri PAN-RB tentang Penetapan Unit Kerja Berpredikat Wilayah Bebas dari Korupsi (WBK)'
    ],
    dokumenUtama: [
      {
        nama: 'Standar Pelayanan & Maklumat Pelayanan Publik PST',
        deskripsi:
          'Maklumat terpajang fisik di lobi kantor dan tercantum pada website resmi BPS Sitaro.',
        wajib: true,
        format: 'Banner Fisik & PDF'
      },
      {
        nama: 'Buku Tamu Elektronik & Dokumentasi Kunjungan PST',
        deskripsi:
          'Rekap kunjungan konsultasi statistik, perpustakaan data, dan rekomendasi statistik sektoral.',
        wajib: true,
        format: 'Digital Log / Excel'
      },
      {
        nama: 'Berita Acara Uji Petik Lapangan TPN KemenPAN-RB',
        deskripsi:
          'Lembar verifikasi faktual kondisi fisik kantor, kesiapan frontliner, dan testimoni pengguna data.',
        wajib: true,
        format: 'Berita Acara Resmi'
      },
      {
        nama: 'Surat Keputusan (SK) Menteri PAN-RB Predikat WBK',
        deskripsi:
          'Dokumen penganugerahan resmi predikat WBK kepada BPS Kab. Kepulauan Sitaro dari KemenPAN-RB.',
        wajib: true,
        format: 'SK Menteri PAN-RB'
      }
    ],
    pic: {
      role: 'Garis Depan & Pimpinan Satker',
      person: 'Petugas Front Office PST & Seluruh Pegawai BPS Sitaro',
      unit: 'Tim Layanan PST, Tim Pengamanan Dalam, & Kepala BPS',
      kontak: 'Front Office PST BPS Sitaro'
    },
    tipsSukses: [
      'Lakukan simulasi berkala uji petik mystery shopping internal agar petugas frontliner terbiasa menyambut tamu dan menjawab konsultasi data secara sigap, ramah, dan profesional.',
      'Pastikan banner anti-gratifikasi, kotak pengaduan fisik/digital, nomor hotline WBS, dan survei kepuasan elektronik terpasang jelas di ruang PST.',
      'Jaga kebersihan lingkungan kantor dan pastikan fasilitas ramah kelompok rentan (kursi roda, tongkat penuntun, kacamata baca) tertata rapi dan siap pakai setiap saat.'
    ],
    actionLinks: [
      {
        label: 'Arsip Dokumen Resmi',
        href: '/rebo/arsip',
        icon: 'FileSpreadsheet',
        variant: 'default'
      },
      {
        label: 'Showcase Inovasi & Dampak PST',
        href: '/rebo/inovasi',
        icon: 'Sparkles',
        variant: 'outline'
      },
      {
        label: 'Kembali ke Overview Dashboard',
        href: '/rebo/overview',
        icon: 'Building2',
        variant: 'outline'
      }
    ]
  }
];

export const BULAN_NAMA = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember'
];

interface ZiRoadmapTimelineProps {
  onNavigateTab?: (tabKey: string) => void;
  gdriveLink?: string;
  className?: string;
}

export default function ZiRoadmapTimeline({
  onNavigateTab,
  className = ''
}: ZiRoadmapTimelineProps) {
  // Current real month (0-11)
  const currentRealMonth = useMemo(() => new Date().getMonth(), []);
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Selected simulation month or null for real time
  const [selectedSimMonth, setSelectedSimMonth] = useState<number | null>(null);

  // Active month to calculate stage status
  const activeMonth =
    selectedSimMonth !== null ? selectedSimMonth : currentRealMonth;

  // Selected stage for detail view (default to current active stage or stage 1)
  const defaultStageId = useMemo(() => {
    const activeStage = TAHAPAN_ZI_DATA.find(
      (t) => activeMonth >= t.startMonth && activeMonth <= t.endMonth
    );
    if (activeStage) return activeStage.id;
    if (activeMonth > 10) return 5; // December: review & celebration stage 5
    return 1;
  }, [activeMonth]);

  const [selectedStageId, setSelectedStageId] =
    useState<number>(defaultStageId);

  // Active stage object
  const activeDetailStage = useMemo(() => {
    return (
      TAHAPAN_ZI_DATA.find((t) => t.id === selectedStageId) ||
      TAHAPAN_ZI_DATA[0]
    );
  }, [selectedStageId]);

  // Overall cycle progress calculation
  const cycleProgress = useMemo(() => {
    // 12 months in a year: activeMonth 0..11
    const progress = Math.min(
      100,
      Math.max(5, Math.round(((activeMonth + 1) / 12) * 100))
    );
    return progress;
  }, [activeMonth]);

  // Status helper for a stage
  const getStageStatus = (stage: RoadmapTahap) => {
    if (activeMonth > stage.endMonth) {
      return {
        label: 'Selesai',
        statusKey: 'completed',
        color:
          'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700'
      };
    }
    if (activeMonth >= stage.startMonth && activeMonth <= stage.endMonth) {
      return {
        label: 'Sedang Berjalan',
        statusKey: 'active',
        color:
          'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700'
      };
    }
    return {
      label: 'Tahap Berikutnya',
      statusKey: 'upcoming',
      color:
        'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
    };
  };

  const handleLinkClick = (link: RoadmapActionLink, e: React.MouseEvent) => {
    if (link.isTabSwitch && link.tabKey && onNavigateTab) {
      e.preventDefault();
      onNavigateTab(link.tabKey);
      toast.info(`Berpindah ke tab: ${link.label}`);
    }
  };

  const handleShareRoadmap = async () => {
    try {
      const shareUrl = window.location.href;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Tautan roadmap evaluasi ZI berhasil disalin!');
    } catch {
      toast.error('Gagal menyalin tautan.');
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ============================================================================== */}
      {/* 1. HERO & SIKLUS PROGRESS BANNER */}
      {/* ============================================================================== */}
      <div className='relative overflow-hidden rounded-2xl border border-blue-200/90 bg-gradient-to-br from-blue-50/90 via-indigo-50/50 to-white p-6 shadow-xs md:p-8 dark:border-blue-900/60 dark:from-slate-900 dark:via-blue-950/30 dark:to-slate-900'>
        {/* Decorative ambient elements */}
        <div className='pointer-events-none absolute -top-12 -right-12 h-56 w-56 rounded-full bg-blue-400/10 blur-3xl dark:bg-blue-500/10' />
        <div className='pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-indigo-400/10 blur-3xl dark:bg-indigo-500/10' />

        <div className='relative z-10 flex flex-col gap-6 md:flex-row md:items-start md:justify-between'>
          <div className='max-w-3xl space-y-3'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-100/80 px-3 py-1 text-xs font-bold text-blue-800 dark:border-blue-700 dark:bg-blue-950/60 dark:text-blue-300'>
                <Milestone className='h-3.5 w-3.5' />
                Siklus Tahunan Evaluasi ZI Menuju WBK/WBBM
              </span>
              <span className='inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100/70 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'>
                <span className='h-2 w-2 animate-pulse rounded-full bg-emerald-500' />
                Tahun Evaluasi {currentYear}
              </span>
            </div>

            <h2 className='text-2xl font-black tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
              Timeline & Roadmap Interaktif ZI BPS Sitaro
            </h2>

            <p className='text-xs leading-relaxed text-slate-600 sm:text-sm dark:text-slate-300'>
              Peta jalan terpadu 5 tahapan siklus tahunan pembangunan Zona
              Integritas BPS Kabupaten Kepulauan Siau Tagulandang Biaro menuju
              predikat Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi
              Bersih dan Melayani (WBBM) standar PermenPAN-RB No. 90/2021.
            </p>
          </div>

          {/* Month Status & Simulator Widget */}
          <div className='flex flex-col gap-2.5 rounded-xl border border-slate-200/90 bg-white/80 p-4 shadow-2xs backdrop-blur-xs md:w-80 dark:border-slate-800 dark:bg-slate-900/80'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300'>
                <Calendar className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
                <span>Bulan Berjalan</span>
              </div>

              {selectedSimMonth !== null && (
                <button
                  type='button'
                  onClick={() => setSelectedSimMonth(null)}
                  className='inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400'
                  title='Reset ke bulan nyata'
                >
                  <RotateCcw className='h-3 w-3' />
                  <span>Reset Waktu Nyata</span>
                </button>
              )}
            </div>

            <div className='flex items-center justify-between'>
              <div className='text-base font-bold text-slate-900 dark:text-slate-100'>
                {BULAN_NAMA[activeMonth]} {currentYear}
              </div>
              <Badge
                variant='outline'
                className='border-blue-300 text-[10px] font-bold text-blue-700 dark:border-blue-700 dark:text-blue-300'
              >
                {selectedSimMonth !== null ? 'Simulasi' : 'Waktu Nyata'}
              </Badge>
            </div>

            {/* Quick Month Selector */}
            <div className='pt-1'>
              <label
                htmlFor='sim-month-select'
                className='flex items-center justify-between text-[10px] font-medium text-slate-500 dark:text-slate-400'
              >
                <span>Uji Status Pada Bulan Lain:</span>
                <SlidersHorizontal className='h-3 w-3' />
              </label>
              <select
                id='sim-month-select'
                value={activeMonth}
                onChange={(e) => setSelectedSimMonth(parseInt(e.target.value))}
                className='mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
              >
                {BULAN_NAMA.map((bln, idx) => (
                  <option key={bln} value={idx}>
                    {bln} {idx === currentRealMonth ? '(Bulan Ini)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Global Progress Bar */}
        <div className='mt-6 space-y-2 border-t border-blue-100 pt-5 dark:border-slate-800'>
          <div className='flex items-center justify-between text-xs'>
            <div className='flex items-center gap-2'>
              <span className='font-bold text-slate-800 dark:text-slate-200'>
                Progress Siklus Tahunan:
              </span>
              <span className='font-extrabold text-blue-600 dark:text-blue-400'>
                {cycleProgress}%
              </span>
              <span className='text-[11px] text-slate-500 dark:text-slate-400'>
                (Bulan {activeMonth + 1} dari 12)
              </span>
            </div>

            <div className='hidden items-center gap-3 text-[11px] text-slate-500 sm:flex dark:text-slate-400'>
              <span className='inline-flex items-center gap-1'>
                <span className='h-2 w-2 rounded-full bg-emerald-500' /> Selesai
              </span>
              <span className='inline-flex items-center gap-1'>
                <span className='h-2 w-2 rounded-full bg-blue-500' /> Sedang
                Berjalan
              </span>
              <span className='inline-flex items-center gap-1'>
                <span className='h-2 w-2 rounded-full bg-slate-400' /> Tahap
                Berikutnya
              </span>
            </div>
          </div>

          <div className='h-2.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800'>
            <div
              className='h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 transition-all duration-500'
              style={{ width: `${cycleProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 2. INTERACTIVE STEPPER / CARDS (5 TAHAPAN) */}
      {/* ============================================================================== */}
      <div className='space-y-3'>
        <div className='flex items-center justify-between'>
          <h3 className='flex items-center gap-2 text-sm font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
            <span>Pilih Tahapan Evaluasi:</span>
            <span className='text-xs font-normal text-slate-400 lowercase'>
              (klik untuk rincian indikator &amp; syarat dokumen)
            </span>
          </h3>

          <button
            type='button'
            onClick={handleShareRoadmap}
            className='inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400'
          >
            <Share2 className='h-3.5 w-3.5' />
            <span>Bagikan Roadmap</span>
          </button>
        </div>

        {/* 5 Stepper Cards Grid */}
        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5'>
          {TAHAPAN_ZI_DATA.map((stage) => {
            const isSelected = selectedStageId === stage.id;
            const status = getStageStatus(stage);
            const isCurrentActive =
              activeMonth >= stage.startMonth && activeMonth <= stage.endMonth;

            return (
              <button
                key={stage.id}
                type='button'
                onClick={() => setSelectedStageId(stage.id)}
                className={`group relative flex cursor-pointer flex-col justify-between rounded-xl p-4 text-left transition-all duration-200 ${
                  isSelected
                    ? 'border-2 border-blue-600 bg-white shadow-md ring-4 ring-blue-500/10 dark:border-blue-500 dark:bg-slate-900 dark:ring-blue-500/20'
                    : 'border border-slate-200 bg-white/80 hover:border-blue-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:hover:bg-slate-800/60'
                }`}
              >
                {/* Active indicator dot */}
                {isCurrentActive && (
                  <div className='absolute -top-1.5 -right-1.5 flex h-3 w-3'>
                    <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75' />
                    <span className='relative inline-flex h-3 w-3 rounded-full bg-blue-600' />
                  </div>
                )}

                <div className='space-y-2.5'>
                  {/* Top Bar: Number & Status Badge */}
                  <div className='flex items-center justify-between'>
                    <span
                      className={`text-xs font-extrabold tracking-wider ${
                        isSelected
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      {stage.number}
                    </span>

                    <Badge
                      variant='outline'
                      className={`border px-2 py-0 text-[10px] font-bold ${status.color}`}
                    >
                      {status.label}
                    </Badge>
                  </div>

                  {/* Title & Period */}
                  <div>
                    <h4
                      className={`line-clamp-2 text-xs leading-snug font-bold transition-colors ${
                        isSelected
                          ? 'text-blue-900 dark:text-blue-100'
                          : 'text-slate-800 group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-300'
                      }`}
                    >
                      {stage.title}
                    </h4>
                    <p className='mt-1 flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
                      <Clock className='h-3 w-3 shrink-0 text-slate-400' />
                      <span>{stage.period}</span>
                    </p>
                  </div>
                </div>

                {/* Footer of card */}
                <div className='mt-4 flex items-center justify-between border-t border-slate-100 pt-2.5 dark:border-slate-800/80'>
                  <span className='text-[10px] font-medium text-slate-400 dark:text-slate-500'>
                    {stage.quarter}
                  </span>
                  <span
                    className={`inline-flex items-center gap-0.5 text-[11px] font-bold transition-transform duration-200 ${
                      isSelected
                        ? 'translate-x-0.5 text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 group-hover:translate-x-0.5 group-hover:text-slate-600'
                    }`}
                  >
                    <span>Detail</span>
                    <ChevronRight className='h-3 w-3' />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ============================================================================== */}
      {/* 3. RINCIAN TAHAPAN TERPILIH (INTERACTIVE DETAIL PANEL) */}
      {/* ============================================================================== */}
      <div className='overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900'>
        {/* Header Rincian */}
        <div
          className={`border-b border-slate-200 bg-gradient-to-r p-6 dark:border-slate-800 ${activeDetailStage.accentColor} text-white`}
        >
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='max-w-3xl space-y-1.5'>
              <div className='flex flex-wrap items-center gap-2'>
                <span className='rounded-md bg-white/20 px-2.5 py-0.5 text-xs font-bold tracking-wide text-white uppercase backdrop-blur-xs'>
                  {activeDetailStage.number} • {activeDetailStage.quarter}
                </span>
                <span className='rounded-md bg-black/20 px-2.5 py-0.5 text-xs font-semibold text-white/90'>
                  {activeDetailStage.period}
                </span>
                <Badge className='bg-white text-xs font-bold text-slate-900 shadow-xs hover:bg-white'>
                  {getStageStatus(activeDetailStage).label}
                </Badge>
              </div>

              <h3 className='text-xl font-black text-white md:text-2xl'>
                {activeDetailStage.title}
              </h3>
              <p className='text-xs leading-relaxed text-white/85 md:text-sm'>
                {activeDetailStage.subtitle}
              </p>
            </div>

            {/* Quick Summary Pill */}
            <div className='shrink-0 rounded-xl border border-white/20 bg-white/10 p-3.5 text-right backdrop-blur-md md:w-56'>
              <div className='text-[11px] font-medium text-white/75'>
                Fokus Sasaran
              </div>
              <div className='mt-0.5 text-sm font-bold text-white'>
                {activeDetailStage.badge}
              </div>
              <div className='mt-1 text-[10px] text-white/70'>
                {activeDetailStage.dokumenUtama.length} Dokumen Syarat Utama
              </div>
            </div>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className='space-y-8 p-6 md:p-8'>
          {/* Overview Paragraph */}
          <div className='dark:bg-slate-850/50 rounded-xl border border-slate-200/80 bg-slate-50/70 p-4 dark:border-slate-800'>
            <h4 className='mb-1 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
              <Bookmark className='h-3.5 w-3.5 text-blue-600 dark:text-blue-400' />
              <span>Deskripsi &amp; Konteks Pelaksanaan</span>
            </h4>
            <p className='text-xs leading-relaxed text-slate-700 md:text-sm dark:text-slate-300'>
              {activeDetailStage.overview}
            </p>
          </div>

          {/* Grid 2 Kolom: Indikator Kunci & Dokumen Syarat Utama */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
            {/* Kolom 1: Indikator Kunci */}
            <div className='space-y-3.5'>
              <div className='flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800'>
                <h4 className='flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100'>
                  <CheckCircle2 className='h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                  <span>Indikator &amp; Output Kunci</span>
                </h4>
                <span className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
                  {activeDetailStage.indikatorKunci.length} Butir Sasaran
                </span>
              </div>

              <div className='space-y-2.5'>
                {activeDetailStage.indikatorKunci.map((ind, i) => (
                  <div
                    key={i}
                    className='flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white p-3 shadow-2xs transition hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-900/60'
                  >
                    <span className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'>
                      {i + 1}
                    </span>
                    <p className='text-xs leading-relaxed font-medium text-slate-800 dark:text-slate-200'>
                      {ind}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kolom 2: Dokumen Syarat Utama */}
            <div className='space-y-3.5'>
              <div className='flex items-center justify-between border-b border-slate-100 pb-2 dark:border-slate-800'>
                <h4 className='flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-slate-100'>
                  <FileText className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  <span>Dokumen Syarat Utama</span>
                </h4>
                <span className='text-[11px] font-semibold text-slate-500 dark:text-slate-400'>
                  Wajib Disiapkan
                </span>
              </div>

              <div className='space-y-2.5'>
                {activeDetailStage.dokumenUtama.map((dok, idx) => (
                  <div
                    key={idx}
                    className='rounded-xl border border-slate-200/70 bg-white p-3.5 shadow-2xs transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900/60'
                  >
                    <div className='flex items-start justify-between gap-2'>
                      <div className='space-y-1'>
                        <div className='flex items-center gap-2'>
                          <span className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                            {dok.nama}
                          </span>
                        </div>
                        {dok.deskripsi && (
                          <p className='text-[11px] leading-relaxed text-slate-500 dark:text-slate-400'>
                            {dok.deskripsi}
                          </p>
                        )}
                      </div>

                      <div className='flex shrink-0 flex-col items-end gap-1'>
                        {dok.wajib ? (
                          <Badge className='border-rose-200 bg-rose-100 text-[10px] font-bold text-rose-800 hover:bg-rose-100 dark:border-rose-800 dark:bg-rose-950/60 dark:text-rose-300'>
                            Wajib
                          </Badge>
                        ) : (
                          <Badge
                            variant='outline'
                            className='text-[10px] text-slate-500'
                          >
                            Pendukung
                          </Badge>
                        )}
                        {dok.format && (
                          <span className='text-[10px] font-medium text-slate-400 dark:text-slate-500'>
                            {dok.format}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kolom Bawah: PIC Penanggung Jawab & Pro Tips Sukses Lolos Asesmen */}
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* PIC Card (1 Kolom) */}
            <div className='dark:from-slate-850 rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-indigo-50/40 p-5 dark:border-slate-800 dark:to-indigo-950/20'>
              <h4 className='mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-600 uppercase dark:text-slate-300'>
                <Users className='h-4 w-4 text-indigo-600 dark:text-indigo-400' />
                <span>PIC &amp; Penanggung Jawab</span>
              </h4>

              <div className='space-y-2.5'>
                <div>
                  <div className='text-[11px] text-slate-500 dark:text-slate-400'>
                    Peran Utama:
                  </div>
                  <div className='text-xs font-bold text-slate-900 dark:text-slate-100'>
                    {activeDetailStage.pic.role}
                  </div>
                </div>

                <div>
                  <div className='text-[11px] text-slate-500 dark:text-slate-400'>
                    Pejabat / Penanggung Jawab:
                  </div>
                  <div className='text-xs font-semibold text-indigo-700 dark:text-indigo-300'>
                    {activeDetailStage.pic.person}
                  </div>
                </div>

                <div>
                  <div className='text-[11px] text-slate-500 dark:text-slate-400'>
                    Unit Kerja Terlibat:
                  </div>
                  <div className='text-xs text-slate-700 dark:text-slate-300'>
                    {activeDetailStage.pic.unit}
                  </div>
                </div>

                {activeDetailStage.pic.kontak && (
                  <div className='border-t border-slate-200 pt-2 dark:border-slate-800'>
                    <div className='text-[10px] text-slate-400'>
                      Kontak Koordinasi:
                    </div>
                    <div className='text-xs font-medium text-slate-600 dark:text-slate-400'>
                      {activeDetailStage.pic.kontak}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pro Tips Sukses (2 Kolom) */}
            <div className='rounded-xl border border-amber-200/80 bg-amber-50/50 p-5 lg:col-span-2 dark:border-amber-900/60 dark:bg-amber-950/20'>
              <h4 className='mb-3 flex items-center gap-1.5 text-xs font-bold tracking-wider text-amber-900 uppercase dark:text-amber-200'>
                <Sparkles className='h-4 w-4 text-amber-600 dark:text-amber-400' />
                <span>Tips Sukses Lolos Asesmen TPI &amp; TPN</span>
              </h4>

              <div className='space-y-2.5'>
                {activeDetailStage.tipsSukses.map((tip, idx) => (
                  <div key={idx} className='flex items-start gap-2.5'>
                    <span className='mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-200 text-[11px] font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200'>
                      ✓
                    </span>
                    <p className='text-xs leading-relaxed text-amber-950 dark:text-amber-100'>
                      {tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Bar */}
          <div className='border-t border-slate-100 pt-5 dark:border-slate-800'>
            <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300'>
                <span>Pintasan Aksi Terkait {activeDetailStage.number}:</span>
              </div>

              <div className='flex flex-wrap items-center gap-2'>
                {activeDetailStage.actionLinks.map((link, idx) => {
                  return (
                    <Link
                      key={idx}
                      href={link.href}
                      onClick={(e) => handleLinkClick(link, e)}
                      target={link.isExternal ? '_blank' : undefined}
                      rel={link.isExternal ? 'noopener noreferrer' : undefined}
                      className='inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold transition'
                    >
                      <Button
                        variant={link.variant || 'outline'}
                        size='sm'
                        className='h-8 gap-1.5 text-xs font-semibold'
                      >
                        {link.label}
                        {link.isExternal ? (
                          <ExternalLink className='h-3 w-3' />
                        ) : (
                          <ArrowRight className='h-3 w-3' />
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
