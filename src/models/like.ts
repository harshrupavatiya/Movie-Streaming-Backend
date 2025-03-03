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
      refPath: "contentType", // Dynamic reference to either Movie or Series
    },
    contentType: {
      type: String,
      required: true,
      enum: ["Movie", "Series"],
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

likeSchema.post("findOneAndDelete", function (doc) {
  if (doc.contentType === "Movie") {
    Movie.findByIdAndUpdate(doc.contentId, { $inc: { likes: -1 } })
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
  if (doc.contentType === "Seires") {
    Series.findByIdAndUpdate(doc.contentId, { $inc: { likes: -1 } })
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
});

const Like: Model<ILike> = mongoose.model<ILike>("Like", likeSchema);
export default Like;
