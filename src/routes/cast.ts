import express from "express";
import {searchCastByName,  addOrUpdateCast,deleteCast,} from "../controllers/cast";
import { userAuth } from "../modules/auth/auth.middleware";
const castRouter = express.Router();

castRouter.get("/getCastName", userAuth, searchCastByName);
castRouter.post("/addOrUpdateCast", userAuth, addOrUpdateCast);
castRouter.delete("/deleteCast/:castId", userAuth, deleteCast);

export default castRouter;
