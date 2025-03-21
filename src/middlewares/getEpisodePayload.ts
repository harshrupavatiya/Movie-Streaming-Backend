import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { IEpisode } from './../modules/episode/episode.interface';
import { isValidISOBirthDate, validateContentTitle } from '../modules/validate/inputValidators';
import { isNumeric } from 'validator';

import { validateFileContent } from '../modules/validate/mediaFile';
import { uploadImageToCloudinary } from '../modules/utils/fileUploader';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import Episode from '../modules/episode/episode.model';
import { IEpisode } from '../modules/episode/episode.interface';
import { AuthRequest } from '../modules/auth';

interface IEpisodeReqBody {
  title?: string;
  description?: string;
  seriesId?: string;
  seasonNumber?: string;
  duration?: string;
  episodeNumber?: string;
  releaseDate?: string;
}

export const getNewEpisodePayload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const reqBody = req.body as IEpisodeReqBody;

  //   get all field values
  const { title, description, seriesId, seasonNumber, duration, episodeNumber, releaseDate } =
    reqBody;

  //   making new object for payload
  const newPayload: Partial<IEpisode> = {};

  try {
    validateContentTitle(title!);
    newPayload.title = title!;

    // validate description
    if (description && (description.length > 300 || typeof description !== 'string')) {
      res.status(400).json({
        message: 'Description should be a string of maximum 300 characters.',
      });
      return;
    }
    newPayload.description = description;

    // validate seriesId
    if (!seriesId) {
      res.status(400).json({ message: 'Series ID is required.' });
      return;
    }
    newPayload.seriesId = new mongoose.Types.ObjectId(seriesId);

    // validate seasonNumber
    if (!seasonNumber || !isNumeric(seasonNumber)) {
      res.status(400).json({ message: 'Season number must be a numeric string.' });
      return;
    }
    newPayload.seasonNumber = parseInt(seasonNumber);

    // validate Duration
    if (!duration || !isNumeric(duration)) {
      res.status(400).json({ message: 'Duration is required and must be numeric.' });
      return;
    }
    newPayload.duration = parseInt(duration);

    // validate epoisodeNumber
    if (!episodeNumber || !isNumeric(episodeNumber)) {
      res.status(400).json({ message: 'Episode number must be a numeric string.' });
      return;
    }
    const isDuplicateEpisodeNumber = await Episode.find({
      seriesId,
      seasonNumber,
      episodeNumber,
    });
    if (isDuplicateEpisodeNumber && isDuplicateEpisodeNumber.length > 0) {
      res.status(500).json({
        message: `Episode number: ${episodeNumber} is already exists.`,
      });
      return;
    }
    newPayload.episodeNumber = parseInt(episodeNumber);

    // validate ReleaseDate
    if (releaseDate) {
      isValidISOBirthDate(releaseDate);
      newPayload.releaseDate = new Date(releaseDate);
    }

    // get video file from req.files
    const episodeFile = req.files?.episode as UploadedFile;

    if (!episodeFile) {
      res.status(400).json({ message: 'Episode video is required.' });
      return;
    }

    validateFileContent(episodeFile.mimetype, 'video');

    // uploading image to cloudinary
    const result = await uploadImageToCloudinary(episodeFile.tempFilePath, {
      folder: 'episodes',
      height: 800,
      quality: 500,
    });

    // Delete the temporary file
    fs.unlink(episodeFile.tempFilePath, (err) => {
      if (err) console.log('Failed to delete temp file:', err);
    });

    // if URL not generated
    if (!result?.secure_url) {
      res.status(500).json({ message: 'something went wrong while generating URL' });
      return;
    }

    // add video URL to payload
    newPayload.episodeUrl = result.secure_url;

    req.episodePayload = newPayload;
    next();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const getEditEpisodePayload = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const reqBody = req.body as IEpisodeReqBody;

  const { title, description, seasonNumber, duration, episodeNumber, releaseDate } = reqBody;

  const newPayload: Partial<IEpisode> = {};

  try {
    if (title) {
      validateContentTitle(title);
      newPayload.title = title;
    }

    if (description) {
      if (description.length > 300 || typeof description !== 'string') {
        res.status(400).json({
          message: 'Description should be a string of maximum 300 characters.',
        });
        return;
      }
      newPayload.description = description;
    }

    if (seasonNumber) {
      if (!isNumeric(seasonNumber)) {
        res.status(400).json({ message: 'Season number must be a numeric string.' });
        return;
      }
      newPayload.seasonNumber = parseInt(seasonNumber);
    }

    if (duration) {
      if (!isNumeric(duration)) {
        res.status(400).json({ message: 'Duration must be numeric.' });
        return;
      }
      newPayload.duration = parseInt(duration);
    }

    if (episodeNumber) {
      if (!isNumeric(episodeNumber)) {
        res.status(400).json({ message: 'Episode number must be a numeric string.' });
        return;
      }
      newPayload.episodeNumber = parseInt(episodeNumber);
    }

    if (releaseDate) {
      isValidISOBirthDate(releaseDate);
      newPayload.releaseDate = new Date(releaseDate);
    }

    // get video file from req.files
    const episodeFile = req.files?.episode as UploadedFile;

    if (episodeFile) {
      validateFileContent(episodeFile.mimetype, 'video');

      // uploading image to cloudinary
      const result = await uploadImageToCloudinary(episodeFile.tempFilePath, {
        folder: 'episodes',
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(episodeFile.tempFilePath, (err) => {
        if (err) console.log('Failed to delete temp file:', err);
      });

      // if URL not generated
      if (!result?.secure_url) {
        res.status(500).json({ message: 'something went wrong while generating URL' });
        return;
      }

      // add video URL to payload
      newPayload.episodeUrl = result.secure_url;
    }

    if (Object.keys(newPayload).length <= 0) {
      res.status(400).json({ message: 'Atleast one field required' });
      return;
    }

    req.episodePayload = newPayload;
    next();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};
