import puppeteer from 'puppeteer';
import { readFileSync, statSync } from 'fs';
import { resolve } from 'path';

async function main() {
  const shotsConfig = JSON.parse(readFileSync('./shots.json', 'utf8'));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath: '/root/makefun-re/art-tools/chromium/chrome-linux/chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  for (const shot of shotsConfig) {
    const url = `http://localhost:8080/${shot.hash}`;
    console.log(`Rendering ${shot.file} at ${url}...`);

    await page.goto(url, { waitUntil: 'networkidle0' });
    // Wait a brief moment for any layout settling
    await new Promise(r => setTimeout(r, 600));

    const outPath = resolve('./screenshots', shot.file);
    await page.screenshot({
      path: outPath,
      type: 'jpeg',
      quality: 80,
      clip: { x: 0, y: 0, width: 1280, height: 800 }
    });

    const stats = statSync(outPath);
    console.log(`Saved ${shot.file}: size ${stats.size} bytes (limit 262144)`);
    if (stats.size > 262144) {
      console.error(`ERROR: ${shot.file} exceeds 256 KiB limit!`);
      process.exit(1);
    }
  }

  await browser.close();
  console.log('All screenshots rendered and verified successfully!');
}

main().catch(err => {
  console.error('Screenshot generation error:', err);
  process.exit(1);
});
