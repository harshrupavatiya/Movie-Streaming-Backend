import { Request } from "express";
import { IUser } from "./db.model";

export interface AuthRequest extends Request {
  user?: IUser;
}

export interface IEditDetails {
  name?: string;
  contactNo?: string;
  profilePicture?: string;
  dateOfBirth?: Date;
  gender?: "" | "male" | "female" | "other" | "prefer not to say";
}