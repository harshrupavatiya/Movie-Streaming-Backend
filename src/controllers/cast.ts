import { Response } from "express";
import { AuthRequest, ICastInputData } from "../types/api";
import Cast from "../models/cast";
import Series from "../models/series";
import Movie from "../models/movie";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import { getValidCastPayload } from "../utils/getPayload";
import { ADMIN } from "../utils/constants";

//Get searched Cast by name--------------------------------------------------------------------------------
export const searchCastByName = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { query } = req.query;

    if (!query || typeof query !== "string") {
      res.status(400).json({ message: "Query parameter is required." });
      return;
    }

    const search = new RegExp(query.trim(), "i");

    // Search for cast members whose names start with the given query
    const castList = await Cast.find({
      name: search,
    }).select("name _id");

    if (castList.length <= 0) {
      res.status(404).json({ message: "No matching cast members found." });

      return;
    }

    res.status(200).json({
      message: "Cast list matching the search query",
      data: { castList },
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

// Add or Update Cast (Admin Only)--------------------------------------------------------------------------------
export const addOrUpdateCast = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== ADMIN) {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
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
      res.status(403).json({ message: "Cast not found in DB" });
      return;
    }
    if (existingCast && Object.keys(castPayload).length === 0 && !file) {
      res
        .status(403)
        .json({
          message: "Atleast one field required to update Cast information",
        });
      return;
    }
    if (!existingCast && !Object.keys(castPayload).includes("name")) {
      res.status(403).json({ message: "Name is required field" });
      return;
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

      res.status(200).json({
        message: "Cast data updated successfully",
        data: { cast: existingCast },
      });
      return;
    }

    // create new cast data (because cast info not present in DB)
    const newCast = new Cast(castPayload);
    await newCast.save();

    res.status(200).json({
      message: "Cast information saved successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

// Delete Cast (Admin Only)--------------------------------------------------------------------------------
export const deleteCast = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== ADMIN) {
      res.status(403).json({ message: "Access denied. Admins only." });
      return;
    }

    const { castId } = req.params; // Get cast ID from URL params

    // Find and delete the cast member
    const deletedCast = await Cast.findByIdAndDelete(castId);

    if (!deletedCast) {
      res.status(404).json({ message: "Cast member not found." });
      return;
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

    res.status(200).json({
      message: "Cast member deleted successfully",
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};
