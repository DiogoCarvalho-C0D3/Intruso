import 'dotenv/config';
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { GameManager } from './gameManager.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve static files from the React build "dist" directory
app.use(express.static(path.join(__dirname, '../dist')));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Allow any origin
        methods: ["GET", "POST"]
    }
});

const gameManager = new GameManager(io);

// Init DB then Start Server
await gameManager.init();

io.on('connection', async (socket) => {
    console.log('User connected:', socket.id);
    const userId = socket.handshake.auth?.userId;

    // Attempt restoration
    if (userId) {
        const room = gameManager.restoreSession(socket.id, userId);
        if (room) {
            console.log(`Restoring session for user ${userId} in room ${room.id}`);
            socket.join(room.id);
            // Re-login user to online list if we know their name (might need to fetch from room)
            const player = room.players.find(p => p.id === userId);
            if (player) {
                gameManager.loginUser(socket.id, player); // Add back to online list
                socket.emit('session_restored', { room, user: player });
            }
        }

        // Always try to restore user profile if we have userId
        const restoredUser = await gameManager.restoreUser(userId, socket.id);
        if (restoredUser && !socket.handshake.query.reconnect) {
            socket.emit('user_restored', restoredUser);
        }
    }


    // Send initial data
    socket.emit('rooms_list', gameManager.getPublicRooms());
    io.emit('online_users', gameManager.getOnlineUsers());

    socket.on('user_auth', async ({ action, payload }) => {
        const { user, stats, error } = await gameManager.authenticateUser(action, payload);

        if (error) {
            socket.emit('auth_error', error);
            return;
        }

        // Success
        gameManager.loginUser(socket.id, user); // Track socket

        // Send back
        socket.emit('auth_success', { user, stats });
        io.emit('online_users', gameManager.getOnlineUsers());
    });

    socket.on('save_stats', async ({ userId, stats }) => {
        // Client pushing new stats to be persisted
        await gameManager.saveUserStats(userId, stats);
    });

    socket.on('update_profile', async ({ userId, updates }) => {
        const updatedUser = await gameManager.updateUserProfile(userId, updates);
        if (updatedUser) {
            socket.emit('profile_updated', updatedUser);
            // Broadcast change to others (e.g. for Avatar updates in lobby)
            io.emit('online_users', gameManager.getOnlineUsers());
        }
    });

    socket.on('request_leaderboard', async ({ userId }) => {
        const data = await gameManager.getLeaderboard(userId);
        socket.emit('leaderboard_data', data);
    });

    socket.on('create_room', ({ user }) => {
        try {
            const room = gameManager.createRoom(user, socket.id);
            socket.join(room.id);
            socket.emit('room_joined', room);
            io.emit('rooms_list', gameManager.getPublicRooms()); // Broadcast public list
        } catch (e) {
            socket.emit('error_message', e.message);
        }
    });

    socket.on('join_room', ({ roomId, user }) => {
        try {
            const room = gameManager.joinRoom(roomId, user, socket.id);
            socket.join(roomId);
            socket.emit('room_joined', room);
            io.to(roomId).emit('room_update', room);
            io.emit('rooms_list', gameManager.getPublicRooms());
        } catch (e) {
            socket.emit('error_message', e.message);
        }
    });

    socket.on('leave_room', ({ roomId, userId }) => {
        const room = gameManager.leaveRoom(roomId, userId);
        socket.leave(roomId);
        if (room) {
            io.to(roomId).emit('room_update', room);
        }
        io.emit('rooms_list', gameManager.getPublicRooms());
    });

    socket.on('get_rooms', () => {
        socket.emit('rooms_list', gameManager.getPublicRooms());
    });

    socket.on('update_settings', ({ roomId, settings }) => {
        const room = gameManager.updateSettings(roomId, settings);
        io.to(roomId).emit('room_update', room);
        io.emit('rooms_list', gameManager.getPublicRooms()); // Update categories listing etc
    });

    socket.on('start_game', ({ roomId, gameData }) => {
        const room = gameManager.updateGameState(roomId, { status: 'PLAYING', gameState: gameData });
        io.to(roomId).emit('room_update', room);
        io.emit('rooms_list', gameManager.getPublicRooms()); // Remove from public list? Filter logic handles it.
    });

    socket.on('game_action_state', ({ roomId, updates }) => {
        // Generic update for game state (Reveal, Turn, Vote, Result)
        const room = gameManager.updateGameState(roomId, updates);
        io.to(roomId).emit('room_update', room);
    });

    socket.on('player_ready', ({ roomId, userId }) => {
        const updatedRoom = gameManager.setPlayerReady(roomId, userId);
        if (updatedRoom) {
            io.to(roomId).emit('room_update', updatedRoom);
        }
    });

    socket.on('host_action', ({ roomId, action, payload }) => {
        if (action === 'RESTART') {
            const updatedRoom = gameManager.resetRoom(roomId);
            if (updatedRoom) {
                io.to(roomId).emit('room_update', updatedRoom);
            }
        } else if (action === 'DELETE') {
            // 1. Mark as ABORTED so clients react via standard state sync
            // This is more reliable than a one-off event that might be missed
            const abortedRoom = gameManager.updateRoomStatus(roomId, 'ABORTED');
            if (abortedRoom) {
                io.to(roomId).emit('room_update', abortedRoom);
            }

            // 2. Schedule actual deletion
            setTimeout(() => {
                // Also force disconnect just in case
                (async () => {
                    try {
                        const sockets = await io.in(roomId).fetchSockets();
                        for (const s of sockets) {
                            s.emit('force_leave');
                            s.leave(roomId);
                        }
                    } catch (e) { console.error(e); }
                })();

                gameManager.deleteRoom(roomId);
                io.emit('rooms_list', gameManager.getPublicRooms());
            }, 3000); // Give 3 seconds for clients to process the status change and navigate away
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        gameManager.disconnect(socket.id);
        io.emit('online_users', gameManager.getOnlineUsers());
    });

    // Social Interactions
    socket.on('send_reaction', ({ roomId, emoji }) => {
        io.to(roomId).emit('reaction_received', { emoji, socketId: socket.id });
    });

    // KUDOS SYSTEM
    socket.on('give_kudos', async ({ targetId, kudoType }) => {
        try {
            if (!['detective', 'liar', 'mvp'].includes(kudoType)) return;

            // Increment the specific kudo
            const updateField = {};
            updateField[`stats.kudos.${kudoType}`] = 1;

            const updatedUser = await gameManager.db.User.findOneAndUpdate(
                { id: targetId },
                { $inc: updateField },
                { new: true }
            );

            // Notify target if online to update their UI
            const targetSocketId = getSocketId(targetId);
            if (targetSocketId) {
                // We reuse the 'profile_updated' event or send a specific one
                // Let's send a silent profile update or just re-fetch
                // Sending the full updated user object is easiest if client handles it
                // Actually, Storage.js logic is mixed here. 
                // Let's us gameManager.db wrapper if possible, but finding by ID and updating is mongo specific.
                // Re-using getUser to ensure consistent format if we emit back
                const fullUser = await gameManager.db.getUser(targetId);
                io.to(targetSocketId).emit('profile_updated', fullUser);

                // Optional: Toast notification
                const kudoLabels = { detective: '🕵️ Detetive Astuto', liar: '🎭 Melhor Mentiroso', mvp: '🧠 Mente Brilhante' };
                io.to(targetSocketId).emit('show_toast', {
                    type: 'success',
                    message: `Recebeste honra: ${kudoLabels[kudoType]}!`
                });
            }

        } catch (error) {
            console.error('Error giving kudos:', error);
        }
    });

    socket.on('friend_action', async ({ action, payload }) => {
        try {
            const { userId, targetId, targetName } = payload;

            // HELPER: Get Socket ID by User ID
            const getSocket = (uid) => {
                const entry = Object.entries(gameManager.connectedUsers).find(([sid, u]) => u.id === uid);
                return entry ? entry[0] : null;
            };

            if (action === 'SEND_REQUEST') {
                // 1. Get User
                const user = await gameManager.db.getUser(userId);
                // 2. Get Target
                let target;
                if (targetId) target = await gameManager.db.getUser(targetId);
                else if (targetName) target = await gameManager.db.findByName(targetName);

                if (!user || !user.profile) {
                    socket.emit('error_message', 'Erro de sessão.');
                    return;
                }
                if (!target || !target.profile) {
                    const searchedFor = targetName || 'ID desconhecido';
                    socket.emit('error_message', `Utilizador "${searchedFor}" não encontrado.`);
                    return;
                }
                if (user.profile.id === target.profile.id) {
                    socket.emit('error_message', 'Não podes adicionar-te a ti mesmo!');
                    return;
                }

                // Check existence
                const userReqs = user.profile.friendRequests || [];
                const userFriends = user.profile.friends || [];

                if (userFriends.find(f => f.id === target.profile.id)) {
                    socket.emit('error_message', 'Já são amigos!');
                    return;
                }
                if (userReqs.find(r => r.id === target.profile.id)) {
                    socket.emit('error_message', 'Pedido já enviado ou pendente!');
                    return;
                }

                // Update User (Outgoing)
                if (!user.profile.friendRequests) user.profile.friendRequests = [];
                user.profile.friendRequests.push({ id: target.profile.id, name: target.profile.name, type: 'outgoing' });
                await gameManager.db.saveUser(user.profile, user.stats);

                // Update Target (Incoming)
                if (!target.profile.friendRequests) target.profile.friendRequests = [];
                target.profile.friendRequests.push({ id: user.profile.id, name: user.profile.name, type: 'incoming' });
                await gameManager.db.saveUser(target.profile, target.stats);

                // Notify User
                socket.emit('profile_updated', user.profile);
                socket.emit('notification', { message: `Pedido enviado a ${target.profile.name}`, type: 'success' });

                // Notify Target
                const targetSocket = getSocket(target.profile.id);
                if (targetSocket) {
                    io.to(targetSocket).emit('profile_updated', target.profile); // Update req list
                    io.to(targetSocket).emit('notification', {
                        message: `${user.profile.name} enviou-te um pedido de amizade!`,
                        type: 'info'
                    });
                }
            }

            if (action === 'ACCEPT_REQUEST') {
                const { requesterId } = payload; // The person who sent the request
                const user = await gameManager.db.getUser(userId); // Me (Accepting)
                const requester = await gameManager.db.getUser(requesterId);

                if (user && requester) {
                    // Remove from requests
                    user.profile.friendRequests = (user.profile.friendRequests || []).filter(r => r.id !== requesterId);
                    requester.profile.friendRequests = (requester.profile.friendRequests || []).filter(r => r.id !== userId);

                    // Add to friends
                    if (!user.profile.friends) user.profile.friends = [];
                    user.profile.friends.push({ id: requester.profile.id, name: requester.profile.name });

                    if (!requester.profile.friends) requester.profile.friends = [];
                    requester.profile.friends.push({ id: user.profile.id, name: user.profile.name });

                    // Save
                    await gameManager.db.saveUser(user.profile, user.stats);
                    await gameManager.db.saveUser(requester.profile, requester.stats);

                    // Notify Me
                    socket.emit('profile_updated', user.profile);
                    socket.emit('notification', { message: `Agora és amigo de ${requester.profile.name}!`, type: 'success' });

                    // Notify Requester
                    const reqSocket = getSocket(requester.profile.id);
                    if (reqSocket) {
                        io.to(reqSocket).emit('profile_updated', requester.profile);
                        io.to(reqSocket).emit('notification', { message: `${user.profile.name} aceitou o teu pedido!`, type: 'success' });
                    }
                }
            }

            if (action === 'DECLINE_REQUEST') {
                const { requesterId } = payload;
                const user = await gameManager.db.getUser(userId);
                const requester = await gameManager.db.getUser(requesterId);

                if (user && requester) {
                    // Remove from requests only
                    user.profile.friendRequests = (user.profile.friendRequests || []).filter(r => r.id !== requesterId);
                    requester.profile.friendRequests = (requester.profile.friendRequests || []).filter(r => r.id !== userId);

                    await gameManager.db.saveUser(user.profile, user.stats);
                    await gameManager.db.saveUser(requester.profile, requester.stats);

                    socket.emit('profile_updated', user.profile);

                    // Silently update requester so pending state clears
                    const reqSocket = getSocket(requester.profile.id);
                    if (reqSocket) {
                        io.to(reqSocket).emit('profile_updated', requester.profile);
                    }
                }
            }

            if (action === 'REMOVE_FRIEND') {
                const user = await gameManager.db.getUser(userId);
                const target = await gameManager.db.getUser(targetId);

                if (user && target) {
                    user.profile.friends = (user.profile.friends || []).filter(f => f.id !== targetId);
                    await gameManager.db.saveUser(user.profile, user.stats);

                    // Mutual removal
                    target.profile.friends = (target.profile.friends || []).filter(f => f.id !== userId);
                    await gameManager.db.saveUser(target.profile, target.stats);

                    socket.emit('profile_updated', user.profile);
                    socket.emit('notification', { message: 'Amigo removido.', type: 'info' });

                    // Notify target if online
                    const targetSocket = getSocket(target.profile.id);
                    if (targetSocket) {
                        io.to(targetSocket).emit('profile_updated', target.profile);
                    }
                }
            }

            if (action === 'INVITE') {
                const { roomId, inviterName } = payload;
                const targetSocket = getSocket(targetId);

                if (targetSocket) {
                    io.to(targetSocket).emit('invite_received', { roomId, inviterName });
                    socket.emit('notification', { message: 'Convite enviado!', type: 'success' });
                } else {
                    socket.emit('error_message', 'Utilizador não está online.');
                }
            }

        } catch (e) {
            console.error(e);
            socket.emit('error_message', 'Erro ao processar ação social.');
        }
    });
});

// Handle SPA routing: serve index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`SERVER RUNNING ON PORT ${PORT} `);
});
