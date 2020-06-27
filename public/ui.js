// TODO: indicator for if in hand or not
// show cards as gray background

// TODO: pass deal to specific player

// TODO: button to take everyone's cards and shuffle without new game, but still shift dealer
// TODO: show errors
// TODO: show number of remaining cards in deck

let showing_login_screen = false;
//let $back_num = 9;
function formatChips(chips)
{
  return (chips * 0.25).toFixed(2);
}

/****************************
 * SETS UP LOGIN SCREEN
 ***************************/
export function render_ui(
{
  game,
  game_state,
  current_player
})
{
  const $app = $('#app');

  function setup_login_screen()
  {
    $app.empty();

    const $center = $('<center />');

    const $name_input = $('<input />');
    $name_input.css(
    {
      width: '210px',
      height: '40px',
      fontSize: '20px',
    });

    const $login_button = $('<button />');
    $login_button.text('Login');
    $login_button.on('click', function ()
    {
      const name = $name_input.val();
      game.login(name);
    });

    const $current_players = $('<div />',
    {
      id: 'current-players',
    });

    //TO-DO: deal a hand of five random cards:
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
    const suits = ['C', 'M', 'H', 'S'];
    let chosen = "";
    const $five_cards = $('<div />');
    for (let i = 0; i < 5; i++)
    {
      let card_val = "";
      while (chosen.indexOf(card_val) != -1)
      {
        const v = values[Math.floor(Math.random() * values.length)]
        const s = suits[Math.floor(Math.random() * suits.length)]
        card_val = v + s;
      }
      chosen += card_val;
      const $card_img = $('<img />',
      {
        src: `card_images/${card_val}.svg`,
      });
      $card_img.addClass('login-cards');
      $five_cards.append($card_img)
    }



    $center.append($name_input);
    $center.append('<br />');
    $center.append($login_button);
    $center.append('<br />');
    $center.append('<hr />');
    $center.append($current_players);
    $center.append($five_cards);
    $app.append($center);
  }

  function render_login_screen()
  {
    const $current_players = $('#current-players');
    const current_players = _.map(game_state.players, (player) => player.name);
    $current_players.text(`CURRENT PLAYERS: ${_.join(current_players, ', ')}`);
  }

  /*********************************
   * INITIAL SETUP of game screen
   * called by render_game
   ***********************************/
  function setup_game_html()
  {

    //KEYBOARD SHORTCUTS:

    //player: f/102 = fold, b/98 = bet,  c/99 = call, K/107 = check, 1-6 (49-54) bets,
    //dealer: u/117 = next up, d/100 = next down, n/110 = next better/drawer

    $(document).keypress(function (e)
    {
      const key = e.which;
      if (!showing_login_screen)
      {
        //fold - f, or out - o when in man-mouse mode
        if (key == 102 || (key == 111 && game_state.game_name !== "Man-Mouse"))
          game.fold();
        else if (key == 107)
        { //CHECK - k
          game.bet(0);
          $bet_input.val('');
        }
        //        else if(key >= 49 && key <= 54){ //1-6
        //          game.bet(key - 48);
        //        }
        else if (key == 110)
        { //next bettor - n
          if (game_state.dealer === current_player.id)
            game.increment_bettor_drawer();
        }
        else if (key == 99)
        { //call - c
          document.getElementById("call-button").click();
        }
        //        else if(key == 97) //ante - a
        //            game.ante();
      }
    });

    $app.empty();

    const $header = $('<center />');

    //LOGO:
    const $logo_link = $('<a />',
    {
      href: '#',
      id: 'logo',
    });
    $logo_link.on('click', function ()
    {
      alert('CambridgePoker \u00a92020\nCredits:\nFront End: Anthony Beckwith\nBack End: Daniel Beckwith');
    });
    $logo_link.append('<img src="favicon/android-icon-36x36.png" style="margin-bottom: 10px;">');

    //Div for all dealer controls:
    const $dealer_controls = $('<div />',
    {
      id: 'dealer-controls',
    });

    const $cards_left = $('<span />',
    {
      id: "cards-left",
    });

    const $all_label = $('<span />',
    {
      id: "all-label",
    });

    $all_label.text("ALL:");

    /*************************
     * ALL DEALER BUTTONS
     ************************/

    //create buttons:
    const $deal_all_buttons = $('<span \>');

    const $five_down_button = $('<button />',
    {
      title: 'Deals 5 down cards to every player simultaneously',
      className: 'opening-cards',
    });
    const $two_down_one_up_button = $('<button />',
    {
      title: 'Deals 2 down and 1 up card to every player simultaneously',
      className: 'opening-cards',
    });
    const $one_up_button = $('<button />',
    {
      title: 'Deals 1 up card to every player simultaneously',
      className: 'one-all-buttons',
    });
    const $one_down_button = $('<button />',
    {
      title: 'Deals 1 down card to every player simultaneously',
      className: 'one-all-buttons',
    });

    //add function:
    $five_down_button.on('click', function ()
    {
      game.deal_all(5, 0);
    });
    $two_down_one_up_button.on('click', function ()
    {
      game.deal_all(2, 1);
    });
    $one_up_button.on('click', function ()
    {
      game.deal_all(0, 1);
    });
    $one_down_button.on('click', function ()
    {
      game.deal_all(1, 0);
    });

    //set text:
    $five_down_button.text('5DN');
    $two_down_one_up_button.text('2DN/1UP');
    $one_up_button.text('1UP');
    $one_down_button.text('1DN');

    //add:
    $deal_all_buttons.append($five_down_button);
    $deal_all_buttons.append($two_down_one_up_button);
    $deal_all_buttons.append($one_up_button);
    $deal_all_buttons.append($one_down_button);

    //DEAL TO NEXT PLAYER BUTTONS:
    const $next_label = $('<span />',
    {
      id: "next-label",
    });
    $next_label.text("NEXT:");

    //NEXT UP BUTTON  - deals one card up to one player
    const $next_up_button = $('<button />',
    {
      title: 'Deals one card to the next player in line (they have an box around their hand)'
    });
    $next_up_button.text('UP');
    $next_up_button.on('click', function ()
    {
      game.one_card(true);
    });
    $next_up_button.addClass('one-card-buttons');
    $next_up_button.attr('id', 'first-of-group'); //to add some left margin space

    //NEXT DOWN BUTTON  - deals one card down to one player
    const $next_down_button = $('<button />',
    {
      title: 'Deals one card to the next player in line (they have an box around their hand)'
    });
    $next_down_button.text('DN');
    $next_down_button.on('click', function ()
    {
      game.one_card(false);
    });
    $next_down_button.addClass('one-card-buttons');

    const $dealer_controls_bottom = $('<span />',
    {
      id: 'dealer-controls-bottom',
    });

    //COMMON BUTTON  - deals one card up for all players
    const $common_button = $('<button />',
    {
      id: 'common-button',
      title: 'Deals 1 common card to center of table',
    });
    $common_button.text('COMMON (up)');
    $common_button.on('click', function ()
    {
      game.deal_common();
    });


    //DRAW MODE button:
    const $draw_button = $('<button />',
    {
      id: 'draw-btn',
      title: 'When draw mode is on, clicking on a card will remove it from players hand\n\n' +
        'Also, dealing a card will not increment to next player',
    });
    $draw_button.on('click', function ()
    {
      //outline button to show toggle happened
      //set draw_mode in game_state
      game.toggle_draw_mode();
    });

    const $increment_active_bettor_drawer_button = $('<button />',
    {
      id: 'increment-active-bettor-drawer-button',
      title: 'Moves to the next player for both betting and getting a card dealt to them',
    });
    $increment_active_bettor_drawer_button.text("Next Bettor");
    $increment_active_bettor_drawer_button.on('click', function ()
    {
      game.increment_bettor_drawer();
    });

    //SELECTOR FOR WINNERS/Payout:
    const $winners_select = $(`
      <div id="winners-select">
        <div id="winners-select-box">
          <select id="winners-select-select">
            <option>Select Winners</option>
          </select>
          <div id="winners-select-over-select"></div>
        </div>
        <div id="winners-select-content">
        </div>
      </div>
    `);
    $winners_select.children().first().on('click', function ()
    {
      $('#winners-select-content').toggle();
    });
    $(document).on('click', function (event)
    {
      const $target = $(event.target);
      const is_over_select = $target.prop('id') === 'winners-select-over-select' ||
        $.contains($('#winners-select-content')[0], $target[0]);
      if (!is_over_select)
      {
        $('#winners-select-content').hide();
      }
    });

    //SELECTOR FOR Dealer:
    const $dealer_select = $(`<select />`,
    {
      id: 'dealer-select',
    });
    $dealer_select.on('change', function ()
    {
      const dealer = $(this).val();
      game.change_dealer(dealer);
    });


    //PAYOUT BUTTON:
    const $payout_button = $('<button />',
    {
      id: 'payout-button',
      title: 'Splits the pot between all winners selected in winner menu\n\n' +
        'If uneven split, gives extra to player with least chips',
    });
    $payout_button.text('Pay-out');

    $payout_button.on('click', function ()
    {
      //get which players were checked:
      const winners = $('#winners-select-content input:checked')
        .map(function ()
        {
          return $(this).prop('id').slice('winners-select-player-'.length);
        })
        .toArray();
      //pay all those that were checked:
      game.payout(winners);
    });

    //NEW GAME BUTTON:
    const $new_game_button = $('<button />',
    {
      id: 'new-game-button',
      title: 'Reshuffles deck, moves dealer, ready for new game to be dealt\n\n' +
        'Pot must be zero (game not started or payout happened) to start new game',
    });
    $new_game_button.text('New Game');
    $new_game_button.on('click', function ()
    {
      game.new_game();
    });

    //change card backing button:
    const $new_back_button = $('<button />',
    {
      id: 'new-back-button',
      title: 'picks randomly from card backs',
    });
    $new_back_button.text('Backs');
    $new_back_button.on('click', function ()
    {
      game.new_back();
    });
    
        //reset game button:
    const $reset_game_button = $('<button />',
    {
      id: 'reset-game-button',
      title: 'resets game - shuffles, gives back money, but same dealer',
    });
    $reset_game_button.text('RESET Game');
    $reset_game_button.on('click', function ()
    {
      game.reset_game();
    });

    //GAME SELECTOR setup: shows which game is being played
    const $games = new Array('7-Card Stud',
      '5-Card Draw',
      'Jacks or Better',
      '5-Card Stud',
      '',
      'Chicago Hi-Lo',
      'Woolworths',
      'Midnight Baseball',
      'Follow the Queen',
      'Gay Bar',
      'Dirty Gertie',
      '',
      'Texas Hold-Em',
      'Criss-Cross',
      '',
      'Acey-Ducey',
      'Man-Mouse',
      'Other');


    //set game selector to show name of game on screen:
    const $set_game_select = $('<select />',
    {
      id: 'set-game-select',
    });

    $set_game_select.empty();

    $set_game_select.on('change', function ()
    {
      game.set_game_name($(this).val());
    });

    for (let i = 0; i < $games.length; i++)
    {
      const $a_game = $('<option />',
      {
        value: $games[i],
      });
      $a_game.text($games[i]);
      $a_game.prop('selected', game_state.game_name == $games[i]);
      $set_game_select.append($a_game);
    }


    /*******************************************
     * ADD ALL DEALER CONTROLS HTML TO PAGE:
     *******************************************/

    $dealer_controls.append($cards_left);
    $dealer_controls.append($all_label);
    //deal buttons:
    $dealer_controls.append($deal_all_buttons);
    $dealer_controls.append($next_label);

    $dealer_controls.append($next_up_button);
    $dealer_controls.append($next_down_button);
    $dealer_controls.append($common_button);
    $dealer_controls.append($draw_button);

    //bettor selector:
    //    $dealer_controls_bottom.append('<span>Set Next Bettor: </span>');
    //    $dealer_controls_bottom.append($change_active_player_select);
    $dealer_controls_bottom.append($increment_active_bettor_drawer_button);
    //payout button and selector:
    $dealer_controls_bottom.append($payout_button);
    $dealer_controls_bottom.append($winners_select);
    $dealer_controls_bottom.append($dealer_select);

    //new game button & game selector:
    $dealer_controls_bottom.append('<span style="margin-left:15px;">Game: </span>');
    $dealer_controls_bottom.append($set_game_select);
    $dealer_controls_bottom.append($new_game_button);
    $dealer_controls_bottom.append($new_back_button);
    $dealer_controls_bottom.append($reset_game_button);

    //horizontal rule:
    $dealer_controls_bottom.append('<br /><hr style="margin-top:0px; margin-bottom:10px;"/>');


    /*****************************
     * PLAYER CONTROLS
     *****************************/

    //THE WHOLE FIELD OF PLAYERS WITH INFO AND CARDS:
    const $game_board = $('<div />',
    {
      id: 'game-board',
    });

    //LOG OUT button:
    const $logout_button = $('<button />',
    {
      id: "logout-btn",
    });
    $logout_button.text('LOGOUT');
    $logout_button.on('click', function ()
    {
      game.logout();
    });

    //CHECK BUTTON:
    const $check_button = $('<button />',
    {
      id: 'check-button',
      title: 'To pass the bet (assuming you are not light any amount)'
    });
    //    if(game_state.game_name !== "Man-Mouse")
    $check_button.text('Chec(k)');
    //    else
    //      $check_button.text('In(i)');

    $check_button.on('click', function ()
    {
      //if not light any amount, you can check:
      if (_.max(_.map(game_state.players, 'chips_in')) - current_player.chips_in == 0 ||
        game_state.game_name === "Man-Mouse")
      {
        game.bet(0);
        $bet_input.val('');
      }
      else
        alert("You must match the amount you are shy or fold!")
    });

    //CALL BUTTON
    const $call_button = $('<button />',
    {
      id: 'call-button',
      title: 'Call the current bet amount (your "shy" amount)'
    });
    $call_button.text('(C)all');
    $call_button.on('click', function ()
    {
      game.call();
    });

    //ANTE BUTTON
    const $ante_button = $('<button />',
    {
      id: "ante-btn",
      title: "Ante 1 chip"
    });
    $ante_button.text('Ante-1');
    $ante_button.on('click', function ()
    {
      if ($ante_input.val().length !== 0)
        game.ante($ante_input.val());
      else
        game.ante(1);
    });


    //ANTE AMOUNT INPUT FIELD:
    const $ante_input = $('<input />',
    {
      id: 'ante-input',
      type: 'number',
      min: 0,
    });
    $ante_button.on('click', function ()
    {
      if ($bet_input.val() > 0)
      {
        const amount = +$bet_input.val();
        game.bet(amount);
        $bet_input.val('');
      }
    });

    //MENU for +$10, logout, reset game

    //set game selector to show name of game on screen:
    const $other_select = $('<select />',
    {
      id: 'other-select',
    });

    $other_select.empty();
    $other_select.append('<option selected disabled value="prompt">Action:</option>')
    $other_select.on('change', function ()
    {
      switch ($(this).val())
      {
        case 'buy-in':
          game.buy_in(40);
          break;
        case 'log-out':
          game.logout();
          break;
      }
      $(this).val('prompt');
    });

    var other_functions = [
      ['Buy-In $10', 'buy-in'],
      ['Log Out', 'log-out'],
      ['Reset Game (explanation)', 'reset-game'],
    ];

    _.forEach(other_functions, ([label, id]) =>
    {
      const $a_function = $('<option />',
      {
        value: id,
      });
      $a_function.text(label);
      $other_select.append($a_function);
    });
    //BUY-IN 10 CHIPS BUTTON:
    const $buy_10_button = $('<button />',
    {
      id: "buy-10-btn",
      title: "Buy-in to the game for $10 more"
    });
    $buy_10_button.text('+$10');
    $buy_10_button.on('click', function ()
    {
      game.buy_in(40);
    });

    //GAME NAME DISPLAY:
    const $game_name_display = $('<span />',
    {
      id: 'game-name-display',
    });

    const $common_info = $('<span />',
    {
      id: 'common-info',
    });

    // SET UP ALL PLAYER CONTROLS:
    const $player_controls = $('<span />',
    {
      id: 'player-controls',
    });

    //FOLD BUTTON:
    const $fold_button = $('<button />',
    {
      id: 'fold-button',
      title: 'Fold.  Your cards will disappear',
    });
    //    if(game_state.game_name !== "Man-Mouse")
    $fold_button.text('Fold(F)');
    //    else
    //      $fold_button.text('Out(o)');

    $fold_button.on('click', function ()
    {
      game.fold();
    });

    //BET AMOUNT INPUT FIELD:
    const $bet_input = $('<input />',
    {
      id: 'bet-input',
      type: 'number',
      min: 1,
    });

    //BET BUTTON:
    const $bet_button = $('<button />',
    {
      id: 'bet-button',
      title: 'Bet the amount you\'ve typed in the box',
    });
    $bet_button.text('Bet');
    $bet_button.on('click', function ()
    {
      if ($bet_input.val() > 0)
      {
        const amount = +$bet_input.val();
        game.bet(amount);
        $bet_input.val('');
      }
    });

    //BET BUTTONS 1-6:
    const $bet_buttons = $('<span />');

    for (let i = 1; i <= 6; i++)
    {
      const $bet_button_num = $('<button />',
      {
        class: 'bet-buttons',
        title: 'Bet this many chips',
      });
      $bet_button_num.text(i);
      $bet_button_num.on('click', function ()
      {
        const amount = +i;
        game.bet(i);
      });
      $bet_buttons.append($bet_button_num);
    }

    //DISPLAY AMOUNT EACH PLAYER HAS:
    const $player_money_display = $('<span />',
    {
      id: 'player-money-display',
    });

    /*******************************************
     * ADD ALL PLAYER CONTROLS HTML TO PAGE:
     *******************************************/
    $player_controls.append($player_money_display);

    $player_controls.append($fold_button);
    $player_controls.append($check_button);
    $player_controls.append($call_button);
    $player_controls.append($bet_button);
    $player_controls.append($bet_input);
    $player_controls.append($bet_buttons);
    $player_controls.append($ante_button);
    $player_controls.append($ante_input);


    /*******************************************
     * BUILD ENTIRE PAGE:
     *******************************************/
    $header.append('<hr \>');
    $header.append($logo_link);

    $header.append($dealer_controls);
    $header.append($dealer_controls_bottom);

    $header.append($player_controls);
    $header.append($common_info);

    $header.append($other_select);
    //    $header.append($buy_10_button);
    //    $header.append($logout_button);
    $header.append($game_name_display);

    $header.append('<hr />');

    $app.append($header);
    $app.append($game_board);
  }

  /*********************************
   * RENDER ALL COMPONENTS OF GAME
   ********************************/
  function render_game()
  {
    //if no players in game, call setup:
    if ($('#game-board').length === 0)
    {
      setup_game_html();
    }
    $("#cards-left").text(`${game_state.deck.length} cards left`);
    //    if(game_state.game_name !== "Man-Mouse")
    //      $check_button.text('Chec(k)');
    //    else
    //      $check_button.text('In(i)');
    //SHOW CONTROLS IN CURRENT DEALER's VIEW:
    if (game_state.dealer === current_player.id)
    {
      $('#dealer-controls').show();
      $('#dealer-controls-bottom').show();
    }
    else
    {
      $('#dealer-controls').hide();
      $('#dealer-controls-bottom').hide();
    }


    //show all active players in the winners select menu
    const $winners_select_content = $('#winners-select-content');
    $winners_select_content.empty();
    _.forEach(game_state.players, player =>
    {
      if (player.in_hand)
      {
        const $player_row = $('<label />',
        {
          for: `winners-select-player-${player.id}`,
        });

        const $player_input = $('<input />',
        {
          type: 'checkbox',
          id: `winners-select-player-${player.id}`,
        });

        $player_row.append($player_input);
        $player_row.append(player.name);

        $winners_select_content.append($player_row);
      }
    });

    //show all active players in the dealer select menu
    const $dealer_select = $('#dealer-select');
    $dealer_select.empty();
    $dealer_select.append('<option selected disabled>Select Dealer</option>');
    _.forEach(game_state.players, player =>
    {
      if (player.id !== current_player.id)
      {
        const $player_option = $('<option />',
        {
          value: player.id,
        });
        $player_option.text(player.name);
        $dealer_select.append($player_option);
      }
    });

    const $draw_button = $('#draw-btn');
    //make down cards outline in black to show discarding
    var downs = $(".down-card").children();
    downs.toggleClass("draw-ready");

    if (game_state.draw_mode)
    {
      $draw_button.css('background-color', 'red');
      $draw_button.text('DRAW MODE IS ON');
    }
    else
    {
      $draw_button.css('background-color', 'darkgreen');
      $draw_button.text('DRAW MODE IS OFF');
    }


    const $set_game_select = $('#set-game-select');
    $set_game_select.val(game_state.game_name);
    const $game_name_display = $('#game-name-display');
    $game_name_display.text(game_state.game_name);

    const $common_info = $('#common-info');
    $common_info.empty();

    //update pot display:
    const $pot_display = $('<span />',
    {
      id: "pot-display",
    });
    const $pot_display_pot = $('<span />');
    const $pot_display_last_bet = $('<span />');
    $pot_display_last_bet.addClass('pot-display-last-bet');
    //POT: amt (+last_bet_amt):
    $pot_display_pot.text(`POT $${formatChips(game_state.pot)}`);
    $pot_display_last_bet.text(`(+${formatChips(game_state.last_bet)})`);
    $pot_display.append($pot_display_pot);
    $pot_display.append($pot_display_last_bet);

    $common_info.append($pot_display);

    //show hand of all active players:
    if (current_player.in_hand)
    {
      $('#player-controls').show();
    }
    else
    {
      $('#player-controls').hide();
    }

    //set the max a player can bet to their chips:
    $('#bet-input').prop('max', current_player.chips);

    //sit-out/fold button depends on if game started:
    if (game_state.hand_started)
    {
      $('#fold-button').text('(F)old');
    }
    else
    {
      $('#fold-button').text('SitOut');
    }
    //update player's money amount:
    $('#player-money-display').text(`${current_player.name} $${formatChips(current_player.chips)}/${formatChips(current_player.buy_in)}`);

    //game board has all players:
    const $game_board = $('#game-board');
    $game_board.empty();

    /****************************
     * EACH PLAYER'S NAME/CARDS:
     ***************************/

    const $player_seats = $('<div />');
    $player_seats.addClass('player-seats');
    //CREATE EACH player BASED ON players in game_state
    _.forEach(game_state.players, (player) =>
    {
      const $player_seat = $('<div />');
      $player_seat.addClass('player-seat');

      if (player.connected)
      {
        $player_seat.addClass('player-connected');
      }
      else
      {
        $player_seat.addClass('player-disconnected');
      }
      //determine if this player is the dealer:
      if (game_state.dealer === player.id)
      {
        $player_seat.addClass('dealer');
      }
      if (game_state.active_player === player.id)
      {
        $player_seat.addClass('active-player');
      }

      //add name:
      const $player_name = $('<div />');
      $player_name.addClass('player-name');

    
 
      if (player.in_hand && player.anted)
        $player_name.append('•');
      $player_name.append(player.name);
      if (game_state.dealer === player.id)
        $player_name.append(".Dlr")
      if (game_state.active_player == player.id)
        $player_name.append(".Bet")
      //add row of chips (40 = $10 each chip)
      const $chip_stack_display = $('<div />');
      $chip_stack_display.addClass('chips-display');

      let chip_count = Math.round(player.chips / 40);
      if (player.chips > 0 && chip_count === 0)
        chip_count = 1;

      _.forEach(new Array(chip_count), () =>
      {
        $chip_stack_display.append('<img src="chips_images/chip.png" />');
      });


      //chips shy display:
      const $chips_shy = $('<div />');
      $chips_shy.addClass('chips-shy');

      let $chips_in_disp = _.max(_.map(game_state.players, 'chips_in')) - player.chips_in;
      //      $chips_in_disp = formatChips($chips_in_disp);

      //only show shy amount if not playing man-mouse and you are in the hand
      if (game_state.game_name !== "Man-Mouse" && player.in_hand)
        $chips_shy.text(`shy:${$chips_in_disp}`);
      else
        $chips_shy.text(' ');
      //button to kick if disconnected:
      const $kick_button = $('<button />');
      $kick_button.addClass('kick-button');
      $kick_button.text('Kick');
      $kick_button.on('click', function ()
      {
        game.kick(player.id);
      });

      //CARDS FOR EACH PLAYER (also determines up and down):
      const $hand = $('<div />');
      $hand.addClass('hand');

      if (player.in_hand)
      {
        _.forEach(player.hand, (card, idx) =>
        {
          //show card image or back of card:
          let card_img_name;

          var $up_with_down = $('<span />',
          {
            id: 'up-with-down',
          });



          //add down card - will be behind part of upcard, using z-index
          var $card_img2;
          if (!card.up && player.id === current_player.id)
          {
            card_img_name = '2B' + game_state.card_back_num;

            $card_img2 = $('<img />',
            {
              src: `card_images/${card_img_name}.svg`,
            });
            $card_img2.addClass('card');

            $card_img2.addClass('backing');

          }
          $up_with_down.append($card_img2);


          if (card.up || player.id === current_player.id)
            card_img_name = card.card;
          else
            card_img_name = '2B' + game_state.card_back_num;
          const $card_img = $('<img />',
          {
            src: `card_images/${card_img_name}.svg`,
          });
          $card_img.addClass('card');
          if (!card.up && player.id === current_player.id && game_state.draw_mode)
          {
            $card_img.addClass('draw-ready');
          }
          if (!card.up && player.id === current_player.id)
          {
            $card_img.addClass('down-card');
          }
          $up_with_down.append($card_img);




          //TODO: slide in animation
          //          let $card_dealt = true; //change this to depend on what just happened
          //          if(player.id === current_player.id && idx == player.hand.length - 1
          //            && $card_dealt)
          //            $card_img.addClass('last');
          //          else
          //            $card_img.removeClass('last');

          //allow player to click down card to make up:
          if (player.id === current_player.id)
          {
            $card_img.on('click', function ()
            {
              if (game_state.draw_mode)
                game.discard(idx);
              else
                game.flip(idx);
            });
         
          }


          $hand.append($up_with_down);
        });
      }

      //add all HTML to each player
      $player_name.append($kick_button);

      $player_seat.append($player_name);
      $player_seat.append($chips_shy);
      $player_seat.append($chip_stack_display);
      $player_seat.append($hand);

      $player_seats.append($player_seat);
    });

    //COMMON CARDS:
    const $common_display = $('<div />',
    {
      id: "common-display",
    });
    //common card images:
    const $common_hand = _.map(game_state.common_cards, (card) =>
    {
      let card_img_name;
      card_img_name = card;

      const $card_img = $('<img />',
      {
        src: `card_images/${card_img_name}.svg`,
      });

      $card_img.addClass('common-card');
      return $card_img;
    });

    $common_display.append($common_hand);

    $game_board.append($common_display);
    $game_board.append($player_seats);

  }
  //DETERIMES WHETHER TO SHOW LOGIN OR GAME BOARD:
  if (current_player == null)
  {
    if (!showing_login_screen)
    {
      setup_login_screen();
      showing_login_screen = true;
    }
    render_login_screen();
  }
  else
  {
    showing_login_screen = false;
    render_game();
  }
}