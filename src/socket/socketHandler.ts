// server/src/socket/socketHandlers.ts
import { Server, Socket } from 'socket.io';
import { Room } from '../models/parellelStreamingRoom';
import { verifyToken } from '../middlewares/Auth';

export interface PlayerState {
    isPlaying: boolean;
    currentTime: number;
    playbackRate: number;
}

export const setupSocketHandlers = (io: Server) => {
    // Middleware to authenticate socket connection
    io.use(async (socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }

        try {
            const decoded = verifyToken(token);
            socket.data.user = decoded;
            next();
        } catch (error) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.id}`);

        // Join room
        socket.on('join-room', async ({ roomId }) => {
            try {
                const room = await Room.findOne({ roomId, isActive: true });
                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                console.log(room, 'found room on socket hadler line 41')

                socket.join(roomId);

                // Add user to room participants if not already there
                const userId = socket.data.user.id;
                const username = socket.data.user.username;
                const isHost = room.hostId.toString() === userId;
                const role = isHost ? 'host' : 'viewer';

                const participantExists = room.participants.some(
                    p => p.userId?.toString() === userId
                );

                if (!participantExists) {
                    room.participants.push({
                        userId,
                        username,
                        role,
                        joinedAt: new Date()
                    });
                    await room.save();
                }

                // Send current player state to the joining user
                socket.emit('player-state-update', room.playerState);

                // Notify others about new user
                socket.to(roomId).emit('user-joined', {
                    userId,
                    username,
                    role
                });

                // Send room data to everyone
                io.to(roomId).emit('room-data-update', {
                    name: room.name,
                    movie: room.movie,
                    participants: room.participants,
                    hostId: room.hostId
                });
            } catch (error) {
                console.error('Error joining room:', error);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Player state update (throttled events from host)
        socket.on('player-state-change', async (data: {
            roomId: string,
            playerState: PlayerState
        }) => {
            try {
                const { roomId, playerState } = data;
                const room = await Room.findOne({ roomId });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Only host can control playback
                const userId = socket.data.user.id;
                if (room.hostId.toString() !== userId) {
                    socket.emit('error', { message: 'Only host can control playback' });
                    return;
                }

                // Update room's player state
                room.playerState = {
                    ...playerState,
                    lastUpdated: new Date()
                };
                await room.save();

                // Broadcast to all viewers
                socket.to(roomId).emit('player-state-update', playerState);
            } catch (error) {
                console.error('Error updating player state:', error);
                socket.emit('error', { message: 'Failed to update player state' });
            }
        });

        // Handle seeking (needs special handling to avoid flooding)
        socket.on('seek', async (data: { roomId: string, time: number }) => {
            try {
                const { roomId, time } = data;
                const room = await Room.findOne({ roomId });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Only host can seek
                const userId = socket.data.user.id;
                if (room.hostId.toString() !== userId) {
                    socket.emit('error', { message: 'Only host can control playback' });
                    return;
                }

                // Update room's player state
                if (!room.playerState) {
                    room.playerState = {
                        isPlaying: false,
                        currentTime: time,
                        playbackRate: 1,
                        lastUpdated: new Date()
                    };
                } else {
                    room.playerState.currentTime = time;
                    room.playerState.lastUpdated = new Date();
                }
                await room.save();

                // Broadcast seek command to viewers
                socket.to(roomId).emit('seek', { time });
            } catch (error) {
                console.error('Error seeking:', error);
                socket.emit('error', { message: 'Failed to seek' });
            }
        });

        // Handle disconnection
        socket.on('disconnect', async () => {
            try {
                console.log(`User disconnected: ${socket.id}`);
                const userId = socket.data.user?.id;
                if (!userId) return;

                // Find all rooms where user is a participant
                const rooms = await Room.find({
                    'participants.userId': userId,
                    isActive: true
                });

                for (const room of rooms) {
                    // Remove user from participants
                    room.participants.pull({ userId });


                    // If host left, make room inactive
                    if (room.hostId.toString() === userId) {
                        room.isActive = false;
                    }

                    await room.save();

                    // Notify others about user leaving
                    io.to(room.roomId).emit('user-left', { userId });

                    // If host left, notify everyone to leave
                    if (room.hostId.toString() === userId) {
                        io.to(room.roomId).emit('room-ended', {
                            message: 'Host has left the room'
                        });
                    }
                }
            } catch (error) {
                console.error('Error handling disconnection:', error);
            }
        });
    });
};