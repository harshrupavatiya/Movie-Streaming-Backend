import { Request, Response } from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import STRIPE_PRICE_IDS from '../../config/stripe';
import { ACTIVE, MONTHLY, YEARLY } from '../../config/constants';

dotenv.config();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY is not set in environment variables.');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY);

export const memberSubscription = async (req: Request, res: Response): Promise<void> => {
  try {
    const { selectedPlan } = req.body;
    const user = req.user;
    if (!user) return;

    const billingCycle = selectedPlan.type === 'monthly' ? MONTHLY : YEARLY;
    const tier = selectedPlan.tier as 'basic' | 'premium';
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
        status: ACTIVE,
        limit: 1,
      });

      // Step 3: Redirect existing customer to billing portal
      if (activeSubscriptions.data.length > 0) {
        const stripeSession = await stripe.billingPortal.sessions.create({
          customer: customer.id,
          return_url: 'http://localhost:3012/',
        });
        res.status(200).json({
          status: 'existing_subscription',
          redirectUrl: stripeSession.url,
        });
        return;
      }
    } else {
      // Step 4: Create a new customer
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user?._id.toString(),
          billingCycle: billingCycle,
          tier: tier,
        },
      });
    }

    const priceId = STRIPE_PRICE_IDS[tier]?.[billingCycle];
    if (!priceId) {
      throw new Error(`Price ID not found for ${tier} ${billingCycle}`);
    }

    // Step 5: Create Stripe Checkout session
    const sessionConfig: Stripe.Checkout.SessionCreateParams = {
      success_url: 'http://localhost:3012/payment-success',
      cancel_url: 'http://localhost:3012/payment-cancel',
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      metadata: {
        userId: user._id.toString(),
        billingCycle: billingCycle,
        tier: tier,
      },
      customer: customer.id,
      billing_address_collection: 'required',
      customer_update: { address: 'auto' },
    };

    const session = await stripe.checkout.sessions.create(sessionConfig);
    if (session) {
      res.json({ id: session.id });
      return;
    }
  } catch (error: unknown) {
    res.status(400).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
    return;
  }
};
