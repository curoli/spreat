(() => {
  const { createPlayers } = window.SpreatPlayers;
  const { createInitialState } = window.SpreatRules;
  const { createInteractionHandlers } = window.SpreatInteraction;
  const { renderAtoms } = window.SpreatRenderAtoms;
  const { renderBoard } = window.SpreatRenderBoard;

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

  function boot() {
    const svg = document.querySelector("svg");
    const statusElement = document.querySelector("[data-role='status']");
    const resetButton = document.querySelector("[data-role='reset']");

    let state = createInitialState(5, createPlayers());

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

      if (state.winner !== null) {
        statusElement.innerHTML = renderPlayerStatus(
          state.players[state.winner],
          "wins.",
        );
        return;
      }

      statusElement.innerHTML = renderPlayerStatus(
        state.players[state.currentPlayer],
        "to move.",
      );
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

      renderBoard(svg, state, handlers);
      const atomTransition = renderAtoms(svg, state, { duration });
      renderStatus();
      return waitForTransition(atomTransition, duration);
    }

    const handlers = createInteractionHandlers({
      getState,
      setState,
      render,
    });

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        state = createInitialState(5, createPlayers());
        render({ duration: 120 });
      });
    }

    render({ duration: 120 });
  }

  window.SpreatApp = {
    boot,
  };
})();
