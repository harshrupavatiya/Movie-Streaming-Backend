import { Response } from 'express';
import Like from './like.model';
import { isMongoId } from 'validator';
import { Media } from '../media';
import { MOVIE, SERIES } from '../../config/constants';
import { AuthRequest } from '../auth';

// Toggle Like (Add/Remove)--------------------------------------------------------------------------------
export const toggleLike = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { contentId, contentType } = req.body;

    if (contentType !== MOVIE && contentType !== SERIES) {
      res.status(400).json({ message: 'Invalid content  Type' });
      return;
    }
    if (!contentId || !isMongoId(contentId)) {
      res.status(400).json({ message: 'Content ID are invalid' });
      return;
    }

    // Check if the content is already liked
    const likeInfo = await Like.findOneAndDelete({
      userId: user._id,
      contentId: contentId,
      contentType: contentType,
    });

    if (likeInfo) {
      Media.findByIdAndUpdate(contentId, {
        $inc: { likes: -1 },
      })
        .then(() => {
          console.log('like value decreamented successfully');
        })
        .catch((err) => {
          console.log('Getting an error while decreamenting the value of like : ', err);
        });
      res.status(200).json({ message: 'Unliked successfully' });
      return;
    }

    // Like: Add to like collection
    const newLike = new Like({
      userId: user._id,
      contentId,
      contentType,
    });
    await newLike.save();

    Media.findByIdAndUpdate(contentId, {
      $inc: { likes: 1 },
    })
      .then(() => {
        console.log('like value increamented successfully');
      })
      .catch((err) => {
        console.log('Getting an error while increamenting the value of like : ', err);
      });

    res.status(201).json({
      success: true,
      message: 'Liked successfully',
    });
    return;
  } catch (err) {
    res.status(500).json({
      success: false,
      message: (err as Error).message,
    });
    return;
  }
};

// Get all liked movies and series for a user--------------------------------------------------------------
export const getLikedContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;

    if (!user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const likedContent = await Like.find({ userId: user._id })
      .populate({
        path: 'contentId',
        select: 'title poster',
      })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      message: 'Liked content by user',
      data: { likedContent },
    });
    return;
  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
    return;
  }
};
