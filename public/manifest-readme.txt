This folder contains PWA and assetlink placeholders used for Android integration.

Steps to finish:

1) Icons: add real icons to public/icons/:
   - android-chrome-192x192.png
   - android-chrome-512x512.png
   - apple-touch-icon.png

2) Update package name and SHA256 in public/.well-known/assetlinks.json
   - Replace com.example.rebo with your Android package name
   - Replace REPLACE_WITH_YOUR_SHA256_FINGERPRINT with the signing key fingerprint

3) Install next-pwa and rebuild:
   pnpm add next-pwa
   pnpm build

4) Deploy to Vercel with a custom domain (recommended) and ensure
   https://your-domain/.well-known/assetlinks.json is reachable.

5) For TWA generation use bubblewrap (example):
   npm i -g @bubblewrap/cli
   bubblewrap init --manifest=https://your-domain/manifest.json
   bubblewrap build

