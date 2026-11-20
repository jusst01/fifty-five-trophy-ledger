window.FF = window.FF || {};

/* --------------------------------------------------------------------------
   FIFTY-FIVE v2 — Roadmap view (8 stage cards).

   Reads FF.state.data / FF.state.progress, fills #roadmap-root.
   Trophies are grouped by their stage field, so nothing here is a hard-coded
   list of trophy names: add a trophy to the data and it shows up in its stage.
   -------------------------------------------------------------------------- */

window.FF.roadmap = (() => {
  const STAGES = [
    {
      n: 1,
      title: "Story",
      tag: "Chapters 1–4 + finals",
      summary: "The chapters, the final mission and the named story missions. Meditate at Jason's house in Chapter 1 first — one meditation spot lives there and its window closes with the chapter."
    },
    {
      n: 2,
      title: "Stranger strands",
      tag: "part of the story",
      summary: "The Andy, Kenton, Billy, Randy and Tyrone finales, and all 8 stranger strands completed."
    },
    {
      n: 3,
      title: "Collectibles",
      tag: "across Leonida",
      summary: "Trading-card sets, all 100 WAiNK cards, meditation spots, vehicles, animals and garage registers, gathered across Leonida."
    },
    {
      n: 4,
      title: "Activities",
      tag: "along the way",
      summary: "Stunts, shooting-range golds, drone races, race wins, fishing, the arcade — and 50 of the 80 challenges."
    },
    {
      n: 5,
      title: "Free-roam feats",
      tag: "open world",
      summary: "Escapes, robberies, vaults, Combat Focus, the Rhino, bowling and the rest of Leonida's open-world feats."
    },
    {
      n: 6,
      title: "Money",
      tag: "fund the finish",
      summary: "Launder $250k, spend $100k, and buy every garage on the map."
    },
    {
      n: 7,
      title: "100% mop-up",
      tag: "the long road",
      summary: "A Long Road: the in-game 100% checklist — about 60% of true completion (PowerPyx)."
    },
    {
      n: 8,
      title: "Platinum",
      tag: "the ledger closes",
      summary: "Vice Got a Price! lands when the other 54 trophies are earned."
    }
  ];

  const SUMMARY = "About 200 hours · difficulty 4/10 · one playthrough · no mission replay · free-roam continues after the story (PowerPyx).";

  const WARNING = "Chapter-1 meditation missable: meditate at Jason's house during Chapter 1. Cheats disable trophies AND saving (PowerPyx).";

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

  /* The shell ships a placeholder .view-title in each tab view; the roadmap's
     own h2 replaces it. Hide it so the heading is not printed twice — only
     DIRECT children, so a re-render never hides our own h2. */
  const hideShellTitle = (root) => {
    const view = root.closest ? root.closest(".view") : null;
    if (!view) return;
    Array.prototype.forEach.call(view.children, child => {
      if (child !== root && child.classList && child.classList.contains("view-title")) {
        child.hidden = true;
      }
    });
  };

  const chipHTML = (trophy) => {
    const earned = isEarned(trophy.id);
    // Honour spoiler mode: a secret, unrevealed trophy shows as "Hidden trophy — #id".
    const label = FF.spoilers.displayName(trophy, earnedMap());
    const cls = "chip" + (earned ? " chip-earned" : "");
    const title = earned ? "Earned — " + label : label;

    return '<span class="' + cls + '" title="' + esc(title) + '">'
      + '<span class="chip-dot grade-' + esc(trophy.grade) + '" aria-hidden="true"></span>'
      + esc(label)
      + "</span>";  };

  const cardHTML = (stage, trophies) => {
    const inStage = trophies.filter(t => Number(t.stage) === stage.n);
    const earned = inStage.filter(t => isEarned(t.id)).length;

    let html = '<div class="stage-card" data-stage="' + stage.n + '">';

    html += '<div class="stage-card-head">'
      + '<h3 class="stage-card-title">Stage ' + stage.n + " — " + esc(stage.title) + "</h3>"
      + '<span class="stage-card-tag">' + esc(stage.tag) + "</span>"
      + "</div>";

    html += '<p class="stage-card-summary">' + esc(stage.summary) + "</p>";

    html += '<div class="stage-chips">';
    if (inStage.length === 0) {
      html += '<span class="chip">No trophies in this stage</span>';
    } else {
      inStage.forEach(t => { html += chipHTML(t); });
    }
    html += "</div>";

    html += '<div class="stage-card-footer">' + earned + " / " + inStage.length
      + " earned in this stage</div>";

    html += "</div>";
    return html;
  };

  const render = () => {
    const root = document.getElementById("roadmap-root");
    if (!root) return;

    hideShellTitle(root);

    const trophies = trophiesOf();
    if (trophies.length === 0) {
      root.innerHTML = '<p class="detail-empty">Load the trophy data to see the roadmap.</p>';
      return;
    }

    // #roadmap-root ships with .roadmap-grid; the header must span the full
    // width, so the cards get their own inner grid instead.
    root.classList.remove("roadmap-grid");

    let html = '<header class="roadmap-head">';
    html += '<h2 class="view-title">Roadmap to the platinum — Vice Got a Price!</h2>';
    html += '<p class="roadmap-summary">' + esc(SUMMARY) + "</p>";
    html += '<p class="roadmap-warning">' + esc(WARNING) + "</p>";
    html += "</header>";

    html += '<div class="roadmap-grid">';
    STAGES.forEach(stage => { html += cardHTML(stage, trophies); });
    html += "</div>";

    root.innerHTML = html;
  };

  return { STAGES, render };
})();
