import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const GameContext = createContext();

// Detect server URL. 
// If in Production/Deployed, return empty string (relative path) to connect to same origin.
// If valid in Dev, use logic to support local network device access.
const getServerUrl = () => {
    if (import.meta.env.PROD) {
        return ''; // Connect to same origin
    }
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
};

// Socket initialization with autoConnect: false to allow setting auth/query before connect
const socket = io(getServerUrl(), {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
});

export const GameProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(() => {
        const saved = localStorage.getItem('intruso_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [currentRoom, setCurrentRoom] = useState(null);
    const [publicRooms, setPublicRooms] = useState([]);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(socket.connected);

    // Connection management
    useEffect(() => {
        // Set auth token (userId) before connecting
        const savedUser = localStorage.getItem('intruso_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            socket.auth = { userId: user.id };
        }

        if (socket.connected) setIsConnected(true);

        socket.on('connect', () => {
            setIsConnected(true);
            const user = currentUser || (savedUser ? JSON.parse(savedUser) : null);
            if (user) {
                // We rely on the handshake/auth for restoration, but emits login just in case
                socket.emit('user_login', { user });
            }
        });

        socket.on('session_restored', ({ room, user }) => {
            // Server recognized us and we were in a room!
            if (room) {
                setCurrentRoom(room);
                // Also ensure we be mapped to the correct user state if it drifted (rare)
                if (user) setCurrentUser(user);
            }
        });

        socket.on('disconnect', () => setIsConnected(false));

        socket.on('error_message', (msg) => {
            setError(msg);
            setLoading(false);
            setTimeout(() => setError(null), 3000);
        });

        socket.on('room_joined', (room) => {
            setCurrentRoom(room);
            setLoading(false);
        });

        socket.on('room_update', (room) => {
            if (room.status === 'ABORTED') {
                setCurrentRoom(null);
                setError('A sala foi encerrada pelo anfitrião.');
            } else {
                setCurrentRoom(room);
            }
        });

        socket.on('force_leave', () => {
            setCurrentRoom(null);
            // Maybe alert user?
            setError('A sala foi encerrada pelo anfitrião.');
        });

        socket.on('rooms_list', (rooms) => {
            setPublicRooms(rooms);
        });

        socket.on('online_users', (users) => {
            setOnlineUsers(users);
        });

        // Trigger connection
        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('session_restored');
            socket.off('error_message');
            socket.off('room_joined');
            socket.off('room_update');
            socket.off('rooms_list');
            socket.off('online_users');
            // We usually don't disconnect on unmount in a global context, 
            // but for hot-reload dev it's cleaner. 
            // In PROD, we want persistence. 
            // Let's NOT disconnect here to enable page restoration if this component remounts quickly? 
            // Actually, in React Context unmount means App closed. So yes disconnect.
            // socket.disconnect(); 
        };
    }, []); // Run once on mount

    // Apply Theme
    useEffect(() => {
        const theme = currentUser?.theme || 'theme-slate';
        document.body.className = theme;
        // Also force meta theme-color if possible (optional)
    }, [currentUser]);

    const login = (name, avatarSeed, theme = 'theme-slate') => {
        // Check for existing user to preserve ID (stats/history continuity)
        const saved = localStorage.getItem('intruso_user');
        let user;

        if (saved) {
            const parsed = JSON.parse(saved);
            user = { ...parsed, name, avatarSeed: avatarSeed || name, theme: theme || parsed.theme || 'theme-slate' };
        } else {
            user = { id: uuidv4(), name, avatarSeed: avatarSeed || name, theme };
        }

        localStorage.setItem('intruso_user', JSON.stringify(user));
        setCurrentUser(user);

        // Update auth for future reconnections
        socket.auth = { userId: user.id };
        if (socket.connected) {
            socket.emit('user_login', { user });
        } else {
            socket.connect();
        }
        return user;
    };

    const updateProfile = (updates) => {
        if (!currentUser) return;
        const updated = { ...currentUser, ...updates };
        localStorage.setItem('intruso_user', JSON.stringify(updated));
        setCurrentUser(updated);
        // Sync with server if needed for live updates? 
        // Usually login does this, but we can emit a 'profile_update' or just 'user_login' again
        socket.emit('user_login', { user: updated });
    };

    const logout = () => {
        localStorage.removeItem('intruso_user');
        setCurrentUser(null);
        setCurrentRoom(null);
        socket.auth = {}; // Clear auth
        // Use a clearer disconnect/reconnect cycle to flush server state
        socket.disconnect();
        socket.connect();
    };

    const createRoom = () => {
        setLoading(true);
        socket.emit('create_room', { user: currentUser });
    };

    const joinRoom = (roomId) => {
        setLoading(true);
        socket.emit('join_room', { roomId, user: currentUser });
    };

    const leaveRoom = () => {
        if (currentRoom && currentUser) {
            socket.emit('leave_room', { roomId: currentRoom.id, userId: currentUser.id });
            setCurrentRoom(null);
        }
    };

    const updateRoomSettings = (settings) => {
        if (!currentRoom) return;
        socket.emit('update_settings', { roomId: currentRoom.id, settings });
    };

    const startGame = (gameData) => {
        socket.emit('start_game', { roomId: currentRoom.id, gameData });
    };

    // Game Logic Helper directly mapping to server events
    const updateGameState = (updates) => {
        if (!currentRoom) return;
        socket.emit('game_action_state', { roomId: currentRoom.id, updates });
    };

    return (
        <GameContext.Provider value={{
            currentUser,
            currentRoom,
            publicRooms, // Exposed for Lobby
            onlineUsers, // Exposed for Lobby
            error,
            loading,
            isConnected,
            login,
            logout,
            updateProfile,
            createRoom,
            joinRoom,
            leaveRoom,
            updateRoomSettings,
            startGame,
            updateRoomState: (roomId, updates) => {
                if (roomId !== currentRoom?.id) return;
                socket.emit('game_action_state', { roomId, updates });
            },
            sendPlayerReady: () => {
                if (!currentRoom || !currentUser) return;
                socket.emit('player_ready', { roomId: currentRoom.id, userId: currentUser.id });
            },
            sendHostAction: (action, payload = {}) => {
                if (!currentRoom) return;
                socket.emit('host_action', { roomId: currentRoom.id, action, payload });
            },
            setError
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
