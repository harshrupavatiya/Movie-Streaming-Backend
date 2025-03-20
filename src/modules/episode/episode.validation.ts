import Joi from 'joi';
import { objectId } from './../validate/custom.validation'; 

export const addEpisode = Joi.object({
  seriesId: Joi.string().custom(objectId).required(),
  episodePayload: Joi.object({
    title: Joi.string().trim().max(254).required(),
    description: Joi.string().max(400).required(),
    duration: Joi.number().positive().required(),
    releaseDate: Joi.date().required(),
    episodeNumber: Joi.number().positive().required(),
  }).required(),
});
