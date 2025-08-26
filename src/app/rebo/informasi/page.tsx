import Link from 'next/link';

export const metadata = {
  title: 'Informasi Zona Integritas'
};

export default function InformasiPage() {
  return (
    <div className='container mx-auto max-w-4xl py-10'>
      <Link href='/rebo/overview' className='text-sm text-blue-600 underline'>
        &larr; Kembali
      </Link>

      <h1 className='mt-4 mb-4 text-2xl font-bold'>
        Informasi: Pembangunan Zona Integritas
      </h1>

      <p className='mb-4 leading-relaxed'>
        Pembangunan zona integritas bukanlah semata tentang kepatuhan pada
        peraturan, tetapi juga sebuah komitmen untuk menciptakan lingkungan
        kerja yang bersih, transparan, dan berintegritas. Pada praktiknya, zona
        integritas merupakan miniatur pelaksanaan Reformasi Birokrasi sehingga
        diharapkan dapat menjadi fondasi bagi terwujudnya birokrasi yang anti
        korupsi, berkinerja tinggi, dan pelayanan publik prima.
      </p>

      <p className='mb-4 leading-relaxed'>
        Reformasi birokrasi di BPS bertujuan mewujudkan tata kelola yang
        efektif, efisien, bersih, dan bebas KKN melalui pembangunan Zona
        Integritas (ZI) menuju WBK/WBBM. Upaya ini menghadapi kendala berupa
        penyimpangan aparatur, lemahnya pengawasan, serta belum terpenuhinya
        standar penilaian pada beberapa satker. Karena itu, diperlukan pedoman
        khusus pembangunan ZI di BPS agar reformasi birokrasi dapat berjalan
        lebih terarah dan optimal.
      </p>

      <h2 className='mt-6 mb-2 text-xl font-semibold'>Pengertian Umum</h2>
      <ol className='mb-4 list-inside list-decimal space-y-2'>
        <li>
          Zona Integritas (ZI) adalah instansi pemerintah yang pimpinan dan
          jajarannya telah berkomitmen untuk mewujudkan Wilayah Bebas dari
          Korupsi/Wilayah Birokrasi Bersih dan Melayani melalui reformasi
          birokrasi.
        </li>
        <li>
          Wilayah Bebas dari Korupsi (WBK) adalah predikat yang diberikan kepada
          unit/satuan kerja yang telah berhasil melaksanakan reformasi birokrasi
          dengan baik.
        </li>
        <li>
          Wilayah Birokrasi Bersih dan Melayani (WBBM) adalah predikat untuk
          unit/satuan kerja yang telah melaksanakan reformasi birokrasi dengan
          sangat baik.
        </li>
        <li>
          Unit Kerja: serendah-rendahnya eselon II yang menyelenggarakan
          layanan.
        </li>
        <li>
          Satker: serendah-rendahnya unit Eselon III yang menyelenggarakan
          layanan.
        </li>
        <li>
          Tim Pembinaan Pembangunan ZI: tim yang dibentuk oleh BPS untuk
          pembinaan dan pendampingan (contoh: Biro Perencanaan untuk BPS).
        </li>
        <li>
          Tim Penanggung Jawab Kegiatan (PJK) Evaluasi Pembangunan ZI: melakukan
          koordinasi evaluasi pembangunan ZI (contoh: Inspektorat Wilayah III di
          BPS).
        </li>
        <li>
          Tim Penilai Internal (TPI): tim internal yang melakukan evaluasi dan
          memberikan rekomendasi bagi unit yang sedang membangun ZI.
        </li>
        <li>
          Tim Penilai Pendahuluan (TPP): ditetapkan pada level provinsi untuk
          menilai dan merekomendasikan satker sebelum diusulkan ke TPI.
        </li>
        <li>
          Tim Penilai Mandiri (TPM): tim untuk penilaian mandiri dalam proses
          memperoleh predikat WBK.
        </li>
        <li>
          Tim Penilai Nasional (TPN): tim nasional yang terdiri dari kementerian
          terkait dan instansi pemerintah lain untuk evaluasi ZI.
        </li>
      </ol>

      <p className='mb-4'>
        Pembangunan ZI mencakup dua komponen: pengungkit dan hasil. Komponen
        pengungkit fokus pada tata kelola internal, sementara komponen hasil
        menilai dampak yang dirasakan stakeholder.
      </p>

      <h2 className='mt-6 mb-2 text-xl font-semibold'>Komponen Pengungkit</h2>

      <section className='mb-4'>
        <h3 className='mt-2 mb-1 text-lg font-medium'>
          1. Manajemen Perubahan
        </h3>
        <p className='mb-1'>
          Tujuan: Mentransformasi sistem, mekanisme, mindset, dan budaya kerja
          ASN menjadi adaptif dan berintegritas.
        </p>
        <ul className='ml-4 list-inside list-disc'>
          <li>Perubahan pola pikir dan budaya kerja menuju WBK/WBBM.</li>
          <li>Menurunkan risiko kegagalan akibat resistensi perubahan.</li>
          <li>Terimplementasinya Core Value ASN Berakhlak.</li>
        </ul>
      </section>

      <section className='mb-4'>
        <h3 className='mt-2 mb-1 text-lg font-medium'>
          2. Penataan Tatalaksana
        </h3>
        <p className='mb-1'>
          Tujuan: Meningkatkan efisiensi dan efektivitas sistem, proses, dan
          prosedur kerja.
        </p>
        <ul className='ml-4 list-inside list-disc'>
          <li>Meningkatkan penggunaan TI dalam manajemen unit.</li>
          <li>Meningkatkan efisiensi proses manajemen.</li>
          <li>Meningkatkan kinerja unit kerja.</li>
        </ul>
      </section>

      <section className='mb-4'>
        <h3 className='mt-2 mb-1 text-lg font-medium'>
          3. Penataan Sistem Manajemen SDM Aparatur
        </h3>
        <p className='mb-1'>
          Tujuan: Meningkatkan profesionalisme dan tata kelola SDM aparatur.
        </p>
        <ul className='ml-4 list-inside list-disc'>
          <li>Meningkatnya ketaatan dalam pengelolaan SDM.</li>
          <li>Meningkatnya transparansi dan akuntabilitas manajemen SDM.</li>
          <li>Meningkatnya disiplin dan efektivitas manajemen SDM.</li>
        </ul>
      </section>

      <section className='mb-4'>
        <h3 className='mt-2 mb-1 text-lg font-medium'>
          4. Penguatan Akuntabilitas
        </h3>
        <p className='mb-1'>
          Tujuan: Meningkatkan kapasitas dan akuntabilitas kinerja instansi
          pemerintah.
        </p>
      </section>

      <section className='mb-4'>
        <h3 className='mt-2 mb-1 text-lg font-medium'>
          5. Penguatan Pengawasan
        </h3>
        <p className='mb-1'>
          Tujuan: Meningkatkan penyelenggaraan pemerintahan yang bersih dan
          bebas KKN.
        </p>
        <ul className='ml-4 list-inside list-disc'>
          <li>Meningkatnya kepatuhan pengelolaan keuangan negara.</li>
          <li>Menurunnya tingkat penyalahgunaan wewenang.</li>
          <li>Meningkatkan sistem integritas untuk pencegahan KKN.</li>
        </ul>
      </section>

      <section className='mb-8'>
        <h3 className='mt-2 mb-1 text-lg font-medium'>
          6. Peningkatan Kualitas Pelayanan Publik
        </h3>
        <p className='mb-1'>
          Tujuan: Meningkatkan kualitas dan inovasi pelayanan publik sesuai
          kebutuhan masyarakat.
        </p>
        <ul className='ml-4 list-inside list-disc'>
          <li>
            Meningkatnya kualitas pelayanan publik (cepat, murah, aman, mudah
            dijangkau).
          </li>
          <li>
            Meningkatnya jumlah unit pelayanan yang memperoleh standardisasi.
          </li>
          <li>Meningkatnya indeks kepuasan masyarakat.</li>
        </ul>
      </section>
    </div>
  );
}
