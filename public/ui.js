/* authors: A. Bckwith & D. Beckwith, summer 2020 */

let showing_login_screen = false;

/**
 * show chips as $d.cc
 */
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

    const $login_screen = $('<center />');

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

    //deal a hand of five random cards for fun:
    const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
    const suits = ['C', 'D', 'H', 'S'];
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

    $login_screen.append($name_input);
    $login_screen.append('<br />');
    $login_screen.append($login_button);
    $login_screen.append('<br />');
    $login_screen.append('<hr />');
    $login_screen.append($current_players);
    $login_screen.append($five_cards);

    $app.append($login_screen);
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
    $app.empty(); //get rid of login screen HTML

    const $header = $('<center />');

    //LOGO: shakes on hover and when clicked shows credits
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


    //top half of dealer controls:
    const $dealer_controls = $('<div />',
    {
      id: 'dealer-controls',
    });

    const $cards_left = $('<span />',
    {
      id: "cards-left",
    });



    /*************************
     * ALL DEALER BUTTONS
     ************************/

    //create buttons:
    const $deal_all_buttons = $('<span \>');
    const $five_down_button = $('<button />',
    {
      title: 'Deals 5 down cards to every player simultaneously',
    });
    const $two_down_one_up_button = $('<button />',
    {
      title: 'Deals 2 down and 1 up card to every player simultaneously',
    });
    const $one_up_button = $('<button />',
    {
      title: 'Deals 1 up card to every player simultaneously',
    });
    const $one_down_button = $('<button />',
    {
      title: 'Deals 1 down card to every player simultaneously',
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
    $one_up_button.text('All 1UP');
    $one_down_button.text('All 1DN');

    //add:
    $deal_all_buttons.append($five_down_button);
    $deal_all_buttons.append($two_down_one_up_button);
    $deal_all_buttons.append($one_up_button);
    $deal_all_buttons.append($one_down_button);

    /*****************************
     * DEAL ONE CARD TO NEXT PLAYER BUTTONS:
     *****************************/

    const $next_label = $('<span />',
    {
      id: "next-label",
    });
    const $next_up_button = $('<button />',
    {
      text: 'Next (U)P',
      title: 'Deals one card to the next player in line (they have an box around their hand)',
      id: 'next-up',
    });
    //win-lose for acey-ducey
    const $win_a_d_button = $('<button />',
    {
      text: 'WIN',
      id: 'win-a-d-button',
      hidden: true,
      title: 'For acey-ducey - will take bet amount and give 2x back to winner ',
    });

    const $lose_a_d_button = $('<button />',
    {
      text: 'LOSE',
      id: 'lose-a-d-button',
      hidden: true,
      title: 'For acey-ducey - will move to next player and keep bet in pot ',
    });
    const $post_button = $('<button />',
    {
      text: 'POST',
      id: 'post-button',
      hidden: true,
      title: 'For acey-ducey - will take bet amount and give 2x back to winner ',
    });

    const $dbl_post_button = $('<button />',
    {
      text: 'DBL-POST',
      id: 'dbl-post-button',
      hidden: true,
      title: 'For acey-ducey - will take bet amount and give 2x back to winner ',
    });

    const $next_down_button = $('<button />',
    {
      text: 'Next (D)N',
      title: 'Deals one card to the next player in line (they have an box around their hand)',
      id: 'next-down',
    });

    $next_up_button.click(function ()
    {
      game.one_card(true);
    });
    //  
    $win_a_d_button.click(function ()
    {
      game.clear_hand();
      //payout:
      game.pay_acey_ducey();
      //nextplayer:
      game.increment_bettor_drawer();
    });

    $lose_a_d_button.click(function ()
    {
      game.clear_hand();
      game.increment_bettor_drawer();
    });

    $post_button.click(function ()
    {
      game.pay_post(1);
      game.clear_hand();
      game.increment_bettor_drawer();
    });
    $dbl_post_button.click(function ()
    {
      game.pay_post(2);
      game.clear_hand();
      game.increment_bettor_drawer();
    });

    $next_down_button.click(function ()
    {
      game.one_card(false);
    });

    $next_up_button.addClass('one-card-buttons');
    $next_up_button.addClass('space-on-left');

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
      text: 'COMMON UP',
    });

    //DRAW MODE button:
    const $draw_button = $('<button />',
    {
      id: 'draw-btn',
      title: 'When draw mode is on, clicking on a card will remove it from players hand\n\n' +
        'Also, dealing a card will not increment to next player',
    });

    //NEXT ACTIVE PLAYER BUTTON  
    const $increment_active_bettor_drawer_button = $('<button />',
    {
      id: 'increment-active-bettor-drawer-button',
      title: 'Moves to the next player for both betting and getting a card dealt to them',
      text: "(N)ext Active Player",
    });

    $common_button.click(function ()
    {
      game.deal_common();
    });
    $draw_button.click(function ()
    {
      game.toggle_draw_mode();
    });
    $increment_active_bettor_drawer_button.click(function ()
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

    $payout_button.click(function ()
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
      text: 'New Game',
    });
    //change card backing button:
    const $new_back_button = $('<button />',
    {
      id: 'new-back-button',
      title: 'picks randomly from card backs',
      text: 'Backs',
    });
    //reset game button:
    const $reset_game_button = $('<button />',
    {
      id: 'reset-game-button',
      title: 'resets game - shuffles, gives back money, but same dealer',
      text: 'RESET Game',
    });

    $new_game_button.click(function ()
    {
      game.acey_ducey_off();
      if (!game.draw_mode)
        game.toggle_draw_mode();
      $("#set-game-select").val("Select Game");
      $("#set-game-select").change();
      game.no_peek_mode_off();
      $draw_button.css('background-color', 'darkgreen');
      $draw_button.text('TURN DRAW MODE ON');
      game.new_game();
    });
    $reset_game_button.click(function ()
    {
      game.reset_game();
    });
    $new_back_button.click(function ()
    {
      game.new_back();
    });


    //GAME SELECTOR setup: shows which game is being played
    const $games = new Array(
      '7-Card Stud',
      '5-Card Draw',
      '(Jacks or Better)',
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




    function show_buttons(shows, will_show)
    {
      for (let i = 0; i < shows.length; i++)
      {
        if (will_show) shows[i].show();
        else shows[i].hide();
      }
    }
    //WHEN GAME IS SELECTED, show game name and if...
    //
    //Acey-Ducey - add W, L buttons and set in acey-ducey mode
    //Midnight Baseball - put automatically in draw mode
    //5-card draw - remove 1up/1dn buttons
    $set_game_select.change(function ()
    {
      let choice = $(this).val();

      game.set_game_name(choice);

      //ACEY-DUCEY: remove buttons/add W and L buttons
      if (choice === "Acey-Ducey")
      {
        alert("DEALER:\n\n1. Deal 2 cards then get player's bet\n\n2. Deal 3rd card\n\n3. Click Win, Lose, Post, or DblPost (will deal with chips and clear cards)");
        game.acey_ducey_on();

        $draw_button.css('background-color', 'red');
        $draw_button.text('TURN DRAW MODE OFF');
      }
      else
      {
        //put buttons back
        game.acey_ducey_off();

        if (choice === "Midnight Baseball")
        {
          alert("Cards are now in 'no-peek mode'.  You can deal 7 cards to everyone\n" +
            "  and players can flip their own cards")
          game.no_peek_mode_on();
          //          if(!game_state.draw_mode)
          //            game.toggle_draw_mode();
        }
        else
        {
          game.no_peek_mode_off();
          $draw_button.css('background-color', 'darkgreen');
          $draw_button.text('TURN DRAW MODE ON');
        }
      }
      ////  SHOW AND HIDE BUTTONS: /////
      if (choice === "5-Card Draw")
      {
        show_buttons(new Array($two_down_one_up_button, $one_up_button, $win_a_d_button, $lose_a_d_button, $next_up_button), false);
        show_buttons(new Array($five_down_button, $next_down_button, $one_down_button), true);
        game.five_card_on();
      }
      else if (choice === "Midnight Baseball")
      {
        show_buttons(new Array($two_down_one_up_button, $one_up_button, $win_a_d_button, $lose_a_d_button, $next_down_button), false);
        show_buttons(new Array($five_down_button, $one_down_button, $next_up_button), true);
        game.five_card_off();

      }
      else if (choice === "Acey-Ducey")
      {
        show_buttons(new Array($five_down_button, $two_down_one_up_button, $one_down_button,
          $one_up_button, $next_down_button, $common_button), false);
        show_buttons(new Array($next_up_button, $win_a_d_button, $lose_a_d_button), true);
        game.five_card_off();

      }
      else if (choice === "Man-Mouse")
      {
        show_buttons(new Array($five_down_button, $two_down_one_up_button,
          $one_up_button, $next_down_button, $common_button, $next_up_button, $win_a_d_button, $lose_a_d_button), false);
        show_buttons(new Array($one_down_button), true);
        game.five_card_off();

      }
      else if (choice === "Texas Hold-Em" || choice === "Criss-Cross")
      {
        show_buttons(new Array($five_down_button, $two_down_one_up_button,
          $win_a_d_button, $lose_a_d_button, $one_up_button, $next_down_button, $next_up_button), false);
        show_buttons(new Array($one_down_button, $common_button), true);
        game.five_card_off();

      }
      // "7-Card Stud" "5-Card Stud" "Chicago Hi-Lo"  "Follow the Queen"  "Woolworths" "Dirty Gertie"
      else
      {
        show_buttons(new Array($win_a_d_button, $lose_a_d_button), false);
        show_buttons(new Array($two_down_one_up_button, $one_up_button, $one_down_button, $next_up_button, $five_down_button, $next_down_button), true);
        game.five_card_off();

      }
      //mode that move to next player when 5th card is dealt after draw
      if (game_state.game_name === "5-Card Draw")
      {
        game.five_card_on();
      }
      else
      {
        game.five_card_off();
      }

    });

    $set_game_select.append('<option selected disabled>Select Game</option>');

    for (let i = 0; i < $games.length; i++)
    {
      const $a_game = $('<option />',
      {
        value: $games[i],
        text: $games[i],
        optSelected: game_state.game_name == $games[i],
      });
      $set_game_select.append($a_game);
    }


    /*******************************************
     * ADD ALL DEALER CONTROLS HTML TO PAGE:
     *******************************************/

    $dealer_controls.append($cards_left);
    $dealer_controls.append($deal_all_buttons);
    $dealer_controls.append($next_up_button);
    $dealer_controls.append($win_a_d_button);
    $dealer_controls.append($lose_a_d_button);
    $dealer_controls.append($post_button);
    $dealer_controls.append($dbl_post_button);
    $dealer_controls.append($next_down_button);
    $dealer_controls.append($common_button);
    $dealer_controls.append($draw_button);


    $dealer_controls_bottom.append($increment_active_bettor_drawer_button);
    $dealer_controls_bottom.append($payout_button);
    $dealer_controls_bottom.append($winners_select);
    $dealer_controls_bottom.append($dealer_select);
    //    $dealer_controls_bottom.append('<span style="margin-left:15px;">Game: </span>');
    $dealer_controls_bottom.append($set_game_select);
    $dealer_controls_bottom.append($new_game_button);
    $dealer_controls_bottom.append($reset_game_button);
    $dealer_controls_bottom.append($new_back_button);

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
      text: 'LOGOUT',
    });
    //CHECK BUTTON:
    const $check_button = $('<button />',
    {
      id: 'check-button',
      title: 'To pass the bet (assuming you are not light any amount)',
      text: '(C)heck/In',
    });
    //CALL BUTTON
    const $call_button = $('<button />',
    {
      id: 'call-button',
      title: 'Call the current bet amount (your "shy" amount)',
      text: 'Call',
    });
    //ANTE BUTTON
    const $ante_button = $('<button />',
    {
      id: "ante-btn",
      title: "Ante 1 chip",
      text: 'Ante',
    });
    $logout_button.click(function ()
    {
      game.logout();
    });

    $check_button.click(function ()
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
    $call_button.click(function ()
    {
      game.call();
    });

    //ANTE AMOUNT INPUT FIELD:
    const $ante_input = $('<input />',
    {
      id: 'ante-input',
      type: 'number',
      min: 0,
    });

    $ante_button.click(function ()
    {
      if ($ante_input.val().length === 0)
        game.ante(1);
      else if ($ante_input.val() > 0)
      {
        game.ante($ante_input.val());
        $ante_input.val('');
      }
    });



    //    $ante_button.click(function ()
    //    {
    //      if ($ante_input.val() > 0)
    //      {
    //        const amount = +$bet_input.val();
    //        game.bet(amount);
    //        $ante_input.val('');
    //
    //      }
    //      
    //    });

    //MENU for +$10, logout, reset game
    //set game selector to show name of game on screen:
    const $other_select = $('<select />',
    {
      id: 'other-select',
    });

    $other_select.empty();
    $other_select.append('<option selected disabled value="prompt">Action:</option>');
    $other_select.change(function ()
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
      title: "Buy-in to the game for $10 more",
      text: '+$10',
    });
    $buy_10_button.click(function ()
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
      text: 'Fold/Out',
    });


    $fold_button.click(function ()
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
      text: 'Bet',
    });
    $bet_button.click(function ()
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
        text: i,
      });
      $bet_button_num.click(function ()
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

    $header.append($player_money_display);

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

    Mousetrap.bind('n', function ()
    {
      if (game_state.dealer === current_player.id && !showing_login_screen)
        game.increment_bettor_drawer();
    });
    Mousetrap.bind('u', function ()
    {
      if (!showing_login_screen)
        game.one_card(true);
    });
    Mousetrap.bind('d', function ()
    {
      if (!showing_login_screen)
        game.one_card(false);
    });
    Mousetrap.bind('c', function ()
    {
      if (!showing_login_screen)
      {
        game.bet(0);
        $bet_input.val('');
      }
    });


    //if no players in game, call setup:
    if ($('#game-board').length === 0)
    {
      setup_game_html();
    }
    $("#cards-left").text(`${game_state.deck.length} cards left`);

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

    const $set_game_select = $('#set-game-select');
    $set_game_select.val(game_state.game_name);
    const $game_name_display = $('#game-name-display');
    $game_name_display.text(game_state.game_name);
    const $draw_button = $('#draw-btn');

    //make down cards outline in black to show discarding
    var downs = $(".down-card").children();
    downs.toggleClass("draw-ready");

    //alter draw mode button depending on mode:
    if (game_state.draw_mode)
    {
      $draw_button.css('background-color', 'red');
      $draw_button.text('TURN DRAW MODE OFF');
    }
    else
    {
      $draw_button.css('background-color', 'darkgreen');
      $draw_button.text('TURN DRAW MODE ON');
    }


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
      $('#player-controls').show(1000); //animate controls 1 sec
    else
      $('#player-controls').hide();

    //set the max a player can bet to their chips:
    $('#bet-input').prop('max', current_player.chips);

    //Man-mouse different player controls:
    if (game_state.hand_started)
    {
      $('#fold-button').text('Fold');
    }
    else
    {
      $('#fold-button').text('SitOut');
    }
    if (game_state.game_name !== "Man-Mouse")
    {
      $('#fold-button').text('Fold');
      $('#check-button').text('Check');
      $('#check-button').css('margin-right', '10px')
      $('#call-button').show();
      $('#bet-button').show();
      $('#bet-input').show();
      $('.bet-buttons').show();
    }
    else
    {
      $('#fold-button').text('Out');
      $('#check-button').text('In');
      $('#check-button').css('margin-right', '40px');
      $('#call-button').hide();
      $('#bet-button').hide();
      $('#bet-input').hide();
      $('.bet-buttons').hide();
    }
    //remove some buttons for acey-ducey
    if (game_state.game_name !== "Acey-Ducey")
    {
      $('#fold-button').show();
      $('#check-button').show();
      $('#call-button').show();
      $('#post-button').hide();
      $('#dbl-post-button').hide();
    }
    else
    {
      $('#fold-button').hide();
      $('#check-button').hide();
      $('#call-button').hide();
      $('#post-button').show();
      $('#dbl-post-button').show();
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
        $player_seat.addClass('player-connected');
      else
        $player_seat.addClass('player-disconnected');

      //determine if this player is the dealer:
      if (game_state.dealer === player.id)
        $player_seat.addClass('dealer');
      if (game_state.active_player === player.id)
        $player_seat.addClass('active-player');

      //add name:
      const $player_name = $('<div />');
      //allow to click on name to set as active player
      $player_name.click(function ()
      {
        game.set_active_player(player.id);
      });
      $player_name.addClass('player-name');

      //add ante, dealer, active player indicators:
      if (player.in_hand && player.anted)
        $player_name.append('•');
      $player_name.append(player.name);
      if (game_state.dealer === player.id)
        $player_name.append(" ♠")
      //      if (game_state.active_player == player.id)
      //        $player_name.append("⇚")

      //add row of chips (40 = $10 each chip)
      const $chip_stack_display = $('<div />');
      $chip_stack_display.addClass('chips-display');
      $chip_stack_display.click(function ()
      {
        game.set_active_player(player.id);
      });

      let chip_count = Math.round(player.chips / 40);
      if (player.chips > 0 && chip_count === 0)
        chip_count = 1;
      _.forEach(new Array(chip_count), () =>
      {
        $chip_stack_display.append('<img src="chips_images/chip.png" />');
      });

      //chips shy display:
      const $chips_shy = $('<div />');
      $chips_shy.click(function ()
      {
        game.set_active_player(player.id);
      });
      $chips_shy.addClass('chips-shy');
      let $chips_in_disp = _.max(_.map(game_state.players, 'chips_in')) - player.chips_in;

      //only show shy amount if not playing man-mouse and you are in the hand
      if (game_state.game_name !== "Man-Mouse" && player.in_hand)
      {
        $chips_shy.text(`shy:${$chips_in_disp}`);

      }
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

      /*****************************************
       * CARDS FOR EACH PLAYER (also determines up and down):
       *****************************************/
      const $hand = $('<div />');
      $hand.addClass('hand');

      if (player.in_hand)
      {
        _.forEach(player.hand, (card, idx) =>
        {
          let card_img_name; //up side of card

          //span for up and down together:
          var $up_with_down = $('<span />',
          {
            id: 'up-with-down',
          });

          //add down card - will be behind part of upcard
          var $card_img2;
          //if down card show card and backing....
          //       first the card:
          if (!card.up && player.id === current_player.id)
          {
            card_img_name = '2B' + game_state.card_back_num;
            $card_img2 = $('<img />',
            {
              src: `card_images/${card_img_name}.svg`,
            });
            $card_img2.addClass('card');
            $card_img2.addClass('backing');
            if (idx === 5) //put a little extra space
            {
              $card_img2.addClass('sixth_card');
            }
          }

          $up_with_down.append($card_img2);


          //show backing or card image:
          if (card.up || player.id === current_player.id && !game_state.no_peek_mode)
            card_img_name = card.card;
          else
            card_img_name = '2B' + game_state.card_back_num;

          const $card_img = $('<img />',
          {
            src: `card_images/${card_img_name}.svg`,
          });

          $card_img.addClass('card');
          if (idx === 5)
          {
            $card_img.addClass('sixth_card');
          }

          //outline cards or show halfup half down
          if (!card.up && player.id === current_player.id && game_state.draw_mode)
            $card_img.addClass('draw-ready'); //show black outline around down cards
          if (!card.up && player.id === current_player.id)
            $card_img.addClass('down-card');

          $up_with_down.append($card_img);

          //allow player to click down card to make up:
          if (player.id === current_player.id)
          {
            $card_img.click(function ()
            {
              if (game_state.draw_mode) //add to upcard
                game.discard(idx);
              else
                game.flip(idx);
            });
            if (!card.up) //add to down card
              $card_img2.click(function ()
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
