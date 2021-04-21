/* authors: A. Beckwith & D. Beckwith, summer 2020 */

let showing_login_screen = false;
let allow_access_to_totals = false;
var $how_to = new Array(
   'Hover over EACH GAME for rules',
   '2 down/1 up then bet, 3 more up, 1 down, bet on each', //'7-Card Stud',
   'Deal 5, bet, draw, bet', //'5-Card Draw',
   //      'Jacks or Better',
   '1 down, 4 up, one at a time', //'5-Card Stud',
   '',
   '7-card stud, announce at end going for low hand (0) (ace can be low), ' +
   'high hand (1), or both (2), if a low and hi, split pot (both = win both or lose all)', //'Chicago Hi-Lo',
   '7-card stud, lowest spade down (2 is lowest?) is wild for the player that has it', //'Low Spade in Hole Wild',
   '7-card stud, lowest spade down (2 is lowest?) gets half the pot', //'Low Space in the Hole 1/2pot'
   '7-card stud, up Queens are wild, down Queens are wild, only if you reveal them by...?', //'Gay Bar',
   'Ask Ned', //'Raise the Flag',
   '7-card stud, 5\'s and 10\s are wild (pay 2 and 4 chips - buy or die)', //Woolworths',
   '7-card stud, up card following up queen is wild for all occurrences of that card ', //'Follow the Queen',
   '7-card stud, up card following up queen is wild for all occurrences of that card AND if Queen of Spades comes up, all those still in the game, turn in for new cards and start again', //'Dirty Gertie',
   '7-card stud, 3\'s and 9\'s are wild, but 3 is buy-or-dye (dealer\'s choice on whether only first 3) pay the pot; 4\'s give an extra card to that player for 2 chips', // Day Baseball', 
   '7-card stud, common wild card after 2nd up card and 4th up card - no wild cards if the two wilds have the same value',
   '7-card roll-em: 3\'s and 9\'s are wild, but 3 is buy-or-dye pay the pot; 4\'s give an extra card to that player for 2 chips', //Midnight Baseball',
   '7-card stud, 3 down dealt, choose which to roll, bet, deal/roll/bet repeat.  Last down no roll', //'Roll Your Own',

   '',
   'Everyone gets 2 down cards, common cards: 3, then 1, then 1.  Player uses best 5', //'Texas Hold-Em',
   'Everyone gets 4 down cards, common cards: 3, then 1, then 1.  Player must use exactly 2 from hand', //'Omaha',
   //      'Criss-Cross',
   '',
   'card1, card2 dealt, player bet is on card3 is in between (player calls card1 if Ace as high or low)', //'Acey-Ducey',
   'Hands: 3 of a kind, pair, high card.  3 cards dealt to each player, each player says "in" or "out", if more than one in, all losers pay pot, repeat until only one player in.  Ante each round and move rotate player to delcare first', //'Man-Mouse',
   'Other');
/**
 * show chips as $d.cc
 */
function formatChips(chips) {
   return (chips * 0.25).toFixed(2);
}
/****************************
 * SETS UP LOGIN SCREEN
 ***************************/
export function render_ui({
   game,
   prev_game_state,
   game_state,
   current_player
}) {
   const $app = $('#app');

   function setup_login_screen() {
      //fireworks:
      $(".before").hide();
      $(".after").hide();
      //    $("#credits").hide();
      $("#text").hide();

      $app.empty();

      const $login_screen = $('<center />');

      const $name_input = $('<input />', {
         type: "text",
         id: "name-input",
         placeholder: "ENTER YOUR NAME",
      });
      //    $("#name-input").css(
      //    {
      //      "background-color": "yellow",
      //      "font-size": "20px",
      //      "width": '210px',
      //      "font-family": "'PT Mono', monospace",
      //      "color": 'red',
      //      "height": '40px',

      //    });

      const $login_button = $('<button />', {
         id: "login-button",
      });
      $login_button.text('JOIN GAME');
      $login_button.on('click', function () {
         const name = $name_input.val();
         if (name !== "")
            game.login(name);
      });

      const $current_players = $('<div />', {
         id: 'current-players',
      });

      //deal a hand of five random cards for fun:
      const values = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];
      const suits = ['C', 'D', 'H', 'S'];
      let chosen = "";
      const $five_cards = $('<div />');
      for (let i = 0; i < 5; i++) {
         let card_val = "";
         while (chosen.indexOf(card_val) != -1) {
            const v = values[Math.floor(Math.random() * values.length)]
            const s = suits[Math.floor(Math.random() * suits.length)]
            card_val = v + s;
         }
         chosen += card_val;
         const $card_img = $('<img />', {
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


   function render_login_screen() {
      const $current_players = $('#current-players');
      const current_players = _.map(game_state.players, (player) => player.name);
      $current_players.text(`CURRENT PLAYERS: ${_.join(current_players, ', ')}`);
   }

   let works = false;

   function toggle_fireworks() {

      $(".before").toggleClass('paused');
      $(".after").toggleClass('paused');
      if (!works) {
         $(".before").show();
         $(".after").show();
         $("#app").css("opacity", "0.3");
         $("body").css({
            "background-image": "none",
            "background-color": "black"
         });
         $("#text").show();
         $("#credits").show();

         works = true;
      } else {
         $(".before").hide();
         $(".after").hide();

         $("body").css({
            "background-color": "#2f7532",
         });
         $("#text").hide();
         $("#credits").hide();

         $("#app").css("opacity", "1.0");


         //      $("#app").not("#logo").css("background-image:","linear-gradient(to bottom, #007712, #2AcF15)");

         works = false;
      }
   }
   /*********************************
    * INITIAL SETUP of game screen
    * called at start of render_game
    ***********************************/
   function setup_game_html() {
      $app.empty(); //get rid of login screen HTML
      $("#credits").hide();
      const $header = $('<div />', {
         id: 'header',
      });

      //don't show fireworks at first:
      $(".before").hide();
      $(".after").hide();
      $("#text").hide();

      //LOGO: 
      const $logo_link = $('<span />', {
         href: '#',
         id: 'logo-link',
         title: 'Click to bring up CP Tutorial page ',

      });
      $logo_link.append('<img src="favicon/android-icon-36x36.png" style="margin-bottom: 10px;">');

      const $dollar_dot = $('<span />', {
         href: '#',
         id: 'dollar-dot',
         title: 'Double-click to see $ totals (at end of night)',
      });
      $dollar_dot.append("•");

      //top half of dealer controls:
      const $dealer_controls = $('<div />', {
         id: 'dealer-controls',
      });
      //display for how many cards left
      const $cards_left = $('<span />', {
         id: "cards-left",
      });



      /*************************
       * ALL DEALER BUTTONS
       ************************/

      //create buttons:
      const $deal_all_buttons = $('<span \>');
      const $one_up_button = $('<button />', {
         id: "one-up-button",
         title: 'Deals 1 up card to every player simultaneously',
      });
      const $one_down_button = $('<button />', {
         id: "one-down-button",
         title: 'Deals 1 down card to every player simultaneously',
      });

      $one_up_button.on('click', function () {
         game.deal_all(0, 1);

      });
      $one_down_button.on('click', function () {
         game.deal_all(1, 0);
      });

      //set text:
      $one_up_button.text('All 1UP');
      $one_down_button.text('All 1DN');

      //add:
      $deal_all_buttons.append($one_down_button);
      $deal_all_buttons.append($one_up_button);

      /*****************************
       * DEAL ONE CARD TO NEXT PLAYER BUTTONS:
       *****************************/

      const $next_label = $('<span />', {
         id: "next-label",
         text: "NEXT CARD:",
      });
      const $next_up_button = $('<button />', {
         text: 'UP',
         title: 'Deals one card to the selected player and moves to next player',
         id: 'next-up',
      });
      const $card_confirmed_button = $('<button />', {
         text: 'Confirm Card',
         id: 'card-confirmed-button',
         hidden: true,
         title: 'Click to confirm low or hi ace has been called for Acey-Ducey\n ' +
            'or to confirm 4, 5, 10 has been noticed in Woolworths',
      });
      $card_confirmed_button.hide();

      const $next_down_button = $('<button />', {
         text: 'DN',
         title: 'Deals one card to the selected player and moves to next player',
         id: 'next-down',
      });
      //win-lose for acey-ducey
      const $win_a_d_button = $('<button />', {
         text: 'WIN',
         id: 'win-a-d-button',
         hidden: true,
         title: 'For acey-ducey - will take bet amount and give 2x back to winner ',
      });
      $win_a_d_button.hide();

      const $lose_a_d_button = $('<button />', {
         text: 'LOSE',
         id: 'lose-a-d-button',
         hidden: true,
         title: 'For acey-ducey - will move to next player and keep bet in pot ',
      });
      $lose_a_d_button.hide();
      const $post_button = $('<button />', {
         text: 'POST',
         id: 'post-button',
         hidden: true,
         title: 'For acey-ducey - will take bet amount and give 2x back to winner ',
      });
      $post_button.hide();
      const $dbl_post_button = $('<button />', {
         text: 'DBL-POST',
         id: 'dbl-post-button',
         hidden: true,
         title: 'For acey-ducey - will take bet amount and give 2x back to winner ',
      });


      //***** ADD FUNCTIONS TO BUTTONS *****//
      $next_up_button.click(function () {
         game.one_card(true);
      });
      $next_down_button.click(function () {
         game.one_card(false);
      });
      $win_a_d_button.click(function () {
         game.clear_hand();
         game.pay_acey_ducey(); // pay out
         game.increment_bettor_drawer(); // next player
      });

      $lose_a_d_button.click(function () {
         game.clear_hand();
         game.lost_acey_ducey();
         game.increment_bettor_drawer();
      });

      $post_button.click(function () {
         game.clear_hand();
         game.pay_post(1);
         game.increment_bettor_drawer();
      });
      $dbl_post_button.click(function () {
         game.clear_hand();
         game.pay_post(2);
         game.increment_bettor_drawer();
      });

      $card_confirmed_button.click(function () {
         game.card_confirmed();
      });

      //these buttons have a different look:
      $next_up_button.addClass('one-card-buttons');
      $next_down_button.addClass('one-card-buttons');


      const $dealer_controls_top = $('<span />', {
         id: 'dealer-controls-top',
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
      $winners_select.children().first().on('click', function () {
         $('#winners-select-content').toggle();
      });
      $winners_select.prop("title", "Choose winner or winners of Pot, then click PayOut");

      $(document).on('click', function (event) {
         const $target = $(event.target);
         const is_over_select = $target.prop('id') === 'winners-select-over-select' ||
            $.contains($('#winners-select-content')[0], $target[0]);
         if (!is_over_select) {
            $('#winners-select-content').hide();
         }
      });

      //SELECTOR FOR Dealer:
      const $dealer_select = $(`<select />`, {
         id: 'dealer-select',
      });
      $dealer_select.on('change', function () {
         const dealer = $(this).val();
         game.change_dealer(dealer);
      });


      //PAYOUT BUTTON:
      const $payout_button = $('<button />', {
         id: 'payout-button',
         title: 'Splits the pot between all winners selected in winner menu\n\n' +
            'If uneven split, gives extra to player with least chips',
      });
      $payout_button.text('PAY');

      $payout_button.click(function () {
         //get which players were checked:
         const winners = $('#winners-select-content input:checked')
            .map(function () {
               return $(this).prop('id').slice('winners-select-player-'.length);
            })
            .toArray();
         //pay all those that were checked:
         game.payout(winners);
      });

      //NEW GAME BUTTON:
      const $new_game_button = $('<button />', {
         id: 'new-game-button',
         title: 'Reshuffles deck, moves dealer, ready for new game to be dealt\n\n' +
            'Pot must be zero (game not started or payout happened or Reset Game chosen) to start new game',
         text: 'New Game',
      });

      //change card backing button:
      const $new_back_button = $('<button />', {
         id: 'new-back-button',
         title: 'picks randomly from card backs',
         text: 'Backs',
      });

      //add functions to buttons:
      $new_game_button.click(function () {
         game.new_game("Select Game", true); //will show popup and set pot_cleared to False when appropriate
      });
      //    $reset_game_button.click(function ()
      //    {
      //      game.reset_game();
      //    });
      $new_back_button.click(function () {
         game.new_back();
      });

      //GAME SELECTOR setup: shows which game is being played
      const $games = new Array(
         '(Hover for rules!)',
         '7-Card Stud',
         '5-Card Draw',
         //      'Jacks or Better',
         '5-Card Stud',
         '',
         'Chicago Hi-Lo',
         'Low Spade in Hole Wild',
         'Low Spade in the Hole 1/2pot',
         'Gay Bar',
         'Raise the Flag',
         'Woolworths',
         'Follow the Queen',
         'Dirty Gertie',
         'Day Baseball',
         'Hope Springs Eternal',

         'Midnight Baseball',
         'Roll Your Own',

         '',
         'Texas Hold-Em',
         'Omaha',
         //      'Criss-Cross',
         '',
         'Acey-Ducey',
         'Man-Mouse',
         'Other');

     


      //set game selector to show name of game on screen:
      const $set_game_select = $('<select />', {
         id: 'set-game-select',
         title: 'Chooses game.  Disabled if pot is not zero (Reset Game to zero the pot)'
      });
      $set_game_select.empty();




      function show_buttons(shows, will_show) {
         for (let i = 0; i < shows.length; i++) {
            if (will_show) shows[i].show();
            else shows[i].hide();
         }
      }

      $set_game_select.change(function () {
         let choice = $(this).val();

         ////  SHOW AND HIDE BUTTONS: /////

         //firsts, hide all:
         show_buttons(new Array($one_up_button, $win_a_d_button, $lose_a_d_button, $next_up_button, $one_down_button, $card_confirmed_button, $next_down_button, $next_label), false);

         //now, show only those needed
         if (choice === "5-Card Draw")
            show_buttons(new Array($next_label, $next_down_button, $one_down_button), true);
         else if (choice === "Midnight Baseball" || choice == "Day Baseball") {
            if (choice === "Midnight Baseball") {
               swal("MIDNIGHT BASEBALL!", "Cards are now in 'no-peek mode'.  You can deal 7 cards to everyone" +
                  "  and players can flip their own cards");
               show_buttons(new Array($one_down_button), true);
            }
            show_buttons(new Array($card_confirmed_button), true);

         } else if (choice === "Acey-Ducey") {
            swal("Acey-Ducey", "DEALER:\n\n1. Deal 2 cards then get player's bet\n\n2. Deal 3rd card\n\n3. Click Win, Lose, Post, or DblPost (chips will be paid and cards cleared automatically)");
            $("#discard-btn").removeClass("not-discard-mode");
            $("#discard-btn").addClass("discard-mode");

            show_buttons(new Array($next_label, $next_up_button, $win_a_d_button, $lose_a_d_button, $card_confirmed_button), true);
         } else if (choice === "Man-Mouse") {
            // alert("FYI: when you click \"PAY\" the code will automatically subtract from all those that stayed in and lost");
            show_buttons(new Array($one_down_button), true);
         } else if (choice === "Texas Hold-Em" || choice === "Criss-Cross")
            show_buttons(new Array($one_down_button, $next_label, $next_down_button), true);
         else if (choice === "Woolworths")
            show_buttons(new Array($one_down_button, $next_label, $next_up_button, $next_down_button, $card_confirmed_button), true);
         else if (choice === "Follow the Queen")
            show_buttons(new Array($one_down_button, $next_label, $next_up_button, $next_down_button), true);
         else if (choice === "Dirty Gertie")
            show_buttons(new Array($one_down_button, $next_label, $next_up_button, $next_down_button), true);
         else if (choice === "5-Card Stud")
            show_buttons(new Array($one_up_button, $next_label, $next_down_button, $next_up_button, $one_down_button), true);
         else if ("7-Card Stud Day Baseball Hope Sprints Eternal Chicago Hi-Lo Low Spade in the Hole Gay Bar Raise the Flag".includes(choice))
            show_buttons(new Array($one_up_button, $next_label, $next_down_button, $next_up_button, $one_down_button), true);
         else if (choice === "Other") {
            show_buttons(new Array($one_up_button, $next_label, $next_down_button, $next_up_button, $one_down_button), true);
            choice = getGame();
         } else if (choice !== "(Hover for rules!)") {
            show_buttons(new Array($next_label, $one_up_button, $one_down_button, $next_up_button, $next_down_button), true);
         }
         game.new_game(choice, false);
         // game.set_instructions("testing");

      });

      //GAME SELECTOR:
      $set_game_select.append('<option selected disabled>Select Game</option>');

      for (let i = 0; i < $games.length; i++) {
         const $a_game = $('<option />', {
            value: $games[i],
            text: $games[i],
            optSelected: game_state.game_name == $games[i],
            title: $how_to[i],
         });
         $set_game_select.append($a_game);
      }

      const $action_select = $('<select />', {
         id: 'action-select',
         title: "Less-frequently-used dealer controls",
      });
      $action_select.empty();
      $action_select.append('<option selected disabled value="prompt">OTHER Dealer Actions:</option>');
      $action_select.change(function () {
         switch ($(this).val()) {
            case 'common':
               game.deal_common();
               break;
            case 'discard-mode':
               game.toggle_discard_mode();
               break;
            case 'collect':
               game.collect_shuffle();
               break;
            case 'undo':
               game.undo();
               break;
            case 'revert':
               game.revert();
               break;
         }
         $(this).val('prompt');
      });

      var other_dlr_functions = [
         ['• Deal COMMON Up Card', 'common'],
         ['', ''],

         ['• Turn DISCARD MODE On/Off', 'discard-mode'],
         ['', ''],

         ['• COLLECT CARDS/SHUFFLE (Man-Mouse & Dirty Gertie) leaves pot alone ', 'collect'],
         ['', ''],

         ['• UNDO last action', 'undo'],
         ['☠ REVERT to start-of-hand state ☠', 'revert'],
      ];

      _.forEach(other_dlr_functions, ([label, id]) => {
         const $a_function = $('<option />', {
            value: id,
         });
         $a_function.text(label);
         $action_select.append($a_function);
      });


      //COLLECT CARDS AND SHUFFLE BUTTON:
      const $collect_shuffle_button = $('<button />', {
         id: 'collect-shuffle-button',
         title: 'collects all cards/leaves pot alone',
         text: 'Collect/Shuffle',
      });
      //    $collect_shuffle_button.hide();
      $collect_shuffle_button.click(function () {
         game.collect_shuffle();
      });

      /*******************************************
       * ADD ALL DEALER CONTROLS HTML TO PAGE:
       *******************************************/

      $dealer_controls.append($cards_left);
      $dealer_controls.append($deal_all_buttons);
      $dealer_controls.append($card_confirmed_button);

      const $acey_buttons = $("<span />", {
         id: "acey-buttons",
      });

      $acey_buttons.append($post_button);
      $acey_buttons.append($dbl_post_button);
      $acey_buttons.append($win_a_d_button);
      $acey_buttons.append($lose_a_d_button);
      $dealer_controls.append($acey_buttons);

      $dealer_controls.append($next_label);
      $dealer_controls.append($next_down_button);
      $dealer_controls.append($next_up_button);
      $dealer_controls.append($action_select);

      $dealer_controls_top.append($set_game_select);

      $dealer_controls_top.append($payout_button);
      $dealer_controls_top.append($winners_select);
      $dealer_controls_top.append($new_game_button);
      $dealer_controls_top.append($new_back_button);
      $dealer_controls_top.append($dealer_select);


      //horizontal rule:
      $dealer_controls_top.append('<br /><hr />');

      /*****************************
       * PLAYER CONTROLS
       *****************************/

      //THE WHOLE FIELD OF PLAYERS WITH INFO AND CARDS:
      const $game_board = $('<div />', {
         id: 'game-board',
      });

      //LOG OUT button:
      const $logout_button = $('<button />', {
         id: "logout-btn",
         text: 'LOGOUT',
      });
      //CHECK BUTTON:
      const $check_button = $('<button />', {
         id: 'check-button',
         title: 'To pass the bet (assuming you are not light any amount)',
         text: '(C)heck/In',
      });
      //CALL BUTTON
      const $call_button = $('<button />', {
         id: 'call-button',
         title: 'Call the current bet amount (your "shy" amount)',
         text: 'Call',
      });
      //ANTE BUTTON
      const $ante_button = $('<button />', {
         id: "ante-btn",
         title: "Ante or pay to the pot 1 chip/doesn't affect \"shy\" displays",
         text: 'Ante/Add:',
      });


      $logout_button.click(function () {
         game.logout();
      });

      $check_button.click(function () {
         //if not light any amount, you can check:
         if (_.max(_.map(game_state.players, 'chips_in')) - current_player.chips_in == 0 ||
            game_state.game_name === "Man-Mouse") {
            game.in_man_mouse();

            game.bet(0);
            $bet_input.val('');

         } else
            swal("Hey!", "You must match the amount you are shy or fold!")
      });
      $call_button.click(function () {
         game.call();
      });

      //ANTE AMOUNT INPUT FIELD:
      const $ante_input = $('<input />', {
         id: 'ante-input',
         type: 'number',
         min: 0,
      });

      $ante_button.click(function () {
         if ($ante_input.val().length === 0)
            game.ante(1);
         else if ($ante_input.val() > 0) {
            game.ante($ante_input.val());
            $ante_input.val('');
         }
      });

      //
      //MENU for +$10, logout, reset game
      //set game selector to show name of game on screen:
      //
      const $other_select = $('<select />', {
         id: 'other-select',
         title: "Less-frequently-used player controls",
      });

      $other_select.empty();
      $other_select.append('<option selected disabled value="prompt">Other:</option>');
      $other_select.change(function () {
         switch ($(this).val()) {
            case 'buy-in':
               game.buy_in(40);
               break;
            case 'log-out':
               game.logout();
               break;
            case 'ante':
               game.ante(1);
               break;

            case 'name-only':
               game.set_player_num(current_player.id, 0);
               break;
            case 'dollars':
               game.set_player_num(current_player.id, 1);
               break;
            case 'dollars-and-buy-in':
               game.set_player_num(current_player.id, 2);
               break;
            case 'leave-seat':
               game.leave_seat();
               break;
            case 'return-to-seat':
               game.return_to_seat();
               break;
            default:
               break;
         }
         $(this).val('prompt');
      });

      var other_functions = [
         ['💰 BUY-IN $10', 'buy-in'],
         ['=========================', ''],
         ['NAME DISPLAY:', ''],
         ['👤   (name only)', 'name-only'],
         ['👤 💰 (name, current $$)', 'dollars'],
         ['👤 💰/💰 (name, current $$ / buy-in $$)', 'dollars-and-buy-in'],
         ['=========================', ''],
         ['⇦🚶 LEAVE SEAT', 'leave-seat'],
         ['⇨💺 RETURN TO SEAT', 'return-to-seat'],
         ['=========================', ''],
         ['👋 LOG OUT', 'log-out'],

      ];

      _.forEach(other_functions, ([label, id]) => {
         const $a_function = $('<option />', {
            value: id,
         });
         $a_function.text(label);
         $other_select.append($a_function);
      });

      //BUY-IN 10 CHIPS BUTTON:
      const $buy_10_button = $('<button />', {
         id: "buy-10-btn",
         title: "Buy-in to the game for $10 more",
         text: '+$10',
      });
      $buy_10_button.click(function () {
         game.buy_in(40);
      });

      //GAME NAME DISPLAY:
      const $game_name_display = $('<span />', {
         id: 'game-name-display',
         title: "instructions coming soon!"
      });

      const $common_info = $('<span />', {
         id: 'common-info',
      });

      // SET UP ALL PLAYER CONTROLS:
      const $player_controls = $('<span />', {
         id: 'player-controls',
      });

      //FOLD BUTTON:
      const $fold_button = $('<button />', {
         id: 'fold-button',
         title: 'Fold.  Your cards will disappear',
         text: 'Fold/Out',
      });


      $fold_button.click(function () {
         game.fold();
      });

      //BET AMOUNT INPUT FIELD:
      const $bet_input = $('<input />', {
         id: 'bet-input',
         type: 'number',
         min: 1,
         value: 1,
      });

      //BET BUTTON:
      const $bet_button = $('<button />', {
         id: 'bet-button',
         title: 'Bet the amount you\'ve typed in the box; moves to next player',
         text: 'Bet:',
      });
      $bet_button.click(function () {
         if ($bet_input.val() > 0) {
            const amount = +$bet_input.val();
            game.bet(amount);
            $bet_input.val('');
            console.log("BET: " + amount);
         }
      });

      //    const $pot_buttons = $('<span />',{
      //      id:"pot-buttons",
      //    })
      //BET BUTTONS 1-8:
      const $bet_buttons = $('<span />');

      for (let i = 1; i <= 8; i++) {

         const $bet_button_num = $('<button />', {
            class: 'bet-buttons',
            title: 'Bet this many chips; moves to next player',
            text: i,
         });
         $bet_button_num.click(function () {
            const amount = +i;
            game.bet(i);
            console.log("Recent BET: " + i);

         });
         $bet_buttons.append($bet_button_num);
      }

      const $bet_button_half_pot = $('<button />', {
         class: 'bet-buttons',
         id: 'bet-button-half-pot',
         title: 'Bet half pot',
         text: "Pot/2",
      });
      $bet_button_half_pot.click(function () {
         game.bet_half_pot();
      });


      const $bet_button_pot = $('<button />', {
         class: 'bet-buttons',
         id: 'bet-button-pot',
         title: 'Bet  pot',
         text: "POT",
      });
      $bet_button_pot.click(function () {
         game.bet_pot();
      });

      //DISPLAY AMOUNT EACH PLAYER HAS:
      const $player_money_display = $('<span />', {
         id: 'player-money-display',
      });

      /*******************************************
       * ADD ALL PLAYER CONTROLS HTML TO PAGE:
       *******************************************/

      $player_controls.append($ante_button);
      $player_controls.append($ante_input);
      $player_controls.append($fold_button);
      $player_controls.append($check_button);
      $player_controls.append($call_button);
      $player_controls.append($bet_button);

      $player_controls.append($bet_input);
      $player_controls.append($bet_buttons);
      $player_controls.append($bet_button_half_pot);
      $player_controls.append($bet_button_pot);



      /*******************************************
       * BUILD ENTIRE PAGE:
       *******************************************/

      $header.append($logo_link);
      $header.append($dollar_dot);
      $header.append($dealer_controls_top);
      $header.append($dealer_controls);
      $header.append('<hr \>');

      $header.append('<br />');
      $header.append($player_money_display);
      $header.append($player_controls);

      $header.append($other_select);
      $header.append($common_info);

      $header.append($game_name_display);

      $header.append('<hr />');

      $app.append($header);
      $app.append($game_board);


      Mousetrap.bind('q', function () {
         if (!showing_login_screen) {
            game.toggle_allow_show_chip_totals();
         }
      });
      Mousetrap.bind('ctrl+`', function () {
         if (!showing_login_screen) {
            game.next_dealer();
         }
      });

      Mousetrap.bind('ctrl+shift+`', function () {
         if (!showing_login_screen) {
            game.fold_current_player();
         }
      });
   }

   function getGame() {
      var gameName = prompt("Please enter the game name:", "(game name)");
      if (gameName == null || gameName == "")
         gameName = "(no name given)";
      return gameName;
   }
   /*********************************
    * RENDER ALL COMPONENTS OF GAME
    ********************************/
   function render_game() {
      $("#new-game-button").prop("disabled", game_state.pot != 0);
      $("#set-game-select").prop("disabled", game_state.pot != 0);

      if (prev_game_state != null && prev_game_state.message === '' && game_state.message !== '') {
         // alert(game_state.mesage);
         swal(game_state.message);
      }

      //if no players in game, call setup:
      if ($('#game-board').length === 0) {
         setup_game_html();
      }
      $("#cards-left").text(`${game_state.deck.length} cards left`);

      //SHOW CONTROLS IN CURRENT DEALER's VIEW:
      if (game_state.dealer === current_player.id) {
         // alert("DEALER: You can hover over each game title in Select Game to see rules");
         $('#dealer-controls').show();
         $('#dealer-controls-top').show();
      } else {
         $('#dealer-controls').hide();
         $('#dealer-controls-top').hide();
      }

      //show all active players in the winners select menu
      const $winners_select_content = $('#winners-select-content');
      $winners_select_content.empty();
      _.forEach(game_state.players, player => {
         const $player_row = $('<label />', {
            for: `winners-select-player-${player.id}`,
         });

         const $player_input = $('<input />', {
            type: 'checkbox',
            id: `winners-select-player-${player.id}`,
         });


         $player_row.append($player_input);

         if (player.in_hand && !player.left_seat)
            $player_row.append(player.name);
         else {
            const $player_name = $('<span />', {
               id: "p-n",
            });
            $player_name.css("font-size", "10px");
            $player_name.append(`${player.name} - out`);
            $player_row.append($player_name);
         }

         $winners_select_content.append($player_row);
         //      }
      });

      $("#logo-link").on('click', function () {
         show_instructions();
      });
      $("#dollar-dot").dblclick(function () {
         show_chip_totals();
      });


      //show all active players in the dealer select menu
      const $dealer_select = $('#dealer-select');
      $dealer_select.prop("title", "Changes dealer to any other player; leaves cards and pot alone");
      $dealer_select.empty();
      $dealer_select.append('<option selected disabled>Change Dealer (maintains cards/bets)</option>');
      _.forEach(game_state.players, player => {
         if (player.id !== current_player.id) {
            const $player_option = $('<option />', {
               value: player.id,
            });
            $player_option.text(player.name);
            $dealer_select.append($player_option);
         }
      });

      const $set_game_select = $('#set-game-select');
      $set_game_select.val(game_state.game_name);



      //GAME NAME DISPLAY (also acey-ducey rounds and total games played):
      const $game_name_display = $('#game-name-display');
      let gn_disp = "#" + game_state.game_count + " " + game_state.game_name;
      if (game_state.game_name === "Acey-Ducey") {
         const num_rounds = Math.ceil((game_state.acey_ducey_deals + 1) / game_state.players.length);
         gn_disp += " round:" + num_rounds + " ";
      }

      $game_name_display.text(gn_disp);
      $game_name_display.prop("title", game_state.instructions);

      const $discard_button = $('#discard-btn');

      //make down cards outline in black to show discarding
      var downs = $(".down-card").children();
      downs.toggleClass("discard-ready");

      //alter discard mode button depending on mode:
      if (game_state.discard_mode) {
         $("#discard-btn").removeClass("not-discard-mode");
         $("#discard-btn").addClass("discard-mode");
      } else {
         $("#discard-btn").removeClass("discard-modediscard-mode");
         $("#discard-btn").addClass("not-discard-mode");
      }


      const $common_info = $('#common-info');
      $common_info.empty();

      //update pot display:
      const $pot_display = $('<span />', {
         id: "pot-display",
         title: "Shows current amount in Pot and most recent bet in parentheses",
      });
      const $pot_display_pot = $('<span />');
      const $pot_display_last_bet = $('<span />', {
         id: 'pot-display-last-bet'
      });
      const $cards_left_display = $('<span />', {
         id: 'cards-left-display'
      });
      let card_img_name1 = '2B' + game_state.card_back_num;
      const $card_backing = $('<img />', {
         id: "card-backing",
         src: `card_images/${card_img_name1}.svg`,
      });

      $pot_display_last_bet.addClass('pot-display-last-bet');
      $pot_display_pot.text(`POT $${formatChips(game_state.pot)}`);
      $pot_display_last_bet.text(`(${formatChips(game_state.last_bet)})`);
      $cards_left_display.text(`${game_state.deck.length} `);

      $pot_display.append($pot_display_pot);
      $pot_display.append($pot_display_last_bet);
      $common_info.append($pot_display);
      $common_info.append($cards_left_display);
      $common_info.append($card_backing);

      //show hand of all active players:
      if (current_player.in_hand && !current_player.left_seat)
         $('#player-controls').show(1000); //animate controls 1 sec
      else
         $('#player-controls').hide(1000);

      //set the max a player can bet to their chips:
      $('#bet-input').prop('max', current_player.chips);

      if (game_state.hand_started) {
         $('#fold-button').text('Fold');
      } else {
         $('#fold-button').text('SitOut');
      }
      //reset all buttons/hide acey-ducey buttons:
      $('#check-button').text('Check'); //re-set if last game was man-mouse ("in")
      //hide acey-ducey buttons:
      $('#post-button').hide();
      $('#dbl-post-button').hide();
      $('#win-a-d-button').hide();
      $('#lose-a-d-button').hide();
      $('#bet-button-half-pot').hide();
      $('#bet-button-pot').hide();
      //make sure all other buttons are back:
      $('#check-button').css('margin-right', '10px')
      $('#check-button').show();
      $('#call-button').show();
      $('#bet-button').show();
      $('#bet-input').show();
      $('#fold-button').show();

      if (game_state.game_name === "Man-Mouse") {
         $('#fold-button').text('Out');
         $('#check-button').text('In');
         $('#check-button').css('margin-right', '40px');
         $('#call-button').hide();
         $('#bet-button').hide();
         $('#bet-input').hide();
      }
      //remove some buttons for acey-ducey
      if (game_state.game_name === "Acey-Ducey") {
         $('#fold-button').hide();
         $('#check-button').hide();
         $('#call-button').hide();
         $('#post-button').show();
         $('#dbl-post-button').show();
         $('#win-a-d-button').show();
         $('#lose-a-d-button').show();
         $('#bet-button-half-pot').show();
         $('#bet-button-pot').show();
      }
      if (game_state.game_name === "Midnight Baseball")
         $('#bet-button-pot').show();
      //update player's money amount:
      if (current_player.info_num === 2)
         $('#player-money-display').text(`${current_player.name} $${formatChips(current_player.chips)}/${formatChips(current_player.buy_in)}`);
      else if (current_player.info_num === 1)
         $('#player-money-display').text(`${current_player.name} $${formatChips(current_player.chips)}`);
      else
         $('#player-money-display').text(`${current_player.name}`);


      if (game_state.wait_for_card) {
         $("#card-confirmed-button").addClass("confirm");
         swal("Dealer: Confirm", "The dealer will need to hit the Confirm Card button to continue");
      } else
         $("#card-confirmed-button").removeClass("confirm");
      if (game_state.wait_for_bet){
         swal("Dealer: Admonish Player", "Don't deal the 3rd card until the player bets");
         game.reset_wait_for_bet();
      }
      //game board has all players:
      const $game_board = $('#game-board');
      $game_board.empty();

      /****************************
       * EACH PLAYER'S NAME/CARDS:
       ***************************/

      const $player_seats = $('<div />');
      $player_seats.addClass('player-seats');


      //CREATE EACH player BASED ON players in game_state
      _.forEach(game_state.players, (player) => {
         const $player_seat = $('<div />');
         $player_seat.addClass('player-seat');

         if (player.connected)
            $player_seat.addClass('player-connected');
         else
            $player_seat.addClass('player-disconnected');


         //add name:
         const $player_name = $('<div />');
         //allow to click on name to set as active player
         $player_name.click(function () {
            game.set_active_player(player.id);
         });
         $player_name.addClass('player-name');

         //determine if this player is the dealer:
         if (game_state.dealer === player.id) {
            $player_seat.addClass('dealer');
            $player_name.addClass('dlr'); //to color only left purple
         }
         if (game_state.active_player === player.id)
            $player_seat.addClass('active-player');



         //add ante, dealer indicators:
         if (player.in_hand && player.anted && !player.left_seat)
            $player_name.append('<span style="color:red"> ✓ </span>');
         $player_name.append(player.name);
         if (game_state.dealer === player.id)
            $player_name.append(" ♠")

         //add row of chips (40 = $10 each chip)
         const $chip_stack_display = $('<div />');
         $chip_stack_display.addClass('chips-display');
         $chip_stack_display.click(function () {
            game.set_active_player(player.id);
         });

         let chip_count = Math.round(player.chips / 40);
         if (player.chips > 0 && chip_count === 0)
            chip_count = 1;
         _.forEach(new Array(chip_count), () => {
            $chip_stack_display.append('<img src="chips_images/chip.png" />');
         });

         //chips shy display:
         const $chips_shy = $('<div />');
         $chips_shy.click(function () {
            game.set_active_player(player.id);
         });
         $chips_shy.addClass('chips-shy');
         let $chips_in_disp = _.max(_.map(game_state.players, 'chips_in')) - player.chips_in;
         let $last_chips = "";

         if (player.ante_is_last_bet)
            $last_chips = player.last_ante;
         else
            $last_chips = player.last_bet;

         $('.chips-shy').css({
            color: 'white',
         });
         //if folded, remind player of that:
         if (!player.in_hand && game_state.hand_started) {
            if (game_state.game_name === "Man-Mouse")
               $chips_shy.text("OUT");
            else
               $chips_shy.text('<⚐⚐ FOLDED ⚐⚐>');
            $chips_shy.css({
               color: 'black',
               backgroundColor: 'pink',
               height: '25px',
               fontFamily: 'Open Sans Condensed',
               textAlign: 'center',

            });
         }


         //only show shy amount if not playing man-mouse and you didn't sit out:
         else if (game_state.game_name !== "Man-Mouse" && !player.left_seat) {
            if (game_state.game_name !== "Acey-Ducey")
               $chips_shy.text(`SHY:${$chips_in_disp} (last:${$last_chips})`);
            else if (game_state.active_player === player.id)
               $chips_shy.text(`BET:${$last_chips}`);
         } else if (game_state.game_name !== "Man-Mouse")
            $chips_shy.text(' ');
         else if (player.in_man_mouse) {
            $chips_shy.text("IN");

            $chips_shy.css({
               color: 'black',
               backgroundColor: '#90ee90',
               height: '25px',
               fontFamily: 'Open Sans Condensed',
               textAlign: 'center',

            });
         }
         //      else
         //      {
         //        $chips_shy.text("OUT");
         //
         //        $chips_shy.css(
         //        {
         //          color: 'black',
         //          backgroundColor: '#90ee90',
         //          height: '25px',
         //          fontFamily: 'Open Sans Condensed',
         //          textAlign: 'center',
         //        });
         //      }
         //button to kick if disconnected:
         const $kick_button = $('<button />');
         $kick_button.addClass('kick-button');
         $kick_button.text('Kick');
         $kick_button.on('click', function () {
            game.kick(player.id);
         });

         /*****************************************
          * CARDS FOR EACH PLAYER (also determines up and down):
          *****************************************/

         //NOTE: player.in_hand = fold or not (or if sat out)
         const $hand = $('<div />');
         $hand.addClass('hand');

         if (!player.left_seat) {
            _.forEach(player.hand, (card, idx) => {
               let card_img_name; //up side of card

               //span for up and down together:
               var $up_with_down = $('<span />', {
                  id: 'up-with-down',
               });

               //down card - will be behind part of upcard
               var $card_img2;


               //if down card show card and backing....
               //       first the card:
               if (!card.up && player.id === current_player.id) {
                  card_img_name = '2B' + game_state.card_back_num;
                  $card_img2 = $('<img />', {
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

               //show card up to player or show card image:
               if (card.up || player.id === current_player.id && game_state.game_name != "Midnight Baseball")
                  card_img_name = card.card;
               else
                  card_img_name = '2B' + game_state.card_back_num;

               const $card_img = $('<img />', {
                  src: `card_images/${card_img_name}.svg`,
               });

               $card_img.addClass('card');
               if (idx === 5) {
                  $card_img.addClass('sixth_card');
               }

               //outline cards
               if (!card.up && player.id === current_player.id && game_state.discard_mode)
                  $card_img2.addClass('discard-ready'); //show black outline around down cards

               //show halfup half down
               if (!card.up && player.id === current_player.id)
                  $card_img.addClass('down-card');

               $up_with_down.append($card_img);

               //allow player to click down card to make up:
               if (player.id === current_player.id) {
                  $card_img.dblclick(function () {
                     if (game_state.discard_mode) //add to upcard
                        game.discard(idx);
                     else
                        game.flip(idx);
                  });
                  if (!card.up) //add to down card
                     $card_img2.dblclick(function () {
                        if (game_state.discard_mode)
                           game.discard(idx);
                        else
                           game.flip(idx);
                     });
               }
               $hand.append($up_with_down);
            });
         }
         //BUTTONS TO DEAL ONE CARD TO SPECIFIC PLAYER:
         const $up_button = $('<button />', {
            id: 'up-button',
            title: 'Deal 1 up card to this player',
            text: 'UP',
         });
         const $down_button = $('<button />', {
            id: 'down-button',
            title: 'Deal 1 down card to this player',
            text: 'DN',
         });

         $up_button.click(function () {
            game.set_active_player(player.id);
            game.one_card(true);
         });
         $down_button.click(function () {
            game.set_active_player(player.id);
            game.one_card(false);
         });

         if (player.in_hand && game_state.dealer === current_player.id && !player.left_seat) {
            $hand.append($up_button);
            $hand.append($down_button);
         }

         const $player_info = $('<span />', {
            id: "player-info"
         });
         $player_name.append($kick_button);

         //ADD ALL STUFF TO PLAYER SEAT
         $player_seat.append($player_name);
         $player_seat.append($chips_shy);
         $player_seat.append($chip_stack_display);
         $player_seat.append($hand);

         //allow to click anywhere to set as active player
         $player_seat.click(function () {
            //        if (player.in_hand && !player.left_seat)
            //          game.set_active_player(player.id);
         });

         //ADD THIS SEATS TO ALL SEATS:
         $player_seats.append($player_seat);
      });


      //COMMON CARDS:
      const $common_display = $('<div />', {
         id: "common-display",
      });
      //common card images:
      const $common_hand = _.map(game_state.common_cards, (card) => {
         let card_img_name;
         card_img_name = card;

         const $card_img = $('<img />', {
            src: `card_images/${card_img_name}.svg`,
         });

         $card_img.addClass('common-card');
         return $card_img;
      });

      $common_display.append($common_hand);

      //Reshuffle display for acey-ducey only when 1 card goes to 52 cards:
      const $reshuffle_display = $('<div>', {
         id: "reshuffle-display",
         text: "RESHUFFLED!",
      });
      const $reshuff_wrapper = $('<center \>');


      $game_board.append($common_display);

      $reshuff_wrapper.append($reshuffle_display);
      $game_board.append($reshuff_wrapper);

      if (game_state.reshuffled)
         $("#reshuffle-display").show();
      else
         $("#reshuffle-display").hide();

      $game_board.append($player_seats);
   }

   let show_summary = false;

   function format_$_for_table(num) {
      let s = "" + num;
      let num_spaces = 6 - s.length;
      let spaces = "";
      for (let i = 0; i < num_spaces; i++)
         spaces += "&nbsp";

      return spaces + s;
   }

   function formatDate() {
      var d = new Date(),
         month = '' + (d.getMonth() + 1),
         day = '' + d.getDate(),
         year = d.getFullYear();

      if (month.length < 2)
         month = '0' + month;
      if (day.length < 2)
         day = '0' + day;

      return [month, day, year].join('-');
   }

   function show_chip_totals() {

      //      game_state.mark_dirty();
      //      works = false;
      let t = 'Game Played On: ' + formatDate() + '<br><br><a onclick="location.reload()" style="color:red; font-size:50px; cursor:pointer;">⇦⇦⇦<u>BACK</u></a><br> <span style="font-size:20px; color: gray">(don\'t use browser back button)</span></a><br>';
      t += "<table style='width:30%' id='summary'>";
      t += "<tr><th>NAME</th><th>HAS:</th>";
      //      <th>BUY-IN:</th><th colspan='2' style='text-align:center'>Result:</th></tr>";

      //go through each player to show their data in table:
      for (var i = 0; i < game_state.players.length; i++) {
         let p = game_state.players[i];

         //update player's money amount:
         t += "<tr><td>" + p.name + "</td>" +
            "<td>$" + format_$_for_table(formatChips(p.chips)) + "</td>";
      }
      t += "</table>";

      $('body').css({
         backgroundColor: 'black'
      });
      $('body').html('<br><Br>' + t + '</body></html>');
   }

   function show_instructions() {
      window.open('instr/index.html', '_blank');
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