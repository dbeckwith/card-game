const { useEffect, useState } = React;

import { gameClient, useGameState, useGameConnect, useGameError } from './GameClient';
import { LoginScreen } from './LoginScreen';
import { Game } from './Game';
import { VBox } from './Box';

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
          gameState.current_player == null ? (
            <LoginScreen gameState={gameState} />
          ) : (
            <Game gameState={gameState} />
          )
      )}
    </AppContainer>
  );
};

ReactDOM.render(
  <App />,
  document.getElementById('root'),
);
