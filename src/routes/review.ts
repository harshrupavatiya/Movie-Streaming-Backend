import express from "express";
import {
  createOrUpdateReview,
  getLatestReviews,
  getMovieWiseReview,
  deleteReview,
} from "../controllers/review";
import { userAuth } from "../middlewares/Auth";

const reviewRouter = express.Router();

reviewRouter.post("/addOrUpdateReview", userAuth, createOrUpdateReview); // Add and Update both in one
reviewRouter.get("/getReview/:contentId", userAuth, getLatestReviews);
reviewRouter.get("/movieWiseReview/:id", userAuth, getMovieWiseReview);
reviewRouter.delete("/deleteReview/:reviewId", userAuth, deleteReview);

export default reviewRouter;
