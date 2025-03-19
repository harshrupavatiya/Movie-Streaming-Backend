import { Request, Response } from 'express';
import Review from './review.model';
import mongoose from 'mongoose';
import { ADMIN, MOVIE, SERIES } from '../../config/constants';
import { Media } from '../media';

// Create or Update Review --------------------------------------------------------------------------------
export const createOrUpdateReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contentId, contentType, rating, comment } = req.body;

    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized. Please log in.' });
      return;
    }

    // Validate contentType
    if (![MOVIE, SERIES].includes(contentType)) {
      res.status(400).json({
        message: "Invalid content type. Must be 'Movie' or 'Series'.",
      });
      return;
    }

    // Validate rating (0 to 10)
    if (rating < 0 || rating > 10) {
      res.status(400).json({ message: 'Rating must be between 0 and 10.' });
      return;
    }

    // Check if Movie or Series exists
    const content = await Media.findById(contentId);

    if (!content) {
      res.status(404).json({ message: `${contentType} not found` });
      return;
    }

    // Check if the user has already reviewed this content
    const existingReview = await Review.findOne({
      contentId,
      contentType,
      reviewer: req.user._id,
    });

    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();

      res.status(200).json({
        message: 'Review updated successfully',
        data: { review: existingReview },
      });
      return;
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
      await Media.findByIdAndUpdate(contentId, {
        $push: { reviews: { reviewId: newReview._id } },
      });

      res.status(201).json({
        message: 'Review added successfully',
        data: { review: newReview },
      });
      return;
    }
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

//Get latest 5 review for movie/series --------------------------------------------------------------------
export const getLatestReviews = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contentId } = req.params;

    // Validate if contentId is a valid ObjectId
    if (!mongoose.Types.ObjectId.isValid(contentId)) {
      res.status(400).json({ message: 'Invalid content ID' });
      return;
    }

    // Check if contentId exists in Movies or Series
    const media = await Media.findById(contentId);

    // If neither Movie nor Series found, return error
    if (!media) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    // Fetch latest 5 reviews
    const reviews = await Review.find({ contentId }).sort({ createdAt: -1 }).limit(5).populate({
      path: 'reviewer',
      select: 'name profilePicture',
    });

    // Extract only the required fields
    const filteredReviews = reviews.map((review) => ({
      reviewer: review.reviewer,
      rating: review.rating,
      comment: review.comment,
    }));

    res.status(200).json({
      data: {
        contentId,
        contentType: media.contentType == 'Movie' ? MOVIE : SERIES,
        reviews: filteredReviews,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({
      message: (err as Error).message,
    });
    return;
  }
};

// Movie wise get review (Admin only)----------------------------------------------------------------------
export const getMovieWiseReview = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is admin
    if (!req.user || req.user.role !== ADMIN) {
      res.status(403).json({ message: 'Access denied. Admins only.' });
      return;
    }

    const { id } = req.params;

    // Check if contentId exists in Movies or Series
    const media = await Media.findById(id);

    // If neither Movie nor Series found, return error
    if (!media) {
      res.status(404).json({ message: 'Content not found' });
      return;
    }

    // Fetch all reviews for the given movie
    const reviews = await Review.find({ contentId: id }).sort({ createdAt: -1 }).populate({
      path: 'reviewer',
      select: 'name profilePicture',
    });

    res.status(200).json({
      data: {
        id,
        mediaTitle: media.title,
        mediaType: media.contentType == 'Movie' ? MOVIE : SERIES,
        totalReviews: reviews.length,
        reviews,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({
      message: (err as Error).message,
    });
    return;
  }
};

// Delete review (Admin only)------------------------------------------------------------------------------
export const deleteReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const { reviewId } = req.params;

    if (!req.user || req.user.role !== ADMIN) {
      res.status(403).json({ message: 'Access denied. Admins only.' });
      return;
    }

    // Check if review exists
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
      res.status(404).json({ message: 'Review not found' });
      return;
    }

    // Remove review reference from the associated movie
    await Media.updateOne(
      { _id: review.contentId },
      { $pull: { reviews: { reviewId: reviewId } } }
    );

    res.status(200).json({ message: 'Review deleted successfully' });
    return;
  } catch (err) {
    res.status(500).json({
      message: (err as Error).message,
    });
    return;
  }
};
