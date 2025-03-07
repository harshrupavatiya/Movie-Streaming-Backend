import mongoose from "mongoose";
import { ISeries } from "../types/db.model";
import {
  isValidISODate,
  validateContentTitle,
  validateGenres,
  validateLanguage,
} from "../validators/inputValidators";
import { isMongoId, isNumeric } from "validator";

interface ISeriesData {
  title: string;
  description?: string;
  genres: string[];
  languages: string[];
  releaseDate: string;
  rating?: string;
  casts?: string[];
  directors?: string[];
  availableForStreaming?: boolean;
}

export const getSeriesPayload = (reqBody: ISeriesData): Partial<ISeries> => {
  // wrapping single elements into array
  (
    ["casts", "languages", "genres", "directors"] as Array<
      keyof Pick<ISeriesData, "casts" | "languages" | "genres" | "directors">
    >
  ).forEach((key) => {
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
    rating,
    casts,
    directors,
    availableForStreaming,
  } = reqBody;

  const newPayload: Partial<ISeries> = {};

  validateContentTitle(title);
  newPayload.title = title;

  if (description) {
    if (description.length > 300 || typeof description !== "string") {
      throw new Error("description should be in 300 character string.");
    }
    newPayload.description = description;
  }

  validateGenres(genres);
  newPayload.genres = genres.map((genre) => parseInt(genre));

  validateLanguage(languages);
  newPayload.languages = languages;

  isValidISODate(releaseDate);
  newPayload.releaseDate = new Date(releaseDate);

  if (rating) {
    if (
      !isNumeric(rating) ||
      parseFloat(rating) > 10 ||
      parseFloat(rating) < 0
    ) {
      throw new Error("Rating should be in number with in 0 to 10");
    }
    newPayload.rating = parseInt(rating);
  }

  if (!casts || casts.length <= 0) {
    throw new Error("casts is required field");
  }
  const isCastId = casts.every((cast) => isMongoId(cast.toString()));
  if (!isCastId) {
    throw new Error("some Cast object Id are not valid");
  }
  newPayload.casts = casts.map((cast) => new mongoose.Types.ObjectId(cast));

  if (!directors || directors.length <= 0) {
    throw new Error("directors is required field");
  }
  const isDirId = directors.every((director) => isMongoId(director.toString()));
  if (!isDirId) {
    throw new Error("Director object id is invalid");
  }
  newPayload.directors = directors.map(
    (dir) => new mongoose.Types.ObjectId(dir)
  );

  newPayload.availableForStreaming = availableForStreaming || true;

  return newPayload;
};

export const getEditSeriesPayload = (
  reqBody: Partial<ISeriesData>
): Partial<ISeries> => {
  if (Object.keys(reqBody).length <= 1) {
    throw new Error("No data for update");
  }
  // wrapping single elements into array
  (
    ["casts", "languages", "genres", "directors"] as Array<
      keyof Pick<ISeriesData, "casts" | "languages" | "genres" | "directors">
    >
  ).forEach((key) => {
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
    rating,
    casts,
    directors,
    availableForStreaming,
  } = reqBody;

  const newPayload: Partial<ISeries> = {};

  if (title) {
    validateContentTitle(title);
    newPayload.title = title;
  }

  if (description) {
    if (description.length > 300 || typeof description !== "string") {
      throw new Error("description should be in 300 character string.");
    }
    newPayload.description = description;
  }

  if (genres && genres.length > 0) {
    validateGenres(genres);
    newPayload.genres = genres.map((genre) => parseInt(genre));
  }

  if (languages && languages.length > 0) {
    validateLanguage(languages);
    newPayload.languages = languages;
  }

  if (releaseDate) {
    isValidISODate(releaseDate);
    newPayload.releaseDate = new Date(releaseDate);
  }

  if (rating) {
    if (
      !isNumeric(rating) ||
      parseFloat(rating) > 10 ||
      parseFloat(rating) < 0
    ) {
      throw new Error("Rating should be in number with in 0 to 10");
    }
    newPayload.rating = parseInt(rating);
  }

  if (casts && casts.length > 0) {
    const isCastId = casts.every((cast) => isMongoId(cast.toString()));
    if (!isCastId) {
      throw new Error("some Cast object Id are not valid");
    }
    newPayload.casts = casts.map((cast) => new mongoose.Types.ObjectId(cast));
  }

  if (directors && directors.length > 0) {
    const isDirId = directors.every((director) =>
      isMongoId(director.toString())
    );
    if (!isDirId) {
      throw new Error("Director object id is invalid");
    }
    newPayload.directors = directors.map(
      (dir) => new mongoose.Types.ObjectId(dir)
    );
  }

  newPayload.availableForStreaming = availableForStreaming || true;

  return newPayload;
};
