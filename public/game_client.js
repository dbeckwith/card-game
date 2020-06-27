export class CardGame {
  constructor() {
    this._reconnect();
  }

  _reconnect() {
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
//          console.log('Game state update:', { game_state, current_player });
          this.on_update?.({ game_state, current_player });
          break;
        }
        case 'error': {
          const { error } = message;
          console.log(`Error from server: ${error}`)
          alert(error);
          this.on_error?.(error);
          break;
        }
      }
    };

    this.ws.onclose = (event) => {
      const { wasClean, code, reason } = event;
      console.log('Connection to game server closed', { wasClean, code, reason });
      this.on_disconnect?.(reason);
      setTimeout(() => {
        this._reconnect();
      }, 1000);
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
  
  login(name) {
    this._send('login', { name });
  }
  new_back(){
    this._send('new_back');
  }
  logout(name) {
    this._send('logout');
  }

  kick(player_id) {
    this._send('kick', { player_id });
  }

  /**
   * Tell the server to start a new game. All players' hands, the board, and the deck will be reset.
   */
  new_game() {
    this._send('new_game');
  }

  deal_all(down, up) {
    this._send('deal_all', { down, up });
  }
  deal_common(){
    this._send('deal_common');
  }
  one_card(up){
    this._send('one_card', {up});
  }
  fold() {
    this._send('fold');
  }

  bet(amount) {
    this._send('bet', { amount });
  }

  payout(winners) {
    this._send('payout', { winners });
  }

  change_active_player(player) {
    this._send('change_active_player', { player });
  }
  ante(amt){
    this._send('ante', {amt});
  }
  flip(card_num) {
    this._send('flip', { card_num });
  }
 change_dealer(player){
   this._send('change_dealer', { player });
 }
  discard(card_num) {
    this._send('discard', { card_num });
  }
  increment_bettor_drawer(){
    this._send('increment_bettor_drawer');
}
  set_game_name(name) {
    this._send('set_game_name', { name });
  }

  toggle_draw_mode() {
    this._send('toggle_draw_mode');
  }

  buy_in(amount) {
    this._send('buy_in', { amount });
  }
}
