import { gameClient } from './GameClient';
import { HBox, VBox } from './Box';
import { Grid } from './Grid';

const CardImage = styled.img`
  height: 100px;
  object-fit: contain;
`;

const ChipImage = styled.img`
  height: calc(120px / (50 / 10));
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
      <VBox width="120px" spacing="4px">
        <HBox>{player.name}</HBox>
        <HBox spacing="0" wrap={true}>
          {_.map(_.range(Math.round(player.chips / 4 / 10)), (idx) => (
            <ChipImage key={idx} src="/chips_images/chip.png" />
          ))}
        </HBox>
      </VBox>
      <HBox>
        {_.map(player.hand, ({ card, up }, idx) => (
          <PlayerCard key={idx} player={player} card={card} up={up} />
        ))}
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
        {_.map(gameState.players, (player, idx) => (
          <PlayerSeat key={idx} player={player} />
        ))}
      </VBox>
    </VBox>
  );
};
