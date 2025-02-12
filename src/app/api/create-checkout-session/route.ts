import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const headersList = headers()
    const origin = headersList.get('origin')
    const body = await request.json()

    // Get or create the stripe customer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    let stripeCustomerId = user?.stripeCustomerId

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: session.user.email,
        // Add any additional customer data here
      })
      stripeCustomerId = customer.id

      // Update the user with the new Stripe customer ID
      await prisma.user.update({
        where: { email: session.user.email },
        data: { stripeCustomerId: customer.id },
      })
    }

    // Create Checkout Sessions from body params.
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: 'price_1QqQD2LENE0vGSD4fTLJ4K8x',
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      automatic_tax: { enabled: true },
    });

    // Return the session URL instead of redirecting
    return NextResponse.json({ url: checkoutSession.url })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}