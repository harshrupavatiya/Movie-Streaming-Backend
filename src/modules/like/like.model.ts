import mongoose, { Model, Schema } from "mongoose";
import { ILike } from "../../types/db.model";
import Movie from "../../models/movie.model";
import Series from "../../models/series.model";

const likeSchema = new Schema<ILike>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "contentType",
    },
    contentType: {
      type: String,
      required: true,
      enum: ["Movie", "Series", "Episode"],
    },
  },
  { timestamps: true }
);

const Like: Model<ILike> = mongoose.model<ILike>("Like", likeSchema);
export default Like;
