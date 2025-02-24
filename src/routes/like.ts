import express from "express";
import { toggleLike, getLikedContent } from "../controllers/liked";
import { userAuth } from "../middlewares/Auth";

const likedRouter = express.Router();

likedRouter.post("/toggle-like", userAuth, toggleLike);
likedRouter.get("/liked-content", userAuth, getLikedContent);

export default likedRouter;
