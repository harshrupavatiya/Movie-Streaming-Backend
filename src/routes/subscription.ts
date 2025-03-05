import express from "express";
import { memberSubscription } from "../controllers/subscription";
import { userAuth } from "../middlewares/Auth";

const subscriptionRouter = express.Router()

subscriptionRouter.post('/memberSubscription', memberSubscription);

export default subscriptionRouter;