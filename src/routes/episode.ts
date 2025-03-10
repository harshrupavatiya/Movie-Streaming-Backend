import express from "express"
import { userAuth } from "../middlewares/Auth";
import { addEpisode, deleteEpisode, getEpisode, updateEpisode } from "../controllers/episode";
import { getEditEpisodePayload, getNewEpisodePayload } from "../middlewares/getEpisodePayload";

const episodeRouter = express.Router();

episodeRouter.post("/create", userAuth, getNewEpisodePayload, addEpisode);
episodeRouter.delete("/delete/:episodeId", userAuth, deleteEpisode);
episodeRouter.put("/update", userAuth,getEditEpisodePayload, updateEpisode);
episodeRouter.get("/get/:episodeId", userAuth, getEpisode);

export default episodeRouter;