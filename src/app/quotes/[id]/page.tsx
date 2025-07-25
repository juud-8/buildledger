'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
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
          clients:clients!inner ( name ),
          quote_items (
            id,
            description,
            quantity,
            rate
          )
        `)
        .eq('id', quoteId)
        .single()

      if (error || !data) {
        console.error('Error fetching quote:', error)
        alert('Failed to load quote. Please try again.')
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
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading quote...</p>
      </div>
    )
  }

  if (!quote) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Quote not found.</p>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Quote Details</h1>

      {/* Quote Header */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold">{quote.title}</h2>
        <p className="text-sm text-gray-600">
          {quote.clients?.name || 'No Client'} • Created {formatDate(quote.created_at)}
        </p>
        <p className="mt-2 font-mono text-lg">${quote.total.toFixed(2)}</p>
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800`}>
          {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
        </span>
      </div>

      {/* Line Items Table */}
      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Line Items</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="border-b border-gray-200 px-4 py-2">Description</th>
              <th className="border-b border-gray-200 px-4 py-2">Quantity</th>
              <th className="border-b border-gray-200 px-4 py-2">Rate</th>
              <th className="border-b border-gray-200 px-4 py-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {quote.quote_items.map((item: QuoteItem) => (
              <tr key={item.id} className="border-b border-gray-200">
                <td className="px-4 py-2">{item.description}</td>
                <td className="px-4 py-2">{item.quantity}</td>
                <td className="px-4 py-2">${item.rate.toFixed(2)}</td>
                <td className="px-4 py-2">${(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push(`/quotes/edit/${quote.id}`)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Edit Quote
        </button>
        <button
          onClick={() => router.push(`/invoices/new?quote_id=${quote.id}`)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
        >
          Convert to Invoice
        </button>
      </div>
    </div>
  )
}