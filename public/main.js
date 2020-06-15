import { CardGame } from './game_client.js';
import { render_ui } from './ui.js';
import { generate_random_id } from './util.js'

$(() => {
  const game = new CardGame();

  game.on_connect = () => {
    const storage = window.sessionStorage;
    let player_id = storage.getItem('player_id');
    if (!player_id) {
      player_id = generate_random_id();
      storage.setItem('player_id', player_id);
    }
    game.connect(player_id);
    $('#connection-banner').hide();
  };

  game.on_disconnect = () => {
    $('#connection-banner').show();
  };

  game.on_update = ({ game_state, current_player }) => {
    render_ui({ game, game_state, current_player });
  };
});
