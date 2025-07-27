# BuildLedger Environment Setup Guide

## 🔧 Environment Configuration

BuildLedger uses a comprehensive configuration system that supports multiple environments and feature flags. Create appropriate environment files based on your deployment environment.

### Development Environment (`.env.local`)

```bash
# ============================================================================
# CORE CONFIGURATION
# ============================================================================

# Application Configuration
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=/api

# ============================================================================
# DATABASE CONFIGURATION
# ============================================================================

# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Performance Settings
DB_POOL_SIZE=20
DB_TIMEOUT=30000
DB_RETRY_ATTEMPTS=3

# ============================================================================
# EMAIL CONFIGURATION
# ============================================================================

# Email Provider Selection
EMAIL_PROVIDER=emailjs

# EmailJS Configuration (Default - No Domain Required)
NEXT_PUBLIC_EMAILJS_SERVICE_ID=your_emailjs_service_id
NEXT_PUBLIC_EMAILJS_TEMPLATE_ID=your_emailjs_template_id
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=your_emailjs_public_key

# SendGrid Configuration (Alternative)
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Resend Configuration (Alternative - Requires Domain)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# ============================================================================
# PAYMENT PROCESSING
# ============================================================================

# Stripe Configuration (Optional)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# ============================================================================
# SECURITY CONFIGURATION
# ============================================================================

# Session Management
SESSION_TIMEOUT=86400000
MAX_LOGIN_ATTEMPTS=10
CSRF_ENABLED=false

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# Rate Limiting (Disabled in Development)
RATE_LIMITING_ENABLED=false
RATE_LIMIT_RPM=1000
RATE_LIMIT_BURST=2000

# ============================================================================
# PERFORMANCE CONFIGURATION
# ============================================================================

# Caching
CACHE_ENABLED=true
CACHE_TTL=300

# Performance Features
COMPRESSION_ENABLED=true
LAZY_LOADING_ENABLED=true
BATCH_SIZE=50
MAX_CONCURRENT_REQUESTS=10

# ============================================================================
# MONITORING AND OBSERVABILITY
# ============================================================================

# Error Reporting
SENTRY_DSN=your_sentry_dsn_here

# Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_google_analytics_id

# Performance Monitoring
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=1.0
SLOW_QUERY_THRESHOLD=2000

# Logging
NEXT_PUBLIC_LOG_LEVEL=DEBUG

# ============================================================================
# FEATURE FLAGS
# ============================================================================

# Core Features
FEATURE_PROFILE_MANAGEMENT=true
FEATURE_LOGO_UPLOAD=true
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_EMAIL_NOTIFICATIONS=true
FEATURE_PDF_GENERATION=true

# Payment Features
FEATURE_STRIPE_INTEGRATION=false

# Beta Features
FEATURE_BETA_FEATURES=false

# Limits
MAX_FILE_UPLOAD_SIZE=5242880
MAX_CLIENTS_PER_USER=100
MAX_INVOICES_PER_MONTH=1000
```

### Production Environment (`.env.production`)

```bash
# ============================================================================
# PRODUCTION CONFIGURATION
# ============================================================================

# Application Configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.0.0
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_API_BASE_URL=/api

# Database Configuration
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key

# Performance Settings (Production Optimized)
DB_POOL_SIZE=50
DB_TIMEOUT=10000
DB_RETRY_ATTEMPTS=3
CACHE_TTL=600
BATCH_SIZE=100
MAX_CONCURRENT_REQUESTS=30

# Security Settings (Production Hardened)
SESSION_TIMEOUT=1800000
MAX_LOGIN_ATTEMPTS=3
CSRF_ENABLED=true
CORS_ORIGINS=https://yourdomain.com
RATE_LIMITING_ENABLED=true
RATE_LIMIT_RPM=60
RATE_LIMIT_BURST=100

# Monitoring (Production)
SENTRY_DSN=your_production_sentry_dsn
NEXT_PUBLIC_ANALYTICS_ID=your_production_analytics_id
PERFORMANCE_MONITORING_ENABLED=true
PERFORMANCE_SAMPLE_RATE=0.1
SLOW_QUERY_THRESHOLD=500
NEXT_PUBLIC_LOG_LEVEL=INFO

# Email Configuration
EMAIL_PROVIDER=sendgrid
SENDGRID_API_KEY=your_production_sendgrid_key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Payment Processing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_SECRET_KEY=sk_live_your_live_secret
STRIPE_WEBHOOK_SECRET=whsec_your_live_webhook_secret
FEATURE_STRIPE_INTEGRATION=true
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