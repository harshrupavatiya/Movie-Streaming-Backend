import nodemailer from "nodemailer";
import { MailFrom } from "./constants";
import { MAIL_HOST, MAIL_PASS, MAIL_PORT, MAIL_USER } from "./envProvider";

const mailSender = (email: string, title: string, body: string): void => {
  try {
    // created mail transporter
    const transporter = nodemailer.createTransport({
      host: MAIL_HOST as string,
      port: Number(MAIL_PORT) || 587,
      secure: Number(MAIL_PORT) === 465,
      auth: {
        user: MAIL_USER as string,
        pass: MAIL_PASS as string,
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
