import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const signingSecret = process.env.STRIPE_SIGNING_SECRET_KEY!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {

    const sig = req.headers["stripe-signature"] as string;
    const payload = req.body;
    console.log(payload, "this is the payload");
    let event: Stripe.Event;

    try {
        if (!signingSecret) {
            throw new Error("STRIPE_WEBHOOK_SECRET is missing in .env file.");
        }

        event = stripe.webhooks.constructEvent(payload, sig, signingSecret);
        console.log(`🔔 Received event: ${event.type}`);

    } catch (err) {
        console.error(" Webhook verification failed:", err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
        return
    }

    console.log(event.type);
    console.log(event, "this is the event at line 36")


    switch (event.type) {
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            console.log(`Subscription ${subscription.id} was canceled.`);

            //  Update user subscription status in DB 


            break;
        }
        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerId = session.customer as string;
            const userEmail = session.customer_email;

            console.log(`✅ Subscription successful for ${userEmail}`);

            // Call a function to store user details in your DB

            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

