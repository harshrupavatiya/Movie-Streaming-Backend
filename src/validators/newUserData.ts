import { Request } from "express";
import { validateContactNo, validateEmail, validateName, validatePassword } from "./inputValidators";

export const validateUserData = (req: Request): void => {
  // Extract data
  const { name, email, password, contactNo } = req.body;

  // If Name not present
  validateName(name);

  validateContactNo(contactNo);
  
  validateEmail(email);
  
  validatePassword(password);
};

export const validateSignUpData = (req: Request): void => {
  // validate name, email, contactNo, password
  validateUserData(req);

  const { otp } = req.body;

  const otpRegex = /^\d{6}$/;

  // validating OTP
  if (!otpRegex.test(otp)) {
    throw new Error("Invalid OTP format");
  }
};
