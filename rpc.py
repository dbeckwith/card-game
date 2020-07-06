__author__ = 'D. Beckwith'

from player import Player, PlayerCard
import random, cards

class RPC(object):
    def __init__(self, ws, game_state):
        self.ws = ws
        self.game_state = game_state
        self.player_id = None
        self.player = None

    def connect(self, player_id):
        if self.player_id is not None or self.player is not None:
            raise ClientError('already connected')

        # record the connection for this id
        self.game_state.player_id_connections[player_id].append(self)

        self.player_id = player_id

        # check for existing player with this id
        player = self.game_state.get_player(player_id)
        if player is not None:
            # player exists, connect as that player
            player.connected = True
            self.player = player


    def login(self, name):
        '''
        called by Join button in opening screen
        makes new player object, adds player to game
        :param name: name of player
        '''
        if self.player is not None:
            raise ClientError('already logged-in')
        if self.player_id is None:
            raise ClientError('not connected')

        # create a new player
        player = Player(self.player_id, name)
        # add to the game
        self.game_state.add_player(player)
        # mark player as connected
        player.connected = True
        self.player = player

    def logout(self):
        '''called by Login button - takes player out of game'''
        if self.player is None:
            raise ClientError('not logged-in')

        # if this was the active player, pick the next one
        if self.game_state.active_player is self.player:
            self.game_state.next_active_player()

        # remove player from game
        self.game_state.remove_player(self.player)

        # log out every connection logged in as this player
        for rpc in self.game_state.player_id_connections[self.player_id]:
            rpc.player = None

    def kick(self, player_id):
        '''kick player out of game when kick clicked (for disconnected players)'''
        # find the player
        player = self.game_state.get_player(player_id)
        if player is None:
            raise ClientError('player not found')
        if player.connected:
            raise ClientError('cannot kick player while they are still connected')

        # if this was the active player, pick the next one
        if self.game_state.active_player is player:
            self.game_state.next_active_player()

        # remove player from game
        self.game_state.remove_player(player)

        # log out every connection logged in as this player
        for rpc in self.game_state.player_id_connections[player.id]:
            rpc.player = None

    def change_dealer(self, player):
        '''sets dealer to player argument'''
        player = self.game_state.get_player(player)
        if player is None:
            raise ClientError('player not found')  
        self.game_state.dealer = player
    

    def clear_hand(self):
        self.game_state.active_player.clear_hand()
        
    def new_game(self, from_menu):        
        self.game_state.new_game(from_menu)
    
    def reset_game(self):
        self.game_state.reset_game()

    def reset_antes_and_chips_in(self, chips):
        '''called after card dealt, to reset antes and chips in for this round'''
        players = list(self.game_state.players_in_hand())
        
        for player in players:
            player.anted = False 
            if chips:
                player.chips_in = 0
            
    def deal_all(self, down, up):
        '''
        Deal cards to every active player
        :param down: number of down cards to deal
        :param up: number of up cards to deal
        '''
        # dealing cards starts the hand
        self.game_state.hand_started = True
        self.reset_antes_and_chips_in(True)

        # only consider players in the hand
        players = list(self.game_state.players_in_hand())
        
      
        # check that deck has enough cards to give to each player
        if len(self.game_state.deck) < (down + up) * len(players):
            raise ClientError('deck does not have enough cards')
        
        # deal down cards:
        for _ in range(down):
            for player in players:
                card = self.game_state.draw_card()
                player.give_card(PlayerCard(card, False))
        # deal up cards:
        for _ in range(up):
            for player in players:
                card = self.game_state.draw_card()

                player.give_card(PlayerCard(card, True))
        
        
    def gertie(self):
        self.game_state.gertie()
        
    def one_card(self, up):
        '''
        deals one card to one player
        :param up: True if up card, False if down card
        '''
        
        if not self.game_state.wait_for_ace:
        
            self.game_state.hand_started = True
            
            self.reset_antes_and_chips_in(True)
            # don't deal card if acey ducey first card is ace and btn not yet pressed
            card = self.game_state.draw_card()
    
            self.game_state.active_player.give_card(PlayerCard(card, up))
            
            if len(self.game_state.deck) == 0 and self.game_state.acey_ducey_mode:
                # shuffle a new deck
                self.game_state.deck = cards.new_deck()  
                
            num_cards_in_hand = len(self.game_state.active_player.hand) 
            
            # acedy-ducey - stop if first ace:
            is_first_card = num_cards_in_hand == 1
            is_ace = card[0] == "1"
            if is_first_card and is_ace and self.game_state.acey_ducey_mode:    
                self.game_state.wait_for_ace = True
            else:
                self.game_state.wait_for_ace = False
            
            # go to next player unless it's draw mode or if you just completed a 5-card hand in 5-card draw:
            fifth_card = self.game_state.five_card_draw_mode and num_cards_in_hand == 5
    
            not_draw = not self.game_state.draw_mode
            not_midnight_four = self.game_state.game_name != "Midnight Baseball"
            
            if fifth_card or (not_draw and not_midnight_four):
                self.game_state.next_active_player()
            
            #if self.game_state.game_name == "Dirty Gertie" and card == "QS":
                #self.game_state.gertie() # clears hands/shuffles deck

    def ace_called(self):
        self.game_state.not_waiting_for_ace()
        
    def flip(self, card_num):
        '''
        flip down card to up
        :param card_num: card to flip
        '''
        self.player.hand[card_num].up = True

    def discard(self, card_num):
        '''
        flip down card to up
        :param card_num: card to flip
        '''
        del self.player.hand[card_num]

    def deal_common(self):
        '''deal one common up card'''
        self.game_state.hand_started = True
        self.reset_antes_and_chips_in(True)

        card = self.game_state.draw_card()
        self.game_state.common_cards.append(card)

    def toggle_draw_mode(self):
        self.game_state.draw_mode = not self.game_state.draw_mode

    def set_no_peek_mode(self, on):
        self.game_state.no_peek_mode = on

    def set_draw_mode(self, on):
        self.game_state.five_card_draw_mode = on

    def set_man_mouse_mode(self, on):
        self.game_state.man_mouse_mode = on
        
    def set_acey_ducey_mode(self, on):
        self.game_state.acey_ducey_mode = on
        self.game_state.draw_mode = on     
    
    def undo(self):
        # if they've made a bet or ante and are the active player, can undo
        if self.player.ante_is_last_bet is not None and self.game_state.active_player is self.player:
            if self.player.ante_is_last_bet:
                self.player.chips   += self.player.last_ante
                self.game_state.pot -= self.player.last_ante
            else:
                self.player.chips   += self.player.last_bet
                self.game_state.pot -= self.player.last_bet
            
        self.player.ante_is_last_bet = None
    def fold(self):
        '''fold current player'''
        if self.player is None:
            raise ClientError('not logged-in')
        if not self.player.in_hand:
            raise ClientError('not in hand')
        if self.game_state.active_player is not self.player:
            raise ClientError('not your turn')

        self.player.in_hand = False
        self.player.chips_in = 0

        self.game_state.next_active_player()

    def bet(self, amount):
        '''player bet - subtract from chips, add to pot, move to next player'''
        if self.player is None:
            raise ClientError('not logged-in')
        if not self.player.in_hand:
            raise ClientError('not in hand')
        if self.game_state.active_player is not self.player:
            raise ClientError('not your turn')
        
        if self.player.chips < amount:
            raise ClientError('not enough chips')
        
        bet_minimum = max(player.chips_in for player in self.game_state.players) \
            - self.player.chips_in
        if amount < bet_minimum:
            raise ClientError(f'you must bet at least {bet_minimum} chips')

        self.player.chips         -= amount
        self.game_state.pot       += amount
        self.game_state.last_bet   = amount
        self.player.chips_in      += amount
        self.player.chips_in_hand += amount
        
        self.player.last_bet = amount
        self.player.ante_is_last_bet = False
        
        
        self.reset_antes_and_chips_in(False)
        
        if not self.game_state.acey_ducey_mode:
            self.game_state.next_active_player()
    
    def call(self):
        if self.player is None:
            raise ClientError('not logged-in')
        if not self.player.in_hand:
            raise ClientError('not in hand')
        if self.game_state.active_player is not self.player:
            raise ClientError('not your turn')
        
        self.bet(max(player.chips_in for player in self.game_state.players) \
            - self.player.chips_in)

    def ante(self, amt):
        '''takes amt chips from player and puts in pot'''
        amt = int(amt)
        if self.player.chips < amt:
            raise ClientError('not enough chips')        
        self.player.chips -= amt
        self.game_state.pot += amt
        self.player.chips_in_hand += amt
        self.player.anted = True
        self.player.last_ante = amt
        self.player.ante_is_last_bet = True
        
    def pay_acey_ducey(self):
        ''' return player's bet and give them how much they won'''
        self.game_state.pay_acey_ducey()
    

        
    def pay_post(self, num):
        self.game_state.pay_post(num)
            
    def set_active_player(self, id):
        '''called when click on name to set as active player'''
        if self.player.id == self.game_state.dealer.id:
            self.game_state.active_player = self.game_state.get_player(id)
        
    def payout(self, winners):
        '''
        split pot between winners
        :param winners: list of winner ids
        '''
        if len(winners) < 1:
            raise ClientError('winners list must not be empty')

        # convert list of ids to list of player objects
        winner_ids = winners
        winners = []
        for id in winner_ids:
            player = self.game_state.get_player(id)
            if player is None:
                raise ClientError('player not found')
            winners.append(player)
        
        if self.game_state.game_name != "Man-Mouse":

            # get remainder chips after dividing evenly among winners
            extra_chips = self.game_state.pot % len(winners)
    
            # distribute chips evenly to all winners
            for player in winners:
                player.chips += self.game_state.pot // len(winners)
    
            # distribute extra chips to players
            # give to the players with the least chips first
            for player in sorted(winners, key=lambda player: player.chips):
                if extra_chips == 0:
                    break         # no more extra chips
                extra_chips -= 1  # take one from the pile
                player.chips += 1 # give it to the player
            self.game_state.pot = 0
            
        else: # man-mouse
            # pay winner
            winners[0].chips += self.game_state.pot
            
            # save pot amount, then clear pot:
            to_pay = self.game_state.pot
            self.game_state.pot = 0
            
            # any player that stayed in pays the pot
            for p in self.game_state.players:
                if p.in_hand and p is not winners[0]:
                    p.chips            -= to_pay
                    self.game_state.pot += to_pay
        # empty the pot
        
        for player in self.game_state.players:
            player.chips_in_hand = 0
        
        self.game_state.last_bet = 0

        
    def increment_bettor_drawer(self):
        '''sets active player for betting'''
        self.game_state.next_active_player()
        

    def new_back(self):
        '''goes to next card backing'''
        self.game_state.card_back_num += 1
        self.game_state.card_back_num %= 11
        
    def set_game_name(self, name):
        '''set name of current game'''
        self.game_state.game_name = name

    def buy_in(self, amount):
        '''add amount to player's chips and buy-in'''

        if self.player is None:
            raise ClientError('not logged-in')

        self.player.chips += amount
        self.player.buy_in += amount

class ClientError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message
