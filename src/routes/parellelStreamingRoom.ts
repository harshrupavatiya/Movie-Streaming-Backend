import express from "express";
import { userAuth } from "../middlewares/Auth";
import { createRoom, getAllActiveRooms, roomById, endRoom } from '../controllers/parellelStreamingRoom'
const parellelStreamingRoomRouter = express.Router();

parellelStreamingRoomRouter.post('/create', userAuth, createRoom);
parellelStreamingRoomRouter.get('/:roomId', userAuth, roomById);
parellelStreamingRoomRouter.get('/', userAuth, getAllActiveRooms);
parellelStreamingRoomRouter.get('/:roomId/end', userAuth, endRoom);


export default parellelStreamingRoomRouter;