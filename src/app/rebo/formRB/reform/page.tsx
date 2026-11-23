import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  ChevronRight,
  Layers,
  Award,
  CheckCircle2,
  AlertCircle,
  LayoutGrid
} from 'lucide-react';
import Link from 'next/link';
import SkorBoxPilar from '@/components/rebo/skorBox-pilar';
import ProgressPilar from '@/components/rebo/progress-pilar';

export default async function ReformPage() {
  const supabase = await createClient();

  const { data: pilarsData, error } = await supabase
    .from('pilar')
    .select(
      `
      *,
      area (*)
    `
    )
    .order('id_pilar', { ascending: true });

  // Filter hanya untuk Area 2 (Reform)
  const pilarsArea2 = pilarsData?.filter((pilar) => pilar.id_area === 2) || [];

  // Ambil totalSkor dan totalNilaiMaks dengan join pilar -> subpilar -> pertanyaan -> buktiDukung
  for (const pilar of pilarsArea2) {
    const { data: subpilarData } = await supabase
      .from('subpilar')
      .select(
        'id_subpilar, id_pilar, pertanyaan (id_pertanyaan, kategoriPenilaian (*), buktiDukung (*))'
      )
      .eq('id_pilar', pilar.id_pilar);

    let totalSkor = 0;
    let totalNilaiMaks = 0;
    const pertanyaanList: any[] = [];

    if (subpilarData && subpilarData.length > 0) {
      for (const subpilar of subpilarData) {
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
    pilar.totalSkor = totalSkor;
    pilar.totalNilaiMaks = totalNilaiMaks;
    pilar.pertanyaanList = pertanyaanList;
  }

  // Hitung metrik ringkasan keseluruhan Area 2
  const areaTotalSkor = pilarsArea2.reduce(
    (sum, p) => sum + (p.totalSkor || 0),
    0
  );
  const areaTotalMaks = pilarsArea2.reduce(
    (sum, p) => sum + (p.totalNilaiMaks || 0),
    0
  );
  const totalPertanyaanArea = pilarsArea2.reduce(
    (sum, p) => sum + (p.pertanyaanList?.length || 0),
    0
  );
  const lengkapPertanyaanArea = pilarsArea2.reduce(
    (sum, p) =>
      sum +
      (p.pertanyaanList?.filter((q: any) => q.status_kelengkapan === 2)
        ?.length || 0),
    0
  );
  const areaPercent =
    totalPertanyaanArea > 0
      ? Math.round((lengkapPertanyaanArea / totalPertanyaanArea) * 100)
      : 0;

  if (error) {
    return (
      <div className='mx-auto max-w-5xl p-6'>
        <div className='flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50/70 p-6 dark:border-rose-900/60 dark:bg-rose-950/20'>
          <AlertCircle className='h-6 w-6 text-rose-600 dark:text-rose-400' />
          <div>
            <h3 className='text-sm font-bold text-rose-900 dark:text-rose-200'>
              Gagal Memuat Data Pilar
            </h3>
            <p className='text-xs text-rose-700 dark:text-rose-300'>
              {error.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mx-auto max-w-7xl space-y-6 p-4 md:p-6'>
      {/* Breadcrumb & Navigation Bar Sistematis */}
      <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400'>
          <Link
            href='/rebo/overview'
            className='transition-colors hover:text-purple-600 dark:hover:text-purple-400'
          >
            Beranda
          </Link>
          <ChevronRight className='h-3.5 w-3.5' />
          <Link
            href='/rebo/formRB/area'
            className='transition-colors hover:text-purple-600 dark:hover:text-purple-400'
          >
            Area RB
          </Link>
          <ChevronRight className='h-3.5 w-3.5' />
          <span className='font-semibold text-slate-800 dark:text-slate-200'>
            Pilar Reform
          </span>
        </div>

        {/* Quick Area Switcher Tabs */}
        <div className='inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100/70 p-1 dark:border-slate-800 dark:bg-slate-900/60'>
          <Link href='/rebo/formRB/pemenuhan'>
            <Button
              size='sm'
              variant='ghost'
              className='h-7 px-3 text-xs text-slate-600 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-300'
            >
              Area 1: Pemenuhan
            </Button>
          </Link>
          <Button
            size='sm'
            variant='ghost'
            className='h-7 bg-white px-3 text-xs font-bold text-purple-700 shadow-2xs dark:bg-slate-800 dark:text-purple-300'
          >
            Area 2: Reform
          </Button>
          <Link href='/rebo/formRB/area'>
            <Button
              size='sm'
              variant='ghost'
              className='h-7 px-2.5 text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            >
              <LayoutGrid className='h-3.5 w-3.5' />
            </Button>
          </Link>
        </div>
      </div>

      {/* Header Section dengan Aksen Lembut & Soft (Purple Palette) */}
      <div className='relative overflow-hidden rounded-3xl border border-purple-200/60 bg-gradient-to-br from-purple-50/90 via-indigo-50/40 to-white p-6 shadow-xs md:p-8 dark:border-slate-800 dark:from-slate-900/90 dark:via-purple-950/20 dark:to-slate-900'>
        <div className='relative z-10 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div className='space-y-2'>
            <div className='flex items-center space-x-2'>
              <Badge className='border-purple-200 bg-purple-100/80 px-2.5 py-0.5 text-xs font-semibold text-purple-800 dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-300'>
                Area 2 &bull; Komponen Pengungkit
              </Badge>
              <span className='text-xs text-slate-500 dark:text-slate-400'>
                Bobot Aspek: Reformasi
              </span>
            </div>

            <h1 className='text-2xl font-black tracking-tight text-slate-900 md:text-3xl dark:text-slate-100'>
              Pilar Reformasi Birokrasi (Area Reform)
            </h1>

            <p className='max-w-2xl text-xs leading-relaxed text-slate-600 md:text-sm dark:text-slate-300'>
              Peningkatan kualitas implementasi, inovasi tata kelola, dan
              transformasi berkelanjutan pada 6 pilar Zona Integritas menuju
              predikat Wilayah Bebas dari Korupsi (WBK) &amp; WBBM.
            </p>
          </div>

          <div className='flex shrink-0 items-center gap-2'>
            <Link href='/rebo/monitoring'>
              <Button
                variant='outline'
                size='sm'
                className='h-9 border-purple-200 bg-white/80 text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:border-slate-700 dark:bg-slate-800 dark:text-purple-300'
              >
                Lihat Monitoring Capaian
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Metric Summary Banner */}
        <div className='mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3'>
          <div className='rounded-xl border border-purple-200/60 bg-white/70 p-3.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='flex items-center space-x-2 text-purple-600 dark:text-purple-400'>
              <Layers className='h-4 w-4' />
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Total Pilar
              </span>
            </div>
            <p className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              {pilarsArea2.length} Pilar Reformasi
            </p>
            <p className='text-[11px] text-slate-500 dark:text-slate-400'>
              Pilar 1 s.d. Pilar 6 (Reform)
            </p>
          </div>

          <div className='rounded-xl border border-amber-200/60 bg-white/70 p-3.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='flex items-center space-x-2 text-amber-600 dark:text-amber-400'>
              <Award className='h-4 w-4' />
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Skor Akumulasi Area
              </span>
            </div>
            <p className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              {areaTotalSkor.toFixed(2)}{' '}
              <span className='text-xs font-normal text-slate-500 dark:text-slate-400'>
                / {areaTotalMaks.toFixed(2)}
              </span>
            </p>
            <p className='text-[11px] text-slate-500 dark:text-slate-400'>
              Klaim Nilai Berjalan
            </p>
          </div>

          <div className='rounded-xl border border-emerald-200/60 bg-white/70 p-3.5 backdrop-blur-xs dark:border-slate-800 dark:bg-slate-800/40'>
            <div className='flex items-center space-x-2 text-emerald-600 dark:text-emerald-400'>
              <CheckCircle2 className='h-4 w-4' />
              <span className='text-[10px] font-bold tracking-wider text-slate-500 uppercase dark:text-slate-400'>
                Rata-Rata Kelengkapan
              </span>
            </div>
            <p className='mt-1 text-lg font-bold text-slate-900 dark:text-slate-100'>
              {areaPercent}% Lengkap
            </p>
            <p className='text-[11px] text-slate-500 dark:text-slate-400'>
              {lengkapPertanyaanArea} dari {totalPertanyaanArea} pertanyaan
            </p>
          </div>
        </div>
      </div>

      {/* Daftar Pilar Reformasi (Card Memanjang / Baris List Sistematis) */}
      <div className='space-y-3.5'>
        <div className='flex items-center justify-between'>
          <h2 className='text-lg font-bold tracking-tight text-slate-900 dark:text-slate-100'>
            Daftar Pilar Area Reformasi
          </h2>
          <span className='text-xs text-slate-500 dark:text-slate-400'>
            Pilih pilar untuk mengunggah dan memverifikasi bukti dukung
          </span>
        </div>

        {pilarsArea2.length > 0 ? (
          <div className='space-y-3'>
            {pilarsArea2.map((pilar: any, index: number) => {
              const displayPilarNum = index + 1;
              return (
                <div
                  key={`area2-${pilar.id_pilar}`}
                  className='group rounded-2xl border border-slate-200/80 bg-white/95 p-3.5 shadow-2xs transition-all duration-200 hover:border-purple-400 hover:shadow-xs sm:p-4 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-purple-700'
                >
                  <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                    {/* Kolom Kiri: Nomor Pilar, Nama & Deskripsi */}
                    <div className='flex min-w-0 flex-1 items-center gap-3.5'>
                      <span className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100/90 font-black text-purple-700 shadow-2xs dark:bg-purple-900/50 dark:text-purple-300'>
                        {displayPilarNum}
                      </span>
                      <div className='min-w-0 flex-1'>
                        <div className='flex flex-wrap items-center gap-2'>
                          <h3 className='truncate text-sm font-bold text-slate-800 dark:text-slate-100'>
                            {pilar.nama_pilar}
                          </h3>
                          <Badge
                            variant='outline'
                            className='border-purple-200/80 bg-purple-50/60 py-0 text-[10px] text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-300'
                          >
                            Pilar {displayPilarNum}
                          </Badge>
                        </div>
                        <p className='mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400'>
                          {pilar.deskripsi_pilar ||
                            'Pelaksanaan inovasi dan penguatan kualitas implementasi reformasi birokrasi.'}
                        </p>
                      </div>
                    </div>

                    {/* Kolom Kanan: Skor Box (h-11), Progress (h-11), Button Detail (h-11) */}
                    <div className='flex shrink-0 flex-wrap items-center gap-3 border-t border-slate-100 pt-2 sm:flex-nowrap lg:border-t-0 lg:pt-0 dark:border-slate-800/60'>
                      {/* Skor Box dengan ukuran lebar & tinggi baku tetap */}
                      <div className='w-full shrink-0 sm:w-56'>
                        <SkorBoxPilar
                          totalSkor={pilar.totalSkor || 0}
                          totalNilaiMaks={pilar.totalNilaiMaks || 0}
                        />
                      </div>

                      {/* Progress Kelengkapan dengan ukuran lebar & tinggi baku tetap */}
                      <div className='w-full shrink-0 sm:w-48'>
                        <ProgressPilar
                          pertanyaanList={pilar.pertanyaanList || []}
                        />
                      </div>

                      {/* Tombol Aksi Detail dengan tinggi h-11 seragam */}
                      <div className='w-full shrink-0 sm:w-28'>
                        <Link
                          href={`/rebo/formRB/${pilar.id_pilar}`}
                          className='block w-full'
                        >
                          <Button
                            variant='outline'
                            size='sm'
                            className='group/btn h-11 w-full cursor-pointer justify-center border-purple-200/80 bg-purple-50/40 px-3 text-xs font-semibold text-purple-700 transition-all hover:border-purple-300 hover:bg-purple-100/60 dark:border-purple-900/60 dark:bg-purple-950/20 dark:text-purple-300 dark:hover:bg-purple-900/40'
                          >
                            <span>Detail</span>
                            <ChevronRight className='ml-1 h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5' />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className='rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-800'>
            <FileText className='mx-auto h-8 w-8 text-slate-400' />
            <p className='mt-2 text-sm text-slate-500 dark:text-slate-400'>
              Tidak ada pilar reformasi tersedia.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
