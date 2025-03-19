import mongoose, { Model, Schema } from "mongoose";
import { IEpisode } from "./episode.interface";

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
      seriesId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Series",
      },
      seasonNumber: {
        type: Number,
        required: true,
        min: 1,
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

  const Episode: Model<IEpisode> = mongoose.model<IEpisode>("Episode", episodeSchema);
  
  export default Episode;