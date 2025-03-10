import express from "express";
import {searchCastByName,  addOrUpdateCast,deleteCast,} from "../controllers/cast";
import { userAuth } from "../middlewares/Auth";
const castRouter = express.Router();

castRouter.get("/getCastName", userAuth, searchCastByName);
castRouter.post("/addOrUpdateCast", userAuth, addOrUpdateCast);
castRouter.delete("/deleteCast/:castId", userAuth, deleteCast);

export default castRouter;
