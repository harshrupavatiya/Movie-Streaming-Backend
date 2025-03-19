import Joi from 'joi';

const signUp = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required(),
    contactNo: Joi.string().required().min(10).max(10),
    otp: Joi.number().required().min(6).max(6),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  }),
};

export default {
  signUp,
  login,
};
