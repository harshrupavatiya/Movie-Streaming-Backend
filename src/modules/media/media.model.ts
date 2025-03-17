import mongoose, { Model, Schema } from "mongoose";
import { IMedia } from "./media.interfaces";
import Cast from "../cast/cast.model";
import Director from "../director/director.model";
import Episode from "../episode/episode.model";
import { ADMIN } from "../utils/constants";

const mediaSchema = new Schema<IMedia>(
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
    contentType: {
        type: String,
        enum: ["Movie", "Series"],
        required: true,
    },
    duration: {
        type: Number,
    },
    availableForStreaming: {
      type: Boolean,
      default: true,
    },
    poster: {
      type: String,
      required: true,
    },
    trailerUrl: {
      type: String,
      required: true,
    },
    movieUrl: {
        type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ADMIN,
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ADMIN,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: ADMIN,
      default: null,
    },
  },
  { timestamps: true }
);

mediaSchema.pre("findOneAndDelete", async function (next) {
  // delete all episodes which has given mediaId
  Episode.deleteMany({ seriesId: this.getQuery()._id })
    .then((val) => console.log("All Episode deleted successfully. ", val))
    .catch((err) =>
      console.log("something qwent wrong while deleting episodes. ", err)
    );

  next();
});

mediaSchema.post("save", async function () {
  const media = this;

  if (media.casts && media.casts.length > 0) {
    Promise.all(
      media.casts.map((castId) =>
        Cast.findByIdAndUpdate(castId.toString(), {
          $addToSet: { media: media._id },
        })
      )
    );
  }

  if (media.directors && media.directors.length > 0) {
    Promise.all(
      media.directors.map((directorId) =>
        Director.findByIdAndUpdate(directorId, {
          $addToSet: { media: media._id },
        })
      )
    );
  }
});

const Media: Model<IMedia> = mongoose.model<IMedia>("Media", mediaSchema);

export default Media;
