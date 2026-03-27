(() => {
  const STROKE_COLOR = "#ffffff";
  const EMPTY_FILL = "#aaaaaa";
  const CRITICAL_STROKE_COLOR = "#ff5a1f";

  function isCritical(field) {
    return field.atomCount >= field.neighbors.length;
  }

  function hexagonPoints(field, ry, scale = 1) {
    const xyStrings = [];

    for (let ic = 0; ic < 6; ic += 1) {
      const angle = ((2 * ic + 1) * Math.PI) / 6;
      xyStrings.push(
        `${field.x + scale * ry * Math.cos(angle)},${field.y + scale * ry * Math.sin(angle)}`,
      );
    }

    return xyStrings.join(" ");
  }

  function renderBoard(svg, state, handlers) {
    const d3 = window.d3;
    const board = d3.select(svg);
    const selection = board
      .selectAll("polygon.spreat-field")
      .data(state.fields);

    selection
      .enter()
      .append("polygon")
      .attr("class", "spreat-field")
      .style("cursor", "pointer");

    board
      .selectAll("polygon.spreat-field")
      .on("click", function onClick(field) {
        handlers.onFieldClick(field.id);
      })
      .attr("points", (field) => hexagonPoints(field, state.layout.ry))
      .attr("stroke", STROKE_COLOR)
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .attr("fill", (field) => {
        if (field.owner === null) {
          return EMPTY_FILL;
        }

        return state.players[field.owner].color;
      })
      .attr("fill-opacity", (field) => (isCritical(field) ? 0.5 : 0.35));

    const criticalSelection = board
      .selectAll("polygon.spreat-field-critical")
      .data(state.fields.filter(isCritical), (field) => field.id);

    criticalSelection.exit().remove();

    criticalSelection
      .enter()
      .append("polygon")
      .attr("class", "spreat-field-critical")
      .style("pointer-events", "none");

    board
      .selectAll("polygon.spreat-field-critical")
      .attr("points", (field) => hexagonPoints(field, state.layout.ry, 0.86))
      .attr("fill", "none")
      .attr("stroke", CRITICAL_STROKE_COLOR)
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round");
  }

  window.SpreatRenderBoard = {
    isCritical,
    hexagonPoints,
    renderBoard,
  };
})();
