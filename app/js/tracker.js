window.FF = window.FF || {};

window.FF.tracker = (() => {
  const esc = (str) => {
    if (typeof str !== 'string') return String(str);
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  };

  const GRADE_LABEL = {
    platinum: "Platinum",
    gold: "Gold",
    silver: "Silver",
    bronze: "Bronze"
  };

  const GRADE_LETTER = {
    platinum: "P",
    gold: "G",
    silver: "S",
    bronze: "B"
  };

  const kindLabel = (kind) => {
    if (typeof kind !== "string" || !kind) return "";
    return kind.charAt(0).toUpperCase() + kind.slice(1);
  };

  const gradeLabel = (grade) => GRADE_LABEL[grade] || grade;
  const gradeLetter = (grade) => GRADE_LETTER[grade] || (grade ? grade.charAt(0).toUpperCase() : "?");

  const trophiesOf = (data) => (data && Array.isArray(data.trophies)) ? data.trophies : [];
  const progress = () => (FF.state && FF.state.progress) || { version: 1, earned: {} };
  const earnedMap = () => progress().earned || {};
  const isEarned = (id) => !!(earnedMap()[id]);
  const trophyCount = (data) => trophiesOf(data).length;

  /* ------------------------------------------------------------------
     Audit line — every value computed from the loaded data.
     ------------------------------------------------------------------ */
  const auditText = (data) => {
    const trophies = trophiesOf(data);
    if (trophies.length === 0) return "";

    const gradeCount = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    let secret = 0;
    let missable = 0;
    let caution = 0;
    let unknown = 0;
    let singleSource = 0;
    let guidesWithSource = 0;
    let totalSteps = 0;
    let citedSteps = 0;

    trophies.forEach(t => {
      if (gradeCount[t.grade] !== undefined) gradeCount[t.grade] += 1;
      if (t.secret) secret += 1;
      if (t.flag === "MISSABLE") missable += 1;
      if (t.flag === "CAUTION") caution += 1;
      if (t.flag === "unknown") unknown += 1;

      const sources = Array.isArray(t.sources) ? t.sources : [];
      if (sources.length > 0) guidesWithSource += 1;
      if (sources.length === 1) singleSource += 1;

      const steps = Array.isArray(t.steps) ? t.steps : [];
      totalSteps += steps.length;
      steps.forEach(s => {
        if (Array.isArray(s.cites) && s.cites.length > 0) citedSteps += 1;
      });
    });

    const railCount = Array.isArray(data.sources_rail) ? data.sources_rail.length : 0;
    const total = trophies.length;

    return [
      total + " official",
      gradeCount.platinum + "P " + gradeCount.gold + "G " + gradeCount.silver + "S " + gradeCount.bronze + "B",
      secret + " hidden",
      guidesWithSource + "/" + total + " guides cite a source",
      citedSteps + "/" + totalSteps + " steps cited",
      railCount + " sources checked Nov 2026",
      missable + " possibly missable",
      caution + " caution",
      unknown + " not yet known",
      singleSource + " single-source"
    ].join(" · ");
  };

  const renderAudit = () => {
    const el = document.getElementById("audit-strip");
    if (!el) return;
    const data = FF.state && FF.state.data;
    el.textContent = data ? auditText(data) : "";
  };

  const renderCounter = () => {
    const el = document.getElementById("earned-counter");
    if (!el) return;
    const earned = FF.store.earnedCount(progress());
    const total = trophyCount(FF.state && FF.state.data) || 55;
    el.innerHTML = '<span class="earned-n">' + earned + "</span> / " + total + " earned";
  };

  /* ------------------------------------------------------------------
     Filter row
     ------------------------------------------------------------------ */
  const renderFilterRow = () => {
    const row = document.getElementById("filter-row");
    if (!row) return;
    const data = FF.state && FF.state.data;
    if (!data) { row.innerHTML = ""; return; }

    const counts = FF.filters.counts(trophiesOf(data));
    const current = FF.state.group;

    let html = "";
    for (const key in FF.filters.GROUPS) {
      if (!Object.prototype.hasOwnProperty.call(FF.filters.GROUPS, key)) continue;
      const active = key === current ? " active" : "";
      html += '<button class="filter-btn' + active + '" type="button" data-group="' + esc(key) + '" aria-pressed="' + (key === current) + '">'
        + esc(FF.filters.GROUPS[key])
        + ' <span class="count">' + (counts[key] || 0) + "</span></button>";
    }
    row.innerHTML = html;

    row.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        FF.state.group = btn.dataset.group;
        if (FF.updateHash) FF.updateHash();
        FF.renderAll();
      });
    });
  };

  /* ------------------------------------------------------------------
     Checklist
     ------------------------------------------------------------------ */
  const highlight = (id) => {
    const pane = document.getElementById("checklist-pane");
    if (!pane) return;
    pane.querySelectorAll(".trophy-row-wrapper").forEach(row => {
      row.classList.toggle("selected", Number(row.dataset.id) === Number(id));
    });
  };

  const selectTrophy = (id) => {
    FF.state.openId = Number(id);
    renderDetail();
    highlight(id);
    if (FF.updateHash) FF.updateHash();
  };

  const rowHTML = (trophy) => {
    const earned = isEarned(trophy.id);
    const selected = Number(trophy.id) === Number(FF.state.openId);
    const name = esc(FF.spoilers.displayName(trophy, earnedMap()));
    const kind = esc(kindLabel(trophy.kind));
    const stage = trophy.stage ? "Stage " + trophy.stage : "";

    return '<div class="trophy-row-wrapper' + (selected ? " selected" : "") + (earned ? " earned" : "") + '" data-id="' + trophy.id + '">'
      + '<input class="row-check" type="checkbox" ' + (earned ? "checked" : "")
      + ' aria-label="Mark trophy ' + trophy.id + ' earned">'
      + '<span class="grade-badge grade-' + esc(trophy.grade) + '" title="' + esc(gradeLabel(trophy.grade)) + '">'
      + esc(gradeLetter(trophy.grade)) + "</span>"
      + '<div class="row-main">'
      + '<span class="trophy-name">' + name + "</span>"
      + '<div class="kind-line">' + kind + (stage ? " · " + stage : "") + "</div>"
      + (trophy.flag ? FF.guides.badgesHTML(trophy) : "")
      + "</div></div>";
  };

  const renderChecklist = () => {
    const pane = document.getElementById("checklist-pane");
    if (!pane) return;
    const data = FF.state && FF.state.data;
    if (!data) { pane.innerHTML = ""; return; }

    const list = FF.filters.apply(trophiesOf(data), {
      group: FF.state.group,
      grade: FF.state.grade,
      sort: FF.state.sort,
      query: FF.state.query
    });

    let html = '<h2 class="pane-title">Checklist</h2>';
    if (list.length === 0) {
      html += '<p class="detail-empty">No trophies match these filters.</p>';
    } else {
      list.forEach(t => { html += rowHTML(t); });
    }
    pane.innerHTML = html;

    pane.querySelectorAll(".trophy-row-wrapper").forEach(rowEl => {
      const id = Number(rowEl.dataset.id);

      rowEl.addEventListener("click", (ev) => {
        if (ev.target && ev.target.closest && ev.target.closest(".row-check")) return;
        selectTrophy(id);
      });

      const cb = rowEl.querySelector(".row-check");
      if (cb) {
        cb.addEventListener("change", () => {
          FF.store.toggle(progress(), id);
          if (FF.updateHash) FF.updateHash();
          renderCounter();
          renderChecklist();
          renderDetail();
        });
      }
    });
  };

  /* ------------------------------------------------------------------
     Detail pane
     ------------------------------------------------------------------ */
  const stepsHTML = (trophy) => {
    const raw = FF.guides.stepListHTML(trophy);
    if (!raw) return "";

    // FF.guides emits <li><num><text><chips…></li>; group text+chips into
    // .step-body so the grid layout keeps the numeral in its own column.
    return raw.replace(/<li class="step-item">([\s\S]*?)<\/li>/g, (whole, inner) => {
      const m = inner.match(/^<span class="step-num">([\s\S]*?)<\/span><span class="step-text">([\s\S]*?)<\/span>([\s\S]*)$/);
      if (!m) return whole;
      const rest = m[3] ? '<span class="step-cites">' + m[3] + "</span>" : "";
      return '<li class="step-item"><span class="step-num">' + m[1] + "</span>"
        + '<span class="step-body"><span class="step-text">' + m[2] + "</span>" + rest + "</span></li>";
    });
  };

  const isHidden = (trophy) => {
    return FF.spoilers.isOn()
      && !!trophy.secret
      && !isEarned(trophy.id)
      && !FF.spoilers.isRevealed(trophy.id);
  };

  const renderDetail = () => {
    const pane = document.getElementById("detail-pane");
    if (!pane) return;
    const data = FF.state && FF.state.data;
    if (!data) { pane.innerHTML = ""; return; }

    const trophy = trophiesOf(data).find(t => Number(t.id) === Number(FF.state.openId));

    if (!trophy) {
      pane.innerHTML = '<h2 class="pane-title">Detail</h2>'
        + '<p class="detail-empty">Select a trophy from the checklist to read its cited guide.</p>';
      return;
    }

    const name = esc(FF.spoilers.displayName(trophy, earnedMap()));
    const meta = [
      esc(gradeLabel(trophy.grade)),
      esc(kindLabel(trophy.kind)),
      trophy.stage ? "Stage " + trophy.stage : ""
    ].filter(Boolean).join(" · ");

    let html = '<h2 class="pane-title">Detail</h2>';
    html += '<div class="detail-head"><h2 class="detail-title">' + name + "</h2></div>";

    if (isHidden(trophy)) {
      html += '<p class="detail-desc">Secret trophy — its description and guide stay hidden while spoiler mode is on.</p>';
      html += '<div class="detail-meta"><span>' + meta + "</span></div>";
      html += '<div class="detail-badges">' + FF.guides.badgesHTML(trophy) + "</div>";
      html += '<button id="reveal-btn" class="btn" type="button">Reveal this trophy</button>';
      pane.innerHTML = html;

      const revealBtn = pane.querySelector("#reveal-btn");
      if (revealBtn) {
        revealBtn.addEventListener("click", () => {
          FF.spoilers.reveal(trophy.id);
          renderDetail();
          renderChecklist();
        });
      }
      return;
    }

    html += '<p class="detail-desc">“' + esc(trophy.description) + '”</p>';
    html += '<div class="detail-meta"><span>' + meta + "</span></div>";
    html += '<div class="detail-badges">' + FF.guides.badgesHTML(trophy) + "</div>";

    const callout = FF.guides.calloutHTML(trophy);
    if (callout) html += callout.replace("<h3>", '<h3 class="callout-label">');

    if (trophy.steps && trophy.steps.length) {
      html += '<h3 class="steps-heading">Steps</h3>';
      html += stepsHTML(trophy);
    }

    html += FF.guides.sourcesFooterHTML(trophy);
    pane.innerHTML = html;
  };

  /* ------------------------------------------------------------------
     Sources rail
     ------------------------------------------------------------------ */
  const renderRail = () => {
    const rail = document.getElementById("sources-rail");
    if (!rail) return;
    const data = FF.state && FF.state.data;
    if (!data) { rail.innerHTML = ""; return; }
    rail.innerHTML = FF.guides.railHTML(data);
  };

  return {
    auditText,
    renderAudit,
    renderCounter,
    renderFilterRow,
    renderChecklist,
    renderDetail,
    renderRail
  };
})();
