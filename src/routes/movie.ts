import express from "express";
import { createMovie, getAllMovies, getMovieById, updateMovieById, deleteMovieById, getMoviesByGenre , getMostViewedMoviesList , getMostLikedMoviesList , incrementMovieView ,searchMoviesByTitle , getTopRatedMovies , getLatestReleasedMovies ,getPopularMoviesList } from "./../controllers/movie";
import { userAuth } from "../modules/auth/auth.middleware";
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
movieRouter.get("/getPopularMovies", userAuth, getPopularMoviesList);
movieRouter.get("/getMostViewedMoviesList", userAuth, getMostViewedMoviesList);
movieRouter.get("/getMostLikedMoviesList", userAuth, getMostLikedMoviesList);

export default movieRouter;
