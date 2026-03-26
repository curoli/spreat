(() => {
  const DEFAULT_OPTIONS = {
    atomRadius: 7,
    duration: 180,
  };

  function getOffsets(atomCount, distance) {
    if (atomCount <= 1) {
      return [{ x: 0, y: 0 }];
    }

    if (atomCount === 2) {
      return [
        { x: -distance / 2, y: 0 },
        { x: distance / 2, y: 0 },
      ];
    }

    if (atomCount === 3) {
      return [
        { x: 0, y: -distance * 0.65 },
        { x: -distance * 0.6, y: distance * 0.35 },
        { x: distance * 0.6, y: distance * 0.35 },
      ];
    }

    if (atomCount === 4) {
      return [
        { x: -distance / 2, y: -distance / 2 },
        { x: distance / 2, y: -distance / 2 },
        { x: -distance / 2, y: distance / 2 },
        { x: distance / 2, y: distance / 2 },
      ];
    }

    if (atomCount === 5) {
      return [
        { x: 0, y: 0 },
        { x: 0, y: -distance },
        { x: -distance * 0.9, y: -distance * 0.2 },
        { x: distance * 0.9, y: -distance * 0.2 },
        { x: 0, y: distance },
      ];
    }

    return [
      { x: -distance, y: 0 },
      { x: -distance / 2, y: -distance * 0.8 },
      { x: distance / 2, y: -distance * 0.8 },
      { x: distance, y: 0 },
      { x: distance / 2, y: distance * 0.8 },
      { x: -distance / 2, y: distance * 0.8 },
    ];
  }

  function getAtomLayout(field, atomCount, options = {}) {
    if (atomCount <= 0 || field.owner === null) {
      return [];
    }

    const { atomRadius } = { ...DEFAULT_OPTIONS, ...options };
    const distance = atomRadius * 2.2;

    return getOffsets(Math.min(atomCount, 6), distance).map(
      (offset, index) => ({
        id: `${field.id}-${index}`,
        fieldId: field.id,
        owner: field.owner,
        x: field.x + offset.x,
        y: field.y + offset.y,
      }),
    );
  }

  function renderAtoms(svg, state, options = {}) {
    const d3 = window.d3;
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
    const atomData = state.fields.flatMap((field) =>
      getAtomLayout(field, field.atomCount, mergedOptions),
    );

    const selection = d3
      .select(svg)
      .selectAll("circle")
      .data(atomData, (atom) => atom.id);

    selection.exit().remove();
    selection.enter().append("circle");

    const transition = d3
      .select(svg)
      .selectAll("circle")
      .transition()
      .duration(mergedOptions.duration)
      .attr("cx", (atom) => atom.x)
      .attr("cy", (atom) => atom.y)
      .attr("r", mergedOptions.atomRadius)
      .attr("stroke", "#000000")
      .attr("stroke-width", 1)
      .style("pointer-events", "none")
      .attr("fill", (atom) => state.players[atom.owner].color);

    return transition;
  }

  window.SpreatRenderAtoms = {
    getAtomLayout,
    renderAtoms,
  };
})();
