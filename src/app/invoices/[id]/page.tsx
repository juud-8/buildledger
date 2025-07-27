'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Invoice, InvoiceItem } from '@/lib/types'
import { downloadInvoicePDF, openInvoicePDFInNewTab } from '@/lib/pdfUtils'
import Link from 'next/link'

interface InvoiceDetail extends Invoice {
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
}

export default function InvoiceDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id: invoiceId } = React.use(params)
  const { user } = useAuth()
  const router = useRouter()
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

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
      }
      setLoading(false)
    }

    loadInvoice()
  }, [user, invoiceId, router])

  const handleMarkAsPaid = async () => {
    if (!invoice || !user) return

    setUpdating(true)
    try {
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'paid' })
        .eq('id', invoice.id)
        .eq('user_id', user.id)

      if (error) {
        throw error
      }

      // Update local state
      setInvoice({ ...invoice, status: 'paid' })
      alert('✅ Invoice marked as paid!')
    } catch (error) {
      console.error('Error marking invoice as paid:', error)
      alert('Failed to mark invoice as paid')
    } finally {
      setUpdating(false)
    }
  }

  const handleGeneratePDF = async () => {
    if (!invoice) return
    
    try {
      await downloadInvoicePDF(invoice)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    }
  }

  const handlePreviewPDF = async () => {
    if (!invoice) return
    
    try {
      await openInvoicePDFInNewTab(invoice)
    } catch (error) {
      console.error('Error previewing PDF:', error)
      alert('Failed to preview PDF. Please try again.')
    }
  }

  const handleSendEmail = () => {
    // This will be implemented with email integration
    alert('Email sending coming soon!')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false
    return new Date(dueDate) < new Date()
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
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <Link href="/invoices" className="text-blue-600 hover:underline mb-4 inline-block">
              ← Back to Invoices
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {invoice.invoice_number || `Invoice #${invoice.id.slice(0, 8)}`}
            </h1>
            <p className="text-gray-600 mt-2">
              Created {formatDate(invoice.created_at)}
            </p>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handlePreviewPDF}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              👁️ Preview PDF
            </button>
            <button
              onClick={handleGeneratePDF}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              📄 Download PDF
            </button>
            <button
              onClick={handleSendEmail}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              📧 Send Email
            </button>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Client Information */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Bill To</h2>
              <div className="space-y-2">
                <p className="font-medium">{invoice.clients?.name || 'No Client'}</p>
                {invoice.clients?.email && (
                  <p className="text-gray-600">{invoice.clients.email}</p>
                )}
                {invoice.clients?.phone && (
                  <p className="text-gray-600">{invoice.clients.phone}</p>
                )}
                {invoice.clients?.address && (
                  <p className="text-gray-600">{invoice.clients.address}</p>
                )}
              </div>
            </div>

            {/* Invoice Status */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                    {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </span>
                </div>
                {invoice.due_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className={isOverdue(invoice.due_date, invoice.status) ? 'text-red-600 font-medium' : ''}>
                      {formatDate(invoice.due_date)}
                      {isOverdue(invoice.due_date, invoice.status) && ' (Overdue)'}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold text-lg">${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Line Items</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invoice.invoice_items?.map((item, index) => (
                  <tr key={item.id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {item.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      ${item.rate.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50">
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-right font-bold text-gray-900">
                    Total:
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-lg text-gray-900">
                    ${invoice.total.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
          <div className="flex flex-wrap gap-3">
            {invoice.status !== 'paid' && (
              <button
                onClick={handleMarkAsPaid}
                disabled={updating}
                className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium"
              >
                {updating ? 'Updating...' : '✅ Mark as Paid'}
              </button>
            )}
            <Link href={`/invoices/edit/${invoice.id}`}>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium">
                ✏️ Edit Invoice
              </button>
            </Link>
            <button
              onClick={() => router.push('/invoices')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium"
            >
              📋 Back to Invoices
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 