import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
import User from "../models/user";

import STRIPE_PRICE_IDS from '../config/stripe';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    console.error("STRIPE_SECRET_KEY is not set in environment variables.");
    process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const memberSubscription = async (
    req: Request,
    res: Response
): Promise<Response | any> => {
    try {
        const { selectedPlan, user } = req.body;
        const billingCycle = selectedPlan.type === "monthly" ? "monthly" : "yearly";
        const tier = selectedPlan.tier as "basic" | "premium";
        let customer: Stripe.Customer;

        // Step 1: Check if the customer already exists
        const existingCustomers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
            // Step 2: Check if the customer has an active subscription
            const activeSubscriptions = await stripe.subscriptions.list({
                customer: customer.id,
                status: "active",
                limit: 1,
            });

            if (activeSubscriptions.data.length > 0) {
                // Step 3: Redirect existing customer to billing portal
                const stripeSession = await stripe.billingPortal.sessions.create({
                    customer: customer.id,
                    return_url: "http://localhost:3012/",
                });
                return res.status(200).json({ status: "existing_subscription", redirectUrl: stripeSession.url });
            }
        } else {
            // Step 4: Create a new customer 
            customer = await stripe.customers.create({
                email: user.email,
                metadata: {
                    userId: user.ID,
                    billingCycle: billingCycle,
                    tier: tier
                },
            });
        }

        const priceId = STRIPE_PRICE_IDS[tier]?.[billingCycle];
        if (!priceId) {
            throw new Error(`Price ID not found for ${tier} ${billingCycle}`);
        }

        // Step 5: Create Stripe Checkout session
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            success_url: "http://localhost:3012/payment-success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3012/payment-cancel",
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            metadata: {
                userId: user.ID,
                billingCycle: billingCycle,
                tier: tier
            },
            customer: customer.id,
            billing_address_collection: "required", // ✅ Requires user to enter address
            customer_update: { address: "auto" },
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);
        if (session) {
            console.log(session, "here")
            return res.json({ id: session.id });
        }
    } catch (error: unknown) {
        return res.status(400).json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
};
export const verifyPayment = async (req: Request, res: Response): Promise<string | any> => {
    const { session_id } = req.query;

    if (!session_id || typeof session_id !== "string") {
        return res.status(400).json({ success: false, message: "Valid session ID string is required" });
        // ✅ Added return to stop further execution
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(session_id as string);

        console.log(session, "line 108");

        if (session.payment_status === "paid") {
            console.log("Status is paid");

            // Extract user ID, tier, and billing cycle from metadata
            const userId = session.metadata?.userId;
            const tier = session.metadata?.tier;
            const billingCycle = session.metadata?.billingCycle;

            if (!userId || !tier || !billingCycle) {
                console.error("Missing metadata in session");
                return res.status(400).json({ success: false, message: "Missing subscription data" });

            }

            // Calculate new subscription dates
            const startDate = new Date();
            const endDate = billingCycle === "monthly"
                ? new Date(new Date().setMonth(new Date().getMonth() + 1)) // Add 1 month
                : new Date(new Date().setFullYear(new Date().getFullYear() + 1)); // Add 1 year

            // Update the user's subscription in the database
            await User.findByIdAndUpdate(userId, {
                $set: {
                    "subscription.plan": tier,
                    "subscription.billingCycle": billingCycle,
                    "subscription.startDate": startDate,
                    "subscription.endDate": endDate,
                    "subscription.stripeSessionId": session.id,
                },
            });

            return res.json({ success: true, message: "Payment successful and subscription updated!" });
        } else {
            console.log("Status is not paid");
            return res.json({ success: false, message: "Payment not completed." });
        }
    } catch (error) {
        console.error("Error verifying payment:", error);
        return res.status(500).json({ success: false, message: "Error verifying payment" });
    }
};
