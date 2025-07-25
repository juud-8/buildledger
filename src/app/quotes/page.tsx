'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'

export default function QuotesList() {
  const { user } = useAuth()
  const [quotes, setQuotes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadQuotes = async () => {
      if (!user) return

      // Fetch quotes with client names
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          id,
          title,
          status,
          total,
          created_at,
          clients ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading quotes:', error)
      } else {
        setQuotes(data || [])
      }
      setLoading(false)
    }

    loadQuotes()
  }, [user])

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  // Status badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'accepted': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-600">Loading quotes...</p>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
        <Link href="/quotes/new">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            + New Quote
          </button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">You haven’t created any quotes yet.</p>
          <Link href="/quotes/new" className="text-blue-600 hover:underline mt-2 inline-block">
            Create your first quote
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {quotes.map((quote) => (
            <Link key={quote.id} href={`/quotes/${quote.id}`}>
              <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer bg-white">
                <div>
                  <h3 className="font-semibold text-gray-900">{quote.title}</h3>
                  <p className="text-sm text-gray-600">
                    {quote.clients?.name || 'No Client'} • Created {formatDate(quote.created_at)}
                  </p>
                </div>

                <div className="flex items-center space-x-4 mt-2 md:mt-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                    {quote.status.charAt(0).toUpperCase() + quote.status.slice(1)}
                  </span>
                  <div className="text-right">
                    <p className="font-mono font-medium text-gray-900">${quote.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}