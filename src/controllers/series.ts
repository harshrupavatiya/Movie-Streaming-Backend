import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import Series from "../models/series";
import Cast from "../models/cast";
import Director from "../models/director";

// Create Series (Admin only)---------------------------------------------------------------------------
export const createSeries = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const {
      title,
      description,
      releaseDate,
      genres,
      rating,
      cast,
      director,
      poster,
      trailerUrl,
      availableForStreaming,
      seasons,
    } = req.body;

    // Validate required fields
    if (!title || !poster || !cast || !director) {
      return res.status(400).json({
        message: "Missing required fields: title, poster, cast, or director.",
      });
    }

    // Validate cast members
    if (!Array.isArray(cast) || cast.length === 0) {
      return res.status(400).json({ message: "Cast list cannot be empty." });
    }

    // Validate each cast member
    for (const member of cast) {
      if (!member.castId || !member.roleName) {
        return res.status(400).json({
          message: "Each cast member must have a castId and roleName.",
        });
      }
    }

    // // Validate genres (ensure it's an array of numbers)
    if (!Array.isArray(genres) || genres.some((g) => typeof g !== "number")) {
      return res
        .status(400)
        .json({ message: "Genres must be an array of numbers." });
    }

    // Create a new series
    const newSeries = new Series({
      title,
      description,
      releaseDate,
      genres,
      rating,
      cast,
      director,
      poster,
      trailerUrl,
      availableForStreaming,
      seasons,
    });

    await newSeries.save();
    const seriesId = newSeries._id;

    // Update Cast members by adding the new series ID
    await Cast.updateMany(
      { _id: { $in: cast.map((member) => member.castId) } },
      { $push: { series: seriesId } }
    );

    // Update Director(s) by adding the new series ID
    await Director.updateMany(
      { _id: { $in: director } },
      { $push: { series: seriesId } }
    );

    res.status(201).json({
      message: "Series created successfully",
      series: newSeries,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

// Get All series---------------------------------------------------------------------------------------
export const getAllSeries = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { genre, title, page = "1", limit = "10" } = req.query;

    let filter: any = {};

    // Filter by genre
    if (typeof genre === "string") {
      filter.genre = { $in: genre.split(",").map(Number) };
    }

    // Search by title (case-insensitive)
    if (title) {
      filter.title = { $regex: title, $options: "i" };
    }

    // Pagination
    const pageNum = Math.max(1, Number(page));
    const pageSize = Math.max(1, Number(limit));
    const skip = (pageNum - 1) * pageSize;

    const totalSeries = await Series.countDocuments(filter);
    const series = await Series.find(filter)
      .populate({
        path: "cast.castId",
        select: "name",
      })
      .populate({
        path: "director",
        select: "name",
      })
      .skip(skip)
      .limit(pageSize)
      .sort({ releaseDate: -1 });

    // Format response based on user role
    const formattedSeries = series.map((series) => {
      if (req.user?.role === "admin") {
        return {
          id: series._id,
          title: series.title,
          description: series.description,
          rating: series.rating,
          poster: series.poster,
          cast: series.cast,
          director: series.director,
        };
      }
      return series;
    });

    res.status(200).json({
      success: true,
      totalPages: Math.ceil(totalSeries / pageSize),
      currentPage: pageNum,
      totalSeries,
      series: formattedSeries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
};

// Get series by Id-------------------------------------------------------------------------------------
export const getSeriesById = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { id } = req.params;

    const series = await Series.findById(id)
      .populate({
        path: "cast.castId",
        select: "name",
      })
      .populate({
        path: "director",
        select: "name",
      })
      .populate({
        path: "reviews",
        select: "userId rating comment",
      });
    if (!series) {
      return res
        .status(404)
        .json({ success: false, message: "Series not found" });
    }

    res.status(200).json({ success: true, series });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
};

// Update Series by Id----------------------------------------------------------------------------------
export const updateSeriesById = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { id } = req.params;

    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    const updateData = req.body;

    // Validate genres (ensure it's an array of numbers)
    if (updateData.genre && !Array.isArray(updateData.genre)) {
      return res.status(400).json({
        success: false,
        message: "Genres must be an array of numbers.",
      });
    }

    // Validate cast members if provided
    if (updateData.cast) {
      if (
        !Array.isArray(updateData.cast) ||
        updateData.cast.some(
          (c: { castId: string; roleName: string }) => !c.castId || !c.roleName
        )
      ) {
        return res.status(400).json({
          success: false,
          message: "Each cast member must have a castId and roleName.",
        });
      }
    }

    // Validate director if provided
    if (updateData.director) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid director ID." });
    }

    // Update series
    const updatedSeries = await Series.findByIdAndUpdate(id, updateData, {
      new: true,
    })
      .populate({ path: "cast.castId", select: "name" })
      .populate({ path: "director", select: "name" });

    if (!updatedSeries) {
      return res
        .status(404)
        .json({ success: false, message: "Series not found" });
    }

    res.status(200).json({
      success: true,
      message: "Series updated successfully",
      series: updatedSeries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
};

// Add season to series---------------------------------------------------------------------------------
export const addSeasonToSeries = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { id } = req.params;
    const { seasonNumber, episodes } = req.body;

    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    // Validate season number
    if (!seasonNumber || typeof seasonNumber !== "number") {
      return res.status(400).json({
        success: false,
        message: "Season number is required and must be a number.",
      });
    }

    // Validate episodes array
    if (
      !Array.isArray(episodes) ||
      episodes.some(
        (ep) => !ep.title || !ep.duration || !ep.episodeNumber || !ep.episodeUrl
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Each episode must have title, duration, episodeNumber, and episodeUrl.",
      });
    }

    // Check if the series exists
    const series = await Series.findById(id);
    if (!series) {
      return res
        .status(404)
        .json({ success: false, message: "Series not found." });
    }

    // Check if season already exists
    const seasonExists = series.seasons.some(
      (season) => season.seasonNumber === seasonNumber
    );
    if (seasonExists) {
      return res.status(400).json({
        success: false,
        message: "Season number already exists for this series.",
      });
    }

    // Add new season
    series.seasons.push({
      seasonNumber,
      episodes,
      _id: "",
    });
    await series.save();

    res
      .status(201)
      .json({ success: true, message: "Season added successfully.", series });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
};

// Add episode in to specific season--------------------------------------------------------------------
export const addEpisodeToSeason = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { seriesId, seasonId } = req.params;

    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. Admins only." });
    }

    const {
      title,
      description,
      duration,
      episodeNumber,
      episodeUrl,
      releaseDate,
    } = req.body;

    // Validate required fields
    if (!title || !duration || !episodeNumber || !episodeUrl) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: title, duration, episodeNumber, or episodeUrl.",
      });
    }

    // Find the series
    const series = await Series.findById(seriesId);
    if (!series) {
      return res
        .status(404)
        .json({ success: false, message: "Series not found." });
    }

    // Find the season within the series
    const season = series.seasons.find(
      (season) => season._id.toString() === seasonId
    );
    if (!season) {
      return res
        .status(404)
        .json({ success: false, message: "Season not found." });
    }

    // Add new episode
    const newEpisode = {
      title,
      description,
      duration,
      episodeNumber,
      episodeUrl,
      releaseDate,
    };

    season.episodes.push(newEpisode);
    await series.save();

    res.status(201).json({
      success: true,
      message: "Episode added successfully.",
      episode: newEpisode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: (error as Error).message,
    });
  }
};

// Delete Series by ID (Admin Only)---------------------------------------------------------------------
export const deleteSeriesById = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { id } = req.params;

    // Find the series to delete
    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Remove the series ID from Cast members
    await Cast.updateMany(
      { _id: { $in: (series.cast || []).map((member) => member.castId) } },
      { $pull: { series: id } }
    );

    // Remove the series ID from Director(s)
    await Director.updateMany(
      { _id: { $in: series.director } },
      { $pull: { series: id } }
    );

    // Delete the series
    await Series.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Series deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get All Episodes of a Season-------------------------------------------------------------------------
export const getEpisodesBySeason = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { id, seasonNumber } = req.params;

    // Find the series by ID
    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Find the season based on seasonNumber
    const season = series.seasons.find(
      (s: any) => s.seasonNumber === Number(seasonNumber)
    );

    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    res.status(200).json({
      success: true,
      seriesTitle: series.title,
      seasonNumber: season.seasonNumber,
      episodes: season.episodes, // Assuming each season contains an array of episodes
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Delete Season From Series----------------------------------------------------------------------------
export const deleteSeasonFromSeries = async (
  req: AuthRequest,
  res: Response
): Promise<String | any> => {
  try {
    const { id, seasonNumber } = req.params;

    // Find the series by ID
    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Filter out the season to be deleted
    const updatedSeasons = series.seasons.filter(
      (s: any) => s.seasonNumber !== parseInt(seasonNumber)
    );

    // Check if the season was actually found and removed
    if (updatedSeasons.length === series.seasons.length) {
      return res.status(404).json({ message: "Season not found in series" });
    }

    // Update the series with the filtered seasons
    series.seasons = updatedSeasons;
    await series.save();

    res.status(200).json({
      success: true,
      message: `Season ${seasonNumber} deleted successfully from series.`,
      series,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Delete Episode From Season---------------------------------------------------------------------------
export const deleteEpisodeFromSeason = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { id, seasonNumber, episodeNumber } = req.params;

    // Find the series by ID
    const series = await Series.findById(id);
    if (!series) {
      return res.status(404).json({ message: "Series not found" });
    }

    // Find the specific season
    const season = series.seasons.find(
      (s: any) => s.seasonNumber === parseInt(seasonNumber)
    );
    if (!season) {
      return res.status(404).json({ message: "Season not found" });
    }

    // Filter out the episode to be deleted
    const updatedEpisodes = season.episodes.filter(
      (e: any) => e.episodeNumber !== parseInt(episodeNumber)
    );

    // Check if the episode was actually found and removed
    if (updatedEpisodes.length === season.episodes.length) {
      return res.status(404).json({ message: "Episode not found in season" });
    }

    // Update the season with the filtered episodes
    season.episodes = updatedEpisodes;
    await series.save();

    res.status(200).json({
      success: true,
      message: `Episode ${episodeNumber} deleted successfully from season ${seasonNumber}.`,
      series,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Filter Series By Genre-------------------------------------------------------------------------------
export const filterSeriesByGenre = async (
  req: AuthRequest,
  res: Response
): Promise<String | any> => {
  try {
    const { genre } = req.query; // Get genre from query params

    if (!genre) {
      return res.status(400).json({ message: "Genre ID is required" });
    }

    const genreId = Number(genre);
    if (isNaN(genreId)) {
      return res.status(400).json({ message: "Invalid Genre ID provided" });
    }

    // Find series that match exactly the given genre ID
    const seriesList = await Series.find({ genres: genreId });

    if (seriesList.length === 0) {
      return res
        .status(404)
        .json({ message: "No series found for the given genre" });
    }

    res.status(200).json({ success: true, series: seriesList });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Top Rated Series-------------------------------------------------------------------------------------
export const getTopRatedSeries = async (
  req: AuthRequest,
  res: Response
): Promise<String | any> => {
  try {
    const topSeries = await Series.find()
      .sort({ rating: -1 }) // Sort by rating (descending)
      .limit(20);

    if (topSeries.length === 0) {
      return res.status(404).json({ message: "No top-rated series found" });
    }

    res.status(200).json({ success: true, series: topSeries });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};