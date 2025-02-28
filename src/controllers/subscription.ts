import { Request, Response } from "express";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

interface RequestBody {
    selectedPlan: "monthly" | "yearly";
    userData: {
        ID: string;
        email: string;
    };
}

interface StripeSessionResponse {
    id: string;
}

interface ErrorResponse {
    status: string;
    message: string;
}

export const memberSubscription = async (
    req: Request,
    res: Response
): Promise<Response | any> => {
    try {
        const { selectedPlan, user, amount } = req.body;
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
                console.log(activeSubscriptions, "this is the active subscription")
                // Step 3: Redirect existing customer to billing portal
                const stripeSession = await stripe.billingPortal.sessions.create({
                    customer: customer.id,
                    return_url: "http://localhost:3012/",
                });
                console.log(stripeSession, "here is the stripe session that we recieved")
                return res.status(409).json({ status: "existing_subscription", redirectUrl: stripeSession.url });
            }
        } else {
            // Step 4: Create a new customer 
            customer = await stripe.customers.create({
                email: user.email,
                metadata: { userID: user.ID },
            });
        }

        // Step 5: Create Stripe Checkout session
        const session = await stripe.checkout.sessions.create({
            success_url: "http://localhost:3012/success",
            cancel_url: "http://localhost:3012/cancel",
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `${selectedPlan} Plan`,
                            description: `This is a ${selectedPlan} plan`,
                        },
                        unit_amount: amount * 100,
                        recurring: {
                            interval: selectedPlan === "monthly" ? "month" : "year",
                        },
                    },
                    quantity: 1,
                },
            ],
            metadata: { userId: user.ID },
            customer: customer.id,
            billing_address_collection: "required", // ✅ Requires user to enter address
            customer_update: { address: "auto" },
        });

        return res.json({ id: session.id });
    } catch (error: unknown) {
        console.error("Error during subscription:", error);
        return res.status(400).json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
};
