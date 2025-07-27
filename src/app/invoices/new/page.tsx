'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { InvoiceItem, Client } from '@/lib/types'

// Type for new line items (without database fields)
interface NewInvoiceItem {
  description: string
  quantity: number
  rate: number
}
import Link from 'next/link'

export default function NewInvoice() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quote_id')

  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [lineItems, setLineItems] = useState<NewInvoiceItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)
  const [isFromQuote, setIsFromQuote] = useState(false)

  // Set default due date on client side only to avoid hydration mismatch
  useEffect(() => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    setDueDate(date.toISOString().split('T')[0])
  }, [])

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
      setLoadingClients(false)
    }

    loadClients()
  }, [user])

  // Load quote data if quote_id exists
  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId || !user) return

      setLoading(true)
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          client_id,
          clients ( name ),
          total,
          quote_items (
            description,
            quantity,
            rate
          )
        `)
        .eq('id', quoteId)
        .single()

      if (error) {
        console.error('Error loading quote:', error)
        alert('Failed to load quote data.')
      } else {
        setClientId(data.client_id || '')
        setLineItems(data.quote_items || [])
        setTotal(data.total)
        setIsFromQuote(true)
      }
      setLoading(false)
    }

    loadQuote()
  }, [quoteId, user])

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

  // Update line item
  const updateLineItem = (index: number, field: keyof NewInvoiceItem, value: string | number) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setLineItems(updatedItems)
  }

  // Remove line item
  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      const updatedItems = lineItems.filter((_, i) => i !== index)
      setLineItems(updatedItems)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !clientId || !dueDate) {
      return alert('Please fill out all required fields.')
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
      // Create invoice
      const { data: invoiceData, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: clientId,
          due_date: dueDate,
          status: 'draft',
          total,
        })
        .select('id')
        .single()

      if (invoiceError) {
        return alert('Error creating invoice: ' + invoiceError.message)
      }

      const invoiceId = invoiceData.id

      // Insert line items
      const itemsToInsert = validItems.map(item => ({
        invoice_id: invoiceId,
        description: item.description.trim(),
        quantity: item.quantity,
        rate: item.rate,
      }))

      const { error: itemsError } = await supabase
        .from('invoice_items')
        .insert(itemsToInsert)

      if (itemsError) {
        return alert('Error saving invoice items: ' + itemsError.message)
      }

      alert('✅ Invoice created successfully!')
      router.push(`/invoices/${invoiceId}`)
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingSpinner text="Loading quote data..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/invoices" className="text-blue-600 hover:underline">
            ← Back to Invoices
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">
            New Invoice {isFromQuote && '(From Quote)'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* Client Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client <span className="text-red-500">*</span>
              </label>
              {loadingClients ? (
                <p className="text-gray-500">Loading clients...</p>
              ) : (
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  disabled={isFromQuote}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 disabled:bg-gray-100 form-input"
                  required
                >
                  <option value="">Select a client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 form-input"
                required
              />
            </div>

            {/* Line Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Line Items <span className="text-red-500">*</span></h2>
                {!isFromQuote && (
                  <button
                    type="button"
                    onClick={addLineItem}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    + Add Item
                  </button>
                )}
              </div>

              {lineItems.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No items added yet. Click &quot;Add Item&quot; to get started.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium text-gray-600">Description</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600 w-24">Qty</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">Rate</th>
                        <th className="px-3 py-2 text-right font-medium text-gray-600 w-32">Amount</th>
                        {!isFromQuote && <th className="w-10" />}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {lineItems.map((item, index) => (
                        <tr key={index} className="align-top">
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              placeholder="Description"
                              value={item.description}
                              onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                              disabled={isFromQuote}
                              className="w-full px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              required
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                              disabled={isFromQuote}
                              className="w-full text-right px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="px-3 py-2 text-right">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                              disabled={isFromQuote}
                              className="w-full text-right px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                              min="0"
                              step="0.01"
                              required
                            />
                          </td>
                          <td className="px-3 py-2 text-right font-mono">
                            ${(item.quantity * item.rate).toFixed(2)}
                          </td>
                          {!isFromQuote && (
                            <td className="px-2 py-2 text-center">
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
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-gray-900">Total:</span>
                <span className="text-2xl font-bold text-gray-900 font-mono">
                  ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
                {loading ? 'Creating...' : 'Create Invoice'}
              </button>
              <Link
                href="/invoices"
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