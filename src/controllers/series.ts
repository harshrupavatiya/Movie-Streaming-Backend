import { Response } from "express";
import { AuthRequest } from "../types/api";
import Series from "../models/series";
import Episode from "../models/episode";
import Like from "../models/like";
import mongoose from "mongoose";
import Cast from "../models/cast";
import Director from "../models/director";

// Add series---------------------------------------------------------------------------
export const createSeries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;

    // check user is admin
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // validate fields and get payload
    const seriesPayload = req.seriesPayload;

    // everything seems fine, so creating series model
    const newSeries = new Series(seriesPayload);

    // saving series model in DB
    await newSeries.save();

    res.status(200).json({ message: "Series added successfully." });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Delete series------------------------------------------------------------------------
export const deleteSeries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // get seriesId from URL query parameters
    const { seriesId } = req.params;

    // delete series
    const deletedSeries = await Series.findOneAndDelete({ _id: seriesId });

    if (!deletedSeries) {
      res.status(400).json({ message: "Series not found or invalid SeriesId" });
      return;
    }

    res
      .status(200)
      .json({ message: "Series and all Seasons & Episodes are deleted" });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Update series info-------------------------------------------------------------------
export const updateSeries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // get seriesId from req.body
    const { seriesId } = req.body;

    // find series by id
    const series = await Series.findById(seriesId);

    // ensure that series exists
    if (!series) {
      res.status(400).json({ message: "Invalid series Id" });
      return;
    }

    // validate reqData and get editSeriesPayload
    const editSeriesPayload = req.seriesPayload;

    if(editSeriesPayload?.casts) {
      await Cast.updateMany(
        { _id: { $in: series.casts } },
        { $pull: { series: series._id } }
      );
    }
    if(editSeriesPayload?.directors) {
      await Director.updateMany(
        { _id: { $in: series.directors } },
        { $pull: { series: series._id } }
      );
    }

    // update existing series document
    Object.assign(series, editSeriesPayload);

    // saving updated document
    await series.save();

    res.status(200).json({ message: "series info updated successfully." });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get series by genre------------------------------------------------------------------
export const getSeriesByGenre = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    // get genre from parameters
    const { genre } = req.params;

    // Convert parameters to numbers
    const genreNumber: number = parseInt(genre as string, 10);

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    // Validatiing genreNumber
    if (isNaN(genreNumber) || genreNumber < 1) {
      res
        .status(400)
        .json({ message: "Genre ID must be a positive integer (≥1)" });
      return;
    }

    // applying aggregation on series collection
    const seriesData = await Series.aggregate([
      {
        $match: {
          genres: genreNumber,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    // if seriesData is empty then send error of invalid genreId
    if (!seriesData || seriesData.length <= 0) {
      res
        .status(200)
        .json({ message: "no series available with given genreId" });
      return;
    }

    const SeriesCount = await Series.countDocuments({
      genres: genreNumber,
    });
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "list of series",
      data: { seriesList: seriesData },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get series by Id---------------------------------------------------------------------
export const getSeriesById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    const { seriesId } = req.params;

    // get series Info
    const series = await Series.findById(seriesId)
      .select(
        "title description genres languages releaseDate rating likes poster trailerUrl"
      )
      .populate({
        path: "reviews",
        options: { sort: { createdAt: -1 }, limit: 5 },
      })
      .populate({
        path: "casts",
        select: "name",
      })
      .populate({
        path: "directors",
        select: "name",
      })
      .exec();

    // if series not present
    if (!series) {
      res.status(400).json({ message: "Please provide valid seriesId" });
      return;
    }

    const aggregateArray =
      req.user.subscription?.plan === "free"
        ? [
            {
              $match: {
                seriesId: new mongoose.Types.ObjectId(seriesId),
              },
            },
            {
              $project: {
                createdAt: 0,
                updatedAt: 0,
                seriesId: 0,
                episodeUrl: 0,
              },
            },
            {
              $group: {
                _id: "$seasonNumber",
                episodes: { $push: "$$ROOT" },
              },
            },
            {
              $sort: { _id: 1 },
            },
            {
              $addFields: {
                season: "$_id",
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ]
        : [
            {
              $match: {
                seriesId: new mongoose.Types.ObjectId(seriesId),
              },
            },
            {
              $project: {
                createdAt: 0,
                updatedAt: 0,
                seriesId: 0,
              },
            },
            {
              $group: {
                _id: "$seasonNumber",
                episodes: { $push: "$$ROOT" },
              },
            },
            {
              $sort: { _id: 1 },
            },
            {
              $addFields: {
                season: "$_id",
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ];

    // get episode season wise
    const seasonwiseEpisode = await Episode.aggregate(aggregateArray as any[]);

    const isLiked = await Like.findOne({
      userId: req.user?._id.toString(),
      contentId: seriesId,
      contentType: "Series",
    });

    series.isLiked = isLiked ? true : false;

    res.status(200).json({
      message: `Series ${series?.title} is here`,
      data: {
        seriesInfo: series,
        seriesContent: seasonwiseEpisode,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get most liked series list-----------------------------------------------------------
export const getMostLikedSeriesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    const seriesList = await Series.aggregate([
      {
        $sort: {
          likes: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(200).json({ message: "data not available" });
      return;
    }

    const SeriesCount = await Series.countDocuments();
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "Most Liked Series List",
      data: { seriesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get most viewed series list----------------------------------------------------------
export const getMostViewedSeriesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    const seriesList = await Series.aggregate([
      {
        $sort: {
          viewCount: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(200).json({ message: "data not available" });
      return;
    }

    const SeriesCount = await Series.countDocuments();
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "Most Viewed Series List",
      data: { seriesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get top rated series list------------------------------------------------------------
export const getTopRatedSeriesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    const seriesList = await Series.aggregate([
      {
        $sort: {
          rating: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(200).json({ message: "data not available" });
      return;
    }

    const SeriesCount = await Series.countDocuments();
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "Top Rated Series List",
      data: { seriesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get latest released series list------------------------------------------------------
export const getLatestReleasedSeriesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    const seriesList = await Series.aggregate([
      {
        $sort: {
          releaseDate: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(200).json({ message: "data not available" });
      return;
    }

    const SeriesCount = await Series.countDocuments();
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "Latest Released Series List",
      data: { seriesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get popular series list--------------------------------------------------------------
export const getPopularSeriesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    const seriesList = await Series.aggregate([
      {
        $match: {
          rating: { $gte: 7.5 },
          likes: { $gte: 0 },
        },
      },
      {
        $sort: { rating: -1, likes: -1 },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(200).json({ message: "data not available" });
      return;
    }

    const SeriesCount = await Series.countDocuments();
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "Popular Series List",
      data: { seriesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get series list by search------------------------------------------------------------
export const getSeriesListBySearch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only" });
      return;
    }

    // get page and limit from query parameters
    let { search = "" } = req.query;

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    const searchRegExp = new RegExp(search as string, "i");

    const seriesList = await Series.find({
      title: searchRegExp,
    })
      .populate({
        path: "casts",
        select: "name",
      })
      .populate({
        path: "directors",
        select: "name",
      })
      .skip(skipDocNumber)
      .limit(limitNumber)
      .sort({ releaseDate: -1 });

    const SeriesCount = await Series.countDocuments({
      title: searchRegExp,
    });
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "searched series List for admin",
      data: {
        seriesList,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get series names and id by search----------------------------------------------------
export const getSeriesNamesAndIdBySearch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only" });
      return;
    }

    // get page and limit from query parameters
    let { search = "" } = req.query;

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: "pagination values missing" });
      return;
    }

    const searchRegExp = new RegExp(search as string, "i");

    const seriesList = await Series.aggregate([
      {
        $match: {
          title: searchRegExp,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          _id: 1,
        },
      },
    ]);

    const SeriesCount = await Series.countDocuments({
      title: searchRegExp,
    });
    res.status(200).json({
      metadata: {
        totalSeries: SeriesCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(SeriesCount / limitNumber),
      },
      message: "searched series Name and ID for admin",
      data: {
        seriesList,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Series view count--------------------------------------------------------------------
export const incrementSeriesView = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role == "admin") {
      res.status(403).json({ message: "Only view incremented for users" });
      return;
    }

    const { seriesId } = req.params;

    const updatedSeries = await Series.findByIdAndUpdate(
      seriesId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updatedSeries) {
      res.status(404).json({ message: "Series not found" });
      return;
    }

    res.status(200).json({
      message: "View count updated",
      data: { views: updatedSeries.viewCount },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};
