import mongoose, { Document } from "mongoose";

export interface IMedia extends Document {
  title: string;
  description?: string;
  genres?: number[];
  languages?: string[];
  releaseDate?: Date;
  likes: number;
  viewCount: number;
  rating?: number;
  contentType: "Movie" | "Series";
  crew?: mongoose.Types.ObjectId[];
  reviews?: mongoose.Types.ObjectId[];
  poster?: string;
  trailerUrl?: string;
  movieUrl?: string;
  availableForStreaming?: boolean;
  isLiked?: boolean;
  isDeleted?: boolean;
}