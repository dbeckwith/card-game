const { useEffect, useState } = React;

import { gameClient, useGameState, useGameConnect, useGameError } from './GameClient';

const AppContainer = styled.div`
  width: calc(100vw - 20px);
  height: calc(100vh - 20px);

  padding: 10px;

  font-family: sans-serif;
  background-image: linear-gradient(to bottom, #007712, #2acf15);
`;

const ConnectionBanner = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;

  text-align: center;
  padding: 4px;

  color: white;
  background-color: red;
  text-transform: uppercase;
`;

const Box = styled.div`
  display: flex;

  width: ${({ width }) => width ?? 'auto'};
  height: ${({ height }) => height ?? 'auto'};

  padding: ${({ padding }) => padding ?? 'auto'};
`;

const HBox = styled(Box)`
  flex-direction: row;

  & > :not(:last-child) {
    margin-right: ${({ spacing }) => spacing ?? '4px'};
  }

  justify-content: ${({ hAlign }) => {
    switch (hAlign ?? 'left') {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
        return 'center';
    }
  }};

  align-items: ${({ vAlign }) => {
    switch (vAlign ?? 'top') {
      case 'top':
        return 'flex-start';
      case 'bottom':
        return 'flex-end';
      case 'center':
        return 'center';
    }
  }};
`;

const VBox = styled(Box)`
  flex-direction: column;

  & > :not(:last-child) {
    margin-bottom: ${({ spacing }) => spacing ?? '4px'};
  }

  justify-content: ${({ vAlign }) => {
    switch (vAlign ?? 'top') {
      case 'top':
        return 'flex-start';
      case 'bottom':
        return 'flex-end';
      case 'center':
        return 'center';
    }
  }};

  align-items: ${({ hAlign }) => {
    switch (hAlign ?? 'left') {
      case 'left':
        return 'flex-start';
      case 'right':
        return 'flex-end';
      case 'center':
        return 'center';
    }
  }};
`;

const LoginScreen = ({ gameState }) => {
  const [name, setName] = useState('');

  return (
    <VBox width="100%" hAlign="center" spacing="10px">
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
        <span>
          Current Players: {_.join(_.map(gameState.players, (player) => player.name), ', ')}
        </span>
      ) : (
        <span>No players currently online</span>
      )}
    </VBox>
  );
};

const Game = ({ gameState }) => {
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
}

const App = () => {
  const gameState = useGameState();
  const connected = useGameConnect();

  useGameError((error) => {
    window.alert(`Error: ${error}`);
  });

  return (
    <AppContainer>
      {!connected && <ConnectionBanner>Disconnected</ConnectionBanner>}
      {gameState != null && (
        <VBox>
          {gameState.current_player == null ? (
            <LoginScreen gameState={gameState} />
          ) : (
            <Game gameState={gameState} />
          )}
        </VBox>
      )}
    </AppContainer>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
