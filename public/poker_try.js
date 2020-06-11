var suits = ["S", "D", "C", "H"];
var values = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "T", "J", "Q", "K"];
var names = ["Jason", "Eve", "Patrick", "Sarah", "Wati", "Paul", "Ned", "Philecia", "James", "Andrew"];

var players = [];
var current_players = []; //players not folder, not sitout
var start_player = 0; //player that receives first card and bets first
var current_player = 0; 
var current_card_up = true;
var num_players = players.length; //tracks how many players didn't opt out

//SELECT MENUS FOR BETTING:
var menu1 = '<select name="bet" id="bet"' //allows for class for last player for slide fx
var menu2 =
    '<option value="bet">BET</option>' +

    '<option value="chk">Check</option>' +
    '<option value="c1">1</option>' +
    '<option value="c2">2</option>' +
    '<option value="c3">3</option>' +
    '<option value="c4">4</option>' +
    '<option value="c5">5</option>' +
    '<option value="c6">6</option>' +
    '<option value="cpot">POT</option>' +
    '<option value="chalf">1/2 POT</option>' +
    '<option value="cother">Other</option>' +
    '</select>'



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
            chips: 25,
            fold: false,
            playing: true
        });
    }
    setup_hand();
}

function setup_hand()
{
    for (var i = 0; i < names.length; i++)
    {
        curr_players.push(
        {
            name: names[i],
            hand: [],
            chips: 25,
            fold: false,
            playing: true
        });
    }
}
function remove_player_from_hand(name){
    for (var i = 0; i < curr_players.length; i++)
    {
        if(curr_players[i].name === name)
        {
            curr_players = curr_players.slice(i,i);
            break;
        }
    }
        
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
    deck = getDeck();
    shuffle_fisher_yates(deck);
    turn_in_cards();
    start_player = start_player + 1;
    current_player = start_player;
//    rotate_deal();
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

/**
 * Deal a single card
 * @param up_card boolean up or down card
 */
function deal_card(up_card)
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
                
                current_player ++;
                current_player %= players.length;
            }
        }
        else //try next player
        {
            current_player ++;
            current_player %= players.length;
        }
    }
}
/**
 * deal one up card to every active player
 */
function oneupall()
{
    game_started = true;
    
    current_player = start_player; 
    
    for (p = 0; p < players.length; p++)
    {
        if (!players[p].fold && players[current_player].playing)
        {
            deal_card(true)
        }
        else
        {
            current_player ++;
            current_player %= players.length;
        }
    }
}

function onedownall()
{
    game_started = true;

    current_player = start_player;

    for (var i = 0; i < players.length; i++)
    {
        if (!players[i].fold)
            deal_card(false)
        else
        {
            current_player ++;
            current_player %= players.length;
        }
    }
}

function fivedown()
{
    game_started = true;

    current_player = start_player;

    for (var j = 0; j < 5; j++)
        for (var i = 0; i < players.length; i++)
        {
            if (!players[i].fold && players[current_player].playing)
                deal_card(false)
            else
            {
                current_player ++;
                current_player %= players.length;
            }
        }
}

function twodownoneup()
{
    game_started = true;

    current_player = start_player;

    for (var j = 0; j < 2; j++)
        for (var i = 0; i < players.length; i++)
        {
            if (!players[i].fold && players[current_player].playing)
                deal_card(false)
            else
            {
                current_player ++;
                current_player %= players.length;
            }
        }
    for (var i = 0; i < players.length; i++)
    {
        if (!players[i].fold && players[current_player].playing)
            deal_card(true)
        else
        {
            current_player ++;
            current_player %= players.length;
        }
    }
}

function fold(p)
{
    curr_players[p].fold = true;
    for (var j = 0; j < curr_players[p].hand.length; j++)
        curr_players[p].hand[j].up = false;
    remove_player_from_hand()
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

function update_display(slide)
{
    document.getElementById("numcards").innerHTML = "remaining cards: " + deck.length;
    if (deck.length == 0)
        document.getElementById("numcards").style.backgroundColor = "red";
    display = "<table>";

    for (i = 0; i < Math.ceil(players.length / 2); i++)
    {
        for (col = 0; col < 2; col++)
        {
            loc = i + 5 * col;
            if (loc < players.length)
            {
                if (loc < 5)
                    display += "<tr><td>";
                else
                    display += "<td>";
                display += menu1 + loc + "'>" + menu2
                //2 buttons and the name:
                if (!game_started)
                    display += "<button id='fold' type='button' onclick='sitout(" + loc + ")'>" +
                    "SIT OUT</button>"
                if(loc == start_player - 1)
                    clr_add = "style='color:yellow'";
                else
                    clr_add = ""
                display += "<button id='fold' type='button' onclick='fold(" + loc + ")'>" + "FOLD</button><span " + clr_add + ">" + players[loc].name + "</span>";

                display += "</td><td>";

                for (j = 0; j < players[loc].hand.length; j++)
                {
                    //last card only should show animation:
                    if (loc == current_player && j == players[i].hand.length - 1 && slide)
                        add = " id='last' ";
                    else
                        add = "";

                    curr_card = players[loc].hand[j];

                    //back of card:
                    if (players[loc].fold)
                        display += "<img class='card' onclick='flip()' src='card_images/1B.svg'>";
                    else if (!players[loc].playing)
                        display += "<img class='card' onclick='flip()' src='card_images/1B.svg'>";
                    else if (curr_card.up)
                        display += "<img " + add + "class='card' onclick='flip(" + loc + ", " + j + ")' src='card_images/" +
                        curr_card.value + curr_card.suit +
                        ".svg'>";
                    else
                        display += "<img " + add + "class='card' onclick='flip(" + loc + ", " + j + ")' src='card_images/2B.svg'>";
                }
                if (loc < 5)
                    display += "</td>";
                else
                    display += "</td></tr>";
            }
        }
    }
    display += "</table>";
    display += "<br><span style='color:yellow'>DEALER IN YELLOW</span>";
    document.getElementById("field").innerHTML = display;

}
