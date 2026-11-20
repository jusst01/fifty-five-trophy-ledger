window.FF = window.FF || {};

window.FF.store = (() => {
  const STORAGE_KEY = "fifty-five.progress.v1";

  const load = () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return { version: 1, earned: {} };
      const parsed = JSON.parse(data);
      if (parsed.version === 1 && typeof parsed.earned === 'object') return parsed;
      return { version: 1, earned: {} };
    } catch (e) {
      return { version: 1, earned: {} };
    }
  };

  const save = (state) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  const isEarned = (state, id) => !!state.earned[id];

  const toggle = (state, id) => {
    if (isEarned(state, id)) {
      delete state.earned[id];
    } else {
      state.earned[id] = Date.now();
    }
    save(state);
    return state;
  };

  const earnedIds = (state) => Object.keys(state.earned);
  const earnedCount = (state) => Object.keys(state.earned).length;

  const exportJSON = (state) => JSON.stringify(state);

  const importJSON = (text, validIds) => {
    try {
      const state = JSON.parse(text);
      if (state.version !== 1 || typeof state.earned !== 'object') return null;

      const newEarned = {};
      const validIdsSet = new Set(validIds);
      for (const id in state.earned) {
        if (validIdsSet.has(id)) {
          newEarned[id] = state.earned[id];
        }
      }
      return { version: 1, earned: newEarned };
    } catch (e) {
      return null;
    }
  };

  const applySeed = (state, seedIds) => {
    const now = Date.now();
    seedIds.forEach(id => {
      state.earned[id] = now;
    });
    save(state);
    return state;
  };

  return { load, save, isEarned, toggle, earnedIds, earnedCount, exportJSON, importJSON, applySeed };
})();
