// Subscription Plans/Roles
const ROLES = {
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
  ADMIN: 'Admin', // For system administrators
};

// Feature permissions
const FEATURES = {
  // Basic viewing permissions
  VIEW_PROJECTS: 'view_projects',
  VIEW_QUOTES: 'view_quotes',
  VIEW_INVOICES: 'view_invoices',
  VIEW_CLIENTS: 'view_clients',
  VIEW_ITEMS: 'view_items',
  
  // Create/Edit permissions
  CREATE_EDIT_PROJECTS: 'create_edit_projects',
  CREATE_EDIT_CLIENTS: 'create_edit_clients',
  CREATE_EDIT_QUOTES: 'create_edit_quotes',
  CREATE_EDIT_INVOICES: 'create_edit_invoices',
  CREATE_EDIT_ITEMS: 'create_edit_items',
  
  // Advanced features
  VIEW_ANALYTICS: 'view_analytics',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  EXPORT_DATA: 'export_data',
  BULK_OPERATIONS: 'bulk_operations',
  
  // Vendor/Material management
  VENDOR_MANAGEMENT: 'vendor_management',
  MATERIAL_MANAGEMENT: 'material_management',
  
  // Branding and customization
  CUSTOM_BRANDING: 'custom_branding',
  CUSTOM_TEMPLATES: 'custom_templates',
  
  // API and integrations
  API_ACCESS: 'api_access',
  WEBHOOK_MANAGEMENT: 'webhook_management',
  
  // Team management
  TEAM_MANAGEMENT: 'team_management',
  USER_ROLES: 'user_roles',
  
  // System admin
  ADMIN_PANEL: 'admin_panel',
  SYSTEM_SETTINGS: 'system_settings',
  
  // Special permissions
  FULL_ACCESS: 'full_access',
};

// Plan-based permission matrix
const permissions = {
  [ROLES.STARTER]: [
    // Basic viewing only
    FEATURES.VIEW_PROJECTS,
    FEATURES.VIEW_QUOTES,
    FEATURES.VIEW_INVOICES,
    FEATURES.VIEW_CLIENTS,
    FEATURES.VIEW_ITEMS,
    
    // Limited creation (up to certain limits)
    FEATURES.CREATE_EDIT_CLIENTS, // Limited to 10 clients
    FEATURES.CREATE_EDIT_QUOTES,  // Limited to 25 quotes/month
  ],
  
  [ROLES.PRO]: [
    // All basic features
    FEATURES.VIEW_PROJECTS,
    FEATURES.VIEW_QUOTES,
    FEATURES.VIEW_INVOICES,
    FEATURES.VIEW_CLIENTS,
    FEATURES.VIEW_ITEMS,
    
    // Full CRUD operations
    FEATURES.CREATE_EDIT_PROJECTS,
    FEATURES.CREATE_EDIT_CLIENTS,
    FEATURES.CREATE_EDIT_QUOTES,
    FEATURES.CREATE_EDIT_INVOICES,
    FEATURES.CREATE_EDIT_ITEMS,
    
    // Analytics and exports
    FEATURES.VIEW_ANALYTICS,
    FEATURES.EXPORT_DATA,
    
    // Vendor and material management
    FEATURES.VENDOR_MANAGEMENT,
    FEATURES.MATERIAL_MANAGEMENT,
    
    // Basic branding
    FEATURES.CUSTOM_BRANDING,
  ],
  
  [ROLES.ENTERPRISE]: [
    // All Pro features plus advanced ones
    FEATURES.FULL_ACCESS, // This grants all permissions
  ],
  
  [ROLES.ADMIN]: [
    FEATURES.FULL_ACCESS,
    FEATURES.ADMIN_PANEL,
    FEATURES.SYSTEM_SETTINGS,
  ],
};

// Usage limits per plan
const LIMITS = {
  [ROLES.STARTER]: {
    clients: 10,
    projects: 5,
    quotes_per_month: 25,
    invoices_per_month: 25,
    team_members: 1,
    storage_mb: 100,
  },
  
  [ROLES.PRO]: {
    clients: 100,
    projects: 50,
    quotes_per_month: 500,
    invoices_per_month: 500,
    team_members: 5,
    storage_mb: 1000,
  },
  
  [ROLES.ENTERPRISE]: {
    clients: Infinity,
    projects: Infinity,
    quotes_per_month: Infinity,
    invoices_per_month: Infinity,
    team_members: Infinity,
    storage_mb: 10000,
  },
};

// Permission checking functions
export const hasPermission = (role, feature) => {
  if (!role || !feature) {
    return false;
  }
  
  // Full access grants everything
  if (permissions[role]?.includes(FEATURES.FULL_ACCESS)) {
    return true;
  }
  
  return permissions[role]?.includes(feature) || false;
};

// Check if user has reached their usage limit
export const isWithinLimit = (role, limitType, currentUsage) => {
  if (!role || !limitType) {
    return true; // Default to allowing if we can't check
  }
  
  const limit = LIMITS[role]?.[limitType];
  if (limit === undefined || limit === Infinity) {
    return true;
  }
  
  return currentUsage < limit;
};

// Get usage limit for a specific feature
export const getUsageLimit = (role, limitType) => {
  return LIMITS[role]?.[limitType] || 0;
};

// Map a user profile (DB roles/plans) to an effective application role used by permissions
export const getEffectiveRoleFromProfile = (userProfile) => {
  if (!userProfile) return null;

  // Treat database admin roles as full Admin in the app
  const dbRole = String(userProfile.role || '').toLowerCase();
  if (dbRole === 'super_admin' || dbRole === 'admin') {
    return ROLES.ADMIN;
  }

  // Derive from subscription plan (support multiple field names and values)
  const planRaw =
    userProfile.subscription_plan ||
    userProfile.plan ||
    userProfile?.subscription?.plan_name ||
    userProfile?.subscription?.name ||
    '';
  const plan = String(planRaw).toLowerCase();

  if (plan === 'enterprise' || plan === 'lifetime') {
    return ROLES.ENTERPRISE;
  }
  if (plan === 'professional' || plan === 'pro') {
    return ROLES.PRO;
  }

  // Default to Starter if unknown
  return ROLES.STARTER;
};

// Get all permissions for a role
export const getRolePermissions = (role) => {
  if (!role) return [];
  
  if (permissions[role]?.includes(FEATURES.FULL_ACCESS)) {
    return Object.values(FEATURES);
  }
  
  return permissions[role] || [];
};

// Check if user can perform action based on both permission and usage limits
export const canPerformAction = (role, feature, limitType = null, currentUsage = 0) => {
  // First check permission
  if (!hasPermission(role, feature)) {
    return { allowed: false, reason: 'insufficient_permissions' };
  }
  
  // Then check usage limits if specified
  if (limitType && !isWithinLimit(role, limitType, currentUsage)) {
    const limit = getUsageLimit(role, limitType);
    return { 
      allowed: false, 
      reason: 'usage_limit_exceeded',
      limit,
      currentUsage 
    };
  }
  
  return { allowed: true };
};

// Session management constants
export const SESSION_CONFIG = {
  // Session timeout in milliseconds
  TIMEOUT_DURATION: 24 * 60 * 60 * 1000, // 24 hours
  
  // Refresh token before expiry (milliseconds before expiration)
  REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes
  
  // Activity check interval
  ACTIVITY_CHECK_INTERVAL: 5 * 60 * 1000, // 5 minutes
  
  // Idle timeout (no activity)
  IDLE_TIMEOUT: 2 * 60 * 60 * 1000, // 2 hours
  
  // Warning before auto-logout
  LOGOUT_WARNING_TIME: 5 * 60 * 1000, // 5 minutes
};

export { ROLES, FEATURES, LIMITS };
