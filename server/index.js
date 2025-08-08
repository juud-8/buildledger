// Ensure CommonJS in case the platform tries ESM/deno
try { require('dotenv').config(); } catch (e) { /* ignore if not available */ }
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');
const AIProxyService = require('./middleware/aiProxy');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

// CORS middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
// IMPORTANT: Do NOT register express.json() before the Stripe webhook. The webhook
// requires raw body parsing for signature verification.

// Mount webhook routers BEFORE json body parsing
const createStripeWebhookRouter = require('./middleware/stripeWebhook');
const createTwilioWebhookRouter = require('./middleware/twilioWebhook');
const logger = require('./utils/logger');


// Check required environment variables
if (!process.env.SUPABASE_URL) {
  console.error('❌ SUPABASE_URL is required in .env file');
  process.exit(1);
}

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY is required in .env file');
  process.exit(1);
}

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Initialize AI Proxy Service
const aiProxy = new AIProxyService();

logger.info('Supabase client initialized', {
  url: process.env.SUPABASE_URL?.substring(0, 30) + '...',
  serviceRoleConfigured: !!process.env.SUPABASE_SERVICE_ROLE_KEY
});

logger.info('Server starting', {
  port: process.env.PORT || 3001,
  environment: process.env.NODE_ENV || 'development',
  corsOrigins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000']
});

// Mount webhook routes at /api/stripe (exposes POST /api/stripe/webhook)
app.use('/api/stripe', createStripeWebhookRouter({ stripe, supabase }));

// Mount Twilio webhook routes at /api/twilio (exposes POST /api/twilio/sms/status, etc)
app.use('/api/twilio', createTwilioWebhookRouter({ supabase }));

// Register JSON body parser AFTER webhook mount
app.use(express.json());

// Make Supabase available to middleware
app.use((req, res, next) => {
  req.supabase = supabase;
  next();
});

// Mount AI proxy routes
app.use('/api/ai', aiProxy.createRouter(express));

// Create customer
app.post('/api/stripe/create-customer', async (req, res) => {
  try {
    const { userId, email, name } = req.body;

    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        userId
      }
    });

    res.json({ customerId: customer.id });
  } catch (error) {
    console.error('Error creating customer:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create subscription
app.post('/api/stripe/create-subscription', async (req, res) => {
  try {
    const { customerId, priceId } = req.body;

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Store subscription in database
    const price = await stripe.prices.retrieve(priceId);
    const product = await stripe.products.retrieve(price.product);

    await supabase
      .from('subscriptions')
      .insert({
        stripe_subscription_id: subscription.id,
        stripe_customer_id: customerId,
        stripe_price_id: priceId,
        plan_name: product.name,
        plan_price: price.unit_amount / 100,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000),
        current_period_end: new Date(subscription.current_period_end * 1000)
      });

    res.json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create payment intent
app.post('/api/stripe/create-payment-intent', async (req, res) => {
  try {
    const { invoiceId, amount, customerId } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      customer: customerId,
      metadata: {
        invoiceId
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get subscription
app.get('/api/stripe/subscription/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subscription = await stripe.subscriptions.retrieve(id);
    res.json(subscription);
  } catch (error) {
    console.error('Error retrieving subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel subscription
app.post('/api/stripe/cancel-subscription', async (req, res) => {
  try {
    const { subscriptionId } = req.body;
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true
    });

    // Update database
    await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('stripe_subscription_id', subscriptionId);

    res.json({ success: true });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update subscription
app.post('/api/stripe/update-subscription', async (req, res) => {
  try {
    const { subscriptionId, newPriceId } = req.body;
    
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: newPriceId,
      }],
      proration_behavior: 'create_prorations',
    });

    res.json(updatedSubscription);
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create customer portal session
app.post('/api/stripe/create-portal-session', async (req, res) => {
  try {
    const { customerId, returnUrl } = req.body;

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating portal session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get payment methods
app.get('/api/stripe/payment-methods/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const paymentMethods = await stripe.paymentMethods.list({
      customer: customerId,
      type: 'card',
    });

    res.json(paymentMethods.data);
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({ error: error.message });
  }
});

// Attach payment method
app.post('/api/stripe/attach-payment-method', async (req, res) => {
  try {
    const { customerId, paymentMethodId } = req.body;

    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error attaching payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  logger.info('Server started successfully', {
    port: PORT,
    endpoints: [
      'POST /api/stripe/webhook',
      'POST /api/twilio/sms/status',
      'POST /api/twilio/voice/status',
      'POST /api/ai/chat',
      'GET /api/ai/health',
      'GET /api/twilio/health'
    ]
  });
});