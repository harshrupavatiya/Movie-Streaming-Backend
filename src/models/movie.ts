import mongoose, { Model, Schema } from "mongoose";
import { IMovie } from "../types/db.model";

const movieSchema = new Schema<IMovie>(
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
    },
    genres: [
      {
        type: Number,
      },
    ],
    duration: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    feedbacks: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    cast: [
      {
        castId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Cast",
          required: true,
        }
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
    movieUrl: {
      type: String,
    },
    availableForStreaming: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Movie: Model<IMovie> = mongoose.model<IMovie>("Movie", movieSchema);

export default Movie;
