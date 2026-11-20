/* app/js/roadmap.js — 8-Stage Platinum Roadmap Stage-Card Grid (v2) */

window.RoadmapRenderer = {
  STAGES_META: [
    {
      stage: 1,
      title: "Stage 1 — Story",
      tag: "Chapters 1–4 + finals",
      summary: "Chapters, final mission and the named story missions; meditate at Jason's house in Chapter 1 first."
    },
    {
      stage: 2,
      title: "Stage 2 — Stranger strands",
      tag: "part of the story",
      summary: "Andy, Kenton, Billy, Randy, Tyrone finales + complete 8 strands."
    },
    {
      stage: 3,
      title: "Stage 3 — Collectibles",
      tag: "across Leonida",
      summary: "Card sets, WAiNK x100, meditation spots, vehicles, animals, garages' registers."
    },
    {
      stage: 4,
      title: "Stage 4 — Activities",
      tag: "along the way",
      summary: "Stunts, range golds, drone races, race wins, fishing, arcade, 50 of 80 challenges (PowerPyx)."
    },
    {
      stage: 5,
      title: "Stage 5 — Free-roam feats",
      tag: "open world",
      summary: "Escapes, robberies, vaults, Combat Focus, Rhino, bowling and the rest of DESIGN.md s.4 stage 5."
    },
    {
      stage: 6,
      title: "Stage 6 — Money",
      tag: "fund the finish",
      summary: "Launder $250k, spend $100k, buy all garages."
    },
    {
      stage: 7,
      title: "Stage 7 — 100% mop-up",
      tag: "the long road",
      summary: "A Long Road: 100% checklist is about 60% of true completion (PowerPyx)."
    },
    {
      stage: 8,
      title: "Stage 8 — Platinum",
      tag: "the ledger closes",
      summary: "Vice Got a Price! once the other 54 land."
    }
  ],

  render: function(containerEl, trophies, earnedMap, onJumpToTrophy) {
    if (!containerEl) return;

    let headerHTML = `
      <div class="roadmap-header-banner" style="margin-bottom: 1.5rem; padding: 1.25rem; background: var(--surface-color); border: 1px solid var(--surface-secondary); border-radius: var(--border-radius-lg);">
        <h2 style="color: var(--accent-color); margin-top: 0; font-size: 1.35rem;">Roadmap to the platinum — Vice Got a Price!</h2>
        <p style="margin: 0.5rem 0; color: var(--text-primary); font-size: 0.95rem;">About 200 hours · difficulty 4/10 · one playthrough · no mission replay · free-roam continues after the story (PowerPyx).</p>
        <div style="margin-top: 0.75rem; padding: 0.5rem 0.75rem; background: #3d3000; color: var(--warning-color); border-radius: var(--border-radius); font-size: 0.9rem; border: 1px solid #7a6a00;">
          ⚠️ <strong>Chapter 1 Meditation Missable:</strong> Meditate at Jason's house during Chapter 1 (Positive Mental Attitude). <strong>Cheat Warning:</strong> Cheats disable trophies AND saving (PowerPyx).
        </div>
      </div>
    `;

    let cardsHTML = window.RoadmapRenderer.STAGES_META.map(meta => {
      const stageTrophies = trophies.filter(t => t.stage === meta.stage);
      const total = stageTrophies.length;
      const earned = stageTrophies.filter(t => window.StorageManager.isEarned(t.id, earnedMap)).length;

      const chipsHTML = stageTrophies.map(t => {
        const isEarned = window.StorageManager.isEarned(t.id, earnedMap);
        const title = window.SpoilerManager.getDisplayTitle(t, earnedMap);
        const gradeLetter = t.grade[0].toUpperCase();
        return `
          <button class="trophy-chip ${isEarned ? 'earned-chip' : ''}" data-trophy-id="${t.id}" title="${escapeHTML(title)}" style="display: flex; align-items: center; gap: 0.5rem; width: 100%; text-align: left; background: var(--bg-secondary); border: 1px solid var(--surface-secondary); padding: 0.35rem 0.5rem; border-radius: 4px; cursor: pointer; color: var(--text-primary); font-size: 0.8rem; transition: background 0.2s;">
            <span class="badge-${t.grade}" style="width: 7px; height: 7px; border-radius: 50%; display: inline-block; flex-shrink: 0;"></span>
            <span class="chip-label" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex-grow: 1;">#${t.id}: ${escapeHTML(title)}</span>
            ${isEarned ? '<span class="chip-tick" style="color: var(--success-color); font-weight: bold; flex-shrink: 0;">✓</span>' : ''}
          </button>
        `;
      }).join('');

      return `
        <div class="stage-card" style="background: var(--surface-color); border: 1px solid var(--surface-secondary); border-radius: var(--border-radius-lg); padding: 1.25rem; display: flex; flex-direction: column;">
          <div class="stage-card-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem; gap: 0.5rem;">
            <h3 style="margin: 0; color: var(--accent-color); font-size: 1.05rem; line-height: 1.2;">${escapeHTML(meta.title)}</h3>
            <span class="phase-tag" style="background: var(--surface-secondary); color: var(--text-secondary); font-size: 0.7rem; padding: 0.15rem 0.4rem; border-radius: 3px; text-transform: uppercase; white-space: nowrap;">${escapeHTML(meta.tag)}</span>
          </div>
          <p class="stage-summary" style="font-size: 0.825rem; color: var(--text-secondary); margin-bottom: 0.75rem; line-height: 1.4; min-height: 2.4rem;">${escapeHTML(meta.summary)}</p>
          <div class="stage-trophy-chips" style="display: flex; flex-direction: column; gap: 0.35rem; max-height: 220px; overflow-y: auto; margin-bottom: 0.75rem; padding-right: 2px;">
            ${chipsHTML}
          </div>
          <div class="stage-footer" style="border-top: 1px solid var(--surface-secondary); padding-top: 0.5rem; margin-top: auto; font-size: 0.8rem; color: var(--text-muted); text-align: right; font-weight: 600;">
            ${earned} / ${total} earned in this stage
          </div>
        </div>
      `;
    }).join('');

    containerEl.innerHTML = `
      <div class="roadmap-container-inner" style="padding: 1.5rem; max-width: 1400px; margin: 0 auto;">
        ${headerHTML}
        <div class="roadmap-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
          ${cardsHTML}
        </div>
      </div>
    `;

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
