import mongoose, { Model, Schema } from 'mongoose';
import { IForgotPasswordToken } from './auth.interface';
import { Frontend_Base_URL } from '../../utils/constants';
import { forgotPassTemplate } from '../../utils/mailTemplates';
import mailSender from '../../utils/mailSender';

const forgotPasswordTokenSchema = new Schema<IForgotPasswordToken>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
    expires: 60 * 60 * 60,
  },
});

// a function -->send emails
async function sendForgotPasswordEmail(email: string, token: string): Promise<void> {
  try {
    // create frontend link for reset password
    const resetPassLink = Frontend_Base_URL + `/reset-password?token=${token}`;

    // send mail with Reset Password Link
    mailSender(
      email,
      'Reset password of your Filmster account',
      forgotPassTemplate(resetPassLink as string)
    );
  } catch (error) {
    console.log('error occurred while sending mails: ', error);
    throw error;
  }
}

// Pre hook -> otpMail will send before saving otp in DB collection
forgotPasswordTokenSchema.pre('save', async function (next) {
  if (this.isNew) {
    await sendForgotPasswordEmail(this.email, this.token);
  }
  next();
});

const ForgotPasswordToken: Model<IForgotPasswordToken> = mongoose.model<IForgotPasswordToken>(
  'ForgotPasswordToken',
  forgotPasswordTokenSchema
);
export default ForgotPasswordToken;
