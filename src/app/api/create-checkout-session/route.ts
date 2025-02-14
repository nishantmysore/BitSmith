import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  try {
    // Get headers first, before any other operations
    const headersList = await headers()
    const origin = headersList.get('origin')

    const session = await getServerSession(authOptions)
    
    console.log("REACHED BEGINNING________________")
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    // Get or create the stripe customer
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    let stripeCustomerId = user?.stripeCustomerId
    console.log("REACHED MIDDLE______________")

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
    console.log("REACHED________________-", stripeCustomerId)

    try {
      // Create Checkout Sessions from body params.
      const checkoutSession = await stripe.checkout.sessions.create({
        customer: stripeCustomerId,
        line_items: [
          {
            price: 'price_1Qrvp3LENE0vGSD4HpNui1ug',
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/?canceled=true`,
        automatic_tax: { enabled: false },
      });
      
      console.log("URL______________", checkoutSession.url)
      return NextResponse.json({ url: checkoutSession.url })
    } catch (checkoutError: any) {
      console.error("Checkout creation failed:", checkoutError);
      return NextResponse.json(
        { error: checkoutError.message },
        { status: checkoutError.statusCode || 500 }
      )
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}