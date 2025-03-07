import express from "express";
import {
  createMovie,
  getAllMovies,
  getMovieById,
  updateMovieById,
  deleteMovieById,
  getMoviesByGenre,
  getTopRatedMovies,
  incrementMovieView,
  getLatestReleasedMovies,
  searchMoviesByTitle,
} from "./../controllers/movie";
import { userAuth } from "../middlewares/Auth";
const movieRouter = express.Router();

movieRouter.post("/createMovie", userAuth, createMovie);
movieRouter.get("/getAllMovie", userAuth, getAllMovies);
movieRouter.get("/getMovieById/:id", userAuth, getMovieById);
movieRouter.put("/updateMovieById/:id", userAuth, updateMovieById);
movieRouter.delete("/deleteMovieById/:id", userAuth, deleteMovieById);
movieRouter.get("/getMoviesByGenre", userAuth, getMoviesByGenre);
movieRouter.get("/getTopRatedMovies", userAuth, getTopRatedMovies);
movieRouter.post("/viewIncrement/:movieId", userAuth, incrementMovieView);
movieRouter.get("/getLatestMovies", userAuth, getLatestReleasedMovies);
movieRouter.get("/searchMovie", userAuth, searchMoviesByTitle);

export default movieRouter;
