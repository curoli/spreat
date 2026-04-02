const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function loadGameModules() {
  const context = vm.createContext({
    window: {},
    Math,
    console,
    setTimeout,
    clearTimeout,
  });

  const files = [
    "src/game/board.js",
    "src/game/players.js",
    "src/game/rules.js",
  ];

  for (const file of files) {
    const source = fs.readFileSync(path.join(__dirname, "..", file), "utf8");
    vm.runInContext(source, context, { filename: file });
  }

  return {
    board: context.window.SpreatBoard,
    players: context.window.SpreatPlayers,
    rules: context.window.SpreatRules,
  };
}

const { board, players, rules } = loadGameModules();

function createTestState(overrides = {}) {
  const boardSize = overrides.boardSize || 2;
  const state = rules.createInitialState(boardSize, players.createPlayers());

  return {
    ...state,
    currentPlayer: overrides.currentPlayer ?? state.currentPlayer,
    moveCount: overrides.moveCount ?? state.moveCount,
    winner: overrides.winner ?? state.winner,
    status: overrides.status ?? state.status,
  };
}

function findFieldId(state, ix, iy) {
  const field = state.fields.find(
    (candidate) => candidate.ix === ix && candidate.iy === iy,
  );
  assert.ok(field, `expected to find field at (${ix}, ${iy})`);
  return field.id;
}

function setField(state, fieldId, values) {
  return {
    ...state,
    fields: state.fields.map((field) =>
      field.id === fieldId ? { ...field, ...values } : { ...field },
    ),
  };
}

function getField(state, fieldId) {
  const field = board.getFieldById(state.fields, fieldId);
  assert.ok(field, `expected field ${fieldId} to exist`);
  return field;
}

test("applyMove claims an empty field and advances the turn", () => {
  const state = createTestState();
  const fieldId = findFieldId(state, 1, 1);

  const nextState = rules.applyMove(state, fieldId);
  const field = getField(nextState, fieldId);

  assert.equal(field.owner, 0);
  assert.equal(field.atomCount, 1);
  assert.equal(nextState.currentPlayer, 1);
  assert.equal(nextState.moveCount, 1);
});

test("applyMove allows a move on a field already owned by the current player", () => {
  let state = createTestState({ currentPlayer: 0, moveCount: 1 });
  const fieldId = findFieldId(state, 1, 1);
  const blockerFieldId = findFieldId(state, 4, 2);
  state = setField(state, fieldId, {
    owner: 0,
    atomCount: 1,
  });
  state = setField(state, blockerFieldId, {
    owner: 1,
    atomCount: 1,
  });

  const nextState = rules.applyMove(state, fieldId);
  const field = getField(nextState, fieldId);

  assert.equal(field.owner, 0);
  assert.equal(field.atomCount, 2);
  assert.equal(nextState.currentPlayer, 1);
  assert.equal(nextState.moveCount, 2);
});

test("applyMove rejects a move on an opposing field", () => {
  let state = createTestState();
  const fieldId = findFieldId(state, 1, 1);
  state = setField(state, fieldId, {
    owner: 1,
    atomCount: 2,
  });

  const nextState = rules.applyMove(state, fieldId);

  assert.deepEqual(nextState, state);
});

test("a critical field explodes and distributes atoms to its neighbours", () => {
  let state = createTestState({ currentPlayer: 0, moveCount: 2 });
  const sourceFieldId = findFieldId(state, 0, 2);
  const blockerFieldId = findFieldId(state, 4, 2);
  const sourceField = getField(state, sourceFieldId);

  state = setField(state, sourceFieldId, {
    owner: 0,
    atomCount: sourceField.neighbors.length - 1,
  });
  state = setField(state, blockerFieldId, {
    owner: 1,
    atomCount: 1,
  });

  const nextState = rules.applyMove(state, sourceFieldId);
  const explodedField = getField(nextState, sourceFieldId);

  assert.equal(explodedField.atomCount, 0);
  assert.equal(explodedField.owner, null);

  for (const neighbourId of sourceField.neighbors) {
    const neighbour = getField(nextState, neighbourId);
    assert.equal(neighbour.owner, 0);
    assert.equal(neighbour.atomCount, 1);
  }
});

test("buildMoveResult exposes multiple steps for a chain reaction", () => {
  let state = createTestState({ currentPlayer: 0, moveCount: 2 });
  const sourceFieldId = findFieldId(state, 0, 2);
  const targetFieldId = findFieldId(state, 0, 3);
  const followUpFieldId = findFieldId(state, 0, 4);
  const blockerFieldId = findFieldId(state, 4, 2);
  const sourceField = getField(state, sourceFieldId);
  const targetField = getField(state, targetFieldId);
  const followUpField = getField(state, followUpFieldId);

  state = setField(state, sourceFieldId, {
    owner: 0,
    atomCount: sourceField.neighbors.length - 1,
  });
  state = setField(state, targetFieldId, {
    owner: 1,
    atomCount: targetField.neighbors.length - 1,
  });
  state = setField(state, followUpFieldId, {
    owner: 0,
    atomCount: followUpField.neighbors.length - 1,
  });
  state = setField(state, blockerFieldId, {
    owner: 1,
    atomCount: 1,
  });

  const result = rules.buildMoveResult(state, sourceFieldId);

  assert.equal(result.steps.length, 4);
  assert.equal(getField(result.steps[1], sourceFieldId).atomCount, 0);
  assert.equal(
    getField(result.steps[1], targetFieldId).atomCount,
    targetField.neighbors.length,
  );
  assert.equal(getField(result.steps[2], targetFieldId).atomCount, 0);
  assert.equal(
    getField(result.steps[2], followUpFieldId).atomCount,
    followUpField.neighbors.length,
  );
  assert.equal(getField(result.steps[3], followUpFieldId).atomCount, 0);
});

test("chain reactions explode fields in the order they become critical", () => {
  let state = createTestState({ currentPlayer: 0, moveCount: 2 });
  const sourceFieldId = findFieldId(state, 0, 2);
  const firstTriggeredFieldId = findFieldId(state, 0, 3);
  const laterTriggeredFieldId = findFieldId(state, 0, 4);
  const blockerFieldId = findFieldId(state, 4, 2);
  const sourceField = getField(state, sourceFieldId);
  const firstTriggeredField = getField(state, firstTriggeredFieldId);
  const laterTriggeredField = getField(state, laterTriggeredFieldId);

  state = setField(state, sourceFieldId, {
    owner: 0,
    atomCount: sourceField.neighbors.length - 1,
  });
  state = setField(state, firstTriggeredFieldId, {
    owner: 1,
    atomCount: firstTriggeredField.neighbors.length - 1,
  });
  state = setField(state, laterTriggeredFieldId, {
    owner: 0,
    atomCount: laterTriggeredField.neighbors.length - 1,
  });
  state = setField(state, blockerFieldId, {
    owner: 1,
    atomCount: 1,
  });

  const result = rules.buildMoveResult(state, sourceFieldId);

  assert.equal(
    getField(result.steps[1], firstTriggeredFieldId).atomCount,
    firstTriggeredField.neighbors.length,
  );
  assert.equal(
    getField(result.steps[1], laterTriggeredFieldId).atomCount,
    laterTriggeredField.neighbors.length - 1,
  );
  assert.equal(getField(result.steps[2], firstTriggeredFieldId).atomCount, 0);
  assert.equal(
    getField(result.steps[2], laterTriggeredFieldId).atomCount,
    laterTriggeredField.neighbors.length,
  );
});

test("chain reactions stop once the active player has eliminated all opposing atoms", () => {
  let state = createTestState({ currentPlayer: 0, moveCount: 2 });
  const sourceFieldId = findFieldId(state, 0, 2);
  const targetFieldId = findFieldId(state, 0, 3);
  const followUpFieldId = findFieldId(state, 0, 4);
  const sourceField = getField(state, sourceFieldId);
  const targetField = getField(state, targetFieldId);
  const followUpField = getField(state, followUpFieldId);

  state = setField(state, sourceFieldId, {
    owner: 0,
    atomCount: sourceField.neighbors.length - 1,
  });
  state = setField(state, targetFieldId, {
    owner: 1,
    atomCount: targetField.neighbors.length - 1,
  });
  state = setField(state, followUpFieldId, {
    owner: 0,
    atomCount: followUpField.neighbors.length - 1,
  });

  const result = rules.buildMoveResult(state, sourceFieldId);

  assert.equal(result.steps.length, 2);
  assert.equal(
    getField(result.state, targetFieldId).atomCount,
    targetField.neighbors.length,
  );
  assert.equal(
    getField(result.state, followUpFieldId).atomCount,
    followUpField.neighbors.length - 1,
  );
  assert.equal(result.state.winner, 0);
});

test("getWinner returns the sole remaining owner after the opening phase", () => {
  let state = createTestState({ moveCount: 2 });
  const fieldAId = findFieldId(state, 0, 2);
  const fieldBId = findFieldId(state, 4, 2);

  state = setField(state, fieldAId, {
    owner: 0,
    atomCount: 1,
  });
  state = setField(state, fieldBId, {
    owner: 0,
    atomCount: 2,
  });

  assert.equal(rules.getWinner(state), 0);
});

test("getWinner returns null while multiple owners still have atoms", () => {
  let state = createTestState({ moveCount: 2 });
  const fieldAId = findFieldId(state, 0, 2);
  const fieldBId = findFieldId(state, 4, 2);

  state = setField(state, fieldAId, {
    owner: 0,
    atomCount: 1,
  });
  state = setField(state, fieldBId, {
    owner: 1,
    atomCount: 1,
  });

  assert.equal(rules.getWinner(state), null);
});

test("turn order skips eliminated players after the opening phase", () => {
  let state = rules.createInitialState(2, players.createPlayers(3));
  const moveFieldId = findFieldId(state, 1, 1);
  const blockerAId = findFieldId(state, 0, 2);
  const blockerBId = findFieldId(state, 4, 2);

  state = {
    ...state,
    currentPlayer: 0,
    moveCount: 3,
  };
  state = setField(state, blockerAId, {
    owner: 0,
    atomCount: 1,
  });
  state = setField(state, blockerBId, {
    owner: 2,
    atomCount: 1,
  });

  const nextState = rules.applyMove(state, moveFieldId);

  assert.equal(nextState.currentPlayer, 2);
});

test("players without atoms are not treated as eliminated during the opening phase", () => {
  let state = rules.createInitialState(2, players.createPlayers(3));
  const moveFieldId = findFieldId(state, 1, 1);
  const blockerFieldId = findFieldId(state, 4, 2);

  state = {
    ...state,
    currentPlayer: 0,
    moveCount: 1,
  };
  state = setField(state, blockerFieldId, {
    owner: 2,
    atomCount: 1,
  });

  const nextState = rules.applyMove(state, moveFieldId);

  assert.equal(nextState.currentPlayer, 1);
});

test("opening-phase reactions do not stop just because no opponent atoms exist yet", () => {
  let state = createTestState({ currentPlayer: 0, moveCount: 0 });
  const sourceFieldId = findFieldId(state, 0, 2);
  const targetFieldId = findFieldId(state, 0, 3);
  const sourceField = getField(state, sourceFieldId);
  const targetField = getField(state, targetFieldId);

  state = setField(state, sourceFieldId, {
    owner: 0,
    atomCount: sourceField.neighbors.length - 1,
  });
  state = setField(state, targetFieldId, {
    owner: 0,
    atomCount: targetField.neighbors.length - 1,
  });

  const result = rules.buildMoveResult(state, sourceFieldId);

  assert.ok(result.steps.length >= 3);
  assert.equal(result.state.winner, null);
});
