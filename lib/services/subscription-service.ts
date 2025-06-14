import { stripe } from '../stripe'
import { supabaseServer } from '../supabase/server'
import { env } from '../env'
import type { Subscription } from '@/types/database'
import type { PostgrestSingleResponse } from '@supabase/supabase-js'

export class SubscriptionService {
  private getSupabase() {
    return supabaseServer()
  }

  async createCustomer(userId: string, email: string) {
    const customer = await stripe.customers.create({
      email,
      metadata: {
        userId,
      },
    })

    // Store the customer ID in your database
    const { error } = await this.getSupabase()
      .from('subscriptions')
      .insert({
        user_id: userId,
        stripe_customer_id: customer.id,
      })

    if (error) throw error
    return customer
  }

  async getCustomer(userId: string) {
    const { data, error } = await this.getSupabase()
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .single()

    if (error) throw error
    if (!data?.stripe_customer_id) return null

    return await stripe.customers.retrieve(data.stripe_customer_id)
  }

  async createSubscription(
    customerId: string,
    priceId: string,
    userId: string,
    planName: string
  ) {
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    })

    // Store the subscription in your database
    const { error } = await this.getSupabase()
      .from('subscriptions')
      .update(({
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        plan_name: planName,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }) as Partial<Subscription>)
      .eq('user_id', userId)

    if (error) throw error
    return subscription
  }

  async cancelSubscription(subscriptionId: string, userId: string) {
    const subscription = await stripe.subscriptions.cancel(subscriptionId)

    // Update the subscription status in your database
    const { error } = await this.getSupabase()
      .from('subscriptions')
      .update(({
        status: subscription.status,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      }) as Partial<Subscription>)
      .eq('user_id', userId)

    if (error) throw error
    return subscription
  }

  async getSubscription(userId: string): Promise<Subscription | null> {
    const response = await this.getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (response.error) {
      console.error('Error fetching subscription:', response.error)
      return null
    }

    return response.data as Subscription
  }

  async handleWebhookEvent(event: any) {
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object)
        break
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object)
        break
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object)
        break
    }
  }

  private async handleCheckoutSessionCompleted(session: any) {
    const { data: subscription, error } = await this.getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('stripe_subscription_id', session.subscription)
      .single()

    if (error) {
      console.error('Error fetching subscription:', error)
      return
    }

    if (subscription) {
      const { error: updateError } = await this.getSupabase()
        .from('subscriptions')
        .update({
          status: 'active',
          current_period_start: new Date(session.subscription.current_period_start * 1000).toISOString(),
          current_period_end: new Date(session.subscription.current_period_end * 1000).toISOString(),
        })
        .eq('id', subscription.id)

      if (updateError) {
        console.error('Error updating subscription:', updateError)
      }
    }
  }

  private async handleSubscriptionUpdated(subscription: any) {
    await this.getSupabase()
      .from('subscriptions')
      .update({
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  private async handleSubscriptionDeleted(subscription: any) {
    await this.getSupabase()
      .from('subscriptions')
      .update({
        status: 'canceled',
        cancel_at_period_end: false
      })
      .eq('stripe_subscription_id', subscription.id)
  }

  async getSubscriptionPlans() {
    const { data, error } = await this.getSupabase()
      .from('subscription_plans')
      .select('*')
      .order('price')

    if (error) throw error
    return data
  }

  async getCurrentSubscription(): Promise<Subscription | null> {
    const response = await this.getSupabase()
      .from('subscriptions')
      .select('*')
      .eq('status', 'active')
      .single()

    if (response.error) {
      console.error('Error fetching current subscription:', response.error)
      return null
    }

    return response.data as Subscription
  }

  async getUsageMetrics(subscriptionId: string) {
    const { data, error } = await this.getSupabase()
      .from('subscription_usage')
      .select('*')
      .eq('subscription_id', subscriptionId)

    if (error) throw error
    return data
  }

  async updateUsage(subscriptionId: string, feature: string, increment: number = 1) {
    const { data, error } = await this.getSupabase()
      .from('subscription_usage')
      .upsert({
        subscription_id: subscriptionId,
        feature,
        usage_count: increment,
        last_updated: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async createCheckoutSession(priceId: string) {
    const supabase = this.getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get or create Stripe customer
    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    let customerId = subscription?.stripe_customer_id

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      })
      customerId = customer.id

      // Store customer ID
      await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          stripe_customer_id: customerId
        })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${env.NEXT_PUBLIC_APP_URL}/pricing`,
      metadata: {
        user_id: user.id
      }
    })

    return session
  }

  async createPortalSession() {
    const supabase = this.getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: subscription } = await supabase
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (!subscription?.stripe_customer_id) {
      throw new Error('No subscription found')
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${env.NEXT_PUBLIC_APP_URL}/dashboard`
    })

    return session
  }
}

export const subscriptionService = new SubscriptionService() 
