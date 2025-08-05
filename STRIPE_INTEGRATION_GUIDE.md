# BuildLedger Stripe Integration Guide

## 🔗 Current Status
- **MCP Connection**: ❌ Authentication required
- **Database**: ✅ Ready with subscription plans
- **Test Accounts**: ✅ Created and ready for Stripe linking

## 📋 Manual Stripe Setup Required

### Step 1: Create Stripe Products

Log into your [Stripe Dashboard](https://dashboard.stripe.com/products) and create these products:

#### 1. BuildLedger Starter
- **Name**: BuildLedger Starter
- **Description**: Perfect for small contractors just getting started
- **Price**: $29.00/month
- **Billing**: Monthly recurring

#### 2. BuildLedger Professional  
- **Name**: BuildLedger Professional
- **Description**: Ideal for growing construction businesses
- **Price**: $79.00/month
- **Billing**: Monthly recurring

#### 3. BuildLedger Enterprise
- **Name**: BuildLedger Enterprise
- **Description**: For large construction companies
- **Price**: $199.00/month
- **Billing**: Monthly recurring

#### 4. BuildLedger Lifetime
- **Name**: BuildLedger Lifetime
- **Description**: One-time payment for lifetime access
- **Price**: $999.00
- **Billing**: One-time payment

### Step 2: Get Price IDs

After creating the products, copy the **Price IDs** from Stripe Dashboard:
- Go to [Products](https://dashboard.stripe.com/products)
- Click on each product
- Copy the Price ID (starts with `price_`)

### Step 3: Update Database

Once you have the Price IDs, update the database:

```sql
-- Update subscription plans with real Stripe price IDs
UPDATE public.subscription_plans 
SET stripe_price_id = 'YOUR_STARTER_PRICE_ID'
WHERE name = 'starter';

UPDATE public.subscription_plans 
SET stripe_price_id = 'YOUR_PROFESSIONAL_PRICE_ID'
WHERE name = 'professional';

UPDATE public.subscription_plans 
SET stripe_price_id = 'YOUR_ENTERPRISE_PRICE_ID'
WHERE name = 'enterprise';

UPDATE public.subscription_plans 
SET stripe_price_id = 'YOUR_LIFETIME_PRICE_ID'
WHERE name = 'lifetime';
```

## 👥 Test Account Stripe Setup

### Current Test Accounts Ready for Stripe:

#### 1. Dave's Enterprise Account
- **Email**: dave@buildledger.com
- **Current Status**: Lifetime subscription (no Stripe needed)
- **Action**: Create Stripe customer for future payments

#### 2. Starter Test Account
- **Email**: starter@test.com
- **Plan**: Starter ($29/month)
- **Action**: Create Stripe customer + subscription

#### 3. Professional Test Account  
- **Email**: professional@test.com
- **Plan**: Professional ($79/month)
- **Action**: Create Stripe customer + subscription

#### 4. Enterprise Test Account
- **Email**: enterprise@test.com
- **Plan**: Enterprise ($199/month)
- **Action**: Create Stripe customer + subscription

## 🔄 Stripe Customer Creation Process

### For Each Test Account:

1. **Create Stripe Customer**
   ```bash
   # Using Stripe CLI or Dashboard
   stripe customers create \
     --email=starter@test.com \
     --name="Starter Test User" \
     --description="BuildLedger Starter Test Account"
   ```

2. **Create Subscription**
   ```bash
   # Using Stripe CLI
   stripe subscriptions create \
     --customer=CUSTOMER_ID \
     --items[0][price]=STARTER_PRICE_ID \
     --metadata[company]="Starter Test Company"
   ```

3. **Update Supabase Database**
   ```sql
   -- Update user subscription with Stripe data
   UPDATE public.user_subscriptions 
   SET 
     stripe_customer_id = 'cus_xxx',
     stripe_subscription_id = 'sub_xxx',
     status = 'active'
   WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'starter@test.com');
   ```

## 🌐 Webhook Configuration

### Required Webhook Endpoints:

1. **Customer Events**
   - `customer.created`
   - `customer.updated`
   - `customer.deleted`

2. **Subscription Events**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `customer.subscription.trial_will_end`

3. **Invoice Events**
   - `invoice.created`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `invoice.finalized`

4. **Payment Events**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### Webhook URL:
```
https://lncppcvrhdduvobirzsv.supabase.co/functions/v1/stripe-webhook
```

## 💳 Payment Processing for Existing Invoices

### Current Sample Invoices in Dave's Account:

1. **Kitchen Renovation - Deposit** ($8,640.00) - Status: Paid
2. **Kitchen Renovation - Progress** ($10,800.00) - Status: Sent
3. **Office Renovation - Final** ($54,000.00) - Status: Paid
4. **Whole House Remodel - Deposit** ($27,000.00) - Status: Paid
5. **Whole House Remodel - Progress** ($29,160.00) - Status: Overdue

### Stripe Invoice Creation Process:

1. **Create Stripe Customer for Dave**
2. **Create Stripe Invoices for each unpaid invoice**
3. **Link Stripe invoice IDs to Supabase records**
4. **Set up payment processing**

## 🔧 MCP Integration Troubleshooting

### To Fix MCP Stripe Connection:

1. **Check MCP Configuration**
   - Verify Stripe secret key is correctly configured
   - Ensure key has proper permissions
   - Check if using test vs live mode

2. **Required Stripe Permissions**
   - `customers:read`, `customers:write`
   - `subscriptions:read`, `subscriptions:write`
   - `invoices:read`, `invoices:write`
   - `payment_intents:read`, `payment_intents:write`

3. **Environment Variables**
   ```bash
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   ```

## 📊 Database Schema for Stripe Integration

### Tables Ready for Stripe:

1. **user_subscriptions** - Links users to Stripe subscriptions
2. **invoices** - Stores Stripe invoice IDs and payment status
3. **payments** - Tracks Stripe payment intents and charges
4. **webhook_events** - Stores Stripe webhook events

### Key Fields:
- `stripe_customer_id` - Links to Stripe customer
- `stripe_subscription_id` - Links to Stripe subscription
- `stripe_invoice_id` - Links to Stripe invoice
- `stripe_payment_intent_id` - Links to Stripe payment intent

## 🚀 Next Steps

1. **Configure Stripe MCP Authentication**
2. **Create Stripe Products and Prices**
3. **Update Database with Real Price IDs**
4. **Create Stripe Customers for Test Accounts**
5. **Set up Webhook Endpoints**
6. **Test Payment Processing**
7. **Verify Subscription Management**

## 📞 Support

If you need help with Stripe configuration:
- [Stripe Documentation](https://docs.stripe.com/)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe CLI](https://stripe.com/docs/stripe-cli)

---

**Note**: This guide assumes you're using Stripe in test mode. For production, replace all test keys with live keys and test thoroughly before going live. 