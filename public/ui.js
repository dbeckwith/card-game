// TODO: indicator for if in hand or not
// show cards as gray background

// TODO: reveal cards
// click on your down card to make it up

// TODO: pass deal to specific player

// TODO: button to take everyone's cards and shuffle without new game, but still shift dealer

// TODO: show errors

// TODO: common cards

// TODO: show number of remaining cards in deck

let showing_login_screen = false;

//SETS UP LOGIN SCREEN
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

  //SETS UP HTML - called by render_game
  function setup_game_html() {
    $app.empty();

    const $header = $('<center />');

    //LOGO:
    const $logo_link = $('<a />', {
      href: '#',
      id: 'logo',
    });
    $logo_link.on('click', function() {
      alert('CambridgePoker \u00a92020\nCredits:\nFront End: Anthony Beckwith\nBack End: Daniel Beckwith');
    });
    $logo_link.append('<img src="favicon/android-icon-36x36.png" style="margin-bottom: 10px;">');

    //Div for all dealer controls:
    const $dealer_controls = $('<div />', {
      id: 'dealer-controls',
    });

    const $draw_button = $('<button />', {
      id: 'draw-btn',
    });
    $draw_button.text('DRAW MODE');
    $draw_button.on('click', function() {
      // TODO: draw
    });

    const deal_all_up_down_numbers = [
      [5, 0],
      [2, 1],
      [0, 1],
      [1, 0],
    ];
      
    //CREATE ALL DEAL BUTTONS for dealer view:
    const $deal_all_buttons = _.map(deal_all_up_down_numbers, ([down, up]) => {
      const $deal_all_button = $('<button />');
      let label = '';
        
      //add text to buttons based on how many up or down:
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
      
      if (down == 0 && up == 1 || down == 5)
        $deal_all_button.attr('id', 'first-of-group'); //to add some left margin space
      
      if (down + up == 1)
        $deal_all_button.addClass('one-all-buttons');
      
      if (down == 5 || down + up == 3)
        $deal_all_button.addClass('opening-cards');  
      
      //bind to deal_all():
      $deal_all_button.on('click', function() {
        game.deal_all(down, up);
      });
      return $deal_all_button;
    });

    //NEXT UP BUTTON  - deals one card up to one player
    const $next_up_button = $('<button />');
    $next_up_button.text('Next UP');
    $next_up_button.on('click', function() {
      game.one_card(true);
    });
    $next_up_button.addClass('one-card-buttons');
    $next_up_button.attr('id', 'first-of-group'); //to add some left margin space
    
    //NEXT DOWN BUTTON  - deals one card up down to one player
    const $next_down_button = $('<button />');
    $next_down_button.text('Next DN');
    $next_down_button.on('click', function() {
      game.one_card(false);
    });
    $next_down_button.addClass('one-card-buttons');

    const $dealer_controls_bottom = $('<span />', {
      id: 'dealer-controls-bottom',
    });
    //change active player selector:
    const $change_active_player_select = $('<select />', {
      id: 'change-active-player-select',
    });
    $change_active_player_select.on('change', function() {
      const player = $(this).val();
      game.change_active_player(player);
    });

    //payout checkboxes:
    const $payout_button = $('<button />');
    $payout_button.text('Pay-out');
    $payout_button.attr('id', 'first-of-group'); //to add some left margin space

    $payout_button.on('click', function() {
      //get which players were checked:
      const winners = $('.winner-checkbox:checked').map(function() {
        return $(this).val();
      }).toArray();
      //pay all those that were checked:
      game.payout(winners);
    });

    //NEW GAME BUTTON:
    const $new_game_button = $('<button />');
    $new_game_button.text('New Game');
    $new_game_button.on('click', function() {
      game.new_game();
    });

    // TODO: always show this (not part of dealer controls)
    const $logout_button = $('<button />',{
      id:"logout-btn",
    });
    $logout_button.text('Logout');
    $logout_button.on('click', function() {
      game.logout();
    });

    const $game_board = $('<div />', {
      id: 'game-board',
    });
      
    //ADD ALL DEALER CONTROLS HTML TO PAGE:

    $dealer_controls.append($deal_all_buttons);
    $dealer_controls.append($next_up_button);
    $dealer_controls.append($next_down_button);
    $dealer_controls.append($draw_button);

    $dealer_controls_bottom.append('<span>Bettor: </span>');
    $dealer_controls_bottom.append($change_active_player_select);
    $dealer_controls_bottom.append($payout_button);
    $dealer_controls_bottom.append($new_game_button);
    $dealer_controls_bottom.append('<br /><hr style="margin-top:0px; margin-bottom:10px;"/>');

    const $common_info = $('<span />', {
      id: 'common-info',
    });

    // PLAYER CONTROLS:
    const $player_controls = $('<span />', {
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

    //BET BUTTON:
    const $bet_button = $('<button />', {
      id: 'bet-button',
    });
    $bet_button.text('Bet:');
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
    $player_controls.append($check_button);
    $player_controls.append($bet_button);
    $player_controls.append($bet_input);


    //PUT EVERYTHING INTO THE  HTML:
    $header.append($logo_link);
    $header.append($dealer_controls);
    $header.append($dealer_controls_bottom);
    $header.append($player_controls);
    $header.append($common_info);
    $header.append($logout_button);

    $header.append('<hr />');

    $app.append($header);
    $app.append($game_board);
  }

 
  function render_game() {
    if ($('#game-board').length === 0) {
      setup_game_html();
    }

    //SHOW CONTROLS TO CURRENT DEALER:
    if (game_state.dealer === current_player.id) {
      $('#dealer-controls').show();
      $('#dealer-controls-bottom').show();
      
    } else {
      $('#dealer-controls').hide();
      $('#dealer-controls-bottom').hide();
    }

    //show active players in the menu:
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

    const $pot_display = $('<span />',{
      id:"pot-display",
    });
    $pot_display.text(`POT: ${game_state.pot} chips`);

    const $last_bet_display = $('<span />');
    $last_bet_display.text(` Last Bet: ? chips`);
    
    $common_info.append($pot_display);
    $common_info.append($last_bet_display);

    //show or hide each player's hand:
    if (current_player.in_hand) {
      $('#player-controls').show();
    } else {
      $('#player-controls').hide();
    }

    $('#bet-input').prop('max', current_player.chips);

    //SHOW OR HIDE FOLD OR SIT-OUT BUTTONS:
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
      $active_player_indicator.text('>>');
      if (game_state.active_player !== player.id) {
        // TODO: do this with CSS
        $active_player_indicator.hide();
      }

      const $dealer_indicator = $('<span />');
      const $player_indicator = $('<span />');

      $dealer_indicator.addClass('dealer-indicator');
      $dealer_indicator.text('D ');
      if (game_state.dealer !== player.id) {
        $dealer_indicator.hide();
      }
      if(game_state.active_player !== player.id &&
         game_state.dealer != player.id) //everyone else gets a ..
        {
          $player_indicator.addClass('player-indicator');
          $player_indicator.text('..');
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

      //SHOW CARDS FOR EACH PLAYER (also determine up and down):
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

      //add all HTML to each player
      $player_seat.append($active_player_indicator);

      $player_seat.append($dealer_indicator);
      $player_seat.append($player_indicator);
      $player_seat.append($player_name);
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
  //DETERIMES WHETHER TO SHOW LOGIN OR GAME BOARD:
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
