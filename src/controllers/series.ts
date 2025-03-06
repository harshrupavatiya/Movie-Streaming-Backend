import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import Series from "../models/series";
import { getEditSeriesPayload, getSeriesPayload } from "../utils/seriesData";
import { UploadedFile } from "express-fileupload";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import fs from "fs";
import { isNumeric } from "validator";
import Episode from "../models/episode";

// // Create Series (Admin only)---------------------------------------------------------------------------
// export const createSeries = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     // Check if the user is an admin
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ message: "Access denied. Admins only." });
//     }

//     const {
//       title,
//       description,
//       releaseDate,
//       genres,
//       rating,
//       cast,
//       director,
//       poster,
//       trailerUrl,
//       availableForStreaming,
//       seasons,
//     } = req.body;

//     // Validate required fields
//     if (!title || !poster || !cast || !director) {
//       return res.status(400).json({
//         message: "Missing required fields: title, poster, cast, or director.",
//       });
//     }

//     // Validate cast members
//     if (!Array.isArray(cast) || cast.length === 0) {
//       return res.status(400).json({ message: "Cast list cannot be empty." });
//     }

//     // Validate each cast member
//     for (const member of cast) {
//       if (!member.castId || !member.roleName) {
//         return res.status(400).json({
//           message: "Each cast member must have a castId and roleName.",
//         });
//       }
//     }

//     // // Validate genres (ensure it's an array of numbers)
//     if (!Array.isArray(genres) || genres.some((g) => typeof g !== "number")) {
//       return res
//         .status(400)
//         .json({ message: "Genres must be an array of numbers." });
//     }

//     // Create a new series
//     const newSeries = new Series({
//       title,
//       description,
//       releaseDate,
//       genres,
//       rating,
//       cast,
//       director,
//       poster,
//       trailerUrl,
//       availableForStreaming,
//       seasons,
//     });

//     await newSeries.save();
//     const seriesId = newSeries._id;

//     // Update Cast members by adding the new series ID
//     await Cast.updateMany(
//       { _id: { $in: cast.map((member) => member.castId) } },
//       { $push: { series: seriesId } }
//     );

//     // Update Director(s) by adding the new series ID
//     await Director.updateMany(
//       { _id: { $in: director } },
//       { $push: { series: seriesId } }
//     );

//     res.status(201).json({
//       message: "Series created successfully",
//       series: newSeries,
//     });
//   } catch (err) {
//     res.status(500).json({
//       message: "Internal server error",
//       error: (err as Error).message,
//     });
//   }
// };

// // Get All series---------------------------------------------------------------------------------------
// export const getAllSeries = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     const { genre, title, page = "1", limit = "10" } = req.query;

//     let filter: any = {};

//     // Filter by genre
//     if (typeof genre === "string") {
//       filter.genre = { $in: genre.split(",").map(Number) };
//     }

//     // Search by title (case-insensitive)
//     if (title) {
//       filter.title = { $regex: title, $options: "i" };
//     }

//     // Pagination
//     const pageNum = Math.max(1, Number(page));
//     const pageSize = Math.max(1, Number(limit));
//     const skip = (pageNum - 1) * pageSize;

//     const totalSeries = await Series.countDocuments(filter);
//     const series = await Series.find(filter)
//       .populate({
//         path: "cast.castId",
//         select: "name",
//       })
//       .populate({
//         path: "director",
//         select: "name",
//       })
//       .skip(skip)
//       .limit(pageSize)
//       .sort({ releaseDate: -1 });

//     // Format response based on user role
//     const formattedSeries = series.map((series) => {
//       if (req.user?.role === "admin") {
//         return {
//           id: series._id,
//           title: series.title,
//           description: series.description,
//           rating: series.rating,
//           poster: series.poster,
//           cast: series.cast,
//           director: series.director,
//         };
//       }
//       return series;
//     });

//     res.status(200).json({
//       success: true,
//       totalPages: Math.ceil(totalSeries / pageSize),
//       currentPage: pageNum,
//       totalSeries,
//       series: formattedSeries,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Get series by Id-------------------------------------------------------------------------------------
// export const getSeriesById = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     const { id } = req.params;

//     const series = await Series.findById(id)
//       .populate({
//         path: "cast.castId",
//         select: "name",
//       })
//       .populate({
//         path: "director",
//         select: "name",
//       })
//       .populate({
//         path: "reviews",
//         select: "userId rating comment",
//       });
//     if (!series) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Series not found" });
//     }

//     res.status(200).json({ success: true, series });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Update Series by Id----------------------------------------------------------------------------------
// export const updateSeriesById = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     const { id } = req.params;

//     // Check if the user is an admin
//     if (!req.user || req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ success: false, message: "Access denied. Admins only." });
//     }

//     const updateData = req.body;

//     // Validate genres (ensure it's an array of numbers)
//     if (updateData.genre && !Array.isArray(updateData.genre)) {
//       return res.status(400).json({
//         success: false,
//         message: "Genres must be an array of numbers.",
//       });
//     }

//     // Validate cast members if provided
//     if (updateData.cast) {
//       if (
//         !Array.isArray(updateData.cast) ||
//         updateData.cast.some(
//           (c: { castId: string; roleName: string }) => !c.castId || !c.roleName
//         )
//       ) {
//         return res.status(400).json({
//           success: false,
//           message: "Each cast member must have a castId and roleName.",
//         });
//       }
//     }

//     // Validate director if provided
//     if (updateData.director) {
//       return res
//         .status(400)
//         .json({ success: false, message: "Invalid director ID." });
//     }

//     // Update series
//     const updatedSeries = await Series.findByIdAndUpdate(id, updateData, {
//       new: true,
//     })
//       .populate({ path: "cast.castId", select: "name" })
//       .populate({ path: "director", select: "name" });

//     if (!updatedSeries) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Series not found" });
//     }

//     res.status(200).json({
//       success: true,
//       message: "Series updated successfully",
//       series: updatedSeries,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Add season to series---------------------------------------------------------------------------------
// export const addSeasonToSeries = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     const { id } = req.params;
//     const { seasonNumber, episodes } = req.body;

//     // Check if the user is an admin
//     if (!req.user || req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ success: false, message: "Access denied. Admins only." });
//     }

//     // Validate season number
//     if (!seasonNumber || typeof seasonNumber !== "number") {
//       return res.status(400).json({
//         success: false,
//         message: "Season number is required and must be a number.",
//       });
//     }

//     // Validate episodes array
//     if (
//       !Array.isArray(episodes) ||
//       episodes.some(
//         (ep) => !ep.title || !ep.duration || !ep.episodeNumber || !ep.episodeUrl
//       )
//     ) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Each episode must have title, duration, episodeNumber, and episodeUrl.",
//       });
//     }

//     // Check if the series exists
//     const series = await Series.findById(id);
//     if (!series) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Series not found." });
//     }

//     // Check if season already exists
//     const seasonExists = series.seasons.some(
//       (season) => season.seasonNumber === seasonNumber
//     );
//     if (seasonExists) {
//       return res.status(400).json({
//         success: false,
//         message: "Season number already exists for this series.",
//       });
//     }

//     // Add new season
//     series.seasons.push({
//       seasonNumber,
//       episodes,
//       _id: "",
//     });
//     await series.save();

//     res
//       .status(201)
//       .json({ success: true, message: "Season added successfully.", series });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Add episode in to specific season--------------------------------------------------------------------
// export const addEpisodeToSeason = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     const { seriesId, seasonId } = req.params;

//     // Check if the user is an admin
//     if (!req.user || req.user.role !== "admin") {
//       return res
//         .status(403)
//         .json({ success: false, message: "Access denied. Admins only." });
//     }

//     const {
//       title,
//       description,
//       duration,
//       episodeNumber,
//       episodeUrl,
//       releaseDate,
//     } = req.body;

//     // Validate required fields
//     if (!title || !duration || !episodeNumber || !episodeUrl) {
//       return res.status(400).json({
//         success: false,
//         message:
//           "Missing required fields: title, duration, episodeNumber, or episodeUrl.",
//       });
//     }

//     // Find the series
//     const series = await Series.findById(seriesId);
//     if (!series) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Series not found." });
//     }

//     // Find the season within the series
//     const season = series.seasons.find(
//       (season) => season._id.toString() === seasonId
//     );
//     if (!season) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Season not found." });
//     }

//     // Add new episode
//     const newEpisode = {
//       title,
//       description,
//       duration,
//       episodeNumber,
//       episodeUrl,
//       releaseDate,
//     };

//     season.episodes.push(newEpisode);
//     await series.save();

//     res.status(201).json({
//       success: true,
//       message: "Episode added successfully.",
//       episode: newEpisode,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Delete Series by ID (Admin Only)---------------------------------------------------------------------------------------
// export const deleteSeriesById = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     // Check if the user is an admin
//     if (!req.user || req.user.role !== "admin") {
//       return res.status(403).json({ message: "Access denied. Admins only." });
//     }

//     const { id } = req.params;

//     // Find the series to delete
//     const series = await Series.findById(id);
//     if (!series) {
//       return res.status(404).json({ message: "Series not found" });
//     }

//     // Remove the series ID from Cast members
//     await Cast.updateMany(
//       { _id: { $in: (series.cast || []).map((member) => member.castId) } },
//       { $pull: { series: id } }
//     );

//     // Remove the series ID from Director(s)
//     await Director.updateMany(
//       { _id: { $in: series.director } },
//       { $pull: { series: id } }
//     );

//     // Delete the series
//     await Series.findByIdAndDelete(id);

//     res.status(200).json({
//       success: true,
//       message: "Series deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Get All Episodes of a Season---------------------------------------------------------------------------------------
// export const getEpisodesBySeason = async (
//   req: Request,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     const { id, seasonNumber } = req.params;

//     // Find the series by ID
//     const series = await Series.findById(id);
//     if (!series) {
//       return res.status(404).json({ message: "Series not found" });
//     }

//     // Find the season based on seasonNumber
//     const season = series.seasons.find(
//       (s: any) => s.seasonNumber === Number(seasonNumber)
//     );

//     if (!season) {
//       return res.status(404).json({ message: "Season not found" });
//     }

//     res.status(200).json({
//       success: true,
//       seriesTitle: series.title,
//       seasonNumber: season.seasonNumber,
//       episodes: season.episodes, // Assuming each season contains an array of episodes
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Internal server error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Delete Season From Series---------------------------------------------------------------------------------------
// export const deleteSeasonFromSeries = async (
//   req: Request,
//   res: Response
// ): Promise<String | any> => {
//   try {
//     const { id, seasonNumber } = req.params;

//     // Find the series by ID
//     const series = await Series.findById(id);
//     if (!series) {
//       return res.status(404).json({ message: "Series not found" });
//     }

//     // Filter out the season to be deleted
//     const updatedSeasons = series.seasons.filter(
//       (s: any) => s.seasonNumber !== parseInt(seasonNumber)
//     );

//     // Check if the season was actually found and removed
//     if (updatedSeasons.length === series.seasons.length) {
//       res.status(404).json({ message: "Season not found in series" });
//       return;
//     }

//     // Update the series with the filtered seasons
//     series.seasons = updatedSeasons;
//     await series.save();

//     res.status(200).json({
//       success: true,
//       message: `Season ${seasonNumber} deleted successfully from series.`,
//       series,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal server error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Delete Episode From Season---------------------------------------------------------------------------------------
// export const deleteEpisodeFromSeason = async (
//   req: Request,
//   res: Response
// ): Promise<any> => {
//   try {
//     const { id, seasonNumber, episodeNumber } = req.params;

//     // Find the series by ID
//     const series = await Series.findById(id);
//     if (!series) {
//       return res.status(404).json({ message: "Series not found" });
//     }

//     // Find the specific season
//     const season = series.seasons.find(
//       (s: any) => s.seasonNumber === parseInt(seasonNumber)
//     );
//     if (!season) {
//       return res.status(404).json({ message: "Season not found" });
//     }

//     // Filter out the episode to be deleted
//     const updatedEpisodes = season.episodes.filter(
//       (e: any) => e.episodeNumber !== parseInt(episodeNumber)
//     );

//     // Check if the episode was actually found and removed
//     if (updatedEpisodes.length === season.episodes.length) {
//       return res.status(404).json({ message: "Episode not found in season" });
//     }

//     // Update the season with the filtered episodes
//     season.episodes = updatedEpisodes;
//     await series.save();

//     res.status(200).json({
//       success: true,
//       message: `Episode ${episodeNumber} deleted successfully from season ${seasonNumber}.`,
//       series,
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal server error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Search Series By Title---------------------------------------------------------------------------------------
// export const searchSeriesByTitle = async (
//   req: Request,
//   res: Response
// ): Promise<String | any> => {
//   try {
//     const { title } = req.query;

//     if (!title) {
//       return res
//         .status(400)
//         .json({ message: "Title query parameter is required" });
//     }

//     // Perform case-insensitive search using regex
//     const seriesList = await Series.find({
//       title: { $regex: title, $options: "i" },
//     });

//     if (seriesList.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No series found matching the title" });
//     }

//     res.status(200).json({ success: true, series: seriesList });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal server error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Filter Series By Genre---------------------------------------------------------------------------------------
// export const filterSeriesByGenre = async (
//   req: Request,
//   res: Response
// ): Promise<String | any> => {
//   try {
//     const { genre } = req.query; // Get genre from query params

//     if (!genre) {
//       return res.status(400).json({ message: "Genre ID is required" });
//     }

//     const genreId = Number(genre);
//     if (isNaN(genreId)) {
//       return res.status(400).json({ message: "Invalid Genre ID provided" });
//     }

//     // Find series that match exactly the given genre ID
//     const seriesList = await Series.find({ genres: genreId });

//     if (seriesList.length === 0) {
//       return res
//         .status(404)
//         .json({ message: "No series found for the given genre" });
//     }

//     res.status(200).json({ success: true, series: seriesList });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal server error",
//       error: (error as Error).message,
//     });
//   }
// };

// // Top Rated Series---------------------------------------------------------------------------------------
// export const getTopRatedSeries = async (
//   req: Request,
//   res: Response
// ): Promise<String | any> => {
//   try {
//     const topSeries = await Series.find()
//       .sort({ rating: -1 }) // Sort by rating (descending)
//       .limit(20); // Limit to 20 results

//     res.status(200).json({ success: true, series: topSeries });
//   } catch (error) {
//     res.status(500).json({
//       message: "Internal server error",
//       error: (error as Error).message,
//     });
//   }
// };

export const addSeries = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;

    // check user is admin
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
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
    }

    // get seriesId from URL query parameters
    const { seriesId } = req.query;

    // delete series
    const deletedSeries = await Series.findOneAndDelete({ _id: seriesId });

    if (!deletedSeries) {
      res.status(400).json({ message: "Series not found or invalid SeriesId" });
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

export const getTopRatedSeriesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
    }
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
    }
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
    }
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};
