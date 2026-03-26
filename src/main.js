(() => {
  const { createPlayers } = window.SpreatPlayers;
  const { createInitialState } = window.SpreatRules;
  const { createInteractionHandlers } = window.SpreatInteraction;
  const { renderAtoms } = window.SpreatRenderAtoms;
  const { renderBoard } = window.SpreatRenderBoard;

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
        statusElement.textContent = `${state.players[state.winner].name} wins.`;
        return;
      }

      statusElement.textContent = `${state.players[state.currentPlayer].name} to move.`;
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
