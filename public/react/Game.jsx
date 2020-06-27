import { gameClient } from './GameClient';
import { VBox } from './Box';

export const Game = ({ gameState }) => {
  return (
    <VBox>
      <span>{`You're playing the game, ${gameState.current_player.name}!`}</span>
      <button
        onClick={() => {
          gameClient.logout();
        }}
      >
        Log Out
      </button>
    </VBox>
  );
};
