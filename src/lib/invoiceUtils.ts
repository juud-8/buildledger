import { Invoice, InvoiceWithStats, InvoiceStatus } from '@/lib/types'

/**
 * Generate a human-readable invoice number from an invoice
 * @param invoice - The invoice object
 * @returns Formatted invoice number string
 */
export const generateInvoiceNumber = (invoice: Invoice | { id: string }): string => {
  // Use the first 8 characters of the UUID as a simple invoice number
  return `INV-${invoice.id.slice(0, 8).toUpperCase()}`
}

/**
 * Format invoice for display purposes
 * @param invoice - The invoice to format
 * @returns Formatted display string
 */
export const formatInvoiceDisplay = (invoice: Invoice): string => {
  return generateInvoiceNumber(invoice)
}

/**
 * Format currency amount with proper locale and currency symbol
 * @param amount - The amount to format
 * @param currency - Currency code (default: USD)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number, 
  currency: string = 'USD', 
  locale: string = 'en-US'
): string => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

/**
 * Calculate the total amount for invoice items
 * @param items - Array of invoice items
 * @returns Total amount
 */
export const calculateInvoiceTotal = (items: Array<{ quantity: number; rate: number }>): number => {
  return items.reduce((total, item) => total + (item.quantity * item.rate), 0)
}

/**
 * Check if an invoice is overdue
 * @param invoice - The invoice to check
 * @returns True if the invoice is overdue
 */
export const isInvoiceOverdue = (invoice: Invoice): boolean => {
  if (!invoice.due_date || invoice.status === 'paid') {
    return false
  }
  
  const dueDate = new Date(invoice.due_date)
  const today = new Date()
  
  // Reset time to compare dates only
  dueDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  return dueDate < today
}

/**
 * Calculate days overdue for an invoice
 * @param invoice - The invoice to calculate for
 * @returns Number of days overdue (negative if not overdue)
 */
export const getDaysOverdue = (invoice: Invoice): number => {
  if (!invoice.due_date) {
    return 0
  }
  
  const dueDate = new Date(invoice.due_date)
  const today = new Date()
  
  // Reset time to compare dates only
  dueDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = today.getTime() - dueDate.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Calculate days until due for an invoice
 * @param invoice - The invoice to calculate for
 * @returns Number of days until due (negative if overdue)
 */
export const getDaysUntilDue = (invoice: Invoice): number => {
  if (!invoice.due_date) {
    return 0
  }
  
  const dueDate = new Date(invoice.due_date)
  const today = new Date()
  
  // Reset time to compare dates only
  dueDate.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = dueDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Get the appropriate status for an invoice based on due date and payment status
 * @param invoice - The invoice to determine status for
 * @returns Updated invoice status
 */
export const getInvoiceStatus = (invoice: Invoice): InvoiceStatus => {
  // If already paid, keep paid status
  if (invoice.status === 'paid') {
    return 'paid'
  }
  
  // If cancelled, keep cancelled status
  if (invoice.status === 'cancelled') {
    return 'cancelled'
  }
  
  // Check if overdue
  if (isInvoiceOverdue(invoice)) {
    return 'overdue'
  }
  
  // Return current status for draft/sent
  return invoice.status
}

/**
 * Add computed fields to an invoice for display and business logic
 * @param invoice - The base invoice
 * @returns Invoice with computed stats
 */
export const addInvoiceStats = (invoice: Invoice): InvoiceWithStats => {
  const daysOverdue = getDaysOverdue(invoice)
  const daysUntilDue = getDaysUntilDue(invoice)
  const isOverdue = isInvoiceOverdue(invoice)
  const status = getInvoiceStatus(invoice)
  
  return {
    ...invoice,
    days_overdue: daysOverdue > 0 ? daysOverdue : undefined,
    is_overdue: isOverdue,
    days_until_due: daysUntilDue > 0 ? daysUntilDue : undefined,
    client_name: invoice.clients?.name,
    payment_status: status === 'paid' ? 'paid' : 'unpaid',
    status,
  }
}

/**
 * Validate invoice data before saving
 * @param invoice - The invoice data to validate
 * @returns Validation result with errors if any
 */
export const validateInvoice = (invoice: Partial<Invoice>): { valid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  // Check required fields
  if (!invoice.client_id) {
    errors.push('Client is required')
  }
  
  if (!invoice.total || invoice.total <= 0) {
    errors.push('Total amount must be greater than 0')
  }
  
  // Check due date if provided
  if (invoice.due_date) {
    const dueDate = new Date(invoice.due_date)
    if (isNaN(dueDate.getTime())) {
      errors.push('Invalid due date format')
    }
  }
  
  // Check invoice items if provided
  if (invoice.invoice_items && invoice.invoice_items.length > 0) {
    invoice.invoice_items.forEach((item, index) => {
      if (!item.description?.trim()) {
        errors.push(`Item ${index + 1}: Description is required`)
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push(`Item ${index + 1}: Quantity must be greater than 0`)
      }
      if (!item.rate || item.rate <= 0) {
        errors.push(`Item ${index + 1}: Rate must be greater than 0`)
      }
    })
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Generate a default due date (30 days from now)
 * @returns ISO string of the default due date
 */
export const getDefaultDueDate = (): string => {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 30)
  return dueDate.toISOString().split('T')[0]
}

/**
 * Format date for display
 * @param dateString - ISO date string
 * @param format - Date format (default: 'MM/DD/YYYY')
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, format: 'MM/DD/YYYY' | 'MMM DD, YYYY' | 'YYYY-MM-DD' = 'MM/DD/YYYY'): string => {
  const date = new Date(dateString)
  
  if (isNaN(date.getTime())) {
    return 'Invalid Date'
  }
  
  switch (format) {
    case 'MM/DD/YYYY':
      return date.toLocaleDateString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
      })
    case 'MMM DD, YYYY':
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    case 'YYYY-MM-DD':
      return date.toISOString().split('T')[0]
    default:
      return date.toLocaleDateString()
  }
} 