# FIFTY-FIVE — GTA VI Trophy Ledger

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jusst01/fifty-five-trophy-ledger/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jusst01/fifty-five-trophy-ledger/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

## Description

FIFTY-FIVE is an offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden). Structured for v2, the application features:

- **3-Pane Tracker Layout**: Left checklist pane (compact rows with checkboxes, grade badges, names or spoiler-mode hidden markers, and stage lines), Center detail pane (official descriptions, metadata, warning badges, miss-window/caution callouts, numbered cited steps with citation chips `[1]`..`[4]`, and source footer), and Right sources rail pane (sources checked Nov 2026).
- **Numbered Cited Steps & Sources Rail**: Every trophy guide is re-authored into numbered steps backed by `app/data/trophies.json` and cited across our four verified sources: `[1]` PowerPyx (guide & roadmap), `[2]` GTABase (guide corroboration), `[3]` Exophase (official list verification), and `[4]` PSNProfiles (official list verification). Every step cites its source by number.
- **Computed Audit Strip**: A live audit bar directly under the header counting official trophies, grades, hidden status, cited steps, sources, missables, cautions, not-yet-known items, and single-source count.
- **Roadmap Grid & Views**: An 8-stage roadmap grid (Stage 1 through 8) with phase tags, summaries, and earned trophy chips; plus a Missables & Cautions view highlighting exactly one reported missable (*Positive Mental Attitude*, Chapter 1 meditation), one caution (*Actions Speak Louder*), and five trophies whose requirement is not yet published ("Not yet known").
- **Progress Tracking & Spoilers**: Persistent progress saved via browser `localStorage`, full JSON export and import, and toggleable spoiler mode for hidden trophies.

## Data Note

`app/data/trophies.json` holds the 55 official names, descriptions, and grades with our own re-authored guide text — sources are cited, never copied.

## Run It

To run the application locally:

```bash
node serve.ts
```

Then open `http://localhost:8080` in your web browser. Alternatively, serve the `app/` directory using any static web server (plain static files, classic scripts with `defer`, no build step, works completely offline).

## Hand It In

To generate the final output dossier:

```bash
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## make.fun

This project is an entry for the [make.fun bounty](https://make.fun/c/gta6-trophy-guide-01).
