import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
// Views will be imported here
import HomeView from './views/HomeView';
import LobbyBrowseView from './views/LobbyBrowseView';
import RoomView from './views/RoomView';
import GameView from './views/GameView';

import InstallPrompt from './components/pwa/InstallPrompt';

function App() {
  return (
    <GameProvider>
      <BrowserRouter>
        <InstallPrompt />
        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/lobby" element={<LobbyBrowseView />} />
          <Route path="/room/:roomId" element={<RoomView />} />
          <Route path="/game/:roomId" element={<GameView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
}

export default App;
