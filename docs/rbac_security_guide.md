# RBAC & Security Guide

This document outlines the Role-Based Access Control (RBAC) system and security measures implemented in BuildLedger.

## Table of Contents

1. [Overview](#overview)
2. [Subscription Plans & Permissions](#subscription-plans--permissions)
3. [Components](#components)
4. [Database Security (RLS)](#database-security-rls)
5. [Session Management](#session-management)
6. [Implementation Examples](#implementation-examples)
7. [Security Best Practices](#security-best-practices)

## Overview

BuildLedger implements a multi-layered security system:

- **Frontend Route Protection**: PrivateRoute components with feature-based access control
- **Component-Level Guards**: FeatureGuard components for granular UI control
- **Database Row Level Security (RLS)**: Company-based data isolation at the database level
- **Session Management**: Automatic timeout, activity tracking, and token refresh
- **Usage Limits**: Plan-based limits on resources and features

## Subscription Plans & Permissions

### Plan Hierarchy

| Plan | Monthly Price | Description |
|------|---------------|-------------|
| **Starter** | Free | Basic features with limits |
| **Pro** | $29/month | Full features for small teams |
| **Enterprise** | Custom | Advanced features + unlimited usage |
| **Admin** | N/A | System administration access |

### Feature Matrix

| Feature | Starter | Pro | Enterprise | Admin |
|---------|---------|-----|------------|-------|
| View Projects/Quotes/Invoices | ✅ | ✅ | ✅ | ✅ |
| Create/Edit Clients | ✅ (10 max) | ✅ (100 max) | ✅ | ✅ |
| Create/Edit Projects | ❌ | ✅ | ✅ | ✅ |
| Analytics Dashboard | ❌ | ✅ | ✅ | ✅ |
| Vendor Management | ❌ | ✅ | ✅ | ✅ |
| Material Management | ❌ | ✅ | ✅ | ✅ |
| Custom Branding | ❌ | ✅ | ✅ | ✅ |
| Advanced Analytics | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Team Management | ❌ | ✅ (5 users) | ✅ | ✅ |
| Admin Panel | ❌ | ❌ | ❌ | ✅ |

### Usage Limits

| Resource | Starter | Pro | Enterprise |
|----------|---------|-----|------------|
| Clients | 10 | 100 | Unlimited |
| Projects | 5 | 50 | Unlimited |
| Quotes/Month | 25 | 500 | Unlimited |
| Invoices/Month | 25 | 500 | Unlimited |
| Team Members | 1 | 5 | Unlimited |
| Storage | 100 MB | 1 GB | 10 GB |

## Components

### PrivateRoute

Protects entire routes requiring authentication and optionally specific permissions.

```jsx
import PrivateRoute from '../components/auth/PrivateRoute';
import { FEATURES } from '../utils/rbac';

// Basic authentication required
<PrivateRoute>
  <DashboardPage />
</PrivateRoute>

// Specific feature required
<PrivateRoute requiredFeature={FEATURES.VIEW_ANALYTICS} requiredPlan="Pro">
  <AnalyticsPage />
</PrivateRoute>
```

**Props:**
- `requiredFeature`: Feature permission required (from FEATURES enum)
- `requiredPlan`: Plan name to display in upgrade prompt
- `fallbackPath`: Redirect path for unauthenticated users (default: '/login')

### FeatureGuard

Conditionally renders content based on user permissions. Use for individual features within pages.

```jsx
import FeatureGuard, { useFeatureAccess } from '../components/auth/FeatureGuard';
import { FEATURES } from '../utils/rbac';

// Component version
<FeatureGuard 
  feature={FEATURES.CREATE_EDIT_CLIENTS}
  requiredPlan="Pro"
  showUpgradePrompt={true}
  fallback={<div>Feature not available</div>}
>
  <CreateClientButton />
</FeatureGuard>

// Hook version
const CreateClientButton = () => {
  const canCreateClients = useFeatureAccess(FEATURES.CREATE_EDIT_CLIENTS);
  
  return canCreateClients ? (
    <button>Create Client</button>
  ) : (
    <UpgradePrompt feature="Create Clients" />
  );
};
```

### SessionWarning

Automatically displays when user is about to be logged out due to inactivity.

- Appears 5 minutes before auto-logout
- Shows countdown timer
- Allows user to extend session or logout immediately
- Automatically extends session on any user activity

## Database Security (RLS)

### Row Level Security Policies

All tables implement company-based data isolation:

```sql
-- Example policy for clients table
CREATE POLICY "Users can view clients in their company" ON public.clients
  FOR SELECT USING (
    company_id = get_user_company_id()
  );
```

### Helper Functions

- `get_user_company_id()`: Returns current user's company ID
- `user_has_permission(permission)`: Checks if user has specific permission (future expansion)

### Protected Tables

All tables with company_id columns are protected:
- `clients`, `projects`, `quotes`, `invoices`
- `items_database`, `vendors`, `materials`
- `quote_items`, `invoice_items`, `sms_messages`

### Administrative Tables

Some tables are restricted to service role only:
- `webhook_events`: Only accessible by service role for webhook processing
- `subscriptions`: System-managed subscription data

## Session Management

### Configuration

```javascript
// Session timeout settings
export const SESSION_CONFIG = {
  TIMEOUT_DURATION: 24 * 60 * 60 * 1000,    // 24 hours
  REFRESH_BUFFER: 5 * 60 * 1000,            // Refresh 5 min before expiry
  ACTIVITY_CHECK_INTERVAL: 5 * 60 * 1000,   // Check every 5 minutes
  IDLE_TIMEOUT: 2 * 60 * 60 * 1000,         // 2 hours idle timeout
  LOGOUT_WARNING_TIME: 5 * 60 * 1000,       // Warn 5 min before logout
};
```

### Features

1. **Activity Tracking**: Monitors mouse, keyboard, and touch events
2. **Automatic Token Refresh**: Refreshes tokens before expiration
3. **Idle Timeout**: Logs out inactive users after 2 hours
4. **Session Warning**: Shows warning 5 minutes before auto-logout
5. **Session Extension**: Allows users to extend their session

### Activity Events Tracked

- Mouse movement, clicks, scroll
- Keyboard input
- Touch events
- Any user interaction with the interface

## Implementation Examples

### Protecting a New Route

```jsx
// In Routes.jsx
<Route path="/new-feature" element={
  <PrivateRoute 
    requiredFeature={FEATURES.NEW_FEATURE}
    requiredPlan="Enterprise"
  >
    <NewFeaturePage />
  </PrivateRoute>
} />
```

### Adding Feature Guards to Components

```jsx
// In any component
import FeatureGuard from '../components/auth/FeatureGuard';

const MyComponent = () => {
  return (
    <div>
      <h1>My Page</h1>
      
      <FeatureGuard 
        feature={FEATURES.ADVANCED_ANALYTICS}
        showUpgradePrompt={true}
        requiredPlan="Enterprise"
      >
        <AdvancedAnalyticsWidget />
      </FeatureGuard>
      
      <FeatureGuard 
        feature={FEATURES.EXPORT_DATA}
        fallback={<div>Upgrade to export data</div>}
      >
        <ExportButton />
      </FeatureGuard>
    </div>
  );
};
```

### Checking Permissions Programmatically

```javascript
import { hasPermission, canPerformAction, getUsageLimit } from '../utils/rbac';

// Simple permission check
const canView = hasPermission(userProfile.subscription_plan, FEATURES.VIEW_ANALYTICS);

// Check with usage limits
const result = canPerformAction(
  userProfile.subscription_plan,
  FEATURES.CREATE_EDIT_CLIENTS,
  'clients',
  currentClientCount
);

if (!result.allowed) {
  if (result.reason === 'usage_limit_exceeded') {
    showError(`Client limit reached (${result.limit}). Upgrade to add more.`);
  } else {
    showError('Permission denied');
  }
}
```

### Adding New Features

1. **Add to FEATURES enum** in `utils/rbac.js`:
```javascript
const FEATURES = {
  // ... existing features
  NEW_FEATURE: 'new_feature',
};
```

2. **Add to plan permissions**:
```javascript
const permissions = {
  [ROLES.PRO]: [
    // ... existing permissions
    FEATURES.NEW_FEATURE,
  ],
};
```

3. **Add usage limits if needed**:
```javascript
const LIMITS = {
  [ROLES.STARTER]: {
    // ... existing limits
    new_feature_items: 10,
  },
};
```

4. **Protect the route or component**:
```jsx
<PrivateRoute requiredFeature={FEATURES.NEW_FEATURE}>
  <NewFeatureComponent />
</PrivateRoute>
```

## Security Best Practices

### Frontend Security

1. **Never trust client-side checks** - Always validate on the server
2. **Use PrivateRoute for entire pages** - Prevents unauthorized access
3. **Use FeatureGuard for individual features** - Better UX with upgrade prompts
4. **Validate permissions before API calls** - Reduce unnecessary requests

### Database Security

1. **Enable RLS on all tables** - Company data isolation
2. **Use company_id in all policies** - Prevent cross-company data access
3. **Grant minimal permissions** - Follow principle of least privilege
4. **Regular policy audits** - Ensure policies are correct and up-to-date

### Session Security

1. **Automatic token refresh** - Prevent session expiration
2. **Activity-based timeouts** - Log out inactive users
3. **Secure token storage** - Use httpOnly cookies when possible
4. **Session invalidation** - Clear all data on logout

### API Security

1. **Always authenticate requests** - Check auth.uid() in RLS policies
2. **Validate input data** - Use express-validator on server
3. **Rate limiting** - Prevent abuse (implemented in webhook handlers)
4. **Audit logging** - Track all significant operations

## Troubleshooting

### Common Issues

1. **"Permission denied" errors**
   - Check user's subscription plan
   - Verify feature is included in their plan
   - Check RLS policies in database

2. **Session timeout issues**
   - Check SESSION_CONFIG values
   - Verify activity tracking is working
   - Check browser console for errors

3. **Database access issues**
   - Verify company_id is set correctly
   - Check RLS policies are enabled
   - Ensure user has valid session

### Debugging Commands

```javascript
// Check current user permissions
console.log(getRolePermissions(userProfile.subscription_plan));

// Check specific permission
console.log(hasPermission(userProfile.subscription_plan, FEATURES.VIEW_ANALYTICS));

// Check usage limits
console.log(getUsageLimit(userProfile.subscription_plan, 'clients'));

// Check session health
console.log(supabase.auth.getSession());
```

## Future Enhancements

1. **Role-based permissions** - Add user roles within companies
2. **Granular permissions** - More specific feature controls
3. **Audit logging** - Track all user actions
4. **Advanced session management** - Device tracking, concurrent session limits
5. **API key management** - For external integrations
6. **Two-factor authentication** - Enhanced security

This RBAC system provides a solid foundation for secure, scalable access control while maintaining good user experience through clear upgrade paths and informative error messages.