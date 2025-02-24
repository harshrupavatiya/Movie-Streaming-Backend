import mongoose, { Model, Schema } from "mongoose";
import { ILike } from "../types/db.model";

const likeSchema = new Schema<ILike>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "contentType", // Dynamic reference to either Movie or Series
    },
  },
  { timestamps: true }
);

const Like: Model<ILike> = mongoose.model<ILike>("Like", likeSchema);
export default Like;
