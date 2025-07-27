'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Client, QuoteItem } from '@/lib/types'
import React from 'react'

export default function EditQuote({ params }: { params: Promise<{ id: string }> }) {
  const { id: quoteId } = React.use(params)
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [lineItems, setLineItems] = useState<QuoteItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Load clients
  useEffect(() => {
    const loadClients = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('clients')
        .select('id, name, user_id')
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
      setLoading(false)
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
    const updatedItems = [...lineItems]
    updatedItems.splice(index, 1)
    setLineItems(updatedItems)
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !title || lineItems.length === 0) {
      return alert('Please fill out all fields.')
    }

    try {
      // Update quote
      const { error: quoteError } = await supabase
        .from('quotes')
        .update({
          title,
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
      const itemsToInsert = lineItems
        .filter(item => item.description.trim())
        .map(item => ({
          quote_id: quoteId,
          description: item.description,
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
    }
  }

  if (loading) {
    return <div className="p-8 text-center">Loading quote...</div>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Edit Quote</h1>
          <p className="mt-2 text-sm text-gray-600">Update your estimate</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Client Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Line Items */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Line Items</h2>
              {lineItems.map((item, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => {
                      const updatedItems = [...lineItems]
                      updatedItems[index].description = e.target.value
                      setLineItems(updatedItems)
                    }}
                    className="flex-grow block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Qty"
                    value={item.quantity}
                    onChange={(e) => {
                      const updatedItems = [...lineItems]
                      updatedItems[index].quantity = parseFloat(e.target.value) || 1
                      setLineItems(updatedItems)
                    }}
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                  <input
                    type="number"
                    placeholder="Rate"
                    value={item.rate}
                    onChange={(e) => {
                      const updatedItems = [...lineItems]
                      updatedItems[index].rate = parseFloat(e.target.value) || 0
                      setLineItems(updatedItems)
                    }}
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addLineItem}
                className="mt-2 text-sm bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
              >
                + Add Item
              </button>
            </div>

            {/* Total */}
            <div className="border-t pt-2">
              <strong>Total:</strong> <span className="font-mono">${total.toFixed(2)}</span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-md transition"
            >
              💼 Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}