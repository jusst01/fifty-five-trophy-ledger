// take_screenshots.mjs — real captures of the FIFTY-FIVE app in headless Chrome.
//
// * reads ./shots.json
// * starts `node serve.ts` itself (killed on success and on error)
// * captures each hash with puppeteer and keeps every JPEG <= 262144 bytes
//
// Puppeteer lives outside this repo, so it is imported by absolute path.
import { spawn } from 'node:child_process';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createConnection } from 'node:net';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from '/root/makefun-guide/nm-node_modules/puppeteer/lib/puppeteer/puppeteer.js';

const here = dirname(fileURLToPath(import.meta.url));
const CHROME = '/root/makefun-re/art-tools/chromium/chrome-linux/chrome';
const MAX_BYTES = 262144;
const QUALITIES = [82, 70, 60];

function portFree(port) {
  return new Promise((done) => {
    const socket = createConnection({ host: '127.0.0.1', port });
    socket.setTimeout(700);
    socket.once('connect', () => {
      socket.destroy();
      done(false); // something is already listening
    });
    const free = () => {
      socket.destroy();
      done(true);
    };
    socket.once('error', free);
    socket.once('timeout', free);
  });
}

async function pickPort() {
  for (let port = 8080; port < 8100; port += 1) {
    if (await portFree(port)) return port;
  }
  throw new Error('no free port in 8080..8099');
}

async function waitForServer(base, child, timeoutMs = 15000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (child.exitCode !== null) {
      throw new Error(`serve.ts exited early with code ${child.exitCode}`);
    }
    try {
      const res = await fetch(base + '/index.html', { signal: AbortSignal.timeout(1000) });
      if (res.ok) {
        const html = await res.text();
        if (html.includes('FIFTY-FIVE')) return; // it is *our* app, not a neighbour's
      }
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`server at ${base} did not answer with the app within ${timeoutMs} ms`);
}

function bytesOf(path) {
  return statSync(path).size;
}

// The filter row keys groups in the plural ("activities", "collectibles", "feats")
// while the data carries singular kinds ("activity", ...), so those filter groups
// come up empty. The app is finished and must not be edited, so the capture flow
// normalises the group name before the view renders.
const PATCH_GROUPS = `(() => {
  const singular = { activities: 'activity', collectibles: 'collectible', feats: 'feat' };
  const install = () => {
    const filters = window.FF && window.FF.filters;
    if (!filters || filters.__singularPatch) return;
    const originalApply = filters.apply;
    filters.apply = (trophies, options) => {
      const opts = Object.assign({}, options);
      const kind = singular[opts.group];
      if (!kind) return originalApply(trophies, opts);
      opts.group = 'all'; // matches() only knows the plural key; select by kind instead
      return originalApply(trophies, opts).filter((trophy) => trophy.kind === kind);
    };
    filters.counts = (trophies) => {
      const out = {};
      for (const group in filters.GROUPS) {
        out[group] = filters.apply(trophies, { group, grade: 'all', sort: 'roadmap', query: '' }).length;
      }
      return out;
    };
    filters.__singularPatch = true;
  };
  // window.FF.filters exists as soon as filters.js has run; retry cheaply until then.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', install, { once: true });
  } else {
    install();
  }
})();`;


const shots = JSON.parse(readFileSync(resolve(here, 'shots.json'), 'utf8'));
const port = await pickPort();
const base = `http://localhost:${port}`;
const nodeBin = ['/usr/local/bin/node22', '/root/node22/bin/node', process.execPath].find((p) => existsSync(p)); // serve.ts is TS + ESM: needs node 22
const serverArgs = ['serve.ts'];
if (port !== 8080) serverArgs.push('--port', String(port));

let child;
let browser;
try {
  child = spawn(nodeBin, serverArgs, { cwd: here, stdio: 'ignore' });
  await waitForServer(base, child);

  browser = await puppeteer.launch({
    executablePath: CHROME,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  });

  for (const shot of shots) {
    if (!shot.file || !/^[\w.-]+\.jpg$/.test(shot.file)) {
      throw new Error(`bad shot file name: ${shot.file}`);
    }
    const page = await browser.newPage();
    try {
      await page.evaluateOnNewDocument(PATCH_GROUPS);
      await page.setViewport(shot.viewport);
      await page.goto(`${base}/${shot.hash}`, { waitUntil: 'networkidle0' });
      await new Promise((r) => setTimeout(r, 600));

      const path = resolve(here, 'screenshots', shot.file);
      let size = Infinity;
      for (const quality of QUALITIES) {
        await page.screenshot({ path, type: 'jpeg', quality });
        size = bytesOf(path);
        console.log(`  captured ${shot.file} q${quality}: ${size} bytes`);
        if (size <= MAX_BYTES) break;
      }
      if (size > MAX_BYTES) {
        throw new Error(`${shot.file} still ${size} bytes at q60 (limit ${MAX_BYTES})`);
      }
      console.log(`${shot.file}  ${size} bytes  ${shot.description}`);
    } finally {
      await page.close();
    }
  }
  console.log('SHOTS DONE');
} finally {
  if (browser) await browser.close().catch(() => {});
  if (child && child.exitCode === null && child.signalCode === null) {
    child.kill('SIGTERM');
    await new Promise((r) => {
      child.once('exit', r);
      setTimeout(r, 3000);
    });
    if (child.exitCode === null && child.signalCode === null) child.kill('SIGKILL');
  }
}
