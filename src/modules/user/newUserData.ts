import { validateContactNo, validateEmail, validateName, validatePassword } from "./inputValidators";

interface IUserRequiredField {
  name: string;
  email: string;
  password: string;
  contactNo: string;
  otp?: number;
}

export const validateUserData = (reqBody: IUserRequiredField): void => {
  // Extract data
  const { name, email, password, contactNo } = reqBody;

  // If Name not present
  validateName(name);

  validateContactNo(contactNo);

  validateEmail(email);

  validatePassword(password);
};

export const validateSignUpData = (reqBody: Required<IUserRequiredField>): void => {
  // validate name, email, contactNo, password
  validateUserData(reqBody);

  const { otp } = reqBody;

  const otpRegex = /^\d{6}$/;

  // validating OTP
  if (!otpRegex.test(otp.toString())) {
    throw new Error("Invalid OTP format");
  }
};
