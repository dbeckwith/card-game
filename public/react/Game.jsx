import { gameClient } from './GameClient';
import { HBox, VBox } from './Box';
import { Grid } from './Grid';

const CardImage = styled.img`
  height: 100px;
  width: calc(100px * 240/336);
`;

const ChipImage = styled.img`
  height: calc(120px / (50 / 10));
  object-fit: contain;
`;

const PlayerSeatContainer = styled(HBox)`
  background-color: rgba(11, 219, 109, 0.25);
  border: 1px solid rgba(11, 219, 109, 0.75);
  border-radius: 4px;
`;

const PlayerCard = ({ owned, card, up }) => {
  return (
    <CardImage src={`/card_images/${up || owned ? card : '2B1'}.svg`} />
  );
};

const PlayerSeat = ({ currentPlayer, player }) => {
  return (
    <PlayerSeatContainer padding="8px">
      <VBox width="120px" spacing="4px">
        <HBox>{player.name}</HBox>
        <HBox spacing="0" wrap="flex-start">
          {_.map(_.range(Math.round(player.chips / 4 / 10)), (idx) => (
            <ChipImage key={idx} src="/chips_images/chip.png" />
          ))}
        </HBox>
      </VBox>
      <HBox>
        {_.map(player.hand, ({ card, up }, idx) => (
          <PlayerCard
            key={idx}
            owned={player.id === currentPlayer.id}
            card={card}
            up={up}
          />
        ))}
      </HBox>
    </PlayerSeatContainer>
  );
};

export const Game = ({ gameState }) => {
  return (
    <VBox maxHeight="100%">
      <span>{`You're playing the game, ${gameState.current_player.name}!`}</span>
      <button
        onClick={() => {
          gameClient.logout();
        }}
      >
        Log Out
      </button>
      <VBox width="100%" minHeight="0" wrap="stretch">
        {_.map(gameState.players, (player, idx) => (
          <PlayerSeat
            key={idx}
            currentPlayer={gameState.current_player}
            player={player}
          />
        ))}
      </VBox>
    </VBox>
  );
};
