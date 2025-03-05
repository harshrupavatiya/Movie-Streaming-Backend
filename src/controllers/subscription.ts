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

// interface RequestBody {
//     selectedPlan: "monthly" | "yearly";
//     userData: {
//         ID: string;
//         email: string;
//     };
//     tier: "Basic" | "Premium";

// }

// interface StripeSessionResponse {
//     id: string;
// }

// interface ErrorResponse {
//     status: string;
//     message: string;
// }

export const memberSubscription = async (
    req: Request,
    res: Response
): Promise<Response | any> => {
    try {
        const { selectedPlan, user } = req.body;
        const billingCycle = selectedPlan.type === "monthly" ? "monthly" : "yearly";
        const tier = selectedPlan.tier as "basic" | "premium";
        console.log(tier, "tier at line 45");

        console.log(selectedPlan, user, "body at line 48")
        let customer: Stripe.Customer;

        // Step 1: Check if the customer already exists
        const existingCustomers = await stripe.customers.list({
            email: user.email,
            limit: 1,
        });

        if (existingCustomers.data.length > 0) {
            customer = existingCustomers.data[0];
            console.log(customer, 'customer at line 59');

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

        const priceId = STRIPE_PRICE_IDS[tier]?.[billingCycle];
        console.log(priceId, "Price id at line 85 susbscruption controller");
        if (!priceId) {
            throw new Error(`Price ID not found for ${tier} ${billingCycle}`);
        }

        // Step 5: Create Stripe Checkout session
        const sessionConfig: Stripe.Checkout.SessionCreateParams = {
            success_url: "http://localhost:3012/success?session_id={CHECKOUT_SESSION_ID}",
            cancel_url: "http://localhost:3012/cancel",
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
            console.log(session, 'session at line 108')
        }
        return res.json({ id: session.id });
    } catch (error: unknown) {
        console.error("Error during subscription:", error);
        return res.status(400).json({
            status: "error",
            message: error instanceof Error ? error.message : "Unknown error occurred",
        });
    }
};









// import { Request, Response } from "express";
// import Stripe from "stripe";
// import dotenv from "dotenv";

// dotenv.config();

// const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
// if (!STRIPE_SECRET_KEY) {
//     throw new Error("STRIPE_SECRET_KEY is not set in environment variables.");
// }

// const stripe = new Stripe(STRIPE_SECRET_KEY);

// interface RequestBody {
//     selectedPlan: "monthly" | "yearly";
//     userData: {
//         ID: string;
//         email: string;
//     };
// }

// interface StripeSessionResponse {
//     id: string;
// }

// interface ErrorResponse {
//     status: string;
//     message: string;
// }

// export const memberSubscription = async (
//     req: Request,
//     res: Response
// ): Promise<Response | any> => {
//     try {
//         const { selectedPlan, user, amount } = req.body;
//         let customer: Stripe.Customer;


//         // Step 1: Check if the customer already exists
//         const existingCustomers = await stripe.customers.list({
//             email: user.email,
//             limit: 1,
//         });

//         if (existingCustomers.data.length > 0) {
//             customer = existingCustomers.data[0];
//             // Step 2: Check if the customer has an active subscription
//             const activeSubscriptions = await stripe.subscriptions.list({
//                 customer: customer.id,
//                 status: "active",
//                 limit: 1,
//             });

//             if (activeSubscriptions.data.length > 0) {
//                 console.log(activeSubscriptions, "this is the active subscription")
//                 // Step 3: Redirect existing customer to billing portal
//                 const stripeSession = await stripe.billingPortal.sessions.create({
//                     customer: customer.id,
//                     return_url: "http://localhost:3012/",
//                 });
//                 console.log(stripeSession, "here is the stripe session that we recieved")
//                 return res.status(409).json({ status: "existing_subscription", redirectUrl: stripeSession.url });
//             }
//         } else {
//             // Step 4: Create a new customer 
//             customer = await stripe.customers.create({
//                 email: user.email,
//                 metadata: { userID: user.ID },
//             });
//         }

//         // Step 5: Create Stripe Checkout session
//         const session = await stripe.checkout.sessions.create({
//             success_url: "http://localhost:3012/success",
//             cancel_url: "http://localhost:3012/cancel",
//             payment_method_types: ["card"],
//             mode: "subscription",
//             line_items: [
//                 {
//                     price_data: {
//                         currency: "inr",
//                         product_data: {
//                             name: `${selectedPlan} Plan`,
//                             description: `This is a ${selectedPlan} plan`,
//                         },
//                         unit_amount: amount * 100,
//                         recurring: {
//                             interval: selectedPlan === "monthly" ? "month" : "year",
//                         },
//                     },
//                     quantity: 1,
//                 },
//             ],
//             metadata: { userId: user.ID },
//             customer: customer.id,
//             billing_address_collection: "required", // ✅ Requires user to enter address
//             customer_update: { address: "auto" },
//         });

//         return res.json({ id: session.id });
//     } catch (error: unknown) {
//         console.error("Error during subscription:", error);
//         return res.status(400).json({
//             status: "error",
//             message: error instanceof Error ? error.message : "Unknown error occurred",
//         });
//     }
// };
