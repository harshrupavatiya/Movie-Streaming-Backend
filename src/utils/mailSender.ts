import nodemailer from "nodemailer";
import { MailFrom } from "./constants";

interface MailOptions {
  email: string;
  title: string;
  body: string;
}

const mailSender = async ({ email, title, body }: MailOptions): Promise<void> => {
  try {
    // created mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST as string,
      auth: {
        user: process.env.MAIL_USER as string,
        pass: process.env.MAIL_PASS as string,
      },
    });

    // sending mail via transporter
    const info = await transporter.sendMail({
      from: MailFrom,
      to: email,
      subject: title,
      html: body,
    });

    console.log("Email sent:", info);
  } catch (error) {
    console.error("Error sending email:", (error as Error).message);
  }
};

export default mailSender;
