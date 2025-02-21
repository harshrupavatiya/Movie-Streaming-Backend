import express from "express";
import { changePassword } from "../controllers/user";
import { userAuth } from "../middlewares/Auth";

const userRouter = express.Router();

userRouter.post("/changePassword", userAuth ,changePassword);

export default userRouter;