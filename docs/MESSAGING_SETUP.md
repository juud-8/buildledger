# Twilio SMS Messaging Setup Guide

This guide explains how to set up Twilio SMS messaging for client communication in BuildLedger.

## Overview

The messaging system includes:
- ✅ Opt-in consent management (TCPA compliant)
- ✅ Message templates for quotes, payments, and project updates
- ✅ Two-way SMS messaging
- ✅ Message history and analytics
- ✅ Twilio integration via Supabase Edge Functions

## Prerequisites

1. **Twilio Account**: Sign up at [twilio.com](https://twilio.com)
2. **Supabase Project**: Already configured for BuildLedger
3. **Phone Number**: Purchase a Twilio phone number

## Setup Instructions

### 1. Database Migration

The messaging tables are automatically created when you run:

```bash
supabase db reset
```

Or apply the specific migration:

```bash
supabase migration up --include-all
```

### 2. Twilio Configuration

#### Get Twilio Credentials
1. Log into your Twilio Console
2. Navigate to Account → API Keys & Tokens
3. Copy your Account SID and Auth Token
4. Purchase a phone number from Console → Phone Numbers

#### Configure Environment Variables
Add these to your Supabase Edge Function environment:

```bash
# In Supabase Dashboard → Edge Functions → Settings
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
TWILIO_WEBHOOK_URL=https://your-project.supabase.co
```

### 3. Deploy Edge Function

```bash
supabase functions deploy twilio-sms
```

### 4. Configure Webhooks (Optional)

For incoming messages and delivery receipts:

1. In Twilio Console → Phone Numbers → Manage → Active Numbers
2. Click your phone number
3. Set Webhook URL to: `https://your-project.supabase.co/functions/v1/twilio-sms/webhook`
4. Set HTTP method to POST

### 5. Update Frontend Environment

Add to your `.env.local`:

```bash
VITE_TWILIO_PHONE_NUMBER=+1234567890
```

## Usage

### Client Messaging Interface

1. Navigate to Clients → View Client → Communication tab
2. Client must have a phone number on file
3. Enable SMS consent before sending messages
4. Use templates or send custom messages

### Message Templates

Default templates are created automatically:
- Quote reminders
- Payment follow-ups  
- Project updates

### Consent Management

- All messaging requires explicit client consent
- Opt-out is handled automatically
- Compliance with TCPA regulations

## Features

### ✅ Consent Management
- Opt-in checkbox before enabling SMS
- Opt-out tracking and enforcement
- TCPA compliance built-in

### ✅ Message Templates
- Pre-built templates for common scenarios
- Variable interpolation (client name, amounts, dates)
- Custom message support

### ✅ Two-Way Messaging
- Clients can reply to SMS messages
- Replies are logged in the database
- Real-time conversation history

### ✅ Message Tracking
- Delivery status monitoring
- Failed message tracking with error details
- Message analytics and reporting

## API Endpoints

### Send SMS
```
POST /functions/v1/twilio-sms/send-sms
Authorization: Bearer <supabase-jwt>

{
  "to": "+1234567890",
  "message": "Hello client!",
  "messageId": "uuid-of-database-message"
}
```

### Webhook (Incoming SMS)
```
POST /functions/v1/twilio-sms/webhook
Content-Type: application/x-www-form-urlencoded

From=+1234567890&Body=Client message&MessageSid=...
```

### Status Updates
```
POST /functions/v1/twilio-sms/status
Content-Type: application/x-www-form-urlencoded

MessageSid=...&MessageStatus=delivered&...
```

## Database Schema

### client_message_consent
- Tracks client consent for SMS messaging
- Includes opt-in/opt-out dates and IP tracking

### message_templates  
- Predefined message templates
- Variable substitution support
- Company-specific templates

### client_messages
- Complete message history
- Status tracking (pending, sent, delivered, failed)
- Twilio SID correlation

## Security & Compliance

### Data Protection
- Phone numbers are validated before use
- Message content is stored securely
- PII handling follows best practices

### TCPA Compliance
- Explicit consent required
- Easy opt-out mechanism
- Consent tracking and audit trail

### Rate Limiting
- Twilio's built-in rate limiting
- Consider implementing additional limits

## Troubleshooting

### Common Issues

**Messages not sending:**
- Check Twilio credentials in Supabase
- Verify phone number format (+1XXXXXXXXXX)
- Check Edge Function logs

**Webhooks not working:**
- Verify webhook URL in Twilio console
- Check HTTPS certificate
- Review Edge Function logs

**Consent issues:**
- Ensure client has phone number
- Check consent status in database
- Verify opt-out tracking

### Logs and Monitoring

Check Edge Function logs:
```bash
supabase functions logs twilio-sms
```

Monitor Twilio usage in Console → Monitor → Logs

## Costs

### Twilio Pricing
- SMS: ~$0.0075 per message in US
- Phone number: ~$1/month
- International rates vary

### Supabase Edge Functions
- 500K invocations/month free
- $2 per 1M additional invocations

## Next Steps

1. **Analytics Dashboard**: Build message analytics UI
2. **Bulk Messaging**: Add support for bulk/broadcast messages  
3. **Rich Media**: Support MMS for images/documents
4. **Automation**: Auto-send payment reminders and quote follow-ups
5. **Integration**: Connect with calendar for appointment reminders

## Support

- Twilio Documentation: [twilio.com/docs](https://twilio.com/docs)
- Supabase Edge Functions: [supabase.com/docs/guides/functions](https://supabase.com/docs/guides/functions)
- BuildLedger Support: Contact your development team