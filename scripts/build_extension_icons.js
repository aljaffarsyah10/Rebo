const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const sizes = [16, 48, 128];
const iconDir = path.join(
  __dirname,
  '..',
  'extensions',
  'rebo-sync-assistant',
  'icons'
);

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir, { recursive: true });
}

async function makeIcons() {
  for (const size of sizes) {
    const rx = Math.round(size * 0.22);
    const strokeW = Math.max(1.5, Math.round(size * 0.08));
    const fontSize = Math.round(size * 0.42);
    const dash1 = Math.round(size * 0.4);
    const dash2 = Math.round(size * 0.15);
    const dotR = Math.max(2, Math.round(size * 0.12));

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0284c7" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
        </defs>
        <rect width="${size}" height="${size}" rx="${rx}" fill="url(#grad)" />
        <circle cx="${size * 0.5}" cy="${size * 0.5}" r="${size * 0.35}" fill="none" stroke="#38bdf8" stroke-width="${strokeW}" stroke-dasharray="${dash1} ${dash2}" />
        <text x="50%" y="62%" text-anchor="middle" fill="#ffffff" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-weight="800" font-size="${fontSize}">R</text>
        <circle cx="${size * 0.8}" cy="${size * 0.22}" r="${dotR}" fill="#10b981" />
      </svg>
    `;

    const buf = Buffer.from(svg.trim());
    await sharp(buf)
      .png()
      .toFile(path.join(iconDir, `icon${size}.png`));
    console.log(`Generated icon${size}.png (${size}x${size})`);
  }
}

makeIcons()
  .then(() => console.log('All icons generated successfully.'))
  .catch((err) => {
    console.error('Error generating icons:', err);
    process.exit(1);
  });
