import express from "express";
import { getAllDirectors, addOrUpdateDirector, deleteDirector, } from "../controllers/director";
import { userAuth } from "../middlewares/Auth";
const directorRouter = express.Router();

directorRouter.get("/getAllNames", userAuth , getAllDirectors);
directorRouter.post("/addOrUpdate", userAuth, addOrUpdateDirector);
directorRouter.delete("/delete/:directorId", userAuth, deleteDirector);

export default directorRouter;
