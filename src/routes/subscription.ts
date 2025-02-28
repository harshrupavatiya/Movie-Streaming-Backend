import express from "express";
import { memberSubscription } from "../controllers/subscription";

const subscriptionRouter = express.Router()

subscriptionRouter.post('/memberSubscription', memberSubscription);

export default subscriptionRouter;