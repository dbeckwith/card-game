// TODO: indicator for if in hand or not
// show cards as gray background

// TODO: reveal cards
// click on your down card to make it up

// TODO: pass deal to specific player

// TODO: button to take everyone's cards and shuffle without new game, but still shift dealer

// TODO: show errors

// TODO: common cards

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

    const $change_active_player_select = $('<select />', {
      id: 'change-active-player-select',
    });
    $change_active_player_select.on('change', function() {
      const player = $(this).val();
      game.change_active_player(player);
    });

    const $payout_button = $('<button />');
    $payout_button.text('Pay-out');
    $payout_button.on('click', function() {
      const winners = $('.winner-checkbox:checked').map(function() {
        return $(this).val();
      }).toArray();
      game.payout(winners);
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
    $dealer_controls.append('<span>Bettor: </span>');
    $dealer_controls.append($change_active_player_select);
    $dealer_controls.append($payout_button);
    $dealer_controls.append($new_game_button);
    $dealer_controls.append($logout_button);

    const $common_info = $('<div />', {
      id: 'common-info',
    });

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

    const $bet_input = $('<input />', {
      id: 'bet-input',
      type: 'number',
      min: 0,
    });

    const $bet_button = $('<button />', {
      id: 'bet-button',
    });
    $bet_button.text('Bet');
    $bet_button.on('click', function() {
      const amount = +$bet_input.val();
      game.bet(amount);
      $bet_input.val('');
    });

    const $check_button = $('<button />', {
      id: 'check-button',
    });
    $check_button.text('Check');
    $check_button.on('click', function() {
      game.bet(0);
      $bet_input.val('');
    });

    $player_controls.append($fold_button);
    $player_controls.append($bet_input);
    $player_controls.append($bet_button);
    $player_controls.append($check_button);

    $header.append($logo_link);
    $header.append('<br />');
    $header.append($dealer_controls);
    $header.append('<br />');
    $header.append($common_info);
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

    const $change_active_player_select = $('#change-active-player-select');
    $change_active_player_select.empty();
    _.forEach(game_state.players, player => {
      if (player.in_hand) {
        const $player_option = $('<option />', {
          value: player.id,
        });
        $player_option.text(player.name);
        $player_option.prop('selected', game_state.active_player === player.id);
        $change_active_player_select.append($player_option);
      }
    });

    const $common_info = $('#common-info');
    $common_info.empty();

    const $pot_display = $('<span />');
    $pot_display.text(`POT: ${game_state.pot} chips`);

    $common_info.append($pot_display);

    if (current_player.in_hand) {
      $('#player-controls').show();
    } else {
      $('#player-controls').hide();
    }

    $('#bet-input').prop('max', current_player.chips);

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
        // TODO: do this with CSS
        $active_player_indicator.hide();
      }

      const $dealer_indicator = $('<span />');
      $dealer_indicator.addClass('dealer-indicator');
      $dealer_indicator.text('(D)');
      if (game_state.dealer !== player.id) {
        $dealer_indicator.hide();
      }

      const $chips_display = $('<span />');
      $chips_display.addClass('chips-display');
      $chips_display.text(`${player.chips} chips`);

      const $winner_checkbox = $('<input />', {
        id: `winner-checkbox-${player.id}`,
        type: 'checkbox',
        value: player.id,
      });
      $winner_checkbox.addClass('winner-checkbox');

      const $winner_checkbox_label = $('<label />', {
        for: `winner-checkbox-${player.id}`,
      });
      $winner_checkbox_label.text('Won');

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
      $player_seat.append($chips_display);
      if (game_state.dealer === current_player.id) {
        $player_seat.append($winner_checkbox);
        $player_seat.append($winner_checkbox_label);
      }
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
