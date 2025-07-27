'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ArrowRight, Play, Sparkles, Star, Shield } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { floatAnimation } from '@/lib/animations'

export function Hero() {
  const [ref, inView] = useInView({ triggerOnce: true })

  return (
    <section ref={ref} className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-8"
          >
            <Sparkles className="w-4 h-4" />
            Trusted by 10,000+ contractors nationwide
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold text-gray-900 mb-6"
          >
            Your Business,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Supercharged.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto"
          >
            The ultimate tool for contractors to manage quotes, invoices, and clients.
            Save time, get paid faster, and grow your business.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
          >
            <Button href="/signup" size="xl" icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
              Start Your Free Trial
            </Button>
            <Button variant="secondary" size="xl" icon={<Play className="w-5 h-5" />}>
              Watch Demo
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="flex items-center justify-center gap-6 text-sm text-gray-600"
          >
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-2">4.9/5 from 2,847 reviews</span>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Bank-level security</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
