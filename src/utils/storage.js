import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEYS = {
    ROOMS: 'intruso_rooms',
    USERS: 'intruso_users',
};

// Helper: Read from LS
const getRooms = () => JSON.parse(localStorage.getItem(STORAGE_KEYS.ROOMS) || '{}');
const saveRooms = (rooms) => localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));

export const mockServer = {
    // --- User Actions ---
    createUser: (name, avatarId) => {
        const user = { id: uuidv4(), name, avatarId };
        // In a real app we'd save this to a DB. For local, we just return it 
        // and rely on the client to store their own identity in Session/Local storage.
        return user;
    },

    // --- Room Actions ---
    createRoom: (hostUser, settings) => {
        const rooms = getRooms();
        const roomId = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code

        const newRoom = {
            id: roomId,
            code: roomId,
            hostId: hostUser.id,
            name: `${hostUser.name}'s Room`,
            players: [hostUser],
            settings: {
                maxPlayers: settings.maxPlayers || 8,
                impostorCount: settings.impostorCount || 1, // Default, logic to validate is in GameContext
                rounds: settings.rounds || 3,
                categories: settings.categories || ['Geral']
            },
            status: 'LOBBY', // LOBBY, PLAYING, VOTING, FINISHED
            gameState: null,
            createdAt: Date.now(),
            isPublic: true, // Default
        };

        rooms[roomId] = newRoom;
        saveRooms(rooms);
        return newRoom;
    },

    joinRoom: (roomId, user) => {
        const rooms = getRooms();
        const room = rooms[roomId];

        if (!room) throw new Error('Sala não encontrada!');
        if (room.status !== 'LOBBY') throw new Error('O jogo já começou!');
        if (room.players.length >= room.settings.maxPlayers) throw new Error('Sala cheia!');
        if (room.players.find(p => p.id === user.id)) return room; // Already joined

        // Check name uniqueness in room
        if (room.players.find(p => p.name === user.name)) throw new Error('Nome já existe na sala!');

        room.players.push(user);
        saveRooms(rooms);
        return room;
    },

    leaveRoom: (roomId, userId) => {
        const rooms = getRooms();
        const room = rooms[roomId];
        if (!room) return;

        room.players = room.players.filter(p => p.id !== userId);

        // If host leaves, assign new host or delete room
        if (room.players.length === 0) {
            delete rooms[roomId];
        } else if (room.hostId === userId) {
            room.hostId = room.players[0].id;
        }

        saveRooms(rooms);
    },

    getPublicRooms: () => {
        const rooms = getRooms();
        return Object.values(rooms)
            .filter(r => r.status === 'LOBBY' && r.isPublic)
            .sort((a, b) => b.createdAt - a.createdAt);
    },

    getRoom: (roomId) => {
        const rooms = getRooms();
        return rooms[roomId] || null;
    },

    // --- Game State Updates (The "Server" Logic) ---
    updateRoomState: (roomId, updates) => {
        const rooms = getRooms();
        if (!rooms[roomId]) return;

        rooms[roomId] = { ...rooms[roomId], ...updates };
        saveRooms(rooms);
        return rooms[roomId];
    }
};
