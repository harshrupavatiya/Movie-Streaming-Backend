import express from "express";
import { changePassword, createAdmin, editProfile, getUserList, toggleUserIsActive } from "../controllers/user";
import { userAuth } from "../middlewares/Auth";

const userRouter = express.Router();

userRouter.put("/changePassword", userAuth ,changePassword);

userRouter.put("/editProfile", userAuth, editProfile);

userRouter.get("/getUserList", userAuth, getUserList);

userRouter.put("/createAdmin", userAuth, createAdmin);

userRouter.put("/toggleUserIsActive", userAuth, toggleUserIsActive);

export default userRouter;