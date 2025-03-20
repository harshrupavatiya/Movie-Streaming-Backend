// TODO: getTrendingMedia API

import { Request, Response } from 'express';
import Media from './media.model';
import { Episode } from '../episode';
import { Like } from '../like';
import mongoose from 'mongoose';
import { Crew } from '../crew';
import { ADMIN, FREE, SERIES } from '../../config/constants';

// Add media---------------------------------------------------------------------------
export const createMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;

    // check user is admin
    if (user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    // validate fields and get payload
    const mediaPayload = req.mediaPayload;

    // everything seems fine, so creating media model
    const newMedia = new Media(mediaPayload);

    // saving media model in DB
    await newMedia.save();

    res.status(200).json({ message: 'Media added successfully.' });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Delete media------------------------------------------------------------------------
export const deleteMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    // get mediaId from URL query parameters
    const { mediaId } = req.params;

    // delete media
    const deletedMedia = await Media.findOneAndDelete({ _id: mediaId });

    if (!deletedMedia) {
      res.status(400).json({ message: 'Media not found or invalid MediaId' });
      return;
    }

    res.status(200).json({ message: 'Media and all Seasons & Episodes are deleted' });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Update media info-------------------------------------------------------------------
export const updateMedia = async (req: Request, res: Response): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    // get mediaId from req.body
    const { mediaId } = req.body;

    // find media by id
    const media = await Media.findById(mediaId);

    // ensure that media exists
    if (!media) {
      res.status(400).json({ message: 'Invalid media Id' });
      return;
    }

    // validate reqData and get editMediaPayload
    const editMediaPayload = req.mediaPayload;

    if (editMediaPayload?.crew) {
      await Crew.updateMany({ _id: { $in: media.crew } }, { $pull: { media: media._id } });
    }

    // update existing media document
    Object.assign(media, editMediaPayload);

    // saving updated document
    await media.save();

    res.status(200).json({ message: 'media info updated successfully.' });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get media by genre------------------------------------------------------------------
export const getMediaByGenre = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: 'Access denied, Please login' });
      return;
    }

    // get genre from parameters
    const { genre } = req.params;

    // Convert parameters to numbers
    const genreNumber: number = parseInt(genre as string, 10);

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    // Validatiing genreNumber
    if (isNaN(genreNumber) || genreNumber < 1) {
      res.status(400).json({ message: 'Genre ID must be a positive integer (≥1)' });
      return;
    }

    // applying aggregation on media collection
    const mediaData = await Media.aggregate([
      {
        $match: {
          genres: genreNumber,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    // if mediaData is empty then send error of invalid genreId
    if (!mediaData || mediaData.length <= 0) {
      res.status(200).json({ message: 'no media available with given genreId' });
      return;
    }

    const mediaCount = await Media.countDocuments({
      genres: genreNumber,
    });
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'list of media',
      data: { mediaList: mediaData },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get media by Id---------------------------------------------------------------------
export const getMediaById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: 'Access denied, Please login' });
      return;
    }

    const { mediaId } = req.params;

    // get media Info
    const media = await Media.findById(mediaId)
      .select('title description genres languages releaseDate rating likes poster trailerUrl')
      .populate({
        path: 'reviews',
        options: { sort: { createdAt: -1 }, limit: 5 },
      })
      .populate({
        path: 'crew',
        select: 'name',
      })
      .exec();

    // if media not present
    if (!media) {
      res.status(400).json({ message: 'Please provide valid mediaId' });
      return;
    }

    const aggregateArray: mongoose.PipelineStage[] =
      req.user.subscription?.plan === FREE
        ? [
            {
              $match: {
                mediaId: new mongoose.Types.ObjectId(mediaId),
              },
            },
            {
              $project: {
                createdAt: 0,
                updatedAt: 0,
                mediaId: 0,
                episodeUrl: 0,
              },
            },
            {
              $group: {
                _id: '$seasonNumber',
                episodes: { $push: '$$ROOT' },
              },
            },
            {
              $sort: { _id: 1 },
            },
            {
              $addFields: {
                season: '$_id',
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ]
        : [
            {
              $match: {
                mediaId: new mongoose.Types.ObjectId(mediaId),
              },
            },
            {
              $project: {
                createdAt: 0,
                updatedAt: 0,
                mediaId: 0,
              },
            },
            {
              $group: {
                _id: '$seasonNumber',
                episodes: { $push: '$$ROOT' },
              },
            },
            {
              $sort: { _id: 1 },
            },
            {
              $addFields: {
                season: '$_id',
              },
            },
            {
              $project: {
                _id: 0,
              },
            },
          ];

    // get episode season wise
    const seasonwiseEpisode = await Episode.aggregate(aggregateArray);

    const isLiked = await Like.findOne({
      userId: req.user?._id.toString(),
      contentId: mediaId,
      contentType: SERIES,
    });

    media.isLiked = isLiked ? true : false;

    res.status(200).json({
      message: `Media ${media?.title} is here`,
      data: {
        mediaInfo: media,
        mediaContent: seasonwiseEpisode,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get most liked media list-----------------------------------------------------------
export const getMostLikedMediaList = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: 'Access denied, Please login' });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const mediaList = await Media.aggregate([
      {
        $sort: {
          likes: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!mediaList || mediaList.length <= 0) {
      res.status(200).json({ message: 'data not available' });
      return;
    }

    const mediaCount = await Media.countDocuments();
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'Most Liked Media List',
      data: { mediaList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get most viewed media list----------------------------------------------------------
export const getMostViewedMediaList = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: 'Access denied, Please login' });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const mediaList = await Media.aggregate([
      {
        $sort: {
          viewCount: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!mediaList || mediaList.length <= 0) {
      res.status(200).json({ message: 'data not available' });
      return;
    }

    const mediaCount = await Media.countDocuments();
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'Most Viewed Media List',
      data: { mediaList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get top rated media list------------------------------------------------------------
export const getTopRatedMediaList = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: 'Access denied, Please login' });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const mediaList = await Media.aggregate([
      {
        $sort: {
          rating: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!mediaList || mediaList.length <= 0) {
      res.status(200).json({ message: 'data not available' });
      return;
    }

    const mediaCount = await Media.countDocuments();
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'Top Rated Media List',
      data: { mediaList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get latest released media list------------------------------------------------------
export const getLatestReleasedMediaList = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: 'Access denied, Please login' });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const mediaList = await Media.aggregate([
      {
        $sort: {
          releaseDate: -1,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!mediaList || mediaList.length <= 0) {
      res.status(200).json({ message: 'data not available' });
      return;
    }

    const mediaCount = await Media.countDocuments();
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'Latest Released Media List',
      data: { mediaList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get popular media list--------------------------------------------------------------
export const getPopularMediaList = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ensure that user is exists or not
    if (!req.user) {
      res.status(400).json({ message: 'Access denied, Please login' });
      return;
    }

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const mediaList = await Media.aggregate([
      {
        $match: {
          rating: { $gte: 7.5 },
          likes: { $gte: 0 },
        },
      },
      {
        $sort: { rating: -1, likes: -1 },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          description: 1,
          genres: 1,
          languages: 1,
          releaseDate: 1,
          rating: 1,
          poster: 1,
        },
      },
    ]);

    if (!mediaList || mediaList.length <= 0) {
      res.status(200).json({ message: 'data not available' });
      return;
    }

    const mediaCount = await Media.countDocuments();
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'Popular Media List',
      data: { mediaList },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get media list by search------------------------------------------------------------
export const getMediaListBySearch = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only' });
      return;
    }

    // get page and limit from query parameters
    const { search = '' } = req.query;

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const searchRegExp = new RegExp(search as string, 'i');

    const mediaList = await Media.find({
      title: searchRegExp,
    })
      .populate({
        path: 'crew',
        select: 'name',
      })
      .skip(skipDocNumber)
      .limit(limitNumber)
      .sort({ releaseDate: -1 });

    const mediaCount = await Media.countDocuments({
      title: searchRegExp,
    });
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'searched media List for admin',
      data: {
        mediaList,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Get media names and id by search----------------------------------------------------
export const getMediaNamesAndIdBySearch = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (req.user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only' });
      return;
    }

    // get page and limit from query parameters
    const { search = '' } = req.query;

    // get pagination info from pagination payload
    const skipDocNumber = req.pagination?.skipDocNumber;
    const limitNumber = req.pagination?.limitNumber;

    if (skipDocNumber === undefined || skipDocNumber < 0 || !limitNumber) {
      res.status(400).json({ message: 'pagination values missing' });
      return;
    }

    const searchRegExp = new RegExp(search as string, 'i');

    const mediaList = await Media.aggregate([
      {
        $match: {
          title: searchRegExp,
        },
      },
      {
        $skip: skipDocNumber,
      },
      {
        $limit: limitNumber,
      },
      {
        $project: {
          title: 1,
          _id: 1,
        },
      },
    ]);

    const mediaCount = await Media.countDocuments({
      title: searchRegExp,
    });
    res.status(200).json({
      metadata: {
        totalMedia: mediaCount,
        currentPage: Math.ceil(skipDocNumber / limitNumber) + 1,
        totalPages: Math.ceil(mediaCount / limitNumber),
      },
      message: 'searched media Name and ID for admin',
      data: {
        mediaList,
      },
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// Media view count--------------------------------------------------------------------
export const incrementMediaView = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user || req.user.role == ADMIN) {
      res.status(403).json({ message: 'Only view incremented for users' });
      return;
    }

    const { mediaId } = req.params;

    const updatedMedia = await Media.findByIdAndUpdate(
      mediaId,
      { $inc: { viewCount: 1 } },
      { new: true }
    );

    if (!updatedMedia) {
      res.status(404).json({ message: 'Media not found' });
      return;
    }

    res.status(200).json({
      message: 'View count updated',
      data: { views: updatedMedia.viewCount },
    });
    return;
  } catch (error) {
    res.status(500).json({
      message: (error as Error).message,
    });
    return;
  }
};

export const deleteSeason = async (req: Request, res: Response): Promise<void> => {
  try {
    // ensure user is admin
    if (req?.user?.role !== ADMIN) {
      res.status(400).json({ message: ' Access denied, Admins only' });
    }

    // get info from parameters
    const { seriesId } = req.params;
    const { season } = req.query;

    if (!seriesId || !season) {
      res.status(400).json({ message: 'Series Id and Season both field are required.' });
    }

    // find series in series collection
    const series = await Media.findOne({ _id: seriesId, contentType: 'Series' });

    if (!series) {
      res.status(400).json({ message: 'Invalid series ID' });
      return;
    }

    // convert season into number
    const seasonNumber = parseInt(season as string, 10);

    if (isNaN(seasonNumber)) {
      res.status(400).json({ message: 'season should be in numeric format' });
      return;
    }

    // deleting all episode with given series ID and seasonNumber
    await Episode.deleteMany({
      seriesId,
      seasonNumber,
    });

    res.status(200).json({
      message: `All episode are deleted of season number ${seasonNumber}`,
    });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};

export const searchContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search } = req.query;

    if (!search || typeof search !== 'string') {
      res.status(400).json({ message: 'Search Body is required' });
      return;
    }

    const searchRegex = new RegExp(search.trim(), 'i'); // Case-insensitive search

    // Search movies & series by title
    const media = await Media.find({ title: searchRegex })
      .select('_id title description rating poster languages genres releaseDate')
      .lean();

    // Aggregate medias by Cast & Director
    const mediaListByCrew = await Media.aggregate([
      {
        $lookup: {
          from: 'crew',
          localField: 'crew',
          foreignField: '_id',
          as: 'crewDetails',
        },
      },
      {
        $match: {
          'crewDetails.name': searchRegex,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          description: 1,
          rating: 1,
          poster: 1,
          languages: 1,
          genres: 1,
          releaseDate: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: 'Search Results',
      data: {
        mediaList: media,
        mediaListByCrew: mediaListByCrew,
      },
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
