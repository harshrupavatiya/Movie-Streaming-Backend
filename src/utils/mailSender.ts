import nodemailer from "nodemailer";
import { MailFrom } from "./constants";
import dotenv from "dotenv";
dotenv.config();

const mailSender = (email: string, title: string, body: string): void => {
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
    transporter
      .sendMail({
        from: MailFrom,
        to: email,
        subject: title,
        html: body,
      })
      .then((val) => {
        console.log("Email sent:", val);
      })
      .catch((err) => {
        console.log("Error : ", err.message);
      });
  } catch (error) {
    console.error("Error sending email:", error as Error);
  }
};

export default mailSender;
