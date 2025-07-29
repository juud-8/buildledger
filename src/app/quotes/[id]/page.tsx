'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import Link from 'next/link'
import React from 'react'

// Types
type QuoteItem = {
  id: string
  description: string
  quantity: number
  rate: number
}

type Client = {
  name: string
}

type Quote = {
  id: string
  title: string
  status: string
  total: number
  created_at: string
  clients: Client | null
  quote_items: QuoteItem[]
}

export default function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params using React.use()
  const { id: quoteId } = React.use(params)

  // Get the current user from AuthProvider
  const { user } = useAuth()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchQuote = async () => {
      if (!user || !quoteId) return

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          title,
          status,
          total,
          created_at,
          clients ( name ),
          quote_items (
            id,
            description,
            quantity,
            rate
          )
        `)
        .eq('id', quoteId)
        .single()

      if (error) {
        console.error('Error fetching quote:', error)
        alert(`Failed to load quote: ${error.message}`)
        router.push('/quotes')
        return
      }

      if (!data) {
        console.error('No quote data found')
        alert('Quote not found.')
        router.push('/quotes')
        return
      }

      const transformedQuote = {
        ...data,
        clients:
          Array.isArray(data.clients)
            ? data.clients.length > 0
              ? { name: data.clients[0].name }
              : null
            : data.clients
            ? { name: (data.clients as { name: string }).name }
            : null,
      } as Quote

      setQuote(transformedQuote)
      setLoading(false)
    }

    fetchQuote()
  }, [user, quoteId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingSpinner text="Loading quote..." />
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 text-lg">Quote not found.</p>
            <Link href="/quotes" className="text-blue-600 hover:underline mt-4 inline-block">
              ← Back to Quotes
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/quotes" className="text-blue-600 hover:underline">
            ← Back to Quotes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Quote Details</h1>
        </div>

        {/* Quote Header */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">{quote.title}</h2>
              <p className="text-sm text-gray-600 mt-1">
                {quote.clients?.name || 'No Client'} • Created {formatDate(quote.created_at)}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
              {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
            </span>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">${quote.total.toFixed(2)}</p>
          </div>
        </div>

        {/* Line Items Table */}
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Line Items</h2>
          {quote.quote_items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No line items found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-sm font-medium text-gray-900">Description</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Quantity</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Rate</th>
                    <th className="px-4 py-3 text-sm font-medium text-gray-900 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.quote_items.map((item: QuoteItem) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-900">{item.description}</td>
                      <td className="px-4 py-3 text-gray-900 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-900 text-right">${item.rate.toFixed(2)}</td>
                      <td className="px-4 py-3 text-gray-900 text-right font-medium">
                        ${(item.quantity * item.rate).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-gray-200">
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold text-gray-900">
                      Total:
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-900">
                      ${quote.total.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button
            onClick={() => router.push(`/quotes/edit/${quote.id}`)}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition btn-primary"
          >
            Edit Quote
          </button>
          <button
            onClick={() => router.push(`/invoices/new?quote_id=${quote.id}`)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-md transition btn-success"
          >
            Convert to Invoice
          </button>
        </div>
      </div>
    </div>
  )
}