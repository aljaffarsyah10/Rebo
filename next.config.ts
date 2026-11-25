import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';
import withPWA from 'next-pwa';

// Define the base Next.js configuration
const baseConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.slingacademy.com',
        port: ''
      }
    ]
  },
  transpilePackages: ['geist'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        https: false,
        http: false,
        net: false,
        tls: false,
        os: false,
        path: false,
        stream: false,
        zlib: false,
        'node:https': false,
        'node:http': false,
        'node:fs': false,
        'node:path': false,
        'node:os': false,
        'node:stream': false,
        'node:zlib': false
      };
    }
    return config;
  }
};

// Wrap base config with PWA first. Make sure `next-pwa` and `@sentry/nextjs` are installed in your environment
// (e.g. `pnpm add next-pwa @sentry/nextjs`) before building.
// Create PWA wrapper with options. Do NOT spread Next.js config into this
// options object — that caused Workbox to see unrelated properties (like
// `images`) and fail. Instead, create the pwa wrapper and apply it to the
// Next.js config below.
const pwaWrapper = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.ENABLE_PWA !== 'true'
});

let configWithPlugins = baseConfig;

// Conditionally enable Sentry configuration
if (!process.env.NEXT_PUBLIC_SENTRY_DISABLED) {
  configWithPlugins = withSentryConfig(configWithPlugins, {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options
    // FIXME: Add your Sentry organization and project names
    org: process.env.NEXT_PUBLIC_SENTRY_ORG,
    project: process.env.NEXT_PUBLIC_SENTRY_PROJECT,
    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    reactComponentAnnotation: {
      enabled: true
    },

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: '/monitoring',

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Disable Sentry telemetry
    telemetry: false
  });
}

// Finally apply the PWA wrapper to the resulting Next.js config. We do this
// last so Workbox only sees the PWA options and not unrelated Next.js
// configuration objects.
configWithPlugins = pwaWrapper(configWithPlugins as any);

const nextConfig = configWithPlugins;
export default nextConfig;
