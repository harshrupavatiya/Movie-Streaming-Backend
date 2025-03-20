import mongoose, { Model, Schema } from 'mongoose';
import { ICrew } from './crew.interface';

const crewSchema = new Schema<ICrew>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
      index: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', '', 'prefer not to say'],
      default: '',
    },
    designation: {
      type: String,
      enum: ['Cast', 'Director'],
    },
    profilePicture: {
      type: String,
      default: 'https://geographyandyou.com/images/user-profile.png',
    },
    dateOfBirth: {
      type: Date,
    },
    nationality: {
      type: String,
    },
    media: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Media',
        default: [],
      },
    ],
  },
  { timestamps: true }
);

const Crew: Model<ICrew> = mongoose.model<ICrew>('Crew', crewSchema);

export default Crew;
