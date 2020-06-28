import { gameClient } from './GameClient';
import { HBox, VBox } from './Box';
import { Grid } from './Grid';

const CardImage = styled.img`
  height: 100px;
  width: calc(100px * 240/336);

  cursor: ${({ flippable }) => flippable ? 'pointer' : undefined};

  border: 2px solid ${({ flippable }) => flippable ? 'blue' : 'transparent'};
  border-radius: 4px;

  ${({ flippable }) => flippable && styled.css`
    &:hover {
      border-color: red;
    }
  `}
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

const PlayerCard = ({ idx, owned, card, up }) => {
  const flippable = owned && !up;

  return (
    <CardImage
      src={`/card_images/${owned || up ? card : '2B1'}.svg`}
      flippable={flippable}
      onClick={flippable && (() => {
        gameClient.flip(idx);
      })}
    />
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
            idx={idx}
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
