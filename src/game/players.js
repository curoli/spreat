(() => {
  const PLAYER_COLORS = [
    "yellow",
    "blue",
    "red",
    "green",
    "orange",
    "deeppink",
  ];
  const HUMAN_PLAYER_TYPE = "human";
  const COMPUTER_PLAYER_TYPE = "computer";

  function createPlayers(count = 2, playerTypes = []) {
    const safeCount = Math.max(2, Math.min(count, PLAYER_COLORS.length));
    const players = [];

    for (let index = 0; index < safeCount; index += 1) {
      players.push({
        id: index,
        color: PLAYER_COLORS[index],
        name: `Player ${index + 1}`,
        type:
          playerTypes[index] === COMPUTER_PLAYER_TYPE
            ? COMPUTER_PLAYER_TYPE
            : HUMAN_PLAYER_TYPE,
      });
    }

    return players;
  }

  function getNextPlayerIndex(players, currentPlayer) {
    return (currentPlayer + 1) % players.length;
  }

  window.SpreatPlayers = {
    COMPUTER_PLAYER_TYPE,
    HUMAN_PLAYER_TYPE,
    PLAYER_COLORS,
    createPlayers,
    getNextPlayerIndex,
  };
})();
