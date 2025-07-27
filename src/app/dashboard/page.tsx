'use client'

import { useAuth } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

interface DashboardStats {
  totalQuotes: number
  totalInvoices: number
  totalRevenue: number
  recentQuotes: number
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const loadStats = async () => {
      if (!user) return

      try {
        // Load dashboard statistics
        const [quotesResult, invoicesResult] = await Promise.all([
          supabase
            .from('quotes')
            .select('total, created_at')
            .eq('user_id', user.id),
          supabase
            .from('invoices')
            .select('total')
            .eq('user_id', user.id)
        ])

        const quotes = quotesResult.data || []
        const invoices = invoicesResult.data || []

        // Calculate recent quotes (last 30 days)
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        const recentQuotes = quotes.filter(
          q => new Date(q.created_at) > thirtyDaysAgo
        ).length

        setStats({
          totalQuotes: quotes.length,
          totalInvoices: invoices.length,
          totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
          recentQuotes
        })
      } catch (error) {
        console.error('Error loading dashboard stats:', error)
      } finally {
        setStatsLoading(false)
      }
    }

    loadStats()
  }, [user])

  if (loading) return <LoadingSpinner text="Loading dashboard..." />
  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                      <p className="text-gray-600 mt-2">
              Welcome back, <strong>{user.email}</strong>! Here&apos;s your business overview.
            </p>
        </div>

        {/* Stats Grid */}
        {statsLoading ? (
          <LoadingSpinner text="Loading statistics..." />
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl">📝</div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalQuotes}</p>
                  <p className="text-gray-600">Total Quotes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl">🧾</div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</p>
                  <p className="text-gray-600">Total Invoices</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl">💰</div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</p>
                  <p className="text-gray-600">Total Revenue</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl">⚡</div>
                <div className="ml-4">
                  <p className="text-2xl font-bold text-gray-900">{stats.recentQuotes}</p>
                  <p className="text-gray-600">Recent Quotes (30d)</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Unable to load statistics</p>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link
                href="/quotes/new"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-md transition"
              >
                📝 Create New Quote
              </Link>
              <Link
                href="/invoices/new"
                className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-3 px-4 rounded-md transition"
              >
                🧾 Create New Invoice
              </Link>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-2 text-sm text-gray-600">
              <p>✓ Set up your Supabase database</p>
              <p>✓ Configure environment variables</p>
              <p>• Add your first client</p>
              <p>• Create your first quote</p>
              <p>• Generate your first invoice</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}