  import mongoose, { Model, Schema } from "mongoose";
  import { IMovie } from "../types/db.model";
  import Cast from "./cast";
  import Director from "./director";

  const movieSchema = new Schema<IMovie>(
    {
      title: {
        type: String,
        required: true,
        trim: true,
        maxLength: 254,
      },
      description: {
        type: String,
        maxLength: 400,
      },
      releaseDate: {
        type: Date,
      },
      genres: [
        {
          type: Number,
        },
      ],
      duration: {
        type: Number,
        required: true,
      },
      rating: {
        type: Number,
        required: true,
        min: 0,
        max: 10,
      },
      likes: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
      },
      reviews: [
        {
          reviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review",
          },
        },
      ],
      cast: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cast",
            required: true,
        },
      ],
      director: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Director",
        },
      ],
      languages: [
        {
          type: String,
        },
      ],
      poster: {
        type: String,
      },
      trailerUrl: {
        type: String,
      },
      movieUrl: {
        type: String,
      },
      availableForStreaming: {
        type: Boolean,
        default: true,
      },
    },
    { timestamps: true }
  );

  movieSchema.post("save", async function () {
    const movie = this;
    if (movie.cast){ 
      await Cast.updateMany(
      { _id: { $in: movie.cast } },
      { $push: { movies: movie._id } }
    ); 
  }
    if (movie.director) {
      await Director.updateMany(
      { _id: { $in: movie.director } },
      { $push: { movies: movie._id } }
    ); }
    });

  const Movie: Model<IMovie> = mongoose.model<IMovie>("Movie", movieSchema);

  export default Movie;
