import { Request, Response } from "express";
import Review from "../models/review";
import Movie from "../models/movie";
import Series from "../models/series";
import { AuthRequest } from "./../middlewares/Auth";
import mongoose from "mongoose";

// Create or Update Review
export const createOrUpdateReview = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { contentId, contentType, rating, comment } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized. Please log in." });
    }

    // Validate contentType
    if (!["Movie", "Series"].includes(contentType)) {
      return res.status(400).json({
        message: "Invalid content type. Must be 'Movie' or 'Series'.",
      });
    }

    // Validate rating (0 to 10)
    if (rating < 0 || rating > 10) {
      return res
        .status(400)
        .json({ message: "Rating must be between 0 and 10." });
    }

    // Check if Movie or Series exists
    const content =
      contentType === "Movie"
        ? await Movie.findById(contentId)
        : await Series.findById(contentId);

    if (!content) {
      return res.status(404).json({ message: `${contentType} not found` });
    }

    // Check if the user has already reviewed this content
    let existingReview = await Review.findOne({
      contentId,
      contentType,
      reviewer: req.user._id,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();

      return res.status(200).json({
        message: "Review updated successfully",
        review: existingReview,
      });
    } else {
      // Create a new review
      const newReview = await Review.create({
        contentId,
        contentType,
        reviewer: req.user._id,
        rating,
        comment,
      });

      // Push new reviewId inside Movie's reviews array
      if (contentType === "Movie") {
        await Movie.findByIdAndUpdate(contentId, {
          $push: { reviews: { reviewId: newReview._id } },
        });
      } else {
        await Series.findByIdAndUpdate(contentId, {
          $push: { reviews: { reviewId: newReview._id } },
        });
      }

      return res.status(201).json({
        message: "Review added successfully",
        review: newReview,
      });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

//Get latest 5 review for movie/series --------------------------------------------------------------------------------
export const getLatestReviews = async (
  req: Request,
  res: Response
): Promise<string | any> => {
  try {
    const { contentId } = req.params;

    // Validate if contentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      return res.status(400).json({ message: "Invalid content ID" });
    }

    // Check if contentId exists in Movies or Series
    const movie = await Movie.findById(contentId);
    const series = !movie ? await Series.findById(contentId) : null;

    // If neither Movie nor Series found, return error
    if (!movie && !series) {
      return res.status(404).json({ message: "Content not found" });
    }

    // Fetch latest 5 reviews
    const reviews = await Review.find({ contentId })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({
        path: "reviewer",
        select: "name profilePicture",
      });

    // Extract only the required fields
    const filteredReviews = reviews.map((review) => ({
      reviewer: review.reviewer,
      rating: review.rating,
      comment: review.comment,
    }));

    return res.status(200).json({
      contentId,
      contentType: movie ? "Movie" : "Series",
      reviews: filteredReviews,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: (err as Error).message,
    });
  }
};

// Movie wise get review (Admin only)--------------------------------------------------------------------------------
export const getMovieWiseReview = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;

    // Check if movie exists
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Fetch all reviews for the given movie
    const reviews = await Review.find({ contentId: id })
      .sort({ createdAt: -1 })
      .populate({
        path: "reviewer",
        select: "name profilePicture",
      });

    return res.status(200).json({
      id,
      movieTitle: movie.title,
      totalReviews: reviews.length,
      reviews,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: (err as Error).message,
    });
  }
};

// Delete review (Admin only)--------------------------------------------------------------------------------
export const deleteReview = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { reviewId } = req.params;

    // Check if review exists
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    // Remove review reference from the associated movie
    await Movie.updateOne(
      { _id: review.contentId },
      { $pull: { reviews: { reviewId: reviewId } } }
    );

    return res.status(200).json({ message: "Review deleted successfully" });
  } catch (err) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: (err as Error).message,
    });
  }
};
