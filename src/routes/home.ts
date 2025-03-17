import express from "express";
import {getTrendingContent} from "../controllers/home";
import { userAuth } from "../modules/auth/auth.middleware";
const homeRouter = express.Router();

homeRouter.get("/getTrendingContent", userAuth, getTrendingContent);


export default homeRouter;