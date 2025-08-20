'use client';

import { useEffect, useState } from 'react';
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

export default function MonitoringDashboard() {
  const [pilarProgress, setPilarProgress] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [totalPertanyaan, setTotalPertanyaan] = useState(0);
  const [totalTerjawab, setTotalTerjawab] = useState(0);
  const [totalProgressPercent, setTotalProgressPercent] = useState(0);
  const [totalSkorAll, setTotalSkorAll] = useState(0);
  const [totalNilaiMaksAllRounded, setTotalNilaiMaksAllRounded] = useState(0);
  const [totalSkorPercent, setTotalSkorPercent] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const supabase = await createClient();
      const { data: pilarsData } = await supabase
        .from('pilar')
        .select(
          'id_pilar, nama_pilar, id_area, area (*), subpilar (id_subpilar, pertanyaan (id_pertanyaan, kategoriPenilaian (*), buktiDukung (*)))'
        )
        .order('id_pilar', { ascending: true });

      const pilarProgressData = (pilarsData || []).map((pilar: any) => {
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

      setPilarProgress(pilarProgressData);

      const chartDataData = pilarProgressData.map((p) => ({
        nama_pilar: p.nama_pilar,
        persentase_terjawab:
          p.pertanyaanList.length > 0
            ? Math.round(
                (p.pertanyaanList.filter(
                  (q: any) =>
                    q.status_kelengkapan === 1 || q.status_kelengkapan === 2
                ).length /
                  p.pertanyaanList.length) *
                  100
              )
            : 0
      }));
      setChartData(chartDataData);

      const totalPertanyaanVal = pilarProgressData.reduce(
        (sum, p) => sum + p.pertanyaanList.length,
        0
      );
      setTotalPertanyaan(totalPertanyaanVal);

      const totalTerjawabVal = pilarProgressData.reduce(
        (sum, p) =>
          sum +
          p.pertanyaanList.filter(
            (q: any) => q.status_kelengkapan === 1 || q.status_kelengkapan === 2
          ).length,
        0
      );
      setTotalTerjawab(totalTerjawabVal);

      setTotalProgressPercent(
        totalPertanyaanVal > 0
          ? Math.round((totalTerjawabVal / totalPertanyaanVal) * 100)
          : 0
      );

      const totalSkorAllVal = pilarProgressData.reduce(
        (sum, p) => sum + p.totalSkor,
        0
      );
      setTotalSkorAll(totalSkorAllVal);

      const totalNilaiMaksAllVal = pilarProgressData.reduce(
        (sum, p) => sum + p.totalNilaiMaks,
        0
      );
      setTotalNilaiMaksAllRounded(Math.round(totalNilaiMaksAllVal));

      setTotalSkorPercent(
        Math.round(
          totalNilaiMaksAllVal > 0
            ? (totalSkorAllVal / totalNilaiMaksAllVal) * 100
            : 0
        )
      );
    };
    fetchData();
  }, []);

  return (
    <div className='container mx-auto max-w-6xl p-6'>
      <h1 className='mb-6 text-3xl font-bold'>Dashboard Monitoring</h1>
      <div className='mb-6 grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='flex flex-col items-center justify-center rounded-lg border bg-white p-4 dark:bg-gray-900'>
          <div className='mb-1 text-xs text-gray-500'>
            Total Progress (Pertanyaan Terjawab / Seluruh Pertanyaan)
          </div>
          <div className='text-2xl font-bold text-blue-600 dark:text-blue-400'>
            {totalTerjawab} / {totalPertanyaan}
          </div>
          <div className='mt-1 text-sm font-semibold text-blue-500 dark:text-blue-300'>
            {totalProgressPercent}%
          </div>
        </div>
        <div className='flex flex-col items-center justify-center rounded-lg border bg-white p-4 dark:bg-gray-900'>
          <div className='mb-1 text-xs text-gray-500'>
            Total Skor Seluruh Pilar
          </div>
          <div className='text-2xl font-bold text-green-600 dark:text-green-400'>
            {totalSkorAll} / {totalNilaiMaksAllRounded}
          </div>
          <div className='mt-1 text-sm font-semibold text-green-500 dark:text-green-300'>
            {totalSkorPercent}%
          </div>
        </div>
      </div>
      <div className='mb-8 rounded-lg border bg-white p-6 dark:bg-gray-900'>
        <h2 className='mb-4 text-xl font-semibold'>
          Grafik Persentase Pertanyaan Terjawab per Pilar
        </h2>
        <ResponsiveContainer width='100%' height={450}>
          <BarChart
            data={chartData}
            layout='vertical'
            margin={{ top: 20, right: 30, left: 80, bottom: 5 }}
            barCategoryGap={30}
          >
            <XAxis
              type='number'
              domain={[0, 100]}
              allowDecimals={false}
              label={{
                value: 'Persentase Terjawab (%)',
                position: 'insideBottomRight',
                offset: -5
              }}
            />
            <YAxis
              type='category'
              dataKey='nama_pilar'
              width={120}
              tick={{ fontSize: 10 }}
            />
            <Tooltip />
            <Legend />
            <Bar
              dataKey='persentase_terjawab'
              fill='#3b82f6'
              name='Persentase Terjawab (%)'
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className='overflow-x-auto rounded-lg border bg-white p-4 dark:bg-gray-900'>
        <table className='min-w-full divide-y divide-gray-200 dark:divide-gray-700'>
          <thead className='bg-gray-50 dark:bg-gray-800'>
            <tr>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200'>
                No.
              </th>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200'>
                Nama Pilar
              </th>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200'>
                Area
              </th>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200'>
                Progress
              </th>
              <th className='px-4 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200'>
                Skor
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900'>
            {pilarProgress.map((pilar, idx) => {
              const progressPercent =
                pilar.pertanyaanList.length > 0
                  ? Math.round(
                      (pilar.pertanyaanList.filter(
                        (q: any) => q.status_kelengkapan === 2
                      ).length /
                        pilar.pertanyaanList.length) *
                        100
                    )
                  : 0;
              return (
                <tr key={pilar.id_pilar}>
                  <td className='px-4 py-2'>{idx + 1}</td>
                  <td className='px-4 py-2 font-medium'>{pilar.nama_pilar}</td>
                  <td className='px-4 py-2'>{pilar.area}</td>
                  <td className='px-4 py-2'>
                    <div className='flex items-center gap-2'>
                      <ProgressPilar pertanyaanList={pilar.pertanyaanList} />
                      <span className='text-xs text-gray-500'>
                        {progressPercent}%
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-2'>
                    <SkorBoxPilar
                      totalSkor={pilar.totalSkor}
                      totalNilaiMaks={pilar.totalNilaiMaks}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
