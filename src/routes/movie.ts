import express from "express";
import { createMovie, getAllMovies, getMovieById, updateMovieById, deleteMovieById, getMoviesByGenre } from "./../controllers/movie";
import { userAuth } from "../middlewares/Auth";
const movieRouter = express.Router();

movieRouter.post("/createMovie", userAuth, createMovie);
movieRouter.get("/getAllMovie", userAuth, getAllMovies);
movieRouter.get("/getMovieById/:movieId", userAuth, getMovieById);
movieRouter.put("/updateMovieById", userAuth, updateMovieById);
movieRouter.delete("/deleteMovieById", userAuth, deleteMovieById);
movieRouter.get("/getMoviesByGenre/:genre", userAuth, getMoviesByGenre);
movieRouter.get("/getTopRatedMovies", userAuth, getTopRatedMovies);
movieRouter.post("/viewIncrement/:movieId", userAuth, incrementMovieView);
movieRouter.get("/getLatestMovies", userAuth, getLatestReleasedMovies);
movieRouter.get("/searchMovie", userAuth, searchMoviesByTitle);

export default movieRouter;
