/* app/js/missables.js — Missables, Cautions, and Unknowns Tab Rendering (v2) */

window.MissablesRenderer = {
  render: function(containerEl, trophies, earnedMap, onJumpToTrophy) {
    if (!containerEl) return;

    const pma = trophies.find(t => t.id === 28) || {};
    const asl = trophies.find(t => t.id === 48) || {};
    const unknowns = trophies.filter(t => t.flag === 'unknown');

    let pmaStepsHTML = (pma.steps || []).map((s, i) => `
      <div style="margin-bottom: 0.5rem; font-size: 0.9rem;">
        <strong>Step ${i+1}:</strong> ${escapeHTML(s.text)} ${(s.cites || []).map(c => `<span class="citation-chip">[${c}]</span>`).join('')}
      </div>
    `).join('');

    let aslStepsHTML = (asl.steps || []).map((s, i) => `
      <div style="margin-bottom: 0.5rem; font-size: 0.9rem;">
        <strong>Step ${i+1}:</strong> ${escapeHTML(s.text)} ${(s.cites || []).map(c => `<span class="citation-chip">[${c}]</span>`).join('')}
      </div>
    `).join('');

    let unknownsHTML = unknowns.map(t => {
      const isEarned = window.StorageManager.isEarned(t.id, earnedMap);
      const title = window.SpoilerManager.getDisplayTitle(t, earnedMap);
      return `
        <div class="unknown-card" style="background: var(--surface-color); border: 1px solid var(--surface-secondary); border-radius: var(--border-radius-lg); padding: 1rem; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
              <span class="badge-${t.grade}" style="font-size: 10px; padding: 0.15rem 0.4rem; border-radius: 3px; font-weight: bold; text-transform: uppercase;">${t.grade}</span>
              <span style="font-size: 0.75rem; color: var(--text-muted);">Stage ${t.stage} · ${t.kind}</span>
            </div>
            <h4 style="margin: 0 0 0.5rem 0; color: var(--text-primary); font-size: 1rem;">#${t.id}: ${escapeHTML(title)} ${isEarned ? ' <span style="color:var(--success-color);">✓</span>' : ''}</h4>
            <p style="font-size: 0.85rem; color: var(--text-secondary); margin: 0 0 0.75rem 0;"><em>"${escapeHTML(t.description)}"</em></p>
            <p style="font-size: 0.8rem; color: var(--warning-color); margin: 0; background: var(--bg-secondary); padding: 0.5rem; border-radius: var(--border-radius);">
              Requirement not yet published by PowerPyx; guide follows the official description only.
            </p>
          </div>
          <div style="margin-top: 1rem; text-align: right;">
            <button class="button-secondary" style="font-size: 0.8rem; padding: 0.25rem 0.5rem; cursor: pointer;" data-jump-id="${t.id}">View in Tracker →</button>
          </div>
        </div>
      `;
    }).join('');

    containerEl.innerHTML = `
      <div class="missables-container-inner" style="padding: 1.5rem; max-width: 1400px; margin: 0 auto;">
        <div style="margin-bottom: 1.5rem; padding: 1.25rem; background: var(--surface-color); border: 1px solid var(--surface-secondary); border-radius: var(--border-radius-lg);">
          <h2 style="color: var(--accent-color); margin-top: 0; font-size: 1.35rem;">Missables, Cautions &amp; Unreleased Requirements</h2>
          <p style="margin: 0.5rem 0; color: var(--text-primary); font-size: 0.95rem;">
            Official scope audit: exactly <strong>one strictly missable trophy</strong> (Chapter 1 meditation), <strong>one caution trophy</strong> (permanent Irredeemable profile), and <strong>five unreleased requirements</strong> where guides rely solely on official descriptions. Our sources record no disagreement.
          </p>
        </div>

        <!-- Positive Mental Attitude Card -->
        <div class="missable-card" style="background: #2a2200; border: 1px solid #7a6a00; border-radius: var(--border-radius-lg); padding: 1.5rem; margin-bottom: 1.5rem;">
          <div style="display: inline-block; background: #3d3000; color: var(--warning-color); font-weight: bold; font-size: 0.8rem; padding: 0.25rem 0.75rem; border-radius: 4px; margin-bottom: 0.75rem; text-transform: uppercase;">
            ⚠️ POSSIBLY MISSABLE — #28 Positive Mental Attitude
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <h3 style="margin: 0; color: var(--text-primary); font-size: 1.2rem;">${escapeHTML(pma.name)} <span class="badge-${pma.grade}" style="font-size: 11px; padding: 0.15rem 0.4rem; border-radius: 3px;">${pma.grade}</span></h3>
            <button class="button-primary" data-jump-id="${pma.id}">View in Tracker →</button>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;"><em>"${escapeHTML(pma.description)}"</em></p>

          <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1rem;">
            <h4 style="color: var(--warning-color); margin-top: 0; margin-bottom: 0.5rem;">Miss Window &amp; Critical Warning</h4>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">
              Chapter 1 is your sole opportunity for Jason's house meditation spot before story progression locks the area permanently. Missing it locks you out of this trophy until a new playthrough (PowerPyx / GTABase).
            </p>
          </div>

          <div style="margin-bottom: 1rem;">
            <h4 style="color: var(--text-main); margin-top: 0; margin-bottom: 0.5rem; font-size: 0.95rem;">Steps Summary</h4>
            ${pmaStepsHTML}
          </div>

          <div class="sources-footer" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.75rem; margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
            <strong>Sources:</strong> ${(pma.sources || []).map(s => `<span class="source-pill" style="margin-left: 0.5rem;">${escapeHTML(s)}</span>`).join('')}
          </div>
        </div>

        <!-- Actions Speak Louder Card -->
        <div class="caution-card" style="background: #2b1a1a; border: 1px solid #8c3232; border-radius: var(--border-radius-lg); padding: 1.5rem; margin-bottom: 2rem;">
          <div style="display: inline-block; background: #5c1d1d; color: #ff9999; font-weight: bold; font-size: 0.8rem; padding: 0.25rem 0.75rem; border-radius: 4px; margin-bottom: 0.75rem; text-transform: uppercase;">
            ⚠️ CAUTION — #48 Actions Speak Louder
          </div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5rem;">
            <h3 style="margin: 0; color: var(--text-primary); font-size: 1.2rem;">${escapeHTML(asl.name)} <span class="badge-${asl.grade}" style="font-size: 11px; padding: 0.15rem 0.4rem; border-radius: 3px;">${asl.grade}</span></h3>
            <button class="button-primary" data-jump-id="${asl.id}">View in Tracker →</button>
          </div>
          <p style="color: var(--text-secondary); margin-bottom: 1rem;"><em>"${escapeHTML(asl.description)}"</em></p>

          <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--border-radius); margin-bottom: 1rem;">
            <h4 style="color: #ff9999; margin-top: 0; margin-bottom: 0.5rem;">Permanent Irredeemable Profile Note</h4>
            <p style="margin: 0; font-size: 0.9rem; color: var(--text-primary);">
              This trophy permanently modifies your career profile to 'Irredeemable Criminal'. While not missable in temporal window, it is an irreversible profile state once triggered across your save file (PowerPyx / GTABase).
            </p>
          </div>

          <div style="margin-bottom: 1rem;">
            <h4 style="color: var(--text-main); margin-top: 0; margin-bottom: 0.5rem; font-size: 0.95rem;">Steps Summary</h4>
            ${aslStepsHTML}
          </div>

          <div class="sources-footer" style="border-top: 1px solid rgba(255,255,255,0.1); padding-top: 0.75rem; margin-top: 1rem; font-size: 0.85rem; color: var(--text-muted);">
            <strong>Sources:</strong> ${(asl.sources || []).map(s => `<span class="source-pill" style="margin-left: 0.5rem;">${escapeHTML(s)}</span>`).join('')}
          </div>
        </div>

        <!-- Not Yet Known Section -->
        <div style="margin-bottom: 1rem;">
          <h3 style="color: var(--accent-color); font-size: 1.2rem; margin-bottom: 1rem;">Not Yet Known (5 Trophies)</h3>
          <p style="color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 1rem;">
            PowerPyx and GTABase list the specific mechanics for these trophies as not yet published. Our guide follows the official description only.
          </p>
          <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
            ${unknownsHTML}
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
