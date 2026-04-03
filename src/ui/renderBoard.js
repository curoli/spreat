(() => {
  const STROKE_COLOR = "#ffffff";
  const EMPTY_FILL = "#aaaaaa";
  const CRITICAL_STROKE_COLOR = "#ff5a1f";
  const PREVIEW_STROKE_COLOR = "#101010";
  const PREVIEW_CRITICAL_STROKE_COLOR = "#ffb000";

  function canPreviewMove(state, field) {
    return field.owner === null || field.owner === state.currentPlayer;
  }

  function wouldBecomeCritical(field) {
    return field.atomCount + 1 >= field.neighbors.length;
  }

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

  function renderBoard(svg, state, uiState, handlers) {
    const d3 = window.d3;
    const board = d3.select(svg);
    const hoveredFieldId = uiState && uiState.hoveredFieldId;
    const lastMoveFieldId = uiState && uiState.lastMoveFieldId;
    const isHumanTurn =
      state.status === "ready" &&
      state.players[state.currentPlayer].type === "human";
    const selection = board
      .selectAll("polygon.spreat-field")
      .data(state.fields);

    selection.exit().remove();

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
      .on("mouseenter", function onMouseEnter(field) {
        handlers.onFieldHover(field.id);
      })
      .on("mouseleave", function onMouseLeave() {
        handlers.onFieldHover(null);
      })
      .attr("points", (field) => hexagonPoints(field, state.layout.ry))
      .attr("stroke", STROKE_COLOR)
      .attr("stroke-width", 3)
      .attr("stroke-linejoin", "round")
      .style("cursor", (field) =>
        isHumanTurn && canPreviewMove(state, field) ? "pointer" : "not-allowed",
      )
      .attr("fill", (field) => {
        if (field.owner === null) {
          return EMPTY_FILL;
        }

        return state.players[field.owner].color;
      })
      .attr("fill-opacity", (field) => {
        if (field.owner === null) {
          return 0.35;
        }

        const playable = isHumanTurn && canPreviewMove(state, field);
        const hovered = field.id === hoveredFieldId;
        if (!playable) {
          return hovered ? 0.22 : 0.16;
        }

        if (hovered) {
          return isCritical(field) ? 0.72 : 0.58;
        }

        return isCritical(field) ? 0.5 : 0.35;
      });

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

    const lastMoveSelection = board
      .selectAll("polygon.spreat-field-last-move")
      .data(
        state.fields.filter((field) => field.id === lastMoveFieldId),
        (field) => field.id,
      );

    lastMoveSelection.exit().remove();

    lastMoveSelection
      .enter()
      .append("polygon")
      .attr("class", "spreat-field-last-move")
      .style("pointer-events", "none");

    board
      .selectAll("polygon.spreat-field-last-move")
      .attr("points", (field) => hexagonPoints(field, state.layout.ry, 0.8))
      .attr("fill", "none")
      .attr("stroke", "#111111")
      .attr("stroke-width", 2.5)
      .attr("stroke-linejoin", "round");

    const previewSelection = board
      .selectAll("polygon.spreat-field-preview")
      .data(
        state.fields.filter((field) => field.id === hoveredFieldId),
        (field) => field.id,
      );

    previewSelection.exit().remove();

    previewSelection
      .enter()
      .append("polygon")
      .attr("class", "spreat-field-preview")
      .style("pointer-events", "none");

    board
      .selectAll("polygon.spreat-field-preview")
      .attr("points", (field) => hexagonPoints(field, state.layout.ry, 0.93))
      .attr("fill", "none")
      .attr("stroke", (field) =>
        canPreviewMove(state, field) ? PREVIEW_STROKE_COLOR : "#6f6f6f",
      )
      .attr("stroke-width", (field) => (canPreviewMove(state, field) ? 3 : 2))
      .attr("stroke-dasharray", (field) =>
        canPreviewMove(state, field) ? "10,6" : "4,6",
      )
      .attr("stroke-linejoin", "round");

    const previewCriticalSelection = board
      .selectAll("polygon.spreat-field-preview-critical")
      .data(
        state.fields.filter(
          (field) =>
            field.id === hoveredFieldId &&
            state.status === "ready" &&
            canPreviewMove(state, field) &&
            wouldBecomeCritical(field),
        ),
        (field) => field.id,
      );

    previewCriticalSelection.exit().remove();

    previewCriticalSelection
      .enter()
      .append("polygon")
      .attr("class", "spreat-field-preview-critical")
      .style("pointer-events", "none");

    board
      .selectAll("polygon.spreat-field-preview-critical")
      .attr("points", (field) => hexagonPoints(field, state.layout.ry, 0.76))
      .attr("fill", "none")
      .attr("stroke", PREVIEW_CRITICAL_STROKE_COLOR)
      .attr("stroke-width", 3)
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-linejoin", "round");
  }

  window.SpreatRenderBoard = {
    canPreviewMove,
    wouldBecomeCritical,
    isCritical,
    hexagonPoints,
    renderBoard,
  };
})();
