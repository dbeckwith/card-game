export class CardGame {
  constructor() {
    const self = this;

    this.ws = new WebSocket(`ws://${window.location.host}/ws`);

    this.ws.onopen = (event) => {
      console.log('Connected to game server');
      self.on_connect?.();
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'game_state': {
          const { game_state } = message;
          console.log('Game state update:', game_state);
          self.on_update?.(game_state);
          break;
        }
        case 'error': {
          const { error } = message;
          console.log(`Error from server: ${error}`)
          self.on_error?.(error);
          break;
        }
      }
    };

    this.ws.onclose = (event) => {
      const { wasClean, code, reason } = event;
      console.log('Connection to game server closed', { wasClean, code, reason });
      self.on_disconnect?.(reason);
    };

    this.ws.onerror = (error) => {
      console.log('WebSocket error', error.message);
    };
  }

  _send(command, args) {
    this.ws.send(JSON.stringify({ ...args, type: command }));
  }

  /**
   * Join the session as a new player. You will be included in the next game.
   *
   * @param name: string - The display name of the player.
   */
  join(name) {
    this._send('join', { name });
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
}
