import { CardGame } from './game_client.js';

$(() => {
  const game = new CardGame();
  const $app = $('#app');

  let current_player;

  game.on_update = (game_state) => {
    $app.empty();

    const $center = $('<center />');

    const $name_input = $('<input />', {
      class: 'name-input',
    });

    const $login_button = $('<button />', {
      class: 'login-button',
    });
    $login_button.text('Login');
    $login_button.on('click', function() {
      const name = $name_input.val();
      current_player = name;
      game.join(name);
    });

    const current_players = _.map(game_state.players, (player) => player.name);

    const $current_players = $('<div />');
    $current_players.text(`CURRENT PLAYERS: ${_.join(current_players, ', ')}`);

    $app.append($center);
    $center.append($name_input);
    $center.append('<br />');
    $center.append($login_button);
    $center.append('<br />');
    $center.append('<hr />');
    $center.append($current_players);
  };
});
