import express from "express";
import { changePassword, createAdmin, editProfile, getUserInfo, getUserList, toggleUserIsActive } from "../controllers/user";
import { userAuth } from "../middlewares/Auth";

const userRouter = express.Router();

userRouter.get("/profile", userAuth, getUserInfo);

userRouter.put("/changePassword", userAuth ,changePassword);

userRouter.put("/editProfile", userAuth, editProfile);

userRouter.get("/list", userAuth, getUserList);

userRouter.put("/updateRole", userAuth, createAdmin);

userRouter.put("/updateActiveStatus", userAuth, toggleUserIsActive);

export default userRouter;