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
}
