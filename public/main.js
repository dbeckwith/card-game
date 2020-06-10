window.onload = function() {
  let playerName;

  const ws = new WebSocket(`ws://${window.location.host}/ws`);

  ws.onopen = function(e) {
    console.log('connected to game');
  };

  ws.onmessage = function(event) {
    const message = JSON.parse(event.data);
    switch (message.type) {
      case 'game_state': {
        const { game_state: gameState } = message;
        console.log('game state:', gameState);
        document.getElementById('gamestate').value = JSON.stringify(gameState, null, 2);
        break;
      }
      case 'error': {
        const { error } = message;
        console.log('ERROR:', error);
        document.getElementById('error').textContent = `error: ${error}`;
        break;
      }
    }
  };

  ws.onclose = function(event) {
    if (event.wasClean) {
      console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
      console.log('[close] Connection died');
    }
  };

  ws.onerror = function(error) {
    console.log(`[error] ${error.message}`);
  };

  document.getElementById('joinbtn').onclick = function() {
    playerName = document.getElementById('nameinput').value;
    ws.send(JSON.stringify({ type: 'join', name: playerName }));
  }

  document.getElementById('givecard').onclick = function() {
    ws.send(JSON.stringify({ type: 'give_card', player: playerName, card: '4S' }));
  }
}
