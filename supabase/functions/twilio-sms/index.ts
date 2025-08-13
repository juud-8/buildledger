import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGIN = Deno.env.get('APP_ORIGIN') || '*'
const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TwilioSMSRequest {
  to: string
  message: string
  messageId: string
}

interface TwilioWebhook {
  MessageSid: string
  MessageStatus: string
  From: string
  To: string
  Body: string
  ErrorCode?: string
  ErrorMessage?: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { auth: { persistSession: false } }
  )

  try {
    const url = new URL(req.url)
    const path = url.pathname

    if (req.method === 'POST' && path.endsWith('/send-sms')) {
      return await handleSendSMS(req, supabaseClient)
    } else if (req.method === 'POST' && path.endsWith('/webhook')) {
      return await handleWebhook(req, supabaseClient)
    } else if (req.method === 'POST' && path.endsWith('/status')) {
      return await handleStatusUpdate(req, supabaseClient)
    } else {
      return new Response('Not found', { status: 404, headers: corsHeaders })
    }
  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})

async function handleSendSMS(req: Request, supabase: any) {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  // Set auth for RLS
  supabase.auth.setAuth(authHeader.replace('Bearer ', ''))

  const { to, message, messageId }: TwilioSMSRequest = await req.json()

  // Validate required Twilio credentials
  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID')
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN')
  const fromNumber = Deno.env.get('TWILIO_PHONE_NUMBER')

  if (!accountSid || !authToken || !fromNumber) {
    throw new Error('Twilio credentials not configured')
  }

  // Send SMS via Twilio API
  const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`
  
  const formData = new URLSearchParams()
  formData.append('To', to)
  formData.append('From', fromNumber)
  formData.append('Body', message)
  
  // Add status callback URL if available
  const webhookUrl = Deno.env.get('TWILIO_WEBHOOK_URL')
  if (webhookUrl) {
    formData.append('StatusCallback', `${webhookUrl}/supabase/functions/v1/twilio-sms/status`)
  }

  const credentials = btoa(`${accountSid}:${authToken}`)
  
  const response = await fetch(twilioUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    console.error('Twilio API error:', error)
    
    // Update message status to failed
    await supabase
      .from('client_messages')
      .update({
        status: 'failed',
        twilio_error_message: `Twilio API error: ${response.status}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', messageId)

    throw new Error(`Twilio API error: ${response.status}`)
  }

  const result = await response.json()

  // Update message with Twilio SID and sent status
  await supabase
    .from('client_messages')
    .update({
      status: 'sent',
      twilio_sid: result.sid,
      sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', messageId)

  return new Response(JSON.stringify(result), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  })
}

async function handleWebhook(req: Request, supabase: any) {
  const formData = await req.formData()
  const webhookData: TwilioWebhook = Object.fromEntries(formData) as any

  const { From, Body, MessageSid, To } = webhookData

  // TODO: Validate Twilio signature in front of function using gateway/reverse proxy if available
  // Find client by phone number
  const { data: clients, error: clientError } = await supabase
    .from('clients')
    .select('id, company_id, name')
    .eq('phone', From)
    .limit(1)

  if (clientError) {
    console.error('Error finding client:', clientError)
    return new Response('Error finding client', { status: 500 })
  }

  if (clients && clients.length > 0) {
    const client = clients[0]

    // Save incoming message
    const { error: insertError } = await supabase
      .from('client_messages')
      .insert({
        company_id: client.company_id,
        client_id: client.id,
        direction: 'inbound',
        phone_number: From,
        message_content: Body,
        status: 'replied',
        twilio_sid: MessageSid,
        replied_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })

    if (insertError) {
      console.error('Error saving message:', insertError)
      return new Response('Error saving message', { status: 500 })
    }

    console.log('Incoming SMS saved for client:', client.name)
  } else {
    console.warn('No client found for phone number:', From)
  }

  // Return TwiML response to acknowledge receipt
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Message>Thank you for your message. We'll get back to you soon!</Message>
</Response>`, {
    headers: { 'Content-Type': 'text/xml' }
  })
}

async function handleStatusUpdate(req: Request, supabase: any) {
  const formData = await req.formData()
  const statusData: TwilioWebhook = Object.fromEntries(formData) as any

  const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = statusData

  const updateData: any = {
    status: mapTwilioStatus(MessageStatus),
    updated_at: new Date().toISOString()
  }

  if (MessageStatus === 'delivered') {
    updateData.delivered_at = new Date().toISOString()
  }

  if (ErrorCode) {
    updateData.twilio_error_code = ErrorCode
    updateData.twilio_error_message = ErrorMessage
    updateData.status = 'failed'
  }

  const { error } = await supabase
    .from('client_messages')
    .update(updateData)
    .eq('twilio_sid', MessageSid)

  if (error) {
    console.error('Error updating message status:', error)
    return new Response('Error updating status', { status: 500 })
  }

  return new Response('OK', { headers: corsHeaders })
}

function mapTwilioStatus(twilioStatus: string): string {
  const statusMap: { [key: string]: string } = {
    'queued': 'pending',
    'sent': 'sent',
    'delivered': 'delivered',
    'undelivered': 'failed',
    'failed': 'failed',
    'received': 'replied'
  }
  
  return statusMap[twilioStatus] || 'pending'
}