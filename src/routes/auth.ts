import express from "express";
import { login, signUp } from "../controllers/auth"

const authRouter = express.Router();

// Route for user login
authRouter.post("/login", login);

// Route for user signup
authRouter.post("/signup", signUp);

export default authRouter;
