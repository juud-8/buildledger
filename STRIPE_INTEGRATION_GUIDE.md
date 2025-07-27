# BuildLedger Stripe Integration & Client Management Guide

## 🎉 What's New

This update adds a stunning **Client Management System** and **Stripe-powered pricing** to BuildLedger:

### ✨ Client Management Features
- **Beautiful Client Dashboard** - Modern UI with search, filtering, and analytics
- **Client Cards** - Visual client profiles with payment history and stats
- **Quick Actions** - Add clients from quotes and invoices pages
- **Client Analytics** - Track total invoiced, paid amounts, and activity
- **Tags & Notes** - Organize clients with custom tags and notes

### 💳 Stripe Integration Features
- **BuildLedger Pro** - $19/month or $205/year (10% off)
- **BuildLedger Business** - $49/month or $529/year (10% off)
- **Feature Gating** - Automatic limits based on plan tier
- **Webhook Handling** - Real-time subscription updates
- **Secure Checkout** - Stripe-powered payment processing

## 🚀 Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables
Create a `.env.local` file with:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Stripe Price IDs (Create these in Stripe Dashboard)
NEXT_PUBLIC_STRIPE_PRICE_PRO_MONTHLY=price_pro_monthly_id
NEXT_PUBLIC_STRIPE_PRICE_PRO_ANNUAL=price_pro_annual_id
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_MONTHLY=price_business_monthly_id
NEXT_PUBLIC_STRIPE_PRICE_BUSINESS_ANNUAL=price_business_annual_id

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Migration
Run the migration in your Supabase SQL Editor:

```sql
-- Run the contents of database_sync_migration.sql
```

### 4. Create Stripe Products

#### BuildLedger Pro
1. Go to Stripe Dashboard → Products
2. Create product: "BuildLedger Pro"
3. Add prices:
   - Monthly: $19/month
   - Annual: $205/year (recurring)
4. Copy price IDs to `.env.local`

#### BuildLedger Business
1. Create product: "BuildLedger Business"
2. Add prices:
   - Monthly: $49/month
   - Annual: $529/year (recurring)
3. Copy price IDs to `.env.local`

### 5. Set Up Stripe Webhook
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe-webhook`
3. Select events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy webhook secret to `.env.local`

## 📊 Feature Limits by Plan

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Clients | 5 | Unlimited | Unlimited |
| Quotes/month | 10 | Unlimited | Unlimited |
| PDF Generation | ❌ | ✅ | ✅ |
| Payment Processing | ❌ | ✅ | ✅ |
| Analytics | ❌ | ✅ | ✅ |
| Custom Branding | ❌ | ✅ | ✅ |
| Client Portal | ❌ | ❌ | ✅ |
| AI Assistant | ❌ | ❌ | ✅ |
| Team Members | ❌ | ❌ | 3 |
| API Access | ❌ | ❌ | ✅ |

## 🎨 Client Management UI

### Client Dashboard (`/clients`)
- **Stats Cards** - Total clients, invoiced, paid, active
- **Search & Filter** - Find clients by name, email, tags
- **Client Cards** - Beautiful visual profiles with actions
- **Quick Actions** - Edit, delete, view history

### Client Creation
- **Modal Form** - Clean, intuitive client creation
- **Rich Fields** - Name, email, phone, address, notes, tags
- **Validation** - Real-time form validation
- **Auto-save** - Automatic profile creation

### Integration Points
- **Quotes Page** - "Add Client" button
- **Invoices Page** - "Add Client" button
- **Navigation** - New "Clients" menu item

## 💳 Pricing Page Features

### Modern Design
- **Responsive Layout** - Works on all devices
- **Interactive Elements** - Smooth animations and transitions
- **ROI Calculator** - Show value proposition
- **Trust Indicators** - Money-back guarantee, support info

### Stripe Integration
- **Secure Checkout** - Stripe-hosted payment pages
- **Promotion Codes** - Support for discounts
- **Billing Address** - Required for tax compliance
- **Success/Cancel URLs** - Proper redirect handling

### Plan Comparison
- **Feature Matrix** - Clear feature comparison
- **Pricing Toggle** - Monthly vs annual billing
- **Savings Display** - Show annual discount
- **Popular Badges** - Highlight recommended plans

## 🔧 Technical Implementation

### File Structure
```
src/
├── app/
│   ├── clients/
│   │   └── page.tsx              # Client management page
│   ├── pricing/
│   │   └── page.tsx              # Pricing page with Stripe
│   └── api/
│       ├── create-checkout-session/
│       │   └── route.ts          # Stripe checkout API
│       └── stripe-webhook/
│           └── route.ts          # Webhook handler
├── lib/
│   ├── pricing.ts                # Pricing configuration
│   ├── featureGating.ts          # Feature access control
│   └── types.ts                  # Updated type definitions
└── components/
    └── Navigation.tsx            # Updated with Clients link
```

### Key Components

#### Client Management
- **ClientCard** - Individual client display component
- **CreateClientModal** - Client creation form
- **Client Analytics** - Usage statistics and metrics

#### Pricing System
- **PricingCard** - Individual plan display
- **ROICalculator** - Interactive savings calculator
- **Stripe Integration** - Secure payment processing

#### Feature Gating
- **checkFeatureAccess** - Validate feature availability
- **getFeatureUsageSummary** - Dashboard usage stats
- **canCreateClient/Quote** - Permission checks

### Database Schema

#### New Tables
```sql
-- Profiles table for plan management
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  plan_tier TEXT NOT NULL DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  -- ... other fields
);

-- Enhanced clients table
ALTER TABLE clients ADD COLUMN notes TEXT;
ALTER TABLE clients ADD COLUMN tags TEXT[];
ALTER TABLE clients ADD COLUMN total_invoiced DECIMAL(10,2) DEFAULT 0;
ALTER TABLE clients ADD COLUMN total_paid DECIMAL(10,2) DEFAULT 0;
-- ... other enhancements
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Create Stripe products and prices
- [ ] Set up Stripe webhook endpoint
- [ ] Run database migration
- [ ] Configure environment variables
- [ ] Test feature gating locally

### Post-Deployment
- [ ] Verify webhook endpoint is accessible
- [ ] Test subscription flow end-to-end
- [ ] Monitor webhook events in Stripe dashboard
- [ ] Check feature limits are working
- [ ] Test client management functionality

### Monitoring
- [ ] Set up Stripe webhook monitoring
- [ ] Monitor subscription status changes
- [ ] Track feature usage analytics
- [ ] Monitor payment success/failure rates

## 🔒 Security Considerations

### Stripe Security
- **Webhook Verification** - All webhooks are signature-verified
- **Environment Variables** - Sensitive keys are server-side only
- **RLS Policies** - Database access is properly restricted
- **Input Validation** - All user inputs are validated

### Feature Gating
- **Server-Side Checks** - All feature checks happen server-side
- **Plan Validation** - Subscription status is verified
- **Usage Limits** - Real-time usage tracking and enforcement

## 📈 Analytics & Tracking

### Stripe Analytics
- **Subscription Metrics** - Track conversion rates
- **Revenue Analytics** - Monitor MRR and growth
- **Churn Analysis** - Identify at-risk customers

### Feature Usage
- **Client Creation** - Track client growth
- **Quote Generation** - Monitor quote activity
- **Feature Adoption** - See which features are used most

## 🎯 Next Steps

### Immediate
1. **Test the Implementation** - Verify all features work
2. **Set Up Monitoring** - Configure alerts and tracking
3. **User Onboarding** - Guide users to new features

### Future Enhancements
1. **Client Portal** - Business plan feature
2. **AI Assistant** - Quote optimization
3. **Team Management** - Multi-user support
4. **Advanced Analytics** - Revenue insights
5. **Custom Branding** - White-label options

## 🆘 Troubleshooting

### Common Issues

#### Stripe Webhook Failures
- Check webhook endpoint URL is correct
- Verify webhook secret in environment
- Monitor Stripe dashboard for failed events

#### Feature Gating Issues
- Verify user has profile record
- Check plan tier is set correctly
- Ensure subscription status is active

#### Client Creation Errors
- Check user has permission to create clients
- Verify client limit hasn't been reached
- Ensure all required fields are provided

### Support
For technical issues, check:
1. Browser console for errors
2. Server logs for API failures
3. Stripe dashboard for payment issues
4. Supabase logs for database errors

---

**🎉 Congratulations!** You now have a fully-featured client management system and Stripe-powered pricing. Your users can manage clients beautifully and upgrade seamlessly when they're ready to scale. 