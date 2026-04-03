(() => {
  const { buildMoveResult } = window.SpreatRules;
  const { HUMAN_PLAYER_TYPE } = window.SpreatPlayers;

  function createInteractionHandlers({
    getState,
    setState,
    render,
    onTurnComplete,
  }) {
    return {
      onFieldClick(fieldId) {
        const state = getState();
        if (state.status !== "ready") {
          return Promise.resolve();
        }
        if (state.players[state.currentPlayer].type !== HUMAN_PLAYER_TYPE) {
          return Promise.resolve();
        }

        const result = buildMoveResult(state, fieldId);
        if (result.state === state || result.steps.length === 0) {
          return Promise.resolve();
        }
        const nextUi = {
          ...(state.ui || {}),
          hoveredFieldId: null,
          lastMoveFieldId: fieldId,
        };

        return result.steps
          .reduce((sequence, step, index) => {
            return sequence.then(() => {
              setState({
                ...step,
                ui: nextUi,
              });
              return render({
                duration: index === 0 ? 220 : 420,
              });
            });
          }, Promise.resolve())
          .then(() => {
            if (typeof onTurnComplete === "function") {
              return onTurnComplete();
            }

            return Promise.resolve();
          });
      },

      onFieldHover(fieldId) {
        const state = getState();
        if (state.status !== "ready") {
          return Promise.resolve();
        }
        if (state.players[state.currentPlayer].type !== HUMAN_PLAYER_TYPE) {
          return Promise.resolve();
        }

        setState({
          ...state,
          ui: {
            ...state.ui,
            hoveredFieldId: fieldId,
          },
        });
        return render({ duration: 0 });
      },
    };
  }

  window.SpreatInteraction = {
    createInteractionHandlers,
  };
})();
