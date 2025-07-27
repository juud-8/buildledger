'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { FileText, DollarSign, Users, TrendingUp, Zap, Shield } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

function FeatureCard({ icon: Icon, title, description, delay = 0 }: any) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="group relative bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative z-10">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </motion.div>
  )
}

export function Features() {
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <motion.h2
            variants={staggerItem}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-4"
          >
            Everything you need to run your business
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Stop juggling spreadsheets and paper invoices. BuildLedger gives you professional tools that save 10+ hours per week.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={FileText}
            title="Smart Quotes"
            description="Create professional quotes in under 60 seconds. Convert to invoices with one click."
            delay={0.1}
          />
          <FeatureCard
            icon={DollarSign}
            title="Instant Payments"
            description="Accept credit cards, ACH, and bank transfers. Get paid 3x faster with automated reminders."
            delay={0.2}
          />
          <FeatureCard
            icon={Users}
            title="Client Portal"
            description="Give clients a professional portal to view quotes, pay invoices, and message you directly."
            delay={0.3}
          />
          <FeatureCard
            icon={TrendingUp}
            title="Revenue Analytics"
            description="Track your growth with real-time dashboards. Know your most profitable clients and services."
            delay={0.4}
          />
          <FeatureCard
            icon={Zap}
            title="AI Assistant"
            description="Get smart suggestions to improve quotes, follow up on overdue invoices, and grow revenue."
            delay={0.5}
          />
          <FeatureCard
            icon={Shield}
            title="Bank-Level Security"
            description="Your data is encrypted and backed up daily. SOC 2 compliant with 99.9% uptime."
            delay={0.6}
          />
        </div>
      </div>
    </section>
  )
}
