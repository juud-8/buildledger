const express = require('express');

/**
 * Stripe webhook router with raw body parsing and signature verification.
 * - Must be mounted BEFORE express.json() in the main app.
 * - Uses idempotency by recording processed event IDs in DB.
 * - Logs events to server logs only.
 *
 * @param {object} deps
 * @param {import('stripe').Stripe} deps.stripe
 * @param {import('@supabase/supabase-js').SupabaseClient} deps.supabase
 */
module.exports = function createStripeWebhookRouter({ stripe, supabase }) {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.error('❌ STRIPE_WEBHOOK_SECRET is required for webhook verification');
    // We do not exit here to allow non-webhook routes to still function in dev,
    // but verification will fail for webhook requests.
  }

  const router = express.Router();

  // Raw body parser is REQUIRED for Stripe signature verification
  router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const signatureHeader = req.headers['stripe-signature'];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, signatureHeader, endpointSecret);
    } catch (err) {
      console.error('❌ Stripe webhook signature verification failed:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Log receipt of the event to server logs only
    console.log(`📬 Stripe webhook received: ${event.type} (id=${event.id})`);

    try {
      // Idempotency: check if we've already processed this event
      const { data: existing, error: existingErr } = await supabase
        .from('webhook_events')
        .select('id, processed')
        .eq('stripe_event_id', event.id)
        .maybeSingle();

      if (existingErr) {
        console.error('Error checking existing webhook event:', existingErr);
      }

      if (existing?.processed) {
        console.log(`🔁 Event ${event.id} already processed; skipping.`);
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
        }, { onConflict: 'stripe_event_id' });

      if (insertErr) {
        console.error('Error inserting webhook event:', insertErr);
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
          console.log(`ℹ️ Unhandled Stripe event type: ${event.type}`);
      }

      // Mark as processed (idempotent completion)
      const { error: markErr } = await supabase
        .from('webhook_events')
        .update({ processed: true })
        .eq('stripe_event_id', event.id);

      if (markErr) {
        console.error('Error marking webhook event processed:', markErr);
      }

      return res.json({ received: true });
    } catch (error) {
      console.error('❌ Error processing Stripe webhook:', error);
      return res.status(500).json({ error: 'Webhook processing failed' });
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


