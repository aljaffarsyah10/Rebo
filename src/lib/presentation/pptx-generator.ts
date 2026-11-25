import {
  SlideContentItem,
  SlideData,
  PresentationDeckData,
  DEFAULT_PRESENTATION_DATA
} from './presentation-types';

export type { SlideContentItem, SlideData, PresentationDeckData };
export { DEFAULT_PRESENTATION_DATA };

/**
 * Palette Warna Resmi Desain Presentasi BPS:
 * - Navy Blue: 003366 (Kewibawaan, Kepercayaan, BPS Brand)
 * - Gold: FFBF00 / D97706 (Keunggulan, Prestasi Zona Integritas)
 * - Emerald Green: 059669 (Integritas, Bersih, WBK)
 * - Dark Slate: 0F172A (Teks Utama Kontras Tinggi)
 * - Light Background: F8FAFC (Latar Elegan, Bersih)
 */
const COLOR_NAVY = '003366';
const COLOR_GOLD = 'FFBF00';
const COLOR_EMERALD = '059669';
const COLOR_DARK_SLATE = '0F172A';
const COLOR_MUTED = '475569';
const COLOR_LIGHT_BG = 'F8FAFC';
const COLOR_WHITE = 'FFFFFF';
const COLOR_BORDER = 'E2E8F0';

/**
 * Generator Presentasi PowerPoint (.pptx) menggunakan pptxgenjs
 * Menghasilkan Buffer presentasi OpenXML standar yang kompatibel dengan MS PowerPoint, Google Slides, LibreOffice.
 */
export async function generatePptxDeck(
  data: PresentationDeckData = DEFAULT_PRESENTATION_DATA
): Promise<Buffer> {
  const pptxgenModule = await import('pptxgenjs');
  const PptxGenJS = (pptxgenModule.default || pptxgenModule) as unknown as {
    new (): any;
  };
  const pptx = new PptxGenJS();

  // Pengaturan Metadata Presentasi
  pptx.layout = 'LAYOUT_16x9';
  pptx.author = data.satkerName;
  pptx.company = 'Badan Pusat Statistik';
  pptx.revision = '1';
  pptx.subject = 'Paparan Pembangunan Zona Integritas Menuju WBK';
  pptx.title = `Paparan ZI WBK BPS Kabupaten Kepulauan Sitaro ${data.tahun}`;

  // Iterasi Setiap Slide (11 Slide Standar Paparan TPN)
  for (const slideData of data.slides) {
    const slide = pptx.addSlide();

    // Catatan Pembicara (Speaker Notes)
    if (slideData.talkingPoints) {
      slide.addNotes(
        `CATATAN PAPARAN KEPALA BPS KAB. SITARO:\n\n${slideData.talkingPoints}\n\n[Poin Kunci TPN]:\n- Tekankan keunikan wilayah kepulauan (Siau, Tagulandang, Biaro).\n- Paparkan efisiensi anggaran dan paperless lewat REBO V2.\n- Paparkan hasil survei IKM (${data.ikmScore}) & IPAK (${data.ipakScore}).`
      );
    }

    if (slideData.theme === 'dark') {
      // ----------------------------------------------------
      // SLIDE TEMA GELAP (Cover & Slide Penutup)
      // ----------------------------------------------------
      slide.background = { color: COLOR_NAVY };

      // Top Decorative Accent Line (Gold)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 0.1,
        fill: { color: COLOR_GOLD },
        line: { color: COLOR_GOLD }
      });

      // Bottom Decorative Accent Line (Emerald)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 5.525,
        w: 10,
        h: 0.1,
        fill: { color: COLOR_EMERALD },
        line: { color: COLOR_EMERALD }
      });

      // Category Pill / Badge
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.8,
        y: 0.6,
        w: 4.5,
        h: 0.35,
        rectRadius: 0.1,
        fill: { color: '0A4B82' },
        line: { color: COLOR_GOLD, width: 1 }
      });

      slide.addText(slideData.category, {
        x: 0.8,
        y: 0.6,
        w: 4.5,
        h: 0.35,
        fontSize: 10,
        bold: true,
        color: COLOR_GOLD,
        align: 'center',
        valign: 'middle'
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.8,
        y: 1.1,
        w: 8.4,
        h: 1.1,
        fontSize: 26,
        bold: true,
        color: COLOR_WHITE,
        align: 'left',
        valign: 'top'
      });

      // Subtitle
      slide.addText(slideData.subtitle, {
        x: 0.8,
        y: 2.15,
        w: 8.4,
        h: 0.6,
        fontSize: 13,
        color: '93C5FD',
        align: 'left',
        valign: 'top'
      });

      if (slideData.slideNumber === 1) {
        // Kartu Identitas Presenter di Cover
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 0.8,
          y: 2.9,
          w: 8.4,
          h: 2.1,
          rectRadius: 0.15,
          fill: { color: '072648' },
          line: { color: '1E4976', width: 1.5 }
        });

        // Logo / Icon Box
        slide.addShape(pptx.ShapeType.roundRect, {
          x: 1.1,
          y: 3.15,
          w: 1.6,
          h: 1.6,
          rectRadius: 0.1,
          fill: { color: '003366' },
          line: { color: COLOR_GOLD, width: 2 }
        });

        slide.addText('BPS\nSITARO\n7108', {
          x: 1.1,
          y: 3.15,
          w: 1.6,
          h: 1.6,
          fontSize: 14,
          bold: true,
          color: COLOR_GOLD,
          align: 'center',
          valign: 'middle'
        });

        // Presenter Details
        slide.addText(
          [
            {
              text: 'PEMAPAR UTAMA:\n',
              options: { fontSize: 10, bold: true, color: COLOR_GOLD }
            },
            {
              text: `${data.namaKepala}\n`,
              options: { fontSize: 16, bold: true, color: COLOR_WHITE }
            },
            {
              text: `NIP. ${data.nipKepala} | Kepala BPS Kabupaten Kepulauan Sitaro\n`,
              options: { fontSize: 10.5, color: 'CBD5E1' }
            },
            {
              text: `Ketua Tim Kerja ZI: ${data.namaKetuaZi} | Target: Predikat WBK 2026`,
              options: { fontSize: 9.5, color: '94A3B8' }
            }
          ],
          {
            x: 2.9,
            y: 3.15,
            w: 6.1,
            h: 1.6,
            valign: 'middle'
          }
        );
      } else if (slideData.items && slideData.items.length > 0) {
        // Konten Penutup (3 Kartu Komitmen Horizontal)
        const cardW = 2.65;
        const gap = 0.22;
        const startX = 0.8;
        const cardY = 2.85;
        const cardH = 2.2;

        slideData.items.slice(0, 3).forEach((item, idx) => {
          const cardX = startX + idx * (cardW + gap);

          slide.addShape(pptx.ShapeType.roundRect, {
            x: cardX,
            y: cardY,
            w: cardW,
            h: cardH,
            rectRadius: 0.12,
            fill: { color: '072648' },
            line: { color: '1E4976', width: 1 }
          });

          // Badge
          slide.addText(item.badge || `KOMITMEN ${idx + 1}`, {
            x: cardX + 0.15,
            y: cardY + 0.15,
            w: cardW - 0.3,
            h: 0.25,
            fontSize: 9,
            bold: true,
            color: COLOR_GOLD
          });

          // Title
          slide.addText(item.title, {
            x: cardX + 0.15,
            y: cardY + 0.42,
            w: cardW - 0.3,
            h: 0.45,
            fontSize: 11,
            bold: true,
            color: COLOR_WHITE,
            valign: 'top'
          });

          // Bullet Points
          const bulletTexts = item.points.map((p) => ({
            text: p,
            options: {
              bullet: true,
              fontSize: 9,
              color: 'CBD5E1',
              breakLine: true
            }
          }));

          slide.addText(bulletTexts, {
            x: cardX + 0.15,
            y: cardY + 0.9,
            w: cardW - 0.3,
            h: 1.15,
            valign: 'top'
          });
        });
      }

      // Footer
      if (slideData.footerNote) {
        slide.addText(slideData.footerNote, {
          x: 0.8,
          y: 5.1,
          w: 8.4,
          h: 0.35,
          fontSize: 9,
          color: '94A3B8',
          align: 'center',
          valign: 'middle'
        });
      }
    } else {
      // ----------------------------------------------------
      // SLIDE TEMA TERANG (Slide 2 - 10: Profil, 6 Pilar, Inovasi, Evaluasi)
      // ----------------------------------------------------
      slide.background = { color: COLOR_LIGHT_BG };

      // Top Header Ribbon (Navy Blue Banner)
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 10,
        h: 1.1,
        fill: { color: COLOR_NAVY }
      });

      // Accent Ribbon Gold Line
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 1.1,
        w: 10,
        h: 0.04,
        fill: { color: COLOR_GOLD }
      });

      // Category Pill
      slide.addShape(pptx.ShapeType.roundRect, {
        x: 0.6,
        y: 0.15,
        w: 3.2,
        h: 0.25,
        rectRadius: 0.08,
        fill: { color: '0A4B82' }
      });

      slide.addText(slideData.category, {
        x: 0.6,
        y: 0.15,
        w: 3.2,
        h: 0.25,
        fontSize: 8.5,
        bold: true,
        color: COLOR_GOLD,
        align: 'center',
        valign: 'middle'
      });

      // Slide Title
      slide.addText(slideData.title, {
        x: 0.6,
        y: 0.42,
        w: 7.2,
        h: 0.42,
        fontSize: 16,
        bold: true,
        color: COLOR_WHITE,
        valign: 'middle'
      });

      // Subtitle
      slide.addText(slideData.subtitle, {
        x: 0.6,
        y: 0.82,
        w: 8.8,
        h: 0.25,
        fontSize: 9,
        color: 'CBD5E1',
        valign: 'middle'
      });

      // Satker Logo Tag (Top Right)
      slide.addText(`${data.satkerShort}\nWBK 2026`, {
        x: 8.0,
        y: 0.2,
        w: 1.4,
        h: 0.7,
        fontSize: 9,
        bold: true,
        color: COLOR_GOLD,
        align: 'right',
        valign: 'middle'
      });

      let contentStartY = 1.35;

      // KPI STATS CARDS (Jika ada, seperti di Slide Profil & Hasil Evaluasi)
      if (slideData.stats && slideData.stats.length > 0) {
        const statCount = slideData.stats.length;
        const statW = (8.8 - (statCount - 1) * 0.2) / statCount;
        const statH = 0.85;

        slideData.stats.forEach((st, idx) => {
          const statX = 0.6 + idx * (statW + 0.2);

          slide.addShape(pptx.ShapeType.roundRect, {
            x: statX,
            y: 1.25,
            w: statW,
            h: statH,
            rectRadius: 0.1,
            fill: { color: COLOR_WHITE },
            line: { color: COLOR_BORDER, width: 1 }
          });

          // Left Color Indicator Bar
          slide.addShape(pptx.ShapeType.rect, {
            x: statX,
            y: 1.25,
            w: 0.08,
            h: statH,
            fill: { color: st.color || COLOR_NAVY }
          });

          slide.addText(
            [
              {
                text: `${st.label}\n`,
                options: { fontSize: 8.5, color: COLOR_MUTED }
              },
              {
                text: `${st.value}\n`,
                options: {
                  fontSize: 14,
                  bold: true,
                  color: st.color || COLOR_NAVY
                }
              },
              {
                text: st.sublabel,
                options: { fontSize: 7.5, bold: true, color: COLOR_MUTED }
              }
            ],
            {
              x: statX + 0.15,
              y: 1.25,
              w: statW - 0.2,
              h: statH,
              valign: 'middle'
            }
          );
        });

        contentStartY = 2.22;
      }

      // 3 KOLOM KARTU KONTEN UTAMA
      if (slideData.items && slideData.items.length > 0) {
        const count = Math.min(slideData.items.length, 3);
        const cardW = (8.8 - (count - 1) * 0.25) / count;
        const cardH = 5.0 - contentStartY - 0.25;

        slideData.items.slice(0, 3).forEach((item, idx) => {
          const cardX = 0.6 + idx * (cardW + 0.25);

          // Card Background Box
          slide.addShape(pptx.ShapeType.roundRect, {
            x: cardX,
            y: contentStartY,
            w: cardW,
            h: cardH,
            rectRadius: 0.12,
            fill: { color: COLOR_WHITE },
            line: { color: COLOR_BORDER, width: 1.2 }
          });

          // Top Header of the Card
          slide.addShape(pptx.ShapeType.rect, {
            x: cardX,
            y: contentStartY,
            w: cardW,
            h: 0.55,
            fill: { color: 'F1F5F9' }
          });

          // Badge Pill
          slide.addText(item.badge || `AREA ${idx + 1}`, {
            x: cardX + 0.15,
            y: contentStartY + 0.06,
            w: cardW - 0.3,
            h: 0.2,
            fontSize: 7.5,
            bold: true,
            color: COLOR_NAVY
          });

          // Card Title
          slide.addText(item.title, {
            x: cardX + 0.15,
            y: contentStartY + 0.24,
            w: cardW - 0.3,
            h: 0.28,
            fontSize: 9.5,
            bold: true,
            color: COLOR_DARK_SLATE,
            valign: 'middle'
          });

          // Bullet Points
          const bulletTexts = item.points.map((p) => ({
            text: p,
            options: {
              bullet: true,
              fontSize: 8.5,
              color: COLOR_DARK_SLATE,
              breakLine: true
            }
          }));

          const textHeight = item.highlight ? cardH - 1.25 : cardH - 0.7;

          slide.addText(bulletTexts, {
            x: cardX + 0.15,
            y: contentStartY + 0.65,
            w: cardW - 0.3,
            h: textHeight,
            valign: 'top'
          });

          // Highlight box (jika ada)
          if (item.highlight) {
            slide.addShape(pptx.ShapeType.roundRect, {
              x: cardX + 0.12,
              y: contentStartY + cardH - 0.5,
              w: cardW - 0.24,
              h: 0.4,
              rectRadius: 0.08,
              fill: { color: 'ECFDF5' },
              line: { color: COLOR_EMERALD, width: 0.8 }
            });

            slide.addText(`★ ${item.highlight}`, {
              x: cardX + 0.15,
              y: contentStartY + cardH - 0.5,
              w: cardW - 0.3,
              h: 0.4,
              fontSize: 7.5,
              bold: true,
              color: COLOR_EMERALD,
              align: 'center',
              valign: 'middle'
            });
          }
        });
      }

      // Bottom Bar / Footer
      slide.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 5.25,
        w: 10,
        h: 0.375,
        fill: { color: 'F1F5F9' },
        line: { color: COLOR_BORDER }
      });

      // Footer note
      slide.addText(
        slideData.footerNote ||
          `BPS Kabupaten Kepulauan Sitaro | Paparan Evaluasi ZI Menuju WBK ${data.tahun}`,
        {
          x: 0.6,
          y: 5.27,
          w: 7.0,
          h: 0.33,
          fontSize: 8,
          color: COLOR_MUTED,
          valign: 'middle'
        }
      );

      // Slide number
      slide.addText(`${slideData.slideNumber} / ${data.slides.length}`, {
        x: 8.0,
        y: 5.27,
        w: 1.4,
        h: 0.33,
        fontSize: 8.5,
        bold: true,
        color: COLOR_NAVY,
        align: 'right',
        valign: 'middle'
      });
    }
  }

  // Generate buffer OpenXML PPTX
  const buffer = await pptx.write({ outputType: 'nodebuffer' });
  return buffer as Buffer;
}
