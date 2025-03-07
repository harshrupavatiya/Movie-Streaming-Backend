import mongoose, { Model, Schema } from "mongoose";
import { IUser } from "../types/db.model";
import jwt, { SignOptions } from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import type { StringValue } from "ms";

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
      immutable: true,
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
    dateOfBirth: {
      type: Date,
    },
    gender: {
      type: String,
      default: "",
      enum: ["male", "female", "other", "prefer not to say", ""],
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium"],
        default: "free",
      },
      billingCycle: {
        type: String,
        enum: ["monthly", "yearly", ""], // "" for free users
        default: "",
      },
      purchaseDate: {
        type: Date, // When the subscription was bought
      },
      startDate: {
        type: Date, // When the subscription starts
      },
      endDate: {
        type: Date, // When the subscription expires
      },
      stripeSessionId: {
        type: String,
        default: "",
      },
    },
    watchlist: [
      {
        contentId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "watchlist.contentType",
        },
        contentType: {
          type: String,
          enum: ["Movie", "Series"],
          required: true,
        },
      },
    ],
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    continueWatching: [
      {
        contentId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: "continueWatching.contentType",
        },
        contentType: {
          type: String,
          enum: ["Movie", "Episode"],
          required: true,
        },
        progress: {
          type: Number, // Time in seconds where the user stopped
          required: true,
          default: 0,
        },
        lastWatched: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
);

// Method for get JWT token
userSchema.methods.getJWT = async function (
  secret: string,
  duration: StringValue
): Promise<string> {
  const user = this as IUser;

  if (!secret) {
    throw new Error("Secret is not defined");
  }

  const options: SignOptions = {
    expiresIn: duration,
  };

  const token = jwt.sign({ _id: user._id }, secret, options);

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
