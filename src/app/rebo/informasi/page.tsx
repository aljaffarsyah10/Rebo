import PageContainer from '@/components/layout/page-container';
import PremiumCard from '@/components/ui/premium-card';
import PilarCollapse from '@/components/rebo/pilar-collapse';
import RBStructureGraph from '@/components/rebo/rb-structure-graph';
import { createClient } from '@/lib/supabase/server';
import { ExternalLink, FolderGit2 } from 'lucide-react';
import {
  DEFAULT_AREAS_DATA,
  DEFAULT_PILAR_HASIL_DATA
} from '@/constants/rb-structure-default';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Informasi & Struktur Hierarki Zona Integritas'
};

export default async function InformasiPage() {
  const gdriveLink =
    'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing';

  let areasData: any[] = [];
  let pilarHasilData: any[] = [];

  try {
    const supabase = await createClient();
    const [areasRes, pilarHasilRes] = await Promise.all([
      supabase
        .from('area')
        .select(
          `
          id_area,
          nama_area,
          pilar (
            id_pilar,
            nama_pilar,
            subpilar (
              id_subpilar,
              nama_subpilar,
              pertanyaan (
                id_pertanyaan,
                deskripsi_pertanyaan,
                uraian_buktidukung,
                kategoriPenilaian (
                  id_kategori,
                  uraian_kategori,
                  nilai
                )
              )
            )
          )
        `
        )
        .order('id_area', { ascending: true }),
      supabase
        .from('pilarHasil')
        .select('*')
        .order('id_pilarHasil', { ascending: true })
    ]);

    if (areasRes.data && areasRes.data.length > 0) {
      areasData = areasRes.data;
    } else {
      areasData = DEFAULT_AREAS_DATA;
    }
    if (pilarHasilRes.data && pilarHasilRes.data.length > 0) {
      pilarHasilData = pilarHasilRes.data;
    } else {
      pilarHasilData = DEFAULT_PILAR_HASIL_DATA;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching RB structure for Informasi page:', err);
    areasData = DEFAULT_AREAS_DATA;
    pilarHasilData = DEFAULT_PILAR_HASIL_DATA;
  }

  return (
    <PageContainer>
      <div className='container mx-auto max-w-6xl space-y-8 py-6'>
        {/* Intro Card */}
        <div className='rounded-3xl bg-gradient-to-b from-slate-50/60 to-white/60 p-6 shadow-sm dark:from-slate-900/40 dark:to-slate-950'>
          <PremiumCard
            title='Informasi: Pembangunan Zona Integritas'
            description='Panduan komprehensif konsep, hierarki, dan komponen pembangunan Zona Integritas (ZI) Reformasi Birokrasi BPS.'
          >
            <p className='mb-4 leading-relaxed text-slate-700 dark:text-slate-300'>
              Pembangunan zona integritas bukanlah semata tentang kepatuhan pada
              peraturan, tetapi juga sebuah komitmen untuk menciptakan
              lingkungan kerja yang bersih, transparan, dan berintegritas. Pada
              praktiknya, zona integritas merupakan miniatur pelaksanaan
              Reformasi Birokrasi sehingga diharapkan dapat menjadi fondasi bagi
              terwujudnya birokrasi yang anti korupsi, berkinerja tinggi, dan
              pelayanan publik prima.
            </p>

            <p className='leading-relaxed text-slate-700 dark:text-slate-300'>
              Reformasi birokrasi di BPS bertujuan mewujudkan tata kelola yang
              efektif, efisien, bersih, dan bebas KKN melalui pembangunan Zona
              Integritas (ZI) menuju WBK/WBBM. Upaya ini menghadapi kendala
              berupa penyimpangan aparatur, lemahnya pengawasan, serta belum
              terpenuhinya standar penilaian pada beberapa satker. Karena itu,
              diperlukan pedoman khusus pembangunan ZI di BPS agar reformasi
              birokrasi dapat berjalan lebih terarah dan optimal.
            </p>
          </PremiumCard>
        </div>

        {/* ============================================================================== */}
        {/* FITUR UTAMA: GRAPH & STRUKTUR HIERARKI RB */}
        {/* ============================================================================== */}
        <section className='space-y-4'>
          <div className='flex items-center gap-2'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm'>
              <FolderGit2 className='h-4 w-4' />
            </div>
            <div>
              <h2 className='text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100'>
                Bagan & Struktur Hierarki Reformasi Birokrasi
              </h2>
              <p className='text-xs text-slate-500'>
                Eksplorasi grafis interaktif mulai dari Komponen Utama hingga
                Indikator / Pertanyaan LKE dan Bukti Dukung.
              </p>
            </div>
          </div>

          <RBStructureGraph
            areasData={areasData}
            pilarHasilData={pilarHasilData}
          />
        </section>

        {/* Pengertian Umum & Komponen Pengungkit Accordions */}
        <div className='rounded-3xl bg-gradient-to-b from-slate-50/60 to-white/60 p-6 shadow-sm dark:from-slate-900/40 dark:to-slate-950'>
          <PremiumCard
            title='Pedoman & Pengertian Umum ZI'
            description='Definisi dan istilah resmi dalam kerangka evaluasi PMPRB dan Zona Integritas.'
          >
            <h3 className='mt-2 mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100'>
              Pengertian Umum
            </h3>
            <div className='mb-6 rounded-xl border border-slate-100 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900'>
              <ol className='list-inside list-decimal space-y-2 text-sm text-slate-700 dark:text-slate-300'>
                <li>
                  <strong className='font-semibold'>
                    Zona Integritas (ZI)
                  </strong>
                  : instansi pemerintah yang pimpinan dan jajarannya telah
                  berkomitmen untuk mewujudkan Wilayah Bebas dari
                  Korupsi/Wilayah Birokrasi Bersih dan Melayani melalui
                  reformasi birokrasi.
                </li>
                <li>
                  <strong className='font-semibold'>
                    Wilayah Bebas dari Korupsi (WBK)
                  </strong>
                  : predikat yang diberikan kepada unit/satuan kerja yang telah
                  berhasil melaksanakan reformasi birokrasi dengan baik.
                </li>
                <li>
                  <strong className='font-semibold'>
                    Wilayah Birokrasi Bersih dan Melayani (WBBM)
                  </strong>
                  : predikat untuk unit/satuan kerja yang telah melaksanakan
                  reformasi birokrasi dengan sangat baik.
                </li>
                <li>
                  <strong className='font-semibold'>Unit Kerja</strong>:
                  serendah-rendahnya eselon II yang menyelenggarakan layanan.
                </li>
                <li>
                  <strong className='font-semibold'>Satker</strong>:
                  serendah-rendahnya unit Eselon III yang menyelenggarakan
                  layanan.
                </li>
                <li>
                  <strong className='font-semibold'>
                    Tim Pembinaan Pembangunan ZI
                  </strong>
                  : tim yang dibentuk oleh BPS untuk pembinaan dan pendampingan
                  (contoh: Biro Perencanaan untuk BPS).
                </li>
                <li>
                  <strong className='font-semibold'>
                    Tim Penanggung Jawab Kegiatan (PJK) Evaluasi
                  </strong>
                  : melakukan koordinasi evaluasi pembangunan ZI (contoh:
                  Inspektorat Wilayah III di BPS).
                </li>
                <li>
                  <strong className='font-semibold'>
                    Tim Penilai Internal (TPI)
                  </strong>
                  : tim internal yang melakukan evaluasi dan memberikan
                  rekomendasi bagi unit yang sedang membangun ZI.
                </li>
                <li>
                  <strong className='font-semibold'>
                    Tim Penilai Pendahuluan (TPP)
                  </strong>
                  : ditetapkan pada level provinsi untuk menilai dan
                  merekomendasikan satker sebelum diusulkan ke TPI.
                </li>
                <li>
                  <strong className='font-semibold'>
                    Tim Penilai Mandiri (TPM)
                  </strong>
                  : tim untuk penilaian mandiri dalam proses memperoleh predikat
                  WBK.
                </li>
                <li>
                  <strong className='font-semibold'>
                    Tim Penilai Nasional (TPN)
                  </strong>
                  : tim nasional yang terdiri dari KemenPAN-RB, KPK, Ombudsman
                  RI dan instansi pemerintah lain untuk evaluasi ZI.
                </li>
              </ol>
            </div>

            <h3 className='mt-6 mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100'>
              Rincian 6 Komponen Pengungkit
            </h3>

            <PilarCollapse
              title='1. Manajemen Perubahan'
              value='pilar-1'
              defaultOpen
            >
              <p className='mb-1'>
                Tujuan: Mentransformasi sistem, mekanisme, mindset, dan budaya
                kerja ASN menjadi adaptif dan berintegritas.
              </p>
              <ul className='ml-4 list-inside list-disc'>
                <li>Perubahan pola pikir dan budaya kerja menuju WBK/WBBM.</li>
                <li>
                  Menurunkan risiko kegagalan akibat resistensi perubahan.
                </li>
                <li>Terimplementasinya Core Value ASN Berakhlak.</li>
              </ul>
            </PilarCollapse>

            <PilarCollapse title='2. Penataan Tatalaksana' value='pilar-2'>
              <p className='mb-1'>
                Tujuan: Meningkatkan efisiensi dan efektivitas sistem, proses,
                dan prosedur kerja.
              </p>
              <ul className='ml-4 list-inside list-disc'>
                <li>Meningkatkan penggunaan TI dalam manajemen unit.</li>
                <li>Meningkatkan efisiensi proses manajemen.</li>
                <li>Meningkatkan kinerja unit kerja.</li>
              </ul>
            </PilarCollapse>

            <PilarCollapse
              title='3. Penataan Sistem Manajemen SDM Aparatur'
              value='pilar-3'
            >
              <p className='mb-1'>
                Tujuan: Meningkatkan profesionalisme dan tata kelola SDM
                aparatur.
              </p>
              <ul className='ml-4 list-inside list-disc'>
                <li>Meningkatnya ketaatan dalam pengelolaan SDM.</li>
                <li>
                  Meningkatnya transparansi dan akuntabilitas manajemen SDM.
                </li>
                <li>Meningkatnya disiplin dan efektivitas manajemen SDM.</li>
              </ul>
            </PilarCollapse>

            <PilarCollapse title='4. Penguatan Akuntabilitas' value='pilar-4'>
              <p className='mb-1'>
                Tujuan: Meningkatkan kapasitas dan akuntabilitas kinerja
                instansi pemerintah.
              </p>
              <ul className='ml-4 list-inside list-disc'>
                <li>Meningkatnya kinerja instansi pemerintah.</li>
                <li>Meningkatnya akuntabilitas instansi Pemerintah.</li>
              </ul>
            </PilarCollapse>

            <PilarCollapse title='5. Penguatan Pengawasan' value='pilar-5'>
              <p className='mb-1'>
                Tujuan: Meningkatkan penyelenggaraan pemerintahan yang bersih
                dan bebas KKN.
              </p>
              <ul className='ml-4 list-inside list-disc'>
                <li>Meningkatnya kepatuhan pengelolaan keuangan negara.</li>
                <li>Menurunnya tingkat penyalahgunaan wewenang.</li>
                <li>Meningkatkan sistem integritas untuk pencegahan KKN.</li>
              </ul>
            </PilarCollapse>

            <PilarCollapse
              title='6. Peningkatan Kualitas Pelayanan Publik'
              value='pilar-6'
            >
              <p className='mb-1'>
                Tujuan: Meningkatkan kualitas dan inovasi pelayanan publik
                sesuai kebutuhan masyarakat.
              </p>
              <ul className='ml-4 list-inside list-disc'>
                <li>
                  Meningkatnya kualitas pelayanan publik (cepat, murah, aman,
                  mudah dijangkau).
                </li>
                <li>
                  Meningkatnya jumlah unit pelayanan yang memperoleh
                  standardisasi.
                </li>
                <li>Meningkatnya indeks kepuasan masyarakat.</li>
              </ul>
            </PilarCollapse>
          </PremiumCard>
        </div>

        {/* Link GDrive Buku Pedoman */}
        <div className='flex flex-col gap-2 rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6 shadow-md transition-all duration-300 hover:shadow-lg dark:border-gray-800 dark:from-blue-950/40 dark:via-gray-900 dark:to-gray-900'>
          <div className='flex items-center gap-2.5'>
            <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 p-1.5 shadow'>
              <svg
                width='20'
                height='20'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='text-white'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M3 7V5a2 2 0 012-2h10a2 2 0 012 2v2'
                />
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth='2'
                  d='M3 7h18v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z'
                />
              </svg>
            </span>
            <span className='text-base font-semibold text-gray-800 dark:text-gray-200'>
              Repositori & Buku Pedoman Zona Integritas
            </span>
          </div>
          <p className='text-xs text-gray-600 dark:text-gray-400'>
            Akses seluruh dokumen pedoman teknis, template eviden, PermenPAN-RB,
            dan buku saku ZI BPS RI.
          </p>
          <div className='mt-2'>
            <a
              href={gdriveLink}
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-indigo-700'
            >
              <span>Buka Folder Google Drive Pedoman</span>
              <ExternalLink className='h-3.5 w-3.5' />
            </a>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
