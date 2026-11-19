/* app/js/spoilers.js — Spoiler Mode and Hidden Trophy Management */

const SPOILER_PREF_KEY = 'fifty_five_spoiler_mode_v1';
const INDIVIDUAL_REVEALS_KEY = 'fifty_five_revealed_trophies_v1';

window.SpoilerManager = {
  loadSpoilerMode: function() {
    const val = localStorage.getItem(SPOILER_PREF_KEY);
    if (val === null) return true; // Default ON per requirements
    return val === 'true';
  },

  saveSpoilerMode: function(enabled) {
    localStorage.setItem(SPOILER_PREF_KEY, enabled ? 'true' : 'false');
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
    if (!window.SpoilerManager.loadSpoilerMode()) return true;
    if (!trophy.secret) return true;
    if (window.StorageManager.isEarned(id, earnedMap)) return true; // Auto-reveal when earned

    const reveals = window.SpoilerManager.loadIndividualReveals();
    return Boolean(reveals[id]);
  },

  revealIndividually: function(id) {
    const reveals = window.SpoilerManager.loadIndividualReveals();
    reveals[id] = true;
    window.SpoilerManager.saveIndividualReveals(reveals);
  },

  getDisplayTitle: function(trophy, earnedMap) {
    if (window.SpoilerManager.isRevealed(trophy.id, trophy, earnedMap)) {
      return trophy.name;
    }
    return `Hidden trophy — #${trophy.id}`;
  },

  getDisplayDescription: function(trophy, earnedMap) {
    if (window.SpoilerManager.isRevealed(trophy.id, trophy, earnedMap)) {
      return trophy.description;
    }
    return `Secret trophy (${trophy.grade.toUpperCase()} / ${trophy.kind}). Earn this trophy or click reveal to view details.`;
  }
};
