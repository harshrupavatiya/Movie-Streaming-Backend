import express from "express";
import {getTrendingContent} from "../controllers/home";
import { userAuth } from "../middlewares/Auth";
const homeRouter = express.Router();

homeRouter.get("/getTrendingContent", userAuth, getTrendingContent);


export default homeRouter;