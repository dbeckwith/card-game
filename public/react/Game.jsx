import { gameClient } from './GameClient';
import { VBox } from './Box';

export const Game = ({ gameState }) => {
  return (
    <VBox>
      <span>You're playing the game!</span>
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
