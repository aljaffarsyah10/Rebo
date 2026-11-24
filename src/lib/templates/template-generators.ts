/**
 * Generator & Master Data Template Baku Bukti Dukung ZI
 * BPS Kabupaten Kepulauan Siau Tagulandang Biaro (Sitaro)
 *
 * Menghasilkan berkas template standar resmi (DOCX, XLSX, PPTX, dan bundle ZIP)
 * untuk 5 dokumen wajib QA dan kepatuhan regulasi PermenPAN-RB No. 90/2021.
 */

import JSZip from 'jszip';

export interface BakuTemplateItem {
  id: string;
  code: string;
  title: string;
  kategori:
    | 'Surat & Administrasi'
    | 'Rapat & Notula'
    | 'Presensi Kegiatan'
    | 'Monev & Akuntabilitas'
    | 'Dokumentasi Visual'
    | 'Pengawasan & Integritas';
  format: 'DOCX' | 'XLSX' | 'PPTX';
  fileExtension: string;
  ukuranEst: string;
  filename: string;
  deskripsi: string;
  poinWajib: string[];
  tipsQA: string;
  pilarTerkait: string;
  gdriveUrl: string;
}

export const MASTER_TEMPLATE_LIST: BakuTemplateItem[] = [
  {
    id: 'undangan',
    code: 'TPL-01-UND',
    title: 'Template Surat Undangan / Nota Dinas Resmi',
    kategori: 'Surat & Administrasi',
    format: 'DOCX',
    fileExtension: '.docx',
    ukuranEst: '48 KB',
    filename: '01_Template_Surat_Undangan_BPS_Sitaro.docx',
    deskripsi:
      'Format resmi tata naskah dinas BPS Kabupaten Kepulauan Sitaro untuk mengundang rapat koordinasi, sosialisasi, FGD internal, maupun evaluasi pilar ZI.',
    poinWajib: [
      'Kop Resmi BPS Kabupaten Kepulauan Sitaro',
      'Nomor Surat / Nota Dinas sesuai tata naskah dinas',
      'Waktu, Tanggal, Tempat Pelaksanaan (Fisik / Daring)',
      'Agenda Rapat yang jelas & spesifik',
      'Tanda Tangan Pimpinan / Ketua Tim ZI'
    ],
    tipsQA:
      'Pastikan tanggal undangan dibuat minimal H-2 sebelum hari rapat dilaksanakan. Cocokkan nomor surat dengan agenda pada notula.',
    pilarTerkait: 'Pilar 1 s.d. Pilar 6 (Semua Indikator Rapat)',
    gdriveUrl:
      'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing'
  },
  {
    id: 'notula',
    code: 'TPL-02-NOT',
    title: 'Template Notula Rapat & Risalah Hasil Pembahasan',
    kategori: 'Rapat & Notula',
    format: 'DOCX',
    fileExtension: '.docx',
    ukuranEst: '54 KB',
    filename: '02_Template_Notula_Rapat_BPS_Sitaro.docx',
    deskripsi:
      'Format baku risalah rapat pembangunan ZI mencakup pimpinan rapat, agenda pokok, dinamika pembahasan 6 pilar, kesimpulan, serta matriks tindak lanjut (Action Items).',
    poinWajib: [
      'Nama Hari, Tanggal, Pukul, dan Tempat Rapat',
      'Daftar Pimpinan Rapat dan Notulis Resmi',
      'Ringkasan Arahan & Pembahasan per Pilar',
      'Matriks Tindak Lanjut: Masalah, Rencana Aksi, PIC, & Deadline',
      'Tanda Tangan Pimpinan Rapat dan Notulis'
    ],
    tipsQA:
      'Verifikator TPI mewajibkan adanya Matriks Tindak Lanjut lengkap dengan batas waktu dan penanggung jawab yang terdefinisi jelas.',
    pilarTerkait: 'Pilar 1, Pilar 2, Pilar 3, Pilar 4, Pilar 5, Pilar 6',
    gdriveUrl:
      'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing'
  },
  {
    id: 'daftar_hadir',
    code: 'TPL-03-ABS',
    title: 'Template Daftar Hadir Rapat & Presensi Fisik/Daring',
    kategori: 'Presensi Kegiatan',
    format: 'XLSX',
    fileExtension: '.xlsx',
    ukuranEst: '32 KB',
    filename: '03_Template_Daftar_Hadir_Rapat_BPS_Sitaro.xlsx',
    deskripsi:
      'Buku presensi kegiatan berformat tabel spreadsheet rapi mencakup kolom identitas pegawai, NIP, jabatan, instansi asal, tanda tangan fisik, atau log kehadiran daring.',
    poinWajib: [
      'Header Nama Acara & Waktu Pelaksanaan',
      'Kolom: No, Nama Lengkap & Gelar, NIP/NIK',
      'Kolom: Pangkat/Golongan, Jabatan / Unit Kerja',
      'Kolom: Tanda Tangan Fisik / Status Hadir Daring',
      'Rekapitulasi Total Hadir, Sakit, & Izin'
    ],
    tipsQA:
      'Untuk rapat hybrid/online via Zoom, sertakan log ekspor chat / attendance report dari sistem video conference sebagai bukti valid.',
    pilarTerkait: 'Seluruh Kegiatan Koordinasi & Monev',
    gdriveUrl:
      'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing'
  },
  {
    id: 'laporan_monev',
    code: 'TPL-04-MON',
    title: 'Template Laporan Monitoring & Evaluasi Pelaksanaan Kegiatan',
    kategori: 'Monev & Akuntabilitas',
    format: 'DOCX',
    fileExtension: '.docx',
    ukuranEst: '68 KB',
    filename: '04_Template_Laporan_Monev_Kegiatan_BPS_Sitaro.docx',
    deskripsi:
      'Format komprehensif laporan monev berkala (bulanan/triwulanan/semesteran) mencakup Bab I Pendahuluan, Bab II Capaian Indikator, Bab III Kendala, dan Bab IV Rekomendasi Solusi.',
    poinWajib: [
      'Sistematika 4 Bab Resmi Standar BPS',
      'Matriks Capaian Kinerja vs Target Realistis',
      'Identifikasi Kendala Teknis & Mitigasi Risiko',
      'Rekomendasi Strategis untuk Pimpinan',
      'Lampiran Dokumentasi Foto & Ringkasan LKE'
    ],
    tipsQA:
      'Pastikan terdapat perbandingan progres berkala (misal Triwulan I vs Triwulan II) untuk membuktikan adanya keberlanjutan perubahan.',
    pilarTerkait: 'Pilar 4 Akuntabilitas & Seluruh Monev Pilar',
    gdriveUrl:
      'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing'
  },
  {
    id: 'kolase_foto',
    code: 'TPL-05-FOT',
    title: 'Template Format Kolase Dokumentasi Foto & Publikasi Banner',
    kategori: 'Dokumentasi Visual',
    format: 'PPTX',
    fileExtension: '.pptx',
    ukuranEst: '120 KB',
    filename: '05_Template_Kolase_Dokumentasi_Foto_BPS_Sitaro.pptx',
    deskripsi:
      'Format tata letak 4-frame foto dokumentasi ber-geotagging & timestamp mencakup pembukaan, dinamika forum, penandatanganan komitmen, spanduk publikasi, dan narasi 5W1H.',
    poinWajib: [
      'Metadata Foto: Tanggal, Waktu, dan Koordinat Lokasi',
      'Frame 1: Foto Sambutan / Pembukaan Pimpinan',
      'Frame 2: Foto Partisipasi Peserta / Diskusi Forum',
      'Frame 3: Foto Penyerahan Dokumen / Tanda Tangan',
      'Frame 4: Banner / Spanduk Sosialisasi ZI',
      'Narasi Keterangan Kegiatan Singkat (5W + 1H)'
    ],
    tipsQA:
      'Foto wajib jelas (tidak buram) dan memuat penanda waktu/tempat. Hindari mengunggah foto selfie atau foto tanpa konteks rapat.',
    pilarTerkait: 'Pilar 1, Pilar 2, Pilar 5, Pilar 6',
    gdriveUrl:
      'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing'
  },
  {
    id: 'pakta_integritas',
    code: 'TPL-06-PAK',
    title: 'Template Surat Pernyataan Bebas Gratifikasi & Pakta Integritas',
    kategori: 'Pengawasan & Integritas',
    format: 'DOCX',
    fileExtension: '.docx',
    ukuranEst: '44 KB',
    filename: '06_Template_Pakta_Integritas_Komitmen_BPS_Sitaro.docx',
    deskripsi:
      'Surat pernyataan komitmen individu dan unit kerja bebas suap, pungli, serta gratifikasi sesuai standar pencegahan korupsi KPK dan penguatan pengawasan Pilar 5.',
    poinWajib: [
      'Identitas Lengkap Pegawai (Nama, NIP, Jabatan)',
      '6 Poin Komitmen Bebas Korupsi, Kolusi, dan Nepotisme',
      'Klausul Kesiapan Menerima Sanksi Hukum & Disiplin',
      'Kolom Materai Rp 10.000 dan Tanda Tangan Pegawai',
      'Pengesahan Mengetahui Kepala BPS Kabupaten Kepulauan Sitaro'
    ],
    tipsQA:
      'Wajib diisi oleh seluruh pegawai (PNS, PPPK, dan PPNPN) serta diperbarui setiap awal tahun periode evaluasi Zona Integritas.',
    pilarTerkait: 'Pilar 5 Penguatan Pengawasan (Sub-Pilar UPG & WBS)',
    gdriveUrl:
      'https://drive.google.com/drive/folders/1GgIbNOoKb98xNtBXZcqyYahFAdd4ZtF_?usp=sharing'
  }
];

// ============================================================================
// HELPER GENERATOR DOKUMEN OPENXML REAL
// ============================================================================

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Membuat file Word .docx OpenXML asli menggunakan JSZip
 */
export async function createDocxFile(
  title: string,
  paragraphs: string[]
): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );

  // 3. word/document.xml
  const pXmls = paragraphs
    .map((p) => {
      const isHeader =
        p.startsWith('===') ||
        p.startsWith('BADAN PUSAT') ||
        p.startsWith('BAB');
      const isSub =
        p.startsWith('---') || p.startsWith('I.') || p.startsWith('II.');
      const isBold = isHeader || isSub || p.includes(':');
      const align = isHeader ? 'center' : 'left';
      const cleanText = escapeXml(p.replace(/^[=\-]+\s*/, ''));

      return `<w:p>
        <w:pPr>
          <w:jc w:val="${align}"/>
          <w:spacing w:after="160" w:line="276" w:lineRule="auto"/>
        </w:pPr>
        <w:r>
          <w:rPr>
            <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
            ${isBold ? '<w:b/>' : ''}
            <w:sz w:val="${isHeader ? '28' : '22'}"/>
            ${isHeader ? '<w:color w:val="0B3954"/>' : '<w:color w:val="2D3142"/>'}
          </w:rPr>
          <w:t xml:space="preserve">${cleanText}</w:t>
        </w:r>
      </w:p>`;
    })
    .join('\n');

  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="80"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:b/>
          <w:sz w:val="26"/>
          <w:color w:val="005691"/>
        </w:rPr>
        <w:t>BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:spacing w:after="240"/>
      </w:pPr>
      <w:r>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:sz w:val="18"/>
          <w:color w:val="666666"/>
        </w:rPr>
        <w:t>Jl. Lokongbanua, Ondong, Siau Barat, Kab. Kepulauan Sitaro, Sulawesi Utara 95862</w:t>
      </w:r>
    </w:p>
    <w:p>
      <w:pPr>
        <w:pBdr>
          <w:bottom w:val="single" w:sz="18" w:space="4" w:color="005691"/>
        </w:pBdr>
        <w:spacing w:after="300"/>
      </w:pPr>
      <w:r><w:t></w:t></w:r>
    </w:p>
    ${pXmls}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/>
    </w:sectPr>
  </w:body>
</w:document>`
  );

  return await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  });
}

/**
 * Membuat file Excel .xlsx OpenXML asli menggunakan JSZip
 */
export async function createXlsxFile(
  title: string,
  rowsData: string[][]
): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`
  );

  // 3. xl/_rels/workbook.xml.rels
  zip.file(
    'xl/_rels/workbook.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>`
  );

  // 4. xl/workbook.xml
  zip.file(
    'xl/workbook.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Daftar Hadir ZI" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>`
  );

  // 5. xl/worksheets/sheet1.xml
  const rowsXml = rowsData
    .map((cols, rIndex) => {
      const rowNum = rIndex + 1;
      const cXmls = cols
        .map((val, cIndex) => {
          const colLetter = String.fromCharCode(65 + cIndex);
          const cellRef = `${colLetter}${rowNum}`;
          const clean = escapeXml(val);
          return `<c r="${cellRef}" t="inlineStr"><is><t>${clean}</t></is></c>`;
        })
        .join('');
      return `<row r="${rowNum}">${cXmls}</row>`;
    })
    .join('\n');

  zip.file(
    'xl/worksheets/sheet1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    ${rowsXml}
  </sheetData>
</worksheet>`
  );

  return await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
}

/**
 * Membuat file PowerPoint .pptx OpenXML asli menggunakan JSZip
 */
export async function createPptxFile(
  title: string,
  agenda: string
): Promise<Blob> {
  const zip = new JSZip();

  // 1. [Content_Types].xml
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  <Override PartName="/ppt/slides/slide1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>
</Types>`
  );

  // 2. _rels/.rels
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`
  );

  // 3. ppt/_rels/presentation.xml.rels
  zip.file(
    'ppt/_rels/presentation.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/>
</Relationships>`
  );

  // 4. ppt/presentation.xml
  zip.file(
    'ppt/presentation.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>
    <p:sldId id="256" r:id="rId1"/>
  </p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000" type="screen16x9"/>
</p:presentation>`
  );

  // 5. ppt/slides/slide1.xml
  zip.file(
    'ppt/slides/slide1.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr>
        <p:cNvPr id="1" name=""/>
        <p:cNvGrpSpPr/>
        <p:nvPr/>
      </p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="2" name="Title"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="838200" y="500000"/>
            <a:ext cx="10515600" cy="1200000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="2800" b="1">
                <a:solidFill><a:srgbClr val="005691"/></a:solidFill>
              </a:rPr>
              <a:t>${escapeXml(title)}</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="1600" i="1">
                <a:solidFill><a:srgbClr val="555555"/></a:solidFill>
              </a:rPr>
              <a:t>Badan Pusat Statistik Kabupaten Kepulauan Sitaro - ${escapeXml(agenda)}</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
      <p:sp>
        <p:nvSpPr>
          <p:cNvPr id="3" name="KolaseInfo"/>
          <p:cNvSpPr/>
          <p:nvPr/>
        </p:nvSpPr>
        <p:spPr>
          <a:xfrm>
            <a:off x="838200" y="2000000"/>
            <a:ext cx="10515600" cy="4200000"/>
          </a:xfrm>
        </p:spPr>
        <p:txBody>
          <a:bodyPr/>
          <a:lstStyle/>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="1800" b="1">
                <a:solidFill><a:srgbClr val="111111"/></a:solidFill>
              </a:rPr>
              <a:t>[STANDAR 4-FRAME DOKUMENTASI KEGIATAN &amp; PUBLIKASI BANNER]</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="1400"/>
              <a:t>1. Frame 1: Sambutan / Pembukaan oleh Kepala BPS / Ketua Tim ZI</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="1400"/>
              <a:t>2. Frame 2: Forum Diskusi &amp; Pembahasan Eviden Peserta Rapat</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="1400"/>
              <a:t>3. Frame 3: Penandatanganan Notula / Komitmen Bersama</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="1400"/>
              <a:t>4. Frame 4: Spanduk Banner / Publikasi Media Pelayanan Publik</a:t>
            </a:r>
          </a:p>
          <a:p>
            <a:r>
              <a:rPr lang="id-ID" sz="1300" i="1">
                <a:solidFill><a:srgbClr val="666666"/></a:solidFill>
              </a:rPr>
              <a:t>*Pastikan kamera mengaktifkan stempel geotagging koordinat Kabupaten Kepulauan Sitaro.</a:t>
            </a:r>
          </a:p>
        </p:txBody>
      </p:sp>
    </p:spTree>
  </p:cSld>
</p:sld>`
  );

  return await zip.generateAsync({
    type: 'blob',
    mimeType:
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  });
}

// ============================================================================
// CONTENT GENERATOR SPESIFIK TIAP TEMPLATE
// ============================================================================

export async function generateTemplateBlob(
  templateId: string
): Promise<{ blob: Blob; filename: string }> {
  const item = MASTER_TEMPLATE_LIST.find((t) => t.id === templateId);
  if (!item) {
    throw new Error(`Template dengan ID '${templateId}' tidak ditemukan.`);
  }

  switch (item.id) {
    case 'undangan': {
      const p = [
        '=== NOTA DINAS / SURAT UNDANGAN RESMI ===',
        'Nomor: B-120/71080/VS.100/03/2026',
        'Sifat: Segera',
        'Lampiran: 1 (satu) Berkas Jadwal',
        'Hal: Undangan Rapat Koordinasi Akselerasi Pembangunan ZI Menuju WBK/WBBM',
        '',
        'Yth. Bapak/Ibu Anggota Tim Kerja Pembangunan ZI BPS Kab. Kepulauan Sitaro',
        'di Tempat',
        '',
        'Dalam rangka menindaklanjuti Keputusan Kepala BPS Kabupaten Kepulauan Siau Tagulandang Biaro tentang Penetapan Tim Kerja Pembangunan Zona Integritas serta percepatan pemenuhan Lembar Kerja Evaluasi (LKE) tahun berjalan, bersama ini kami mengundang Bapak/Ibu untuk hadir pada rapat koordinasi yang akan dilaksanakan pada:',
        '',
        'Hari / Tanggal : Senin, 16 Maret 2026',
        'Waktu          : Pukul 09.00 WITA - Selesai',
        'Tempat         : Ruang Rapat Pimpinan BPS Kabupaten Kepulauan Sitaro / Hybrid via Zoom',
        'Agenda         : 1. Evaluasi Capaian Pemenuhan Eviden 6 Pilar Reformasi Birokrasi',
        '                 2. Mitigasi Catatan Reviu Tim Verifikator Internal & QA Checklist',
        '                 3. Rencana Aksi Inovasi Pelayanan Statistik Terpadu (PST)',
        '',
        'Mengingat pentingnya agenda pembahasan tersebut, dimohon kehadiran tepat waktu dengan membawa kelengkapan data dukung pilar masing-masing.',
        '',
        'Demikian undangan ini kami sampaikan, atas perhatian dan kerjasama Bapak/Ibu diucapkan terima kasih.',
        '',
        'Ondong, 12 Maret 2026',
        'Kepala BPS Kabupaten Kepulauan Siau Tagulandang Biaro',
        '',
        '(Tanda Tangan & Cap Dinas)',
        '',
        'Nama Kepala BPS Sitaro, S.Si., M.Si.',
        'NIP. 19800101 200312 1 001'
      ];
      const blob = await createDocxFile(item.title, p);
      return { blob, filename: item.filename };
    }

    case 'notula': {
      const p = [
        '=== NOTULA RAPAT KOORDINASI TIM KERJA ZONA INTEGRITAS ===',
        'BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO',
        '',
        'I. PELAKSANAAN RAPAT',
        'Hari / Tanggal  : Senin, 16 Maret 2026',
        'Waktu           : 09.00 - 12.30 WITA',
        'Tempat          : Ruang Rapat BPS Sitaro (Hybrid)',
        'Pimpinan Rapat  : Kepala BPS Kab. Kepulauan Sitaro / Ketua Tim Pembangunan ZI',
        'Notulis         : Sekretaris Tim Kerja ZI',
        'Peserta Hadir   : 18 Orang (Daftar Hadir Terlampir)',
        '',
        'II. AGENDA RAPAT',
        '1. Pembukaan dan arahan kebijakan integritas dari Kepala BPS Kab. Kepulauan Sitaro.',
        '2. Paparan progres pemenuhan bukti dukung per pilar (Pilar 1 s.d. Pilar 6).',
        '3. Pembahasan hasil pengujian mandiri QA Checklist (5 Dokumen Kunci).',
        '4. Perumusan kesepakatan tindak lanjut dan mitigasi risiko.',
        '',
        'III. RINGKASAN PEMBAHASAN',
        '- Pilar 1: Sosialisasi budaya kerja BerAKHLAK telah terlaksana 100%. Perlu penambahan laporan monev berkala agen perubahan.',
        '- Pilar 2: SOP pelayanan statistik telah terdigitalisasi. Tautan portal publikasi perlu divalidasi izin Google Drive (publik).',
        '- Pilar 3: Rekap penilaian kinerja SKP pegawai telah selesai. Perlu kelengkapan dokumen pola mutasi dan reward triwulanan.',
        '- Pilar 4: Dokumen Renstra dan Perjanjian Kinerja (PK) telah selaras. Capaian IKU Triwulan I melampaui target (102.4%).',
        '- Pilar 5: Kanal Whistleblowing System (WBS) dan Unit Pengendalian Gratifikasi (UPG) aktif. Nihil laporan fraud/gratifikasi.',
        '- Pilar 6: Inovasi layanan PST konsultasi virtual telah diujicobakan. Nilai survei kepuasan IKM mencapai 3.86 (Sangat Baik).',
        '',
        'IV. KESIMPULAN & MATRIKS RENCANA TINDAK LANJUT',
        '1. Pilar 1: Finalisasi laporan agen perubahan - PIC: Operator Pilar 1 - Batas: 20 Maret 2026.',
        '2. Pilar 5: Penandatanganan komitmen pakta integritas pegawai baru - PIC: Koordinator Pilar 5 - Batas: 23 Maret 2026.',
        '3. Seluruh dokumen eviden wajib lolos pengecekan Heuristik QA di aplikasi REBO sebelum diajukan ke Verifikator.',
        '',
        'Pimpinan Rapat,                              Notulis Rapat,',
        '',
        '',
        '(Ketua Tim Pembangunan ZI)                  (Sekretaris Tim Kerja)'
      ];
      const blob = await createDocxFile(item.title, p);
      return { blob, filename: item.filename };
    }

    case 'daftar_hadir': {
      const rows = [
        ['BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO'],
        ['DAFTAR HADIR PESERTA RAPAT PEMBANGUNAN ZONA INTEGRITAS (ZI)'],
        [
          'Kegiatan: Rapat Koordinasi & Evaluasi Pemenuhan Eviden LKE Menuju WBK/WBBM'
        ],
        [
          'Hari/Tanggal: Senin, 16 Maret 2026 | Tempat: Ruang Rapat Kantor BPS Sitaro'
        ],
        [''],
        [
          'No',
          'Nama Pegawai / Peserta',
          'NIP / NIK',
          'Pangkat / Golongan',
          'Jabatan / Unit Kerja',
          'Peran Tim ZI',
          'Status Kehadiran',
          'Tanda Tangan / Verifikasi Daring'
        ],
        [
          '1',
          'Kepala BPS Sitaro, S.Si., M.Si.',
          '19800101 200312 1 001',
          'Pembina / IV a',
          'Kepala BPS Kab. Sitaro',
          'Penanggung Jawab',
          'Hadir Fisik',
          '1. [Ttd Fisik]'
        ],
        [
          '2',
          'Kasubbag Umum BPS Sitaro, S.E.',
          '19850512 200801 1 004',
          'Penata Tk.I / III d',
          'Subbagian Umum',
          'Ketua Tim ZI',
          'Hadir Fisik',
          '2. [Ttd Fisik]'
        ],
        [
          '3',
          'Koordinator Fungsi Statistik Sosial',
          '19880720 201012 2 003',
          'Penata / III c',
          'Statistik Sosial',
          'Koordinator Pilar 1',
          'Hadir Fisik',
          '3. [Ttd Fisik]'
        ],
        [
          '4',
          'Statistisi Ahli Pertama',
          '19920315 201502 1 002',
          'Penata Muda Tk.I / III b',
          'Statistik Produksi',
          'Operator Pilar 2',
          'Hadir Fisik',
          '4. [Ttd Fisik]'
        ],
        [
          '5',
          'Pranata Komputer Ahli Pertama',
          '19941108 201801 1 001',
          'Penata Muda Tk.I / III b',
          'IPDS / IT',
          'Operator Pilar 3',
          'Hadir Daring (Zoom)',
          '5. [Verified Zoom]'
        ],
        [
          '6',
          'Analis Kepegawaian',
          '19960228 201903 2 004',
          'Penata Muda / III a',
          'Subbagian Umum',
          'Operator Pilar 4',
          'Hadir Fisik',
          '6. [Ttd Fisik]'
        ],
        [
          '7',
          'Bendahara Pengeluaran',
          '19900910 201210 1 003',
          'Penata Muda Tk.I / III b',
          'Keuangan',
          'Koordinator Pilar 5',
          'Hadir Fisik',
          '7. [Ttd Fisik]'
        ],
        [
          '8',
          'Petugas Pelayanan Statistik Terpadu',
          '19970814 202102 2 005',
          'Pengatur / II c',
          'PST / Humas',
          'Operator Pilar 6',
          'Hadir Fisik',
          '8. [Ttd Fisik]'
        ],
        [''],
        ['Rekapitulasi Kehadiran: Total Peserta: 8 Orang | Hadir: 8 | Izin: 0'],
        ['Mengetahui, Pimpinan Rapat / Kepala BPS Kab. Kepulauan Sitaro']
      ];
      const blob = await createXlsxFile(item.title, rows);
      return { blob, filename: item.filename };
    }

    case 'laporan_monev': {
      const p = [
        '=== LAPORAN MONITORING DAN EVALUASI PELAKSANAAN PEMBANGUNAN ZONA INTEGRITAS ===',
        'PERIODE SEMESTER I TAHUN BERJALAN',
        'BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO',
        '',
        'BAB I. PENDAHULUAN',
        '1.1 Latar Belakang',
        'Pembangunan Zona Integritas (ZI) menuju Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi Bersih dan Melayani (WBBM) merupakan wujud komitmen BPS Kabupaten Kepulauan Sitaro dalam meningkatkan integritas aparatur serta kualitas pelayanan publik.',
        '1.2 Landasan Hukum',
        'Peraturan Menteri Pendayagunaan Aparatur Negara dan Reformasi Birokrasi Nomor 90 Tahun 2021 tentang Pembangunan dan Evaluasi Zona Integritas Menuju WBK/WBBM.',
        '1.3 Maksud dan Tujuan',
        'Memantau kepatuhan pemenuhan dokumen bukti dukung pada 6 pilar pengungkit dan 2 pilar hasil, serta mengevaluasi efektivitas pelaksanaan reformasi birokrasi.',
        '',
        'BAB II. CAPAIAN KINERJA REFORMASI BIROKRASI',
        '2.1 Capaian Komponen Pengungkit (Bobot 60%)',
        '- Pilar 1 Manajemen Perubahan: Realisasi 94.5% (Internalisasi BerAKHLAK dan komitmen pimpinan aktif).',
        '- Pilar 2 Penataan Tatalaksana: Realisasi 91.2% (Penerapan SOP, SPBE terintegrasi, keterbukaan informasi).',
        '- Pilar 3 Penataan Sistem Manajemen SDM: Realisasi 89.8% (SKP berbasis kinerja, disiplin pegawai prima).',
        '- Pilar 4 Penguatan Akuntabilitas: Realisasi 95.0% (Penyusunan LAKIP tepat waktu, pencapaian target IKU 100%).',
        '- Pilar 5 Penguatan Pengawasan: Realisasi 96.2% (Nihil fraud, kanal WBS dan pengaduan SP4N-LAPOR tertangani 100%).',
        '- Pilar 6 Kualitas Pelayanan Publik: Realisasi 93.4% (Inovasi PST responsif, maklumat pelayanan terpasang).',
        '2.2 Capaian Komponen Hasil (Bobot 40%)',
        '- Indeks Kepuasan Masyarakat (IKM): 3.84 / 4.00 (Kategori Sangat Baik).',
        '- Indeks Persepsi Anti Korupsi (IPAK): 3.92 / 4.00 (Bebas Pungli & Gratifikasi).',
        '',
        'BAB III. KENDALA DAN IDENTIFIKASI HAMBATAN',
        '1. Kendala geografis kepulauan Sitaro dalam distribusi publikasi cetak ke pulau terluar.',
        '2. Kebutuhan peningkatan kapasitas operator baru terkait regulasi Lembar Kerja Evaluasi ZIAPP.',
        '',
        'BAB IV. KESIMPULAN DAN REKOMENDASI TINDAK LANJUT',
        '1. Pelaksanaan pembangunan ZI di BPS Kabupaten Kepulauan Sitaro telah memenuhi ambang batas minimal kelayakan usulan WBK.',
        '2. Diperlukan percepatan reviu internal berjenjang melalui sistem REBO sebelum batas akhir pengusulan ke TPI BPS RI.',
        '',
        'Ondong, 30 Juni 2026',
        'Tim Evaluator Monitoring BPS Kab. Kepulauan Sitaro'
      ];
      const blob = await createDocxFile(item.title, p);
      return { blob, filename: item.filename };
    }

    case 'kolase_foto': {
      const blob = await createPptxFile(
        item.title,
        'Format Baku Kolase Foto 4-Frame & Publikasi Media'
      );
      return { blob, filename: item.filename };
    }

    case 'pakta_integritas': {
      const p = [
        '=== SURAT PERNYATAAN KOMITMEN BERSAMA BEBAS GRATIFIKASI DAN PAKTA INTEGRITAS ===',
        'BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO',
        '',
        'Yang bertanda tangan di bawah ini:',
        'Nama Lengkap   : ................................................................',
        'NIP            : ................................................................',
        'Pangkat / Gol. : ................................................................',
        'Jabatan        : ................................................................',
        'Unit Kerja     : BPS Kabupaten Kepulauan Siau Tagulandang Biaro',
        '',
        'Menyatakan dengan sesungguhnya bahwa dalam rangka Pembangunan Zona Integritas Menuju Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi Bersih dan Melayani (WBBM), saya berkomitmen:',
        '',
        '1. Berperan secara proaktif dalam upaya pencegahan dan pemberantasan Korupsi, Kolusi, dan Nepotisme (KKN) serta tidak melibatkan diri dalam perbuatan tercela.',
        '2. Tidak meminta atau menerima pemberian secara langsung atau tidak langsung berupa suap, hadiah, bantuan, atau bentuk gratifikasi lainnya yang berlawanan dengan kewajiban atau tugas kedinasan saya.',
        '3. Bersikap jujur, transparan, objektif, dan akuntabel dalam menjalankan setiap tugas pengumpulan, pengolahan, analisis data statistik, maupun pelayanan kepada masyarakat.',
        '4. Menghindari segala bentuk situasi Benturan Kepentingan (Conflict of Interest) dalam pelaksanaan tugas dan pengambilan keputusan kedinasan.',
        '5. Memberi teladan dalam kepatuhan terhadap peraturan perundang-undangan dan kode etik Aparatur Sipil Negara BerAKHLAK.',
        '6. Apabila saya melanggar hal-hal yang telah saya nyatakan dalam Pakta Integritas ini, saya bersedia dikenakan sanksi moral, sanksi administratif, serta dituntut ganti rugi dan pidana sesuai dengan ketentuan peraturan perundang-undangan yang berlaku.',
        '',
        'Surat Pernyataan Pakta Integritas ini saya buat dengan penuh kesadaran dan tanggung jawab tanpa paksaan dari pihak manapun.',
        '',
        'Ondong, ............................. 2026',
        '',
        'Mengetahui,                                     Yang Membuat Pernyataan,',
        'Kepala BPS Kabupaten Kepulauan Sitaro,',
        '',
        '(Meterai Rp 10.000)',
        '',
        '(.......................................)       (.......................................)',
        'NIP. ..................................         NIP. ..................................'
      ];
      const blob = await createDocxFile(item.title, p);
      return { blob, filename: item.filename };
    }

    default:
      throw new Error(`Generator untuk template ${templateId} belum tersedia.`);
  }
}

/**
 * Menghasilkan bundle ZIP berisi seluruh berkas template resmi
 */
export async function generateAllTemplatesZip(): Promise<Blob> {
  const masterZip = new JSZip();

  // 1. Tambahkan seluruh berkas template ke dalam folder TEMPLATE_BAKU_BPS_SITARO
  const folder = masterZip.folder('TEMPLATE_BAKU_BPS_SITARO');
  if (!folder) throw new Error('Gagal menginisialisasi subfolder ZIP.');

  for (const item of MASTER_TEMPLATE_LIST) {
    const { blob, filename } = await generateTemplateBlob(item.id);
    const arrayBuffer = await blob.arrayBuffer();
    folder.file(filename, arrayBuffer);
  }

  // 2. Tambahkan berkas petunjuk / README panduan standar bukti dukung
  const readmeContent = `================================================================================
PUSAT TEMPLATE & FORMAT BAKU BUKTI DUKUNG REBO V2
BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO (SITARO)
STANDAR ACUAN: PERMENPAN-RB NO. 90 TAHUN 2021 & JUKNIS ZI BPS RI
================================================================================

Folder ini memuat 6 template dokumen resmi standar BPS Kabupaten Kepulauan Sitaro
untuk pemenuhan Lembar Kerja Evaluasi (LKE) pembangunan Zona Integritas (ZI):

DAFTAR BERKAS TEMPLATE RESMI:
--------------------------------------------------------------------------------
1. 01_Template_Surat_Undangan_BPS_Sitaro.docx
   Format: Microsoft Word (.docx)
   Kategori: Surat & Administrasi
   Penggunaan: Undangan pertemuan, rapat pilar, sosialisasi, dan FGD.
   Standar QA: Tanggal minimal H-2 sebelum rapat; nomor surat resmi.

2. 02_Template_Notula_Rapat_BPS_Sitaro.docx
   Format: Microsoft Word (.docx)
   Kategori: Rapat & Risalah
   Penggunaan: Notula resmi mencakup arahan, dinamika pilar, dan matriks tindak lanjut.
   Standar QA: Wajib memuat tabel Action Items (Masalah, Solusi, PIC, Batas Waktu).

3. 03_Template_Daftar_Hadir_Rapat_BPS_Sitaro.xlsx
   Format: Microsoft Excel (.xlsx)
   Kategori: Presensi Kegiatan
   Penggunaan: Lembar presensi fisik dan log kehadiran daring Zoom/video conference.
   Standar QA: Kolom identitas lengkap (Nama, NIP, Jabatan) & rekap total hadir.

4. 04_Template_Laporan_Monev_Kegiatan_BPS_Sitaro.docx
   Format: Microsoft Word (.docx)
   Kategori: Monev & Akuntabilitas
   Penggunaan: Laporan berkala pelaksanaan pilar ZI (Bab I s.d. Bab IV).
   Standar QA: Komparasi target vs realisasi, kendala, dan rekomendasi perbaikan.

5. 05_Template_Kolase_Dokumentasi_Foto_BPS_Sitaro.pptx
   Format: Microsoft PowerPoint (.pptx)
   Kategori: Dokumentasi Visual
   Penggunaan: Tata letak 4-frame foto dokumentasi ber-timestamp & spanduk ZI.
   Standar QA: Foto jernih, memuat geotagging/waktu, dan narasi 5W1H.

6. 06_Template_Pakta_Integritas_Komitmen_BPS_Sitaro.docx
   Format: Microsoft Word (.docx)
   Kategori: Pengawasan & Integritas
   Penggunaan: Pakta integritas komitmen bebas suap/gratifikasi seluruh pegawai.
   Standar QA: Dilengkapi meterai Rp 10.000 dan pengesahan Kepala BPS Sitaro.

PANDUAN PENGUNGGAHAN BUKTI DUKUNG KE APLIKASI REBO:
--------------------------------------------------------------------------------
1. Unduh template sesuai kebutuhan indikator kegiatan Anda.
2. Isi bagian yang diberi tanda kurung siku [...] atau titik-titik dengan data faktual.
3. Simpan dokumen yang telah ditandatangani dalam format PDF pada folder Google Drive satker.
4. Pastikan izin akses Google Drive berstatus "Siapa saja yang memiliki link dapat melihat"
   (Anyone with the link can view).
5. Masukkan tautan ke form indikator REBO. Sistem Heuristik QA REBO akan memvalidasi
   secara otomatis sebelum berkas diteruskan ke Verifikator Internal.

================================================================================
Aplikasi REBO (Reformasi Birokrasi Online) - BPS Kabupaten Kepulauan Sitaro
Menuju Predikat Wilayah Bebas dari Korupsi (WBK) & WBBM
================================================================================
`;
  folder.file('PETUNJUK_STANDAR_BUKTI_DUKUNG_BPS_SITARO.txt', readmeContent);

  return await masterZip.generateAsync({
    type: 'blob',
    mimeType: 'application/zip'
  });
}
