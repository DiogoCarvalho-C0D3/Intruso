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
});

// Handle SPA routing: serve index.html for any unknown route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`SERVER RUNNING ON PORT ${PORT} `);
});
