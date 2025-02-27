import express from "express";
import { createSeries, getAllSeries, getSeriesById, updateSeriesById, addSeasonToSeries, addEpisodeToSeason, 
  deleteSeriesById, getEpisodesBySeason, deleteSeasonFromSeries, deleteEpisodeFromSeason , searchSeriesByTitle , filterSeriesByGenre , getTopRatedSeries } from "./../controllers/series";
import { userAuth } from "../middlewares/Auth";
const seriesRouter = express.Router();

seriesRouter.post("/createSeries", userAuth, createSeries);
seriesRouter.get("/getAllSeries", userAuth, getAllSeries);
seriesRouter.get("/getSeriesById/:id", userAuth, getSeriesById);
seriesRouter.put("/updateSeriesById/:id", userAuth, updateSeriesById);
seriesRouter.post("/:id/addSeasonToSeries", userAuth, addSeasonToSeries);
seriesRouter.post("/:seriesId/season/:seasonId/episodes", userAuth, addEpisodeToSeason);
seriesRouter.delete("/deleteSeriesById/:id", userAuth, deleteSeriesById);
seriesRouter.get("/getEpisodesBySeason/:id/seasons/:seasonNumber",userAuth, getEpisodesBySeason);
seriesRouter.delete("/deleteSeasonFromSeries/:id/seasons/:seasonNumber", userAuth,  deleteSeasonFromSeries);
seriesRouter.delete("/deleteEpisodeFromSeason/:id/seasons/:seasonNumber/episodes/:episodeNumber", userAuth, deleteEpisodeFromSeason);
seriesRouter.get("/search", userAuth, searchSeriesByTitle);
seriesRouter.get("/getSeriesByGenre", userAuth, filterSeriesByGenre);
seriesRouter.get("/getTopRatedSeries", userAuth, getTopRatedSeries);  

export default seriesRouter;  
