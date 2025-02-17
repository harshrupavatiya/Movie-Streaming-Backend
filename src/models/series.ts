import mongoose, { Model, Schema } from "mongoose";
import { IEpisode, ISeason, ISeries } from "../types/db.model";

const episodeSchema = new Schema<IEpisode>(
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
    duration: {
      type: Number,
      required: true,
    },
    episodeNumber: {
      type: Number,
      required: true,
    },
    episodeUrl: {
      type: String,
      required: true,
    },
    releaseDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

const seasonSchema = new Schema<ISeason>(
  {
    seasonNumber: {
      type: Number,
      required: true,
    },
    episodes: [episodeSchema],
  },
  { timestamps: true }
);

const seriesSchema = new Schema<ISeries>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 254,
    },
    description: {
      type: String,
    },
    genre: [
      {
        type: Number,
      },
    ],
    releaseDate: {
      type: Date,
    },
    rating: {
      type: Number,
      min: 0,
      max: 10,
    },
    cast: [
      {
        castId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Cast",
          required: true,
        },
        roleName: {
          type: String,
          minLength: 2,
          maxLength: 50,
        },
      },
    ],
    director: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Director",
    },
    poster: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
    },
    availableForStreaming: {
      type: Boolean,
      default: true,
    },
    seasons: [seasonSchema],
  },
  { timestamps: true }
);

const Series: Model<ISeries> = mongoose.model<ISeries>(
  "Series",
  seriesSchema
);

export default Series;
