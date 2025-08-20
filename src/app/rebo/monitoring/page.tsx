'use client';
import { createClient } from '@/lib/supabase/client';
import ProgressPilar from '@/components/rebo/progress-pilar';
import SkorBoxPilar from '@/components/rebo/skorBox-pilar';
import { ChartContainer } from '@/components/ui/chart';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export default async function MonitoringDashboard() {
  const supabase = await createClient();

  // Ambil semua pilar
  const { data: pilarsData } = await supabase
    .from('pilar')
    .select(
      'id_pilar, nama_pilar, id_area, area (*), subpilar (id_subpilar, pertanyaan (id_pertanyaan, kategoriPenilaian (*), buktiDukung (*)))'
    )
    .order('id_pilar', { ascending: true });

  // Proses data untuk progress dan skor
  const pilarProgress = (pilarsData || []).map((pilar: any) => {
    let totalSkor = 0;
    let totalNilaiMaks = 0;
    let pertanyaanList: any[] = [];
    if (pilar.subpilar && pilar.subpilar.length > 0) {
      for (const subpilar of pilar.subpilar) {
        if (subpilar.pertanyaan && subpilar.pertanyaan.length > 0) {
          for (const p of subpilar.pertanyaan) {
            const kategoriMax = p.kategoriPenilaian?.length
              ? Math.max(...p.kategoriPenilaian.map((k: any) => k.nilai))
              : 0;
            totalNilaiMaks += kategoriMax;
            if (p.buktiDukung && p.buktiDukung.length > 0) {
              totalSkor += p.buktiDukung.reduce(
                (sum: number, b: any) => sum + (b.nilai_akhir || 0),
                0
              );
              for (const b of p.buktiDukung) {
                pertanyaanList.push({
                  id_pertanyaan: p.id_pertanyaan,
                  status_kelengkapan: b.status_kelengkapan
                });
              }
            } else {
              pertanyaanList.push({
                id_pertanyaan: p.id_pertanyaan,
                status_kelengkapan: 0
              });
            }
          }
        }
      }
    }
    return {
      id_pilar: pilar.id_pilar,
      nama_pilar: pilar.nama_pilar,
      totalSkor,
      totalNilaiMaks,
      pertanyaanList,
      area: pilar.area?.nama_area || ''
    };
  });

  // Data untuk chart
  const chartData = pilarProgress.map((p) => ({
    nama_pilar: p.nama_pilar,
    progress:
      p.pertanyaanList.length > 0
        ? Math.round(
            (p.pertanyaanList.filter((q: any) => q.status_kelengkapan === 2)
              .length /
              p.pertanyaanList.length) *
              100
          )
        : 0,
    skor: p.totalSkor,
    nilai_maks: p.totalNilaiMaks
  }));

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      <h1 className='mb-6 text-3xl font-bold'>Dashboard Monitoring</h1>
      <div className='mb-8 grid grid-cols-1 gap-6 md:grid-cols-2'>
        {pilarProgress.map((pilar) => (
          <div
            key={pilar.id_pilar}
            className='rounded-lg border bg-white p-4 dark:bg-gray-900'
          >
            <h2 className='mb-2 text-lg font-semibold'>{pilar.nama_pilar}</h2>
            <div className='flex items-center gap-4'>
              <SkorBoxPilar
                totalSkor={pilar.totalSkor}
                totalNilaiMaks={pilar.totalNilaiMaks}
              />
              <ProgressPilar pertanyaanList={pilar.pertanyaanList} />
            </div>
            <div className='mt-2 text-xs text-gray-500'>{pilar.area}</div>
          </div>
        ))}
      </div>
      <div className='rounded-lg border bg-white p-6 dark:bg-gray-900'>
        <h2 className='mb-4 text-xl font-semibold'>
          Grafik Progress & Skor Pilar
        </h2>
        <ResponsiveContainer width='100%' height={350}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          >
            <XAxis dataKey='nama_pilar' />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey='progress' fill='#3b82f6' name='Progress (%)' />
            <Bar dataKey='skor' fill='#10b981' name='Skor' />
            <Bar dataKey='nilai_maks' fill='#6366f1' name='Nilai Maksimal' />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
