import mongoose, { Model, Schema } from "mongoose";
import { ISeries } from "../types/db.model";
import Cast from "./cast";
import Director from "./director";

const seriesSchema = new Schema<ISeries>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    description: {
      type: String,
      maxlength: 300,
    },
    genres: [
      {
        type: Number,
        required: true,
      },
    ],
    languages: [
      {
        type: String,
        required: true,
      },
    ],
    releaseDate: {
      type: Date,
      required: true,
    },
    rating: {
      type: Number,
      default: 9,
      min: 0,
      max: 10,
    },
    likes: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    casts: [
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
      required: true,
    },
    trailerUrl: {
      type: String,
      required: true,
    },
    availableForStreaming: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// TODO: check that post hook is working file or not ?

seriesSchema.post("save", async function () {
  const series = this;

  if (series.casts) {
    Cast.updateMany(
      { _id: { $in: series?.casts } },
      { $push: { series: series._id } }
    );
  }

  if (series.director) {
    Director.updateMany(
      { _id: { $in: series.director } },
      { $push: { series: series._id } }
    );
  }
});

const Series: Model<ISeries> = mongoose.model<ISeries>("Series", seriesSchema);

export default Series;
