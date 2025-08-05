# 🧪 BuildLedger Stripe Integration Testing Plan

## 🚨 **CRITICAL ISSUE IDENTIFIED**

**Problem**: Dave's account (`dave@buildledger.com`) doesn't have a Stripe customer ID, which prevents payment processing.

**Current Status**:
- ✅ Database ready for Stripe
- ✅ Subscription plans linked to Stripe price IDs
- ❌ No Stripe customers created yet
- ❌ No webhook endpoint configured
- ❌ Payment processing not functional

## 📋 **TESTING PHASES**

### **PHASE 1: SETUP STRIPE CUSTOMERS (REQUIRED FIRST)**

#### 1.1 Create Stripe Customer for Dave
```bash
# Using Stripe CLI
stripe customers create \
  --email=dave@buildledger.com \
  --name="Dave Johnson" \
  --description="BuildLedger Lifetime Customer - Dave's Construction Co" \
  --metadata[company]="Dave's Construction Co" \
  --metadata[plan]="lifetime"
```

#### 1.2 Create Stripe Customers for Test Accounts
```bash
# Starter Account
stripe customers create \
  --email=starter@test.com \
  --name="Starter Test User" \
  --description="BuildLedger Starter Test Account" \
  --metadata[company]="Starter Test Company" \
  --metadata[plan]="starter"

# Professional Account  
stripe customers create \
  --email=professional@test.com \
  --name="Professional Test User" \
  --description="BuildLedger Professional Test Account" \
  --metadata[company]="Professional Test Company" \
  --metadata[plan]="professional"

# Enterprise Account
stripe customers create \
  --email=enterprise@test.com \
  --name="Enterprise Test User" \
  --description="BuildLedger Enterprise Test Account" \
  --metadata[company]="Enterprise Test Company" \
  --metadata[plan]="enterprise"
```

#### 1.3 Create Subscriptions for Monthly Plans
```bash
# After getting customer IDs, create subscriptions
stripe subscriptions create \
  --customer=CUSTOMER_ID_STARTER \
  --items[0][price]=price_1RsaVXKbuTYpVaZ7bQUlqd2E

stripe subscriptions create \
  --customer=CUSTOMER_ID_PROFESSIONAL \
  --items[0][price]=price_1RsaVkKbuTYpVaZ7hspcAaFo

stripe subscriptions create \
  --customer=CUSTOMER_ID_ENTERPRISE \
  --items[0][price]=price_1RsaVuKbuTYpVaZ7alwjzlHn
```

### **PHASE 2: UPDATE DATABASE WITH STRIPE IDs**

#### 2.1 Update User Profiles
```sql
-- Update with actual Stripe customer IDs after creation
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
```

#### 2.2 Update User Subscriptions
```sql
-- Update with actual Stripe subscription IDs after creation
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

### **PHASE 3: CONFIGURE WEBHOOK ENDPOINT**

#### 3.1 Set Up Webhook in Stripe Dashboard
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. **URL**: `https://lncppcvrhdduvobirzsv.supabase.co/functions/v1/stripe-webhook`
4. **Secret**: `whsec_TE3uBLRlhXTqTQHoVQevolC1oL9nkPKW`
5. **Events to send**:
   - `customer.created`
   - `customer.updated`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.created`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### **PHASE 4: TESTING SCENARIOS**

#### 4.1 Test Login as Dave
- **Email**: dave@buildledger.com
- **Password**: password44
- **Expected**: Successful login, access to dashboard

#### 4.2 Test Creating New Invoice
1. Navigate to Invoices section
2. Create new invoice for existing client
3. Add items from database
4. Set payment method to Stripe
5. **Expected**: Invoice created with Stripe payment link

#### 4.3 Test Payment Processing
1. Use test card: `4242 4242 4242 4242`
2. Expiry: Any future date (e.g., `12/25`)
3. CVC: Any 3 digits (e.g., `123`)
4. **Expected**: Payment succeeds, status updates

#### 4.4 Test Webhook Processing
1. Monitor webhook events in Stripe Dashboard
2. Check database for webhook event records
3. Verify payment status updates
4. **Expected**: Events received and processed

#### 4.5 Test Subscription Management
1. Test upgrading/downgrading plans
2. Test cancellation
3. Test payment failures
4. **Expected**: Subscription changes reflected in database

## 🔧 **CURRENT INVOICES READY FOR TESTING**

Dave has 5 invoices ready for Stripe integration:

| Invoice | Number | Amount | Status | Payment Status | Ready for Stripe |
|---------|--------|--------|--------|----------------|------------------|
| 1 | INV-2024-001 | $8,640.00 | Paid | Pending | ✅ Yes |
| 2 | INV-2024-002 | $10,800.00 | Sent | Pending | ✅ Yes |
| 3 | INV-2023-003 | $54,000.00 | Paid | Pending | ✅ Yes |
| 4 | INV-2024-004 | $27,000.00 | Paid | Pending | ✅ Yes |
| 5 | INV-2024-005 | $29,160.00 | Overdue | Pending | ✅ Yes |

## 🚨 **IMMEDIATE ACTION REQUIRED**

**Before testing can begin, you must:**

1. **Create Stripe customers** for all test accounts
2. **Update database** with Stripe customer IDs
3. **Configure webhook endpoint** in Stripe Dashboard
4. **Test webhook connectivity**

## 📊 **TESTING CHECKLIST**

### ✅ **Database Ready**
- [x] Subscription plans linked to Stripe
- [x] Helper functions created
- [x] Webhook processing functions ready
- [x] Sample data available

### ❌ **Stripe Setup Required**
- [ ] Create Stripe customers
- [ ] Update database with customer IDs
- [ ] Configure webhook endpoint
- [ ] Test webhook connectivity

### ⏳ **Testing Pending**
- [ ] Login as Dave
- [ ] Create new invoice
- [ ] Process payment
- [ ] Verify webhook events
- [ ] Check payment status updates
- [ ] Test subscription management

## 🎯 **NEXT STEPS**

1. **Execute Phase 1** - Create Stripe customers
2. **Execute Phase 2** - Update database
3. **Execute Phase 3** - Configure webhooks
4. **Begin Phase 4** - Start testing

---

**Status**: Database 100% ready, Stripe setup required before testing can begin. 