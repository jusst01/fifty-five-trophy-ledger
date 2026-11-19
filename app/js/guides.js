/* app/js/guides.js — In-Page Guide Parsing and Source Citation Rendering */

window.GuideRenderer = {
  renderGuideHTML: function(trophy, earnedMap) {
    const isRevealed = window.SpoilerManager.isRevealed(trophy.id, trophy, earnedMap);

    if (!isRevealed) {
      return `
        <div class="guide-content">
          <h4>Secret Trophy</h4>
          <p>This trophy's details are hidden because spoiler mode is active. Earn this trophy or click below to reveal its guide.</p>
          <button class="btn btn-primary reveal-secret-btn" data-reveal-id="${trophy.id}">Reveal Secret Details</button>
        </div>
      `;
    }

    const guideText = trophy.guide || "No guide available yet.";

    // Parse sections from guide text (typically separated by double newlines or headers)
    const paragraphs = guideText.split(/\n\n+/);
    let sectionsHTML = '';

    paragraphs.forEach(p => {
      let formatted = escapeHTML(p);

      // Highlight basis tags like (PowerPyx), (GTABase), (Exophase), (PSNProfiles)
      formatted = formatted
        .replace(/\((PowerPyx[^)]*)\)/gi, '<span class="basis-tag">($1)</span>')
        .replace(/\((GTABase[^)]*)\)/gi, '<span class="basis-tag">($1)</span>')
        .replace(/\((Exophase[^)]*)\)/gi, '<span class="basis-tag">($1)</span>')
        .replace(/\((PSNProfiles[^)]*)\)/gi, '<span class="basis-tag">($1)</span>');

      // Check if paragraph starts with a header phrase like "What it takes —", "Where and when —", "Steps —", etc.
      if (formatted.includes(' — ')) {
        const parts = formatted.split(' — ');
        const heading = parts[0];
        const body = parts.slice(1).join(' — ');
        sectionsHTML += `<h4>${heading}</h4><p>${body}</p>`;
      } else {
        sectionsHTML += `<p>${formatted}</p>`;
      }
    });

    // Sources footer
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
        ${sectionsHTML}
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
