import express from "express";
import { userAuth } from "../middlewares/Auth";
import {
  createSeries,
  deleteSeries,
  getLatestReleasedSeriesList,
  getMostLikedSeriesList,
  getMostViewedSeriesList,
  getPopularSeriesList,
  getSeriesByGenre,
  getSeriesById,
  getSeriesListBySearch,
  getSeriesNamesAndIdBySearch,
  getTopRatedSeriesList,
  incrementSeriesView,
  updateSeries,
} from "../controllers/series";
const seriesRouter = express.Router();

seriesRouter.get("/get/:seriesId", userAuth, getSeriesById);

seriesRouter.get("/genre/:genre", userAuth, getSeriesByGenre);

seriesRouter.get("/mostLiked", userAuth, getMostLikedSeriesList);

seriesRouter.get("/mostViewed", userAuth, getMostViewedSeriesList);

seriesRouter.get("/topRated", userAuth, getTopRatedSeriesList);

seriesRouter.get("/latestReleased", userAuth, getLatestReleasedSeriesList);

seriesRouter.get("/popular", userAuth, getPopularSeriesList);

seriesRouter.post("/viewIncrement/:movieId", userAuth, incrementSeriesView);

// for admins only
seriesRouter.post("/create", userAuth, createSeries);

seriesRouter.delete("/delete/:seriesId", userAuth, deleteSeries);

seriesRouter.put("/update", userAuth, updateSeries);

seriesRouter.get("/list", userAuth, getSeriesListBySearch);

seriesRouter.get("/searchByAdmin", userAuth, getSeriesNamesAndIdBySearch);

export default seriesRouter;
