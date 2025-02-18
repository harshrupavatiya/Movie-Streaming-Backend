import nodemailer from "nodemailer";
import { MailFrom } from "./constants";
import dotenv from "dotenv";
dotenv.config();

const mailSender = async ( email: string, title: string, body: string ): Promise<void> => {
  try {
    // created mail transporter
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST as string,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_PORT === "465",
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
    console.error("Error sending email:", (error as Error));
  }
};

export default mailSender;
