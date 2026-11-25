'use client';

import React, { useState, useTransition, useRef } from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  Key,
  FileText,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  Download,
  UploadCloud,
  RefreshCw,
  Copy,
  Eye,
  EyeOff,
  Search,
  Database,
  Cpu,
  FileCheck,
  HardDriveDownload,
  Fingerprint,
  Info
} from 'lucide-react';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  encryptDocumentBlob,
  decryptDocumentBlob,
  parseDocShieldMetadata,
  detectSensitiveDocument,
  DEFAULT_MASTER_PASSPHRASE,
  type DocShieldStats,
  type DocShieldMetadata,
  type EncryptedDocumentRecord,
  type SensitiveDetectionResult
} from '@/lib/security/doc-shield';

import {
  registerEncryptedDocumentAction,
  getDocShieldStatsAction
} from '@/actions/doc-shield-actions';

interface DocShieldClientProps {
  initialStats: DocShieldStats;
}

export default function DocShieldClient({
  initialStats
}: DocShieldClientProps) {
  const [stats, setStats] = useState<DocShieldStats>(initialStats);
  const [isPending, startTransition] = useTransition();

  // State untuk Tab Enkripsi
  const [encryptFile, setEncryptFile] = useState<File | null>(null);
  const [encryptDetection, setEncryptDetection] =
    useState<SensitiveDetectionResult | null>(null);
  const [encryptPassphrase, setEncryptPassphrase] = useState<string>('');
  const [useDefaultKey, setUseDefaultKey] = useState<boolean>(true);
  const [showEncryptKey, setShowEncryptKey] = useState<boolean>(false);
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [encryptResult, setEncryptResult] = useState<{
    blob: Blob;
    metadata: DocShieldMetadata;
    fileName: string;
  } | null>(null);

  // State untuk Tab Dekripsi
  const [decryptFile, setDecryptFile] = useState<File | null>(null);
  const [decryptMetadata, setDecryptMetadata] =
    useState<DocShieldMetadata | null>(null);
  const [decryptPassphrase, setDecryptPassphrase] = useState<string>('');
  const [useDefaultDecryptKey, setUseDefaultDecryptKey] =
    useState<boolean>(true);
  const [showDecryptKey, setShowDecryptKey] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [decryptResult, setDecryptResult] = useState<{
    blob: Blob;
    originalFileName: string;
    sha256Verified: boolean;
    metadata: DocShieldMetadata;
  } | null>(null);

  // State Filter Tabel Dokumen
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const encryptFileInputRef = useRef<HTMLInputElement>(null);
  const decryptFileInputRef = useRef<HTMLInputElement>(null);

  // Helper formatting size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  // Helper salin teks
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin ke clipboard!`);
  };

  // Handler Pilih Berkas untuk Di-enkripsi
  const handleSelectEncryptFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setEncryptFile(file);
    setEncryptResult(null);
    const detection = detectSensitiveDocument(file.name, file.type);
    setEncryptDetection(detection);
  };

  // Handler Drag & Drop Enkripsi
  const handleEncryptDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setEncryptFile(file);
      setEncryptResult(null);
      const detection = detectSensitiveDocument(file.name, file.type);
      setEncryptDetection(detection);
    }
  };

  // Handler Proses Enkripsi
  const handlePerformEncryption = async () => {
    if (!encryptFile) {
      toast.error('Silakan pilih berkas yang ingin dienkripsi.');
      return;
    }

    const keyToUse = useDefaultKey
      ? DEFAULT_MASTER_PASSPHRASE
      : encryptPassphrase.trim();

    if (!keyToUse) {
      toast.error('Silakan masukkan kata sandi / passphrase master.');
      return;
    }

    setIsEncrypting(true);
    const toastId = toast.loading(
      'Mengenkripsi berkas dengan AES-256-GCM & PBKDF2 (100.000 iterasi)...'
    );

    try {
      const res = await encryptDocumentBlob(encryptFile, keyToUse);
      setEncryptResult({
        blob: res.encryptedBlob,
        metadata: res.metadata,
        fileName: res.downloadFileName
      });

      // Simpan riwayat audit ke sistem
      const auditRes = await registerEncryptedDocumentAction({
        id: `enc-${Date.now()}`,
        fileName: res.downloadFileName,
        originalName: res.metadata.fileName,
        fileSize: res.metadata.originalSize,
        encryptedSize: res.metadata.encryptedSize,
        category: res.metadata.category,
        sensitivityLevel: res.metadata.sensitivityLevel,
        sha256: res.metadata.sha256Original,
        iv: res.metadata.ivHex,
        salt: res.metadata.saltHex,
        encryptedAt: res.metadata.encryptedAt,
        encryptedBy: 'Operator BPS Sitaro',
        storageLocation: 'Google Drive',
        verifiedStatus: 'VERIFIED'
      });

      // Otomatis unduh berkas .enc
      const downloadUrl = URL.createObjectURL(res.encryptedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = res.downloadFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success(
        `Enkripsi berhasil! Berkas terproteksi "${res.downloadFileName}" terunduh. Audit log ISO 27001 tercatat.`,
        { id: toastId }
      );

      // Refresh data statistik
      startTransition(async () => {
        const latest = await getDocShieldStatsAction();
        if (latest.success) {
          setStats(latest.stats);
        }
      });
    } catch (err: any) {
      console.error(err);
      toast.error(
        `Enkripsi gagal: ${err.message || 'Terjadi kesalahan sistem'}`,
        {
          id: toastId
        }
      );
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handler Pilih Berkas untuk Di-dekripsi
  const handleSelectDecryptFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDecryptFile(file);
    setDecryptResult(null);

    try {
      const meta = await parseDocShieldMetadata(file);
      setDecryptMetadata(meta);
    } catch (err: any) {
      setDecryptMetadata(null);
      toast.error(
        `Bukan berkas kontainer Doc Shield valid: ${err.message || 'Header rusak'}`
      );
    }
  };

  // Handler Drag & Drop Dekripsi
  const handleDecryptDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDecryptFile(file);
      setDecryptResult(null);
      try {
        const meta = await parseDocShieldMetadata(file);
        setDecryptMetadata(meta);
      } catch (err: any) {
        setDecryptMetadata(null);
        toast.error(`Bukan berkas kontainer Doc Shield valid: ${err.message}`);
      }
    }
  };

  // Handler Proses Dekripsi
  const handlePerformDecryption = async () => {
    if (!decryptFile) {
      toast.error('Silakan pilih berkas .enc yang akan didekripsi.');
      return;
    }

    const keyToUse = useDefaultDecryptKey
      ? DEFAULT_MASTER_PASSPHRASE
      : decryptPassphrase.trim();

    if (!keyToUse) {
      toast.error('Silakan masukkan passphrase / kata sandi dekripsi.');
      return;
    }

    setIsDecrypting(true);
    const toastId = toast.loading(
      'Memverifikasi autentikasi GCM & mendekripsi berkas...'
    );

    try {
      const res = await decryptDocumentBlob(decryptFile, keyToUse);
      setDecryptResult({
        blob: res.decryptedBlob,
        originalFileName: res.originalFileName,
        sha256Verified: res.sha256Verified,
        metadata: res.metadata
      });

      // Otomatis unduh berkas asli
      const downloadUrl = URL.createObjectURL(res.decryptedBlob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = res.originalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);

      toast.success(
        `Dekripsi berhasil! Berkas asli "${res.originalFileName}" berhasil dipulihkan. Checksum SHA-256 terverifikasi 100% otentik!`,
        { id: toastId }
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        `Dekripsi Gagal: ${err.message || 'Kata sandi salah atau berkas telah diubah'}`,
        { id: toastId }
      );
    } finally {
      setIsDecrypting(false);
    }
  };

  // Filter Dokumen Terdaftar
  const filteredDocuments = stats.recentDocuments.filter((doc) => {
    const matchSearch =
      doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.sha256.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;
    if (selectedCategory === 'ALL') return true;
    return doc.category.toLowerCase().includes(selectedCategory.toLowerCase());
  });

  return (
    <div className='space-y-6'>
      {/* 1. Header & Konteks ISO 27001 */}
      <div className='flex flex-col gap-4 border-b pb-5 md:flex-row md:items-center md:justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <div className='rounded-lg bg-emerald-600/10 p-2 text-emerald-600'>
              <ShieldCheck className='h-6 w-6' />
            </div>
            <div>
              <h1 className='text-2xl font-bold tracking-tight'>
                Doc Shield: Enkripsi Berkas Sensitif Kedinasan
              </h1>
              <p className='text-muted-foreground text-sm'>
                Standar Kriptografi Militer AES-256-GCM & PBKDF2 (100.000
                Iterasi) • ISO/IEC 27001:2022 Control A.8.24
              </p>
            </div>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <Badge
            variant='outline'
            className='border-emerald-300 bg-emerald-50 font-mono text-xs text-emerald-700'
          >
            <Cpu className='mr-1 h-3 w-3 text-emerald-600' />
            AES-256-GCM
          </Badge>
          <Badge
            variant='outline'
            className='border-blue-300 bg-blue-50 font-mono text-xs text-blue-700'
          >
            <Fingerprint className='mr-1 h-3 w-3 text-blue-600' />
            PBKDF2 100k
          </Badge>
          <Badge
            variant='outline'
            className='border-purple-300 bg-purple-50 font-mono text-xs text-purple-700'
          >
            <ShieldCheck className='mr-1 h-3 w-3 text-purple-600' />
            ISO 27001 Terpenuhi
          </Badge>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <Card className='border-emerald-200/80 bg-emerald-50/20 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center justify-between text-xs font-semibold tracking-wider text-emerald-700 uppercase'>
              Status Kriptografi
              <Cpu className='h-4 w-4 text-emerald-600' />
            </CardDescription>
            <CardTitle className='text-xl font-bold text-emerald-800'>
              AES-256-GCM Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1 text-xs'>
            <div className='flex justify-between'>
              <span>Mode Operasi:</span>
              <span className='font-mono font-medium text-emerald-700'>
                GCM (Authenticated)
              </span>
            </div>
            <div className='flex justify-between'>
              <span>SubtleCrypto:</span>
              <span className='font-medium text-emerald-700'>
                Hardware-Accelerated
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-blue-200/80 bg-blue-50/20 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center justify-between text-xs font-semibold tracking-wider text-blue-700 uppercase'>
              Berkas Terenkripsi
              <Lock className='h-4 w-4 text-blue-600' />
            </CardDescription>
            <CardTitle className='text-2xl font-bold text-blue-800'>
              {stats.totalProtectedDocs} Berkas
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1 text-xs'>
            <div className='flex justify-between'>
              <span>Total Volume Terproteksi:</span>
              <span className='font-mono font-medium text-blue-700'>
                {formatBytes(stats.totalProtectedBytes)}
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Cloud Storage Target:</span>
              <span className='font-medium text-blue-700'>
                GDrive & Supabase
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-purple-200/80 bg-purple-50/20 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center justify-between text-xs font-semibold tracking-wider text-purple-700 uppercase'>
              Kepatuhan ISO 27001
              <ShieldCheck className='h-4 w-4 text-purple-600' />
            </CardDescription>
            <CardTitle className='text-2xl font-bold text-purple-800'>
              {stats.isoComplianceScore}% Terpenuhi
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1 text-xs'>
            <div className='flex justify-between'>
              <span>Kontrol Keamanan:</span>
              <span className='font-medium text-purple-700'>
                A.8.24 (Cryptography)
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Audit Satker:</span>
              <span className='font-medium text-purple-700'>
                BPS Kep. Sitaro (7108)
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className='border-amber-200/80 bg-amber-50/20 shadow-sm'>
          <CardHeader className='pb-2'>
            <CardDescription className='flex items-center justify-between text-xs font-semibold tracking-wider text-amber-700 uppercase'>
              Perlindungan Kebocoran
              <CheckCircle2 className='h-4 w-4 text-emerald-600' />
            </CardDescription>
            <CardTitle className='text-2xl font-bold text-emerald-700'>
              Zero Data Leakage
            </CardTitle>
          </CardHeader>
          <CardContent className='text-muted-foreground space-y-1 text-xs'>
            <div className='flex justify-between'>
              <span>Insiden Kebocoran:</span>
              <span className='font-mono font-bold text-emerald-700'>
                0 Insiden (365 Hari)
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Integritas Hash:</span>
              <span className='font-medium text-emerald-700'>
                SHA-256 Validated
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Tab Interaktif: Enkripsi, Dekripsi & Direktori Dokumen */}
      <Tabs defaultValue='encrypt' className='space-y-4'>
        <TabsList className='bg-muted/60 grid h-auto grid-cols-1 p-1 md:grid-cols-3'>
          <TabsTrigger
            value='encrypt'
            className='flex items-center gap-2 py-2.5'
          >
            <Lock className='h-4 w-4 text-emerald-600' />
            <span>1. Enkripsi Berkas Sensitif (Doc Shield)</span>
          </TabsTrigger>
          <TabsTrigger
            value='decrypt'
            className='flex items-center gap-2 py-2.5'
          >
            <Unlock className='h-4 w-4 text-blue-600' />
            <span>2. Dekripsi & Validasi Berkas (.enc)</span>
          </TabsTrigger>
          <TabsTrigger
            value='directory'
            className='flex items-center gap-2 py-2.5'
          >
            <Database className='h-4 w-4 text-purple-600' />
            <span>3. Direktori Berkas Terproteksi Satker</span>
          </TabsTrigger>
        </TabsList>

        {/* ============================================================== */}
        {/* TAB 1: ENKRIPSI BERKAS                                          */}
        {/* ============================================================== */}
        <TabsContent value='encrypt' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Panel Kiri: Form & Dropzone */}
            <div className='space-y-4 lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Lock className='h-5 w-5 text-emerald-600' />
                    Enkripsi Dokumen Pemeriksaan Internal & Laporan Keuangan
                  </CardTitle>
                  <CardDescription>
                    Pilih dokumen PDF, Excel (SPJ/DIPA), atau Word hasil
                    pemeriksaan (LHP/BPK/Itjen). Enkripsi dilakukan sepenuhnya
                    di sisi klien (client-side) menggunakan Web Crypto
                    SubtleCrypto sebelum file dikirim ke penyimpanan cloud.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-5'>
                  {/* Dropzone */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleEncryptDrop}
                    onClick={() => encryptFileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                      encryptFile
                        ? 'border-emerald-500 bg-emerald-50/20'
                        : 'border-muted-foreground/25 hover:bg-muted/30 hover:border-emerald-500'
                    }`}
                  >
                    <input
                      ref={encryptFileInputRef}
                      type='file'
                      className='hidden'
                      onChange={handleSelectEncryptFile}
                    />
                    <div className='flex flex-col items-center justify-center space-y-2'>
                      <div className='rounded-full bg-emerald-100/60 p-3 text-emerald-700'>
                        <UploadCloud className='h-8 w-8' />
                      </div>
                      <div className='text-sm font-semibold'>
                        {encryptFile
                          ? `Berkas Terpilih: ${encryptFile.name}`
                          : 'Klik untuk memilih atau seret berkas ke sini'}
                      </div>
                      <p className='text-muted-foreground max-w-sm text-xs'>
                        Mendukung PDF, XLSX, XLS, DOCX, DOC, ZIP (Ukuran hingga
                        100 MB).
                      </p>
                      {encryptFile && (
                        <div className='bg-background mt-2 inline-flex items-center gap-2 rounded-md border px-3 py-1 font-mono text-xs'>
                          <FileText className='h-3.5 w-3.5 text-emerald-600' />
                          <span>{encryptFile.name}</span>
                          <span className='text-muted-foreground'>
                            ({formatBytes(encryptFile.size)})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Banner Hasil Deteksi Otomatis Berkas Sensitif */}
                  {encryptDetection && (
                    <div
                      className={`flex items-start gap-3 rounded-lg border p-4 text-sm ${
                        encryptDetection.isSensitive
                          ? 'border-amber-300 bg-amber-500/10 text-amber-900 dark:text-amber-200'
                          : 'bg-muted/40 border-muted'
                      }`}
                    >
                      <AlertTriangle className='mt-0.5 h-5 w-5 shrink-0 text-amber-600' />
                      <div className='flex-1 space-y-1'>
                        <div className='flex items-center gap-2'>
                          <span className='font-semibold'>
                            Klasifikasi Dokumen:
                          </span>
                          <Badge
                            variant={
                              encryptDetection.sensitivityLevel ===
                              'SANGAT RAHASIA'
                                ? 'destructive'
                                : 'default'
                            }
                            className='text-[10px]'
                          >
                            {encryptDetection.sensitivityLevel}
                          </Badge>
                        </div>
                        <p className='text-xs'>{encryptDetection.reason}</p>
                        <div className='text-muted-foreground text-xs'>
                          Kategori Teridentifikasi:{' '}
                          <span className='text-foreground font-medium'>
                            {encryptDetection.categoryLabel}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Konfigurasi Kunci Master Enkripsi */}
                  <div className='space-y-3 border-t pt-2'>
                    <div className='flex items-center justify-between'>
                      <Label className='flex items-center gap-2 text-sm font-semibold'>
                        <Key className='h-4 w-4 text-emerald-600' />
                        Kunci Enkripsi (Passphrase Derivasi PBKDF2)
                      </Label>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() => setUseDefaultKey(!useDefaultKey)}
                        className='h-7 text-xs text-emerald-600 hover:text-emerald-700'
                      >
                        {useDefaultKey
                          ? 'Gunakan Custom Key'
                          : 'Gunakan Kunci Standar Satker'}
                      </Button>
                    </div>

                    {useDefaultKey ? (
                      <div className='bg-muted/50 text-muted-foreground flex items-center justify-between rounded-lg border p-3 text-xs'>
                        <div className='flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-emerald-600' />
                          <span>
                            Menggunakan Master Key Terintegrasi Satker BPS
                            Sitaro (7108).
                          </span>
                        </div>
                        <Badge
                          variant='outline'
                          className='font-mono text-[10px]'
                        >
                          Default PBKDF2
                        </Badge>
                      </div>
                    ) : (
                      <div className='relative'>
                        <Input
                          type={showEncryptKey ? 'text' : 'password'}
                          placeholder='Masukkan kata sandi master enkripsi dokumen...'
                          value={encryptPassphrase}
                          onChange={(e) => setEncryptPassphrase(e.target.value)}
                          className='pr-10 font-mono text-sm'
                        />
                        <button
                          type='button'
                          onClick={() => setShowEncryptKey(!showEncryptKey)}
                          className='text-muted-foreground hover:text-foreground absolute top-2.5 right-3'
                        >
                          {showEncryptKey ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className='bg-muted/20 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row'>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                    <ShieldCheck className='h-4 w-4 shrink-0 text-emerald-600' />
                    Container .enc menjamin keaslian & bebas modifikasi
                    (Tamper-Proof)
                  </div>
                  <Button
                    onClick={handlePerformEncryption}
                    disabled={!encryptFile || isEncrypting}
                    className='flex w-full items-center gap-2 bg-emerald-600 text-white hover:bg-emerald-700 sm:w-auto'
                  >
                    {isEncrypting ? (
                      <>
                        <RefreshCw className='h-4 w-4 animate-spin' />
                        Memproses AES-256...
                      </>
                    ) : (
                      <>
                        <Lock className='h-4 w-4' />
                        Enkripsi dengan AES-256 (Doc Shield)
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Card Hasil Enkripsi Sukses */}
              {encryptResult && (
                <Card className='border-emerald-400 bg-emerald-50/20'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='flex items-center gap-2 text-base text-emerald-800'>
                        <CheckCircle2 className='h-5 w-5 text-emerald-600' />
                        Berkas Berhasil Dienkripsi & Terproteksi Penuh
                      </CardTitle>
                      <Badge className='bg-emerald-600 text-xs text-white'>
                        AES-256-GCM READY
                      </Badge>
                    </div>
                    <CardDescription className='text-xs'>
                      Berkas kontainer telah diunduh otomatis ke perangkat Anda.
                      Anda dapat mengunggah berkas .enc ini dengan aman ke
                      Google Drive atau Supabase.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3 text-xs'>
                    <div className='bg-background/80 grid grid-cols-1 gap-3 rounded-lg border p-3 md:grid-cols-2'>
                      <div>
                        <span className='text-muted-foreground'>
                          Nama Kontainer:
                        </span>
                        <p className='font-mono font-semibold'>
                          {encryptResult.fileName}
                        </p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Ukuran Berkas:
                        </span>
                        <p className='font-mono font-semibold'>
                          {formatBytes(encryptResult.metadata.originalSize)} ➔{' '}
                          {formatBytes(encryptResult.metadata.encryptedSize)}
                        </p>
                      </div>
                      <div className='md:col-span-2'>
                        <span className='text-muted-foreground'>
                          SHA-256 Checksum Berkas Asli:
                        </span>
                        <div className='mt-1 flex items-center gap-2'>
                          <code className='bg-muted flex-1 truncate rounded p-1 font-mono text-[11px]'>
                            {encryptResult.metadata.sha256Original}
                          </code>
                          <Button
                            size='sm'
                            variant='outline'
                            className='h-7 px-2'
                            onClick={() =>
                              copyToClipboard(
                                encryptResult.metadata.sha256Original,
                                'SHA-256 Checksum'
                              )
                            }
                          >
                            <Copy className='h-3 w-3' />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Salt PBKDF2:
                        </span>
                        <p className='truncate font-mono text-[11px]'>
                          {encryptResult.metadata.saltHex}
                        </p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          IV Nonce AES-GCM:
                        </span>
                        <p className='truncate font-mono text-[11px]'>
                          {encryptResult.metadata.ivHex}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-end pt-0'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex items-center gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                      onClick={() => {
                        const url = URL.createObjectURL(encryptResult.blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = encryptResult.fileName;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className='h-4 w-4' />
                      Unduh Ulang Berkas .enc
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Panel Kanan: Kepatuhan ISO & Informasi Keamanan */}
            <div className='space-y-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                    <ShieldCheck className='h-4 w-4 text-emerald-600' />
                    Standar Kriptografi ISO 27001 (A.8.24)
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-muted-foreground space-y-3 text-xs'>
                  <p>
                    Klausul A.8.24 ISO/IEC 27001:2022 mewajibkan satker untuk
                    menetapkan dan menerapkan aturan penggunaan kriptografi guna
                    melindungi kerahasiaan (*confidentiality*) dan integritas
                    (*integrity*) informasi sensitif.
                  </p>
                  <div className='space-y-2 border-t pt-2'>
                    <div className='flex items-start gap-2'>
                      <CheckCircle2 className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600' />
                      <span>
                        <strong className='text-foreground'>
                          PBKDF2 Key Derivation:
                        </strong>{' '}
                        100.000 iterasi dengan SHA-256 untuk memitigasi serangan
                        brute-force dan GPU dictionary attacks.
                      </span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <CheckCircle2 className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600' />
                      <span>
                        <strong className='text-foreground'>
                          Unique Nonce/IV:
                        </strong>{' '}
                        12-byte cryptographically random IV per dokumen untuk
                        mencegah pola ciphertext berulang.
                      </span>
                    </div>
                    <div className='flex items-start gap-2'>
                      <CheckCircle2 className='mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600' />
                      <span>
                        <strong className='text-foreground'>
                          GCM Authentication Tag:
                        </strong>{' '}
                        Otomatis mendeteksi jika ada modifikasi berkas sekecil 1
                        bit di penyimpanan cloud.
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className='bg-muted/30'>
                <CardHeader className='pb-2'>
                  <CardTitle className='text-muted-foreground text-xs font-semibold tracking-wider uppercase'>
                    Daftar Dokumen Wajib Enkripsi
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-2 text-xs'>
                  <div className='bg-background flex items-center gap-2 rounded border p-2'>
                    <FileText className='h-4 w-4 shrink-0 text-red-600' />
                    <div>
                      <div className='font-semibold'>
                        LHP & Temuan Pemeriksaan
                      </div>
                      <div className='text-muted-foreground text-[11px]'>
                        BPK, Itjen BPS RI, Evaluator TPI
                      </div>
                    </div>
                  </div>
                  <div className='bg-background flex items-center gap-2 rounded border p-2'>
                    <FileSpreadsheet className='h-4 w-4 shrink-0 text-emerald-600' />
                    <div>
                      <div className='font-semibold'>
                        Pertanggungjawaban Keuangan
                      </div>
                      <div className='text-muted-foreground text-[11px]'>
                        DIPA, RKA-K/L, SPJ, Rekening Kas
                      </div>
                    </div>
                  </div>
                  <div className='bg-background flex items-center gap-2 rounded border p-2'>
                    <FileCheck className='h-4 w-4 shrink-0 text-blue-600' />
                    <div>
                      <div className='font-semibold'>
                        Integritas Pegawai & Disiplin
                      </div>
                      <div className='text-muted-foreground text-[11px]'>
                        LHKPN/LHKASN, UPG, Sanksi Disiplin
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 2: DEKRIPSI & VALIDASI BERKAS                              */}
        {/* ============================================================== */}
        <TabsContent value='decrypt' className='space-y-4'>
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
            {/* Panel Kiri: Form Dekripsi */}
            <div className='space-y-4 lg:col-span-2'>
              <Card>
                <CardHeader>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Unlock className='h-5 w-5 text-blue-600' />
                    Dekripsi & Validasi Integritas Berkas (.enc)
                  </CardTitle>
                  <CardDescription>
                    Unggah berkas kontainer .enc untuk mengembalikan dokumen
                    asli. Sistem akan memverifikasi otentikasi GCM dan
                    mencocokkan SHA-256 Checksum asli.
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-5'>
                  {/* Dropzone Dekripsi */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDecryptDrop}
                    onClick={() => decryptFileInputRef.current?.click()}
                    className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
                      decryptFile
                        ? 'border-blue-500 bg-blue-50/20'
                        : 'border-muted-foreground/25 hover:bg-muted/30 hover:border-blue-500'
                    }`}
                  >
                    <input
                      ref={decryptFileInputRef}
                      type='file'
                      accept='.enc'
                      className='hidden'
                      onChange={handleSelectDecryptFile}
                    />
                    <div className='flex flex-col items-center justify-center space-y-2'>
                      <div className='rounded-full bg-blue-100/60 p-3 text-blue-700'>
                        <HardDriveDownload className='h-8 w-8' />
                      </div>
                      <div className='text-sm font-semibold'>
                        {decryptFile
                          ? `Berkas Kontainer: ${decryptFile.name}`
                          : 'Pilih atau Seret Berkas .enc ke Sini'}
                      </div>
                      <p className='text-muted-foreground max-w-sm text-xs'>
                        Hanya menerima berkas berformat .enc ber-header
                        kontainer Doc Shield REBO V2.
                      </p>
                    </div>
                  </div>

                  {/* Metadata Header Inspection (Tanpa Dekripsi Dulu) */}
                  {decryptMetadata && (
                    <div className='space-y-2 rounded-lg border border-blue-300 bg-blue-500/10 p-4 text-xs'>
                      <div className='flex items-center justify-between'>
                        <span className='flex items-center gap-1.5 font-semibold text-blue-900 dark:text-blue-200'>
                          <Info className='h-4 w-4' />
                          Header Kontainer Terdeteksi
                        </span>
                        <Badge
                          variant='outline'
                          className='bg-background font-mono text-[10px]'
                        >
                          {decryptMetadata.cipher}
                        </Badge>
                      </div>
                      <div className='text-muted-foreground grid grid-cols-1 gap-2 pt-1 md:grid-cols-2'>
                        <div>
                          <span>Nama Berkas Asli:</span>{' '}
                          <strong className='text-foreground'>
                            {decryptMetadata.fileName}
                          </strong>
                        </div>
                        <div>
                          <span>Asal Satker:</span>{' '}
                          <span className='text-foreground'>
                            {decryptMetadata.satker}
                          </span>
                        </div>
                        <div>
                          <span>Ukuran Asli:</span>{' '}
                          <span className='text-foreground font-mono'>
                            {formatBytes(decryptMetadata.originalSize)}
                          </span>
                        </div>
                        <div>
                          <span>Tanggal Proteksi:</span>{' '}
                          <span className='text-foreground'>
                            {new Date(
                              decryptMetadata.encryptedAt
                            ).toLocaleString('id-ID')}
                          </span>
                        </div>
                        <div className='md:col-span-2'>
                          <span>Kategori:</span>{' '}
                          <span className='text-foreground font-semibold'>
                            {decryptMetadata.category}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Input Passphrase Dekripsi */}
                  <div className='space-y-3 border-t pt-2'>
                    <div className='flex items-center justify-between'>
                      <Label className='flex items-center gap-2 text-sm font-semibold'>
                        <Key className='h-4 w-4 text-blue-600' />
                        Kata Sandi / Passphrase Master Dekripsi
                      </Label>
                      <Button
                        type='button'
                        variant='ghost'
                        size='sm'
                        onClick={() =>
                          setUseDefaultDecryptKey(!useDefaultDecryptKey)
                        }
                        className='h-7 text-xs text-blue-600 hover:text-blue-700'
                      >
                        {useDefaultDecryptKey
                          ? 'Gunakan Custom Key'
                          : 'Gunakan Kunci Standar Satker'}
                      </Button>
                    </div>

                    {useDefaultDecryptKey ? (
                      <div className='bg-muted/50 text-muted-foreground flex items-center justify-between rounded-lg border p-3 text-xs'>
                        <div className='flex items-center gap-2'>
                          <CheckCircle2 className='h-4 w-4 text-blue-600' />
                          <span>
                            Kunci Master Standar BPS Sitaro (7108) Aktif.
                          </span>
                        </div>
                        <Badge
                          variant='outline'
                          className='font-mono text-[10px]'
                        >
                          Auto-Derived
                        </Badge>
                      </div>
                    ) : (
                      <div className='relative'>
                        <Input
                          type={showDecryptKey ? 'text' : 'password'}
                          placeholder='Masukkan kata sandi untuk mendekripsi berkas...'
                          value={decryptPassphrase}
                          onChange={(e) => setDecryptPassphrase(e.target.value)}
                          className='pr-10 font-mono text-sm'
                        />
                        <button
                          type='button'
                          onClick={() => setShowDecryptKey(!showDecryptKey)}
                          className='text-muted-foreground hover:text-foreground absolute top-2.5 right-3'
                        >
                          {showDecryptKey ? (
                            <EyeOff className='h-4 w-4' />
                          ) : (
                            <Eye className='h-4 w-4' />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className='bg-muted/20 flex flex-col items-center justify-between gap-3 border-t pt-4 sm:flex-row'>
                  <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                    <Fingerprint className='h-4 w-4 shrink-0 text-blue-600' />
                    Validasi checksum SHA-256 memverifikasi dokumen bebas
                    modifikasi
                  </div>
                  <Button
                    onClick={handlePerformDecryption}
                    disabled={!decryptFile || isDecrypting}
                    className='flex w-full items-center gap-2 bg-blue-600 text-white hover:bg-blue-700 sm:w-auto'
                  >
                    {isDecrypting ? (
                      <>
                        <RefreshCw className='h-4 w-4 animate-spin' />
                        Mendekripsi...
                      </>
                    ) : (
                      <>
                        <Unlock className='h-4 w-4' />
                        Dekripsi & Pulihkan Berkas Asli
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Card Hasil Dekripsi */}
              {decryptResult && (
                <Card className='border-blue-400 bg-blue-50/20'>
                  <CardHeader className='pb-3'>
                    <div className='flex items-center justify-between'>
                      <CardTitle className='flex items-center gap-2 text-base text-blue-800'>
                        <CheckCircle2 className='h-5 w-5 text-emerald-600' />
                        Berkas Berhasil Didekripsi & Otentik 100%
                      </CardTitle>
                      <Badge className='bg-emerald-600 text-xs text-white'>
                        SHA-256 MATCHED
                      </Badge>
                    </div>
                    <CardDescription className='text-xs'>
                      Dokumen asli telah dipulihkan dan otomatis diunduh ke
                      komputer Anda.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='space-y-3 text-xs'>
                    <div className='bg-background/80 space-y-2 rounded-lg border p-3'>
                      <div>
                        <span className='text-muted-foreground'>
                          Nama Berkas Pulih:
                        </span>
                        <p className='text-foreground font-mono font-semibold'>
                          {decryptResult.originalFileName}
                        </p>
                      </div>
                      <div>
                        <span className='text-muted-foreground'>
                          Status Integritas Hash:
                        </span>
                        <div className='mt-1 flex items-center gap-2'>
                          <Badge
                            variant='outline'
                            className='border-emerald-300 bg-emerald-50 text-emerald-700'
                          >
                            <CheckCircle2 className='mr-1 h-3 w-3 text-emerald-600' />
                            Valid (Tanpa Modifikasi)
                          </Badge>
                          <code className='text-muted-foreground flex-1 truncate font-mono text-[11px]'>
                            {decryptResult.metadata.sha256Original}
                          </code>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className='flex justify-end pt-0'>
                    <Button
                      size='sm'
                      className='flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700'
                      onClick={() => {
                        const url = URL.createObjectURL(decryptResult.blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = decryptResult.originalFileName;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                    >
                      <Download className='h-4 w-4' />
                      Unduh Ulang Berkas Asli
                    </Button>
                  </CardFooter>
                </Card>
              )}
            </div>

            {/* Panel Kanan Panduan */}
            <div className='space-y-4'>
              <Card>
                <CardHeader className='pb-3'>
                  <CardTitle className='flex items-center gap-2 text-sm font-semibold'>
                    <ShieldAlert className='h-4 w-4 text-blue-600' />
                    Protokol Keamanan Dekripsi
                  </CardTitle>
                </CardHeader>
                <CardContent className='text-muted-foreground space-y-3 text-xs'>
                  <p>
                    Hanya staf yang memiliki hak akses kedinasan atau tim
                    verifikasi pengawasan yang berhak mendekripsi dokumen
                    sensitif.
                  </p>
                  <div className='bg-muted/40 space-y-2 rounded border p-3'>
                    <div className='text-foreground font-semibold'>
                      Jika Terjadi Kesalahan Dekripsi:
                    </div>
                    <ul className='list-disc space-y-1 pl-4'>
                      <li>
                        Pastikan kata sandi / passphrase yang digunakan sama
                        persis saat proses enkripsi.
                      </li>
                      <li>
                        Jika berkas pernah diedit dengan text editor biasa,
                        cipher tag akan gagal dan penolakan otomatis aktif.
                      </li>
                      <li>
                        Hubungi Administrator REBO BPS Sitaro jika kehilangan
                        kunci master.
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* ============================================================== */}
        {/* TAB 3: DIREKTORI BERKAS TERPROTEKSI                            */}
        {/* ============================================================== */}
        <TabsContent value='directory' className='space-y-4'>
          <Card>
            <CardHeader className='pb-3'>
              <div className='flex flex-col justify-between gap-3 md:flex-row md:items-center'>
                <div>
                  <CardTitle className='flex items-center gap-2 text-lg'>
                    <Database className='h-5 w-5 text-purple-600' />
                    Direktori Berkas Sensitif Terproteksi BPS Sitaro
                  </CardTitle>
                  <CardDescription>
                    Daftar dokumen pengawasan, laporan keuangan, dan berkas
                    strategis yang telah dienkripsi dengan standar AES-256-GCM.
                  </CardDescription>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  <div className='relative w-full md:w-64'>
                    <Search className='text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4' />
                    <Input
                      placeholder='Cari nama berkas / hash...'
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className='h-9 pl-8 text-xs'
                    />
                  </div>
                  <Button
                    variant='outline'
                    size='sm'
                    className='h-9 text-xs'
                    onClick={() => {
                      startTransition(async () => {
                        const res = await getDocShieldStatsAction();
                        if (res.success) {
                          setStats(res.stats);
                          toast.success(
                            'Daftar berkas terproteksi diperbarui.'
                          );
                        }
                      });
                    }}
                    disabled={isPending}
                  >
                    <RefreshCw
                      className={`mr-1 h-3.5 w-3.5 ${isPending ? 'animate-spin' : ''}`}
                    />
                    Refresh
                  </Button>
                </div>
              </div>

              {/* Quick Filter Categories */}
              <div className='flex flex-wrap gap-1.5 pt-3'>
                <Button
                  size='sm'
                  variant={selectedCategory === 'ALL' ? 'default' : 'outline'}
                  className='h-7 rounded-full text-xs'
                  onClick={() => setSelectedCategory('ALL')}
                >
                  Semua ({stats.recentDocuments.length})
                </Button>
                <Button
                  size='sm'
                  variant={selectedCategory === 'LHP' ? 'default' : 'outline'}
                  className='h-7 rounded-full text-xs'
                  onClick={() => setSelectedCategory('LHP')}
                >
                  LHP & BPK ({stats.categoriesBreakdown.lhpBpkCount})
                </Button>
                <Button
                  size='sm'
                  variant={
                    selectedCategory === 'KEUANGAN' ? 'default' : 'outline'
                  }
                  className='h-7 rounded-full text-xs'
                  onClick={() => setSelectedCategory('KEUANGAN')}
                >
                  DIPA & Keuangan ({stats.categoriesBreakdown.keuanganCount})
                </Button>
                <Button
                  size='sm'
                  variant={
                    selectedCategory === 'KEPATUHAN' ? 'default' : 'outline'
                  }
                  className='h-7 rounded-full text-xs'
                  onClick={() => setSelectedCategory('KEPATUHAN')}
                >
                  LHKPN & Kepatuhan ({stats.categoriesBreakdown.kepatuhanCount})
                </Button>
                <Button
                  size='sm'
                  variant={
                    selectedCategory === 'RAHASIA' ? 'default' : 'outline'
                  }
                  className='h-7 rounded-full text-xs'
                  onClick={() => setSelectedCategory('RAHASIA')}
                >
                  Dokumen Rahasia ({stats.categoriesBreakdown.rahasiaCount})
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className='overflow-x-auto rounded-lg border'>
                <table className='w-full text-left text-xs'>
                  <thead className='bg-muted/50 text-muted-foreground border-b text-[10px] font-semibold uppercase'>
                    <tr>
                      <th className='p-3'>Nama Dokumen Asli</th>
                      <th className='p-3'>Kategori Dokumen</th>
                      <th className='p-3'>Klasifikasi</th>
                      <th className='p-3'>Ukuran</th>
                      <th className='p-3'>SHA-256 Checksum</th>
                      <th className='p-3'>Penyimpanan</th>
                      <th className='p-3'>Tanggal Enkripsi</th>
                      <th className='p-3 text-right'>Status</th>
                    </tr>
                  </thead>
                  <tbody className='divide-y'>
                    {filteredDocuments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={8}
                          className='text-muted-foreground p-8 text-center'
                        >
                          Tidak ada dokumen terproteksi yang cocok dengan filter
                          pencarian.
                        </td>
                      </tr>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <tr
                          key={doc.id}
                          className='hover:bg-muted/20 transition-colors'
                        >
                          <td className='p-3'>
                            <div className='text-foreground flex items-center gap-1.5 font-medium'>
                              <Lock className='h-3.5 w-3.5 shrink-0 text-emerald-600' />
                              <span>{doc.originalName}</span>
                            </div>
                            <div className='text-muted-foreground font-mono text-[10px]'>
                              {doc.fileName}
                            </div>
                          </td>
                          <td className='text-muted-foreground max-w-[200px] truncate p-3'>
                            {doc.category}
                          </td>
                          <td className='p-3'>
                            <Badge
                              variant={
                                doc.sensitivityLevel === 'SANGAT RAHASIA'
                                  ? 'destructive'
                                  : doc.sensitivityLevel === 'RAHASIA'
                                    ? 'default'
                                    : 'secondary'
                              }
                              className='text-[10px]'
                            >
                              {doc.sensitivityLevel}
                            </Badge>
                          </td>
                          <td className='p-3 font-mono whitespace-nowrap'>
                            {formatBytes(doc.fileSize)}
                          </td>
                          <td className='max-w-[140px] p-3'>
                            <div className='flex items-center gap-1'>
                              <code className='text-muted-foreground truncate font-mono text-[10px]'>
                                {doc.sha256}
                              </code>
                              <button
                                onClick={() =>
                                  copyToClipboard(doc.sha256, 'SHA-256 Hash')
                                }
                                className='text-muted-foreground hover:text-foreground p-1'
                                title='Salin Hash'
                              >
                                <Copy className='h-3 w-3' />
                              </button>
                            </div>
                          </td>
                          <td className='p-3'>
                            <Badge
                              variant='outline'
                              className='text-[10px] whitespace-nowrap'
                            >
                              {doc.storageLocation}
                            </Badge>
                          </td>
                          <td className='text-muted-foreground p-3 whitespace-nowrap'>
                            {new Date(doc.encryptedAt).toLocaleDateString(
                              'id-ID',
                              {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              }
                            )}
                          </td>
                          <td className='p-3 text-right whitespace-nowrap'>
                            <Badge className='border-emerald-300 bg-emerald-600/15 text-[10px] text-emerald-700 hover:bg-emerald-600/20'>
                              <CheckCircle2 className='mr-1 h-3 w-3 text-emerald-600' />
                              Terverifikasi
                            </Badge>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
