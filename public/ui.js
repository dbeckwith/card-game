let showing_login_screen = false;

export function render_ui({ game, game_state, current_player }) {
  const $app = $('#app');

  function setup_login_screen() {
    $app.empty();

    const $center = $('<center />');

    const $name_input = $('<input />');
    $name_input.css({
      width: '210px',
      height: '40px',
      fontSize: '20px',
    });

    const $login_button = $('<button />');
    $login_button.text('Login');
    $login_button.on('click', function() {
      const name = $name_input.val();
      game.login(name);
    });

    const $current_players = $('<div />', {
      id: 'current-players',
    });

    $center.append($name_input);
    $center.append('<br />');
    $center.append($login_button);
    $center.append('<br />');
    $center.append('<hr />');
    $center.append($current_players);
    $app.append($center);
  }

  function render_login_screen() {
    const $current_players = $('#current-players');
    const current_players = _.map(game_state.players, (player) => player.name);
    $current_players.text(`CURRENT PLAYERS: ${_.join(current_players, ', ')}`);
  }

  function setup_game_html() {
    $app.empty();

    const $header = $('<center />');

    const $logo_link = $('<a />', {
      href: '#',
    });
    $logo_link.on('click', function() {
      alert('CambridgePoker \u00a92020\nCredits:\nFront End: Anthony Beckwith\nBack End: Daniel Beckwith');
    });
    $logo_link.append('<img src="favicon/android-icon-36x36.png" style="margin-bottom: 10px;">');

    const $dealer_controls = $('<div />', {
      id: 'dealer-controls',
    });

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

    // TODO: always show this (not part of dealer controls)
    const $logout_button = $('<button />');
    $logout_button.text('Logout');
    $logout_button.on('click', function() {
      game.logout();
    });

    const $game_board = $('<div />', {
      id: 'game-board',
    });

    $dealer_controls.append($draw_button);
    $dealer_controls.append($deal_all_buttons);
    $dealer_controls.append($new_game_button);
    $dealer_controls.append($logout_button);

    const $player_controls = $('<div />', {
      id: 'player-controls',
    });

    const $fold_button = $('<button />', {
      id: 'fold-button',
    });
    $fold_button.text('Fold');
    $fold_button.on('click', function() {
      game.fold();
    });

    $player_controls.append($fold_button);

    $header.append($logo_link);
    $header.append('<br />');
    $header.append($dealer_controls);
    $header.append('<br />');
    $header.append($player_controls);

    $app.append($header);
    $app.append($game_board);
  }

  function render_game() {
    if ($('#game-board').length === 0) {
      setup_game_html();
    }

    if (game_state.dealer === current_player.id) {
      $('#dealer-controls').show();
    } else {
      $('#dealer-controls').hide();
    }

    if (current_player.in_hand) {
      $('#player-controls').show();
    } else {
      $('#player-controls').hide();
    }

    if (game_state.hand_started) {
      $('#fold-button').text('Fold');
    } else {
      $('#fold-button').text('Sit Out');
    }

    const $game_board = $('#game-board');
    $game_board.empty();

    const $player_seats = _.map(game_state.players, (player) => {
      const $player_seat = $('<div />');
      $player_seat.addClass('player-seat');
      if (player.connected) {
        $player_seat.addClass('player-connected');
      } else {
        $player_seat.addClass('player-disconnected');
      }

      const $player_name = $('<span />');
      $player_name.addClass('player-name');
      $player_name.text(player.name);

      const $active_player_indicator = $('<span />');
      $active_player_indicator.addClass('active-player-indicator');
      $active_player_indicator.text('*');
      if (game_state.active_player !== player.id) {
        $active_player_indicator.hide();
      }

      const $dealer_indicator = $('<span />');
      $dealer_indicator.addClass('dealer-indicator');
      $dealer_indicator.text('(D)');
      if (game_state.dealer !== player.id) {
        $dealer_indicator.hide();
      }

      const $kick_button = $('<button />');
      $kick_button.addClass('kick-button');
      $kick_button.text('Kick');
      $kick_button.on('click', function() {
        game.kick(player.id);
      });

      let $hand;
      if (player.in_hand) {
        $hand = _.map(player.hand, (card) => {
          let card_img_name;
          if (card.up || player.id === current_player.id) {
            card_img_name = card.card;
          } else {
            card_img_name = '2B';
          }

          const $card_img = $('<img />', {
            src: `card_images/${card_img_name}.svg`,
          });

          $card_img.addClass('card');
          if (!card.up && player.id === current_player.id) {
            $card_img.addClass('down-card');
          }

          return $card_img;
        });
      } else {
        $hand = [];
      }

      $player_seat.append($player_name);
      $player_seat.append($active_player_indicator);
      $player_seat.append($dealer_indicator);
      $player_seat.append($kick_button);
      $player_seat.append($hand);

      return $player_seat;
    });

    $game_board.append($player_seats);
  }

  if (current_player == null) {
    if (!showing_login_screen) {
      setup_login_screen();
      showing_login_screen = true;
    }
    render_login_screen();
  } else {
    showing_login_screen = false;
    render_game();
  }
}
