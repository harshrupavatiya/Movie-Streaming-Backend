import express from "express";
import { memberSubscription, verifyPayment } from "../controllers/subscription";
import { userAuth } from "../middlewares/Auth";

const subscriptionRouter = express.Router()

subscriptionRouter.post('/memberSubscription', memberSubscription);

subscriptionRouter.get('/verifyPayment', verifyPayment);

export default subscriptionRouter;