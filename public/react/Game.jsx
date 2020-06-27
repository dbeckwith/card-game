import { gameClient } from './GameClient';
import { HBox, VBox } from './Box';

const CardImage = styled.img`
  height: 100px;
  object-fit: contain;
`;

const PlayerCard = ({ player, card, up }) => {
  return (
    <CardImage src={`/card_images/${card}.svg`} />
  );
};

const PlayerSeat = ({ player }) => {
  return (
    <HBox>
      <span>{player.name}</span>
      <HBox>
        {_.map(player.hand, ({ card, up }, idx) => <PlayerCard key={idx} player={player} card={card} up={up} />)}
      </HBox>
    </HBox>
  );
};

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
      <VBox>
        {_.map(gameState.players, (player, idx) => <PlayerSeat key={idx} player={player} />)}
      </VBox>
    </VBox>
  );
};
