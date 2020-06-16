import asyncio
from collections import defaultdict
import json
from pathlib import Path
import tempfile

import cards
from rpc import ClientError


class GameState(object):
    def __init__(self):
        self.players = []
        self.deck = cards.new_deck()
        self.dealer = None

        self.connections = []
        self.player_id_connections = defaultdict(list)
        self.client_update_event = asyncio.Event()
        self.backup_event = asyncio.Event()
        self.backup_file = Path(tempfile.gettempdir()) / 'card_game_state.json'

    def __json__(self):
        return {
            'players': self.players,
            'deck': self.deck,
            'dealer': self.dealer.id if self.dealer else None,
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
        if any(p.id == player.id for p in self.players):
            raise ClientError('player with same id already in game')

        self.players.append(player)

        # if there was no previous dealer, make the new player the dealer
        if self.dealer is None:
            self.dealer = player

    def remove_player(self, player):
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
        for player in self.players:
            if player.id == player_id:
                return player

    def new_game(self):
        # reset each player
        for player in self.players:
            player.new_game()

        # shuffle a new deck
        self.deck = cards.new_deck()

        # pick a new dealer
        if self.dealer:
            self.next_dealer()

    def next_dealer(self):
        if self.dealer:
            # get the player's seat
            seat = self.players.index(self.dealer)
            # set the dealer to the player with the next seat (wrapping around)
            self.dealer = self.players[(seat + 1) % len(self.players)]

    def draw_card(self):
        if self.deck:
            card = self.deck.pop()
            return card
        else:
            raise ClientError('deck is empty')

    def mark_dirty(self):
        # notify Event objects for client update and backup
        # this will trigger those loops to run
        self.client_update_event.set()
        self.backup_event.set()

    async def send_to_all(self):
        # send the game state to every connection concurrently
        await asyncio.gather(*(
            self.send(rpc)
            for rpc in self.connections
        ))

    async def send(self, rpc):
        # format a message to send to the connection
        msg = {
            'type': 'game_state',
            'game_state': self,
        }

        # include the player id if logged-in
        if rpc.player is not None:
            msg['current_player'] = rpc.player.id

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
        # if the value isn't a primitive JSON, see if it has a special __json__ method
        # and use the value from that instead
        if hasattr(value, '__json__'):
            return value.__json__()
        return super(GameStateSerializer, self).default(value)
