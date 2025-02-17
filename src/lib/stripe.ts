import "server-only";

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "STRIPE_SECRET_KEY is not defined in the environment variables.",
  );
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
