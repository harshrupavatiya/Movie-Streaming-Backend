import mongoose, { Document } from "mongoose";

export interface IEpisode extends Document {
  title: string;
  description?: string;
  seriesId: mongoose.Types.ObjectId;
  seasonNumber: number;
  duration: number;
  episodeNumber: number;
  episodeUrl: string;
  releaseDate?: Date;
}