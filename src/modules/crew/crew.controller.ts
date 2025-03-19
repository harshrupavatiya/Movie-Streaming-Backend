import { Response } from 'express';
import { AuthRequest } from '../auth';
import Crew from './crew.model';
import { Media } from '../media';
import { validateFileContent } from '../validate/mediaFile';
import { uploadImageToCloudinary } from '../../utils/fileUploader';
import { UploadedFile } from 'express-fileupload';
import fs from 'fs';
import { getValidCrewPayload } from './crew.validator';
import { ADMIN } from '../../utils/constants';

//Get searched Crew by name--------------------------------------------------------------------------------
export const searchCrewByName = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ message: 'Query parameter is required.' });
      return;
    }

    const search = new RegExp(query.trim(), 'i');

    // Search for cast members whose names start with the given query
    const castList = await Crew.find({
      name: search,
    }).select('name _id');

    if (castList.length <= 0) {
      res.status(200).json({ message: 'No matching cast members found.' });

      return;
    }

    res.status(200).json({
      message: 'Crew list matching the search query',
      data: { castList },
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

// Add or Update Crew (Admin Only)--------------------------------------------------------------------------------
export const addOrUpdateCrew = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== ADMIN) {
      res.status(403).json({ message: 'Access denied. Admins only.' });
      return;
    }

    const { castId } = req.body;
    const file = req?.files?.image as UploadedFile;

    // find cast by id
    const existingCrew = await Crew.findById(castId);

    // get castPayload by validating req.body
    const castPayload = getValidCrewPayload(req.body, existingCrew ? true : false);

    // corner-cases error handling
    if (!existingCrew && castId) {
      res.status(403).json({ message: 'Crew not found in DB' });
      return;
    }
    if (existingCrew && Object.keys(castPayload).length === 0 && !file) {
      res.status(403).json({
        message: 'Atleast one field required to update Crew information',
      });
      return;
    }
    if (!existingCrew && !Object.keys(castPayload).includes('name')) {
      res.status(403).json({ message: 'Name is required field' });
      return;
    }

    // image uploading process begins from here,
    let result = null;
    // if file(image) exists in request-files
    if (file) {
      validateFileContent(file.mimetype, 'image');

      // uploading image to cloudinary
      result = await uploadImageToCloudinary(file.tempFilePath, {
        folder: 'cast',
        height: 800,
        quality: 100,
      });

      // Delete the temporary file
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log('Failed to delete temp file:', err);
      });
    }
    // getting secure url from received data from cloudinary uploader
    const profilePicture = result?.secure_url || null;

    // if url not generated
    if (file && !profilePicture) {
      throw new Error('Something went wrong while uploading Image');
    }
    // adding url in payload
    if (profilePicture) {
      castPayload.profilePicture = profilePicture;
    }

    // if cast exists then update the information
    if (existingCrew) {
      // additional info assigned to existing data
      Object.assign(existingCrew, castPayload);
      await existingCrew.save();

      res.status(200).json({
        message: 'Crew data updated successfully',
        data: { cast: existingCrew },
      });
      return;
    }

    // create new cast data (because cast info not present in DB)
    const newCrew = new Crew(castPayload);
    await newCrew.save();

    res.status(200).json({
      message: 'Crew information saved successfully',
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

// Delete Crew (Admin Only)--------------------------------------------------------------------------------
export const deleteCrew = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== ADMIN) {
      res.status(403).json({ message: 'Access denied. Admins only.' });
      return;
    }

    const { castId } = req.params; // Get cast ID from URL params

    // Find and delete the cast member
    const deletedCrew = await Crew.findByIdAndDelete(castId);

    if (!deletedCrew) {
      res.status(404).json({ message: 'Crew member not found.' });
      return;
    }

    // Remove cast reference from any associated movies
    Media.updateMany({ 'cast.castId': castId }, { $pull: { cast: { castId } } });

    res.status(200).json({
      message: 'Crew member deleted successfully',
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};
