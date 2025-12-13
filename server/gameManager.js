import { v4 as uuidv4 } from 'uuid';

// In-memory storage
export const rooms = {};

const userLog = (msg) => console.log(`[GAME] ${msg}`);

// Default settings

// Default settings
const DEFAULT_SETTINGS = {
    maxPlayers: 4,
    impostorCount: 1,
    rounds: 2,
    categories: ['Geral'],
    difficulty: 'medium'
};

import { StorageManager } from './storage.js';

export class GameManager {
    constructor(io) {
        this.io = io;
        this.connectedUsers = {}; // socketId -> { id, name }
        this.db = new StorageManager(); // Persistent Storage Abstraction
    }

    async init() {
        await this.db.init();
    }

    // Helper to emit updates to a specific room
    emitRoomUpdate(roomId) {
        if (rooms[roomId]) {
            this.io.to(roomId).emit('room_update', rooms[roomId]);
        }
    }

    generateGameId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    emitError(socketId, message) {
        this.io.to(socketId).emit('error_message', message);
    }

    // User Management
    loginUser(socketId, user) {
        this.connectedUsers[socketId] = user;
    }

    // New: Sync User with Persistence
    // Called when user connects/logs in. Returns the Full User Object + Stats from DB
    async syncUser(socketId, clientUser) {
        // 1. Try to find user in DB by ID
        let dbRecord = await this.db.getUser(clientUser.id);

        // 2. If not found by ID (maybe new ID generated on client?),
        // fallback to strict Name#Tag search because client might have regenerated ID
        // after cache clear but remembers the Tag.
        if (!dbRecord && clientUser.discriminator) {
            dbRecord = await this.db.searchUser(clientUser.name, clientUser.discriminator);
        }

        if (dbRecord) {
            // User exists!
            // Update last seen
            await this.db.saveUser({ ...dbRecord.profile, ...clientUser }, dbRecord.stats); // Merge client profile updates (like avatar)

            // Return Safe Data
            return {
                user: { ...dbRecord.profile, ...clientUser, id: dbRecord.profile.id }, // Trust DB ID or Profile ID? Trust Profile ID from DB.
                stats: dbRecord.stats
            };
        } else {
            // New User
            // Save initial record
            await this.db.saveUser(clientUser, null);
            return { user: clientUser, stats: null };
        }
    }

    async saveUserStats(userId, stats) {
        const record = await this.db.getUser(userId);
        if (record) {
            await this.db.saveUser(record.profile, stats);
        }
    }

    async getLeaderboard(userId) {
        return await this.db.getLeaderboard(userId);
    }

    logoutUser(socketId) {
        delete this.connectedUsers[socketId];
    }

    getOnlineUsers() {
        // Return unique users by ID to avoid duplicates if same user has multiple tabs?
        // Actually map is socketId -> User.
        return Object.values(this.connectedUsers);
    }

    // Helper to find existing room for a user
    findUserRoom(userId) {
        for (const roomId in rooms) {
            const room = rooms[roomId];
            if (room.players.find(p => p.id === userId)) {
                return room;
            }
        }
        return null;
    }

    // Handle user resuming session
    restoreSession(socketId, userId) {
        // 1. Check if they are in a room
        const room = this.findUserRoom(userId);

        // 2. If they are in connectedUsers (maybe different tab or quick reconnect), update socket
        // But connectedUsers is keyed by socketId. So we'd have to scan values.
        // It's easier to just "Login" them again as active.
        return room;
    }

    createRoom(user, socketId) {
        const roomId = Math.floor(100000 + Math.random() * 900000).toString();

        // Create user with socketId association
        const host = { ...user, socketId };

        const newRoom = {
            id: roomId,
            code: roomId,
            hostId: user.id,
            name: `Sala de ${user.name}`,
            players: [host],
            settings: { ...DEFAULT_SETTINGS },
            status: 'LOBBY',
            gameState: null,
            createdAt: Date.now(),
            createdAt: Date.now(),
            isPrivate: false,
        };

        rooms[roomId] = newRoom;
        return newRoom;
    }

    joinRoom(roomId, user, socketId) {
        const room = rooms[roomId];
        if (!room) throw new Error('Sala não encontrada!');
        if (room.status !== 'LOBBY') throw new Error('O jogo já começou!');
        if (room.players.length >= room.settings.maxPlayers) throw new Error('Sala cheia!');

        // Check if user is already in (reconnect logic could go here, but for now simple)
        const existingPlayerIndex = room.players.findIndex(p => p.id === user.id);
        if (existingPlayerIndex >= 0) {
            // Update socket id
            room.players[existingPlayerIndex].socketId = socketId;
        } else {
            // Check name uniqueness
            if (room.players.find(p => p.name === user.name)) throw new Error('Nome já existe na sala!');
            room.players.push({ ...user, socketId });
        }

        return room;
    }

    leaveRoom(roomId, userId) {
        const room = rooms[roomId];
        if (!room) return;

        room.players = room.players.filter(p => p.id !== userId);

        if (room.players.length === 0) {
            delete rooms[roomId]; // Delete empty room
            return null;
        }

        if (room.hostId === userId) {
            room.hostId = room.players[0].id; // Assign new host
        }

        return room;
    }

    updateSettings(roomId, settings) {
        const room = rooms[roomId];
        if (room) {
            if (settings.name) {
                room.name = settings.name;
            }
            if (typeof settings.isPrivate !== 'undefined') {
                room.isPrivate = settings.isPrivate;
            }
            // Update other settings deeply if needed, or spread
            // Filter out 'name' from settings object itself if we want to keep it clean, but it doesn't hurt.
            room.settings = { ...room.settings, ...settings };
        }
        return room;
    }

    updateGameState(roomId, updates) {
        const room = rooms[roomId];
        if (room) {
            // Deep merge for gameState if it exists in updates
            if (updates.gameState && room.gameState) {
                updates.gameState = { ...room.gameState, ...updates.gameState };
            }
            Object.assign(room, updates);
        }
        return room;
    }

    updateRoomStatus(roomId, status) {
        const room = rooms[roomId];
        if (room) {
            room.status = status;
        }
        return room;
    }

    setPlayerReady(roomId, userId) {
        const room = rooms[roomId];
        if (!room || !room.gameState) return null;

        const currentReady = new Set(room.gameState.readyPlayers || []);
        currentReady.add(userId);

        const readyArray = Array.from(currentReady);
        let updates = { gameState: { readyPlayers: readyArray } };

        // Check if all players are ready
        // Filter out disconnected players? For now require all known players to be safe
        if (readyArray.length >= room.players.length) {
            updates.gameState.phase = 'ROUND';
            updates.gameState.currentTurnIndex = 0;
            // Generate unique gameId for stats tracking
            updates.gameState.gameId = this.generateGameId();
            userLog(`[Room ${roomId}] All users ready. Starting Round 1 (GameID: ${updates.gameState.gameId}).`);
        }

        // Apply update using internal method
        return this.updateGameState(roomId, updates);
    }

    resetRoom(roomId) {
        const room = rooms[roomId];
        if (!room) return null;

        const resetState = {
            status: 'LOBBY',
            gameState: null,
            // Reset player ready states if we tracked them on player objects too
        };
        Object.assign(room, resetState);
        return room;
    }

    deleteRoom(roomId) {
        if (rooms[roomId]) {
            delete rooms[roomId];
            return true;
        }
        return false;
    }

    disconnect(socketId) {
        // Remove from connected users
        if (this.connectedUsers[socketId]) {
            delete this.connectedUsers[socketId];
        }

        // Handle Room Disconnection
        for (const roomId in rooms) {
            const room = rooms[roomId];
            const player = room.players.find(p => p.socketId === socketId);
            if (player) {
                // If the game started, allow "disconnect" without leaving?
                if (room.status === 'LOBBY') {
                    this.leaveRoom(roomId, player.id);
                    this.emitRoomUpdate(roomId);
                }
                break;
            }
        }
    }

    getPublicRooms() {
        return Object.values(rooms)
            .filter(r => r.status === 'LOBBY' && !r.isPrivate)
            .sort((a, b) => b.createdAt - a.createdAt);
    }
}
