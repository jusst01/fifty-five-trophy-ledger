window.FF = window.FF || {};

window.FF.filters = (() => {
  const GROUPS = {
    all: "All",
    platinum: "Platinum",
    story: "Story",
    strands: "Strands",
    collectibles: "Collectibles",
    activities: "Activities",
    feats: "Feats",
    money: "Money",
    completion: "Completion",
    missable: "Missable",
    caution: "Caution",
    unknown: "Not yet known",
    hidden: "Hidden"
  };

  const matches = (trophy, group) => {
    if (group === "all") return true;
    if (group === "platinum") return trophy.grade === "platinum";
    if (["story", "strands", "collectibles", "activities", "feats", "money", "completion"].includes(group)) {
      return trophy.kind === (group === "strands" ? "strand" : group);
    }
    if (group === "missable") return trophy.flag === "MISSABLE";
    if (group === "caution") return trophy.flag === "CAUTION";
    if (group === "unknown") return trophy.flag === "unknown";
    if (group === "hidden") return !!trophy.secret;
    return false;
  };

  const countFor = (trophies, group) => trophies.filter(t => matches(t, group)).length;

  const counts = (trophies) => {
    const result = {};
    for (const group in GROUPS) {
      result[group] = countFor(trophies, group);
    }
    return result;
  };

  const apply = (trophies, { group, grade, sort, query }) => {
    let filtered = trophies.filter(t => matches(t, group));
    if (grade !== "all") {
      filtered = filtered.filter(t => t.grade === grade);
    }
    if (query) {
      const q = query.toLowerCase();
      filtered = filtered.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    }

    const gradeOrder = { "platinum": 4, "gold": 3, "silver": 2, "bronze": 1 };

    filtered.sort((a, b) => {
      if (sort === "roadmap") return (a.stage - b.stage) || (a.id - b.id);
      if (sort === "grade") return (gradeOrder[b.grade] - gradeOrder[a.grade]) || (a.id - b.id);
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "kind") return a.kind.localeCompare(b.kind) || (a.id - b.id);
      return 0;
    });

    return filtered;
  };

  return { GROUPS, matches, countFor, counts, apply };
})();
