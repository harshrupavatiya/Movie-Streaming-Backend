import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import {
  validateEmail,
  validateSignUpData,
  validateUserData,
} from "../validators/newUserData";
import { AuthRequest } from "../types/api";
import OTP from "../models/otp";
import { IOTP, IUser } from "../types/db.model";
import otpGenerator from "otp-generator";
import {
  JWT_FORGOT_PASS_SECRET,
  JWT_SIGNUP_SECRET,
} from "../utils/envProvider";
import { Frontend_Base_URL } from "../utils/constants";
import mailSender from "../utils/mailSender";
import { forgotPassTemplate } from "../utils/mailTemplates";

// LOGIN
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    // Get data from req body
    const { email, password } = req.body;

    // Check if user email exists
    const user = await User.findOne({ email });

    // If user does not exist with the given email
    if (!user) {
      return res.status(500).json({ message: "Incorrect Email or Password" });
    }

    // Validate password
    const isPasswordValid = await user.validatePassword(password);

    // If password is invalid
    if (!isPasswordValid) {
      return res.status(500).json({ message: "Incorrect Email or Password" });
    }

    // generate user token
    const token = await user.getJWT(JWT_SIGNUP_SECRET as string, "7d");

    // set token into cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const { _id, name, contactNo } = user;

    return res.status(200).json({
      message: "Login Successfully",
      data: {
        userData: {
          _id,
          name,
          email,
          contactNo,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

// SIGNUP
export const signUp = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response | any> => {
  try {
    // Validate signup data
    validateSignUpData(req);

    // Extract user details
    const { name, email, contactNo, password, otp } = req.body;

    // validate otp
    const otpInfo: IOTP | null = await OTP.findOne({ otp: otp });

    if (!otpInfo) {
      return res.status(500).json({ message: "Invalid OTP" });
    }

    // validating Email
    if (otpInfo.email !== email) {
      return res.status(500).json({ message: "Incorrect Email" });
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

    return res.status(200).json({ message: "SignUp successfully" });
  } catch (err: any) {
    return res.status(500).json({ message: err.message });
  }
};

export const generateOTP = async (
  req: Request,
  res: Response
): Promise<Response | any> => {
  try {
    // Validate signup data
    validateUserData(req);

    // Extract user details
    const { name, email, contactNo, password } = req.body;

    // Check if user exists with given email
    const user: IUser | null = await User.findOne({ email });

    // If user already exists with entered email
    if (user) {
      return res.status(500).json({ message: "Email already used" });
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

    console.log("Generated OTP:", numericOtp);

    await OTP.create({
      email,
      otp: numericOtp,
    });

    res.status(200).json({ message: "OTP generated successfully" });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response): Promise<any> => {
  // set token as null in cookie
  res.cookie("token", null, { expires: new Date(Date.now()) });

  res.status(200).json({ message: "User logout successfully" });
};

// Forgot Password
export const forgotPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { email } = req.body;

  validateEmail(email);

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const forgotPassToken = await user.getJWT(
    JWT_FORGOT_PASS_SECRET as string,
    "1h"
  );

  const forgotPassLink =
    Frontend_Base_URL + `/reset-password?token=${forgotPassToken}`;

  // send mail with Forgot Password Link
  mailSender(
    email,
    "Reset password of your Filmster account",
    forgotPassTemplate(forgotPassLink as string)
  );

  return res.status(200).json({ message: "Link sent at given email address" });
};
