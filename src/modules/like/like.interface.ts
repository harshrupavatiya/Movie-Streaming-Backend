import mongoose from "mongoose";

type ContentType = "Movie" | "Series" | "Episode";

export interface ILike extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: mongoose.Types.ObjectId;
  contentType: ContentType;
}