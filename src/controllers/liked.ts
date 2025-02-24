import { Request, Response } from "express";
import Like from "../models/like";
import { AuthRequest } from "../types/api"; // Assuming AuthRequest extends Request and includes user info
import User from "../models/user";

// Toggle Like (Add/Remove)
export const toggleLike = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { contentId } = req.body;
    const user = req.user._id;

    if (!contentId) {
      return res
        .status(400)
        .json({ message: "Content ID and type are required" });
    }

    // Check if the content is already liked
    const isLiked = req.user.likedContent.some(
      (item) => item.contentId.toString() === contentId
    );

    if (isLiked) {
      // Unlike: Remove from likedContent array
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { likedContent: { contentId } },
      });

      return res.status(200).json({ message: "Unliked successfully" });
    } else {
      // Like: Add to likedContent array
      await User.findByIdAndUpdate(req.user._id, {
        $addToSet: { likedContent: { contentId } },
      });

      return res.status(201).json({ message: "Liked successfully" });
    }
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};

// Get all liked movies and series for a user
export const getLikedContent = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const likedContent = await Like.find({ user: req.user._id })
      .populate({
        path: "contentId",
        select: "title poster",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({ likedContent });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: (error as Error).message,
    });
  }
};
