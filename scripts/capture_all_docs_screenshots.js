const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const targets = [
  {
    url: 'http://localhost:3000/rebo/overview',
    name: '01_overview_dashboard.png',
    auth: true,
    wait: 4000
  },
  {
    url: 'http://localhost:3000/rebo/formRB/pemenuhan',
    name: '02_pilar_pemenuhan.png',
    auth: true,
    wait: 4000
  },
  {
    url: 'http://localhost:3000/rebo/monitoring',
    name: '03_monitoring_capaian.png',
    auth: true,
    wait: 4500
  },
  {
    url: 'http://localhost:3000/auth/sign-in',
    name: '04_login_page.png',
    auth: false,
    wait: 3000
  }
];

(async () => {
  const outputDir = path.resolve(__dirname, '../public/docs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath:
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,920']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920, deviceScaleFactor: 1.5 });

  for (const item of targets) {
    const outPath = path.join(outputDir, item.name);
    console.log(`Capturing ${item.name} from ${item.url}...`);
    try {
      if (item.auth) {
        await page.setExtraHTTPHeaders({
          'x-screenshot-key': 'local-docs-capture'
        });
      } else {
        await page.setExtraHTTPHeaders({});
      }

      await page.goto(item.url, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });
      await new Promise((r) => setTimeout(r, item.wait));
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${item.name} (URL: ${page.url()})`);

      if (item.name === '01_overview_dashboard.png') {
        const homePath = path.resolve(__dirname, '../public/Homepage_rebo.png');
        fs.copyFileSync(outPath, homePath);
        console.log(
          'Updated public/Homepage_rebo.png with real dashboard screenshot'
        );
      }
    } catch (err) {
      console.error(`Failed ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('Representative screenshots captured successfully!');
})();
