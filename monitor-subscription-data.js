require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL || 'https://lncppcvrhdduvobirzsv.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

console.log('🔍 Monitoring BuildLedger Subscription Data...\n');

async function checkSubscriptionData() {
  try {
    console.log('📊 Checking subscription data...\n');

    // Check webhook events
    const { data: webhookEvents, error: webhookError } = await supabase
      .from('webhook_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (webhookError) {
      console.error('❌ Error fetching webhook events:', webhookError);
    } else {
      console.log('📡 Recent Webhook Events:');
      webhookEvents.forEach(event => {
        console.log(`  • ${event.event_type} (${event.created_at})`);
      });
      console.log('');
    }

    // Check subscriptions
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (subError) {
      console.error('❌ Error fetching subscriptions:', subError);
    } else {
      console.log('💳 Recent Subscriptions:');
      subscriptions.forEach(sub => {
        console.log(`  • ${sub.stripe_subscription_id} - ${sub.status} (${sub.created_at})`);
      });
      console.log('');
    }

    // Check user profiles with Stripe customer IDs
    const { data: userProfiles, error: profileError } = await supabase
      .from('user_profiles')
      .select('id, full_name, email, stripe_customer_id, subscription_status')
      .not('stripe_customer_id', 'is', null)
      .limit(5);

    if (profileError) {
      console.error('❌ Error fetching user profiles:', profileError);
    } else {
      console.log('👤 Users with Stripe Customer IDs:');
      userProfiles.forEach(profile => {
        console.log(`  • ${profile.full_name || profile.email} - ${profile.stripe_customer_id} (${profile.subscription_status})`);
      });
      console.log('');
    }

    // Check payment methods
    const { data: paymentMethods, error: pmError } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (pmError) {
      console.error('❌ Error fetching payment methods:', pmError);
    } else {
      console.log('💳 Recent Payment Methods:');
      paymentMethods.forEach(pm => {
        console.log(`  • ${pm.stripe_payment_method_id} - ${pm.type} (${pm.created_at})`);
      });
      console.log('');
    }

  } catch (error) {
    console.error('❌ Error monitoring data:', error);
  }
}

// Run initial check
checkSubscriptionData();

// Set up real-time monitoring
console.log('🔄 Setting up real-time monitoring...\n');

// Monitor webhook events in real-time
const webhookSubscription = supabase
  .channel('webhook-events')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'webhook_events' },
    (payload) => {
      console.log('📡 NEW WEBHOOK EVENT:', payload.new.event_type);
      console.log('   Event ID:', payload.new.stripe_event_id);
      console.log('   Timestamp:', payload.new.created_at);
      console.log('');
    }
  )
  .subscribe();

// Monitor subscriptions in real-time
const subscriptionSubscription = supabase
  .channel('subscriptions')
  .on('postgres_changes', 
    { event: 'INSERT', schema: 'public', table: 'subscriptions' },
    (payload) => {
      console.log('💳 NEW SUBSCRIPTION:', payload.new.stripe_subscription_id);
      console.log('   Status:', payload.new.status);
      console.log('   Customer:', payload.new.stripe_customer_id);
      console.log('');
    }
  )
  .subscribe();

// Monitor user profiles in real-time
const profileSubscription = supabase
  .channel('user-profiles')
  .on('postgres_changes', 
    { event: 'UPDATE', schema: 'public', table: 'user_profiles' },
    (payload) => {
      if (payload.new.stripe_customer_id !== payload.old.stripe_customer_id) {
        console.log('👤 CUSTOMER ID UPDATED:', payload.new.full_name || payload.new.email);
        console.log('   New Customer ID:', payload.new.stripe_customer_id);
        console.log('');
      }
    }
  )
  .subscribe();

console.log('✅ Real-time monitoring active! Press Ctrl+C to stop.\n');

// Refresh data every 30 seconds
setInterval(checkSubscriptionData, 30000); 