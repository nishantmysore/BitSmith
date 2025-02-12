import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const headersList = headers()
    const origin = headersList.get('origin')
    const body = await request.json()

    // Create Checkout Sessions from body params.
    const session = await stripe.checkout.sessions.create({
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
    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: err.statusCode || 500 }
    )
  }
}