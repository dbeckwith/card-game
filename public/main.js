window.onload = function() {
  let ws = new WebSocket("ws://localhost:8080/ws");

  ws.onopen = function(e) {
    console.log('connected to game');
    ws.send(JSON.stringify({ type: 'join', name: 'Daniel' }));
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

  document.getElementById('givecard').onclick = function() {
    ws.send(JSON.stringify({ type: 'give_card', player: 'Daniel', card: '4S' }));
  }
}
