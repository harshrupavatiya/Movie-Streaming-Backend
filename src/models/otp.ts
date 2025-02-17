import mongoose, { Model, Schema } from "mongoose";
import { IOTP } from "../types/db.model";
const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expries: 5 * 60,
  },
});

const OTP: Model<IOTP> = mongoose.model<IOTP>("OTP", otpSchema);
export default OTP;
