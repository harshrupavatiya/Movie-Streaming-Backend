import express from "express";
import { authController } from "../../modules/auth";

const authRouter = express.Router();

authRouter.route('/login').post(authController.login);
authRouter.route('/generateOTP').post(authController.generateOTP);
authRouter.route('/signup').post(authController.signUp);
authRouter.route('/logout').post(authController.logout);
authRouter.route('/sendResetPasswordMail').post(authController.sendMailResetPassword);
authRouter.route('/password').put(authController.resetPassword);

export default authRouter;