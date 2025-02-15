import { Request, Response, NextFunction } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import validateSignUpData from "../validators/signupData";

// LOGIN
export const login = async (req: Request, res: Response): Promise<any> => {
  try {
    // Get data from req body
    const { email, password } = req.body;

    // Check if user email exists
    const user = await User.findOne({ email }).select("-password");

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
    const token = await user.getJWT();

    // set token into cookie
    res.cookie("token", token, {
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // TODO: remove unnessesory fields from response data
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
    const { name, email, contactNo, password } = req.body;

    // Check if user exists with given email
    const user = await User.findOne({ email });

    // If user already exists with entered email
    if (user) {
      return res.status(500).json({ message: "Email already used" });
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
