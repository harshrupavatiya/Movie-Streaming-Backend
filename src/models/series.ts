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
      // required: true,
    },
    trailerUrl: {
      type: String,
      // required: true,
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
    .then(() => console.log("All episode deleted"))
    .catch((err) => console.log("episode not deleted"));
  next();
});

// TODO: check that post hook is working file or not ?

seriesSchema.post("save", async function () {
  const series = this;

  if (series.casts) {
    // console.log("enters cast : ", series.casts);
    // // Cast.updateMany(
    // //   { _id: { $in: series?.casts.map(id => new mongoose.Types.ObjectId(id)) } },
    // //   { $push: { series: series._id } }
    // // );
    // const cast = await Cast.findById(series.casts[0]);
    // console.log("cast: ", cast);
    // if (cast) {
    //   cast?.series?.push(this._id as mongoose.Types.ObjectId); // Explicitly assert as ObjectId
    //   await cast.save();
    // }
    // // series.casts.map(cast => { Cast.findByIdAndUpdate(cast.toString(), { $addToSet: { series: series._id} })})
    // console.log("end cast");

    series.casts.map((castId) =>
      Cast.findByIdAndUpdate(castId, { $addToSet: { series: series._id } })
    );
  }

  if (series.directors) {
    // console.log("enters directors : ", series.directors);
    // Director.updateMany(
    //   { _id: { $in: series.directors } },
    //   { $push: { series: series._id } }
    // );
    // console.log("end directors");

    series.directors.map((castId) =>
      Director.findByIdAndUpdate(castId, { $addToSet: { series: series._id } })
    );
  }
});

const Series: Model<ISeries> = mongoose.model<ISeries>("Series", seriesSchema);

export default Series;
