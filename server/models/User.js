import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true }, // UUID from client
    name: { type: String, required: true },
    discriminator: { type: String, required: true },
    avatarSeed: { type: String },
    avatarType: { type: String, default: 'dicebear' }, // 'dicebear' or 'custom'
    avatarImage: { type: String }, // Base64 string if custom
    theme: { type: String },
    accessory: { type: String },
    stats: { type: Object, default: {} }, // Store the entire stats object
    lastLogin: { type: Date, default: Date.now }
}, { timestamps: true });

// Compound index to quickly find "Diogo#1234"
UserSchema.index({ name: 1, discriminator: 1 });
// Indices for Leaderboard Sorting
UserSchema.index({ 'stats.totalGames': -1 });
UserSchema.index({ 'stats.wins.impostor': -1 });
UserSchema.index({ 'stats.wins.citizen': -1 });

export const User = mongoose.model('User', UserSchema);
