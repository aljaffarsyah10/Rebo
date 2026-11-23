const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const targets = [
  {
    url: 'http://localhost:3000/rebo/overview',
    name: '01_overview_dashboard.png',
    wait: 3500
  },
  {
    url: 'http://localhost:3000/rebo/formRB/area',
    name: '02_area_rb.png',
    wait: 3000
  },
  {
    url: 'http://localhost:3000/rebo/formRB/pemenuhan',
    name: '03_pilar_pemenuhan.png',
    wait: 3500
  },
  {
    url: 'http://localhost:3000/rebo/formRB/reform',
    name: '04_pilar_reform.png',
    wait: 3500
  },
  {
    url: 'http://localhost:3000/rebo/monitoring',
    name: '05_monitoring_capaian.png',
    wait: 4000
  },
  {
    url: 'http://localhost:3000/rebo/informasi',
    name: '06_informasi_dan_bagan.png',
    wait: 4000
  },
  {
    url: 'http://localhost:3000/rebo/kanban',
    name: '07_kanban_tindak_lanjut.png',
    wait: 3500
  },
  {
    url: 'http://localhost:3000/rebo/arsip',
    name: '08_arsip_lke.png',
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
      await page.goto(item.url, {
        waitUntil: 'domcontentloaded',
        timeout: 20000
      });
      await new Promise((r) => setTimeout(r, item.wait));
      await page.screenshot({ path: outPath, fullPage: false });
      console.log(`Saved: ${item.name}`);

      if (item.name === '01_overview_dashboard.png') {
        const homePath = path.resolve(__dirname, '../public/Homepage_rebo.png');
        fs.copyFileSync(outPath, homePath);
        console.log('Updated public/Homepage_rebo.png');
      }
    } catch (err) {
      console.error(`Failed ${item.name}: ${err.message}`);
    }
  }

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
