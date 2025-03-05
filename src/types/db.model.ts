import mongoose, { Document } from "mongoose";
import { StringValue } from "ms";

type ContentType = "Movie" | "Series" | "Episode";

interface ISubscription {
  plan: "free" | "basic" | "premium";
  startDate?: Date;
  endDate?: Date;
}

export interface ICastMember {
  castId: mongoose.Types.ObjectId;
  roleName?: string;
}

// Define Liked Content Interface
export interface ILikedContent {
  contentId: mongoose.Types.ObjectId;
  contentType: ContentType;
}

// Define Watchlist Content Interface
export interface IWatchlistContent {
  contentId: mongoose.Types.ObjectId;
  contentType: ContentType;
}

// Define Continue Watching Interface
export interface IContinueWatching {
  contentId: mongoose.Types.ObjectId;
  contentType: ContentType;
  progress: number; // Store watch time in seconds
  lastWatched: Date;
}

// User
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId | string;
  name: string;
  email: string;
  contactNo?: string;
  password: string;
  dateOfBirth?: Date;
  gender?: "" | "male" | "female" | "other" | "prefer not to say";
  profilePicture?: string;
  subscription?: ISubscription;
  watchlist: IWatchlistContent[];
  likedContent: ILikedContent[];
  continueWatching: IContinueWatching[]; // Added this field
  role: "user" | "admin";
  getJWT(secret: string, duration: StringValue): Promise<string>;
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
  rating: number;
  likes: number;
  languages?: string[];
  reviews?: mongoose.Types.ObjectId;
  cast?: mongoose.Types.ObjectId[];
  director?: mongoose.Types.ObjectId[];
  poster?: string;
  trailerUrl?: string;
  movieUrl?: string;
  availableForStreaming?: boolean;
}

// episode
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

// series
export interface ISeries extends Document {
  title: string;
  description?: string;
  genres?: number[];
  languages?: string[];
  releaseDate?: Date;
  likes: number;
  viewCount: number;
  rating?: number;
  casts?: mongoose.Types.ObjectId[];
  reviews?: mongoose.Types.ObjectId[];
  directors?: mongoose.Types.ObjectId[];
  poster?: string;
  trailerUrl?: string;
  availableForStreaming?: boolean;
}

// upcomingContent
export interface IUpcomingContent extends Document {
  title: string;
  description?: string;
  releaseDate: Date;
  contentType: ContentType;
  genre?: number[];
  cast?: mongoose.Types.ObjectId[];
  director?: mongoose.Types.ObjectId;
  poster?: string;
  trailerUrl?: string;
}

// cast
export interface ICast extends Document {
  name: string;
  gender?: "male" | "female" | "other" | "" | "prefer not to say";
  profilePicture?: string;
  dateOfBirth?: Date;
  nationality?: string;
  movies?: mongoose.Types.ObjectId[];
  series?: mongoose.Types.ObjectId[];
}

// director
export interface IDirector extends Document {
  name: string;
  gender?: "male" | "female" | "other" | "" | "prefer not to say";
  profilePicture?: string;
  dateOfBirth?: Date;
  nationality?: string;
  movies?: mongoose.Types.ObjectId[];
  series?: mongoose.Types.ObjectId[];
}

// liked section
export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  contentType: ContentType;
}

export interface IReview extends Document {
  contentId: mongoose.Types.ObjectId;
  contentType: ContentType;
  reviewer: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}
