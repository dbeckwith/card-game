import sys
assert sys.version_info >= (3, 8)

import asyncio

from game_state import GameState
from server import run_server


async def main():
    game_state = GameState()

    await asyncio.gather(
        run_server(game_state),
        game_state.update_clients_loop(),
        game_state.backup_loop(),
    )

if __name__ == '__main__':
    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(main())
    except asyncio.exceptions.CancelledError:
        pass
    loop.close()
