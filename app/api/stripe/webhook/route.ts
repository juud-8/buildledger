import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { env } from '@/lib/env'

// Initialize Stripe
const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
})

// Initialize Supabase Admin Client
const supabaseAdmin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`)
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 })
  }

  // Handle events
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session

      const subscriptionId = session.subscription as string
      const customerId = session.customer as string
      const userId = session.metadata?.userId

      if (userId && subscriptionId && customerId) {
        console.log("Saving subscription to Supabase...")

        const { error } = await supabaseAdmin
          .from('subscriptions')
          .insert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            status: 'active',
            plan_name: 'Standard', // or whatever plan name you want to associate
          })

        if (error) {
          console.error('Supabase insert error:', error.message)
        }
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription
      const customerId = subscription.customer as string

      console.log('Canceling subscription in Supabase...')

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Supabase update error:', error.message)
      }

      break
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      const customerId = invoice.customer as string

      console.log('Marking subscription as payment_failed in Supabase...')

      const { error } = await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'payment_failed' })
        .eq('stripe_customer_id', customerId)

      if (error) {
        console.error('Supabase update error:', error.message)
      }

      break
    }

    // You can add more event handlers later as needed
    default:
      console.log(`Unhandled event type: ${event.type}`)
  }

  return new NextResponse('OK', { status: 200 })
} 
