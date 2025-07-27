'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Building2, 
  ArrowRight, 
  CheckCircle2, 
  Mail, 
  Lock,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { supabase } from '@/lib/supabaseClient'
import { staggerContainer, staggerItem } from '@/lib/animations'

function BenefitItem({ icon: Icon, text }: { icon: any, text: string }) {
  return (
    <motion.div 
      variants={staggerItem}
      className="flex items-start gap-3"
    >
      <div className="mt-0.5">
        <Icon className="w-5 h-5 text-green-400" />
      </div>
      <p className="text-gray-200">{text}</p>
    </motion.div>
  )
}

export default function SignUpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) throw authError

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
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Left side - Form */}
      <div className="flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 lg:py-0">
        <div className="w-full max-w-sm">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">BuildLedger</span>
          </Link>

          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Create your account
            </h1>
            <p className="text-gray-600">
              Start your 14-day free trial today.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="you@company.com"
                />
              </div>
            </div>

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
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="••••••••"
                  minLength={8}
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              Get Started Free
            </Button>

            <p className="text-xs text-center text-gray-500">
              By signing up, you agree to our{' '}
              <Link href="#" className="font-medium text-blue-600 hover:underline">Terms</Link>
            </p>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-blue-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Right side - Benefits */}
      <div className="hidden lg:flex flex-col bg-gray-900 p-12 items-center justify-center">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="max-w-md text-white"
        >
          <motion.h2
            variants={staggerItem}
            className="text-3xl font-bold mb-6"
          >
            Everything you need. Nothing you don't.
          </motion.h2>
          
          <motion.div
            variants={staggerContainer}
            className="space-y-4"
          >
            <BenefitItem 
              icon={CheckCircle2} 
              text="Create quotes & invoices in seconds"
            />
            <BenefitItem 
              icon={CheckCircle2} 
              text="Accept online payments instantly"
            />
            <BenefitItem 
              icon={CheckCircle2} 
              text="Manage all your clients in one place"
            />
          </motion.div>

          <motion.div
            variants={staggerItem}
            className="mt-10 pt-8 border-t border-gray-700"
          >
            <p className="text-lg italic mb-4 text-gray-300">
              "BuildLedger is a must-have for any serious contractor. It's saved me countless hours and headaches."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-gray-700 rounded-full flex items-center justify-center font-semibold">
                SC
              </div>
              <div>
                <p className="font-semibold text-white">Sarah Chen</p>
                <p className="text-sm text-gray-400">Chen & Associates</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}