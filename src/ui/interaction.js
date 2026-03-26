(() => {
  const { buildMoveResult } = window.SpreatRules;

  function createInteractionHandlers({ getState, setState, render }) {
    return {
      onFieldClick(fieldId) {
        const state = getState();
        if (state.status !== "ready") {
          return Promise.resolve();
        }

        const result = buildMoveResult(state, fieldId);
        if (result.state === state || result.steps.length === 0) {
          return Promise.resolve();
        }

        return result.steps.reduce((sequence, step, index) => {
          return sequence.then(() => {
            setState(step);
            return render({
              duration: index === 0 ? 220 : 420,
            });
          });
        }, Promise.resolve());
      },
    };
  }

  window.SpreatInteraction = {
    createInteractionHandlers,
  };
})();
