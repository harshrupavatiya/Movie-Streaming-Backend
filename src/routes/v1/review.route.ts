import express from "express";
import { createOrUpdateReview, deleteReview, getLatestReviews, getMovieWiseReview } from "../../modules/review/review.controller";
import { userAuth } from "../../modules/auth";
import validate from '../../modules/validate/validate.middleware';
import reviewValiadtion from "../../modules/review/review.valiadtion";

const reviewRouter = express.Router();

reviewRouter.post("/addUpdate", userAuth, validate(reviewValiadtion.createOrUpdateReview),createOrUpdateReview); // Add and Update both in one
reviewRouter.get("/getReview/:contentId", userAuth, validate(reviewValiadtion.getLatestReviews),getLatestReviews);
reviewRouter.get("/movieWiseReview/:id", userAuth, validate(reviewValiadtion.getMovieWiseReview),getMovieWiseReview);
reviewRouter.delete("/deleteReview/:reviewId", userAuth, validate(reviewValiadtion.deleteReview),deleteReview);

export default reviewRouter;
