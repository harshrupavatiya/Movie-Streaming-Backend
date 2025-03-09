import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/user";

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const signingSecret = process.env.STRIPE_SIGNING_SECRET_KEY!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {

    console.log("stripeWebhook hited line 16")

    const sig = req.headers["stripe-signature"] as string;

    //convert buffer into string because stripe only accept string not json
    const payload = req.body.toString();

    // console.log(payload, "this is the payload");
    let event: Stripe.Event;

    try {
        if (!signingSecret) {
            throw new Error("STRIPE_WEBHOOK_SECRET is missing in .env file.");
        }

        event = stripe.webhooks.constructEvent(payload, sig, signingSecret);
        // console.log(` Received event: ${event.type}`);

    } catch (err) {
        console.error("line 35 Webhook verification failed:", err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
        return
    }
    console.log(event);
    console.log(`${event.type}, this is the event at line 41`)


    switch (event.type) {
        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            console.log(`This is the details of event data object ${subscription}`)
            console.log(`line 46 Subscription ${subscription.id} `);
            console.log(`line 47 Customer ID: ${customerId}`);

            //  Update user subscription status in DB 
            break;
        }
        case "customer.subscription.deleted": {
            console.log("entered customer subscription deleted")
            const subscription = event.data.object as Stripe.Subscription;
            const customerEmail = subscription.metadata?.email; // Assuming email is stored in metadata
            console.log(subscription, "line 58");
            if (!customerEmail) {
                console.error("Customer email not found in metadata");
                break;
            }

            try {
                // Find the user by email and update the subscription details
                const updatedUser = await User.findOneAndUpdate(
                    { email: customerEmail }, // Find user by email
                    {
                        $set: {
                            "subscription.plan": "free",
                            "subscription.billingCycle": "",
                            "subscription.startDate": null,
                            "subscription.endDate": null,
                        },
                    },
                    { new: true }
                );

                if (updatedUser) {
                    console.log(`User subscription canceled.LINE 80 Updated user:`, updatedUser);
                } else {
                    console.error(`User not found for email: ${customerEmail}`);
                }
            } catch (error) {
                console.error("Error updating user subscription on cancellation:", error);
            }
            break;
        }


        case "customer.subscription.created": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            console.log(subscription, "line 58")
            console.log(`line 59 New Subscription Created: ${subscription.id}`);
            console.log(`line 60 Customer ID: ${customerId}`);
            console.log(`line 61 Status: ${subscription.status}`);
            break;
        }

        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log(session, "here is the session");
            const customerId = session.customer as string;
            // const userID = session.metadata.userId;
            const customerEmail = session.customer_details?.email;
            const subscriptionId = session.subscription as string;

            if (!customerEmail || !subscriptionId) {
                console.error("Missing customer email or subscription ID");
                break;
            }
            try {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const plan = subscription.items.data[0]?.plan.id.includes("premium") ? "premium" : "basic";
                const billingCycle = subscription.items.data[0]?.plan.interval === "month" ? "monthly" : "yearly";

                const startDate = new Date(subscription.current_period_start * 1000);
                const endDate = new Date(subscription.current_period_end * 1000);

                const updatedUser = await User.findOneAndUpdate(
                    { email: customerEmail },
                    {
                        $set: {
                            "subscription.plan": plan,
                            "subscription.billingCycle": billingCycle,
                            "subscription.purchaseDate": new Date(),
                            "subscription.startDate": startDate,
                            "subscription.endDate": endDate,
                        },
                    },
                    { new: true }
                );

                if (updatedUser) {
                    console.log("User subscription updated:", updatedUser);
                } else {
                    console.error("User not found for email:", customerEmail);
                }
            } catch (error) {
                console.error("Error updating user subscription:", error);
            }
            break;
        }
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
};

