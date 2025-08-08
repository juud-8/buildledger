You are a senior staff engineer + security lead working locally against the repo “buildledger” (https://github.com/juud-8/buildledger).

Use the following AUDIT as the authoritative plan. Your job: produce exact, ready-to-apply changes for a hardening + launch sprint. Never include real secrets; use placeholders in .env.example and write rotation steps in docs. Return full file contents, terminal commands, and a verification checklist per step.

=== AUDIT (paste Jeff’s full report here) ===

EXPECTATIONS
- Output must be in ordered sections, one per subtask (A1, A2, … D2).
- For each subtask:
  - Files to change/create (paths)
  - Full code blocks (no “…”) with line-ready content
  - Terminal commands (npm/supabase/git)
  - Verification checklist
  - Git commit message
  - Rollback (if risky)
- Keep changes PR-sized and sequential. Stop after each subtask with “# Waiting for confirmation to continue”.

SPRINT (execute in order)

PHASE A — P0 SECURITY & DATABASE (branch: chore/p0-hardening)
A1) Secrets guardrails:
  - .env.example with placeholders for STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY (server only), TWILIO_AUTH_TOKEN, OPENAI_API_KEY, ANTHROPIC_API_KEY, SENTRY_DSN, etc.
  - .gitignore updates for .env*
  - gitleaks pre-commit hook + GitHub Action
  - docs/secrets_rotation.md with key rotation steps

A2) Remove exposed keys + server proxies for AI:
  - Refactor client to remove any privileged keys (VITE_*).
  - Create server AI proxy routes with input validation and rate limiting.
  - Ensure Supabase client in frontend uses only anon key; server uses SERVICE_ROLE.

A3) Stripe/Twilio webhook security:
  - Stripe raw body middleware, signature verify, idempotency, structured logging.
  - Twilio signature verify, rate limit (60/min IP), narrow CORS.

A4) Apply critical migration:
  - Ensure 20250808000000_add_client_type_column.sql applies cleanly.
  - Add `npm run db:migrate` and `npm run db:health` scripts.
  - Provide exact Supabase CLI commands.

A5) RBAC/session hardening (minimum viable):
  - PrivateRoute + plan/role guards.
  - RLS policies for company_id + roles (SQL).
  - Session timeout + refresh intervals documented.

PHASE B — P1 TESTING FOUNDATION (branch: feat/testing-foundation)
B1) Vitest + RTL for UI; server tests for webhooks + AI proxies. Add docs/testing.md.
B2) Playwright E2E for auth, create client, create invoice; GitHub Actions CI running lint/unit/e2e.

PHASE C — PERFORMANCE & ERROR HANDLING (branch: feat/perf-error)
C1) Route-based code splitting, lazy heavy charts, lodash per-method, Vite bundle analyzer.
C2) Global ErrorBoundary + page boundaries; Suspense + skeletons; fix useEffect cleanups; normalize error toasts.

PHASE D — DEVOPS (branch: feat/devops-upgrade)
D1) CI requires green tests; staging migration dry-run; release flow with tags + changelog.
D2) Sentry (client/server), server request logging with correlation IDs, basic uptime monitor. Docs/observability.md.

IMPORTANT
- Make conservative, compile-ready edits.
- If any file/path doesn’t exist, create it with best-practice structure consistent with a Vite + React + server/Express + Supabase project.
- Where you must choose libraries (rate limiting, logging), pick lightweight, maintained options and show installation commands.

Start with A1. After producing A1 artifacts, end with: “# Waiting for confirmation to continue”.
