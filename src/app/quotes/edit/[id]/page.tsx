'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Client, QuoteItem } from '@/lib/types'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import Link from 'next/link'
import React from 'react'

export default function EditQuote({ params }: { params: Promise<{ id: string }> }) {
  const { id: quoteId } = React.use(params)
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [lineItems, setLineItems] = useState<QuoteItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const router = useRouter()

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        console.error('Error loading clients:', error)
      } else {
        setClients(data || [])
      }
    }

    loadClients()
  }, [user])

  // Load quote data
  useEffect(() => {
    const loadQuote = async () => {
      if (!user || !quoteId) return

      const { data, error } = await supabase
        .from('quotes')
        .select(`
          title,
          client_id,
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
        console.error('Error loading quote:', error)
        alert('Failed to load quote.')
        router.push('/quotes')
      } else {
        setTitle(data.title)
        setClientId(data.client_id || '')
        setLineItems(data.quote_items || [])
      }
      setLoadingData(false)
    }

    loadQuote()
  }, [user, quoteId, router])

  // Calculate total
  useEffect(() => {
    const calculateTotal = () =>
      lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0)
    setTotal(calculateTotal())
  }, [lineItems])

  // Add line item
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }])
  }

  // Remove line item
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedItems = lineItems.filter((_, i) => i !== index)
      setLineItems(updatedItems)
    }
  }

  // Update line item
  const updateLineItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setLineItems(updatedItems)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !title.trim()) {
      return alert('Please enter a quote title.')
    }

    if (lineItems.length === 0) {
      return alert('Please add at least one line item.')
    }

    // Validate line items
    const validItems = lineItems.filter(item => 
      item.description.trim() && item.quantity > 0 && item.rate >= 0
    )

    if (validItems.length === 0) {
      return alert('Please add valid line items with description, quantity, and rate.')
    }

    setLoading(true)

    try {
      // Update quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          title: title.trim(),
          client_id: clientId || null,
          total,
        })
        .eq('id', quoteId)

      if (quoteError) {
        return alert('Error updating quote: ' + quoteError.message)
      }

      // Delete old line items
      await supabase
        .from('quote_items')
        .delete()
        .eq('quote_id', quoteId)

      // Insert new line items
      const itemsToInsert = validItems.map(item => ({
        quote_id: quoteId,
        description: item.description.trim(),
        quantity: item.quantity,
        rate: item.rate,
      }))

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('quote_items')
          .insert(itemsToInsert)

        if (itemsError) {
          return alert('Error saving line items: ' + itemsError.message)
        }
      }

      alert('✅ Quote updated successfully!')
      router.push(`/quotes/${quoteId}`)
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingSpinner text="Loading quote..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/quotes" className="text-blue-600 hover:underline">
            ← Back to Quotes
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">Edit Quote</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
              >
                <option value="">Select a client (optional)</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quote Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
                placeholder="e.g., Roof Repair Estimate"
                required
              />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Line Items <span className="text-red-500">*</span></h2>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm btn-success"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {lineItems.map((item, index) => (
                  <div key={index} className="flex space-x-2 items-center">
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Qty"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                      className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
                      min="0"
                      step="0.01"
                      required
                    />
                    <input
                      type="number"
                      placeholder="Rate"
                      value={item.rate}
                      onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
                      min="0"
                      step="0.01"
                      required
                    />
                    <div className="w-16 text-center">
                      <span className="text-sm text-gray-600">
                        ${(item.quantity * item.rate).toFixed(2)}
                      </span>
                    </div>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50"
                        title="Remove item"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
              <Link
                href="/quotes"
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-2.5 px-4 rounded-md transition text-center"
              >
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}