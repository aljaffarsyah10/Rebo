'use client';

import React, { useState, useTransition } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Award,
  UserCheck,
  Calendar,
  Clock,
  Sparkles,
  Edit,
  Building2,
  BookOpen,
  Check,
  Download,
  AlertCircle
} from 'lucide-react';

import {
  DisiplinASNSummary,
  CatatanDisiplinItem,
  KategoriDisiplin,
  KATEGORI_DISIPLIN_LABELS,
  validateDisiplinNihil
} from '@/lib/compliance/disiplin-types';

import {
  getDisiplinSummaryAction,
  saveDisiplinSummaryAction,
  addCatatanPembinaanAction
} from '@/actions/disiplin-actions';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';

interface DisiplinComplianceClientProps {
  initialSummary: DisiplinASNSummary;
  initialCatatan: CatatanDisiplinItem[];
  initialValidation: { isEligibleWBK: boolean; alasan: string };
}

export default function DisiplinComplianceClient({
  initialSummary,
  initialCatatan,
  initialValidation
}: DisiplinComplianceClientProps) {
  const [summary, setSummary] = useState<DisiplinASNSummary>(initialSummary);
  const [catatanList, setCatatanList] =
    useState<CatatanDisiplinItem[]>(initialCatatan);
  const [validation, setValidation] = useState(initialValidation);

  // Filters
  const [selectedKategori, setSelectedKategori] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dialog States
  const [isAddCatatanOpen, setIsAddCatatanOpen] = useState<boolean>(false);
  const [isEditSKOpen, setIsEditSKOpen] = useState<boolean>(false);
  const [isPrintSKOpen, setIsPrintSKOpen] = useState<boolean>(false);

  // Transitions
  const [isPending, startTransition] = useTransition();

  // Form State: Add Catatan
  const [addForm, setAddForm] = useState<{
    kategori: KategoriDisiplin;
    tanggal: string;
    judul: string;
    deskripsi: string;
    tindak_lanjut: string;
    nomor_dokumen: string;
    lampiran_url: string;
  }>({
    kategori: 'PEMBINAAN_APEL',
    tanggal: new Date().toISOString().split('T')[0],
    judul: '',
    deskripsi: '',
    tindak_lanjut: '',
    nomor_dokumen: '',
    lampiran_url: ''
  });

  // Form State: Edit SK
  const [editForm, setEditForm] = useState<Partial<DisiplinASNSummary>>({
    nomor_surat_keterangan_nihil: summary.nomor_surat_keterangan_nihil,
    tanggal_surat_keterangan: summary.tanggal_surat_keterangan,
    pejabat_penandatangan: summary.pejabat_penandatangan,
    jabatan_penandatangan: summary.jabatan_penandatangan,
    nip_penandatangan: summary.nip_penandatangan,
    catatan_audit: summary.catatan_audit,
    persentase_kepatuhan_presensi: summary.persentase_kepatuhan_presensi
  });

  // Filtered Catatan
  const filteredCatatan = catatanList.filter((item) => {
    const matchCategory =
      selectedKategori === 'ALL' || item.kategori === selectedKategori;
    const matchSearch =
      searchQuery === '' ||
      item.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.deskripsi.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.nomor_dokumen.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Action: Refresh
  const handleRefresh = () => {
    startTransition(async () => {
      const res = await getDisiplinSummaryAction(summary.tahun);
      if (res.success) {
        setSummary(res.summary);
        setCatatanList(res.catatan);
        setValidation(res.validation);
        toast.success('Data kepatuhan disiplin berhasil dimutakhirkan');
      } else {
        toast.error('Gagal memuat data: ' + (res.error || 'Terjadi kesalahan'));
      }
    });
  };

  // Action: Submit Add Catatan
  const handleAddCatatanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.judul.trim()) {
      toast.error('Judul kegiatan wajib diisi');
      return;
    }
    if (!addForm.nomor_dokumen.trim()) {
      toast.error('Nomor dokumen/surat wajib diisi');
      return;
    }

    startTransition(async () => {
      const res = await addCatatanPembinaanAction(addForm);
      if (res.success && res.catatan) {
        setCatatanList(res.catatan);
        toast.success('Kegiatan pembinaan disiplin berhasil ditambahkan');
        setIsAddCatatanOpen(false);
        setAddForm({
          kategori: 'PEMBINAAN_APEL',
          tanggal: new Date().toISOString().split('T')[0],
          judul: '',
          deskripsi: '',
          tindak_lanjut: '',
          nomor_dokumen: '',
          lampiran_url: ''
        });
      } else {
        toast.error(res.error || 'Gagal menambahkan kegiatan');
      }
    });
  };

  // Action: Submit Edit SK
  const handleEditSKSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveDisiplinSummaryAction(editForm);
      if (res.success && res.summary) {
        setSummary(res.summary);
        const val = validateDisiplinNihil(res.summary);
        setValidation(val);
        toast.success('Informasi Surat Keterangan berhasil disimpan');
        setIsEditSKOpen(false);
      } else {
        toast.error(res.error || 'Gagal menyimpan data SK');
      }
    });
  };

  return (
    <div className='space-y-6'>
      {/* 1. Header & Actions */}
      <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <Badge
              variant='outline'
              className='border-emerald-500/40 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
            >
              <Award className='mr-1 h-3 w-3' />
              Pilar 3 &amp; 5 ZI WBK/WBBM
            </Badge>
            <Badge
              variant='outline'
              className='text-muted-foreground font-mono text-xs'
            >
              PP No. 94 / 2021
            </Badge>
          </div>
          <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-100'>
            Matriks Kepatuhan Disiplin &amp; Kode Etik ASN
          </h1>
          <p className='text-muted-foreground mt-1 text-sm'>
            Perekaman bukti dukung nihil hukuman disiplin sedang/berat BPS
            Kabupaten Kepulauan Sitaro sebagai syarat mutlak kelolosan predikat
            WBK.
          </p>
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            variant='outline'
            size='sm'
            onClick={handleRefresh}
            disabled={isPending}
            className='h-9'
          >
            <RefreshCw
              className={`mr-1.5 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              setEditForm({
                nomor_surat_keterangan_nihil:
                  summary.nomor_surat_keterangan_nihil,
                tanggal_surat_keterangan: summary.tanggal_surat_keterangan,
                pejabat_penandatangan: summary.pejabat_penandatangan,
                jabatan_penandatangan: summary.jabatan_penandatangan,
                nip_penandatangan: summary.nip_penandatangan,
                catatan_audit: summary.catatan_audit,
                persentase_kepatuhan_presensi:
                  summary.persentase_kepatuhan_presensi
              });
              setIsEditSKOpen(true);
            }}
            className='h-9'
          >
            <Edit className='mr-1.5 h-3.5 w-3.5' />
            Edit Info SK
          </Button>

          <Button
            variant='outline'
            size='sm'
            onClick={() => setIsPrintSKOpen(true)}
            className='h-9 border-blue-600/30 text-blue-700 hover:bg-blue-50 dark:border-blue-500/40 dark:text-blue-300 dark:hover:bg-blue-950/40'
          >
            <Printer className='mr-1.5 h-3.5 w-3.5' />
            Cetak SK Bebas Hukdis A4
          </Button>

          <Button
            size='sm'
            onClick={() => setIsAddCatatanOpen(true)}
            className='h-9 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700'
          >
            <Plus className='mr-1.5 h-3.5 w-3.5' />
            Tambah Pembinaan
          </Button>
        </div>
      </div>

      {/* 2. Banner Status Syarat Mutlak WBK */}
      {validation.isEligibleWBK ? (
        <div className='relative overflow-hidden rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-teal-500/10 p-5 shadow-sm dark:border-emerald-500/30 dark:from-emerald-950/40 dark:via-emerald-950/20 dark:to-teal-950/30'>
          <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
            <div className='flex items-start gap-4'>
              <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md dark:bg-emerald-500'>
                <ShieldCheck className='h-7 w-7' />
              </div>
              <div className='space-y-1'>
                <div className='flex flex-wrap items-center gap-2'>
                  <Badge className='bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-500'>
                    <CheckCircle2 className='mr-1 h-3.5 w-3.5' />
                    Syarat Mutlak WBK Terpenuhi (Threshold Gatekeeper Passed)
                  </Badge>
                  <span className='font-mono text-xs text-emerald-800 dark:text-emerald-300'>
                    PP No. 94 / 2021 &amp; PermenPAN-RB No. 90 / 2021
                  </span>
                </div>
                <h3 className='text-lg font-bold text-slate-900 dark:text-slate-100'>
                  Status Kepatuhan Disiplin ASN: 100% NIHIL Hukuman Disiplin
                  Sedang/Berat
                </h3>
                <p className='text-xs leading-relaxed text-slate-700 sm:text-sm dark:text-slate-300'>
                  Seluruh{' '}
                  <span className='font-semibold'>{summary.total_asn} ASN</span>{' '}
                  di lingkungan Badan Pusat Statistik Kabupaten Kepulauan Sitaro
                  berstatus bebas dari penjatuhan hukuman disiplin tingkat
                  sedang maupun berat serta nihil catatan pelanggaran kode etik
                  BerAKHLAK.
                </p>
              </div>
            </div>

            <div className='flex shrink-0 items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsPrintSKOpen(true)}
                className='border-emerald-600/40 bg-white text-emerald-800 shadow-sm hover:bg-emerald-50 dark:bg-slate-900 dark:text-emerald-300 dark:hover:bg-slate-800'
              >
                <Printer className='mr-1.5 h-4 w-4 text-emerald-600 dark:text-emerald-400' />
                Buka Bukti Dukung Resmi
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className='relative overflow-hidden rounded-xl border border-rose-500/40 bg-rose-50/80 p-5 shadow-sm dark:border-rose-500/30 dark:bg-rose-950/30'>
          <div className='flex items-start gap-4'>
            <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-rose-600 text-white'>
              <ShieldAlert className='h-7 w-7' />
            </div>
            <div>
              <div className='flex items-center gap-2'>
                <Badge variant='destructive'>Peringatan Ambang Batas WBK</Badge>
              </div>
              <h3 className='mt-1 text-lg font-bold text-rose-900 dark:text-rose-200'>
                Tidak Memenuhi Syarat Mutlak WBK/WBBM
              </h3>
              <p className='mt-1 text-sm text-rose-800 dark:text-rose-300'>
                {validation.alasan}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 3. 4 Kartu Metrik Disiplin */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        {/* Metrik 1: Hukdis Berat */}
        <Card className='relative overflow-hidden border-slate-200 shadow-sm dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
              Hukuman Disiplin Berat
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
              <ShieldCheck className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline justify-between'>
              <div className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100'>
                {summary.hukuman_berat_count}
              </div>
              <Badge className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'>
                NIHIL (0 Kasus)
              </Badge>
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              Pasal 14 PP No. 94/2021: Bebas pemberhentian / penurunan jabatan
            </p>
          </CardContent>
        </Card>

        {/* Metrik 2: Hukdis Sedang */}
        <Card className='relative overflow-hidden border-slate-200 shadow-sm dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
              Hukuman Disiplin Sedang
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'>
              <CheckCircle2 className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline justify-between'>
              <div className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100'>
                {summary.hukuman_sedang_count}
              </div>
              <Badge className='bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'>
                NIHIL (0 Kasus)
              </Badge>
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              Pasal 13 PP No. 94/2021: Bebas pemotongan tukin / penundaan
              berkala
            </p>
          </CardContent>
        </Card>

        {/* Metrik 3: Hukdis Ringan */}
        <Card className='relative overflow-hidden border-slate-200 shadow-sm dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
              Hukuman Disiplin Ringan
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'>
              <Check className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline justify-between'>
              <div className='text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100'>
                {summary.hukuman_ringan_count}
              </div>
              <Badge className='bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'>
                NIHIL (0 Kasus)
              </Badge>
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              Pasal 12 PP No. 94/2021: Bebas teguran lisan / tertulis
            </p>
          </CardContent>
        </Card>

        {/* Metrik 4: Kepatuhan Presensi ASN */}
        <Card className='relative overflow-hidden border-slate-200 shadow-sm dark:border-slate-800'>
          <CardHeader className='flex flex-row items-center justify-between pb-2'>
            <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
              Kepatuhan Presensi ASN
            </CardTitle>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'>
              <UserCheck className='h-4 w-4' />
            </div>
          </CardHeader>
          <CardContent>
            <div className='flex items-baseline justify-between'>
              <div className='text-3xl font-extrabold tracking-tight text-purple-700 dark:text-purple-300'>
                {summary.persentase_kepatuhan_presensi}%
              </div>
              <Badge className='bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'>
                Sangat Tertib
              </Badge>
            </div>
            <p className='text-muted-foreground mt-2 text-xs'>
              Presensi Elektronik Mobile &amp; Fingerprint {summary.total_asn}{' '}
              ASN Sitaro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 4. Panel Surat Keterangan Bebas Hukuman Disiplin Resmi */}
      <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
        <CardHeader className='border-b border-slate-100 pb-4 dark:border-slate-800'>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='space-y-1'>
              <div className='flex items-center gap-2'>
                <FileText className='h-5 w-5 text-emerald-600 dark:text-emerald-400' />
                <CardTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                  Surat Keterangan Bebas Hukuman Disiplin Resmi Kepala BPS
                  Sitaro
                </CardTitle>
              </div>
              <CardDescription className='text-xs'>
                Dokumen pembuktian ambang batas mutlak evaluasi TPI &amp;
                KemenPAN-RB
              </CardDescription>
            </div>
            <div className='flex items-center gap-2'>
              <Button
                variant='outline'
                size='sm'
                onClick={() => setIsPrintSKOpen(true)}
                className='h-8 text-xs'
              >
                <Printer className='mr-1.5 h-3.5 w-3.5' />
                Preview &amp; Cetak Dokumen
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className='pt-5'>
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {/* Sisi Kiri: Atribut Surat Resmi */}
            <div className='space-y-3.5 rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/40'>
              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>
                  Nomor Surat Resmi:
                </span>
                <span className='font-mono font-bold text-slate-900 dark:text-slate-100'>
                  {summary.nomor_surat_keterangan_nihil}
                </span>
              </div>

              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>
                  Tanggal Pengesahan:
                </span>
                <span className='font-semibold text-slate-900 dark:text-slate-100'>
                  {new Date(
                    summary.tanggal_surat_keterangan
                  ).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>
                  Pejabat Penandatangan:
                </span>
                <span className='font-semibold text-slate-900 dark:text-slate-100'>
                  {summary.pejabat_penandatangan}
                </span>
              </div>

              <div className='flex items-center justify-between border-b pb-2'>
                <span className='text-muted-foreground'>Jabatan:</span>
                <span className='text-right font-medium text-slate-800 dark:text-slate-200'>
                  {summary.jabatan_penandatangan}
                </span>
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-muted-foreground'>
                  NIP Penandatangan:
                </span>
                <span className='font-mono text-slate-700 dark:text-slate-300'>
                  {summary.nip_penandatangan}
                </span>
              </div>
            </div>

            {/* Sisi Kanan: Catatan Audit & Verifikasi */}
            <div className='flex flex-col justify-between space-y-4 rounded-lg border border-slate-100 bg-slate-50/60 p-4 text-xs dark:border-slate-800 dark:bg-slate-900/40'>
              <div className='space-y-2'>
                <div className='flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100'>
                  <BookOpen className='h-4 w-4 text-blue-600 dark:text-blue-400' />
                  Catatan Audit Tim Kepatuhan Internal:
                </div>
                <p className='leading-relaxed text-slate-700 dark:text-slate-300'>
                  {summary.catatan_audit}
                </p>
              </div>

              <div className='flex flex-wrap items-center justify-between gap-2 border-t pt-3'>
                <div className='flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400'>
                  <CheckCircle2 className='h-4 w-4' />
                  <span className='font-medium'>
                    Terverifikasi &amp; Sah untuk Bukti LKE
                  </span>
                </div>
                <Badge
                  variant='outline'
                  className='bg-white text-slate-700 dark:bg-slate-950 dark:text-slate-300'
                >
                  Tahun Evaluasi: {summary.tahun}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 5. Tabel / Timeline Riwayat Pembinaan Disiplin & Kode Etik */}
      <Card className='border-slate-200 shadow-sm dark:border-slate-800'>
        <CardHeader className='pb-3'>
          <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
            <div>
              <CardTitle className='text-base font-bold text-slate-900 dark:text-slate-100'>
                Riwayat Pembinaan Disiplin &amp; Internalisasi Kode Etik ASN
              </CardTitle>
              <CardDescription className='text-xs'>
                Dokumentasi pembinaan berkala, notula apel pagi, rekonsiliasi
                presensi, dan pakta integritas
              </CardDescription>
            </div>

            <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
              {/* Search Bar */}
              <div className='relative w-full sm:w-64'>
                <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                <Input
                  type='text'
                  placeholder='Cari kegiatan / no. dokumen...'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className='h-9 pl-8 text-xs'
                />
              </div>

              {/* Kategori Filter */}
              <Select
                value={selectedKategori}
                onValueChange={(val) => setSelectedKategori(val)}
              >
                <SelectTrigger className='h-9 w-full text-xs sm:w-48'>
                  <SelectValue placeholder='Filter Kategori' />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='ALL'>Semua Kategori</SelectItem>
                  <SelectItem value='PEMBINAAN_APEL'>
                    Pembinaan Apel Pagi
                  </SelectItem>
                  <SelectItem value='INTERNALISASI_KODE_ETIK'>
                    Internalisasi Kode Etik
                  </SelectItem>
                  <SelectItem value='REKONSILIASI_PRESENSI'>
                    Rekonsiliasi Presensi
                  </SelectItem>
                  <SelectItem value='SURAT_KETERANGAN_BEBAS_HUKDIS'>
                    SK Bebas Hukdis
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {filteredCatatan.length === 0 ? (
            <div className='flex flex-col items-center justify-center rounded-lg border border-dashed py-12 text-center'>
              <AlertCircle className='text-muted-foreground h-8 w-8' />
              <p className='mt-2 text-sm font-medium text-slate-700 dark:text-slate-300'>
                Tidak ada catatan pembinaan disiplin yang sesuai filter
              </p>
              <p className='text-muted-foreground text-xs'>
                Coba sesuaikan kata kunci pencarian atau ubah filter kategori
              </p>
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredCatatan.map((item) => {
                const badgeInfo = KATEGORI_DISIPLIN_LABELS[item.kategori];
                return (
                  <div
                    key={item.id}
                    className='relative flex flex-col justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 transition-all hover:border-slate-300 hover:shadow-sm sm:flex-row sm:items-start dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700'
                  >
                    <div className='space-y-1.5'>
                      <div className='flex flex-wrap items-center gap-2'>
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${badgeInfo.color}`}
                        >
                          {badgeInfo.label}
                        </span>
                        <span className='text-muted-foreground flex items-center text-xs'>
                          <Calendar className='mr-1 h-3 w-3' />
                          {new Date(item.tanggal).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </span>
                        <span className='font-mono text-xs text-slate-500 dark:text-slate-400'>
                          Doc: {item.nomor_dokumen}
                        </span>
                      </div>

                      <h4 className='text-sm font-semibold text-slate-900 dark:text-slate-100'>
                        {item.judul}
                      </h4>

                      <p className='text-xs leading-relaxed text-slate-600 dark:text-slate-400'>
                        {item.deskripsi}
                      </p>

                      {item.tindak_lanjut && (
                        <div className='mt-1 flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300'>
                          <span className='font-semibold text-emerald-600 dark:text-emerald-400'>
                            Tindak Lanjut:
                          </span>
                          <span>{item.tindak_lanjut}</span>
                        </div>
                      )}
                    </div>

                    <div className='flex shrink-0 items-center gap-2 sm:self-center'>
                      {item.lampiran_url ? (
                        <Button
                          variant='outline'
                          size='sm'
                          className='h-8 text-xs text-blue-700 hover:bg-blue-50 dark:text-blue-300 dark:hover:bg-blue-950/40'
                          asChild
                        >
                          <a
                            href={item.lampiran_url}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <ExternalLink className='mr-1.5 h-3 w-3' />
                            Bukti Dokumen
                          </a>
                        </Button>
                      ) : (
                        <Badge
                          variant='outline'
                          className='text-muted-foreground text-[10px]'
                        >
                          Arsip Internal
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 6. DIALOG: Tambah Kegiatan Pembinaan Disiplin Baru */}
      <Dialog open={isAddCatatanOpen} onOpenChange={setIsAddCatatanOpen}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Plus className='h-5 w-5 text-emerald-600' />
              Tambah Kegiatan Pembinaan Disiplin &amp; Kode Etik
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Catat agenda apel pagi, sosialisasi BerAKHLAK, atau rekonsiliasi
              presensi sebagai bukti kepatuhan disiplin.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddCatatanSubmit} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='kategori' className='text-xs font-semibold'>
                  Kategori Kegiatan <span className='text-red-500'>*</span>
                </Label>
                <Select
                  value={addForm.kategori}
                  onValueChange={(val: KategoriDisiplin) =>
                    setAddForm({ ...addForm, kategori: val })
                  }
                >
                  <SelectTrigger id='kategori' className='h-9 text-xs'>
                    <SelectValue placeholder='Pilih Kategori' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='PEMBINAAN_APEL'>
                      Pembinaan Apel Pagi
                    </SelectItem>
                    <SelectItem value='INTERNALISASI_KODE_ETIK'>
                      Internalisasi Kode Etik
                    </SelectItem>
                    <SelectItem value='REKONSILIASI_PRESENSI'>
                      Rekonsiliasi Presensi
                    </SelectItem>
                    <SelectItem value='SURAT_KETERANGAN_BEBAS_HUKDIS'>
                      Surat Keterangan Bebas Hukdis
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='tanggal' className='text-xs font-semibold'>
                  Tanggal Pelaksanaan <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='tanggal'
                  type='date'
                  required
                  value={addForm.tanggal}
                  onChange={(e) =>
                    setAddForm({ ...addForm, tanggal: e.target.value })
                  }
                  className='h-9 text-xs'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='judul' className='text-xs font-semibold'>
                Judul Kegiatan <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='judul'
                required
                placeholder='Contoh: Apel Pagi Gabungan &amp; Pengarahan Netralitas ASN'
                value={addForm.judul}
                onChange={(e) =>
                  setAddForm({ ...addForm, judul: e.target.value })
                }
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='nomor_dokumen' className='text-xs font-semibold'>
                Nomor Dokumen / Notula / Surat Tugas{' '}
                <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='nomor_dokumen'
                required
                placeholder='Contoh: ND-014/71090/KP.310/01/2026'
                value={addForm.nomor_dokumen}
                onChange={(e) =>
                  setAddForm({ ...addForm, nomor_dokumen: e.target.value })
                }
                className='h-9 font-mono text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='deskripsi' className='text-xs font-semibold'>
                Deskripsi Pelaksanaan Kegiatan
              </Label>
              <Textarea
                id='deskripsi'
                rows={3}
                placeholder='Uraian ringkas isi pengarahan, notula apel, atau hasil rapat koordinasi...'
                value={addForm.deskripsi}
                onChange={(e) =>
                  setAddForm({ ...addForm, deskripsi: e.target.value })
                }
                className='text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='tindak_lanjut' className='text-xs font-semibold'>
                Tindak Lanjut &amp; Rekomendasi
              </Label>
              <Input
                id='tindak_lanjut'
                placeholder='Contoh: Penandatanganan pakta integritas oleh 18 ASN BPS Sitaro'
                value={addForm.tindak_lanjut}
                onChange={(e) =>
                  setAddForm({ ...addForm, tindak_lanjut: e.target.value })
                }
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='lampiran_url' className='text-xs font-semibold'>
                URL Lampiran Bukti Dukung (PDF / Dokumen Cloud)
              </Label>
              <Input
                id='lampiran_url'
                placeholder='https://sitarokab.bps.go.id/docs/notula-pembinaan.pdf'
                value={addForm.lampiran_url}
                onChange={(e) =>
                  setAddForm({ ...addForm, lampiran_url: e.target.value })
                }
                className='h-9 text-xs'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsAddCatatanOpen(false)}
                className='h-9'
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={isPending}
                className='h-9 bg-emerald-600 text-white hover:bg-emerald-700'
              >
                {isPending ? 'Menyimpan...' : 'Simpan Kegiatan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 7. DIALOG: Edit Info Surat Keterangan Bebas Hukdis */}
      <Dialog open={isEditSKOpen} onOpenChange={setIsEditSKOpen}>
        <DialogContent className='max-w-xl'>
          <DialogHeader>
            <DialogTitle className='flex items-center gap-2'>
              <Edit className='h-5 w-5 text-blue-600' />
              Edit Informasi Surat Keterangan Nihil Hukdis
            </DialogTitle>
            <DialogDescription className='text-xs'>
              Perbarui nomor surat, tanggal pengesahan, dan pejabat
              penandatangan bukti dukung threshold WBK.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditSKSubmit} className='space-y-4 pt-2'>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='nomor_surat' className='text-xs font-semibold'>
                  Nomor Surat Keterangan <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='nomor_surat'
                  required
                  value={editForm.nomor_surat_keterangan_nihil || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      nomor_surat_keterangan_nihil: e.target.value
                    })
                  }
                  className='h-9 font-mono text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='tanggal_sk' className='text-xs font-semibold'>
                  Tanggal Pengesahan <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='tanggal_sk'
                  type='date'
                  required
                  value={editForm.tanggal_surat_keterangan || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      tanggal_surat_keterangan: e.target.value
                    })
                  }
                  className='h-9 text-xs'
                />
              </div>
            </div>

            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              <div className='space-y-1.5'>
                <Label htmlFor='pejabat' className='text-xs font-semibold'>
                  Nama Pejabat Penandatangan{' '}
                  <span className='text-red-500'>*</span>
                </Label>
                <Input
                  id='pejabat'
                  required
                  value={editForm.pejabat_penandatangan || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      pejabat_penandatangan: e.target.value
                    })
                  }
                  className='h-9 text-xs'
                />
              </div>

              <div className='space-y-1.5'>
                <Label htmlFor='nip' className='text-xs font-semibold'>
                  NIP Penandatangan
                </Label>
                <Input
                  id='nip'
                  value={editForm.nip_penandatangan || ''}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      nip_penandatangan: e.target.value
                    })
                  }
                  className='h-9 font-mono text-xs'
                />
              </div>
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='jabatan' className='text-xs font-semibold'>
                Jabatan Penandatangan
              </Label>
              <Input
                id='jabatan'
                value={editForm.jabatan_penandatangan || ''}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    jabatan_penandatangan: e.target.value
                  })
                }
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='presensi' className='text-xs font-semibold'>
                Capaian Tingkat Kepatuhan Presensi (%)
              </Label>
              <Input
                id='presensi'
                type='number'
                step='0.1'
                min='0'
                max='100'
                value={editForm.persentase_kepatuhan_presensi || 99.6}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    persentase_kepatuhan_presensi:
                      parseFloat(e.target.value) || 0
                  })
                }
                className='h-9 text-xs'
              />
            </div>

            <div className='space-y-1.5'>
              <Label htmlFor='catatan_audit' className='text-xs font-semibold'>
                Catatan Verifikasi Tim Kepatuhan
              </Label>
              <Textarea
                id='catatan_audit'
                rows={3}
                value={editForm.catatan_audit || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, catatan_audit: e.target.value })
                }
                className='text-xs'
              />
            </div>

            <DialogFooter className='pt-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setIsEditSKOpen(false)}
                className='h-9'
              >
                Batal
              </Button>
              <Button
                type='submit'
                size='sm'
                disabled={isPending}
                className='h-9 bg-blue-600 text-white hover:bg-blue-700'
              >
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* 8. DIALOG CETAK: Format Resmi A4 Surat Keterangan Bebas Hukdis BPS Sitaro */}
      <Dialog open={isPrintSKOpen} onOpenChange={setIsPrintSKOpen}>
        <DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
          <DialogHeader>
            <div className='flex items-center justify-between'>
              <DialogTitle className='flex items-center gap-2 text-lg'>
                <Printer className='h-5 w-5 text-emerald-600' />
                Surat Keterangan Bebas Hukuman Disiplin (Format Resmi A4)
              </DialogTitle>
              <Button
                size='sm'
                onClick={() => window.print()}
                className='bg-emerald-600 text-white hover:bg-emerald-700 print:hidden'
              >
                <Printer className='mr-1.5 h-4 w-4' />
                Cetak Dokumen A4
              </Button>
            </div>
            <DialogDescription className='print:hidden'>
              Format Ber-Kop Resmi Badan Pusat Statistik Kabupaten Kepulauan
              Sitaro sebagai dokumen bukti dukung Syarat Mutlak ZI WBK/WBBM
              Pilar 3 &amp; 5.
            </DialogDescription>
          </DialogHeader>

          {/* Dokumen Kertas A4 Siap Cetak */}
          <div className='space-y-6 rounded-lg border bg-white p-8 text-sm text-slate-900 shadow-sm print:border-none print:p-0 print:shadow-none'>
            {/* KOP SURAT RESMI */}
            <div className='space-y-1 border-b-2 border-slate-900 pb-3 text-center'>
              <div className='flex items-center justify-center gap-3'>
                <div className='text-center'>
                  <h2 className='text-base font-bold tracking-widest text-slate-900 uppercase'>
                    BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG
                    BIARO
                  </h2>
                  <p className='text-xs text-slate-700'>
                    Jl. Trans Sasahara, Ondong Siau, Kab. Kepl. Siau Tagulandang
                    Biaro 95861
                  </p>
                  <p className='text-[11px] text-slate-600'>
                    Telepon: (0432) 27109 | Pos-el: bps7109@bps.go.id | Laman:
                    https://sitarokab.bps.go.id
                  </p>
                </div>
              </div>
            </div>

            {/* JUDUL DOKUMEN */}
            <div className='space-y-1 pt-2 text-center'>
              <h3 className='text-sm font-bold tracking-wider uppercase underline decoration-slate-900'>
                SURAT KETERANGAN BEBAS HUKUMAN DISIPLIN TINGKAT SEDANG DAN BERAT
              </h3>
              <p className='font-mono text-xs font-medium text-slate-800'>
                Nomor: {summary.nomor_surat_keterangan_nihil}
              </p>
            </div>

            {/* DASAR HUKUM / KONSIDERANS */}
            <div className='space-y-1 text-justify text-xs leading-relaxed text-slate-800'>
              <p>Menindaklanjuti ketentuan peraturan perundang-undangan:</p>
              <ol className='ml-5 list-decimal space-y-1 text-slate-700'>
                <li>
                  Undang-Undang Republik Indonesia Nomor 20 Tahun 2023 tentang
                  Aparatur Sipil Negara;
                </li>
                <li>
                  Peraturan Pemerintah Nomor 94 Tahun 2021 tentang Disiplin
                  Pegawai Negeri Sipil;
                </li>
                <li>
                  Peraturan Badan Pusat Statistik Nomor 64 Tahun 2021 tentang
                  Kode Etik dan Kode Perilaku Pegawai di Lingkungan Badan Pusat
                  Statistik;
                </li>
                <li>
                  Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi
                  Birokrasi Nomor 90 Tahun 2021 tentang Pembangunan dan Evaluasi
                  Zona Integritas Menuju Wilayah Bebas dari Korupsi (WBK) dan
                  Wilayah Birokrasi Bersih dan Melayani (WBBM).
                </li>
              </ol>
            </div>

            {/* IDENTITAS PENANDATANGAN */}
            <div className='space-y-2 text-xs leading-relaxed text-slate-800'>
              <p>Yang bertanda tangan di bawah ini:</p>
              <div className='ml-4 grid grid-cols-[160px_10px_1fr] gap-y-1'>
                <span className='font-medium'>Nama</span>
                <span>:</span>
                <span className='font-bold'>
                  {summary.pejabat_penandatangan}
                </span>

                <span className='font-medium'>NIP</span>
                <span>:</span>
                <span className='font-mono'>{summary.nip_penandatangan}</span>

                <span className='font-medium'>Pangkat / Gol. Ruang</span>
                <span>:</span>
                <span>Pembina Tk. I (IV/b)</span>

                <span className='font-medium'>Jabatan</span>
                <span>:</span>
                <span>{summary.jabatan_penandatangan}</span>

                <span className='font-medium'>Unit Kerja</span>
                <span>:</span>
                <span>
                  Badan Pusat Statistik Kabupaten Kepulauan Siau Tagulandang
                  Biaro (Kode Satker: 71090)
                </span>
              </div>
            </div>

            {/* PERNYATAAN RESMI */}
            <div className='space-y-2 text-justify text-xs leading-relaxed text-slate-800'>
              <p>Dengan ini menerangkan dengan sesungguhnya bahwa:</p>
              <div className='rounded border border-slate-300 bg-slate-50/70 p-4'>
                <p className='leading-relaxed'>
                  Seluruh Pegawai Negeri Sipil / Aparatur Sipil Negara di
                  lingkungan Badan Pusat Statistik Kabupaten Kepulauan Sitaro
                  sejumlah{' '}
                  <strong>{summary.total_asn} (delapan belas) orang</strong>{' '}
                  terhitung sejak tanggal 1 Januari 2025 sampai dengan
                  diterbitkannya surat keterangan ini:
                </p>
                <div className='my-3 text-center'>
                  <span className='inline-block rounded-md border-2 border-emerald-600 bg-emerald-50 px-4 py-2 font-bold text-emerald-900 uppercase'>
                    STATUS: NIHIL (0 KASUS) PENJATUHAN HUKUMAN DISIPLIN TINGKAT
                    SEDANG DAN BERAT
                  </span>
                </div>
                <p className='leading-relaxed'>
                  serta{' '}
                  <strong>
                    tidak sedang dalam proses pemeriksaan pelanggaran kode etik,
                    kode perilaku, maupun tindak pidana kejahatan jabatan /
                    korupsi
                  </strong>
                  . Seluruh pegawai senantiasa mematuhi jam kerja dan Core
                  Values BerAKHLAK dengan tingkat kepatuhan presensi mencapai{' '}
                  <strong>{summary.persentase_kepatuhan_presensi}%</strong>.
                </p>
              </div>

              <p>
                Surat keterangan ini dibuat dengan sebenar-benarnya atas
                tanggung jawab jabatan dan dipergunakan sebagai{' '}
                <strong>
                  Bukti Pemenuhan Syarat Mutlak (Threshold Gatekeeper)
                </strong>{' '}
                dalam rangka Evaluasi Penilaian Zona Integritas Menuju Wilayah
                Bebas dari Korupsi (WBK) Tahun 2026.
              </p>
            </div>

            {/* TANDA TANGAN RESMI */}
            <div className='grid grid-cols-2 pt-6 text-center text-xs text-slate-900'>
              {/* Kolom Verifikasi Kepatuhan */}
              <div className='space-y-16'>
                <p>
                  Telah Diverifikasi Oleh:
                  <br />
                  <strong>Kepala Subbagian Umum &amp; Tim Kepatuhan</strong>
                </p>
                <div>
                  <p className='font-bold underline'>Franky Pontoh, S.Si</p>
                  <p className='font-mono text-slate-600'>
                    NIP. 198103142006041002
                  </p>
                </div>
              </div>

              {/* Kolom Kepala Satker */}
              <div className='space-y-16'>
                <p>
                  Ondong Siau,{' '}
                  {new Date(
                    summary.tanggal_surat_keterangan
                  ).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                  <br />
                  <strong>
                    Kepala Badan Pusat Statistik
                    <br />
                    Kabupaten Kepulauan Sitaro
                  </strong>
                </p>
                <div>
                  <p className='font-bold underline'>
                    {summary.pejabat_penandatangan}
                  </p>
                  <p className='font-mono text-slate-600'>
                    NIP. {summary.nip_penandatangan}
                  </p>
                </div>
              </div>
            </div>

            {/* FOOTER VERIFIKASI QR */}
            <div className='border-t border-slate-200 pt-3 text-[10px] text-slate-500'>
              <div className='flex items-center justify-between'>
                <span>
                  Dokumen Elektronik Resmi Terverifikasi Sistem Informasi REBO
                  V2 BPS Sitaro
                </span>
                <span className='font-mono'>
                  HASH-SHA256: 7109-DISP-2026-WBK-PASS
                </span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
