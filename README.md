# FIFTY-FIVE — GTA VI Trophy Ledger

[![make.fun entry](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/jusst01/fifty-five-trophy-ledger/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/jusst01/fifty-five-trophy-ledger/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline trophy guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI. A checklist with progress saved in the browser, export and import, filters by kind and grade, and a spoiler mode that hides hidden trophies until they are earned. An eight-stage roadmap to the platinum, the one reported missable flagged up front with its Chapter 1 window, and a guide for every trophy written for this entry — each fact named to its source (PowerPyx, GTABase, Exophase, PSNProfiles) in a Sources footer.

An entry to the make.fun bounty "Build the best GTA 6 trophy guide": https://make.fun/c/gta6-trophy-guide-01

## Run it

```
node serve.ts
```

then open http://localhost:8080 — or serve the `app/` folder with any static file server. It works fully offline and loads nothing over the network.

## Hand it in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

writes `out/dossier.json` with the vendored make.fun library, beside copies of `app/` and `screenshots/`.
