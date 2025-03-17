import express from "express";
import { toggleWatchlist, getWatchlist } from "../modules/user/watchlist.controller";
import { userAuth } from "../modules/auth/auth.middleware";

const watchlistRouter = express.Router();

watchlistRouter.post("/toggle", userAuth, toggleWatchlist);
watchlistRouter.get("/", userAuth, getWatchlist);

export default watchlistRouter;
