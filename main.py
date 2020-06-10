import sys
assert sys.version_info >= (3, 8)

import aiohttp
from aiohttp import web
import asyncio
import json
from pathlib import Path


async def connect_client(request):
    print(f'connect from {request.remote}')
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    async for msg in ws:
        if msg.type == aiohttp.WSMsgType.TEXT:
            try:
                msg = json.loads(msg.data)
            except json.JSONDecodeError as e:
                print(e)
                continue
            if msg['type'] == 'login':
                username = msg['username']
                print(f'logging in as {username}')
                await ws.send_json({ 'type': 'login', 'id': 123 })
        elif msg.type == aiohttp.WSMsgType.ERROR:
            print(f'ws connection closed with exception {ws.exception()}')

    print('ws connection closed')

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
