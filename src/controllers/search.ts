import { Request, Response } from "express";
import Movie from "../models/movie";
import Series from "../models/series";

export const searchContent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    let { search } = req.query;

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
