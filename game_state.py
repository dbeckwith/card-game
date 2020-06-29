__author__ = 'D. Beckwith'

'''
provides gamestate object to track all values in game
provides methods for updating gamestate values
'''

import asyncio
from collections import defaultdict
import json
from pathlib import Path
import tempfile

import cards
from rpc import ClientError

# TODO: "stand up"
# not included in dealer rotation
# but seat stays at the table, keep chips

class GameState(object):
    '''tracks the state of all variables for the game and players'''
    def __init__(self):
        self.players = []
        self.deck = cards.new_deck()

        self.hand_started  = False
        self.draw_mode     = False
        self.dealer        = None
        self.active_player = None
        self.common_cards  = []
        
        self.pot             = 0
        self.last_bet        = 0
        self.game_name       = None
        self.chips_bet_in_round = 0 # reset when deal all or deal common

        self.acey_ducey_mode = False
        self.no_peek_mode    = False
        self.card_back_num   = 1
        self.current_game    = None
        self.connections     = []

        self.player_id_connections = defaultdict(list)
        self.client_update_event = asyncio.Event()
        self.backup_event = asyncio.Event()
        self.backup_file = Path(tempfile.gettempdir()) / 'card_game_state.json'

    def __json__(self):
        return {
            'players'      : self.players,
            'deck'         : self.deck,
            'hand_started' : self.hand_started,
            'dealer'       : self.dealer.id if self.dealer is not None else None,
            'active_player': self.active_player.id if self.active_player is not None else None,
            'pot'          : self.pot,
            'last_bet'     : self.last_bet,
            'common_cards' : self.common_cards,
            'game_name'    : self.game_name,
            'draw_mode'    : self.draw_mode,
            'chips_bet_in_round': self.chips_bet_in_round,
            'acey_ducey_mode': self.acey_ducey_mode,
            'card_back_num': self.card_back_num,
            'no_peek_mode' : self.no_peek_mode,
        }

    async def connect(self, rpc):
        # record connection
        self.connections.append(rpc)
        # send first update just to the new connection
        await self.send(rpc)

    async def disconnect(self, rpc):
        # remove connection
        self.connections.remove(rpc)

        # remove connection from connections for its player id
        if rpc.player_id is not None:
            self.player_id_connections[rpc.player_id].remove(rpc)

            # mark player as disconnected if this is the last connection for that player
            if rpc.player is not None and not self.player_id_connections[rpc.player_id]:
                rpc.player.connected = False

    def add_player(self, player):
        '''
        adds player when they login
        :param player: player object to login
        :return: None
        '''
        if any(p.id == player.id for p in self.players):
            raise ClientError('player with same id already in game')

        self.players.append(player)

        # if there was no previous dealer, make the new player the dealer
        if self.dealer is None:
            self.dealer = player

    def remove_player(self, player):
        '''
        removes player from game
        :param player: player object for player to remove
        :return: None
        '''
        if player not in self.players:
            raise ClientError('player is not in game')

        # if the player being removed is the dealer, assign a new one
        if self.dealer is player:
            # if there are any other players, pick a new one
            if len(self.players) > 1:
                self.next_dealer()
            else:
                # no other players, so no more dealer
                self.dealer = None

        self.players.remove(player)

    def get_player(self, player_id):
        '''
        finds playern object based on id
        :param player_id: id number of current player
        :return player object matching the id
        '''
        for player in self.players:
            if player.id == player_id:
                return player


        
    def players_in_hand(self):
        
        for player in self.players:
            if player.in_hand:
                yield player
            
    def new_game(self):
        '''
        creates new game: 0 pot, set players, new deck, clear common cards,
        new dealer
        '''
        if self.pot != 0:
            raise ClientError('pot must be empty')
        self.last_bet = 0
        
        self.game_name = " "
        # reset each player
        for player in self.players:
            player.new_game()
            
            
        self.common_cards = []
        # shuffle a new deck
        self.deck = cards.new_deck()

        self.draw_mode = False

        # new hand
        self.hand_started = False

        if self.dealer is not None:
            # pick a new dealer
            self.next_dealer()

            # pick the first active player
            self.active_player = self.next_player_after(self.dealer)

    def reset_game(self):
        '''
        creates new game: 0 pot, set players, new deck, clear common cards,
        new dealer
        '''

        self.last_bet = 0

        self.common_cards = []
        # shuffle a new deck
        self.deck = cards.new_deck()

        self.draw_mode = False

        # new hand
        self.hand_started = False

        self.pot = 0
        for player in self.players:
            player.chips += player.chips_in_hand
            
        # reset each player
        for player in self.players:
            player.new_game()  
            

    def next_dealer(self):
        if self.dealer is not None:
            self.dealer = self.next_player_after(self.dealer)

    def next_active_player(self):
        '''finds next active player and sets instance variable'''
        if self.active_player is not None:
            original = self.active_player

            while True:
                self.active_player = self.next_player_after(self.active_player)
                if self.active_player is original:
                    # we've looped back around
                    break
                if self.active_player.in_hand:
                    # found a player in the hand
                    break

    def next_player_after(self, player):
        '''returns player with next seat after current player'''
        # get the player's seat
        seat = self.players.index(player)
        # return the player with the next seat (wrapping around)
        return self.players[(seat + 1) % len(self.players)]

    def draw_card(self):
        '''takes next card from deck'''
        if self.deck:
            card = self.deck.pop()
            return card
        else:
            raise ClientError('deck is empty')

    def mark_dirty(self):
        '''
        notify Event objects for client update and backup
        this will trigger those loops to run
        '''
        self.client_update_event.set()
        self.backup_event.set()

    async def send_to_all(self):
        '''send the game state to every connection concurrently'''
        await asyncio.gather(*(
            self.send(rpc)
            for rpc in self.connections
        ))

    async def send(self, rpc):
        '''format a message to send to the connection'''
        msg = {
            'type': 'game_state',
            'game_state': self,
        }

        # include the player id if logged-in
        if rpc.player is not None:
            msg['current_player'] = rpc.player

        # send as JSON over websocket using the custom serializer
        await rpc.ws.send_json(
            msg,
            dumps=lambda *args, **kwargs: json.dumps(
                *args,
                **kwargs,
                cls=GameStateSerializer,
            ),
        )

    async def update_clients_loop(self):
        while True:
            # wait for the event to be notified
            await self.client_update_event.wait()
            # clear the value so it can be waited on again
            self.client_update_event.clear()

            # send the update to every connection
            await self.send_to_all()

            # sleep a bit before waiting on the event again
            # this prevents us from sending too many updates at once
            await asyncio.sleep(0.1)

    async def backup_loop(self):
        while True:
            # wait for the event to be notified
            await self.backup_event.wait()
            # clear the value so it can be waited on again
            self.backup_event.clear()

            # backup to a file as JSON with the custom serializer
            with open(self.backup_file, 'w') as f:
                json.dump(self, f, cls=GameStateSerializer)
            print(f'game state saved to {self.backup_file}')

            # sleep a bit before waiting on the event again
            # this prevents us from sending too many updates at once
            await asyncio.sleep(10)

class GameStateSerializer(json.JSONEncoder):
    def default(self, value):
        '''if the value isn't a primitive JSON, see if it has a special __json__ method
        and use the value from that instead'''
        if hasattr(value, '__json__'):
            return value.__json__()
        return super(GameStateSerializer, self).default(value)
