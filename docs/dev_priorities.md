## BuildLedger Development Priorities

Source of truth: derived from `docs/buildledger_audit_launch_plan.md`.

### Now (Quick wins from audit)

- Fix webhook body parsing and add signature checks (Stripe)
  - Status: ⏳
  - Description: Ensure Stripe webhooks use raw body parsing and verify signatures to prevent tampering.
  - Audit refs: §1 High (Secure Stripe webhooks), §6 Phase 1, §6 Quick wins

- Add `PrivateRoute` guard and gate dashboard behind auth
  - Status: ⏳
  - Description: Introduce route protection to prevent access before authentication and enforce basic role/plan checks.
  - Audit refs: §1 High (Route protection), §6 Phase 1, §6 Quick wins

- Centralize plan IDs in environment and wire to UI
  - Status: ⏳
  - Description: Remove hardcoded Stripe price IDs from client; source from env/DB and surface safely in UI.
  - Audit refs: §1 High (Secrets hygiene), §2 (Hardcoded Stripe price IDs), §6 Quick wins, §6 Phase 2

- Add Sentry and improve toast error messages
  - Status: ⏳
  - Description: Enable Sentry on client and server; normalize 4xx/5xx toasts for clearer error handling.
  - Audit refs: §1 Medium (Error handling/observability), §5 Observability, §6 Phase 1, §6 Quick wins

### Next (Phase 1 + highest-impact Phase 2 items)

- Stripe webhook idempotency and background processing
  - Status: ⏳
  - Description: Add idempotency keys and process events safely in background to avoid duplicate side-effects.
  - Audit refs: §1 High (Secure Stripe webhooks), §5 Security (Stripe), §6 Phase 1

- Twilio webhook verification and hardening
  - Status: ⏳
  - Description: Verify `X-Twilio-Signature`, restrict CORS, add rate limits, and audit inbound messages.
  - Audit refs: §1 High (Validate Twilio webhooks), §2 (Missing signature verification), §5 Security (Twilio), §6 Phase 1

- Move AI calls server-side; remove client API key usage
  - Status: ⏳
  - Description: Proxy AI calls via server to eliminate API keys in browser context.
  - Audit refs: §1 High (Secrets hygiene), §2 (API keys in browser), §6 Phase 1

- Basic health checks and uptime monitoring
  - Status: ⏳
  - Description: Add health endpoints and uptime checks to detect outages early.
  - Audit refs: §5 Observability, §6 Phase 1

- Consolidate to a single multi-tenant schema with `company_id`
  - Status: ⏳
  - Description: Resolve migration drift; deprecate conflicting enums and single-tenant shapes.
  - Audit refs: §1 High (Consolidate Supabase schema), §2 (Migration drift), §6 Phase 2

- Unified migration to align tables and add/verify indexes
  - Status: ⏳
  - Description: Write and run migration to unify tables; create indexes for server-side pagination and analytics.
  - Audit refs: §1 Medium (Data access efficiency), §5 Performance, §6 Phase 2

- Align RBAC with DB policies; enforce plan/role at UI and DB layers
  - Status: ⏳
  - Description: Unify client RBAC with RLS policies; add policy tests; lock down templates to read-only where required.
  - Audit refs: §1 Medium (RBAC alignment), §5 Security (AuthZ), §6 Phase 2

- Cache `company_id` in AuthContext and batch profile lookups
  - Status: ⏳
  - Description: Reduce over-fetching by caching and batching access to `company_id`.
  - Audit refs: §1 Medium (Data access efficiency), §2 (Over-fetching), §6 Phase 2

- Replace hardcoded plan IDs with env/DB lookup; add admin mapping UI
  - Status: ⏳
  - Description: Centralize plan configuration per environment and manage via admin UI.
  - Audit refs: §1 High (Secrets hygiene), §2 (Hardcoded price IDs), §6 Phase 2

### Later (All other roadmap items)

- Organization and team management
  - Status: ⏳
  - Description: Invites, roles per member, and ownership transfer.
  - Audit refs: §3 MVP Features (Organization/team management), §6 Phase 3

- Billing suite completion
  - Status: ⏳
  - Description: Billing history, dunning emails, update payment method UX, receipts for subscription charges.
  - Audit refs: §3 MVP Features (Billing suite), §6 Phase 3

- Onboarding wizard and sample data
  - Status: ⏳
  - Description: First-run setup for company, branding, tax rates; create sample data.
  - Audit refs: §3 MVP Features (Onboarding), §6 Phase 3

- Transactional email flows for quotes/invoices
  - Status: ⏳
  - Description: Send, accept, and pay flows with verified sender.
  - Audit refs: §3 MVP Features (Email flows), §6 Phase 3

- Audit trail for key entities
  - Status: ⏳
  - Description: Capture actor, time, and metadata for clients, quotes, invoices, messaging.
  - Audit refs: §3 MVP Features (Audit trail), §5 Security (Audit logging), §6 Phase 3

- Data export/download per entity
  - Status: ⏳
  - Description: CSV/PDF export across key lists and records.
  - Audit refs: §3 MVP Features (Data governance), §6 Phase 3

- UI/UX improvements: navigation simplification and quick actions
  - Status: ⏳
  - Description: Top-level nav: Dashboard, Jobs, Clients, Quotes, Invoices, Materials, Vendors, Settings; persistent New button.
  - Audit refs: §4 UI/UX (Navigation), §6 Phase 4

- UI tables and list UX
  - Status: ⏳
  - Description: Server-side pagination, column visibility, sort/filter, sticky headers, bulk actions; skeletons and empty states.
  - Audit refs: §4 UI/UX (Lists and detail views), §6 Phase 4, §5 Performance

- Forms UX polish
  - Status: ⏳
  - Description: Larger inputs, inline validation, input masks, autosave where safe; sticky action bars.
  - Audit refs: §4 UI/UX (Forms), §6 Phase 4

- Document templates and PDFs
  - Status: ⏳
  - Description: Print-friendly invoice/quote templates, brand color preview, PDF download/share links.
  - Audit refs: §4 UI/UX (Documents), §3 MVP Features (Export CSV/PDF)

- Messaging consent flows and analytics
  - Status: ⏳
  - Description: UI for opt-in/out, template variable validation, delivery status chips, indexed analytics panels.
  - Audit refs: §1 Medium (Messaging consent flows), §4 UI/UX (Messaging)

- Performance upgrades
  - Status: ⏳
  - Description: Route-based code-splitting, prefetch post-login, memoize heavy charts, debounce/throttle inputs, image optimization, CDN caching.
  - Audit refs: §5 Performance

- Security headers and policies
  - Status: ⏳
  - Description: CSP, HSTS, X-Frame-Options, Referrer-Policy; regular secret rotation.
  - Audit refs: §5 Security (Headers)

- Observability enhancements
  - Status: ⏳
  - Description: Structured HTTP access logs with correlation IDs, uptime checks, synthetic flows, dashboards.
  - Audit refs: §5 Observability, §6 Phase 4

- Production-grade configuration per environment
  - Status: ⏳
  - Description: API base URLs, webhook secrets, plan ID matrices, rate limits.
  - Audit refs: §3 MVP Features (Production-grade configuration), §6 Key assumptions

- Legal and compliance pages
  - Status: ⏳
  - Description: Publish Terms of Service and Privacy Policy pages.
  - Audit refs: §3 MVP Features (Data governance), §6 Phase 4

- PWA enhancements for field use
  - Status: ⏳
  - Description: Offline shell for quotes/invoices; install prompts.
  - Audit refs: §1 Low (PWA extras), §6 Post-launch follow-ups

- Global search and keyboard shortcuts
  - Status: ⏳
  - Description: Command palette (Ctrl/Cmd+K), consistent shortcuts across app.
  - Audit refs: §1 Low (UX polish), §4 UI/UX (Global)

- Nice-to-haves
  - Status: ⏳
  - Description: Audit log viewer UI, exports across lists, additional integrations (QuickBooks/Zapier).
  - Audit refs: §1 Low (Nice-to-haves), §6 Post-launch follow-ups
