import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Formulir LKE Reformasi Birokrasi | REBO V2',
  description:
    'Pilih area dan pilar evaluasi LKE Reformasi Birokrasi BPS Kabupaten Kepulauan Siau Tagulandang Biaro'
};

/**
 * Rute induk /rebo/formRB mengarahkan pengguna ke halaman pemilihan area evaluasi
 * (/rebo/formRB/area) yang terbagi menjadi Area Pemenuhan dan Area Reform.
 */
export default async function FormRBPage() {
  redirect('/rebo/formRB/area');
}
