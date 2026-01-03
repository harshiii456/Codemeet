import mongoose from "mongoose";
import connectDB from "./src/db/index.js";
import dotenv from "dotenv";
import app from "./src/app.js";
import http from "http";
import { Server } from "socket.io";
import ACTIONS from "./src/Action.js";
import { Room } from "./src/models/room.model.js";

dotenv.config();

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true
    }
});

connectDB()
    .then(() => {
        console.log("Connected to mongoDB");
        const userSocketMap = {};
        
        function getAllConnectedClients(roomId) {
            return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map((socketId) => {
                return {
                    socketId,
                    username: userSocketMap[socketId],
                }
            });
        }

        // Broadcast active rooms list to all clients
        async function broadcastActiveRooms() {
            try {
                const rooms = await Room.find({ isActive: true })
                    .populate('createdBy', 'username fullname')
                    .select('roomId createdBy participants maxParticipants createdAt lastActivity')
                    .sort({ lastActivity: -1 })
                    .limit(50);

                const roomsWithCount = rooms.map(room => ({
                    roomId: room.roomId,
                    createdBy: room.createdBy,
                    participantsCount: room.participants.filter(p => p.isActive).length,
                    maxParticipants: room.maxParticipants,
                    isFull: room.participants.filter(p => p.isActive).length >= room.maxParticipants,
                    createdAt: room.createdAt,
                    lastActivity: room.lastActivity
                }));

                io.emit('rooms-updated', roomsWithCount);
            } catch (error) {
                console.error('Error broadcasting rooms:', error);
            }
        }


        app.get("/", (req, res) => {
            res.send("chal gya");
        })


        // Socket.IO connection event
        io.on('connection', (socket) => {
            console.log('A user connected:', socket.id);

            // Handle JOIN event (room and username)
            socket.on(ACTIONS.JOIN, async ({ roomId, username, userId }) => {
                try {
                    // Check if room exists in database
                    const room = await Room.findOne({ roomId, isActive: true });
                    
                    if (!room) {
                        socket.emit('room-error', { 
                            message: 'Room does not exist. Please create a new room first.' 
                        });
                        return;
                    }

                    // Check if room is full
                    const activeParticipants = room.participants.filter(p => p.isActive);
                    if (activeParticipants.length >= room.maxParticipants) {
                        socket.emit('room-error', { 
                            message: 'Room is full. Cannot join.' 
                        });
                        return;
                    }

                    userSocketMap[socket.id] = username;
                    userSocketMap[socket.id + '_userId'] = JSON.stringify({ userId, username });
                    socket.join(roomId);

                    // Add participant to room database
                    if (userId) {
                        await room.addParticipant(userId, username);
                        console.log(`Added ${username} (${userId}) to room database`);
                    } else {
                        // Update last activity even if no userId
                        room.lastActivity = Date.now();
                        await room.save();
                    }

                    const clients = getAllConnectedClients(roomId);
                    
                    // Send current code to the new participant
                    if (room.code) {
                        socket.emit(ACTIONS.SYNC_CODE, {
                            code: room.code,
                            language: room.language
                        });
                    }

                    // Notify all clients about the new participant
                    clients.forEach(({ socketId }) => {
                        io.to(socketId).emit(ACTIONS.JOINED, {
                            clients,
                            username,
                            socketId: socket.id,
                        });
                    });

                    // Get updated room with participant count
                    const updatedRoom = await Room.findOne({ roomId, isActive: true });
                    const activeParticipantsCount = updatedRoom.participants.filter(p => p.isActive).length;

                    // Send room info to ALL participants (updated count)
                    io.to(roomId).emit('room-info', {
                        roomId: updatedRoom.roomId,
                        createdBy: updatedRoom.createdBy,
                        participantsCount: activeParticipantsCount,
                        maxParticipants: updatedRoom.maxParticipants,
                        createdAt: updatedRoom.createdAt
                    });

                    console.log(`${username} joined room: ${roomId} (${activeParticipantsCount}/${updatedRoom.maxParticipants})`);

                    // Broadcast updated room list to all clients
                    broadcastActiveRooms();
                } catch (error) {
                    console.error('Error joining room:', error);
                    socket.emit('room-error', { 
                        message: 'Failed to join room. Please try again.' 
                    });
                }
            });

            // handle colabrative compiler
            socket.on(ACTIONS.CODE_CHANGE, async ({ roomId, newCode }) => {
                socket.in(roomId).emit(ACTIONS.CODE_CHANGE, { code: newCode });
                
                // Update code in database
                try {
                    const room = await Room.findOne({ roomId, isActive: true });
                    if (room) {
                        room.code = newCode;
                        room.lastActivity = Date.now();
                        await room.save();
                    }
                } catch (error) {
                    console.error('Error updating room code:', error);
                }
            });
            
            // syn_code for new user

            // Handle disconnecting event
            socket.on('disconnecting', async () => {
                const rooms = [...socket.rooms];
                const username = userSocketMap[socket.id];
                
                for (const roomId of rooms) {
                    // Skip the socket's own room
                    if (roomId === socket.id) continue;

                    socket.in(roomId).emit(ACTIONS.DISCONNECTED, {
                        socketId: socket.id,
                        username: username,
                    });

                    // Check if room should be deleted and update participants
                    try {
                        const room = await Room.findOne({ roomId, isActive: true });
                        if (room) {
                            // Mark participant as inactive in database
                            const userDetails = JSON.parse(userSocketMap[socket.id + '_userId'] || '{}');
                            if (userDetails.userId) {
                                await room.removeParticipant(userDetails.userId);
                                console.log(`Removed ${username} from room database`);
                            }

                            // Get remaining clients in the room
                            const remainingClients = getAllConnectedClients(roomId).filter(
                                client => client.socketId !== socket.id
                            );

                            // If no one left in the room, delete it from database
                            if (remainingClients.length === 0) {
                                // Hard delete from database
                                await Room.deleteOne({ _id: room._id });
                                console.log(`Room ${roomId} permanently deleted from database - no participants remaining`);
                                
                                // Notify that room was closed
                                io.to(roomId).emit('room-closed', {
                                    message: 'Room has been closed as all participants have left.'
                                });

                                // Broadcast updated room list
                                broadcastActiveRooms();
                            } else {
                                // Update room info for remaining participants
                                const updatedRoom = await Room.findOne({ roomId, isActive: true });
                                const activeParticipantsCount = updatedRoom.participants.filter(p => p.isActive).length;
                                
                                io.to(roomId).emit('room-info', {
                                    roomId: updatedRoom.roomId,
                                    createdBy: updatedRoom.createdBy,
                                    participantsCount: activeParticipantsCount,
                                    maxParticipants: updatedRoom.maxParticipants,
                                    createdAt: updatedRoom.createdAt
                                });

                                // Broadcast updated room list
                                broadcastActiveRooms();
                            }
                        }
                    } catch (error) {
                        console.error('Error checking room for cleanup:', error);
                    }
                }
                
                delete userSocketMap[socket.id];
                delete userSocketMap[socket.id + '_userId'];
                socket.leave();
            });

            // Handle chat messages
            socket.on(ACTIONS.CHAT_MESSAGE, ({ roomId, message }) => {
                console.log(`Message from ${userSocketMap[socket.id]}: ${message.text}`);
                io.to(roomId).emit(ACTIONS.CHAT_MESSAGE, {
                    username: userSocketMap[socket.id], // Sender's username
                    text: message.text,
                    time: new Date().toLocaleTimeString(), // Message time
                });
            });

            // Handle language change
            socket.on('language-change', async ({ roomId, language }) => {
                try {
                    const room = await Room.findOne({ roomId, isActive: true });
                    if (room) {
                        room.language = language;
                        room.lastActivity = Date.now();
                        await room.save();
                        
                        // Notify all participants about language change
                        io.to(roomId).emit('language-changed', { language });
                    }
                } catch (error) {
                    console.error('Error updating language:', error);
                }
            });

            // Handle explicit leave
            socket.on(ACTIONS.LEAVE, async ({ roomId }) => {
                try {
                    const username = userSocketMap[socket.id];
                    const userDetails = JSON.parse(userSocketMap[socket.id + '_userId'] || '{}');
                    
                    socket.leave(roomId);
                    
                    const remainingClients = getAllConnectedClients(roomId);
                    
                    // Notify others
                    socket.to(roomId).emit(ACTIONS.DISCONNECTED, {
                        socketId: socket.id,
                        username: username,
                    });

                    // Update room database
                    const room = await Room.findOne({ roomId, isActive: true });
                    if (room) {
                        // Remove participant from database
                        if (userDetails.userId) {
                            await room.removeParticipant(userDetails.userId);
                            console.log(`Removed ${username} from room database (explicit leave)`);
                        }

                        // Check if room should be deleted
                        if (remainingClients.length === 0) {
                            // Hard delete from database
                            await Room.deleteOne({ _id: room._id });
                            console.log(`Room ${roomId} permanently deleted from database - last participant left`);
                            
                            // Broadcast updated room list
                            broadcastActiveRooms();
                        } else {
                            // Update room info for remaining participants
                            const updatedRoom = await Room.findOne({ roomId, isActive: true });
                            const activeParticipantsCount = updatedRoom.participants.filter(p => p.isActive).length;
                            
                            io.to(roomId).emit('room-info', {
                                roomId: updatedRoom.roomId,
                                createdBy: updatedRoom.createdBy,
                                participantsCount: activeParticipantsCount,
                                maxParticipants: updatedRoom.maxParticipants,
                                createdAt: updatedRoom.createdAt
                            });

                            // Broadcast updated room list
                            broadcastActiveRooms();
                        }
                    }
                } catch (error) {
                    console.error('Error handling leave:', error);
                }
            });

            // Handle request for active rooms list
            socket.on('get-active-rooms', async () => {
                await broadcastActiveRooms();
            });
        });


        // Cleanup job: Remove old inactive rooms every hour
        setInterval(async () => {
            try {
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                const result = await Room.deleteMany({
                    isActive: false,
                    lastActivity: { $lt: oneDayAgo }
                });
                if (result.deletedCount > 0) {
                    console.log(`Cleanup: Deleted ${result.deletedCount} old inactive rooms`);
                }
            } catch (error) {
                console.error('Error in cleanup job:', error);
            }
        }, 60 * 60 * 1000); // Run every hour

        server.listen(5000, () => {
            console.log(`Server is listening on http://localhost:${5000}`);
        });
    })
    .catch(() => {
        console.log("Error in connecting mongoDB")
    })
