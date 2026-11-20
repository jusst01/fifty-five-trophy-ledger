#!/usr/bin/env node
// Browser checks for FIFTY-FIVE — GTA VI Trophy Ledger, against the real app.
//
// Puppeteer lives outside this repository on this machine, so it is loaded by
// absolute path; nothing is installed and nothing is fetched except the app
// itself from the local static server. Start it first:
//
//   node serve.ts
//   node verify.js
'use strict';

const puppeteer = require('/root/makefun-guide/nm-node_modules/puppeteer');

const CHROME = '/root/makefun-re/art-tools/chromium/chrome-linux/chrome';
const BASE = 'http://localhost:8080/';
const SEED = 'seed=2,3,4,5,8,9,15,17,22,30,33';

const results = [];

function record(label, ok, detail) {
  results.push({ label, ok });
  const mark = ok ? 'PASS' : 'FAIL';
  console.log(`[${mark}] ${label}${detail ? ' — ' + detail : ''}`);
}

function check(label, got, predicate, description) {
  record(label, predicate(got), `${JSON.stringify(got)} ${description}`);
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  page.on('pageerror', (err) => console.error('  page error:', err.message));
  return page;
}

async function run() {
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  try {
    // ---------- default load ----------
    const page = await newPage(browser);
    await page.goto(BASE, { waitUntil: 'networkidle0' });
    await sleep(400);

    const audit = await page.$eval('#audit-strip', (el) => el.textContent || '');
    check('#audit-strip steps cited', audit.includes('282/282 steps cited'), (v) => v, 'contains "282/282 steps cited"');

    const rows = await page.$$eval('#checklist-pane .trophy-row-wrapper', (els) => els.length);
    check('#checklist-pane rows', rows, (v) => v === 55, '=== 55');

    const detailTitle = await page.$eval('#detail-pane', (el) => {
      const h2 = el.querySelector('.detail-title') || el.querySelector('h2');
      return h2 ? h2.textContent.trim() : '';
    });
    check('#detail-pane title', detailTitle, (v) => v.includes('Positive Mental Attitude'), 'names Positive Mental Attitude');

    const steps = await page.$$eval('#detail-pane .step-item', (els) => els.length);
    check('#detail-pane steps', steps, (v) => v === 6, '=== 6');

    const chips = await page.$$eval('#detail-pane .citation-chip', (els) => els.length);
    check('#detail-pane citation chips', chips, (v) => v >= 6, '>= 6');

    const rail = await page.$$eval('#sources-rail li', (els) => els.length);
    check('#sources-rail entries', rail, (v) => v === 4, '=== 4');

    await page.close();

    // ---------- activities filter, One Last Thing open, seeded progress ----------
    const page2 = await newPage(browser);
    await page2.goto(`${BASE}#filter=activities&open=32&${SEED}`, { waitUntil: 'networkidle0' });
    await sleep(400);

    const title2 = await page2.$eval('#detail-pane', (el) => {
      const h2 = el.querySelector('.detail-title') || el.querySelector('h2');
      return h2 ? h2.textContent.trim() : '';
    });
    check('#detail-pane title (activities)', title2, (v) => v.includes('One Last Thing'), 'names One Last Thing');

    const counter = await page2.$eval('#earned-counter', (el) => (el.textContent || '').replace(/\s+/g, ' ').trim());
    check('#earned-counter', counter, (v) => v.includes('11 / 55'), 'contains "11 / 55"');

    await page2.close();
  } finally {
    await browser.close();
  }

  const failed = results.filter((r) => !r.ok);
  console.log('');
  console.log(`${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('FAILED: ' + failed.map((r) => r.label).join(', '));
    process.exitCode = 1;
  } else {
    console.log('ALL CHECKS PASSED');
  }
}

run().catch((err) => {
  console.error(err && err.stack ? err.stack : err);
  process.exitCode = 1;
});
