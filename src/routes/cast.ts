import express from "express";
import { addCast, getAllCastNames , addOrUpdateCast , deleteCast} from "../controllers/cast";
import { userAuth } from "../middlewares/Auth";
const castrouter = express.Router();

castrouter.post("/addCast", userAuth, addCast); // Create cast
castrouter.get("/getAllCastNames", userAuth, getAllCastNames); // Get all cast names
castrouter.post("/addOrUpdateCast", userAuth, addOrUpdateCast); // Add or Update cast
castrouter.delete("/deleteCast/:castId", userAuth, deleteCast); // Delete cast

export default castrouter;
