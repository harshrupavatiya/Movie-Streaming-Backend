import express from "express"
import { userAuth } from "../middlewares/Auth";
import { addEpisode, deleteEpisode, updateEpisode } from "../controllers/episode";

const episodeRouter = express.Router();

episodeRouter.post("/add", userAuth, addEpisode);
episodeRouter.delete("/delete/:episodeId", userAuth, deleteEpisode);
episodeRouter.put("/update", userAuth, updateEpisode);

export default episodeRouter;