const ROLES = {
  STARTER: 'Starter',
  PRO: 'Pro',
  ENTERPRISE: 'Enterprise',
};

const FEATURES = {
  VIEW_PROJECTS: 'view_projects',
  VIEW_QUOTES: 'view_quotes',
  VIEW_INVOICES: 'view_invoices',
  CREATE_EDIT_PROJECTS: 'create_edit_projects',
  CREATE_EDIT_CLIENTS: 'create_edit_clients',
  VIEW_ANALYTICS: 'view_analytics',
  FULL_ACCESS: 'full_access',
};

const permissions = {
  [ROLES.STARTER]: [
    FEATURES.VIEW_PROJECTS,
    FEATURES.VIEW_QUOTES,
    FEATURES.VIEW_INVOICES,
  ],
  [ROLES.PRO]: [
    FEATURES.VIEW_PROJECTS,
    FEATURES.VIEW_QUOTES,
    FEATURES.VIEW_INVOICES,
    FEATURES.CREATE_EDIT_PROJECTS,
    FEATURES.CREATE_EDIT_CLIENTS,
  ],
  [ROLES.ENTERPRISE]: [FEATURES.FULL_ACCESS],
};

export const hasPermission = (role, feature) => {
  if (!role) {
    return false;
  }
  if (permissions[role]?.includes(FEATURES.FULL_ACCESS)) {
    return true;
  }
  return permissions[role]?.includes(feature);
};

export { ROLES, FEATURES };
