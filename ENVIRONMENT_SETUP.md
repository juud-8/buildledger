# Environment Setup

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Supabase Configuration
# Get these values from your Supabase project settings
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## How to Get Supabase Credentials

1. Go to [Supabase](https://supabase.com/) and create an account/login
2. Create a new project or use an existing one
3. Go to Settings → API
4. Copy the `Project URL` for `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the `anon public` key for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Schema

The application expects the following database tables to be set up in Supabase:

- `clients` - Customer information
- `quotes` - Quote records  
- `quote_items` - Line items for quotes
- `invoices` - Invoice records
- `invoice_items` - Line items for invoices

You can create these tables using the Supabase dashboard or SQL editor.

## Security Note

Never commit your actual `.env.local` file to version control. The `.env*` pattern is already in `.gitignore` to prevent this. 