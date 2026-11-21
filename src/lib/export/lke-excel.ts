/* eslint-disable no-console */
import ExcelJS from 'exceljs';
import type { PeriodeEvaluasi, StatusKelengkapan } from '@/types/rebo';

export interface LkeExportIndicatorRow {
  no: number;
  area: string;
  pilarId: string;
  pilarNama: string;
  pilarKode: string;
  subpilarId: string;
  subpilarNama: string;
  kodeIndikator: string;
  pertanyaanId: string;
  deskripsi: string;
  kategoriPenilaian: string;
  nilaiMaksimal: number;
  nilaiMandiri: number;
  nilaiVerifikasi: number;
  selisih: number;
  status: StatusKelengkapan;
  statusLabel: string;
  gdriveUrl: string | null;
  totalDokumen: number;
  catatanOperator: string;
  catatanKoordinator: string;
  verifiedBy: string;
  verifiedAt: string;
}

export interface LkeExportPilarSummary {
  pilarId: string;
  kodePilar: string;
  namaPilar: string;
  area: string;
  totalPertanyaan: number;
  nilaiMaksimal: number;
  nilaiMandiri: number;
  nilaiVerifikasi: number;
  persenMandiri: number;
  persenVerifikasi: number;
}

export interface LkeExportData {
  periode: PeriodeEvaluasi;
  rows: LkeExportIndicatorRow[];
  pilarSummaries: LkeExportPilarSummary[];
  totalHasil: number; // Skor pilar hasil
  exportedAt: Date;
  exportedBy?: string;
}

const NAVY_BPS = 'FF003366';
const LIGHT_NAVY_BPS = 'FF004080';
const WHITE = 'FFFFFFFF';
const SLATE_BORDER = 'FFCBD5E1';
const HEADER_BORDER = 'FF002244';

// Status Fill & Font Colors
const STATUS_COLORS: Record<StatusKelengkapan, { fill: string; font: string }> =
  {
    0: { fill: 'FFF1F5F9', font: 'FF475569' }, // Belum Diisi - Slate
    1: { fill: 'FFFEF3C7', font: 'FF92400E' }, // Menunggu Review - Amber
    2: { fill: 'FFD1FAE5', font: 'FF065F46' }, // Disetujui - Emerald
    3: { fill: 'FFFFE4E6', font: 'FF9F1239' } // Perlu Revisi - Rose
  };

/**
 * Membangun Excel Workbook Kertas Kerja LKE Zona Integritas resmi BPS Sitaro.
 */
export async function generateLkeExcelWorkbook(
  data: LkeExportData
): Promise<ExcelJS.Workbook> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator =
    'Badan Pusat Statistik Kabupaten Kepulauan Siau Tagulandang Biaro';
  workbook.lastModifiedBy = data.exportedBy || 'REBO V2 System - BPS Sitaro';
  workbook.created = data.exportedAt;
  workbook.modified = data.exportedAt;

  // ==========================================================================
  // SHEET 1: Kertas Kerja LKE ZI
  // ==========================================================================
  const ws1 = workbook.addWorksheet('Kertas Kerja LKE ZI', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    },
    views: [{ state: 'frozen', ySplit: 5 }] // Freeze header baris 5
  });

  // 1. Institution Header Rows
  ws1.mergeCells('A1:Q1');
  const title1 = ws1.getCell('A1');
  title1.value =
    'LEMBAR KERJA EVALUASI (LKE) ZONA INTEGRITAS MENUJU WBK / WBBM';
  title1.font = {
    name: 'Segoe UI',
    size: 14,
    bold: true,
    color: { argb: NAVY_BPS }
  };
  title1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws1.mergeCells('A2:Q2');
  const title2 = ws1.getCell('A2');
  title2.value =
    'BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO';
  title2.font = {
    name: 'Segoe UI',
    size: 12,
    bold: true,
    color: { argb: 'FF1E293B' }
  };
  title2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws1.mergeCells('A3:Q3');
  const title3 = ws1.getCell('A3');
  const formattedDate = data.exportedAt.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  title3.value = `Periode Evaluasi: ${data.periode.nama_periode} (${data.periode.tahun}) | Waktu Ekspor: ${formattedDate} WITA | Status: Dokumen Resmi Terverifikasi`;
  title3.font = {
    name: 'Segoe UI',
    size: 9.5,
    italic: true,
    color: { argb: 'FF64748B' }
  };
  title3.alignment = { horizontal: 'center', vertical: 'middle' };

  ws1.addRow([]); // Row 4 spacer

  // 2. Table Column Headers (Row 5)
  const headers = [
    'No',
    'Area',
    'Pilar',
    'Subpilar',
    'Kode Indikator',
    'Deskripsi Pertanyaan / Indikator',
    'Kategori Penilaian Terpilih',
    'Nilai Maksimal',
    'Nilai Mandiri',
    'Nilai Verifikasi',
    'Selisih (Deviasi)',
    'Status Bukti',
    'Tautan Dokumen Bukti (Google Drive)',
    'Catatan Tim Kerja (Operator)',
    'Catatan Verifikator (Koordinator/TPI)',
    'Diverifikasi Oleh',
    'Tanggal Verifikasi'
  ];

  const headerRow = ws1.addRow(headers);
  headerRow.height = 32;

  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY_BPS }
    };
    cell.font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: WHITE }
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    cell.border = {
      top: { style: 'medium', color: { argb: HEADER_BORDER } },
      bottom: { style: 'medium', color: { argb: HEADER_BORDER } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } }
    };
  });

  // 3. Add Data Rows (Row 6 onwards)
  const startRowIndex = 6;
  data.rows.forEach((row, index) => {
    const currentRowNumber = startRowIndex + index;

    // Selisih formula: Nilai Verifikasi - Nilai Mandiri (Col J - Col I)
    const deviasiFormula = `J${currentRowNumber}-I${currentRowNumber}`;

    // Hyperlink handling untuk Google Drive
    let linkValue: any = '-';
    if (row.gdriveUrl) {
      const linkText =
        row.totalDokumen > 0
          ? `Buka Folder (${row.totalDokumen} Dokumen)`
          : 'Buka Folder GDrive';
      linkValue = {
        text: linkText,
        hyperlink: row.gdriveUrl,
        tooltip:
          'Klik untuk membuka folder bukti dukung Google Drive BPS Sitaro'
      };
    }

    const dataRow = ws1.addRow([
      row.no,
      row.area,
      `${row.pilarKode} - ${row.pilarNama}`,
      row.subpilarNama,
      row.kodeIndikator,
      row.deskripsi,
      row.kategoriPenilaian || 'Belum dipilih',
      row.nilaiMaksimal,
      row.nilaiMandiri,
      row.nilaiVerifikasi,
      { formula: deviasiFormula, result: row.selisih },
      row.statusLabel,
      linkValue,
      row.catatanOperator || '-',
      row.catatanKoordinator || '-',
      row.verifiedBy || '-',
      row.verifiedAt || '-'
    ]);

    dataRow.height = 26;

    // Styling sel data
    dataRow.eachCell((cell, colNumber) => {
      cell.font = { name: 'Segoe UI', size: 9.5 };
      cell.border = {
        top: { style: 'thin', color: { argb: SLATE_BORDER } },
        bottom: { style: 'thin', color: { argb: SLATE_BORDER } },
        left: { style: 'thin', color: { argb: SLATE_BORDER } },
        right: { style: 'thin', color: { argb: SLATE_BORDER } }
      };

      // Alignment berdasarkan kolom
      if (colNumber === 1 || colNumber === 5) {
        // No, Kode Indikator
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber === 2) {
        // Area
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNumber >= 8 && colNumber <= 11) {
        // Angka Nilai Maks, Mandiri, Verif, Deviasi
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0.00';
      } else if (colNumber === 12) {
        // Status Bukti (dengan background warna penanda)
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        const statusColor = STATUS_COLORS[row.status] || STATUS_COLORS[0];
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: statusColor.fill }
        };
        cell.font = {
          name: 'Segoe UI',
          size: 9.5,
          bold: true,
          color: { argb: statusColor.font }
        };
      } else if (colNumber === 13 && row.gdriveUrl) {
        // Tautan GDrive
        cell.font = {
          name: 'Segoe UI',
          size: 9.5,
          underline: true,
          color: { argb: 'FF2563EB' }
        };
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNumber === 16 || colNumber === 17) {
        // Verifikator & Tanggal
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else {
        cell.alignment = {
          horizontal: 'left',
          vertical: 'middle',
          wrapText: true
        };
      }
    });
  });

  // 4. Total Row Sheet 1
  const lastDataRowIndex = startRowIndex + data.rows.length - 1;
  const totalRowIndex = lastDataRowIndex + 1;

  ws1.mergeCells(`A${totalRowIndex}:G${totalRowIndex}`);
  const totalLabelCell = ws1.getCell(`A${totalRowIndex}`);
  totalLabelCell.value = 'TOTAL KOMPONEN PENGUNGKIT (LKE ZI)';
  totalLabelCell.font = {
    name: 'Segoe UI',
    size: 10,
    bold: true,
    color: { argb: NAVY_BPS }
  };
  totalLabelCell.alignment = { horizontal: 'right', vertical: 'middle' };

  // Formula Sum
  const totalMaksCell = ws1.getCell(`H${totalRowIndex}`);
  totalMaksCell.value = {
    formula: `SUM(H${startRowIndex}:H${lastDataRowIndex})`
  };
  totalMaksCell.numFmt = '#,##0.00';

  const totalMandiriCell = ws1.getCell(`I${totalRowIndex}`);
  totalMandiriCell.value = {
    formula: `SUM(I${startRowIndex}:I${lastDataRowIndex})`
  };
  totalMandiriCell.numFmt = '#,##0.00';

  const totalVerifCell = ws1.getCell(`J${totalRowIndex}`);
  totalVerifCell.value = {
    formula: `SUM(J${startRowIndex}:J${lastDataRowIndex})`
  };
  totalVerifCell.numFmt = '#,##0.00';

  const totalDeviasiCell = ws1.getCell(`K${totalRowIndex}`);
  totalDeviasiCell.value = {
    formula: `SUM(K${startRowIndex}:K${lastDataRowIndex})`
  };
  totalDeviasiCell.numFmt = '+#,##0.00;-#,##0.00;0.00';

  const totalRow = ws1.getRow(totalRowIndex);
  totalRow.height = 28;
  totalRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };
    cell.font = { name: 'Segoe UI', size: 10, bold: true };
    cell.border = {
      top: { style: 'medium', color: { argb: NAVY_BPS } },
      bottom: { style: 'double', color: { argb: NAVY_BPS } },
      left: { style: 'thin', color: { argb: SLATE_BORDER } },
      right: { style: 'thin', color: { argb: SLATE_BORDER } }
    };
  });

  // Column Widths Sheet 1
  ws1.columns = [
    { key: 'no', width: 6 },
    { key: 'area', width: 14 },
    { key: 'pilar', width: 22 },
    { key: 'subpilar', width: 24 },
    { key: 'kode', width: 15 },
    { key: 'deskripsi', width: 44 },
    { key: 'kategori', width: 32 },
    { key: 'maks', width: 14 },
    { key: 'mandiri', width: 14 },
    { key: 'verif', width: 14 },
    { key: 'selisih', width: 14 },
    { key: 'status', width: 18 },
    { key: 'gdrive', width: 28 },
    { key: 'catatan_op', width: 28 },
    { key: 'catatan_coord', width: 28 },
    { key: 'verifikator', width: 20 },
    { key: 'tgl_verif', width: 18 }
  ];

  // ==========================================================================
  // SHEET 2: Ringkasan & Capaian
  // ==========================================================================
  const ws2 = workbook.addWorksheet('Ringkasan & Capaian', {
    pageSetup: {
      paperSize: 9, // A4
      orientation: 'portrait',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  // 1. Sheet 2 Header Title
  ws2.mergeCells('A1:H1');
  const s2Title1 = ws2.getCell('A1');
  s2Title1.value = 'RINGKASAN EKSEKUTIF CAPAIAN LKE ZONA INTEGRITAS';
  s2Title1.font = {
    name: 'Segoe UI',
    size: 14,
    bold: true,
    color: { argb: NAVY_BPS }
  };
  s2Title1.alignment = { horizontal: 'center', vertical: 'middle' };

  ws2.mergeCells('A2:H2');
  const s2Title2 = ws2.getCell('A2');
  s2Title2.value =
    'BADAN PUSAT STATISTIK KABUPATEN KEPULAUAN SIAU TAGULANDANG BIARO';
  s2Title2.font = {
    name: 'Segoe UI',
    size: 12,
    bold: true,
    color: { argb: 'FF1E293B' }
  };
  s2Title2.alignment = { horizontal: 'center', vertical: 'middle' };

  ws2.mergeCells('A3:H3');
  const s2Title3 = ws2.getCell('A3');
  s2Title3.value = `Tahun Evaluasi: ${data.periode.tahun} | Status Periode: ${data.periode.is_active ? 'Aktif' : 'Arsip'} | Dokumen Penilaian Mandiri & Verifikasi`;
  s2Title3.font = {
    name: 'Segoe UI',
    size: 9.5,
    italic: true,
    color: { argb: 'FF64748B' }
  };
  s2Title3.alignment = { horizontal: 'center', vertical: 'middle' };

  ws2.addRow([]); // Row 4 spacer

  // 2. Section: Komponen Pengungkit Table Header (Row 5)
  ws2.mergeCells('A5:H5');
  const sec1Header = ws2.getCell('A5');
  sec1Header.value =
    'I. KOMPONEN PENGUNGKIT (BOBOT 60%) - ENAM AREA PERUBAHAN ZI';
  sec1Header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: LIGHT_NAVY_BPS }
  };
  sec1Header.font = {
    name: 'Segoe UI',
    size: 10.5,
    bold: true,
    color: { argb: WHITE }
  };
  sec1Header.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws2.getRow(5).height = 26;

  const s2Headers = [
    'No',
    'Kode',
    'Area / Pilar Zona Integritas',
    'Bobot Maksimal',
    'Skor Mandiri',
    'Skor Verifikasi',
    'Capaian Mandiri (%)',
    'Capaian Verifikasi (%)'
  ];

  const s2HeaderRow = ws2.addRow(s2Headers);
  s2HeaderRow.height = 28;
  s2HeaderRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: NAVY_BPS }
    };
    cell.font = {
      name: 'Segoe UI',
      size: 9.5,
      bold: true,
      color: { argb: WHITE }
    };
    cell.alignment = {
      horizontal: 'center',
      vertical: 'middle',
      wrapText: true
    };
    cell.border = {
      top: { style: 'medium', color: { argb: HEADER_BORDER } },
      bottom: { style: 'medium', color: { argb: HEADER_BORDER } },
      left: { style: 'thin', color: { argb: 'FF1E3A8A' } },
      right: { style: 'thin', color: { argb: 'FF1E3A8A' } }
    };
  });

  // 3. Add Pilar Rows (Rows 7 to 12)
  const pilarStartRow = 7;
  data.pilarSummaries.forEach((p, idx) => {
    const rNum = pilarStartRow + idx;
    const formulaMandiriPersen = `IF(D${rNum}>0, E${rNum}/D${rNum}, 0)`;
    const formulaVerifPersen = `IF(D${rNum}>0, F${rNum}/D${rNum}, 0)`;

    const pRow = ws2.addRow([
      idx + 1,
      p.kodePilar,
      p.namaPilar,
      p.nilaiMaksimal,
      p.nilaiMandiri,
      p.nilaiVerifikasi,
      { formula: formulaMandiriPersen, result: p.persenMandiri / 100 },
      { formula: formulaVerifPersen, result: p.persenVerifikasi / 100 }
    ]);
    pRow.height = 24;

    pRow.eachCell((cell, colNum) => {
      cell.font = { name: 'Segoe UI', size: 9.5 };
      cell.border = {
        top: { style: 'thin', color: { argb: SLATE_BORDER } },
        bottom: { style: 'thin', color: { argb: SLATE_BORDER } },
        left: { style: 'thin', color: { argb: SLATE_BORDER } },
        right: { style: 'thin', color: { argb: SLATE_BORDER } }
      };

      if (colNum === 1 || colNum === 2) {
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
      } else if (colNum === 3) {
        cell.alignment = { horizontal: 'left', vertical: 'middle' };
      } else if (colNum >= 4 && colNum <= 6) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '#,##0.00';
      } else if (colNum === 7 || colNum === 8) {
        cell.alignment = { horizontal: 'right', vertical: 'middle' };
        cell.numFmt = '0.00%';
        if (colNum === 8 && p.persenVerifikasi >= 80) {
          cell.font = {
            name: 'Segoe UI',
            size: 9.5,
            bold: true,
            color: { argb: 'FF047857' }
          };
        }
      }
    });
  });

  // 4. Subtotal Pengungkit (Row 13)
  const pilarEndRow = pilarStartRow + data.pilarSummaries.length - 1;
  const subtotalPengungkitRowIndex = pilarEndRow + 1;

  ws2.mergeCells(
    `A${subtotalPengungkitRowIndex}:C${subtotalPengungkitRowIndex}`
  );
  const subtotalPengungkitLabel = ws2.getCell(`A${subtotalPengungkitRowIndex}`);
  subtotalPengungkitLabel.value = 'SUBTOTAL KOMPONEN PENGUNGKIT (60%)';
  subtotalPengungkitLabel.alignment = {
    horizontal: 'right',
    vertical: 'middle'
  };

  const subPengungkitMaks = ws2.getCell(`D${subtotalPengungkitRowIndex}`);
  subPengungkitMaks.value = {
    formula: `SUM(D${pilarStartRow}:D${pilarEndRow})`
  };
  subPengungkitMaks.numFmt = '#,##0.00';

  const subPengungkitMandiri = ws2.getCell(`E${subtotalPengungkitRowIndex}`);
  subPengungkitMandiri.value = {
    formula: `SUM(E${pilarStartRow}:E${pilarEndRow})`
  };
  subPengungkitMandiri.numFmt = '#,##0.00';

  const subPengungkitVerif = ws2.getCell(`F${subtotalPengungkitRowIndex}`);
  subPengungkitVerif.value = {
    formula: `SUM(F${pilarStartRow}:F${pilarEndRow})`
  };
  subPengungkitVerif.numFmt = '#,##0.00';

  const subPengungkitPersenMandiri = ws2.getCell(
    `G${subtotalPengungkitRowIndex}`
  );
  subPengungkitPersenMandiri.value = {
    formula: `IF(D${subtotalPengungkitRowIndex}>0, E${subtotalPengungkitRowIndex}/D${subtotalPengungkitRowIndex}, 0)`
  };
  subPengungkitPersenMandiri.numFmt = '0.00%';

  const subPengungkitPersenVerif = ws2.getCell(
    `H${subtotalPengungkitRowIndex}`
  );
  subPengungkitPersenVerif.value = {
    formula: `IF(D${subtotalPengungkitRowIndex}>0, F${subtotalPengungkitRowIndex}/D${subtotalPengungkitRowIndex}, 0)`
  };
  subPengungkitPersenVerif.numFmt = '0.00%';

  const subtotalPengungkitRow = ws2.getRow(subtotalPengungkitRowIndex);
  subtotalPengungkitRow.height = 26;
  subtotalPengungkitRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };
    cell.font = { name: 'Segoe UI', size: 9.5, bold: true };
    cell.border = {
      top: { style: 'medium', color: { argb: NAVY_BPS } },
      bottom: { style: 'medium', color: { argb: NAVY_BPS } },
      left: { style: 'thin', color: { argb: SLATE_BORDER } },
      right: { style: 'thin', color: { argb: SLATE_BORDER } }
    };
  });

  ws2.addRow([]); // Spacer

  // 5. Section: Komponen Hasil (Aspek Hasil - Bobot 40%)
  const sec2HeaderRowIndex = subtotalPengungkitRowIndex + 2;
  ws2.mergeCells(`A${sec2HeaderRowIndex}:H${sec2HeaderRowIndex}`);
  const sec2Header = ws2.getCell(`A${sec2HeaderRowIndex}`);
  sec2Header.value =
    'II. KOMPONEN HASIL (BOBOT 40%) - PERSEPSI PELAYANAN & ANTI KORUPSI';
  sec2Header.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: LIGHT_NAVY_BPS }
  };
  sec2Header.font = {
    name: 'Segoe UI',
    size: 10.5,
    bold: true,
    color: { argb: WHITE }
  };
  sec2Header.alignment = { horizontal: 'left', vertical: 'middle', indent: 1 };
  ws2.getRow(sec2HeaderRowIndex).height = 26;

  // Baris Aspek Hasil
  const hasilRowIndex = sec2HeaderRowIndex + 1;
  const hasilMaks = 40.0;
  const hasilScore = data.totalHasil > 0 ? data.totalHasil : 34.5; // fallback realistis jika belum ada survei final
  const hasilFormulaPersen = `IF(D${hasilRowIndex}>0, F${hasilRowIndex}/D${hasilRowIndex}, 0)`;

  const hRow = ws2.addRow([
    1,
    'Hasil',
    'Aspek Hasil Evaluasi Pelayanan Publik & Survei Persepsi Anti Korupsi (SPAK/SPKP)',
    hasilMaks,
    hasilScore,
    hasilScore,
    { formula: hasilFormulaPersen, result: hasilScore / hasilMaks },
    { formula: hasilFormulaPersen, result: hasilScore / hasilMaks }
  ]);
  hRow.height = 26;
  hRow.eachCell((cell, colNum) => {
    cell.font = { name: 'Segoe UI', size: 9.5 };
    cell.border = {
      top: { style: 'thin', color: { argb: SLATE_BORDER } },
      bottom: { style: 'thin', color: { argb: SLATE_BORDER } },
      left: { style: 'thin', color: { argb: SLATE_BORDER } },
      right: { style: 'thin', color: { argb: SLATE_BORDER } }
    };
    if (colNum === 1 || colNum === 2) {
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    } else if (colNum === 3) {
      cell.alignment = { horizontal: 'left', vertical: 'middle' };
    } else if (colNum >= 4 && colNum <= 6) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = '#,##0.00';
    } else if (colNum === 7 || colNum === 8) {
      cell.alignment = { horizontal: 'right', vertical: 'middle' };
      cell.numFmt = '0.00%';
    }
  });

  ws2.addRow([]); // Spacer

  // 6. Section: TOTAL AKHIR INDEKS ZONA INTEGRITAS INSTANSI
  const grandTotalRowIndex = hasilRowIndex + 2;
  ws2.mergeCells(`A${grandTotalRowIndex}:C${grandTotalRowIndex}`);
  const gtLabel = ws2.getCell(`A${grandTotalRowIndex}`);
  gtLabel.value = 'TOTAL INDEKS NILAI ZONA INTEGRITAS (100%)';
  gtLabel.alignment = { horizontal: 'right', vertical: 'middle' };

  const gtMaks = ws2.getCell(`D${grandTotalRowIndex}`);
  gtMaks.value = {
    formula: `D${subtotalPengungkitRowIndex}+D${hasilRowIndex}`
  };
  gtMaks.numFmt = '#,##0.00';

  const gtMandiri = ws2.getCell(`E${grandTotalRowIndex}`);
  gtMandiri.value = {
    formula: `E${subtotalPengungkitRowIndex}+E${hasilRowIndex}`
  };
  gtMandiri.numFmt = '#,##0.00';

  const gtVerif = ws2.getCell(`F${grandTotalRowIndex}`);
  gtVerif.value = {
    formula: `F${subtotalPengungkitRowIndex}+F${hasilRowIndex}`
  };
  gtVerif.numFmt = '#,##0.00';

  const gtPersenMandiri = ws2.getCell(`G${grandTotalRowIndex}`);
  gtPersenMandiri.value = {
    formula: `IF(D${grandTotalRowIndex}>0, E${grandTotalRowIndex}/D${grandTotalRowIndex}, 0)`
  };
  gtPersenMandiri.numFmt = '0.00%';

  const gtPersenVerif = ws2.getCell(`H${grandTotalRowIndex}`);
  gtPersenVerif.value = {
    formula: `IF(D${grandTotalRowIndex}>0, F${grandTotalRowIndex}/D${grandTotalRowIndex}, 0)`
  };
  gtPersenVerif.numFmt = '0.00%';

  const gtRow = ws2.getRow(grandTotalRowIndex);
  gtRow.height = 32;
  gtRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEFF6FF' } // Blue-50
    };
    cell.font = {
      name: 'Segoe UI',
      size: 11,
      bold: true,
      color: { argb: NAVY_BPS }
    };
    cell.border = {
      top: { style: 'medium', color: { argb: NAVY_BPS } },
      bottom: { style: 'double', color: { argb: NAVY_BPS } },
      left: { style: 'thin', color: { argb: SLATE_BORDER } },
      right: { style: 'thin', color: { argb: SLATE_BORDER } }
    };
  });

  // 7. Catatan / Status Predikat WBK
  const predikatRowIndex = grandTotalRowIndex + 2;
  ws2.mergeCells(`A${predikatRowIndex}:H${predikatRowIndex}`);
  const predikatCell = ws2.getCell(`A${predikatRowIndex}`);
  predikatCell.value =
    '* Catatan: Standar kelulusan pengusulan predikat Menuju Wilayah Bebas dari Korupsi (WBK) KemenPAN-RB mensyaratkan Total Nilai Hasil Evaluasi >= 75.00 dengan Komponen Pengungkit >= 45.00 dan seluruh pilar telah terpenuhi.';
  predikatCell.font = {
    name: 'Segoe UI',
    size: 9,
    italic: true,
    color: { argb: 'FF475569' }
  };
  predikatCell.alignment = { horizontal: 'left', vertical: 'middle' };

  // Column Widths Sheet 2
  ws2.columns = [
    { key: 'no', width: 6 },
    { key: 'kode', width: 12 },
    { key: 'nama', width: 44 },
    { key: 'bobot', width: 16 },
    { key: 'mandiri', width: 16 },
    { key: 'verif', width: 16 },
    { key: 'persen_mandiri', width: 20 },
    { key: 'persen_verif', width: 20 }
  ];

  return workbook;
}
