import dotenv from 'dotenv';
dotenv.config();

export const JWT_SIGNUP_SECRET = process.env.JWT_SIGNUP_SECRET;
export const DB_URL = process.env.DB_URL;
export const PORT = process.env.PORT;
export const MAIL_HOST = process.env.MAIL_HOST;
export const MAIL_USER = process.env.MAIL_USER;
export const MAIL_PASS = process.env.MAIL_PASS;
export const MAIL_PORT = process.env.MAIL_PORT;

export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
