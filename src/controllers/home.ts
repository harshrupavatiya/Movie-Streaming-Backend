import { Response } from "express";
import Movie from "../models/movie";
import Series from "../models/series";
import { AuthRequest } from "../types/api";
import { MOVIE, SERIES } from "../utils/constants";

export const getTrendingContent = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {

    const [resultMovie] = await Movie.aggregate([
      {
        $facet: {
          topRatedMovie: [
            { $sort: { rating: -1 } },
            { $limit: 1 },
            {
              $project: {
                title: 1,
                description: 1,
                releaseDate: 1,
                languages: 1,
                genres: 1,
                _id: 1,
                trailerUrl: 1,
              },
            },
            { $addFields: { contentType: MOVIE } },
          ],
          mostViewedMovie: [
            { $sort: { views: -1 } },
            { $limit: 1 },
            {
              $project: {
                title: 1,
                description: 1,
                releaseDate: 1,
                languages: 1,
                genres: 1,
                _id: 1,
                trailerUrl: 1,
              },
            },
            { $addFields: { contentType: MOVIE } },
          ],
          popularMovie: [
            { $sort: { likes: -1 } },
            { $limit: 1 },
            {
              $project: {
                title: 1,
                description: 1,
                releaseDate: 1,
                languages: 1,
                genres: 1,
                _id: 1,
                trailerUrl: 1,
              },
            },
            { $addFields: { contentType: MOVIE } },
          ],
        },
      },
    ]);

    const [resultSeries] = await Series.aggregate([
      {
        $facet: {
          topRatedSeries: [
            { $sort: { rating: -1 } },
            { $limit: 1 },
            {
              $project: {
                title: 1,
                description: 1,
                releaseDate: 1,
                languages: 1,
                genres: 1,
                _id: 1,
                trailerUrl: 1,
              },
            },
            { $addFields: { contentType: SERIES } },
          ],
          mostViewedSeries: [
            { $sort: { views: -1 } },
            { $limit: 1 },
            {
              $project: {
                title: 1,
                description: 1,
                releaseDate: 1,
                languages: 1,
                genres: 1,
                _id: 1,
                trailerUrl: 1,
              },
            },
            { $addFields: { contentType: SERIES } },
          ],
          popularSeries: [
            { $sort: { likes: -1 } },
            { $limit: 1 },
            {
              $project: {
                title: 1,
                description: 1,
                releaseDate: 1,
                languages: 1,
                genres: 1,
                _id: 1,
                trailerUrl: 1,
              },
            },
            { $addFields: { contentType: SERIES } },
          ],
        },
      },
    ]);

    // Destructure the resultMovie
    const { topRatedMovie, mostViewedMovie, popularMovie } = {
      topRatedMovie: resultMovie.topRatedMovie[0],
      mostViewedMovie: resultMovie.mostViewedMovie[0],
      popularMovie: resultMovie.popularMovie[0],
    };
    // Destructure the resultSeries
    const { topRatedSeries, mostViewedSeries, popularSeries } = {
      topRatedSeries: resultSeries.topRatedSeries[0],
      mostViewedSeries: resultSeries.mostViewedSeries[0],
      popularSeries: resultSeries.popularSeries[0],
    };

    res.status(200).json({
      message: "Trending Movies & Series",
      data: {
        heroContent: [
          topRatedMovie,
          topRatedSeries,
          mostViewedMovie,
          mostViewedSeries,
          popularMovie,
          popularSeries,
        ],
      },
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};
