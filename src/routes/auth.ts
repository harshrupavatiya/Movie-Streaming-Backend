import express from "express";
import { generateOTP, login, logout, resetPassword, sendMailResetPassword, signUp } from "../controllers/auth"

const authRouter = express.Router();

// Route for user login
authRouter.post("/login", login);

// Route for user signup
authRouter.post("/signup", signUp);

// Route for Generate OTP + validating user given info
authRouter.post("/generateOTP", generateOTP);

// Route for Logout
authRouter.post("/logout", logout);

// Route for mail sending of reset password
authRouter.post("/sendMailResetPassword", sendMailResetPassword);

// Route for Reset password
authRouter.post("/resetPassword", resetPassword);

export default authRouter;
