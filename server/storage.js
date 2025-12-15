import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { User } from './models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Interface Definition (Implicit) ---
// async init()
// async getUser(userId)
// async saveUser(userProfile, stats) 
// async searchUser(name, discriminator)

// --- Strategy 1: MongoDB ---
// --- Strategy 1: MongoDB ---
class MongoStorage {
    async init() {
        if (!process.env.MONGO_URI) return false;
        try {
            await mongoose.connect(process.env.MONGO_URI);
            console.log('[Storage] Connected to MongoDB Atlas.');
            return true;
        } catch (e) {
            console.error('[Storage] MongoDB Connection Failed:', e);
            return false;
        }
    }

    async getUser(userId) {
        const doc = await User.findOne({ id: userId });
        if (!doc) return null;
        return { profile: doc.toObject(), stats: doc.stats, id: doc.id };
    }

    // New Auth Methods
    async findByName(name) {
        // Case-insensitive regex search
        const doc = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
        if (!doc) return null;
        return { profile: doc.toObject(), stats: doc.stats, id: doc.id };
    }

    async registerUser(profile) {
        const user = new User(profile);
        await user.save();
        return user.toObject();
    }

    async saveUser(userProfile, stats) {
        // Only saving existing users
        const update = { ...userProfile, lastLogin: Date.now() };
        if (stats) update.stats = stats;

        await User.findOneAndUpdate(
            { id: userProfile.id },
            update,
            { new: true }
        );
    }

    async getLeaderboard(userId) {
        const categories = {
            totalGames: 'stats.totalGames',
            impostorWins: 'stats.wins.impostor',
            citizenWins: 'stats.wins.citizen'
        };

        const result = {};

        const getCategoryData = async (fieldKey) => {
            // Exclude guests
            const top5Docs = await User.find({ isGuest: false })
                .sort({ [fieldKey]: -1 })
                .limit(5)
                .select('name avatarSeed avatarType avatarImage accessory ' + fieldKey);

            const top5 = top5Docs.map(doc => {
                const value = fieldKey.split('.').reduce((o, i) => o?.[i] || 0, doc);
                return {
                    name: doc.name,
                    avatarSeed: doc.avatarSeed,
                    avatarType: doc.avatarType,
                    avatarImage: doc.avatarImage,
                    value: value || 0
                };
            });

            let userRankData = null;
            if (userId) {
                const userDoc = await User.findOne({ id: userId });
                if (userDoc && !userDoc.isGuest) {
                    const userValue = fieldKey.split('.').reduce((o, i) => o?.[i] || 0, userDoc) || 0;
                    const rank = await User.countDocuments({ isGuest: false, [fieldKey]: { $gt: userValue } }) + 1;
                    userRankData = {
                        rank,
                        value: userValue,
                        name: userDoc.name
                    };
                }
            }
            return { top: top5, user: userRankData };
        };

        result.totalGames = await getCategoryData(categories.totalGames);
        result.impostorWins = await getCategoryData(categories.impostorWins);
        result.citizenWins = await getCategoryData(categories.citizenWins);

        return result;
    }
}

// --- Strategy 2: Local JSON File (Fallback) ---
class JsonStorage {
    constructor() {
        this.filePath = process.env.DB_PATH || path.join(__dirname, 'db.json');
        this.data = { users: {} };
        this.saveTimer = null;
    }

    async init() {
        try {
            if (fs.existsSync(this.filePath)) {
                this.data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
                console.log(`[Storage] Loaded local DB from ${this.filePath}`);
            } else {
                console.log(`[Storage] Creating new local DB at ${this.filePath}`);
                this.persist();
            }
            return true;
        } catch (e) {
            console.error('[Storage] JSON Init Error:', e);
            return false;
        }
    }

    persist() {
        const dir = path.dirname(this.filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
    }

    saveDebounced() {
        if (this.saveTimer) clearTimeout(this.saveTimer);
        this.saveTimer = setTimeout(() => this.persist(), 1000);
    }

    async getUser(userId) {
        return this.data.users[userId] || null;
    }

    async findByName(name) {
        if (!name) return null;
        // Case-insensitive search
        return Object.values(this.data.users).find(u => u.profile.name.toLowerCase() === name.toLowerCase());
    }

    async registerUser(profile) {
        // Assume check happened before, but double check
        if (await this.findByName(profile.name)) throw new Error('Name exists');

        this.data.users[profile.id] = {
            profile,
            stats: {},
            lastLogin: Date.now()
        };
        this.saveDebounced();
        return this.data.users[profile.id];
    }

    async saveUser(userProfile, stats) {
        const existing = this.data.users[userProfile.id];
        if (!existing) return; // Should exist

        this.data.users[userProfile.id] = {
            ...existing,
            profile: { ...existing.profile, ...userProfile },
            stats: stats || existing.stats,
            lastLogin: Date.now()
        };
        this.saveDebounced();
    }

    async getLeaderboard(userId) {
        const allUsers = Object.values(this.data.users).filter(u => !u.profile.isGuest);
        const categories = {
            totalGames: u => u.stats?.totalGames || 0,
            impostorWins: u => u.stats?.wins?.impostor || 0,
            citizenWins: u => u.stats?.wins?.citizen || 0,
            impostorRate: u => {
                const played = u.stats?.roles?.impostor || 0;
                if (played < 3) return -1;
                return ((u.stats?.wins?.impostor || 0) / played) * 100;
            },
            citizenRate: u => {
                const played = u.stats?.roles?.citizen || 0;
                if (played < 3) return -1;
                return ((u.stats?.wins?.citizen || 0) / played) * 100;
            }
        };

        const result = {};

        for (const [key, getValue] of Object.entries(categories)) {
            const sorted = allUsers.sort((a, b) => getValue(b) - getValue(a));

            const top5 = sorted.slice(0, 5).map(u => ({
                name: u.profile.name,
                avatarSeed: u.profile.avatarSeed,
                avatarType: u.profile.avatarType,
                avatarImage: u.profile.avatarImage,
                accessory: u.profile.accessory,
                value: getValue(u)
            }));

            let userRankData = null;
            if (userId) {
                const userIndex = sorted.findIndex(u => u.profile.id === userId);
                if (userIndex !== -1) {
                    userRankData = {
                        rank: userIndex + 1,
                        value: getValue(sorted[userIndex]),
                        name: sorted[userIndex].profile.name
                    };
                }
            }
            result[key] = { top: top5, user: userRankData };
        }

        return result;
    }
}

// --- Manager ---
export class StorageManager {
    constructor() {
        this.activeStorage = null;
    }

    async init() {
        if (process.env.MONGO_URI) {
            const mongo = new MongoStorage();
            if (await mongo.init()) {
                this.activeStorage = mongo;
                return;
            }
        }
        console.log('[Storage] Falling back to Local JSON Storage.');
        this.activeStorage = new JsonStorage();
        await this.activeStorage.init();
    }

    async getUser(id) { return this.activeStorage.getUser(id); }
    async findByName(name) { return this.activeStorage.findByName(name); }
    async registerUser(profile) { return this.activeStorage.registerUser(profile); }
    async saveUser(profile, stats) { return this.activeStorage.saveUser(profile, stats); }
    async getLeaderboard(userId) { return this.activeStorage.getLeaderboard(userId); }
}
