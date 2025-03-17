import express from "express";
import {
  createOrUpdateReview,
  getLatestReviews,
  getMovieWiseReview,
  deleteReview,
} from "../modules/review/review.controller";
import { userAuth } from "../modules/auth/auth.middleware";

const reviewRouter = express.Router();

reviewRouter.post("/addOrUpdateReview", userAuth, createOrUpdateReview); // Add and Update both in one
reviewRouter.get("/getReview/:contentId", userAuth, getLatestReviews);
reviewRouter.get("/movieWiseReview/:id", userAuth, getMovieWiseReview);
reviewRouter.delete("/deleteReview/:reviewId", userAuth, deleteReview);

export default reviewRouter;
