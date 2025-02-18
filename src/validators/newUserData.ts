import { Request } from "express";
import validator from "validator";

export const validateUserData = (req: Request): void => {
  // Extract data
  const { name, email, password, contactNo } = req.body;

  // If Name not present
  if (!name) {
    throw new Error("Name is not valid!");
  }
  // If contact number not valid
  if (!validator.isMobilePhone(contactNo)) {
    throw new Error("Contact number is not valid!");
  }
  // If email not valid
  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  }
  // If password is not strong or not valid
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password!");
  }
};

export const validateSignUpData = (req: Request): void => {
  // validate name, email, contactNo, password
  validateUserData(req);

  const { otp } = req.body;

  // validating OTP
  if (!validator.isNumeric(otp)) {
    throw new Error("Invalid OTP format");
  }
  if (otp < 100000 || otp > 999999) {
    throw new Error("OTP should be in 6 digits");
  }
};
