(() => {
  const DEFAULT_OPTIONS = {
    atomRadius: 7,
    duration: 180,
    fieldRadius: 15,
  };

  function getOffsets(atomCount, atomRadius, fieldRadius) {
    if (atomCount <= 1) {
      return [{ x: 0, y: 0 }];
    }

    const smallRingRadius = Math.min(fieldRadius * 0.78, atomRadius * 2);

    if (atomCount >= 2 && atomCount <= 4) {
      const offsets = [];
      for (let index = 0; index < atomCount; index += 1) {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / atomCount;
        offsets.push({
          x: smallRingRadius * Math.cos(angle),
          y: smallRingRadius * Math.sin(angle),
        });
      }
      return offsets;
    }

    let maxRing = 0;
    let capacity = 1;
    while (capacity < atomCount) {
      maxRing += 1;
      capacity += 6 * maxRing;
    }

    const offsets = [{ x: 0, y: 0 }];
    const radialStep = maxRing > 0 ? fieldRadius / maxRing : 0;
    let remaining = atomCount - 1;

    for (let ring = 1; ring <= maxRing && remaining > 0; ring += 1) {
      const ringCount = Math.min(6 * ring, remaining);
      const radius = radialStep * ring;

      for (let index = 0; index < ringCount; index += 1) {
        const angle = -Math.PI / 2 + (2 * Math.PI * index) / ringCount;
        offsets.push({
          x: radius * Math.cos(angle),
          y: radius * Math.sin(angle),
        });
      }

      remaining -= ringCount;
    }

    if (radialStep < atomRadius * 1.4) {
      const scale = radialStep / (atomRadius * 1.4);
      return offsets.map((offset) => ({
        x: offset.x * Math.max(scale, 0.55),
        y: offset.y * Math.max(scale, 0.55),
      }));
    }

    return offsets;
  }

  function getAtomLayout(field, atomCount, options = {}) {
    if (atomCount <= 0 || field.owner === null) {
      return [];
    }

    const { atomRadius, fieldRadius } = { ...DEFAULT_OPTIONS, ...options };

    return getOffsets(atomCount, atomRadius, fieldRadius).map(
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
    if (!options.fieldRadius) {
      mergedOptions.fieldRadius =
        state.layout.rx - mergedOptions.atomRadius - 3;
    }
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
