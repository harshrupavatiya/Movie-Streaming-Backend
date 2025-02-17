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
    },
    profilePicture: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
    },
    birthDate: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    movies: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    tvSeries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "TVSeries",
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
