import asyncio
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
        self.client_update_event = asyncio.Event()
        self.save_event = asyncio.Event()
        self.backup_file = Path(tempfile.gettempdir()) / 'card_game_state.json'

    def __json__(self):
        return {
            'players': self.players,
            'deck': self.deck,
            'dealer': self.dealer.id if self.dealer else None,
        }

    async def connect(self, rpc):
        self.connections.append(rpc)
        await self.send(rpc)

    async def disconnect(self, rpc):
        self.connections.remove(rpc)
        if rpc.player is not None:
            rpc.player.connected = False

    def add_player(self, player):
        if any(p.id == player.id for p in self.players):
            # player already in the game
            return
        self.players.append(player)
        if self.dealer is None:
            self.dealer = player

    def remove_player(self, player):
        self.players.remove(player)
        if self.dealer is player:
            if self.players:
                seat = self.players.index(player)
                self.dealer = self.players[(seat + 1) % len(self.players)]
            else:
                self.dealer = None

    def get_player(self, id):
        for player in self.players:
            if player.id == id:
                return player

    def new_game(self):
        for player in self.players:
            player.new_game()
        self.deck = cards.new_deck()
        if self.dealer:
            seat = self.players.index(self.dealer)
            self.dealer = self.players[(seat + 1) % len(self.players)]

    def draw_card(self):
        if self.deck:
            card = self.deck.pop()
            return card
        else:
            raise ClientError('deck is empty')

    def mark_dirty(self):
        self.client_update_event.set()
        self.save_event.set()

    async def send_to_all(self):
        await asyncio.gather(*(
            self.send(rpc)
            for rpc in self.connections
        ))

    async def send(self, rpc):
        msg = {
            'type': 'game_state',
            'game_state': self,
        }
        if rpc.player is not None:
            msg['current_player'] = rpc.player.id
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
            await self.client_update_event.wait()
            self.client_update_event.clear()
            await self.send_to_all()
            await asyncio.sleep(0.1)

    async def backup_loop(self):
        while True:
            await self.save_event.wait()
            self.save_event.clear()
            with open(self.backup_file, 'w') as f:
                json.dump(self, f, cls=GameStateSerializer)
            print(f'game state saved to {self.backup_file}')
            await asyncio.sleep(10)

class GameStateSerializer(json.JSONEncoder):
    def default(self, value):
        if hasattr(value, '__json__'):
            return value.__json__()
        return super(GameStateSerializer, self).default(value)
