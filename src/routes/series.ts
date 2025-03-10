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
import {
  getEditSeriesPayload,
  getNewSeriesPayload,
} from "../middlewares/getSeriesPayload";
import { getPaginationInfo } from "../middlewares/getPaginationPayload";
const seriesRouter = express.Router();

seriesRouter.get("/get/:seriesId", userAuth, getSeriesById);

seriesRouter.get(
  "/genre/:genre",
  userAuth,
  getPaginationInfo,
  getSeriesByGenre
);

seriesRouter.get(
  "/mostLiked",
  userAuth,
  getPaginationInfo,
  getMostLikedSeriesList
);

seriesRouter.get(
  "/mostViewed",
  userAuth,
  getPaginationInfo,
  getMostViewedSeriesList
);

seriesRouter.get(
  "/topRated",
  userAuth,
  getPaginationInfo,
  getTopRatedSeriesList
);

seriesRouter.get(
  "/latestReleased",
  userAuth,
  getPaginationInfo,
  getLatestReleasedSeriesList
);

seriesRouter.get("/popular", userAuth, getPaginationInfo, getPopularSeriesList);

seriesRouter.post("/viewIncrement/:movieId", userAuth, incrementSeriesView);

// for admins only
seriesRouter.post("/create", userAuth, getNewSeriesPayload, createSeries);

seriesRouter.delete("/delete/:seriesId", userAuth, deleteSeries);

seriesRouter.put("/update", userAuth, getEditSeriesPayload, updateSeries);

seriesRouter.get("/list", userAuth, getPaginationInfo, getSeriesListBySearch);

seriesRouter.get(
  "/searchByAdmin",
  userAuth,
  getPaginationInfo,
  getSeriesNamesAndIdBySearch
);

export default seriesRouter;
