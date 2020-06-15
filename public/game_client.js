export class CardGame {
  constructor() {
    this.ws = new WebSocket(`ws://${window.location.host}/ws`);

    this.ws.onopen = (event) => {
      console.log('Connected to game server');
      this.on_connect?.();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'game_state': {
          const { game_state, current_player } = message;
          console.log('Game state update:', { game_state, current_player });
          this.on_update?.({ game_state, current_player });
          break;
        }
        case 'error': {
          const { error } = message;
          console.log(`Error from server: ${error}`)
          this.on_error?.(error);
          break;
        }
      }
    };

    this.ws.onclose = (event) => {
      const { wasClean, code, reason } = event;
      console.log('Connection to game server closed', { wasClean, code, reason });
      this.on_disconnect?.(reason);
    };

    this.ws.onerror = (error) => {
      console.log('WebSocket error', error.message);
    };
  }

  _send(command, args) {
    this.ws.send(JSON.stringify({ ...args, type: command }));
  }

  connect(player_id) {
    this._send('connect', { player_id });
  }

  /**
   * Join the session as a new player. You will be included in the next game.
   *
   * @param name: string - The display name of the player.
   */
  login(name) {
    this._send('login', { name });
  }

  /**
   * Join the session as a new player. You will be included in the next game.
   *
   * @param name: string - The display name of the player.
   */
  logout(name) {
    this._send('logout', {});
  }

  kick(player_id) {
    this._send('kick', { player_id });
  }

  /**
   * Tell the server to start a new game. All players' hands, the board, and the deck will be reset.
   */
  new_game() {
    this._send('new_game', {});
  }

  deal_all(down, up) {
    this._send('deal_all', { down, up });
  }
}
