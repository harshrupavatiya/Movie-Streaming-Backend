import mongoose, { Document } from "mongoose";

interface ISubscription {
  plan: "free" | "basic" | "premium";
  startDate?: Date;
  endDate?: Date;
}

interface ICastMember {
  castId: mongoose.Types.ObjectId;
  roleName?: string;
}

// User
export interface IUser extends Document {
  name: string;
  email: string;
  contactNo?: string;
  password: string;
  profilePicture?: string;
  subscription?: ISubscription;
  watchlist: mongoose.Types.ObjectId[];
  role: "user" | "admin";
  getJWT(): Promise<string>;
  validatePassword(passwordInputByUser: string): Promise<boolean>;
}

// otp
export interface IOTP extends Document {
  email: string;
  otp: number;
  createdAt: Date;
}

// movie
export interface IMovie extends Document {
  title: string;
  description?: string;
  releaseDate?: Date;
  genres?: number[];
  duration: number;
  rating?: number;
  cast?: ICastMember[];
  director?: mongoose.Types.ObjectId;
  poster?: string;
  trailerUrl?: string;
  movieUrl?: string;
  availableForStreaming?: boolean;
}

// episode
export interface IEpisode {
  title: string;
  description?: string;
  duration: number;
  episodeNumber: number;
  episodeUrl: string;
  releaseDate?: Date;
}

// season
export interface ISeason {
  seasonNumber: number;
  episodes: IEpisode[];
}

// series
export interface ISeries extends Document {
  title: string;
  description?: string;
  genre?: number[];
  releaseDate?: Date;
  rating?: number;
  cast?: ICastMember[];
  director?: mongoose.Types.ObjectId;
  poster: string;
  trailerUrl?: string;
  availableForStreaming?: boolean;
  seasons: ISeason[];
}

// upcomingContent
export interface IUpcomingContent extends Document {
  title: string;
  description?: string;
  releaseDate: Date;
  contentType: "movie" | "tvSeries";
  genre?: number[];
  cast?: mongoose.Types.ObjectId[];
  director?: mongoose.Types.ObjectId;
  poster?: string;
  trailerUrl?: string;
}

// cast
export interface ICast extends Document {
  name: string;
  age?: number;
  gender?: "male" | "female" | "other";
  profilePicture?: string;
  birthDate?: Date;
  nationality?: string;
  movies?: mongoose.Types.ObjectId[];
  tvSeries?: mongoose.Types.ObjectId[];
}

// director
export interface IDirector extends Document {
  name: string;
  profilePicture?: string;
  birthDate?: Date;
  nationality?: string;
  movies?: mongoose.Types.ObjectId[];
  tvSeries?: mongoose.Types.ObjectId[];
}
