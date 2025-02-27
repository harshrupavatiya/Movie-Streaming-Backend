import express from "express";
import { addCast, getAllCastNames , updateCast , deleteCast} from "../controllers/cast";
import { userAuth } from "../middlewares/Auth";
const castrouter = express.Router();

castrouter.post("/addCast", userAuth, addCast); // Create cast
castrouter.get("/getAllCastNames", userAuth, getAllCastNames); // Get all cast names
castrouter.put("/updateCast/:castId", userAuth, updateCast); // Update cast
castrouter.delete("/deleteCast/:castId", userAuth, deleteCast); // Delete cast

export default castrouter;
