import express from "express";
import { createMovie, getAllMovies, getMovieById, updateMovieById, deleteMovieById, getMoviesByGenre , getTopRatedMovies} from "./../controllers/movie";
import { userAuth } from "../middlewares/Auth";
const movieRouter = express.Router();

movieRouter.post("/createMovie", userAuth, createMovie);
movieRouter.get("/getAllMovie", userAuth, getAllMovies);
movieRouter.get("/getMovieById/:id", userAuth, getMovieById);
movieRouter.put("/updateMovieById/:id", userAuth, updateMovieById);
movieRouter.delete("/deleteMovieById/:id", userAuth, deleteMovieById);
movieRouter.get("/getMoviesByGenre", userAuth, getMoviesByGenre);
movieRouter.get("/getTopRatedMovies", userAuth, getTopRatedMovies);

export default movieRouter;
