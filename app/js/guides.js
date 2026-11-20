/* app/js/guides.js — In-Page Guide Parsing and Source Citation Rendering */

window.GuideRenderer = {
  renderGuideHTML: function(trophy, earnedMap) {
    const isRevealed = window.SpoilerManager.isRevealed(trophy.id, trophy, earnedMap);

    if (!isRevealed) {
      return `
        <div class="guide-content">
          <h4>Secret Trophy</h4>
          <p>This trophy's details are hidden because spoiler mode is active. Earn this trophy or click below to reveal its guide.</p>
          <button class="button-primary reveal-secret-btn" data-reveal-id="${trophy.id}">Reveal Secret Details</button>
        </div>
      `;
    }

    if (!trophy.steps || trophy.steps.length === 0) {
      return `<div class="guide-content"><p>${escapeHTML(trophy.guide || "No steps available.")}</p></div>`;
    }

    let stepsHTML = trophy.steps.map((step, i) => {
      let citesHTML = (step.cites || []).map(c => `<span class="citation-chip">[${c}]</span>`).join('');
      return `
        <div class="step-item">
          <div class="step-num">${i + 1}</div>
          <div class="step-text">${escapeHTML(step.text)} ${citesHTML}</div>
        </div>
      `;
    }).join('');

    let sourcesHTML = '';
    if (trophy.sources && trophy.sources.length > 0) {
      const pills = trophy.sources.map(s => `<span class="source-pill">${escapeHTML(s)}</span>`).join('');
      sourcesHTML = `
        <div class="sources-footer">
          <strong>Sources:</strong>
          <div class="sources-list">${pills}</div>
        </div>
      `;
    }

    return `
      <div class="guide-content">
        <div class="steps-container">
          ${stepsHTML}
        </div>
        ${sourcesHTML}
      </div>
    `;
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
