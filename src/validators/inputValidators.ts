import validator from "validator";

export const validateName = (name: string): void => {
  const nameRegex = /^[A-Za-z ]+$/;
  if (!nameRegex.test(name)) {
    throw new Error("Name is not valid");
  }
};

export const validateEmail = (email: string): void => {
  if (!validator.isEmail(email)) {
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

export function isValidISOBirthDate(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();

  return date instanceof Date && !isNaN(date.getTime()) && date <= today;
}

export function isValidISODate(dateString: string): boolean {
  const date = new Date(dateString);

  return date instanceof Date && !isNaN(date.getTime());
}