const { useEffect, useState } = React;

import { EventHandler } from './EventHandler';
import { generateRandomId } from './util';

class GameClient {
  constructor() {
    this.events = new EventHandler();

    this.reconnect();
  }

  reconnect() {
    this.ws = new WebSocket(`ws://${window.location.host}/ws`);

    this.ws.addEventListener('open', () => {
      console.log('Connected to game server');
      this.events.dispatch('connect');
    });

    this.ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data);
      switch (message.type) {
        case 'game_state': {
          const { game_state, current_player } = message;
          game_state.current_player = current_player;
          console.log('Game state update:', game_state);
          this.events.dispatch('update', game_state);
          break;
        }
        case 'error': {
          const { error } = message;
          console.log(`Error from server: ${error}`)
          this.events.dispatch('error', error);
          break;
        }
      }
    });

    this.ws.addEventListener('close', (event) => {
      const { wasClean, code, reason } = event;
      console.log('Connection to game server closed', { wasClean, code, reason });
      this.events.dispatch('disconnect', reason);
      setTimeout(() => {
        this.reconnect();
      }, 1000);
    });

    this.ws.addEventListener('error', (error) => {
      console.log('WebSocket error', error.message);
    });
  }

  send(command, args) {
    this.ws.send(JSON.stringify({ ...args, type: command }));
  }

  connect(playerId) {
    this.send('connect', { player_id: playerId });
  }

  login(name) {
    this.send('login', { name });
  }

  logout() {
    this.send('logout');
  }
}

export const gameClient = new GameClient();

export const useGameState = () => {
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    const handler = (gameState) => {
      setGameState(gameState);
    };

    gameClient.events.on('update', handler);

    return () => {
      gameClient.events.off('update', handler);
    };
  });

  return gameState;
};

export const useGameConnect = () => {
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const handler = () => {
      const storage = window.sessionStorage;

      let playerId = storage.getItem('playerId');
      if (playerId == null) {
        playerId = generateRandomId();
        storage.setItem('playerId', playerId);
      }

      gameClient.connect(playerId);

      setConnected(true);
    };

    gameClient.events.on('connect', handler);

    return () => {
      gameClient.events.off('connect', handler);
    };
  });

  useEffect(() => {
    const handler = () => {
      setConnected(false);
    };

    gameClient.events.on('disconnect', handler);

    return () => {
      gameClient.events.off('disconnect', handler);
    };
  });

  return connected;
}

export const useGameError = (onError) => {
  useEffect(() => {
    const handler = (error) => {
      onError(error);
    };

    gameClient.events.on('error', handler);

    return () => {
      gameClient.events.off('error', handler);
    };
  });
}
