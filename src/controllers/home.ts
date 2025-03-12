import { Response } from "express";
import Movie from "../models/movie";
import Series from "../models/series";
import { AuthRequest } from "../types/api";

export const getTrendingContent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const [topRatedMovie, mostViewedMovie, popularMovie] = await Promise.all([
      Movie.findOne().sort({ rating: -1 }).select("title description releaseDate languages genres _id trailerUrl"),
      Movie.findOne().sort({ views: -1 }).select("title description releaseDate languages genres _id trailerUrl"),
      Movie.findOne().sort({ likes: -1 }).select("title description releaseDate languages genres _id trailerUrl"),
    ]);

    const [topRatedSeries, mostViewedSeries, popularSeries] = await Promise.all([
      Series.findOne().sort({ rating: -1 }).select("title description releaseDate languages genres _id trailerUrl"),
      Series.findOne().sort({ views: -1 }).select("title description releaseDate languages genres _id trailerUrl"),
      Series.findOne().sort({ likes: -1 }).select("title description releaseDate languages genres _id trailerUrl"),
    ]);

    res.status(200).json({
      message: "Trending Movies & Series",
      data: {
        movies: [topRatedMovie, mostViewedMovie, popularMovie].filter(Boolean),
        series: [topRatedSeries, mostViewedSeries, popularSeries].filter(
          Boolean
        ),
      },
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};
