__author__ = 'D. Beckwith'

import asyncio
import aiohttp
from aiohttp import web
from collections import Counter
import inspect
import json
from pathlib import Path
import signal
import traceback

from rpc import RPC, ClientError


async def connect_client(request):
    game_state = request.app['game_state']

    # make a unique id for this connection's IP address
    connection_ids = request.app['connection_ids']
    connection_ids[request.remote] += 1
    connection_id = connection_ids[request.remote]

    ws = web.WebSocketResponse(
        heartbeat=1.0,
    )
    rpc = RPC(ws, game_state)

    def log(msg, *args, **kwargs):
        log_prefix = f'[{request.remote}#{connection_id}]'
        if rpc.player_id is not None:
            log_prefix += f' [{rpc.player_id}'
            if rpc.player is not None:
                log_prefix += f' ({rpc.player.name})'
            log_prefix += ']'
        print(f'{log_prefix} {msg}', *args, **kwargs)

    log('connecting')
    # upgrade the HTTP request to a WebSocket connection
    await ws.prepare(request)

    log('connected')
    # tell the game state about the new connection
    await game_state.connect(rpc)

    try:
        # loop through all messages receieved over connection
        async for msg in rpc.ws:
            if msg.type == aiohttp.WSMsgType.TEXT:
                # load message as JSON
                try:
                    msg = json.loads(msg.data)
                except json.JSONDecodeError as e:
                    log('message error:', e)
                    continue

                try:
                    # find a method on the RPC type matching the `type` field
                    msg_type = msg.pop('type')
                    if msg_type is None or msg_type.startswith('_') or not hasattr(RPC, msg_type):
                        raise ClientError(f'unknown message type {msg_type}')
                    cmd = getattr(rpc, msg_type)

                    # TODO: type check arguments

                    log(
                        msg_type +
                        '(' +
                        ', '.join(
                            key + '=' + repr(value)
                            for key, value in msg.items()
                        ) +
                        ')',
                    )

                    # use inspect module to get argument names of method
                    required_args = [
                        p.name
                        for p in inspect.signature(cmd).parameters.values()
                        if p.default is inspect.Parameter.empty
                    ]
                    # find which args are missing in WS message
                    missing_args = [
                        arg
                        for arg in required_args
                        if arg not in msg
                    ]
                    if missing_args:
                        raise ClientError(f'missing arguments to {msg_type}: {", ".join(missing_args)}')

                    game_state.message = ''
                    # call the method with the message as kwargs
                    cmd(**msg)

                    # mark the game state as changed so it will update the connections
                    game_state.mark_dirty()
                except ClientError as e:
                    log('client error:', e)
                    # tell the client that it did something wrong
                    await rpc.ws.send_json({
                        'type': 'error',
                        'error': e.message,
                    })
                except:
                    log('error handling message:')
                    traceback.print_exc()

            elif msg.type == aiohttp.WSMsgType.ERROR:
                log('connection closed with exception:', rpc.ws.exception())
    finally:
        # loop ended, client must have disconnected or an error occurred
        log('disconnected')
        # tell the game state that this connection is disconnecting
        await game_state.disconnect(rpc)
        # mark the game state as changed so it can update the remaining connections about the disconnected one
        game_state.mark_dirty()

    return rpc.ws

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

async def run_server(*, host, port, game_state):
    loop = asyncio.get_event_loop()

    app = web.Application(
        middlewares=[
            index_middleware
        ],
    )

    # app state
    app['game_state'] = game_state
    app['connection_ids'] = Counter()

    # serve WebSocket connection to game
    app.router.add_get('/ws', connect_client)
    # serve static webpage files
    app.router.add_static('/', Path(__file__).parent / 'public')

    app.freeze()  # creates static files

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

        # tell all the connections that the server is shutting down
        await asyncio.gather(*(
            rpc.ws.close(code=1012, message=b'server shutdown')
            for rpc in game_state.connections
        ))

        await app.shutdown()
        await web_server.shutdown(timeout=30)

        await app.cleanup()
