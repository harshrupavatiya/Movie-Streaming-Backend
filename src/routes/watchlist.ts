import express from "express";
import { toggleWatchlist, getWatchlist } from "../controllers/watchlist";
import { userAuth } from "../middlewares/Auth";

const watchlistRouter = express.Router();

watchlistRouter.post("/toggle", userAuth, toggleWatchlist);
watchlistRouter.get("/", userAuth, getWatchlist);

export default watchlistRouter;
