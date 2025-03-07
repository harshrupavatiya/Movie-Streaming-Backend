import express, { Response } from "express";
import { userAuth } from "../middlewares/Auth";
import { createSeries, deleteSeries, getLatestReleasedSeriesList, getMostLikedSeriesList, getMostViewedSeriesList, getPopularSeriesList, getSeriesByGenre, getSeriesById, getSeriesListBySearch, getSeriesNamesAndIdBySearch, getTopRatedSeriesList, updateSeries } from "../controllers/series";
import { AuthRequest } from "../types/api";
const seriesRouter = express.Router();


seriesRouter.get("/get/:seriesId", userAuth, getSeriesById);
seriesRouter.get("/genre/:genre", userAuth, getSeriesByGenre);

seriesRouter.get("/mostLiked", userAuth, getMostLikedSeriesList);

seriesRouter.get("/mostViewed", userAuth, getMostViewedSeriesList);

seriesRouter.get("/topRated", userAuth, getTopRatedSeriesList);

seriesRouter.get("/latestReleased", userAuth, getLatestReleasedSeriesList);

seriesRouter.get("/popular", userAuth, getPopularSeriesList);

seriesRouter.get("/list", userAuth, getSeriesListBySearch);

seriesRouter.get("/searchByAdmin", userAuth, getSeriesNamesAndIdBySearch);

seriesRouter.post("/create", userAuth, createSeries);
seriesRouter.delete("/delete/:seriesId", userAuth, deleteSeries);
seriesRouter.put("/update", userAuth, updateSeries);


export default seriesRouter;  
