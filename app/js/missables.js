/* app/js/missables.js — Missables and Cautions Tab Rendering */

window.MissablesRenderer = {
  render: function(containerEl, trophies, earnedMap, onJumpToTrophy) {
    if (!containerEl) return;

    const pma = trophies.find(t => t.id === 28) || {
      id: 28,
      name: "Positive Mental Attitude",
      grade: "bronze",
      kind: "collectibles",
      stage: 3,
      description: "Complete all meditation spots.",
      guide: "What it takes — Visiting and completing all meditation spots across Leonida, including the Chapter 1 exclusive spot at Jason's house (PowerPyx).\n\nWhere and when — Chapter 1 is your sole opportunity for Jason's house meditation spot before story progression locks the area permanently (GTABase).\n\nSteps — 1) During Chapter 1 at Jason's house, interact with the meditation spot before concluding the act (PowerPyx). 2) Complete remaining meditation locations across Leonida in later stages (GTABase). 3) Secure the trophy upon finishing the final spot (Exophase).",
      sources: ["PowerPyx — GTA 6 Trophy Guide and Roadmap", "GTABase — GTA VI Trophy Guide"]
    };

    const asl = trophies.find(t => t.id === 48) || {
      id: 48,
      name: "Actions Speak Louder",
      grade: "bronze",
      kind: "story",
      stage: 1,
      description: "Attain a permanent Irredeemable Criminal Profile.",
      guide: "What it takes — Accumulating notoriety sufficient to lock in a permanent Irredeemable Criminal Profile across your save file (GTABase).\n\nWhere and when — Unlocks naturally during criminal enterprise progression in early chapters (PowerPyx).\n\nSteps — 1) Engage in high-level heists and prolonged police standoffs (PowerPyx). 2) Push criminal stats into the maximum threshold (GTABase). 3) Verify permanent profile status in player statistics (PSNProfiles).",
      sources: ["PowerPyx — GTA 6 Trophy Guide and Roadmap", "GTABase — GTA VI Trophy Guide"]
    };

    const pmaEarned = window.StorageManager.isEarned(pma.id, earnedMap);
    const aslEarned = window.StorageManager.isEarned(asl.id, earnedMap);

    containerEl.innerHTML = `
      <div class="missables-footer-note" style="margin-bottom: 1.5rem;">
        <strong>Official Scope Note:</strong> Of the 55 trophies in Grand Theft Auto VI, exactly <strong>two</strong> carry explicit flags: <strong>Positive Mental Attitude</strong> (Missable in Chapter 1) and <strong>Actions Speak Louder</strong> (Permanent caution for Irredeemable Criminal Profile). These flags and windows are sourced directly from <strong>PowerPyx</strong> and <strong>GTABase</strong>.
      </div>

      <!-- Positive Mental Attitude Card -->
      <div class="missable-card">
        <div class="missable-header-tag missable">⚠️ Strictly Missable Trophy</div>
        <div class="stage-title-row">
          <h3 class="missable-title">#${pma.id}: ${escapeHTML(pma.name)} <span class="badge-${pma.grade}" style="font-size: 11px; padding: 0.15rem 0.4rem;">${pma.grade}</span></h3>
          <button class="btn btn-secondary" data-jump-id="${pma.id}">View in Tracker →</button>
        </div>
        <p><strong>Description:</strong> ${escapeHTML(pma.description)}</p>
        <div class="missable-body" style="margin-top: 1rem;">
          <h4 style="color: var(--amber); margin-bottom: 0.3rem;">Miss Window &amp; Critical Warning</h4>
          <p><strong>Chapter 1 Window:</strong> You must meditate at Jason's house during Chapter 1. Once Chapter 1 concludes and you progress to later chapters, this specific meditation location becomes permanently inaccessible. Missing it locks you out of this trophy until a new playthrough (PowerPyx / GTABase).</p>
          <h4 style="color: var(--text-main); margin-top: 1rem; margin-bottom: 0.3rem;">Guide &amp; Steps</h4>
          <p>${escapeHTML(pma.guide)}</p>
        </div>
        <div class="sources-footer">
          <strong>Sources:</strong>
          <div class="sources-list">
            ${(pma.sources || []).map(s => `<span class="source-pill">${escapeHTML(s)}</span>`).join('')}
          </div>
        </div>
      </div>

      <!-- Actions Speak Louder Card -->
      <div class="caution-card">
        <div class="missable-header-tag caution">⚠️ Permanent Character Profile Caution</div>
        <div class="stage-title-row">
          <h3 class="missable-title">#${asl.id}: ${escapeHTML(asl.name)} <span class="badge-${asl.grade}" style="font-size: 11px; padding: 0.15rem 0.4rem;">${asl.grade}</span></h3>
          <button class="btn btn-secondary" data-jump-id="${asl.id}">View in Tracker →</button>
        </div>
        <p><strong>Description:</strong> ${escapeHTML(asl.description)}</p>
        <div class="missable-body" style="margin-top: 1rem;">
          <h4 style="color: #f87171; margin-bottom: 0.3rem;">Permanent Irredeemable Criminal Profile</h4>
          <p><strong>Caution:</strong> This trophy permanently modifies your career profile to 'Irredeemable Criminal'. While not missable in terms of a temporal window, it is an irreversible profile state once triggered across your save file. Players aiming for specific clean character playthrough stats should take note (GTABase).</p>
          <h4 style="color: var(--text-main); margin-top: 1rem; margin-bottom: 0.3rem;">Guide &amp; Steps</h4>
          <p>${escapeHTML(asl.guide)}</p>
        </div>
        <div class="sources-footer">
          <strong>Sources:</strong>
          <div class="sources-list">
            ${(asl.sources || []).map(s => `<span class="source-pill">${escapeHTML(s)}</span>`).join('')}
          </div>
        </div>
      </div>
    `;

    containerEl.querySelectorAll('[data-jump-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = Number(btn.getAttribute('data-jump-id'));
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
