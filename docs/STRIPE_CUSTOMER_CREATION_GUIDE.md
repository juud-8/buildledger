# Stripe Customer Creation Guide for BuildLedger Test Accounts

## 🎯 Current Status
- ✅ Database updated with real Stripe price IDs
- ✅ All test accounts have active subscriptions
- ❌ No Stripe customers created yet
- ❌ MCP Stripe connection needs authentication

## 📋 Test Accounts Ready for Stripe Customers

### 1. Dave's Lifetime Account
- **Email**: dave@buildledger.com
- **Name**: Dave Johnson
- **Company**: Dave's Construction Co
- **Plan**: Lifetime ($999 one-time)
- **Stripe Price ID**: price_1RsdTwKbuTYpVaZ7dwqUv5Bs
- **Action**: Create customer only (no subscription needed)

### 2. Starter Test Account
- **Email**: starter@test.com
- **Name**: Starter Test User
- **Company**: Starter Test Company
- **Plan**: Starter ($29/month)
- **Stripe Price ID**: price_1RsaVXKbuTYpVaZ7bQUlqd2E
- **Action**: Create customer + subscription

### 3. Professional Test Account
- **Email**: professional@test.com
- **Name**: Professional Test User
- **Company**: Professional Test Company
- **Plan**: Professional ($79/month)
- **Stripe Price ID**: price_1RsaVkKbuTYpVaZ7hspcAaFo
- **Action**: Create customer + subscription

### 4. Enterprise Test Account
- **Email**: enterprise@test.com
- **Name**: Enterprise Test User
- **Company**: Enterprise Test Company
- **Plan**: Enterprise ($199/month)
- **Stripe Price ID**: price_1RsaVuKbuTYpVaZ7alwjzlHn
- **Action**: Create customer + subscription

## 🔧 Method 1: Using Stripe CLI (Recommended)

### Step 1: Install Stripe CLI
```bash
# Download from https://stripe.com/docs/stripe-cli
# Or use package manager
npm install -g stripe-cli
```

### Step 2: Login to Stripe
```bash
stripe login
```

### Step 3: Create Customers

#### Create Dave's Customer (Lifetime - No Subscription)
```bash
stripe customers create \
  --email=dave@buildledger.com \
  --name="Dave Johnson" \
  --description="BuildLedger Lifetime Customer - Dave's Construction Co" \
  --metadata[company]="Dave's Construction Co" \
  --metadata[plan]="lifetime"
```

#### Create Starter Customer + Subscription
```bash
# Create customer
stripe customers create \
  --email=starter@test.com \
  --name="Starter Test User" \
  --description="BuildLedger Starter Test Account" \
  --metadata[company]="Starter Test Company" \
  --metadata[plan]="starter"

# Create subscription (replace CUSTOMER_ID with output from above)
stripe subscriptions create \
  --customer=CUSTOMER_ID \
  --items[0][price]=price_1RsaVXKbuTYpVaZ7bQUlqd2E \
  --metadata[company]="Starter Test Company"
```

#### Create Professional Customer + Subscription
```bash
# Create customer
stripe customers create \
  --email=professional@test.com \
  --name="Professional Test User" \
  --description="BuildLedger Professional Test Account" \
  --metadata[company]="Professional Test Company" \
  --metadata[plan]="professional"

# Create subscription (replace CUSTOMER_ID with output from above)
stripe subscriptions create \
  --customer=CUSTOMER_ID \
  --items[0][price]=price_1RsaVkKbuTYpVaZ7hspcAaFo \
  --metadata[company]="Professional Test Company"
```

#### Create Enterprise Customer + Subscription
```bash
# Create customer
stripe customers create \
  --email=enterprise@test.com \
  --name="Enterprise Test User" \
  --description="BuildLedger Enterprise Test Account" \
  --metadata[company]="Enterprise Test Company" \
  --metadata[plan]="enterprise"

# Create subscription (replace CUSTOMER_ID with output from above)
stripe subscriptions create \
  --customer=CUSTOMER_ID \
  --items[0][price]=price_1RsaVuKbuTYpVaZ7alwjzlHn \
  --metadata[company]="Enterprise Test Company"
```

## 🌐 Method 2: Using Stripe Dashboard

### Step 1: Go to Customers
1. Open [Stripe Dashboard](https://dashboard.stripe.com/customers)
2. Click "Add customer"

### Step 2: Create Each Customer
For each test account, fill in:
- **Email**: [test-email]
- **Name**: [test-name]
- **Description**: BuildLedger [Plan] Test Account
- **Metadata**: 
  - company: [Company Name]
  - plan: [plan-type]

### Step 3: Create Subscriptions
1. Go to [Subscriptions](https://dashboard.stripe.com/subscriptions)
2. Click "Add subscription"
3. Select the customer
4. Choose the appropriate price ID
5. Set metadata

## 🗄️ Method 3: Update Database After Creating Customers

Once you have the Stripe customer IDs, update the database:

```sql
-- Update user profiles with Stripe customer IDs
UPDATE public.user_profiles 
SET stripe_customer_id = 'cus_xxx_dave'
WHERE email = 'dave@buildledger.com';

UPDATE public.user_profiles 
SET stripe_customer_id = 'cus_xxx_starter'
WHERE email = 'starter@test.com';

UPDATE public.user_profiles 
SET stripe_customer_id = 'cus_xxx_professional'
WHERE email = 'professional@test.com';

UPDATE public.user_profiles 
SET stripe_customer_id = 'cus_xxx_enterprise'
WHERE email = 'enterprise@test.com';

-- Update user subscriptions with Stripe subscription IDs
UPDATE public.user_subscriptions 
SET 
    stripe_customer_id = 'cus_xxx_starter',
    stripe_subscription_id = 'sub_xxx_starter'
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'starter@test.com');

UPDATE public.user_subscriptions 
SET 
    stripe_customer_id = 'cus_xxx_professional',
    stripe_subscription_id = 'sub_xxx_professional'
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'professional@test.com');

UPDATE public.user_subscriptions 
SET 
    stripe_customer_id = 'cus_xxx_enterprise',
    stripe_subscription_id = 'sub_xxx_enterprise'
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'enterprise@test.com');
```

## 🔍 Verification Commands

### Check Customer Creation
```bash
# List all customers
stripe customers list

# Get specific customer details
stripe customers retrieve cus_xxx
```

### Check Subscription Creation
```bash
# List all subscriptions
stripe subscriptions list

# Get specific subscription details
stripe subscriptions retrieve sub_xxx
```

### Verify Database Updates
```sql
-- Check if customers are linked
SELECT 
    up.email,
    up.full_name,
    up.stripe_customer_id,
    us.stripe_subscription_id,
    sp.name as plan_name
FROM public.user_profiles up
LEFT JOIN public.user_subscriptions us ON up.id = us.user_id
LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
WHERE up.email IN ('dave@buildledger.com', 'starter@test.com', 'professional@test.com', 'enterprise@test.com');
```

## 🚨 Important Notes

### Test Mode vs Live Mode
- All commands above use **test mode** by default
- Use `--live` flag for production
- Test cards: 4242 4242 4242 4242

### Customer IDs Format
- Test: `cus_test_xxx`
- Live: `cus_live_xxx`

### Subscription IDs Format
- Test: `sub_test_xxx`
- Live: `sub_live_xxx`

### Error Handling
- If customer already exists, Stripe will return existing customer
- If subscription fails, check customer ID and price ID
- Verify webhook endpoint is configured

## 🎯 Expected Results

After completing this process, you should have:

1. **4 Stripe customers** created
2. **3 Stripe subscriptions** created (excluding Dave's lifetime)
3. **Database updated** with Stripe IDs
4. **Test accounts** ready for payment processing

## 🔄 Next Steps After Customer Creation

1. **Test Payment Processing** with sample invoices
2. **Set up Webhook Endpoints** for real-time updates
3. **Verify Subscription Management** works correctly
4. **Test Invoice Payment Flow** with existing data

---

**Ready to proceed?** Choose your preferred method and I'll help you with the next steps! 