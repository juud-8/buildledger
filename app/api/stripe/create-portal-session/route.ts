import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
})

export async function POST(req: NextRequest) {
  try {
    const { customerId } = await req.json()

    if (!customerId) {
      return new NextResponse('Customer ID is required', { status: 400 })
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Error creating portal session:', error)
    return new NextResponse(
      `Error creating portal session: ${error.message}`,
      { status: 500 }
    )
  }
} 