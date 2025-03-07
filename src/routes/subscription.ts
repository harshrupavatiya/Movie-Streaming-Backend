import express from "express";
import { memberSubscription, verifyPayment } from "../controllers/subscription";

const subscriptionRouter = express.Router()

subscriptionRouter.get('/verifypayment', verifyPayment);
subscriptionRouter.post('/memberSubscription', memberSubscription);

// subscriptionRouter.post('/stripeWebhook', stripeWebhook)

export default subscriptionRouter;