import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";
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
                metadata: { userID: user.ID },
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
            metadata: { userId: user.ID },
            customer: customer.id,
            billing_address_collection: "required", // ✅ Requires user to enter address
            customer_update: { address: "auto" },
        };

        const session = await stripe.checkout.sessions.create(sessionConfig);
        if (session) {
            return res.json({ id: session.id });
        }
    } catch (error: unknown) {
        return res.status(400).json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
};


// export const verifyPayment = async (
//     req: Request,
//     res: Response
// ): Promise<Response | any> => {
//     const { session_id } = req.query;

//     if (!session_id) {
//         return res.status(400).json({ success: false, message: "Session ID is required" });
//     }

//     try {
//         const session = await stripe.checkout.sessions.retrieve(session_id);

//         if (session.payment_status === "paid") {
//             // Update user subscription in the database
//             return res.json({ success: true, message: "Payment successful!" });
//         } else {
//             return res.json({ success: false, message: "Payment not completed." });
//         }
//     } catch (error) {
//         console.error("Error verifying payment:", error);
//         return res.status(500).json({ success: false, message: "Error verifying payment" });
//     }
// };