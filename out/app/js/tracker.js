/* app/js/tracker.js — Tracker Header, Progress Ring, and Trophy List Rendering */

window.TrackerRenderer = {
  updateDashboard: function(trophies, earnedMap) {
    const total = trophies.length; // 55
    const earnedIds = Object.keys(earnedMap).filter(id => earnedMap[id]);
    const earnedCount = earnedIds.length;

    // 1. Progress Ring
    const ringFill = document.getElementById('ring-fill');
    const earnedDisplay = document.getElementById('earned-count-display');
    if (earnedDisplay) earnedDisplay.textContent = `${earnedCount} of ${total}`;

    if (ringFill) {
      const circumference = 2 * Math.PI * 42; // r=42 -> ~263.89
      const progress = Math.min(earnedCount / total, 1);
      const offset = circumference - (progress * circumference);
      ringFill.style.strokeDasharray = `${circumference} ${circumference}`;
      ringFill.style.strokeDashoffset = offset;
    }

    // 2. Grade Counters
    const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
    const totals = { platinum: 1, gold: 2, silver: 6, bronze: 46 };

    trophies.forEach(t => {
      if (window.StorageManager.isEarned(t.id, earnedMap)) {
        if (counts[t.grade] !== undefined) {
          counts[t.grade]++;
        }
      }
    });

    const platEl = document.getElementById('count-platinum');
    const goldEl = document.getElementById('count-gold');
    const silvEl = document.getElementById('count-silver');
    const bronEl = document.getElementById('count-bronze');

    if (platEl) platEl.textContent = `${counts.platinum}/${totals.platinum}`;
    if (goldEl) goldEl.textContent = `${counts.gold}/${totals.gold}`;
    if (silvEl) silvEl.textContent = `${counts.silver}/${totals.silver}`;
    if (bronEl) bronEl.textContent = `${counts.bronze}/${totals.bronze}`;

    // 3. Hidden Count
    const hiddenCount = trophies.filter(t => t.secret).length;
    const hiddenText = document.getElementById('hidden-stats-text');
    if (hiddenText) {
      hiddenText.textContent = `Secret trophies: ${hiddenCount} hidden by default`;
    }
  },

  renderList: function(containerEl, trophies, earnedMap, filterGroup, gradeFilter, searchQuery, sortOption, expandedTrophyId, callbacks) {
    if (!containerEl) return;

    const filtered = window.FilterManager.filterAndSort(trophies, filterGroup, gradeFilter, searchQuery, sortOption, earnedMap);

    if (filtered.length === 0) {
      containerEl.innerHTML = `
        <div style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); padding: 3rem; text-align: center; border-radius: 0.75rem; color: var(--text-muted);">
          <h3 style="font-size: 1.2rem; color: var(--text-main); margin-bottom: 0.5rem;">No trophies found</h3>
          <p>Try adjusting your search query, grade filter, or category selection.</p>
        </div>
      `;
      return;
    }

    let html = '';

    filtered.forEach(t => {
      const isEarned = window.StorageManager.isEarned(t.id, earnedMap);
      const isExpanded = Number(expandedTrophyId) === Number(t.id);
      const title = window.SpoilerManager.getDisplayTitle(t, earnedMap);
      const desc = window.SpoilerManager.getDisplayDescription(t, earnedMap);
      const gradeLetter = (t.grade && t.grade[0]) ? t.grade[0].toUpperCase() : 'B';

      html += `
        <div class="trophy-row-wrapper ${isEarned ? 'earned' : ''} ${isExpanded ? 'expanded' : ''}" data-trophy-id="${t.id}">
          <div class="trophy-main" data-action="toggle-expand" data-trophy-id="${t.id}">
            <div class="trophy-checkbox-wrap" onclick="event.stopPropagation();">
              <input type="checkbox" class="trophy-checkbox" data-checkbox-id="${t.id}" ${isEarned ? 'checked' : ''} title="Mark trophy as earned">
            </div>
            <div class="trophy-badge-col">
              <span class="trophy-badge badge-${t.grade}">${t.grade}</span>
            </div>
            <div class="trophy-info">
              <div class="trophy-title-row">
                <span class="trophy-name">${escapeHTML(title)}</span>
                <span class="trophy-id-tag">#${t.id}</span>
              </div>
              <div class="trophy-desc">${escapeHTML(desc)}</div>
            </div>
            <div class="trophy-meta-badges">
              <span class="kind-tag">${escapeHTML(t.kind)}</span>
              <span class="stage-tag">Stage ${t.stage}</span>
              <span class="expand-chevron">▼</span>
            </div>
          </div>
          <div class="trophy-expanded-panel" data-panel-id="${t.id}">
            ${window.GuideRenderer.renderGuideHTML(t, earnedMap)}
          </div>
        </div>
      `;
    });

    containerEl.innerHTML = html;

    // Attach event listeners
    containerEl.querySelectorAll('.trophy-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = Number(chk.getAttribute('data-checkbox-id'));
        if (callbacks && typeof callbacks.onToggleEarned === 'function') {
          callbacks.onToggleEarned(id);
        }
      });
    });

    containerEl.querySelectorAll('[data-action="toggle-expand"]').forEach(row => {
      row.addEventListener('click', () => {
        const id = Number(row.getAttribute('data-trophy-id'));
        if (callbacks && typeof callbacks.onExpandToggle === 'function') {
          callbacks.onExpandToggle(id);
        }
      });
    });

    containerEl.querySelectorAll('.reveal-secret-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = Number(btn.getAttribute('data-reveal-id'));
        if (callbacks && typeof callbacks.onRevealSecret === 'function') {
          callbacks.onRevealSecret(id);
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
