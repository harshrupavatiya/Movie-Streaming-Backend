import { Response } from "express";
import User from "../models/user";
import { AuthRequest } from "../types/api";

// Update Watch Progress
export const updateWatchProgress = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    //Progress will be stored in seconds(easier to calculate)
    const { contentId, contentType, progress } = req.body;

    if (!contentId || !contentType || progress === undefined) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    if (contentType !== "Movie" && contentType !== "Series" && contentType !== "Episode") {
      return res.status(400).json({ message: "Invalid content type" });
    }

    const existingUser = await User.findById(user._id);
    if (!existingUser) return res.status(404).json({ message: "User not found" });

    const index = existingUser.continueWatching.findIndex(
      (item) => item.contentId.toString() === contentId
    );

    if (index !== -1) {
      // Update progress if content already exists in continue watching
      existingUser.continueWatching[index].progress = progress;
      existingUser.continueWatching[index].lastWatched = new Date();
    } else {
      // Add new entry if content is not already in continue watching
      existingUser.continueWatching.push({ contentId, contentType, progress, lastWatched: new Date() });
    }

    await existingUser.save();
    return res.status(200).json({ message: "Progress updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};

//TODO: Test for episode after Series API is completed
// Get Continue Watching List
export const getContinueWatching = async (
    req: AuthRequest,
    res: Response
  ): Promise<string | any> => {
    try {
      const user = req.user;
  
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }
  
      const existingUser = await User.findById(user._id)
        .populate({
          path: "continueWatching.contentId",
          select: "title poster duration",
        })
        .sort({ "continueWatching.lastWatched": -1 });
  
      if (!existingUser) return res.status(404).json({ message: "User not found" });
  
      return res.status(200).json({
        message: "Continue Watching list",
        data: existingUser.continueWatching,
      });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  };
  