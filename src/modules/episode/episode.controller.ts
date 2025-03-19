import { Response } from 'express';
import { AuthRequest } from '../auth';
import { Media } from '../media';
import Episode from './episode.model';
import { isMongoId } from 'validator';
import { ADMIN, FREE } from '../../utils/constants';

export const addEpisode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    const { seriesId } = req.body;
    // ensure seriesId is present
    if (!seriesId) {
      res.status(400).json({ message: 'Media Id is required to add episode' });
      return;
    }

    const series = await Media.findById(req.body.seriesId);
    // if series not exist then return error of missing field
    if (!series) {
      res.status(400).json({ message: 'Media not found of given ID' });
      return;
    }

    // validate data and get payload
    const episodePayload = req.episodePayload;

    // creating new instance of episode model
    const newEpisode = new Episode(episodePayload);
    // saving the instance of Episode
    await newEpisode.save();

    res.status(200).json({ message: 'Episode added successfully.' });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const deleteEpisode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    // get episodeId from parameters
    const { episodeId } = req.params;

    // delete Episode by id
    const deletedEpisode = await Episode.findByIdAndDelete(episodeId);

    // if episode not found
    if (!deletedEpisode) {
      res.status(400).json({ message: 'Episode id is not valid.' });
      return;
    }
    res.status(200).json({ message: 'Episode deleted successfully.' });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const updateEpisode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // getting user from req
    const user = req.user;
    // check user is admin
    if (user?.role !== ADMIN) {
      res.status(400).json({ message: 'Access denied, Admins only allowed' });
      return;
    }

    const { episodeId } = req.body;

    const episode = await Episode.findById(episodeId);

    if (!episode) {
      res.status(400).json({ message: 'Invalid Episode Id' });
      return;
    }

    const editEpisodePayload = req.episodePayload;

    // ensuring that with same seasonNumber and EpisodeNumber is exists or not?
    if (editEpisodePayload?.episodeNumber) {
      const isDuplicateEpisodeNumber = await Episode.find({
        seriesId: episode.seriesId,
        seasonNumber: editEpisodePayload.seasonNumber,
        episodeNumber: editEpisodePayload.episodeNumber,
      });
      if (isDuplicateEpisodeNumber && isDuplicateEpisodeNumber.length > 0) {
        res.status(500).json({
          message: `Episode number: ${editEpisodePayload.episodeNumber} is already exists.`,
        });
        return;
      }
    }

    // edit field assigned to episode model
    Object.assign(episode, editEpisodePayload);

    // saving updated episode
    await episode.save();

    res.status(200).json({ message: 'Episode has updated successfully.' });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

export const getEpisode = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // ensire user is exists or not
    if (req.user?.subscription?.plan === FREE) {
      res.status(400).json({ message: 'Please upgrade your subscription plan' });
      return;
    }

    // get episode id from req parameters
    const { episodeId } = req.params;

    // if episode id in not valid
    if (!isMongoId(episodeId)) {
      res.status(400).json({ message: 'Invalid Episode Id' });
      return;
    }

    // get episode info
    const episodeInfo = await Episode.findById(episodeId).select(
      'title description seriesId seasonNumber duration episodeNumber episodeUrl releaseDate'
    );

    res.status(200).json({ message: 'Episode Information', data: { episodeInfo } });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
  }
};
