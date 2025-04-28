'use client'

import { useState } from 'react'
import { Button } from './ui/button'
import { stripePromise } from '@/lib/stripe'

interface SubscribeButtonProps {
  priceId: string
  planName: string
}

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      
      // Create checkout session
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
        }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const { error } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to start checkout. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
    >
      {loading ? 'Processing...' : 'Subscribe Now'}
    </Button>
  )
} 