import Joi from 'joi';
import { objectId } from '../validate/custom.validation';

const searchCrew = {
  query: Joi.object().keys({
    query: Joi.string().trim().min(1).required(),
  }),
};

const addOrUpdateCrew = {
  body: Joi.object().keys({
    castId: Joi.string().custom(objectId).optional(),
    name: Joi.string().trim().min(2).max(100).when('castId', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    role: Joi.string().trim().valid('cast', 'director').when('castId', {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    profilePicture: Joi.string().uri().optional(),
  }),
};

const deleteCrew = {
  params: Joi.object().keys({
    castId: Joi.string().custom(objectId).required(),
  }),
};

export default {
  searchCrew,
  addOrUpdateCrew,
  deleteCrew,
};
