import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../types/db";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import dotenv from "dotenv";

dotenv.config();

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 2,
      maxLength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      maxLength: 254,
      validate(value: string) {
        if (!validator.isEmail(value)) {
          throw new Error(`Invalid email address: ${value}`);
        }
      },
    },
    contactNo: {
      type: String,
      trim: true,
      minLength: 10,
      maxLength: 10,
    },
    password: {
      type: String,
      required: true,
      minLength: 2,
      maxLength: 60,
    },
    profilePicture: {
      type: String,
      default: "https://geographyandyou.com/images/user-profile.png",
      validate(value: string) {
        if (!validator.isURL(value)) {
          throw new Error(`Invalid Photo URL: ${value}`);
        }
      },
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      startDate: {
        type: Date,
      },
      endDate: {
        type: Date,
      },
    },
    watchlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Movie",
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
);

// Method for get JWT token
userSchema.methods.getJWT = async function (): Promise<string> {
  const user = this as IUser;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET as string, {
    expiresIn: "7d",
  });
  return token;
};

// Method for validate password
userSchema.methods.validatePassword = async function (
  passwordInputByUser: string
): Promise<boolean> {
  const user = this as IUser;
  return bcrypt.compare(passwordInputByUser, user.password);
};

const User: Model<IUser> = mongoose.model<IUser>("User", userSchema);
export default User;
