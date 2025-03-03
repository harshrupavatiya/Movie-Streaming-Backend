import { Response } from "express";
import { AuthRequest } from "../types/api";
import User from "../models/user";

// Toggle Watchlist (Add/Remove)--------------------------------------------------------------------------------
export const toggleWatchlist = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { contentId, contentType } = req.body;
    const userId = req.user._id;

    if (!contentId || !contentType) {
      return res
        .status(400)
        .json({ message: "Content ID and type are required" });
    }

    // Check if the content is already in the watchlist
    const isInWatchlist = req.user.watchlist.some(
      (item) => item.contentId.toString() === contentId
    );

    if (isInWatchlist) {
      // Remove from watchlist
      await User.findByIdAndUpdate(userId, {
        $pull: { watchlist: { contentId } },
      });

      return res.status(200).json({ message: "Removed from watchlist" });
    } else {
      // Add to watchlist
      await User.findByIdAndUpdate(userId, {
        $addToSet: { watchlist: { contentId, contentType } },
      });

      return res.status(201).json({ message: "Added to watchlist" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get all watchlisted movies and series for a user--------------------------------------------------------------
export const getWatchlist = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const watchlist = await User.findById(req.user._id)
      .select("watchlist")
      .populate({
        path: "watchlist.contentId",
        select: "title poster",
      });

    return res.status(200).json({ watchlist });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
