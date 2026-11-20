/* app/js/filters.js — Filtering, Searching, and Sorting Trophies */

window.FilterManager = {
  filterAndSort: function(trophies, filterGroup, gradeFilter, searchQuery, sortOption, earnedMap) {
    try {
      let result = trophies.slice();

      // 1. Filter Group
      if (filterGroup && filterGroup !== 'all') {
        if (filterGroup === 'missable') {
          result = result.filter(t => t.flag === 'MISSABLE');
        } else if (filterGroup === 'caution') {
          result = result.filter(t => t.flag === 'CAUTION');
        } else if (filterGroup === 'unknown') {
          result = result.filter(t => t.flag === 'unknown');
        } else if (filterGroup === 'hidden') {
          result = result.filter(t => t.secret === true);
        } else if (filterGroup === 'strands' || filterGroup === 'strand') {
          result = result.filter(t => t.kind === 'strand');
        } else if (filterGroup === 'collectibles' || filterGroup === 'collectible') {
          result = result.filter(t => t.kind === 'collectible');
        } else if (filterGroup === 'activities' || filterGroup === 'activity') {
          result = result.filter(t => t.kind === 'activity');
        } else if (filterGroup === 'feats' || filterGroup === 'feat') {
          result = result.filter(t => t.kind === 'feat');
        } else {
          result = result.filter(t => t.kind === filterGroup || t.filter_group === filterGroup);
        }
      }

      // 2. Grade Filter
      if (gradeFilter && gradeFilter !== 'all' && gradeFilter !== 'All Grades') {
        result = result.filter(t => t.grade === gradeFilter);
      }

      // 3. Search Query
      if (searchQuery && searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase().trim();
        result = result.filter(t => {
          const title = window.SpoilerManager.getDisplayTitle(t, earnedMap).toLowerCase();
          const desc = window.SpoilerManager.getDisplayDescription(t, earnedMap).toLowerCase();
          const kind = (t.kind || '').toLowerCase();
          const stage = String(t.stage || '');
          const idStr = String(t.id);
          return title.includes(q) || desc.includes(q) || kind.includes(q) || stage.includes(q) || idStr === q;
        });
      }

      // 4. Sort Option
      result.sort((a, b) => {
        if (sortOption === 'grade') {
          const gradeRank = { platinum: 1, gold: 2, silver: 3, bronze: 4 };
          const diff = (gradeRank[a.grade] || 5) - (gradeRank[b.grade] || 5);
          if (diff !== 0) return diff;
          return a.id - b.id;
        } else if (sortOption === 'name') {
          const nameA = window.SpoilerManager.getDisplayTitle(a, earnedMap);
          const nameB = window.SpoilerManager.getDisplayTitle(b, earnedMap);
          return nameA.localeCompare(nameB);
        } else if (sortOption === 'kind') {
          const kindDiff = (a.kind || '').localeCompare(b.kind || '');
          if (kindDiff !== 0) return kindDiff;
          return a.id - b.id;
        } else {
          // Default: Roadmap order (stage first, then id)
          if (a.stage !== b.stage) return a.stage - b.stage;
          return a.id - b.id;
        }
      });

      return result;
    } catch (e) {
      console.error('Filter error:', e);
      return [];
    }
  },

  getCount: function(trophies, filterKey) {
    if (!trophies) return 0;
    if (filterKey === 'all') return trophies.length;
    if (filterKey === 'platinum') return trophies.filter(t => t.kind === 'platinum').length;
    if (filterKey === 'story') return trophies.filter(t => t.kind === 'story').length;
    if (filterKey === 'strands' || filterKey === 'strand') return trophies.filter(t => t.kind === 'strand').length;
    if (filterKey === 'collectibles' || filterKey === 'collectible') return trophies.filter(t => t.kind === 'collectible').length;
    if (filterKey === 'activities' || filterKey === 'activity') return trophies.filter(t => t.kind === 'activity').length;
    if (filterKey === 'feats' || filterKey === 'feat') return trophies.filter(t => t.kind === 'feat').length;
    if (filterKey === 'money') return trophies.filter(t => t.kind === 'money').length;
    if (filterKey === 'completion') return trophies.filter(t => t.kind === 'completion').length;
    if (filterKey === 'missable') return trophies.filter(t => t.flag === 'MISSABLE').length;
    if (filterKey === 'caution') return trophies.filter(t => t.flag === 'CAUTION').length;
    if (filterKey === 'unknown') return trophies.filter(t => t.flag === 'unknown').length;
    if (filterKey === 'hidden') return trophies.filter(t => t.secret === true).length;
    return 0;
  }
};
