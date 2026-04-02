(() => {
  const PLAYER_COLORS = [
    "yellow",
    "blue",
    "red",
    "green",
    "orange",
    "deeppink",
  ];

  function createPlayers(count = 2) {
    const safeCount = Math.max(2, Math.min(count, PLAYER_COLORS.length));
    const players = [];

    for (let index = 0; index < safeCount; index += 1) {
      players.push({
        id: index,
        color: PLAYER_COLORS[index],
        name: `Player ${index + 1}`,
      });
    }

    return players;
  }

  function getNextPlayerIndex(players, currentPlayer) {
    return (currentPlayer + 1) % players.length;
  }

  window.SpreatPlayers = {
    PLAYER_COLORS,
    createPlayers,
    getNextPlayerIndex,
  };
})();
