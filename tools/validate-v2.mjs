// Validates app/data/trophies.json (v2 shape) against the official trophy list.
// Usage: node tools/validate-v2.mjs
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const dataPath = resolve(here, "../app/data/trophies.json");
const officialPath = resolve(here, "../../briefs/official-trophies.json");

const results = [];
function check(name, fn) {
  try {
    const detail = fn();
    results.push({ name, pass: true, detail: detail || "" });
  } catch (err) {
    results.push({ name, pass: false, detail: err.message });
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}
const norm = (s) => String(s ?? "").replace(/\s+/g, " ").trim().toLowerCase();

let data;
try {
  data = JSON.parse(readFileSync(dataPath, "utf8"));
} catch (err) {
  console.log("FAIL  valid JSON — " + err.message);
  process.exit(1);
}
const official = JSON.parse(readFileSync(officialPath, "utf8"));
const trophies = Array.isArray(data.trophies) ? data.trophies : [];

check("valid JSON with trophies array of 55", () => {
  assert(Array.isArray(data.trophies), "trophies is not an array");
  assert(trophies.length === 55, `trophies length is ${trophies.length}`);
  return `${trophies.length} trophies`;
});

check("every name matches official list", () => {
  const byId = new Map(official.trophies.map((t) => [t.id, t.name]));
  assert(byId.size === 55, `official list has ${byId.size} ids`);
  for (const t of trophies) {
    assert(byId.has(t.id), `id ${t.id} missing from official list`);
    assert(
      norm(t.name) === norm(byId.get(t.id)),
      `id ${t.id}: "${t.name}" != "${byId.get(t.id)}"`
    );
  }
  return "55/55 names match";
});

check("every guide non-blank", () => {
  const blank = trophies.filter((t) => !String(t.guide ?? "").trim());
  assert(blank.length === 0, `blank guides: ids ${blank.map((t) => t.id).join(", ")}`);
  return "55/55 guides non-blank";
});

check("every step cited with cites within 1-4", () => {
  const bad = [];
  for (const t of trophies) {
    assert(Array.isArray(t.steps) && t.steps.length > 0, `id ${t.id} has no steps`);
    for (const [i, s] of t.steps.entries()) {
      if (!Array.isArray(s.cites) || s.cites.length === 0) {
        bad.push(`id ${t.id} step ${i + 1} uncited`);
        continue;
      }
      if (!s.cites.every((c) => Number.isInteger(c) && c >= 1 && c <= 4)) {
        bad.push(`id ${t.id} step ${i + 1} cites out of range`);
      }
      if (!String(s.text ?? "").trim()) bad.push(`id ${t.id} step ${i + 1} blank`);
    }
  }
  assert(bad.length === 0, bad.slice(0, 5).join("; "));
  return "all steps have cites in 1-4";
});

check("grade totals 1/2/6/46", () => {
  const counts = {};
  for (const t of trophies) counts[t.grade] = (counts[t.grade] ?? 0) + 1;
  const got = [
    counts.platinum ?? 0,
    counts.gold ?? 0,
    counts.silver ?? 0,
    counts.bronze ?? 0,
  ];
  assert(
    got[0] === 1 && got[1] === 2 && got[2] === 6 && got[3] === 46,
    `got ${got.join("/")}`
  );
  return got.join("/");
});

check("28 secret", () => {
  const n = trophies.filter((t) => t.secret === true).length;
  assert(n === 28, `got ${n}`);
  return `${n} secret`;
});

check("flags exactly 1 MISSABLE, 1 CAUTION, 5 unknown", () => {
  const missable = trophies.filter((t) => t.flag === "MISSABLE").length;
  const caution = trophies.filter((t) => t.flag === "CAUTION").length;
  const unknown = trophies.filter((t) => t.flag === "unknown").length;
  assert(
    missable === 1 && caution === 1 && unknown === 5,
    `got MISSABLE ${missable}, CAUTION ${caution}, unknown ${unknown}`
  );
  return `MISSABLE ${missable} / CAUTION ${caution} / unknown ${unknown}`;
});

check("sources_rail 4 entries cited_by 55", () => {
  const rail = data.sources_rail;
  assert(Array.isArray(rail), "sources_rail is not an array");
  assert(rail.length === 4, `sources_rail length is ${rail.length}`);
  for (const s of rail) {
    assert(s.cited_by === 55, `source ${s.n} cited_by is ${s.cited_by}`);
  }
  const ns = rail.map((s) => s.n).join(",");
  assert(ns === "1,2,3,4", `source numbers are ${ns}`);
  return "4 sources, each cited by 55";
});

let totalSteps = 0;
let totalCited = 0;
for (const t of trophies) {
  for (const s of t.steps ?? []) {
    totalSteps += 1;
    if (Array.isArray(s.cites) && s.cites.length > 0) totalCited += 1;
  }
}
check("total steps == total cited steps", () => {
  assert(totalSteps === totalCited, `steps ${totalSteps}, cited ${totalCited}`);
  return `steps ${totalSteps}, cited ${totalCited}`;
});

let failed = 0;
for (const r of results) {
  if (!r.pass) failed += 1;
  console.log(
    `${r.pass ? "PASS" : "FAIL"}  ${r.name}${r.detail ? " — " + r.detail : ""}`
  );
}
process.exit(failed ? 1 : 0);
