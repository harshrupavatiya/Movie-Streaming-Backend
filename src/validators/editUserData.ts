import { Request } from "express";
import { isValidISOBirthDate, validateContactNo } from "./inputValidators";

export const isValidField = (req: Request) => {
  try {
    const { name, contactNo, dateOfBirth, gender } = req.body;
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
      isValidISOBirthDate(dateOfBirth.toString());
      flag = true;
    }
    if (gender) {
      const isGender = [
        "male",
        "female",
        "other",
        "prefer not to say",
      ].includes(gender);
      if (!isGender) throw new Error("Invalid Gender value");
      flag = true;
    }

    if (!flag) throw new Error("Invalid data");
  } catch (err) {
    throw err;
  }
};
