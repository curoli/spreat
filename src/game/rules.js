(() => {
  const { createBoard, getFieldById } = window.SpreatBoard;

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

  function getPlayableFieldIds(state, playerId = state.currentPlayer) {
    return state.fields
      .filter((field) => canPlayOnField(state, field.id, playerId))
      .map((field) => field.id);
  }

  function isExplodable(fields, fieldId) {
    const field = getFieldById(fields, fieldId);
    return !!field && field.atomCount >= field.neighbors.length;
  }

  function enqueueIfExplodable(queue, queuedFieldIds, fields, fieldId) {
    if (!queuedFieldIds[fieldId] && isExplodable(fields, fieldId)) {
      queue.push(fieldId);
      queuedFieldIds[fieldId] = true;
    }
  }

  function hasOpposingAtoms(state, playerId) {
    return state.fields.some(
      (field) =>
        field.owner !== null && field.owner !== playerId && field.atomCount > 0,
    );
  }

  function hasPlayerAtoms(state, playerId) {
    return state.fields.some(
      (field) => field.owner === playerId && field.atomCount > 0,
    );
  }

  function isPlayerEliminated(state, playerId) {
    if (state.moveCount < state.players.length) {
      return false;
    }

    return !hasPlayerAtoms(state, playerId);
  }

  function getNextActivePlayerIndex(state, currentPlayer) {
    for (let offset = 1; offset <= state.players.length; offset += 1) {
      const nextPlayer = (currentPlayer + offset) % state.players.length;
      if (!isPlayerEliminated(state, nextPlayer)) {
        return nextPlayer;
      }
    }

    return currentPlayer;
  }

  function shouldStopChainReaction(state, playerId) {
    if (state.moveCount < state.players.length) {
      return false;
    }

    return !hasOpposingAtoms(state, playerId);
  }

  function explodeField(state, fieldId, playerId) {
    const fields = cloneFields(state.fields);
    const field = getFieldById(fields, fieldId);

    if (!field || field.atomCount < field.neighbors.length) {
      return {
        state: { ...state, fields },
        affectedFieldIds: [],
      };
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

    return {
      state: { ...state, fields },
      affectedFieldIds: [...field.neighbors, fieldId],
    };
  }

  function resolveChainReactions(state, playerId = state.currentPlayer) {
    let nextState = {
      ...state,
      fields: cloneFields(state.fields),
    };
    const queue = [];
    const queuedFieldIds = {};
    let safety = 0;

    for (const fieldId of getExplodableFieldIds(nextState)) {
      enqueueIfExplodable(queue, queuedFieldIds, nextState.fields, fieldId);
    }

    while (queue.length > 0 && safety < 700) {
      if (shouldStopChainReaction(nextState, playerId)) {
        break;
      }

      safety += 1;
      const fieldId = queue.shift();
      queuedFieldIds[fieldId] = false;

      if (!isExplodable(nextState.fields, fieldId)) {
        continue;
      }

      const result = explodeField(nextState, fieldId, playerId);
      nextState = result.state;

      for (const affectedFieldId of result.affectedFieldIds) {
        enqueueIfExplodable(
          queue,
          queuedFieldIds,
          nextState.fields,
          affectedFieldId,
        );
      }
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

    const queue = [];
    const queuedFieldIds = {};
    let safety = 0;

    for (const explodableFieldId of getExplodableFieldIds(nextState)) {
      enqueueIfExplodable(
        queue,
        queuedFieldIds,
        nextState.fields,
        explodableFieldId,
      );
    }

    while (queue.length > 0 && safety < 700) {
      if (shouldStopChainReaction(nextState, playerId)) {
        break;
      }

      safety += 1;
      const explodingFieldId = queue.shift();
      queuedFieldIds[explodingFieldId] = false;

      if (!isExplodable(nextState.fields, explodingFieldId)) {
        continue;
      }

      const result = explodeField(nextState, explodingFieldId, playerId);
      nextState = result.state;
      steps.push({
        ...nextState,
        fields: cloneFields(nextState.fields),
      });

      for (const affectedFieldId of result.affectedFieldIds) {
        enqueueIfExplodable(
          queue,
          queuedFieldIds,
          nextState.fields,
          affectedFieldId,
        );
      }
    }

    const winner = getWinner(nextState);
    const finalState = {
      ...nextState,
      winner,
      currentPlayer:
        winner === null
          ? getNextActivePlayerIndex(nextState, state.currentPlayer)
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
    getPlayableFieldIds,
    getNextActivePlayerIndex,
    hasPlayerAtoms,
    isPlayerEliminated,
    explodeField,
    resolveChainReactions,
    getWinner,
    buildMoveResult,
    applyMove,
  };
})();
