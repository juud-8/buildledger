import emailjs from '@emailjs/browser'
import { Invoice } from '@/lib/types'
import { generateInvoiceNumber } from '@/lib/invoiceUtils'

// EmailJS configuration
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!

// Debug environment variables
console.log('EmailJS Config:', {
  serviceId: EMAILJS_SERVICE_ID,
  templateId: EMAILJS_TEMPLATE_ID,
  publicKey: EMAILJS_PUBLIC_KEY ? '***' + EMAILJS_PUBLIC_KEY.slice(-4) : 'NOT_SET'
})

export interface EmailData {
  to_email: string
  to_name: string
  invoice_number: string
  invoice_total: string
  invoice_due_date: string
  pdf_url?: string
}

export const sendInvoiceEmail = async (invoice: Invoice): Promise<{ success: boolean; error?: string }> => {
  try {
    // Validate environment variables
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      console.error('EmailJS: Missing environment variables:', {
        serviceId: !!EMAILJS_SERVICE_ID,
        templateId: !!EMAILJS_TEMPLATE_ID,
        publicKey: !!EMAILJS_PUBLIC_KEY
      })
      return { success: false, error: 'EmailJS configuration is incomplete. Please check your environment variables.' }
    }

    // Validate public key format (EmailJS public keys can vary in length)
    if (EMAILJS_PUBLIC_KEY.length < 10) {
      console.error('EmailJS: Public key seems too short:', EMAILJS_PUBLIC_KEY.length, 'characters')
      return { success: false, error: 'EmailJS public key appears to be invalid. Please check your API key.' }
    }

    if (!invoice.clients?.email) {
      return { success: false, error: 'Client email not found' }
    }

    if (!invoice.clients?.name) {
      return { success: false, error: 'Client name not found' }
    }

    // Prepare email data
    const emailData: EmailData = {
      to_email: invoice.clients.email,
      to_name: invoice.clients.name,
      invoice_number: generateInvoiceNumber(invoice),
      invoice_total: `$${invoice.total.toFixed(2)}`,
      invoice_due_date: invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'Not specified'
    }

    // If we have a PDF blob, we could upload it to a service and get a URL
    // For now, we'll send without attachment (EmailJS free tier doesn't support attachments)
    // In a production app, you'd upload the PDF to cloud storage and include the URL

    console.log('EmailJS: Sending email with data:', emailData)

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      emailData,
      EMAILJS_PUBLIC_KEY
    )

    console.log('EmailJS: Email sent successfully:', result)
    return { success: true }

  } catch (error) {
    console.error('EmailJS: Error sending email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

// Alternative: SendGrid implementation (if you prefer)
export const sendInvoiceEmailWithSendGrid = async (invoice: Invoice, pdfBlob?: Blob): Promise<{ success: boolean; error?: string }> => {
  try {
    const response = await fetch('/api/send-invoice-sendgrid', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        invoiceId: invoice.id,
        userId: invoice.user_id,
        pdfBlob: pdfBlob ? await blobToBase64(pdfBlob) : null
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Failed to send email')
    }

    return { success: true }

  } catch (error) {
    console.error('SendGrid: Error sending email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

// Utility function to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

// Test function to validate EmailJS configuration
export const testEmailJSConfig = async (): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing EmailJS configuration...')
    
    if (!EMAILJS_SERVICE_ID || !EMAILJS_TEMPLATE_ID || !EMAILJS_PUBLIC_KEY) {
      return { 
        success: false, 
        error: `Missing environment variables: serviceId=${!!EMAILJS_SERVICE_ID}, templateId=${!!EMAILJS_TEMPLATE_ID}, publicKey=${!!EMAILJS_PUBLIC_KEY}` 
      }
    }

    console.log('EmailJS Config Test:', {
      serviceId: EMAILJS_SERVICE_ID,
      templateId: EMAILJS_TEMPLATE_ID,
      publicKeyLength: EMAILJS_PUBLIC_KEY.length,
      publicKeyPreview: EMAILJS_PUBLIC_KEY.substring(0, 4) + '...' + EMAILJS_PUBLIC_KEY.substring(EMAILJS_PUBLIC_KEY.length - 4)
    })

    // Try to send a test email
    const testData = {
      to_email: 'test@example.com',
      to_name: 'Test User',
      invoice_number: 'TEST-12345678',
      invoice_total: '$100.00',
      invoice_due_date: '12/31/2024'
    }

    const result = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      testData,
      EMAILJS_PUBLIC_KEY
    )

    console.log('EmailJS test successful:', result)
    return { success: true }

  } catch (error) {
    console.error('EmailJS test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
} 