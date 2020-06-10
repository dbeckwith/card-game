let ws = new WebSocket("ws://localhost:8080/ws");

ws.onopen = function(e) {
  console.log('connected to game');
  ws.send(JSON.stringify({ type: 'login', username: 'daniel' }));
};

ws.onmessage = function(event) {
  console.log(JSON.parse(event.data));
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
