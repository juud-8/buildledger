'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { 
  Building2, 
  CheckCircle2, 
  X,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Users,
  FileText,
  DollarSign,
  TrendingUp,
  Headphones,
  Globe,
  Brain,
  Crown,
  Coffee,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '@/lib/animations'
import { PRICING_PLANS, PricingPlan } from '@/lib/pricing'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ROI calculator component
function ROICalculator() {
  const [hours, setHours] = useState(10)
  const [hourlyRate, setHourlyRate] = useState(75)
  
  const monthlySavings = hours * hourlyRate * 4
  const yearlySavings = monthlySavings * 12
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 mb-16"
    >
      <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
        Calculate Your ROI
      </h3>
      
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours saved per week
            </label>
            <input
              type="range"
              min="5"
              max="20"
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-gray-600 mt-1">
              <span>5 hours</span>
              <span className="font-semibold">{hours} hours</span>
              <span>20 hours</span>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your hourly rate
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 text-center">
          <p className="text-sm text-gray-600 mb-2">Your monthly savings</p>
          <p className="text-4xl font-bold text-green-600 mb-4">
            ${monthlySavings.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600">
            That's <span className="font-semibold text-gray-900">${yearlySavings.toLocaleString()}</span> per year!
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// Pricing card component
function PricingCard({ plan, isAnnual, index }: { 
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
      className={`relative bg-white rounded-2xl shadow-lg ${
        isPopular ? 'ring-2 ring-blue-600 scale-105' : ''
      }`}
    >
      {/* Badge */}
      {plan.badge && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2">
          <div className={`px-4 py-1 rounded-full text-xs font-bold text-white ${
            isPopular ? 'bg-blue-600' : 'bg-purple-600'
          }`}>
            {plan.badge}
          </div>
        </div>
      )}
      
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
          <p className="text-gray-600">{plan.description}</p>
        </div>
        
        {/* Price */}
        <div className="text-center mb-6">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-bold text-gray-900">${price}</span>
            <span className="text-gray-600">/month</span>
          </div>
          {isAnnual && plan.savings && (
            <p className="text-sm text-green-600 font-medium mt-1">{plan.savings}</p>
          )}
          {plan.id === 'pro' && (
            <p className="text-sm text-gray-600 mt-2">
              <Coffee className="w-4 h-4 inline mr-1" />
              Less than a coffee per week
            </p>
          )}
          {plan.id === 'business' && (
            <p className="text-sm text-gray-600 mt-2">
              <TrendingUp className="w-4 h-4 inline mr-1" />
              Pays for itself in 2 invoices
            </p>
          )}
        </div>
        
        {/* CTA Button */}
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
        
        {/* Features */}
        <div className="space-y-3">
          {plan.features.map((feature, i) => (
            <div key={i} className={`flex items-start gap-3 ${
              feature.header ? 'font-semibold text-gray-900 mb-2' : ''
            }`}>
              {!feature.header && (
                feature.included ? (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" />
                )
              )}
              <span className={feature.included ? 'text-gray-700' : 'text-gray-400'}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true)
  const [headerRef, headerInView] = useInView({ triggerOnce: true })
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BuildLedger</span>
            </Link>
            
            <div className="flex items-center gap-4">
              <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                Login
              </Link>
              <Button href="/signup" size="sm">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Header */}
      <section ref={headerRef} className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={headerInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Simple, transparent pricing
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Start free, upgrade when you're ready. No hidden fees, no surprises.
            </p>
            
            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-4 mb-12">
              <span className={`text-lg ${!isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Monthly
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative inline-flex h-8 w-14 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <motion.span
                  className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg"
                  animate={{ x: isAnnual ? 26 : 2 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
              <span className={`text-lg ${isAnnual ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Annual
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Save 10%
                </span>
              </span>
            </div>
            
            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <span>30-day money-back guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-blue-600" />
                <span>Cancel anytime, no questions</span>
              </div>
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5 text-purple-600" />
                <span>24/7 support included</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Pricing cards */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {PRICING_PLANS.map((plan, index) => (
              <PricingCard
                key={plan.id}
                plan={plan}
                isAnnual={isAnnual}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>
      
      {/* ROI Calculator */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <ROICalculator />
        </div>
      </section>
      
      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Frequently asked questions
          </h2>
          
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="space-y-6"
          >
            {[
              {
                q: "Can I change plans anytime?",
                a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges."
              },
              {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards, debit cards, and ACH bank transfers through our secure Stripe integration."
              },
              {
                q: "Is there a setup fee?",
                a: "No setup fees, ever. Start your free trial today and only pay when you're ready to upgrade."
              },
              {
                q: "What happens to my data if I cancel?",
                a: "Your data remains accessible for 90 days after cancellation. You can export everything at any time."
              },
              {
                q: "Do you offer discounts for annual billing?",
                a: "Yes! Save 10% when you pay annually. That's 2 months free compared to monthly billing."
              }
            ].map((faq, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.q}</h3>
                <p className="text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      
      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-4">
            Ready to transform your business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join 10,000+ contractors who are saving time and getting paid faster.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button href="/signup" size="xl" variant="secondary">
              Start 14-Day Free Trial <ArrowRight className="w-5 h-5" />
            </Button>
            <Button 
              href="#" 
              size="xl" 
              variant="ghost" 
              className="text-white border-white hover:bg-white/10"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  )
} 