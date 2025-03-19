import mongoose, { Document } from "mongoose";
import { StringValue } from "ms";

type ContentType = "Movie" | "Series" | "Episode";

export interface ISubscription {
  plan: "free" | "basic" | "premium";
  startDate?: Date;
  endDate?: Date;
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
  isActive: boolean;
  isDeleted: boolean;
  getJWT(secret: string, duration: StringValue): Promise<string>;
  validatePassword(passwordInputByUser: string): Promise<boolean>;
}

export interface IEditDetails {
    name?: string;
    contactNo?: string;
    profilePicture?: string;
    dateOfBirth?: Date;
    gender?: "" | "male" | "female" | "other" | "prefer not to say";
  }

export interface IEditUserDataReqBody {
    name?: string;
    contactNo?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other" | "prefer not to say";
  }