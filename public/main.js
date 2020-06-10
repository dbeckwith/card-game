let ws = new WebSocket("ws://localhost:8080/ws");

ws.onopen = function(e) {
  console.log('connected to game');
  ws.send(JSON.stringify({ type: 'join', name: 'Daniel' }));
};

ws.onmessage = function(event) {
  const gameState = JSON.parse(event.data);
  console.log('game state:', gameState);
  document.getElementById('gamestate').value = JSON.stringify(gameState, null, 2);
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
