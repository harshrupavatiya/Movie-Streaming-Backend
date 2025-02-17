import { Request } from "express";
import { IUser } from "./db.model";

export interface AuthRequest extends Request {
  user?: IUser;
}
