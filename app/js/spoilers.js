window.FF = window.FF || {};

window.FF.spoilers = (() => {
  const STORAGE_KEY = "fifty-five.spoilers.v1";

  const load = () => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return { on: true, revealed: [] };
    try {
      const parsed = JSON.parse(data);
      return { on: !!parsed.on, revealed: Array.isArray(parsed.revealed) ? parsed.revealed : [] };
    } catch (e) {
      return { on: true, revealed: [] };
    }
  };

  let state = load();

  const save = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.__spoilersOn = state.on;
  };

  // Initialize
  window.__spoilersOn = state.on;

  const isOn = () => state.on;
  const setOn = (bool) => {
    state.on = bool;
    save();
  };
  const toggle = () => {
    state.on = !state.on;
    save();
  };

  const isRevealed = (id) => state.revealed.includes(id);
  const reveal = (id) => {
    if (!isRevealed(id)) {
      state.revealed.push(id);
      save();
    }
  };

  const displayName = (trophy, earnedMap) => {
    if (state.on && trophy.secret && !earnedMap[trophy.id] && !isRevealed(trophy.id)) {
      return "Hidden trophy — #" + trophy.id;
    }
    return trophy.name;
  };

  return { isOn, setOn, toggle, isRevealed, reveal, displayName };
})();
