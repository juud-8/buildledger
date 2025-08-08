# Secrets Rotation Guide

This document outlines the process for rotating API keys and secrets in the BuildLedger application.

## Overview

Regular rotation of API keys and secrets is essential for maintaining security. This guide provides step-by-step instructions for rotating each type of secret used in the application.

## Rotation Schedule

| Secret Type | Rotation Frequency | Priority |
|-------------|-------------------|----------|
| Stripe Keys | Every 90 days | High |
| Supabase Keys | Every 6 months | High |
| AI Service Keys | Every 90 days | Medium |
| Twilio Keys | Every 6 months | Medium |
| Sentry DSN | As needed | Low |

## Pre-Rotation Checklist

- [ ] Schedule maintenance window for production deployment
- [ ] Notify team members of planned rotation
- [ ] Backup current configuration
- [ ] Prepare rollback plan

## Stripe Keys Rotation

### 1. Generate New Keys
1. Log into Stripe Dashboard
2. Navigate to Developers → API keys
3. Create new secret key (keep old one active temporarily)
4. Update publishable key if needed

### 2. Update Environment Variables
```bash
# Production
STRIPE_SECRET_KEY=sk_live_new_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_new_publishable_key

# Development
STRIPE_SECRET_KEY=sk_test_new_secret_key
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_new_publishable_key
```

### 3. Update Webhook Endpoints
1. Generate new webhook secret in Stripe Dashboard
2. Update STRIPE_WEBHOOK_SECRET environment variable
3. Test webhook functionality

### 4. Deployment
1. Deploy new keys to staging
2. Run end-to-end payment tests
3. Deploy to production
4. Monitor for errors
5. Deactivate old keys after 24 hours

## Supabase Keys Rotation

### 1. Generate New Service Role Key
1. Log into Supabase Dashboard
2. Navigate to Settings → API
3. Generate new service role key
4. Keep anon key (typically doesn't need rotation)

### 2. Update Environment Variables
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new_service_role_key
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.anon_key
```

### 3. Update Server Applications
- Update server environment variables
- Restart server applications
- Test database connectivity

## AI Service Keys Rotation

### OpenAI
1. Visit OpenAI Platform → API Keys
2. Create new secret key
3. Update OPENAI_API_KEY environment variable
4. Test AI features
5. Revoke old key

### Anthropic
1. Visit Anthropic Console → API Keys
2. Generate new API key
3. Update ANTHROPIC_API_KEY environment variable
4. Test Claude integration
5. Deactivate old key

### Google Gemini
1. Visit Google AI Studio
2. Generate new API key
3. Update GEMINI_API_KEY environment variable
4. Test Gemini features
5. Delete old key

## Twilio Keys Rotation

### 1. Generate New Auth Token
1. Log into Twilio Console
2. Navigate to Settings → API Keys & Tokens
3. Create new auth token
4. Note: Account SID typically remains the same

### 2. Update Environment Variables
```bash
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=new_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

### 3. Test SMS Functionality
- Send test messages
- Verify webhook callbacks work
- Check message delivery status

## Sentry DSN Rotation

### 1. Generate New DSN
1. Log into Sentry
2. Navigate to Project Settings
3. Generate new DSN or use existing
4. Update SENTRY_DSN environment variable

### 2. Validate Error Tracking
- Trigger test error
- Verify events appear in Sentry
- Check error grouping

## Post-Rotation Checklist

- [ ] All services functional with new keys
- [ ] No authentication errors in logs
- [ ] Old keys deactivated/revoked
- [ ] Team notified of completion
- [ ] Update rotation schedule for next cycle
- [ ] Document any issues encountered

## Emergency Procedures

### If Keys Are Compromised
1. **Immediate Action**: Revoke compromised keys immediately
2. **Generate New Keys**: Create replacement keys as quickly as possible
3. **Deploy Emergency Fix**: Push new keys to production ASAP
4. **Monitor Systems**: Watch for unauthorized usage
5. **Incident Report**: Document the compromise and response

### Rollback Procedures
If new keys cause issues:
1. Revert to previous environment variables
2. Redeploy previous working configuration
3. Investigate key configuration issues
4. Plan remediation steps

## Security Notes

- Never commit real keys to version control
- Use different keys for staging and production
- Rotate keys immediately if:
  - A team member with key access leaves
  - Keys may have been exposed
  - Security audit recommends it
- Store keys securely (use encrypted storage/vault systems)
- Limit key permissions to minimum required scope

## Key Storage Locations

### Production
- Vercel Environment Variables
- Server environment files (encrypted)

### Development
- Local .env files (gitignored)
- Team password manager

### CI/CD
- GitHub Secrets
- Automated deployment systems

## Monitoring

Set up alerts for:
- API key authentication failures
- Unusual API usage patterns
- Key expiration warnings (where supported)
- Failed payment transactions
- SMS delivery failures

## Support Contacts

| Service | Support Contact | Emergency Contact |
|---------|----------------|-------------------|
| Stripe | support@stripe.com | emergency@stripe.com |
| Supabase | support@supabase.io | - |
| OpenAI | help@openai.com | - |
| Anthropic | support@anthropic.com | - |
| Twilio | help@twilio.com | - |
| Sentry | support@sentry.io | - |