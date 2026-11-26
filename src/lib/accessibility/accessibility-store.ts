'use client';

/**
 * Accessibility Store & Engine (WCAG 2.1 AA Compliant)
 * REBO V2 - BPS Kabupaten Kepulauan Sitaro
 *
 * Mengakomodasi pengunjung dan pegawai disabilitas netra/low-vision, motorik,
 * lansia, dan disleksia pada formulir survei publik serta portal REBO.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type FontSize = 'normal' | 'large' | 'x-large';

export interface AccessibilityState {
  // Pengaturan Persisten (disimpan di LocalStorage)
  fontSize: FontSize;
  highContrast: boolean;
  readableFont: boolean;
  readingGuide: boolean;
  screenReaderSpeed: number; // 0.75 | 1.0 | 1.25 | 1.5

  // Runtime State (tidak persisten)
  isSpeaking: boolean;
  currentSpokenText: string | null;
  isWidgetOpen: boolean;

  // Actions - Pengaturan Tampilan
  setFontSize: (size: FontSize) => void;
  setHighContrast: (enabled: boolean) => void;
  toggleHighContrast: () => void;
  setReadableFont: (enabled: boolean) => void;
  toggleReadableFont: () => void;
  setReadingGuide: (enabled: boolean) => void;
  toggleReadingGuide: () => void;
  setScreenReaderSpeed: (speed: number) => void;
  resetAccessibility: () => void;
  setWidgetOpen: (open: boolean) => void;
  toggleWidget: () => void;

  // Actions - Text-to-Speech Engine
  speakText: (text: string, lang?: string) => void;
  stopSpeaking: () => void;
  speakSelectedText: () => void;
  speakActivePage: () => void;
  applyDomEffects: () => void;
}

// Queue & utterance reference untuk mencegah garbage collection pada browser engine
let speechQueue: string[] = [];
let currentQueueIndex = 0;

/** Mengambil suara bahasa Indonesia terbaik yang tersedia di browser */
function getIndonesianVoice(): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return null;
  }
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(
      (v) =>
        v.lang.toLowerCase() === 'id-id' ||
        v.lang.toLowerCase() === 'id' ||
        v.lang.toLowerCase().replace('_', '-').startsWith('id')
    ) ||
    voices.find(
      (v) =>
        v.name.toLowerCase().includes('indonesia') ||
        v.name.toLowerCase().includes('indonesian')
    ) ||
    voices[0] ||
    null
  );
}

/** Terapkan class & style pada dokumen HTML */
export function applyAccessibilityToDom(
  fontSize: FontSize,
  highContrast: boolean,
  readableFont: boolean
) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;

  // 1. Font Resizing
  if (fontSize === 'large') {
    root.style.fontSize = '115%';
  } else if (fontSize === 'x-large') {
    root.style.fontSize = '130%';
  } else {
    root.style.fontSize = '';
  }
  root.setAttribute('data-a11y-font-size', fontSize);

  // 2. High Contrast Mode
  root.classList.toggle('a11y-high-contrast', highContrast);
  root.setAttribute('data-a11y-contrast', highContrast ? 'high' : 'normal');

  // 3. Readable Font & Spacing
  root.classList.toggle('a11y-readable-font', readableFont);
  root.setAttribute('data-a11y-readable', readableFont ? 'true' : 'false');
}

export const useAccessibilityStore = create<AccessibilityState>()(
  persist(
    (set, get) => ({
      // Default Persisted State
      fontSize: 'normal',
      highContrast: false,
      readableFont: false,
      readingGuide: false,
      screenReaderSpeed: 1.0,

      // Default Runtime State
      isSpeaking: false,
      currentSpokenText: null,
      isWidgetOpen: false,

      setFontSize: (size: FontSize) => {
        set({ fontSize: size });
        get().applyDomEffects();
      },

      setHighContrast: (enabled: boolean) => {
        set({ highContrast: enabled });
        get().applyDomEffects();
      },

      toggleHighContrast: () => {
        const next = !get().highContrast;
        set({ highContrast: next });
        get().applyDomEffects();
      },

      setReadableFont: (enabled: boolean) => {
        set({ readableFont: enabled });
        get().applyDomEffects();
      },

      toggleReadableFont: () => {
        const next = !get().readableFont;
        set({ readableFont: next });
        get().applyDomEffects();
      },

      setReadingGuide: (enabled: boolean) => {
        set({ readingGuide: enabled });
      },

      toggleReadingGuide: () => {
        set({ readingGuide: !get().readingGuide });
      },

      setScreenReaderSpeed: (speed: number) => {
        set({ screenReaderSpeed: speed });
        // Jika sedang membaca, ulangi dengan kecepatan baru
        if (get().isSpeaking && get().currentSpokenText) {
          get().speakText(get().currentSpokenText!);
        }
      },

      setWidgetOpen: (open: boolean) => {
        set({ isWidgetOpen: open });
      },

      toggleWidget: () => {
        set({ isWidgetOpen: !get().isWidgetOpen });
      },

      resetAccessibility: () => {
        get().stopSpeaking();
        set({
          fontSize: 'normal',
          highContrast: false,
          readableFont: false,
          readingGuide: false,
          screenReaderSpeed: 1.0
        });
        applyAccessibilityToDom('normal', false, false);
      },

      applyDomEffects: () => {
        const { fontSize, highContrast, readableFont } = get();
        applyAccessibilityToDom(fontSize, highContrast, readableFont);
      },

      // =========================================================================
      // TEXT-TO-SPEECH (TTS) ENGINE
      // =========================================================================

      stopSpeaking: () => {
        speechQueue = [];
        currentQueueIndex = 0;
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
          try {
            window.speechSynthesis.cancel();
          } catch {
            // Ignore speechSynthesis cancel error
          }
        }
        set({ isSpeaking: false, currentSpokenText: null });
      },

      speakText: (text: string, lang = 'id-ID') => {
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
          return;
        }

        // Hentikan suara yang sedang aktif
        get().stopSpeaking();

        // Bersihkan teks dari markup & spasi berlebih
        const clean = text
          .replace(/<[^>]+>/g, ' ')
          .replace(/[\r\n\t]+/g, ' ')
          .replace(/\s{2,}/g, ' ')
          .trim();

        if (!clean) return;

        // Bagi teks menjadi kalimat-kalimat untuk mencegah timeout bug pada Chromium
        const sentences = clean
          .split(/(?<=[.?!;:])\s+/)
          .map((s) => s.trim())
          .filter((s) => s.length > 0);

        speechQueue = sentences.length > 0 ? sentences : [clean];
        currentQueueIndex = 0;

        const voice = getIndonesianVoice();
        const speed = get().screenReaderSpeed;

        const speakNext = () => {
          if (currentQueueIndex >= speechQueue.length) {
            set({ isSpeaking: false, currentSpokenText: null });
            return;
          }

          const currentSentence = speechQueue[currentQueueIndex++];
          set({ isSpeaking: true, currentSpokenText: currentSentence });

          const utterance = new SpeechSynthesisUtterance(currentSentence);
          if (voice) utterance.voice = voice;
          utterance.lang = lang;
          utterance.rate = speed;
          utterance.pitch = 1.0;

          utterance.onend = () => {
            speakNext();
          };

          utterance.onerror = () => {
            set({ isSpeaking: false, currentSpokenText: null });
          };

          window.speechSynthesis.speak(utterance);
        };

        speakNext();
      },

      speakSelectedText: () => {
        if (typeof window === 'undefined') return;
        const selection = window.getSelection()?.toString().trim();
        if (selection && selection.length > 0) {
          get().speakText(selection);
        } else {
          get().speakText(
            'Tidak ada teks yang diseleksi. Silakan pilih atau sorot teks di layar yang ingin Anda dengarkan.'
          );
        }
      },

      speakActivePage: () => {
        if (typeof document === 'undefined') return;

        // Toggle: Jika sedang berbicara, hentikan
        if (get().isSpeaking) {
          get().stopSpeaking();
          return;
        }

        // Ekstraksi konten teks halaman utama
        const mainContainer =
          document.querySelector('main') ||
          document.querySelector('[role="main"]') ||
          document.body;

        const title = document.title || 'Halaman REBO';
        const pageHeading = document.querySelector('h1')?.innerText?.trim();

        // Cari elemen-elemen teks bermakna
        const textElements = mainContainer.querySelectorAll(
          'h1, h2, h3, h4, p, li, blockquote, [data-a11y-readable-text="true"]'
        );

        const extractedPieces: string[] = [];

        textElements.forEach((el) => {
          // Abaikan widget itu sendiri dan elemen berlabel ignore
          if (
            el.closest('[data-a11y-ignore="true"]') ||
            el.closest('#a11y-widget-container') ||
            el.closest('nav') ||
            el.closest('footer')
          ) {
            return;
          }

          const t = (el as HTMLElement).innerText?.trim();
          if (t && t.length > 2 && !extractedPieces.includes(t)) {
            extractedPieces.push(t);
          }
        });

        const initialIntro = `Membaca halaman: ${pageHeading || title}. `;
        const fullContent =
          extractedPieces.length > 0
            ? initialIntro + extractedPieces.slice(0, 30).join('. ')
            : initialIntro + 'Konten teks utama siap dibaca.';

        get().speakText(fullContent);
      }
    }),
    {
      name: 'rebo_accessibility_settings',
      storage: createJSONStorage(() => localStorage),
      // Hanya persistensi pengaturan pengguna, bukan status runtime
      partialize: (state) => ({
        fontSize: state.fontSize,
        highContrast: state.highContrast,
        readableFont: state.readableFont,
        readingGuide: state.readingGuide,
        screenReaderSpeed: state.screenReaderSpeed
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyAccessibilityToDom(
            state.fontSize,
            state.highContrast,
            state.readableFont
          );
        }
      }
    }
  )
);
