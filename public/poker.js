import { CardGame } from './game_client.js';

let suits = ["S", "D", "C", "H"];
let values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
let names = ["Jason", "Eve", "Patrick", "Sarah", "Wati", "Paul", "Ned", "Philecia", "James", "Andrew"];

let players = [];
let start_player = 0; //player that receives first card and bets first
let current_player = 0;
let current_card_up = true;
let num_players = players.length; //tracks how many players didn't opt out
let common_cards = [];
let pot = 0;
let bet = 0;
let draw_mode = false;
let current_player_name = "";
let game_started;
let the_game;
let deck;



function set_bet() //took out argument player
{
    //called when Bet button pressed

    bet = parseInt(document.getElementById("bet").value);
    if (typeof bet !== "undefined" && !Number.isNaN(bet))
    {
        pot += bet;
        players[current_player].chips -= bet;
        document.getElementById("my_chips").innerHTML = current_player_name + "'s chips: " + players[current_player].chips;
        update_display(false);
    }
}

function check()
{
    current_player++;
    current_player %= players.length;
    update_display(false);

    //check button is clicked
}

function payout()
{
    //divide pot by all winners
}

function add(p)
{
    if (draw_mode)
    {
        current_player = p;
        one_card(false);
    }
    //add a card when playing a draw poker game
}

function draw()
{
    draw_mode = !draw_mode;
    if (draw_mode)
        document.getElementById("drawbtn").style.backgroundColor = "yellow";
    else
        document.getElementById("drawbtn").style.backgroundColor = "white";

    //called when Draw button clicked - puts in draw mode where
    //clicking card removes it
    //remember: user sees all up with border around down
    //also: dealer can now click add button to dole out cards
}

function render()
{
    if (current_player_name === "")
        set_login_screen();
    else
        set_game_screen();
}

function login()
{
    const name = document.getElementById("login_name").value;

    current_player_name = name;
    the_game.join(name);

    //show game field:
    set_game_screen();

}

function set_login_screen()
{
    let html = '<center><input id="login_name" style="width:210px; height:40px;font-size:20px;">' +
        '<br>' +
        '<button type="button" id="loginbutton">LOGIN</button><BR>' +
        '<HR>' +
        'CURRENT PLAYERS:</center>';
    document.getElementById("all").innerHTML = html;
    document.getElementById('loginbutton').onclick = () => {
        login();
    };
}

function set_game_screen()
{
    let html = '<center><a href="#" onclick="alert("CambridgePoker &copy;2020\nCredits:\nFront End: Anthony Beckwith\nBack End: Daniel Beckwith");">' +
        '<img src="favicon/android-icon-36x36.png" style="margin-bottom: 10px;">' +
        '</a><br>' +
        '<!-- dealer control buttons -->' +
        '<button id="drawbtn" style="margin-right:20px; border-color:black; border-radius:1px;" type="button" onclick="draw()">DRAW</button>' +

        '<button type="button" onclick="deal_all(5, 0)">5 DN</button>' +
        '<button type="button" onclick="deal_all(2, 1)">2 DN, 1 UP</button>' +
        '<button type="button" onclick="deal_all(0, 1)">1 UP</button>' +
        '<button type="button" onclick="deal_all(1, 0)">1 DN</button>' +
        '<button type="button" class="next" style="margin-left:20px" onclick="one_card(true)">Next UP</button>' +
        '<button type="button" class="next" onclick="one_card(false)">Next DN</button>' +
        '<button type="button" id="common_btn" onclick="deal_common()">COMMON DOWN</button>' +

        '<button type="button" class="restart_btn" style="margin-left: 40px;" onclick="reset_dealer()">Reset Dealer/Restart</button>' +
        '<button type="button" class="restart_btn" onclick="shuffle_restart()">Shuffle/Restart</button><br>' +

        '<!-- display elements -->' +
        '<span id="pot" style="font-size:24px;"></span>' +
        '<span id="last_bet" style="font-family: consolas; font-size:18px; color:beige;"></span>' +

        "<button id=' fold' style='margin-left: 40px; color:white;background-color: red' type='button' onclick='payout()'>PAY-OUT</button>" +
        '<br>' +
        '<div id="numcards"></div>' +

        '<!-- player control buttons -->' +
        "<button class='player_btn' type='button' onclick='fold()'>FOLD</button>" +

        "<input autocomplete='off' type='number' class='player_btn' size='4' maxlength='4' id='bet' name='fname' style='width:70px;' min='0' max='999'>" +
        "<button class='player_btn' type='button' onclick='set_bet()'>Bet</button>" +
        "<button class='player_btn' type='button' onclick='check()'>Check</button>" +

        '<span id="my_chips">' + current_player_name + '\'s Chips:</span>' +


        '</center>' +

        '<!-- all player controls and cards -->' +
        '<div id="field"></div>' +

        '<div id="common"></div>' +

        '<br>' +
        "<span style='color:yellow'>DEALER IN YELLOW</span>";
    document.getElementById("all").innerHTML = html;

    setup();
}

function setup()
{
    for (let i = 0; i < names.length; i++)
    {
        players.push(
        {
            name: names[i],
            hand: [],
            chips: Math.floor(Math.random() * 200), //random for testing - could be 120 = $30
            fold: false,
            playing: true
        });
    }
    shuffle_restart();
}


function reset_dealer()
{
    start_player = 0;
    shuffle_restart();
}
/**
 * returns an array of 52 card objects with value, suit, up or down
 */
function getDeck()
{
    let deck = new Array();

    for (let i = 0; i < suits.length; i++)
    {
        for (let x = 0; x < values.length; x++)
        {
            let card = {
                value: values[x],
                suit: suits[i],
                up: false
            };
            deck.push(card);
        }
    }
    return deck;
}


function shuffle_fisher_yates(deck)
{
    num_players = players.length;
    let i = 0,
        j = 0,
        temp = null

    for (i = deck.length - 1; i > 0; i -= 1)
    {
        j = Math.floor(Math.random() * (i + 1))
        temp = deck[i]
        deck[i] = deck[j]
        deck[j] = temp
    }
    return deck;
}


function get_next_card()
{
    return deck.pop();
}

/**
 * reset deck, for shuffle/restart
 */
function turn_in_cards()
{
    for (let i = 0; i < players.length; i++)
    {
        players[i].hand = [];
        players[i].fold = false;
        players[i].playing = true;
    }
}
//function rotate_deal(){
//    players.push(players.shift());
//}
/**
 * shuffle and reset everything
 */
function shuffle_restart()
{
    //in case num cards turned red when reached 0:
    document.getElementById("numcards").style.backgroundColor = "transparent";

    //reset variables:
    game_started = false;
    common_cards = [];
    pot = 0;
    bet = 0;

    //get deck and shuffle:
    deck = getDeck();
    shuffle_fisher_yates(deck);
    turn_in_cards();
    //next starting player
    start_player = start_player + 1;
    start_player %= players.length;
    current_player = start_player;
    //update with no slide in:
    update_display(false);
}
/**
 * flip the card from face to back or vice versa
 */
function flip(i, j)
{
    const cd = players[i].hand[j];
    cd.up = !cd.up;
    update_display(false);
}

function flip_common(i)
{
    const cd = common_cards[i];
    cd.up = !cd.up;
    update_display(false);
}

/**
 * Deal a single card
 * @param up_card boolean up or down card
 */
function one_card(up_card)
{
    let dealt = false;

    while (!dealt)
    {
        //not folded and isn't sitting out:
        if (!players[current_player].fold && players[current_player].playing)
        {
            dealt = true;
            const card = get_next_card();
            if (typeof card !== 'undefined')
            {
                if (!up_card)
                    card.up = false;
                else
                    card.up = true;

                player = players[current_player]
                player.hand.push(card);

                update_display(true);

                current_player++;
                current_player %= players.length;
            }
        }
        else //try next player
        {
            current_player++;
            current_player %= players.length;
        }
    }
}
/**
 * deals card; used in all multi-player deals (1UpAll, etc.)
 */
function deal_card(up_card)
{
    bet = 0;
    const card = get_next_card();
    if (typeof card !== 'undefined')
    {
        if (!up_card)
            card.up = false;
        else
            card.up = true;

        //get current player and add card to their hand:
        player = players[current_player]
        player.hand.push(card);

        update_display(true);

        //move to next player
        current_player++;
        current_player %= players.length;
    }
}
/**
 * check if player in and still players left to deal to, then deal card
 */
function check_and_deal_card(count, up)
{
    if (!players[current_player].fold && players[current_player].playing && count < num_players)
    {
        deal_card(up);
        return 1;
    }
    else //move to next player:
    {
        current_player++;
        current_player %= players.length;
        return 0;
    }
}
/**
 * Deals specified number of down and up cards to all active players
 */
function deal_all(down, up)
{
    game_started = true;
    current_player = start_player;

    //downs:
    for (let d = 0; d < down; d++)
    {
        count = 0;
        for (let i = 0; i < players.length; i++)
        {
            count += check_and_deal_card(count, false);
        }
    }
    //ups:
    for (let u = 0; u < up; u++)
    {
        count = 0;
        for (let i = 0; i < players.length; i++)
        {
            count += check_and_deal_card(count, true);
        }
    }
}


function fold()
{
    players[current_player].fold = true;
    //turn all cards over:
    for (let j = 0; j < players[current_player].hand.length; j++)
        players[current_player].hand[j].up = false;

    update_display(false);

    num_players -= 1;
}

function sitout(p)
{
    if (!game_started)
    {
        players[p].playing = false;
        num_players -= 1;
        update_display(false);
    }
}

function deal_common()
{
    const card = get_next_card();
    if (typeof card !== 'undefined')
    {
        common_cards.push(card);
        common_disp = "";
        for (let i = 0; i < common_cards.length; i++)
            common_disp += "<img class='card' onclick='flip_common(" + i + ")'  src='card_images/1B.svg'>";

        update_display(false);

        document.getElementById("common").innerHTML = common_disp;
    }
}
/**
 */
function getChipMax()
{

    let max = 0;
    for (let i = 0; i < players.length; i++)
    {

        if (players[i].chips > max)
            max = players[i].chips;
    }
    return max;

}
/**
 * updates all cards on field
 */
function update_display(slide)
{
    document.getElementById("pot").innerHTML = "POT: " + pot + " chips";
    document.getElementById("last_bet").innerHTML = "(last bet: " + bet + ")";
    document.getElementById("numcards").innerHTML = "remaining cards: " + deck.length;
    if (deck.length == 0)
        document.getElementById("numcards").style.backgroundColor = "red";

    let display = "<table>";

    const max = getChipMax();
    //two columns of players, 5 per column:
    for (let i = 0; i < Math.ceil(players.length / 2); i++)
    {
        for (let col = 0; col < 2; col++)
        {
            const loc = i + 5 * col; //loc in second column

            if (loc < players.length)
            {
                if (loc < 5)
                    display += "<tr><td>"; //first column, so start new row
                else
                    display += "<td>"; //second column, so start new data

                //BET select menu:
                //                display += menu1 + loc + "'>" + menu2

                //2 buttons and the name:
                if (!game_started)
                    display += "<button id='fold' type='button' onclick='sitout(" + loc + ")'>" +
                    "SIT OUT</button>"
                let clr_add;
                if (loc == current_player + 1)
                    clr_add = "color:yellow'";
                else if (loc == start_player - 1)
                    clr_add = "color:red'";
                else
                    clr_add = "'"

                let chip_img;
                if (players[loc].chips > 0)
                    chip_img = "<img src='chips_images/" + Math.ceil(players[loc].chips / max * 5) + ".png' style='width:30px;'>";
                else
                    chip_img = "";

                display +=

                    //ADD CARD
                    "<button  class='dlrbtns' type='button' onclick='add(" + loc + ")'>" + "Add</button>" +
                    //WIN BUTTON
                    "<button class='dlrbtns' type='button' onclick='won(" + loc + ")'>Won</button><br>" +

                    //NAME
                    "<span style='margin-left:5px;" + clr_add + ">" + players[loc].name + "</span>" +

                    chip_img + "<br>";

                display += "</td><td>";

                //the cards:
                for (let j = 0; j < players[loc].hand.length; j++)
                {
                    let add_id;
                    //last card only should show animation:
                    if (loc == current_player && j == players[i].hand.length - 1 && slide)
                        add_id = " id='last' ";
                    else
                        add_id = "";

                    const curr_card = players[loc].hand[j];

                    //out of game - grey back of card:
                    if (players[loc].fold || !players[loc].playing)
                        display += "<img class='card' onclick='flip()' src='card_images/1B.svg'>";
                    //in play - up card
                    else if (curr_card.up)
                        display += "<img " + add_id + "class='card' onclick='flip(" + loc + ", " + j + ")' src='card_images/" +
                        curr_card.value + curr_card.suit +
                        ".svg'>";
                    //in play - down card:
                    else
                        display += "<img " + add_id + "class='card' onclick='flip(" + loc + ", " + j + ")' src='card_images/2B.svg'>";
                }
                if (loc < 5)
                    display += "</td>";
                else
                    display += "</td></tr>";
            }
        }
    }

    display += "</table>COMMON:";

    document.getElementById("field").innerHTML = display;

    //common cards:
    let common_disp = "";
    for (let i = 0; i < common_cards.length; i++)
    {
        if (common_cards[i].up)
            common_disp += "<img class='card' onclick='flip_common(" + i + ")' src='card_images/" + common_cards[i].value +
            common_cards[i].suit + ".svg'>";
        else
            common_disp += "<img class='card' onclick='flip_common(" + i + ")'  src='card_images/1B.svg'>";
    }
    document.getElementById("common").innerHTML = common_disp;


}


window.onload = () => {
    the_game = new CardGame();
    the_game.on_update = (game_state) => {
        render();
    };
};
