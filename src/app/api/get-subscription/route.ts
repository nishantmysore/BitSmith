import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        stripeCustomerId: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
      },
    });

    if (!user?.stripeCustomerId) {
      return NextResponse.json({
        subscriptionId: null,
        status: null,
        currentPeriodEnd: null,
      });
    }

    // Get the subscription from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripeCustomerId,
      limit: 1,
    });
    const subscription = subscriptions.data[0];

    if (!subscription) {
      return NextResponse.json({
        subscriptionId: null,
        status: null,
        currentPeriodEnd: null,
      });
    }
    console.log(subscription);
    return NextResponse.json({
      subscriptionId: subscription.id,
      status: user.subscriptionStatus,
      currentPeriodEnd: subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null,
    });
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
