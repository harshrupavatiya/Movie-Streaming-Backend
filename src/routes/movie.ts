import express from "express";
import { createMovie, getAllMovies } from "./../controllers/movie";
import { userAuth } from "../middlewares/Auth";
const movieRouter = express.Router();

movieRouter.post("/createMovie",userAuth, createMovie);
movieRouter.get("/getAllMovie",userAuth, getAllMovies);

export default movieRouter;
