import mongoose, { Model, Schema } from "mongoose";
import { ILike } from "../types/db.model";
import Movie from "./movie";
import Series from "./series";

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

likeSchema.post("save", function () {
  const like = this;

  if (like.contentType === "Movie") {
    Movie.findByIdAndUpdate(like.contentId, { $inc: { likes: 1 } })
      .then(() => {
        console.log("like value increamented successfully");
      })
      .catch((err) => {
        console.log(
          "Getting an error while increamenting the value of like : ",
          err
        );
      });
  }
  if (like.contentType === "Series") {
    Series.findByIdAndUpdate(like.contentId, { $inc: { likes: 1 } })
      .then(() => {
        console.log("like value increamented successfully");
      })
      .catch((err) => {
        console.log(
          "Getting an error while increamenting the value of like : ",
          err
        );
      });
  }
});

likeSchema.post("findOneAndDelete", function () {
  if ((this as any)._conditions.contentType === "Movie") {
    Movie.findByIdAndUpdate((this as any)._conditions.contentId, {
      $inc: { likes: -1 },
    })
      .then(() => {
        console.log("like value decreamented successfully");
      })
      .catch((err) => {
        console.log(
          "Getting an error while decreamenting the value of like : ",
          err
        );
      });
  }
  if ((this as any)._conditions.contentType === "Series") {
    Series.findByIdAndUpdate((this as any)._conditions.contentId, {
      $inc: { likes: -1 },
    })
      .then(() => {
        console.log("like value decreamented successfully");
      })
      .catch((err) => {
        console.log(
          "Getting an error while decreamenting the value of like : ",
          err
        );
      });
    console.log("31");
  }
});

const Like: Model<ILike> = mongoose.model<ILike>("Like", likeSchema);
export default Like;
