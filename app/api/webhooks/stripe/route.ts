import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/services/subscription-service'
import { stripe } from '@/lib/stripe'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    await subscriptionService.handleWebhookEvent(event)

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Error handling webhook:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 