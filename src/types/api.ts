import { Request } from "express";
import { IUser } from "./db";

export interface AuthRequest extends Request {
  user?: IUser;
}
