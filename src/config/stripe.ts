import dotenv from 'dotenv';
dotenv.config();

const STRIPE_PRICE_IDS = {
  basic: {
    monthly: process.env.STRIPE_BASIC_MONTHLY,
    yearly: process.env.STRIPE_BASIC_YEARLY,
  },
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY,
    yearly: process.env.STRIPE_PREMIUM_YEARLY,
  },
};

export default STRIPE_PRICE_IDS;
