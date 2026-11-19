/* app/js/storage.js — Persistence, Export/Import, and Seeded State */

const STORAGE_KEY = 'fifty_five_earned_trophies_v1';

window.StorageManager = {
  loadEarnedState: function() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      let earned = {};
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed === 'object' && parsed !== null) earned = parsed;
      }
      const seeded = window.StorageManager.getSeededEarnedIds();
      if (seeded !== null) {
        seeded.forEach(id => {
          earned[id] = { earnedAt: new Date().toISOString() };
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
      localStorage.setItem(STORAGE_KEY, JSON.stringify(earnedMap));
    } catch (e) {
      console.error('Failed to save earned state to localStorage:', e);
    }
  },

  getSeededEarnedIds: function() {
    try {
      const hash = window.location.hash;
      const match = hash.match(/[#&]seed=([0-9,]+)/);
      if (!match || !match[1]) return null;
      const ids = match[1].split(',').map(n => parseInt(n, 10)).filter(n => !isNaN(n) && n >= 1 && n <= 55);
      return ids;
    } catch (e) {
      return null;
    }
  },

  isEarned: function(id, earnedMap) {
    const seeded = window.StorageManager.getSeededEarnedIds();
    if (seeded !== null) {
      return seeded.includes(Number(id));
    }
    return Boolean(earnedMap && earnedMap[id]);
  },

  toggleEarned: function(id, earnedMap) {
    const numId = Number(id);
    if (earnedMap[numId]) {
      delete earnedMap[numId];
    } else {
      earnedMap[numId] = {
        earnedAt: new Date().toISOString()
      };
    }
    window.StorageManager.saveEarnedState(earnedMap);
    return earnedMap;
  },

  exportProgress: function(earnedMap) {
    const exportData = {
      app: "FIFTY-FIVE — GTA VI Trophy Ledger",
      version: "1.0",
      exportedAt: new Date().toISOString(),
      earnedTrophies: earnedMap
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fifty-five-gta6-progress-${new Date().toISOString().slice(0,10)}.json`;
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
      if (typeof earned !== 'object' || earned === null) {
        throw new Error('Could not find earnedTrophies in imported file.');
      }
      const validatedMap = {};
      for (const [key, val] of Object.entries(earned)) {
        const numId = parseInt(key, 10);
        if (!isNaN(numId) && numId >= 1 && numId <= 55) {
          validatedMap[numId] = typeof val === 'object' && val !== null ? val : { earnedAt: new Date().toISOString() };
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
