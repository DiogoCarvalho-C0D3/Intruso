import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './context/GameContext';
import { SoundProvider } from './context/SoundContext';
// Views will be imported here
import HomeView from './views/HomeView';
import LobbyBrowseView from './views/LobbyBrowseView';
import RoomView from './views/RoomView';
import GameView from './views/GameView';
import LeaderboardView from './views/LeaderboardView';
import ChangelogView from './views/ChangelogView';
import CustomDecksView from './views/CustomDecksView';

import InstallPrompt from './components/pwa/InstallPrompt';

function App() {
  return (
    <GameProvider>
      <SoundProvider>
        <BrowserRouter>
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/lobby" element={<LobbyBrowseView />} />
            <Route path="/leaderboard" element={<LeaderboardView />} />
            <Route path="/decks" element={<CustomDecksView />} />
            <Route path="/changelog" element={<ChangelogView />} />
            <Route path="/room/:roomId" element={<RoomView />} />
            <Route path="/game/:roomId" element={<GameView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SoundProvider>
    </GameProvider>
  );
}

export default App;
