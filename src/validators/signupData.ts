import { Request } from "express";
import validator from "validator";

const validateSignUpData = (req: Request): void => {
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

export default validateSignUpData;
