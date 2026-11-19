/* app/js/roadmap.js — 8-Stage Platinum Roadmap Rendering */

window.RoadmapRenderer = {
  STAGES_META: [
    {
      stage: 1,
      title: "Stage 1: Story & Campaign Progression",
      rationale: "Chapters 1–4, final missions, and named operations. Free-roam continues after story completion (PowerPyx). No mission replay.",
      hasWarnings: true
    },
    {
      stage: 2,
      title: "Stage 2: Stranger Strands & Encounters",
      rationale: "Complete character strands including Andy, Kenton, Billy, Randy, and Tyrone finales, plus all 8 stranger strands across Leonida.",
      hasWarnings: false
    },
    {
      stage: 3,
      title: "Stage 3: Collectibles & Exploration",
      rationale: "Discover 3 card sets, WAiNK ×100, meditation spots, 100 vehicles, explore all Leonida districts, register 10 vehicles, and find Bret's unique animal.",
      hasWarnings: false
    },
    {
      stage: 4,
      title: "Stage 4: Activities & Challenges",
      rationale: "Master 250 stunt jumps, Shooting Range golds, drone races at all locations, 20 race wins, fishing vs Cal, arcade games, and 50 of 80 challenges (PowerPyx).",
      hasWarnings: false
    },
    {
      stage: 5,
      title: "Stage 5: Free-Roam Feats & Combat",
      rationale: "Execute partner wanted escapes, 3 shops back-to-back, 5 bank vaults, armored trucks, undetected jewelry heists, Combat Focus ×5, and gang operations.",
      hasWarnings: false
    },
    {
      stage: 6,
      title: "Stage 6: Wealth & Enterprise",
      rationale: "Launder $250,000 in illicit funds, spend $100,000 across Leonida luxury markets, and purchase all available garage properties.",
      hasWarnings: false
    },
    {
      stage: 7,
      title: "Stage 7: 100% True Completion Mop-Up",
      rationale: "Unlock 'A Long Road' (Gold). Reaching ~60% true checklist completion triggers final mop-up (~200 hours, difficulty 4/10 per PowerPyx).",
      hasWarnings: false
    },
    {
      stage: 8,
      title: "Stage 8: Platinum Crown",
      rationale: "Acquire 'Vice Got a Price!' by unlocking every other trophy across Leonida to claim Leonida Legend status.",
      hasWarnings: false
    }
  ],

  render: function(containerEl, trophies, earnedMap, onJumpToTrophy) {
    if (!containerEl) return;

    let html = ''; // Need to declare html variable here

    window.RoadmapRenderer.STAGES_META.forEach(meta => {
      const stageTrophies = trophies.filter(t => t.stage === meta.stage);
      const total = stageTrophies.length;
      const earned = stageTrophies.filter(t => window.StorageManager.isEarned(t.id, earnedMap)).length;

      let chipsHTML = stageTrophies.map(t => {
        const isEarned = window.StorageManager.isEarned(t.id, earnedMap);
        const title = window.SpoilerManager.getDisplayTitle(t, earnedMap);
        const gradeLetter = t.grade[0].toUpperCase();
        return `
          <button class="trophy-chip ${isEarned ? 'earned-chip' : ''}" data-trophy-id="${t.id}" title="${escapeHTML(title)}">
            <span class="badge-${t.grade}" style="padding: 0.1rem 0.3rem; border-radius: 2px; font-size: 10px;">${gradeLetter}</span>
            <span>#${t.id}: ${escapeHTML(title)}</span>
            ${isEarned ? ' ✓' : ''}
          </button>
        `;
      }).join('');

      let warningsHTML = '';
      if (meta.hasWarnings) {
        warningsHTML = `
          <div class="stage-warnings">
            <div>⚠️ <strong>Chapter 1 Missable:</strong> Meditate at Jason's house during Chapter 1 before finishing the chapter (Positive Mental Attitude) — the only reported missable in the game.</div>
            <div>⚠️ <strong>Cheat Warning:</strong> Using cheat codes disables trophies AND saving (PowerPyx). Avoid cheats entirely.</div>
          </div>
        `;
      }

      html += `
        <div class="roadmap-card ${meta.stage === 1 ? 'stage-1-card' : ''}">
          ${warningsHTML}
          <div class="stage-title-row">
            <h3 class="stage-title">${escapeHTML(meta.title)}</h3>
            <span class="stage-progress-pill">${earned}/${total} Earned</span>
          </div>
          <p class="stage-rationale">${escapeHTML(meta.rationale)}</p>
          <div class="stage-trophy-chips">
            ${chipsHTML}
          </div>
        </div>
      `;
    });

    containerEl.innerHTML = html;

    // Attach click handlers to chips
    containerEl.querySelectorAll('.trophy-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-trophy-id'));
        if (typeof onJumpToTrophy === 'function') {
          onJumpToTrophy(id);
        }
      });
    });
  }
};

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
