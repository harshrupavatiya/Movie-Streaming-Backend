import mongoose, { Model, Schema } from "mongoose";
import { IDirector } from "../types/db.model";

const directorSchema = new Schema<IDirector>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
      index: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "", "prefer not to say"],
      default: "",
    },
    profilePicture: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
    },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    movies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
        default: [],
      },
    ],
    series: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Series",
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Director: Model<IDirector> = mongoose.model<IDirector>(
  "Director",
  directorSchema
);

export default Director;
