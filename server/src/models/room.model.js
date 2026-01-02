import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: {
        type: String,
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
});

const roomSchema = new mongoose.Schema(
    {
        roomId: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        participants: [participantSchema],
        isActive: {
            type: Boolean,
            default: true
        },
        maxParticipants: {
            type: Number,
            default: 50
        },
        code: {
            type: String,
            default: ''
        },
        language: {
            type: String,
            default: 'javascript'
        },
        lastActivity: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

// Index for faster queries
roomSchema.index({ roomId: 1, isActive: 1 });
roomSchema.index({ createdBy: 1 });

// Method to add participant
roomSchema.methods.addParticipant = function(userId, username) {
    const existingParticipant = this.participants.find(
        p => p.userId.toString() === userId.toString()
    );
    
    if (existingParticipant) {
        existingParticipant.isActive = true;
        existingParticipant.joinedAt = Date.now();
    } else {
        if (this.participants.length >= this.maxParticipants) {
            throw new Error('Room is full');
        }
        this.participants.push({ userId, username, isActive: true });
    }
    
    this.lastActivity = Date.now();
    return this.save();
};

// Method to remove participant (mark as inactive for history)
roomSchema.methods.removeParticipant = function(userId) {
    const participant = this.participants.find(
        p => p.userId.toString() === userId.toString()
    );
    
    if (participant) {
        participant.isActive = false;
    }
    
    this.lastActivity = Date.now();
    return this.save();
};

// Method to completely remove participant from array
roomSchema.methods.deleteParticipant = function(userId) {
    this.participants = this.participants.filter(
        p => p.userId.toString() !== userId.toString()
    );
    
    this.lastActivity = Date.now();
    return this.save();
};

// Method to check if room should be deleted
roomSchema.methods.shouldBeDeleted = function() {
    const activeCount = this.participants.filter(p => p.isActive).length;
    return activeCount === 0;
};

// Method to get active participants count
roomSchema.methods.getActiveParticipantsCount = function() {
    return this.participants.filter(p => p.isActive).length;
};

// Static method to find or create room
roomSchema.statics.findOrCreateRoom = async function(roomId, createdBy) {
    let room = await this.findOne({ roomId, isActive: true });
    
    if (!room) {
        room = await this.create({
            roomId,
            createdBy,
            participants: []
        });
    }
    
    return room;
};

// Auto-deactivate rooms with no active participants after 24 hours
roomSchema.methods.checkAndDeactivate = async function() {
    const activeCount = this.getActiveParticipantsCount();
    const hoursSinceLastActivity = (Date.now() - this.lastActivity) / (1000 * 60 * 60);
    
    if (activeCount === 0 && hoursSinceLastActivity > 24) {
        this.isActive = false;
        await this.save();
    }
};

// Static method to delete empty rooms from database
roomSchema.statics.deleteEmptyRooms = async function() {
    const result = await this.deleteMany({
        isActive: false,
        $or: [
            { participants: { $size: 0 } },
            { 'participants.isActive': { $ne: true } }
        ]
    });
    return result;
};

export const Room = mongoose.model("Room", roomSchema);
