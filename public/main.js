import { CardGame } from './game_client.js';

window.onload = () => {
  let playerName;

  const client = new CardGame();

  client.on_connect = () => {
    document.getElementById('gamestate').value = '';
  };

  client.on_update = (game_state) => {
    document.getElementById('gamestate').value = JSON.stringify(game_state, null, 2);
  };

  client.on_error = (error) => {
    document.getElementById('error').textContent = `error: ${error}`;
  };

  client.on_disconnect = (reason) => {
    document.getElementById('error').textContent = `server disconnected: ${reason}`;
  };

  document.getElementById('joinbtn').onclick = () => {
    playerName = document.getElementById('nameinput').value;
    client.join(playerName);
  }

  document.getElementById('givecard').onclick = () => {
    client.draw_card({ type: 'player', player: playerName })
  }

  document.getElementById('newgame').onclick = () => {
    client.new_game();
  }
}
