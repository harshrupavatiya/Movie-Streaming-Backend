import mongoose, { Schema, Model } from "mongoose";
import { IReview } from "../types/db.model";

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

const Review: Model<IReview> = mongoose.model<IReview>("Review", reviewSchema);

export default Review;
