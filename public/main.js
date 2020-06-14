import { CardGame } from './game_client.js';

$(() => {
  const game = new CardGame();
  const $app = $('#app');

  let current_player;

  function render_login_screen(game_state) {
    $app.empty();

    const $center = $('<center />');

    const $name_input = $('<input />', {
      style: 'width: 210px; height: 40px; font-size: 20px;'
    });

    const $login_button = $('<button />');
    $login_button.text('Login');
    $login_button.on('click', function() {
      const name = $name_input.val();
      current_player = name;
      game.join(name);

      setup_game_html(game_state);
    });

    const current_players = _.map(game_state.players, (player) => player.name);

    const $current_players = $('<div />');
    $current_players.text(`CURRENT PLAYERS: ${_.join(current_players, ', ')}`);

    $center.append($name_input);
    $center.append('<br />');
    $center.append($login_button);
    $center.append('<br />');
    $center.append('<hr />');
    $center.append($current_players);
    $app.append($center);
  }

  function setup_game_html(game_state) {
    $app.empty();

    const $dealer_controls = $('<center />');

    const $logo_link = $('<a />', {
      href: '#',
    });
    $logo_link.on('click', function() {
      alert('CambridgePoker \u00a92020\nCredits:\nFront End: Anthony Beckwith\nBack End: Daniel Beckwith');
    });
    $logo_link.append('<img src="favicon/android-icon-36x36.png" style="margin-bottom: 10px;">');

    const $draw_button = $('<button />');
    $draw_button.text('DRAW');
    $draw_button.on('click', function() {
      // TODO: draw
    });

    const deal_all_up_down_numbers = [
      [5, 0],
      [2, 1],
      [0, 1],
      [1, 0],
    ];
    const $deal_all_buttons = _.map(deal_all_up_down_numbers, ([down, up]) => {
      const $deal_all_button = $('<button />');
      let label = '';
      if (down > 0) {
        label += `${down} DN`;
      }
      if (up > 0) {
        if (label) {
          label += ', ';
        }
        label += `${up} UP`;
      }
      $deal_all_button.text(label);
      $deal_all_button.on('click', function() {
        game.deal_all(down, up);
      });
      return $deal_all_button;
    });

    const $new_game_button = $('<button />');
    $new_game_button.text('New Game');
    $new_game_button.on('click', function() {
      game.new_game();
    });

    $dealer_controls.append($logo_link);
    $dealer_controls.append('<br />');
    $dealer_controls.append($draw_button);
    $dealer_controls.append($deal_all_buttons);
    $dealer_controls.append($new_game_button);

    const $game_board = $('<div />', {
      id: 'game_board',
    });

    $app.append($dealer_controls);
    $app.append($game_board);
  }

  function render_game(game_state) {
    const $game_board = $('#game_board');

    $game_board.empty();

    const $player_seats = _.map(game_state.players, (player) => {
      const $player_seat = $('<div />');
      $player_seat.text(player.name);

      const $hand = _.map(player.hand, (card) => {
        let card_img_name;
        if (card.up || player.name === current_player) {
          card_img_name = card.card;
        } else {
          card_img_name = '2B';
        }

        const $card_img = $('<img />', {
          src: `card_images/${card_img_name}.svg`,
        });

        $card_img.addClass('card');
        if (!card.up && player.name === current_player) {
          $card_img.addClass('down-card');
        }

        return $card_img;
      });

      $player_seat.append($hand);

      return $player_seat;
    });

    $game_board.append($player_seats);
  }

  game.on_update = (game_state) => {
    if (current_player == null) {
      render_login_screen(game_state);
    } else {
      render_game(game_state);
    }
  };
});
