(() => {
  const { COMPUTER_PLAYER_TYPE, HUMAN_PLAYER_TYPE, createPlayers } =
    window.SpreatPlayers;
  const { canPlayOnField, createInitialState, getPlayableFieldIds } =
    window.SpreatRules;
  const { createInteractionHandlers } = window.SpreatInteraction;
  const { renderAtoms } = window.SpreatRenderAtoms;
  const { renderBoard, canPreviewMove, wouldBecomeCritical } =
    window.SpreatRenderBoard;

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function renderPlayerStatus(player, suffix) {
    return (
      `<span style="display:inline-flex;align-items:center;gap:0.45rem;">` +
      `<span style="width:0.9rem;height:0.9rem;border-radius:999px;` +
      `display:inline-block;background:${player.color};border:1px solid #000;"></span>` +
      `<span>${player.name} (${capitalize(player.color)}) ${suffix}</span>` +
      `</span>`
    );
  }

  function getPlayerSummaryStatus(state, player) {
    if (state.winner !== null && state.winner === player.id) {
      return "Winner";
    }

    if (window.SpreatRules.isPlayerEliminated(state, player.id)) {
      return "Out";
    }

    if (state.currentPlayer === player.id && state.status === "ready") {
      return player.type === COMPUTER_PLAYER_TYPE ? "Thinking" : "Turn";
    }

    return "In";
  }

  function renderPlayerSummary(state) {
    return state.players
      .map((player) => {
        const status = getPlayerSummaryStatus(state, player);
        const dimmed = status === "Out";
        return (
          `<span style="display:inline-flex;align-items:center;gap:0.45rem;` +
          `margin-right:0.9rem;margin-bottom:0.35rem;opacity:${dimmed ? "0.45" : "1"};">` +
          `<span style="width:0.9rem;height:0.9rem;border-radius:999px;display:inline-block;` +
          `background:${player.color};border:1px solid #000;"></span>` +
          `<span>${player.name}</span>` +
          `<span style="color:#555;">${capitalize(player.type)}</span>` +
          `<span style="font-weight:600;">${status}</span>` +
          `</span>`
        );
      })
      .join("");
  }

  function boot() {
    const svg = document.querySelector("svg");
    const statusElement = document.querySelector("[data-role='status']");
    const rosterElement = document.querySelector("[data-role='roster']");
    const resetButton = document.querySelector("[data-role='reset']");
    const boardSizeSelect = document.querySelector("[data-role='board-size']");
    const playerCountSelect = document.querySelector(
      "[data-role='player-count']",
    );
    const playerTypesElement = document.querySelector(
      "[data-role='player-types']",
    );
    let pendingComputerTurnId = null;

    function clearPendingComputerTurn() {
      if (pendingComputerTurnId !== null) {
        window.clearTimeout(pendingComputerTurnId);
        pendingComputerTurnId = null;
      }
    }

    function getPlayerTypeValues() {
      if (!playerTypesElement) {
        return [];
      }

      return Array.from(
        playerTypesElement.querySelectorAll("[data-role='player-type-select']"),
      ).map((select) => select.value);
    }

    function renderPlayerTypeControls() {
      if (!playerTypesElement) {
        return;
      }

      const playerCount = Number(
        playerCountSelect ? playerCountSelect.value : 2,
      );
      const previousTypes = getPlayerTypeValues();
      const controls = [];

      for (let index = 0; index < playerCount; index += 1) {
        const selectedType = previousTypes[index] || HUMAN_PLAYER_TYPE;
        controls.push(
          `<label>` +
            `Player ${index + 1}` +
            `<select data-role="player-type-select" data-player-id="${index}">` +
            `<option value="${HUMAN_PLAYER_TYPE}"${
              selectedType === HUMAN_PLAYER_TYPE ? " selected" : ""
            }>Human</option>` +
            `<option value="${COMPUTER_PLAYER_TYPE}"${
              selectedType === COMPUTER_PLAYER_TYPE ? " selected" : ""
            }>Computer</option>` +
            `</select>` +
            `</label>`,
        );
      }

      playerTypesElement.innerHTML = controls.join(" ");
    }

    function getConfig() {
      return {
        boardSize: Number(boardSizeSelect ? boardSizeSelect.value : 5),
        playerCount: Number(playerCountSelect ? playerCountSelect.value : 2),
        playerTypes: getPlayerTypeValues(),
      };
    }

    function createConfiguredState(config) {
      return {
        ...createInitialState(
          config.boardSize,
          createPlayers(config.playerCount, config.playerTypes),
        ),
        ui: {
          hoveredFieldId: null,
        },
      };
    }

    renderPlayerTypeControls();
    let state = createConfiguredState(getConfig());

    function getState() {
      return state;
    }

    function setState(nextState) {
      state = nextState;
    }

    function renderStatus() {
      if (!statusElement) {
        return;
      }

      const hoveredField =
        state.ui && state.ui.hoveredFieldId !== null
          ? state.fields.find(
              (field) => field.id === state.ui.hoveredFieldId,
            ) || null
          : null;

      if (state.winner !== null) {
        statusElement.innerHTML = renderPlayerStatus(
          state.players[state.winner],
          "wins.",
        );
        return;
      }

      if (state.players[state.currentPlayer].type === COMPUTER_PLAYER_TYPE) {
        statusElement.innerHTML = renderPlayerStatus(
          state.players[state.currentPlayer],
          "is thinking...",
        );
        return;
      }

      if (hoveredField && state.status === "ready") {
        if (!canPreviewMove(state, hoveredField)) {
          statusElement.innerHTML = renderPlayerStatus(
            state.players[state.currentPlayer],
            "cannot play on the hovered field.",
          );
          return;
        }

        if (wouldBecomeCritical(hoveredField)) {
          statusElement.innerHTML = renderPlayerStatus(
            state.players[state.currentPlayer],
            "can trigger an immediate explosion here.",
          );
          return;
        }
      }

      statusElement.innerHTML = renderPlayerStatus(
        state.players[state.currentPlayer],
        "to move.",
      );
    }

    function renderRoster() {
      if (!rosterElement) {
        return;
      }

      rosterElement.innerHTML = renderPlayerSummary(state);
    }

    function waitForTransition(transition, fallbackDuration) {
      return new Promise((resolve) => {
        if (!transition || typeof transition.each !== "function") {
          window.setTimeout(resolve, fallbackDuration);
          return;
        }

        let resolved = false;
        const finish = () => {
          if (resolved) {
            return;
          }
          resolved = true;
          resolve();
        };

        transition.each("end", finish);
        window.setTimeout(finish, fallbackDuration + 50);
      });
    }

    function render(options = {}) {
      const duration = options.duration || 180;

      svg.setAttribute(
        "width",
        2 * state.layout.pad + state.layout.rx * (4 * state.boardSize + 2),
      );
      svg.setAttribute(
        "height",
        2 * state.layout.pad +
          state.layout.rx +
          state.layout.ry * (3 * state.boardSize + 1.5),
      );

      renderBoard(svg, state, state.ui || {}, handlers);
      const atomTransition = renderAtoms(svg, state, { duration });
      renderStatus();
      renderRoster();
      return waitForTransition(atomTransition, duration);
    }

    function playMove(fieldId) {
      const currentState = getState();
      if (
        currentState.status !== "ready" ||
        !canPlayOnField(currentState, fieldId, currentState.currentPlayer)
      ) {
        return Promise.resolve();
      }

      const result = window.SpreatRules.buildMoveResult(currentState, fieldId);
      if (result.state === currentState || result.steps.length === 0) {
        return Promise.resolve();
      }

      clearPendingComputerTurn();

      return result.steps
        .reduce((sequence, step, index) => {
          return sequence.then(() => {
            setState(step);
            return render({
              duration: index === 0 ? 220 : 420,
            });
          });
        }, Promise.resolve())
        .then(() => ensureComputerTurn());
    }

    function chooseComputerMove(currentState) {
      const playableFieldIds = getPlayableFieldIds(
        currentState,
        currentState.currentPlayer,
      );
      if (playableFieldIds.length === 0) {
        return null;
      }

      const randomIndex = Math.floor(Math.random() * playableFieldIds.length);
      return playableFieldIds[randomIndex];
    }

    function ensureComputerTurn() {
      clearPendingComputerTurn();

      const currentState = getState();
      if (
        currentState.status !== "ready" ||
        currentState.winner !== null ||
        currentState.players[currentState.currentPlayer].type !==
          COMPUTER_PLAYER_TYPE
      ) {
        return Promise.resolve();
      }

      pendingComputerTurnId = window.setTimeout(() => {
        pendingComputerTurnId = null;
        const latestState = getState();
        const fieldId = chooseComputerMove(latestState);
        if (fieldId === null) {
          return;
        }

        playMove(fieldId);
      }, 320);

      return Promise.resolve();
    }

    const handlers = createInteractionHandlers({
      getState,
      setState,
      render,
      onTurnComplete: ensureComputerTurn,
    });

    if (playerCountSelect) {
      playerCountSelect.addEventListener("change", () => {
        renderPlayerTypeControls();
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        clearPendingComputerTurn();
        state = createConfiguredState(getConfig());
        render({ duration: 120 });
        ensureComputerTurn();
      });
    }

    render({ duration: 120 });
    ensureComputerTurn();
  }

  window.SpreatApp = {
    boot,
  };
})();
