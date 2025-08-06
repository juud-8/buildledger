require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

async function createRemainingCustomers() {
  console.log('🚀 Creating remaining Stripe customers for BuildLedger...\n');
  console.log('✅ Dave\'s customer already exists: cus_SoGFdQ1EsLDjOY\n');

  try {
    // Create Starter customer
    console.log('📧 Creating Starter customer...');
    const starterCustomer = await stripe.customers.create({
      email: 'starter@test.com',
      name: 'Starter Test User',
      description: 'BuildLedger Starter Test Account',
      metadata: {
        company: 'Starter Test Company',
        plan: 'starter'
      }
    });
    console.log('✅ Starter customer created:', starterCustomer.id);

    // Create Professional customer
    console.log('\n📧 Creating Professional customer...');
    const professionalCustomer = await stripe.customers.create({
      email: 'professional@test.com',
      name: 'Professional Test User',
      description: 'BuildLedger Professional Test Account',
      metadata: {
        company: 'Professional Test Company',
        plan: 'professional'
      }
    });
    console.log('✅ Professional customer created:', professionalCustomer.id);

    // Create Enterprise customer
    console.log('\n📧 Creating Enterprise customer...');
    const enterpriseCustomer = await stripe.customers.create({
      email: 'enterprise@test.com',
      name: 'Enterprise Test User',
      description: 'BuildLedger Enterprise Test Account',
      metadata: {
        company: 'Enterprise Test Company',
        plan: 'enterprise'
      }
    });
    console.log('✅ Enterprise customer created:', enterpriseCustomer.id);

    // Create subscriptions for monthly plans
    console.log('\n🔄 Creating subscriptions...');
    
    // Starter subscription
    const starterSubscription = await stripe.subscriptions.create({
      customer: starterCustomer.id,
      items: [{ price: 'price_1RsaVXKbuTYpVaZ7bQUlqd2E' }],
      metadata: {
        company: 'Starter Test Company'
      }
    });
    console.log('✅ Starter subscription created:', starterSubscription.id);

    // Professional subscription
    const professionalSubscription = await stripe.subscriptions.create({
      customer: professionalCustomer.id,
      items: [{ price: 'price_1RsaVkKbuTYpVaZ7hspcAaFo' }],
      metadata: {
        company: 'Professional Test Company'
      }
    });
    console.log('✅ Professional subscription created:', professionalSubscription.id);

    // Enterprise subscription
    const enterpriseSubscription = await stripe.subscriptions.create({
      customer: enterpriseCustomer.id,
      items: [{ price: 'price_1RsaVuKbuTYpVaZ7alwjzlHn' }],
      metadata: {
        company: 'Enterprise Test Company'
      }
    });
    console.log('✅ Enterprise subscription created:', enterpriseSubscription.id);

    // Summary
    console.log('\n🎉 ALL CUSTOMERS AND SUBSCRIPTIONS CREATED SUCCESSFULLY!');
    console.log('\n📋 SUMMARY:');
    console.log('Dave (Lifetime): cus_SoGFdQ1EsLDjOY (already exists)');
    console.log('Starter:', starterCustomer.id, '| Subscription:', starterSubscription.id);
    console.log('Professional:', professionalCustomer.id, '| Subscription:', professionalSubscription.id);
    console.log('Enterprise:', enterpriseCustomer.id, '| Subscription:', enterpriseSubscription.id);

    console.log('\n🗄️ DATABASE UPDATE COMMANDS:');
    console.log('-- Copy and run these SQL commands to update your database:');
    console.log(`
-- Update Starter customer
UPDATE public.user_profiles 
SET stripe_customer_id = '${starterCustomer.id}'
WHERE email = 'starter@test.com';

-- Update Professional customer
UPDATE public.user_profiles 
SET stripe_customer_id = '${professionalCustomer.id}'
WHERE email = 'professional@test.com';

-- Update Enterprise customer
UPDATE public.user_profiles 
SET stripe_customer_id = '${enterpriseCustomer.id}'
WHERE email = 'enterprise@test.com';

-- Update Starter subscription
UPDATE public.user_subscriptions 
SET 
    stripe_customer_id = '${starterCustomer.id}',
    stripe_subscription_id = '${starterSubscription.id}'
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'starter@test.com');

-- Update Professional subscription
UPDATE public.user_subscriptions 
SET 
    stripe_customer_id = '${professionalCustomer.id}',
    stripe_subscription_id = '${professionalSubscription.id}'
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'professional@test.com');

-- Update Enterprise subscription
UPDATE public.user_subscriptions 
SET 
    stripe_customer_id = '${enterpriseCustomer.id}',
    stripe_subscription_id = '${enterpriseSubscription.id}'
WHERE user_id = (SELECT id FROM public.user_profiles WHERE email = 'enterprise@test.com');
    `);

    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Run the SQL commands above to update your database');
    console.log('2. Configure webhook endpoint in Stripe Dashboard');
    console.log('3. Test payment processing with test card: 4242 4242 4242 4242');

  } catch (error) {
    console.error('❌ Error creating customers:', error.message);
    if (error.type) {
      console.error('Error type:', error.type);
    }
  }
}

// Check if Stripe is installed
try {
  require('stripe');
  createRemainingCustomers();
} catch (error) {
  console.log('❌ Stripe package not found. Please install it first:');
  console.log('npm install stripe');
  console.log('\nThen run this script again.');
} 