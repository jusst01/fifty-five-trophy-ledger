/* app/js/spoilers.js — Spoiler Mode and Hidden Trophy Management */

const SPOILER_PREF_KEY = 'fifty_five_spoiler_mode_v1';
const INDIVIDUAL_REVEALS_KEY = 'fifty_five_revealed_trophies_v1';

window.SpoilerManager = {
  _cache: {},

  loadSpoilerMode: function() {
    const val = localStorage.getItem(SPOILER_PREF_KEY);
    if (val === null) return true; // Default ON per requirements
    return val === 'true';
  },

  saveSpoilerMode: function(enabled) {
    const boolVal = Boolean(enabled);
    localStorage.setItem(SPOILER_PREF_KEY, boolVal ? 'true' : 'false');
    window.__spoilersOn = boolVal;

    // Update checklist rows hidden markers consistently in a single pass
    try {
      const earnedMap = window.StorageManager && typeof window.StorageManager.loadEarnedState === 'function'
        ? window.StorageManager.loadEarnedState()
        : {};
      const rows = document.querySelectorAll('.trophy-row-wrapper');
      if (rows && rows.length > 0) {
        rows.forEach(row => {
          const id = Number(row.getAttribute('data-trophy-id'));
          const trophy = window.SpoilerManager._cache[id];
          if (trophy && trophy.secret) {
            const revealed = window.SpoilerManager.isRevealed(id, trophy, earnedMap);
            const title = revealed ? trophy.name : `Hidden trophy — #${trophy.id}`;

            const titleEl = row.querySelector('.trophy-row-content div[style*="font-weight"]');
            if (titleEl) {
              titleEl.textContent = title;
            }

            if (boolVal && !revealed) {
              row.classList.add('spoiler-dimmed');
              row.style.opacity = '0.75';
            } else {
              row.classList.remove('spoiler-dimmed');
              row.style.opacity = '';
            }
          }
        });
      }
    } catch (e) {
      console.error('Error updating spoiler checklist markers:', e);
    }
  },

  loadIndividualReveals: function() {
    try {
      const data = localStorage.getItem(INDIVIDUAL_REVEALS_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  saveIndividualReveals: function(revealsMap) {
    try {
      localStorage.setItem(INDIVIDUAL_REVEALS_KEY, JSON.stringify(revealsMap));
    } catch (e) {}
  },

  isRevealed: function(id, trophy, earnedMap) {
    if (trophy && trophy.id) {
      window.SpoilerManager._cache[trophy.id] = trophy;
    }
    if (!window.SpoilerManager.loadSpoilerMode()) return true;
    if (!trophy || !trophy.secret) return true;
    if (window.StorageManager && typeof window.StorageManager.isEarned === 'function' && window.StorageManager.isEarned(id, earnedMap)) return true; // Auto-reveal when earned

    const reveals = window.SpoilerManager.loadIndividualReveals();
    return Boolean(reveals[id]);
  },

  revealIndividually: function(id) {
    const reveals = window.SpoilerManager.loadIndividualReveals();
    reveals[id] = true;
    window.SpoilerManager.saveIndividualReveals(reveals);
  },

  getDisplayTitle: function(trophy, earnedMap) {
    if (trophy && trophy.id) {
      window.SpoilerManager._cache[trophy.id] = trophy;
    }
    if (window.SpoilerManager.isRevealed(trophy.id, trophy, earnedMap)) {
      return trophy.name;
    }
    return `Hidden trophy — #${trophy.id}`;
  },

  getDisplayDescription: function(trophy, earnedMap) {
    if (trophy && trophy.id) {
      window.SpoilerManager._cache[trophy.id] = trophy;
    }
    if (window.SpoilerManager.isRevealed(trophy.id, trophy, earnedMap)) {
      return trophy.description;
    }
    const gradeStr = trophy && trophy.grade ? trophy.grade.toUpperCase() : '';
    const kindStr = trophy && trophy.kind ? trophy.kind : '';
    return `Secret trophy (${gradeStr} / ${kindStr}). Earn this trophy or click reveal to view details.`;
  }
};

// Expose current spoiler state on window
window.__spoilersOn = window.SpoilerManager.loadSpoilerMode();
