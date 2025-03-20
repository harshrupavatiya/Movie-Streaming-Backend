import mongoose, { Document } from 'mongoose';

export interface ICrew extends Document {
  name: string;
  gender?: 'male' | 'female' | 'other' | '' | 'prefer not to say';
  role: 'Cast' | 'Director';
  profilePicture?: string;
  dateOfBirth?: Date;
  designation: 'Cast' | 'Director';
  nationality?: string;
  isDeleted?: boolean;
  media?: mongoose.Types.ObjectId[];
}

export interface IEditCrewReqBody {
  crewId?: string;
  name?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer not to say';
  dateOfBirth?: string;
  nationality?: string;
}
