# 🚀 Stripe Integration Setup for BuildLedger

This guide will walk you through setting up Stripe payments for BuildLedger, including subscriptions, invoice payments, and webhook handling.

## 📋 Prerequisites

1. **Stripe Account**: Create a Stripe account at [stripe.com](https://stripe.com)
2. **Supabase Project**: Already configured
3. **Node.js**: Version 16 or higher

## 🔧 Step 1: Stripe Dashboard Setup

### 1.1 Create Products and Prices

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Products** → **Add Product**
3. Create the following products:

#### Starter Plan
- **Name**: BuildLedger Starter
- **Price**: $29/month
- **Billing**: Recurring (monthly)
- **Price ID**: `price_starter_monthly`

#### Professional Plan
- **Name**: BuildLedger Professional
- **Price**: $79/month
- **Billing**: Recurring (monthly)
- **Price ID**: `price_professional_monthly`

#### Enterprise Plan
- **Name**: BuildLedger Enterprise
- **Price**: $199/month
- **Billing**: Recurring (monthly)
- **Price ID**: `price_enterprise_monthly`

### 1.2 Get API Keys

1. Go to **Developers** → **API Keys**
2. Copy your **Publishable Key** and **Secret Key**
3. Note: Use test keys for development, live keys for production

### 1.3 Configure Webhooks

1. Go to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
4. **Events to send**:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

5. Copy the **Webhook Secret** (starts with `whsec_`)

## 🔧 Step 2: Environment Configuration

### 2.1 Frontend Environment (.env)

Update your `buildledger/.env` file:

```env
# Existing Supabase config...
VITE_SUPABASE_URL=https://lncppcvrhdduvobirzsv.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
VITE_STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here
```

### 2.2 Backend Environment (server/.env)

Create `buildledger/server/.env`:

```env
# Server Configuration
PORT=3001

# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# Supabase Configuration
SUPABASE_URL=https://lncppcvrhdduvobirzsv.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### 2.3 Get Supabase Service Role Key

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (not the anon key)

## 🔧 Step 3: Install Dependencies

### 3.1 Frontend Dependencies

```bash
cd buildledger
npm install @stripe/stripe-js @stripe/react-stripe-js --legacy-peer-deps
```

### 3.2 Backend Dependencies

```bash
cd buildledger/server
npm install
```

## 🔧 Step 4: Start the Servers

### 4.1 Start Backend Server

```bash
cd buildledger/server
npm start
```

The server will run on `http://localhost:3001`

### 4.2 Start Frontend Development Server

```bash
cd buildledger
npm start
```

The frontend will run on `http://localhost:3000`

## 🔧 Step 5: Test the Integration

### 5.1 Test Subscription Flow

1. Navigate to `/subscription` in your app
2. Select a plan
3. Enter test card details:
   - **Card Number**: `4242 4242 4242 4242`
   - **Expiry**: Any future date
   - **CVC**: Any 3 digits
   - **ZIP**: Any 5 digits

### 5.2 Test Invoice Payment

1. Create an invoice in the app
2. Click "Pay Online" on the invoice
3. Use the same test card details

### 5.3 Test Customer Portal

1. Go to Settings → Billing
2. Click "Manage Billing"
3. Test subscription management features

## 🔧 Step 6: Production Deployment

### 6.1 Update Environment Variables

Replace test keys with live keys:
- `pk_test_` → `pk_live_`
- `sk_test_` → `sk_live_`
- `whsec_test_` → `whsec_live_`

### 6.2 Update Webhook URL

Update your Stripe webhook endpoint URL to your production domain:
```
https://your-production-domain.com/api/stripe/webhook
```

### 6.3 Deploy Backend

Deploy the server to your preferred hosting platform (Heroku, Vercel, AWS, etc.)

### 6.4 Update CORS Configuration

Update `CORS_ORIGIN` in your server environment to your production frontend URL.

## 🔧 Step 7: Database Verification

Verify that the Stripe migration was applied:

```bash
cd buildledger
npx supabase migration list
```

You should see:
- `20250805020000_safe_schema_setup.sql`
- `20250805030000_stripe_integration.sql`

## 🧪 Testing Checklist

- [ ] Subscription creation works
- [ ] Payment processing works
- [ ] Webhook events are received
- [ ] Database records are updated
- [ ] Customer portal works
- [ ] Invoice payments work
- [ ] Subscription cancellation works
- [ ] Payment method management works

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure CORS_ORIGIN is set correctly
2. **Webhook Failures**: Check webhook secret and endpoint URL
3. **Payment Failures**: Verify Stripe keys are correct
4. **Database Errors**: Ensure migration was applied successfully

### Debug Mode

Enable debug logging in the server:

```javascript
// Add to server/index.js
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### Stripe CLI Testing

Install Stripe CLI for local webhook testing:

```bash
# Install Stripe CLI
stripe listen --forward-to localhost:3001/api/stripe/webhook

# Test webhook events
stripe trigger customer.subscription.created
```

## 📚 Additional Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe React Components](https://stripe.com/docs/stripe-js/react)
- [Supabase Documentation](https://supabase.com/docs)
- [BuildLedger Documentation](./README.md)

## 🎉 Success!

Once you've completed all steps, your BuildLedger application will have:

✅ **Subscription Management**: Users can subscribe to plans
✅ **Invoice Payments**: Secure online payment processing
✅ **Customer Portal**: Self-service billing management
✅ **Webhook Integration**: Real-time payment status updates
✅ **Database Integration**: All payment data stored in Supabase

Your payment system is now ready for production use! 🚀 