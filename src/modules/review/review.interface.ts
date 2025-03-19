import mongoose, { Document } from 'mongoose';

type ContentType = 'Movie' | 'Series' | 'Episode';

export interface IReview extends Document {
  contentId: mongoose.Types.ObjectId;
  contentType: ContentType;
  reviewer: mongoose.Types.ObjectId;
  rating: number;
  comment?: string;
}
