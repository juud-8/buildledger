'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Client, QuoteItem } from '@/lib/types'

export default function NewQuote() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [clientId, setClientId] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [lineItems, setLineItems] = useState<QuoteItem[]>([{ description: '', quantity: 1, rate: 0 }])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load clients on mount
  useEffect(() => {
    const loadClients = async () => {
      if (!user) return
      const { data, error } = await supabase
        .from('clients')
        .select('id, name')
        .eq('user_id', user.id)
        .order('name')

      if (error) {
        console.error('Error loading clients:', error)
      } else {
        setClients(data || [])
      }
      setLoading(false)
    }

    loadClients()
  }, [user])

  // Calculate total whenever lineItems change
  useEffect(() => {
    const calculateTotal = () =>
      lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0)
    setTotal(calculateTotal())
  }, [lineItems])

  // Add a new line item
  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }])
  }

  // Remove a line item by index
  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems]
    updatedItems.splice(index, 1)
    setLineItems(updatedItems)
  }

// Handle form submission
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()

  // Validate inputs
  if (!user || !title || lineItems.length === 0) {
    return alert('Please fill out all fields.')
  }

  try {
    // Step 1: Insert quote and RETURN the ID
    const { data, error: quoteError } = await supabase
      .from('quotes')
      .insert({
        user_id: user.id,
        client_id: clientId || null,
        title,
        status: 'draft',
        total,
      })
      .select('id') // ← Ensures we get the ID back

    if (quoteError) {
      return alert('Error saving quote: ' + quoteError.message)
    }

    // Extract the new quote ID
    const quoteId = data?.[0]?.id
    if (!quoteId) {
      return alert('Failed to retrieve quote ID after creation.')
    }

    // Step 2: Prepare and insert line items
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

    // Success!
    alert('✅ Quote and line items saved successfully!')
    console.log('New quote created with ID:', quoteId)
  } catch (error) {
    console.error('Unexpected error:', error)
    alert('An unexpected error occurred: ' + (error instanceof Error ? error.message : 'Unknown error'))
  }
}

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">New Quote</h1>
          <p className="mt-2 text-sm text-gray-600">Create an estimate for your client</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Client Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Client</label>
              {loading ? (
                <div className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-500">
                  Loading...
                </div>
              ) : (
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900"
                >
                  <option value="">Select a client</option>
                  {clients.length === 0 ? (
                    <option disabled>No clients found</option>
                  ) : (
                    clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900"
                placeholder="Roof Repair Estimate"
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
                    className="flex-grow block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900"
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
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900"
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
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none text-gray-900"
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
              💼 Save Quote
            </button>
          </div>
        </form>
      </div>

      {/* Footer */}
      <footer className="w-full bg-gray-100 p-4 text-center text-sm mt-auto">
        <p>© 2023 BuildLedger. All rights reserved.</p>
      </footer>
    </div>
  )
}