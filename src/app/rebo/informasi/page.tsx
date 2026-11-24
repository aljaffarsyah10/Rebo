import PageContainer from '@/components/layout/page-container';
import InformasiRBClient from '@/components/rebo/informasi-rb-client';
import { createClient } from '@/lib/supabase/server';
import {
  DEFAULT_AREAS_DATA,
  DEFAULT_PILAR_HASIL_DATA
} from '@/constants/rb-structure-default';
import { getMatriksRisikoListAction } from '@/actions/spip-actions';
import type { MatriksRisikoItem } from '@/types/rebo';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Informasi & Struktur Hierarki Zona Integritas'
};

export default async function InformasiPage() {
  const gdriveLink =
    'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing';

  let areasData: any[] = [];
  let pilarHasilData: any[] = [];
  let matriksRisikoList: MatriksRisikoItem[] = [];

  try {
    const supabase = await createClient();
    const [areasRes, pilarHasilRes, spipRes] = await Promise.all([
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
        .order('id_pilarHasil', { ascending: true }),
      getMatriksRisikoListAction()
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
    if (spipRes.success && spipRes.data) {
      matriksRisikoList = spipRes.data;
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error fetching RB structure for Informasi page:', err);
    areasData = DEFAULT_AREAS_DATA;
    pilarHasilData = DEFAULT_PILAR_HASIL_DATA;
  }

  return (
    <PageContainer>
      <div className='container mx-auto max-w-7xl space-y-6 py-6'>
        <InformasiRBClient
          areasData={areasData}
          pilarHasilData={pilarHasilData}
          gdriveLink={gdriveLink}
          matriksRisikoList={matriksRisikoList}
        />
      </div>
    </PageContainer>
  );
}
