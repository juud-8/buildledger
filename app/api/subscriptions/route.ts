import { NextResponse } from 'next/server'
// Revert back to alias path
import { supabaseServer } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/services/subscription-service'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await subscriptionService.getSubscription(user.id)
    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId, planName } = await request.json()
    if (!priceId || !planName) {
      return NextResponse.json({ error: 'Price ID and plan name are required' }, { status: 400 })
    }

    // Get or create customer
    let customer = await subscriptionService.getCustomer(user.id)
    if (!customer) {
      customer = await subscriptionService.createCustomer(user.id, user.email!)
    }

    const subscription = await subscriptionService.createSubscription(
      customer.id,
      priceId,
      user.id,
      planName
    )

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const subscription = await subscriptionService.getSubscription(user.id)
    if (!subscription?.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active subscription found' }, { status: 404 })
    }

    await subscriptionService.cancelSubscription(subscription.stripe_subscription_id, user.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error canceling subscription:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 