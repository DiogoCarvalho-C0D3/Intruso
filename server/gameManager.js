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

    // Auth: Handle Register, Login, Guest
    // Returns { user, stats, error }
    async authenticateUser(action, payload) {
        try {
            const { id, name, pin, avatarSeed, avatarType, avatarImage, accessory } = payload;

            // 1. GUEST MODE
            if (action === 'GUEST') {
                const guestId = id || uuidv4(); // Use client ID or generate
                let guestName = `C_${name.replace(/^C_/, '')}`; // ensure prefix

                // Ensure uniqueness for guests (simple append)
                // If it exists, and it's NOT the same ID, append random
                // Actually, Storage.registerUser checks ID too? storage.js usually checks ID primary key.
                // But registerUser checks name uniqueness?
                // Safe fix: If name exists, try appending a number loop or random chars.

                let existing = await this.db.findByName(guestName);
                if (existing && existing.id !== guestId) {
                    // Name taken by someone else
                    guestName = `${guestName}_${Math.floor(Math.random() * 1000)}`;
                }

                const user = {
                    id: guestId,
                    name: guestName,
                    isGuest: true,
                    avatarSeed, avatarType, avatarImage, accessory,
                    customDecks: []
                };

                // If user exists by ID, we might need to update/save instead of register?
                // registerUser usually throws if ID exists too. 
                // Let's try to get by ID first.
                const existingById = await this.db.getUser(guestId);
                if (existingById) {
                    // Update existing guest
                    // Ideally we just log them in?
                    // But we want to update their avatar/name?
                    // Let's just update profil
                    const updatedGuest = { ...existingById.profile, ...user };
                    // Keep stats
                    await this.db.saveUser(updatedGuest, existingById.stats);
                    return { user: updatedGuest, stats: existingById.stats };
                } else {
                    await this.db.registerUser(user);
                    return { user, stats: {} };
                }
            }

            // 2. REGISTER
            if (action === 'REGISTER') {
                // Check existence
                const existing = await this.db.findByName(name);
                if (existing) return { error: 'Nome já existe!' };

                const newUser = {
                    id: id || uuidv4(),
                    name,
                    pin, // In a real app, hash this!
                    isGuest: false,
                    avatarSeed, avatarType, avatarImage, accessory
                };
                await this.db.registerUser(newUser);
                return { user: newUser, stats: {} };
            }

            // 3. LOGIN
            if (action === 'LOGIN') {
                const existing = await this.db.findByName(name);
                if (!existing) return { error: 'Utilizador não encontrado.' };

                // normalize:
                const profile = existing.profile || existing;
                const stats = existing.stats || {};

                if (profile.pin !== pin) return { error: 'PIN incorreto.' };

                // LOGIN should NOT overwrite the avatar with the random one from the login screen.
                // We just return the persisted profile.

                return { user: profile, stats: stats };
            }

            return { error: 'Ação inválida.' };

        } catch (err) {
            console.error('[AUTH ERROR]', err);
            return { error: err.message || 'Erro interno no servidor.' };
        }
    }

    // Friend Notification Helper
    notifyFriends(userId, statusPayload) {
        // userId: who changed status
        // statusPayload: { id: userId, isOnline: true/false, ...profile }

        // In a clearer implementation, we would query the DB for userId's friends reverse index?
        // Or we iterate all online users and check if they have 'userId' in their friend list.
        // Since we don't have a reverse index easily in memory without fetching, iterating connected users might be cheaper for small scale.

        // Better: Get user's friend list first? No, we want to notify people who have ME as friend.
        // Relationship is bidirectional? If I add you, am I in your list? Usually yes in this simple model.
        // Let's assume bidirectional for now or just notify anyone who has this user in their list.

        Object.values(this.connectedUsers).forEach(user => {
            // Check if 'user' has 'userId' in their friends list
            // We need to ensure 'user' object here has the latest friends list.
            // connectedUsers[socketId] is a cached user object.

            if (user.friends && user.friends.find(f => f.id === userId)) {
                // Determine socketId for this 'user'
                // connectedUsers is map socketId -> user. So we need to find keys.
                // Wait, values are user objects. map is key->value.
                // We are iterating values. We need the key to emit.

                // Let's iterate entries
            }
        });

        for (const [socketId, user] of Object.entries(this.connectedUsers)) {
            if (user.friends && user.friends.find(f => f.id === userId)) {
                this.io.to(socketId).emit('friend_update', statusPayload);
            }
        }
    }

    async saveUserStats(userId, stats) {
        const record = await this.db.getUser(userId);
        if (record) {
            await this.db.saveUser(record.profile, stats);
        }
    }

    async updateUserProfile(userId, updates) {
        const record = await this.db.getUser(userId);
        if (record) {
            // Merge updates into existing profile
            const newProfile = { ...record.profile, ...updates };
            await this.db.saveUser(newProfile, record.stats);

            // 1. Update cache if user is online (connectedUsers)
            Object.keys(this.connectedUsers).forEach(socketId => {
                if (this.connectedUsers[socketId].id === userId) {
                    this.connectedUsers[socketId] = { ...this.connectedUsers[socketId], ...updates };
                }
            });

            // Notify friends of update
            this.notifyFriends(userId, { id: userId, ...newProfile, isOnline: true });

            // 2. Update user if they are in any active room (room.players)
            Object.values(rooms).forEach(room => {
                const playerIndex = room.players.findIndex(p => p.id === userId);
                if (playerIndex !== -1) {
                    // Update player object in room
                    room.players[playerIndex] = { ...room.players[playerIndex], ...updates };

                    // Notify room of the update
                    this.io.to(room.id).emit('room_update', room);
                }
            });

            return newProfile;
        }
        return null;
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
        return room;
    }

    async restoreUser(userId, socketId) {
        // Fetch user from DB to add to online list if they are just in lobby
        const record = await this.db.getUser(userId);
        if (record) {
            // Normalize profile (handle Json vs Mongo structure difference)
            // Json: record.profile. Mongo: record IS the profile (mostly)
            const profile = record.profile || record;
            if (profile) {
                this.loginUser(socketId, profile);
                return profile;
            }
        }
        return null;
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
        // Capture user to notify friends later
        const user = this.connectedUsers[socketId];

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

        // Notify friends of offline status
        if (user) {
            this.notifyFriends(user.id, { id: user.id, isOnline: false });
        }
    }

    getPublicRooms() {
        return Object.values(rooms)
            .filter(r => r.status === 'LOBBY' && !r.isPrivate)
            .sort((a, b) => b.createdAt - a.createdAt);
    }
}
