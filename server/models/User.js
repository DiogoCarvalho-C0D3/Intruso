import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // UUID
    name: { type: String, required: true, unique: true }, // Unique Name
    pin: { type: String }, // 4-digit PIN (hashed ideally, plain for now as per minimal deps)
    isGuest: { type: Boolean, default: false },
    avatarSeed: { type: String },
    avatarType: { type: String, default: 'dicebear' },
    avatarImage: { type: String },
    theme: { type: String },
    accessory: { type: String },
    customDecks: { type: Array, default: [] },
    stats: { type: Object, default: {} },
    lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for Leaderboard
UserSchema.index({ 'stats.totalGames': -1 });
UserSchema.index({ 'stats.wins.impostor': -1 });
UserSchema.index({ 'stats.wins.citizen': -1 });

export const User = mongoose.model('User', UserSchema);
