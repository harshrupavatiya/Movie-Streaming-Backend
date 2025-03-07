import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { AuthRequest } from "../types/api";
import { JWT_SIGNUP_SECRET } from "../utils/envProvider";

export const userAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    // Getting token from cookies
    const { token } = req.cookies;

    // If token not present in cookies
    if (!token) {
      res.status(401).json({ message: "Please Login" });
      return;
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
      res.status(400).json({ message: "User not found" });
      return;
    }

    if (!user.isActive) {
      res.status(500).json({ message: "Access denied, user is inactive" });
      return;
    }

    // Passing user info to the next controller
    req.user = user;
    next();
  } catch (err) {
    res.status(400).json({ message: (err as Error).message });
    return;
  }
};
