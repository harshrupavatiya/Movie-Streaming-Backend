import { Response } from "express";
import Like from "../models/like";
import { AuthRequest } from "../types/api";

// Toggle Like (Add/Remove)--------------------------------------------------------------------------------
export const toggleLike = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { contentId, contentType } = req.body;

    if (contentType !== "Movie" && contentType !== "Series") {
      return res.status(400).json({ message: "Invalid content  Type" });
    }
    if (!contentId) {
      return res.status(400).json({ message: "Content ID are required" });
    }

    // Check if the content is already liked
    const likeInfo = await Like.findOne({
      userId: user._id,
      contentId,
      contentType,
    });

    if (likeInfo) {
      // Unlike: Remove from like collection
      await Like.findOneAndDelete({ _id: likeInfo._id });

      return res.status(200).json({ message: "Unliked successfully" });
    }

    // Like: Add to like collection
    const newLike = new Like({
      userId: user._id,
      contentId,
      contentType,
    });
    await newLike.save();

    return res.status(201).json({ 
      success: true,
      message: "Liked successfully" });
  } catch (err) {
    return res.status(500).json({ 
      success: false,
      message: (err as Error).message });
  }
};

// Get all liked movies and series for a user--------------------------------------------------------------
export const getLikedContent = async (
  req: AuthRequest,
  res: Response
): Promise<string | any> => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // TODO: add model function in populate
    const likedContent = await Like.find({ userId: user._id })
      .populate({
        path: "contentId",
        select: "title poster",
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Liked content by user",
      data: { likedContent },
    });
  } catch (error) {
    return res.status(500).json({ message: (error as Error).message });
  }
};
