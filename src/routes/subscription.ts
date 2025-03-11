import express from "express";
import { memberSubscription, varifyPayment } from "../controllers/subscription";
import { stripeWebhook } from "../webhook/stripeWebhook";
import { userAuth } from "../middlewares/Auth";
const subscriptionRouter = express.Router()

subscriptionRouter.post('/memberSubscription', userAuth, memberSubscription);

subscriptionRouter.post('/stripeWebhook', stripeWebhook)

subscriptionRouter.get("/verifyPayment", userAuth, varifyPayment);

export default subscriptionRouter;