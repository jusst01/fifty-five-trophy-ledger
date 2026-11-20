# FIFTY-FIVE — GTA VI Trophy Ledger

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jusst01/fifty-five-trophy-ledger/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jusst01/fifty-five-trophy-ledger/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and progress tracker for the 55 PS5 trophies of GTA VI: 1 Platinum,
2 Gold, 6 Silver, 46 Bronze — 28 of them hidden. Everything runs from static files in
`app/`; there is no build step, no server-side code and no network request.

## The 3-pane tracker

The Tracker tab is a three-pane grid that stays on one screen:

- **Checklist** — the filtered trophies as compact rows: earned checkbox, grade badge,
  name (hidden trophies show as `Hidden trophy — #id` while spoiler mode is on), and a
  `kind · Stage n` line. Clicking a row selects it without losing your place in the list.
- **Detail** — the selected trophy: its official description, a meta line (grade, kind,
  stage), any flag badges, a miss-window or caution callout, then **numbered steps** with
  a large coral numeral each and citation markers rendered as small chips ([1] [2] …),
  and a "Sources:" footer.
- **Sources rail** — the four sources, numbered, each with its role and how many guides
  cite it, plus a note on what the numbering means.

Filters (with live counts), a grade select, a sort select and a search box sit above the
grid; the header carries the global earned counter plus Export / Import and the spoiler
toggle.

## Audit strip

Directly under the header, a strip computed at render time from the loaded data — never
hard-coded — summarises the whole set: trophy and grade totals, hidden count, how many
guides cite a source, `282/282 steps cited`, sources checked, and the flag counts
(1 possibly missable, 1 caution, 5 not yet known, 0 single-source).

## Roadmap

The Roadmap tab lays all 8 stages out as a stage-card grid. Each card carries its phase
tag, a short summary, trophy chips (grade dot plus name, green with a tick when earned)
and a per-stage earned footer, from Chapter 1 through to the platinum.

## Missables & Cautions

A separate view for the things that can go wrong: one missable trophy — Positive Mental
Attitude, the Chapter 1 meditation at Jason's house — with its miss window spelled out;
one caution — Actions Speak Louder, whose Irredeemable profile choice is permanent; and
five trophies whose requirement is not yet published, shown as small cards that say so
plainly rather than guessing.

## Progress

Earned trophies and their timestamps live in `localStorage`. Export writes a JSON file
and Import reads one back, validating ids against the loaded list, so progress survives
a cleared browser or moves between machines. Spoilable names are hidden by default;
per-trophy reveal is available, and the spoiler toggle is remembered.

## Data

Trophy names, descriptions and grades are the official list. Guide text is ours;
sources are cited by number throughout — [1] PowerPyx, [2] GTABase, [3] Exophase,
[4] PSNProfiles, all checked Nov 2026. No guide text is copied from any source.

## Run it

```
node serve.ts
```

then open http://localhost:8080. Any static server over `app/` works too, for example
`python3 -m http.server 8080 --directory app`.

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` with the
vendored make.fun library.

---

A [make.fun](https://make.fun/c/gta6-trophy-guide-01) bounty entry.
