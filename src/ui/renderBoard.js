(() => {
  const STROKE_COLOR = "#ffffff";
  const EMPTY_FILL = "#aaaaaa";

  function hexagonPoints(field, ry) {
    const xyStrings = [];

    for (let ic = 0; ic < 6; ic += 1) {
      const angle = ((2 * ic + 1) * Math.PI) / 6;
      xyStrings.push(
        `${field.x + ry * Math.cos(angle)},${field.y + ry * Math.sin(angle)}`,
      );
    }

    return xyStrings.join(" ");
  }

  function renderBoard(svg, state, handlers) {
    const d3 = window.d3;
    const selection = d3.select(svg).selectAll("polygon").data(state.fields);

    selection.enter().append("polygon").style("cursor", "pointer");

    d3.select(svg)
      .selectAll("polygon")
      .on("click", function onClick(field) {
        handlers.onFieldClick(field.id);
      })
      .attr("points", (field) => hexagonPoints(field, state.layout.ry))
      .attr("stroke", STROKE_COLOR)
      .attr("stroke-width", 3)
      .attr("fill", (field) => {
        if (field.owner === null) {
          return EMPTY_FILL;
        }

        return state.players[field.owner].color;
      })
      .attr("fill-opacity", 0.35);
  }

  window.SpreatRenderBoard = {
    hexagonPoints,
    renderBoard,
  };
})();
