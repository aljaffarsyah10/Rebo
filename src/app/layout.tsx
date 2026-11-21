import Providers from '@/components/layout/providers';
import { Toaster } from '@/components/ui/sonner';
import { fontVariables } from '@/lib/font';
import ThemeProvider from '@/components/layout/ThemeToggle/theme-provider';
import { cn } from '@/lib/utils';
import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import './globals.css';
import './theme.css';

const META_THEME_COLORS = {
  light: '#003366',
  dark: '#09090b'
};

export const metadata: Metadata = {
  title: {
    default: 'REBO V2 | Zona Integritas BPS Kabupaten Kepulauan Sitaro',
    template: '%s | REBO V2 BPS Sitaro'
  },
  description:
    'Sistem Digitalisasi, Pemantauan, dan Evaluasi Lembar Kerja Evaluasi (LKE) PMPRB Menuju Wilayah Bebas dari Korupsi (WBK) dan Wilayah Birokrasi Bersih dan Melayani (WBBM) - BPS Kabupaten Kepulauan Siau Tagulandang Biaro',
  applicationName: 'REBO V2',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/favicon-196.png', sizes: '196x196', type: 'image/png' },
      {
        url: '/icons/manifest-icon-192.maskable.png',
        sizes: '192x192',
        type: 'image/png'
      }
    ],
    apple: [
      { url: '/icons/apple-icon-180.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'REBO V2'
  },
  formatDetection: {
    telephone: false
  }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#003366' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' }
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const activeThemeValue = cookieStore.get('active_theme')?.value;
  const isScaled = activeThemeValue?.endsWith('-scaled');

  return (
    <html lang='id' suppressHydrationWarning>
      <head>
        <link rel='manifest' href='/manifest.json' />
        <meta name='mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-capable' content='yes' />
        <meta name='apple-mobile-web-app-status-bar-style' content='default' />
        <meta name='apple-mobile-web-app-title' content='REBO V2' />
        <link rel='apple-touch-icon' href='/icons/apple-icon-180.png' />
        <link
          rel='apple-touch-startup-image'
          href='/icons/apple-splash-2048-2732.jpg'
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '${META_THEME_COLORS.dark}')
                }
              } catch (_) {}
            `
          }}
        />
      </head>
      <body
        className={cn(
          'bg-background overscroll-none font-sans antialiased',
          activeThemeValue ? `theme-${activeThemeValue}` : '',
          isScaled ? 'theme-scaled' : '',
          fontVariables
        )}
      >
        <NextTopLoader showSpinner={false} />
        <NuqsAdapter>
          <ThemeProvider
            attribute='class'
            defaultTheme='system'
            enableSystem
            disableTransitionOnChange
            enableColorScheme
          >
            <Providers activeThemeValue={activeThemeValue as string}>
              <Toaster />
              {children}
            </Providers>
          </ThemeProvider>
        </NuqsAdapter>
      </body>
    </html>
  );
}
