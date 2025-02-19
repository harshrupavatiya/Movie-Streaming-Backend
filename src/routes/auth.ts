import express from "express";
import { forgotPassword, generateOTP, login, logout, signUp } from "../controllers/auth"

const authRouter = express.Router();

// Route for user login
authRouter.post("/login", login);

// Route for user signup
authRouter.post("/signup", signUp);

// Route for Generate OTP + validating user given info
authRouter.post("/generateOTP", generateOTP);

// Route for Logout
authRouter.post("/logout", logout);

authRouter.post("/forgotPass", forgotPassword);

export default authRouter;
