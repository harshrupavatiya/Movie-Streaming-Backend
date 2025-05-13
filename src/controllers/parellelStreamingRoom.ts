// Desc: Controllers for parellel streaming room
import express, { NextFunction, Response } from 'express';
import { nanoid } from 'nanoid';
import { Room } from '../models/parellelStreamingRoom';
// import { userAuth } from '../middlewares/Auth';
import { AuthRequest } from '../types/api';

const router = express.Router();

// Create a new room
export const createRoom = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const userId = req?.user?.id;
        const { name, movie } = req.body;

        // Generate unique room ID (8 characters)
        const roomId = nanoid(8);

        // Create room 
        const room = new Room({
            roomId,
            name,
            hostId: userId,
            movie,
            participants: [{
                userId,
                username: req?.user?.email,
                role: 'host',
                joinedAt: new Date()
            }]
        });

        await room.save();


        res.status(201).json({
            roomId: room.roomId,
            name: room.name,
            hostId: room.hostId,
            movie: room.movie
        });
    } catch (error) {
        console.error('Error creating room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get room details
export const roomById = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { roomId } = req.params;

        const room = await Room.findOne({
            roomId,
            isActive: true
        });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        res.json({
            roomId: room.roomId,
            name: room.name,
            hostId: room.hostId,
            movie: room.movie,
            participants: room.participants,
            playerState: room.playerState,
            createdAt: room.createdAt
        });
    } catch (error) {
        console.error('Error getting room details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all active rooms (for browsing)
export const getAllActiveRooms = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const rooms = await Room.find({
            isActive: true
        }).sort({ createdAt: -1 });

        res.json(rooms.map(room => ({
            roomId: room.roomId,
            name: room.name,
            hostId: room.hostId,
            movie: {
                title: room?.movie?.title
            },
            participantCount: room.participants.length,
            createdAt: room.createdAt
        })));
    } catch (error) {
        console.error('Error getting rooms list:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// End a room (host only)
export const endRoom = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<any> => {
    try {
        const { roomId } = req.params;
        const userId = req?.user?.id;

        const room = await Room.findOne({ roomId });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        // Verify user is the host
        if (room.hostId.toString() !== userId) {
            return res.status(403).json({
                message: 'Only host can end the room'
            });
        }

        room.isActive = false;
        await room.save();

        res.json({ message: 'Room ended successfully' });
    } catch (error) {
        console.error('Error ending room:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
