import express from "express";
import { memberSubscription } from "../controllers/subscription";
import { userAuth } from "../middlewares/Auth";
import { stripeWebhook } from "../webhook/stripeWebhook";

const subscriptionRouter = express.Router()

subscriptionRouter.post('/memberSubscription', memberSubscription);

subscriptionRouter.post('/stripeWebhook', stripeWebhook)

export default subscriptionRouter;