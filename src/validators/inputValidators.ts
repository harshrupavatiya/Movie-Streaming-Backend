import mongoose from "mongoose";
import validator from "validator";

export const validateName = (name: string): void => {
  if(!name) {
    throw new Error("Name is required field");
  }
  const nameRegex = /^[A-Za-z ]+$/;
  if (!nameRegex.test(name)) {
    throw new Error("Name is not valid");
  }
};

export const validateEmail = (email: string): void => {
  if(!email) {
    throw new Error("email is required field");
  }
  if (!validator.isEmail(email)) {
    throw new Error("Email is not valid!");
  }
};

export const validatePassword = (password: string): void => {
  if(!password) {
    throw new Error("password is required field");
  }
  if (!validator.isStrongPassword(password)) {
    throw new Error("Please enter a strong password!");
  }
};

export const validateContactNo = (contactNo: string): void => {
  if(!contactNo) {
    throw new Error("contactNo is required field");
  }
  if (!validator.isMobilePhone(contactNo)) {
    throw new Error("Contact number is not valid!");
  }
};

export function isValidISOBirthDate(dateString: string): void {
  const date = new Date(dateString);
  const today = new Date();

  if (!(date instanceof Date) || isNaN(date.getTime()) || date > today) {
    throw new Error("Birthdate Is not valid");
  }
}
export function isValidISOReleaseDate(dateString: string): void {
  const date = new Date(dateString);
  const today = new Date();

  if (!(date instanceof Date) || isNaN(date.getTime()) || date > today) {
    throw new Error("Releasedate Is not valid");
  }
}

export function isValidISODate(dateString: string): void {
  const date = new Date(dateString);

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error("Date is not valid");
  }
}

export const validateGender = (gender: string): void => {
  if (!["male", "female", "other", "prefer not to say"].includes(gender))
    throw new Error("Invalid Gender value");
};

export const validateContentTitle = (title: string): void => {
  const titleRegex = /^[a-zA-Z0-9\s:,'&\-().!?]+$/;
  if (!titleRegex.test(title)) {
    throw new Error("Invaild symbol");
  }
};

export const validateGenres = (genres: string[]): void => {
  const isCorrect = genres.every(genre => validator.isNumeric(genre));
  if (genres.length <= 0 || !isCorrect) {
    throw new Error("Every genres id should be in number(type)");
  }
};

export const validateLanguage = (languages: string[]): void => {
  const languageReqExp = /^[A-Za-z ]+$/;
  if (languages.length <= 0 || !languages.every((language) => languageReqExp.test(language))) {
    throw new Error("Language should contain alphabetic character");
  }
};

export const isValidateObjectId = (id: string): boolean => {
  if(validator.isMongoId(id)) {
    return false;
  }
  return true;
};