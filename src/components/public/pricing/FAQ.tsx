'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '@/lib/animations'

const faqs = [
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
    a: "Yes! Save 10% when you pay annually. That's like getting 2 months free compared to monthly billing."
  }
]

export function FAQ() {
  return (
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
          {faqs.map((faq, i) => (
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
  )
}
