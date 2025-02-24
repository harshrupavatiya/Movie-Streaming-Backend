import express from "express";
import { changePassword, editProfile } from "../controllers/user";
import { userAuth } from "../middlewares/Auth";

const userRouter = express.Router();

userRouter.post("/changePassword", userAuth ,changePassword);

userRouter.post("/editProfile", userAuth, editProfile);

export default userRouter;