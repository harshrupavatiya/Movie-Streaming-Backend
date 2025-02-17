import mongoose, { Model, Schema } from "mongoose";
import { IUpcomingContent } from "../types/db.model";

const upcomingContentSchema = new Schema<IUpcomingContent>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 254,
    },
    description: {
      type: String,
      maxLength: 400,
    },
    releaseDate: {
      type: Date,
      required: true,
    },
    contentType: {
      type: String,
      enum: ["movie", "tvSeries"],
      required: true,
    },
    genre: [
      {
        type: Number,
      },
    ],
    cast: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Cast",
      },
    ],
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Director",
    },
    poster: {
      type: String,
    },
    trailerUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

const UpcomingContent: Model<IUpcomingContent> =
  mongoose.model<IUpcomingContent>("UpcomingContent", upcomingContentSchema);

export default UpcomingContent;
