window.FF = window.FF || {};

/* --------------------------------------------------------------------------
   FIFTY-FIVE v2 — Missables & Cautions view.

   Three honest blocks, all read from the data:
   1. the one trophy flagged MISSABLE (Positive Mental Attitude),
   2. the one trophy flagged CAUTION  (Actions Speak Louder),
   3. every trophy flagged "unknown" as a small card.
   Nothing is hard-coded except the labels: the cards are selected by flag and
   their names, descriptions, steps and callouts come from the trophy objects.
   -------------------------------------------------------------------------- */

window.FF.missables = (() => {
  const INTRO = "One possibly missable trophy, one permanent caution, and five trophies whose requirement is not yet published. Nothing here is invented: the flags come from the cited sources.";

  const UNKNOWN_NOTE = "Requirement not yet published by PowerPyx; this guide follows the official description only.";

  const NUMBER_WORDS = ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"];

  const esc = (str) => {
    if (typeof str !== "string") return str == null ? "" : String(str);
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
  };

  const trophiesOf = () => {
    const data = FF.state && FF.state.data;
    return (data && Array.isArray(data.trophies)) ? data.trophies : [];
  };

  const earnedMap = () => {
    const progress = FF.state && FF.state.progress;
    return (progress && progress.earned) || {};
  };

  const isEarned = (id) => !!earnedMap()[id];

  const byFlag = (flag) => trophiesOf().filter(t => t.flag === flag);
  const byId = (id) => trophiesOf().find(t => Number(t.id) === Number(id)) || null;

  /* The shell prints a placeholder .view-title above #missables-root; this
     view's own <h2> replaces it, so hide the placeholder to avoid two headings.
     Only DIRECT children are considered, so a re-render never hides our own h2. */
  const hideShellTitle = (root) => {
    const view = root.closest ? root.closest(".view") : null;
    if (!view) return;
    Array.prototype.forEach.call(view.children, child => {
      if (child !== root && child.classList && child.classList.contains("view-title")) {
        child.hidden = true;
      }
    });
  };

  const earnedMarkHTML = (trophy) => {
    // Reuses the green .chip-earned pill (its ::after supplies the ✓).
    return isEarned(trophy.id) ? '<span class="chip chip-earned">Earned</span>' : "";
  };

  /* FF.guides.stepListHTML emits <ol class="steps">, numbered by the big coral
     .step-num column. Suppress the browser's own list markers here so each
     step is numbered exactly once. */
  const stepsHTML = (trophy) => {
    return FF.guides.stepListHTML(trophy)
      .replace('<ol class="steps">', '<ol class="steps" style="list-style:none;margin:0 0 12px;padding:0;">');
  };

  const calloutHTML = (trophy) => {
    return FF.guides.calloutHTML(trophy)
      .replace("<h3>", '<h3 class="callout-label">');
  };

  const descHTML = (trophy) => {
    return '<p class="detail-desc">“' + esc(trophy.description) + '”</p>';
  };

  /* ------------------------------------------------------------------
     Featured card — the MISSABLE and the CAUTION trophy.
     ------------------------------------------------------------------ */
  const featuredCardHTML = (trophy, badgeClass, badgeLabel, fallbackNote) => {
    if (!trophy) {
      return '<div class="miss-card"><p class="detail-empty">' + esc(fallbackNote) + "</p></div>";
    }

    let html = '<div class="miss-card" data-id="' + trophy.id + '">';

    html += '<div class="miss-card-head">'
      + '<span class="flag-badge ' + badgeClass + '">' + esc(badgeLabel) + "</span>"
      + '<h3 class="miss-card-title">' + esc(trophy.name) + "</h3>"
      + earnedMarkHTML(trophy)
      + "</div>";

    html += descHTML(trophy);
    html += stepsHTML(trophy);

    const callout = calloutHTML(trophy);
    if (callout) html += callout;

    html += "</div>";
    return html;
  };

  /* ------------------------------------------------------------------
     Small card — a trophy whose requirement is not yet published.
     ------------------------------------------------------------------ */
  const unknownCardHTML = (trophy) => {
    let html = '<div class="miss-card" data-id="' + trophy.id + '">';

    html += '<div class="miss-card-head">'
      + '<span class="flag-badge flag-unknown">NOT YET KNOWN</span>'
      + '<h3 class="miss-card-title">' + esc(FF.spoilers.displayName(trophy, earnedMap())) + "</h3>"
      + earnedMarkHTML(trophy)
      + "</div>";

    html += descHTML(trophy);
    html += '<p class="miss-note">' + esc(UNKNOWN_NOTE) + "</p>";
    html += "</div>";
    return html;
  };

  /* ------------------------------------------------------------------
     Render
     ------------------------------------------------------------------ */
  const render = () => {
    const root = document.getElementById("missables-root");
    if (!root) return;

    hideShellTitle(root);

    if (trophiesOf().length === 0) {
      root.innerHTML = '<p class="detail-empty">Load the trophy data to see missables and cautions.</p>';
      return;
    }

    const missable = byFlag("MISSABLE")[0] || byId(28);
    const caution = byFlag("CAUTION")[0] || byId(48);
    const unknown = byFlag("unknown");

    const unknownWord = NUMBER_WORDS[unknown.length] || String(unknown.length);
    const intro = INTRO.replace(
      "five trophies",
      unknownWord + (unknown.length === 1 ? " trophy" : " trophies")
    );

    let html = '<h2 class="view-title">Missables &amp; cautions</h2>';
    html += '<p class="roadmap-summary" style="margin-bottom:16px;">' + esc(intro) + "</p>";
    html += '<div class="miss-grid">';
    html += featuredCardHTML(
      missable,
      "flag-missable",
      "POSSIBLY MISSABLE",
      "No trophy is flagged possibly missable in the loaded data."
    );
    html += featuredCardHTML(
      caution,
      "flag-caution",
      "CAUTION",
      "No trophy is flagged as a caution in the loaded data."
    );
    html += "</div>";

    if (unknown.length > 0) {
      html += '<div class="miss-section">';
      html += '<h3 class="miss-section-title">Not yet known — ' + unknown.length
        + (unknown.length === 1 ? " trophy" : " trophies")
        + " without a published requirement</h3>";
      html += '<div class="miss-grid">';
      unknown.forEach(t => { html += unknownCardHTML(t); });
      html += "</div></div>";
    }

    root.innerHTML = html;
  };

  return { render };
})();
