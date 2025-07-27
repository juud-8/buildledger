import { Invoice, InvoiceItem, Quote, QuoteItem } from '@/lib/types'
import { generateInvoiceNumber, formatCurrency, formatDate } from '@/lib/invoiceUtils'

/**
 * Extended invoice interface for email operations
 */
interface InvoiceWithDetails extends Invoice {
  clients?: { name: string; email?: string; phone?: string; address?: string }
  invoice_items?: InvoiceItem[]
}

/**
 * Extended quote interface for email operations
 */
interface QuoteWithDetails extends Quote {
  clients?: { name: string; email?: string; phone?: string; address?: string }
  quote_items?: QuoteItem[]
}

/**
 * Email template configuration
 */
interface EmailTemplateConfig {
  companyName: string
  companyEmail: string
  companyPhone?: string
  companyAddress?: string
  logoUrl?: string
}

/**
 * Default email template configuration
 */
const DEFAULT_EMAIL_CONFIG: EmailTemplateConfig = {
  companyName: 'BuildLedger',
  companyEmail: 'support@buildledger.pro',
  companyPhone: undefined,
  companyAddress: undefined,
  logoUrl: undefined,
}

/**
 * Validate invoice data for email sending
 * @param invoice - The invoice to validate
 * @returns Validation result with error message if invalid
 */
export const validateInvoiceForEmail = (invoice: InvoiceWithDetails): { valid: boolean; error?: string } => {
  if (!invoice) {
    return { valid: false, error: 'Invoice not found' }
  }

  if (!invoice.clients?.email) {
    return { valid: false, error: 'Client email address is required' }
  }

  if (!invoice.clients?.name) {
    return { valid: false, error: 'Client name is required' }
  }

  if (!invoice.invoice_items || invoice.invoice_items.length === 0) {
    return { valid: false, error: 'Invoice must have at least one line item' }
  }

  if (!invoice.total || invoice.total <= 0) {
    return { valid: false, error: 'Invoice total must be greater than zero' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(invoice.clients.email)) {
    return { valid: false, error: 'Invalid client email format' }
  }

  return { valid: true }
}

/**
 * Validate quote data for email sending
 * @param quote - The quote to validate
 * @returns Validation result with error message if invalid
 */
export const validateQuoteForEmail = (quote: QuoteWithDetails): { valid: boolean; error?: string } => {
  if (!quote) {
    return { valid: false, error: 'Quote not found' }
  }

  if (!quote.clients?.email) {
    return { valid: false, error: 'Client email address is required' }
  }

  if (!quote.clients?.name) {
    return { valid: false, error: 'Client name is required' }
  }

  if (!quote.quote_items || quote.quote_items.length === 0) {
    return { valid: false, error: 'Quote must have at least one line item' }
  }

  if (!quote.total || quote.total <= 0) {
    return { valid: false, error: 'Quote total must be greater than zero' }
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(quote.clients.email)) {
    return { valid: false, error: 'Invalid client email format' }
  }

  return { valid: true }
}

/**
 * Generate email subject line for invoice
 * @param invoice - The invoice
 * @param config - Email template configuration
 * @returns Formatted subject line
 */
export const formatInvoiceEmailSubject = (invoice: InvoiceWithDetails, config: EmailTemplateConfig = DEFAULT_EMAIL_CONFIG): string => {
  const invoiceNumber = generateInvoiceNumber(invoice)
  return `Invoice ${invoiceNumber} from ${config.companyName}`
}

/**
 * Generate email subject line for quote
 * @param quote - The quote
 * @param config - Email template configuration
 * @returns Formatted subject line
 */
export const formatQuoteEmailSubject = (quote: QuoteWithDetails, config: EmailTemplateConfig = DEFAULT_EMAIL_CONFIG): string => {
  return `Quote: ${quote.title} from ${config.companyName}`
}

/**
 * Generate HTML email body for invoice
 * @param invoice - The invoice
 * @param config - Email template configuration
 * @returns HTML email body
 */
export const formatInvoiceEmailBody = (invoice: InvoiceWithDetails, config: EmailTemplateConfig = DEFAULT_EMAIL_CONFIG): string => {
  const clientName = invoice.clients?.name || 'Client'
  const total = formatCurrency(invoice.total)
  const invoiceNumber = generateInvoiceNumber(invoice)
  const dueDate = invoice.due_date ? formatDate(invoice.due_date, 'MMM DD, YYYY') : null
  const createdDate = formatDate(invoice.created_at, 'MMM DD, YYYY')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Invoice ${invoiceNumber}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${config.companyName}" style="max-width: 200px; margin-bottom: 20px;">` : ''}
      
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Hello ${clientName},</h2>
      
      <p>Thank you for your business! Please find your invoice attached to this email.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2c3e50;">Invoice Summary</h3>
        <p><strong>Invoice Number:</strong> ${invoiceNumber}</p>
        <p><strong>Date:</strong> ${createdDate}</p>
        ${dueDate ? `<p><strong>Due Date:</strong> ${dueDate}</p>` : ''}
        <p><strong>Total Amount:</strong> <span style="font-size: 1.2em; font-weight: bold; color: #27ae60;">${total}</span></p>
      </div>
      
      ${invoice.notes ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="margin-top: 0; color: #856404;">Notes</h4>
          <p style="margin-bottom: 0;">${invoice.notes}</p>
        </div>
      ` : ''}
      
      <p>If you have any questions about this invoice, please don't hesitate to contact us.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin-bottom: 5px;"><strong>${config.companyName}</strong></p>
        ${config.companyPhone ? `<p style="margin-bottom: 5px;">Phone: ${config.companyPhone}</p>` : ''}
        <p style="margin-bottom: 5px;">Email: ${config.companyEmail}</p>
        ${config.companyAddress ? `<p style="margin-bottom: 0;">${config.companyAddress}</p>` : ''}
      </div>
    </body>
    </html>
  `
}

/**
 * Generate HTML email body for quote
 * @param quote - The quote
 * @param config - Email template configuration
 * @returns HTML email body
 */
export const formatQuoteEmailBody = (quote: QuoteWithDetails, config: EmailTemplateConfig = DEFAULT_EMAIL_CONFIG): string => {
  const clientName = quote.clients?.name || 'Client'
  const total = formatCurrency(quote.total)
  const createdDate = formatDate(quote.created_at, 'MMM DD, YYYY')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Quote: ${quote.title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      ${config.logoUrl ? `<img src="${config.logoUrl}" alt="${config.companyName}" style="max-width: 200px; margin-bottom: 20px;">` : ''}
      
      <h2 style="color: #2c3e50; margin-bottom: 20px;">Hello ${clientName},</h2>
      
      <p>Thank you for your interest! Please find your quote attached to this email.</p>
      
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #2c3e50;">Quote Summary</h3>
        <p><strong>Quote Title:</strong> ${quote.title}</p>
        <p><strong>Date:</strong> ${createdDate}</p>
        <p><strong>Total Amount:</strong> <span style="font-size: 1.2em; font-weight: bold; color: #3498db;">${total}</span></p>
        <p><strong>Status:</strong> <span style="text-transform: capitalize; font-weight: bold;">${quote.status}</span></p>
      </div>
      
      ${quote.notes ? `
        <div style="background-color: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107;">
          <h4 style="margin-top: 0; color: #856404;">Notes</h4>
          <p style="margin-bottom: 0;">${quote.notes}</p>
        </div>
      ` : ''}
      
      <p>If you have any questions about this quote or would like to proceed, please don't hesitate to contact us.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
        <p style="margin-bottom: 5px;"><strong>${config.companyName}</strong></p>
        ${config.companyPhone ? `<p style="margin-bottom: 5px;">Phone: ${config.companyPhone}</p>` : ''}
        <p style="margin-bottom: 5px;">Email: ${config.companyEmail}</p>
        ${config.companyAddress ? `<p style="margin-bottom: 0;">${config.companyAddress}</p>` : ''}
      </div>
    </body>
    </html>
  `
}

/**
 * Generate plain text email body for invoice (fallback)
 * @param invoice - The invoice
 * @param config - Email template configuration
 * @returns Plain text email body
 */
export const formatInvoiceEmailText = (invoice: InvoiceWithDetails, config: EmailTemplateConfig = DEFAULT_EMAIL_CONFIG): string => {
  const clientName = invoice.clients?.name || 'Client'
  const total = formatCurrency(invoice.total)
  const invoiceNumber = generateInvoiceNumber(invoice)
  const dueDate = invoice.due_date ? formatDate(invoice.due_date, 'MMM DD, YYYY') : null
  const createdDate = formatDate(invoice.created_at, 'MMM DD, YYYY')

  let text = `Hello ${clientName},\n\n`
  text += `Thank you for your business! Please find your invoice attached to this email.\n\n`
  text += `Invoice Summary:\n`
  text += `- Invoice Number: ${invoiceNumber}\n`
  text += `- Date: ${createdDate}\n`
  if (dueDate) text += `- Due Date: ${dueDate}\n`
  text += `- Total Amount: ${total}\n\n`
  
  if (invoice.notes) {
    text += `Notes: ${invoice.notes}\n\n`
  }
  
  text += `If you have any questions about this invoice, please don't hesitate to contact us.\n\n`
  text += `Best regards,\n${config.companyName}\n`
  text += `Email: ${config.companyEmail}\n`
  if (config.companyPhone) text += `Phone: ${config.companyPhone}\n`
  if (config.companyAddress) text += `Address: ${config.companyAddress}\n`

  return text
}

/**
 * Generate plain text email body for quote (fallback)
 * @param quote - The quote
 * @param config - Email template configuration
 * @returns Plain text email body
 */
export const formatQuoteEmailText = (quote: QuoteWithDetails, config: EmailTemplateConfig = DEFAULT_EMAIL_CONFIG): string => {
  const clientName = quote.clients?.name || 'Client'
  const total = formatCurrency(quote.total)
  const createdDate = formatDate(quote.created_at, 'MMM DD, YYYY')

  let text = `Hello ${clientName},\n\n`
  text += `Thank you for your interest! Please find your quote attached to this email.\n\n`
  text += `Quote Summary:\n`
  text += `- Quote Title: ${quote.title}\n`
  text += `- Date: ${createdDate}\n`
  text += `- Total Amount: ${total}\n`
  text += `- Status: ${quote.status}\n\n`
  
  if (quote.notes) {
    text += `Notes: ${quote.notes}\n\n`
  }
  
  text += `If you have any questions about this quote or would like to proceed, please don't hesitate to contact us.\n\n`
  text += `Best regards,\n${config.companyName}\n`
  text += `Email: ${config.companyEmail}\n`
  if (config.companyPhone) text += `Phone: ${config.companyPhone}\n`
  if (config.companyAddress) text += `Address: ${config.companyAddress}\n`

  return text
}

/**
 * Sanitize email content to prevent XSS
 * @param content - The content to sanitize
 * @returns Sanitized content
 */
export const sanitizeEmailContent = (content: string): string => {
  return content
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
}

/**
 * Validate email address format
 * @param email - The email address to validate
 * @returns True if valid email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
} 