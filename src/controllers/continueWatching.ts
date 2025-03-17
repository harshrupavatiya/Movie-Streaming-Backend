import { Response } from "express";
import User from "../modules/user/user.model";
import { AuthRequest } from "../types/api";
import { EPISODE, MOVIE } from "../modules/utils/constants";

// Update Watch Progress
export const updateWatchProgress = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const existingUser = req.user;

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    //Progress will be stored in seconds(easier to calculate)
    const { contentId, contentType, progress } = req.body;

    if (!contentId || progress === undefined) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    if (contentType !== MOVIE && contentType !== EPISODE) {
      res.status(400).json({ message: "Invalid content type" });
      return;
    }

    const index = existingUser.continueWatching.findIndex(
      (item) => item.contentId.toString() === contentId
    );

    if (index !== -1) {
      // Update progress if content already exists in continue watching
      existingUser.continueWatching[index].progress = progress;
      existingUser.continueWatching[index].lastWatched = new Date();
    } else {
      // Add new entry if content is not already in continue watching
      existingUser.continueWatching.push({
        contentId,
        contentType,
        progress,
        lastWatched: new Date(),
      });
    }

    await existingUser.save();
    res.status(200).json({ message: "Progress updated successfully" });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};

// Get Continue Watching List
export const getContinueWatching = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const existingUser = await User.findById(user._id)
      .populate({
        path: "continueWatching.contentId",
        select: "title poster duration",
      })
      .sort({ "continueWatching.lastWatched": -1 });

    if (!existingUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      message: "Continue Watching list",
      data: existingUser.continueWatching,
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};
