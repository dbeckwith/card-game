const { useEffect } = React;

import { gameClient, useGameState, useGameConnect, useGameError } from './GameClient.js';
import { generateRandomId } from './util.js';

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
`;

const HBox = styled(Box)`
  flex-direction: row;

  & > :not(:last-child) {
    margin-right: 4px;
  }
`;

const VBox = styled(Box)`
  flex-direction: column;

  & > :not(:last-child) {
    margin-bottom: 4px;
  }
`;

const Game = ({ state }) => {
  return (
    <VBox>
      <HBox>
        <button
          onClick={() => {
            gameClient.login('Daniel');
          }}
        >
          Log In
        </button>
      </HBox>
      <HBox>
        Current Players: {_.join(_.map(state.players, (player) => player.name), ', ')}
      </HBox>
      <textarea
        readOnly={true}
        value={JSON.stringify(state, null, 2)}
      />
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
      {gameState != null && <Game state={gameState} />}
    </AppContainer>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
