import express from "express"
import { userAuth } from "../modules/auth/auth.middleware";
import { addEpisode, deleteEpisode, getEpisode, updateEpisode } from "../modules/episode/episode.controller";
import { getEditEpisodePayload, getNewEpisodePayload } from "../middlewares/getEpisodePayload";

const episodeRouter = express.Router();

episodeRouter.post("/create", userAuth, getNewEpisodePayload, addEpisode);
episodeRouter.delete("/delete/:episodeId", userAuth, deleteEpisode);
episodeRouter.put("/update", userAuth,getEditEpisodePayload, updateEpisode);
episodeRouter.get("/get/:episodeId", userAuth, getEpisode);

export default episodeRouter;