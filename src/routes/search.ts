import express from "express";
import { searchContent } from "../controllers/search";
import { userAuth } from "../modules/auth/auth.middleware";

const searchRouter = express.Router();

searchRouter.get("/", userAuth, searchContent);

export default searchRouter;
