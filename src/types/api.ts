import { Request } from "express";
import { IEpisode, ISeries, IUser } from "./db.model";

interface IPagination {
  skipDocNumber: number;
  limitNumber: number;
}
export interface AuthRequest extends Request {
  user?: IUser;
  seriesPayload?: Partial<ISeries>;
  episodePayload?: Partial<IEpisode>;
  pagination?: IPagination;
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