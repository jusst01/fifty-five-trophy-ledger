/* app/js/app.js — Master Controller, Event Handlers, and URL Hash State Management (v2) */

function runWhenReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    fn();
  }
}

runWhenReady(async () => {
  let trophiesData = [];
  let sourcesRail = [];
  let earnedState = window.StorageManager.loadEarnedState();
  let expandedTrophyId = 28; // Default to PMA id 28
  let currentFilter = 'all';
  let currentGrade = 'all';
  let currentSort = 'roadmap';
  let searchQuery = '';
  let currentTab = 'tracker'; // tracker | roadmap | missables

  const checklistEl = document.getElementById('checklist-pane');
  const detailEl = document.getElementById('detail-pane');
  const railEl = document.getElementById('sources-rail');
  const filterRowEl = document.querySelector('.filter-row');
  const gradeFilterEl = document.getElementById('grade-filter');
  const sortControlEl = document.getElementById('sort-control');
  const searchInputEl = document.getElementById('search-input');
  const spoilerToggleEl = document.getElementById('spoiler-toggle');
  const exportBtnEl = document.getElementById('export-btn');
  const importFileEl = document.getElementById('import-file');

  // Initialize Grade Filter options if empty or basic
  if (gradeFilterEl) {
    gradeFilterEl.innerHTML = `
      <option value="all">All Grades</option>
      <option value="platinum">Platinum</option>
      <option value="gold">Gold</option>
      <option value="silver">Silver</option>
      <option value="bronze">Bronze</option>
    `;
    gradeFilterEl.addEventListener('change', () => {
      currentGrade = gradeFilterEl.value;
      renderAll();
    });
  }

  // Initialize Sort Control options
  if (sortControlEl) {
    sortControlEl.innerHTML = `
      <option value="roadmap">Sort By: Roadmap (Default)</option>
      <option value="grade">Sort By: Grade</option>
      <option value="name">Sort By: Name</option>
      <option value="kind">Sort By: Kind</option>
    `;
    sortControlEl.addEventListener('change', () => {
      currentSort = sortControlEl.value;
      renderAll();
    });
  }

  // Search Input listener
  if (searchInputEl) {
    searchInputEl.addEventListener('input', () => {
      searchQuery = searchInputEl.value;
      renderAll();
    });
  }

  // Spoiler Toggle listener
  if (spoilerToggleEl) {
    spoilerToggleEl.addEventListener('click', () => {
      const currentMode = window.SpoilerManager.loadSpoilerMode();
      window.SpoilerManager.saveSpoilerMode(!currentMode);
      renderAll();
    });
  }

  // Export Progress listener
  if (exportBtnEl) {
    exportBtnEl.addEventListener('click', () => {
      window.StorageManager.exportProgress(earnedState);
    });
  }

  // Import Progress listener
  if (importFileEl) {
    importFileEl.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = function(evt) {
        window.StorageManager.importProgress(
          evt.target.result,
          (newEarnedMap) => {
            earnedState = newEarnedMap;
            alert('Progress imported successfully!');
            renderAll();
          },
          (errMsg) => {
            alert('Failed to import progress: ' + errMsg);
          }
        );
      };
      reader.readAsText(file);
      importFileEl.value = ''; // reset input
    });
  }

  // Tab Button listeners
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-target');
      if (target) {
        currentTab = target;
        updateURLHash();
        renderAll();
      }
    });
  });

  // Fetch Data
  try {
    const response = await fetch('data/trophies.json');
    const data = await response.json();
    trophiesData = data.trophies || [];
    sourcesRail = data.sources_rail || [];

    // Apply URL hash state post-fetch (v1 bug fix regression prevention)
    parseHashState();
    renderAll();

    window.addEventListener('hashchange', () => {
      parseHashState();
      renderAll();
    });
  } catch (err) {
    console.error('Failed to load trophies.json:', err);
  }

  function renderAll() {
    // Update Dashboard & Audit Strip
    window.TrackerRenderer.updateDashboard(trophiesData, earnedState);

    // Switch Tab Panes visibility & Active Tab Buttons
    const tabPanes = {
      'tracker': document.getElementById('tracker-section'),
      'roadmap': document.getElementById('roadmap-container'),
      'missables': document.getElementById('missables-container')
    };

    for (const [key, pane] of Object.entries(tabPanes)) {
      if (pane) {
        if (key === currentTab) {
          pane.style.display = 'block';
        } else {
          pane.style.display = 'none';
        }
      }
    }

    document.querySelectorAll('.tab-btn').forEach(btn => {
      const target = btn.getAttribute('data-target');
      if (target === currentTab) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Render based on active tab
    if (currentTab === 'tracker') {
      // Render filter buttons in filter row
      if (filterRowEl) {
        window.TrackerRenderer.renderFilterButtons(filterRowEl, trophiesData, currentFilter, (filterKey) => {
          currentFilter = filterKey;
          updateURLHash();
          renderAll();
        });
      }

      // Render Checklist Pane
      window.TrackerRenderer.renderChecklist(
        checklistEl,
        trophiesData,
        earnedState,
        currentFilter,
        currentGrade,
        searchQuery,
        currentSort,
        expandedTrophyId,
        {
          onToggleEarned: (id) => {
            earnedState = window.StorageManager.toggleEarned(id, earnedState);
            renderAll();
          },
          onSelect: (id) => {
            expandedTrophyId = id;
            updateURLHash();
            renderAll();
          }
        }
      );

      // Render Detail Pane
      const selectedTrophy = trophiesData.find(t => t.id === expandedTrophyId) || trophiesData[0];
      window.TrackerRenderer.renderDetail(detailEl, selectedTrophy, earnedState, {
        onReveal: (id) => {
          window.SpoilerManager.revealIndividually(id);
          renderAll();
        }
      });

      // Render Sources Rail
      window.TrackerRenderer.renderSources(railEl, sourcesRail);

    } else if (currentTab === 'roadmap') {
      const roadmapContainer = document.getElementById('roadmap-container');
      if (roadmapContainer && window.RoadmapRenderer) {
        window.RoadmapRenderer.render(roadmapContainer, trophiesData, earnedState, (id) => {
          expandedTrophyId = id;
          currentTab = 'tracker';
          updateURLHash();
          renderAll();
        });
      }
    } else if (currentTab === 'missables') {
      const missablesContainer = document.getElementById('missables-container');
      if (missablesContainer && window.MissablesRenderer) {
        window.MissablesRenderer.render(missablesContainer, trophiesData, earnedState, (id) => {
          expandedTrophyId = id;
          currentTab = 'tracker';
          updateURLHash();
          renderAll();
        });
      }
    }
  }

  function updateURLHash() {
    const parts = [];
    if (currentTab && currentTab !== 'tracker') parts.push(`tab=${currentTab}`);
    if (currentFilter && currentFilter !== 'all') parts.push(`filter=${currentFilter}`);
    if (expandedTrophyId) parts.push(`open=${expandedTrophyId}`);

    const seed = window.StorageManager.getSeededEarnedIds();
    if (seed && seed.length > 0) parts.push(`seed=${seed.join(',')}`);

    const newHash = parts.length > 0 ? `#${parts.join('&')}` : '#';
    history.replaceState(null, '', newHash);
  }

  function parseHashState() {
    const hash = window.location.hash;
    if (!hash || hash === '#') {
      currentTab = 'tracker';
      currentFilter = 'all';
      return;
    }
    const params = new URLSearchParams(hash.replace(/^#/, ''));

    const tab = params.get('tab');
    if (tab && ['tracker', 'roadmap', 'missables'].includes(tab)) {
      currentTab = tab;
    } else {
      currentTab = 'tracker';
    }

    const filter = params.get('filter');
    if (filter) {
      currentFilter = filter;
    } else {
      currentFilter = 'all';
    }

    const openId = params.get('open');
    if (openId) {
      const num = Number(openId);
      if (!isNaN(num)) expandedTrophyId = num;
    }
  }
});
