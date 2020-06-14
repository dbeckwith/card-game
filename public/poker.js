var suits = ["S", "D", "C", "H"];
var values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
var names = ["Jason", "Eve", "Patrick", "Sarah", "Wati", "Paul", "Ned", "Philecia", "James", "Andrew"];

var players = [];
var start_player = 0; //player that receives first card and bets first
var current_player = 0;
var current_card_up = true;
var num_players = players.length; //tracks how many players didn't opt out
var common_cards = [];
var pot = 0;
var bet = 0;
var draw_mode = false;
var current_player_name = "";

function login(name){
    current_player_name = name;
    window.location.replace("poker.html");
    //go to poker.html which has onload
}
function set_bet() //took out argument player
{
    //called when Bet button pressed

    bet = parseInt(document.getElementById("bet").value);
    if (typeof bet !== "undefined" && !Number.isNaN(bet))
    {
        pot += bet;
        players[current_player].chips -= bet;
        document.getElementById("my_chips").innerHTML = "My chips: " + players[current_player].chips;
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

/**
 * create player objects
 */
function setup()
{
    for (var i = 0; i < names.length; i++)
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
    var deck = new Array();

    for (var i = 0; i < suits.length; i++)
    {
        for (var x = 0; x < values.length; x++)
        {
            var card = {
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
    var i = 0,
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
    for (i = 0; i < players.length; i++)
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
    game_started = false;
    common_cards = [];
    document.getElementById("numcards").style.backgroundColor = "transparent";

    deck = getDeck();
    shuffle_fisher_yates(deck);
    turn_in_cards();
    start_player = start_player + 1;
    start_player %= players.length;
    current_player = start_player;
    update_display(false);
}
/**
 * flip the card from face to back or vice versa
 */
function flip(i, j)
{
    cd = players[i].hand[j];
    cd.up = !cd.up;
    update_display(false);
}

function flip_common(i)
{
    cd = common_cards[i];
    cd.up = !cd.up;
    update_display(false);
}

/**
 * Deal a single card
 * @param up_card boolean up or down card
 */
function one_card(up_card)
{
    dealt = false;

    while (!dealt)
    {
        //not folded and isn't sitting out:
        if (!players[current_player].fold && players[current_player].playing)
        {
            dealt = true;
            card = get_next_card();
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
    card = get_next_card();
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
    for (var d = 0; d < down; d++)
    {
        count = 0;
        for (var i = 0; i < players.length; i++)
        {
            count += check_and_deal_card(count, false);
        }
    }
    //ups:
    for (var u = 0; u < up; u++)
    {
        count = 0;
        for (var i = 0; i < players.length; i++)
        {
            count += check_and_deal_card(count, true);
        }
    }
}


function fold()
{
    players[current_player].fold = true;
    //turn all cards over:
    for (var j = 0; j < players[current_player].hand.length; j++)
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
    card = get_next_card();
    if (typeof card !== 'undefined')
    {
        common_cards.push(card);
        common_disp = "";
        for (var i = 0; i < common_cards.length; i++)
            common_disp += "<img class='card' onclick='flip_common(" + i + ")'  src='card_images/1B.svg'>";

        update_display(false);

        document.getElementById("common").innerHTML = common_disp;
    }
}
/**
 */
function getChipMax()
{

    max = 0;
    for (var i = 0; i < players.length; i++)
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

    display = "<table>";

    max = getChipMax();
    //two columns of players, 5 per column:
    for (var i = 0; i < Math.ceil(players.length / 2); i++)
    {
        for (var col = 0; col < 2; col++)
        {
            loc = i + 5 * col; //loc in second column

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
                if (loc == current_player + 1)
                    clr_add = "color:yellow'";
                else if (loc == start_player - 1)
                    clr_add = "color:red'";
                else
                    clr_add = "'"

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
                for (j = 0; j < players[loc].hand.length; j++)
                {
                    //last card only should show animation:
                    if (loc == current_player && j == players[i].hand.length - 1 && slide)
                        add_id = " id='last' ";
                    else
                        add_id = "";

                    curr_card = players[loc].hand[j];

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
    common_disp = "";
    for (var i = 0; i < common_cards.length; i++)
    {
        if (common_cards[i].up)
            common_disp += "<img class='card' onclick='flip_common(" + i + ")' src='card_images/" + common_cards[i].value +
            common_cards[i].suit + ".svg'>";
        else
            common_disp += "<img class='card' onclick='flip_common(" + i + ")'  src='card_images/1B.svg'>";
    }
    document.getElementById("common").innerHTML = common_disp;


}
