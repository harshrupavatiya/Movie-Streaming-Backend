import mongoose, { Schema, Model } from 'mongoose';
import { IReview } from './review.interface';
import { Media } from '../media';

const reviewSchema = new Schema<IReview>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'Media',
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    comment: {
      type: String,
    },
  },
  { timestamps: true }
);

reviewSchema.post('save', async function () {
  Review.aggregate([
    {
      $match: {
        contentId: this.contentId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
      },
    },
  ])
    .then(async (val: { _id: null; averageRating: number }[]) => {
      return Media.findByIdAndUpdate(
        this.contentId.toString(),
        {
          rating: val[0].averageRating,
        },
        { new: true }
      );
    })
    .catch(() => {
      throw new Error('average rating not calculated');
    });
});

const Review: Model<IReview> = mongoose.model<IReview>('Review', reviewSchema);

export default Review;
