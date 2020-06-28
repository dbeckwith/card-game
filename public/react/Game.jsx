import { gameClient } from './GameClient';
import { HBox, VBox } from './Box';

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
  margin: 2px;

  background-color: ${({ isCurrent, isTurn, isDealer }) => {
    const alpha = isCurrent ? 0.50 : isTurn || isDealer ? 0.30 : 0.15;
    if (isTurn) {
      return `rgba(252, 212, 0, ${alpha})`;
    } else if (isDealer) {
      return `rgba(0, 105, 252, ${alpha})`;
    } else {
      return `rgba(11, 230, 90, ${alpha})`;
    }
  }};
  border-color: ${({ isCurrent, isTurn, isDealer }) => {
    const alpha = isCurrent ? 0.70 : isTurn || isDealer ? 0.60 : 0.50;
    if (isTurn) {
      return `rgba(252, 212, 0, ${alpha})`;
    } else if (isDealer) {
      return `rgba(0, 105, 252, ${alpha})`;
    } else {
      return `rgba(11, 230, 90, ${alpha})`;
    }
  }};
  border-width: 1px;
  border-style: solid;
  border-radius: 4px;
`;

const PlayerCard = ({ idx, owned, card, up }) => {
  const flippable = owned && !up;

  return (
    <CardImage
      src={`/card_images/${owned || up ? card : '2B1'}.svg`}
      flippable={flippable}
      onClick={flippable ? (() => {
        gameClient.flip(idx);
      }) : undefined}
    />
  );
};

const PlayerSeat = ({ player, isCurrent, isTurn, isDealer }) => {
  return (
    <PlayerSeatContainer
      padding="8px"
      minHeight="104px"
      isCurrent={isCurrent}
      isTurn={isTurn}
      isDealer={isDealer}
    >
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
            owned={isCurrent}
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
        {_.map(gameState.players, (player, idx) => {
          const isCurrent = player.id === gameState.current_player.id;
          const isTurn = player.id === gameState.active_player;
          const isDealer = player.id === gameState.dealer;
          return (
            <PlayerSeat
              key={idx}
              player={player}
              isCurrent={isCurrent}
              isTurn={isTurn}
              isDealer={isDealer}
            />
          );
        })}
      </VBox>
    </VBox>
  );
};
