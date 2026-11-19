import fs from 'fs';

const args = process.argv.slice(2);
const trophiesPath = args[0] || 'app/data/trophies.json';
const officialPath = args[1] || '../briefs/official-trophies.json';

let hasError = false;

function problem(msg) {
  console.log(msg);
  hasError = true;
}

try {
  const trophiesData = JSON.parse(fs.readFileSync(trophiesPath, 'utf8'));
  const officialData = JSON.parse(fs.readFileSync(officialPath, 'utf8'));

  const trophies = trophiesData.trophies;
  const official = officialData.trophies;

  if (!Array.isArray(trophies)) {
    problem("Error: trophies is not an array");
    process.exit(1);
  }

  if (trophies.length !== 55) {
    problem(`Error: expected 55 trophies, found ${trophies.length}`);
  }

  const gradeCounts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  let extendedCount = 0;

  const officialMap = new Map();
  for (const o of official) {
    officialMap.set(o.name, o);
  }

  const seenNames = new Set();

  for (let i = 0; i < trophies.length; i++) {
    const t = trophies[i];
    const off = officialMap.get(t.name);

    if (!off) {
      problem(`Error: trophy name "${t.name}" (id ${t.id}) not found in official list`);
    } else {
      if (seenNames.has(t.name)) {
        problem(`Error: duplicate trophy name "${t.name}"`);
      }
      seenNames.add(t.name);

      if (t.description !== off.description) {
        problem(`Error: description mismatch for "${t.name}": expected "${off.description}", got "${t.description}"`);
      }
      if (t.grade !== off.grade) {
        problem(`Error: grade mismatch for "${t.name}": expected "${off.grade}", got "${t.grade}"`);
      }
    }

    if (gradeCounts[t.grade] !== undefined) {
      gradeCounts[t.grade]++;
    }

    if (!t.guide || typeof t.guide !== 'string' || t.guide.trim() === '') {
      problem(`Error: trophy id ${t.id} ("${t.name}") has blank or missing guide`);
    }

    const hasKind = typeof t.kind === 'string' && t.kind.trim() !== '';
    const hasFilterGroup = typeof t.filter_group === 'string' && t.filter_group.trim() !== '';
    const hasStage = typeof t.stage === 'number';
    const hasSecret = typeof t.secret === 'boolean';
    const hasSources = Array.isArray(t.sources) && t.sources.length > 0;

    if (hasKind && hasFilterGroup && hasStage && hasSecret && hasSources) {
      extendedCount++;
    }
  }

  if (gradeCounts.platinum !== 1 || gradeCounts.gold !== 2 || gradeCounts.silver !== 6 || gradeCounts.bronze !== 46) {
    problem(`Error: grade totals mismatch: platinum=${gradeCounts.platinum} (expected 1), gold=${gradeCounts.gold} (expected 2), silver=${gradeCounts.silver} (expected 6), bronze=${gradeCounts.bronze} (expected 46)`);
  }

  console.log(`EXTENDED ${extendedCount}/55`);

  if (hasError) {
    process.exit(1);
  }
} catch (e) {
  problem(`Error: validation failed with exception: ${e.message}`);
  process.exit(1);
}
