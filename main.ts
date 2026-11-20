// FIFTY-FIVE — GTA VI Trophy Ledger
//
// Entry for the make.fun competition gta6-trophy-guide-01. The guide itself is
// this directory's app/ folder: plain static files (one HTML page, classic
// scripts with defer, CSS, JSON data) that a browser opens with no build step
// and no network. screenshots/ holds the four captures of the running app.
//
// This program assembles the hand-in: it copies app/ and screenshots/ into the
// output directory and then writes dossier.json there with the vendored
// library, vendor/makefun-frontend.ts. That file must be left exactly as it
// is: the scorer runs its own byte-for-byte copy of the same library on what we
// hand in and requires our dossier.json to equal the bytes its copy writes, so
// even a cosmetic edit to our copy would show up as a mismatch.
//
// Locally, MAKEFUN_OUTPUT_DIR stands in for /output so a run never needs root:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const ENTRY = 'FIFTY-FIVE — GTA VI Trophy Ledger';

// The directory beside this file holds app/, screenshots/ and vendor/.
const repoDir = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

console.log(ENTRY);

mkdirSync(out, { recursive: true });

// The frontend, verbatim: static files a browser serves as-is.
cpSync(join(repoDir, 'app'), join(out, 'app'), { recursive: true });

// The captures of the real app, when this checkout has them.
const shots = join(repoDir, 'screenshots');
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(shots)) {
  cpSync(shots, join(out, 'screenshots'), { recursive: true });
}

// The dossier is built from what is now in `out`, so it describes the hand-in
// exactly. The caps below are the scorer's own: at most 4 screenshots, each at
// most 256 KiB (262144 bytes), and the app tree's file-count and total-byte
// ceilings. text_max_bytes is the dossier's text budget.
const dossier = buildDossier(out, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});

writeFileSync(join(out, 'dossier.json'), dossier);
