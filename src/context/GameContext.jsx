import { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';

const GameContext = createContext();

// Detect server URL. 
const getServerUrl = () => {
    if (import.meta.env.PROD) {
        return ''; // Connect to same origin
    }
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`; // Ensure this matches your server port
};

// Socket initialization
export const socket = io(getServerUrl(), {
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
        const savedUser = localStorage.getItem('intruso_user');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            socket.auth = { userId: user.id };
        }

        if (socket.connected) setIsConnected(true);

        const onConnect = () => {
            setIsConnected(true);
            // Re-authenticate if we have a user
            const user = currentUser || (savedUser ? JSON.parse(savedUser) : null);
            if (user) {
                // We use a silent reconnect logic here if needed, or rely on socket.auth
            }
        };

        const onSessionRestored = ({ room, user }) => {
            if (room) setCurrentRoom(room);
            if (user) {
                setCurrentUser(user);
                localStorage.setItem('intruso_user', JSON.stringify(user));
            }
        };

        const onUserRestored = (user) => {
            setCurrentUser(user);
            localStorage.setItem('intruso_user', JSON.stringify(user));
        };

        socket.on('connect', onConnect);
        socket.on('session_restored', onSessionRestored);
        socket.on('user_restored', onUserRestored);
        socket.on('disconnect', () => setIsConnected(false));
        socket.on('error_message', (msg) => { setError(msg); setLoading(false); setTimeout(() => setError(null), 3000); });
        socket.on('room_joined', (room) => { setCurrentRoom(room); setLoading(false); });
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
            setError('A sala foi encerrada.');
        });
        socket.on('rooms_list', setPublicRooms);
        socket.on('online_users', setOnlineUsers);

        if (!socket.connected) {
            socket.connect();
        }

        return () => {
            socket.off('connect', onConnect);
            socket.off('session_restored', onSessionRestored);
            socket.off('user_restored', onUserRestored);
            socket.off('disconnect');
            socket.off('error_message');
            socket.off('room_joined');
            socket.off('room_update');
            socket.off('force_leave');
            socket.off('rooms_list');
            socket.off('online_users');
        };
    }, []);

    // Apply Theme
    useEffect(() => {
        const theme = currentUser?.theme || 'theme-slate';
        document.body.className = theme;
    }, [currentUser]);

    // --- AUTH 2.0 ---
    const login = (action, payload) => {
        return new Promise((resolve, reject) => {
            if (!socket) return reject(new Error('Erro de conexão.'));

            // Handlers
            const onSuccess = ({ user, stats }) => {
                setCurrentUser(user);
                // We could merge stats into user or keep separate. 
                // For this app, stats are part of user or separate context? 
                // Let's attach to user for now or ignore if Leaderboard fetches it.
                // The server returns separate `stats`.
                const fullUser = { ...user, stats };

                localStorage.setItem('intruso_user', JSON.stringify(fullUser));
                // Update auth for future reconnects
                socket.auth = { userId: user.id };

                cleanup();
                resolve(fullUser);
            };

            const onError = (err) => {
                cleanup();
                reject(new Error(err));
            };

            const cleanup = () => {
                socket.off('auth_success', onSuccess);
                socket.off('auth_error', onError);
            };

            socket.on('auth_success', onSuccess);
            socket.on('auth_error', onError);

            // Timeout safety
            setTimeout(() => {
                cleanup();
                reject(new Error('Tempo de espera esgotado.'));
            }, 5000);

            // Emit
            socket.emit('user_auth', { action, payload });
        });
    };

    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('intruso_user');
        setCurrentRoom(null);
        socket.auth = {};
        socket.disconnect();
        socket.connect();
    };

    // --- GAME ACTIONS ---
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

    const updateRoomState = (roomId, updates) => {
        if (roomId !== currentRoom?.id) return;
        socket.emit('game_action_state', { roomId, updates });
    };

    const sendPlayerReady = () => {
        if (!currentRoom || !currentUser) return;
        socket.emit('player_ready', { roomId: currentRoom.id, userId: currentUser.id });
    };

    const sendHostAction = (action, payload = {}) => {
        if (!currentRoom) return;
        socket.emit('host_action', { roomId: currentRoom.id, action, payload });
    };

    const updateProfile = (updates) => {
        if (!currentUser) return;

        // Optimistic update
        const updatedUser = { ...currentUser, ...updates };
        setCurrentUser(updatedUser);
        localStorage.setItem('intruso_user', JSON.stringify(updatedUser)); // Persist locally immediately!

        socket.emit('update_profile', { userId: currentUser.id, updates });
    };

    return (
        <GameContext.Provider value={{
            currentUser,
            currentRoom,
            publicRooms,
            onlineUsers,
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
            updateRoomState,
            sendPlayerReady,
            sendHostAction,
            setError,
            socket // Expose socket instance for components
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
