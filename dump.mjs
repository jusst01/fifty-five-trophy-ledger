import puppeteer from 'puppeteer';
const browser = await puppeteer.launch({ executablePath: '/root/makefun-re/art-tools/chromium/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage();
await page.goto('http://localhost:8080/#filter=collectibles&open=28&seed=2,3,4,5,8,9,15,17,22,30,33,52');
await new Promise(r => setTimeout(r, 5000));
console.log(await page.content());
await browser.close();
