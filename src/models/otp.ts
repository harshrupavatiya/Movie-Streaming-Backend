import mongoose, { Model, Schema } from "mongoose";
import { IOTP } from "../types/db.model";
import mailSender from "../utils/mailSender";
import { otpTemplate } from "../utils/mailTemplates";
const otpSchema = new Schema<IOTP>({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: Number,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 5 * 60,
  },
});

// a function -->send emails
async function sendVerificationEmail(email: string, otp: number):Promise<void> {
  try {
    const mailResponse = await mailSender(
      email,
      "verification from Filmster",
      otpTemplate(otp)
    );
    console.log("Email sent Successfully: ", mailResponse);
  } catch (error) {
    console.log("error occurred while sending mails: ", error);
    throw error;
  }
}

// Pre hook -> otpMail will send before saving otp in DB collection
otpSchema.pre("save", async function (next) {
  if (this.isNew) {
    await sendVerificationEmail(this.email, this.otp);
  }
  next();
});

const OTP: Model<IOTP> = mongoose.model<IOTP>("OTP", otpSchema);
export default OTP;
