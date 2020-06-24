// TODO: indicator for if in hand or not
// show cards as gray background

// TODO: pass deal to specific player

// TODO: button to take everyone's cards and shuffle without new game, but still shift dealer
// TODO: show errors
// TODO: show number of remaining cards in deck

let showing_login_screen = false;

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
    const suits = ['C', 'D', 'H', 'S'];
    let chosen = "";
    const $five_cards = $('<div />');
    for(let i = 0; i < 5; i++)
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

    /*************************
     * ALL DEALER BUTTONS
     ************************/

    const deal_all_up_down_numbers = [
      [5, 0],
      [2, 1],
      [0, 1],
      [1, 0],
    ];

    //CREATE DEALING BUTTONS: 5DN, 2DN/1UP, 1UP, 1DN
    const $deal_all_buttons = _.map(deal_all_up_down_numbers, ([down, up]) =>
    {
      const $deal_all_button = $('<button />');
      let label = '';

      //add text to buttons based on how many up or down:
      if (down > 0)
      {
        label += `${down} DN`;
      }
      if (up > 0)
      {
        if (label)
        {
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
      $deal_all_button.on('click', function ()
      {
        game.deal_all(down, up);
      });
      return $deal_all_button;
    });

    //NEXT UP BUTTON  - deals one card up to one player
    const $next_up_button = $('<button />');
    $next_up_button.text('Next UP');
    $next_up_button.on('click', function ()
    {
      game.one_card(true);
    });
    $next_up_button.addClass('one-card-buttons');
    $next_up_button.attr('id', 'first-of-group'); //to add some left margin space

    //NEXT DOWN BUTTON  - deals one card down to one player
    const $next_down_button = $('<button />');
    $next_down_button.text('Next DN');
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
    });
    $draw_button.text('DRAW MODE');
    $draw_button.on('click', function ()
    {
      //outline button to show toggle happened
      //set draw_mode in game_state
      
      game.toggle_draw_mode();
      game_state.draw_mode = ! game_state.draw_mode; //but toggle does this already
      console.log(game_state.draw_mode);
    });
    
    //change active better selector:
    const $change_active_player_select = $('<select />',
    {
      id: 'change-active-player-select',
    });
    $change_active_player_select.on('change', function ()
    {
      const player = $(this).val();
      game.change_active_player(player);
    });

    //SELECTOR FOR WINNERS/Payout:
    const $winners_select = $('<select />',
    {
      id: 'winners-select',
    });
    // use:     game.payout(winners);


    //PAYOUT BUTTON:
    const $payout_button = $('<button />',{
      id:'payout-button',
    });
    $payout_button.text('Pay-out');

    $payout_button.on('click', function ()
    {
      //get which players were checked:
      const winners = $('.winner-checkbox:checked').map(function ()
      {
        return $(this).val();
      }).toArray();
      //pay all those that were checked:
      game.payout(winners);
    });

    //NEW GAME BUTTON:
    const $new_game_button = $('<button />',{
      id:'new-game-button',
    });
    $new_game_button.text('New Game');
    $new_game_button.on('click', function ()
    {
      game.new_game();
    });
    
    //GAME SELECTOR setup: shows which game is being played
    const $games = new Array('7-Card Stud', 'Man/Mouse', 'Chicago Hi-Lo', '5-Card Draw',
                            '5-Card Stud', 'Texas Hold-Em', 'Midnight Baseball',
                            'Follow the Queen', 'Dirty Gertie', 'Acey-Ducey',
                            'Woolworths');
    
    
    //set game selector to show name of game on screen:
    const $set_game_select = $('<select />',{
      id:'set-game-select',
    });
    
    $set_game_select.empty();
    $set_game_select.on('change', function(){
      game.set_game_name($(this).val()); 
    });
    
    for(let i = 0; i < $games.length; i++)
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

    //deal buttons:
    $dealer_controls.append($deal_all_buttons);
    $dealer_controls.append($next_up_button);
    $dealer_controls.append($next_down_button);
    $dealer_controls.append($common_button);
    $dealer_controls.append($draw_button);

    //bettor selector:
    $dealer_controls_bottom.append('<span>Set Next Bettor: </span>');
    $dealer_controls_bottom.append($change_active_player_select);

    //payout button and selector:
    $dealer_controls_bottom.append($payout_button);
    $dealer_controls_bottom.append($winners_select);

    //new game button & game selector:
    $dealer_controls_bottom.append($new_game_button);
    $dealer_controls_bottom.append('<span>Game: </span>');
    $dealer_controls_bottom.append($set_game_select);

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
    });
    $check_button.text('Check');
    $check_button.on('click', function ()
    {
      game.bet(0);
      $bet_input.val('');
    });

    //CALL BUTTON
     const $call_button = $('<button />',
    {
      id: 'call-button',
    });
    $call_button.text('Call');
//    $check_button.on('click', function ()
//    {
//      game.bet(0);
//      $bet_input.val('');
//    });
    
    
    //BUY-IN 10 CHIPS BUTTON:
    const $buy_10_button = $('<button />',
    {
      id: "buy-10-btn",
    });
    $buy_10_button.text('+$10');
    $buy_10_button.on('click', function ()
    {
     
    });
    
    //GAME NAME DISPLAY:
    const $game_name_display = $('<span />', {
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
    });
    $fold_button.text('Fold');
    $fold_button.on('click', function ()
    {
      game.fold();
    });

    //BET AMOUNT INPUT FIELD:
    const $bet_input = $('<input />',
    {
      id: 'bet-input',
      type: 'number',
      min: 0,
    });

    //BET BUTTON:
    const $bet_button = $('<button />',
    {
      id: 'bet-button',
    });
    $bet_button.text('Bet');
    $bet_button.on('click', function ()
    {
      const amount = +$bet_input.val();
      game.bet(amount);
      $bet_input.val('');
    });

    //BET BUTTONS 1-6:
    const $bet_buttons = $('<span />');

    for (let i = 1; i <= 6; i++)
    {
      const $bet_button_num = $('<button />',
      {
        class: 'bet-buttons',
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
    const $player_money_display = $('<span />',{
      id:'player-money-display',
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


    /*******************************************
     * BUILD ENTIRE PAGE:
     *******************************************/
    $header.append('<hr \>');
    $header.append($logo_link);
    
    $header.append($dealer_controls);
    $header.append($dealer_controls_bottom);
    
    $header.append($player_controls);
    $header.append($common_info);
    $header.append($buy_10_button);
    $header.append($logout_button);
    $header.append($game_name_display);

    $header.append('<hr />');

    $app.append($header);
    $app.append($game_board);
  }

  /**** for checkboxes - see below ****/
    var expanded = false;

  function showCheckboxes() {
    var checkboxes = document.getElementById("checkboxes");
    if (!expanded) {
      checkboxes.style.display = "block";
      expanded = true;
    } else {
      checkboxes.style.display = "none";
      expanded = false;
    }
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

    //show all active players in the set next bettor menu:
    const $change_active_player_select = $('#change-active-player-select');
    $change_active_player_select.empty();
    _.forEach(game_state.players, player =>
    {
      if (player.in_hand)
      {
        const $player_option = $('<option />',
        {
          value: player.id,
        });
        $player_option.text(player.name);
        $player_option.prop('selected', game_state.active_player === player.id);
        $change_active_player_select.append($player_option);
      }
    });
    
   // https://stackoverflow.com/questions/17714705/how-to-use-checkbox-inside-select-option
    
    /* USE THIS FOR MULTISELECT
    <form>
    <div class="multiselect">
      <div class="selectBox" onclick="showCheckboxes()">
        <select>
          <option>Select an option</option>
        </select>
        <div class="overSelect"></div>
      </div>
      <div id="checkboxes">
        <label for="one">
          <input type="checkbox" id="one" />First checkbox</label>
        <label for="two">
          <input type="checkbox" id="two" />Second checkbox</label>
        <label for="three">
          <input type="checkbox" id="three" />Third checkbox</label>
      </div>
    </div>
  </form>
    
    
    */
    //show all active players in the winners select menu
    const $winners_select = $('#winners-select');
    $winners_select.empty();
    _.forEach(game_state.players, player =>
    {
      if (player.in_hand)
      {
        const $player_option = $('<option />',
        {
          value: player.id,
        });
        $player_option.text(player.name);
        $winners_select.append($player_option);
      }
    });
       
    
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
    //POT: amt (+last_bet_amt):
    $pot_display.text(`POT \$${(game_state.pot * 0.25).toFixed(2)} (+${(game_state.last_bet * 0.25).toFixed(2)})`);

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
      $('#fold-button').text('Fold');
    }
    else
    {
      $('#fold-button').text('SitOut');
    }
    //update player's money amount:
    $('#player-money-display').text(`${current_player.name + " $" + (current_player.chips * 0.25).toFixed(2)}/total`);

    //game board has all players:
    const $game_board = $('#game-board');
    $game_board.empty();

    /****************************
     * EACH PLAYER'S NAME/CARDS:
     ***************************/
    
    //CREATE EACH player BASED ON players in game_state
    const $player_seats = _.map(game_state.players, (player) =>
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
      if (game_state.dealer === player.id) {
        $player_seat.addClass('dealer');
      }
      if (game_state.active_player === player.id) {
        $player_seat.addClass('active-player');
      }

      //add name:
      const $player_name = $('<div />');
      $player_name.addClass('player-name');
      $player_name.text(player.name);

      //add row of chips (40 = $10 each chip)
      const $chip_stack_display = $('<div />');
      $chip_stack_display.addClass('chips-display');
      _.forEach(new Array(Math.ceil(player.chips / 40)), () => {
        $chip_stack_display.append('<img src="chips_images/chip.png" />');
      });

      //chips shy display:
      const $chips_shy = $('<div />');
      $chips_shy.addClass('chips-shy');
      $chips_shy.text('($ shy)');

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
          if (card.up || player.id === current_player.id)
          {
            card_img_name = card.card;
          }
          else
          {
            card_img_name = '2B';
          }
          const $card_img = $('<img />',
          {
            src: `card_images/${card_img_name}.svg`,
          });

          $card_img.addClass('card');
          
          if (!card.up && player.id === current_player.id)
          {
            $card_img.addClass('down-card');
          }
          //TODO: slide in animation
//          let $card_dealt = true; //change this to depend on what just happened
//          if(player.id === current_player.id && idx == player.hand.length - 1
//            && $card_dealt)
//            $card_img.addClass('last');
//          else
//            $card_img.removeClass('last');
          
          //allow player to click down card to make up:
          $card_img.on('click', function ()
          {
            game.flip_card(idx);
          });

          $hand.append($card_img);
        });
      }

      //add all HTML to each player
      $player_name.append($kick_button);

      $player_seat.append($player_name);
      $player_seat.append($chips_shy);
      $player_seat.append($chip_stack_display);
      $player_seat.append($hand);

      return $player_seat;
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

      $card_img.addClass('card');

      return $card_img;
    });

    $common_display.append($common_hand);

    $game_board.append($player_seats);
    $game_board.append($common_display);

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
