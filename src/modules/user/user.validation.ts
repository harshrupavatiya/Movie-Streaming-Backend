import Joi from 'joi';
import { IEditDetails, IEditUserDataReqBody } from './user.interface';

// Define Joi validation schema for user updates
const userUpdateSchema = Joi.object({
  name: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/),
  contactNo: Joi.string().pattern(/^[0-9]{10}$/),
  dateOfBirth: Joi.date().iso().max('now'),
  gender: Joi.string().valid('male', 'female', 'other'),
}).min(1);

// Function to validate and transform user update data
export const getValidUserUpdatePayload = (reqBody: IEditUserDataReqBody): IEditDetails => {
  const { error, value } = userUpdateSchema.validate(reqBody, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errorMessage = error.details.map((detail) => detail.message).join(', ');
    throw new Error(errorMessage);
  }

  // Transform dateOfBirth string to Date object if it exists
  const editData: IEditDetails = { ...value };

  if (value.dateOfBirth) {
    editData.dateOfBirth = new Date(value.dateOfBirth);
  }

  return editData;
};

// Export validation schemas for use with validate middleware
export const updateUserValidation = {
  body: userUpdateSchema,
};

// You can add other user-related validation schemas here
export const getUserValidation = {
  params: Joi.object({
    userId: Joi.string().required(),
  }),
};

export default {
  updateUser: updateUserValidation,
  getUser: getUserValidation,
};
