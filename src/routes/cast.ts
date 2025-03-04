import express from "express";
import { addCast, getAllCastNames , addOrUpdateCast , deleteCast} from "../controllers/cast";
import { userAuth } from "../middlewares/Auth";
const castRouter = express.Router();

castRouter.get("/getAllCastNames", userAuth, getAllCastNames); // Get all cast names
castRouter.post("/addOrUpdateCast", userAuth, addOrUpdateCast); // Add or Update cast
castRouter.delete("/deleteCast/:castId", userAuth, deleteCast); // Delete cast

export default castRouter;
