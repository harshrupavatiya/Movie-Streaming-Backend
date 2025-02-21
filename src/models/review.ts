import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "../types/db.model";
import Movie from "./movie";
import Series from "./series";

const reviewSchema = new Schema<IReview>(
  {
    contentId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "contentType",
    },
    contentType: {
      type: String,
      required: true,
      enum: ["Movie", "Series"],
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
      if (review.contentType == "Movie") {
        return Movie.findByIdAndUpdate(
          review.contentId.toString(),
          {
            rating: val[0].averageRating,
          },
          { new: true }
        );
      }
      if (review.contentType == "Series") {
        return Series.findByIdAndUpdate(
          review.contentId.toString(),
          {
            rating: val[0].averageRating,
          },
          { new: true }
        );
      }
    })
    .catch((err) => {
      throw new Error("average rating not calculated");
    });
});

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
