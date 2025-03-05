import express from "express";
import {
  searchDirectorByName,
  addOrUpdateDirector,
  deleteDirector,
} from "../controllers/director";
import { userAuth } from "../middlewares/Auth";
const directorRouter = express.Router();

directorRouter.post("/getDirectorNames", userAuth, searchDirectorByName);
directorRouter.post("/addOrUpdate", userAuth, addOrUpdateDirector);
directorRouter.delete("/delete/:directorId", userAuth, deleteDirector);

export default directorRouter;
