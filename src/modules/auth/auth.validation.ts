import Joi from 'joi';

const signUp= {
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
    name: Joi.string().required(),
    username: Joi.string().required().min(3).max(30),
    //OTP validate remaining
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().required(),
    password: Joi.string().required(),
  }),
};

export default {
  signUp,
  login
};      