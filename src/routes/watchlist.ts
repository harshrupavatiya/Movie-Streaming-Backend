import express from "express";
import { toggleWatchlist, getWatchlist } from "../controllers/watchlist";
import { userAuth } from "../middlewares/Auth";

const watchlistrouter = express.Router();

watchlistrouter.post("/toggle", userAuth, toggleWatchlist);
watchlistrouter.get("/", userAuth, getWatchlist);

export default watchlistrouter;
