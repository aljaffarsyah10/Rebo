import { getCurrentUserSession } from '@/lib/auth/session';
import { canEditBukti, canVerifyBukti, getPilarInfo } from '@/lib/auth/rbac';
import {
  getActivePeriode,
  fetchSubpilarWithPertanyaan,
  fetchBuktiByPertanyaanIds
} from '@/lib/api/rebo';
import FormRBPilarClient from './FormRBPilarClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: {
  params: Promise<{ pilarId: string }>;
}) {
  const { pilarId } = await props.params;
  const pilarInfo = getPilarInfo(pilarId);
  return {
    title: `Pilar ${pilarId}: ${pilarInfo?.nama || 'Form LKE'} | REBO V2`,
    description: `Pengisian bukti dukung dan penilaian mandiri Pilar ${pilarId} LKE Reformasi Birokrasi BPS Sitaro`
  };
}

type PageProps = { params: Promise<{ pilarId: string }> };

export default async function Page(props: PageProps) {
  const { pilarId } = await props.params;

  // 1. Ambil sesi pengguna saat ini
  const session = await getCurrentUserSession();
  const pilarInfo = getPilarInfo(pilarId);

  // 2. Tentukan wewenang hak akses (RBAC)
  const canEdit = canEditBukti(session.role, session.assignedPilarId, pilarId);
  const canVerify = canVerifyBukti(
    session.role,
    session.assignedPilarId,
    pilarId
  );

  // 3. Dapatkan periode evaluasi aktif
  const activePeriode = await getActivePeriode();

  // 4. Fetch data subpilar dan pertanyaan
  let subpilarData: any[] = [];
  try {
    subpilarData = await fetchSubpilarWithPertanyaan(pilarId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[PilarFormPage] Error fetching subpilar:', err);
  }

  // 5. Fetch bukti dukung awal
  const pertanyaanIds = subpilarData.flatMap(
    (s: any) => s.pertanyaan?.map((p: any) => p.id_pertanyaan) || []
  );

  let initialBuktiList: any[] = [];
  if (pertanyaanIds.length > 0) {
    try {
      initialBuktiList = await fetchBuktiByPertanyaanIds(
        pertanyaanIds,
        activePeriode?.id
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[PilarFormPage] Error fetching initial bukti:', err);
    }
  }

  const initialBuktiMap: Record<string, any> = {};
  initialBuktiList.forEach((b: any) => {
    if (b && b.id_pertanyaan) {
      initialBuktiMap[b.id_pertanyaan] = b;
    }
  });

  return (
    <FormRBPilarClient
      pilarId={pilarId}
      pilarInfo={pilarInfo}
      session={session}
      canEdit={canEdit}
      canVerify={canVerify}
      activePeriode={activePeriode}
      initialSubpilar={subpilarData}
      initialBuktiMap={initialBuktiMap}
    />
  );
}
