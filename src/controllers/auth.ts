import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import {
  validateSignUpData,
  validateUserData,
} from "../validators/newUserData";
import { validateEmail, validatePassword } from "../validators/inputValidators";
import { AuthRequest } from "../types/api";
import OTP from "../models/otp";
import { IOTP, IUser } from "../types/db.model";
import otpGenerator from "otp-generator";
import { JWT_SIGNUP_SECRET } from "../utils/envProvider";
import ForgotPasswordToken from "../models/forgotPasswordToken";
import { generateResetToken } from "../utils/generateToken";
import mailSender from "../utils/mailSender";
import {
  resetPasswordSuccessTemplate,
  signUpSuccessTemplate,
} from "../utils/mailTemplates";

// LOGIN--------------------------------------------------------------------------------------------------
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Get data from req body
    const { email, password } = req.body;
    console.log(email, password)

    // Check if user email exists
    const user = await User.findOne({ email });

    // If user does not exist with the given email
    if (!user) {
      res.status(500).json({ message: "Incorrect Email or Password" });
      return;
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);

    // If password is invalid
    if (!isPasswordValid) {
      res.status(500).json({ message: "Incorrect Email or Password" });
      return;
    }

    // generate user token
    const token = await user.getJWT(JWT_SIGNUP_SECRET as string, "7d");

    // set token into cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    res.status(200).json({
      message: "Login Successfully",
      data: {
        userData: {
          _id: user._id,
          name: user.name,
          email: user.email,
          contactNo: user.contactNo,
          role: user.role,
        },
      },
    });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};

// Generate OTP-------------------------------------------------------------------------------------------
export const generateOTP = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validate signup data
    validateUserData(req.body);

    // Extract user details
    const { email } = req.body;

    // Check if user exists with given email
    const user: IUser | null = await User.findOne({ email });

    // If user already exists with entered email
    if (user) {
      res.status(500).json({ message: "Email already used" });
      return;
    }

    // generate OTP
    let numericOtp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // if generated OTP is present then  generate new OTP (OTP should be unique)
    let otpInfo = await OTP.findOne({ otp: numericOtp });

    while (otpInfo) {
      numericOtp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      otpInfo = await OTP.findOne({ otp: numericOtp });
    }

    await OTP.create({
      email,
      otp: numericOtp,
    });

    res.status(200).json({ message: "OTP generated successfully" });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};

// SIGNUP-------------------------------------------------------------------------------------------------
export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate signup data
    validateSignUpData(req.body);

    // Extract user details
    const { name, email, contactNo, password, otp } = req.body;

    // validate otp
    const otpInfo: IOTP | null = await OTP.findOne({ otp: otp });

    if (!otpInfo) {
      res.status(500).json({ message: "Invalid OTP" });
      return;
    }

    // validating Email
    if (otpInfo.email !== email) {
      res.status(500).json({ message: "Incorrect Email" });
      return;
    }

    // Password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      name,
      email,
      contactNo,
      password: hashedPassword,
    });

    mailSender(email, "Welcome to Our Filmster", signUpSuccessTemplate());

    res.status(200).json({ message: "SignUp successfully" });
    return;
  } catch (err: any) {
    res.status(500).json({ message: err.message });
    return;
  }
};

// Logout-------------------------------------------------------------------------------------------------
export const logout = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  // set token as null in cookie
  res.cookie("token", null, { expires: new Date(Date.now()) });

  res.status(200).json({ message: "User logout successfully" });
  return;
};

// Send mail for reset Password-------------------------------------------------------------------------------------------------
export const sendMailResetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { email } = req.body;

    validateEmail(email);

    // find user in collection
    const user = await User.findOne({ email });

    // if user not exist
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    let resetPassToken = generateResetToken();

    let isTokenExists = await ForgotPasswordToken.findOne({
      token: resetPassToken,
    });

    while (isTokenExists) {
      resetPassToken = generateResetToken();

      isTokenExists = await ForgotPasswordToken.findOne({
        token: resetPassToken,
      });
    }

    const forgotPassToken = new ForgotPasswordToken({
      token: resetPassToken,
      userId: user._id,
      email,
    });
    await forgotPassToken.save();

    res.status(200).json({ message: "Link sent at given email address" });
    return;
  } catch (err) {
    res.status(500).json({ message: "Something went wrong" });
    return;
  }
};

// Forgot password-------------------------------------------------------------------------------------------------
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, password } = req.body;

    validatePassword(password);

    // if token not exist
    if (!token) {
      res.status(400).json({ message: "Token invalid" });
      return;
    }

    const forgotPassToken = await ForgotPasswordToken.findOne({
      token,
    });

    if (!forgotPassToken) {
      res.status(400).json({ message: "Invalid Public token" });
      return;
    }
    const { userId } = forgotPassToken;

    // Finding user in collection
    const user = await User.findById(userId.toString());

    // If user is not present
    if (!user) {
      res.status(400).json({ message: "Invalid user token" });
      return;
    }

    // password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user document
    user.password = hashedPassword;

    // save user data
    await user.save();

    mailSender(
      user.email,
      "Password Reset Successful",
      resetPasswordSuccessTemplate()
    );

    res.status(200).json({ message: "Password has been updated" });
    return;
  } catch (err) {
    res.status(500).json({ message: (err as Error).message });
    return;
  }
};
