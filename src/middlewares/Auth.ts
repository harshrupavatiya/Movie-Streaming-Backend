import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { AuthRequest } from "../types/api";
import { JWT_SIGNUP_SECRET } from "../utils/envProvider";

const userAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<string | any> => {
  try {
    // Getting token from cookies
    const { token } = req.cookies;

    // If token not present in cookies
    if (!token) {
      return res.status(401).json({ message: "Please Login" });
    }

    // Decoding token
    const decodedObj = jwt.verify(token, JWT_SIGNUP_SECRET as string) as {
      _id: string;
    };

    // Extract UserID from decoded token
    const { _id } = decodedObj;

    // Finding user in collection
    const user = await User.findById(_id);

    // If user is not present
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Passing user info to the next controller
    req.user = user;
    next();
  } catch (err: any) {
    res.status(400).json({ message: err.message });
  }
};

export { userAuth };
