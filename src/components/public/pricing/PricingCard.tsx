'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Button } from '@/components/ui/Button'
import { CheckCircle2, X, Coffee, TrendingUp } from 'lucide-react'
import type { PricingPlan } from '@/lib/pricing'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export function PricingCard({ plan, isAnnual, index }: {
  plan: PricingPlan;
  isAnnual: boolean;
  index: number;
}) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [isLoading, setIsLoading] = useState(false)

  const price = isAnnual ? plan.annualPrice : plan.monthlyPrice
  const stripePriceId = isAnnual ? plan.stripePriceId.annual : plan.stripePriceId.monthly
  const isPopular = plan.popular

  const handleSubscribe = async () => {
    if (plan.id === 'free') {
      window.location.href = '/signup'
      return
    }

    setIsLoading(true)
    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to load')

      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: stripePriceId,
          successUrl: `${window.location.origin}/dashboard?success=true&plan=${plan.id}`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }),
      })

      const { sessionId, error } = await response.json()
      if (error) throw new Error(error)

      const result = await stripe.redirectToCheckout({ sessionId })
      if (result.error) throw new Error(result.error.message)
    } catch (error) {
      console.error('Error:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`relative bg-white rounded-2xl shadow-lg p-8 ${
        isPopular ? 'ring-2 ring-blue-600' : 'border border-gray-200'
      }`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className="px-4 py-1 rounded-full text-xs font-bold text-white bg-blue-600">
            Most Popular
          </div>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
        <p className="text-gray-600 h-10">{plan.description}</p>
      </div>

      <div className="text-center mb-6">
        <div className="flex items-baseline justify-center gap-1">
          <span className="text-5xl font-bold text-gray-900">${price}</span>
          <span className="text-gray-600">/month</span>
        </div>
        {isAnnual && plan.savings && (
          <p className="text-sm text-green-600 font-medium mt-1">{plan.savings}</p>
        )}
      </div>

      <Button
        onClick={handleSubscribe}
        fullWidth
        variant={isPopular ? 'primary' : 'secondary'}
        size="lg"
        className="mb-6"
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : plan.cta}
      </Button>

      <div className="space-y-4">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-3">
            {feature.included ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
            )}
            <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
              {feature.text}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
