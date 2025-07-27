'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'

export function ROICalculator() {
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
      className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8"
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
