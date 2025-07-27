import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { headers } from 'next/headers'
import { supabase } from '@/lib/supabaseClient'
import { getPlanByStripePriceId } from '@/lib/pricing'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    console.log('Received webhook event:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string
    const priceId = subscription.items.data[0]?.price.id

    if (!priceId) {
      console.error('No price ID found in subscription')
      return
    }

    // Get plan from price ID
    const plan = getPlanByStripePriceId(priceId)
    if (!plan) {
      console.error('Unknown price ID:', priceId)
      return
    }

    // Find user by Stripe customer ID
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (findError || !profile) {
      console.error('User not found for customer ID:', customerId)
      return
    }

    // Update user's plan tier and subscription status
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan_tier: plan.id,
        subscription_status: subscription.status,
        stripe_subscription_id: subscription.id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id)

    if (updateError) {
      console.error('Error updating user profile:', updateError)
    } else {
      console.log(`Updated user ${profile.user_id} to plan ${plan.id}`)
    }
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

async function handleSubscriptionCancelled(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string

    // Find user by Stripe customer ID
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (findError || !profile) {
      console.error('User not found for customer ID:', customerId)
      return
    }

    // Downgrade user to free plan
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        plan_tier: 'free',
        subscription_status: 'cancelled',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id)

    if (updateError) {
      console.error('Error downgrading user:', updateError)
    } else {
      console.log(`Downgraded user ${profile.user_id} to free plan`)
    }
  } catch (error) {
    console.error('Error handling subscription cancellation:', error)
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    // Find user by Stripe customer ID
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (findError || !profile) {
      console.error('User not found for customer ID:', customerId)
      return
    }

    // Update subscription status to active
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id)

    if (updateError) {
      console.error('Error updating subscription status:', updateError)
    } else {
      console.log(`Payment succeeded for user ${profile.user_id}`)
    }
  } catch (error) {
    console.error('Error handling payment success:', error)
  }
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  try {
    const customerId = invoice.customer as string

    // Find user by Stripe customer ID
    const { data: profile, error: findError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('stripe_customer_id', customerId)
      .single()

    if (findError || !profile) {
      console.error('User not found for customer ID:', customerId)
      return
    }

    // Update subscription status to past_due
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        subscription_status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id)

    if (updateError) {
      console.error('Error updating subscription status:', updateError)
    } else {
      console.log(`Payment failed for user ${profile.user_id}`)
    }
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
} 