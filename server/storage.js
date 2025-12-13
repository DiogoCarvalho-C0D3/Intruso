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

    async searchUser(name, discriminator) {
        const cleanName = name.trim(); // Case sensitive stored, but maybe query regex?
        // Let's stick to exact match for reliability or case-insensitive via collation if needed.
        // For simplicity, we use exact match on stored fields.
        const doc = await User.findOne({
            name: { $regex: new RegExp(`^${cleanName}$`, 'i') },
            discriminator
        });
        if (!doc) return null;
        return { profile: doc.toObject(), stats: doc.stats, id: doc.id };
    }

    async saveUser(userProfile, stats) {
        // Upsert based on ID
        const update = { ...userProfile, lastLogin: Date.now() };
        if (stats) update.stats = stats;

        await User.findOneAndUpdate(
            { id: userProfile.id },
            update,
            { upsert: true, new: true }
        );
    }

    async getLeaderboard(userId) {
        const categories = {
            totalGames: 'stats.totalGames',
            impostorWins: 'stats.wins.impostor',
            citizenWins: 'stats.wins.citizen'
        };

        const result = {};

        // Helper to get Top 5 and User Rank
        const getCategoryData = async (fieldKey) => {
            // Top 5
            const top5Docs = await User.find({})
                .sort({ [fieldKey]: -1 })
                .limit(5)
                .select('name discriminator avatarSeed avatarType avatarImage ' + fieldKey);

            const top5 = top5Docs.map(doc => {
                // Resolve nested value safely
                const value = fieldKey.split('.').reduce((o, i) => o?.[i] || 0, doc);
                return {
                    name: doc.name,
                    discriminator: doc.discriminator,
                    avatarSeed: doc.avatarSeed,
                    avatarType: doc.avatarType,
                    avatarImage: doc.avatarImage,
                    value: value || 0
                };
            });

            // User Rank
            let userRankData = null;
            if (userId) {
                const userDoc = await User.findOne({ id: userId });
                if (userDoc) {
                    const userValue = fieldKey.split('.').reduce((o, i) => o?.[i] || 0, userDoc) || 0;
                    // Rank = count of people with STRICTLY greater value + 1
                    const rank = await User.countDocuments({ [fieldKey]: { $gt: userValue } }) + 1;
                    userRankData = {
                        rank,
                        value: userValue,
                        name: userDoc.name, // useful for display
                        discriminator: userDoc.discriminator
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

    async searchUser(name, discriminator) {
        const cleanName = name.trim().toLowerCase();
        return Object.values(this.data.users).find(u =>
            u.profile.name.toLowerCase() === cleanName &&
            u.profile.discriminator === discriminator
        ) || null;
    }

    async saveUser(userProfile, stats) {
        const existing = this.data.users[userProfile.id] || {};
        this.data.users[userProfile.id] = {
            ...existing,
            profile: { ...existing.profile, ...userProfile },
            stats: stats || existing.stats,
            lastLogin: Date.now()
        };
        this.saveDebounced();
    }

    async getLeaderboard(userId) {
        const allUsers = Object.values(this.data.users);
        const categories = {
            totalGames: u => u.stats?.totalGames || 0,
            impostorWins: u => u.stats?.wins?.impostor || 0,
            citizenWins: u => u.stats?.wins?.citizen || 0,
            // New Skill Categories (Min 3 games to qualify)
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
            // Sort Descending
            const sorted = allUsers.sort((a, b) => getValue(b) - getValue(a));

            // Top 5
            const top5 = sorted.slice(0, 5).map(u => ({
                name: u.profile.name,
                discriminator: u.profile.discriminator,
                avatarSeed: u.profile.avatarSeed,
                avatarType: u.profile.avatarType,
                avatarImage: u.profile.avatarImage,
                value: getValue(u) // Ensure number
            }));

            // User Rank
            let userRankData = null;
            if (userId) {
                const userIndex = sorted.findIndex(u => u.profile.id === userId);
                if (userIndex !== -1) {
                    userRankData = {
                        rank: userIndex + 1,
                        value: getValue(sorted[userIndex]),
                        name: sorted[userIndex].profile.name,
                        discriminator: sorted[userIndex].profile.discriminator
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
        // Try Mongo First
        if (process.env.MONGO_URI) {
            const mongo = new MongoStorage();
            if (await mongo.init()) {
                this.activeStorage = mongo;
                return;
            }
        }

        // Fallback to JSON
        console.log('[Storage] Falling back to Local JSON Storage.');
        this.activeStorage = new JsonStorage();
        await this.activeStorage.init();
    }

    async getUser(userId) { return this.activeStorage.getUser(userId); }
    async searchUser(name, disc) { return this.activeStorage.searchUser(name, disc); }
    async saveUser(profile, stats) { return this.activeStorage.saveUser(profile, stats); }
    async getLeaderboard(userId) { return this.activeStorage.getLeaderboard(userId); }
}
