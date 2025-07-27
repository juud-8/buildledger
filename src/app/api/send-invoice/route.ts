import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { generateInvoicePDF } from '@/lib/pdfUtils'
import { validateInvoiceForEmail, formatEmailSubject, formatEmailBody } from '@/lib/emailUtils'
import { generateInvoiceNumber } from '@/lib/invoiceUtils'

const resend = new Resend(process.env.RESEND_API_KEY)

// Create server-side Supabase client with service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, userId } = await request.json()

    console.log('API: Received request for invoiceId:', invoiceId, 'userId:', userId)

    if (!invoiceId || !userId) {
      return NextResponse.json(
        { error: 'Invoice ID and User ID are required' },
        { status: 400 }
      )
    }

    // Fetch invoice with client details
    const { data: invoice, error: invoiceError } = await supabase
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
      .eq('user_id', userId)
      .single()

    console.log('API: Invoice query result:', { invoice, error: invoiceError })

    if (invoiceError) {
      console.error('API: Invoice query error:', invoiceError)
      return NextResponse.json(
        { error: `Database error: ${invoiceError.message}` },
        { status: 500 }
      )
    }

    if (!invoice) {
      console.log('API: No invoice found for id:', invoiceId, 'user_id:', userId)
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    console.log('API: Invoice found:', { 
      id: invoice.id, 
      clientEmail: invoice.clients?.email,
      itemCount: invoice.invoice_items?.length 
    })

    // Validate invoice for email sending
    const validation = validateInvoiceForEmail(invoice)
    if (!validation.valid) {
      console.log('API: Validation failed:', validation.error)
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // Generate PDF
    console.log('API: Generating PDF...')
    const pdfBlob = await generateInvoicePDF(invoice)
    const pdfBuffer = await pdfBlob.arrayBuffer()

    // Send email
    console.log('API: Sending email to:', invoice.clients.email)
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'BuildLedger <noreply@buildledger.com>',
      to: [invoice.clients.email],
      subject: formatEmailSubject(invoice),
      html: formatEmailBody(invoice),
      attachments: [
        {
          filename: `${generateInvoiceNumber(invoice)}.pdf`,
          content: Buffer.from(pdfBuffer)
        }
      ]
    })

    if (emailError) {
      console.error('API: Email sending error:', emailError)
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      )
    }

    console.log('API: Email sent successfully:', emailData?.id)

    // Update invoice status to 'sent' if it's currently 'draft'
    if (invoice.status === 'draft') {
      const { error: updateError } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoiceId)
        .eq('user_id', userId)

      if (updateError) {
        console.error('API: Error updating invoice status:', updateError)
      } else {
        console.log('API: Invoice status updated to sent')
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Invoice sent successfully',
      emailId: emailData?.id
    })

  } catch (error) {
    console.error('API: Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 