/* app/js/storage.js — Persistence, Export/Import, and Seeded State (v2) */

const STORAGE_KEY = 'fifty_five_earned_trophies_v2';
const TOTAL_TROPHIES = 55;

window.StorageManager = {
  loadEarnedState: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let earned = {};
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) {
          for (const [key, val] of Object.entries(parsed)) {
            const numId = parseInt(key, 10);
            if (!isNaN(numId) && numId >= 1 && numId <= TOTAL_TROPHIES) {
              earned[numId] = (typeof val === 'object' && val !== null)
                ? val
                : { earnedAt: new Date().toISOString() };
            }
          }
        }
      }
      const seeded = window.StorageManager.getSeededEarnedIds();
      if (seeded !== null) {
        const stamp = new Date().toISOString();
        seeded.forEach(id => {
          if (!earned[id]) earned[id] = { earnedAt: stamp, seeded: true };
        });
      }
      return earned;
    } catch (e) {
      console.error('Failed to load earned state from localStorage:', e);
      return {};
    }
  },

  saveEarnedState: function(earnedMap) {
    try {
      const persisted = {};
      for (const [key, val] of Object.entries(earnedMap || {})) {
        if (val && val.seeded) continue;
        persisted[key] = val;
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
    } catch (e) {
      console.error('Failed to save earned state to localStorage:', e);
    }
  },

  getSeededEarnedIds: function() {
    try {
      const hash = window.location.hash || '';
      const match = hash.match(/[#&]seed=([0-9,]+)/);
      if (!match || !match[1]) return null;
      const ids = match[1]
        .split(',')
        .map(n => parseInt(n, 10))
        .filter(n => !isNaN(n) && n >= 1 && n <= TOTAL_TROPHIES);
      return ids;
    } catch (e) {
      return null;
    }
  },

  isEarned: function(id, earnedMap) {
    return Boolean(earnedMap && earnedMap[Number(id)]);
  },

  toggleEarned: function(id, earnedMap) {
    const numId = Number(id);
    if (earnedMap[numId]) {
      delete earnedMap[numId];
    } else {
      earnedMap[numId] = { earnedAt: new Date().toISOString() };
    }
    window.StorageManager.saveEarnedState(earnedMap);
    return earnedMap;
  },

  getEarnedCount: function(trophies, earnedMap) {
    return (trophies || []).filter(t => window.StorageManager.isEarned(t.id, earnedMap)).length;
  },

  exportProgress: function(earnedMap) {
    const exportMap = {};
    for (const [key, val] of Object.entries(earnedMap || {})) {
      exportMap[key] = (val && typeof val === 'object')
        ? { earnedAt: val.earnedAt || new Date().toISOString() }
        : { earnedAt: new Date().toISOString() };
    }
    const exportData = {
      app: "FIFTY-FIVE — GTA VI Trophy Ledger",
      version: "2.0",
      exportedAt: new Date().toISOString(),
      total: TOTAL_TROPHIES,
      earnedTrophies: exportMap
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fifty-five-gta6-progress-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importProgress: function(jsonString, onSuccess, onError) {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid JSON structure.');
      }
      const earned = parsed.earnedTrophies || parsed;
      if (typeof earned !== 'object' || earned === null || Array.isArray(earned)) {
        throw new Error('Could not find earnedTrophies in imported file.');
      }
      const validatedMap = {};
      for (const [key, val] of Object.entries(earned)) {
        const numId = parseInt(key, 10);
        if (!isNaN(numId) && numId >= 1 && numId <= TOTAL_TROPHIES) {
          validatedMap[numId] = (typeof val === 'object' && val !== null)
            ? { earnedAt: val.earnedAt || new Date().toISOString() }
            : { earnedAt: new Date().toISOString() };
        }
      }
      window.StorageManager.saveEarnedState(validatedMap);
      if (typeof onSuccess === 'function') onSuccess(validatedMap);
    } catch (e) {
      console.error('Import error:', e);
      if (typeof onError === 'function') onError(e.message);
    }
  }
};
