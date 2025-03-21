import express from 'express';
import { authController } from '../../modules/auth';
import validate from '../../modules/validate/validate.middleware';
import authValidation from '../../modules/auth/auth.validation';

const authRouter = express.Router();

authRouter.post('/login', validate(authValidation.login), authController.login);
authRouter.post('/generateOTP', validate(authValidation.generateOTP),authController.generateOTP);
authRouter.post('/signup', validate(authValidation.signUp),authController.signUp);
authRouter.post('/logout',authController.logout);
authRouter.post('/sendResetPasswordMail', validate(authValidation.sendMailResetPassword),authController.sendMailResetPassword);
authRouter.put('/resetPassword',validate(authValidation.resetPassword),authController.resetPassword);

export default authRouter;
