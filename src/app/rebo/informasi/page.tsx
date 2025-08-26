import Link from 'next/link';
import PageContainer from '@/components/layout/page-container';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/components/ui/card';
import PremiumCard from '@/components/ui/premium-card';
import PilarCollapse from '@/components/rebo/pilar-collapse';

export const metadata = {
  title: 'Informasi Zona Integritas'
};

export default function InformasiPage() {
  const gdriveLink =
    'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing';
  return (
    <PageContainer>
      <div className='container mx-auto max-w-4xl py-6'>
        <div className='-mx-6 rounded-3xl bg-gradient-to-b from-slate-50/60 to-white/60 p-6 shadow-sm'>
          <PremiumCard
            title={'Informasi: Pembangunan Zona Integritas'}
            description={
              'Panduan singkat mengenai konsep dan komponen pembangunan Zona Integritas (ZI) Reformasi Birokrasi.'
            }
          >
            <p className='mb-4 leading-relaxed'>
              Pembangunan zona integritas bukanlah semata tentang kepatuhan pada
              peraturan, tetapi juga sebuah komitmen untuk menciptakan
              lingkungan kerja yang bersih, transparan, dan berintegritas. Pada
              praktiknya, zona integritas merupakan miniatur pelaksanaan
              Reformasi Birokrasi sehingga diharapkan dapat menjadi fondasi bagi
              terwujudnya birokrasi yang anti korupsi, berkinerja tinggi, dan
              pelayanan publik prima.
            </p>

            <p className='mb-4 leading-relaxed'>
              Reformasi birokrasi di BPS bertujuan mewujudkan tata kelola yang
              efektif, efisien, bersih, dan bebas KKN melalui pembangunan Zona
              Integritas (ZI) menuju WBK/WBBM. Upaya ini menghadapi kendala
              berupa penyimpangan aparatur, lemahnya pengawasan, serta belum
              terpenuhinya standar penilaian pada beberapa satker. Karena itu,
              diperlukan pedoman khusus pembangunan ZI di BPS agar reformasi
              birokrasi dapat berjalan lebih terarah dan optimal.
            </p>

            <h2 className='mt-6 mb-2 text-xl font-semibold'>Pengertian Umum</h2>
            <div className='mb-6 rounded-xl border border-slate-100 bg-white p-4 shadow-md'>
              <ol className='list-inside list-decimal space-y-2 text-slate-700'>
                <li>
                  Zona Integritas (ZI) adalah instansi pemerintah yang pimpinan
                  dan jajarannya telah berkomitmen untuk mewujudkan Wilayah
                  Bebas dari Korupsi/Wilayah Birokrasi Bersih dan Melayani
                  melalui reformasi birokrasi.
                </li>
                <li>
                  Wilayah Bebas dari Korupsi (WBK) adalah predikat yang
                  diberikan kepada unit/satuan kerja yang telah berhasil
                  melaksanakan reformasi birokrasi dengan baik.
                </li>
                <li>
                  Wilayah Birokrasi Bersih dan Melayani (WBBM) adalah predikat
                  untuk unit/satuan kerja yang telah melaksanakan reformasi
                  birokrasi dengan sangat baik.
                </li>
                <li>
                  Unit Kerja: serendah-rendahnya eselon II yang menyelenggarakan
                  layanan.
                </li>
                <li>
                  Satker: serendah-rendahnya unit Eselon III yang
                  menyelenggarakan layanan.
                </li>
                <li>
                  Tim Pembinaan Pembangunan ZI: tim yang dibentuk oleh BPS untuk
                  pembinaan dan pendampingan (contoh: Biro Perencanaan untuk
                  BPS).
                </li>
                <li>
                  Tim Penanggung Jawab Kegiatan (PJK) Evaluasi Pembangunan ZI:
                  melakukan koordinasi evaluasi pembangunan ZI (contoh:
                  Inspektorat Wilayah III di BPS).
                </li>
                <li>
                  Tim Penilai Internal (TPI): tim internal yang melakukan
                  evaluasi dan memberikan rekomendasi bagi unit yang sedang
                  membangun ZI.
                </li>
                <li>
                  Tim Penilai Pendahuluan (TPP): ditetapkan pada level provinsi
                  untuk menilai dan merekomendasikan satker sebelum diusulkan ke
                  TPI.
                </li>
                <li>
                  Tim Penilai Mandiri (TPM): tim untuk penilaian mandiri dalam
                  proses memperoleh predikat WBK.
                </li>
                <li>
                  Tim Penilai Nasional (TPN): tim nasional yang terdiri dari
                  kementerian terkait dan instansi pemerintah lain untuk
                  evaluasi ZI.
                </li>
              </ol>
            </div>

            <p className='mb-4'>
              Pembangunan ZI mencakup dua komponen: pengungkit dan hasil.
              Komponen pengungkit fokus pada tata kelola internal, sementara
              komponen hasil menilai dampak yang dirasakan stakeholder.
            </p>

            <h2 className='mt-6 mb-2 text-xl font-semibold'>
              Komponen Pengungkit
            </h2>

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
                <li>Meningkatnya akuntabilitas instansi Pemerintah..</li>
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

        <div className='mb-8 flex flex-col gap-2 rounded-xl border bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6 shadow-lg transition-all duration-300 hover:shadow-xl dark:border-gray-700 dark:bg-gradient-to-br dark:from-blue-900 dark:via-gray-900 dark:to-gray-900'>
          <div className='flex items-center gap-2'>
            <span className='inline-flex items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 p-1 shadow'>
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
            <span className='text-base font-semibold text-gray-700 dark:text-gray-300'>
              Link GDrive Buku Pedoman
            </span>
          </div>
          <a
            href={gdriveLink}
            target='_blank'
            rel='noopener noreferrer'
            className='mt-2 inline-block rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-800 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:from-blue-700 dark:to-blue-800 dark:hover:from-blue-800 dark:hover:to-blue-900 dark:focus:ring-offset-gray-900'
          >
            Buka Folder GDrive
          </a>
          <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
            Folder berisi seluruh dokumen Pedoman RB.
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
