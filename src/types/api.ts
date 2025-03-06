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

export interface ICastInputData {
  name: string;
  birthDate?: string;
  nationality?: string;
  gender?: string;
  profilePicture?: string;
}

export interface IDirectorInputData { 
  name: string;
  birthDate?: string;
  nationality?: string;
  gender?: string;
  profilePicture?: string;
}