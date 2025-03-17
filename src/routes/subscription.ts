import express from "express";
import { memberSubscription } from "../controllers/subscription";
import { stripeWebhook } from "../modules/subscription/stripeWebhook";
import { userAuth } from "../modules/auth/auth.middleware";
const subscriptionRouter = express.Router()

subscriptionRouter.post('/memberSubscription', userAuth, memberSubscription);

subscriptionRouter.post('/stripeWebhook', stripeWebhook)

export default subscriptionRouter;