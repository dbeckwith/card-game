import sys
assert sys.version_info >= (3, 8)

import aiohttp
from aiohttp import web
import asyncio
import json
from pathlib import Path
import traceback


class PlayerCommands(object):
    def __init__(self, ws):
        self.ws = ws
        self.player = None

    def join(self, name):
        if self.player is not None:
            raise 'already joined'
        self.player = Player(self.ws, name)
        game_state.add_player(self.player)

    def give_card(self, player, card):
        player = game_state.get_player(player)
        if player is None:
            raise 'player not found'
        player.give_card(card)

class Player(object):
    def __init__(self, ws, name):
        self.ws = ws
        self.name = name
        self.in_game = False
        self.hand = []
        self.chips = 0

    def give_card(self, card):
        self.hand.append(card)

    def __serialize__(self):
        return {
            'name': self.name,
            'in_game': self.in_game,
            'hand': self.hand,
            'chips': self.chips,
        }

class GameState(object):
    def __init__(self):
        self.leader = None
        self.players = []
        self.board = []

    def add_player(self, player):
        if not self.players:
            self.leader = player
        self.players.append(player)

    def remove_player(self, player):
        self.players.remove(player)
        if player is self.leader:
            self.leader = next(iter(self.players), None)

    def get_player(self, name):
        for player in self.players:
            if player.name == name:
                return player

    def __serialize__(self):
        return {
            'leader': None if self.leader is None else self.leader.name,
            'players': self.players,
            'board': self.board,
        }

    async def send_to_all_players(self):
        await asyncio.gather(*(
            self.send_to_player(player)
            for player
            in self.players
        ))

    async def send_to_player(self, player):
        await player.ws.send_json(
            self,
            dumps=lambda *args, **kwargs: json.dumps(
                *args,
                **kwargs,
                cls=GameStateSerializer,
            ),
        )

class GameStateSerializer(json.JSONEncoder):
    def default(self, value):
        if hasattr(value, '__serialize__'):
            return value.__serialize__()
        return super(GameStateSerializer, self).default(value)


game_state = GameState()


async def connect_client(request):
    def log(msg, *args, **kwargs):
        print(f'[{request.remote}] {msg}', *args, **kwargs)

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    log(f'connected')
    cmds = PlayerCommands(ws)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            try:
                msg = json.loads(msg.data)
            except json.JSONDecodeError as e:
                log('message error:', e)
                continue
            try:
                log(msg)
                msg_type = msg.pop('type')
                if msg_type is None or msg_type.startswith('__') or not hasattr(PlayerCommands, msg_type):
                    log('unknown message type:', msg_type)
                else:
                    getattr(cmds, msg_type)(**msg)
                await game_state.send_to_all_players()
            except:
                log('error handling message:')
                traceback.print_exc()
        elif msg.type == aiohttp.WSMsgType.ERROR:
            log('connection closed with exception:', ws.exception())

    log('disconnected')

    if cmds.player is not None:
        game_state.remove_player(cmds.player)
        await game_state.send_to_all_players()

    return ws


async def index_middleware(app, handler):
    index = 'index.html'

    async def index_handler(request):
        filename = request.match_info.get('filename')
        if filename is not None:
            if not filename:
                filename = index
            elif filename.endswith('/'):
                filename += index
            request.match_info['filename'] = filename
        return await handler(request)

    return index_handler


if __name__ == '__main__':
    app = web.Application(
        middlewares=[
            index_middleware
        ],
    )
    app.router.add_get('/ws', connect_client)
    app.router.add_static('/', Path(__file__).parent / 'public')
    web.run_app(app)
