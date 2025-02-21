import { Request, Response } from "express";
import Movie from "../models/movie";
import { AuthRequest } from "../types/api";

// Create a new movie (Admin only)
export const createMovie = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
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
      duration,
      rating,
      cast,
      director,
      poster,
      trailerUrl,
      movieUrl,
      availableForStreaming,
    } = req.body;

    // Validate required fields
    if (!title || !duration || !cast || !director) {
      return res.status(400).json({
        message: "Missing required fields: title, duration, cast, or director.",
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
    // Validate genres (ensure it's an array of numbers)
    if (!Array.isArray(genres) || genres.some((g) => typeof g !== "number")) {
      return res
        .status(400)
        .json({ message: "Genres must be an array of numbers." });
    }

    // Create a new movie
    const newMovie = new Movie({
      title,
      description,
      releaseDate,
      genres,
      duration,
      rating,
      cast,
      director,
      poster,
      trailerUrl,
      movieUrl,
      availableForStreaming,
    });
    await newMovie.save();

    res
      .status(201)
      .json({ message: "Movie created successfully", movie: newMovie });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};

//getAll Movie
export const getAllMovies = async (req: AuthRequest, res: Response) => {
  try {
    // Default values for pagination
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const skip = (page - 1) * limit;

    // Fetching movies with important fields
    const movies = await Movie.find({})
      .populate({
        path: "cast.castId",
        select: "name", // Fetch only the name of the cast member
      })
      .populate({
        path: "director",
        select: "name"
      })
      .skip(skip)
      .limit(limit)
      .sort({ releaseDate: -1 })
      .exec(); 

    // Total movies count
    const totalMovies = await Movie.countDocuments();

    // Check user role (if authenticated)
    const isAdmin = req.user && req.user.role === "admin";

    // Modify response based on role
    const formattedMovies = movies.map((movie) => {
      if (isAdmin) {
        // Admin sees only specific fields
        return {
          _id: movie._id,
          title: movie.title,
          description: movie.description,
          rating: movie.rating,
          poster: movie.poster,
          cast: movie.cast,
          director: movie.director,
        };
      } else {
        // Normal user sees all movie details
        return movie;
      }
    });

    res.status(200).json({
      metadata: {
        totalMovies,
        currentPage: page,
        totalPages: Math.ceil(totalMovies / limit),
      },
      movies: formattedMovies,
    });
  } catch (err) {
    res.status(500).json({
      message: "Internal server error",
      error: (err as Error).message,
    });
  }
};
