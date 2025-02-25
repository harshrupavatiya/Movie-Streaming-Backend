import express from "express";
import {
  createSeries,
  getAllSeries,
  getSeriesById,
  updateSeriesById,
  addSeasonToSeries,
  addEpisodeToSeason
} from "./../controllers/series";
import { userAuth } from "../middlewares/Auth";
const seriesRouter = express.Router();

seriesRouter.post("/createSeries", userAuth, createSeries);
seriesRouter.get("/getAllSeries", userAuth, getAllSeries);
seriesRouter.get("/getSeriesById/:id", userAuth, getSeriesById);
seriesRouter.put("/updateSeriesById/:id", userAuth, updateSeriesById);
seriesRouter.post("/:id/addSeasonToSeries", userAuth, addSeasonToSeries);
seriesRouter.post("/:seriesId/season/:seasonId/episodes", userAuth, addEpisodeToSeason);

export default seriesRouter;
