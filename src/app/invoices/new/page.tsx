'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { use } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'

export default function NewInvoice() {
  const { user } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const quoteId = searchParams.get('quote_id')

  const [clientId, setClientId] = useState('')
  const [clientName, setClientName] = useState('')
  const [dueDate, setDueDate] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().split('T')[0]
  })
  const [lineItems, setLineItems] = useState<{ description: string; quantity: number; rate: number }[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  // Load quote data if quote_id exists
  useEffect(() => {
    const loadQuote = async () => {
      if (!quoteId || !user) return

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
        setClientName(data.clients?.[0]?.name || 'Unknown Client')
        setLineItems(data.quote_items || [])
        setTotal(data.total)
      }
      setLoading(false)
    }

    loadQuote()
  }, [quoteId, user])

  // Calculate total (in case items are edited)
  useEffect(() => {
    const calculateTotal = () =>
      lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0)
    setTotal(calculateTotal())
  }, [lineItems])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !clientId || lineItems.length === 0) {
      return alert('Please fill out all fields.')
    }

    try {
      // Insert invoice
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          client_id: clientId,
          quote_id: quoteId || null,
          due_date: dueDate,
          status: 'sent',
          total,
        })
        .select('id')

      if (error) {
        return alert('Error creating invoice: ' + error.message)
      }

      const invoiceId = data?.[0]?.id
      if (!invoiceId) {
        return alert('Failed to retrieve invoice ID.')
      }

      // Insert line items
      const itemsToInsert = lineItems.map(item => ({
        invoice_id: invoiceId,
        description: item.description,
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
    } catch (error: any) {
      console.error('Unexpected error:', error)
      alert('An unexpected error occurred.')
    }
  }

  if (loading && quoteId) {
    return <div className="p-8 text-center">Loading quote data...</div>
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md space-y-6 rounded-xl bg-white p-8 shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">New Invoice</h1>
          <p className="mt-2 text-sm text-gray-600">
            {clientName ? `For: ${clientName}` : 'From quote or manual entry'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Due Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Line Items */}
            <div>
              <h2 className="text-lg font-semibold mb-2">Items</h2>
              {lineItems.map((item, index) => (
                <div key={index} className="flex space-x-2 mb-2">
                  <input
                    type="text"
                    value={item.description}
                    disabled
                    className="flex-grow block w-full rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  />
                  <input
                    type="number"
                    value={item.quantity}
                    disabled
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  />
                  <input
                    type="number"
                    value={item.rate}
                    disabled
                    className="w-20 rounded-md border border-gray-300 px-3 py-2 bg-gray-50"
                  />
                </div>
              ))}
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
              💳 Create Invoice
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}