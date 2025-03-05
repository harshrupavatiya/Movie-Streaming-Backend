import mongoose from "mongoose";
import { IEpisode } from "../types/db.model";
import {
  isValidISOBirthDate,
  validateContentTitle,
} from "../validators/inputValidators";
import { isNumeric } from "validator";

interface IEpisodeReqBody {
  title: string;
  description?: string;
  seriesId: string;
  seasonNumber: string;
  duration: string;
  episodeNumber: string;
  releaseDate: string;
}

export const getEpisodePayload = (
  reqBody: IEpisodeReqBody,
  isExist: boolean
): Partial<IEpisode> => {
  const {
    title,
    description,
    seriesId,
    seasonNumber,
    duration,
    episodeNumber,
    releaseDate,
  } = reqBody;

  const newPayload: Partial<IEpisode> = {};

  // New Episode Payload block
  if (!isExist) {
    validateContentTitle(title);
    newPayload.title = title;

    if (
      description &&
      (description.length > 300 || typeof description !== "string")
    ) {
      throw new Error("description should be in 300 character string.");
    }
    newPayload.description = description;

    newPayload.seriesId = new mongoose.Types.ObjectId(seriesId);

    if (!seasonNumber || !isNumeric(seasonNumber)) {
      throw new Error(
        "Season number is required with numeric string value(string that contains only numbers)"
      );
    }
    newPayload.seasonNumber = parseInt(seasonNumber);

    if (!duration || !isNumeric(duration)) {
      throw new Error("Duration required");
    }
    newPayload.duration = parseInt(duration);

    if (!episodeNumber || !isNumeric(episodeNumber)) {
      throw new Error(
        "Episode number is required with numeric string value(string that contains only numbers)"
      );
    }
    newPayload.episodeNumber = parseInt(episodeNumber);

    if (releaseDate) {
      isValidISOBirthDate(releaseDate);
      newPayload.releaseDate = new Date(releaseDate);
    }
  }
  // Edit Episode Payload block
  else {
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

    if (seasonNumber) {
      if (!isNumeric(seasonNumber)) {
        throw new Error(
          "Season number is required with numeric string value(string that contains only numbers)"
        );
      }
      newPayload.seasonNumber = parseInt(seasonNumber);
    }

    if (duration) {
      if (!isNumeric(duration)) {
        throw new Error("Duration required");
      }
      newPayload.duration = parseInt(duration);
    }

    if (episodeNumber) {
      if (!isNumeric(episodeNumber)) {
        throw new Error(
          "Episode number is required with numeric string value(string that contains only numbers)"
        );
      }
      newPayload.episodeNumber = parseInt(episodeNumber);
    }

    if (releaseDate) {
      isValidISOBirthDate(releaseDate);
      newPayload.releaseDate = new Date(releaseDate);
    }
  }

  return newPayload;
};
