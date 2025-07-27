import { Invoice } from '@/lib/types'

export const generateInvoiceNumber = (invoice: Invoice | { id: string }): string => {
  // Use the first 8 characters of the UUID as a simple invoice number
  return `INV-${invoice.id.slice(0, 8).toUpperCase()}`
}

export const formatInvoiceDisplay = (invoice: Invoice): string => {
  return generateInvoiceNumber(invoice)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
} 