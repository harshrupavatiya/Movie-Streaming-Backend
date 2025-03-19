import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import { User } from "../user";
import { MONTHLY, YEARLY } from "../../utils/constants";

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

const signingSecret = process.env.STRIPE_SIGNING_SECRET_KEY!;

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: "2025-02-24.acacia" });

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {

    const sig = req.headers["stripe-signature"] as string;
    //convert buffer into string because stripe only accept string not json
    const payload = req.body.toString();

    let event: Stripe.Event;

    try {
        if (!signingSecret) {
            throw new Error("STRIPE_WEBHOOK_SECRET is missing in .env file.");
        }
        event = stripe.webhooks.constructEvent(payload, sig, signingSecret);

    } catch (err) {
        console.error("line 35 Webhook verification failed:", err);
        res.status(400).send(`Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}`);
        return
    }


    switch (event.type) {
        case "customer.subscription.updated": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            console.log(`Subscription updated: ${subscription.id}`);
            console.log(`Customer ID: ${customerId}`);

            try {
                // Fetch customer email from Stripe
                const customer = await stripe.customers.retrieve(customerId);
                if (!customer || customer.deleted || typeof customer === "string" || !("email" in customer)) {
                    console.error("Customer email not found for ID:", customerId);
                    break;
                }

                const customerEmail = customer.email;

                // Handle scheduled cancellation
                if (subscription.cancel_at_period_end) {
                    console.log("Subscription is scheduled for cancellation at end of billing cycle.");

                    await User.findOneAndUpdate(
                        { email: customerEmail },
                        {
                            $set: {
                                "subscription.status": "pending_cancellation",
                                "subscription.cancelAt": new Date(subscription.cancel_at! * 1000),
                            },
                        },
                        { new: true }
                    );

                    console.log("User subscription marked as 'pending cancellation'.");
                }
            } catch (error) {
                console.error("Error updating user subscription:", error);
            }
            break;
        }
        case "customer.subscription.deleted": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;

            try {
                const customer = await stripe.customers.retrieve(customerId);
                if (!customer || customer.deleted || typeof customer === "string" || !("email" in customer)) {
                    console.error("Customer email not found for ID:", customerId);
                    break;
                }

                const customerEmail = customer.email;

                // Remove subscription details from DB
                await User.findOneAndUpdate(
                    { email: customerEmail },
                    {
                        $set: {
                            "subscription.plan": "free",
                            "subscription.status": "cancelled",
                            "subscription.billingCycle": "",
                            "subscription.startDate": null,
                            "subscription.endDate": null,
                        },
                    },
                    { new: true }
                );

                console.log("User subscription fully removed.");
            } catch (error) {
                console.error("Error updating user subscription on cancellation:", error);
            }
            break;
        }



        case "customer.subscription.created": {
            const subscription = event.data.object as Stripe.Subscription;
            const customerId = subscription.customer as string;
            break;
        }

        case "checkout.session.completed": {
            const session = event.data.object as Stripe.Checkout.Session;
            const customerId = session.customer as string;
            const customerEmail = session.customer_details?.email;
            const subscriptionId = session.subscription as string;
            const plan = session.metadata?.tier;

            if (!customerEmail || !subscriptionId) {
                console.error("Missing customer email or subscription ID");
                break;
            }
            try {
                const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                const billingCycle = subscription.items.data[0]?.plan.interval === "month" ? MONTHLY : YEARLY;
                const startDate = new Date(subscription.current_period_start * 1000);
                const endDate = new Date(subscription.current_period_end * 1000);

                const updatedUser = await User.findOneAndUpdate(
                    { email: customerEmail },
                    {
                        $set: {
                            "subscription.plan": plan,
                            "subscription.status": "active",
                            "subscription.billingCycle": billingCycle,
                            "subscription.purchaseDate": new Date(),
                            "subscription.startDate": startDate,
                            "subscription.endDate": endDate,
                            "subscription.cancelAt": ""
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

