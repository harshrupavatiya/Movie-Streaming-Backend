import express from "express"
import { userAuth } from "../middlewares/Auth";
import { addEpisode, deleteEpisode, getEpisode, updateEpisode } from "../controllers/episode";

const episodeRouter = express.Router();

episodeRouter.post("/add", userAuth, addEpisode);
episodeRouter.delete("/delete/:episodeId", userAuth, deleteEpisode);
episodeRouter.put("/update", userAuth, updateEpisode);
episodeRouter.get("/get/:episodeId", userAuth, getEpisode);

export default episodeRouter;