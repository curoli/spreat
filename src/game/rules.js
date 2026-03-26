(() => {
  const { createBoard, getFieldById } = window.SpreatBoard;
  const { getNextPlayerIndex } = window.SpreatPlayers;

  function cloneFields(fields) {
    return fields.map((field) => ({ ...field }));
  }

  function createInitialState(boardSize, players, layout) {
    const board = createBoard(boardSize, layout);
    return {
      boardSize,
      layout: board.layout,
      players,
      currentPlayer: 0,
      fields: board.fields,
      moveCount: 0,
      winner: null,
      status: "ready",
    };
  }

  function canPlayOnField(state, fieldId, playerId = state.currentPlayer) {
    const field = getFieldById(state.fields, fieldId);
    if (!field || state.winner !== null) {
      return false;
    }

    return field.owner === null || field.owner === playerId;
  }

  function getExplodableFieldIds(state) {
    return state.fields
      .filter((field) => field.atomCount >= field.neighbors.length)
      .map((field) => field.id);
  }

  function explodeField(state, fieldId, playerId) {
    const fields = cloneFields(state.fields);
    const field = getFieldById(fields, fieldId);

    if (!field || field.atomCount < field.neighbors.length) {
      return { ...state, fields };
    }

    field.atomCount -= field.neighbors.length;
    if (field.atomCount === 0) {
      field.owner = null;
    } else {
      field.owner = playerId;
    }

    for (const neighborId of field.neighbors) {
      const neighbor = getFieldById(fields, neighborId);
      neighbor.atomCount += 1;
      neighbor.owner = playerId;
    }

    return { ...state, fields };
  }

  function resolveChainReactions(state, playerId = state.currentPlayer) {
    let nextState = {
      ...state,
      fields: cloneFields(state.fields),
    };
    let remaining = getExplodableFieldIds(nextState);
    let safety = 0;

    while (remaining.length > 0 && safety < 700) {
      safety += 1;
      nextState = explodeField(nextState, remaining[0], playerId);
      remaining = getExplodableFieldIds(nextState);
    }

    return nextState;
  }

  function buildMoveResult(state, fieldId) {
    if (!canPlayOnField(state, fieldId)) {
      return {
        state,
        steps: [],
      };
    }

    const fields = cloneFields(state.fields);
    const playerId = state.currentPlayer;
    const targetField = getFieldById(fields, fieldId);

    targetField.owner = playerId;
    targetField.atomCount += 1;

    let nextState = {
      ...state,
      fields,
      moveCount: state.moveCount + 1,
      status: "resolving",
    };
    const steps = [
      {
        ...nextState,
        fields: cloneFields(nextState.fields),
      },
    ];

    let remaining = getExplodableFieldIds(nextState);
    let safety = 0;

    while (remaining.length > 0 && safety < 700) {
      safety += 1;
      nextState = explodeField(nextState, remaining[0], playerId);
      steps.push({
        ...nextState,
        fields: cloneFields(nextState.fields),
      });
      remaining = getExplodableFieldIds(nextState);
    }

    const winner = getWinner(nextState);
    const finalState = {
      ...nextState,
      winner,
      currentPlayer:
        winner === null
          ? getNextPlayerIndex(state.players, state.currentPlayer)
          : state.currentPlayer,
      status: winner === null ? "ready" : "finished",
    };

    if (steps.length > 0) {
      steps[steps.length - 1] = {
        ...finalState,
        fields: cloneFields(finalState.fields),
      };
    }

    return {
      state: finalState,
      steps,
    };
  }

  function getWinner(state) {
    if (state.moveCount < state.players.length) {
      return null;
    }

    const activeOwners = new Set(
      state.fields
        .filter((field) => field.owner !== null && field.atomCount > 0)
        .map((field) => field.owner),
    );

    if (activeOwners.size !== 1) {
      return null;
    }

    const [winnerId] = activeOwners;
    return winnerId;
  }

  function applyMove(state, fieldId) {
    return buildMoveResult(state, fieldId).state;
  }

  window.SpreatRules = {
    createInitialState,
    canPlayOnField,
    getExplodableFieldIds,
    explodeField,
    resolveChainReactions,
    getWinner,
    buildMoveResult,
    applyMove,
  };
})();
