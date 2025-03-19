import express from 'express';
import { authController } from '../../modules/auth';
import validate from '../../modules/validate/validate.middleware';
import authValidation from '../../modules/auth/auth.validation';

const authRouter = express.Router();

authRouter.post('/login', validate(authValidation.login), authController.login);
authRouter.route('/generateOTP').post(authController.generateOTP);
authRouter.route('/signup').post(authController.signUp);
authRouter.route('/logout').post(authController.logout);
authRouter.route('/sendResetPasswordMail').post(authController.sendMailResetPassword);
authRouter.route('/password').put(authController.resetPassword);

export default authRouter;
