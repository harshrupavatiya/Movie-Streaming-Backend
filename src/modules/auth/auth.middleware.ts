import { Response, NextFunction, Request } from "express";
import { User, userService } from "../user";
import passport from "passport";
// import httpStatus from "http-status";
import { roleRights } from "../../config/roles";
import { IUser } from "../user/user.interfaces";
import { AuthRequest } from "../../types/api";
import { JWT_SIGNUP_SECRET } from "../utils/envProvider";
import jwt from "jsonwebtoken";

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

const verificationCallback =
  (
    req: Request,
    resolve: () => void,
    reject: (error: unknown) => void,
    requiredRights: string[]
  ) =>
  async (err: Error, user: IUser, info: string) => {
    console.log("2");
    if (err || info || !user) {
      // return reject(new ApiError(httpStatus.UNAUTHORIZED, 'Please authenticate'));
      console.log("33");
      reject("please authenticate");
      return;
    }
    console.log("3");
    req.user = user;
    console.log("4");
    console.log("user", user);

    if (requiredRights.length) {
      const userRights = roleRights.get(user.role);
      if (!userRights) {
        // return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
        reject("please authenticate");
        return;
      }
      const hasRequiredRights = requiredRights.every((requiredRight: string) =>
        userRights.includes(requiredRight)
      );
      if (!hasRequiredRights) {
        // return reject(new ApiError(httpStatus.FORBIDDEN, 'Forbidden'));
      }
    }

    const currentUser = await userService.getUserById(user.id);
    console.log("currentUser====", currentUser);
    if (!currentUser) {
      // return reject(new ApiError(httpStatus.FORBIDDEN, 'User not found'));
      reject("fati gyo code");
      return;

    }

    req.user = currentUser;

    // checked user blocked or not
    // if (!req.user?.isActive) {
    //   // return reject(new ApiError(httpStatus.FORBIDDEN, 'Oops!, You are Deactivated by administrator')
    //   return;
    // }

    // // checked user deleted or not
    // if (req.user?.isDeleted) {
    //   // return reject(new ApiError(httpStatus.FORBIDDEN, 'FORBIDDEN'));
    //   return;
    // }

    resolve();
  };

export const authMiddleware =
  (...requiredRights: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    return new Promise<void>((resolve, reject) => {
      passport.authenticate(
        "jwt",
        { session: false },
        verificationCallback(req, resolve, reject, requiredRights)
      )(req, res, next);
    }).then(() => next())
    .catch((err) => next(err));
  };
