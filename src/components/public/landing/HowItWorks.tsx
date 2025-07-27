'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { FilePlus, Send, CreditCard } from 'lucide-react'
import { staggerContainer, staggerItem } from '@/lib/animations'

export function HowItWorks() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
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
            How It Works
          </motion.h2>
          <motion.p
            variants={staggerItem}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Get started in minutes and transform the way you do business.
          </motion.p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <motion.div variants={staggerItem} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <FilePlus className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">1. Create a Quote</h3>
            <p className="text-gray-600">
              Easily create and send professional quotes in under a minute.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Send className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">2. Send Invoice</h3>
            <p className="text-gray-600">
              Convert quotes to invoices with one click and send them to your clients.
            </p>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <CreditCard className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">3. Get Paid</h3>
            <p className="text-gray-600">
              Accept online payments and get paid faster with automated reminders.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
