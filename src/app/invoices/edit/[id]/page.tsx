'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { InvoiceItem } from '@/lib/types'
import React from 'react'
import Link from 'next/link'

interface InvoiceDetail {
  id: string
  user_id: string
  client_id: string | null
  quote_id: string | null
  invoice_number: string
  due_date: string
  status: string
  total: number
  notes: string
  created_at: string
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
}

// Type for new line items (without database fields)
interface NewInvoiceItem {
  description: string
  quantity: number
  rate: number
}

export default function EditInvoice({ params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = React.use(params)
  const { user } = useAuth()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [lineItems, setLineItems] = useState<NewInvoiceItem[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  // Load invoice data
  useEffect(() => {
    const loadInvoice = async () => {
      if (!user || !invoiceId) return

      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          clients (
            name,
            email,
            phone,
            address
          ),
          invoice_items (
            id,
            description,
            quantity,
            rate
          )
        `)
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .single()

      if (error) {
        console.error('Error loading invoice:', error)
        alert('Failed to load invoice')
        router.push('/invoices')
      } else {
        setInvoice(data)
        setLineItems(data.invoice_items || [])
        setTotal(data.total)
      }
      setLoading(false)
    }

    loadInvoice()
  }, [user, invoiceId, router])



  // Calculate total whenever lineItems change
  useEffect(() => {
    const calculateTotal = () =>
      lineItems.reduce((acc, item) => acc + item.quantity * item.rate, 0)
    setTotal(calculateTotal())
  }, [lineItems])

  const addLineItem = () => {
    setLineItems([...lineItems, { description: '', quantity: 1, rate: 0 }])
  }

  const removeLineItem = (index: number) => {
    const updatedItems = [...lineItems]
    updatedItems.splice(index, 1)
    setLineItems(updatedItems)
  }

  const updateLineItem = (index: number, field: keyof NewInvoiceItem, value: string | number) => {
    const updatedItems = [...lineItems]
    updatedItems[index] = { ...updatedItems[index], [field]: value }
    setLineItems(updatedItems)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user || !invoice) {
      return alert('Please fill out all fields.')
    }

    setSaving(true)
    try {
      // Update invoice
      const { error: invoiceError } = await supabase
        .from('invoices')
        .update({
          total,
          notes: invoice.notes
        })
        .eq('id', invoice.id)
        .eq('user_id', user.id)

      if (invoiceError) {
        throw invoiceError
      }

      // Delete existing line items
      const { error: deleteError } = await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoice.id)

      if (deleteError) {
        throw deleteError
      }

      // Insert new line items
      const itemsToInsert = lineItems
        .filter(item => item.description.trim())
        .map(item => ({
          invoice_id: invoice.id,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
        }))

      if (itemsToInsert.length > 0) {
        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(itemsToInsert)

        if (itemsError) {
          throw itemsError
        }
      }

      alert('✅ Invoice updated successfully!')
      router.push(`/invoices/${invoice.id}`)
    } catch (error) {
      console.error('Error updating invoice:', error)
      alert('Failed to update invoice. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingSpinner text="Loading invoice..." />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Invoice Not Found</h1>
            <Link href="/invoices" className="text-blue-600 hover:underline">
              ← Back to Invoices
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href={`/invoices/${invoice.id}`} className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Invoice
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Edit Invoice</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Invoice Details */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Invoice Number
                </label>
                <input
                  type="text"
                  value={invoice.invoice_number || ''}
                  onChange={(e) => setInvoice({ ...invoice, invoice_number: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="INV-001"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={invoice.due_date || ''}
                  onChange={(e) => setInvoice({ ...invoice, due_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={invoice.notes || ''}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Additional notes..."
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
            {lineItems.map((item, index) => (
              <div key={index} className="flex space-x-2 mb-2">
                <input
                  type="text"
                  placeholder="Description"
                  value={item.description}
                  onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                  className="flex-grow px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={item.quantity}
                  onChange={(e) => updateLineItem(index, 'quantity', parseFloat(e.target.value) || 1)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <input
                  type="number"
                  placeholder="Rate"
                  value={item.rate}
                  onChange={(e) => updateLineItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
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

            <div className="mt-4 pt-4 border-t">
              <strong>Total:</strong> <span className="font-mono">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => router.push(`/invoices/${invoice.id}`)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 