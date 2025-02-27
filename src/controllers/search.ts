import { Request, Response } from "express";
import Movie from "../models/movie"; // Movie model
import Series from "../models/series"; // Series model
import Cast from "../models/cast"; // Cast model
import Director from "../models/director"; // Director model

export const searchContent = async (req: Request, res: Response): Promise<String | any> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const searchRegex = new RegExp(query, "i"); // Case-insensitive search

    // Search movies & series by title
    const movies = await Movie.find({ title: searchRegex }).select("title poster releaseDate");
    const series = await Series.find({ title: searchRegex }).select("title poster releaseDate");

    // Search Cast by name and get related movies/series
    const castMembers = await Cast.find({ name: searchRegex }).select("_id name");
    const moviesByCast = await Movie.find({ "cast.castId": { $in: castMembers.map(c => c._id) } })
      .select("title poster releaseDate");

    // Search Directors by name and get related movies/series
    const directors = await Director.find({ name: searchRegex }).select("_id name");
    const moviesByDirector = await Movie.find({ director: { $in: directors.map(d => d._id) } })
      .select("title poster releaseDate");

    // Add a type identifier for filtering
    const formattedMovies = movies.map(movie => ({
      ...movie.toObject(),
      type: "Movie",
    }));

    const formattedSeries = series.map(series => ({
      ...series.toObject(),
      type: "Series",
    }));

    const formattedMoviesByCast = moviesByCast.map(movie => ({
      ...movie.toObject(),
      type: "Movie (by Cast)",
    }));

    const formattedMoviesByDirector = moviesByDirector.map(movie => ({
      ...movie.toObject(),
      type: "Movie (by Director)",
    }));

    // Combine all results
    const results = [
      ...formattedMovies,
      ...formattedSeries,
      ...formattedMoviesByCast,
      ...formattedMoviesByDirector
    ];

    return res.status(200).json({ results });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};
