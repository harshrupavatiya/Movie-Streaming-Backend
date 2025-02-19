import dotenv from "dotenv";
dotenv.config();

export const JWT_SIGNUP_SECRET = process.env.JWT_SIGNUP_SECRET;
export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT;
export const JWT_FORGOT_PASS_SECRET = process.env.JWT_FORGOT_PASS_SECRET
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const MAIL_PORT = process.env.MAIL_PORT;