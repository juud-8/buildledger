import React from 'react'
import { pdf, Document, Page } from '@react-pdf/renderer'
import { InvoicePDF } from '@/components/InvoicePDF'
import { Invoice, InvoiceItem } from '@/lib/types'
import { generateInvoiceNumber } from '@/lib/invoiceUtils'

/**
 * Extended invoice interface that includes related data for PDF generation
 */
interface InvoiceWithDetails extends Invoice {
  clients?: { 
    name: string; 
    email?: string; 
    phone?: string; 
    address?: string 
  }
  invoice_items?: InvoiceItem[]
}

/**
 * Generates a PDF blob from an invoice with full details
 * @param invoice - The invoice with client and item details
 * @returns Promise<Blob> - The generated PDF as a blob
 * @throws Error if PDF generation fails
 */
export const generateInvoicePDF = async (invoice: InvoiceWithDetails): Promise<Blob> => {
  try {
    // InvoicePDF already includes Document wrapper, so we can use it directly
    const blob = await pdf(<InvoicePDF invoice={invoice} />).toBlob()
    return blob
  } catch (error) {
    console.error('PDF generation failed:', error)
    throw new Error(`Failed to generate PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Downloads an invoice PDF to the user's device
 * @param invoice - The invoice to download
 * @param filename - Optional custom filename (defaults to invoice number)
 * @throws Error if download fails
 */
export const downloadInvoicePDF = async (invoice: InvoiceWithDetails, filename?: string) => {
  try {
    const blob = await generateInvoicePDF(invoice)
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `${generateInvoiceNumber(invoice)}.pdf`
    link.style.display = 'none' // Hide the link element
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the object URL to prevent memory leaks
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading PDF:', error)
    throw new Error(`Failed to download PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Opens an invoice PDF in a new browser tab
 * @param invoice - The invoice to display
 * @throws Error if opening fails
 */
export const openInvoicePDFInNewTab = async (invoice: InvoiceWithDetails) => {
  try {
    const blob = await generateInvoicePDF(invoice)
    const url = URL.createObjectURL(blob)
    
    const newWindow = window.open(url, '_blank')
    if (!newWindow) {
      throw new Error('Failed to open new window - popup may be blocked')
    }
    
    // Clean up the URL after a delay to prevent memory leaks
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch (error) {
    console.error('Error opening PDF:', error)
    throw new Error(`Failed to open PDF: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Generates a PDF blob and returns it as a data URL
 * Useful for embedding PDFs in iframes or img tags
 * @param invoice - The invoice to convert
 * @returns Promise<string> - Data URL of the PDF
 * @throws Error if conversion fails
 */
export const generateInvoicePDFAsDataURL = async (invoice: InvoiceWithDetails): Promise<string> => {
  try {
    const blob = await generateInvoicePDF(invoice)
    return URL.createObjectURL(blob)
  } catch (error) {
    console.error('Error generating PDF data URL:', error)
    throw new Error(`Failed to generate PDF data URL: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
} 