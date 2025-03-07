import { Response } from "express";
import { AuthRequest, IDirectorInputData } from "../types/api";
import Director from "../models/director";
import Series from "../models/series";
import Movie from "../models/movie";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import { getValidDirectorPayload } from "../utils/getPayload";

// Get All Directors
export const searchDirectorByName = async (
  req: AuthRequest,
  res: Response
): Promise<any> => {
  try {
    const { name } = req.query;

    if (!name || typeof name !== "string") {
      return res
        .status(400)
        .json({ message: "Name is required in string type" });
    }

    const searchDirector = new RegExp(name.trim(), "i");

    const directorList = await Director.find({
      name: searchDirector,
    }).select("name _id");

    if (directorList.length === 0) {
      return res.status(404).json({ message: "No matching Director found." });
    }

    return res.status(200).json({
      message: "Director list matching the search query",
      data: { directorList },
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Update Director (Admin Only)
export const addOrUpdateDirector = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { directorId } = req.body;
    const file = req?.files?.image as UploadedFile;

    // find director by id
    const existingDirector = await Director.findById(directorId);

    // get directorPayload by validating req.body
    const directorPayload = getValidDirectorPayload(
      req.body,
      existingDirector ? true : false
    );

    // corner-cases error handling
    if (!existingDirector && directorId) {
      throw new Error("Director not found in DB");
    }
    if (
      existingDirector &&
      Object.keys(directorPayload).length === 0 &&
      !file
    ) {
      throw new Error(
        "Atleast one field required to update Director information"
      );
    }
    if (!existingDirector && !Object.keys(directorPayload).includes("name")) {
      throw new Error("Name is required field");
    }

    // image uploading proocess begins from here,
    let result = null;
    // if file(image) exists in request-files
    if (file) {
      validateFileContent(file.mimetype, "image");

      // uploading image to cloudinary
      result = await uploadImageToCloudinary(file.tempFilePath, {
        folder: "director",
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
      directorPayload.profilePicture = profilePicture;
    }

    // if director exists then update the information
    if (existingDirector) {
      // additional info assigned to existing data
      Object.assign(existingDirector, directorPayload);
      await existingDirector.save();

      return res.status(200).json({
        message: "Director data updated successfully",
        data: { director: existingDirector },
      });
    }

    // create new director data (because director info not present in DB)
    const newDirector = new Director(directorPayload);
    await newDirector.save();

    return res.status(200).json({
      message: "Director information saved successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

// Delete Director (Admin Only)
export const deleteDirector = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    // Check if the user is an admin
    if (!req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const { directorId } = req.params;

    // Find and delete the director
    const deletedDirector = await Director.findByIdAndDelete(directorId);

    if (!deletedDirector) {
      return res.status(404).json({ message: "Director not found." });
    }

    // Remove director reference from any associated movies
    Movie.updateMany(
      { director: directorId },
      { $pull: { director: { directorId } } }
    );

    // Remove director reference from any associated series
    Series.updateMany(
      { director: directorId },
      { $pull: { director: { directorId } } }
    );

    return res.status(200).json({
      success: true,
      message: "Director deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
