import mongoose, { Model, Schema } from "mongoose";
import { ICast } from "../types/db";

const castSchema = new Schema<ICast>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    age: {
      type: Number,
      max: 150,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    profilePicture: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png"
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

const Cast: Model<ICast> = mongoose.model<ICast>("Cast", castSchema);

export default Cast;
