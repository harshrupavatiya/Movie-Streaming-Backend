import express from "express";
import { searchContent } from "../controllers/search";
import { userAuth } from "../middlewares/Auth";

const searchrouter = express.Router();

searchrouter.get("/", userAuth, searchContent);

export default searchrouter;
