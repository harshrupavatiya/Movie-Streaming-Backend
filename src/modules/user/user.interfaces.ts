import mongoose, {Document} from "mongoose";
import { StringValue } from "ms";

type ContentType = "Movie" | "Series" | "Episode";

export interface ISubSubscription {
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

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  contactNo?: string;
  password: string;
  dateOfBirth?: Date;
  gender?: "" | "male" | "female" | "other" | "prefer not to say";
  profilePicture?: string;
  subscription?: ISubSubscription;
  watchlist: IWatchlistContent[];
  likedContent: ILikedContent[];
  continueWatching: IContinueWatching[]; // Added this field
  role: "user" | "admin";
  isActive: boolean;
  isDeleted: boolean;
  getJWT(secret: string, duration: StringValue): Promise<string>;
  validatePassword(passwordInputByUser: string): Promise<boolean>;
}