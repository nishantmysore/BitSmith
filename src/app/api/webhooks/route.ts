import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-01-27.acacia",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Webhook signature verification failed.", err);
      return new NextResponse("Webhook signature verification failed.", {
        status: 400,
      });
    }

    const subscription = event.data.object as Stripe.Subscription;

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
        console.log(`Subscription ${event.type} event received`);

        await prisma.user.update({
          where: {
            stripeCustomerId: subscription.customer as string,
          },
          data: {
            subscriptionStatus: subscription.cancel_at_period_end
              ? "active_canceling"
              : subscription.status,
            subscriptionPlan:
              subscription.items.data[0].price.lookup_key ?? null,
            currentPeriodEnd: subscription.current_period_end
              ? new Date(subscription.current_period_end * 1000)
              : null,
          },
        });
        break;

      case "customer.subscription.deleted":
        console.log("Subscription deleted event received");
        await prisma.user.update({
          where: {
            stripeCustomerId: subscription.customer as string,
          },
          data: {
            subscriptionStatus: "canceled",
            subscriptionPlan: null,
            currentPeriodEnd: null,
          },
        });
        break;

      case "customer.created":
        const customer = event.data.object as Stripe.Customer;
        await prisma.user.update({
          where: {
            email: customer.email!,
          },
          data: {
            stripeCustomerId: customer.id,
          },
        });
        break;
    }

    return new NextResponse("Webhook processed successfully", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new NextResponse("Webhook error", { status: 400 });
  }
}
