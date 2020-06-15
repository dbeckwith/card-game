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
   * Tell the server to start a new game. All players' hands, the board, and the deck will be reset.
   */
  new_game() {
    this._send('new_game', {});
  }

  /**
   * Draw a card and give it to the given target, which may be a player or the shared board. An error will be triggered if the deck is empty or the target player cannot be found.
   *
   * @param target: { type: 'player', player: string } | { type: 'board' } - The target to give the drawn card to. May be either a specific player or the shared board.
   */
  draw_card(target) {
    this._send('draw_card', { target });
  }

  /**
   * Remove the given card from a player's hand. Triggers an error if the player cannot be found or is not currently holding the card.
   *
   * @param player: string - The name of the player to take a card from.
   * @param card: string - The card identifier to take from the player.
   */
  trash_card(player, card) {
    this._send('trash_card', { player, card });
  }

  deal_all(down, up) {
    this._send('deal_all', { down, up });
  }
}
