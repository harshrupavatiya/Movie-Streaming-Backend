import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    roomId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    movie: {
        title: { type: String, required: true },
        url: { type: String, required: true },
        duration: { type: String, required: true }
    },
    participants: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        username: { type: String },
        role: { type: String, enum: ['host', 'viewer'], default: 'viewer' },
        joinedAt: { type: Date, default: Date.now }
    }],
    playerState: {
        isPlaying: { type: Boolean, default: false },
        currentTime: { type: Number, default: 0 },
        playbackRate: { type: Number, default: 1 },
        lastUpdated: { type: Date, default: Date.now }
    },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) } // 24 hours
});

// Create TTL index for room expiration
roomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Room = mongoose.model('Room', roomSchema);