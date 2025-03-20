import Joi from 'joi';
import mongoose from 'mongoose';
import { MOVIE, SERIES } from '../../config/constants';

// Custom validation for MongoDB ObjectId
const objectId = (value: string, helpers: Joi.CustomHelpers) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

const createOrUpdateReview = {
  body: Joi.object().keys({
    contentId: Joi.string().required().custom(objectId),
    contentType: Joi.string().valid(MOVIE, SERIES  , "Media").required(),
    rating: Joi.number().min(0).max(10).required(),
    comment: Joi.string().allow('', null),
  }),
};

const getLatestReviews = {
  params: Joi.object().keys({
    contentId: Joi.string().required().custom(objectId),
  }),
};

const getMovieWiseReview = {
  params: Joi.object().keys({
    id: Joi.string().required().custom(objectId),
  }),
};

const deleteReview = {
  params: Joi.object().keys({
    reviewId: Joi.string().required().custom(objectId),
  }),
};

export default {
  createOrUpdateReview,
  getLatestReviews,
  getMovieWiseReview,
  deleteReview,
};