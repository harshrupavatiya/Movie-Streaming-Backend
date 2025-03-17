import { Request, Response } from "express";
import Movie from "../models/movie.model";
import Series from "../models/series.model";
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

export const searchContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { search } = req.query;
    console.log(search, "search at line 8 search controller")

    if (!search || typeof search !== "string") {
      res.status(400).json({ message: "Search Body is required" });
      return;
    }

    const searchRegex = new RegExp(search.trim(), "i"); // Case-insensitive search

    // Search movies & series by title
    const movies = await Movie.find({ title: searchRegex })
      .select(
        "_id title description rating poster languages genres releaseDate"
      )
      .lean();

    const series = await Series.find({ title: searchRegex })
      .select(
        "_id title description rating poster languages genres releaseDate"
      )
      .lean();

    // Aggregate movies by Cast & Director
    const moviesByCastOrDirector = await Movie.aggregate([
      {
        $lookup: {
          from: "casts",
          localField: "cast",
          foreignField: "_id",
          as: "castDetails",
        },
      },
      {
        $lookup: {
          from: "directors",
          localField: "director",
          foreignField: "_id",
          as: "directorDetails",
        },
      },
      {
        $match: {
          $or: [
            { "castDetails.name": searchRegex },
            { "directorDetails.name": searchRegex },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          rating: 1,
          poster: 1,
          languages: 1,
          genres: 1,
          releaseDate: 1,
        },
      },
    ]);

    // **Fixed Aggregation for Series by Cast & Director**
    const seriesByCastOrDirector = await Series.aggregate([
      {
        $lookup: {
          from: "casts",
          localField: "casts", // Fixed: It was `cast`, but it should be `casts`
          foreignField: "_id",
          as: "castDetails",
        },
      },
      {
        $lookup: {
          from: "directors",
          localField: "directors", // Fixed: It was `director`, but it should be `directors`
          foreignField: "_id",
          as: "directorDetails",
        },
      },
      {
        $match: {
          $or: [
            { "castDetails.name": searchRegex },
            { "directorDetails.name": searchRegex },
          ],
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          rating: 1,
          poster: 1,
          languages: 1,
          genres: 1,
          releaseDate: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: "Search Results",
      data: {
        movieList: movies,
        seriesList: series,
        castAndDirectorWiseMovie: moviesByCastOrDirector,
        castAndDirectorWiseSeries: seriesByCastOrDirector,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
    return;
  }
};
