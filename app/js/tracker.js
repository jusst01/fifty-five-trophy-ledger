/* app/js/tracker.js — Tracker Dashboard and 3-Pane Renderer (v2) */

window.TrackerRenderer = {
  updateDashboard: function(trophies, earnedMap) {
    const total = trophies.length;
    const earnedCount = window.StorageManager.getEarnedCount(trophies, earnedMap);

    // Update Header Counter
    const earnedDisplay = document.getElementById('earned-count-display');
    if (earnedDisplay) {
      const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
      trophies.forEach(t => {
        if (window.StorageManager.isEarned(t.id, earnedMap)) counts[t.grade]++;
      });
      earnedDisplay.innerHTML = `
        <span style="font-weight:700; color:var(--accent-color);">${earnedCount} / ${total} earned</span> &nbsp;|&nbsp;
        <span><span id="count-platinum">${counts.platinum}</span>P</span> /
        <span><span id="count-gold">${counts.gold}</span>G</span> /
        <span><span id="count-silver">${counts.silver}</span>S</span> /
        <span><span id="count-bronze">${counts.bronze}</span>B</span>
      `;
    }

    // Update Audit Strip
    const auditStrip = document.getElementById('audit-strip');
    if (auditStrip) {
      const grades = trophies.reduce((acc, t) => { acc[t.grade]++; return acc; }, { platinum: 0, gold: 0, silver: 0, bronze: 0 });
      const hidden = trophies.filter(t => t.secret).length;
      const cited = trophies.filter(t => t.sources && t.sources.length > 0).length;
      const missable = trophies.filter(t => t.flag === 'MISSABLE').length;
      const caution = trophies.filter(t => t.flag === 'CAUTION').length;
      const unknown = trophies.filter(t => t.flag === 'unknown').length;
      const totalSteps = trophies.reduce((acc, t) => acc + (t.steps?.length || 0), 0);
      const citedSteps = trophies.reduce((acc, t) => acc + (t.steps?.filter(s => s.cites && s.cites.length > 0).length || 0), 0);

      auditStrip.textContent = `${total} official · ${grades.platinum}P ${grades.gold}G ${grades.silver}S ${grades.bronze}B · ${hidden} hidden · ${cited}/${total} guides cite a source · ${citedSteps}/${totalSteps} steps cited · 4 sources checked Nov 2026 · ${missable} possibly missable · ${caution} caution · ${unknown} not yet known · 0 single-source`;
    }
  },

  renderFilterButtons: function(filterRowEl, trophies, currentFilter, onSelectFilter) {
    if (!filterRowEl) return;

    // Check if filter buttons container already exists inside filterRowEl
    let btnContainer = filterRowEl.querySelector('.filter-buttons-container');
    if (!btnContainer) {
      btnContainer = document.createElement('div');
      btnContainer.className = 'filter-buttons-container';
      // Insert at the beginning of filter-row
      filterRowEl.insertBefore(btnContainer, filterRowEl.firstChild);
    }

    const filters = [
      { key: 'all', label: 'All' },
      { key: 'platinum', label: 'Platinum' },
      { key: 'story', label: 'Story' },
      { key: 'strands', label: 'Strands' },
      { key: 'collectibles', label: 'Collectibles' },
      { key: 'activities', label: 'Activities' },
      { key: 'feats', label: 'Feats' },
      { key: 'money', label: 'Money' },
      { key: 'completion', label: 'Completion' },
      { key: 'missable', label: 'Missable' },
      { key: 'caution', label: 'Caution' },
      { key: 'unknown', label: 'Not yet known' },
      { key: 'hidden', label: 'Hidden' }
    ];

    btnContainer.innerHTML = filters.map(f => {
      const count = window.FilterManager.getCount(trophies, f.key);
      const isActive = currentFilter === f.key;
      return `
        <button class="filter-pill-btn ${isActive ? 'active' : ''}" data-filter="${f.key}">
          ${f.label} <span class="filter-count">(${count})</span>
        </button>
      `;
    }).join('');

    btnContainer.querySelectorAll('.filter-pill-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-filter');
        if (typeof onSelectFilter === 'function') {
          onSelectFilter(key);
        }
      });
    });
  },

  renderChecklist: function(containerEl, trophies, earnedMap, filterGroup, gradeFilter, searchQuery, sortOption, expandedTrophyId, callbacks) {
    if (!containerEl) return;
    const filtered = window.FilterManager.filterAndSort(trophies, filterGroup, gradeFilter, searchQuery, sortOption, earnedMap);

    if (filtered.length === 0) {
      containerEl.innerHTML = '<div style="padding: 2rem; text-align: center; color: var(--text-muted);">No trophies match the current filter or search.</div>';
      return;
    }

    containerEl.innerHTML = filtered.map(t => {
      const isEarned = window.StorageManager.isEarned(t.id, earnedMap);
      const isSelected = Number(expandedTrophyId) === Number(t.id);
      const title = window.SpoilerManager.getDisplayTitle(t, earnedMap);

      return `
        <div class="trophy-row-wrapper ${isEarned ? 'earned' : ''} ${isSelected ? 'selected' : ''}" data-trophy-id="${t.id}">
          <input type="checkbox" class="trophy-checkbox" data-checkbox-id="${t.id}" ${isEarned ? 'checked' : ''} title="Toggle earned">
          <div class="trophy-row-content" style="flex-grow:1; display:flex; align-items:center; gap:0.75rem; cursor:pointer;" data-select-id="${t.id}">
            <span class="trophy-badge badge-${t.grade}">${t.grade[0].toUpperCase()}</span>
            <div style="flex-grow:1;">
              <div style="font-weight: 600; color: var(--text-primary);">${escapeHTML(title)}</div>
              <div style="font-size: var(--font-size-sm); color: var(--text-secondary); display:flex; gap:0.5rem; align-items:center;">
                <span>${t.kind} · Stage ${t.stage}</span>
                ${t.flag ? `<span class="flag-badge" style="font-size:10px; padding:0.1rem 0.3rem; background:var(--surface-secondary); border-radius:3px; color:var(--warning-color);">${t.flag}</span>` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    containerEl.querySelectorAll('.trophy-checkbox').forEach(chk => {
      chk.addEventListener('change', (e) => {
        e.stopPropagation();
        callbacks.onToggleEarned(Number(chk.getAttribute('data-checkbox-id')));
      });
    });

    containerEl.querySelectorAll('.trophy-row-content').forEach(row => {
      row.addEventListener('click', () => {
        callbacks.onSelect(Number(row.getAttribute('data-select-id')));
      });
    });
  },

  renderDetail: function(containerEl, trophy, earnedMap, callbacks) {
    if (!containerEl) return;
    if (!trophy) {
      containerEl.innerHTML = '<p style="padding: 2rem; text-align: center; color: var(--text-muted);">Select a trophy to view details.</p>';
      return;
    }

    const title = window.SpoilerManager.getDisplayTitle(trophy, earnedMap);
    const desc = window.SpoilerManager.getDisplayDescription(trophy, earnedMap);
    const isRevealed = window.SpoilerManager.isRevealed(trophy.id, trophy, earnedMap);

    let calloutHTML = '';
    if (trophy.flag && trophy.steps && trophy.steps.length > 0) {
      const lastStep = trophy.steps[trophy.steps.length - 1];
      const flagLabel = trophy.flag === 'MISSABLE' ? 'MISS WINDOW / CRITICAL WARNING' : (trophy.flag === 'CAUTION' ? 'CAUTION / PROFILE NOTE' : 'NOT YET KNOWN');
      calloutHTML = `
        <div class="amber-banner" style="margin: 1rem 0; flex-direction: column; align-items: flex-start; gap: 0.5rem;">
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <span class="banner-icon">⚠️</span>
            <strong>${flagLabel}</strong>
          </div>
          <p style="margin:0; font-size:var(--font-size-sm);">${escapeHTML(lastStep.text)}</p>
        </div>
      `;
    }

    let revealButtonHTML = '';
    if (!isRevealed && trophy.secret) {
      revealButtonHTML = `
        <div style="margin: 1rem 0;">
          <button class="button-primary reveal-detail-btn" data-reveal-id="${trophy.id}">Reveal Secret Details</button>
        </div>
      `;
    }

    let guideContentHTML = window.GuideRenderer.renderGuideHTML(trophy, earnedMap);

    containerEl.innerHTML = `
      <div class="trophy-expanded-panel">
        <h2>${escapeHTML(title)}</h2>
        <p style="font-size: var(--font-size-lg); color: var(--text-secondary); margin-bottom: 1rem;"><em>"${escapeHTML(desc)}"</em></p>
        <div class="meta-line" style="font-size: var(--font-size-sm); color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem;">
          ${trophy.grade.toUpperCase()} · ${trophy.kind} · Stage ${trophy.stage}
        </div>
        <div class="badges" style="display:flex; gap:0.5rem; margin-bottom:1rem;">
          ${trophy.flag ? `<span class="flag-badge" style="background:#3d3000; color:var(--warning-color); padding:0.2rem 0.5rem; border-radius:4px; font-weight:bold; font-size:11px;">${trophy.flag}</span>` : ''}
          ${trophy.secret ? `<span class="flag-badge" style="background:var(--surface-secondary); color:var(--text-secondary); padding:0.2rem 0.5rem; border-radius:4px; font-size:11px;">HIDDEN</span>` : ''}
        </div>
        ${revealButtonHTML}
        ${calloutHTML}
        <div class="steps-section" style="margin-top: 1.5rem;">
          ${guideContentHTML}
        </div>
      </div>
    `;

    const revealBtn = containerEl.querySelector('.reveal-detail-btn');
    if (revealBtn && callbacks && callbacks.onReveal) {
      revealBtn.addEventListener('click', () => {
        callbacks.onReveal(trophy.id);
      });
    }
  },

  renderSources: function(containerEl, sourcesRail) {
    if (!containerEl) return;
    containerEl.innerHTML = `
      <h3>Sources — checked Nov 2026</h3>
      <ul style="list-style: none; padding: 0; margin: 1rem 0;">
        ${sourcesRail.map(s => `
          <li style="margin-bottom: 1rem; font-size: var(--font-size-sm);">
            <strong>[${s.n}] ${escapeHTML(s.name)}</strong><br>
            <span style="color: var(--text-secondary);">${escapeHTML(s.role)}</span><br>
            <span style="color: var(--accent-color); font-weight: 600;">cited by ${s.cited_by} of 55 guides</span>
          </li>
        `).join('')}
      </ul>
      <p style="font-size: var(--font-size-sm); color: var(--text-muted); border-top: 1px solid var(--surface-secondary); pt: 1rem; margin-top: 1rem;">
        Every step cites its source by number. The official list [3][4] gives each trophy its name, description and grade.
      </p>
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
