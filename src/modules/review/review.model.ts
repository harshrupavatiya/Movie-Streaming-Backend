import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "./review.interface";
import { Media } from "../media";

const reviewSchema = new Schema<IReview>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Media",
    },
    reviewer: {
      type: Schema.Types.ObjectId,
      ref: "User",
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

reviewSchema.post("save", async function () {
  const review = this;
  console.log("Post hook review: ", review);
  Review.aggregate([
    {
      $match: {
        contentId: review.contentId,
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
      },
    },
  ])
    .then(async (val: { _id: null; averageRating: number }[]) => {
        return Media.findByIdAndUpdate(
          review.contentId.toString(),
          {
            rating: val[0].averageRating,
          },
          { new: true }
        );
    })
    .catch((err) => {
      throw new Error("average rating not calculated");
    });
});

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
