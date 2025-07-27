'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetSuccess, setResetSuccess] = useState(false)
  const router = useRouter()

  const handleSignIn = async () => {
    if (!email || !password) {
      setError('Please enter both email and password')
      return
    }

    setLoading(true)
    setError('')
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        // Provide more user-friendly error messages
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (error.message.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in.')
        } else {
          setError(error.message)
        }
      } else {
        router.push('/dashboard') // Redirect on success
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Sign in error:', err)
    }
    
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`, // Not used in PKCE, but safe to set
      },
    })
    if (error) {
      setError(error.message)
    } else {
      alert('✅ Check your email to confirm your account!')
    }
    setLoading(false)
  }

  const handleResetPassword = async () => {
    if (!resetEmail) {
      setError('Please enter your email address')
      return
    }

    setResetLoading(true)
    setError('')
    
    const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/reset-password`,
    })
    
    if (error) {
      setError(error.message)
    } else {
      setResetSuccess(true)
      setTimeout(() => {
        setShowResetPassword(false)
        setResetSuccess(false)
        setResetEmail('')
      }, 5000)
    }
    
    setResetLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-8 space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900">BuildLedger</h1>
              <p className="text-sm text-gray-600 mt-1">Contractor Financial Command Center</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            {!showResetPassword ? (
              <>
                {/* Email Field */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@contractor.com"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !loading) {
                        handleSignIn()
                      }
                    }}
                  />
                </div>

                {/* Remember / Forgot */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center">
                    <input
                      id="remember"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="remember" className="ml-2 block text-xs text-gray-600">
                      Remember me
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(true)
                      setResetEmail(email) // Pre-fill with login email if available
                      setError('')
                    }}
                    className="text-xs text-blue-600 hover:text-blue-500"
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Sign In Button */}
                <button
                  type="button"
                  onClick={handleSignIn}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-md transition"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">Or</span>
                  </div>
                </div>

                {/* Create Account Button */}
                <button
                  type="button"
                  onClick={handleSignUp}
                  disabled={loading}
                  className="w-full bg-transparent border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-4 rounded-md transition"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </>
            ) : (
              <>
                {/* Reset Password Form */}
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-gray-900">Reset Password</h2>
                  <p className="text-sm text-gray-600">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {resetSuccess ? (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded text-sm">
                      ✅ Password reset link sent! Check your email.
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <input
                          id="reset-email"
                          type="email"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          placeholder="you@contractor.com"
                          className="w-full px-3 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !resetLoading) {
                              handleResetPassword()
                            }
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={handleResetPassword}
                        disabled={resetLoading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 px-4 rounded-md transition"
                      >
                        {resetLoading ? 'Sending...' : 'Send Reset Link'}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowResetPassword(false)
                      setResetEmail('')
                      setError('')
                      setResetSuccess(false)
                    }}
                    className="w-full text-sm text-gray-600 hover:text-gray-800"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </>
            )}

            <p className="text-xs text-center text-gray-500 mt-4">
              By signing in, you agree to our{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Terms
              </a>{' '}
              and{' '}
              <a href="#" className="text-blue-600 hover:text-blue-500">
                Privacy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}