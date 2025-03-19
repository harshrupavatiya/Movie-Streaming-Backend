import mongoose from "mongoose";
import { mediaInterface } from "../media";
import { userInterface } from "../user";
import { Request } from "express";
import { episodeInterface } from "../episode";

interface IPaginate {
    skipDocNumber: number;
    limitNumber: number;
  }

export interface AuthRequest extends Request {
  user?: userInterface.IUser;
  mediaPayload?: mediaInterface.IMedia;
  pagination?: IPaginate;
  episodePayload?: episodeInterface.IEpisode;
}

export interface IOTP extends Document {
  email: string;
  otp: number;
  createdAt: Date;
}

export interface IForgotPasswordToken extends Document {
  userId: mongoose.Types.ObjectId;
  token: string;
  email: string;
  createdAt: Date;
}