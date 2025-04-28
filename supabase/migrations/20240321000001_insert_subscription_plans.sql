-- Add stripe_price_id column
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;
ALTER TABLE subscription_plans ADD COLUMN IF NOT EXISTS usage_limits JSONB NOT NULL DEFAULT '{}'::jsonb;

-- Insert subscription plans
INSERT INTO subscription_plans (name, description, price, interval, features, stripe_price_id, usage_limits) VALUES
(
    'BuildLedger Professional (Yearly)',
    'Professional plan with annual billing',
    409.99,
    'year',
    '[
        "Unlimited Invoices & Quotes",
        "Custom Branding",
        "Advanced Analytics",
        "Priority Support",
        "Team Collaboration",
        "API Access",
        "Save 15% with annual billing"
    ]'::jsonb,
    'price_1RH72hQMwYi2DvPFXyyyBgnH',
    '{
        "invoices_limit": -1,
        "storage_limit_mb": 10240,
        "team_members_limit": -1,
        "api_calls_per_month": -1
    }'::jsonb
),
(
    'BuildLedger Growth (Annual)',
    'Growth plan with annual billing',
    199.99,
    'year',
    '[
        "Up to 1000 Invoices & Quotes",
        "Basic Branding",
        "Basic Analytics",
        "Email Support",
        "3 Team Members",
        "Save 15% with annual billing"
    ]'::jsonb,
    'price_1RH722QMwYi2DvPFS1kmBv1c',
    '{
        "invoices_limit": 1000,
        "storage_limit_mb": 1024,
        "team_members_limit": 3,
        "api_calls_per_month": 1000
    }'::jsonb
),
(
    'BuildLedger Professional',
    'Professional plan with monthly billing',
    39.99,
    'month',
    '[
        "Unlimited Invoices & Quotes",
        "Custom Branding",
        "Advanced Analytics",
        "Priority Support",
        "Team Collaboration",
        "API Access"
    ]'::jsonb,
    'price_1RH6xNQMwYi2DvPFro1QJRbY',
    '{
        "invoices_limit": -1,
        "storage_limit_mb": 10240,
        "team_members_limit": -1,
        "api_calls_per_month": -1
    }'::jsonb
),
(
    'BuildLedger Growth',
    'Growth plan with monthly billing',
    19.99,
    'month',
    '[
        "Up to 1000 Invoices & Quotes",
        "Basic Branding",
        "Basic Analytics",
        "Email Support",
        "3 Team Members"
    ]'::jsonb,
    'price_1RH6vfQMwYi2DvPFn7dMfKrs',
    '{
        "invoices_limit": 1000,
        "storage_limit_mb": 1024,
        "team_members_limit": 3,
        "api_calls_per_month": 1000
    }'::jsonb
),
(
    'BuildLedger Solo',
    'Free tier for solo users',
    0.00,
    'month',
    '[
        "Up to 100 Invoices & Quotes",
        "Basic Branding",
        "Basic Analytics",
        "Community Support",
        "Single User"
    ]'::jsonb,
    'price_1RH6tdQMwYi2DvPFnOnimShE',
    '{
        "invoices_limit": 100,
        "storage_limit_mb": 100,
        "team_members_limit": 1,
        "api_calls_per_month": 0
    }'::jsonb
); 