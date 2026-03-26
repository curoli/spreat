(() => {
  function createPlayers() {
    return [
      { id: 0, color: "yellow", name: "Player 1" },
      { id: 1, color: "blue", name: "Player 2" },
    ];
  }

  function getNextPlayerIndex(players, currentPlayer) {
    return (currentPlayer + 1) % players.length;
  }

  window.SpreatPlayers = {
    createPlayers,
    getNextPlayerIndex,
  };
})();
