import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import Series from "../models/series";
import { getEditSeriesPayload, getSeriesPayload } from "../utils/seriesData";
import { UploadedFile } from "express-fileupload";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import fs from "fs";
import Episode from "../models/episode";
import Like from "../models/like";

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
    const seriesPayload = getSeriesPayload(req.body);

    // get poster & trailer file from req
    const posterFile = req?.files?.poster as UploadedFile;
    const trailerFile = req?.files?.trailer as UploadedFile;

    // checking poster & trailer are present
    if (!trailerFile || !posterFile) {
      res.status(400).json({
        message: "poster and trailer are both required for adding series.",
      });
      return;
    }

    // validating file type
    validateFileContent(posterFile.mimetype, "image");
    validateFileContent(trailerFile.mimetype, "video");

    // uploading image to cloudinary
    const result = await Promise.all([
      uploadImageToCloudinary(posterFile.tempFilePath, {
        folder: "posters",
        height: 800,
        quality: 500,
      }),
      uploadImageToCloudinary(trailerFile.tempFilePath, {
        folder: "trailers",
        height: 800,
        quality: 500,
      }),
    ]);

    // Delete the temporary file
    [posterFile, trailerFile].map((file) =>
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      })
    );

    // get secureURL after uploading successfully
    const poster = result[0]?.secure_url ?? null;
    const trailerUrl = result[1]?.secure_url ?? null;

    // if poster or trailer URL not present then send Error
    if (!poster || !trailerUrl) {
      res
        .status(500)
        .json({ message: "something went wrong while generating URL" });
      return;
    }

    // adding URLs to seriesPayload
    seriesPayload.poster = poster;
    seriesPayload.trailerUrl = trailerUrl;

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
    const { seriesId } = req.query;

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
    const editSeriesPayload = getEditSeriesPayload(req.body);

    // get poster & trailer file from req
    const posterFile = req?.files?.poster as UploadedFile;
    const trailerFile = req?.files?.trailer as UploadedFile;

    // upload poster to cloudinary
    if (posterFile) {
      // validating file type
      validateFileContent(posterFile.mimetype, "image");

      // uploading image to cloudinary
      const result = await uploadImageToCloudinary(posterFile.tempFilePath, {
        folder: "posters",
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(posterFile.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });

      // get secureURL after uploading successfully
      const poster = result?.secure_url ?? null;

      // if poster or trailer URL not present then send Error
      if (!poster) {
        res.status(500).json({
          message: "something went wrong while generating URL of poster",
        });
        return;
      }

      // adding URLs to seriesPayload
      editSeriesPayload.poster = poster;
    }
    // upload trailer to cloudinary
    if (trailerFile) {
      // validating file type
      validateFileContent(trailerFile.mimetype, "video");

      // uploading image to cloudinary
      const result = await uploadImageToCloudinary(trailerFile.tempFilePath, {
        folder: "trailers",
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(trailerFile.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });

      // get secureURL after uploading successfully
      const trailerUrl = result?.secure_url ?? null;

      // if poster or trailer URL not present then send Error
      if (!trailerUrl) {
        res.status(500).json({
          message: "something went wrong while generating URL of trailer",
        });
        return;
      }

      // adding URLs to seriesPayload
      editSeriesPayload.trailerUrl = trailerUrl;
    }

    // if editSeriesPayload in empty then send error
    if (Object.keys(editSeriesPayload).length <= 0) {
      res.status(400).json({
        message: "Atleast one field is required to update series info.",
      });
      return;
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
    // get page and limit from query parameters
    let { page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const genreNumber: number = parseInt(genre as string, 10);
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // Validatiing genreNumber
    if (isNaN(genreNumber) || genreNumber < 1) {
      res
        .status(400)
        .json({ message: "Genre ID must be a positive integer (≥1)" });
      return;
    }
    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

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
          availableForStreaming: 1,
        },
      },
    ]);

    // if seriesData is empty then send error of invalid genreId
    if (!seriesData || seriesData.length <= 0) {
      res
        .status(400)
        .json({ message: "no series available with given genreId" });
      return;
    }

    res
      .status(200)
      .json({ message: "list of series", data: { seriesList: seriesData } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

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
    const series = await Series.findById(seriesId);

    // if series not present
    if (!series) {
      res.status(400).json({ message: "Please provide valid seriesId" });
      return;
    }

    // get episode season wise
    const seasonwiseEpisode = await Episode.aggregate([
      {
        $match: {
          seriesId: seriesId,
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
        $project: {
          _id: 0,
        },
      },
    ]);

    const isLiked= await Like.findOne({ userId: req.user?._id.toString(), contentId: seriesId, contentType: "Series"});

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

    // get page and limit from query parameters
    let { page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

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
          availableForStreaming: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(400).json({ message: "data not available" });
      return;
    }

    res
      .status(200)
      .json({ message: "Most Liked Series List", data: { seriesList } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

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

    // get page and limit from query parameters
    let { page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

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
          availableForStreaming: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(400).json({ message: "data not available" });
      return;
    }

    res
      .status(200)
      .json({ message: "Most Viewed Series List", data: { seriesList } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

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

    // get page and limit from query parameters
    let { page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

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
          availableForStreaming: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(400).json({ message: "data not available" });
      return;
    }

    res
      .status(200)
      .json({ message: "Top Rated Series List", data: { seriesList } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

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

    // get page and limit from query parameters
    let { page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

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
          availableForStreaming: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(400).json({ message: "data not available" });
      return;
    }

    res
      .status(200)
      .json({ message: "Latest Released Series List", data: { seriesList } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

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

    // get page and limit from query parameters
    let { page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    const seriesList = await Series.aggregate([
      {
        $match: {
          rating: { $gte: 7.5 },
          likes: { $gte: 10 },
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
          availableForStreaming: 1,
        },
      },
    ]);

    if (!seriesList || seriesList.length <= 0) {
      res.status(400).json({ message: "data not available" });
      return;
    }

    res
      .status(200)
      .json({ message: "Popular Series List", data: { seriesList } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const getSeriesListBySearch = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Admins only" });
      return;
    }

    // get page and limit from query parameters
    let { searchStr = "", page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    const searchRegExp = new RegExp(searchStr as string, "i");

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
          description: 1,
          rating: 1,
          poster: 1,
          casts: 1,
          directors: 1,
        },
      },
    ]);

    res.status(200).json({
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
    const { searchStr = "" } = req.params;
    let { page = "1", limit = "20" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }
    // validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    const searchRegExp = new RegExp(searchStr, "i");

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

    res.status(200).json({
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