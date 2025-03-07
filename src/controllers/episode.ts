import { Response } from "express";
import { AuthRequest } from "../types/api";
import Series from "../models/series";
import { getEpisodePayload } from "../utils/episodePayload";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import Episode from "../models/episode";
import { validateFileContent } from "../validators/mediaFile";
import { uploadImageToCloudinary } from "../utils/fileUploader";
import { isMongoId } from "validator";

export const addEpisode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    const { seriesId } = req.body;
    // ensure seriesId is present
    if (!seriesId) {
      res.status(400).json({ message: "Series Id is required to add episode" });
      return;
    }

    const series = await Series.findById(req.body.seriesId);
    // if series not exist then return error of missing field
    if (!series) {
      res.status(400).json({ message: "Series not found of given ID" });
      return;
    }

    // validate data and get payload
    const episodePayload = getEpisodePayload(req.body, false);

    const isDuplicateEpisodeNumber = (
      await Episode.find({
        seriesId: series?._id,
        seasonNumber: episodePayload.seasonNumber,
      })
    ).some((episode) => episode.episodeNumber === episodePayload.episodeNumber);
    if (isDuplicateEpisodeNumber) {
      res.status(500).json({
        message: `Episode number: ${episodePayload.episodeNumber} is already exists.`,
      });
      return;
    }

    // get video file from req.files
    const episodeFile = req.files?.episode as UploadedFile;

    if (!episodeFile) {
      res.status(400).json({ message: "Episode video is required." });
      return;
    }

    validateFileContent(episodeFile.mimetype, "video");

    // uploading image to cloudinary
    const result = await uploadImageToCloudinary(episodeFile.tempFilePath, {
      folder: "episodes",
      height: 800,
      quality: 500,
    });

    // Delete the temporary file
    fs.unlink(episodeFile.tempFilePath, (err) => {
      if (err) console.log("Failed to delete temp file:", err);
    });

    // if URL not generated
    if (!result?.secure_url) {
      res
        .status(500)
        .json({ message: "something went wrong while generating URL" });
      return;
    }

    // add video URL to payload
    episodePayload.episodeUrl = result.secure_url;

    // creating new instance of episode model
    const newEpisode = new Episode(episodePayload);
    // saving the instance of Episode
    await newEpisode.save();

    res.status(200).json({ message: "Episode added successfully." });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const deleteEpisode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    // get episodeId from parameters
    const { episodeId } = req.params;

    // delete Episode by id
    const deletedEpisode = await Episode.findByIdAndDelete(episodeId);

    // if episode not found
    if (!deletedEpisode) {
      res.status(400).json({ message: "Episode id is not valid." });
      return;
    }
    res.status(200).json({ message: "Episode deleted successfully." });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const updateEpisode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== "admin") {
      res.status(400).json({ message: "Access denied, Admins only allowed" });
      return;
    }

    const { episodeId } = req.body;

    const episode = await Episode.findById(episodeId);

    if (!episode) {
      res.status(400).json({ message: "Invalid Episode Id" });
      return;
    }

    const editEpisodePayload = getEpisodePayload(req.body, true);

    if (editEpisodePayload.episodeNumber) {
      const isDuplicateEpisodeNumber = (
        await Episode.find({
          seriesId: episode.seriesId,
          seasonNumber: editEpisodePayload.seasonNumber,
        })
      ).some(
        (episode) => episode.episodeNumber === editEpisodePayload.episodeNumber
      );
      if (isDuplicateEpisodeNumber) {
        res.status(500).json({
          message: `Episode number: ${editEpisodePayload.episodeNumber} is already exists`,
        });
        return;
      }
    }

    // get video file from req.files
    const episodeFile = req.files?.episode as UploadedFile;

    if (episodeFile) {
      validateFileContent(episodeFile.mimetype, "video");

      // uploading image to cloudinary
      const result = await uploadImageToCloudinary(episodeFile.tempFilePath, {
        folder: "episodes",
        height: 800,
        quality: 500,
      });

      // Delete the temporary file
      fs.unlink(episodeFile.tempFilePath, (err) => {
        if (err) console.log("Failed to delete temp file:", err);
      });

      // if URL not generated
      if (!result?.secure_url) {
        res
          .status(500)
          .json({ message: "something went wrong while generating URL" });
        return;
      }

      // add video URL to payload
      editEpisodePayload.episodeUrl = result.secure_url;
    }

    if (Object.keys(editEpisodePayload).length <= 0) {
      res.status(400).json({ message: "Atleast one field required" });
      return;
    }

    // edit field assigned to episode model
    Object.assign(episode, editEpisodePayload);

    // saving updated episode
    await episode.save();

    res.status(200).json({ message: "Episode has updated successfully." });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const getEpisode = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    // ensire user is exists or not
    if (req.user?.subscription?.plan === "free") {
      res
        .status(400)
        .json({ message: "Please upgrade your subscription plan" });
      return;
    }

    // get episode id from req parameters
    const { episodeId } = req.params;

    // if episode id in not valid
    if (!isMongoId(episodeId)) {
      res.status(400).json({ message: "Invalid Episode Id" });
      return;
    }

    // get episode info
    const episodeInfo = await Episode.findById(episodeId).select(
      "title description seriesId seasonNumber duration episodeNumber episodeUrl releaseDate"
    );

    res
      .status(200)
      .json({ message: "Episode Information", data: { episodeInfo } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
