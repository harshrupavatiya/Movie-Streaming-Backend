import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { ISeries } from "../types/db.model";
import Cast from "./cast";
import Director from "./director";
import Episode from "./episode";

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
    viewCount: {
      type: Number,
      default: 0,
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
    directors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Director",
      },
    ],
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

seriesSchema.pre("findOneAndDelete", async function (next) {
  // delete all episodes which has given seriesId
  Episode.deleteMany({ seriesId: this.getQuery()._id })
    .then((val) => console.log("All Episode deleted successfully. ", val))
    .catch((err) =>
      console.log("something qwent wrong while deleting episodes. ", err)
    );

  next();
});

seriesSchema.post("save", async function () {
  const series = this;

  if (series.casts && series.casts.length > 0) {
    Promise.all(
      series.casts.map((castId) =>
        Cast.findByIdAndUpdate(castId.toString(), {
          $addToSet: { series: series._id },
        })
      )
    );
  }

  if (series.directors && series.directors.length > 0) {
    Promise.all(
      series.directors.map((directorId) =>
        Director.findByIdAndUpdate(directorId, {
          $addToSet: { series: series._id },
        })
      )
    );
  }
});

const Series: Model<ISeries> = mongoose.model<ISeries>("Series", seriesSchema);

export default Series;
