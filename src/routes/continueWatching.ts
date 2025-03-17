import express from "express";
import { updateWatchProgress , getContinueWatching } from "../controllers/continueWatching";
import { userAuth } from "../modules/auth/auth.middleware";

const continueWatchingRouter = express.Router();

continueWatchingRouter.post("/update-progress", userAuth, updateWatchProgress);
continueWatchingRouter.get("/getList", userAuth, getContinueWatching);

export default continueWatchingRouter;
