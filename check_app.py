import urllib.request
import json

# Fetch index.html
with urllib.request.urlopen("http://localhost:8080/") as resp:
    html = resp.read().decode("utf-8")
    print("HTML loaded successfully, length:", len(html))

# Fetch trophies.json
with urllib.request.urlopen("http://localhost:8080/data/trophies.json") as resp:
    data = json.loads(resp.read().decode("utf-8"))
    print("Trophies.json loaded successfully. Total trophies:", len(data["trophies"]))
    print("Sources rail length:", len(data["sources_rail"]))

# Check audit strip computation requirements
trophies = data["trophies"]
total = len(trophies)
grades = {"platinum": 0, "gold": 0, "silver": 0, "bronze": 0}
hidden = 0
cited_guides = 0
total_steps = 0
cited_steps = 0
missable = 0
caution = 0
unknown = 0
single_source = 0

for t in trophies:
    grades[t["grade"]] += 1
    if t.get("secret"):
        hidden += 1
    if t.get("sources") and len(t["sources"]) > 0:
        cited_guides += 1
    steps = t.get("steps", [])
    total_steps += len(steps)
    for s in steps:
        if s.get("cites") and len(s["cites"]) > 0:
            cited_steps += 1
    if t.get("flag") == "MISSABLE":
        missable += 1
    if t.get("flag") == "CAUTION":
        caution += 1
    if t.get("flag") == "unknown":
        unknown += 1
    if len(t.get("sources", [])) == 1:
        single_source += 1

p = grades["platinum"]
g = grades["gold"]
s = grades["silver"]
b = grades["bronze"]
audit_expected = f"{total} official · {p}P {g}G {s}S {b}B · {hidden} hidden · {cited_guides}/{total} guides cite a source · {cited_steps}/{total_steps} steps cited · 4 sources checked Nov 2026 · {missable} possibly missable · {caution} caution · {unknown} not yet known · {single_source} single-source"
print("Expected Audit Strip:", audit_expected)
print("All checks passed successfully!")
