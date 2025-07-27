'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useAuth } from '@/components/AuthProvider'
import { Navigation } from '@/components/Navigation'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { Invoice } from '@/lib/types'
import { generateInvoiceNumber } from '@/lib/invoiceUtils'
import Link from 'next/link'

interface InvoiceListItem extends Omit<Invoice, 'clients'> {
  clients?: { name: string } | null
}

export default function InvoicesList() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<InvoiceListItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadInvoices = async () => {
      if (!user) return

      // Fetch invoices with client names
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          id,
          user_id,
          client_id,
          quote_id,
          due_date,
          status,
          total,
          created_at,
          clients ( name )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading invoices:', error)
      } else {
        // Transform the data to match our interface
        const transformedData = (data || []).map((invoice: { clients?: { name: string }[] }) => ({
          ...invoice,
          clients: invoice.clients?.[0] || null
        }))
        setInvoices(transformedData)
      }
      setLoading(false)
    }

    loadInvoices()
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
      case 'paid': return 'bg-green-100 text-green-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Check if invoice is overdue
  const isOverdue = (dueDate: string, status: string) => {
    if (status === 'paid') return false
    return new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <LoadingSpinner text="Loading invoices..." />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <Link href="/invoices/new">
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">
              + New Invoice
            </button>
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">You haven&apos;t created any invoices yet.</p>
            <Link href="/invoices/new" className="text-green-600 hover:underline mt-2 inline-block">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <Link key={invoice.id} href={`/invoices/${invoice.id}`}>
                <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition cursor-pointer bg-white">
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {generateInvoiceNumber(invoice)}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {invoice.clients?.name || 'No Client'} • Created {formatDate(invoice.created_at)}
                    </p>
                    {invoice.due_date && (
                      <p className="text-sm text-gray-500">
                        Due: {formatDate(invoice.due_date)}
                        {isOverdue(invoice.due_date, invoice.status) && (
                          <span className="text-red-600 ml-2">(Overdue)</span>
                        )}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 mt-2 md:mt-0">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                    <div className="text-right">
                      <p className="font-mono font-medium text-gray-900">${invoice.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 