import { Room } from "../models/room.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Create a new room
const createRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.body;
    const userId = req.user._id;

    if (!roomId) {
        throw new ApiError(400, "Room ID is required");
    }

    // Check if room already exists
    const existingRoom = await Room.findOne({ roomId, isActive: true });
    if (existingRoom) {
        throw new ApiError(409, "Room with this ID already exists");
    }

    // Create new room
    const room = await Room.create({
        roomId,
        createdBy: userId,
        participants: [{
            userId,
            username: req.user.username,
            isActive: true
        }]
    });

    const populatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'username fullname email')
        .populate('participants.userId', 'username fullname');

    return res.status(201).json(
        new ApiResponse(201, populatedRoom, "Room created successfully")
    );
});

// Check if room exists
const checkRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    if (!roomId) {
        throw new ApiError(400, "Room ID is required");
    }

    const room = await Room.findOne({ roomId, isActive: true })
        .populate('createdBy', 'username fullname')
        .populate('participants.userId', 'username fullname');

    if (!room) {
        return res.status(404).json(
            new ApiResponse(404, null, "Room not found")
        );
    }

    const activeParticipants = room.participants.filter(p => p.isActive);

    return res.status(200).json(
        new ApiResponse(200, {
            exists: true,
            roomId: room.roomId,
            createdBy: room.createdBy,
            participantsCount: activeParticipants.length,
            maxParticipants: room.maxParticipants,
            isFull: activeParticipants.length >= room.maxParticipants,
            createdAt: room.createdAt
        }, "Room found")
    );
});

// Join a room
const joinRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.body;
    const userId = req.user._id;
    const username = req.user.username;

    if (!roomId) {
        throw new ApiError(400, "Room ID is required");
    }

    // Find the room
    let room = await Room.findOne({ roomId, isActive: true });

    if (!room) {
        throw new ApiError(404, "Room does not exist. Please create a new room.");
    }

    // Check if room is full
    const activeParticipants = room.participants.filter(p => p.isActive);
    if (activeParticipants.length >= room.maxParticipants) {
        throw new ApiError(403, "Room is full");
    }

    // Add participant
    await room.addParticipant(userId, username);

    const updatedRoom = await Room.findById(room._id)
        .populate('createdBy', 'username fullname')
        .populate('participants.userId', 'username fullname');

    return res.status(200).json(
        new ApiResponse(200, updatedRoom, "Joined room successfully")
    );
});

// Leave a room
const leaveRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.body;
    const userId = req.user._id;

    if (!roomId) {
        throw new ApiError(400, "Room ID is required");
    }

    const room = await Room.findOne({ roomId, isActive: true });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    await room.removeParticipant(userId);

    return res.status(200).json(
        new ApiResponse(200, null, "Left room successfully")
    );
});

// Get user's rooms
const getUserRooms = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const rooms = await Room.find({
        $or: [
            { createdBy: userId },
            { 'participants.userId': userId }
        ],
        isActive: true
    })
    .populate('createdBy', 'username fullname')
    .populate('participants.userId', 'username fullname')
    .sort({ lastActivity: -1 });

    return res.status(200).json(
        new ApiResponse(200, rooms, "Rooms fetched successfully")
    );
});

// Get all active rooms (public)
const getAllActiveRooms = asyncHandler(async (req, res) => {
    const rooms = await Room.find({ isActive: true })
        .populate('createdBy', 'username fullname')
        .select('roomId createdBy participants maxParticipants createdAt lastActivity')
        .sort({ lastActivity: -1 })
        .limit(50); // Limit to 50 most recent rooms

    // Calculate active participants for each room
    const roomsWithCount = rooms.map(room => ({
        roomId: room.roomId,
        createdBy: room.createdBy,
        participantsCount: room.participants.filter(p => p.isActive).length,
        maxParticipants: room.maxParticipants,
        isFull: room.participants.filter(p => p.isActive).length >= room.maxParticipants,
        createdAt: room.createdAt,
        lastActivity: room.lastActivity
    }));

    return res.status(200).json(
        new ApiResponse(200, roomsWithCount, "Active rooms fetched successfully")
    );
});

// Get room details
const getRoomDetails = asyncHandler(async (req, res) => {
    const { roomId } = req.params;

    const room = await Room.findOne({ roomId, isActive: true })
        .populate('createdBy', 'username fullname email')
        .populate('participants.userId', 'username fullname');

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    return res.status(200).json(
        new ApiResponse(200, room, "Room details fetched successfully")
    );
});

// Update room code
const updateRoomCode = asyncHandler(async (req, res) => {
    const { roomId, code, language } = req.body;

    if (!roomId) {
        throw new ApiError(400, "Room ID is required");
    }

    const room = await Room.findOne({ roomId, isActive: true });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    if (code !== undefined) room.code = code;
    if (language) room.language = language;
    room.lastActivity = Date.now();

    await room.save();

    return res.status(200).json(
        new ApiResponse(200, room, "Room code updated successfully")
    );
});

// Delete/Deactivate room
const deleteRoom = asyncHandler(async (req, res) => {
    const { roomId } = req.params;
    const userId = req.user._id;

    const room = await Room.findOne({ roomId, isActive: true });

    if (!room) {
        throw new ApiError(404, "Room not found");
    }

    // Only creator can delete the room
    if (room.createdBy.toString() !== userId.toString()) {
        throw new ApiError(403, "Only room creator can delete the room");
    }

    room.isActive = false;
    await room.save();

    return res.status(200).json(
        new ApiResponse(200, null, "Room deleted successfully")
    );
});

export {
    createRoom,
    checkRoom,
    joinRoom,
    leaveRoom,
    getUserRooms,
    getRoomDetails,
    updateRoomCode,
    deleteRoom,
    getAllActiveRooms
};
