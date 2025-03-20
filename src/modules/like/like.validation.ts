import Joi from 'joi';
import { objectId } from '../validate/custom.validation';
import { MEDIA } from '../../config/constants';

const toggleLike = {
    body: Joi.object().keys({
      contentId: Joi.string().custom(objectId).required(),
      contentType: Joi.string().valid(MEDIA).required(),
    }),
  };
  
const getLikedContent = {
    userId: Joi.string().custom(objectId).required(),
  };

export default {
  toggleLike,
  getLikedContent,
};
