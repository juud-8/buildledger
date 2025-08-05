import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export const getStripe = () => stripePromise;

// Stripe configuration
export const STRIPE_CONFIG = {
  // Subscription plans
  plans: {
    starter: {
      id: 'price_1RsaVXKbuTYpVaZ7bQUlqd2E',
      name: 'Starter',
      price: 29,
      features: [
        'Up to 10 projects',
        'Basic invoicing',
        'Client management',
        'Email support'
      ]
    },
    professional: {
      id: 'price_1RsaVkKbuTYpVaZ7hspcAaFo',
      name: 'Professional',
      price: 79,
      features: [
        'Up to 50 projects',
        'Advanced invoicing',
        'Analytics dashboard',
        'Priority support',
        'Custom branding'
      ]
    },
    enterprise: {
      id: 'price_1RsaVuKbuTYpVaZ7alwjzlHn',
      name: 'Enterprise',
      price: 199,
      features: [
        'Unlimited projects',
        'Advanced analytics',
        'API access',
        'Dedicated support',
        'Custom integrations',
        'Team management'
      ]
    }
  },

  // Payment methods
  paymentMethods: {
    card: 'card',
    bankTransfer: 'bank_transfer',
    sepa: 'sepa_debit'
  },

  // Invoice status mapping
  invoiceStatus: {
    draft: 'draft',
    open: 'open',
    paid: 'paid',
    uncollectible: 'uncollectible',
    void: 'void'
  }
};

// Utility functions
export const formatStripeAmount = (amount) => {
  // Convert dollars to cents for Stripe
  return Math.round(amount * 100);
};

export const formatStripeAmountFromCents = (amount) => {
  // Convert cents to dollars from Stripe
  return amount / 100;
};

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(amount);
}; 