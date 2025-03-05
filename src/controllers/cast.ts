import { Response } from "express";
import { AuthRequest, ICastInputData } from "../types/api";
import Cast from "../models/cast";
import Series from "../models/series";
import Movie from "../models/movie";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import {
  isValidISOBirthDate,
  validateName,
} from "../validators/inputValidators";
import { getValidCastPayload } from "../utils/getPayload";

// Add Cast (Admin Only)
// NOW IT IS NOT USEFUL ANYMORE, SO REMOVE IT AFTER TESTING "addOrUpdateCast"
export const addCast = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { name, gender, birthDate, nationality } = req.body;

    // validating the data
    validateName(name);
    if (birthDate) {
      isValidISOBirthDate(birthDate);
    }
    if (nationality && typeof nationality !== "string") {
      throw new Error("value of nationality should be in string type");
    }
    if (gender && typeof gender !== "string") {
      throw new Error("value of gender should nbe in string type");
    }

    const file = req?.files?.image as UploadedFile;

    // Upload image to Cloudinary
    let result = null;
    if (file) {
      validateFileContent(file.mimetype, "image");

      result = await uploadImageToCloudinary(file.tempFilePath, {
        folder: "cast",
        height: 800,
        quality: 100,
      });

      // Delete the temporary file
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });
    }

    // getting secure url from received data from cloudinary uploader
    const profilePicture = result?.secure_url || null;

    // new cast payload
    const newCastPayload: ICastInputData = {
      name,
      ...(birthDate && { birthDate: new Date(birthDate) }),
      ...(gender && { gender }),
      ...(nationality && { nationality }),
      ...(profilePicture && { profilePicture }),
    };

    // Create a new cast member
    const newCast = new Cast(newCastPayload);

    await newCast.save();

    return res.status(201).json({
      message: "Cast member added successfully",
      cast: newCast,
    });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};

// // Get All Cast Names with Object ID--------------------------------------------------------------------------------
// export const getAllCastNames = async (
//   req: AuthRequest,
//   res: Response
// ): Promise<string | any> => {
//   try {
//     // TODO: ensure that user and admin both need this api

//     // get only name and objectId of Casts
//     const castList = await Cast.aggregate([
//       {
//         $project: {
//           name: 1,
//           _id: 1,
//         },
//       },
//     ]);

//     return res.status(200).json({
//       message: "Cast list with name and id",
//       data: { castList },
//     });
//   } catch (error) {
//     return res.status(500).json({ message: (error as Error).message });
//   }
// };

//Get searched Cast by name--------------------------------------------------------------------------------
export const searchCastByName = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string") {
      return res.status(400).json({ message: "Query parameter is required." });
    }

    // Search for cast members whose names start with the given query
    const castList = await Cast.find({
      name: { $regex: `^${query}`, $options: "i" },
    }).select("name _id");

    if (castList.length === 0) {
      return res
        .status(404)
        .json({ message: "No matching cast members found." });
    }

    return res.status(200).json({
      message: "Cast list matching the search query",
      data: { castList },
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Add or Update Cast (Admin Only)--------------------------------------------------------------------------------
export const addOrUpdateCast = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { castId } = req.body;
    const file = req?.files?.image as UploadedFile;

    // find cast by id
    const existingCast = await Cast.findById(castId);

    // get castPayload by validating req.body
    const castPayload = getValidCastPayload(
      req.body,
      existingCast ? true : false
    );

    // corner-cases error handling
    if (!existingCast && castId) {
      throw new Error("Cast not found in DB");
    }
    if (existingCast && Object.keys(castPayload).length === 0 && !file) {
      throw new Error("Atleast one field required to update Cast information");
    }
    if (!existingCast && !Object.keys(castPayload).includes("name")) {
      throw new Error("Name is required field");
    }

    // image uploading process begins from here,
    let result = null;
    // if file(image) exists in request-files
    if (file) {
      validateFileContent(file.mimetype, "image");

      // uploading image to cloudinary
      result = await uploadImageToCloudinary(file.tempFilePath, {
        folder: "cast",
        height: 800,
        quality: 100,
      });

      // Delete the temporary file
      fs.unlink(file.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });
    }
    // getting secure url from received data from cloudinary uploader
    const profilePicture = result?.secure_url || null;

    // if url not generated
    if (file && !profilePicture) {
      throw new Error("Something went wrong while uploading Image");
    }
    // adding url in payload
    if (profilePicture) {
      castPayload.profilePicture = profilePicture;
    }

    // if cast exists then update the information
    if (existingCast) {
      // additional info assigned to existing data
      Object.assign(existingCast, castPayload);
      await existingCast.save();

      return res.status(200).json({
        message: "Cast data updated successfully",
        data: { cast: existingCast },
      });
    }

    // create new cast data (because cast info not present in DB)
    const newCast = new Cast(castPayload);
    await newCast.save();

    return res.status(200).json({
      message: "Cast information saved successfully",
      data: { cast: newCast },
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Delete Cast (Admin Only)--------------------------------------------------------------------------------
export const deleteCast = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { castId } = req.params; // Get cast ID from URL params

    // Find and delete the cast member
    const deletedCast = await Cast.findByIdAndDelete(castId);

    if (!deletedCast) {
      return res.status(404).json({ message: "Cast member not found." });
    }

    // Remove cast reference from any associated movies
    Movie.updateMany(
      { "cast.castId": castId },
      { $pull: { cast: { castId } } }
    );

    // Remove cast reference from any associated series
    Series.updateMany(
      { "cast.castId": castId },
      { $pull: { cast: { castId } } }
    );

    return res.status(200).json({
      message: "Cast member deleted successfully",
      data: { deletedCast },
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
