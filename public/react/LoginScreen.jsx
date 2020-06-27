const { useState } = React;

import { gameClient } from './GameClient';
import { HBox, VBox } from './Box';

const Title = styled.h1`
`;

export const LoginScreen = ({ gameState }) => {
  const [name, setName] = useState('');

  return (
    <VBox width="100%" hAlign="center" spacing="32px">
      <Title>Cambridge Poker</Title>
      <VBox hAlign="center" spacing="8px">
        <HBox>
          <input
            type="text"
            onChange={(event) => {
              setName(event.target.value);
            }}
          />
          <button
            onClick={() => {
              gameClient.login(name);
            }}
          >
            Log In
          </button>
        </HBox>
        {gameState.players.length > 0 ? (
          <VBox hAlign="center">
            <span>{`Players Online (${gameState.players.length}):`}</span>
            {_.map(gameState.players, (player, idx) => (
              <span key={idx}>{player.name}</span>
            ))}
          </VBox>
        ) : (
          <span>No players currently online</span>
        )}
      </VBox>
    </VBox>
  );
};
