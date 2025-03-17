import mongoose, { Document } from "mongoose";

export interface Auditable extends Document {
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedBy: mongoose.Types.ObjectId;
  updatedAt: Date;
  deletedBy?: mongoose.Types.ObjectId | null;
  deletedAt?: Date | null;
}

export interface IMedia extends Auditable {
  title: string;
  description?: string;
  genres: number[];
  languages: string[];
  releaseDate: Date;
  likes: number;
  viewCount: number;
  rating: number;
  casts: mongoose.Types.ObjectId[];
  reviews?: mongoose.Types.ObjectId[];
  directors: mongoose.Types.ObjectId[];
  contentType: "Movie" | "Series";
  duration?: number;
  poster: string;
  trailerUrl: string;
  movieUrl?: string;
  availableForStreaming?: boolean;
  isLiked?: boolean;
  isDeleted: boolean;
}
