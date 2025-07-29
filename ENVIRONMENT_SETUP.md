# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
# Get these values from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# EmailJS Configuration (Alternative to Resend - No Domain Required)
# Get these from https://www.emailjs.com/
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# Resend Configuration (Optional - Requires Domain Verification)
# Get your API key from https://resend.com/api-keys
RESEND_API_KEY=your_resend_api_key_here

# MCP (Model Context Protocol) Configuration
# Enable AI-powered business intelligence features
MCP_ENABLED=true
MCP_REDIS_URL=your_redis_url_optional
```

## How to Get Supabase Credentials

1. Go to [Supabase](https://supabase.com/) and create an account/login
2. Create a new project or use an existing one
3. Go to Settings → API
4. Copy the `Project URL` for `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the `anon public` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Copy the `service_role` key for `SUPABASE_SERVICE_ROLE_KEY` (this is used for server-side operations)

## How to Get EmailJS Credentials (Recommended - No Domain Required)

1. Go to [EmailJS](https://www.emailjs.com/) and create a free account
2. Navigate to Email Services and add a new service (Gmail, Outlook, etc.)
3. Copy the **Service ID** for `NEXT_PUBLIC_EMAILJS_SERVICE_ID`
4. Go to Email Templates and create a new template
5. Copy the **Template ID** for `NEXT_PUBLIC_EMAILJS_TEMPLATE_ID`
6. Go to Account → API Keys and copy the **Public Key** for `NEXT_PUBLIC_EMAILJS_PUBLIC_KEY`

### EmailJS Template Variables
Your email template should include these variables:
- `{{to_email}}` - Client's email address
- `{{to_name}}` - Client's name
- `{{invoice_number}}` - Invoice number
- `{{invoice_total}}` - Invoice total amount
- `{{invoice_due_date}}` - Invoice due date

## How to Get Resend API Key (Optional)

1. Go to [Resend](https://resend.com/) and create an account/login
2. Navigate to the API Keys section
3. Create a new API key
4. Copy the API key for `RESEND_API_KEY`
5. Note: You may need to verify your domain with Resend for production use

## Database Schema

The application expects the following database tables to be set up in Supabase:

- `clients` - Customer information
- `quotes` - Quote records  
- `quote_items` - Line items for quotes
- `invoices` - Invoice records
- `invoice_items` - Line items for invoices

You can create these tables using the Supabase dashboard or SQL editor.

## Password Reset Configuration

The application includes a password reset feature. To ensure it works properly:

1. **Email Templates**: Configure your password reset email template in Supabase Dashboard → Authentication → Email Templates
2. **Redirect URL**: Make sure your Site URL is configured in Supabase Dashboard → Authentication → URL Configuration
3. **SMTP Settings**: For production, use a custom SMTP provider for reliable email delivery

## Security Note

Never commit your actual `.env.local` file to version control. The `.env*` pattern is already in `.gitignore` to prevent this. 