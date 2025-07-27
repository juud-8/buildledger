'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Lock, 
  User,
  Sparkles,
  Shield,
  Clock,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabaseClient'
import { fadeInUp, staggerContainer, staggerItem } from '@/lib/animations'

// Benefit item component
function BenefitItem({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <motion.div 
      variants={staggerItem}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5">
        <Icon className="w-5 h-5 text-green-600" />
      </div>
      <p className="text-gray-700">{text}</p>
    </motion.div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Create user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name
          }
        }
      })

      if (authError) throw authError

      // If successful, redirect to dashboard
      if (authData.user) {
        router.push('/dashboard')
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BuildLedger</span>
          </Link>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Start your 14-day free trial
            </h1>
            <p className="text-gray-600">
              No credit card required. Cancel anytime.
            </p>
          </div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6 text-sm"
          >
            <div className="flex items-center gap-1 text-gray-600">
              <Shield className="w-4 h-4 text-green-600" />
              <span>Bank-level security</span>
            </div>
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>Setup in 2 minutes</span>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Name field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="John Smith"
                />
              </div>
            </div>

            {/* Email field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="john@construction.com"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit button */}
            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
              icon={<ArrowRight className="w-5 h-5" />}
              iconPosition="right"
            >
              Start Free Trial
            </Button>

            {/* Terms */}
            <p className="text-xs text-center text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="#" className="text-blue-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link href="#" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>
          </motion.form>

          {/* Sign in link */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-6 text-center text-sm text-gray-600"
          >
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              Sign in
            </Link>
          </motion.p>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 pt-8 border-t border-gray-200"
          >
            <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>10,000+ contractors</span>
              </div>
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4 text-green-600" />
                <span>$50M+ processed</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Benefits */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 p-12 items-center justify-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-lg text-white"
        >
          <motion.h2
            variants={staggerItem}
            className="text-4xl font-bold mb-6"
          >
            Join thousands of contractors who are getting paid faster
          </motion.h2>
          
          <motion.div
            variants={staggerContainer}
            className="space-y-4 mb-8"
          >
            <BenefitItem 
              icon={CheckCircle2} 
              text="Get paid 3x faster with automated payment reminders"
            />
            <BenefitItem 
              icon={CheckCircle2} 
              text="Create professional quotes and invoices in seconds"
            />
            <BenefitItem 
              icon={CheckCircle2} 
              text="Accept credit cards, ACH, and bank transfers"
            />
            <BenefitItem 
              icon={CheckCircle2} 
              text="Track expenses and profit margins automatically"
            />
            <BenefitItem 
              icon={CheckCircle2} 
              text="Give clients a portal to view and pay invoices"
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
          >
            <p className="text-lg italic mb-4">
              "BuildLedger transformed my business. I'm saving 10+ hours per week 
              and getting paid weeks faster. It's a game-changer!"
            </p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-semibold">
                MR
              </div>
              <div>
                <p className="font-semibold">Mike Rodriguez</p>
                <p className="text-sm opacity-90">Rodriguez Construction</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
} 