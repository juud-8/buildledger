import emailjs from '@emailjs/browser'
import { Invoice, Quote, ApiResponse } from '@/lib/types'
import { logger } from './logger'
import { generateInvoiceNumber, formatCurrency, formatDate } from '@/lib/invoiceUtils'
import { 
  validateInvoiceForEmail, 
  validateQuoteForEmail,
  formatInvoiceEmailSubject,
  formatQuoteEmailSubject,
  // Template helpers (kept for potential future use)
  sanitizeEmailContent,
  isValidEmail
} from '@/lib/emailUtils'

/**
 * EmailJS configuration interface
 */
interface EmailJSConfig {
  serviceId: string
  templateId: string
  publicKey: string
}

/**
 * Email data interface for EmailJS
 */
export interface EmailData {
  to_email: string
  to_name: string
  invoice_number?: string
  invoice_total?: string
  invoice_due_date?: string
  quote_title?: string
  quote_total?: string
  message?: string
  subject?: string
  [key: string]: unknown
}

/**
 * Email sending result interface
 */
export interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
  retryable?: boolean
}

/**
 * Get EmailJS configuration with validation
 * @returns EmailJS configuration or throws error if invalid
 */
const getEmailJSConfig = (): EmailJSConfig => {
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY

  if (!serviceId) {
    throw new Error('NEXT_PUBLIC_EMAILJS_SERVICE_ID is not configured')
  }

  if (!templateId) {
    throw new Error('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID is not configured')
  }

  if (!publicKey) {
    throw new Error('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY is not configured')
  }

  // Validate public key format
  if (publicKey.length < 10) {
    throw new Error('EmailJS public key appears to be invalid')
  }

  return { serviceId, templateId, publicKey }
}

/**
 * Send invoice email using EmailJS
 * @param invoice - The invoice to send
 * @param customMessage - Optional custom message to include
 * @returns Email sending result
 */
export const sendInvoiceEmail = async (
  invoice: Invoice, 
  customMessage?: string
): Promise<EmailResult> => {
  try {
    // Validate configuration
    const config = getEmailJSConfig()

    // Validate invoice data
    const validation = validateInvoiceForEmail(invoice)
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.error || 'Invalid invoice data',
        retryable: false
      }
    }

    // Prepare email data
    const emailData: EmailData = {
      to_email: invoice.clients!.email!,
      to_name: invoice.clients!.name!,
      invoice_number: generateInvoiceNumber(invoice),
      invoice_total: formatCurrency(invoice.total),
      invoice_due_date: invoice.due_date ? formatDate(invoice.due_date, 'MMM DD, YYYY') : 'Not specified',
      message: customMessage || 'Please find your invoice attached to this email.',
      subject: formatInvoiceEmailSubject(invoice)
    }

    // Sanitize email content
    Object.keys(emailData).forEach(key => {
      if (typeof emailData[key] === 'string') {
        emailData[key] = sanitizeEmailContent(emailData[key] as string)
      }
    })

    logger.info('Sending invoice email:', {
      to: emailData.to_email,
      invoiceNumber: emailData.invoice_number,
      total: emailData.invoice_total
    })

    const result = await emailjs.send(
      config.serviceId,
      config.templateId,
      emailData,
      config.publicKey
    )

    logger.info('Invoice email sent successfully:', result)
    return { 
      success: true, 
      messageId: result.text || 'unknown'
    }

  } catch (error) {
    console.error('Failed to send invoice email:', error)
    
    // Determine if error is retryable
    const isRetryable = error instanceof Error && 
      (error.message.includes('network') || 
       error.message.includes('timeout') ||
       error.message.includes('rate limit'))

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: isRetryable
    }
  }
}

/**
 * Send quote email using EmailJS
 * @param quote - The quote to send
 * @param customMessage - Optional custom message to include
 * @returns Email sending result
 */
export const sendQuoteEmail = async (
  quote: Quote, 
  customMessage?: string
): Promise<EmailResult> => {
  try {
    // Validate configuration
    const config = getEmailJSConfig()

    // Validate quote data
    const validation = validateQuoteForEmail(quote)
    if (!validation.valid) {
      return { 
        success: false, 
        error: validation.error || 'Invalid quote data',
        retryable: false
      }
    }

    // Prepare email data
    const emailData: EmailData = {
      to_email: quote.clients!.email!,
      to_name: quote.clients!.name!,
      quote_title: quote.title,
      quote_total: formatCurrency(quote.total),
      message: customMessage || 'Please find your quote attached to this email.',
      subject: formatQuoteEmailSubject(quote)
    }

    // Sanitize email content
    Object.keys(emailData).forEach(key => {
      if (typeof emailData[key] === 'string') {
        emailData[key] = sanitizeEmailContent(emailData[key] as string)
      }
    })

    logger.info('Sending quote email:', {
      to: emailData.to_email,
      quoteTitle: emailData.quote_title,
      total: emailData.quote_total
    })

    const result = await emailjs.send(
      config.serviceId,
      config.templateId,
      emailData,
      config.publicKey
    )

    logger.info('Quote email sent successfully:', result)
    return { 
      success: true, 
      messageId: result.text || 'unknown'
    }

  } catch (error) {
    console.error('Failed to send quote email:', error)
    
    // Determine if error is retryable
    const isRetryable = error instanceof Error && 
      (error.message.includes('network') || 
       error.message.includes('timeout') ||
       error.message.includes('rate limit'))

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: isRetryable
    }
  }
}

/**
 * Send custom email using EmailJS
 * @param toEmail - Recipient email address
 * @param toName - Recipient name
 * @param subject - Email subject
 * @param message - Email message
 * @returns Email sending result
 */
export const sendCustomEmail = async (
  toEmail: string,
  toName: string,
  subject: string,
  message: string
): Promise<EmailResult> => {
  try {
    // Validate configuration
    const config = getEmailJSConfig()

    // Validate email address
    if (!isValidEmail(toEmail)) {
      return { 
        success: false, 
        error: 'Invalid email address format',
        retryable: false
      }
    }

    // Validate required fields
    if (!toName.trim()) {
      return { 
        success: false, 
        error: 'Recipient name is required',
        retryable: false
      }
    }

    if (!subject.trim()) {
      return { 
        success: false, 
        error: 'Email subject is required',
        retryable: false
      }
    }

    if (!message.trim()) {
      return { 
        success: false, 
        error: 'Email message is required',
        retryable: false
      }
    }

    // Prepare email data
    const emailData: EmailData = {
      to_email: toEmail,
      to_name: toName,
      subject: sanitizeEmailContent(subject),
      message: sanitizeEmailContent(message)
    }

    logger.info('Sending custom email:', {
      to: emailData.to_email,
      subject: emailData.subject
    })

    const result = await emailjs.send(
      config.serviceId,
      config.templateId,
      emailData,
      config.publicKey
    )

    logger.info('Custom email sent successfully:', result)
    return { 
      success: true, 
      messageId: result.text || 'unknown'
    }

  } catch (error) {
    console.error('Failed to send custom email:', error)
    
    // Determine if error is retryable
    const isRetryable = error instanceof Error && 
      (error.message.includes('network') || 
       error.message.includes('timeout') ||
       error.message.includes('rate limit'))

    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      retryable: isRetryable
    }
  }
}

/**
 * Test EmailJS configuration
 * @returns Test result
 */
export const testEmailJSConfig = async (): Promise<ApiResponse<{ config: EmailJSConfig }>> => {
  try {
    logger.info('Testing EmailJS configuration...')
    
    const config = getEmailJSConfig()
    
    logger.info('EmailJS Config Test:', {
      serviceId: config.serviceId,
      templateId: config.templateId,
      publicKeyLength: config.publicKey.length,
      publicKeyPreview: config.publicKey.substring(0, 4) + '...' + config.publicKey.substring(config.publicKey.length - 4)
    })

    // Try to send a test email
    const testData: EmailData = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      invoice_number: 'TEST-12345678',
      invoice_total: '$100.00',
      invoice_due_date: 'Dec 31, 2024',
      message: 'This is a test email from BuildLedger.',
      subject: 'Test Email - BuildLedger'
    }

    const result = await emailjs.send(
      config.serviceId,
      config.templateId,
      testData,
      config.publicKey
    )

    logger.info('EmailJS test successful:', result)
    return { 
      success: true, 
      data: { config },
      message: 'EmailJS configuration is working correctly'
    }

  } catch (error) {
    console.error('EmailJS test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

/**
 * Get EmailJS configuration status
 * @returns Configuration status
 */
export const getEmailJSStatus = (): { configured: boolean; missing: string[] } => {
  const missing: string[] = []
  
  if (!process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID) {
    missing.push('NEXT_PUBLIC_EMAILJS_SERVICE_ID')
  }
  
  if (!process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID) {
    missing.push('NEXT_PUBLIC_EMAILJS_TEMPLATE_ID')
  }
  
  if (!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY) {
    missing.push('NEXT_PUBLIC_EMAILJS_PUBLIC_KEY')
  }

  return {
    configured: missing.length === 0,
    missing
  }
}

/**
 * Retry email sending with exponential backoff
 * @param emailFunction - The email function to retry
 * @param maxRetries - Maximum number of retries (default: 3)
 * @returns Email result
 */
export const retryEmailSending = async (
  emailFunction: () => Promise<EmailResult>,
  maxRetries: number = 3
): Promise<EmailResult> => {
  let lastError: string | undefined

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await emailFunction()
      
      if (result.success) {
        return result
      }

      // If not retryable, return immediately
      if (!result.retryable) {
        return result
      }

      lastError = result.error

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // 2s, 4s, 8s
        await new Promise(resolve => setTimeout(resolve, delay))
      }

    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Unknown error'
      
      // Wait before retrying
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  return {
    success: false,
    error: lastError || 'Max retries exceeded',
    retryable: false
  }
} 