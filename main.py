import sys
assert sys.version_info >= (3, 8)

import aiohttp
from aiohttp import web
import asyncio
import json
from pathlib import Path
import traceback


class PlayerError(Exception):
    def __init__(self, message):
        super().__init__(message)
        self.message = message

class PlayerCommands(object):
    def __init__(self, ws):
        self.ws = ws
        self.player = None

    def join(self, name):
        if self.player is not None:
            raise PlayerError('already joined')
        player = Player(name)
        game_state.add_player(player)
        self.player = player

    def give_card(self, player, card):
        player = game_state.get_player(player)
        if player is None:
            raise PlayerError('player not found')
        player.give_card(card)

class Player(object):
    def __init__(self, name):
        self.name = name
        self.in_game = False
        self.hand = []
        self.chips = 0

    def __json__(self):
        return {
            'name': self.name,
            'in_game': self.in_game,
            'hand': self.hand,
            'chips': self.chips,
        }

    def give_card(self, card):
        self.hand.append(card)

class GameState(object):
    def __init__(self):
        self.connections = []
        self.leader = None
        self.players = []
        self.board = []

    def __json__(self):
        return {
            'leader': None if self.leader is None else self.leader.name,
            'players': self.players,
            'board': self.board,
        }

    async def connect(self, cmds):
        self.connections.append(cmds)
        await game_state.send(cmds.ws)

    async def disconnect(self, cmds):
        self.connections.remove(cmds)
        if cmds.player is not None:
            self.remove_player(cmds.player)
            await self.send_to_all()

    def add_player(self, player):
        if not self.players:
            self.leader = player
        if any(p.name == player.name for p in self.players):
            raise PlayerError('already joined')
        self.players.append(player)

    def remove_player(self, player):
        self.players.remove(player)
        if player is self.leader:
            self.leader = next(iter(self.players), None)

    def get_player(self, name):
        for player in self.players:
            if player.name == name:
                return player

    async def send_to_all(self):
        await asyncio.gather(*(
            self.send(cmds.ws)
            for cmds
            in self.connections
        ))

    async def send(self, ws):
        await ws.send_json(
            { 'type': 'game_state', 'game_state': self },
            dumps=lambda *args, **kwargs: json.dumps(
                *args,
                **kwargs,
                cls=GameStateSerializer,
            ),
        )

class GameStateSerializer(json.JSONEncoder):
    def default(self, value):
        if hasattr(value, '__json__'):
            return value.__json__()
        return super(GameStateSerializer, self).default(value)


game_state = GameState()


async def connect_client(request):
    def log(msg, *args, **kwargs):
        print(f'[{request.remote}] {msg}', *args, **kwargs)

    ws = web.WebSocketResponse()
    await ws.prepare(request)

    log(f'connected')
    cmds = PlayerCommands(ws)
    await game_state.connect(cmds)

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
                await game_state.send_to_all()
            except PlayerError as e:
                log('player error:', e)
                if cmds.player is not None:
                    await cmds.ws.send_json({
                        'type': 'error',
                        'error': e.message,
                    })
            except:
                log('error handling message:')
                traceback.print_exc()
        elif msg.type == aiohttp.WSMsgType.ERROR:
            log('connection closed with exception:', ws.exception())

    log('disconnected')
    await game_state.disconnect(cmds)

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
