import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import Movie from "../models/movie";
import Director from "../models/director";
import Cast from "../models/cast";
import { getMoviePayload } from "../utils/movieData"; // New validator
import { UploadedFile } from "express-fileupload";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import fs from "fs";

// Create a new movie (Admin only)---------------------------------------------------------------------------
export const createMovie = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    // Check if the user is an admin
    const user = req.user;
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // Validate fields and get payload
    const moviePayload = getMoviePayload(req.body);

    // Get poster, trailer, and movie files from request
    const posterFile = req?.files?.poster as UploadedFile;
    const trailerFile = req?.files?.trailer as UploadedFile;
    const movieFile = req?.files?.movieUrl as UploadedFile;

    // Check if poster, trailer, and movie files are present
    if (!trailerFile || !posterFile || !movieFile) {
      res.status(400).json({
        message: "Poster, trailer, and movie file are all required.",
      });
      return;
    }

    // Validate file types
    validateFileContent(posterFile.mimetype, "image");
    validateFileContent(trailerFile.mimetype, "video");
    validateFileContent(movieFile.mimetype, "video");

    // Upload files to cloudinary
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
      uploadImageToCloudinary(movieFile.tempFilePath, {
        folder: "movies",
        height: 800,
        quality: 500,
      }),
    ]);

    // Delete temporary files
    [posterFile, trailerFile, movieFile].forEach((file) => {
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });
    });

    // Get secure URLs
    const poster = result[0].secure_url;
    const trailerUrl = result[1].secure_url;
    const movieUrl = result[2].secure_url;

    // Validate URL generation
    if (!poster || !trailerUrl || !movieUrl) {
      res
        .status(500)
        .json({ message: "Something went wrong while generating URLs" });
      return;
    }

    // Add URLs to movie payload
    moviePayload.poster = poster;
    moviePayload.trailerUrl = trailerUrl;
    moviePayload.movieUrl = movieUrl;

    // Create and save new movie
    const newMovie = new Movie(moviePayload);
    await newMovie.save();
    const movieId = newMovie._id;

    res.status(201).json({
      message: "Movie created successfully",
      data: { movie: newMovie },
    });
  } catch (err) {
    res.status(500).json({
      message: (err as Error).message,
    });
  }
};

//getAll Movie ----------------------------------------------------------------------------------------------
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
        select: "name",
      })
      .populate({
        path: "director",
        select: "name",
      })
      .skip(skip)
      .limit(limit)
      .sort({ releaseDate: -1 });

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
        return {
          _id: movie._id,
          title: movie.title,
          description: movie.description,
          rating: movie.rating,
          poster: movie.poster,
          languges: movie.languages,
          genres: movie.genres,
          releaseDate: movie.releaseDate,
        };
      }
    });

    res.status(200).json({
      metadata: {
        totalMovies,
        currentPage: page,
        totalPages: Math.ceil(totalMovies / limit),
      },
      data: { movies: formattedMovies },
    });
  } catch (err) {
    res.status(500).json({
      message: (err as Error).message,
    });
  }
};

// Get a Movie by Id ----------------------------------------------------------------------------------------
export const getMovieById = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { id } = req.params;

    // Find movie by ID and populate related fields
    const movie = await Movie.findById(id)
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

    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.status(200).json({ data: { movie } });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
    });
  }
};

//Update Movie by Id (Admin only)----------------------------------------------------------------------------
export const updateMovieById = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Find and update the movie
    const updatedMovie = await Movie.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate({
        path: "cast.castId",
        select: "name",
      })
      .populate({
        path: "director",
        select: "name",
      });

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.status(200).json({
      message: "Movie updated successfully",
      data: { movie: updatedMovie },
    });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
    });
  }
};

// Delete movie by Id (Admin only)---------------------------------------------------------------------------
export const deleteMovieById = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const { id } = req.params;

    // Check if user is admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Find the movie before deleting to get associated cast and directors
    const movie = await Movie.findById(id);
    if (!movie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    // Delete the movie
    await Movie.findByIdAndDelete(id);

    // Remove the movie ID from the casts' movie lists
    await Cast.updateMany(
      { _id: { $in: (movie.cast || []).map((member) => member) } },
      { $pull: { movies: id } }
    );

    // Remove the movie ID from the directors' movie lists
    await Director.updateMany(
      { _id: { $in: movie.director } },
      { $pull: { movies: id } }
    );

    return res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
    });
  }
};

// Filter Movies by Genre---------------------------------------------------------------------------
export const getMoviesByGenre = async (
  req: AuthRequest,
  res: Response
): Promise<String | any> => {
  try {
    const { genre } = req.query;

    if (!genre) {
      return res.status(400).json({ message: "Genre parameter is required." });
    }

    const genreNumber = Number(genre);
    if (isNaN(genreNumber)) {
      return res.status(400).json({ message: "Genre must be a valid number." });
    }

    const movies = await Movie.find({ genres: genreNumber })
      .populate({
        path: "cast.castId",
        select: "name",
      })
      .populate({
        path: "director",
        select: "name",
      });

    if (movies.length === 0) {
      return res
        .status(404)
        .json({ message: "No movies found for this genre." });
    }

    const formattedMovies = movies.map((movie) => ({
      _id: movie._id,
      title: movie.title,
      description: movie.description,
      rating: movie.rating,
      poster: movie.poster,
      languages: movie.languages,
      genres: movie.genres,
      releaseDate: movie.releaseDate,
    }));

    res.status(200).json({ data: { movies: formattedMovies } });
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
  }
};

// //Top Rated Movies---------------------------------------------------------------------------
// export const getTopRatedMovies = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     const page = parseInt((req.query.page as string) || "1", 10);
//     const limit = parseInt((req.query.limit as string) || "10", 10);
//     const skip = (page - 1) * limit;

//     const movies = await Movie.find()
//       .sort({ rating: -1 })
//       .select("title description rating poster languages genres releaseDate")
//       .skip(skip)
//       .limit(limit)
//       .populate({
//         path: "cast",
//         select: "name",
//       })
//       .populate({
//         path: "director",
//         select: "name",
//       });

//     if (movies.length === 0) {
//       return res.status(404).json({ message: "No top-rated movies found." });
//     }

//     res.status(200).json({
//       metadata: {
//         totalMovies: movies.length,
//         currentPage: page,
//         totalPages: Math.ceil(movies.length / limit),
//       },
//       data: { movies },
//     });
//   } catch (error) {
//     res.status(500).json({
//       message: (error as Error).message,
//     });
//   }
// };

//Movie view count---------------------------------------------------------------------------
export const incrementMovieView = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    if (!req.user || req.user.role == "admin") {
      return res
        .status(403)
        .json({ message: "Only view incremented for users" });
    }

    const { movieId } = req.params;

    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updatedMovie) {
      return res.status(404).json({ message: "Movie not found" });
    }

    return res.status(200).json({
      message: "View count updated",
      data: { viewCount: updatedMovie.views },
    });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
    });
  }
};

// // Get Latest Movies ----------------------------------------------------------------------------------------------
// export const getLatestMovies = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<any> => {
//   try {
//     const page = parseInt((req.query.page as string) || "1", 10);
//     const limit = parseInt((req.query.limit as string) || "10", 10);
//     const skip = (page - 1) * limit;

//     const movies = await Movie.find()
//       .sort({ releaseDate: -1 })
//       .select("title poster description rating cast director releaseDate")
//       .populate({ path: "cast", select: "name" })
//       .populate({ path: "director", select: "name" })
//       .skip(skip)
//       .limit(limit)
//       .populate({
//         path: "cast",
//         select: "name",
//       })
//       .populate({
//         path: "director",
//         select: "name",
//       });

//     if (movies.length === 0) {
//       return res.status(404).json({ message: "No top-rated movies found." });
//     }

//     res.status(200).json({
//       metadata: {
//         totalMovies: movies.length,
//         currentPage: page,
//         totalPages: Math.ceil(movies.length / limit),
//       },
//       data: { movies },
//     });
//   } catch (error) {
//     res.status(500).json({ message: (error as Error).message });
//   }
// };

//Search movies by title---------------------------------------------------------------------------
export const searchMoviesByTitle = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { query } = req.query;

    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Only for admin" });
    }

    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const skip = (page - 1) * limit;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    const movies = await Movie.find({
      title: { $regex: `${query}`, $options: "i" },
    })
      .select("title poster description rating cast director")
      .populate({ path: "cast", select: "name" })
      .populate({ path: "director", select: "name" })
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      metadata: {
        totalMovies: movies.length,
        currentPage: page,
        totalPages: Math.ceil(movies.length / limit),
      },
      data: movies,
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

//Top rated movies---------------------------------------------------------------------------
export const getTopRatedMovies = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    // Get page and limit from query parameters
    let { page = "1", limit = "10" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    // Validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }

    // Validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    // Calculate the number for skip docs
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    const moviesList = await Movie.aggregate([
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
          duration: 1,
        },
      },
    ]);

    if (!moviesList || moviesList.length <= 0) {
      res.status(400).json({ message: "Data not available" });
      return;
    }

    res
      .status(200)
      .json({ message: "Top Rated Movies List", data: { moviesList } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

//Get Latest Movies---------------------------------------------------------------------------
export const getLatestReleasedMovies = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    let { page = "1", limit = "10" } = req.query;

    // Convert parameters to numbers
    const pageNumber: number = parseInt(page as string, 10);
    const limitNumber: number = parseInt(limit as string, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (≥1)" });
      return;
    }

    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    const skipDocNumber = (pageNumber - 1) * limitNumber;

    const moviesList = await Movie.aggregate([
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
          duration: 1,
        },
      },
    ]);

    if (!moviesList || moviesList.length <= 0) {
      res.status(400).json({ message: "Data not available" });
      return;
    }

    res
      .status(200)
      .json({ message: "Latest Released Movies List", data: { moviesList } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};
