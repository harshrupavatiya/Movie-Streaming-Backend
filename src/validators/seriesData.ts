import mongoose from "mongoose";
import { ISeries } from "../types/db.model";
import {
  isValidateObjectId,
  isValidISODate,
  validateContentTitle,
  validateGenres,
  validateLanguage,
} from "./inputValidators";

interface ISeriesData {
  title: string;
  description?: string;
  genres: string[];
  languages: string[];
  releaseDate: string;
  rating?: number;
  casts?: mongoose.Types.ObjectId[];
  director?: mongoose.Types.ObjectId;
  availableForStreaming?: boolean;
}

export const validateSeriesData = (reqBody: ISeriesData): Partial<ISeries> => {
  const {
    title,
    description,
    genres,
    languages,
    releaseDate,
    rating,
    casts,
    director,
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
  newPayload.genres = genres.map(genre => parseInt(genre));

  validateLanguage(languages);
  newPayload.languages = languages;

  isValidISODate(releaseDate);
  newPayload.releaseDate = new Date(releaseDate);

  if (rating) {
    if (typeof rating !== "number" || rating > 10 || rating < 0) {
      throw new Error("Rating should be in number with in 0 to 10");
    }
  }
  if (casts && casts.length > 0) {
    if (!casts.every((cast) => isValidateObjectId(cast.toString()))) {
      throw new Error("some Cast object Id are not valid");
    }
    newPayload.casts = casts;
  }
  if (director) {
    if (!isValidateObjectId(director.toString())) {
      throw new Error("Director object id is invalid");
    }
    newPayload.director = director;
  }
  newPayload.availableForStreaming = availableForStreaming && false;

  return newPayload;
};
