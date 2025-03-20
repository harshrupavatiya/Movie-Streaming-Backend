import mongoose, { Model, Schema } from 'mongoose';
import { ILike } from './like.interface';

const likeSchema = new Schema<ILike>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'contentType',
    },
    contentType: {
      type: String,
      required: true,
      enum: ['Episode', 'Media'],
    },
  },
  { timestamps: true }
);

const Like: Model<ILike> = mongoose.model<ILike>('Like', likeSchema);
export default Like;
