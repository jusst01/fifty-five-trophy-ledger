/* app/js/app.js — Master Controller, Event Handlers, and URL Hash State Management */

function runWhenReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

runWhenReady(() => {
  if (!window.TrackerRenderer) {
    document.body.innerHTML = 'DEBUG: TrackerRenderer_NOT_LOADED';
    return;
  }
  if (!window.FilterManager) {
    document.body.innerHTML = 'DEBUG: FilterManager_NOT_LOADED';
    return;
  }
  let trophiesData = [];
  let earnedState = window.StorageManager.loadEarnedState();
  let spoilerMode = window.SpoilerManager.loadSpoilerMode();
  let currentTab = 'tracker';
  let currentFilter = 'all';
  let currentGrade = 'all';
  let currentSort = 'roadmap';
  let searchQuery = '';
  let expandedTrophyId = null;

  // Callbacks for tracker
  const trackerCallbacks = {
    onToggleEarned: function(id) {
      earnedState = window.StorageManager.toggleEarned(id, earnedState);
      window.TrackerRenderer.updateDashboard(trophiesData, earnedState);
      renderTrackerList();
      if (currentTab === 'roadmap') {
        window.RoadmapRenderer.render(roadmapContainerEl, trophiesData, earnedState, jumpToTrophy);
      }
    },
    onExpandToggle: function(id) {
      if (expandedTrophyId === id) {
        expandedTrophyId = null;
      } else {
        expandedTrophyId = id;
      }
      updateURLHash();
      renderTrackerList();
    },
    onRevealSecret: function(id) {
      window.SpoilerManager.revealIndividually(id);
      renderAll();
    }
  };

  // DOM Elements
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');
  const trophyListEl = document.getElementById('trophy-list');
  if (!trophyListEl) {
    document.body.innerHTML = 'DEBUG: trophyListEl_IS_NULL';
    return;
  }
  const roadmapContainerEl = document.getElementById('roadmap-container');
  const missablesContainerEl = document.getElementById('missables-container');
  const filterChips = document.querySelectorAll('.chip');
  const gradeFilterEl = document.getElementById('grade-filter');
  const sortControlEl = document.getElementById('sort-control');
  const searchInputEl = document.getElementById('search-input');
  const spoilerToggleEl = document.getElementById('spoiler-toggle');
  const exportBtnEl = document.getElementById('export-btn');
  const importFileEl = document.getElementById('import-file');
  const bannerLinkBtn = document.querySelector('[data-goto="missables"]');

  // Initialize spoiler toggle UI state
  if (spoilerToggleEl) {
    spoilerToggleEl.checked = spoilerMode;
    spoilerToggleEl.addEventListener('change', () => {
      spoilerMode = spoilerToggleEl.checked;
      window.SpoilerManager.saveSpoilerMode(spoilerMode);
      renderAll();
    });
  }

  if (window.INLINE_TROPHIES_DATA && window.INLINE_TROPHIES_DATA.trophies) {
    trophiesData = window.INLINE_TROPHIES_DATA.trophies;
    parseHashState();
    renderAll();
    window.addEventListener('hashchange', () => {
      parseHashState();
      renderAll();
    });
  } else {
    // Fetch data/trophies.json
    fetch('data/trophies.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        trophiesData = data.trophies || [];
        parseHashState();
        renderAll();
        window.addEventListener('hashchange', () => {
          parseHashState();
          renderAll();
        });
      })
      .catch(err => {
        console.error('Failed to load trophies.json:', err);
        if (trophyListEl) {
          trophyListEl.innerHTML = `<div style="padding: 2rem; color: #f87171; text-align: center;">Failed to load data/trophies.json. Please ensure you are running via a local server. (${err.message})</div>`;
        }
      });
  }

  // Tab switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      switchTab(tab, true);
    });
  });

  if (bannerLinkBtn) {
    bannerLinkBtn.addEventListener('click', () => {
      switchTab('missables', true);
    });
  }

  function switchTab(tabName, updateHashFlag) {
    currentTab = tabName;
    tabButtons.forEach(b => {
      if (b.getAttribute('data-tab') === tabName) {
        b.classList.add('active');
      } else {
        b.classList.remove('active');
      }
    });
    tabPanes.forEach(pane => {
      if (pane.id === `tab-content-${tabName}`) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (updateHashFlag) {
      updateURLHash();
    }
  }

  // Filter chips
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.getAttribute('data-filter');
      updateURLHash();
      renderTrackerList();
    });
  });

  // Grade filter
  if (gradeFilterEl) {
    gradeFilterEl.addEventListener('change', () => {
      currentGrade = gradeFilterEl.value;
      renderTrackerList();
    });
  }

  // Sort control
  if (sortControlEl) {
    sortControlEl.addEventListener('change', () => {
      currentSort = sortControlEl.value;
      renderTrackerList();
    });
  }

  // Search input
  if (searchInputEl) {
    searchInputEl.addEventListener('input', () => {
      searchQuery = searchInputEl.value;
      renderTrackerList();
    });
  }

  // Export / Import
  if (exportBtnEl) {
    exportBtnEl.addEventListener('click', () => {
      window.StorageManager.exportProgress(earnedState);
    });
  }

  if (importFileEl) {
    importFileEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        window.StorageManager.importProgress(evt.target.result, (newEarned) => {
          earnedState = newEarned;
          renderAll();
          alert('Progress imported successfully!');
        }, (errMsg) => {
          alert(`Import failed: ${errMsg}`);
        });
      };
      reader.readAsText(file);
      importFileEl.value = '';
    });
  }

  function jumpToTrophy(id) {
    currentTab = 'tracker';
    expandedTrophyId = id;
    currentFilter = 'all';
    // update chip UI
    filterChips.forEach(c => {
      if (c.getAttribute('data-filter') === 'all') c.classList.add('active');
      else c.classList.remove('active');
    });
    if (gradeFilterEl) gradeFilterEl.value = 'all';
    if (sortControlEl) sortControlEl.value = 'roadmap';
    if (searchInputEl) searchInputEl.value = '';
    searchQuery = '';
    switchTab('tracker', false);
    updateURLHash();
    renderAll();

    // Scroll to row
    setTimeout(() => {
      const row = document.querySelector(`[data-trophy-id="${id}"]`);
      if (row) {
        row.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  }

  function renderAll() {
    window.TrackerRenderer.updateDashboard(trophiesData, earnedState);
    renderTrackerList();
    window.RoadmapRenderer.render(roadmapContainerEl, trophiesData, earnedState, jumpToTrophy);
    window.MissablesRenderer.render(missablesContainerEl, trophiesData, earnedState, jumpToTrophy);
  }

  function renderTrackerList() {
    window.TrackerRenderer.renderList(
      trophyListEl,
      trophiesData,
      earnedState,
      currentFilter,
      currentGrade,
      searchQuery,
      currentSort,
      expandedTrophyId,
      trackerCallbacks
    );
  }

  // URL Hash State Sync
  function updateURLHash() {
    const parts = [];
    if (currentTab && currentTab !== 'tracker') {
      parts.push(`tab=${currentTab}`);
    }
    if (expandedTrophyId) {
      parts.push(`open=${expandedTrophyId}`);
    }
    if (currentFilter && currentFilter !== 'all') {
      parts.push(`filter=${currentFilter}`);
    }
    const seed = window.StorageManager.getSeededEarnedIds();
    if (seed && seed.length > 0) {
      parts.push(`seed=${seed.join(',')}`);
    }
    const newHash = parts.length > 0 ? `#${parts.join('&')}` : '#';
    if (window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
  }

  function parseHashState() {
    const hash = window.location.hash;
    earnedState = window.StorageManager.loadEarnedState();
    if (!hash || hash === '#') return;

    const cleanHash = hash.replace(/^#/, '');
    const params = new URLSearchParams(cleanHash.replace(/&/g, '&'));

    const tab = params.get('tab');
    if (tab && ['tracker', 'roadmap', 'missables'].includes(tab)) {
      currentTab = tab;
      switchTab(tab, false);
    }

    const openId = params.get('open');
    if (openId) {
      const num = Number(openId);
      if (!isNaN(num) && num >= 1 && num <= 55) {
        expandedTrophyId = num;
        currentTab = 'tracker';
        switchTab('tracker', false);
      }
    }

    const filter = params.get('filter');
    if (filter) {
      currentFilter = filter;
      filterChips.forEach(c => {
        if (c.getAttribute('data-filter') === filter) {
          c.classList.add('active');
        } else {
          c.classList.remove('active');
        }
      });
    }
  }
});
