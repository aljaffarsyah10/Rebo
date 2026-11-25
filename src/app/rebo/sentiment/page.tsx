import { getSentimentAnalyticsAction } from '@/actions/sentiment-actions';
import SentimentWordCloudClient from '@/components/rebo/sentiment-wordcloud-client';

export const metadata = {
  title: 'Analisis Sentimen & Word Cloud Kepuasan Konsumen | REBO BPS Sitaro',
  description:
    'Visualisasi analisis kata kunci (word cloud) dan pemetaan sentimen positif, netral, dan masukan pengunjung Pelayanan Statistik Terpadu (PST) BPS Sitaro untuk evaluasi pimpinan dan bukti pemenuhan Reformasi Birokrasi.'
};

export const dynamic = 'force-dynamic';

export default async function SentimentPage() {
  const analyticsRes = await getSentimentAnalyticsAction();

  return <SentimentWordCloudClient initialData={analyticsRes.data} />;
}
