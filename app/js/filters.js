/* app/js/filters.js — Filtering, Searching, and Sorting Trophies */

window.FilterManager = {
  filterAndSort: function(trophies, filterGroup, gradeFilter, searchQuery, sortOption, earnedMap) {
    try {
      let result = trophies.slice();

    // 1. Filter Group
    if (filterGroup && filterGroup !== 'all') {
      if (filterGroup === 'missable') {
        result = result.filter(t => t.flag === 'MISSABLE' || t.flag === 'CAUTION');
      } else {
        result = result.filter(t => t.filter_group === filterGroup);
      }
    }

    // 2. Grade Filter
    if (gradeFilter && gradeFilter !== 'all') {
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
      document.body.appendChild(document.createTextNode('DEBUG: ERROR_FILTER_' + e.message));
      return [];
    }
  }
};
