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
          console.log('Game state update:', { game_state, current_player });
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

  new_game(from_menu) {
    this._send('new_game', { from_menu });
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
 clear_hand(){
   this._send('clear_hand');
 }
  set_active_player(id){
    this._send('set_active_player', {id});
  }
  bet(amount) {
    this._send('bet', { amount });
  }
  call() {
    this._send('call');
  }
 
  pay_acey_ducey(){
    this._send('pay_acey_ducey');
  }
 acey_ducey_on(){
   this._send('acey_ducey_on');
 } 
  acey_ducey_off(){
   this._send('acey_ducey_off');
 }
  man_mouse_on(){
   this._send('man_mouse_on');
 } 
  man_mouse_off(){
   this._send('man_mouse_off');
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
  slide_on(){
    this._send('slide_on');
  }
   slide_off(){
    this._send('slide_off');
  }
  toggle_draw_mode() {
    this._send('toggle_draw_mode');
  }
  no_peek_mode_on(){
    this._send('no_peek_mode_on');
  }
  no_peek_mode_off(){
    this._send('no_peek_mode_off');
  }
  buy_in(amount) {
    this._send('buy_in', { amount });
  }
  reset_game(){
    this._send('reset_game');
  }
  five_card_on(){
    this._send('five_card_on');
  }
  five_card_off(){
    this._send('five_card_off');
  }
  pay_post(num){
    this._send('pay_post', { num });
  }
  reset_gertie(){
    this._send('reset_gertie');
  }
}
