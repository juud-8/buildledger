import { Invoice, InvoiceItem } from '@/lib/types'
import { generateInvoiceNumber } from '@/lib/invoiceUtils'

interface InvoiceWithDetails extends Invoice {
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
}

export const validateInvoiceForEmail = (invoice: InvoiceWithDetails): { valid: boolean; error?: string } => {
  if (!invoice) {
    return { valid: false, error: 'Invoice not found' }
  }

  if (!invoice.clients?.email) {
    return { valid: false, error: 'Client email not found' }
  }

  if (!invoice.clients?.name) {
    return { valid: false, error: 'Client name not found' }
  }

  if (!invoice.invoice_items || invoice.invoice_items.length === 0) {
    return { valid: false, error: 'Invoice has no line items' }
  }

  return { valid: true }
}

export const formatEmailSubject = (invoice: InvoiceWithDetails): string => {
  const invoiceNumber = generateInvoiceNumber(invoice)
  return `Invoice from BuildLedger - ${invoiceNumber}`
}

export const formatEmailBody = (invoice: InvoiceWithDetails): string => {
  const clientName = invoice.clients?.name || 'Client'
  const total = invoice.total.toFixed(2)
  const invoiceNumber = generateInvoiceNumber(invoice)
  const dueDate = invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : null

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">Hello ${clientName},</h2>
      <p>Here is your invoice for <strong>$${total}</strong>.</p>
      <p>Invoice Number: ${invoiceNumber}</p>
      ${dueDate ? `<p>Due Date: ${dueDate}</p>` : ''}
      <p>Please find the detailed invoice attached to this email.</p>
      <p>Thank you for your business!</p>
      <br>
      <p>Best regards,<br>BuildLedger Team</p>
    </div>
  `
} 