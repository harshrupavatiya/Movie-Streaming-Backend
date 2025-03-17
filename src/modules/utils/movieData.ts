import mongoose from "mongoose";
import { IMovie } from "../../types/db.model";
import {
  isValidISODate,
  validateContentTitle,
  validateGenres,
  validateLanguage,
} from "../user/inputValidators";
import { isMongoId, isNumeric } from "validator";

interface IMovieData {
  title: string;
  description?: string;
  genres: string[];
  languages: string[];
  releaseDate: string;
  duration: string;
  rating?: string;
  casts?: string[];
  directors?: string[];
  availableForStreaming?: boolean;
}

export const getMoviePayload = (reqBody: IMovieData): Partial<IMovie> => {
  (["casts","languages", "genres", "directors"] as Array<keyof Pick<IMovieData, "casts" | "languages" | "genres" | "directors">>).forEach((key) => {
    const value = reqBody[key];

    if (value && !Array.isArray(value)) {
      reqBody[key] = [value as string];
    }
  });
  
  const {
    title,
    description,
    genres,
    languages,
    releaseDate,
    duration,
    rating,
    casts,
    directors,
    availableForStreaming,
  } = reqBody;

  const newPayload: Partial<IMovie> = {};

  validateContentTitle(title);
  newPayload.title = title;

  if (description) {
    if (description.length > 400 || typeof description !== "string") {
      throw new Error("Description should be a string within 400 characters.");
    }
    newPayload.description = description;
  }

  validateGenres(genres);
  newPayload.genres = genres.map(genre => parseInt(genre));

  validateLanguage(languages);
  newPayload.languages = languages;

  isValidISODate(releaseDate);
  newPayload.releaseDate = new Date(releaseDate);

  if (!duration  || !isNumeric(duration)) {
    throw new Error("Duration must be a numeric value");
  }
  newPayload.duration = parseInt(duration);

  if (rating) {
    if (!isNumeric(rating) || parseFloat(rating) > 10 || parseFloat(rating) < 0) {
      throw new Error("Rating should be a number between 0 and 10");
    }
    newPayload.rating = parseFloat(rating);
  }

  if (casts && casts.length > 0) {
    const isCastId = casts.every(cast => isMongoId(cast.toString()));
    if (!isCastId) {
      throw new Error("Cast object Id are not valid");
    }
    newPayload.cast = casts.map(cast => new mongoose.Types.ObjectId(cast));
  }
  if (directors && directors.length > 0) {
    const isDirId = directors.every(director => isMongoId(director.toString()));
    if (!isDirId) {
      throw new Error("Director object ids are invalid");
    }
    newPayload.director = directors.map(dir => new mongoose.Types.ObjectId(dir));
  }
  
  newPayload.availableForStreaming = availableForStreaming || true;
  
  return newPayload;
};

export const getEditMoviePayload = (reqBody: Partial<IMovieData>): Partial<IMovie> => {
  (["casts","languages", "genres", "director"] as Array<keyof Pick<IMovieData, "casts" | "languages" | "genres" | "directors">>).forEach((key) => {
    const value = reqBody[key];

    if (value && !Array.isArray(value)) {
      reqBody[key] = [value as string];
    }
  });
  
  const {
    title,
    description,
    genres,
    languages,
    releaseDate,
    duration,
    rating,
    casts,
    directors,
    availableForStreaming,
  } = reqBody;

  const newPayload: Partial<IMovie> = {};

  // Validate and set optional fields
  if (title) {
    validateContentTitle(title);
    newPayload.title = title;
  }

  if (description) {
    if (description.length > 400 || typeof description !== "string") {
      throw new Error("Description should be a string within 400 characters.");
    }
    newPayload.description = description;
  }

  if (genres && genres.length > 0) {
    validateGenres(genres);
    newPayload.genres = genres.map(genre => parseInt(genre));
  }

  if (languages && languages.length > 0) {
    validateLanguage(languages);
    newPayload.languages = languages;
  }

  if (releaseDate) {
    isValidISODate(releaseDate);
    newPayload.releaseDate = new Date(releaseDate);
  }

  if (duration) {
    if (!isNumeric(duration)) {
      throw new Error("Duration must be a numeric value");
    }
    newPayload.duration = parseInt(duration);
  }

  if (rating) {
    if (!isNumeric(rating) || parseFloat(rating) > 10 || parseFloat(rating) < 0) {
      throw new Error("Rating should be a number between 0 and 10");
    }
    newPayload.rating = parseFloat(rating);
  }

  if (casts && casts.length > 0) {
    const isCastId = casts.every(cast => isMongoId(cast.toString()));
    if (!isCastId) {
      throw new Error("Cast object Id are not valid");
    }
    newPayload.cast = casts.map(cast => new mongoose.Types.ObjectId(cast));
  }
  if (directors) {
    // Convert to array if it's a single value
    const directorsArray = Array.isArray(directors) ? directors : [directors];
    
    if (directorsArray.length > 0) {
      const isDirId = directorsArray.every(dir => isMongoId(dir.toString()));
      if (!isDirId) {
        throw new Error("Director object ids are invalid");
      }
      newPayload.director = directorsArray.map(dir => new mongoose.Types.ObjectId(dir));
    }
  }
  newPayload.availableForStreaming = availableForStreaming || true;

  return newPayload;
};