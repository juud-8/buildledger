'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Quote } from 'lucide-react'

function TestimonialCard({ quote, author, role, company, delay = 0 }: any) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay }}
      className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100"
    >
      <Quote className="w-8 h-8 text-blue-600/20 mb-4" />
      <p className="text-gray-700 mb-4 italic">"{quote}"</p>
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-semibold">
          {author.charAt(0)}
        </div>
        <div>
          <p className="font-semibold text-gray-900">{author}</p>
          <p className="text-sm text-gray-600">{role} at {company}</p>
        </div>
      </div>
    </motion.div>
  )
}

export function Testimonials() {
  return (
    <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Contractors love BuildLedger
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of contractors who've transformed their business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <TestimonialCard
            quote="BuildLedger transformed how I run my business. I'm getting paid 3 weeks faster and spending 80% less time on paperwork."
            author="Mike Rodriguez"
            role="Owner"
            company="Rodriguez Construction"
            delay={0.1}
          />
          <TestimonialCard
            quote="The client portal is a game-changer. My clients love being able to pay online and track project progress in real-time."
            author="Sarah Chen"
            role="General Contractor"
            company="Chen & Associates"
            delay={0.2}
          />
          <TestimonialCard
            quote="I've tried 5 different invoicing tools. BuildLedger is the only one built specifically for contractors like me."
            author="James Thompson"
            role="Electrical Contractor"
            company="Thompson Electric"
            delay={0.3}
          />
        </div>
      </div>
    </section>
  )
}
