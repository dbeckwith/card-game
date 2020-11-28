import {
   CardGame
} from './game_client.js';
import {
   render_ui
} from './ui.js';
import {
   generate_random_id
} from './util.js'

$(() => {
   const game = new CardGame();

   game.on_connect = () => {

      //testing:
      // const storage = window.sessionStorage; //a session is a single tab (or duplicate)

      //real game:
      const storage = window.localStorage; //a session is for the browser (so log back in same name)

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

   game.on_update = ({
      prev_game_state,
      game_state,
      current_player
   }) => {
      render_ui({
         game,
         prev_game_state,
         game_state,
         current_player
      });
   };
});