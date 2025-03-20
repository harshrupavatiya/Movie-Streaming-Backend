import { CustomHelpers } from "joi";

export const phoneNumber = (
    value: string, 
    helpers: CustomHelpers
): string | ReturnType<CustomHelpers['message']> => {
    if (!value.match(/^\d{10}$/)) {
        return helpers.message({ custom: '"{{#label}}" must be a 10 digit phone number' });
      }
      return value;
    };

export const otpValidator = (
  value: number,
  helpers: CustomHelpers
): string | ReturnType<CustomHelpers["message"]> => {
    if (value.toString().length !== 6) {
        return helpers.error("any.invalid", { message: "OTP must be exactly 6 digits" });
      }
      return value.toString();
};

export const password = (
    value: string   ,
    helpers: CustomHelpers
  ): string | ReturnType<CustomHelpers['message']> => {
    if (value.length < 8) {
      return helpers.message({ custom: 'password must be at least 8 characters' });
    }
    if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
      return helpers.message({ custom: 'password must contain at least 1 letter and 1 number' });
    }
    return value;
  };