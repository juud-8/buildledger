import React from 'react'
import { pdf, Document, Page } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/InvoicePDF'
import { Invoice, InvoiceItem } from '@/lib/types'
import { generateInvoiceNumber } from '@/lib/invoiceUtils'

interface InvoiceWithDetails extends Invoice {
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
}

export const generateInvoicePDF = async (invoice: InvoiceWithDetails): Promise<Blob> => {
  const element = React.createElement(InvoicePDF, { invoice })
  const blob = await pdf(element as React.ReactElement).toBlob()
  return blob
}

export const downloadInvoicePDF = async (invoice: InvoiceWithDetails, filename?: string) => {
  try {
    const blob = await generateInvoicePDF(invoice)
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `${generateInvoiceNumber(invoice)}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error generating PDF:', error)
    throw new Error('Failed to generate PDF')
  }
}

export const openInvoicePDFInNewTab = async (invoice: InvoiceWithDetails) => {
  try {
    const blob = await generateInvoicePDF(invoice)
    const url = URL.createObjectURL(blob)
    
    const newWindow = window.open(url, '_blank')
    if (newWindow) {
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  } catch (error) {
    console.error('Error opening PDF:', error)
    throw new Error('Failed to open PDF')
  }
} 