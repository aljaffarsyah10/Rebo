/**
 * REBO Sync Assistant - Content Script
 * Di-inject ke halaman portal ZIAPP / LKE Evaluasi Pusat (BPS RI / KemenPAN-RB).
 * Berfungsi mendeteksi struktur form indikator, mengisi link bukti dukung & catatan,
 * serta men-dispatch event standar agar terdeteksi oleh framework reactive (React/Vue/Angular).
 */

(function () {
  // Cegah injeksi ganda
  if (window.__REBO_SYNC_ASSISTANT_INJECTED__) {
    return;
  }
  window.__REBO_SYNC_ASSISTANT_INJECTED__ = true;

  console.log(
    '[REBO-SYNC-ASSISTANT] Content script initialized on page:',
    window.location.href
  );

  // Listener pesan dari Popup Extension
  if (
    typeof chrome !== 'undefined' &&
    chrome.runtime &&
    chrome.runtime.onMessage
  ) {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === 'PING') {
        sendResponse({ success: true, ready: true, url: window.location.href });
        return true;
      }

      if (request.action === 'AUTOFILL_ZIAPP') {
        try {
          const result = executeAutoFill(request.items || []);
          showFloatingBanner(result);
          sendResponse({
            success: true,
            count: result.filledCount,
            matched: result.matchedItems
          });
        } catch (err) {
          console.error('[REBO-SYNC-ASSISTANT] Autofill error:', err);
          sendResponse({ success: false, error: err.message });
        }
        return true;
      }
    });
  }

  // ==============================================================================
  // 1. Core Autofill Engine
  // ==============================================================================

  function executeAutoFill(items) {
    let filledCount = 0;
    const matchedItems = [];

    if (!items || items.length === 0) {
      return { filledCount: 0, matchedItems: [] };
    }

    console.log(
      `[REBO-SYNC-ASSISTANT] Memulai auto-fill untuk ${items.length} indikator...`
    );

    // Iterasi setiap indikator dari REBO
    items.forEach((item) => {
      const gdriveLink =
        item.gdrive_folder_url ||
        (item.public_drive_links && item.public_drive_links[0]) ||
        '';
      const catatan = item.catatan_koordinator || item.uraian_buktidukung || '';
      const kode = item.kode_indikator || ''; // contoh: IND-1.1.1
      const numericCode = extractNumericCode(kode); // contoh: 1.1.1

      let indicatorFilled = false;

      // 1. Coba temukan kontainer indikator pada DOM (Baris tabel / Accordion / Form Card)
      const container = findIndicatorContainer(item, kode, numericCode);

      if (container) {
        // Isi input link bukti dukung di dalam kontainer ini
        const linkInput = findDriveLinkInput(container);
        if (linkInput && gdriveLink) {
          setElementValue(linkInput, gdriveLink);
          indicatorFilled = true;
        }

        // Isi textarea catatan / uraian di dalam kontainer ini
        const notesInput = findNotesTextarea(container);
        if (notesInput && catatan) {
          setElementValue(notesInput, catatan);
          indicatorFilled = true;
        }

        // Coba isi pilihan nilai jika ada (opsional jika form memiliki dropdown / radio penilaian mandiri)
        if (item.nilai_mandiri || item.nilai_verifikasi) {
          selectRatingOption(
            container,
            item.nilai_mandiri || item.nilai_verifikasi
          );
        }
      } else {
        // 2. Fallback: Cari input secara global berdasarkan atribut name, id, placeholder
        const fallbackFilled = fillInputGlobally(
          item,
          kode,
          numericCode,
          gdriveLink,
          catatan
        );
        if (fallbackFilled) {
          indicatorFilled = true;
        }
      }

      if (indicatorFilled) {
        filledCount++;
        matchedItems.push(item);
      }
    });

    console.log(
      `[REBO-SYNC-ASSISTANT] Selesai: ${filledCount} indikator berhasil diisi.`
    );
    return { filledCount, matchedItems };
  }

  function extractNumericCode(kode) {
    if (!kode) return '';
    const match = kode.match(/(\d+\.\d+(\.\d+)?)/);
    return match ? match[1] : '';
  }

  // ==============================================================================
  // 2. DOM Discovery Helpers
  // ==============================================================================

  /**
   * Menemukan kontainer indikator (tr, div.form-group, section, dsb)
   */
  function findIndicatorContainer(item, kode, numericCode) {
    const searchKeys = [
      kode,
      numericCode,
      `Indikator ${numericCode}`,
      item.id_pertanyaan ? `id_pertanyaan_${item.id_pertanyaan}` : null,
      item.uraian_pertanyaan ? item.uraian_pertanyaan.slice(0, 35) : null
    ].filter(Boolean);

    // A. Cek elemen dengan atribut data-id / data-kode / id
    for (const key of searchKeys) {
      try {
        const escapedKey = CSS.escape
          ? CSS.escape(key)
          : key.replace(/["\\]/g, '');
        const byAttr = document.querySelector(
          `[data-kode*="${escapedKey}"], [data-id*="${escapedKey}"], [id*="${escapedKey}"], [name*="${escapedKey}"]`
        );
        if (byAttr) {
          return findClosestContainer(byAttr);
        }
      } catch (e) {
        // Abaikan selector invalid
      }
    }

    // B. Cek baris tabel (tr) atau elemen teks yang mengandung kode indikator
    const allRows = document.querySelectorAll(
      'tr, .form-group, .card, .indicator-row, .panel'
    );
    for (const row of allRows) {
      const text = row.textContent || '';
      if (numericCode && text.includes(numericCode)) {
        return row;
      }
      if (kode && text.includes(kode)) {
        return row;
      }
    }

    return null;
  }

  function findClosestContainer(el) {
    return (
      el.closest('tr') ||
      el.closest('.form-group') ||
      el.closest('.card') ||
      el.parentElement
    );
  }

  /**
   * Mencari field input link bukti dukung (Google Drive, URL, dsb)
   */
  function findDriveLinkInput(container) {
    // 1. Selector tipe URL atau input dengan pola nama link/bukti
    const selector = [
      'input[type="url"]',
      'input[name*="link" i]',
      'input[name*="bukti" i]',
      'input[name*="drive" i]',
      'input[name*="url" i]',
      'input[name*="dokumen" i]',
      'input[id*="link" i]',
      'input[id*="bukti" i]',
      'input[id*="drive" i]',
      'input[placeholder*="http" i]',
      'input[placeholder*="link" i]',
      'input[placeholder*="drive" i]',
      'input[placeholder*="bukti" i]'
    ].join(', ');

    return container.querySelector(selector);
  }

  /**
   * Mencari field catatan / keterangan / uraian
   */
  function findNotesTextarea(container) {
    const selector = [
      'textarea',
      'input[name*="catatan" i]',
      'input[name*="keterangan" i]',
      'input[name*="uraian" i]',
      'input[name*="penjelasan" i]',
      'input[name*="deskripsi" i]',
      'input[id*="catatan" i]',
      'input[id*="keterangan" i]',
      'input[placeholder*="catatan" i]',
      'input[placeholder*="keterangan" i]'
    ].join(', ');

    return container.querySelector(selector);
  }

  /**
   * Memilih opsi radio atau dropdown penilaian
   */
  function selectRatingOption(container, score) {
    // Coba dropdown select
    const select = container.querySelector('select');
    if (select) {
      for (const opt of select.options) {
        if (opt.value == score || opt.text.includes(String(score))) {
          select.value = opt.value;
          triggerChangeEvents(select);
          break;
        }
      }
      return;
    }

    // Coba radio button
    const radios = container.querySelectorAll('input[type="radio"]');
    if (radios.length > 0) {
      for (const radio of radios) {
        if (radio.value == score || radio.id.includes(String(score))) {
          radio.checked = true;
          triggerChangeEvents(radio);
          break;
        }
      }
    }
  }

  /**
   * Fallback: Mencari input secara global jika container spesifik tidak terisolasi
   */
  function fillInputGlobally(item, kode, numericCode, gdriveLink, catatan) {
    let filled = false;
    const candidates = [numericCode, kode, item.id_pertanyaan].filter(Boolean);

    for (const key of candidates) {
      const linkInput = document.querySelector(
        `input[name*="${key}"][name*="link" i], input[id*="${key}"][id*="link" i], input[name*="${key}"][name*="bukti" i]`
      );
      if (linkInput && gdriveLink) {
        setElementValue(linkInput, gdriveLink);
        filled = true;
      }

      const noteInput = document.querySelector(
        `textarea[name*="${key}" i], textarea[id*="${key}" i], input[name*="${key}"][name*="catatan" i]`
      );
      if (noteInput && catatan) {
        setElementValue(noteInput, catatan);
        filled = true;
      }
    }

    return filled;
  }

  // ==============================================================================
  // 3. React/Vue/Angular Compatible Event Dispatcher
  // ==============================================================================

  function setElementValue(element, value) {
    if (!element) return;

    // Fokus ke elemen terlebih dahulu
    element.focus();

    // Dapatkan native property setter dari prototype untuk membypass React synthetic interception
    const prototype = Object.getPrototypeOf(element);
    const valueDescriptor = Object.getOwnPropertyDescriptor(prototype, 'value');

    if (valueDescriptor && valueDescriptor.set) {
      valueDescriptor.set.call(element, value);
    } else {
      element.value = value;
    }

    triggerChangeEvents(element);

    // Animasi visual highlight pada input yang baru saja diisi
    highlightElement(element);
  }

  function triggerChangeEvents(element) {
    // Kirim event input, change, blur dengan bubbles=true
    const eventOptions = { bubbles: true, cancelable: true };

    element.dispatchEvent(new Event('input', eventOptions));
    element.dispatchEvent(new Event('change', eventOptions));
    element.dispatchEvent(new KeyboardEvent('keyup', eventOptions));
    element.dispatchEvent(new Event('blur', eventOptions));
  }

  function highlightElement(el) {
    const origTransition = el.style.transition;
    const origOutline = el.style.outline;
    const origBg = el.style.backgroundColor;

    el.style.transition = 'all 0.3s ease';
    el.style.outline = '2px solid #10b981';
    el.style.backgroundColor = '#ecfdf5';

    setTimeout(() => {
      el.style.outline = origOutline;
      el.style.backgroundColor = origBg;
      el.style.transition = origTransition;
    }, 2000);
  }

  // ==============================================================================
  // 4. Floating Notification Banner on Target Web Page
  // ==============================================================================

  function showFloatingBanner(result) {
    const existing = document.getElementById('rebo-sync-floating-banner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'rebo-sync-floating-banner';
    banner.setAttribute(
      'style',
      `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999999;
      background: linear-gradient(135deg, #0f172a 0%, #0369a1 100%);
      color: #ffffff;
      padding: 14px 18px;
      border-radius: 10px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.2);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 13px;
      line-height: 1.4;
      max-width: 360px;
      border: 1px solid rgba(56, 189, 248, 0.4);
      animation: rebo-slide-in 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    `
    );

    // Style animation
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes rebo-slide-in {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    `;
    document.head.appendChild(styleEl);

    const isSuccess = result.filledCount > 0;
    const badgeColor = isSuccess ? '#10b981' : '#f59e0b';
    const statusText = isSuccess
      ? `<strong>${result.filledCount} Indikator</strong> berhasil diisikan!`
      : 'Tidak ada form yang cocok di halaman ini.';

    banner.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="width: 22px; height: 22px; border-radius: 6px; background: #0284c7; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 12px; color: #fff;">R</div>
          <span style="font-weight: 700; font-size: 13px; color: #f8fafc;">REBO Sync Assistant</span>
        </div>
        <button id="rebo-close-banner-btn" style="background: none; border: none; color: #94a3b8; font-size: 16px; cursor: pointer; padding: 0 4px; line-height: 1;">&times;</button>
      </div>
      <div style="margin-bottom: 6px; font-size: 12px; color: #e2e8f0;">
        ${statusText}
      </div>
      <div style="font-size: 11px; color: #94a3b8; display: flex; align-items: center; gap: 6px;">
        <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${badgeColor};"></span>
        <span>BPS Kab. Siau Tagulandang Biaro</span>
      </div>
    `;

    document.body.appendChild(banner);

    // Close button
    const closeBtn = document.getElementById('rebo-close-banner-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => banner.remove());
    }

    // Auto-dismiss setelah 8 detik
    setTimeout(() => {
      if (document.body.contains(banner)) {
        banner.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-10px)';
        setTimeout(() => banner.remove(), 400);
      }
    }, 8000);
  }
})();
