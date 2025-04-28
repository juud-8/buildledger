import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe instance
export const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16', // Use the latest API version
  typescript: true,
}) 