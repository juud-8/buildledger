#!/usr/bin/env node

/*
  Seed a permanent demo tenant: "Nailed It Construction" (Pittsburgh, PA)
  - Auth user: nailed@demo.com / demopassword01 (auto-confirmed)
  - user_profiles: role=company_owner, subscription_plan=lifetime (FULL_ACCESS)
  - companies + linked data (clients, projects, items, quotes, invoices, payments)

  Requirements
  - SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment (service role key required)
  - Tables per schema in supabase/migrations/20250101000000_complete_buildledger_schema.sql

  Usage
  - Seed or update:   node scripts/seed-demo-nailedit.js
  - Reset + seed:     node scripts/seed-demo-nailedit.js --reset
*/

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

const DEMO = {
  email: 'nailed@demo.com',
  password: 'demopassword01',
  fullName: 'Nailed It Admin',
  companyName: 'Nailed It Construction',
  companySlug: 'nailed-it-construction',
  address: {
    street: '123 Liberty Ave',
    city: 'Pittsburgh',
    state: 'PA',
    postal: '15222'
  },
  phone: '(412) 555-0199',
  website: 'https://nailedit.example.com',
  colors: { primary: '#F97316', secondary: '#0EA5E9', accent: '#22C55E' },
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function ensureAuthUser() {
  const skipAuth = process.argv.includes('--skip-auth') || /^(1|true)$/i.test(process.env.DEMO_SKIP_AUTH || '');
  // Try to find existing user by scanning pages to avoid duplicate-creation 500s
  const PAGE_SIZE = 1000;
  let page = 1;
  while (true) {
    const { data: list, error: listErr } = await admin.auth.admin.listUsers({ page, perPage: PAGE_SIZE });
    if (listErr) throw listErr;
    const found = list.users.find((u) => u.email === DEMO.email);
    if (found) return found.id;
    if (!list || list.users.length < PAGE_SIZE) break; // last page
    page += 1;
  }

  if (skipAuth) {
    throw new Error('Auth user not found and --skip-auth specified. Please create the user in Supabase Auth UI and rerun.');
  }

  // Create new (handle race/duplication by re-checking on failure)
  const { data, error } = await admin.auth.admin.createUser({
    email: DEMO.email,
    password: DEMO.password,
    email_confirm: true,
    user_metadata: { full_name: DEMO.fullName, company_name: DEMO.companyName },
  });
  if (error) {
    // If creation failed (e.g., duplicate), re-scan and return existing if present
    const { data: list2 } = await admin.auth.admin.listUsers({ page: 1, perPage: PAGE_SIZE });
    const again = list2?.users?.find((u) => u.email === DEMO.email);
    if (again) return again.id;
    throw error;
  }
  return data.user.id;
}

async function upsertProfile(userId) {
  const { error } = await admin.from('user_profiles').upsert(
    {
      id: userId,
      email: DEMO.email,
      full_name: DEMO.fullName,
      role: 'company_owner',
      subscription_plan: 'lifetime', // maps to Enterprise FULL_ACCESS in rbac
      subscription_status: 'active',
      preferences: { plan: 'lifetime', lifetime_access: true, payment_required: false },
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

async function upsertCompany(userId) {
  // Fetch existing company for this profile if any
  const { data: profile } = await admin
    .from('user_profiles')
    .select('company_id')
    .eq('id', userId)
    .single();

  // Try to find company by slug first
  const { data: existing } = await admin
    .from('companies')
    .select('id')
    .eq('slug', DEMO.companySlug)
    .maybeSingle();

  const payload = {
    name: DEMO.companyName,
    slug: DEMO.companySlug,
    description: `${DEMO.companyName} – Pittsburgh general contractor`,
    industry: 'Construction',
    website: DEMO.website,
    phone: DEMO.phone,
    email: DEMO.email,
    address: DEMO.address,
    primary_color: DEMO.colors.primary,
    secondary_color: DEMO.colors.secondary,
    accent_color: DEMO.colors.accent,
    settings: { plan: 'lifetime', showcase_demo: true },
    is_active: true,
    updated_at: new Date().toISOString(),
  };

  let companyId = existing?.id;
  if (companyId) {
    const { error: upErr } = await admin.from('companies').update(payload).eq('id', companyId);
    if (upErr) throw upErr;
  } else {
    const { data: inserted, error: insErr } = await admin.from('companies').insert(payload).select('id').single();
    if (insErr) throw insErr;
    companyId = inserted.id;
  }

  // Link profile → company
  if (!profile?.company_id || profile.company_id !== companyId) {
    const { error: linkErr } = await admin.from('user_profiles').update({ company_id: companyId }).eq('id', userId);
    if (linkErr) throw linkErr;
  }
  return companyId;
}

async function resetCompanyData(companyId) {
  const tables = [
    'payments',
    'invoice_items',
    'invoices',
    'quote_items',
    'quotes',
    'projects',
    'items_database',
    'clients',
    'documents',
  ];
  for (const t of tables) {
    // Some tables do not have company_id; handle with exists checks
    if (['invoice_items', 'quote_items'].includes(t)) {
      const fk = t === 'invoice_items' ? 'invoice_id' : 'quote_id';
      // Delete rows linked to this company's parent rows
      const parent = t === 'invoice_items' ? 'invoices' : 'quotes';
      const { data: rows } = await admin.from(parent).select('id').eq('company_id', companyId);
      const ids = (rows || []).map((r) => r.id);
      if (ids.length) {
        await admin.from(t).delete().in(fk, ids);
      }
    } else if (['documents'].includes(t)) {
      await admin.from(t).delete().eq('company_id', companyId);
    } else {
      await admin.from(t).delete().eq('company_id', companyId);
    }
  }
}

function randomChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function currency(n) { return Math.round(n * 100) / 100; }

async function seedClients(companyId) {
  const clients = [
    { name: 'Mia Malkova', email: 'mia@client.com', phone: '(412) 555-0101', address: { city: 'Pittsburgh', state: 'PA' } },
    { name: 'Steel City Deli', email: 'orders@steelcitydeli.com', phone: '(412) 555-0102', company_name: 'Steel City Deli', address: { city: 'Pittsburgh', state: 'PA' } },
    { name: 'Erie Apartments LLC', email: 'pm@erieapt.com', phone: '(412) 555-0103', company_name: 'Erie Apartments' },
    { name: 'Riverside Church', email: 'office@riversidechurch.org', phone: '(412) 555-0104', company_name: 'Riverside Church' },
    { name: 'Point Park University', email: 'facilities@ppu.edu', phone: '(412) 555-0105', company_name: 'Point Park University' },
    { name: 'North Shore Brewing', email: 'ops@nsbrewing.com', phone: '(412) 555-0106', company_name: 'North Shore Brewing' },
    { name: 'Downtown Lofts HOA', email: 'board@dtlofts.org', phone: '(412) 555-0107', company_name: 'Downtown Lofts HOA' },
    { name: 'Sarah Johnson', email: 'sarah@example.com', phone: '(412) 555-0108' },
    { name: 'Pittsburgh Dentistry', email: 'admin@pgdentistry.com', phone: '(412) 555-0109', company_name: 'Pittsburgh Dentistry' },
    { name: 'Three Rivers Gym', email: 'owner@3riversgym.com', phone: '(412) 555-0110', company_name: 'Three Rivers Gym' },
  ].map((c) => ({ ...c, company_id: companyId, is_active: true }));

  const { data, error } = await admin.from('clients').insert(clients).select('id');
  if (error) throw error;
  return data.map((r) => r.id);
}

async function seedItems(companyId) {
  const items = [
    { name: '2x4 Stud (8ft)', category: 'materials', unit_price: 4.25, unit: 'each', cost: 2.1, profit_margin: 50, supplier: 'Lumber Co' },
    { name: 'Drywall Sheet (1/2in 4x8)', category: 'materials', unit_price: 12.5, unit: 'each', cost: 8.2, profit_margin: 40, supplier: 'Drywall Supply' },
    { name: 'Electrical Hourly Labor', category: 'labor', unit_price: 85, unit: 'hour', cost: 45, profit_margin: 46 },
    { name: 'Plumbing Hourly Labor', category: 'labor', unit_price: 90, unit: 'hour', cost: 50, profit_margin: 44 },
    { name: 'Mini Excavator (Daily)', category: 'equipment', unit_price: 350, unit: 'day', cost: 120, profit_margin: 65 },
    { name: 'Roofing Subcontractor', category: 'subcontractor', unit_price: 12000, unit: 'job', cost: 9500, profit_margin: 26 },
    { name: 'Dumpster (20yd, Weekly)', category: 'overhead', unit_price: 450, unit: 'week', cost: 300, profit_margin: 33 },
    { name: 'Permit Fees', category: 'other', unit_price: 200, unit: 'each', cost: 0, profit_margin: 0 },
  ].map((i) => ({ ...i, company_id: companyId, is_active: true, description: i.description || null }));

  const { data, error } = await admin.from('items_database').insert(items).select('id,name,unit_price');
  if (error) throw error;
  return data;
}

async function seedProjects(companyId, clientIds) {
  const today = new Date();
  const mkDate = (offsetDays) => new Date(today.getTime() + offsetDays * 86400000);
  const statuses = ['planning', 'in_progress', 'completed'];
  const projects = [
    { name: 'Retail Buildout - Steel City Deli', client_id: clientIds[1], status: 'in_progress', budget_amount: 125000, start_date: mkDate(-45), end_date: mkDate(30) },
    { name: 'North Shore Brewing Expansion', client_id: clientIds[5], status: 'planning', budget_amount: 275000, start_date: mkDate(10), end_date: mkDate(140) },
    { name: 'Riverside Church Roof Replacement', client_id: clientIds[3], status: 'completed', budget_amount: 88000, start_date: mkDate(-120), end_date: mkDate(-30) },
    { name: 'Downtown Lofts Lobby Renovation', client_id: clientIds[6], status: 'in_progress', budget_amount: 64000, start_date: mkDate(-20), end_date: mkDate(40) },
    { name: 'Residential Kitchen Remodel - Sarah Johnson', client_id: clientIds[7], status: 'planning', budget_amount: 42000, start_date: mkDate(5), end_date: mkDate(60) },
  ].map((p) => ({
    ...p,
    company_id: companyId,
    description: `${p.name} – managed by Nailed It Construction`,
    address: DEMO.address,
    priority: randomChoice(['low', 'medium', 'high']),
    completion_percentage: p.status === 'completed' ? 100 : p.status === 'in_progress' ? 45 : 0,
  }));

  const { data, error } = await admin.from('projects').insert(projects).select('id,name');
  if (error) throw error;
  return data;
}

async function seedQuotesInvoices(companyId, clientIds, items) {
  // Create a few quotes and convert some to invoices
  const mkQuoteNumber = (i) => `Q-${String(2 + i).padStart(4, '0')}`;
  const quotesPayload = Array.from({ length: 6 }).map((_, i) => ({
    company_id: companyId,
    client_id: clientIds[(i + 1) % clientIds.length],
    project_id: null,
    quote_number: mkQuoteNumber(i),
    title: ['Tenant Improvement', 'Kitchen Remodel', 'Roof Repair', 'Office Buildout'][i % 4],
    description: 'Detailed scope of work with allowances and exclusions',
    status: ['draft', 'sent', 'accepted'][i % 3],
    subtotal: 0, tax_amount: 0, total_amount: 0,
    notes: 'Payment terms: Net 30',
  }));

  const { data: quotes, error: qErr } = await admin.from('quotes').insert(quotesPayload).select('id,quote_number,status');
  if (qErr) throw qErr;

  // Add line items
  for (const q of quotes) {
    const lineCount = 3 + Math.floor(Math.random() * 4);
    const selected = Array.from({ length: lineCount }).map(() => randomChoice(items));
    const qi = selected.map((it) => ({
      quote_id: q.id,
      item_id: it.id,
      name: it.name,
      description: null,
      quantity: currency(1 + Math.random() * 8),
      unit_price: it.unit_price,
      total_price: 0,
    }));
    qi.forEach((r) => (r.total_price = currency(Number(r.quantity) * Number(r.unit_price))));
    const subtotal = currency(qi.reduce((s, r) => s + r.total_price, 0));
    const tax = currency(subtotal * 0.07);
    const total = currency(subtotal + tax);
    const { error: qiErr } = await admin.from('quote_items').insert(qi);
    if (qiErr) throw qiErr;
    const { error: updErr } = await admin.from('quotes').update({ subtotal, tax_amount: tax, total_amount: total }).eq('id', q.id);
    if (updErr) throw updErr;
  }

  // Create invoices for half the quotes
  const invoicesCreated = [];
  for (let i = 0; i < quotes.length; i++) {
    const q = quotes[i];
    if (i % 2 === 0) {
      // Create invoice header
      const { data: invoice, error: invErr } = await admin
        .from('invoices')
        .insert({
          company_id: companyId,
          client_id: q.client_id,
          project_id: null,
          quote_id: q.id,
          invoice_number: `INV-2025-${Math.floor(Math.random() * 9000 + 1000)}`,
          title: `Invoice for ${q.quote_number}`,
          description: q.description,
          status: randomChoice(['draft', 'sent', 'paid', 'overdue']),
          subtotal: q.subtotal,
          tax_amount: q.tax_amount,
          total_amount: q.total_amount,
          due_date: null,
          notes: q.notes,
        })
        .select('id,status,total_amount')
        .single();
      if (invErr) throw invErr;

      // Copy quote_items
      const { data: quoteItems } = await admin.from('quote_items').select('*').eq('quote_id', q.id);
      const invoiceItems = (quoteItems || []).map((r) => ({
        invoice_id: invoice.id,
        item_id: r.item_id,
        name: r.name,
        description: r.description,
        quantity: r.quantity,
        unit_price: r.unit_price,
        total_price: r.total_price,
      }));
      if (invoiceItems.length) {
        const { error: insErr } = await admin.from('invoice_items').insert(invoiceItems);
        if (insErr) throw insErr;
      }

      // Payments if paid or partial
      if (invoice.status === 'paid' || invoice.status === 'sent') {
        const paid = invoice.status === 'paid' ? invoice.total_amount : currency(invoice.total_amount * 0.5);
        const { error: payErr } = await admin.from('payments').insert({
          company_id: companyId,
          invoice_id: invoice.id,
          amount: paid,
          payment_method: randomChoice(['ach', 'check', 'stripe']),
          status: invoice.status === 'paid' ? 'succeeded' : 'pending',
          payment_date: new Date().toISOString(),
          notes: 'Demo payment',
        });
        if (payErr) throw payErr;
      }
      invoicesCreated.push(invoice.id);
    }
  }
}

async function upsertLifetimePlan() {
  // Ensure subscription_plans contains lifetime plan for completeness
  const { data: existing } = await admin
    .from('subscription_plans')
    .select('id')
    .eq('name', 'lifetime')
    .maybeSingle();
  if (existing) return existing.id;
  const { data, error } = await admin
    .from('subscription_plans')
    .insert({
      name: 'lifetime',
      display_name: 'Lifetime',
      description: 'Unlimited access for demo/showcase',
      price: 0,
      billing_cycle: 'one_time',
      features: ['full_access', 'no_limits'],
      limits: {},
      is_active: true,
    })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertUserSubscription(userId, planId) {
  const { error } = await admin
    .from('user_subscriptions')
    .upsert({
      user_id: userId,
      plan_id: planId,
      status: 'active',
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(new Date().setFullYear(new Date().getFullYear() + 10)).toISOString(),
    }, { onConflict: 'user_id' });
  if (error) throw error;
}

async function main() {
  const doReset = process.argv.includes('--reset');
  console.log('🚀 Seeding demo tenant: Nailed It Construction');
  const userId = await ensureAuthUser();
  await sleep(500); // give triggers a moment
  await upsertProfile(userId);
  const companyId = await upsertCompany(userId);
  console.log(`✅ Auth/User/Company ready. company_id=${companyId}`);

  if (doReset) {
    console.log('🧹 Resetting existing demo data...');
    await resetCompanyData(companyId);
    console.log('✅ Reset complete');
  }

  console.log('📦 Seeding entities (clients, items, projects, quotes, invoices, payments)...');
  const clientIds = await seedClients(companyId);
  const items = await seedItems(companyId);
  await seedProjects(companyId, clientIds);
  await seedQuotesInvoices(companyId, clientIds, items);
  console.log('✅ Data seeded');

  try {
    const planId = await upsertLifetimePlan();
    await upsertUserSubscription(userId, planId);
    console.log('✅ Lifetime plan ensured and user subscription active');
  } catch (e) {
    // Non-fatal if subscription_plans table or RLS blocks; profile subscription_plan still unlocks FULL_ACCESS
    console.log('ℹ️ Subscription setup skipped or partial:', e.message);
  }

  console.log('\n🎉 Demo account is ready!');
  console.log('   Email:   ', DEMO.email);
  console.log('   Password: ', DEMO.password);
}

main().catch((e) => {
  console.error('❌ Seed failed:', e);
  process.exit(1);
});


