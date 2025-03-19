import express from 'express';
import { userAuth } from '../../modules/auth';
import { getPaginationInfo } from '../../modules/auth/paginate.middleware';
import { userController } from '../../modules/user';

const userRouter = express.Router();

userRouter.get('/profile', userAuth, userController.getUserInfo);

userRouter.put('/changePassword', userAuth, userController.changePassword);

userRouter.put('/editProfile', userAuth, userController.editProfile);

userRouter.get('/list', userAuth, getPaginationInfo, userController.getUserList);

userRouter.put('/updateRole', userAuth, userController.createAdmin);

userRouter.put('/updateActiveStatus', userAuth, userController.toggleUserIsActive);

export default userRouter;
