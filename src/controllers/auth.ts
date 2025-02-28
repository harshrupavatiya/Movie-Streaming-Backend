import { Request, Response, NextFunction } from "express";
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
import { JWT_RESET_PASS_SECRET, JWT_SIGNUP_SECRET } from "../utils/envProvider";
import { Frontend_Base_URL } from "../utils/constants";
import mailSender from "../utils/mailSender";
import { forgotPassTemplate } from "../utils/mailTemplates";
import jwt from "jsonwebtoken";

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
    console.log(name, email, contactNo, password, otp, "Body")

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

// validate data and send OTP
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

// Send mail for reset Password
export const sendMailResetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { email } = req.body;

    validateEmail(email);

    // find user in collection
    const user = await User.findOne({ email });

    // if user not exist
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // get JWT token for reset password
    const resetPassToken = await user.getJWT(
      JWT_RESET_PASS_SECRET as string,
      "1h"
    );

    // create frontend link for reset password
    const resetPassLink =
      Frontend_Base_URL + `/reset-password?token=${resetPassToken}`;

    // send mail with Reset Password Link
    mailSender(
      email,
      "Reset password of your Filmster account",
      forgotPassTemplate(resetPassLink as string)
    );

    return res
      .status(200)
      .json({ message: "Link sent at given email address" });
  } catch (err) {
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// Forgot password
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<any> => {
  try {
    const { token, password } = req.body;

    validatePassword(password);

    // if token not exist
    if (!token) {
      return res.status(400).json({ message: "Token invalid" });
    }

    // Decoding token
    const decodedObj = jwt.verify(token, JWT_RESET_PASS_SECRET as string) as {
      _id: string;
    };

    // Extract UserID from decoded token
    const { _id } = decodedObj;

    // Finding user in collection
    const user = await User.findById(_id);

    // If user is not present
    if (!user) {
      return res.status(400).json({ message: "Invalid user token" });
    }

    // password encryption
    const hashedPassword = await bcrypt.hash(password, 10);

    // update user document
    user.password = hashedPassword;

    // save user data
    await user.save();

    return res.status(200).json({ message: "Password has been updated" });
  } catch (err) {
    return res.status(500).json({ message: (err as Error).message });
  }
};
