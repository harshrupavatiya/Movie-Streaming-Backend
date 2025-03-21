import Joi from 'joi';

import { otpValidator, password, phoneNumber } from '../validate/custom.validation';

const signUp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required().custom(password),
    name: Joi.string().required(),
    contactNo: Joi.string().required().custom(phoneNumber),
    otp: Joi.number().required().custom(otpValidator),
  }),
};

const login = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const generateOTP = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
    name: Joi.string().required(),
    contactNo: Joi.string().required().custom(phoneNumber),
    password: Joi.string().required().custom(password),
  }),
};

const sendMailResetPassword = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};

const resetPassword = {
  body: Joi.object().keys({
    token: Joi.string().required(),
    password: Joi.string().required().custom(password),
  }),
};

export default {
  signUp,
  login,
  generateOTP,
  sendMailResetPassword,
  resetPassword,
};