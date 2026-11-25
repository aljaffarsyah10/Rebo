import { getPSTQRConfigAction } from '@/actions/pst-actions';
import PSTQRCodeGeneratorClient from '@/components/rebo/pst-qrcode-generator-client';

export const metadata = {
  title: 'Generator QR Code Meja Layanan PST | REBO BPS Sitaro',
  description:
    'Pembuat QR Code siap cetak berdesain resmi BPS untuk diletakkan di ruang resepsionis dan meja Pelayanan Statistik Terpadu (PST) agar pengunjung dapat langsung memindai survei kepuasan IKM/IPAK, WBS, dan layanan Si-Datu.'
};

export const dynamic = 'force-dynamic';

export default async function PSTQRCodePage() {
  const qrRes = await getPSTQRConfigAction();

  return <PSTQRCodeGeneratorClient initialConfig={qrRes.data} />;
}
