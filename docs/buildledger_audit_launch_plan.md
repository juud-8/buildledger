

## Executive audit and launch plan

### 1) Prioritized fixes and features by impact

- High
  - Secure Stripe webhooks: ensure raw body parsing and signature verification; add idempotency keys; run webhooks in background tasks.
  - Validate Twilio webhooks: verify X-Twilio-Signature, narrow CORS, and add rate limits.
  - Consolidate Supabase schema: resolve multi-tenant vs single-tenant drift; adopt one multi-tenant model with `company_id`; remove conflicting enums.
  - Route protection: add `PrivateRoute` and role/plan-based guards across `Routes`.
  - Secrets hygiene: move AI key usage server-side; remove hardcoded Stripe price IDs from client; centralize plan config in DB/env.
  - Payment UX: complete subscription lifecycle (upgrade/downgrade, dunning, billing history) and ensure customer portal integration is environment-safe.

- Medium
  - RBAC alignment: unify client RBAC with DB roles and subscription plans; enforce via RLS and UI guards.
  - Data access efficiency: cache `company_id` in auth context; paginate/search server-side; add indexes for new tables.
  - Error handling/observability: add Sentry (client + server), structured logs, 4xx/5xx toast normalization.
  - Messaging consent flows: UI for opt-in/out, template variables validation, analytics panels leveraging indexes.

- Low
  - UX polish: consistent spacing/typography, empty states/skeletons, keyboard shortcuts, global search.
  - Progressive web app (PWA) extras: offline shell for quotes/invoices; install prompts.
  - Nice-to-haves: audit log viewer, export CSV/PDF from key lists.

### 2) Technical debt / poor practices to fix

- Webhook body parsing conflict: global `express.json()` before Stripe webhook raw body risks signature verification.
- API keys in browser: OpenAI key used client-side; move to server proxy.
- Hardcoded Stripe price IDs in client; replace with env/DB lookup.
- Migration drift: duplicate/competing enums and table shapes; consolidate to a single multi-tenant schema.
- Missing signature verification for Twilio webhooks; no rate limiting on SMS endpoints.
- No route guarding; sensitive routes accessible before auth check.
- Over-fetching: repeated profile lookups for `company_id`; add context cache and batch queries.
- Inconsistent plan/role model: UI-only RBAC not enforced in DB policies for some flows.
- Env validation at import can crash builds unexpectedly; defer checks and provide soft warnings in dev.

### 3) Key missing features for MVP launch

- Organization/team management: invite users, roles per member, transfer ownership.
- Billing suite: billing history, invoices/receipts for subscription charges, dunning emails, update payment method.
- Onboarding: first-run wizard to set company, branding, tax rates, and create sample data.
- Email flows: verified email, password reset (exists), transactional emails for quotes/invoices (send, accept, pay).
- Audit trail: critical actions (clients, quotes, invoices, messaging) with actor, time, metadata.
- Production-grade configuration: per-environment plan IDs, API base URLs, webhook secrets, rate limits.
- Data governance: export/download data per entity; privacy policy/terms pages.

### 4) UI/UX improvements (contractor-friendly)

- Navigation
  - Simplify top-level: Dashboard, Jobs (Projects), Clients, Quotes, Invoices, Materials, Vendors, Settings.
  - Persistent “New” button with quick actions.
- Lists and detail views
  - Data tables with column visibility, sort, filter, server-side pagination; sticky headers and bulk actions.
  - Empty states with “Add first X” CTAs; skeleton loaders.
- Forms
  - Larger inputs/touch targets, inline validation, input masks (phone, currency), autosave where safe.
  - Sticky action bar (Save/Cancel) on long forms.
- Documents
  - Print-friendly invoice/quote templates; brand color preview; PDF download and share links.
- Messaging
  - Consent indicators on client profile; template variable preview; delivery status chips.
- Global
  - Consistent button hierarchy, spacing scale, and typography rhythm; dark mode maintained.
  - Command palette (Ctrl/Cmd+K) for quick navigation and creation.

### 5) Performance and security upgrades

- Performance
  - Confirm route-based code-splitting; prefetch critical bundles post-login.
  - Server-side pagination/filtering on large lists; add missing DB indexes.
  - Memoize heavy charts; debounce search; throttle barcode scans.
  - Image optimization and responsive images; CDN caching headers.
- Security
  - Stripe: raw body + signature verification; idempotency keys; strict CORS and allowed origins.
  - Twilio: signature verification, rate limiting, allowlist sender; audit incoming messages.
  - AuthZ: enforce plan/role in RLS and UI; add policy tests; lock down global templates to read-only.
  - Headers: CSP, HSTS, X-Frame-Options, Referrer-Policy; rotate secrets regularly.
  - Audit logging for sensitive operations; anomaly alerts.
- Observability
  - Sentry (client/server), HTTP access logs with correlation IDs, uptime checks, synthetic flows.

### 6) Four-phase execution roadmap

- Phase 1: Stabilization & Security (1.5–2 weeks)
  - Fix Stripe webhook parsing + signature verification; add idempotency.
  - Add Twilio signature verification, rate limits, CORS tightening.
  - Introduce `PrivateRoute` and plan/role route guards.
  - Move AI calls server-side; remove client API key usage.
  - Set up Sentry and basic health checks.

- Phase 2: Data Model Consolidation (1–1.5 weeks)
  - Select multi-tenant schema; deprecate single-tenant objects and conflicting enums.
  - Write and run migration to unify tables; add/verify indexes.
  - Align RBAC to DB policies; expose `company_id` in AuthContext cache.
  - Replace hardcoded plan IDs with env/DB lookup; add admin UI to manage plan mapping.

- Phase 3: MVP Feature Completion (2–3 weeks)
  - Org & team management: invites, roles, ownership transfer.
  - Billing suite: billing history, dunning, payment method management UX.
  - Onboarding wizard + sample data; transactional email flows for quotes/invoices.
  - Audit logs for key entities; export CSV/PDF.

- Phase 4: UX Polish, Performance, Launch (1.5–2 weeks)
  - Table UX, empty states, skeletons, sticky action bars, global search.
  - Server-side pagination everywhere; chart memoization; image optimization.
  - Security headers/CSP; final penetration check; docs (ToS/Privacy).
  - Load tests for critical endpoints; production runbook and dashboards.

Total estimate: ~6–9 weeks to reach public-launch quality, parallelizable across 2–3 engineers.

- Key assumptions
  - Stripe server will be deployed separately from SPA; client `VITE_API_BASE_URL` configured per env.
  - Supabase project access for migrations and RLS policy updates is available.
  - Email provider available for transactional emails.

- Acceptance criteria at launch
  - All webhooks verified, no PII secrets leak in client, role/plan enforcement at DB and UI layers, end-to-end billing and onboarding flows complete, error budgets within target, SLO dashboards configured.

- Dependencies to secure now
  - Stripe/Twilio secrets per env, plan ID mapping per env, Sentry DSNs, email provider keys.

- Risks
  - Migration drift and data backfill complexity; mitigate with staged rollout and backups.
  - SMS compliance and consent; ship clear UI for consent and opt-out logging.

- Owner assignments (suggested)
  - Security & webhooks: Backend engineer.
  - Migrations & RBAC: Full-stack engineer.
  - Billing & onboarding: Product engineer.
  - UX polish & tables: Frontend engineer.

- Quick wins (this week)
  - Fix webhook body parsing and add signature checks. ✅ Completed
  - Add `PrivateRoute` guard and gate dashboard behind auth.
  - Centralize plan IDs in env and wire to UI.
  - Add Sentry and improve toast error messages.

- Metrics to watch
  - Auth success/failed rates, webhook error rate, payment success, SMS deliverability, page TTI/LCP, API p95, JS error rate.

- Launch blockers to clear
  - Webhook security, schema consolidation, plan/role enforcement, billing edge cases (proration, dunning), policies and ToS/Privacy pages.

- Post-launch follow-ups
  - PWA offline for field use, mobile nav refinements, advanced analytics (materialized views), integrations (QuickBooks/Zapier).

- Budget note
  - Supabase/Stripe/Twilio costs scale predictably; SMS costs need guardrails and spend alerts.

- Rollback plan
  - Revert to prior schema snapshot; disable webhooks; feature flags to turn off new flows.

- Documentation
  - Update `docs/` for migration strategy, webhook setup, env matrices, runbooks.