import { supabase } from '../lib/supabase';
import { getStripe, STRIPE_CONFIG, formatStripeAmount, formatStripeAmountFromCents } from '../lib/stripe';

export const stripeService = {
  // Create a Stripe customer
  async createCustomer(userId, email, name) {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-customer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          email,
          name
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      // Store customer ID in user profile
      await supabase
        .from('user_profiles')
        .update({ stripe_customer_id: data.customerId })
        .eq('id', userId);

      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Create a subscription
  async createSubscription(customerId, priceId) {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          priceId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  // Create a payment intent for invoice payment
  async createPaymentIntent(invoiceId, amount, customerId) {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId,
          amount: formatStripeAmount(amount),
          customerId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  // Process invoice payment
  async processInvoicePayment(invoiceId, paymentMethodId) {
    try {
      const stripe = await getStripe();
      
      // Get invoice details
      const { data: invoice } = await supabase
        .from('invoices')
        .select('*')
        .eq('id', invoiceId)
        .single();

      if (!invoice) throw new Error('Invoice not found');

      // Create payment intent
      const { clientSecret } = await this.createPaymentIntent(
        invoiceId,
        invoice.total_amount,
        invoice.stripe_customer_id
      );

      // Confirm payment
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      });

      if (error) throw error;

      // Update invoice status
      await supabase
        .from('invoices')
        .update({
          status: 'paid',
          paid_date: new Date().toISOString(),
          stripe_payment_intent_id: clientSecret
        })
        .eq('id', invoiceId);

      return { success: true };
    } catch (error) {
      console.error('Error processing payment:', error);
      throw error;
    }
  },

  // Get subscription details
  async getSubscription(subscriptionId) {
    try {
      const response = await fetch(`/api/stripe/subscription/${subscriptionId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      return data;
    } catch (error) {
      console.error('Error getting subscription:', error);
      throw error;
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscriptionId })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId, newPriceId) {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/update-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId,
          newPriceId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  // Create customer portal session
  async createCustomerPortalSession(customerId, returnUrl) {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/create-portal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          returnUrl
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      console.error('Error creating portal session:', error);
      throw error;
    }
  },

  // Get payment methods for customer
  async getPaymentMethods(customerId) {
    try {
      const response = await fetch(`/api/stripe/payment-methods/${customerId}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      return data;
    } catch (error) {
      console.error('Error getting payment methods:', error);
      throw error;
    }
  },

  // Attach payment method to customer
  async attachPaymentMethod(customerId, paymentMethodId) {
    try {
      const response = await fetch('http://localhost:3001/api/stripe/attach-payment-method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId,
          paymentMethodId
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      return data;
    } catch (error) {
      console.error('Error attaching payment method:', error);
      throw error;
    }
  },

  // Get subscription plans
  getSubscriptionPlans() {
    return STRIPE_CONFIG.plans;
  },

  // Get plan by ID
  getPlanById(planId) {
    return Object.values(STRIPE_CONFIG.plans).find(plan => plan.id === planId);
  },

  // Format amount for display
  formatAmount(amount) {
    return formatStripeAmountFromCents(amount);
  }
}; 