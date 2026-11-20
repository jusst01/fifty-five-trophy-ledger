window.FF = window.FF || {};

/* --------------------------------------------------------------------------
   FIFTY-FIVE v2 — bootstrap & wiring.
   Everything is declared before any render call, then the DOMContentLoaded
   listener is registered last. Rendering never runs until data is loaded and
   the full hash state has been applied.
   -------------------------------------------------------------------------- */
(() => {
  const DEFAULT_OPEN_ID = 28;
  const DEFAULT_TAB = "tracker";
  const DEFAULT_GROUP = "all";
  const TAB_VIEWS = {
    tracker: "view-tracker",
    roadmap: "view-roadmap",
    missables: "view-missables"
  };

  // Shared state object owned by this module; tracker/roadmap/missables read it.
  FF.state = {
    data: null,
    progress: { version: 1, earned: {} },
    group: DEFAULT_GROUP,
    grade: "all",
    sort: "roadmap",
    query: "",
    openId: DEFAULT_OPEN_ID,
    tab: DEFAULT_TAB
  };

  let pendingHash = {};

  /* ------------------------------------------------------------------
     Helpers
     ------------------------------------------------------------------ */
  const trophiesOf = () => (FF.state.data && Array.isArray(FF.state.data.trophies))
    ? FF.state.data.trophies
    : [];

  const validIdSet = () => trophiesOf().map(t => String(t.id));

  const parseHash = () => {
    const raw = window.location.hash ? window.location.hash.replace(/^#/, "") : "";
    const out = {};
    if (!raw) return out;
    raw.split("&").forEach(pair => {
      if (!pair) return;
      const idx = pair.indexOf("=");
      const key = idx === -1 ? pair : pair.slice(0, idx);
      const val = idx === -1 ? "" : pair.slice(idx + 1);
      try {
        out[decodeURIComponent(key)] = decodeURIComponent(val.replace(/\+/g, " "));
      } catch (e) {
        out[key] = val;
      }
    });
    return out;
  };

  const hashSeedIds = (hash) => {
    if (!hash || !hash.seed) return [];
    const known = new Set(validIdSet());
    return hash.seed
      .split(",")
      .map(s => s.trim())
      .filter(s => s && known.has(s));
  };

  const currentSeed = () => FF.store.earnedIds(FF.state.progress).join(",");

  const updateHash = () => {
    const params = [
      "tab=" + encodeURIComponent(FF.state.tab),
      "filter=" + encodeURIComponent(FF.state.group),
      "open=" + encodeURIComponent(FF.state.openId),
      "seed=" + encodeURIComponent(currentSeed())
    ];
    try {
      history.replaceState(null, "", "#" + params.join("&"));
    } catch (e) {
      // file:// or restricted contexts — hash state is best-effort.
    }
  };

  /* ------------------------------------------------------------------
     Tab switching
     ------------------------------------------------------------------ */
  const showTab = (tab) => {
    const viewId = TAB_VIEWS[tab] ? tab : DEFAULT_TAB;
    FF.state.tab = viewId;

    Object.keys(TAB_VIEWS).forEach(key => {
      const view = document.getElementById(TAB_VIEWS[key]);
      if (view) view.hidden = key !== viewId;
    });

    document.querySelectorAll(".tab").forEach(btn => {
      const active = btn.dataset.tab === viewId;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    renderTabView();
  };

  const renderTabView = () => {
    if (FF.state.tab === "roadmap") {
      if (FF.roadmap && typeof FF.roadmap.render === "function") FF.roadmap.render();
    } else if (FF.state.tab === "missables") {
      if (FF.missables && typeof FF.missables.render === "function") FF.missables.render();
    }
  };

  /* ------------------------------------------------------------------
     Render pipeline
     ------------------------------------------------------------------ */
  const renderAll = () => {
    if (!FF.state.data) return;
    FF.tracker.renderAudit();
    FF.tracker.renderCounter();
    FF.tracker.renderFilterRow();
    FF.tracker.renderChecklist();
    FF.tracker.renderDetail();
    FF.tracker.renderRail();
    showTab(FF.state.tab);
  };

  FF.renderAll = renderAll;
  FF.updateHash = updateHash;

  /* ------------------------------------------------------------------
     Header actions
     ------------------------------------------------------------------ */
  const downloadProgress = () => {
    const text = FF.store.exportJSON(FF.state.progress);
    const blob = new Blob([text], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fifty-five-progress.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const importNote = (label, message) => {
    // Minimal inline feedback on the import button label itself.
    if (!label) return;
    const textNode = Array.prototype.find.call(
      label.childNodes,
      n => n.nodeType === Node.TEXT_NODE && n.nodeValue.trim() !== ""
    );
    if (!textNode) return;
    if (!label.dataset.baseLabel) label.dataset.baseLabel = textNode.nodeValue.trim();
    textNode.nodeValue = message;
    if (label._noteTimer) clearTimeout(label._noteTimer);
    label._noteTimer = setTimeout(() => {
      textNode.nodeValue = label.dataset.baseLabel;
    }, 2600);
  };

  const importProgress = (file) => {
    if (!file) return;
    const label = document.querySelector(".btn-import");
    const reader = new FileReader();
    reader.onload = () => {
      const result = FF.store.importJSON(String(reader.result), validIdSet());
      if (!result) {
        importNote(label, "Import failed");
        return;
      }
      FF.state.progress = result;
      FF.store.save(FF.state.progress);
      if (FF.updateHash) FF.updateHash();
      renderAll();
      importNote(label, "Imported ✓");
    };
    reader.onerror = () => importNote(label, "Import failed");
    reader.readAsText(file);
  };

  /* ------------------------------------------------------------------
     Event wiring
     ------------------------------------------------------------------ */
  const wireEvents = () => {
    document.querySelectorAll(".tab").forEach(btn => {
      btn.addEventListener("click", () => {
        showTab(btn.dataset.tab);
        updateHash();
      });
    });

    const gradeSelect = document.getElementById("grade-select");
    if (gradeSelect) {
      gradeSelect.value = FF.state.grade;
      gradeSelect.addEventListener("change", () => {
        FF.state.grade = gradeSelect.value;
        FF.tracker.renderChecklist();
      });
    }

    const sortSelect = document.getElementById("sort-select");
    if (sortSelect) {
      sortSelect.value = FF.state.sort;
      sortSelect.addEventListener("change", () => {
        FF.state.sort = sortSelect.value;
        FF.tracker.renderChecklist();
      });
    }

    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.value = FF.state.query;
      searchInput.addEventListener("input", () => {
        FF.state.query = searchInput.value;
        FF.tracker.renderChecklist();
      });
    }

    const spoilerToggle = document.getElementById("spoiler-toggle");
    if (spoilerToggle) {
      spoilerToggle.checked = FF.spoilers.isOn();
      spoilerToggle.addEventListener("change", () => {
        FF.spoilers.setOn(spoilerToggle.checked);
        renderAll();
      });
    }

    const exportBtn = document.getElementById("export-btn");
    if (exportBtn) exportBtn.addEventListener("click", downloadProgress);

    const importFile = document.getElementById("import-file");
    if (importFile) {
      importFile.addEventListener("change", () => {
        const file = importFile.files && importFile.files[0];
        importProgress(file);
        importFile.value = ""; // allow re-importing the same file
      });
    }
  };

  /* ------------------------------------------------------------------
     Bootstrap
     ------------------------------------------------------------------ */
  const applyHashState = () => {
    const hash = pendingHash;
    const tabs = Object.keys(TAB_VIEWS);

    if (hash.tab && tabs.includes(hash.tab)) FF.state.tab = hash.tab;
    if (hash.filter && Object.prototype.hasOwnProperty.call(FF.filters.GROUPS, hash.filter)) {
      FF.state.group = hash.filter;
    }
    if (hash.open && !isNaN(Number(hash.open)) && Number(hash.open) > 0) {
      FF.state.openId = Number(hash.open);
    }
  };

  const boot = async () => {
    let data;
    try {
      const response = await fetch("data/trophies.json", { cache: "no-store" });
      if (!response.ok) throw new Error("HTTP " + response.status);
      data = await response.json();
    } catch (err) {
      FF.state.data = { trophies: [], sources_rail: [] };
      FF.tracker.renderAudit();
      const pane = document.getElementById("detail-pane");
      if (pane) {
        pane.innerHTML = '<h2 class="pane-title">Detail</h2>'
          + '<p class="detail-empty">Could not load data/trophies.json. Serve this folder over HTTP (for example: python3 -m http.server) and reload.</p>';
      }
      return;
    }

    // 1. Data first.
    FF.state.data = data;

    // 2. Stored progress.
    FF.state.progress = FF.store.load();

    // 3. Read the hash into pending state (do not apply yet).
    pendingHash = parseHash();

    // 4. Seed before the first render, so the whole view is stable from frame one.
    const seedIds = hashSeedIds(pendingHash);
    if (seedIds.length) {
      FF.store.applySeed(FF.state.progress, seedIds);
    }

    // 5. Spoiler mode from storage.
    const spoilerToggle = document.getElementById("spoiler-toggle");
    if (spoilerToggle) spoilerToggle.checked = FF.spoilers.isOn();

    // 6. Only now apply the full hash state (tab / filter / open).
    applyHashState();

    // 7. Wire, sync the hash (earned ids in seed) and render.
    wireEvents();
    updateHash();
    renderAll();
  };

  document.addEventListener("DOMContentLoaded", boot);
})();
