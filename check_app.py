#!/usr/bin/env python3
"""Smoke checks for FIFTY-FIVE — GTA VI Trophy Ledger.

Fetches the running app (http://localhost:8080) and its data file, then validates
the numbers the guide is built on. Standard library only; exits 1 on any failure.

    node serve.ts                       # in another terminal
    python3 check_app.py
"""

import json
import sys
import urllib.request

BASE = "http://localhost:8080"
TIMEOUT = 10

EXPECTED_GRADES = {"platinum": 1, "gold": 2, "silver": 6, "bronze": 46}
EXPECTED_TOTAL = 55
EXPECTED_SECRET = 28
EXPECTED_STEPS = 282
EXPECTED_CITED_STEPS = 282
EXPECTED_FLAGS = {"MISSABLE": 1, "CAUTION": 1, "unknown": 5}
EXPECTED_RAIL = 4

failures = []


def check(label, got, expected):
    ok = got == expected
    mark = "ok  " if ok else "FAIL"
    print(f"  [{mark}] {label}: {got!r} (expected {expected!r})")
    if not ok:
        failures.append(label)


def fetch(url):
    req = urllib.request.Request(url, headers={"Cache-Control": "no-store"})
    with urllib.request.urlopen(req, timeout=TIMEOUT) as resp:
        return resp.read()


def main():
    print(f"FIFTY-FIVE — GTA VI Trophy Ledger — checking {BASE}")

    try:
        html = fetch(BASE + "/")
    except Exception as exc:  # connection refused, timeout, …
        print(f"  could not fetch {BASE}/: {exc}")
        print("  start the app first: node serve.ts")
        print("CHECK FAILED")
        return 1
    print(f"  index.html length: {len(html)} bytes")

    try:
        data = json.loads(fetch(BASE + "/data/trophies.json").decode("utf-8"))
    except Exception as exc:
        print(f"  could not fetch or parse data/trophies.json: {exc}")
        print("CHECK FAILED")
        return 1

    trophies = data.get("trophies") or []
    check("trophy count", len(trophies), EXPECTED_TOTAL)

    grades = {}
    for t in trophies:
        grades[t.get("grade")] = grades.get(t.get("grade"), 0) + 1
    for grade, want in EXPECTED_GRADES.items():
        check(f"grade {grade}", grades.get(grade, 0), want)
    check("grade total", sum(grades.values()), EXPECTED_TOTAL)

    secret = sum(1 for t in trophies if t.get("secret"))
    check("secret trophies", secret, EXPECTED_SECRET)

    steps = 0
    cited = 0
    guides_with_source = 0
    flags = {}
    for t in trophies:
        t_steps = t.get("steps") or []
        steps += len(t_steps)
        cited += sum(1 for s in t_steps if s.get("cites"))
        guides_with_source += 1 if (t.get("sources") or []) else 0
        flag = t.get("flag") or None
        if flag:
            flags[flag] = flags.get(flag, 0) + 1

    check("total steps", steps, EXPECTED_STEPS)
    check("steps with cites", cited, EXPECTED_CITED_STEPS)
    check("guides citing a source", guides_with_source, EXPECTED_TOTAL)

    check("MISSABLE flags", flags.get("MISSABLE", 0), EXPECTED_FLAGS["MISSABLE"])
    check("CAUTION flags", flags.get("CAUTION", 0), EXPECTED_FLAGS["CAUTION"])
    check('"unknown" flags', flags.get("unknown", 0), EXPECTED_FLAGS["unknown"])

    rail = data.get("sources_rail") or []
    check("sources_rail entries", len(rail), EXPECTED_RAIL)

    print()
    if failures:
        print(f"CHECK FAILED — {len(failures)} check(s): {', '.join(failures)}")
        return 1
    print("CHECK OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
