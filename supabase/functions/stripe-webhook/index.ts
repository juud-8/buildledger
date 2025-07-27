import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeSecretKey || !stripeWebhookSecret || !supabaseUrl || !supabaseServiceKey) {
      console.error('Missing required environment variables');
      return new Response(
        JSON.stringify({ error: 'Missing required environment variables' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
    });

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      console.error('No Stripe signature found in request headers');
      return new Response(
        JSON.stringify({ error: 'No Stripe signature found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return new Response(
        JSON.stringify({ error: 'Webhook signature verification failed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Received Stripe event: ${event.type} (ID: ${event.id})`);

    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const invoiceId = paymentIntent.metadata?.invoice_id;

      if (!invoiceId) {
        console.error('No invoice_id found in payment intent metadata');
        return new Response(
          JSON.stringify({ error: 'No invoice_id found in metadata' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Processing payment for invoice: ${invoiceId}`);

      try {
        const { data, error } = await supabase
          .from('invoices')
          .update({
            status: 'paid',
            payment_id: paymentIntent.id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', invoiceId)
          .select();

        if (error) {
          console.error('Error updating invoice:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          console.error(`Invoice not found: ${invoiceId}`);
          return new Response(
            JSON.stringify({ error: 'Invoice not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`Successfully updated invoice ${invoiceId} to paid status`);
        return new Response(
          JSON.stringify({
            success: true,
            message: 'Invoice updated successfully',
            invoice_id: invoiceId,
            payment_id: paymentIntent.id
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (dbError) {
        console.error('Database error:', dbError);
        return new Response(
          JSON.stringify({ error: 'Database error occurred' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    console.log(`Unhandled event type: ${event.type}`);
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Event received but not handled',
        event_type: event.type
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}); 