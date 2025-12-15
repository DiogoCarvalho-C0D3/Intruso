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
    const [notifications, setNotifications] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(socket.connected);

    const addNotification = (notif) => {
        const id = Date.now() + Math.random();
        setNotifications(prev => [...prev, { ...notif, id }]);
        // Auto remove after 5s unless it has action?
        if (!notif.action) {
            setTimeout(() => removeNotification(id), 5000);
        }
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

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
            const user = currentUser || (savedUser ? JSON.parse(savedUser) : null);
            if (user) { /* reconnect logic */ }
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

        // Social Listeners
        socket.on('profile_updated', (updatedUser) => {
            setCurrentUser(prev => ({ ...prev, ...updatedUser }));
            localStorage.setItem('intruso_user', JSON.stringify({ ...currentUser, ...updatedUser }));
        });

        socket.on('notification', ({ message, type }) => {
            addNotification({ message, type });
        });

        socket.on('invite_received', ({ roomId, inviterName }) => {
            addNotification({
                id: 'invite-' + roomId,
                type: 'invite',
                message: `Convite de ${inviterName}`,
                action: {
                    label: 'Entrar',
                    callback: () => joinRoom(roomId)
                }
            });
        });

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
            socket.off('profile_updated');
            socket.off('notification');
            socket.off('invite_received');
        };
    }, []);

    // Apply Theme
    useEffect(() => {
        const theme = currentUser?.theme || 'theme-slate';
        document.body.className = theme;
    }, [currentUser]);

    // ... (Auth Logic) ...

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

    // Social Actions
    const addFriend = ({ action = 'SEND_REQUEST', targetId, targetName, requesterId }) => {
        if (!currentUser) return;
        socket.emit('friend_action', {
            action,
            payload: { userId: currentUser.id, targetId, targetName, requesterId }
        });
    };

    const giveKudos = (targetId, kudoType) => {
        if (!currentUser) return;
        socket.emit('give_kudos', { targetId, kudoType });
    };

    const sendInvite = (targetId) => {
        if (!currentUser || !currentRoom) return;
        socket.emit('friend_action', {
            action: 'INVITE',
            payload: { userId: currentUser.id, targetId, roomId: currentRoom.id, inviterName: currentUser.name }
        });
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
            // Social
            notifications,
            addNotification, // Helper if needed
            removeNotification,
            addFriend,
            removeFriend: (targetId) => addFriend({ action: 'REMOVE_FRIEND', targetId }),
            giveKudos,
            sendInvite,
            socket // Expose socket instance for components
        }}>
            {children}
        </GameContext.Provider>
    );
};

export const useGame = () => useContext(GameContext);
