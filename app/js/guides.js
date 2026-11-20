window.FF = window.FF || {};

window.FF.guides = (() => {
  const esc = (str) => {
    if (typeof str !== 'string') return str;
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&#039;');
  };

  const stepListHTML = (trophy) => {
    if (!trophy.steps || trophy.steps.length === 0) return "";
    let html = '<ol class="steps">';
    trophy.steps.forEach((step, i) => {
      html += `<li class="step-item"><span class="step-num">${i + 1}</span><span class="step-text">${esc(step.text)}</span>`;
      step.cites.forEach(cite => {
        html += `<span class="citation-chip">[${cite}]</span>`;
      });
      html += '</li>';
    });
    html += '</ol>';
    return html;
  };

  const calloutHTML = (trophy) => {
    if (!trophy.steps || trophy.steps.length === 0) return "";
    const lastStep = trophy.steps[trophy.steps.length - 1];
    if (trophy.flag === "MISSABLE") {
      return `<div class="callout callout-missable"><h3>Miss window</h3>${esc(lastStep.text)}</div>`;
    }
    if (trophy.flag === "CAUTION") {
      return `<div class="callout callout-caution"><h3>Caution</h3>${esc(lastStep.text)}</div>`;
    }
    if (trophy.flag === "unknown") {
      return `<div class="callout"><h3>Not yet known</h3>${esc(lastStep.text)}</div>`;
    }
    return "";
  };

  const badgesHTML = (trophy) => {
    if (trophy.flag === "MISSABLE") return '<span class="flag-badge flag-missable">POSSIBLY MISSABLE</span>';
    if (trophy.flag === "CAUTION") return '<span class="flag-badge flag-caution">CAUTION</span>';
    if (trophy.flag === "unknown") return '<span class="flag-badge flag-unknown">NOT YET KNOWN</span>';
    return "";
  };

  const sourcesFooterHTML = (trophy) => {
    if (!trophy.sources || trophy.sources.length === 0) return "";
    return `<div class="sources-footer">Sources: ${trophy.sources.join(' · ')}</div>`;
  };

  const railHTML = (data) => {
    let html = '<h2>SOURCES — checked Nov 2026</h2><ol>';
    data.sources_rail.forEach(s => {
      html += `<li><span class="citation-chip">[${s.n}]</span> <strong>${esc(s.name)}</strong> — ${esc(s.role)}<br>cited by ${s.cited_by} of 55 guides</li>`;
    });
    html += '</ol><p class="rail-note">"Every step cites its source by number. The official list [3][4] gives each trophy its name, description and grade."</p>';
    return html;
  };

  return { stepListHTML, calloutHTML, badgesHTML, sourcesFooterHTML, railHTML };
})();
