import { Request, Response } from "express";
import { AuthRequest } from "../types/api";
import User from "../models/user";

// Toggle Watchlist (Add/Remove)--------------------------------------------------------------------------------
export const toggleWatchlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized access" });
      return;
    }

    const { contentId, contentType } = req.body;
    const userId = req.user._id;

    if (!contentId || !contentType) {
      res.status(400).json({ message: "Content ID and type are required" });
      return;
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

      res.status(200).json({ message: "Removed from watchlist" });
      return;
    } else {
      // Add to watchlist
      await User.findByIdAndUpdate(userId, {
        $addToSet: { watchlist: { contentId, contentType } },
      });

      res.status(201).json({ message: "Added to watchlist" });
      return;
    }
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

// Get all watchlisted movies and series for a user--------------------------------------------------------------
export const getWatchlist = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const watchlist = await User.findById(req.user._id)
      .select("watchlist")
      .populate({
        path: "watchlist.contentId",
        select: "title poster",
      });

    res.status(200).json({ data: { watchlist } });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};
