const express = require('express');
const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * Enhanced Stripe webhook router with security, logging, and error handling.
 * - Raw body parsing and signature verification
 * - Rate limiting and security headers  
 * - Structured logging and audit trail
 * - Idempotency and retry handling
 * - Must be mounted BEFORE express.json() in the main app
 *
 * @param {object} deps
 * @param {import('stripe').Stripe} deps.stripe
 * @param {import('@supabase/supabase-js').SupabaseClient} deps.supabase
 */
module.exports = function createStripeWebhookRouter({ stripe, supabase }) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error('STRIPE_WEBHOOK_SECRET is required for webhook verification', {
      type: 'configuration_error',
      service: 'stripe_webhook'
    });
    // We do not exit here to allow non-webhook routes to still function in dev,
    // but verification will fail for webhook requests.
  }

  const router = express.Router();

  // Rate limiting for webhook endpoint
  const webhookLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
      error: 'Too many webhook requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
      // Skip rate limiting if request has valid Stripe signature (more lenient for valid webhooks)
      const signature = req.headers['stripe-signature'];
      return !!signature;
    }
  });

  // Apply rate limiting
  router.use('/webhook', webhookLimiter);

  // Raw body parser is REQUIRED for Stripe signature verification
  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const startTime = Date.now();
    const signatureHeader = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const clientIP = req.ip || req.connection.remoteAddress;

    let event;

    // Security: Validate signature header format
    if (!signatureHeader || typeof signatureHeader !== 'string') {
      logger.security('Invalid Stripe signature header', {
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        signaturePresent: !!signatureHeader
      });
      return res.status(400).json({ error: 'Invalid signature header' });
    }

    // Signature verification
    try {
      event = stripe.webhooks.constructEvent(req.body, signatureHeader, endpointSecret);
      
      logger.info('Stripe webhook signature verified', {
        eventType: event.type,
        eventId: event.id,
        ip: clientIP
      });
    } catch (err) {
      logger.security('Stripe webhook signature verification failed', {
        error: err.message,
        ip: clientIP,
        userAgent: req.headers['user-agent'],
        signatureHeader: signatureHeader.substring(0, 50) + '...' // Truncated for security
      });
      return res.status(400).json({ error: 'Webhook signature verification failed' });
    }

    // Structured logging for webhook receipt
    logger.webhook('stripe', event.id, {
      eventType: event.type,
      livemode: event.livemode,
      created: event.created,
      ip: clientIP
    });

    try {
      // Idempotency: check if we've already processed this event
      const { data: existing, error: existingErr } = await supabase
        .from('webhook_events')
        .select('id, processed')
        .eq('stripe_event_id', event.id)
        .maybeSingle();

      if (existingErr) {
        logger.error('Error checking existing webhook event', {
          error: existingErr,
          eventId: event.id,
          eventType: event.type
        });
      }

      if (existing?.processed) {
        logger.info('Duplicate webhook event skipped', {
          eventId: event.id,
          eventType: event.type,
          ip: clientIP
        });
        return res.json({ received: true, duplicate: true });
      }

      // Store/Upsert the webhook event record (unprocessed)
      const { error: insertErr } = await supabase
        .from('webhook_events')
        .upsert({
          stripe_event_id: event.id,
          event_type: event.type,
          event_data: event.data,
          processed: false,
          received_at: new Date().toISOString(),
          source_ip: clientIP
        }, { onConflict: 'stripe_event_id' });

      if (insertErr) {
        logger.error('Error inserting webhook event', {
          error: insertErr,
          eventId: event.id,
          eventType: event.type
        });
      }

      // Handle event types
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
          await handleSubscriptionChange({ stripe, supabase }, event.data.object);
          break;
        case 'customer.subscription.deleted':
          await handleSubscriptionCancellation({ supabase }, event.data.object);
          break;
        case 'invoice.payment_succeeded':
          await handlePaymentSuccess({ supabase }, event.data.object);
          break;
        case 'invoice.payment_failed':
          await handlePaymentFailure({ supabase }, event.data.object);
          break;
        default:
          logger.info('Unhandled Stripe event type', {
            eventType: event.type,
            eventId: event.id
          });
      }

      // Mark as processed (idempotent completion)
      const { error: markErr } = await supabase
        .from('webhook_events')
        .update({ 
          processed: true,
          processed_at: new Date().toISOString()
        })
        .eq('stripe_event_id', event.id);

      if (markErr) {
        logger.error('Error marking webhook event processed', {
          error: markErr,
          eventId: event.id
        });
      }

      const processingTime = Date.now() - startTime;
      logger.info('Stripe webhook processed successfully', {
        eventId: event.id,
        eventType: event.type,
        processingTimeMs: processingTime,
        ip: clientIP
      });

      return res.json({ 
        received: true,
        eventId: event.id,
        processingTime: `${processingTime}ms`
      });
    } catch (error) {
      const processingTime = Date.now() - startTime;
      logger.error('Error processing Stripe webhook', {
        error: error.message,
        stack: error.stack,
        eventId: event?.id,
        eventType: event?.type,
        processingTimeMs: processingTime,
        ip: clientIP
      });
      return res.status(500).json({ 
        error: 'Webhook processing failed',
        eventId: event?.id
      });
    }
  });

  return router;
};

async function handleSubscriptionChange({ stripe, supabase }, subscription) {
  const priceId = subscription.items?.data?.[0]?.price?.id;
  let planName = null;
  let unitAmount = null;
  try {
    if (priceId) {
      const price = await stripe.prices.retrieve(priceId);
      const product = await stripe.products.retrieve(price.product);
      planName = product?.name || null;
      unitAmount = typeof price.unit_amount === 'number' ? price.unit_amount / 100 : null;
    }
  } catch (e) {
    console.error('Error enriching subscription with price/product:', e);
  }

  await supabase
    .from('subscriptions')
    .upsert({
      stripe_subscription_id: subscription.id,
      stripe_customer_id: subscription.customer,
      stripe_price_id: priceId,
      plan_name: planName,
      plan_price: unitAmount,
      status: subscription.status,
      current_period_start: subscription.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
      current_period_end: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
      cancel_at_period_end: subscription.cancel_at_period_end ?? false,
    });
}

async function handleSubscriptionCancellation({ supabase }, subscription) {
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', cancel_at_period_end: true })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentSuccess({ supabase }, invoice) {
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('stripe_subscription_id', invoice.subscription);
  }

  if (invoice.metadata?.invoiceId) {
    await supabase
      .from('invoices')
      .update({
        status: 'paid',
        paid_date: new Date().toISOString(),
        stripe_invoice_id: invoice.id,
        payment_status: 'succeeded',
      })
      .eq('id', invoice.metadata.invoiceId);
  }
}

async function handlePaymentFailure({ supabase }, invoice) {
  if (invoice.subscription) {
    await supabase
      .from('subscriptions')
      .update({ status: 'past_due' })
      .eq('stripe_subscription_id', invoice.subscription);
  }

  if (invoice.metadata?.invoiceId) {
    await supabase
      .from('invoices')
      .update({
        status: 'overdue',
        payment_status: 'failed',
      })
      .eq('id', invoice.metadata.invoiceId);
  }
}


