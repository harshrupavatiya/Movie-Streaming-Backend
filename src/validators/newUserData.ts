import { Request } from "express";
import validator from "validator";

export const validateEmail = (email: string): void => {
  if(!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  }
};

export const validatePassword = (password: string): void => {
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password!");
  }
};

export const validateContactNo = (contactNo: string): void => {
  if (!validator.isMobilePhone(contactNo)) {
    throw new Error("Contact number is not valid!");
  }
};

export const validateUserData = (req: Request): void => {
  // Extract data
  const { name, email, password, contactNo } = req.body;

  // If Name not present
  const nameRegex = /^[A-Za-z ]+$/;
  if (!nameRegex.test(name)) {
    throw new Error("Name is not valid");
  }

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
