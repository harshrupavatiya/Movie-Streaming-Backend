import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { ISeries } from '../types/db.model';
import {
  isValidISOReleaseDate,
  validateContentTitle,
  validateGenres,
  validateLanguage,
} from '../modules/validate/inputValidators';
import { isMongoId, isNumeric } from 'validator';
import { AuthRequest } from '../types/api';
import { uploadImageToCloudinary } from '../utils/fileUploader';
import { validateFileContent } from '../modules/validate/mediaFile';
import fs from 'fs';
import { UploadedFile } from 'express-fileupload';

type seriesArrays = Array<keyof Pick<ISeriesData, 'casts' | 'languages' | 'genres' | 'directors'>>;

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

// New Series Payload ------------------------------------------------------------->
export const getNewSeriesPayload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const reqBody = req.body as ISeriesData;

  // wrapping single elements into array
  (['casts', 'languages', 'genres', 'directors'] as seriesArrays).forEach((key) => {
    const value = reqBody[key];

    if (value && !Array.isArray(value)) {
      reqBody[key] = [value as string];
    }
  });

  //   get all field values
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

  //   making new object for seriesPayload
  const newPayload: Partial<ISeries> = {};

  try {
    validateContentTitle(title);
    newPayload.title = title;

    // validate description
    if (description) {
      if (description.length > 300 || typeof description !== 'string') {
        res.status(400).json({
          message: 'Description should be a string of maximum 300 characters.',
        });
        return;
      }
      newPayload.description = description;
    }

    if (!genres || genres.length <= 0) {
      throw new Error('Genres are required field');
    }
    validateGenres(genres);
    newPayload.genres = genres.map((genre) => parseInt(genre));

    if (!languages || languages.length <= 0) {
      throw new Error('Languages are required field');
    }
    validateLanguage(languages);
    newPayload.languages = languages;

    isValidISOReleaseDate(releaseDate);
    newPayload.releaseDate = new Date(releaseDate);

    // validate rating
    if (rating) {
      if (!isNumeric(rating) || parseFloat(rating) > 10 || parseFloat(rating) < 0) {
        res.status(400).json({
          message: 'Rating should be a number within the range of 0 to 10.',
        });
        return;
      }
      newPayload.rating = parseFloat(rating);
    }

    // validate array of castId
    if (!casts || casts.length <= 0) {
      res.status(400).json({ message: 'Casts are required.' });
      return;
    }
    const isCastId = casts.every((cast) => isMongoId(cast.toString()));
    if (!isCastId) {
      res.status(400).json({ message: 'Some Cast object IDs are invalid.' });
      return;
    }
    newPayload.casts = casts.map((cast) => new mongoose.Types.ObjectId(cast));

    // validate array of director
    if (!directors || directors.length <= 0) {
      res.status(400).json({ message: 'Directors are required.' });
      return;
    }
    const isDirId = directors.every((director) => isMongoId(director.toString()));
    if (!isDirId) {
      res.status(400).json({ message: 'Some Director object IDs are invalid.' });
      return;
    }
    newPayload.directors = directors.map((dir) => new mongoose.Types.ObjectId(dir));

    newPayload.availableForStreaming = availableForStreaming || true;

    // get poster & trailer file from req
    const posterFile = req?.files?.poster as UploadedFile;
    const trailerFile = req?.files?.trailer as UploadedFile;

    // checking poster & trailer are present
    if (!trailerFile || !posterFile) {
      res.status(400).json({
        message: 'poster and trailer are both required for adding series.',
      });
      return;
    }

    // validating file type
    validateFileContent(posterFile.mimetype, 'image');
    validateFileContent(trailerFile.mimetype, 'video');

    // uploading image to cloudinary
    const result = await Promise.all([
      uploadImageToCloudinary(posterFile.tempFilePath, {
        folder: 'posters',
        height: 800,
        quality: 500,
      }),
      uploadImageToCloudinary(trailerFile.tempFilePath, {
        folder: 'trailers',
        height: 800,
        quality: 500,
      }),
    ]);

    // Delete the temporary file
    [posterFile, trailerFile].map((file) =>
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log('Failed to delete temp file:', err);
      })
    );

    // get secureURL after uploading successfully
    const poster = result[0]?.secure_url ?? null;
    const trailerUrl = result[1]?.secure_url ?? null;

    // if poster or trailer URL not present then send Error
    if (!poster || !trailerUrl) {
      res.status(500).json({ message: 'something went wrong while generating URL' });
      return;
    }

    // adding URLs to seriesPayload
    newPayload.poster = poster;
    newPayload.trailerUrl = trailerUrl;

    // Attach the validated payload to the request object
    req.seriesPayload = newPayload;
    next();
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Edit Series Payload ------------------------------------------------------------>
export const getEditSeriesPayload = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const reqBody = req.body as Partial<ISeriesData>;

  // wrapping single values into array
  (['casts', 'languages', 'genres', 'directors'] as seriesArrays).forEach((key) => {
    const value = reqBody[key];
    if (value && !Array.isArray(value)) {
      reqBody[key] = [value as string];
    }
  });

  // get edit field data
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

  // making neew object for payload
  const newPayload: Partial<ISeries> = {};

  try {
    // for title update
    if (title) {
      validateContentTitle(title);
      newPayload.title = title;
    }

    // for description update
    if (description) {
      if (description.length > 300 || typeof description !== 'string') {
        throw new Error('Description should be a string of maximum 300 characters.');
      }
      newPayload.description = description;
    }

    // for genres array update
    if (genres && genres.length > 0) {
      validateGenres(genres);
      newPayload.genres = genres.map((genre) => parseInt(genre));
    }

    // for language array update
    if (languages && languages.length > 0) {
      validateLanguage(languages);
      newPayload.languages = languages;
    }

    // for releaseDate update
    if (releaseDate) {
      isValidISOReleaseDate(releaseDate);
      newPayload.releaseDate = new Date(releaseDate);
    }

    // for rating update
    if (rating) {
      if (!isNumeric(rating) || parseFloat(rating) > 10 || parseFloat(rating) < 0) {
        throw new Error('Rating should be a number within the range of 0 to 10.');
      }
      newPayload.rating = parseFloat(rating);
    }

    // for cast array update
    if (casts && casts.length > 0) {
      if (!casts.every((cast) => isMongoId(cast.toString()))) {
        throw new Error('Some Cast object IDs are invalid.');
      }
      newPayload.casts = casts.map((cast) => new mongoose.Types.ObjectId(cast));
    }

    // for director array update
    if (directors && directors.length > 0) {
      if (!directors.every((director) => isMongoId(director.toString()))) {
        throw new Error('Some Director object IDs are invalid.');
      }
      newPayload.directors = directors.map((dir) => new mongoose.Types.ObjectId(dir));
    }

    newPayload.availableForStreaming = availableForStreaming ?? true;

    // FOR POSTER / TRAILER UPDATE
    // get poster & trailer file from req
    const posterFile = req?.files?.poster as UploadedFile;
    const trailerFile = req?.files?.trailer as UploadedFile;

    // upload poster to cloudinary
    if (posterFile) {
      // validating file type
      validateFileContent(posterFile.mimetype, 'image');

      // uploading image to cloudinary
      const result = await uploadImageToCloudinary(posterFile.tempFilePath, {
        folder: 'posters',
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(posterFile.tempFilePath, (err) => {
        if (err) console.log('Failed to delete temp file:', err);
      });

      // get secureURL after uploading successfully
      const poster = result?.secure_url ?? null;

      // if poster or trailer URL not present then send Error
      if (!poster) {
        res.status(500).json({
          message: 'something went wrong while generating URL of poster',
        });
        return;
      }

      // adding URLs to seriesPayload
      newPayload.poster = poster;
    }
    // upload trailer to cloudinary
    if (trailerFile) {
      // validating file type
      validateFileContent(trailerFile.mimetype, 'video');

      // uploading image to cloudinary
      const result = await uploadImageToCloudinary(trailerFile.tempFilePath, {
        folder: 'trailers',
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(trailerFile.tempFilePath, (err) => {
        if (err) console.log('Failed to delete temp file:', err);
      });

      // get secureURL after uploading successfully
      const trailerUrl = result?.secure_url ?? null;

      // if poster or trailer URL not present then send Error
      if (!trailerUrl) {
        res.status(500).json({
          message: 'something went wrong while generating URL of trailer',
        });
        return;
      }

      // adding URLs to seriesPayload
      newPayload.trailerUrl = trailerUrl;
    }

    // if newPayload in empty then send error
    if (Object.keys(newPayload).length <= 0) {
      res.status(400).json({
        message: 'Atleast one field is required to update series info.',
      });
      return;
    }

    req.seriesPayload = newPayload;
    next();
  } catch (error) {
    next(error);
  }
};
