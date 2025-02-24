import { Request } from "express";
import { isValidISODate, validateContactNo } from "./inputValidators";

export const isValidField = (req: Request) => {
  const { name, contactNo, profilePicture, dateOfBirth, gender } = req.body;
  let flag = false;

  if (name) {
    const nameRegex = /^[A-Za-z ]+$/;
    if (!nameRegex.test(name)) {
      throw new Error("Name is not valid");
    }
    flag = true;
  }
  if (contactNo) {
    validateContactNo(contactNo);
    flag = true;
  }
  if (dateOfBirth) {
    isValidISODate(dateOfBirth.toString());
    flag = true;
  }
  if (gender) {
    const isGender = ["male", "female", "other", "prefer not to say"].includes(
      gender
    );
    if(!isGender) throw new Error("Invalid Gender value");
    flag = true;
  }
  // TODO: update profile picture

  if(!flag) throw new Error ("Invalid data");
};
