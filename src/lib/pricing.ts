/**
 * BuildLedger Pricing Configuration
 * 
 * This file contains all pricing-related configuration including
 * Stripe price IDs, plan features, and pricing tiers.
 */

export interface PricingPlan {
  id: string
  name: string
  description: string
  monthlyPrice: number
  annualPrice: number
  stripePriceId: {
    monthly: string
    annual: string
  }
  features: PricingFeature[]
  popular?: boolean
  badge?: string
  savings?: string
  cta: string
}

export interface PricingFeature {
  text: string
  included: boolean
  header?: boolean
}

// Stripe Price IDs - Replace with your actual Stripe price IDs
export const STRIPE_PRICE_IDS = {
  PRO_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY || 'price_pro_monthly_placeholder',
  PRO_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL || 'price_pro_annual_placeholder',
  BUSINESS_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY || 'price_business_monthly_placeholder',
  BUSINESS_ANNUAL: process.env.NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL || 'price_business_annual_placeholder',
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    annualPrice: 0,
    stripePriceId: {
      monthly: '',
      annual: ''
    },
    features: [
      { text: '5 clients', included: true },
      { text: '10 quotes per month', included: true },
      { text: 'Manual invoicing only', included: true },
      { text: 'Basic email support', included: true },
      { text: 'PDF generation', included: false },
      { text: 'Payment processing', included: false },
      { text: 'Client portal', included: false },
      { text: 'Analytics & insights', included: false },
      { text: 'Custom branding', included: false },
      { text: 'Team members', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false },
      { text: 'AI assistant', included: false }
    ],
    cta: 'Start Free'
  },
  {
    id: 'pro',
    name: 'BuildLedger Pro',
    description: 'Best value for growing contractors',
    monthlyPrice: 19,
    annualPrice: 205, // $19 * 12 * 0.9 (10% discount)
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.PRO_MONTHLY,
      annual: STRIPE_PRICE_IDS.PRO_ANNUAL
    },
    features: [
      { text: 'Unlimited clients', included: true },
      { text: 'Unlimited quotes', included: true },
      { text: 'Stripe payment processing', included: true },
      { text: 'Professional PDF invoices', included: true },
      { text: 'Automated payment reminders', included: true },
      { text: 'Basic analytics dashboard', included: true },
      { text: 'Logo & brand colors', included: true },
      { text: 'Email support', included: true },
      { text: 'Client portal', included: false },
      { text: 'Advanced analytics', included: false },
      { text: 'Team members', included: false },
      { text: 'API access', included: false },
      { text: 'Priority support', included: false },
      { text: 'AI assistant', included: false }
    ],
    popular: true,
    badge: 'MOST POPULAR',
    savings: 'Save $23/year',
    cta: 'Start Pro Trial'
  },
  {
    id: 'business',
    name: 'BuildLedger Business',
    description: 'For established contractors at scale',
    monthlyPrice: 49,
    annualPrice: 529, // $49 * 12 * 0.9 (10% discount)
    stripePriceId: {
      monthly: STRIPE_PRICE_IDS.BUSINESS_MONTHLY,
      annual: STRIPE_PRICE_IDS.BUSINESS_ANNUAL
    },
    features: [
      { text: 'Everything in Pro, plus:', included: true, header: true },
      { text: 'Stripe + ACH payments', included: true },
      { text: 'Branded client portal', included: true },
      { text: 'Advanced revenue analytics', included: true },
      { text: 'AI-powered insights', included: true },
      { text: 'Full white-label branding', included: true },
      { text: 'Custom domain support', included: true },
      { text: '3 team members', included: true },
      { text: 'API access', included: true },
      { text: 'Priority phone support', included: true },
      { text: 'AI assistant ("Fix this quote")', included: true },
      { text: 'Quarterly business reviews', included: true },
      { text: '99.9% uptime SLA', included: true }
    ],
    badge: 'BEST ROI',
    savings: 'Save $59/year',
    cta: 'Start Business Trial'
  }
]

// Feature flags based on plan tier
export const FEATURE_FLAGS = {
  free: {
    maxClients: 5,
    maxQuotesPerMonth: 10,
    pdfGeneration: false,
    paymentProcessing: false,
    clientPortal: false,
    analytics: false,
    customBranding: false,
    teamMembers: false,
    apiAccess: false,
    prioritySupport: false,
    aiAssistant: false
  },
  pro: {
    maxClients: -1, // unlimited
    maxQuotesPerMonth: -1, // unlimited
    pdfGeneration: true,
    paymentProcessing: true,
    clientPortal: false,
    analytics: true,
    customBranding: true,
    teamMembers: false,
    apiAccess: false,
    prioritySupport: false,
    aiAssistant: false
  },
  business: {
    maxClients: -1, // unlimited
    maxQuotesPerMonth: -1, // unlimited
    pdfGeneration: true,
    paymentProcessing: true,
    clientPortal: true,
    analytics: true,
    customBranding: true,
    teamMembers: 3,
    apiAccess: true,
    prioritySupport: true,
    aiAssistant: true
  }
}

// Helper function to check if a feature is available for a plan
export function hasFeature(planTier: 'free' | 'pro' | 'business', feature: keyof typeof FEATURE_FLAGS.free): boolean {
  return FEATURE_FLAGS[planTier][feature] !== false && FEATURE_FLAGS[planTier][feature] !== 0
}

// Helper function to get feature limit for a plan
export function getFeatureLimit(planTier: 'free' | 'pro' | 'business', feature: keyof typeof FEATURE_FLAGS.free): number {
  return FEATURE_FLAGS[planTier][feature] as number
}

// Helper function to get plan by ID
export function getPlanById(id: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => plan.id === id)
}

// Helper function to get plan by Stripe price ID
export function getPlanByStripePriceId(stripePriceId: string): PricingPlan | undefined {
  return PRICING_PLANS.find(plan => 
    plan.stripePriceId.monthly === stripePriceId || 
    plan.stripePriceId.annual === stripePriceId
  )
} 