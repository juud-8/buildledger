# 🧪 BuildLedger Stripe Integration Testing Guide

## 🎯 **CURRENT TESTING STATE**

### ✅ **READY FOR TESTING**
- **Database**: 100% prepared for Stripe integration
- **Test Accounts**: All have test Stripe customer IDs
- **Subscription Plans**: All linked to real Stripe price IDs
- **Test Invoice**: Created with Stripe integration
- **Webhook Functions**: Ready for processing

### ❌ **BLOCKERS FOR FULL TESTING**
- **Real Stripe Customers**: Need to be created in Stripe Dashboard
- **Webhook Endpoint**: Need to be configured in Stripe Dashboard
- **Payment Processing**: Requires real Stripe integration

## 📋 **TESTING SCENARIOS**

### **SCENARIO 1: Login as Dave** ✅ READY
- **Email**: `dave@buildledger.com`
- **Password**: `password44`
- **Expected**: Successful login, access to dashboard
- **Status**: ✅ Can test immediately

### **SCENARIO 2: View Existing Invoices** ✅ READY
- **Test Invoice**: `INV-2024-TEST-001` ($5,500.00)
- **Stripe Integration**: Ready with test IDs
- **Status**: ✅ Can test immediately

### **SCENARIO 3: Create New Invoice** ⚠️ PARTIAL
- **Database**: ✅ Ready
- **Stripe Integration**: ❌ Requires real Stripe customer
- **Status**: ⚠️ Can create invoice, but payment processing needs real Stripe

### **SCENARIO 4: Process Payment** ❌ BLOCKED
- **Test Card**: `4242 4242 4242 4242`
- **Requirement**: Real Stripe customer and webhook endpoint
- **Status**: ❌ Cannot test until Stripe setup is complete

### **SCENARIO 5: Webhook Processing** ❌ BLOCKED
- **Webhook URL**: `https://lncppcvrhdduvobirzsv.supabase.co/functions/v1/stripe-webhook`
- **Requirement**: Configure in Stripe Dashboard
- **Status**: ❌ Cannot test until webhook is configured

## 🔧 **IMMEDIATE TESTING STEPS**

### **Step 1: Test Login** ✅ READY
```bash
# Navigate to BuildLedger login page
# Enter: dave@buildledger.com / password44
# Expected: Successful login to dashboard
```

### **Step 2: Test Dashboard Access** ✅ READY
```bash
# After login, verify:
# - Dashboard loads with sample data
# - 6 invoices visible (including test invoice)
# - Projects, clients, and other data accessible
```

### **Step 3: Test Invoice Viewing** ✅ READY
```bash
# Navigate to Invoices section
# Verify test invoice: INV-2024-TEST-001
# Check Stripe integration fields are present
```

## 🚨 **REQUIRED STRIPE SETUP FOR FULL TESTING**

### **Phase 1: Create Real Stripe Customers**
```bash
# Using Stripe CLI
stripe customers create \
  --email=dave@buildledger.com \
  --name="Dave Johnson" \
  --description="BuildLedger Lifetime Customer"

# Get the customer ID and update database
UPDATE public.user_profiles 
SET stripe_customer_id = 'REAL_CUSTOMER_ID'
WHERE email = 'dave@buildledger.com';
```

### **Phase 2: Configure Webhook Endpoint**
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://lncppcvrhdduvobirzsv.supabase.co/functions/v1/stripe-webhook`
3. Secret: `whsec_TE3uBLRlhXTqTQHoVQevolC1oL9nkPKW`
4. Select events: customer.*, subscription.*, invoice.*, payment_intent.*

### **Phase 3: Test Payment Processing**
```bash
# After Stripe setup, test with:
# Card: 4242 4242 4242 4242
# Expiry: 12/25
# CVC: 123
# Expected: Payment succeeds, webhook processes, status updates
```

## 📊 **CURRENT DATA STATE**

### **Dave's Account Data:**
- **Email**: dave@buildledger.com
- **Stripe Customer ID**: `cus_test_dave_buildledger_001` (test mode)
- **Subscription**: Lifetime (active)
- **Company**: Dave's Construction Co
- **Invoices**: 6 total (including test invoice)

### **Test Invoice Details:**
- **Number**: INV-2024-TEST-001
- **Amount**: $5,500.00
- **Status**: Sent
- **Payment Status**: Pending
- **Stripe Invoice ID**: `in_test_stripe_invoice_001`
- **Payment Intent ID**: `pi_test_payment_intent_001`

### **Sample Data Available:**
- **Projects**: 5 construction projects
- **Clients**: 10 clients
- **Items Database**: 10 construction items
- **Quotes**: 5 quotes
- **Invoices**: 6 invoices (including test)

## 🎯 **TESTING PRIORITIES**

### **Immediate (Can Test Now):**
1. ✅ Login as Dave
2. ✅ View dashboard and sample data
3. ✅ Navigate through invoices, projects, clients
4. ✅ Verify data access and RLS policies

### **After Stripe Setup:**
1. ⏳ Create new invoice with Stripe payment
2. ⏳ Process payment with test card
3. ⏳ Verify webhook events
4. ⏳ Check payment status updates
5. ⏳ Test subscription management

## 🔍 **ERROR DETECTION & FIXES**

### **Common Issues & Solutions:**

#### **Issue 1: Payment Processing Fails**
- **Cause**: No real Stripe customer ID
- **Fix**: Create Stripe customer and update database

#### **Issue 2: Webhook Events Not Received**
- **Cause**: Webhook endpoint not configured
- **Fix**: Configure webhook in Stripe Dashboard

#### **Issue 3: Payment Status Not Updating**
- **Cause**: Webhook processing function not triggered
- **Fix**: Verify webhook endpoint and event processing

#### **Issue 4: Invoice Creation Fails**
- **Cause**: Missing required fields or permissions
- **Fix**: Check database constraints and RLS policies

## 📋 **TESTING CHECKLIST**

### ✅ **Ready to Test:**
- [x] Database connectivity
- [x] User authentication
- [x] Data access and RLS
- [x] Sample data viewing
- [x] Invoice creation (without payment)

### ⏳ **Requires Stripe Setup:**
- [ ] Real Stripe customer creation
- [ ] Webhook endpoint configuration
- [ ] Payment processing testing
- [ ] Webhook event verification
- [ ] Payment status updates
- [ ] Subscription management

## 🚀 **NEXT STEPS**

1. **Test what's available now** (login, dashboard, data viewing)
2. **Set up real Stripe customers** (using provided commands)
3. **Configure webhook endpoint** (in Stripe Dashboard)
4. **Test payment processing** (with test card)
5. **Verify complete integration** (end-to-end testing)

---

**Status**: Database 100% ready, basic functionality testable, payment processing requires Stripe setup. 