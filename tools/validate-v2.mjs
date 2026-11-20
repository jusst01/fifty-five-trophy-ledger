// Validates app/data/trophies.json (v2 shape) against the official trophy list.
// Usage: node tools/validate-v2.mjs   (paths resolve relative to the repo root)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../app/data/trophies.json");
const officialPath = resolve(here, "../../briefs/official-trophies.json");

const problems = [];
const passes = [];
const fail = (msg) => problems.push(msg);
const pass = (msg) => passes.push(msg);

// ---------- load ----------
let data;
try {
  data = JSON.parse(readFileSync(dataPath, "utf8"));
  pass("file parses as JSON");
} catch (err) {
  console.log("PROBLEM  app/data/trophies.json does not parse — " + err.message);
  console.log("SUMMARY  1 problem, 0 checks passed");
  process.exit(1);
}

let official;
try {
  official = JSON.parse(readFileSync(officialPath, "utf8"));
} catch (err) {
  console.log("PROBLEM  official-trophies.json does not parse — " + err.message);
  console.log("SUMMARY  1 problem, 0 checks passed");
  process.exit(1);
}

const trophies = Array.isArray(data.trophies) ? data.trophies : [];
if (!Array.isArray(data.trophies)) fail('top-level "trophies" is missing or not an array');

// ---------- 1. count ----------
if (trophies.length !== 55) fail(`expected exactly 55 trophies, found ${trophies.length}`);
else pass("exactly 55 trophies");

// ---------- 2. ids / names / descriptions / grades ----------
const officialById = new Map();
for (const t of official.trophies) officialById.set(t.id, t);

const seenIds = new Map();
for (const t of trophies) {
  seenIds.set(t.id, (seenIds.get(t.id) ?? 0) + 1);
}
for (const [id, n] of seenIds) {
  if (n > 1) fail(`trophy id ${id} appears ${n} times`);
}
for (const id of officialById.keys()) {
  if (!seenIds.has(id)) fail(`official trophy id ${id} is missing from the data file`);
}
for (const t of trophies) {
  if (!officialById.has(t.id)) {
    fail(`data trophy id ${t.id} ("${t.name}") is not on the official list`);
    continue;
  }
  const o = officialById.get(t.id);
  if (t.name !== o.name) fail(`id ${t.id}: name "${t.name}" != official "${o.name}"`);
  if (t.description !== o.description) {
    fail(`id ${t.id}: description "${t.description}" != official "${o.description}"`);
  }
  if (t.grade !== o.grade) fail(`id ${t.id}: grade "${t.grade}" != official "${o.grade}"`);
}
const nameSeen = new Map();
for (const t of trophies) nameSeen.set(t.name, (nameSeen.get(t.name) ?? 0) + 1);
for (const [name, n] of nameSeen) {
  if (n > 1) fail(`name "${name}" appears ${n} times`);
}
for (const o of official.trophies) {
  const n = nameSeen.get(o.name) ?? 0;
  if (n !== 1) fail(`official name "${o.name}" appears ${n} times (expected 1)`);
}
if (problems.length === 0) pass("55/55 official names, descriptions and grades match exactly once");

// ---------- 3. grade totals ----------
{
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  const got = {
    platinum: counts.platinum ?? 0,
    gold: counts.gold ?? 0,
    silver: counts.silver ?? 0,
    bronze: counts.bronze ?? 0,
  };
  const want = { platinum: 1, gold: 2, silver: 6, bronze: 46 };
  for (const g of Object.keys(want)) {
    if (got[g] !== want[g]) fail(`grade ${g}: expected ${want[g]}, found ${got[g]}`);
  }
  if (Object.keys(want).every((g) => got[g] === want[g])) pass("grade totals 1 platinum / 2 gold / 6 silver / 46 bronze");
}

// ---------- 4. secret count ----------
{
  const n = trophies.filter((t) => t.secret === true).length;
  if (n !== 28) fail(`secret trophies: expected 28, found ${n}`);
  else pass("exactly 28 secret trophies");
}

// ---------- 5. kind totals ----------
{
  const want = {
    story: 14,
    strand: 6,
    collectible: 7,
    activity: 8,
    feat: 15,
    money: 3,
    completion: 1,
    platinum: 1,
  };
  const got = {};
  for (const t of trophies) got[t.kind] = (got[t.kind] ?? 0) + 1;
  let ok = true;
  for (const k of Object.keys(want)) {
    if ((got[k] ?? 0) !== want[k]) {
      fail(`kind ${k}: expected ${want[k]}, found ${got[k] ?? 0}`);
      ok = false;
    }
  }
  for (const k of Object.keys(got)) {
    if (!(k in want)) {
      fail(`kind "${k}" is not one of the eight expected kinds`);
      ok = false;
    }
  }
  if (ok) pass("kind totals: story 14, strand 6, collectible 7, activity 8, feat 15, money 3, completion 1, platinum 1");
}

// ---------- 6. stage totals ----------
{
  const want = { 1: 14, 2: 6, 3: 7, 4: 8, 5: 15, 6: 3, 7: 1, 8: 1 };
  const got = {};
  for (const t of trophies) got[t.stage] = (got[t.stage] ?? 0) + 1;
  let ok = true;
  for (const s of Object.keys(want)) {
    const n = got[Number(s)] ?? 0;
    if (n !== want[s]) {
      fail(`stage ${s}: expected ${want[s]}, found ${n}`);
      ok = false;
    }
  }
  for (const s of Object.keys(got)) {
    if (!(s in want)) {
      fail(`stage ${s} is outside 1..8`);
      ok = false;
    }
  }
  if (ok) pass("stage totals: 1:14 2:6 3:7 4:8 5:15 6:3 7:1 8:1");
}

// ---------- 7. flags ----------
{
  const missable = trophies.filter((t) => t.flag === "MISSABLE");
  const caution = trophies.filter((t) => t.flag === "CAUTION");
  const unknown = trophies.filter((t) => t.flag === "unknown");

  if (missable.length !== 1) fail(`expected exactly 1 MISSABLE flag, found ${missable.length}`);
  else if (missable[0].id !== 28) fail(`MISSABLE flag is on id ${missable[0].id}, expected id 28`);

  if (caution.length !== 1) fail(`expected exactly 1 CAUTION flag, found ${caution.length}`);
  else if (caution[0].id !== 48) fail(`CAUTION flag is on id ${caution[0].id}, expected id 48`);

  const unknownIds = unknown.map((t) => t.id).sort((a, b) => a - b).join(",");
  if (unknownIds !== "44,45,49,50,51") {
    fail(`expected exactly 5 "unknown" flags on ids 44,45,49,50,51, found [${unknownIds}]`);
  }

  const anyOtherFlag = trophies.filter(
    (t) => t.flag !== undefined && !["MISSABLE", "CAUTION", "unknown"].includes(t.flag)
  );
  for (const t of anyOtherFlag) fail(`id ${t.id} has unrecognised flag "${t.flag}"`);

  if (
    missable.length === 1 &&
    missable[0].id === 28 &&
    caution.length === 1 &&
    caution[0].id === 48 &&
    unknownIds === "44,45,49,50,51" &&
    anyOtherFlag.length === 0
  ) {
    pass('flags: 1 MISSABLE (id 28), 1 CAUTION (id 48), 5 "unknown" (ids 44,45,49,50,51)');
  }
}

// ---------- 8. sources array per trophy ----------
{
  const railNames = Array.isArray(data.sources_rail)
    ? data.sources_rail.map((s) => s.name)
    : [];
  let ok = railNames.length === 4;
  for (const t of trophies) {
    if (!Array.isArray(t.sources)) {
      fail(`id ${t.id}: sources is not an array`);
      ok = false;
      continue;
    }
    if (t.sources.length !== 4) {
      fail(`id ${t.id}: sources has ${t.sources.length} entries, expected 4`);
      ok = false;
      continue;
    }
    if (t.sources.some((s, i) => s !== railNames[i])) {
      fail(`id ${t.id}: sources names/order differ from sources_rail`);
      ok = false;
    }
  }
  if (ok && trophies.length === 55) pass("every trophy carries the same 4 sources in the same order");
}

// ---------- 9. steps ----------
{
  let totalSteps = 0;
  for (const t of trophies) {
    if (!Array.isArray(t.steps) || t.steps.length === 0) {
      fail(`id ${t.id}: steps is missing or empty`);
      continue;
    }
    for (const [i, s] of t.steps.entries()) {
      totalSteps += 1;
      if (!String(s?.text ?? "").trim()) fail(`id ${t.id} step ${i + 1}: text is blank`);
      if (!Array.isArray(s?.cites) || s.cites.length === 0) {
        fail(`id ${t.id} step ${i + 1}: cites is missing or empty`);
        continue;
      }
      for (const c of s.cites) {
        if (!Number.isInteger(c) || c < 1 || c > 4) {
          fail(`id ${t.id} step ${i + 1}: cite ${JSON.stringify(c)} is outside 1..4`);
        }
      }
    }
    if (typeof t.guide !== "string" || !t.guide.trim()) {
      fail(`id ${t.id}: guide is missing or blank`);
    }
  }
  if (totalSteps !== 282) fail(`total steps: expected 282, found ${totalSteps}`);
  else pass("total steps across all trophies = 282 (every step cited from 1..4)");
}

// ---------- 10. sources_rail ----------
{
  const rail = data.sources_rail;
  if (!Array.isArray(rail) || rail.length !== 4) {
    fail(`sources_rail: expected 4 entries, found ${Array.isArray(rail) ? rail.length : "none"}`);
  } else {
    let ok = true;
    rail.forEach((s, i) => {
      if (s.n !== i + 1) {
        fail(`sources_rail entry ${i}: n is ${s.n}, expected ${i + 1}`);
        ok = false;
      }
      if (s.cited_by !== 55) {
        fail(`sources_rail source ${s.n} (${s.name}): cited_by is ${s.cited_by}, expected 55`);
        ok = false;
      }
      if (typeof s.name !== "string" || !s.name.trim()) {
        fail(`sources_rail entry ${i}: name is blank`);
        ok = false;
      }
      if (typeof s.role !== "string" || !s.role.trim()) {
        fail(`sources_rail entry ${i}: role is blank`);
        ok = false;
      }
    });
    if (ok) pass("sources_rail: 4 entries, each cited_by 55");
  }
}

// ---------- report ----------
for (const p of problems) console.log("PROBLEM  " + p);
for (const p of passes) console.log("ok       " + p);
console.log(
  `SUMMARY  ${problems.length === 0 ? "all checks passed" : problems.length + " problem(s)"}` +
    ` — ${passes.length} check group(s) passed, ${trophies.length} trophies`
);
process.exit(problems.length === 0 ? 0 : 1);
