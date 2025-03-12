import { Response } from "express";
import { AuthRequest } from "../types/api";
import Movie from "../models/movie";
import { getMoviePayload, getEditMoviePayload } from "../utils/movieData"; // New validator
import { UploadedFile } from "express-fileupload";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import fs from "fs";
import Like from "../models/like";

// Create a new movie (Admin only)done---------------------------------------------------------------------------
export const createMovie = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
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
    const movieFile = req?.files?.movie as UploadedFile;

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

    res.status(201).json({
      message: "Movie created successfully",
    });
  } catch (err) {
    res.status(500).json({
      message: (err as Error).message,
    });
  }
};

//getAll Movie ----------------------------------------------------------------------------------------------
export const getAllMovies = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const skip = (page - 1) * limit;

    // Fetching movies with important fields
    const movies = await Movie.find({})
      .populate({
        path: "cast",
        select: "name",
      })
      .populate({
        path: "director",
        select: "name",
      })
      .skip(skip)
      .limit(limit)
      .sort({ releaseDate: -1 });

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

    const totalMovies = await Movie.countDocuments();
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
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

// Get a Movie by Iddone ----------------------------------------------------------------------------------------
export const getMovieById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    const { movieId } = req.params;

    // Find movie by ID and populate related fields
    const movie = await Movie.findById(movieId)
      .populate({
        path: "cast",
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
      res.status(404).json({ message: "Movie not found" });
      return;
    }

    const isLiked = await Like.findOne({
      userId: req.user?._id.toString(),
      contentId: movieId,
      contentType: "Movie",
    });

    movie.isLiked = isLiked ? true : false;

    res.status(200).json({ message: `${movie.title} data`, data: { movie } });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

//Update Movie by Id (Admin only)done----------------------------------------------------------------------------
export const updateMovieById = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;
    const { movieId } = req.body;

    // Check if user is admin
    if (user?.role !== "admin") {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }
    // Find the movie by id
    const movie = await Movie.findById(movieId);

    // Ensure that movie exists
    if (!movie) {
      res.status(404).json({ message: "Movie not found" });
      return;
    }

    // Validate reqData and get editMoviePayload
    const editMoviePayload = getEditMoviePayload(req.body);

    // Get poster & trailer file from req
    const posterFile = req?.files?.poster as UploadedFile;
    const trailerFile = req?.files?.trailer as UploadedFile;
    const movieFile = req?.files?.movie as UploadedFile;

    // Upload poster to cloudinary
    if (posterFile) {
      // Validating file type
      validateFileContent(posterFile.mimetype, "image");

      // Uploading image to cloudinary
      const result = await uploadImageToCloudinary(posterFile.tempFilePath, {
        folder: "posters",
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(posterFile.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });

      // Get secureURL after uploading successfully
      const poster = result?.secure_url ?? null;

      // If poster URL not present then send Error
      if (!poster) {
        res.status(500).json({
          message: "Something went wrong while generating URL of poster",
        });
        return;
      }

      // Adding URL to moviePayload
      editMoviePayload.poster = poster;
    }

    // Upload trailer to cloudinary
    if (trailerFile) {
      // Validating file type
      validateFileContent(trailerFile.mimetype, "video");

      // Uploading video to cloudinary
      const result = await uploadImageToCloudinary(trailerFile.tempFilePath, {
        folder: "trailers",
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(trailerFile.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });

      // Get secureURL after uploading successfully
      const trailerUrl = result?.secure_url ?? null;

      // If trailer URL not present then send Error
      if (!trailerUrl) {
        res.status(500).json({
          message: "Something went wrong while generating URL of trailer",
        });
        return;
      }

      // Adding URL to moviePayload
      editMoviePayload.trailerUrl = trailerUrl;
    }

    // Upload Movie to cloudinary
    if (movieFile) {
      // Validating file type
      validateFileContent(movieFile.mimetype, "video");

      // Uploading video to cloudinary
      const result = await uploadImageToCloudinary(movieFile.tempFilePath, {
        folder: "movies",
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(movieFile.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });

      // Get secureURL after uploading successfully
      const movieUrl = result?.secure_url ?? null;

      // If movie URL not present then send Error
      if (!movieUrl) {
        res.status(500).json({
          message: "Something went wrong while generating URL of movie",
        });
        return;
      }

      // Adding URL to moviePayload
      editMoviePayload.movieUrl = movieUrl;
    }

    // If editMoviePayload is empty then send error
    if (Object.keys(editMoviePayload).length <= 0) {
      res.status(400).json({
        message: "At least one field is required to update movie info.",
      });
      return;
    }

    // Update existing movie document
    Object.assign(movie, editMoviePayload);

    // Save updated document
    await movie.save();

    // Populate the fields for the response
    await movie.populate([
      {
        path: "cast",
        select: "name",
      },
      {
        path: "director",
        select: "name",
      },
    ]);

    res.status(200).json({
      message: "Movie updated successfully",
      data: { movie },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

// Delete movie by Id (Admin only)done---------------------------------------------------------------------------
export const deleteMovieById = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const user = req.user;
    const { movieId } = req.query;

    // Check if user is admin
    if (user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    // Delete the movie
    const deletedMovie = await Movie.findOneAndDelete({ _id: movieId });

    if (!deletedMovie) {
      return res
        .status(404)
        .json({ message: "Movie not found or invalid MovieId" });
    }

    return res.status(200).json({ message: "Movie deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: (error as Error).message,
    });
  }
};

// Filter Movies by Genre done---------------------------------------------------------------------------
export const getMoviesByGenre = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
    }

    const { genre } = req.params;

    if (!genre) {
      res.status(400).json({ message: "Genre parameter is required." });
      return;
    }

    // Convert parameters to numbers
    const genreNumber: number = parseInt(genre as string, 10);
    const pageNumber: number = parseInt((req.query.page as string) || "1", 10);
    const limitNumber: number = parseInt(
      (req.query.limit as string) || "10",
      10
    );
    const skipDocNumber = (pageNumber - 1) * limitNumber;

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

    // applying aggregation on movie collection
    const movieData = await Movie.aggregate([
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

    // if moviweData is empty then send error of invalid genreId
    if (!movieData || movieData.length <= 0) {
      res
        .status(400)
        .json({ message: "no Movies available with given genreId" });
      return;
    }

    const totalMovies = await Movie.countDocuments({ genres: genreNumber });
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMovies / limitNumber),
      },
      message: "list of Movies",
      data: { moviesList: movieData },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
  }
};

//Movie view count---------------------------------------------------------------------------
export const incrementMovieView = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user || req.user.role == "admin") {
      res.status(403).json({ message: "Only view incremented for users" });
      return;
    }

    const { movieId } = req.params;

    const updatedMovie = await Movie.findByIdAndUpdate(
      movieId,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!updatedMovie) {
      res.status(404).json({ message: "Movie not found" });
      return;
    }

    res.status(200).json({
      message: "View count updated",
      data: { views: updatedMovie.views },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

// Get Most Viewed Movies List----------------------------------------------------------------------
export const getMostViewedMoviesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    const pageNumber: number = parseInt((req.query.page as string) || "1", 10);
    const limitNumber: number = parseInt(
      (req.query.limit as string) || "10",
      10
    );
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    // Validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (>0)" });
      return;
    }

    // Validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    const moviesList = await Movie.aggregate([
      {
        $sort: {
          views: -1,
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

    const totalMovies = await Movie.countDocuments();
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMovies / limitNumber),
      },
      message: "Most Viewed Movies List",
      data: { moviesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get Most Liked Movies List------------------------------------------------------------
export const getMostLikedMoviesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user exists or not
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    const pageNumber: number = parseInt((req.query.page as string) || "1", 10);
    const limitNumber: number = parseInt(
      (req.query.limit as string) || "10",
      10
    );
    const skipDocNumber = (pageNumber - 1) * limitNumber;

    // Validating pageNumber
    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (>0)" });
      return;
    }

    // Validating limitNumber
    if (isNaN(limitNumber) || limitNumber < 1 || limitNumber > 100) {
      res
        .status(400)
        .json({ message: "Limit must be a positive integer (1-100)" });
      return;
    }

    const moviesList = await Movie.aggregate([
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
          duration: 1,
        },
      },
    ]);

    if (!moviesList || moviesList.length <= 0) {
      res.status(400).json({ message: "Data not available" });
      return;
    }

    const totalMovies = await Movie.countDocuments();
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMovies / limitNumber),
      },
      message: "Most Liked Movies List",
      data: { moviesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

//Search movies by title---------------------------------------------------------------------------
export const searchMoviesByTitle = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    if (!req.user || req.user.role !== "admin") {
      res.status(403).json({ message: "Only for admin" });
      return;
    }

    const page = parseInt((req.query.page as string) || "1", 10);
    const limit = parseInt((req.query.limit as string) || "10", 10);
    const skip = (page - 1) * limit;

    if (!query || typeof query !== "string") {
      res.status(400).json({ message: "Query parameter is required" });
      return;
    }

    const movies = await Movie.find({
      title: { $regex: `${query}`, $options: "i" },
    })
      .select("title poster description rating cast director")
      .populate({ path: "cast", select: "name" })
      .populate({ path: "director", select: "name" })
      .skip(skip)
      .limit(limit);

    const totalMovies = await Movie.countDocuments({
      title: { $regex: `${query}`, $options: "i" },
    });
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
        currentPage: page,
        totalPages: Math.ceil(totalMovies / limit),
      },
      data: movies,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
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

    const pageNumber: number = parseInt((req.query.page as string) || "1", 10);
    const limitNumber: number = parseInt(
      (req.query.limit as string) || "10",
      10
    );
    const skipDocNumber = (pageNumber - 1) * limitNumber;

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

    const totalMovies = await Movie.countDocuments();
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMovies / limitNumber),
      },
      message: "Top Rated Movies List",
      data: { moviesList },
    });
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

    const pageNumber: number = parseInt((req.query.page as string) || "1", 10);
    const limitNumber: number = parseInt(
      (req.query.limit as string) || "10",
      10
    );

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

    const totalMovies = await Movie.countDocuments();
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMovies / limitNumber),
      },
      message: "Latest Released Movies List",
      data: { moviesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

//Popular Movies--------------------------------------------------------------------------------
export const getPopularMoviesList = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(400).json({ message: "Access denied, Please login" });
      return;
    }

    const pageNumber: number = parseInt((req.query.page as string) || "1", 10);
    const limitNumber: number = parseInt(
      (req.query.limit as string) || "10",
      10
    );

    if (isNaN(pageNumber) || pageNumber < 1) {
      res.status(400).json({ message: "Page must be a positive integer (>0)" });
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
          likes: 1,
          poster: 1,
          duration: 1,
          availableForStreaming: 1,
        },
      },
    ]);

    if (!moviesList || moviesList.length <= 0) {
      res.status(400).json({ message: "Data not available" });
      return;
    }

    const totalMovies = await Movie.countDocuments();
    res.status(200).json({
      metadata: {
        totalMovies: totalMovies,
        currentPage: pageNumber,
        totalPages: Math.ceil(totalMovies / limitNumber),
      },
      message: "Popular Movies List",
      data: { moviesList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};
