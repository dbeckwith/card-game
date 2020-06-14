import sys
assert sys.version_info >= (3, 8)

import aiohttp
from aiohttp import web
import asyncio
import inspect
import json
from pathlib import Path
import signal
import tempfile
import traceback

import cards


loop = asyncio.get_event_loop()

game_state_backup_file = Path(tempfile.gettempdir()) / 'card_game_state.json'

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

    def new_game(self):
        game_state.new_game()

    def draw_card(self, target):
        # TODO: update for new card type
        target_type = target.get('type')
        if target_type == 'player':
            player = target.get('player')
            if player is None:
                raise PlayerError('player not specified')
            player = game_state.get_player(player)
            if player is None:
                raise PlayerError('player not found')
            card = game_state.draw_card()
            player.give_card(card)
        elif target_type == 'board':
            card = game_state.draw_card()
            game_state.add_board_card(card)
        else:
            raise PlayerError(f'unknown card draw target {target_type}')

    def trash_card(self, player, card):
        player = game_state.get_player(player)
        if player is None:
            raise PlayerError('player not found')
        player.trash_card(card)

    def deal_all(self, down, up):
        for _ in range(down):
            for player in game_state.players:
                card = game_state.draw_card()
                player.give_card(card, False)
        for _ in range(up):
            for player in game_state.players:
                card = game_state.draw_card()
                player.give_card(card, True)

class PlayerCard(object):
    def __init__(self, card, up):
        self.card = card
        self.up = up

    def __json__(self):
        return {
            'card': self.card,
            'up': self.up,
        }

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

    def new_game(self):
        self.in_game = True
        self.hand = []

    def give_card(self, card, up):
        self.hand.append(PlayerCard(card, up))

    def trash_card(self, card):
        # TODO: remove any card, up or down with this value
        if card in self.hand:
            self.hand.remove(card)
        else:
            raise PlayerError(f'{self.name} is not holding {card}')

class GameState(object):
    def __init__(self):
        self.connections = []
        self.leader = None
        self.players = []
        self.board = []
        self.deck = cards.new_deck()

        self.client_update_event = asyncio.Event()
        self.save_event = asyncio.Event()

    def __json__(self):
        return {
            'leader': None if self.leader is None else self.leader.name,
            'players': self.players,
            'board': self.board,
        }

    async def connect(self, cmds):
        self.connections.append(cmds)
        await self.send(cmds.ws)

    async def disconnect(self, cmds):
        self.connections.remove(cmds)
        if cmds.player is not None:
            self.remove_player(cmds.player)
            self.mark_dirty()

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

    def new_game(self):
        for player in self.players:
            player.new_game()
        self.board = []
        self.deck = cards.new_deck()

    def draw_card(self):
        if self.deck:
            return self.deck.pop()
        else:
            raise PlayerError('deck is empty')

    def add_board_card(self, card):
        self.board.append(card)

    def mark_dirty(self):
        self.client_update_event.set()
        self.save_event.set()

    async def send_to_all(self):
        await asyncio.gather(*(
            self.send(cmds.ws)
            for cmds in self.connections
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

game_state = GameState()

class GameStateSerializer(json.JSONEncoder):
    def default(self, value):
        if hasattr(value, '__json__'):
            return value.__json__()
        return super(GameStateSerializer, self).default(value)

async def connect_client(request):
    ws = web.WebSocketResponse(
        heartbeat=1.0,
    )
    cmds = PlayerCommands(ws)

    def log(msg, *args, **kwargs):
        log_prefix = request.remote
        if cmds.player is not None:
            log_prefix += f' - {cmds.player.name}'
        print(f'[{log_prefix}] {msg}', *args, **kwargs)

    log('connecting')
    await ws.prepare(request)

    log('connected')
    await game_state.connect(cmds)

    try:
        async for msg in cmds.ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                try:
                    msg = json.loads(msg.data)
                except json.JSONDecodeError as e:
                    log('message error:', e)
                    continue
                try:
                    msg_type = msg.pop('type')
                    if msg_type is None or msg_type.startswith('_') or not hasattr(PlayerCommands, msg_type):
                        raise PlayerError(f'unknown message type {msg_type}')
                    else:
                        cmd = getattr(cmds, msg_type)
                        log(
                            msg_type +
                            '(' +
                            ', '.join(
                                key + '=' + repr(value)
                                for key, value in msg.items()
                            ) +
                            ')',
                        )
                        required_args = [
                            p.name
                            for p in inspect.signature(cmd).parameters.values()
                            if p.default is inspect.Parameter.empty
                        ]
                        missing_args = [
                            arg
                            for arg in required_args
                            if arg not in msg
                        ]
                        if missing_args:
                            raise PlayerError(f'missing arguments to {msg_type}: {", ".join(missing_args)}')
                        getattr(cmds, msg_type)(**msg)
                    game_state.mark_dirty()
                except PlayerError as e:
                    log('player error:', e)
                    await cmds.ws.send_json({
                        'type': 'error',
                        'error': e.message,
                    })
                except:
                    log('error handling message:')
                    traceback.print_exc()
            elif msg.type == aiohttp.WSMsgType.ERROR:
                log('connection closed with exception:', cmds.ws.exception())
    finally:
        log('disconnected')
        await game_state.disconnect(cmds)

    return cmds.ws

async def update_clients():
    while True:
        await game_state.client_update_event.wait()
        game_state.client_update_event.clear()
        await game_state.send_to_all()
        await asyncio.sleep(0.1)

async def save_game_state():
    while True:
        await game_state.save_event.wait()
        game_state.save_event.clear()
        with open(game_state_backup_file, 'w') as f:
            json.dump(game_state, f, cls=GameStateSerializer)
        print(f'game state saved to {game_state_backup_file}')
        await asyncio.sleep(10)

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

async def run_server():
    app = web.Application(
        middlewares=[
            index_middleware
        ],
    )
    app.router.add_get('/ws', connect_client)
    app.router.add_static('/', Path(__file__).parent / 'public')
    app.freeze()

    await app.startup()

    def request_factory(message, payload, protocol, writer, task, _cls=web.Request):
        return _cls(
            message,
            payload,
            protocol,
            writer,
            task,
            loop,
            client_max_size=app._client_max_size,
        )
    web_server = web.Server(app._handle, request_factory=request_factory)

    host = '0.0.0.0'
    port = 8123
    http_server = await loop.create_server(
        web_server,
        host,
        port,
        start_serving=False,
    )

    def stop():
        http_server.close()

    loop.add_signal_handler(signal.SIGINT, stop)
    loop.add_signal_handler(signal.SIGTERM, stop)

    try:
        print(f'serving at {host}:{port}...')
        await http_server.serve_forever()
    finally:
        loop.remove_signal_handler(signal.SIGINT)
        loop.remove_signal_handler(signal.SIGTERM)

        print('shutting down...')

        http_server.close()
        await http_server.wait_closed()

        await asyncio.gather(*(
            cmds.ws.close(code=1012, message=b'server shutdown')
            for cmds in game_state.connections
        ))

        await app.shutdown()
        await web_server.shutdown(timeout=30)

        await app.cleanup()

async def main():
    await asyncio.gather(
        run_server(),
        update_clients(),
        save_game_state(),
    )

if __name__ == '__main__':
    try:
        loop.run_until_complete(main())
    except asyncio.exceptions.CancelledError:
        pass
    loop.close()
